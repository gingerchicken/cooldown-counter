import createClient from "openapi-fetch";
import type { paths } from "./schema.js";

// Re-export the generated contract for consumers adding endpoint-specific helpers.
export type { paths, components, operations } from "./schema.js";

/** A persisted background job, derived directly from Django's OpenAPI response. */
export type Job = paths["/api/jobs/"]["get"]["responses"][200]["content"]["application/json"][number];

/** The accepted creation body, derived directly from Django's OpenAPI request. */
export type CreateJobRequest = NonNullable<paths["/api/jobs/"]["post"]["requestBody"]>["content"]["application/json"];

/** The current cookie session, including a nullable identity for signed-out visitors. */
export type Session = paths["/api/auth/session/"]["get"]["responses"][200]["content"]["application/json"];

/** A signed-in account identity; passwords and session credentials never belong here. */
export type AuthenticatedUser = NonNullable<Session["user"]>;

/** Credential fields accepted by Django's login endpoint, derived from its schema. */
export type LoginRequest = NonNullable<paths["/api/auth/login/"]["post"]["requestBody"]>["content"]["application/json"];

/** Allow transport injection for tests without exposing a cross-origin base URL. */
export interface ApiClientOptions {
  /** Defaults to the browser transport, which owns same-origin session cookies. */
  fetch?: typeof globalThis.fetch;
}

/** Let screens cancel reads when their owning component unmounts. */
export interface ReadOptions {
  /** An absent signal lets the request finish normally. */
  signal?: AbortSignal;
}

/** Preserve HTTP status and structured validation details without replaying writes. */
export class ApiError extends Error {
  /** The HTTP response code, or zero when a bootstrap payload is invalid. */
  readonly status: number;
  /** The backend's structured response, when one was available. */
  readonly details: unknown;

