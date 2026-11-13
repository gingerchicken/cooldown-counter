import { expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { FilterBar } from "./FilterBar";
import { CalendarView } from "./CalendarView";
import { FleetWorkspace } from "./FleetWorkspace";
import { EMPTY_FILTERS } from "./filters";
import type { CalendarSnapshot } from "./types";
import {
  accountFixture,
  eventFixture,
  fleetFixture,
  trackerFixture,
  typeFixture,
} from "./testing.fixtures";
import "../styles.css";

it("[RQ-044 RQ-045 RQ-046 RQ-047 RQ-048] narrows native account choices by normalized tag and SteamID substring", async () => {
  // Distinct tags and external identities make accidental broad or numeric matching observable.
  const first = accountFixture({
      tag: "hbh_01",
      steam_id: "76561198012345678",
    }),
    second = accountFixture({
      id: "second",
      tag: "other_02",
      steam_id: "76561198099999999",
    });
  // The component consumes parent-owned filter state; each rerender represents that controlled input contract.
  const screen = await render(
    <FilterBar
      accounts={[first, second]}
      types={[]}
      filters={EMPTY_FILTERS}
      onChange={vi.fn()}
    />,
  );
  for (const search of ["HBH_", "123456", "  HBH_01  "]) {
    // Each independent query must expose the readable tag and every SteamID digit for only the matching account.
    await screen.rerender(
      <FilterBar
        accounts={[first, second]}
        types={[]}
        filters={{ ...EMPTY_FILTERS, search }}
        onChange={vi.fn()}
      />,
    );
    await expect
      .element(
        screen.getByRole("option", {
          name: "hbh_01 · 76561198012345678",
          exact: true,
        }),
      )
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByRole("option", {
          name: "other_02 · 76561198099999999",
          exact: true,
        }),
      )
      .not.toBeInTheDocument();
  }
});

