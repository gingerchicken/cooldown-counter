/** Format numeric minutes as exact display components without implementing Python's prediction rules. */
export function formatDuration(minutes: number | null): string {
  // Persisted totals are positive integers; unknown transport values must not become fabricated time.
  if (minutes === null || !Number.isFinite(minutes) || minutes < 0) return "Unknown";
  // whole is the truncated minute count; days/hours are complete units and remainder the final
  // minutes. Components avoid rounding displayed evidence into an invalid 1h 60m representation.
  const whole = Math.floor(minutes),
    days = Math.floor(whole / 1440),
    hours = Math.floor((whole % 1440) / 60),
    remainder = whole % 60;
  return [
    days ? `${days}d` : "",
    hours ? `${hours}h` : "",
    remainder || !whole ? `${remainder}m` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Map numeric minutes to the reference's shared appearance bucket, without claiming game policy. */
export function severity(minutes: number | null): string {
  // An unknown prediction has no duration bucket or implied severity.
  if (minutes === null) return "muted";
  // These buckets match the supplied reference while all text remains available without color.
  return `severity-${minutes <= 60 ? 1 : minutes <= 360 ? 2 : minutes <= 1440 ? 3 : minutes <= 10080 ? 4 : 5}`;
}

/** Display ISO timestamp in UTC; null means an account genuinely has no recorded history. */
export function formatTimestamp(timestamp: string | null): string {
  // Absence represents genuinely missing history rather than today's date.
  return timestamp
    ? `${new Date(timestamp).toISOString().slice(0, 16).replace("T", " ")} UTC`
    : "No history";
}

/** Return timestamp's UTC minute text for a datetime-local control; the default is the real present. */
export function utcInput(timestamp = new Date()): string {
  // Minute precision matches the visible native control; no browser-local conversion is performed.
  return timestamp.toISOString().slice(0, 16);
}

/** Parse UTC-labelled input text to an ISO instant, returning null for malformed or normalized dates. */
export function parseUtcInput(input: string): string | null {
  // Accepted controls contain a complete UTC-labelled date and minute, with optional seconds.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(input)) return null;
  // timestamp is a candidate instant, not accepted evidence until re-encoding reproduces the input.
  // This catches impossible days that JavaScript otherwise normalizes into another date.
  const timestamp = new Date(`${input}Z`);
  return Number.isFinite(timestamp.getTime()) &&
    timestamp.toISOString().startsWith(input)
    ? timestamp.toISOString()
    : null;
}

/**
 * Add day/hour/minute input strings, treating blank components as zero.
 * Return positive whole minutes within the database integer range, or null for a rejected draft.
 */
export function parseRemaining(
  days: string,
  hours: string,
  minutes: string,
): number | null {
  // components retains each raw input so one invalid field cannot be hidden by a valid total.
  const components = [days, hours, minutes];
  if (
    components.some(
      // component is one raw day/hour/minute field; blanks alone are allowed to mean zero.
      (component) => component !== "" && !/^\d+$/.test(component),
    )
  )
    return null;
  // total is the additive whole-minute candidate; integer limits are a storage boundary, not a game rule.
  const total =
    Number(days || 0) * 1440 + Number(hours || 0) * 60 + Number(minutes || 0);
  return Number.isSafeInteger(total) && total > 0 && total <= 2147483647
    ? total
    : null;
}

/**
 * Interpret amount text in unit (d, h or the minute fallback), returning accepted whole minutes.
 * Null preserves invalid or out-of-range drafts for correction rather than silently rounding them.
 */
export function stepMinutes(amount: string, unit: string): number | null {
  // Decimal hours/days are useful only when they resolve to exact whole saved minutes.
  if (!/^\d+(?:\.\d+)?$/.test(amount)) return null;
  // multiplier converts the selected unit to minutes; total is the unrounded candidate duration.
  const multiplier = unit === "d" ? 1440 : unit === "h" ? 60 : 1;
  const total = Number(amount) * multiplier;
  return Number.isSafeInteger(total) && total > 0 && total <= 2147483647
    ? total
    : null;
}

/** Represent saved whole minutes as editable amount/unit text without changing the duration. */
export function editableStep(minutes: number): {
  amount: string;
  unit: string;
} {
  // Prefer days then hours only when they express the saved whole-minute value exactly.
  return minutes % 1440 === 0
    ? { amount: String(minutes / 1440), unit: "d" }
    : minutes % 60 === 0
      ? { amount: String(minutes / 60), unit: "h" }
      : { amount: String(minutes), unit: "m" };
}

/** Create one retry UUID using browser cryptography in secure production or explicit local HTTP. */
export function newUuid(): string {
  // randomUUID requires a secure context; getRandomValues also works on explicit local HTTP builds.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // bytes holds fresh randomness; its version/variant bits encode a version-four retry identity.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  // hexadecimal is the contiguous byte encoding, split below into Django's accepted UUID shape.
  const hexadecimal = Array.from(bytes, (byte) =>
    // byte is one random octet; fixed-width hex preserves leading zeroes in the final identity.
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${hexadecimal.slice(0, 8)}-${hexadecimal.slice(8, 12)}-${hexadecimal.slice(12, 16)}-${hexadecimal.slice(16, 20)}-${hexadecimal.slice(20)}`;
}
