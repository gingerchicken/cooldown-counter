import { expect, signInThroughForm, test } from "./fixtures";
import { expectOuterPageFits, fillReport, previewDialog, recordCooldown, selectFleet } from "./support";

test("[INCLUDE-001] [US-057] [US-060] labelled controls and keyboard activation complete a real report", async ({ fleetPage: page, trackedFleet }) => {
  // Native account navigation can be focused and activated without a mouse click.
  await page.getByRole("button", { name: "Accounts", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: trackedFleet.account.tag, exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: trackedFleet.account.tag, exact: true, level: 2 })).toBeVisible();
  // This seeded Abandoning definition supplies the real policy UUID used by this scenario.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = await fillReport(page, trackedFleet.account.id, abandoning.id);
  // The native range is the keyboard-operable override control, rather than a decorative slider.
  const override = dialog.getByLabel("Override step", { exact: true });
  await override.focus();
  await override.press("Home");
  await override.press("ArrowRight");
  await expect(override).toHaveValue("2");
  await dialog.getByRole("textbox", { name: "Override reason", exact: true }).fill("Keyboard-selected observed step.");
  // The accepted server preview supplies the assessment facts and revision tokens under test.
  const preview = await previewDialog(page, dialog);
  expect(preview.step).toBe(2);
  await dialog.getByRole("button", { name: "Record cooldown", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("table", { name: "Cooldown history", exact: true }).getByText("Override reason: Keyboard-selected observed step.", { exact: true })).toBeVisible();
});

test("[INCLUDE-002] [US-059] native modal focus remains contained and returns to its launcher", async ({ fleetPage: page }) => {
  // A native modal makes background controls inert and exposes a named dialog boundary.
  const launcher = page.getByRole("button", { name: "Report observation", exact: true });
  await launcher.click();
  // The named modal scopes field and action queries away from the mounted background workspace.
  const dialog = page.getByRole("dialog", { name: "Report an observation", exact: true });
  await expect(dialog.getByLabel("Account search", { exact: true })).toBeFocused();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).focus();
  await page.keyboard.press("Tab");
  // Native browsers may stop at browser chrome before wrapping back into modal web content.
  if (await page.evaluate(() => document.activeElement === document.body)) {
    // Returning from that chrome stop must still skip every inert background application control.
    await page.keyboard.press("Tab");
  }
  // The native dialog itself is also a valid focus target after returning from browser chrome.
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(launcher).toBeFocused();
});

test("[INCLUDE-003] [US-062] narrow screens and enlarged text retain reachable account and dialog actions", async ({ fleetPage: page, trackedFleet }) => {
  // This checks real responsive layout at 390 CSS pixels, not a mocked viewport calculation.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await page.getByRole("button", { name: trackedFleet.account.tag, exact: true }).click();
  await expect(page.getByRole("heading", { name: trackedFleet.account.tag, exact: true, level: 2 })).toBeVisible();
  // Text enlargement is a layout smoke scenario, not an accessibility-conformance certification.
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  // This seeded Abandoning definition supplies the real policy UUID used by this scenario.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The report modal retains the actual draft and server preview used by this scenario.
  const report = await fillReport(page, trackedFleet.account.id, abandoning.id);
  await previewDialog(page, report);
  await report.getByRole("button", { name: "Record cooldown", exact: true }).scrollIntoViewIfNeeded();
  await expect(report.getByRole("button", { name: "Record cooldown", exact: true })).toBeInViewport();
  await report.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await page.getByRole("button", { name: "Edit Abandoning", exact: true }).click();
  // The named type editor keeps its actions separate from report and background controls.
  const editor = page.getByRole("dialog", { name: "Edit offence type", exact: true });
  await editor.getByRole("button", { name: "Save offence type", exact: true }).scrollIntoViewIfNeeded();
  await expect(editor.getByRole("button", { name: "Save offence type", exact: true })).toBeInViewport();
  await editor.getByRole("button", { name: "Cancel", exact: true }).click();
  // Horizontal scrolling inside a labelled table/calendar is allowed; the outer page must fit.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("[INCLUDE-004] [US-063] reduced-motion users retain modal and present-day navigation outcomes", async ({ fleetPage: page, trackedFleet }) => {
  // The actual browser media preference reaches both CSS and the calendar scrolling branch.
  await page.emulateMedia({ reducedMotion: "reduce" });
  // This seeded Abandoning definition supplies the real policy UUID used by this scenario.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The report modal retains the actual draft and server preview used by this scenario.
  const report = await fillReport(page, trackedFleet.account.id, abandoning.id);
  await expect(report).toBeVisible();
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  await report.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Jump to today", exact: true }).click();
  await expect(page.getByText("NOW", { exact: true })).toBeInViewport();
});

test("[INCLUDE-005] [US-058] a touch-enabled browser can choose an override step without mouse-only dragging", async ({ browser, baseURL, account, trackedFleet }) => {
  // A separate real touch-capable context exercises the same production native range control.
  const touchContext = await browser.newContext({ baseURL, hasTouch: true, viewport: { width: 390, height: 844 } });
  try {
    // This page belongs to the separately isolated touch context and uses its own real cookie session.
    const page = await touchContext.newPage();
    await signInThroughForm(page, account);
    await selectFleet(page, trackedFleet.fleet.id);
    // This seeded Abandoning definition supplies the real policy UUID used by this scenario.
    const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
    // The report modal retains the actual draft and server preview used by this scenario.
    const report = await fillReport(page, trackedFleet.account.id, abandoning.id);
    // The native override range exposes the selected one-based ladder position.
    const range = report.getByLabel("Override step", { exact: true });
    await range.scrollIntoViewIfNeeded();
    // Actual CSS-pixel range bounds determine a real touch target within the visible control.
    const bounds = await range.boundingBox();
    expect(bounds).not.toBeNull();
    await range.tap({ position: { x: bounds!.width - 8, y: bounds!.height / 2 } });
    await expect(range).not.toHaveValue("1");
    await report.getByRole("textbox", { name: "Override reason", exact: true }).fill("Touch-selected observed step.");
    // The accepted server preview supplies the assessment facts and revision tokens under test.
    const preview = await previewDialog(page, report);
    expect(preview.step).toBeGreaterThan(1);
  } finally {
    await touchContext.close();
  }
});

