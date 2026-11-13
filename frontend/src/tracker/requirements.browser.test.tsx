import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CalendarView } from "./CalendarView";
import { FilterBar } from "./FilterBar";
import { FleetWorkspace } from "./FleetWorkspace";
import { ReportDialog } from "./ReportDialog";
import { EMPTY_FILTERS } from "./filters";
import {
  accountFixture,
  eventFixture,
  fleetFixture,
  previewFixture,
  trackerFixture,
  typeFixture,
} from "./testing.fixtures";

it("offers Reset only after a workspace filter becomes active", async () => {
  // account identifies one accepted filter choice; change captures the requested unrestricted replacement.
  const account = accountFixture(),
    change = vi.fn();
  // An idle controlled snapshot must not display an action that implies an active restriction.
  const screen = await render(
    <FilterBar
      accounts={[account]}
      types={[]}
      filters={EMPTY_FILTERS}
      onChange={change}
    />,
  );
  await expect
    .element(screen.getByRole("button", { name: "Reset filters", exact: true }))
    .not.toBeInTheDocument();
  await screen.rerender(
    <FilterBar
      accounts={[account]}
      types={[]}
      filters={{ ...EMPTY_FILTERS, accountId: account.id }}
      onChange={change}
    />,
  );
  await screen
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  expect(change).toHaveBeenCalledExactlyOnceWith(EMPTY_FILTERS);
});

it("names a single selected offence and shows its first-step duration", async () => {
  // definition supplies the ladder, account the retained UUID, and change captures filter mutations.
  const definition = typeFixture(),
    account = accountFixture(),
    change = vi.fn();
  // The actual native disclosure and checkbox retain independent names and visible duration context.
  const screen = await render(
    <FilterBar
      accounts={[account]}
      types={[definition]}
      filters={{
        ...EMPTY_FILTERS,
        accountId: account.id,
        status: "active",
        typeIds: [definition.id],
      }}
      onChange={change}
    />,
  );
  await screen.getByText("Abandoning", { exact: true }).first().click();
  await expect
    .element(screen.getByText("30m first step", { exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("checkbox", { name: "Abandoning", exact: true }))
    .toBeChecked();
  await screen
    .getByRole("button", { name: "All offences", exact: true })
    .click();
  // An offence-only clear action must retain independent account and status restrictions.
  expect(change).toHaveBeenLastCalledWith({
    ...EMPTY_FILTERS,
    accountId: account.id,
    status: "active",
    typeIds: [],
  });
});

it("names the full displayed range and hides only optional forecast markers", async () => {
  // A record and a forecast in the loaded range prove the visibility toggle cannot hide evidence.
  const event = eventFixture({
    started_at: "2026-05-05T00:00:00Z",
    expires_at: "2026-05-05T00:30:00Z",
  });
  // A fixed UTC range crosses four month headings while the marker belongs to one exact calendar day.
  const screen = await render(
    <CalendarView
      baseMonth={Date.UTC(2026, 4, 1)}
      monthCount={4}
      now={Date.UTC(2026, 4, 12)}
      events={[event]}
      forecasts={[
        {
          account_id: event.account_id,
          account_tag: event.account_tag,
          type_id: event.type_id,
          type_name: event.type_name,
          at: "2026-05-12T00:30:00Z",
          stored_step: 0,
          next_step: 1,
          total_minutes: 30,
        },
      ]}
      typeCodes={new Map()}
      earliest={null}
      onRange={vi.fn()}
      onAccount={vi.fn()}
    />,
  );
  await expect
    .element(screen.getByText("May 2026 through August 2026", { exact: true }))
    .toBeVisible();
  await expect
    .element(
      screen
        .getByRole("button", { name: /^Forecast alpha Abandoning/ })
        .first(),
    )
    .toBeVisible();
  await screen
    .getByRole("checkbox", { name: "Show step-down forecasts", exact: true })
    .click();
  await expect
    .element(screen.getByRole("button", { name: /^Forecast alpha Abandoning/ }))
    .not.toBeInTheDocument();
  await expect
    .element(screen.getByRole("button", { name: /^alpha Abandoning,/ }).first())
    .toBeVisible();
  await screen
    .getByRole("checkbox", { name: "Show step-down forecasts", exact: true })
    .click();
  await expect
    .element(
      screen
        .getByRole("button", { name: /^Forecast alpha Abandoning/ })
        .first(),
    )
    .toBeVisible();
});

it("identifies report accounts with initials and explains exact preview sample counts", async () => {
  // A blank note exercises the configured-code fallback without inventing offence context.
  const definition = typeFixture({ note: "" });
  // Only the backend preview's event-time sample count is authoritative for a backdated report.
  const api = trackerFixture({
    preview: vi
      .fn()
      .mockResolvedValue({ ...previewFixture(), sample_count: 2 }),
  });
  // Native options expose the same account and offence identity cues used during actual reporting.
  const screen = await render(
    <ReportDialog
      accounts={[accountFixture()]}
      types={[definition]}
      api={api}
      fleetId={fleetFixture().id}
      onDismiss={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await expect
    .element(
      screen.getByRole("combobox", { name: "Steam account", exact: true }),
    )
    .toHaveTextContent("[AL] alpha · 76561198039452203");
  await expect
    .element(
      screen.getByRole("combobox", { name: "Offence type", exact: true }),
    )
    .toHaveTextContent("Abandoning · 30m · ABD · 4 steps");
  await screen
    .getByRole("button", { name: "Preview cooldown", exact: true })
    .click();
  await expect
    .element(
      screen.getByText("2 prior same-type samples at this cooldown start.", {
        exact: true,
      }),
    )
    .toBeVisible();
});

it("announces an accepted report after closing its modal", async () => {
  // The workspace must expose success through a live status after the reporting form disappears.
  const api = trackerFixture(),
    fleet = fleetFixture();
  // Real component composition verifies the acknowledgement survives navigation to the saved account.
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
  await screen
    .getByRole("button", { name: "Preview cooldown", exact: true })
    .click();
  await screen
    .getByRole("button", { name: "Record cooldown", exact: true })
    .click();
  await expect
    .element(
      screen.getByText("Cooldown and observation saved.", { exact: true }),
    )
    .toHaveAttribute("role", "status");
  await expect
    .element(
      screen.getByRole("dialog", {
        name: "Report an observation",
        exact: true,
      }),
    )
    .not.toBeInTheDocument();
  expect(api.record).toHaveBeenCalledOnce();
  await screen.getByRole("button", { name: "Calendar", exact: true }).click();
  // The saved fixture belongs to January, independent of the browser's real current month.
  await expect
    .element(
      screen.getByRole("heading", {
        level: 3,
        name: "January 2026",
        exact: true,
      }),
    )
    .toBeVisible();
});
