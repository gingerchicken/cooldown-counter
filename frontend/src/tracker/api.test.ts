import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "@template/api-client";
import { describeError, typedTrackerApi } from "./api";

/** Build actual Fetch responses while testing the shared generated-path transport. */
function jsonResponse(body: unknown, status = 200): Response {
  // The content type makes openapi-fetch parse the response exactly as the real Django API.
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Match the complete Fetch signature while assertions receive normalized requests. */
function mockFetch(handler: (request: Request) => Response | Promise<Response>) {
  // Browser callers may supply URL, string or Request plus options; preserve that contract.
  return vi.fn<typeof globalThis.fetch>(async (input, options) => {
    // Request normalization keeps endpoint checks independent of the caller's input overload.
    const request = new Request(input, options);
    return handler(request);
  });
}

describe("tracker authorization and recovery boundary", () => {
  it("retains a valid viewer session when one protected operation is denied", async () => {
    // Fleet permission failure does not imply that the operator's Django login expired.
    const fetchRequest = mockFetch(async (request) => {
      // The authoritative identity endpoint distinguishes a viewer from a signed-out visitor.
      return request.url.endsWith("/api/auth/session/")
        ? jsonResponse({ user: { id: 7, username: "viewer" } })
        : jsonResponse({ detail: "Permission denied." }, 403);
    });
    // The callback is the only boundary allowed to discard protected screen state.
    const expireSession = vi.fn();
    // Use the actual session/CSRF client, avoiding a second fake authentication implementation.
    const api = typedTrackerApi(createApiClient({ fetch: fetchRequest }), expireSession);
    await expect(api.accounts("fleet-id")).rejects.toMatchObject({ status: 403 });
    expect(expireSession).not.toHaveBeenCalled();
    expect(fetchRequest).toHaveBeenCalledTimes(2);
  });

  it("invalidates protected state only after an authoritative anonymous session response", async () => {
    // The rejected protected request and accepted anonymous response describe one expired cookie.
    const fetchRequest = mockFetch(async (request) => request.url.endsWith("/api/auth/session/")
      ? jsonResponse({ user: null })
      : jsonResponse({ detail: "Authentication required." }, 403));
    // Expiry is observed independently of the original request's recoverable error object.
    const expireSession = vi.fn();
    const api = typedTrackerApi(createApiClient({ fetch: fetchRequest }), expireSession);
    await expect(api.accounts("fleet-id")).rejects.toMatchObject({ status: 403 });
    expect(expireSession).toHaveBeenCalledOnce();
  });

  it("does not claim logout when the confirming identity read is unavailable", async () => {
    // A failed session probe is uncertainty, not evidence that a valid login ended.
    const fetchRequest = mockFetch(async (request) => {
      if (request.url.endsWith("/api/auth/session/")) {
        // Preserve the first permission failure when a second request cannot establish identity.
        throw new TypeError("Network unavailable");
      }
      return jsonResponse({ detail: "Permission denied." }, 403);
    });
    // The UI must keep the error recoverable without discarding an unproven session.
    const expireSession = vi.fn();
    const api = typedTrackerApi(createApiClient({ fetch: fetchRequest }), expireSession);
    await expect(api.accounts("fleet-id")).rejects.toMatchObject({ status: 403 });
    expect(expireSession).not.toHaveBeenCalled();
  });

  it("does not replay an ambiguous failed mutation", async () => {
    // A committed write can lose its response; the transport must not invent a second attempt.
    const fetchRequest = mockFetch(async (request) => {
      if (request.url.endsWith("/api/csrf/")) {
        // The shared transport must finish its safe bootstrap before sending one unsafe request.
        return jsonResponse({ csrfToken: "masked-test-token" });
      }
      throw new TypeError("Connection interrupted after sending");
    });
    // One explicit caller action owns this create command; retry is a separate reviewed action.
    const api = typedTrackerApi(createApiClient({ fetch: fetchRequest }));
    await expect(api.createFleet("Recoverable draft")).rejects.toThrow("Connection interrupted");
    expect(fetchRequest.mock.calls.filter(([request]) => request instanceof Request && request.method === "POST")).toHaveLength(1);
  });

  it("checks session expiry for a failed no-content membership mutation", async () => {
    // A DELETE can be denied after a cookie expires even though successful deletion has no JSON.
    const fetchRequest = mockFetch(async (request) => {
      if (request.url.endsWith("/api/csrf/")) {
        // Unsafe requests retain the same shared bootstrap as every other mutation.
        return jsonResponse({ csrfToken: "masked-test-token" });
      }
      return request.url.endsWith("/api/auth/session/")
        ? jsonResponse({ user: null })
        : jsonResponse({ detail: "Authentication required." }, 403);
    });
    // No-content endpoints must still trigger the authoritative expired-session flow.
    const expireSession = vi.fn();
    const api = typedTrackerApi(createApiClient({ fetch: fetchRequest }), expireSession);
    await expect(api.removeMember("fleet-id", 9)).rejects.toMatchObject({ status: 403 });
    expect(expireSession).toHaveBeenCalledOnce();
  });

  it("preserves field validation and gives conflicts an explicit review instruction", () => {
    // Validation details remain literal strings; the rendering component owns text escaping.
    const fieldFailure = new ApiError(400, { remaining_minutes: ["Choose a positive whole value."] });
    expect(describeError(fieldFailure)).toContain("remaining_minutes: Choose a positive whole value.");
    expect(describeError(new ApiError(409))).toContain("out of date");
    expect(describeError(new ApiError(403))).toContain("not permitted");
    expect(describeError(new ApiError(503))).toContain("unavailable");
  });
});
