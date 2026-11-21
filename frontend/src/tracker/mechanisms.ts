import type { OffenceType } from "./types";

/** Use the backend's versioned policy identity even after an operator renames the reason. */
export type Mechanism = OffenceType["policy"]["mechanism"];

/** Operator-facing names for selecting a policy and identifying its history scope. */
export const mechanismNames: Record<Mechanism, string> = {
  custom: "Custom fleet ladder",
  ordinary: "Ordinary competitive cooldown",
  vacnet: "VACNet irregular gameplay",
  griefing: "Griefing reports",
};

/** Explain the prediction and evidence available for the chosen mechanism. */
export const mechanismGuidance: Record<Mechanism, string> = {
  custom:
    "This fleet defines the durations and recovery rules for this reason.",
  ordinary:
    "Ordinary reasons share one competitive level per account. Level four and higher carry seven days. Each complete clean week reduces the level by one.",
  vacnet:
    "VACNet restricts all game modes for the flagged player and affected party members. Repeat restrictions can reach 180 days. Valve describes the minimum as both 20 hours and one day. Record the displayed timer. The next duration and recovery schedule are unknown.",
  griefing:
    "Record a cooldown issued for excessive griefing reports. A warning alone is insufficient. Valve has not published the current duration sequence or recovery schedule.",
};

/** Only ordinary and custom policies offer a duration ladder or level override. */
export function usesObservedTimer(mechanism: Mechanism): boolean {
  return mechanism === "vacnet" || mechanism === "griefing";
}

// Valve's longest ordinary duration, in whole minutes. Both display and evidence checks use this limit.
const ordinaryMaximumMinutes = 7 * 24 * 60;

/** Visible when a reported restriction cannot be explained by any ordinary duration band. */
export const ordinaryTimerDiscrepancy =
  "This timer exceeds every ordinary duration. Check the reason and timestamps.";

/** Compare the minimum indicated total (elapsed time plus the reading) with the ordinary maximum. */
export function exceedsOrdinaryDuration(
  start: string,
  observation: string,
  remainingMinutes: number,
): boolean {
  // Ignore partial elapsed minutes to match the stored timer's whole-minute precision.
  const elapsedMinutes = Math.floor(
    (Date.parse(observation) - Date.parse(start)) / 60000,
  );
  return (
    elapsedMinutes >= 0 &&
    elapsedMinutes + remainingMinutes > ordinaryMaximumMinutes
  );
}

/** A lower bound on ordinary level affects duration only while it can still rise to a longer band. */
export function isMinimumDuration(
  levelIsLowerBound: boolean,
  minutes: number | null,
): boolean {
  // At level four and above every ordinary duration is seven days, including an unknown higher rank.
  return (
    levelIsLowerBound && minutes !== null && minutes < ordinaryMaximumMinutes
  );
}