  /** Attach response context while keeping a readable default message. */
  constructor(status: number, details?: unknown) {
    // Do not expose internal response bodies as user-facing text.
    super(`The server rejected the request (${status}).`);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/** Extract successful typed responses and preserve structured API failures. */
function unwrapResponse<T>(responseEnvelope: { data?: T; error?: unknown; response: Response }): T {
  // A missing successful payload is a contract failure rather than valid data.
  if (!responseEnvelope.response.ok || responseEnvelope.data === undefined) {
    throw new ApiError(responseEnvelope.response.status, responseEnvelope.error);
  }
  return responseEnvelope.data;
}

/**
 * Create a same-origin client with shared CSRF and session bootstrap.
 * Unsafe writes are sent once. Login and logout invalidate the masked-token
 * cache automatically; resetCsrfToken supports additional custom auth flows.
 */
export function createApiClient(options: ApiClientOptions = {}) {
  // fetchImplementation owns transport, browserOrigin confines cookies/tokens,
  // and csrfBootstrap shares the in-flight or resolved masked-token request.
  const fetchImplementation = options.fetch ?? globalThis.fetch.bind(globalThis);
  const browserOrigin = globalThis.location?.origin ?? "http://localhost";
  let csrfBootstrap: Promise<string> | undefined;

  /** Share bootstrap so simultaneous reads/writes establish one Django session. */
  function getCsrfToken(): Promise<string> {
    // Keep the token only in memory; its matching HttpOnly cookie stays private.
    csrfBootstrap ??= (async () => {
      // A masked token in JSON also supports HttpOnly CSRF cookies.
      const bootstrapResponse = await fetchImplementation(new Request(`${browserOrigin}/api/csrf/`, {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        cache: "no-store",
      }));
      if (!bootstrapResponse.ok) {
        // A bootstrap failure must prevent any unsafe request from being sent.
        throw new ApiError(bootstrapResponse.status);
      }
      // bootstrapPayload stays unknown until its required masked-token field is checked.
      const bootstrapPayload: unknown = await bootstrapResponse.json();
      if (
        typeof bootstrapPayload !== "object"
        || bootstrapPayload === null
        || !("csrfToken" in bootstrapPayload)
        || typeof bootstrapPayload.csrfToken !== "string"
        || !bootstrapPayload.csrfToken
      ) {
        // Reject malformed bootstrap data before making a state-changing call.
        throw new ApiError(0, "The CSRF bootstrap response is invalid.");
      }
      return bootstrapPayload.csrfToken;
    })().catch((bootstrapError: unknown) => {
      // Permit a later user action to recover from a temporary network failure.
      csrfBootstrap = undefined;
      throw bootstrapError;
    });
    return csrfBootstrap;
  }

  // Generated path/body/response types constrain every endpoint at build time.
  const typedClient = createClient<paths>({
    baseUrl: browserOrigin,
    credentials: "same-origin",
    fetch: async (request: Request) => {
      // A caller must never send session credentials or tokens to another origin.
      const requestUrl = new URL(request.url);
      if (requestUrl.origin !== browserOrigin || !requestUrl.pathname.startsWith("/api/")) {
        throw new Error("The API client only supports same-origin /api/ requests.");
      }
      if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(request.method)) {
        // csrfToken is the masked token shared by all mutations in this session.
        const csrfToken = await getCsrfToken();
        // protectedHeaders preserves caller headers while replacing any supplied token.
        const protectedHeaders = new Headers(request.headers);
        protectedHeaders.set("X-CSRFToken", csrfToken);
        // mutationResponse is returned unchanged; a rejected write is never replayed.
        const mutationResponse = await fetchImplementation(new Request(request, { headers: protectedHeaders }));
        if (
          mutationResponse.status === 403
          || (mutationResponse.ok && ["/api/auth/login/", "/api/auth/logout/"].includes(requestUrl.pathname))
        ) {
          // Django changes authentication state and may rotate CSRF at these boundaries.
          // Invalidate direct typed calls too, without replaying any state-changing request.
          csrfBootstrap = undefined;
        }
        return mutationResponse;
      }
      // safeResponse can prove the browser's cookie session disappeared without a mutation.
      const safeResponse = await fetchImplementation(request);
      if ([401, 403].includes(safeResponse.status)) {
        // Cookie loss must not make the visitor's first subsequent login use a stale token.
        csrfBootstrap = undefined;
      }
      return safeResponse;
    },
  });

  return {
    /** Access every generated endpoint with the same automatic CSRF protection. */
    http: typedClient,
    /** Read the cookie session without creating an anonymous session or exposing credentials. */
    async getSession(readOptions: ReadOptions = {}): Promise<Session> {
      // checkedSession is authoritative even when cookie loss is reported as an anonymous 200.
      const checkedSession = unwrapResponse(await typedClient.GET("/api/auth/session/", { signal: readOptions.signal }));
      if (checkedSession.user === null) {
        // An anonymous identity cannot safely reuse the previous account's masked token cache.
        csrfBootstrap = undefined;
      }
      return checkedSession;
    },
    /** Authenticate once; the transport refreshes CSRF before the next protected mutation. */
    async login(credentials: LoginRequest): Promise<AuthenticatedUser> {
      // loginSession must contain an identity after accepted credentials; null is a contract failure.
      const loginSession = unwrapResponse(await typedClient.POST("/api/auth/login/", { body: credentials }));
      if (!loginSession.user) {
        // An unexpected signed-out success must not unlock a protected screen.
        throw new ApiError(0, "The login response did not contain a user.");
      }
      return loginSession.user;
    },
    /** End the cookie session once; callers clear protected UI only after confirmation. */
    async logout(): Promise<void> {
      // Reading the response distinguishes an accepted logout from a failed CSRF check.
      unwrapResponse(await typedClient.POST("/api/auth/logout/"));
    },
    /** Bootstrap before reading so list and create share the same session. */
    async listJobs(readOptions: ReadOptions = {}): Promise<Job[]> {
      await getCsrfToken();
      return unwrapResponse(await typedClient.GET("/api/jobs/", { signal: readOptions.signal }));
    },
    /** Submit one protected write; the worker owns the eventual result. */
    async createJob(jobRequest: CreateJobRequest): Promise<Job> {
      return unwrapResponse(await typedClient.POST("/api/jobs/", { body: jobRequest }));
    },
    /** Read one account-owned job with a typed numeric path parameter. */
    async getJob(jobId: number, readOptions: ReadOptions = {}): Promise<Job> {
      await getCsrfToken();
      return unwrapResponse(await typedClient.GET("/api/jobs/{id}/", { params: { path: { id: jobId } }, signal: readOptions.signal }));
    },
    /** Forget a token after an authentication operation rotates Django CSRF. */
    resetCsrfToken(): void {
      csrfBootstrap = undefined;
    },
  };
}

/** The package boundary supplied to screens, including generated and convenience methods. */
export type ApiClient = ReturnType<typeof createApiClient>;
