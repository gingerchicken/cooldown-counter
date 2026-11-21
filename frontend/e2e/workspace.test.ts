import { randomUUID } from "node:crypto";
import { expect, test } from "./fixtures";
import { createFleet, createTrackedAccount, csrfRequest, minutesAgo, recordCooldown, selectFleet } from "./support";

test("[WORK-001] [US-006] [US-007] [US-020] an operator creates an empty fleet and tracks an exact account identity", async ({ signedInPage: page }) => {
  // Fleet creation is exercised in the UI, independently of fixture-assisted API provisioning.
  await page.getByRole("button", { name: "Create fleet", exact: true }).first().click();
  // The fleet creation dialog isolates the save action from the workspace launcher with the same name.
  const creation = page.getByRole("dialog", { name: "Create fleet", exact: true });
  // A random visible fleet name avoids collisions with earlier cases using the same ordinary operator.
  const fleetName = `ui-${randomUUID()}`;
  await creation.getByLabel("Fleet name", { exact: true }).fill(fleetName);
  await creation.getByRole("button", { name: "Create fleet", exact: true }).click();
  await expect(creation).not.toBeVisible();
  await expect(page.getByRole("combobox", { name: "Fleet", exact: true }).getByRole("option", { name: fleetName, exact: true })).toBeAttached();
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Accounts", exact: true })).toBeVisible();
  await expect(page.getByText(/No accounts/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Report observation", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Add account", exact: true }).click();
  // The account editor is scoped independently from the empty account-list add action.
  const accountDialog = page.getByRole("dialog", { name: "Add account", exact: true });
  await accountDialog.getByLabel("Account tag", { exact: true }).fill("precise_account");
  await accountDialog.getByLabel("SteamID", { exact: true }).fill("76561198039452203");
  await accountDialog.getByRole("button", { name: "Save account", exact: true }).click();
  await expect(accountDialog).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "precise_account", exact: true, level: 2 })).toBeVisible();
  await expect(page.getByText("76561198039452203", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Cooldowns", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Calendar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Cooldown calendar", exact: true })).toBeVisible();
});

