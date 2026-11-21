import { isMinimumDuration } from "./mechanisms";
import { useState } from "react";
import type { Account } from "./types";
import { formatDuration, formatTimestamp, severity } from "./format";

/**
 * Compare the supplied filtered accounts; onOpen receives the exact selected account UUID.
 * Pagination and archive visibility belong to this mounted list, not persisted tenant state.
 */
export function AccountsTable({
  accounts,
  onOpen,
}: {
  accounts: Account[];
  onOpen: (id: string) => void;
}) {
  // visibleCount limits the current page prefix; showArchived controls retained archived identities.
  // Their paired setters support explicit loading even when no page scrollbar exists.
  const [visibleCount, setVisibleCount] = useState(12),
    [showArchived, setShowArchived] = useState(false);
  // shown is the pre-pagination subset; each account remains available when archives are included.
  const shown = accounts.filter(
    (account) => showArchived || !account.archived_at,
  );
  return (
    <section aria-label="Fleet accounts">
      <div className="split-heading">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => {
              // event supplies the visibility preference only; archival facts remain server-owned.
              setShowArchived(event.target.checked);
            }}
          />
          Show archived accounts
        </label>
        <p className="muted">
          {Math.min(visibleCount, shown.length)} of {shown.length} accounts
        </p>
      </div>
      <div
        className="table-scroll"
        role="region"
        tabIndex={0}
        aria-label="Accounts table"
      >
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Status</th>
              <th>Ladder position</th>
              <th>Cooldowns</th>
              <th>Next predicted</th>
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, visibleCount).map((account) => {
              // account is one accepted row; representative is its highest current estimate.
              // Sorting a copy preserves backend prediction order; names break equal-duration ties.
              const representative = account.predictions
                .filter(
                  // Unknown special-case durations cannot outrank a known estimate.
                  (prediction) => prediction.total_minutes !== null,
                )
                .sort(
                  (left, right) =>
                    // left/right are per-offence estimates compared by duration then readable label.
                    (right.total_minutes ?? 0) - (left.total_minutes ?? 0) ||
                    left.type_name.localeCompare(right.type_name),
                )[0];
              return (
                <tr key={account.id}>
                  <td>
                    <button
                      className="account-link text-button"
                      onClick={() => {
                        // Opening this UUID cannot expand into other accounts with overlapping tags.
                        onOpen(account.id);
                      }}
                    >
                      {account.tag}
                    </button>
                    <span className="mono small muted">{account.steam_id}</span>
                    {account.archived_at && (
                      <span className="badge">ARCHIVED</span>
                    )}
                  </td>
                  <td>
                    <span className={`status status-${account.status}`}>
                      {account.status === "active"
                        ? "On cooldown"
                        : account.status === "clean"
                          ? "No recorded cooldowns"
                          : "Clear"}
                    </span>
                    {account.active_until && (
                      <span className="small muted">
                        Until {formatTimestamp(account.active_until)}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="ladder-chips">
                      {account.predictions
                        .filter(
                          // prediction must have actual supporting offences before a history chip is shown.
                          (prediction) =>
                            prediction.sample_count > 0 &&
                            prediction.base_step !== null,
                        )
                        .map((prediction) => {
                          // prediction supplies recorded and decayed state for one offence, keeping its
                          // historical chip distinct from the duration of a hypothetical next offence.
                          return (
                            <span
                              className="ladder-chip"
                              key={prediction.type_id}
                            >
                              {prediction.type_name}{" "}
                              <strong>
                                last S{prediction.recorded_step}
                                {prediction.level_is_lower_bound ? "+" : ""}
                              </strong>
                              <span>
                                current S{prediction.base_step}
                                {prediction.level_is_lower_bound ? "+" : ""}
                              </span>
                            </span>
                          );
                        })}
                      {!account.event_count && (
                        <span className="muted">
                          Clean - no recorded offences
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="mono">{account.event_count}</td>
                  <td>
                    {representative ? (
                      <>
                        <strong
                          className={`mono ${severity(representative.total_minutes)}`}
                        >
                          {isMinimumDuration(
                            representative.level_is_lower_bound,
                            representative.total_minutes,
                          ) && "At least "}
                          {formatDuration(representative.total_minutes)}
                        </strong>
                        <span className="small muted">
                          {representative.type_name} · highest current estimate
                        </span>
                      </>
                    ) : (
                      <span className="muted">
                        {account.predictions.length
                          ? "Duration unknown"
                          : "No active offence types"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!shown.length && (
        <p className="empty-state">No accounts match these filters.</p>
      )}
      {visibleCount < shown.length && (
        <div className="center-actions">
          <button
            className="secondary"
            onClick={() => {
              // count is the latest visible prefix, so repeated explicit loads extend the newest state.
              setVisibleCount((count) => count + 12);
            }}
          >
            Load more accounts
          </button>
        </div>
      )}
    </section>
  );
}
