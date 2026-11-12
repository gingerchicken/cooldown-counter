import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Resolve command to distinguish live source development from production package validation.
export default defineConfig(({ command }) => {
  // Development consumes SDK source so edits do not wait for a separate tsc package build.
  // Production deliberately resolves the compiled workspace package tested by CI.
  const apiClientSourcePath = fileURLToPath(new URL("./packages/api-client/src/index.ts", import.meta.url));

  return {
    plugins: [react()],
    resolve: {
      alias: command === "serve" ? [{ find: "@template/api-client", replacement: apiClientSourcePath }] : [],
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      watch: {
        // Docker Desktop may not forward host filesystem events, so polling is the default.
        usePolling: process.env.DEV_WATCH_POLLING !== "false",
        interval: 500,
        // Tool output must not cause reload loops or unnecessary filesystem scans.
        ignored: ["**/.wrangler/**", "**/test-results/**", "**/playwright-report/**", "**/dist/**"],
      },
      proxy: {
        "/api": {
          // Keep local requests on the real Pages Function and preserve browser CSRF origins.
          target: process.env.API_PROXY_ORIGIN ?? "http://localhost:8788",
          changeOrigin: false,
        },
      },
    },
  };
});
