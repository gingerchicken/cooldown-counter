/** Server-only bindings. The browser never receives the backend origin. */
export interface ProxyEnvironment {
  /** Absolute HTTP(S) origin with no credentials, path, query, or fragment. */
  BACKEND_ORIGIN: string;
  /** Only local Docker development may opt into an unencrypted upstream. */
  ALLOW_INSECURE_BACKEND?: string;
}

/** The Pages context fields this proxy needs; no runtime-specific globals are required. */
interface ProxyContext {
  /** Browser request, including its original Origin and same-origin cookies. */
  request: Request;
  /** Bindings supplied by Wrangler or the Pages deployment. */
  env: ProxyEnvironment;
}

/** Return an uncached API error without exposing backend addresses or exception details. */
function proxyError(status: number, message: string): Response {
  // Error responses share the same no-cache policy as session-specific API responses.
  return Response.json(
    { detail: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Forward API requests to one configured origin without following upstream redirects.
 * Preserve Origin, cookies, body, query, and CSRF headers. Replace forwarding headers
 * rather than trusting browser values. The origin must only trust this proxy boundary.
 */
export async function proxyApi(
  request: Request,
  env: ProxyEnvironment,
  fetchUpstream: typeof fetch = fetch,
): Promise<Response> {
  // Parse the fixed backend independently so a browser path cannot select another host.
  let backendOrigin: URL;
  try {
    // Binding validation also rejects URL credentials and accidental path prefixes.
    backendOrigin = new URL(env.BACKEND_ORIGIN);
  } catch {
    // Configuration errors fail closed instead of falling back to the incoming origin.
    return proxyError(503, "The API backend is not configured.");
  }

  // HTTP is an explicit local-only escape hatch; production must encrypt the origin hop.
  if (
    !["https:", "http:"].includes(backendOrigin.protocol) ||
    (backendOrigin.protocol === "http:" && env.ALLOW_INSECURE_BACKEND !== "true") ||
    backendOrigin.username || backendOrigin.password ||
    backendOrigin.pathname !== "/" || backendOrigin.search || backendOrigin.hash ||
    backendOrigin.hostname.endsWith(".invalid")
  ) {
    // Invalid or placeholder deployment values must not produce an upstream request.
    return proxyError(503, "The API backend is not configured.");
  }

  // The public origin determines Django's host and HTTPS checks, never the upstream URL.
  const publicUrl = new URL(request.url);
  if (publicUrl.pathname !== "/api" && !publicUrl.pathname.startsWith("/api/")) {
    // Prevent accidental reuse of this handler as an unrestricted site proxy.
    return proxyError(404, "API route not found.");
  }

  // Assign path fields after constructing the origin so leading slashes cannot change hosts.
  const upstreamUrl = new URL(backendOrigin.origin);
  upstreamUrl.pathname = publicUrl.pathname;
  upstreamUrl.search = publicUrl.search;

  // Copy browser headers so CSRF and session cookies survive the same-origin boundary.
  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.delete("host");
  upstreamHeaders.delete("forwarded");
  upstreamHeaders.delete("x-forwarded-for");
  upstreamHeaders.delete("x-forwarded-port");
  upstreamHeaders.set("x-forwarded-host", publicUrl.host);
  upstreamHeaders.set("x-forwarded-proto", publicUrl.protocol.slice(0, -1));

  try {
    // A redirect must not forward cookies or credentials to an upstream-selected origin.
    const upstreamRequest = new Request(upstreamUrl, new Request(request, {
      headers: upstreamHeaders,
      redirect: "manual",
    }));
    // Streaming keeps uploads and responses bounded by platform limits rather than buffering.
    const upstreamResponse = await fetchUpstream(upstreamRequest);
    // Copying Headers preserves separate Set-Cookie fields in the Workers runtime.
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set("Cache-Control", "no-store");

    // Backend redirects may contain an internal URL. Rewrite same-origin redirects only.
    const redirectLocation = responseHeaders.get("Location");
    if (redirectLocation) {
      // Resolve relative redirects against the upstream while keeping the browser on Pages.
      const redirectUrl = new URL(redirectLocation, upstreamUrl);
      if (redirectUrl.origin !== backendOrigin.origin) {
        // External redirects are outside this API contract and must not leak credentials.
        return proxyError(502, "The API backend returned an unsupported redirect.");
      }
      redirectUrl.protocol = publicUrl.protocol;
      redirectUrl.host = publicUrl.host;
      responseHeaders.set("Location", redirectUrl.toString());
    }

    // Preserve upstream status and cookie headers while disallowing shared API caching.
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    // Network failures are reported as a gateway error without serialising internal details.
    return proxyError(502, "The API backend is unavailable.");
  }
}

/** Pages file routing supplies the original browser request and deployment bindings. */
export async function onRequest({ request, env }: ProxyContext): Promise<Response> {
  // Keep the handler thin so unit tests can inject a fetch implementation into the proxy.
  return proxyApi(request, env);
}
