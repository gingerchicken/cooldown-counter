import { expect, test } from "./fixtures";
import { accountDetail, csrfRequest, fillReport, readJson, recordCooldown, selectFleet } from "./support";
import type { components } from "@template/api-client";

test("[RULE-001] [US-037] [US-038] the five seeded reasons select game mechanisms without fabricating account history", async ({ fleetPage: page, trackedFleet }) => {
  // Defaults are asserted as this application's editable baseline, not as verified Valve policy.
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  // Each expected ladder is an editable application default expressed in whole elapsed minutes.
  const expectedSteps: Record<string, number[]> = {
    VACLive: [],
    Abandoning: [30, 120, 1440, 10080],
    "Team Damage": [30, 120, 1440, 10080],
    Kicking: [30, 120, 1440, 10080],
    GriefReports: [],
  };
  for (const [name, durations] of Object.entries(expectedSteps)) {
    // Each expected control and API ladder must refer to the same visible offence identity.
    await expect(page.getByRole("button", { name: `Edit ${name}`, exact: true })).toBeVisible();
    // Special game notices have no assumed stages. Ordinary reasons use the published bands.
    const policy = trackedFleet.types.find((definition) => definition.name === name)!.policy;
    expect(policy.steps).toEqual(durations);
    expect(policy.mechanism).toBe(name === "VACLive" ? "vacnet" : name === "GriefReports" ? "griefing" : "ordinary");
  }
  await expect(page.getByText("These are model inputs, not verified Valve guarantees.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Transition rules", exact: true })).toBeVisible();
  expect((await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id)).event_count).toBe(0);
});

