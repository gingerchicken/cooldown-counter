import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { ApiError } from "@template/api-client";
import { AccountDialog } from "./AccountDialog";
import { FleetDialog } from "./FleetDialog";
import { TypeEditor } from "./TypeEditor";
import { ReportDialog } from "./ReportDialog";
import { ObservationDialog } from "./ObservationDialog";
import {
  accountFixture,
  eventFixture,
  fleetFixture,
  previewFixture,
  trackerFixture,
  typeFixture,
} from "./testing.fixtures";

describe("real browser tracker forms", () => {
  it("validates exact SteamID digits and preserves a failed account draft", async () => {
    // A rejected server call must leave a corrected identifier available for deliberate retry.
    const save = vi
      .fn()
      .mockRejectedValue(new Error("Account service unavailable"));
    const screen = await render(
      <AccountDialog onDismiss={vi.fn()} onSave={save} />,
    );
    await screen.getByRole("textbox", { name: "Account tag" }).fill("alpha");
    await screen.getByRole("textbox", { name: "SteamID" }).fill("123");
    await screen.getByRole("button", { name: "Save account" }).click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("Enter exactly 17 SteamID digits.");
    expect(save).not.toHaveBeenCalled();
    await screen
      .getByRole("textbox", { name: "SteamID" })
      .fill("76561198039452203");
    await screen.getByRole("button", { name: "Save account" }).click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("Account service unavailable");
    await expect
      .element(screen.getByRole("textbox", { name: "SteamID" }))
      .toHaveValue("76561198039452203");
  });
  it("creates one fleet from a named modal and supports Escape cancellation", async () => {
    // Native modal cancellation is a real keyboard event rather than a direct callback invocation.
    const save = vi.fn().mockResolvedValue(fleetFixture()),
      saved = vi.fn(),
      dismiss = vi.fn();
    const screen = await render(
      <FleetDialog onSave={save} onSaved={saved} onDismiss={dismiss} />,
    );
    await expect
      .element(screen.getByRole("dialog", { name: "Create fleet" }))
      .toBeVisible();
    await screen.getByRole("textbox", { name: "Fleet name" }).fill("  Team  ");
    await screen
      .getByRole("button", { name: "Create fleet", exact: true })
      .click();
    expect(save).toHaveBeenCalledWith("Team");
    expect(saved).toHaveBeenCalledWith(fleetFixture());
    await userEvent.keyboard("{Escape}");
    expect(dismiss).toHaveBeenCalled();
  });
  it("prevents empty/duplicate names and publishes exact whole-minute editor values", async () => {
    // The form supports a useful fractional-hour input without rounding fractional minutes.
    const api = trackerFixture(),
      saved = vi.fn();
    const screen = await render(
      <TypeEditor
        api={api}
        fleetId={fleetFixture().id}
        types={[typeFixture()]}
        onDismiss={vi.fn()}
        onSaved={saved}
      />,
    );
    await screen.getByRole("button", { name: "Save offence type" }).click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("A name is required.");
    await screen
      .getByRole("textbox", { name: "Name", exact: true })
      .fill("aBaNdOnInG");
    await screen.getByRole("button", { name: "Save offence type" }).click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("Another offence type already uses that name.");
    await screen
      .getByRole("textbox", { name: "Name", exact: true })
      .fill("New ladder");
    await screen.getByRole("spinbutton", { name: "Step 1 amount" }).fill("1.5");
    await screen
      .getByRole("combobox", { name: "Step 1 unit" })
      .selectOptions("h");
    await screen.getByRole("button", { name: "Save offence type" }).click();
    expect(api.createType).toHaveBeenCalledWith(
      fleetFixture().id,
      expect.objectContaining({ name: "New ladder", steps: [90] }),
    );
    expect(saved).toHaveBeenCalled();
  });
  it("retains at least one ladder step and retains the edited draft on a stale-policy conflict", async () => {
    // The server conflict proves the editor must not silently overwrite another accepted revision.
    const api = trackerFixture({
      updateType: vi.fn().mockRejectedValue(new ApiError(409)),
    });
    const screen = await render(
      <TypeEditor
        definition={typeFixture({
          policy: { ...typeFixture().policy, steps: [30] },
        })}
        api={api}
        fleetId={fleetFixture().id}
        types={[typeFixture()]}
        onDismiss={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    await expect
      .element(screen.getByRole("button", { name: "Remove step 1" }))
      .toBeDisabled();
    await screen.getByRole("button", { name: "Add step" }).click();
    await screen.getByRole("button", { name: "Remove step 2" }).click();
    await screen.getByRole("textbox", { name: "Note" }).fill("keep this draft");
    await screen.getByRole("button", { name: "Save offence type" }).click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent(
        "This preview or editor is out of date. Refresh its review and try again.",
      );
    await expect
      .element(screen.getByRole("textbox", { name: "Note" }))
      .toHaveValue("keep this draft");
  });
  it("previews at entered event time and retries unchanged failed saves with the same identities", async () => {
    // Only the component boundary is mocked; inputs and native dialog behavior are real browser UI.
    const record = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce(eventFixture());
    const api = trackerFixture({ record }),
      saved = vi.fn();
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
      .getByLabelText("Cooldown start (UTC)")
      .fill("2026-01-01T00:00");
    await screen.getByLabelText("Observed at (UTC)").fill("2026-01-01T00:00");
    await screen.getByRole("button", { name: "Preview cooldown" }).click();
    expect(api.preview).toHaveBeenCalledWith(
      fleetFixture().id,
      expect.objectContaining({ started_at: "2026-01-01T00:00:00.000Z" }),
    );
    await screen.getByRole("button", { name: "Record cooldown" }).click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("Network unavailable");
    await expect
      .element(screen.getByRole("spinbutton", { name: "Minutes", exact: true }))
      .toHaveValue(30);
    await screen.getByRole("button", { name: "Record cooldown" }).click();
    expect(record.mock.calls[0][1]).toEqual(record.mock.calls[1][1]);
    expect(saved).toHaveBeenCalledWith(eventFixture());
  });
  it("adds mixed remaining units and offers the first fitting override with a required reason", async () => {
    // A 1563-minute observation does not fit the initial 30-minute estimate.
    const api = trackerFixture({
      preview: vi
        .fn()
        .mockResolvedValueOnce(previewFixture())
        .mockResolvedValueOnce(
          previewFixture({ step: 4, total_minutes: 10080 }),
        ),
    });
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
      .getByRole("spinbutton", { name: "Days", exact: true })
      .fill("1");
    await screen
      .getByRole("spinbutton", { name: "Hours", exact: true })
      .fill("2");
    await screen
      .getByRole("spinbutton", { name: "Minutes", exact: true })
      .fill("3");
    await expect
      .element(screen.getByLabelText("Remaining duration"))
      .toHaveTextContent("1d 2h 3m remaining (1563 minutes)");
    await screen.getByRole("button", { name: "Preview cooldown" }).click();
    await screen.getByRole("button", { name: /Move to step 4/ }).click();
    await screen.getByRole("button", { name: "Preview cooldown" }).click();
    await screen.getByRole("button", { name: "Record cooldown" }).click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("Explain the manual override in Override reason.");
    await screen
      .getByRole("textbox", { name: "Override reason" })
      .fill("Observed the actual higher penalty");
    await screen.getByRole("button", { name: "Record cooldown" }).click();
    expect(api.record).toHaveBeenCalledWith(
      fleetFixture().id,
      expect.objectContaining({ forced_step: 4, remaining_minutes: 1563 }),
    );
  });
  it("rejects invalid remaining input and clears an override on account changes", async () => {
    // A second exact identity must not inherit the first account's manual assessment.
    const api = trackerFixture(),
      second = accountFixture({ id: "other-account", tag: "beta" });
    const screen = await render(
      <ReportDialog
        accounts={[accountFixture(), second]}
        types={[typeFixture()]}
        api={api}
        fleetId={fleetFixture().id}
        onDismiss={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    await screen
      .getByRole("spinbutton", { name: "Minutes", exact: true })
      .fill("0");
    await screen.getByRole("button", { name: "Preview cooldown" }).click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent(
        "Enter a positive whole-minute remaining duration. Days, hours and minutes are additive.",
      );
    expect(api.preview).not.toHaveBeenCalled();
    await screen.getByRole("slider", { name: "Override step" }).click();
    await userEvent.keyboard("{End}");
    await expect
      .element(screen.getByRole("textbox", { name: "Override reason" }))
      .toBeVisible();
    await screen
      .getByRole("combobox", { name: "Steam account" })
      .selectOptions(second.id);
    await expect
      .element(screen.getByRole("textbox", { name: "Override reason" }))
      .not.toBeInTheDocument();
  });
  it("explains unmatched report searches without silently changing the selected identities", async () => {
    // A searchable chooser keeps its accepted UUID visible while explaining that the free text matched nothing.
    const account = accountFixture(),
      definition = typeFixture(),
      api = trackerFixture();
    // This mounted real dialog exercises native select state rather than an adapter-level search stub.
    const screen = await render(
      <ReportDialog
        accounts={[account]}
        types={[definition]}
        api={api}
        fleetId={fleetFixture().id}
        onDismiss={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    await screen
      .getByRole("searchbox", { name: "Account search" })
      .fill("no-such-account");
    await expect
      .element(
        screen.getByText(
          "No accounts match this search. The selected account is kept.",
        ),
      )
      .toBeVisible();
    await expect
      .element(screen.getByRole("combobox", { name: "Steam account" }))
      .toHaveValue(account.id);
    await screen
      .getByRole("searchbox", { name: "Offence search" })
      .fill("no-such-offence");
    await expect
      .element(
        screen.getByText(
          "No offence types match this search. The selected type is kept.",
        ),
      )
      .toBeVisible();
    await expect
      .element(screen.getByRole("combobox", { name: "Offence type" }))
      .toHaveValue(definition.id);
    await screen.getByRole("searchbox", { name: "Offence search" }).fill("ABD");
    await expect
      .element(
        screen.getByText(
          "No offence types match this search. The selected type is kept.",
        ),
      )
      .not.toBeInTheDocument();
  });
  it("retains an observation draft and exact retry identity after a failed append", async () => {
    // A lost response must not generate another observation UUID or replace the operator's entered UTC evidence.
    const observe = vi
        .fn()
        .mockRejectedValueOnce(new Error("Observation network unavailable"))
        .mockResolvedValueOnce(eventFixture().observations[0]),
      api = trackerFixture({ observe });
    // The existing event supplies assessment identity; only evidence controls are editable in this dialog.
    const screen = await render(
      <ObservationDialog
        event={eventFixture()}
        api={api}
        fleetId={fleetFixture().id}
        onDismiss={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    await screen.getByLabelText("Observed at (UTC)").fill("2026-01-01T00:10");
    await screen
      .getByRole("spinbutton", { name: "Remaining minutes" })
      .fill("20");
    await screen.getByRole("button", { name: "Save observation" }).click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("Observation network unavailable");
    await expect
      .element(screen.getByLabelText("Observed at (UTC)"))
      .toHaveValue("2026-01-01T00:10");
    await screen.getByRole("button", { name: "Save observation" }).click();
    expect(observe.mock.calls[0][2]).toEqual(observe.mock.calls[1][2]);
    expect(api.record).not.toHaveBeenCalled();
  });
  it("adds another observation to the same saved event rather than calling new-event recording", async () => {
    // The API receives the parent event UUID and an independent observation retry UUID.
    const api = trackerFixture(),
      saved = vi.fn();
    const screen = await render(
      <ObservationDialog
        event={eventFixture()}
        api={api}
        fleetId={fleetFixture().id}
        onDismiss={vi.fn()}
        onSaved={saved}
      />,
    );
    await screen
      .getByRole("spinbutton", { name: "Remaining minutes" })
      .fill("20");
    await screen.getByRole("button", { name: "Save observation" }).click();
    expect(api.observe).toHaveBeenCalledWith(
      fleetFixture().id,
      eventFixture().id,
      expect.objectContaining({ remaining_minutes: 20 }),
    );
    expect(api.record).not.toHaveBeenCalled();
    expect(saved).toHaveBeenCalled();
  });
});
