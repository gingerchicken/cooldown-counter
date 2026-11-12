import { describe, expect, it, vi } from "vitest";
import { proxyApi } from "./api-proxy";

describe("Pages API proxy", () => {
  it("preserves cookies, CSRF, body, query, and separate response cookies", async () => {
    // The upstream records exactly what a browser mutation forwards through Pages.
    const upstream = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}", {
      status: 201,
      headers: [
        ["Set-Cookie", "csrftoken=abc; Path=/; SameSite=Lax"],
        ["Set-Cookie", "sessionid=xyz; Path=/; HttpOnly; SameSite=Lax"],
      ],
    }));
    // Spoofed proxy headers must be replaced without changing the browser Origin.
    const browserRequest = new Request("https://app.example.com/api/jobs/?page=2", {
      method: "POST",
      headers: {
        Origin: "https://app.example.com",
        Cookie: "csrftoken=abc; sessionid=xyz",
        "X-CSRFToken": "masked-token",
        "Content-Type": "application/json",
        "X-Forwarded-Host": "attacker.invalid",
        "X-Forwarded-Proto": "http",
        Forwarded: "host=attacker.invalid",
      },
      body: JSON.stringify({ message: "hello" }),
    });
    // Injecting fetch keeps this transport test independent of a live backend.
    const response = await proxyApi(browserRequest, { BACKEND_ORIGIN: "https://backend.example.com" }, upstream);
    // The fixed upstream origin retains the API path without losing query parameters.
    const forwardedRequest = upstream.mock.calls[0]?.[0] as Request;
    expect(forwardedRequest.url).toBe("https://backend.example.com/api/jobs/?page=2");
    expect(forwardedRequest.headers.get("Origin")).toBe("https://app.example.com");
    expect(forwardedRequest.headers.get("Cookie")).toContain("sessionid=xyz");
    expect(forwardedRequest.headers.get("X-CSRFToken")).toBe("masked-token");
    expect(forwardedRequest.headers.get("X-Forwarded-Host")).toBe("app.example.com");
    expect(forwardedRequest.headers.get("X-Forwarded-Proto")).toBe("https");
    expect(forwardedRequest.headers.has("Forwarded")).toBe(false);
    expect(forwardedRequest.redirect).toBe("manual");
    expect(await forwardedRequest.json()).toEqual({ message: "hello" });
    expect(response.status).toBe(201);
    expect(response.headers.getSetCookie()).toHaveLength(2);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it.each([
    "not-a-url", "http://backend.example.com", "https://user:pass@backend.example.com",
    "https://backend.example.com/prefix", "https://backend.example.com?query=1",
    "https://backend.example.com#fragment", "https://api.example.invalid", "file:///etc/passwd",
  ])("fails closed for invalid backend binding %s", async (backendOrigin) => {
    // No malformed configuration may cause an outbound request.
    const upstream = vi.fn<typeof fetch>();
    // Each rejected origin returns a stable service-unavailable response.
    const response = await proxyApi(new Request("https://app.example.com/api/jobs/"), {
      BACKEND_ORIGIN: backendOrigin,
    }, upstream);
    expect(response.status).toBe(503);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("allows HTTP only with the explicit local development binding", async () => {
    // Docker networking has no TLS; this exception must be explicit in Compose.
    const upstream = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}"));
    // Production defaults never set this escape hatch.
    const response = await proxyApi(new Request("http://localhost:8788/api/health/"), {
      BACKEND_ORIGIN: "http://backend:8000", ALLOW_INSECURE_BACKEND: "true",
    }, upstream);
    expect(response.status).toBe(200);
    expect(upstream).toHaveBeenCalledOnce();
  });

  it("maps upstream network failures to a non-sensitive gateway error", async () => {
    // Backend exception text must not leak an internal hostname to the browser.
    const upstream = vi.fn<typeof fetch>().mockRejectedValue(new Error("private-host.internal"));
    // The client receives a stable error suitable for its retry UI.
    const response = await proxyApi(new Request("https://app.example.com/api/jobs/"), {
      BACKEND_ORIGIN: "https://backend.example.com",
    }, upstream);
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("private-host");
  });

  it("rewrites internal redirects and rejects external redirects", async () => {
    // Django slash redirects remain on the public Pages origin.
    const upstream = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, {
      status: 301, headers: { Location: "https://backend.example.com/api/jobs/" },
    }));
    // The fixed backend never receives a second request from the proxy.
    const response = await proxyApi(new Request("https://app.example.com/api/jobs"), {
      BACKEND_ORIGIN: "https://backend.example.com",
    }, upstream);
    expect(response.headers.get("Location")).toBe("https://app.example.com/api/jobs/");
    upstream.mockResolvedValue(new Response(null, {
      status: 302, headers: { Location: "https://attacker.invalid/" },
    }));
    expect((await proxyApi(new Request("https://app.example.com/api/jobs/"), {
      BACKEND_ORIGIN: "https://backend.example.com",
    }, upstream)).status).toBe(502);
  });

  it("does not proxy a route outside the API boundary", async () => {
    // Accidental handler reuse must not expose arbitrary backend paths.
    const upstream = vi.fn<typeof fetch>();
    // /apiary is a static route rather than an API prefix.
    const response = await proxyApi(new Request("https://app.example.com/apiary"), {
      BACKEND_ORIGIN: "https://backend.example.com",
    }, upstream);
    expect(response.status).toBe(404);
    expect(upstream).not.toHaveBeenCalled();
  });
});
