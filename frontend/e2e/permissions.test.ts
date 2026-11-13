import { expect, signInRequest, signInThroughForm, test } from "./fixtures";
import { createFleet, createTrackedAccount, csrfRequest, recordCooldown, selectFleet } from "./support";

test("[ACCESS-001] [US-005] a known foreign fleet and account remain inaccessible to a nonmember", async ({ fleetPage: page, trackedFleet, browser, baseURL, otherAccount }) => {
  // Separate cookies prove this is authorization isolation rather than frontend filtering.
  const outsider = await browser.newContext({ baseURL });
  try {
    await signInRequest(outsider.request, otherAccount);
    // The outsider's actual membership list must exclude the current case's private fleet.
    const visibleFleets = await (await outsider.request.get("/api/fleets/")).json() as { id: string }[];
    expect(visibleFleets.some((fleet) => fleet.id === trackedFleet.fleet.id)).toBe(false);
    expect((await outsider.request.get(`/api/fleets/${trackedFleet.fleet.id}/accounts/`)).status()).toBe(404);
    expect((await outsider.request.get(`/api/fleets/${trackedFleet.fleet.id}/accounts/${trackedFleet.account.id}/`)).status()).toBe(404);
    // The rightful owner's request still succeeds through the same real Pages route.
    expect((await page.request.get(`/api/fleets/${trackedFleet.fleet.id}/accounts/${trackedFleet.account.id}/`)).status()).toBe(200);
  } finally {
    await outsider.close();
  }
});

test("[ACCESS-002] [US-005] [US-052] a viewer can read shared evidence while direct and UI mutations are denied", async ({ fleetPage: page, trackedFleet, browser, baseURL, otherAccount }) => {
  // Membership administration is performed through the owner-facing form, not a test-only grant.
  await page.getByRole("button", { name: "Members", exact: true }).click();
  // The labelled membership form scopes username, role and submit controls away from existing member rows.
  const form = page.getByRole("form", { name: "Add member", exact: true });
  await form.getByLabel("Operator username", { exact: true }).fill(otherAccount.username);
  await form.getByRole("combobox", { name: "Member role", exact: true }).selectOption("viewer");
  await form.getByRole("button", { name: "Add member", exact: true }).click();
  await expect(page.getByLabel(`Role for ${otherAccount.username}`, { exact: true })).toHaveValue("viewer");
  // This seeded Abandoning definition supplies the real policy UUID used by this scenario.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id);
  const viewer = await browser.newContext({ baseURL });
  try {
    // The viewer page uses a separate browser context and real read-only membership.
    const viewerPage = await viewer.newPage();
    await signInThroughForm(viewerPage, otherAccount);
    await selectFleet(viewerPage, trackedFleet.fleet.id);
    await viewerPage.getByRole("button", { name: "Accounts", exact: true }).click();
    await viewerPage.getByRole("button", { name: trackedFleet.account.tag, exact: true }).click();
    await expect(viewerPage.getByRole("table", { name: "Cooldown history", exact: true }).getByText("Abandoning", { exact: false })).toBeVisible();
    await expect(viewerPage.getByRole("button", { name: "Report observation", exact: true })).toBeDisabled();
    // The real mutation response proves that a disabled UI action is also forbidden by the backend.
    const deniedWrite = await csrfRequest(viewer.request, `/api/fleets/${trackedFleet.fleet.id}/accounts/`, "POST", { tag: "forged viewer write", steam_id: "76561198000000099" });
    expect(deniedWrite.status()).toBe(403);
    // The direct membership response verifies that this role cannot promote itself through the API.
    const deniedGrant = await csrfRequest(viewer.request, `/api/fleets/${trackedFleet.fleet.id}/members/`, "POST", { username: otherAccount.username, role: "owner" });
    expect(deniedGrant.status()).toBe(403);
  } finally {
    await viewer.close();
  }
});

test("[ACCESS-003] [US-052] an editor reports into shared history without gaining membership administration", async ({ fleetPage: page, trackedFleet, browser, baseURL, otherAccount }) => {
  // The role grant is scoped to this fresh tenant and cannot affect unrelated tests' fleets.
  const granted = await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/members/`, "POST", { username: otherAccount.username, role: "editor" });
  expect(granted.status()).toBe(201);
  // A separate cookie jar exercises the granted editor role without sharing the owner's session.
  const editor = await browser.newContext({ baseURL });
  try {
    await signInRequest(editor.request, otherAccount);
    // This seeded Abandoning definition supplies the real policy UUID used by this scenario.
    const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
    // The accepted event identity lets later assertions distinguish persisted evidence from derived display rows.
    const event = await recordCooldown(editor.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id);
    expect(event.created_by).toBe(otherAccount.username);
    // The direct membership response verifies that this role cannot promote itself through the API.
    const deniedGrant = await csrfRequest(editor.request, `/api/fleets/${trackedFleet.fleet.id}/members/`, "POST", { username: otherAccount.username, role: "owner" });
    expect(deniedGrant.status()).toBe(403);
    await selectFleet(page, trackedFleet.fleet.id);
    await page.getByRole("button", { name: "Accounts", exact: true }).click();
    await page.getByRole("button", { name: trackedFleet.account.tag, exact: true }).click();
    await expect(page.getByRole("table", { name: "Cooldown history", exact: true }).getByText(otherAccount.username, { exact: false }).first()).toBeVisible();
  } finally {
    await editor.close();
  }
});

test("[ACCESS-004] fleet administration preserves its last owner and rejects cross-fleet object substitution", async ({ fleetPage: page, trackedFleet, account }) => {
  // The last-owner invariant is checked by the real transactional backend after UI submission.
  await page.getByRole("button", { name: "Members", exact: true }).click();
  await page.getByLabel(`Role for ${account.username}`, { exact: true }).selectOption("viewer");
  await page.getByRole("button", { name: `Save role ${account.username}`, exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("at least one owner");
  // The persisted member list verifies that last-owner protection retained the existing owner.
  const members = await (await page.request.get(`/api/fleets/${trackedFleet.fleet.id}/members/`)).json() as { username: string; role: string }[];
  expect(members.find((member) => member.username === account.username)?.role).toBe("owner");
  // Owning two tenants still does not permit combining their account and policy UUIDs.
  const secondFleet = await createFleet(page.request);
  // This valid UUID belongs to another fleet even though the same operator owns both fleets.
  const foreignAccount = await createTrackedAccount(page.request, secondFleet.id);
  // This seeded Abandoning definition supplies the real policy UUID used by this scenario.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The scoped preview response must reject cross-fleet object substitution.
  const deniedPreview = await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/preview/`, "POST", { account_id: foreignAccount.id, type_id: abandoning.id, started_at: new Date(Date.now() - 60_000).toISOString() });
  expect(deniedPreview.status()).toBe(404);
});

test("[ACCESS-005] [US-056] accepted changes retain operator attribution without authentication material", async ({ fleetPage: page, trackedFleet, account }) => {
  // Audit data is read through the same scoped service as ordinary fleet members.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id);
  await page.getByRole("button", { name: "Audit", exact: true }).click();
  // The labelled audit region exposes accepted actor attribution through the production view.
  const audit = page.getByRole("region", { name: "Fleet audit history", exact: true });
  await expect(audit.getByText("event.recorded", { exact: true })).toBeVisible();
  await expect(audit.getByText(account.username, { exact: false }).first()).toBeVisible();
  // The raw audit projection is checked independently for accidental credential disclosure.
  const entries = await (await page.request.get(`/api/fleets/${trackedFleet.fleet.id}/audit/`)).json();
  expect(JSON.stringify(entries)).not.toContain(account.password);
});
