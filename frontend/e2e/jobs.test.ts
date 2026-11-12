import { expect, signInRequest, test } from "./fixtures";

test("a signed-in user creates a job, sees real worker output and retains it after reload", async ({ signedInPage: page }) => {
  // A unique message identifies this job even when the account has earlier test history.
  const message = `hello worker ${crypto.randomUUID()}`;
  await page.getByRole("textbox", { name: "Message" }).fill(message);
  await page.getByRole("button", { name: "Create job" }).click();
  // The card boundary keeps status assertions specific to the newly submitted work.
  const jobCard = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: message, exact: true }) });
  await expect(jobCard.getByText(message.toUpperCase(), { exact: true })).toBeVisible();
  await expect(jobCard.getByText("succeeded", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(message.toUpperCase(), { exact: true })).toBeVisible();
});

test("a signed-in user gets useful validation for blank and oversized drafts", async ({ signedInPage: page }) => {
  // Browser and backend validation remain separate; this checks the actual form UX.
  await page.getByRole("textbox", { name: "Message" }).fill("   ");
  await page.getByRole("button", { name: "Create job" }).click();
  await expect(page.getByRole("alert")).toHaveText("Enter a message.");
  await page.getByRole("textbox", { name: "Message" }).fill("a".repeat(201));
  await page.getByRole("button", { name: "Create job" }).click();
  await expect(page.getByRole("alert")).toHaveText("Use 200 characters or fewer.");
});

test("a forged authenticated write without a CSRF header is rejected through Pages", async ({ request, account }) => {
  // A valid session distinguishes CSRF enforcement from the unauthenticated permission check.
  await signInRequest(request, account);
  // initialJobs records this account's history before the rejected mutation.
  const initialJobs = await (await request.get("/api/jobs/")).json();
  // rejectedResponse contains cookies but intentionally omits the CSRF header.
  const rejectedResponse = await request.post("/api/jobs/", { data: { message: "forged job" } });
  expect(rejectedResponse.status()).toBe(403);
  expect(await (await request.get("/api/jobs/")).json()).toEqual(initialJobs);
});

test("the backend rejects invalid data when an authenticated caller bypasses form validation", async ({ request, account }) => {
  // Login rotates CSRF, so direct callers must bootstrap again just as the SDK does.
  await signInRequest(request, account);
  // bootstrapPayload contains the fresh masked token matching the post-login cookie.
  const bootstrapPayload = await (await request.get("/api/csrf/")).json() as { csrfToken: string };
  // invalidResponse proves serializer validation still runs after authentication and CSRF pass.
  const invalidResponse = await request.post("/api/jobs/", {
    data: { message: "   " },
    headers: { "X-CSRFToken": bootstrapPayload.csrfToken },
  });
  expect(invalidResponse.status()).toBe(400);
  expect(await invalidResponse.json()).toHaveProperty("message");
});

test("one account cannot list or retrieve another user's jobs", async ({ signedInPage: page, browser, baseURL, otherAccount }) => {
  // message identifies the primary owner's job independently of prior test history.
  const message = `private account ${crypto.randomUUID()}`;
  await page.getByRole("textbox", { name: "Message" }).fill(message);
  await page.getByRole("button", { name: "Create job" }).click();
  await expect(page.getByText(message.toUpperCase(), { exact: true })).toBeVisible();
  // ownedJobs exposes the known ID only inside the rightful user's cookie jar.
  const ownedJobs = await (await page.request.get("/api/jobs/")).json() as { id: number; message: string }[];
  // ownedJob is selected by its unique input, never by an assumption about list order.
  const ownedJob = ownedJobs.find((job) => {
    // Concurrent stories can share an account's persisted history without sharing this message.
    return job.message === message;
  });
  expect(ownedJob).toBeDefined();
  // otherVisitor has separate cookies and authenticates as a genuinely different account.
  const otherVisitor = await browser.newContext({ baseURL });
  try {
    // The second user has no submitted jobs, even though a primary job ID is known.
    await signInRequest(otherVisitor.request, otherAccount);
    expect(await (await otherVisitor.request.get("/api/jobs/")).json()).toEqual([]);
    // A foreign ID has the same response as an ID that does not exist.
    const hiddenJobResponse = await otherVisitor.request.get(`/api/jobs/${ownedJob?.id}/`);
    expect(hiddenJobResponse.status()).toBe(404);
  } finally {
    // Explicitly release this extra browser context even when an assertion fails.
    await otherVisitor.close();
  }
});

test("Beat dispatches a periodic task that a real worker persists", async ({ request }) => {
  // Public infrastructure probes must keep working before any user signs in.
  const testStartedAtMs = Date.now();
  await expect.poll(async () => {
    // This timestamp changes only after Beat enqueues and Celery executes the task.
    const heartbeatResponse = await request.get("/api/heartbeat/");
    expect(heartbeatResponse.ok()).toBe(true);
    // heartbeat remains nullable until the first scheduled execution completes.
    const heartbeat = await heartbeatResponse.json() as { last_run_at: string | null };
    return heartbeat.last_run_at !== null && Date.parse(heartbeat.last_run_at) >= testStartedAtMs;
  }, { timeout: 30_000, intervals: [500, 1_000, 2_000] }).toBe(true);
});
