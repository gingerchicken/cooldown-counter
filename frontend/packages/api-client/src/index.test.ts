import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./index.js";

// A realistic response fixture keeps body/response assertions readable.
const exampleJob = { id: 1, message: "hello", status: "pending", result: "", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };

/** Produce JSON responses with the same content type as Django REST framework. */
function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}

describe("CSRF-aware generated client", () => {
  // Exercise emitted HTTP requests and user-visible failures at the package boundary.
  it("exposes all schema endpoints through the protected typed transport", async () => {
    // New backend endpoints become callable after generation without new helpers.
    // fetchMock controls the backend response while preserving real Request objects.
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ last_run_at: null }));
    // client owns a fresh token cache so this case cannot inherit another session.
    const client = createApiClient({ fetch: fetchMock });
    const heartbeatResponse = await client.http.GET("/api/heartbeat/");
    expect(heartbeatResponse.data).toEqual({ last_run_at: null });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects per-request origin overrides before disclosing any cookie or token", async () => {
    // openapi-fetch accepts baseUrl overrides, so the wrapper checks every URL.
    // fetchMock controls the backend response while preserving real Request objects.
    const fetchMock = vi.fn<typeof fetch>();
    // client owns a fresh token cache so this case cannot inherit another session.
    const client = createApiClient({ fetch: fetchMock });
    await expect(client.http.GET("/api/health/", { baseUrl: "https://other.example" })).rejects.toThrow("same-origin /api/");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("bootstraps once for simultaneous mutations and attaches credentials/token", async () => {
    // Record requests at the transport boundary to test actual HTTP semantics.
    const requests: Request[] = [];
    // fetchMock controls the backend response while preserving real Request objects.
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      // request is the constructed HTTP request whose headers the browser will send.
      const request = input as Request;
      requests.push(request);
      if (new URL(request.url).pathname === "/api/csrf/") {
        return jsonResponse({ csrfToken: "masked-token" });
      }
      return jsonResponse(exampleJob, 201);
    });
    // client owns a fresh token cache so this case cannot inherit another session.
    const client = createApiClient({ fetch: fetchMock });
    await Promise.all([client.createJob({ message: "hello" }), client.createJob({ message: "hello" })]);

    expect(requests.filter((request) => new URL(request.url).pathname === "/api/csrf/")).toHaveLength(1);
    expect(requests).toHaveLength(3);
    for (const mutationRequest of requests.filter((request) => request.method === "POST")) {
      // Every unsafe request carries the token without putting it in the URL.
      expect(mutationRequest.headers.get("X-CSRFToken")).toBe("masked-token");
      expect(mutationRequest.credentials).toBe("same-origin");
      expect(await mutationRequest.json()).toEqual({ message: "hello" });
    }
  });

  it("establishes a session before the initial list and keeps safe reads token-free", async () => {
    // The first bootstrap response sets cookies before any session-scoped read.
    // fetchMock controls the backend response while preserving real Request objects.
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "token" }))
      .mockResolvedValueOnce(jsonResponse([exampleJob]));
    // client owns a fresh token cache so this case cannot inherit another session.
    const client = createApiClient({ fetch: fetchMock });
    expect(await client.listJobs()).toEqual([exampleJob]);
    // listRequest is the read that follows the completed session bootstrap.
    const listRequest = fetchMock.mock.calls[1][0] as Request;
    expect(listRequest.method).toBe("GET");
    expect(listRequest.headers.has("X-CSRFToken")).toBe(false);
  });

  it("does not send a mutation after failed bootstrap and can recover later", async () => {
    // Recovery is driven by a later action, never a replay of a rejected write.
    // fetchMock controls the backend response while preserving real Request objects.
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({}, 503))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "token" }))
      .mockResolvedValueOnce(jsonResponse(exampleJob, 201));
    // client owns a fresh token cache so this case cannot inherit another session.
    const client = createApiClient({ fetch: fetchMock });
    await expect(client.createJob({ message: "hello" })).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await expect(client.createJob({ message: "hello" })).resolves.toEqual(exampleJob);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("rejects malformed bootstrap data before sending a write", async () => {
    // An absent masked token must not degrade into an unprotected submission.
    // fetchMock controls the backend response while preserving real Request objects.
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ csrfToken: "" }));
    // client owns a fresh token cache so this case cannot inherit another session.
    const client = createApiClient({ fetch: fetchMock });
    await expect(client.createJob({ message: "hello" })).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("preserves validation details and sends a failed write only once", async () => {
    // Callers can inspect fields while the public error remains safe to display.
    // fetchMock controls the backend response while preserving real Request objects.
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "token" }))
      .mockResolvedValueOnce(jsonResponse({ message: ["This field may not be blank."] }, 400));
    // client owns a fresh token cache so this case cannot inherit another session.
    const client = createApiClient({ fetch: fetchMock });
    await expect(client.createJob({ message: "" })).rejects.toMatchObject({ status: 400, details: { message: ["This field may not be blank."] } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("refreshes a rotated token on the next action without retrying a 403 write", async () => {
    // A rejected permission or CSRF response does not justify automatic replay.
    // fetchMock controls the backend response while preserving real Request objects.
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "old-token" }))
      .mockResolvedValueOnce(jsonResponse({}, 403))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "new-token" }))
      .mockResolvedValueOnce(jsonResponse(exampleJob, 201));
    // client owns a fresh token cache so this case cannot inherit another session.
    const client = createApiClient({ fetch: fetchMock });
    await expect(client.createJob({ message: "hello" })).rejects.toMatchObject({ status: 403 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await client.createJob({ message: "hello" });
    // secondMutation must carry the newly bootstrapped token after invalidation.
    const secondMutation = fetchMock.mock.calls[3][0] as Request;
    expect(secondMutation.headers.get("X-CSRFToken")).toBe("new-token");
  });

  it("supports an explicit token reset after login/logout", async () => {
    // Authentication integrations can invalidate memory after Django rotates CSRF.
    // fetchMock controls the backend response while preserving real Request objects.
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "old-token" }))
      .mockResolvedValueOnce(jsonResponse(exampleJob, 201))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "new-token" }))
      .mockResolvedValueOnce(jsonResponse(exampleJob, 201));
    // client owns a fresh token cache so this case cannot inherit another session.
    const client = createApiClient({ fetch: fetchMock });
    await client.createJob({ message: "hello" });
    client.resetCsrfToken();
    await client.createJob({ message: "hello" });
    // secondMutation must carry the newly bootstrapped token after invalidation.
    const secondMutation = fetchMock.mock.calls[3][0] as Request;
    expect(secondMutation.headers.get("X-CSRFToken")).toBe("new-token");
  });
});

