import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ApiError } from "@template/api-client";
import type { Job } from "@template/api-client";
import { JobsScreen } from "./JobsScreen";

/** Give each screen an isolated package boundary without a second account-state store. */
function createScreenClient() {
  // Separate methods let cases control read, write, and session verification independently.
  return {
    listJobs: vi.fn().mockResolvedValue([]),
    createJob: vi.fn(),
    getSession: vi.fn().mockResolvedValue({ user: { id: 7, username: "alice" } }),
  };
}

describe("protected jobs screen in Chromium", () => {
  // Preserve the original job loading, failure, and accepted-write coverage behind the auth gate.
  it("shows loading while the initial account read is pending", async () => {
    // client keeps the read pending without scheduling fake network delays.
    const client = createScreenClient();
    client.listJobs.mockReturnValue(new Promise<Job[]>(() => { /* Hold the first job response. */ }));
    // sessionExpired records account-boundary changes without changing this screen's props.
    const sessionExpired = vi.fn();
    // screen exposes this mounted component's accessible state.
    const screen = await render(<JobsScreen client={client} onSessionExpired={sessionExpired} />);
    await expect.element(screen.getByRole("status")).toHaveTextContent("Loading jobs...");
  });

  it("shows operational read failures without claiming the account history is empty", async () => {
    // client simulates a temporary service failure that does not prove session expiry.
    const client = createScreenClient();
    client.listJobs.mockRejectedValue(new Error("network unavailable"));
    // sessionExpired must remain untouched on failures unrelated to authentication.
    const sessionExpired = vi.fn();
    // screen owns the distinction between a failed read and an accepted empty list.
    const screen = await render(<JobsScreen client={client} onSessionExpired={sessionExpired} />);
    await expect.element(screen.getByRole("alert")).toHaveTextContent("Jobs could not be loaded. We will try again shortly.");
    await expect.element(screen.getByText("No jobs yet. Create your first one above.")).not.toBeInTheDocument();
    expect(sessionExpired).not.toHaveBeenCalled();
  });

  it("shows accepted work immediately while later polling follows worker state", async () => {
    // createdJob follows the generated response contract and remains visible after polling.
    const createdJob: Job = { id: 42, message: "new work", status: "pending", result: "", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };
    // client reconciles its future reads with the accepted server row.
    const client = createScreenClient();
    client.createJob.mockImplementation(async () => {
      // The real backend exposes the accepted job to following account-scoped reads.
      client.listJobs.mockResolvedValue([createdJob]);
      return createdJob;
    });
    // sessionExpired is stable across the screen's local state updates.
    const sessionExpired = vi.fn();
    // screen drives the actual form while using the package stub at its boundary.
    const screen = await render(<JobsScreen client={client} onSessionExpired={sessionExpired} />);
    await expect.element(screen.getByText("No jobs yet. Create your first one above.")).toBeVisible();
    await screen.getByRole("textbox", { name: "Message" }).fill("new work");
    await screen.getByRole("button", { name: "Create job" }).click();
    await expect.element(screen.getByRole("heading", { name: "new work" })).toBeVisible();
    expect(client.createJob).toHaveBeenCalledWith({ message: "new work" });
  });

  it("keeps the user signed in after a forbidden write when the session is still valid", async () => {
    // client represents a rejected CSRF mutation followed by an accepted identity read.
    const client = createScreenClient();
    client.createJob.mockRejectedValue(new ApiError(403));
    // sessionExpired must not clear a valid account merely because one write failed CSRF.
    const sessionExpired = vi.fn();
    // screen displays the write error using JobForm's existing retry behaviour.
    const screen = await render(<JobsScreen client={client} onSessionExpired={sessionExpired} />);
    await screen.getByRole("textbox", { name: "Message" }).fill("retry later");
    await screen.getByRole("button", { name: "Create job" }).click();
    await expect.element(screen.getByRole("alert")).toHaveTextContent("The server rejected the request (403).");
    expect(client.getSession).toHaveBeenCalledOnce();
    expect(sessionExpired).not.toHaveBeenCalled();
  });
});
