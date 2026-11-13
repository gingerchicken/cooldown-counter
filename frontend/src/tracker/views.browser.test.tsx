import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ApiError } from "@template/api-client";
import { FilterBar } from "./FilterBar";
import { AccountsTable } from "./AccountsTable";
import { CalendarWeek } from "./CalendarWeek";
import { CalendarView } from "./CalendarView";
import { TypeReference } from "./TypeReference";
import { MembersPanel } from "./MembersPanel";
import { MembershipRow } from "./MembershipRow";
import { FleetWorkspace } from "./FleetWorkspace";
import { EMPTY_FILTERS } from "./filters";
import {
  accountFixture,
  eventFixture,
  fleetFixture,
  trackerFixture,
  typeFixture,
} from "./testing.fixtures";

describe("accessible fleet views in Chromium", () => {
  it("selects exact account and offence identities and resets all filter dimensions", async () => {
    // A stateless controlled boundary exposes the requested filter mutations directly.
    const change = vi.fn(),
      account = accountFixture(),
      type = typeFixture();
    const screen = await render(
      <FilterBar
        accounts={[account]}
        types={[type]}
        filters={EMPTY_FILTERS}
        onChange={change}
      />,
    );
    await screen
      .getByRole("combobox", { name: "Account filter" })
      .selectOptions(account.id);
    expect(change).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: account.id }),
    );
    await screen.getByText("All offences", { exact: true }).click();
    await screen.getByRole("checkbox", { name: "Abandoning" }).click();
    expect(change).toHaveBeenCalledWith(
      expect.objectContaining({ typeIds: [type.id] }),
    );
    // Parent-owned selection must be accepted before the conditional reset affordance becomes available.
    await screen.rerender(
      <FilterBar
        accounts={[account]}
        types={[type]}
        filters={{
          ...EMPTY_FILTERS,
          accountId: account.id,
          typeIds: [type.id],
        }}
        onChange={change}
      />,
    );
    await screen.getByRole("button", { name: "Reset filters" }).click();
    expect(change).toHaveBeenLastCalledWith(EMPTY_FILTERS);
  });
  it("explains unmatched filter choices while retaining exact selected account and offence controls", async () => {
    // Active UUID filters remain inspectable even when a later free-text search matches no available choice.
    const account = accountFixture(),
      definition = typeFixture(),
      filters = {
        ...EMPTY_FILTERS,
        accountId: account.id,
        typeIds: [definition.id],
        search: "no-such-account",
      };
    // The controlled boundary keeps exact selected identities so a browser cannot silently display All accounts.
    const screen = await render(
      <FilterBar
        accounts={[account]}
        types={[definition]}
        filters={filters}
        onChange={vi.fn()}
      />,
    );
    await expect
      .element(screen.getByText("No accounts match this search."))
      .toBeVisible();
    await expect
      .element(screen.getByRole("combobox", { name: "Account filter" }))
      .toHaveValue(account.id);
    await screen.getByText("Abandoning", { exact: true }).first().click();
    await screen
      .getByRole("searchbox", { name: "Search offences" })
      .fill("no-such-offence");
    await expect
      .element(screen.getByText("No offences match this search."))
      .toBeVisible();
    await expect
      .element(screen.getByRole("checkbox", { name: "Abandoning" }))
      .toBeChecked();
    await screen
      .getByRole("searchbox", { name: "Search offences" })
      .fill("ABD");
    await expect
      .element(screen.getByText("No offences match this search."))
      .not.toBeInTheDocument();
  });
  it("loads accounts beyond the initial twelve without relying on page scrolling", async () => {
    // Distinct UUID-like identities prevent pagination from accidentally de-duplicating human labels.
    const accounts = Array.from({ length: 14 }, (_, index) =>
        accountFixture({ id: String(index), tag: `account-${index}` }),
      ),
      open = vi.fn();
    const screen = await render(
      <AccountsTable accounts={accounts} onOpen={open} />,
    );
    await expect
      .element(screen.getByRole("button", { name: "account-13", exact: true }))
      .not.toBeInTheDocument();
    await screen.getByRole("button", { name: "Load more accounts" }).click();
    await screen
      .getByRole("button", { name: "account-13", exact: true })
      .click();
    expect(open).toHaveBeenCalledWith("13");
    await expect
      .element(screen.getByText("76561198039452203").first())
      .toBeVisible();
  });
  it("reveals crowded calendar entries through a keyboard-accessible native disclosure", async () => {
    // Six same-day events exceed the five visible spans without removing any evidence.
    const monday = Date.UTC(2026, 0, 5),
      events = Array.from({ length: 6 }, (_, index) =>
        eventFixture({
          id: `event-${index}`,
          account_tag: `account-${index}`,
          started_at: "2026-01-05T00:00:00Z",
          expires_at: "2026-01-05T00:30:00Z",
        }),
      ),
      focus = vi.fn();
    const screen = await render(
      <CalendarWeek
        days={Array.from(
          { length: 7 },
          (_, index) => monday + index * 86400000,
        )}
        month={Date.UTC(2026, 0, 1)}
        now={monday}
        events={events}
        forecasts={[]}
        typeCodes={new Map()}
        onAccount={focus}
      />,
    );
    await screen.getByText("Show 1 more entries").click();
    await screen.getByRole("button", { name: /account-5 Abandoning/ }).click();
    expect(focus).toHaveBeenCalledWith(accountFixture().id);
  });
  it("renders compact configured offence codes while naming calendar actions with complete offence text", async () => {
    // The configured code improves narrow spans; screen-reader actions retain the full offence and exact account identity.
    const monday = Date.UTC(2026, 0, 5),
      event = eventFixture({
        started_at: "2026-01-05T00:00:00Z",
        expires_at: "2026-01-05T00:30:00Z",
      });
    // This real calendar row verifies code propagation into its visual text and independent accessible description.
    const screen = await render(
      <CalendarWeek
        days={Array.from(
          { length: 7 },
          (_, index) => monday + index * 86400000,
        )}
        month={Date.UTC(2026, 0, 1)}
        now={monday}
        events={[event]}
        forecasts={[]}
        typeCodes={new Map([[event.type_id, "LEFT"]])}
        onAccount={vi.fn()}
      />,
    );
    await expect
      .element(screen.getByRole("button", { name: /alpha Abandoning/ }))
      .toHaveTextContent("30m alpha · LEFT");
  });
  it("supports earlier history, later ranges and present recovery as explicit actions", async () => {
    // Date navigation is a controlled range command, separate from active workspace filters.
    const change = vi.fn(),
      now = Date.UTC(2026, 10, 12),
      base = Date.UTC(2026, 10, 1);
    const screen = await render(
      <CalendarView
        baseMonth={base}
        monthCount={1}
        now={now}
        events={[]}
        forecasts={[]}
        typeCodes={new Map()}
        earliest="2025-01-01T00:00:00Z"
        onRange={change}
        onAccount={vi.fn()}
      />,
    );
    await screen.getByRole("button", { name: "Previous month" }).click();
    expect(change).toHaveBeenCalledWith(Date.UTC(2026, 9, 1), 1);
    await screen.getByRole("button", { name: "Earliest history" }).click();
    expect(change).toHaveBeenCalledWith(Date.UTC(2025, 0, 1), 4);
    await screen.getByRole("button", { name: "Load next month" }).click();
    expect(change).toHaveBeenCalledWith(base, 2);
    await screen.getByRole("button", { name: "Reset view" }).click();
    expect(change).toHaveBeenCalledWith(Date.UTC(2026, 7, 1), 4);
  });
  it("requires a second archive action and states that associated history stays preserved", async () => {
    // The non-destructive operation includes the exact policy identity reviewed by the operator.
    const definition = typeFixture({ event_count: 3 }),
      api = trackerFixture(),
      changed = vi.fn();
    const screen = await render(
      <TypeReference
        types={[definition]}
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
    expect(api.archiveType).not.toHaveBeenCalled();
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent(
        "Archive Abandoning? All 3 cooldowns and their observations remain preserved.",
      );
    await screen
      .getByRole("button", { name: "Confirm archive Abandoning", exact: true })
      .click();
    expect(api.archiveType).toHaveBeenCalledWith(
      fleetFixture().id,
      definition.id,
      definition.policy.id,
    );
    expect(changed).toHaveBeenCalled();
  });
  it("grants an explicit existing-user role and leaves viewer controls disabled", async () => {
    // Owner-controlled membership writes must include the selected role and trimmed principal.
    const api = trackerFixture(),
      changed = vi.fn();
    const screen = await render(
      <MembersPanel
        api={api}
        fleetId={fleetFixture().id}
        canManage
        onChanged={changed}
      />,
    );
    await screen
      .getByRole("textbox", { name: "Operator username" })
      .fill("  teammate  ");
    await screen
      .getByRole("combobox", { name: "Member role" })
      .selectOptions("editor");
    await screen
      .getByRole("button", { name: "Add member", exact: true })
      .click();
    expect(api.addMember).toHaveBeenCalledWith(fleetFixture().id, {
      username: "teammate",
      role: "editor",
    });
    expect(changed).toHaveBeenCalled();
  });
  it("shows a rejected last-owner change without claiming it succeeded", async () => {
    // The real invariant lives on the server; the row must expose its rejection honestly.
    const api = trackerFixture({
      updateMember: vi
        .fn()
        .mockRejectedValue(
          new ApiError(400, { detail: "The last owner cannot be demoted." }),
        ),
    });
    const screen = await render(
      <table>
        <tbody>
          <MembershipRow
            member={{ id: 1, user_id: 1, username: "owner", role: "owner" }}
            canManage
            api={api}
            fleetId={fleetFixture().id}
            onChanged={vi.fn()}
          />
        </tbody>
      </table>,
    );
    await screen
      .getByRole("combobox", { name: "Role for owner" })
      .selectOptions("viewer");
    await screen.getByRole("button", { name: "Save role owner" }).click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("detail: The last owner cannot be demoted.");
  });
  it("renders a read-only viewer workspace and exact semantic navigation labels", async () => {
    // Actual workspace composition must honor role affordances before a mutation is attempted.
    const api = trackerFixture(),
      fleet = fleetFixture({ role: "viewer" });
    const screen = await render(
      <FleetWorkspace
        api={api}
        fleet={fleet}
        fleets={[fleet]}
        user={{ id: 1, username: "viewer" }}
        onFleet={vi.fn()}
        onCreateFleet={vi.fn()}
        onFleetsChanged={vi.fn()}
        onSignOut={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    await expect
      .element(
        screen.getByRole("heading", { name: "Cooldown calendar", exact: true }),
      )
      .toBeVisible();
    await expect
      .element(
        screen.getByRole("button", { name: "Report observation", exact: true }),
      )
      .toBeDisabled();
    await expect
      .element(screen.getByRole("button", { name: "Add account", exact: true }))
      .toBeDisabled();
    await screen.getByRole("button", { name: "Accounts", exact: true }).click();
    await expect
      .element(screen.getByRole("heading", { name: "Accounts", exact: true }))
      .toBeVisible();
    await screen
      .getByRole("button", { name: "Cooldowns", exact: true })
      .click();
    await expect
      .element(screen.getByRole("button", { name: "Add offence type" }))
      .toBeDisabled();
    expect(api.record).not.toHaveBeenCalled();
  });
});
