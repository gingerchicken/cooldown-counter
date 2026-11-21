import { expect, test } from "./fixtures";
import { accountDetail, csrfRequest, fillReport, minutesAgo, prepareCooldown, previewDialog, recordCooldown, selectFleet } from "./support";

test("[REPORT-001] [US-025] [US-026] [US-027] [US-028] [US-032] searching and previewing an unfinished report never records an offence", async ({ fleetPage: page, trackedFleet }) => {
  // Selector search and cancellation operate over actual fleet records, not a component mock.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = await fillReport(page, trackedFleet.account.id, abandoning.id);
  await dialog.getByLabel("Account search", { exact: true }).fill(trackedFleet.account.steam_id);
  await expect(dialog.getByRole("combobox", { name: "Steam account", exact: true }).getByRole("option", { name: new RegExp(trackedFleet.account.tag) })).toHaveCount(1);
  await dialog.getByLabel("Offence search", { exact: true }).fill("abd");
  await expect(dialog.getByRole("combobox", { name: "Offence type", exact: true }).getByRole("option", { name: /Abandoning/ })).toHaveCount(1);
  // The accepted server preview supplies the assessment facts and revision tokens under test.
  const preview = await previewDialog(page, dialog);
  expect(preview.step).toBe(1);
  expect(preview.total_minutes).toBe(30);
  await expect(dialog.getByText(/First offence/)).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect((await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id)).events).toEqual([]);
});

test("[REPORT-002] [US-029] [US-030] [US-032] [US-035] [US-051] accepted evidence retains distinct times and survives reload", async ({ fleetPage: page, trackedFleet }) => {
  // The preview and save share the same visible inputs and accepted concurrency tokens.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = await fillReport(page, trackedFleet.account.id, abandoning.id, 20);
  // The accepted server preview supplies the assessment facts and revision tokens under test.
  const preview = await previewDialog(page, dialog);
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("heading", { name: trackedFleet.account.tag, exact: true, level: 2 })).toBeVisible();
  // A live region acknowledges acceptance after the reporting dialog has been removed.
  await expect(page.getByRole("status").filter({ hasText: "Cooldown and observation saved." })).toBeVisible();
  // Persisted account detail is read back independently of the UI that submitted the mutation.
  const saved = await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id);
  expect(saved.events).toHaveLength(1);
  expect(saved.events[0].assigned_step).toBe(preview.step);
  expect(saved.events[0].total_minutes).toBe(preview.total_minutes);
  expect(saved.events[0].observations[0].remaining_minutes).toBe(20);
  expect(Date.parse(saved.events[0].started_at)).toBeLessThan(Date.parse(saved.events[0].observations[0].observed_at));
  await page.reload();
  // Session restoration does not imply a persisted tenant preference; explicitly revisit this fleet's records.
  await selectFleet(page, trackedFleet.fleet.id);
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await page.getByRole("button", { name: trackedFleet.account.tag, exact: true }).click();
  await expect(page.getByRole("table", { name: "Cooldown history", exact: true }).getByText(/20m/)).toBeVisible();
});

test("[REPORT-003] [US-030] [US-033] additive duration and an attributed keyboard override preserve observed facts", async ({ fleetPage: page, trackedFleet }) => {
  // Mixed components remain additive even when a larger component is nonzero.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = await fillReport(page, trackedFleet.account.id, abandoning.id);
  await dialog.getByLabel("Days", { exact: true }).fill("1");
  await dialog.getByLabel("Hours", { exact: true }).fill("2");
  await dialog.getByLabel("Minutes", { exact: true }).fill("3");
  // The native override range exposes the selected one-based ladder position.
  const range = dialog.getByLabel("Override step", { exact: true });
  await range.focus();
  await range.press("End");
  await expect(range).toHaveValue("4");
  await dialog.getByRole("textbox", { name: "Override reason", exact: true }).fill("Observed seven-day issue in the game.");
  // The accepted server preview supplies the assessment facts and revision tokens under test.
  const preview = await previewDialog(page, dialog);
  expect(preview.step).toBe(4);
  expect(preview.total_minutes).toBe(10080);
  expect(preview.transition).toContain("step 4 (predicted step 1)");
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  // Persisted account detail is read back independently of the UI that submitted the mutation.
  const saved = await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id);
  expect(saved.events[0].observations[0].remaining_minutes).toBe(1563);
  expect(saved.events[0].is_override).toBe(true);
  expect(saved.events[0].override_reason).toBe("Observed seven-day issue in the game.");
});

