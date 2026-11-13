import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import type { APIRequestContext, APIResponse, Locator, Page } from "@playwright/test";
import type { components } from "@template/api-client";
import type { TestAccount } from "./fixtures";

/** Sign in through accessible controls and wait for the authenticated tracker shell. */
export async function signInThroughForm(page: Page, account: TestAccount): Promise<void> {
  // Session bootstrap must verify a real cookie session before protected views appear.
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Username", exact: true }).fill(account.username);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  // Native form submission keeps fixture setup independent of pointer focus during password entry.
  await page.getByLabel("Password", { exact: true }).press("Enter");
  // Branding exists on the sign-in screen too; only this protected action proves login settled.
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
}

/** Obtain real Django cookies for a separate browser/request context without bypassing login. */
export async function signInRequest(request: APIRequestContext, account: TestAccount): Promise<void> {
  // Django rotates CSRF during this protected login, so every later write bootstraps again.
  const loginResponse = await csrfRequest(request, "/api/auth/login/", "POST", account);
  expect(loginResponse.status()).toBe(200);
  expect((await loginResponse.json()).user.username).toBe(account.username);
}

/** Send one genuine same-origin protected mutation and retain its status for positive/negative cases. */
export async function csrfRequest(request: APIRequestContext, path: string, method: string, body?: unknown): Promise<APIResponse> {
  // bootstrap carries the masked token that matches this context's private CSRF cookie.
  const bootstrap = await request.get("/api/csrf/");
  expect(bootstrap.ok()).toBe(true);
  const { csrfToken } = await bootstrap.json() as { csrfToken: string };
  return request.fetch(path, { method, data: body, headers: { "X-CSRFToken": csrfToken } });
}

/** Read a successful public response using its generated schema type. */
export async function readJson<ResponseBody>(request: APIRequestContext, path: string): Promise<ResponseBody> {
  // response diagnostics preserve actual backend failures rather than replacing them with fixture data.
  const response = await request.get(path);
  expect(response.ok(), await response.text()).toBe(true);
  return response.json() as Promise<ResponseBody>;
}

/** Assert outer-page containment while allowing explicitly named table/calendar scroll regions. */
export async function expectOuterPageFits(page: Page): Promise<void> {
  // geometry reports only element dimensions and classes, never form values or private text.
  const geometry = await page.evaluate(() => {
    // viewportWidthPx is the CSS-pixel contract, distinct from browser/device physical pixels.
    const viewportWidthPx = innerWidth;
    // overflowing identifies uncontained layout boxes, excluding deliberate inner scrolling surfaces.
    const overflowing = Array.from(document.querySelectorAll("body *")).filter((element) => {
      // A wide table or calendar is acceptable only inside its own bounded scrolling region.
      return element.getBoundingClientRect().right > viewportWidthPx && !element.closest(".table-scroll, .calendar-scroller");
    }).slice(0, 12).map((element) => {
      // bounds locate an overflowing box without exposing its content in failure output.
      const bounds = element.getBoundingClientRect();
      return { tag: element.tagName, className: element.className, left: bounds.left, right: bounds.right, width: bounds.width };
    });
    return { viewportWidthPx, documentWidthPx: document.documentElement.scrollWidth, overflowing };
  });
  expect(geometry.documentWidthPx, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.viewportWidthPx);
}

/** Create one unique test tenant without relying on another case's membership or counts. */
export async function createFleet(request: APIRequestContext): Promise<components["schemas"]["Fleet"]> {
  // Each random name belongs only to this case and remains below the actual 120-character limit.
  const response = await csrfRequest(request, "/api/fleets/", "POST", { name: `acceptance-${randomUUID()}` });
  expect(response.status(), await response.text()).toBe(201);
  return response.json() as Promise<components["schemas"]["Fleet"]>;
}

/** Create a real account with an exact string SteamID, unique within the case's tenant. */
export async function createTrackedAccount(request: APIRequestContext, fleetId: string, tag = `account_${randomUUID().slice(0, 8)}`, steamId = "76561198039452203"): Promise<components["schemas"]["AccountDetail"]> {
  // Stable UUID ownership is returned by the API rather than derived from the mutable display tag.
  const response = await csrfRequest(request, `/api/fleets/${fleetId}/accounts/`, "POST", { tag, steam_id: steamId });
  expect(response.status(), await response.text()).toBe(201);
  return response.json() as Promise<components["schemas"]["AccountDetail"]>;
}

/** Re-enter the app and explicitly select one tenant regardless of persisted UI preferences. */
export async function selectFleet(page: Page, fleetId: string): Promise<void> {
  // Native select choices are populated from the authorized fleet list, not test-only DOM state.
  await page.reload();
  // Wait for authenticated state before racing a page reload with a protected API command.
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Fleet", exact: true }).selectOption(fleetId);
  await expect(page.getByRole("combobox", { name: "Fleet", exact: true })).toHaveValue(fleetId);
  await expect(page.getByText("Loading fleet records...", { exact: true })).toHaveCount(0);
}

