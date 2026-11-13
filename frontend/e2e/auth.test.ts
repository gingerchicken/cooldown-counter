import { expect, signInRequest, signInThroughForm, test } from "./fixtures";
import { csrfRequest, fillReport, previewDialog, recordCooldown, selectFleet } from "./support";

test("[AUTH-001] [US-001] [US-005] signed-out visitors cannot read tracker records", async ({ page, request }) => {
  // The UI and authoritative API independently reject a new anonymous cookie jar.
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByText(/fleet operators/i)).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Report observation", exact: true })).toHaveCount(0);
  expect((await request.get("/api/fleets/")).status()).toBe(403);
  expect(await (await request.get("/api/auth/session/")).json()).toEqual({ user: null });
});

test("[AUTH-002] [US-002] missing credential fields receive distinct correctable feedback", async ({ page, account }) => {
  // No missing-field attempt needs a credential request or an invented login result.
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Enter a username and password.");
  await page.getByLabel("Username", { exact: true }).fill(account.username);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Enter a password.");
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByLabel("Username", { exact: true }).fill("   ");
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Enter a username.");
  await expect(page.getByLabel("Username", { exact: true })).toBeFocused();
  // Enter on the username input complements the password-input submission regression below.
  await page.getByLabel("Username", { exact: true }).fill(account.username);
  await page.getByLabel("Username", { exact: true }).press("Enter");
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
});

test("[AUTH-003] [US-001] rejected credentials do not authenticate or disclose account existence", async ({ page, account }) => {
  // The same safe error applies to an existing identity with a deliberately wrong password.
  await page.goto("/");
  await page.getByLabel("Username", { exact: true }).fill(account.username);
  await page.getByLabel("Password", { exact: true }).fill(`${account.password}-incorrect`);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Invalid username or password.");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  expect(await (await page.request.get("/api/auth/session/")).json()).toEqual({ user: null });
});

test("[AUTH-004] [US-003] an accepted Django session restores after reload without stored credentials", async ({ signedInPage: page, account }) => {
  // Inspect normal preference storage before simulating a browser that denies all optional storage access.
  const storedPreferences = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(storedPreferences).not.toContain(account.password);
  await page.addInitScript(() => {
    // Authentication must rely on server cookies when either preference-storage getter is denied.
    for (const storageName of ["localStorage", "sessionStorage"]) {
      Object.defineProperty(window, storageName, { get() { throw new DOMException("Storage disabled", "SecurityError"); } });
    }
    // Denial of optional cross-tab messaging must not prevent authoritative cookie-session restoration.
    Object.defineProperty(window, "BroadcastChannel", { value: class { constructor() { throw new DOMException("Channel disabled", "SecurityError"); } } });
  });
  // Reload must rely on the actual HttpOnly session, never a browser authentication flag.
  await page.reload();
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
  expect((await (await page.request.get("/api/auth/session/")).json()).user.username).toBe(account.username);
  // Actual browser cookies reveal whether the restored Django session remains HttpOnly.
  const cookies = await page.context().cookies();
  expect(cookies.find((cookie) => cookie.name === "sessionid")?.httpOnly).toBe(true);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  // Navigation must wait for authoritative logout completion instead of aborting its pending request.
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  await signInThroughForm(page, account);
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
});

test("[AUTH-005] [US-004] [US-051] logout hides evidence and keyboard login permits a fresh protected write", async ({ fleetPage: page, trackedFleet, account }) => {
  // Persisted evidence belongs to the fleet and survives the server session's invalidation.
  const offence = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, offence.id);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByLabel("Username", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText(trackedFleet.account.tag, { exact: true })).toHaveCount(0);
  expect((await page.request.get(`/api/fleets/${trackedFleet.fleet.id}/accounts/`)).status()).toBe(403);
  await page.getByLabel("Username", { exact: true }).fill(account.username);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
  await selectFleet(page, trackedFleet.fleet.id);
  // A second UI mutation proves the SDK has discarded the pre-logout masked CSRF token.
  const report = await fillReport(page, trackedFleet.account.id, offence.id);
  await previewDialog(page, report);
  await report.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(report).not.toBeVisible();
  // The authoritative account response verifies persisted history independently of navigation state.
  const detail = await (await page.request.get(`/api/fleets/${trackedFleet.fleet.id}/accounts/${trackedFleet.account.id}/`)).json();
  expect(detail.events).toHaveLength(2);
});

test("[AUTH-006] [US-055] expired cookies require login and the first retry succeeds", async ({ signedInPage: page, account }) => {
  // Removing cookies is a real expired-session condition rather than a mocked authorization response.
  await page.context().clearCookies();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  await page.getByLabel("Username", { exact: true }).fill(account.username);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("[AUTH-007] [US-003] [US-004] [US-055] shared-cookie tabs reconcile logout and a different operator", async ({ fleetPage: page, trackedFleet, account, otherAccount }) => {
  // An unfinished report must also disappear when another tab ends this authenticated identity.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // This retained draft must disappear when a shared-cookie tab changes authenticated identity.
  const unfinished = await fillReport(page, trackedFleet.account.id, abandoning.id, 17);
  // This real second tab shares cookies while retaining its independent mounted application state.
  const otherTab = await page.context().newPage();
  try {
    await otherTab.goto("/");
    await expect(otherTab.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
    await otherTab.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    await expect(unfinished).not.toBeVisible();
    await signInThroughForm(otherTab, otherAccount);
    await expect(page.getByText(otherAccount.username, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(account.username, { exact: false })).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("option", { name: trackedFleet.fleet.name, exact: true })).toHaveCount(0);
  } finally {
    // Release the extra tab even if a stale-session regression causes an assertion failure.
    await otherTab.close();
  }
});

test("[AUTH-008] [US-005] tokenless login logout and tracker writes fail through Pages", async ({ request, account }) => {
  // CSRF is enforced for both anonymous authentication changes and authenticated domain writes.
  await request.get("/api/csrf/");
  expect((await request.post("/api/auth/login/", { data: account })).status()).toBe(403);
  await signInRequest(request, account);
  expect((await request.post("/api/fleets/", { data: { name: "forged tenant" } })).status()).toBe(403);
  expect((await request.post("/api/auth/logout/")).status()).toBe(403);
  expect((await (await request.get("/api/auth/session/")).json()).user.username).toBe(account.username);
  expect((await csrfRequest(request, "/api/auth/logout/", "POST")).status()).toBe(200);
  expect(await (await request.get("/api/auth/session/")).json()).toEqual({ user: null });
});

test("[AUTH-009] [US-001] [US-064] an unavailable login service retains the username without granting access", async ({ page, account }) => {
  // Browser offline mode fails the real network connection instead of fabricating an API response.
  await page.goto("/");
  await page.getByLabel("Username", { exact: true }).fill(account.username);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.context().setOffline(true);
  try {
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("Sign in is unavailable. Please try again.");
    await expect(page.getByLabel("Username", { exact: true })).toHaveValue(account.username);
    await expect(page.getByRole("button", { name: "Sign out", exact: true })).toHaveCount(0);
  } finally {
    // The browser context must regain network access before cleanup or any later operation.
    await page.context().setOffline(false);
  }
});
