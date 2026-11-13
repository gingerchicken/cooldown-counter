import { vi } from "vitest";
import type { TrackerApi } from "./api";
import type { Account, AccountDetail, CooldownEvent, Fleet, OffenceType, Preview } from "./types";

/** Stable fake identities support isolated component/unit tests, never application startup. */
export function fleetFixture(overrides: Partial<Fleet> = {}): Fleet {
  return { id: "00000000-0000-4000-8000-000000000001", name: "Test fleet", role: "owner", created_at: "2026-01-01T00:00:00Z", ...overrides };
}

/** A complete generated catalogue contract keeps component fixtures aligned with Django. */
export function typeFixture(overrides: Partial<OffenceType> = {}): OffenceType {
  return { id: "00000000-0000-4000-8000-000000000002", name: "Abandoning", code: "ABD", note: "Left before the match ended", archived_at: null, event_count: 0, policy: { id: "00000000-0000-4000-8000-000000000003", number: 1, clean_window_days: 7, decay_mode: "step_down", steps: [30, 120, 1440, 10080] }, ...overrides };
}

/** Preserve exact external identity and all server-derived summary fields in typed fixtures. */
export function accountFixture(overrides: Partial<Account> = {}): Account {
  return { id: "00000000-0000-4000-8000-000000000004", steam_id: "76561198039452203", tag: "alpha", archived_at: null, history_revision: 0, event_count: 0, recorded_type_ids: [], active_type_ids: [], status: "clean", active_until: null, first_observed: null, predictions: [{ type_id: typeFixture().id, type_name: "Abandoning", step: 1, total_steps: 4, total_minutes: 30, base_step: 0, recorded_step: 0, sample_count: 0, transition: "First offence -> step 1.", next_decay_at: null }], ...overrides };
}

/** A saved event includes its own policy snapshot and separate observed evidence. */
export function eventFixture(overrides: Partial<CooldownEvent> = {}): CooldownEvent {
  return { id: "00000000-0000-4000-8000-000000000005", account_id: accountFixture().id, account_tag: "alpha", type_id: typeFixture().id, type_name: "Abandoning", policy_id: typeFixture().policy.id, policy_number: 1, started_at: "2026-01-01T00:00:00Z", expires_at: "2026-01-01T00:30:00Z", assigned_step: 1, total_minutes: 30, is_override: false, override_reason: "", transition: "First offence -> step 1.", created_by: "operator", created_at: "2026-01-01T00:00:00Z", observations: [{ id: "00000000-0000-4000-8000-000000000006", observed_at: "2026-01-01T00:00:00Z", remaining_minutes: 30, created_by: "operator", created_at: "2026-01-01T00:00:00Z" }], ...overrides };
}

/** Token-bearing previews are fake only at the isolated component boundary. */
export function previewFixture(overrides: Partial<Preview> = {}): Preview {
  return { policy_id: typeFixture().policy.id, history_revision: 0, step: 1, total_minutes: 30, expires_at: "2026-01-01T00:30:00Z", base_step: 0, transition: "First offence -> step 1.", sample_count: 0, ...overrides };
}

/** Supply complete typed methods while individual tests override only their deliberate boundary. */
export function trackerFixture(overrides: Partial<TrackerApi> = {}): TrackerApi {
  // Detail is separate from list contracts so the browser can verify actual history composition.
  const detail: AccountDetail = { ...accountFixture(), events: [eventFixture()] };
  return {
    listFleets: vi.fn().mockResolvedValue([fleetFixture()]), createFleet: vi.fn().mockResolvedValue(fleetFixture()), accounts: vi.fn().mockResolvedValue([accountFixture()]), account: vi.fn().mockResolvedValue(detail), createAccount: vi.fn().mockResolvedValue(detail), updateAccount: vi.fn().mockResolvedValue(detail), types: vi.fn().mockResolvedValue([typeFixture()]), createType: vi.fn().mockResolvedValue(typeFixture()), updateType: vi.fn().mockResolvedValue(typeFixture()), archiveType: vi.fn().mockResolvedValue(typeFixture()), preview: vi.fn().mockResolvedValue(previewFixture()), record: vi.fn().mockResolvedValue(eventFixture()), observe: vi.fn().mockResolvedValue(eventFixture().observations[0]), calendar: vi.fn().mockResolvedValue({ events: [], forecasts: [], account_count: 1, active_count: 0, recorded_count: 0, as_of: "2026-01-01T00:00:00Z" }), members: vi.fn().mockResolvedValue([]), addMember: vi.fn().mockResolvedValue({ id: 1, user_id: 1, username: "operator", role: "viewer" }), updateMember: vi.fn().mockResolvedValue({ id: 1, user_id: 1, username: "operator", role: "editor" }), removeMember: vi.fn().mockResolvedValue(undefined), audit: vi.fn().mockResolvedValue([]), ...overrides,
  };
}
