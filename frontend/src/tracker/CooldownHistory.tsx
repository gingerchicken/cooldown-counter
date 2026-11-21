import {
  exceedsOrdinaryDuration,
  isMinimumDuration,
  ordinaryTimerDiscrepancy,
} from "./mechanisms";
import type { CooldownEvent } from "./types";
import { formatDuration, formatTimestamp, severity } from "./format";

/**
 * Present server-ordered events beside distinct observations without recalculating assessments.
 * canWrite gates the affordance; onObserve opens an append-only evidence draft for that saved event.
 */
export function CooldownHistory({
  events,
  canWrite,
  onObserve,
}: {
  events: CooldownEvent[];
  canWrite: boolean;
  onObserve: (event: CooldownEvent) => void;
}) {
  // Empty history is distinct from a filtered calendar; supplied rows remain one row per offence.
  return (
    <section aria-labelledby="cooldown-history-heading">
      <h3 id="cooldown-history-heading">Cooldown history</h3>
      <p className="muted">
        Each row is one offence. Additional observations do not advance the
        ladder. Saved totals are modelled assessments, not independently
        verified game outcomes.
      </p>
      {!events.length ? (
        <p className="empty-state">No cooldowns recorded for this account.</p>
      ) : (
        <div
          className="table-scroll"
          role="region"
          tabIndex={0}
          aria-label="Cooldown history records"
        >
          <table aria-label="Cooldown history">
            <thead>
              <tr>
                <th>#</th>
                <th>Recorded / expiry</th>
                <th>Type</th>
                <th>Observed evidence</th>
                <th>Total</th>
                <th>Transition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => {
                // event is a saved offence and index its display ordinal, not its stable identity.
                // Totals and policy numbers remain unchanged when another policy is published later.
                return (
                  <tr key={event.id}>
                    <td className="mono muted">{index + 1}</td>
                    <td>
                      <time dateTime={event.started_at}>
                        {formatTimestamp(event.started_at)}
                      </time>
                      <span className="small muted">
                        {event.observed_expires_at ? "Timer expiry" : "Ends"}{" "}
                        {formatTimestamp(event.expires_at)}
                      </span>
                      {event.observed_expires_at &&
                        event.predicted_expires_at && (
                          <span className="small muted">
                            {isMinimumDuration(
                              event.level_is_lower_bound,
                              event.total_minutes,
                            )
                              ? "Earliest predicted expiry"
                              : "Predicted expiry"}{" "}
                            {formatTimestamp(event.predicted_expires_at)}
                          </span>
                        )}
                    </td>
                    <td>
                      {event.type_name}
                      {event.mechanism === "vacnet" && (
                        <span className="small muted">
                          Flagged:{" "}
                          {event.vac_attribution === "party"
                            ? "party member"
                            : event.vac_attribution === "self"
                              ? "this account"
                              : "unknown"}
                        </span>
                      )}
                      <span className="small muted">
                        Policy v{event.policy_number}
                      </span>
                    </td>
                    <td>
                      <ul className="observation-list">
                        {event.observations.map((observation) => {
                          // observation is a separate fact about this same offence; its seen instant is
                          // independent of both issue time and server receipt time.
                          return (
                            <li key={observation.id}>
                              <strong>
                                {formatDuration(observation.remaining_minutes)}{" "}
                                left
                              </strong>
                              <span className="small muted">
                                {formatTimestamp(observation.observed_at)} ·{" "}
                                {observation.created_by}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      {event.mechanism === "ordinary" &&
                        event.observations.some(
                          // Keep the discrepancy visible even when a later reading is shorter.
                          (reading) =>
                            exceedsOrdinaryDuration(
                              event.started_at,
                              reading.observed_at,
                              reading.remaining_minutes,
                            ),
                        ) && (
                          <p className="warning">{ordinaryTimerDiscrepancy}</p>
                        )}
                    </td>
                    <td className={`mono ${severity(event.total_minutes)}`}>
                      {isMinimumDuration(
                        event.level_is_lower_bound,
                        event.total_minutes,
                      ) && "At least "}
                      {formatDuration(event.total_minutes)}
                    </td>
                    <td>
                      {event.transition}
                      {event.is_override && (
                        <p className="small">
                          Override reason: {event.override_reason}
                        </p>
                      )}
                    </td>
                    <td>
                      <button
                        className="secondary"
                        disabled={!canWrite}
                        onClick={() => {
                          // Additional evidence reuses this offence identity instead of advancing a ladder.
                          onObserve(event);
                        }}
                      >
                        Add observation
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