test("[WORK-002] [US-018] [US-019] account summaries distinguish clean clear active and load additional accounts", async ({ fleetPage: page, trackedFleet }) => {
  // All count assertions refer to one new fleet, so other parallel users cannot affect them.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id);
  // This separate account carries expired history so clear and untouched clean states can be compared.
  const expiredAccount = await createTrackedAccount(page.request, trackedFleet.fleet.id, "expired_account", "76561198000000001");
  await recordCooldown(page.request, trackedFleet.fleet.id, expiredAccount.id, abandoning.id, { startedAt: minutesAgo(3 * 1440), observedAt: minutesAgo(3 * 1440 - 1) });
  // Additional clean rows put the account list beyond its initial twelve-row slice.
  for (let accountIndex = 2; accountIndex <= 14; accountIndex += 1) {
    await createTrackedAccount(page.request, trackedFleet.fleet.id, `extra_${String(accountIndex).padStart(2, "0")}`, `765611980${String(accountIndex).padStart(8, "0")}`);
  }
  await selectFleet(page, trackedFleet.fleet.id);
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await expect(page.getByRole("region", { name: "Accounts table", exact: true }).getByText("On cooldown", { exact: true })).toBeVisible();
  // Distinct state text preserves the difference between expired history and untouched clean rows.
  await expect(page.getByRole("region", { name: "Accounts table", exact: true }).getByText("Clear", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Accounts table", exact: true }).getByText("Clean - no recorded offences", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "extra_14", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Load more accounts", exact: true }).click();
  await expect(page.getByRole("button", { name: "extra_14", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Status filter", exact: true }).selectOption("active");
  await expect(page.getByRole("button", { name: trackedFleet.account.tag, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "expired_account", exact: true })).toHaveCount(0);
  await page.getByRole("combobox", { name: "Status filter", exact: true }).selectOption("clear");
  await expect(page.getByRole("button", { name: "expired_account", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: trackedFleet.account.tag, exact: true })).toHaveCount(0);
});

test("[WORK-003] [US-008] [US-009] [US-010] [US-011] combined filters use exact accounts and reset coherently", async ({ fleetPage: page, trackedFleet }) => {
  // Prefix-related tags prove a selected account does not fall back to substring matching.
  await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/accounts/${trackedFleet.account.id}/`, "PATCH", { tag: "hbh_1" });
  // The prefix-related account proves that exact selection cannot collapse distinct account identities.
  const other = await createTrackedAccount(page.request, trackedFleet.fleet.id, "hbh_10", "76561198039452204");
  // This seeded Abandoning definition supplies the real policy UUID used by this scenario.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id);
  await selectFleet(page, trackedFleet.fleet.id);
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await page.getByRole("combobox", { name: "Account filter", exact: true }).selectOption(trackedFleet.account.id);
  await expect(page.getByRole("button", { name: "hbh_1", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "hbh_10", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Reset filters", exact: true }).click();
  await page.getByLabel("Search accounts", { exact: true }).fill("  HBH_10  ");
  await expect(page.getByRole("button", { name: "hbh_10", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "hbh_1", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Reset filters", exact: true }).click();
  await page.getByText("All offences", { exact: true }).click();
  await page.getByRole("group", { name: "Offence filters", exact: true }).getByLabel("Abandoning", { exact: true }).check();
  await page.getByRole("group", { name: "Offence filters", exact: true }).getByLabel("Team Damage", { exact: true }).check();
  await expect(page.getByText("2 offences selected", { exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Status filter", exact: true }).selectOption("active");
  await expect(page.getByRole("button", { name: "hbh_1", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: other.tag, exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Reset filters", exact: true }).click();
  await expect(page.getByRole("button", { name: other.tag, exact: true })).toBeVisible();
  await page.getByLabel("Search accounts", { exact: true }).fill("no_such_account");
  await expect(page.getByText(/No accounts match/).first()).toBeVisible();
});

test("[WORK-004] [US-020] [US-021] [US-022] [US-023] [US-024] [US-056] account detail separates evidence predictions and precise external identity", async ({ fleetPage: page, trackedFleet }) => {
  // A fresh account has three ordinary reasons sharing level one and two special reasons of unknown duration.
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await page.getByRole("button", { name: trackedFleet.account.tag, exact: true }).click();
  await expect(page.getByRole("heading", { name: trackedFleet.account.tag, exact: true, level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Predicted next cooldown", exact: true })).toBeVisible();
  await expect(page.getByText(/No cooldowns recorded/).first()).toBeVisible();
  // The prediction section scopes all per-offence estimates away from history and calendar labels.
  const predictions = page.getByRole("heading", { name: "Predicted next cooldown", exact: true }).locator("..");
  for (const definition of trackedFleet.types) {
    // Every configured ladder has its own named estimate rather than one fleet-wide guess.
    await expect(predictions.getByRole("heading", { name: definition.name, exact: true })).toBeVisible();
  }
  await expect(predictions.getByText("Shared competitive level 1", { exact: true })).toHaveCount(3);
  await expect(predictions.getByText("Unknown", { exact: true })).toHaveCount(2);
  await expect(page.getByText(/No history on this account/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Open on Steam/ })).toHaveAttribute("href", `https://steamcommunity.com/profiles/${trackedFleet.account.steam_id}`);
  // The profile is inspected as a link only; this suite never navigates to real external accounts.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The accepted event identity lets later assertions distinguish persisted evidence from derived display rows.
  const event = await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id, { forcedStep: 2, remainingMinutes: 45 });
  await selectFleet(page, trackedFleet.fleet.id);
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await page.getByRole("button", { name: trackedFleet.account.tag, exact: true }).click();
  // The labelled history table contains accepted observations and saved assessment snapshots.
  const history = page.getByRole("table", { name: "Cooldown history", exact: true });
  await expect(history.getByText(/Manual override/)).toBeVisible();
  await expect(history.getByText(/45m/)).toBeVisible();
  await expect(history.getByText(/2h/)).toBeVisible();
  // Shared ordinary reasons can show the same transition on more than one reason card.
  await expect(page.getByText(/Saved step 2 -> clean-time state 2/).first()).toBeVisible();
  // Persisted account detail is read back independently of the UI that submitted the mutation.
  const saved = await (await page.request.get(`/api/fleets/${trackedFleet.fleet.id}/accounts/${trackedFleet.account.id}/`)).json();
  expect(saved.events[0].id).toBe(event.id);
  expect(saved.events[0].observations[0].remaining_minutes).toBe(45);
  expect(saved.events[0].total_minutes).toBe(120);
});

test("[CAL-001] [US-007] [US-012] [US-013] [US-017] multiweek records and future step-downs stay distinct and focus exact accounts", async ({ fleetPage: page, trackedFleet }) => {
  // A seven-day assessment necessarily crosses a week boundary without multiplying saved events.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // A custom four-step history has an exact terminal level, so all four forecast markers are meaningful.
  const custom = await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/types/${abandoning.id}/`, "PATCH", {
    name: abandoning.name, expected_policy_id: abandoning.policy.id, mechanism: "custom", steps: abandoning.policy.steps,
  });
  expect(custom.status()).toBe(200);
  await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id, { forcedStep: 4 });
  await selectFleet(page, trackedFleet.fleet.id);
  await page.getByRole("button", { name: "Load next month", exact: true }).click();
  // These accessible calendar entries all represent segments of the same persisted event.
  const bars = page.getByRole("button", { name: new RegExp(`^${trackedFleet.account.tag} Abandoning,`) });
  await expect(bars.first()).toBeVisible();
  expect(await bars.count()).toBeGreaterThanOrEqual(2);
  await expect(page.getByRole("button", { name: new RegExp(`^Forecast ${trackedFleet.account.tag} Abandoning`) }).first()).toBeVisible();
  // Forecast visibility is presentation only; hiding marks must leave recorded evidence reachable.
  await page.getByRole("checkbox", { name: "Show step-down forecasts", exact: true }).uncheck();
  await expect(page.getByRole("button", { name: /^Forecast / })).toHaveCount(0);
  await expect(bars.first()).toBeVisible();
  await page.getByRole("checkbox", { name: "Show step-down forecasts", exact: true }).check();
  await bars.first().click();
  await expect(page.getByRole("combobox", { name: "Account filter", exact: true })).toHaveValue(trackedFleet.account.id);
  // The server calendar counts the original event once despite its rendered weekly segments.
  // A ninety-day forecast range includes all four reductions, beyond the API's shorter default.
  const rangeStart = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  // The UTC end date extends far enough to include every terminal-ladder forecast reduction.
  const rangeEnd = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
  // This projection is restricted to the current case's selected fleet and explicit date window.
  const calendar = await (await page.request.get(`/api/fleets/${trackedFleet.fleet.id}/calendar/?start=${rangeStart}&end=${rangeEnd}`)).json();
  expect(calendar.recorded_count).toBe(1);
  expect(calendar.active_count).toBe(1);
  expect(calendar.forecasts).toHaveLength(4);
  await expect(page.locator(".fleet-kpis").getByText("Recorded", { exact: true }).locator("..").locator("dd")).toHaveText("1");
  await expect(page.locator(".fleet-kpis").getByText("On cooldown", { exact: true }).locator("..").locator("dd")).toHaveText("1");
});

test("[CAL-002] [US-015] [US-016] earlier later and present dates are reachable without infinite scrolling", async ({ fleetPage: page, trackedFleet }) => {
  // Navigation uses explicit buttons, so short or empty pages do not block access to other months.
  const calendar = page.getByRole("region", { name: "Cooldown calendar", exact: true });
  // The initial month label is retained to prove that explicit navigation and reset change the visible range.
  const initialMonth = await calendar.getByRole("heading", { level: 3 }).first().textContent();
  await page.getByRole("button", { name: "Previous month", exact: true }).click();
  await expect(calendar.getByRole("heading", { level: 3 }).first()).not.toHaveText(initialMonth!);
  await page.getByRole("button", { name: "Next month", exact: true }).click();
  await expect(calendar.getByRole("heading", { level: 3 }).first()).toHaveText(initialMonth!);
  await page.getByRole("button", { name: "Load next month", exact: true }).click();
  await page.getByRole("button", { name: "Jump to today", exact: true }).click();
  await expect(page.getByText("NOW", { exact: true }).first()).toBeInViewport();
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(calendar.getByRole("heading", { level: 3 }).first()).toHaveText(initialMonth!);
  // Older known history is still available after explicitly moving the loaded date range.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id, { startedAt: minutesAgo(200 * 1440), observedAt: minutesAgo(200 * 1440 - 1) });
  await selectFleet(page, trackedFleet.fleet.id);
  await page.getByRole("button", { name: "Earliest history", exact: true }).click();
  await expect(page.getByRole("button", { name: new RegExp(`^${trackedFleet.account.tag} Abandoning,`) }).first()).toBeVisible();
});

test("[CAL-003] [US-014] crowded calendar entries remain reachable through explicit overflow disclosure", async ({ fleetPage: page, trackedFleet }) => {
  // Six overlapping accounts exceed the design's ordinary five-lane week display.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // Preserve the explicit expected identities without assuming UUID sort order chooses a hidden one.
  const accountTags = [];
  for (let accountIndex = 0; accountIndex < 6; accountIndex += 1) {
    // This account is owned by the current case's isolated fleet, with identity returned by the real API.
    const account = accountIndex === 0 ? trackedFleet.account : await createTrackedAccount(page.request, trackedFleet.fleet.id, `overlap_${accountIndex}`, `765611980${String(accountIndex).padStart(8, "0")}`);
    accountTags.push(account.tag);
    await recordCooldown(page.request, trackedFleet.fleet.id, account.id, abandoning.id, { forcedStep: 4 });
  }
  await selectFleet(page, trackedFleet.fleet.id);
  // The first crowded calendar week exposes records beyond its initial visible lanes.
  const disclosure = page.getByText(/Show \d+ more entries/).first();
  await expect(disclosure).toBeVisible();
  await disclosure.click();
  for (const accountTag of accountTags) {
    // Every account's first week entry is now reachable, regardless of which UUID occupied overflow.
    await expect(page.getByRole("button", { name: new RegExp(`^${accountTag} Abandoning,`) }).first()).toBeVisible();
  }
});

test("[LOAD-001] [US-064] a failed fleet load differs from empty data and retries against the real service", async ({ signedInPage: page, trackedFleet }) => {
  // A second fleet is known before network loss, allowing its real read request to fail visibly.
  const secondFleet = await createFleet(page.request);
  await selectFleet(page, trackedFleet.fleet.id);
  await page.context().setOffline(true);
  try {
    await page.getByRole("combobox", { name: "Fleet", exact: true }).selectOption(secondFleet.id);
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry loading", exact: true })).toBeVisible();
    await expect(page.getByText(trackedFleet.account.tag, { exact: true })).toHaveCount(0);
  } finally {
    // Restore connectivity before asking the application to perform its real retry.
    await page.context().setOffline(false);
  }
  await page.getByRole("button", { name: "Retry loading", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await expect(page.getByText(/No accounts/).first()).toBeVisible();
});
