import { useState } from "react";
import type { OffenceType } from "./types";
import type { TrackerApi } from "./api";
import { describeError } from "./api";
import {
  mechanismGuidance,
  mechanismNames,
  usesObservedTimer,
} from "./mechanisms";
import { formatDuration, severity } from "./format";

/**
 * Display types' current rules and permit canWrite edits/archive through the fleetId-scoped api.
 * onEdit receives the exact saved definition; onChanged refreshes accepted non-destructive archival.
 */
export function TypeReference({
  types,
  canWrite,
  api,
  fleetId,
  onEdit,
  onChanged,
}: {
  types: OffenceType[];
  canWrite: boolean;
  api: TrackerApi;
  fleetId: string;
  onEdit: (type: OffenceType) => void;
  onChanged: () => void;
}) {
  // confirm/setConfirm retain the one armed type UUID or null; remounting cancels that local decision.
  // pending/setPending serialize archival; error/setError retain a recoverable rejection for correction.
  const [confirm, setConfirm] = useState<string | null>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null);
  /** Arm or confirm archival of type's exact reviewed policy; preserve all historical cooldown evidence. */
  async function archive(type: OffenceType) {
    if (confirm !== type.id) {
      // The first action exposes preserved-history impact and requires another action on this identity.
      setConfirm(type.id);
      return;
    }
    // Prevent overlapping archive/edit actions while this reviewed policy token is being checked.
    setPending(true);
    setError(null);
    try {
      // The token rejects stale review; only an accepted archive clears confirmation and refreshes the list.
      await api.archiveType(fleetId, type.id, type.policy.id);
      setConfirm(null);
      onChanged();
    } catch (failure) {
      // failure includes version conflicts; disarm the action so stale confirmation cannot be retried blindly.
      setConfirm(null);
      setError(describeError(failure));
    } finally {
      // Re-enable this mounted view after either rejection or acceptance.
      setPending(false);
    }
  }
  return (
    <section aria-label="Offence ladders">
      <p className="eyebrow">
        {/* type is one saved definition; archival preserves its card while removing it from active counts. */}
        {types.filter((type) => !type.archived_at).length} active offence types
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {types.map((type) => {
        // type is one saved catalogue identity; its current version is separate from historical event policies.
        return (
          <article
            className={`panel ladder-card ${type.archived_at ? "archived" : ""}`}
            key={type.id}
          >
            <div className="ladder-description">
              <h3>
                {type.name} <span className="badge">{type.code}</span>
                {type.archived_at && <span className="badge">ARCHIVED</span>}
              </h3>
              <p>{type.note || "No trigger note supplied."}</p>
              <p className="small muted">
                {type.event_count} recorded cooldowns · policy v
                {type.policy.number}
              </p>
              <p className="small">
                <strong>{mechanismNames[type.policy.mechanism]}</strong>
              </p>
              {type.policy.mechanism === "custom" ? (
                <p className="small">
                  {type.policy.decay_mode === "none"
                    ? "No decay"
                    : `${type.policy.clean_window_days} clean days · ${type.policy.decay_mode === "full_reset" ? "full reset" : "step down one level"}`}
                </p>
              ) : (
                <p>{mechanismGuidance[type.policy.mechanism]}</p>
              )}
              <div className="toolbar-buttons">
                <button
                  className="secondary"
                  aria-label={`Edit ${type.name}`}
                  disabled={!canWrite || Boolean(type.archived_at) || pending}
                  onClick={() => {
                    // Switching to editing cancels any armed archive before handing off the exact definition.
                    setConfirm(null);
                    onEdit(type);
                  }}
                >
                  Edit
                </button>
                <button
                  className="danger-button"
                  aria-label={`${confirm === type.id ? "Confirm archive" : "Archive"} ${type.name}`}
                  disabled={!canWrite || Boolean(type.archived_at) || pending}
                  onClick={() => {
                    // Route both confirmation stages through the same exact type and reviewed policy token.
                    void archive(type);
                  }}
                >
                  {confirm === type.id
                    ? `Confirm archive ${type.name}`
                    : "Archive"}
                </button>
                {confirm === type.id && (
                  <button
                    className="secondary"
                    disabled={pending}
                    onClick={() => {
                      // Cancel only the local destructive-action confirmation; no backend mutation occurs.
                      setConfirm(null);
                    }}
                  >
                    Cancel archive
                  </button>
                )}
              </div>
              {confirm === type.id && (
                <p role="status">
                  Archive {type.name}? All {type.event_count} cooldowns and
                  their observations remain preserved.
                </p>
              )}
            </div>
            {!usesObservedTimer(type.policy.mechanism) && (
              <ol className="ladder-timeline">
                {type.policy.steps.map((duration, index) => {
                  // duration is saved whole minutes; index supplies its one-based position in this policy.
                  // Labels communicate step order and duration without relying on severity color alone.
                  return (
                    <li key={index} className={severity(duration)}>
                      <strong>{formatDuration(duration)}</strong>
                      <span className="ladder-dot" />
                      <span>
                        {type.policy.mechanism === "ordinary"
                          ? "Level"
                          : "Step"}{" "}
                        {index + 1}
                      </span>
                    </li>
                  );
                })}
                <li className="muted">
                  <span>
                    {type.policy.mechanism === "ordinary"
                      ? "Level 4 and above"
                      : "Then holds"}
                  </span>
                </li>
              </ol>
            )}
          </article>
        );
      })}
      {!types.length && (
        <p className="empty-state">
          No offence types available. Add a type to enable reporting.
        </p>
      )}
      <section className="panel">
        <h3>Transition rules</h3>
        <p>
          <strong>Advance.</strong> Ordinary competitive reasons share an
          account level. The duration stops increasing at seven days. The level
          can keep rising.
        </p>
        <p>
          <strong>Decay.</strong> Custom fleet ladders define their own clean
          window and mode. Clean time starts after the latest outstanding
          expiry. Step down removes one stored level for each full clean window,
          with a minimum state of zero. Full reset clears the stored state after
          one full window. No decay retains the saved state.
        </p>
        <p>
          <strong>Isolation.</strong> Accounts and fleets have separate
          histories. A custom ladder uses only its own reason.
        </p>
        <p>
          <strong>Preservation.</strong> Edits create new policy versions. Saved
          totals, expiry and observed evidence retain their original meaning.
        </p>
        <p className="muted">
          These are model inputs, not verified Valve guarantees.
        </p>
      </section>
    </section>
  );
}