test("[REPORT-004] [US-031] [US-033] [US-034] conflicting remaining time offers a fitting step and reset restores prediction", async ({ fleetPage: page, trackedFleet }) => {
  // Three hours cannot fit the predicted thirty-minute or second two-hour step.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = await fillReport(page, trackedFleet.account.id, abandoning.id, 180);
  await previewDialog(page, dialog);
  await expect(dialog.getByText(/remaining exceeds/)).toBeVisible();
  await dialog.getByRole("button", { name: /Move to step 3/ }).click();
  await expect(dialog.getByLabel("Override step", { exact: true })).toHaveValue("3");
  await dialog.getByRole("button", { name: "Reset to predicted", exact: true }).click();
  await expect(dialog.getByLabel("Override step", { exact: true })).toHaveValue("1");
  await dialog.getByLabel("Days", { exact: true }).fill("8");
  await dialog.getByLabel("Minutes", { exact: true }).fill("0");
  await previewDialog(page, dialog);
  await expect(dialog.getByRole("button", { name: /Move to step/ })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  // Evidence can exceed every ordinary stage while preserving the 30-minute prediction for comparison.
  const saved = (await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id)).events;
  expect(saved).toHaveLength(1);
  expect(saved[0].observations[0].remaining_minutes).toBe(8 * 1440);
  expect(saved[0].total_minutes).toBe(30);
  expect(saved[0].expires_at).toBe(saved[0].observed_expires_at);
});

test("[REPORT-005] [US-029] [US-031] zero negative fractional and future input cannot become fabricated evidence", async ({ fleetPage: page, trackedFleet }) => {
  // The same saved history remains empty after every rejected field boundary.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = await fillReport(page, trackedFleet.account.id, abandoning.id, 20);
  await previewDialog(page, dialog);
  await dialog.getByLabel("Minutes", { exact: true }).fill("0");
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(dialog.getByRole("alert").first()).toBeVisible();
  await dialog.getByLabel("Minutes", { exact: true }).fill("-1");
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(dialog.getByLabel("Remaining duration", { exact: true })).toContainText("positive whole-minute");
  await dialog.getByLabel("Minutes", { exact: true }).fill("0.5");
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(dialog.getByLabel("Remaining duration", { exact: true })).toContainText("positive whole-minute");
  await dialog.getByLabel("Minutes", { exact: true }).fill("20");
  await dialog.getByLabel("Cooldown start (UTC)", { exact: true }).fill(new Date(Date.now() + 86_400_000).toISOString().slice(0, 16));
  await dialog.getByRole("button", { name: "Preview cooldown", exact: true }).click();
  await expect(dialog.getByRole("alert").first()).toContainText(/UTC times|future|no later than now/i);
  expect((await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id)).events).toEqual([]);
});

test("[REPORT-006] [US-056] [US-065] a further observation belongs to one offence and never advances it twice", async ({ fleetPage: page, trackedFleet }) => {
  // New evidence has its own UUID and timestamp but references the existing event identity.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The accepted event identity lets later assertions distinguish persisted evidence from derived display rows.
  const event = await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id);
  await selectFleet(page, trackedFleet.fleet.id);
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await page.getByRole("button", { name: trackedFleet.account.tag, exact: true }).click();
  await page.getByRole("button", { name: "Add observation", exact: true }).click();
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = page.getByRole("dialog", { name: "Add an observation", exact: true });
  await dialog.getByLabel("Observed at (UTC)", { exact: true }).fill(minutesAgo(0.5).slice(0, 16));
  await dialog.getByLabel("Remaining minutes", { exact: true }).fill("10");
  await dialog.getByRole("button", { name: "Save observation", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  // Persisted account detail is read back independently of the UI that submitted the mutation.
  const saved = await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id);
  expect(saved.events).toHaveLength(1);
  expect(saved.events[0].id).toBe(event.id);
  expect(saved.events[0].assigned_step).toBe(1);
  expect(saved.events[0].observations).toHaveLength(2);
  expect(new Set(saved.events[0].observations.map((observation) => observation.id)).size).toBe(2);
  expect(saved.events[0].observations.some((observation) => observation.id === event.observations[0].id)).toBe(true);
  expect(saved.events[0].observations.map((observation) => observation.remaining_minutes)).toEqual(expect.arrayContaining([20, 10]));
});

