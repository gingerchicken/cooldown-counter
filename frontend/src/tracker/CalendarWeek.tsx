import type { CooldownEvent, Forecast } from "./types";
import { isoDate, weekEntries } from "./calendar";
import { severity } from "./format";

/**
 * Render the seven UTC days for month using supplied recorded events and separate forecasts.
 * Epoch-millisecond now marks today; onAccount receives the exact UUID from any visible/overflow entry.
 */
export function CalendarWeek({
  days,
  month,
  now,
  events,
  forecasts,
  typeCodes,
  onAccount,
}: {
  days: number[];
  month: number;
  now: number;
  events: CooldownEvent[];
  forecasts: Forecast[];
  /** The accepted fleet catalogue supplies compact codes without altering saved event names. */
  typeCodes: ReadonlyMap<string, string>;
  onAccount: (id: string) => void;
}) {
  // entries holds clipped display spans; today is the UTC date string used for current-day matching.
  // Full accessible descriptions survive even when a one-day visual label is compact.
  const entries = weekEntries(days[0], events, forecasts, typeCodes),
    today = isoDate(now);
  return (
    <div className="calendar-week">
      <div className="week-dates">
        {days.map((day) => {
          // day is UTC midnight; inMonth identifies the owning grid and isToday matches the real date.
          // Only that owning month receives today's unique scroll target; spillover dates stay muted.
          const inMonth =
              new Date(day).getUTCMonth() === new Date(month).getUTCMonth(),
            isToday = isoDate(day) === today;
          return (
            <div
              className={`week-date ${inMonth ? "" : "outside-month"} ${isToday ? "is-today" : ""}`}
              key={day}
            >
              <time dateTime={isoDate(day)}>{new Date(day).getUTCDate()}</time>
              {isToday && inMonth && (
                <span id="calendar-today" className="today-label">
                  NOW
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="week-events">
        {entries.slice(0, 5).map((entry) => {
          // entry is a clipped span; explicit columns preserve continuity across occupied UTC dates.
          return (
            <button
              type="button"
              key={entry.key}
              title={entry.description}
              aria-label={entry.description}
              className={`calendar-bar ${severity(entry.minutes)} ${entry.forecast ? "calendar-forecast" : ""} ${entry.startsHere ? "" : "continues-left"} ${entry.endsHere ? "" : "continues-right"}`}
              style={{
                gridColumn: `${entry.firstColumn + 1} / ${entry.lastColumn + 2}`,
              }}
              onClick={() => {
                // Calendar activation focuses the exact account; account detail remains a separate view.
                onAccount(entry.accountId);
              }}
            >
              <strong>{entry.durationLabel}</strong> {entry.label}
            </button>
          );
        })}
      </div>
      {entries.length > 5 && (
        <details className="calendar-overflow">
          <summary>Show {entries.length - 5} more entries</summary>
          <ul>
            {entries.slice(5).map((entry) => {
              // entry is an overflow span beyond the visible five; its complete description and exact
              // account action remain reachable through the native disclosure.
              return (
                <li key={entry.key}>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      // Overflow activation uses the same UUID focus action as a visible calendar bar.
                      onAccount(entry.accountId);
                    }}
                  >
                    {entry.description}
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}
