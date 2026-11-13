import { defineConfig, devices } from "@playwright/test";

// E2E uses an already-running Docker stack, so tests cannot hide a host server.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.test.ts",
  // Keep trace cleanup inside its own subtree so unit/component JSON evidence survives a full run.
  outputDir: "test-results/e2e-artifacts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 15_000 },
  // JSON preserves executable acceptance tags and per-browser outcomes for the evidence report.
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["junit", { outputFile: "test-results/e2e.xml" }],
    ["json", { outputFile: "test-results/e2e.json" }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "http://web:8788",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
