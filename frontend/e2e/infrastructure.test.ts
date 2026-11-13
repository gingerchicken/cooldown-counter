import { randomUUID } from "node:crypto";
import { expect, signInRequest, test } from "./fixtures";
import { csrfRequest } from "./support";

test("[INFRA-001] the retained worker executes real queued infrastructure work", async ({ request, account }) => {
  // The demo job UI is gone; the retained worker boundary is checked through actual protected APIs.
  await signInRequest(request, account);
  const message = `worker acceptance ${randomUUID()}`;
  // The accepted enqueue response provides the persisted job identity used by real worker polling.
  const created = await csrfRequest(request, "/api/jobs/", "POST", { message });
  expect(created.status()).toBe(201);
  // The persisted job identity permits polling the actual worker result for this request only.
  const job = await created.json() as { id: number };
  await expect.poll(async () => {
    // Only a real broker delivery and worker execution can produce this persisted result.
    const response = await request.get(`/api/jobs/${job.id}/`);
    return (await response.json()).result;
  }).toBe(message.toUpperCase());
});

test("[INFRA-002] Beat dispatches a heartbeat that the real worker persists", async ({ request }) => {
  // A timestamp newer than this test proves scheduler delivery rather than an old seeded row.
  const startedAtMs = Date.now();
  await expect.poll(async () => {
    const response = await request.get("/api/heartbeat/");
    expect(response.ok()).toBe(true);
    // The scheduler timestamp must come from an actual worker persistence update.
    const heartbeat = await response.json() as { last_run_at: string | null };
    return heartbeat.last_run_at !== null && Date.parse(heartbeat.last_run_at) >= startedAtMs;
  }, { timeout: 30_000, intervals: [500, 1_000, 2_000] }).toBe(true);
});