test("[INCLUDE-006] [US-061] textual status and announced validation retain meaning without severity colors", async ({ fleetPage: page, trackedFleet }) => {
  // Removing appearance colors proves that named states and durations carry the domain meaning.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id, { forcedStep: 2 });
  await selectFleet(page, trackedFleet.fleet.id);
  await page.addStyleTag({ content: "* { color: black !important; background-color: white !important; border-color: black !important; }" });
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await expect(page.getByRole("region", { name: "Accounts table", exact: true }).getByText("On cooldown", { exact: true })).toBeVisible();
  // The report modal retains the actual draft and server preview used by this scenario.
  const report = await fillReport(page, trackedFleet.account.id, abandoning.id);
  await previewDialog(page, report);
  await report.getByLabel("Minutes", { exact: true }).fill("0");
  await report.getByRole("button", { name: "Record cooldown", exact: true }).click();
  await expect(report.getByRole("alert")).toContainText("positive whole-minute");
  await expect(report.getByLabel("Remaining duration", { exact: true })).toContainText("positive whole-minute");
});

test("[INCLUDE-007] [US-062] the agreed desktop and mobile baseline retains records and actions at 200 percent text", async ({ fleetPage: page, trackedFleet }) => {
  // Ten complete layout checks have a bounded allowance while each failed assertion still times out normally.
  test.setTimeout(120_000);
  // A genuine saved restriction makes calendar and history reachability observable at every tested width.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id, { forcedStep: 2 });
  await selectFleet(page, trackedFleet.fleet.id);
  // Widths sample the agreed 320-pixel minimum, phone, tablet, compact desktop and wide desktop layouts.
  for (const width of [320, 390, 768, 1024, 1440]) {
    // Both normal and doubled root text must preserve real controls without replacing them with test fixtures.
    for (const textPercent of [100, 200]) {
      await test.step(`${width} CSS pixels with ${textPercent}% text`, async () => {
        // Actual viewport and font metrics exercise the shipped stylesheet rather than a simulated layout helper.
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate((percent) => {
          // percent enlarges inherited text while preserving browser-native input and scrolling behavior.
          document.documentElement.style.fontSize = `${percent}%`;
        }, textPercent);
        await page.getByRole("button", { name: "Calendar", exact: true }).click();
        await page.getByRole("button", { name: "Jump to today", exact: true }).click();
        // One exact recorded bar must remain focusable even when the calendar uses its labelled horizontal scroller.
        const recorded = page.getByRole("button", { name: new RegExp(`^${trackedFleet.account.tag} Abandoning,`) }).first();
        await recorded.scrollIntoViewIfNeeded();
        await recorded.focus();
        await expect(recorded).toBeInViewport();
        await expect(recorded).toBeFocused();
        await expectOuterPageFits(page);
        await page.getByRole("button", { name: "Accounts", exact: true }).click();
        // The last table column must be reachable inside its horizontal scroller, not merely present off-screen.
        const accountEstimate = page.getByRole("region", { name: "Accounts table", exact: true }).getByText(/highest current estimate/).first();
        await accountEstimate.scrollIntoViewIfNeeded();
        await expect(accountEstimate).toBeInViewport();
        await page.getByRole("button", { name: trackedFleet.account.tag, exact: true }).click();
        // The exact external profile and retained history demonstrate that detail content remains reachable.
        await page.getByRole("link", { name: /Open on Steam/ }).scrollIntoViewIfNeeded();
        await expect(page.getByRole("link", { name: /Open on Steam/ })).toBeInViewport();
        await expect(page.getByRole("table", { name: "Cooldown history", exact: true })).toBeVisible();
        // The saved total is a rightward history column and must remain reachable with enlarged text too.
        const historyTotal = page.getByRole("table", { name: "Cooldown history", exact: true }).getByRole("cell", { name: "2h", exact: true });
        await historyTotal.scrollIntoViewIfNeeded();
        await expect(historyTotal).toBeInViewport();
        await expectOuterPageFits(page);
        // The real preview verifies that report inputs remain usable before checking both final actions.
        const report = await fillReport(page, trackedFleet.account.id, abandoning.id);
        await previewDialog(page, report);
        await report.getByRole("button", { name: "Record cooldown", exact: true }).scrollIntoViewIfNeeded();
        await expect(report.getByRole("button", { name: "Record cooldown", exact: true })).toBeInViewport();
        await report.getByRole("button", { name: "Cancel", exact: true }).click();
        await page.getByRole("button", { name: "Cooldowns", exact: true }).click();
        await page.getByRole("button", { name: "Edit Abandoning", exact: true }).click();
        // The native editor's final actions must remain reachable after its complete ladder and rule inputs.
        const editor = page.getByRole("dialog", { name: "Edit offence type", exact: true });
        await editor.getByRole("button", { name: "Save offence type", exact: true }).scrollIntoViewIfNeeded();
        await expect(editor.getByRole("button", { name: "Save offence type", exact: true })).toBeInViewport();
        await editor.getByRole("button", { name: "Cancel", exact: true }).click();
        await expectOuterPageFits(page);
      });
    }
  }
});
