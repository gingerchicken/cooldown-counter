import { isMinimumDuration } from "./mechanisms";
import { useCallback, useState } from "react";
import type { Account, CooldownEvent } from "./types";
import type { TrackerApi } from "./api";
import { describeError } from "./api";
import { useResource } from "./useResource";
import { formatDuration, formatTimestamp, severity } from "./format";
import { CooldownHistory } from "./CooldownHistory";
import { ObservationDialog } from "./ObservationDialog";

/**
 * Load accountId inside fleetId through api, preserving policy-specific predictions and saved history.
 * canWrite controls affordances; the backend remains authoritative for every mutation.
 * onBack/onEdit/onReport delegate navigation and editor ownership; onChanged refreshes fleet totals.
 */
export function AccountDetailScreen({
  api,
  fleetId,
  accountId,
  canWrite,
  onBack,
  onEdit,
  onReport,
  onChanged,
}: {
  api: TrackerApi;
  fleetId: string;
  accountId: string;
  canWrite: boolean;
  onBack: () => void;
  onEdit: (account: Account) => void;
  onReport: () => void;
  onChanged: () => void;
}) {
  // Stable loader identity keeps effect cancellation tied to the requested fleet/account pair.
  const load = useCallback(
    // signal belongs to this exact detail read and cancels it after account or tenant changes.
    (signal: AbortSignal) => api.account(fleetId, accountId, signal),
    [api, fleetId, accountId],
  );
  // A minute refresh updates current predictions without recalculating domain rules in TypeScript.
  const resource = useResource(load, 60000);
  // observing selects the saved event being observed; pending gates archival and error retains its
  // recoverable feedback. Their paired setters keep this state local to the mounted detail screen.
  const [observing, setObserving] = useState<CooldownEvent | null>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null);
  /** Archive or restore an account without deleting any of its events or observation facts. */
  async function toggleArchived() {
    // An account still being loaded cannot supply the current archive state for a valid command.
    if (!resource.data) return;
    // Pending feedback prevents duplicate toggles while retaining the accepted detail snapshot.
    setPending(true);
    setError(null);
    try {
      // Only an accepted server response may refresh projections or notify the parent workspace.
      await api.updateAccount(fleetId, accountId, {
        archived: !resource.data.archived_at,
      });
      resource.retry();
      onChanged();
    } catch (failure) {
      // failure may be permission, validation or transport feedback; retain the account for retry.
      setError(describeError(failure));
    } finally {
      // Both rejection and acceptance release the archival control without altering saved evidence.
      setPending(false);
    }
  }
  // A previous accepted snapshot may remain while an explicit refresh reports a recoverable error.
  const account = resource.data;
  return (
    <section aria-label="Account detail">
      <button className="text-button" onClick={onBack}>
        Accounts / {account?.tag ?? "Account"}
      </button>
      {/* Loading, failure and an accepted account are separate states rather than a fabricated record. */}
      {resource.pending && <p role="status">Loading account history...</p>}
      {resource.error && (
        <div>
          <p role="alert" className="error">
            {resource.error}
          </p>
          <button className="secondary" onClick={resource.retry}>
            Retry loading
          </button>
        </div>
      )}
      {account && (
        <>
          <div className="detail-summary">
            <section className="panel identity-card">
              <p className="eyebrow">STEAM ACCOUNT</p>
              <h3>{account.tag}</h3>
              <p className="mono">{account.steam_id}</p>
              <dl>
                <div>
                  <dt>Recorded cooldowns</dt>
                  <dd>{account.event_count}</dd>
                </div>
                <div>
                  <dt>First observed</dt>
                  <dd>{formatTimestamp(account.first_observed)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    {account.archived_at
                      ? "Archived"
                      : account.status === "active"
                        ? "On cooldown"
                        : account.status === "clean"
                          ? "Clean"
                          : "Clear"}
                  </dd>
                </div>
              </dl>
              <a
                className="button-link secondary"
                href={`https://steamcommunity.com/profiles/${account.steam_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open on Steam ↗
              </a>
              <div className="toolbar-buttons">
                <button
                  className="secondary"
                  disabled={!canWrite}
                  onClick={() => {
                    // Edit the accepted exact account snapshot, preserving its immutable SteamID.
                    onEdit(account);
                  }}
                >
                  Edit account
                </button>
                <button
                  className="danger-button"
                  disabled={!canWrite || pending}
                  onClick={() => {
                    // The async action owns its recoverable feedback; this click does not navigate.
                    void toggleArchived();
                  }}
                >
                  {account.archived_at ? "Restore account" : "Archive account"}
                </button>
              </div>
              <button
                disabled={!canWrite || Boolean(account.archived_at)}
                onClick={onReport}
              >
                Report for this account
              </button>
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
            </section>
            <section className="panel prediction-card">
              <h3>Predicted next cooldown</h3>
              <p className="muted">
                Estimates from the recorded account history
              </p>
              <div className="prediction-grid">
                {account.predictions.map((prediction) => {
                  // prediction belongs to one offence; its own explanation avoids applying an unrelated
                  // latest event to every ladder. Saved, decayed and next levels remain distinct.
                  return (
                    <article key={prediction.type_id}>
                      <h4>{prediction.type_name}</h4>
                      <strong
                        className={`large-duration ${severity(prediction.total_minutes)}`}
                      >
                        {isMinimumDuration(
                          prediction.level_is_lower_bound,
                          prediction.total_minutes,
                        ) && "At least "}
                        {formatDuration(prediction.total_minutes)}
                      </strong>
                      {prediction.step !== null && (
                        <p>
                          {prediction.mechanism === "ordinary"
                            ? `Shared competitive level ${prediction.step}${prediction.level_is_lower_bound ? " or higher" : ""}`
                            : `Step ${prediction.step} of ${prediction.total_steps}`}
                        </p>
                      )}
                      <p className="small">{prediction.transition}</p>
                      <p className="small muted">
                        {prediction.sample_count} saved offences
                        {prediction.base_step !== null &&
                          ` · last S${prediction.recorded_step}${prediction.level_is_lower_bound ? "+" : ""} · current S${prediction.base_step}${prediction.level_is_lower_bound ? "+" : ""}`}
                      </p>
                      {prediction.next_decay_at && (
                        <p className="small muted">
                          Next reduction{" "}
                          {formatTimestamp(prediction.next_decay_at)}
                        </p>
                      )}
                    </article>
                  );
                })}
                {!account.predictions.length && (
                  <p>
                    No active offence types. Historical records remain
                    preserved.
                  </p>
                )}
              </div>
              {!account.event_count && (
                <p>
                  No history on this account. Prior cooldowns outside this fleet
                  can affect estimates.
                </p>
              )}
              {account.active_until && (
                <p>
                  Currently on cooldown until{" "}
                  {formatTimestamp(account.active_until)}. Clean time cannot
                  begin before the latest outstanding expiry for the relevant
                  ladder.
                </p>
              )}
            </section>
          </div>
          {account.warnings.length > 0 && (
            <section aria-label="Griefing warnings">
              <h3>Griefing warnings</h3>
              <ul>
                {account.warnings.map((warning) => (
                  // A warning retains its reporter and observation time outside the issued-cooldown count.
                  <li key={warning.id}>
                    {formatTimestamp(warning.observed_at)} · {warning.type_name}{" "}
                    · {warning.created_by}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <CooldownHistory
            events={account.events}
            canWrite={canWrite}
            onObserve={setObserving}
          />
        </>
      )}
      {observing && (
        <ObservationDialog
          event={observing}
          api={api}
          fleetId={fleetId}
          onDismiss={() => {
            // Dismissing the child drops its unsaved observation while retaining account history.
            setObserving(null);
          }}
          onSaved={() => {
            // An accepted append closes this draft and refreshes detail plus fleet-wide projections.
            setObserving(null);
            resource.retry();
            onChanged();
          }}
        />
      )}
    </section>
  );
}
