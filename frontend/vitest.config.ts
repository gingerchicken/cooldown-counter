import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Separate projects keep real-browser components out of the fast Node unit run.
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: "v8",
      // Include components as well as pure helpers so browser coverage is not hidden.
      include: ["src/**/*.{ts,tsx}", "packages/api-client/src/**/*.ts"],
      // Test-only data builders and generated declarations are not shipped application behavior.
      exclude: ["**/*.test.*", "**/testing.fixtures.ts", "**/schema.d.ts"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.{ts,tsx}", "packages/**/src/**/*.test.{ts,tsx}", "tooling/**/*.test.ts"],
          exclude: ["**/*.browser.test.*"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.tsx"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
