import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, filterAccounts, filterEvents, filterForecasts, matchesAccount } from "./filters";
import { accountFixture, eventFixture } from "./testing.fixtures";

describe("identity and combined filter semantics", () => {
  it("uses an exact selected UUID despite overlapping tags and SteamID search substrings", () => {
    // Similar tags are intentionally different accounts; a chosen UUID cannot expand into a substring.
    const first = accountFixture(), second = accountFixture({ id: "other", tag: "alpha-extra" });
    expect(filterAccounts([first, second], { ...EMPTY_FILTERS, accountId: first.id })).toEqual([first]);
    expect(matchesAccount(first, { ...EMPTY_FILTERS, search: "  ALPHA  " })).toBe(true);
    expect(matchesAccount(first, { ...EMPTY_FILTERS, search: "39452203" })).toBe(true);
    expect(matchesAccount(first, { ...EMPTY_FILTERS, search: "no-match" })).toBe(false);
  });
  it("does not combine historical A with active B as an active A match", () => {
    // Predictions exist for every type, so recorded and active IDs must drive history filtering.
    const account = accountFixture({ recorded_type_ids: ["A", "B"], active_type_ids: ["B"], status: "active" });
    expect(filterAccounts([account], { ...EMPTY_FILTERS, typeIds: ["A"], status: "active" })).toEqual([]);
    expect(filterAccounts([account], { ...EMPTY_FILTERS, typeIds: ["A"], status: "clear" })).toEqual([account]);
    expect(filterAccounts([account], { ...EMPTY_FILTERS, typeIds: ["A", "B"], status: "active" })).toEqual([account]);
    expect(filterAccounts([account], { ...EMPTY_FILTERS, typeIds: ["unknown"] })).toEqual([]);
  });
  it("uses start-inclusive and expiry-exclusive event availability", () => {
    // Exact expiry is clear; a hypothetical future event cannot be prematurely classified active.
    const now = Date.parse("2026-01-01T00:30:00Z"), account = accountFixture();
    const expired = eventFixture(), active = eventFixture({ id: "active", started_at: "2026-01-01T00:30:00Z", expires_at: "2026-01-01T01:00:00Z" }), future = eventFixture({ id: "future", started_at: "2026-01-02T00:00:00Z", expires_at: "2026-01-02T00:30:00Z" });
    expect(filterEvents([expired, active, future], [account], { ...EMPTY_FILTERS, status: "active" }, now)).toEqual([active]);
    expect(filterEvents([expired, active, future], [account], { ...EMPTY_FILTERS, status: "clear" }, now)).toEqual([expired]);
    expect(filterEvents([active], [], EMPTY_FILTERS, now)).toEqual([]);
  });
  it("keeps forecasts separate from observed status while applying exact account and type filters", () => {
    // Forecast state zero describes the ladder, not an observed zero-duration cooldown.
    const account = accountFixture(), point = { account_id: account.id, account_tag: account.tag, type_id: "A", type_name: "A", at: "2026-02-01T00:00:00Z", stored_step: 0, next_step: 1, total_minutes: 30 };
    expect(filterForecasts([point], [account], { ...EMPTY_FILTERS, typeIds: ["A"], status: "clear" })).toEqual([point]);
    expect(filterForecasts([point], [account], { ...EMPTY_FILTERS, typeIds: ["B"] })).toEqual([]);
  });
});
