import { useState } from "react";
import type { CooldownEvent, Forecast } from "./types";
import { CalendarWeek } from "./CalendarWeek";
import { isoDate, monthStart, monthWeeks } from "./calendar";

/**
 * Render monthCount UTC months from epoch-millisecond baseMonth using supplied events/forecasts.
 * now marks the real present; optional earliest identifies recorded history outside the current range.
 * onRange requests another bounded projection; onAccount delegates exact UUID focus to the workspace.
 */
export function CalendarView({
  baseMonth,
  monthCount,
  now,
  events,
  forecasts,
  typeCodes,
  earliest,
  onRange,
  onAccount,
}: {
  baseMonth: number;
  monthCount: number;
  now: number;
  events: CooldownEvent[];
  forecasts: Forecast[];
  /** The accepted fleet catalogue supplies compact codes without altering saved event names. */
  typeCodes: ReadonlyMap<string, string>;
  earliest: string | null;
  onRange: (base: number, count: number, revealToday?: boolean) => void;
  onAccount: (id: string) => void;
}) {
  // Forecast overlays are optional presentation; disabling them never removes recorded evidence.
  const [showDecayMarkers, setShowDecayMarkers] = useState(true);
  // months contains UTC starts for this finite projection, preserving the server's one-year limit.
  const months = Array.from({ length: monthCount }, (_, index) =>
    // index is the zero-based month offset; the unused array slot does not supply a date value.
    monthStart(baseMonth, index),
  );
  // Both ends identify their year so the consolidated range remains clear across December/January.
  const rangeStartLabel = new Date(baseMonth).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
    rangeEndLabel = new Date(
      monthStart(baseMonth, monthCount - 1),
    ).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  return (
    <section aria-label="Cooldown calendar">
      <p className="eyebrow">
        {rangeStartLabel} through {rangeEndLabel}
      </p>
      <div className="calendar-toolbar">
        <div className="toolbar-buttons">
          <button
            className="secondary"
            onClick={() => {
              // Move the entire range back one month while preserving its current visible length.
              onRange(monthStart(baseMonth, -1), monthCount);
            }}
          >
            Previous month
          </button>
          <button
            className="secondary"
            onClick={() => {
              // Move the entire range forward without clearing selected account/offence filters.
              onRange(monthStart(baseMonth, 1), monthCount);
            }}
          >
            Next month
          </button>
          <button
            className="secondary"
            onClick={() => {
              // Restore a useful present-day context without changing active workspace filters.
              onRange(monthStart(now, -3), 4);
            }}
          >
            Reset view
          </button>
          <button
            onClick={() => {
              // The workspace retains this intent while its protected calendar projection reloads.
              onRange(monthStart(now, -3), 4, true);
            }}
          >
            Jump to today
          </button>
          {earliest && (
            <button
              className="secondary"
              onClick={() => {
                // earliest is an accepted history instant; include its UTC month without editing it.
                onRange(monthStart(Date.parse(earliest)), 4);
              }}
            >
              Earliest history
            </button>
          )}
        </div>
        <p className="muted">
          {events.length} unique cooldowns · {forecasts.length} forecasts
          {!showDecayMarkers && " (hidden)"}
        </p>
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={showDecayMarkers}
          onChange={(event) => {
            // Change only the forecast overlay, retaining evidence spans and workspace filters.
            setShowDecayMarkers(event.target.checked);
          }}
        />
        Show step-down forecasts
      </label>
      <p className="legend">
        <span className="legend-record" />
        Cooldown, start to expiry <span className="legend-forecast" />
        Forecast step-down. Status filters apply to recorded cooldowns.
      </p>
      {months.map((month) => {
        // month is a UTC month start; label includes its year so December/January crossings stay clear.
        const label = new Date(month).toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        });
        return (
          <section className="calendar-month" key={month}>
            <h3>
              {label}
              {monthStart(now) === month && (
                <span className="badge">CURRENT</span>
              )}
            </h3>
            <div
              className="calendar-scroller"
              role="region"
              tabIndex={0}
              aria-label={`${label} calendar`}
            >
              <div className="calendar-grid">
                <div className="weekdays">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    // name is the fixed Monday-first heading paired with each UTC weekday column.
                    (name) => (
                      <span key={name}>{name}</span>
                    ),
                  )}
                </div>
                {monthWeeks(month).map((days) => {
                  // days is one complete Monday-first row, preserving interval endpoints across months.
                  return (
                    <CalendarWeek
                      key={`${isoDate(month)}-${days[0]}`}
                      days={days}
                      month={month}
                      now={now}
                      events={events}
                      forecasts={showDecayMarkers ? forecasts : []}
                      typeCodes={typeCodes}
                      onAccount={onAccount}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
      <div className="center-actions">
        <button
          type="button"
          className="secondary"
          disabled={monthCount >= 12}
          onClick={() => {
            // Extend the projection explicitly rather than requiring scroll events to reveal history.
            onRange(baseMonth, monthCount + 1);
          }}
        >
          Load next month
        </button>
        {monthCount >= 12 && (
          <p>
            Use Previous month or Next month to browse beyond this one-year
            window.
          </p>
        )}
      </div>
    </section>
  );
}