test("[RULE-002] [US-042] [US-044] [US-046] create a labelled ladder with optional metadata and explicit duration units", async ({ fleetPage: page, trackedFleet }) => {
  // A real catalogue save proves draft unit conversions, short-code normalization and text escaping.
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await page.getByRole("button", { name: "Add offence type", exact: true }).click();
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = page.getByRole("dialog", { name: "Add offence type", exact: true });
  await dialog.getByLabel("Name", { exact: true }).fill("  Custom escalation  ");
  await dialog.getByLabel("Short code", { exact: true }).fill("cus");
  await dialog.getByRole("textbox", { name: "Note", exact: true }).fill("<strong>literal note</strong>");
  await dialog.getByLabel("Step 1 amount", { exact: true }).fill("90");
  await dialog.getByRole("combobox", { name: "Step 1 unit", exact: true }).selectOption("m");
  await dialog.getByRole("button", { name: "Add step", exact: true }).click();
  await dialog.getByLabel("Step 2 amount", { exact: true }).fill("2");
  await dialog.getByRole("combobox", { name: "Step 2 unit", exact: true }).selectOption("h");
  await dialog.getByRole("button", { name: "Save offence type", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Edit Custom escalation", exact: true })).toBeVisible();
  await expect(page.getByText("<strong>literal note</strong>", { exact: true })).toBeVisible();
  // The current server catalogue verifies that UI edits published exactly the intended definition.
  const definitions = await readJson<components["schemas"]["OffenceType"][]>(page.request, `/api/fleets/${trackedFleet.fleet.id}/types/`);
  // This newly persisted definition is selected by its intended label to verify metadata and policy conversion.
  const created = definitions.find((definition) => definition.name === "Custom escalation")!;
  expect(created.code).toBe("CUS");
  expect(created.policy.steps).toEqual([90, 120]);
  await selectFleet(page, trackedFleet.fleet.id);
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit Custom escalation", exact: true })).toBeVisible();
});

test("[RULE-003] [US-043] [US-046] empty duplicate and invalid-duration drafts receive feedback without publishing", async ({ fleetPage: page, trackedFleet }) => {
  // Neither a rejected label nor an invalid duration can create a partial offence definition.
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await page.getByRole("button", { name: "Add offence type", exact: true }).click();
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = page.getByRole("dialog", { name: "Add offence type", exact: true });
  await dialog.getByRole("button", { name: "Save offence type", exact: true }).click();
  await expect(dialog.getByRole("alert")).toHaveText("A name is required.");
  await dialog.getByLabel("Name", { exact: true }).fill("  aBaNdOnInG  ");
  await dialog.getByRole("button", { name: "Save offence type", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("already uses that name");
  await dialog.getByLabel("Name", { exact: true }).fill("Invalid duration draft");
  await dialog.getByLabel("Step 1 amount", { exact: true }).fill("0");
  await dialog.getByRole("button", { name: "Save offence type", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("positive whole-minute");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await readJson(page.request, `/api/fleets/${trackedFleet.fleet.id}/types/`)).toHaveLength(5);
});

test("[RULE-004] [US-045] [US-050] rename and policy publication preserve old totals while new predictions use the current revision", async ({ fleetPage: page, trackedFleet }) => {
  // The original event pins version one; metadata and a later policy use the same stable type UUID.
  const originalType = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The original accepted assessment pins policy version one before the model is edited.
  const originalEvent = await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, originalType.id);
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await page.getByRole("button", { name: "Edit Abandoning", exact: true }).click();
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = page.getByRole("dialog", { name: "Edit offence type", exact: true });
  await expect(dialog.getByLabel("Name", { exact: true })).toHaveValue("Abandoning");
  await dialog.getByLabel("Name", { exact: true }).fill("Renamed abandoning");
  await dialog.getByRole("textbox", { name: "Note", exact: true }).fill("Reviewed model revision.");
  // A numeric departure from the game rules requires choosing a custom fleet model.
  await dialog.getByRole("combobox", { name: "Cooldown model", exact: true }).selectOption("custom");
  await dialog.getByLabel("Step 1 amount", { exact: true }).fill("45");
  await dialog.getByRole("button", { name: "Save offence type", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Edit Renamed abandoning", exact: true })).toBeVisible();
  // The current server catalogue verifies that UI edits published exactly the intended definition.
  const definitions = await readJson<components["schemas"]["OffenceType"][]>(page.request, `/api/fleets/${trackedFleet.fleet.id}/types/`);
  // The current definition retains its stable UUID while exposing the newly published policy revision.
  const changed = definitions.find((definition) => definition.id === originalType.id)!;
  expect(changed.policy.number).toBe(2);
  expect(changed.policy.steps[0]).toBe(45);
  // The authoritative account response verifies persisted history independently of navigation state.
  const detail = await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id);
  expect(detail.events[0].id).toBe(originalEvent.id);
  expect(detail.events[0].policy_number).toBe(1);
  expect(detail.events[0].total_minutes).toBe(30);
  expect(detail.events[0].expires_at).toBe(originalEvent.expires_at);
  expect(detail.events[0].type_name).toBe("Renamed abandoning");
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await page.getByRole("button", { name: trackedFleet.account.tag, exact: true }).click();
  await expect(page.getByRole("table", { name: "Cooldown history", exact: true }).getByText(/30m/)).toBeVisible();
});

test("[RULE-005] [US-047] adding removing and cancelling steps retains a nonempty unpublished draft", async ({ fleetPage: page, trackedFleet }) => {
  // Step deletion renumbers draft positions, but the last surviving step cannot be removed.
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await page.getByRole("button", { name: "Add offence type", exact: true }).click();
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = page.getByRole("dialog", { name: "Add offence type", exact: true });
  await dialog.getByLabel("Name", { exact: true }).fill("Cancelled step draft");
  await dialog.getByRole("button", { name: "Add step", exact: true }).click();
  await dialog.getByRole("button", { name: "Add step", exact: true }).click();
  await dialog.getByRole("button", { name: "Remove step 2", exact: true }).click();
  await expect(dialog.getByLabel("Step 3 amount", { exact: true })).toHaveCount(0);
  await expect(dialog.getByLabel("Step 2 amount", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Remove step 2", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Remove step 1", exact: true })).toBeDisabled();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await readJson(page.request, `/api/fleets/${trackedFleet.fleet.id}/types/`)).toHaveLength(5);
});

test("[RULE-006] [US-048] archival requires fresh confirmation and preserves all historical evidence", async ({ fleetPage: page, trackedFleet }) => {
  // Archival is the selected safe alternative to the prototype's destructive type deletion.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The original event identity verifies that archival preserves historical evidence.
  const original = await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id);
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await page.getByRole("button", { name: "Archive Abandoning", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirm archive Abandoning", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirm archive Abandoning", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Archive Abandoning", exact: true }).click();
  await page.getByRole("button", { name: "Confirm archive Abandoning", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit Abandoning", exact: true })).toBeDisabled();
  // The authoritative account response verifies persisted history independently of navigation state.
  const detail = await accountDetail(page.request, trackedFleet.fleet.id, trackedFleet.account.id);
  expect(detail.events[0].id).toBe(original.id);
  expect(detail.events[0].observations).toHaveLength(1);
  // The report modal retains the actual draft and server preview used by this scenario.
  const report = await fillReport(page, trackedFleet.account.id, trackedFleet.types.find((definition) => definition.name === "Kicking")!.id);
  await expect(report.getByRole("combobox", { name: "Offence type", exact: true }).getByRole("option", { name: /Abandoning/ })).toHaveCount(0);
});

test("[RULE-007] [US-049] explicit alternate decay policies remain expiry anchored and omit uncalibrated confidence", async ({ fleetPage: page, trackedFleet }) => {
  // Full reset and no decay are now labelled policy choices; hidden start anchoring is not exposed.
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await page.getByRole("button", { name: "Edit Abandoning", exact: true }).click();
  // The named type editor keeps its actions separate from report and background controls.
  const editor = page.getByRole("dialog", { name: "Edit offence type", exact: true });
  // Alternative decay schedules belong to custom policies.
  await editor.getByRole("combobox", { name: "Cooldown model", exact: true }).selectOption("custom");
  await editor.getByRole("combobox", { name: "Decay mode", exact: true }).selectOption("full_reset");
  await editor.getByRole("button", { name: "Save offence type", exact: true }).click();
  await expect(editor).not.toBeVisible();
  // The current server catalogue verifies that UI edits published exactly the intended definition.
  const definitions = await readJson<components["schemas"]["OffenceType"][]>(page.request, `/api/fleets/${trackedFleet.fleet.id}/types/`);
  // This current definition confirms that the explicit full-reset mode was actually persisted.
  const reset = definitions.find((definition) => definition.name === "Abandoning")!;
  expect(reset.policy.decay_mode).toBe("full_reset");
  await page.getByRole("button", { name: "Edit Abandoning", exact: true }).click();
  await editor.getByRole("combobox", { name: "Decay mode", exact: true }).selectOption("none");
  await editor.getByRole("button", { name: "Save offence type", exact: true }).click();
  await expect(editor).not.toBeVisible();
  await expect(page.getByText("No decay", { exact: true })).toBeVisible();
  await expect(page.getByText(/high confidence|medium confidence/i)).toHaveCount(0);
  await expect(page.getByLabel(/Start anchor|Decay anchor/i)).toHaveCount(0);
});

test("[RULE-008] [US-036] an empty active catalogue blocks reports while archived definitions remain readable", async ({ fleetPage: page, trackedFleet }) => {
  // Real archive commands remove every type from eligibility without deleting its stable identity.
  for (const definition of trackedFleet.types) {
    // Each accepted archive response removes eligibility without deleting the stable type identity.
    const archived = await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/types/${definition.id}/archive/`, "POST", { expected_policy_id: definition.policy.id });
    expect(archived.status()).toBe(200);
  }
  await selectFleet(page, trackedFleet.fleet.id);
  await expect(page.getByRole("button", { name: "Report observation", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  expect(await readJson(page.request, `/api/fleets/${trackedFleet.fleet.id}/types/`)).toHaveLength(5);
});

test("[RULE-009] [US-053] a failed configuration save retains its draft and a deliberate retry publishes once", async ({ fleetPage: page, trackedFleet }) => {
  // Offline mode fails an actual write connection and does not fabricate a backend response.
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await page.getByRole("button", { name: "Add offence type", exact: true }).click();
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = page.getByRole("dialog", { name: "Add offence type", exact: true });
  await dialog.getByLabel("Name", { exact: true }).fill("Recovered configuration");
  await dialog.getByRole("textbox", { name: "Note", exact: true }).fill("Preserved after a failed connection.");
  await page.context().setOffline(true);
  try {
    await dialog.getByRole("button", { name: "Save offence type", exact: true }).click();
    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(dialog.getByLabel("Name", { exact: true })).toHaveValue("Recovered configuration");
    await expect(dialog.getByRole("textbox", { name: "Note", exact: true })).toHaveValue("Preserved after a failed connection.");
  } finally {
    await page.context().setOffline(false);
  }
  await dialog.getByRole("button", { name: "Save offence type", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  // The current server catalogue verifies that UI edits published exactly the intended definition.
  const definitions = await readJson<components["schemas"]["OffenceType"][]>(page.request, `/api/fleets/${trackedFleet.fleet.id}/types/`);
  expect(definitions.filter((definition) => definition.name === "Recovered configuration")).toHaveLength(1);
});
