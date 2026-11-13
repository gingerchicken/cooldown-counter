import { expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { TypeReference } from "./TypeReference";
import { CooldownHistory } from "./CooldownHistory";
import { TypeEditor } from "./TypeEditor";
import { ReportDialog } from "./ReportDialog";
import { FilterBar } from "./FilterBar";
import { FleetWorkspace } from "./FleetWorkspace";
import { Modal } from "./Modal";
import { EMPTY_FILTERS } from "./filters";
import {
  accountFixture,
  eventFixture,
  fleetFixture,
  trackerFixture,
  typeFixture,
} from "./testing.fixtures";
import type { OffenceType } from "./types";
import "../styles.css";

it("[RQ-228 RQ-231 RQ-232 RQ-233 RQ-234 RQ-254 RQ-305 RQ-332] explains ordered, bounded and explicitly modelled current offence policies", async () => {
  // Three distinct effective modes must explain their own window semantics without substituting a global rule.
  const first = typeFixture(),
    second = typeFixture({
      id: "reset",
      name: "Kicking",
      policy: {
        ...typeFixture().policy,
        clean_window_days: 3,
        decay_mode: "full_reset",
      },
    }),
    third = typeFixture({
      id: "fixed",
      name: "VACLive",
      policy: { ...typeFixture().policy, decay_mode: "none" },
    });
  // The real reference renders the saved catalogue and preserves one-based duration order.
  const screen = await render(
    <TypeReference
      types={[first, second, third]}
      canWrite
      api={trackerFixture()}
      fleetId={fleetFixture().id}
      onEdit={vi.fn()}
      onChanged={vi.fn()}
    />,
  );
  await expect
    .element(screen.getByText("3 active offence types", { exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("heading", { name: "Kicking ABD", exact: true }))
    .toBeVisible();
  // The named card scopes step order to one policy rather than accepting another ladder's coincidental labels.
  const card = screen
    .getByRole("heading", { name: "Abandoning ABD", exact: true })
    .element()
    .closest("article")!;
  expect(
    Array.from(card.querySelectorAll("ol > li")).map(
      (step) => step.textContent,
    ),
  ).toEqual(["30mStep 1", "2hStep 2", "1dStep 3", "7dStep 4", "Then holds"]);
  await expect
    .element(
      screen.getByText("7 clean days · step down one level", { exact: true }),
    )
    .toBeVisible();
  await expect
    .element(screen.getByText("3 clean days · full reset", { exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByText("No decay", { exact: true }))
    .toBeVisible();
  await expect
    .element(
      screen.getByText(
        "These are model inputs, not verified Valve guarantees.",
        { exact: true },
      ),
    )
    .toBeVisible();
  // The shared explanation must identify the approved expiry anchor, elapsed complete windows and floor zero.
  const rules =
    screen
      .getByRole("heading", { name: "Transition rules", exact: true })
      .element()
      .closest("section")!.textContent ?? "";
  expect(rules).toContain("latest outstanding expiry");
  expect(rules).toMatch(/full.*clean.*window|complete.*clean.*window/i);
  expect(rules).toMatch(/minimum.*zero|floor.*zero|minimum.*0/i);
});

it("[RQ-271 RQ-275 RQ-284 RQ-292] prepopulates editable metadata and previews exact durations with bounded short codes", async () => {
  // The accepted definition supplies editable metadata and independent ordered whole-minute steps.
  const definition = typeFixture({
    name: "Kicking",
    code: "KCK",
    note: "Removed by vote",
    policy: { ...typeFixture().policy, steps: [30, 120] },
  });
  // The editor's real native controls preserve source values while the unsaved draft changes independently.
  const screen = await render(
    <TypeEditor
      definition={definition}
      types={[definition]}
      api={trackerFixture()}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await expect
    .element(screen.getByRole("textbox", { name: "Name", exact: true }))
    .toHaveValue("Kicking");
  await expect
    .element(screen.getByRole("textbox", { name: "Short code", exact: true }))
    .toHaveValue("KCK");
  await expect
    .element(screen.getByRole("textbox", { name: "Note", exact: true }))
    .toHaveValue("Removed by vote");
  await screen
    .getByRole("textbox", { name: "Short code", exact: true })
    .fill("");
  await screen
    .getByRole("textbox", { name: "Short code", exact: true })
    .click();
  await userEvent.keyboard("GRIEF");
  await expect
    .element(screen.getByRole("textbox", { name: "Short code", exact: true }))
    .toHaveValue("GRIE");
  await screen
    .getByRole("spinbutton", { name: "Step 2 amount", exact: true })
    .fill("1.5");
  // The second row's formatted duration is checked beside its own quantity/unit controls.
  const secondStep = screen
    .getByRole("spinbutton", { name: "Step 2 amount", exact: true })
    .element()
    .closest(".step-editor")!;
  expect(secondStep.textContent).toContain("1h 30m");
  await expect
    .element(
      screen.getByText(
        "Changing units reinterprets the amount. Preview shows the exact saved duration. Then holds at the final step.",
        { exact: true },
      ),
    )
    .toBeVisible();
  expect(definition.code).toBe("KCK");
  expect(definition.policy.steps).toEqual([30, 120]);
});

it("[RQ-279 RQ-280] preserves selected offence UUIDs while refreshed catalogue metadata updates filter and report labels", async () => {
  // A metadata rename preserves the stable domain identity used by both unsaved reporting and active filters.
  const before = typeFixture({ name: "VACLive" }),
    after = { ...before, name: "Anti-cheat" },
    filters = { ...EMPTY_FILTERS, typeIds: [before.id] };
  // A parent refresh updates the controlled catalogue without remounting either local selection.
  const filter = await render(
    <FilterBar
      accounts={[]}
      types={[before]}
      filters={filters}
      onChange={vi.fn()}
    />,
  );
  await expect
    .element(filter.getByText("VACLive", { exact: true }).first())
    .toBeVisible();
  await filter.rerender(
    <FilterBar
      accounts={[]}
      types={[after]}
      filters={filters}
      onChange={vi.fn()}
    />,
  );
  await expect
    .element(filter.getByText("Anti-cheat", { exact: true }).first())
    .toBeVisible();
  await filter.unmount();
  // The real report also resolves its selected UUID from current props instead of retaining a stale human label.
  const api = trackerFixture(),
    report = await render(
      <ReportDialog
        accounts={[accountFixture()]}
        types={[before]}
        api={api}
        fleetId={fleetFixture().id}
        onDismiss={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
  await report.rerender(
    <ReportDialog
      accounts={[accountFixture()]}
      types={[after]}
      api={api}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await expect
    .element(
      report.getByRole("combobox", { name: "Offence type", exact: true }),
    )
    .toHaveValue(before.id);
  expect(
    (
      report
        .getByRole("combobox", { name: "Offence type", exact: true })
        .element() as HTMLSelectElement
    ).selectedOptions[0].textContent,
  ).toContain("Anti-cheat");
  expect(
    (
      report
        .getByRole("combobox", { name: "Offence type", exact: true })
        .element() as HTMLSelectElement
    ).selectedOptions[0].textContent,
  ).not.toContain("VACLive");
});

it("[RQ-298 RQ-299] clears armed archive confirmation after acceptance and when editing begins", async () => {
  // Confirmation must belong to one deliberate action; completing or switching purpose cannot arm a later write.
  const api = trackerFixture(),
    edit = vi.fn(),
    changed = vi.fn(),
    definition = typeFixture();
  // The same mounted reference is retained so this checks actual state clearing rather than a fresh default.
  const screen = await render(
    <TypeReference
      types={[definition]}
      canWrite
      api={api}
      fleetId={fleetFixture().id}
      onEdit={edit}
      onChanged={changed}
    />,
  );
  await screen
    .getByRole("button", { name: "Archive Abandoning", exact: true })
    .click();
  await screen
    .getByRole("button", { name: "Edit Abandoning", exact: true })
    .click();
  expect(edit).toHaveBeenCalledWith(definition);
  await expect
    .element(
      screen.getByRole("button", {
        name: "Confirm archive Abandoning",
        exact: true,
      }),
    )
    .not.toBeInTheDocument();
  await screen
    .getByRole("button", { name: "Archive Abandoning", exact: true })
    .click();
  await screen
    .getByRole("button", { name: "Confirm archive Abandoning", exact: true })
    .click();
  expect(changed).toHaveBeenCalledOnce();
  await expect
    .element(
      screen.getByRole("button", {
        name: "Confirm archive Abandoning",
        exact: true,
      }),
    )
    .not.toBeInTheDocument();
  await expect
    .element(
      screen.getByRole("button", { name: "Archive Abandoning", exact: true }),
    )
    .toBeEnabled();
});

it("[RQ-300] discards armed archive state when the authenticated workspace is disposed and remounted", async () => {
  // The session gate owns workspace lifetime; this boundary test verifies no confirmation survives that disposal.
  const api = trackerFixture(),
    fleet = fleetFixture(),
    signOut = vi.fn().mockResolvedValue(undefined),
    props = {
      api,
      fleet,
      fleets: [fleet],
      user: { id: 1, username: "operator" },
      onFleet: vi.fn(),
      onCreateFleet: vi.fn(),
      onFleetsChanged: vi.fn(),
      onSignOut: signOut,
    };
  // The initial authenticated mount reaches a real armed confirmation through actual navigation and actions.
  const first = await render(<FleetWorkspace {...props} />);
  await first.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await first
    .getByRole("button", { name: "Archive Abandoning", exact: true })
    .click();
  await expect
    .element(
      first.getByRole("button", {
        name: "Confirm archive Abandoning",
        exact: true,
      }),
    )
    .toBeVisible();
  await first.getByRole("button", { name: "Sign out", exact: true }).click();
  expect(signOut).toHaveBeenCalledOnce();
  await first.unmount();
  // A fresh authenticated workspace follows the same lifecycle boundary already exercised by App's session tests.
  const second = await render(<FleetWorkspace {...props} />);
  await second.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await expect
    .element(
      second.getByRole("button", {
        name: "Confirm archive Abandoning",
        exact: true,
      }),
    )
    .not.toBeInTheDocument();
  await second
    .getByRole("button", { name: "Archive Abandoning", exact: true })
    .click();
  expect(api.archiveType).not.toHaveBeenCalled();
  await expect
    .element(
      second.getByRole("button", {
        name: "Confirm archive Abandoning",
        exact: true,
      }),
    )
    .toBeVisible();
});

it("[RQ-321] retains the accepted type and clears confirmation after an authoritative archive rejection", async () => {
  // A rejected command must show a recoverable error while leaving the catalogue and dependent history untouched.
  const api = trackerFixture({
      archiveType: vi.fn().mockRejectedValue(new Error("Archive was rejected")),
    }),
    changed = vi.fn();
  // The actual second archive action reaches the failed API boundary; merely arming it is not a write.
  const screen = await render(
    <TypeReference
      types={[typeFixture({ event_count: 7 })]}
      canWrite
      api={api}
      fleetId={fleetFixture().id}
      onEdit={vi.fn()}
      onChanged={changed}
    />,
  );
  await screen
    .getByRole("button", { name: "Archive Abandoning", exact: true })
    .click();
  await screen
    .getByRole("button", { name: "Confirm archive Abandoning", exact: true })
    .click();
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Archive was rejected");
  await expect
    .element(
      screen.getByRole("heading", { name: "Abandoning ABD", exact: true }),
    )
    .toBeVisible();
  await expect
    .element(
      screen.getByText("7 recorded cooldowns · policy v1", { exact: true }),
    )
    .toBeVisible();
  await expect
    .element(
      screen.getByRole("button", {
        name: "Confirm archive Abandoning",
        exact: true,
      }),
    )
    .not.toBeInTheDocument();
  expect(changed).not.toHaveBeenCalled();
});

it("[RQ-322] locks an unresolved configuration draft and reports acceptance only after the full response", async () => {
  // resolveUpdate belongs to one deferred publication, separating pending interaction from accepted metadata/version state.
  let resolveUpdate!: (definition: OffenceType) => void;
  // The delayed adapter leaves the accepted source unchanged until an explicit successful response settles.
  const definition = typeFixture(),
    api = trackerFixture({
      updateType: vi.fn().mockImplementation(
        () =>
          new Promise<OffenceType>((resolve) => {
            resolveUpdate = resolve;
          }),
      ),
    }),
    saved = vi.fn();
  // All actual editor controls remain available for inspection while the pending operation locks mutation inputs.
  const screen = await render(
    <TypeEditor
      definition={definition}
      types={[definition]}
      api={api}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={saved}
    />,
  );
  await screen
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Updated offence");
  await screen
    .getByRole("button", { name: "Save offence type", exact: true })
    .click();
  await expect
    .element(
      screen.getByRole("button", {
        name: "Saving offence type...",
        exact: true,
      }),
    )
    .toBeDisabled();
  await expect
    .element(screen.getByRole("textbox", { name: "Name", exact: true }))
    .toBeDisabled();
  await expect
    .element(
      screen.getByRole("button", {
        name: "Close Edit offence type",
        exact: true,
      }),
    )
    .toBeDisabled();
  expect(saved).not.toHaveBeenCalled();
  expect(definition.name).toBe("Abandoning");
  resolveUpdate({ ...definition, name: "Updated offence" });
  await expect.poll(() => saved.mock.calls.length).toBe(1);
});

it("[RQ-153 RQ-341 RQ-345 RQ-346] names report and editor dialogs, their inputs and contextual close/remove actions", async () => {
  // Real workspace ownership removes a report after its close action rather than relying on a test-only dismissal callback.
  const api = trackerFixture(),
    fleet = fleetFixture();
  // The composed workspace proves the report overlay carries an accessible dialog name before its inputs are used.
  const screen = await render(
    <FleetWorkspace
      api={api}
      fleet={fleet}
      fleets={[fleet]}
      user={{ id: 1, username: "operator" }}
      onFleet={vi.fn()}
      onCreateFleet={vi.fn()}
      onFleetsChanged={vi.fn()}
      onSignOut={vi.fn().mockResolvedValue(undefined)}
    />,
  );
  await screen
    .getByRole("button", { name: "Report observation", exact: true })
    .click();
  await expect
    .element(
      screen.getByRole("dialog", {
        name: "Report an observation",
        exact: true,
      }),
    )
    .toBeVisible();
  expect(
    screen
      .getByRole("dialog", { name: "Report an observation", exact: true })
      .element()
      .matches(":modal"),
  ).toBe(true);
  for (const label of [
    "Account search",
    "Cooldown start (UTC)",
    "Observed at (UTC)",
    "Offence search",
    "Days",
    "Hours",
    "Minutes",
    "Override step",
  ]) {
    // Every purpose is an associated accessible label on the actual report control, including native date and range inputs.
    await expect
      .element(screen.getByLabelText(label, { exact: true }))
      .toBeVisible();
  }
  await expect
    .element(
      screen.getByRole("combobox", { name: "Steam account", exact: true }),
    )
    .toBeVisible();
  await expect
    .element(
      screen.getByRole("combobox", { name: "Offence type", exact: true }),
    )
    .toBeVisible();
  await screen
    .getByRole("button", { name: "Close Report an observation", exact: true })
    .click();
  await expect
    .element(
      screen.getByRole("dialog", {
        name: "Report an observation",
        exact: true,
      }),
    )
    .not.toBeInTheDocument();
  await screen.getByRole("button", { name: "Cooldowns", exact: true }).click();
  await screen
    .getByRole("button", { name: "Edit Abandoning", exact: true })
    .click();
  await expect
    .element(
      screen.getByRole("dialog", { name: "Edit offence type", exact: true }),
    )
    .toBeVisible();
  for (const label of [
    "Name",
    "Short code",
    "Step 1 amount",
    "Clean window (days)",
  ]) {
    // Configuration fields retain names that identify their business purpose independently of nearby visual layout.
    await expect
      .element(screen.getByLabelText(label, { exact: true }))
      .toBeVisible();
  }
  await expect
    .element(screen.getByRole("textbox", { name: "Note", exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("combobox", { name: "Step 1 unit", exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("combobox", { name: "Decay mode", exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("button", { name: "Remove step 1", exact: true }))
    .toBeVisible();
  await expect
    .element(
      screen.getByRole("button", {
        name: "Close Edit offence type",
        exact: true,
      }),
    )
    .toBeVisible();
});

it("[RQ-343] keeps obscured background controls inert during forward and reverse native modal keyboard cycles", async () => {
  // The obscured background control is deliberately focusable outside a modal so inertness can be independently exercised.
  const screen = await render(
    <div>
      <button>Background action</button>
      <Modal title="Focus review" onDismiss={vi.fn()}>
        <label>
          Review input
          <input />
        </label>
        <button>Last action</button>
      </Modal>
    </div>,
  );
  // Actual first/last controls let real Tab events exercise both wrap directions without a synthetic key handler.
  const first = screen
      .getByRole("button", { name: "Close Focus review", exact: true })
      .element() as HTMLButtonElement,
    last = screen
      .getByRole("button", { name: "Last action", exact: true })
      .element() as HTMLButtonElement,
    background = screen
      .getByRole("button", { name: "Background action", exact: true })
      .element() as HTMLButtonElement,
    dialog = screen
      .getByRole("dialog", { name: "Focus review", exact: true })
      .element();
  last.focus();
  await userEvent.keyboard("{Tab}");
  // Native Chromium permits a browser-chrome stop represented by body before returning to the first dialog control.
  expect(document.activeElement).not.toBe(background);
  if (document.activeElement === document.body) {
    // A second Tab returns from browser chrome; it must still skip the obscured background action.
    await userEvent.keyboard("{Tab}");
  }
  await expect
    .element(
      screen.getByRole("button", { name: "Close Focus review", exact: true }),
    )
    .toHaveFocus();
  first.focus();
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  expect(document.activeElement).not.toBe(background);
  if (document.activeElement === document.body) {
    // The reverse browser-chrome stop also returns into the modal, without focusing background content.
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  }
  await expect
    .element(screen.getByRole("button", { name: "Last action", exact: true }))
    .toHaveFocus();
  background.focus();
  expect(dialog.contains(document.activeElement)).toBe(true);
});

it("[RQ-332] distinguishes observed evidence from modelled report and saved-history totals", async () => {
  // History must preserve a clear warning beside its actual saved totals, rather than only in a separate policy reference.
  const history = await render(
    <CooldownHistory events={[eventFixture()]} canWrite onObserve={vi.fn()} />,
  );
  await expect
    .element(
      history.getByText(
        "Each row is one offence. Additional observations do not advance the ladder. Saved totals are modelled assessments, not independently verified game outcomes.",
        { exact: true },
      ),
    )
    .toBeVisible();
  await expect
    .element(history.getByText("Observed evidence", { exact: true }))
    .toBeVisible();
  await history.unmount();
  // The report presents its total as a prediction derived by policy, alongside separately entered observation evidence.
  const report = await render(
    <ReportDialog
      accounts={[accountFixture()]}
      types={[typeFixture()]}
      api={trackerFixture()}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await expect
    .element(
      report.getByText(
        "Record what you saw. The server derives the total from the policy and earlier saved assessments.",
        { exact: true },
      ),
    )
    .toBeVisible();
  await expect
    .element(report.getByText("PREDICTED TOTAL DURATION", { exact: true }))
    .toBeVisible();
  await expect
    .element(
      report.getByText("Remaining duration - time left when you looked", {
        exact: true,
      }),
    )
    .toBeVisible();
});
