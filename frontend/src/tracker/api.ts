import { ApiError } from "@template/api-client";
import type { ApiClient, components, paths } from "@template/api-client";
import type {
  EventInput,
  ObservationInput,
  PreviewInput,
  TypeInput,
} from "./types";

/**
 * Extract data from a generated response envelope; missing data or a rejected status throws ApiError.
 * The envelope retains unknown structured validation errors for the caller's recoverable draft.
 */
function unwrap<T>(envelope: {
  data?: T;
  error?: unknown;
  response: Response;
}): T {
  // Missing successful JSON is a contract failure, not an empty account or catalogue.
  if (!envelope.response.ok || envelope.data === undefined) {
    throw new ApiError(envelope.response.status, envelope.error);
  }
  return envelope.data;
}

/**
 * Adapt the supplied session/CSRF client to fleet-scoped domain commands and reads.
 * Optional onSessionExpired runs only after an authoritative session read confirms anonymity.
 * Methods preserve transport/ApiError failures and never replay writes after an ambiguous result.
 */
export function typedTrackerApi(
  client: ApiClient,
  onSessionExpired?: () => void,
) {
  /** Await request while distinguishing denied tenant permission from an expired cookie session. */
  async function checked<T>(request: Promise<T>): Promise<T> {
    try {
      // Transport failures are preserved; writes are never replayed automatically.
      return await request;
    } catch (requestError) {
      // requestError is the original mutation/read failure and remains the failure sent to the caller.
      // Both permission and expired-session responses can be 403 under Django sessions.
      if (
        requestError instanceof ApiError &&
        [401, 403].includes(requestError.status)
      ) {
        try {
          // session is the accepted identity snapshot, not a supplied permission or cached role.
          // Its absence proves anonymity without discarding a still-authenticated viewer's workspace.
          const session = await client.getSession();
          if (!session.user) onSessionExpired?.();
        } catch {
          // A failed identity read cannot prove logout; keep the original failure recoverable.
        }
      }
      throw requestError;
    }
  }

  return {
    /** List authorized fleets; optional signal cancels the owning screen's obsolete read. */
    listFleets: (signal?: AbortSignal) =>
      checked(client.http.GET("/api/fleets/", { signal }).then(unwrap)),
    /** Create a fleet using name as its display label; the server grants the caller ownership. */
    createFleet: (name: string) =>
      checked(
        client.http.POST("/api/fleets/", { body: { name } }).then(unwrap),
      ),
    /** Load fleetId's account summaries/predictions; signal belongs to the current screen read. */
    accounts: (fleetId: string, signal?: AbortSignal) =>
      checked(
        client.http
          .GET("/api/fleets/{fleet_id}/accounts/", {
            params: { path: { fleet_id: fleetId } },
            signal,
          })
          .then(unwrap),
      ),
    /** Read accountId's preserved history inside fleetId; signal cancels an obsolete detail read. */
    account: (fleetId: string, accountId: string, signal?: AbortSignal) =>
      checked(
        client.http
          .GET("/api/fleets/{fleet_id}/accounts/{account_id}/", {
            params: { path: { fleet_id: fleetId, account_id: accountId } },
            signal,
          })
          .then(unwrap),
      ),
    /** Provision body as a real account in fleetId; generated fields retain exact string SteamID. */
    createAccount: (
      fleetId: string,
      body: components["schemas"]["AccountInputRequest"],
    ) =>
      checked(
        client.http
          .POST("/api/fleets/{fleet_id}/accounts/", {
            params: { path: { fleet_id: fleetId } },
            body,
          })
          .then(unwrap),
      ),
    /** Apply body to accountId inside fleetId, retaining stable identity and historical evidence. */
    updateAccount: (
      fleetId: string,
      accountId: string,
      body: components["schemas"]["AccountUpdateRequest"],
    ) =>
      checked(
        client.http
          .PATCH("/api/fleets/{fleet_id}/accounts/{account_id}/", {
            params: { path: { fleet_id: fleetId, account_id: accountId } },
            body,
          })
          .then(unwrap),
      ),
    /** Read fleetId's definitions, including archived history; signal cancels stale screen reads. */
    types: (fleetId: string, signal?: AbortSignal) =>
      checked(
        client.http
          .GET("/api/fleets/{fleet_id}/types/", {
            params: { path: { fleet_id: fleetId } },
            signal,
          })
          .then(unwrap),
      ),
    /** Publish body as a new offence and first complete policy inside fleetId. */
    createType: (fleetId: string, body: TypeInput) =>
      checked(
        client.http
          .POST("/api/fleets/{fleet_id}/types/", {
            params: { path: { fleet_id: fleetId } },
            body,
          })
          .then(unwrap),
      ),
    /** Update typeId inside fleetId using body's reviewed policy token and complete rule draft. */
    updateType: (
      fleetId: string,
      typeId: string,
      body: TypeInput & { expected_policy_id: string },
    ) =>
      checked(
        client.http
          .PATCH("/api/fleets/{fleet_id}/types/{type_id}/", {
            params: { path: { fleet_id: fleetId, type_id: typeId } },
            body,
          })
          .then(unwrap),
      ),
    /** Archive typeId in fleetId only if policyId still names the reviewed current version. */
    archiveType: (fleetId: string, typeId: string, policyId: string) =>
      checked(
        client.http
          .POST("/api/fleets/{fleet_id}/types/{type_id}/archive/", {
            params: { path: { fleet_id: fleetId, type_id: typeId } },
            body: { expected_policy_id: policyId },
          })
          .then(unwrap),
      ),
    /** Preview body at its entered issue time inside fleetId; Python owns every escalation rule. */
    preview: (fleetId: string, body: PreviewInput) =>
      checked(
        client.http
          .POST("/api/fleets/{fleet_id}/preview/", {
            params: { path: { fleet_id: fleetId } },
            body,
          })
          .then(unwrap),
      ),
    /** Record a griefing warning independently of issued penalties and escalation. */
    recordWarning: (fleetId: string, body: components["schemas"]["WarningInputRequest"]) =>
      checked(
        client.http.POST("/api/fleets/{fleet_id}/warnings/", {
          params: { path: { fleet_id: fleetId } },
          body,
        }).then(unwrap),
      ),
    /** Record body's reviewed offence/evidence in fleetId using its stable retry UUIDs. */
    record: (fleetId: string, body: EventInput) =>
      checked(
        client.http
          .POST("/api/fleets/{fleet_id}/events/", {
            params: { path: { fleet_id: fleetId } },
            body,
          })
          .then(unwrap),
      ),
    /** Append body as evidence to eventId in fleetId without changing that offence's assessment. */
    observe: (fleetId: string, eventId: string, body: ObservationInput) =>
      checked(
        client.http
          .POST("/api/fleets/{fleet_id}/events/{event_id}/observations/", {
            params: { path: { fleet_id: fleetId, event_id: eventId } },
            body,
          })
          .then(unwrap),
      ),
    /** Read fleetId using query's UTC bounds/filters; signal cancels an obsolete range request. */
    calendar: (
      fleetId: string,
      query: NonNullable<
        paths["/api/fleets/{fleet_id}/calendar/"]["get"]["parameters"]["query"]
      >,
      signal?: AbortSignal,
    ) =>
      checked(
        client.http
          .GET("/api/fleets/{fleet_id}/calendar/", {
            params: { path: { fleet_id: fleetId }, query },
            signal,
          })
          .then(unwrap),
      ),
    /** Read fleetId's memberships; optional signal cancels a read after the tenant changes. */
    members: (fleetId: string, signal?: AbortSignal) =>
      checked(
        client.http
          .GET("/api/fleets/{fleet_id}/members/", {
            params: { path: { fleet_id: fleetId } },
            signal,
          })
          .then(unwrap),
      ),
    /** Grant body's existing username and role membership inside fleetId; server requires ownership. */
    addMember: (
      fleetId: string,
      body: components["schemas"]["MembershipInputRequest"],
    ) =>
      checked(
        client.http
          .POST("/api/fleets/{fleet_id}/members/", {
            params: { path: { fleet_id: fleetId } },
            body,
          })
          .then(unwrap),
      ),
    /** Set memberId's role inside fleetId; the server protects the final owner transactionally. */
    updateMember: (
      fleetId: string,
      memberId: number,
      role: components["schemas"]["RoleEnum"],
    ) =>
      checked(
        client.http
          .PATCH("/api/fleets/{fleet_id}/members/{member_id}/", {
            params: { path: { fleet_id: fleetId, member_id: memberId } },
            body: { role },
          })
          .then(unwrap),
      ),
    /** Remove memberId from fleetId without deleting the operator or their historical attribution. */
    async removeMember(fleetId: string, memberId: number) {
      // A valid 204 deliberately has no JSON payload to unwrap.
      await checked(
        client.http
          .DELETE("/api/fleets/{fleet_id}/members/{member_id}/", {
            params: { path: { fleet_id: fleetId, member_id: memberId } },
          })
          .then((envelope) => {
            // envelope is the generated no-content response, which must not be JSON-unwrapped.
            // Reject inside shared recovery so a failed removal still checks session identity.
            if (!envelope.response.ok)
              throw new ApiError(envelope.response.status, envelope.error);
          }),
      );
    },
    /** Read fleetId's recent attributed mutations; signal cancels this bounded screen-owned read. */
    audit: (fleetId: string, signal?: AbortSignal) =>
      checked(
        client.http
          .GET("/api/fleets/{fleet_id}/audit/", {
            params: { path: { fleet_id: fleetId } },
            signal,
          })
          .then(unwrap),
      ),
  };
}

