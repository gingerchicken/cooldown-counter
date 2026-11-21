import { isMinimumDuration } from "./mechanisms";
import type { CooldownEvent, Forecast } from "./types";
import { formatDuration, formatTimestamp } from "./format";

// UTC day arithmetic is immune to daylight-saving shifts in a browser's local timezone.
export const DAY_MS = 86400000;

/** One calendar marker retains its full accessible text even when its visual label is compact. */
export interface CalendarEntry {
  /** Stable event or forecast identity supports repeatable React placement. */
  key: string;
  /** UUID selection remains separate from the human-readable label. */
  accountId: string;
  /** firstColumn and lastColumn are zero-based inclusive weekday boundaries. */
  firstColumn: number;
  lastColumn: number;
  /** Duration controls the shared appearance convention. */
  minutes: number | null;
  /** Text distinguishes a modeled duration from the timer-derived bounds of a recorded span. */
  durationLabel: string;
  /** Forecast state never masquerades as observed evidence. */
  forecast: boolean;
  /** startsHere and endsHere distinguish actual endpoints from continuation into another week. */
  startsHere: boolean;
  endsHere: boolean;
  /** label is compact visible text; description retains the complete accessible interval. */
  label: string;
  description: string;
}

/**
 * Normalize timestamp (epoch milliseconds) by the signed month offset.
 * The returned UTC month start naturally crosses year boundaries without local-time conversion.
 */
export function monthStart(timestamp: number, offset = 0): number {
  // date interprets the epoch instant while UTC getters preserve its month across operator zones.
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1);
}

/** Convert epoch-millisecond timestamp to the YYYY-MM-DD UTC date accepted by the calendar API. */
export function isoDate(timestamp: number): string {
  // The ISO date portion omits time without substituting the browser's local day.
  return new Date(timestamp).toISOString().slice(0, 10);
}

/**
 * Build complete Monday-first weeks for the month containing epoch-millisecond timestamp.
 * Each returned number is a UTC midnight; adjacent-month spillover cells complete every week.
 */
export function monthWeeks(timestamp: number): number[][] {
  // first is UTC month start, date locates its weekday, and offset counts preceding spillover days.
  const first = monthStart(timestamp),
    date = new Date(first),
    offset = (date.getUTCDay() + 6) % 7;
  // days is the actual month length, including leap days, used to select the required row count.
  const days = new Date(monthStart(first, 1) - DAY_MS).getUTCDate();
  return Array.from({ length: Math.ceil((offset + days) / 7) }, (_, week) => {
    // week is a zero-based row; the unused array slot supplies no date or business meaning.
    // Each row contains seven complete instants, including adjacent-month spillover.
    return Array.from(
      { length: 7 },
      // day is the zero-based Monday-through-Sunday column within this row.
      (_, day) => first + (week * 7 + day - offset) * DAY_MS,
    );
  });
}

/**
 * Clip saved events and separate forecast facts to a UTC week starting at epoch-millisecond start.
 * typeCodes is the current fleet catalogue lookup for compact visual labels; full names remain accessible.
 * The returned display entries preserve expiry exclusivity and never modify their input arrays.
 */
export function weekEntries(
  start: number,
  events: CooldownEvent[],
  forecasts: Forecast[],
  typeCodes: ReadonlyMap<string, string>,
): CalendarEntry[] {
  // The half-open week end prevents records at the next Monday from appearing twice.
  const end = start + 7 * DAY_MS;
  // entries accumulates only intersecting display spans and one-day forecast markers.
  const entries: CalendarEntry[] = [];
  events.forEach((event) => {
    // event is a saved assessment; eventStart/eventEnd are its epoch-millisecond boundaries.
    // Expiry is exclusive, so subtract one millisecond only when locating its occupied date.
    const eventStart = Date.parse(event.started_at),
      eventEnd = Date.parse(event.expires_at);
    // Intervals outside this half-open week do not contribute a bar or inflate its overflow count.
    if (eventEnd <= start || eventStart >= end) return;
    // offenceLabel uses the configured compact code; an intentionally blank code keeps the complete name.
    const offenceLabel = typeCodes.get(event.type_id) || event.type_name;
    // A duration in the final ordinary band stays exact even when the underlying level is unknown.
    const minimumDuration = isMinimumDuration(
      event.level_is_lower_bound,
      event.total_minutes,
    );
    // A span can follow a timer that contradicts the saved prediction. Identify that duration as an estimate.
    const durationLabel =
      event.total_minutes === null
        ? "Observed timer"
        : `${event.observed_expires_at && event.observed_expires_at !== event.predicted_expires_at ? "Predicted " : ""}${minimumDuration ? "at least " : ""}${formatDuration(event.total_minutes)}`;
    entries.push({
      key: event.id,
      accountId: event.account_id,
      firstColumn: Math.max(0, Math.floor((eventStart - start) / DAY_MS)),
      lastColumn: Math.min(6, Math.floor((eventEnd - 1 - start) / DAY_MS)),
      minutes: event.total_minutes,
      durationLabel,
      forecast: false,
      startsHere: eventStart >= start,
      endsHere: eventEnd <= end,
      label: `${event.account_tag} · ${offenceLabel}`,
      description: `${event.account_tag} ${event.type_name}, ${durationLabel}, ${formatTimestamp(event.started_at)} to ${formatTimestamp(event.expires_at)}`,
    });
  });
  forecasts.forEach((forecast) => {
    // forecast is a modeled reduction; instant is its epoch time and column its weekday position.
    // Markers occupy one day and explicitly identify the next-offence duration.
    const instant = Date.parse(forecast.at),
      column = Math.floor((instant - start) / DAY_MS);
    // A boundary at the next week's first instant belongs only to that following grid.
    if (instant < start || instant >= end) return;
    // offenceLabel distinguishes concurrent forecast categories without shortening their accessible descriptions.
    // Shared markers may reference one reason for filtering. Preserve the server's account-wide label.
    const offenceLabel =
      forecast.type_name === "Ordinary competitive"
        ? forecast.type_name
        : typeCodes.get(forecast.type_id) || forecast.type_name;
    entries.push({
      key: `${forecast.account_id}-${forecast.type_id}-${forecast.at}`,
      accountId: forecast.account_id,
      firstColumn: column,
      lastColumn: column,
      minutes: forecast.total_minutes,
      durationLabel: formatDuration(forecast.total_minutes),
      forecast: true,
      startsHere: true,
      endsHere: true,
      label: `Forecast ${forecast.account_tag} · ${offenceLabel} · S${forecast.stored_step}`,
      description: `Forecast ${forecast.account_tag} ${forecast.type_name}: stored state ${forecast.stored_step}, next offence step ${forecast.next_step} ${formatDuration(forecast.total_minutes)}, ${formatTimestamp(forecast.at)}`,
    });
  });
  return entries.sort(
    // left/right are display entries: earlier columns lead, longer shared starts precede shorter
    // spans, and stable keys break remaining ties without changing their source evidence.
    (left, right) =>
      left.firstColumn - right.firstColumn ||
      right.lastColumn - left.lastColumn ||
      left.key.localeCompare(right.key),
  );
}
