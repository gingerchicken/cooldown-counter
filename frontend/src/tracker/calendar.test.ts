import { describe, expect, it } from "vitest";
import {
  DAY_MS,
  isoDate,
  monthStart,
  monthWeeks,
  weekEntries,
} from "./calendar";
import { eventFixture } from "./testing.fixtures";

describe("UTC calendar grids and interval clipping", () => {
  it("builds Monday-first leap-year months and crosses December without browser-local offsets", () => {
    // February 2024 contains leap day and begins on Thursday.
    const february = Date.UTC(2024, 1, 1),
      weeks = monthWeeks(february);
    expect(isoDate(weeks[0][0])).toBe("2024-01-29");
    expect(
      weeks.flat().filter((day) => isoDate(day) === "2024-02-29"),
    ).toHaveLength(1);
    expect(monthStart(Date.UTC(2026, 11, 12), 1)).toBe(Date.UTC(2027, 0, 1));
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });
  it("keeps exact-midnight expiry on the preceding occupied date", () => {
    // The interval ends at Tuesday midnight, so its Monday bar must not cover Tuesday.
    const monday = Date.UTC(2026, 0, 5),
      event = eventFixture({
        started_at: "2026-01-05T12:00:00Z",
        expires_at: "2026-01-06T00:00:00Z",
        total_minutes: 720,
      });
    expect(weekEntries(monday, [event], [], new Map())[0]).toMatchObject({
      firstColumn: 0,
      lastColumn: 0,
      startsHere: true,
      endsHere: true,
    });
  });
  it("retains continuation edges and excludes nonintersecting events", () => {
    // A long recorded cooldown extends beyond both edges of this displayed week.
    const monday = Date.UTC(2026, 0, 5),
      spanning = eventFixture({
        started_at: "2026-01-01T00:00:00Z",
        expires_at: "2026-01-20T00:00:00Z",
      });
    expect(weekEntries(monday, [spanning], [], new Map())[0]).toMatchObject({
      firstColumn: 0,
      lastColumn: 6,
      startsHere: false,
      endsHere: false,
    });
    expect(
      weekEntries(monday + 30 * DAY_MS, [spanning], [], new Map()),
    ).toEqual([]);
  });
  it("uses configured compact codes while preserving full offence names in accessible descriptions", () => {
    // The catalogue UUID supplies a presentation code without changing the saved event or its historical identity.
    const monday = Date.UTC(2026, 0, 5),
      event = eventFixture({
        started_at: "2026-01-05T00:00:00Z",
        expires_at: "2026-01-05T00:30:00Z",
      }),
      codes = new Map([[event.type_id, "LEFT"]]);
    // The visual label can be narrow while its accessible description retains the complete category name.
    const entry = weekEntries(monday, [event], [], codes)[0];
    expect(entry.label).toBe("alpha · LEFT");
    expect(entry.description).toContain("alpha Abandoning");
    expect(
      weekEntries(monday, [event], [], new Map([[event.type_id, ""]]))[0].label,
    ).toBe("alpha · Abandoning");
  });
  it("marks forecasts with stored-state and next-offence semantics rather than an observed penalty", () => {
    // A state-zero reduction still predicts a positive step-one penalty for another offence.
    const monday = Date.UTC(2026, 0, 5),
      point = {
        account_id: "a",
        account_tag: "alpha",
        type_id: "t",
        type_name: "Abandoning",
        at: "2026-01-06T00:00:00Z",
        stored_step: 0,
        next_step: 1,
        total_minutes: 30,
      };
    expect(weekEntries(monday, [], [point], new Map())[0]).toMatchObject({
      forecast: true,
      firstColumn: 1,
      lastColumn: 1,
    });
    expect(
      weekEntries(monday, [], [point], new Map())[0].description,
    ).toContain("next offence step 1 30m");
    expect(weekEntries(monday + 7 * DAY_MS, [], [point], new Map())).toEqual(
      [],
    );
  });
});
