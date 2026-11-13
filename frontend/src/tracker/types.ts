/**
 * Domain aliases retain Django's generated contract as the only schema authority.
 * Filters is local presentation state; it does not replace backend ownership or prediction rules.
 */
import type { components } from "@template/api-client";

/** All domain contracts come from the automatically generated Django schema. */
export type Fleet = components["schemas"]["Fleet"];
/** A fleet-local identity and its server-derived availability and predictions. */
export type Account = components["schemas"]["Account"];
/** A detail response adds saved events and their distinct observations. */
export type AccountDetail = components["schemas"]["AccountDetail"];
/** An offence keeps stable identity while its current policy is versioned. */
export type OffenceType = components["schemas"]["OffenceType"];
/** A saved offence assessment is never recalculated in the browser. */
export type CooldownEvent = components["schemas"]["Event"];
/** A future reduction is a forecast rather than an observation. */
export type Forecast = components["schemas"]["Forecast"];
/** Calendar totals identify unique records and fleet-wide restricted accounts. */
export type CalendarSnapshot = components["schemas"]["Calendar"];
/** Server preview includes policy and history tokens needed for safe recording. */
export type Preview = components["schemas"]["Preview"];
/** Tenant roles are assigned by membership rather than Django staff status. */
export type Membership = components["schemas"]["Membership"];
/** Recent mutations expose domain facts without authentication credentials. */
export type AuditEntry = components["schemas"]["Audit"];
/** Creation requests remain tied to generated OpenAPI schemas. */
export type TypeInput = components["schemas"]["TypeInputRequest"];
/** An accepted event uses explicit start and observation timestamps. */
export type EventInput = components["schemas"]["EventInputRequest"];
/** A separate observation cannot increment the offence count. */
export type ObservationInput = components["schemas"]["ObservationInputRequest"];
/** Preview input deliberately excludes trusted totals and revision tokens. */
export type PreviewInput = components["schemas"]["PreviewInputRequest"];

/** Filter state stores exact account/type identities separately from free text. */
export interface Filters {
  /** Search narrows account tags and exact SteamID digit strings. */
  search: string;
  /** Empty means every account; an actual choice is matched by UUID. */
  accountId: string;
  /** Empty means every offence; several identities form a union. */
  typeIds: string[];
  /** Calendar clear means expired records; fleet clear means unrestricted accounts. */
  status: "all" | "active" | "clear";
}
