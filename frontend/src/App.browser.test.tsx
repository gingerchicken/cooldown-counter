import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ApiError } from "@template/api-client";
import type { Session } from "@template/api-client";
import { App } from "./App";

// apiMocks controls account and job boundaries; full-stack stories exercise real cookies and CSRF.
const apiMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  listJobs: vi.fn(),
  createJob: vi.fn(),
  resetCsrfToken: vi.fn(),
}));
vi.mock("@template/api-client", async (importOriginal) => {
  // Preserve the real ApiError class while replacing only the screen's shared client instance.
  const packageExports = await importOriginal<typeof import("@template/api-client")>();
  return { ...packageExports, createApiClient: () => apiMocks };
});

beforeEach(() => {
  // Start every screen with an accepted signed-out session rather than inherited account state.
  apiMocks.getSession.mockReset().mockResolvedValue({ user: null });
  apiMocks.login.mockReset().mockResolvedValue({ id: 7, username: "alice" });
  apiMocks.logout.mockReset().mockResolvedValue(undefined);
  apiMocks.listJobs.mockReset().mockResolvedValue([]);
  apiMocks.createJob.mockReset();
  apiMocks.resetCsrfToken.mockReset();
});

describe("authenticated application screen in Chromium", () => {
  // Session state gates every job read and protected component mount.
  it("waits for the cookie session before showing credentials or protected jobs", async () => {
    // A pending server read makes the initial uncertainty observable without timing guesses.
    apiMocks.getSession.mockReturnValue(new Promise(() => { /* Keep the initial check pending. */ }));
    // screen scopes this test's accessible queries to one application mount.
    const screen = await render(<App />);
    await expect.element(screen.getByRole("status")).toHaveTextContent("Checking your session...");
    await expect.element(screen.getByRole("textbox", { name: "Username" })).not.toBeInTheDocument();
    expect(apiMocks.listJobs).not.toHaveBeenCalled();
  });

  it("shows sign in by default and never reads jobs for an anonymous session", async () => {
    // screen waits for the public session check to settle as anonymous.
    const screen = await render(<App />);
    await expect.element(screen.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
    await expect.element(screen.getByRole("textbox", { name: "Message" })).not.toBeInTheDocument();
    expect(apiMocks.listJobs).not.toHaveBeenCalled();
  });

  it("restores an existing signed-in account without asking for its password", async () => {
    // A browser reload should restore its authenticated cookie rather than duplicate login.
    apiMocks.getSession.mockResolvedValue({ user: { id: 7, username: "alice" } });
    // screen represents a new page mount with a pre-existing authenticated session.
    const screen = await render(<App />);
    await expect.element(screen.getByRole("heading", { name: "Background jobs", exact: true })).toBeVisible();
    await expect.element(screen.getByText("alice", { exact: true })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Sign out" })).toBeVisible();
    expect(apiMocks.login).not.toHaveBeenCalled();
  });

  it("unlocks protected work only after login confirms the account", async () => {
    // screen starts with the default anonymous response and real form controls.
    const screen = await render(<App />);
    await screen.getByRole("textbox", { name: "Username" }).fill("alice");
    await screen.getByLabelText("Password").fill("exact password");
    await screen.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect.element(screen.getByRole("heading", { name: "Background jobs", exact: true })).toBeVisible();
    expect(apiMocks.login).toHaveBeenCalledWith({ username: "alice", password: "exact password" });
    await expect.element(screen.getByRole("textbox", { name: "Message" })).toBeVisible();
  });

  it("removes protected jobs after confirmed logout", async () => {
    // Give the account private content that must disappear with its screen state.
    apiMocks.getSession.mockResolvedValue({ user: { id: 7, username: "alice" } });
    apiMocks.listJobs.mockResolvedValue([{ id: 42, message: "private account work", result: "PRIVATE ACCOUNT WORK", status: "succeeded", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" }]);
    // screen owns the authenticated mount that logout must remove.
    const screen = await render(<App />);
    await expect.element(screen.getByRole("heading", { name: "private account work" })).toBeVisible();
    await screen.getByRole("button", { name: "Sign out" }).click();
    await expect.element(screen.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
    await expect.element(screen.getByText("PRIVATE ACCOUNT WORK", { exact: true })).not.toBeInTheDocument();
    expect(apiMocks.logout).toHaveBeenCalledOnce();
  });

  it("keeps the account visible and offers a retry when logout fails", async () => {
    // An unsuccessful request must not claim the server's cookie session was cleared.
    apiMocks.getSession.mockResolvedValue({ user: { id: 7, username: "alice" } });
    apiMocks.logout.mockRejectedValue(new Error("network unavailable"));
    // screen exposes the current account and its sign-out control.
    const screen = await render(<App />);
    await screen.getByRole("button", { name: "Sign out" }).click();
    await expect.element(screen.getByRole("alert")).toHaveTextContent("Sign out could not be confirmed. Please try again.");
    await expect.element(screen.getByRole("heading", { name: "Background jobs", exact: true })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
  });

  it("offers an explicit retry instead of treating a failed session check as signed out", async () => {
    // The first read fails; the deliberate retry receives the normal anonymous response.
    apiMocks.getSession.mockRejectedValueOnce(new Error("network unavailable"));
    // screen displays the distinction between uncertainty and an accepted anonymous session.
    const screen = await render(<App />);
    await expect.element(screen.getByRole("alert")).toHaveTextContent("Your sign-in status could not be checked. Please try again.");
    await expect.element(screen.getByRole("button", { name: "Sign in", exact: true })).not.toBeInTheDocument();
    await screen.getByRole("button", { name: "Try again" }).click();
    await expect.element(screen.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  it("returns to sign in when a protected read rejects an expired session", async () => {
    // A successful session read can become stale before the first protected API request.
    apiMocks.getSession.mockResolvedValue({ user: { id: 7, username: "alice" } });
    apiMocks.listJobs.mockRejectedValue(new ApiError(403));
    // screen must remove its account boundary rather than showing an endless polling error.
    const screen = await render(<App />);
    await expect.element(screen.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
    await expect.element(screen.getByRole("textbox", { name: "Message" })).not.toBeInTheDocument();
  });

  it("removes old account data while a sibling tab's cookie transition is rechecked", async () => {
    // Begin with account-owned content that must disappear before a replacement identity is known.
    apiMocks.getSession.mockResolvedValue({ user: { id: 7, username: "alice" } });
    apiMocks.listJobs.mockResolvedValue([{ id: 42, message: "alice private work", result: "ALICE PRIVATE WORK", status: "succeeded", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" }]);
    // screen represents an already-open tab with Alice's displayed identity and draft.
    const screen = await render(<App />);
    await expect.element(screen.getByRole("heading", { name: "alice private work" })).toBeVisible();
    // acceptSessionCheck releases the authoritative new identity after the old screen is removed.
    let acceptSessionCheck: ((session: Session) => void) | undefined;
    apiMocks.getSession.mockReturnValueOnce(new Promise<Session>((resolve) => {
      // Hold the new session so the intermediate protected-content removal can be asserted.
      acceptSessionCheck = resolve;
    }));
    // siblingChannel sends the same credential-free message as another browser tab.
    const siblingChannel = new BroadcastChannel("template-auth-session");
    try {
      // A broadcast invalidates local identity; it must never supply a trusted replacement user.
      siblingChannel.postMessage("session-changed");
      await expect.element(screen.getByRole("status")).toHaveTextContent("Checking your session...");
      await expect.element(screen.getByRole("heading", { name: "alice private work" })).not.toBeInTheDocument();
      await expect.element(screen.getByRole("textbox", { name: "Message" })).not.toBeInTheDocument();
      expect(apiMocks.resetCsrfToken).toHaveBeenCalledOnce();
      apiMocks.listJobs.mockResolvedValue([]);
      acceptSessionCheck?.({ user: { id: 8, username: "bob" } });
      await expect.element(screen.getByText("bob", { exact: true })).toBeVisible();
      await expect.element(screen.getByText("alice", { exact: true })).not.toBeInTheDocument();
    } finally {
      // Each test owns this extra sender and must not leave it listening in later scenarios.
      siblingChannel.close();
    }
  });

  it("broadcasts a credential-free login change without receiving its own notification", async () => {
    // siblingChannel observes another tab's view of the notification protocol.
    const siblingChannel = new BroadcastChannel("template-auth-session");
    // receivedMessage resolves with the raw payload so secrets and identity are excluded by assertion.
    const receivedMessage = new Promise<unknown>((resolve) => {
      // The sender is separate from App's channel, matching the browser's cross-tab semantics.
      siblingChannel.addEventListener("message", (event: MessageEvent<unknown>) => { resolve(event.data); }, { once: true });
    });
    try {
      // screen performs the same username/password action as an ordinary visitor.
      const screen = await render(<App />);
      await screen.getByRole("textbox", { name: "Username" }).fill("alice");
      await screen.getByLabelText("Password").fill("password");
      await screen.getByRole("button", { name: "Sign in", exact: true }).click();
      expect(await receivedMessage).toBe("session-changed");
      await expect.element(screen.getByText("alice", { exact: true })).toBeVisible();
      expect(apiMocks.getSession).toHaveBeenCalledOnce();
    } finally {
      // Closing this test receiver avoids cross-talk with following browser scenarios.
      siblingChannel.close();
    }
  });
});