it("[RQ-049 RQ-051 RQ-053 RQ-058 RQ-070] exposes exact selected account and status and offers an unrestricted account choice", async () => {
  // The selected UUID and finite status are separate controlled dimensions; change records only the requested transition.
  const account = accountFixture({ tag: "hbh_01" }),
    change = vi.fn(),
    filters = {
      ...EMPTY_FILTERS,
      accountId: accountFixture().id,
      status: "active" as const,
    };
  // Real native select state supplies the selection indicator and the closed-control identity text.
  const screen = await render(
    <FilterBar
      accounts={[account]}
      types={[]}
      filters={filters}
      onChange={change}
    />,
  );
  // selectedAccount and selectedStatus inspect the actual native option selection rather than implementation classes.
  const selectedAccount = screen
      .getByRole("combobox", { name: "Account filter" })
      .element() as HTMLSelectElement,
    selectedStatus = screen
      .getByRole("combobox", { name: "Status filter" })
      .element() as HTMLSelectElement;
  await expect
    .element(screen.getByRole("button", { name: "Reset filters", exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("button", { name: "Reset filters", exact: true }))
    .toBeEnabled();
  expect(selectedAccount.selectedOptions[0].textContent).toBe(
    `hbh_01 · ${account.steam_id}`,
  );
  expect(selectedStatus.selectedOptions[0].textContent).toBe("On cooldown");
  expect(
    Array.from(selectedStatus.options)
      .filter((option) => option.selected)
      .map((option) => option.value),
  ).toEqual(["active"]);
  await screen
    .getByRole("combobox", { name: "Account filter" })
    .selectOptions("");
  expect(change).toHaveBeenLastCalledWith({ ...filters, accountId: "" });
});

it("[RQ-060 RQ-063] searches offence names without case sensitivity and removes only the unchecked selected UUID", async () => {
  // Two selected types prove deselection preserves a separate existing restriction.
  const first = typeFixture(),
    second = typeFixture({ id: "second-type", name: "VACLive", code: "VAC" }),
    change = vi.fn();
  // The initial selected union has a count disclosure rather than relying on human labels as identity.
  const screen = await render(
    <FilterBar
      accounts={[]}
      types={[first, second]}
      filters={{ ...EMPTY_FILTERS, typeIds: [first.id, second.id] }}
      onChange={change}
    />,
  );
  await screen.getByText("2 offences selected", { exact: true }).click();
  await screen.getByRole("checkbox", { name: "VACLive", exact: true }).click();
  expect(change).toHaveBeenLastCalledWith(
    expect.objectContaining({ typeIds: [first.id] }),
  );
  await screen.rerender(
    <FilterBar
      accounts={[]}
      types={[first, second]}
      filters={EMPTY_FILTERS}
      onChange={change}
    />,
  );
  await screen.getByRole("searchbox", { name: "Search offences" }).fill("vAc");
  await expect
    .element(screen.getByRole("checkbox", { name: "VACLive", exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("checkbox", { name: "Abandoning", exact: true }))
    .not.toBeInTheDocument();
});

it("[RQ-034 RQ-035 RQ-037 RQ-038 RQ-039 RQ-059 RQ-072 RQ-104 RQ-108] retains workspace filters across views and independent range reset", async () => {
  // A current-month event makes the bar-focus toggle test independent of the real UTC month.
  const now = new Date(),
    start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 2)),
    event = eventFixture({
      started_at: start.toISOString(),
      expires_at: new Date(start.getTime() + 30 * 60000).toISOString(),
    });
  // Explicit fleet totals differ from displayed rows so the KPI assertion cannot accidentally count DOM records.
  const fleet = fleetFixture(),
    api = trackerFixture({
      accounts: vi.fn().mockResolvedValue([
        accountFixture({
          event_count: 1,
          recorded_type_ids: [typeFixture().id],
        }),
        accountFixture({ id: "second-account", tag: "second" }),
        accountFixture({ id: "third-account", tag: "third" }),
      ]),
      calendar: vi.fn().mockResolvedValue({
        events: [event],
        forecasts: [],
        account_count: 3,
        active_count: 0,
        recorded_count: 1,
        as_of: start.toISOString(),
      }),
    });
  // Actual workspace composition exercises state retention, navigation and account-detail hierarchy together.
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
  await expect
    .element(screen.getByRole("button", { name: "Calendar", exact: true }))
    .toHaveAttribute("aria-current", "page");
  await expect
    .element(screen.getByRole("button", { name: "Accounts", exact: true }))
    .not.toHaveAttribute("aria-current");
  await expect
    .element(
      screen.getByText(
        "Every account, by day. Solid bars are recorded cooldowns; dashed marks are modelled step-downs.",
        { exact: true },
      ),
    )
    .toBeVisible();
  expect(
    screen
      .getByRole("definition")
      .elements()
      .map((element) => element.textContent),
  ).toContain("3");
  await screen
    .getByRole("combobox", { name: "Account filter" })
    .selectOptions(accountFixture().id);
  await screen.getByText("All offences", { exact: true }).click();
  await screen
    .getByRole("checkbox", { name: "Abandoning", exact: true })
    .click();
  await screen.getByRole("button", { name: "Accounts", exact: true }).click();
  await expect
    .element(screen.getByRole("combobox", { name: "Account filter" }))
    .toHaveValue(accountFixture().id);
  // Native disclosure state may remain open across a view switch; inspect it before requesting another toggle.
  const offencePicker = screen
    .getByText("Abandoning", { exact: true })
    .first()
    .element()
    .closest("details") as HTMLDetailsElement;
  if (!offencePicker.open) {
    // Reopen only a closed picker so this assertion never accidentally hides the retained selection.
    await screen.getByText("Abandoning", { exact: true }).first().click();
  }
  await expect
    .element(screen.getByRole("checkbox", { name: "Abandoning", exact: true }))
    .toBeChecked();
  await screen.getByRole("button", { name: "alpha", exact: true }).click();
  await expect
    .element(screen.getByRole("button", { name: "Accounts", exact: true }))
    .toHaveAttribute("aria-current", "page");
  await screen
    .getByRole("button", { name: "Accounts / alpha", exact: true })
    .click();
  await expect
    .element(
      screen.getByRole("heading", { level: 2, name: "Accounts", exact: true }),
    )
    .toBeVisible();
  await screen.getByRole("button", { name: "Calendar", exact: true }).click();
  await screen
    .getByRole("button", { name: "Load next month", exact: true })
    .click();
  await screen.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect
    .element(screen.getByRole("combobox", { name: "Account filter" }))
    .toHaveValue(accountFixture().id);
  await expect
    .element(screen.getByText("Abandoning", { exact: true }).first())
    .toBeVisible();
  await screen
    .getByRole("button", { name: /^alpha Abandoning,/ })
    .first()
    .click();
  await expect
    .element(screen.getByRole("combobox", { name: "Account filter" }))
    .toHaveValue("");
});

it("[RQ-074 RQ-075 RQ-077 RQ-083 RQ-084 RQ-085 RQ-086 RQ-093 RQ-100 RQ-338] renders month ownership, independent lanes and distinguishable keyboard-operable forecasts", async () => {
  // Two seven-day restrictions overlap; a forecast shares their month but must remain a separately described marker.
  const first = eventFixture({
      total_minutes: 10080,
      started_at: "2026-08-03T00:00:00Z",
      expires_at: "2026-08-10T00:00:00Z",
    }),
    second = eventFixture({
      id: "second",
      account_tag: "beta",
      total_minutes: 10080,
      started_at: "2026-08-03T00:00:00Z",
      expires_at: "2026-08-10T00:00:00Z",
    }),
    open = vi.fn();
  // The fixed present distinguishes August's current-month badge from July's historical heading.
  const screen = await render(
    <CalendarView
      baseMonth={Date.UTC(2026, 6, 1)}
      monthCount={2}
      now={Date.UTC(2026, 7, 12)}
      events={[first, second]}
      forecasts={[
        {
          account_id: first.account_id,
          account_tag: "alpha",
          type_id: first.type_id,
          type_name: "Abandoning",
          at: "2026-08-05T00:00:00Z",
          stored_step: 1,
          next_step: 2,
          total_minutes: 120,
        },
      ]}
      typeCodes={new Map([[first.type_id, "ABD"]])}
      earliest={null}
      onRange={vi.fn()}
      onAccount={open}
    />,
  );
  await expect
    .element(
      screen.getByRole("heading", { name: "August 2026 CURRENT", exact: true }),
    )
    .toBeVisible();
  await expect
    .element(screen.getByRole("heading", { name: "July 2026", exact: true }))
    .toBeVisible();
  await expect
    .element(
      screen.getByText("2 unique cooldowns · 1 forecasts", { exact: true }),
    )
    .toBeVisible();
  // Actual rendered rectangles prove overlap is separated spatially, beyond merely assigning different classes.
  const firstBar = screen
      .getByRole("button", { name: /^alpha Abandoning,/ })
      .first()
      .element() as HTMLButtonElement,
    secondBar = screen
      .getByRole("button", { name: /^beta Abandoning,/ })
      .first()
      .element(),
    forecast = screen
      .getByRole("button", { name: /^Forecast alpha Abandoning/ })
      .first()
      .element();
  expect(firstBar.textContent).toBe("7d alpha · ABD");
  expect(firstBar.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    secondBar.getBoundingClientRect().top,
  );
  expect(getComputedStyle(firstBar).borderTopStyle).toBe("solid");
  expect(getComputedStyle(forecast).borderTopStyle).toBe("dashed");
  expect(forecast.textContent).toContain("S1");
  expect(document.querySelectorAll(".outside-month").length).toBeGreaterThan(0);
  expect(
    getComputedStyle(document.querySelector(".outside-month")!).color,
  ).not.toBe(
    getComputedStyle(document.querySelector(".week-date:not(.outside-month)")!)
      .color,
  );
  firstBar.focus();
  await userEvent.keyboard("{Enter}");
  expect(open).toHaveBeenCalledWith(first.account_id);
});

it("[RQ-106] loads today's owning month before the native present-day scroll target is revealed", async () => {
  // snapshot is an accepted empty projection; calendar captures real workspace requests without fabricating a date.
  const snapshot: CalendarSnapshot = { events: [], forecasts: [], account_count: 1, active_count: 0, recorded_count: 0, as_of: new Date().toISOString() };
  const calendar = vi.fn().mockResolvedValue(snapshot), fleet = fleetFixture(), api = trackerFixture({ calendar });
  // This composition reproduces the real resource boundary, which unmounts CalendarView during a range change.
  const screen = await render(<FleetWorkspace api={api} fleet={fleet} fleets={[fleet]} user={{ id: 1, username: "operator" }} onFleet={vi.fn()} onCreateFleet={vi.fn()} onFleetsChanged={vi.fn()} onSignOut={vi.fn().mockResolvedValue(undefined)} />);
  await screen.getByRole("button", { name: "Previous month", exact: true }).click();
  await expect.element(screen.getByText("NOW", { exact: true })).not.toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "Jump to today", exact: true })).toBeVisible();
  // acceptRange deliberately delays the target response so the one-shot navigation intent must survive unmounting.
  let acceptRange: ((accepted: CalendarSnapshot) => void) | undefined;
  calendar.mockReturnValueOnce(new Promise<CalendarSnapshot>((resolveRange) => {
    // The test owns completion of this otherwise real cancellable resource lifecycle.
    acceptRange = resolveRange;
  }));
  await screen
    .getByRole("button", { name: "Jump to today", exact: true })
    .click();
  await expect.element(screen.getByText("Loading fleet records...", { exact: true })).toBeVisible();
  expect(document.getElementById("calendar-today")).toBeNull();
  acceptRange!(snapshot);
  // Smooth native scrolling settles asynchronously; wait for the actual target rectangle to enter the viewport.
  await expect
    .poll(
      () =>
        document.getElementById("calendar-today")?.getBoundingClientRect().top,
    )
    .toBeLessThan(window.innerHeight);
  expect(
    document.getElementById("calendar-today")!.getBoundingClientRect().top,
  ).toBeGreaterThanOrEqual(0);
});

it("[RQ-050] closes the native account picker after accepting an exact account choice", async () => {
  // Actual workspace ownership lets the controlled native selection accept the newly chosen account UUID.
  const api = trackerFixture(),
    fleet = fleetFixture();
  // The component test uses real native popup state instead of assuming a programmatic selectOptions call opens a popup.
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
  await expect
    .element(
      screen.getByRole("combobox", { name: "Account filter", exact: true }),
    )
    .toBeVisible();
  // The actual select is focused before keyboard expansion; popup state belongs to the browser.
  const selector = screen
    .getByRole("combobox", { name: "Account filter", exact: true })
    .element() as HTMLSelectElement;
  // A provider-backed click focuses the correct browser frame and opens the native picker as a trusted gesture.
  await screen
    .getByRole("combobox", { name: "Account filter", exact: true })
    .click();
  await expect.poll(() => selector.matches(":open")).toBe(true);
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect
    .element(
      screen.getByRole("combobox", { name: "Account filter", exact: true }),
    )
    .toHaveValue(accountFixture().id);
  expect(selector.matches(":open")).toBe(false);
  expect(selector.selectedOptions[0].textContent).toBe(
    "alpha · 76561198039452203",
  );
});
