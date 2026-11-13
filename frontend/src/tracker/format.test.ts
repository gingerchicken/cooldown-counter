import { afterEach, describe, expect, it, vi } from "vitest";
import { editableStep, formatDuration, formatTimestamp, newUuid, parseRemaining, parseUtcInput, severity, stepMinutes, utcInput } from "./format";

afterEach(() => { vi.unstubAllGlobals(); });

describe("exact presentation and input boundaries", () => {
  // Formatting never carries a rounded minute into the invalid 1h60m form.
  it.each([[0, "0m"], [30, "30m"], [60, "1h"], [1563, "1d 2h 3m"], [119.6, "1h 59m"]])("formats %s minutes without rounding evidence", (minutes, expected) => { expect(formatDuration(minutes)).toBe(expected); });
  it.each([NaN, Infinity, -1])("rejects a nonrepresentable display duration %s", (minutes) => { expect(formatDuration(minutes)).toBe("Unknown"); });
  it("uses an explicit UTC label and a genuine absent-history state", () => {
    expect(formatTimestamp("2026-01-01T01:30:00+01:00")).toBe("2026-01-01 00:30 UTC");
    expect(formatTimestamp(null)).toBe("No history");
    expect(utcInput(new Date("2026-01-01T01:30:00+01:00"))).toBe("2026-01-01T00:30");
  });
  it("adds every nonnegative component instead of muting and ignoring smaller units", () => {
    expect(parseRemaining("1", "2", "3")).toBe(1563);
    expect(parseRemaining("", "", "90")).toBe(90);
  });
  it.each([["", "", ""], ["-1", "25", "0"], ["0", "0", "0.5"], ["0", "0", "Infinity"], ["99999999999999999999", "", ""]])("rejects invalid components %s/%s/%s", (days, hours, minutes) => { expect(parseRemaining(days, hours, minutes)).toBeNull(); });
  it("accepts fractional units only when the saved total is exactly whole minutes", () => {
    expect(stepMinutes("1.5", "h")).toBe(90);
    expect(stepMinutes("0.5", "d")).toBe(720);
    expect(stepMinutes("0.5", "m")).toBeNull();
    expect(stepMinutes("0", "h")).toBeNull();
    expect(stepMinutes("Infinity", "m")).toBeNull();
  });
  it("selects lossless editor units", () => {
    expect(editableStep(1440)).toEqual({ amount: "1", unit: "d" });
    expect(editableStep(120)).toEqual({ amount: "2", unit: "h" });
    expect(editableStep(90)).toEqual({ amount: "90", unit: "m" });
  });
  it("does not silently normalize an impossible or timezone-ambiguous input date", () => {
    expect(parseUtcInput("2026-02-30T12:00")).toBeNull();
    expect(parseUtcInput("")).toBeNull();
    expect(parseUtcInput("2026-01-01")).toBeNull();
    expect(parseUtcInput("2026-01-01T12:30")).toBe("2026-01-01T12:30:00.000Z");
    expect(parseUtcInput("2026-01-01T12:30:45")).toBe("2026-01-01T12:30:45.000Z");
  });
  it.each([[60, "severity-1"], [61, "severity-2"], [360, "severity-2"], [361, "severity-3"], [1440, "severity-3"], [1441, "severity-4"], [10080, "severity-4"], [10081, "severity-5"]])("preserves appearance boundary %s", (minutes, expected) => { expect(severity(minutes)).toBe(expected); });
  it("creates a version-four retry identity even on the local HTTP test origin", () => {
    // Only the random source is substituted; UUID version and variant encoding remain real code.
    vi.stubGlobal("crypto", { getRandomValues: (bytes: Uint8Array) => bytes.fill(255) });
    expect(newUuid()).toBe("ffffffff-ffff-4fff-bfff-ffffffffffff");
  });
});