describe("session authentication", () => {
  // Session checks are safe reads, while authentication changes must rotate the cached token.
  it("checks an existing session without requiring a CSRF bootstrap", async () => {
    // fetchMock preserves the actual session read while returning a signed-in identity.
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ user: { id: 7, username: "alice" } }));
    // client owns this scenario's token cache and browser origin.
    const client = createApiClient({ fetch: fetchMock });
    expect(await client.getSession()).toEqual({ user: { id: 7, username: "alice" } });
    // sessionRequest must include cookies without sending a token on its safe method.
    const sessionRequest = fetchMock.mock.calls[0][0] as Request;
    expect(sessionRequest.url).toBe("http://localhost/api/auth/session/");
    expect(sessionRequest.credentials).toBe("same-origin");
    expect(sessionRequest.headers.has("X-CSRFToken")).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes CSRF after login before creating protected work", async () => {
    // Django rotates CSRF on login, so the following job must use a new bootstrap.
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "before-login" }))
      .mockResolvedValueOnce(jsonResponse({ user: { id: 7, username: "alice" } }))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "after-login" }))
      .mockResolvedValueOnce(jsonResponse(exampleJob, 201));
    // client shares authentication and job transport without retaining a plaintext password.
    const client = createApiClient({ fetch: fetchMock });
    expect(await client.login({ username: "alice", password: " exact password " })).toEqual({ id: 7, username: "alice" });
    await client.createJob({ message: "hello" });
    // loginRequest preserves password whitespace; jobRequest carries the post-login token.
    const loginRequest = fetchMock.mock.calls[1][0] as Request;
    const jobRequest = fetchMock.mock.calls[3][0] as Request;
    expect(await loginRequest.json()).toEqual({ username: "alice", password: " exact password " });
    expect(loginRequest.headers.get("X-CSRFToken")).toBe("before-login");
    expect(jobRequest.headers.get("X-CSRFToken")).toBe("after-login");
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("refreshes CSRF after logout even when authentication uses the raw typed transport", async () => {
    // Both public helpers and direct generated endpoint calls share invalidation rules.
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "anonymous" }))
      .mockResolvedValueOnce(jsonResponse({ user: { id: 7, username: "alice" } }))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "authenticated" }))
      .mockResolvedValueOnce(jsonResponse({ user: null }))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "signed-out" }))
      .mockResolvedValueOnce(jsonResponse({ user: { id: 8, username: "bob" } }));
    // client must discard both the initial and logged-in CSRF tokens at their boundaries.
    const client = createApiClient({ fetch: fetchMock });
    await client.http.POST("/api/auth/login/", { body: { username: "alice", password: "first-password" } });
    await client.logout();
    await client.login({ username: "bob", password: "second-password" });
    // logoutRequest and secondLoginRequest must each use their own session's fresh token.
    const logoutRequest = fetchMock.mock.calls[3][0] as Request;
    const secondLoginRequest = fetchMock.mock.calls[5][0] as Request;
    expect(logoutRequest.headers.get("X-CSRFToken")).toBe("authenticated");
    expect(secondLoginRequest.headers.get("X-CSRFToken")).toBe("signed-out");
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("does not replay rejected credentials or expose the server's error body as its message", async () => {
    // An incorrect password is a deliberate user action, never an automatic retry trigger.
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "token" }))
      .mockResolvedValueOnce(jsonResponse({ detail: "Invalid username or password." }, 400));
    // client keeps credential handling inside one same-origin protected write.
    const client = createApiClient({ fetch: fetchMock });
    await expect(client.login({ username: "alice", password: "incorrect" })).rejects.toMatchObject({ status: 400 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([401, 403])("bootstraps again before the first login after a protected read returns %s", async (status) => {
    // Lost cookies invalidate the cached masked token before any new credential submission.
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "lost-cookie-token" }))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ detail: "Authentication required." }, status))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "fresh-cookie-token" }))
      .mockResolvedValueOnce(jsonResponse({ user: { id: 7, username: "alice" } }));
    // client keeps one token cache across the successful read, expiry, and deliberate login.
    const client = createApiClient({ fetch: fetchMock });
    await client.listJobs();
    await expect(client.listJobs()).rejects.toMatchObject({ status });
    await expect(client.login({ username: "alice", password: "password" })).resolves.toEqual({ id: 7, username: "alice" });
    // freshBootstrap and loginRequest prove recovery happens before this first credential POST.
    const freshBootstrap = fetchMock.mock.calls[3][0] as Request;
    const loginRequest = fetchMock.mock.calls[4][0] as Request;
    expect(new URL(freshBootstrap.url).pathname).toBe("/api/csrf/");
    expect(loginRequest.headers.get("X-CSRFToken")).toBe("fresh-cookie-token");
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("forgets the cached token when a session check confirms the browser is signed out", async () => {
    // A public session read can detect cookie loss before any protected request is rejected.
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "previous-session" }))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ user: null }))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "new-session" }))
      .mockResolvedValueOnce(jsonResponse({ user: { id: 7, username: "alice" } }));
    // client must invalidate its previous bootstrap even though the session read returned 200.
    const client = createApiClient({ fetch: fetchMock });
    await client.listJobs();
    expect(await client.getSession()).toEqual({ user: null });
    await client.login({ username: "alice", password: "password" });
    // loginRequest must pair with the newly established cookie rather than the expired session.
    const loginRequest = fetchMock.mock.calls[4][0] as Request;
    expect(loginRequest.headers.get("X-CSRFToken")).toBe("new-session");
  });
});