/** Return a known-past UTC instant, avoiding future observations during a slow browser run. */
export function minutesAgo(minutes: number): string {
  // Duration is elapsed minutes; every fixture timestamp includes an explicit UTC offset.
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

/** Optional fixture facts remain explicit rather than inferred from shared test history. */
interface CooldownOptions {
  /** Aware past issue time; defaults to five elapsed minutes before this operation. */
  startedAt?: string;
  /** Aware evidence time; defaults to one elapsed minute before this operation. */
  observedAt?: string;
  /** Positive whole-minute evidence within the chosen assessment. */
  remainingMinutes?: number;
  /** A real one-based policy position, absent for automatic prediction. */
  forcedStep?: number;
}

/** Prepare one reviewed command so retry tests can send the exact same stable identities. */
export async function prepareCooldown(request: APIRequestContext, fleetId: string, accountId: string, typeId: string, options: CooldownOptions = {}): Promise<components["schemas"]["EventInputRequest"]> {
  // Temporal fields and override are fixed before preview so acceptance reuses the same inputs.
  const startedAt = options.startedAt ?? minutesAgo(5);
  // Evidence time is fixed separately from issue time before either value is reviewed by the server.
  const observedAt = options.observedAt ?? minutesAgo(1);
  // Only reviewed model inputs are sent to preview; totals and expiry remain server-derived.
  const previewBody = { account_id: accountId, type_id: typeId, started_at: startedAt, ...(options.forcedStep ? { forced_step: options.forcedStep } : {}) };
  // The preview transport response carries current policy and account-history revision tokens.
  const previewResponse = await csrfRequest(request, `/api/fleets/${fleetId}/preview/`, "POST", previewBody);
  expect(previewResponse.status(), await previewResponse.text()).toBe(200);
  // The accepted server preview supplies the assessment facts and revision tokens under test.
  const preview = await previewResponse.json() as components["schemas"]["Preview"];
  // The command provides no client total or expiry; the server derives and pins both.
  return {
    ...previewBody,
    id: randomUUID(),
    observation_id: randomUUID(),
    policy_id: preview.policy_id,
    history_revision: preview.history_revision,
    observed_at: observedAt,
    remaining_minutes: options.remainingMinutes ?? 20,
    // Automatic assessments have an explicit empty reason; overrides retain their evidence context.
    override_reason: options.forcedStep ? "Known observed step in an acceptance fixture." : "",
  };
}

/** Store one genuine event using a reviewed server preview and explicit retry identities. */
export async function recordCooldown(request: APIRequestContext, fleetId: string, accountId: string, typeId: string, options: CooldownOptions = {}): Promise<components["schemas"]["Event"]> {
  // The same prepared body can be reused by deliberate retry cases without creating new IDs.
  const command = await prepareCooldown(request, fleetId, accountId, typeId, options);
  const response = await csrfRequest(request, `/api/fleets/${fleetId}/events/`, "POST", command);
  expect(response.status(), await response.text()).toBe(201);
  return response.json() as Promise<components["schemas"]["Event"]>;
}

/** Read one persisted detail using the generated history/observation projection. */
export async function accountDetail(request: APIRequestContext, fleetId: string, accountId: string): Promise<components["schemas"]["AccountDetail"]> {
  // One exact UUID route prevents a display tag or another test's account from supplying evidence.
  return readJson(request, `/api/fleets/${fleetId}/accounts/${accountId}/`);
}

/** Open a report and enter UTC evidence without silently accepting any demo defaults. */
export async function fillReport(page: Page, accountId: string, typeId: string, remainingMinutes = 20): Promise<Locator> {
  // dialog scopes repeated field labels away from background filters and account/type editors.
  await page.getByRole("button", { name: "Report observation", exact: true }).click();
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = page.getByRole("dialog", { name: "Report an observation", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox", { name: "Steam account", exact: true }).selectOption(accountId);
  await dialog.getByRole("combobox", { name: "Offence type", exact: true }).selectOption(typeId);
  await dialog.getByLabel("Cooldown start (UTC)", { exact: true }).fill(minutesAgo(5).slice(0, 16));
  await dialog.getByLabel("Observed at (UTC)", { exact: true }).fill(minutesAgo(1).slice(0, 16));
  await dialog.getByLabel("Days", { exact: true }).fill("0");
  await dialog.getByLabel("Hours", { exact: true }).fill("0");
  await dialog.getByLabel("Minutes", { exact: true }).fill(String(remainingMinutes));
  return dialog;
}

/** Request a real assessment and return its concurrency tokens for additional assertions. */
export async function previewDialog(page: Page, dialog: Locator): Promise<components["schemas"]["Preview"]> {
  // responsePromise is registered before the click so fast local responses cannot be missed.
  const responsePromise = page.waitForResponse((response) => response.url().endsWith("/preview/") && response.request().method() === "POST");
  await dialog.getByRole("button", { name: "Preview cooldown", exact: true }).click();
  const response = await responsePromise;
  expect(response.status(), await response.text()).toBe(200);
  return response.json() as Promise<components["schemas"]["Preview"]>;
}
