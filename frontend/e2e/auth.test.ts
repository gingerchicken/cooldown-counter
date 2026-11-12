import { expect, signInRequest, signInThroughForm, test } from "./fixtures";

test("the default screen requires login and the API rejects anonymous job access", async ({ page, request }) => {
  // A new cookie jar must never show protected content before session verification finishes.
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Username", exact: true })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "password");
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveCount(0);
  expect((await request.get("/api/jobs/")).status()).toBe(403);
  expect((await request.get("/api/auth/session/")).status()).toBe(200);
  expect(await (await request.get("/api/auth/session/")).json()).toEqual({ user: null });
});

test("invalid credentials show a generic error and do not start an authenticated session", async ({ page, account }) => {
  // An existing username with a wrong password must reveal no account-specific details.
  await page.goto("/");
  await page.getByRole("textbox", { name: "Username", exact: true }).fill(account.username);
  await page.getByLabel("Password", { exact: true }).fill(`${account.password}-incorrect`);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Invalid username or password.");
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  expect(await (await page.request.get("/api/auth/session/")).json()).toEqual({ user: null });
});

test("sign-out clears protected content and a later sign-in retains account history", async ({ signedInPage: page, account }) => {
  // Unique work proves account ownership survives Django's login/logout session rotation.
  const message = `returning user ${crypto.randomUUID()}`;
  await page.getByRole("textbox", { name: "Message" }).fill(message);
  await page.getByRole("button", { name: "Create job" }).click();
  await expect(page.getByText(message.toUpperCase(), { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveCount(0);
  await expect(page.getByText(message.toUpperCase(), { exact: true })).toHaveCount(0);
  expect((await page.request.get("/api/jobs/")).status()).toBe(403);

  // Re-enter with the keyboard to verify both form submission and refreshed post-logout CSRF.
  await page.getByRole("textbox", { name: "Username", exact: true }).fill(account.username);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(page.getByText(message.toUpperCase(), { exact: true })).toBeVisible();

  // A mutation after the second login must use the newly rotated CSRF cookie/token pair.
  const secondMessage = `fresh token ${crypto.randomUUID()}`;
  await page.getByRole("textbox", { name: "Message" }).fill(secondMessage);
  await page.getByRole("button", { name: "Create job" }).click();
  await expect(page.getByText(secondMessage.toUpperCase(), { exact: true })).toBeVisible();
});

test("a lost browser session permits sign-in on the first new attempt", async ({ signedInPage: page, account }) => {
  // Clearing cookies simulates an expired session before the next real polling request.
  await page.context().clearCookies();
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Background jobs", exact: true })).toHaveCount(0);

  // A rejected protected read must invalidate cached CSRF before the next credential submission.
  await page.getByRole("textbox", { name: "Username", exact: true }).fill(account.username);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Background jobs", exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("tabs sharing cookies reconcile account switches before showing protected content", async ({ signedInPage: page, account, otherAccount }) => {
  // This tab starts as the primary account, with a second tab sharing the same cookie jar.
  const otherTab = await page.context().newPage();
  try {
    // The second tab restores the first user's authenticated server session.
    await otherTab.goto("/");
    await expect(otherTab.getByRole("heading", { name: "Background jobs", exact: true })).toBeVisible();
    await otherTab.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(otherTab.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();

    // Signing into another account must update the first tab's identity rather than only its jobs.
    await otherTab.getByRole("textbox", { name: "Username", exact: true }).fill(otherAccount.username);
    await otherTab.getByLabel("Password", { exact: true }).fill(otherAccount.password);
    await otherTab.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(otherTab.getByRole("heading", { name: "Background jobs", exact: true })).toBeVisible();
    await expect(page.getByText(`Signed in as ${otherAccount.username}`, { exact: true })).toBeVisible();
    await expect(page.getByText(`Signed in as ${account.username}`, { exact: true })).toHaveCount(0);
  } finally {
    // Closing this extra tab must not retain another listener in later stories.
    await otherTab.close();
  }
});

test("login and logout both reject tokenless writes through Pages", async ({ request, account }) => {
  // Login needs CSRF before authentication; a cookie alone must never be sufficient.
  await request.get("/api/csrf/");
  expect((await request.post("/api/auth/login/", { data: account })).status()).toBe(403);
  expect(await (await request.get("/api/auth/session/")).json()).toEqual({ user: null });
  await signInRequest(request, account);

  // Rejected logout must leave the legitimate authenticated session intact.
  expect((await request.post("/api/auth/logout/")).status()).toBe(403);
  expect((await (await request.get("/api/auth/session/")).json()).user.username).toBe(account.username);

  // A fresh masked token permits logout and removes server-side authentication state.
  const bootstrapPayload = await (await request.get("/api/csrf/")).json() as { csrfToken: string };
  expect((await request.post("/api/auth/logout/", { headers: { "X-CSRFToken": bootstrapPayload.csrfToken } })).status()).toBe(200);
  expect(await (await request.get("/api/auth/session/")).json()).toEqual({ user: null });
});

test("an authenticated session is restored when the application reloads", async ({ page, account }) => {
  // Restoration reads the Django session, never a password or token saved by the browser app.
  await signInThroughForm(page, account);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Background jobs", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
  expect((await (await page.request.get("/api/auth/session/")).json()).user.username).toBe(account.username);
});