test("[REPORT-007] [US-041] [US-050] a backdated preview excludes later events without rewriting their saved assessments", async ({ fleetPage: page, trackedFleet }) => {
  // The existing recent assessment remains immutable after a newly reported earlier offence.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The previously accepted event is the immutable baseline against which the later report is compared.
  const existing = await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id);
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = await fillReport(page, trackedFleet.account.id, abandoning.id);
  await dialog.getByLabel("Cooldown start (UTC)", { exact: true }).fill(minutesAgo(30 * 1440).slice(0, 16));
  await dialog.getByLabel("Observed at (UTC)", { exact: true }).fill(minutesAgo(30 * 1440 - 1).slice(0, 16));
  // The accepted server preview supplies the assessment facts and revision tokens under test.
  const preview = await previewDialog(page, dialog);
  expect(preview.step).toBe(1);
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  // Persisted account detail is read back independently of the UI that submitted the mutation.
  const saved = await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id);
  expect(saved.events).toHaveLength(2);
  expect(saved.events.find((event) => event.id === existing.id)?.total_minutes).toBe(existing.total_minutes);
  expect(saved.events.find((event) => event.id === existing.id)?.assigned_step).toBe(existing.assigned_step);
  expect(saved.events.find((event) => event.id === existing.id)?.expires_at).toBe(existing.expires_at);
  // Later history was excluded from this earlier assessment's evidence count.
  expect(preview.sample_count).toBe(0);
  await page.getByRole("button", { name: "Calendar", exact: true }).click();
  // The earliest accepted event supplies the new calendar base regardless of query row ordering.
  const earliestStart = saved.events.map((event) => event.started_at).sort()[0];
  // UTC month/year text must describe the historical record rather than the former present range.
  const historicalMonth = new Date(earliestStart).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  await expect(page.getByRole("region", { name: "Cooldown calendar", exact: true }).getByRole("heading", { level: 3 }).first()).toHaveText(historicalMonth);
});

test("[REPORT-008] [US-054] concurrent evidence invalidates an old preview and re-review permits saving", async ({ fleetPage: page, trackedFleet }) => {
  // A real second write changes the account revision after the dialog's reviewed preview.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = await fillReport(page, trackedFleet.account.id, abandoning.id);
  await previewDialog(page, dialog);
  await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id);
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(dialog.getByRole("alert").first()).toContainText(/changed|review|preview/i);
  expect((await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id)).events).toHaveLength(1);
  await previewDialog(page, dialog);
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect((await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id)).events).toHaveLength(2);
});

test("[REPORT-009] [US-053] a real network failure retains the draft and a deliberate retry records once", async ({ fleetPage: page, trackedFleet }) => {
  // Offline mode rejects the browser's real connection; no mocked success or backend error is used.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = await fillReport(page, trackedFleet.account.id, abandoning.id, 17);
  await previewDialog(page, dialog);
  await page.context().setOffline(true);
  try {
    await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
    await expect(dialog.getByRole("alert").first()).toBeVisible();
    await expect(dialog.getByLabel("Minutes", { exact: true })).toHaveValue("17");
    await expect(dialog.getByRole("combobox", { name: "Steam account", exact: true })).toHaveValue(trackedFleet.account.id);
  } finally {
    await page.context().setOffline(false);
  }
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect((await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id)).events).toHaveLength(1);
});

test("[REPORT-010] [US-035] [US-053] identical request retries are idempotent and changed payload reuse conflicts", async ({ fleetPage: page, trackedFleet }) => {
  // Stable command identities make an unknown result safe to retry without inferring a new offence.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // This prepared command retains stable event and observation identities across deliberate retries.
  const command = await prepareCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id);
  // The mutation route is restricted to this case's own fleet.
  const path = `/api/fleets/${trackedFleet.fleet.id}/events/`;
  // The first response establishes the persisted event before an identical command is retried.
  const first = await csrfRequest(page.request, path, "POST", command);
  expect(first.status()).toBe(201);
  // The repeated response must acknowledge the existing event instead of creating another offence.
  const retry = await csrfRequest(page.request, path, "POST", command);
  expect(retry.status()).toBe(200);
  expect((await retry.json()).id).toBe((await first.json()).id);
  // This response tests conflicting reuse of an already accepted command identity.
  const changed = await csrfRequest(page.request, path, "POST", { ...command, remaining_minutes: 19 });
  expect(changed.status()).toBe(409);
  expect((await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id)).events).toHaveLength(1);
});
