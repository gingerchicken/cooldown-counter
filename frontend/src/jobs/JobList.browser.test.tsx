import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import type { Job } from "@template/api-client";
import { JobList } from "./JobList";

describe("job list in Chromium", () => {
  // Inspect the accessible list and every persisted worker state in a real DOM.
  it("explains an empty session", async () => {
    // Empty successful responses must not appear as a forever-loading screen.
    // screen scopes accessible assertions to this rendered job list.
    const screen = await render(<JobList jobs={[]} />);
    await expect.element(screen.getByText("No jobs yet. Create your first one above.")).toBeVisible();
  });

  it("shows worker progress, durable results and failures", async () => {
    // Cover each persisted state with values satisfying the generated API type.
    // baseJob supplies the shared persisted fields for the three status fixtures.
    const baseJob = { id: 1, message: "pending message", result: "", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };
    // jobs contains one pending, one successful and one failed server response.
    const jobs: Job[] = [
      { ...baseJob, status: "pending" },
      { ...baseJob, id: 2, message: "completed message", status: "succeeded", result: "COMPLETED MESSAGE" },
      { ...baseJob, id: 3, message: "failed message", status: "failed" },
    ];
    // screen scopes accessible assertions to this rendered job list.
    const screen = await render(<JobList jobs={jobs} />);
    await expect.element(screen.getByRole("list", { name: "Your jobs" })).toBeVisible();
    await expect.element(screen.getByText("Waiting for the worker...")).toBeVisible();
    await expect.element(screen.getByText("COMPLETED MESSAGE", { exact: true })).toBeVisible();
    await expect.element(screen.getByText("This job failed. Create a new job to try again.")).toBeVisible();
  });
});
