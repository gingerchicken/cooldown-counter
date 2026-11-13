import { expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { ReportDialog } from "./ReportDialog";
import {
  accountFixture,
  eventFixture,
  fleetFixture,
  previewFixture,
  trackerFixture,
  typeFixture,
} from "./testing.fixtures";
import type { CooldownEvent } from "./types";
import "../styles.css";

it("[RQ-151 RQ-152 RQ-156 RQ-157 RQ-159 RQ-160 RQ-161 RQ-162 RQ-348] identifies selected report accounts and normalizes searchable identity choices", async () => {
  // Distinct account labels and digit suffixes make case, whitespace and exact native selection independently observable.
  const first = accountFixture({
      tag: "hbh_01",
      steam_id: "76561198012345678",
    }),
    second = accountFixture({
      id: "second-account",
      tag: "other_02",
      steam_id: "76561198099999999",
    });
  // No save can be accepted before the report has displayed its identity and explanation and obtained a server review.
  const screen = await render(
    <ReportDialog
      accounts={[first, second]}
      types={[typeFixture()]}
      api={trackerFixture()}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await expect
    .element(
      screen.getByText(
        "Record what you saw. The server derives the total from the policy and earlier saved assessments.",
        { exact: true },
      ),
    )
    .toBeVisible();
  await expect
    .element(
      screen.getByRole("combobox", { name: "Steam account", exact: true }),
    )
    .toHaveValue(first.id);
  // The native selected option supplies both the closed selector identity and the browser's selected state.
  const accountSelect = screen
    .getByRole("combobox", { name: "Steam account", exact: true })
    .element() as HTMLSelectElement;
  expect(accountSelect.selectedOptions[0].textContent).toBe(
    "[HB] hbh_01 · 76561198012345678",
  );
  for (const query of ["HBH_01", "123456", "  hbh_01  "]) {
    // The same target should survive normalized tag and external-ID queries while unrelated options disappear.
    await screen.getByRole("searchbox", { name: "Account search" }).fill(query);
    await expect
      .element(
        screen.getByRole("option", {
          name: "[HB] hbh_01 · 76561198012345678",
          exact: true,
        }),
      )
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByRole("option", {
          name: "[OT] other_02 · 76561198099999999",
          exact: true,
        }),
      )
      .not.toBeInTheDocument();
  }
});

it("[RQ-166 RQ-167 RQ-168 RQ-169 RQ-170 RQ-171 RQ-172 RQ-174 RQ-175] names report offence options with first duration, ladder size and searchable notes", async () => {
  // The search target has a distinct name, code, note and first duration, so each matching source can be exercised.
  const first = typeFixture(),
    target = typeFixture({
      id: "damage",
      name: "Team Damage",
      code: "TDM",
      note: "Friendly hits",
      policy: { ...typeFixture().policy, steps: [60, 240, 1440] },
    }),
    unrelated = typeFixture({
      id: "unrelated",
      name: "VACLive",
      code: "VAC",
      note: "Integrity review",
    });
  // Real native options retain the selected first type while a matching unselected target is filtered into view.
  const screen = await render(
    <ReportDialog
      accounts={[accountFixture()]}
      types={[first, target, unrelated]}
      api={trackerFixture()}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await expect
    .element(
      screen.getByRole("option", {
        name: "Abandoning · 30m · Left before the match ended · 4 steps",
        exact: true,
      }),
    )
    .toBeInTheDocument();
  for (const query of ["team dAmAgE", "tdm", "friendly", "  fRIENDLY  "]) {
    // These queries independently prove name/code/note normalization rather than only the selected-option retention rule.
    await screen.getByRole("searchbox", { name: "Offence search" }).fill(query);
    await expect
      .element(
        screen.getByRole("option", {
          name: "Team Damage · 1h · Friendly hits · 3 steps",
          exact: true,
        }),
      )
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByRole("option", {
          name: "VACLive · 30m · Integrity review · 4 steps",
          exact: true,
        }),
      )
      .not.toBeInTheDocument();
  }
  await screen
    .getByRole("combobox", { name: "Offence type", exact: true })
    .selectOptions(target.id);
  // The selected native option identifies the new offence without relying on an option's position or mutable name as a key.
  const offenceSelect = screen
    .getByRole("combobox", { name: "Offence type", exact: true })
    .element() as HTMLSelectElement;
  expect(offenceSelect.selectedOptions[0].textContent).toBe(
    "Team Damage · 1h · Friendly hits · 3 steps",
  );
});

it("[RQ-195 RQ-196 RQ-197 RQ-200 RQ-203 RQ-204 RQ-205 RQ-209 RQ-349] distinguishes a reviewed manual step from the automatic prediction and base state", async () => {
  // The backend supplies the automatic second step, followed by a forced third-step review that retains its predicted alternative.
  const api = trackerFixture({
    preview: vi
      .fn()
      .mockResolvedValueOnce(
        previewFixture({
          step: 2,
          total_minutes: 120,
          base_step: 1,
          sample_count: 3,
          transition: "Advance from current state 1 -> step 2.",
        }),
      )
      .mockResolvedValueOnce(
        previewFixture({
          step: 3,
          total_minutes: 1440,
          base_step: 1,
          sample_count: 3,
          transition: "Manual override -> step 3 (predicted step 2).",
        }),
      ),
  });
  // Only the authoritative review is mocked; range interaction and every rendered explanation are real UI behavior.
  const screen = await render(
    <ReportDialog
      accounts={[accountFixture()]}
      types={[typeFixture()]}
      api={api}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await screen
    .getByRole("button", { name: "Preview cooldown", exact: true })
    .click();
  await expect.element(screen.getByText("2h", { exact: true })).toBeVisible();
  await expect
    .element(screen.getByText("Step 2 of 4 · base state 1", { exact: true }))
    .toBeVisible();
  for (const label of [
    "Step 1: 30m",
    "Step 2: 2h",
    "Step 3: 1d",
    "Step 4: 7d",
  ]) {
    // Every configured position retains a text duration independently of severity color.
    await expect
      .element(screen.getByText(label, { exact: true }))
      .toBeVisible();
  }
  // Native keyboard movement selects an exact third position without fabricating a range change event.
  const slider = screen
    .getByRole("slider", { name: "Override step", exact: true })
    .element() as HTMLInputElement;
  slider.focus();
  await userEvent.keyboard("{End}{ArrowLeft}");
  await expect
    .element(screen.getByRole("slider", { name: "Override step", exact: true }))
    .toHaveValue("3");
  await expect
    .element(
      screen.getByText("Manual override: step 3. Review before recording.", {
        exact: true,
      }),
    )
    .toBeVisible();
  await screen
    .getByRole("button", { name: "Preview cooldown", exact: true })
    .click();
  await expect.element(screen.getByText("1d", { exact: true })).toBeVisible();
  await expect
    .element(
      screen.getByText("Manual override -> step 3 (predicted step 2).", {
        exact: true,
      }),
    )
    .toBeVisible();
  await expect
    .element(screen.getByText("Step 3 of 4 · base state 1", { exact: true }))
    .toBeVisible();
});

it("[RQ-206 RQ-207] snaps real pointer dragging to the nearest native range step and clamps beyond both endpoints", async () => {
  // Four discrete positions make the midpoint between steps two and three an observable drag boundary.
  const screen = await render(
    <ReportDialog
      accounts={[accountFixture()]}
      types={[typeFixture()]}
      api={trackerFixture()}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  // The actual track rectangle supplies pixel coordinates for provider-backed pointer actions.
  const slider = screen.getByRole("slider", {
      name: "Override step",
      exact: true,
    }),
    element = slider.element() as HTMLInputElement;
  element.scrollIntoView({ block: "center" });
  // Width and middleY are local track pixels; the starting point is inside the native first-position thumb.
  const width = element.getBoundingClientRect().width,
    middleY = element.getBoundingClientRect().height / 2;
  await userEvent.pointer([
    { target: slider, coords: { x: 8, y: middleY }, keys: "[MouseLeft>]" },
    { target: slider, coords: { x: width * 0.49, y: middleY } },
  ]);
  await expect.element(slider).toHaveValue("2");
  await userEvent.pointer({
    target: slider,
    coords: { x: width * 0.51, y: middleY },
  });
  await expect.element(slider).toHaveValue("3");
  // Drag outside the track through the surrounding dialog instead of asking the provider to hit an impossible slider-local point.
  const dialog = element.closest("dialog")!,
    trackBounds = element.getBoundingClientRect(),
    dialogBounds = dialog.getBoundingClientRect();
  await userEvent.pointer({
    target: dialog,
    coords: {
      x: trackBounds.right - dialogBounds.left + 10,
      y: trackBounds.top - dialogBounds.top + middleY,
    },
  });
  await expect.element(slider).toHaveValue("4");
  await userEvent.pointer({
    target: dialog,
    coords: {
      x: trackBounds.left - dialogBounds.left - 10,
      y: trackBounds.top - dialogBounds.top + middleY,
    },
    keys: "[/MouseLeft]",
  });
  await expect.element(slider).toHaveValue("1");
});

it("[RQ-177 RQ-208] clears another offence's override and keeps a one-step ladder inside its sole valid position", async () => {
  // A one-step second type proves changing ladders cannot retain the first type's fourth-step override.
  const first = typeFixture(),
    second = typeFixture({
      id: "sole-type",
      name: "One step",
      policy: { ...typeFixture().policy, steps: [60] },
    });
  // Real native range controls exercise first/final clamping without setting a fabricated range value.
  const screen = await render(
    <ReportDialog
      accounts={[accountFixture()]}
      types={[first, second]}
      api={trackerFixture()}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  // The focused native range interprets Home/End and arrows using the newly selected ladder's bounds.
  const slider = screen
    .getByRole("slider", { name: "Override step", exact: true })
    .element() as HTMLInputElement;
  slider.focus();
  await userEvent.keyboard("{End}");
  await expect
    .element(
      screen.getByRole("textbox", { name: "Override reason", exact: true }),
    )
    .toBeVisible();
  await screen
    .getByRole("combobox", { name: "Offence type", exact: true })
    .selectOptions(second.id);
  await expect
    .element(
      screen.getByRole("textbox", { name: "Override reason", exact: true }),
    )
    .not.toBeInTheDocument();
  slider.focus();
  await userEvent.keyboard("{Home}{ArrowLeft}{End}{ArrowRight}");
  await expect
    .element(screen.getByRole("slider", { name: "Override step", exact: true }))
    .toHaveValue("1");
  await expect
    .element(screen.getByText("Step 1: 1h", { exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByText("Step 2: 2h", { exact: true }))
    .not.toBeInTheDocument();
});

it("[RQ-214 RQ-219] identifies incompatible evidence and records the exact currently selected offence after review", async () => {
  // Initial 90-minute evidence exceeds the first 30-minute total; a second selected type accepts a two-hour total.
  const target = typeFixture({
      id: "damage",
      name: "Team Damage",
      policy: { ...typeFixture().policy, steps: [120] },
    }),
    api = trackerFixture({
      preview: vi
        .fn()
        .mockResolvedValueOnce(previewFixture())
        .mockResolvedValueOnce(previewFixture({ total_minutes: 120 })),
    });
  // The save callback captures the server-accepted event while the adapter call proves the chosen offence UUID is transmitted.
  const saved = vi.fn(),
    screen = await render(
      <ReportDialog
        accounts={[accountFixture()]}
        types={[typeFixture(), target]}
        api={api}
        fleetId={fleetFixture().id}
        onDismiss={vi.fn()}
        onSaved={saved}
      />,
    );
  await screen
    .getByRole("spinbutton", { name: "Minutes", exact: true })
    .fill("90");
  await screen
    .getByRole("button", { name: "Preview cooldown", exact: true })
    .click();
  await expect
    .element(
      screen.getByText("1h 30m remaining exceeds the 30m total at step 1.", {
        exact: true,
      }),
    )
    .toBeVisible();
  await screen
    .getByRole("combobox", { name: "Offence type", exact: true })
    .selectOptions(target.id);
  await screen
    .getByRole("button", { name: "Preview cooldown", exact: true })
    .click();
  await screen
    .getByRole("button", { name: "Record cooldown", exact: true })
    .click();
  expect(api.record).toHaveBeenCalledWith(
    fleetFixture().id,
    expect.objectContaining({ type_id: target.id, remaining_minutes: 90 }),
  );
  expect(saved).toHaveBeenCalledOnce();
});

it("[RQ-029] limits the submitted report draft to domain evidence and revision fields", async () => {
  // The public report payload is an allowlist boundary: authentication credentials belong only to session transport.
  const api = trackerFixture();
  // A reviewed normal report exercises the actual request construction without introducing any test-only draft serializer.
  const screen = await render(
    <ReportDialog
      accounts={[accountFixture()]}
      types={[typeFixture()]}
      api={api}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await screen
    .getByRole("button", { name: "Preview cooldown", exact: true })
    .click();
  await screen
    .getByRole("button", { name: "Record cooldown", exact: true })
    .click();
  // submitted is the complete real adapter request; its exact keys exclude passwords, session tokens and credential snapshots.
  const submitted = vi.mocked(api.record).mock.calls[0][1];
  expect(Object.keys(submitted).sort()).toEqual([
    "account_id",
    "history_revision",
    "id",
    "observation_id",
    "observed_at",
    "override_reason",
    "policy_id",
    "remaining_minutes",
    "started_at",
    "type_id",
  ]);
  expect(
    screen
      .getByRole("dialog", { name: "Report an observation", exact: true })
      .element()
      .querySelector('input[type="password"]'),
  ).toBeNull();
});

it("[RQ-314] keeps an unresolved save visibly pending and never announces completion before acceptance", async () => {
  // resolveRecord belongs to this one deferred write, making the pending and accepted states independently observable.
  let resolveRecord!: (event: CooldownEvent) => void;
  // The adapter promise deliberately remains pending until the browser assertions inspect the locked draft.
  const api = trackerFixture({
      record: vi.fn().mockImplementation(
        () =>
          new Promise<CooldownEvent>((resolve) => {
            resolveRecord = resolve;
          }),
      ),
    }),
    saved = vi.fn();
  // Busy controls must prevent cancellation or duplicate writes without losing the entered evidence.
  const screen = await render(
    <ReportDialog
      accounts={[accountFixture()]}
      types={[typeFixture()]}
      api={api}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={saved}
    />,
  );
  await screen
    .getByRole("button", { name: "Preview cooldown", exact: true })
    .click();
  await screen
    .getByRole("button", { name: "Record cooldown", exact: true })
    .click();
  await expect
    .element(
      screen.getByRole("button", {
        name: "Recording cooldown...",
        exact: true,
      }),
    )
    .toBeDisabled();
  await expect
    .element(
      screen.getByRole("button", {
        name: "Close Report an observation",
        exact: true,
      }),
    )
    .toBeDisabled();
  await expect
    .element(screen.getByRole("button", { name: "Cancel", exact: true }))
    .toBeDisabled();
  expect(saved).not.toHaveBeenCalled();
  resolveRecord(eventFixture());
  await expect.poll(() => saved.mock.calls.length).toBe(1);
});

it("[RQ-334 RQ-335 RQ-336 RQ-164 RQ-178 RQ-347] selects report account and offence through actual keyboard controls with visible focus", async () => {
  // The first selected identity is deliberately different from the keyboard search target.
  const first = accountFixture({ tag: "other" }),
    target = accountFixture({ id: "target", tag: "hbh_01" }),
    firstType = typeFixture(),
    targetType = typeFixture({ id: "damage", name: "Team Damage" });
  // Native modal focus starts at the intended first editable field, without pointer input.
  const screen = await render(
    <ReportDialog
      accounts={[first, target]}
      types={[firstType, targetType]}
      api={trackerFixture()}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await expect
    .element(screen.getByRole("searchbox", { name: "Account search" }))
    .toHaveFocus();
  await userEvent.keyboard("HBH_01{Tab}{Alt>}{ArrowDown}{/Alt}");
  // The real native popup exposes its open state before keyboard acceptance closes it again.
  const accountSelect = screen
    .getByRole("combobox", { name: "Steam account", exact: true })
    .element();
  expect(accountSelect.matches(":open")).toBe(true);
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect
    .element(
      screen.getByRole("combobox", { name: "Steam account", exact: true }),
    )
    .toHaveValue(target.id);
  // The focused closed control remains visibly identified after its native picker accepts the selection.
  expect(accountSelect.matches(":open")).toBe(false);
  expect(getComputedStyle(accountSelect).outlineStyle).toBe("solid");
  expect(getComputedStyle(accountSelect).outlineWidth).not.toBe("0px");
  // Native date fields have internal keyboard segments, so advance until the next named search rather than assuming a fixed Tab count.
  const offenceSearch = screen
    .getByRole("searchbox", { name: "Offence search", exact: true })
    .element();
  for (
    let tabCount = 0;
    document.activeElement !== offenceSearch && tabCount < 20;
    tabCount += 1
  ) {
    // tabCount bounds this genuine keyboard traversal; each focused control must retain a visible outline.
    await userEvent.keyboard("{Tab}");
    expect(
      getComputedStyle(document.activeElement!).outlineStyle,
      document.activeElement?.outerHTML,
    ).toBe("solid");
  }
  expect(document.activeElement).toBe(offenceSearch);
  await userEvent.keyboard("team damage{Tab}{Alt>}{ArrowDown}{/Alt}");
  expect(
    screen
      .getByRole("combobox", { name: "Offence type", exact: true })
      .element()
      .matches(":open"),
  ).toBe(true);
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect
    .element(
      screen.getByRole("combobox", { name: "Offence type", exact: true }),
    )
    .toHaveValue(targetType.id);
  // The native picker has closed while its selected identity and keyboard focus remain available.
  const typeSelect = screen
    .getByRole("combobox", { name: "Offence type", exact: true })
    .element();
  expect(typeSelect.matches(":open")).toBe(false);
  expect(document.activeElement).toBe(typeSelect);
});