/** Screens and component tests depend on the cohesive adapter rather than raw fetch. */
export type TrackerApi = ReturnType<typeof typedTrackerApi>;

/** Convert an unknown API/transport error to literal display text while preserving recovery context. */
export function describeError(error: unknown): string {
  // Conflicts require a new deliberate review, while preserving the current editable draft.
  if (error instanceof ApiError && error.status === 409)
    return "This preview or editor is out of date. Refresh its review and try again.";
  // A permission failure may require membership review rather than treating all 403s as logout.
  if (error instanceof ApiError && [401, 403].includes(error.status))
    return "This action is not permitted. Check your fleet role or sign in again.";
  if (
    error instanceof ApiError &&
    typeof error.details === "object" &&
    error.details !== null
  ) {
    // Flatten only field names and textual validation content; React renders this as literal text.
    return Object.entries(error.details)
      .map(
        // field is the backend validation key; messages may be a list or one scalar explanation.
        ([field, messages]) =>
          `${field}: ${Array.isArray(messages) ? messages.join(" ") : String(messages)}`,
      )
      .join(" ");
  }
  // Ordinary local validation errors retain their message; unknown/HTTP failures use recoverable copy.
  return error instanceof Error && !(error instanceof ApiError)
    ? error.message
    : "The service is unavailable. Your draft is preserved; please try again.";
}
