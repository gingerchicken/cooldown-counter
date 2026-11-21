import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { AccountsTable } from "./AccountsTable";
import { AccountDetailScreen } from "./AccountDetailScreen";
import { CooldownHistory } from "./CooldownHistory";
import { CalendarWeek } from "./CalendarWeek";
import { TypeReference } from "./TypeReference";
import {
  accountFixture,
  eventFixture,
  fleetFixture,
  trackerFixture,
  typeFixture,
} from "./testing.fixtures";
import "../styles.css";

it("[RQ-113 RQ-115 RQ-117 RQ-121] identifies saved and decayed account states, supporting offence and displayed row count", async () => {
  // Recorded state two and current state one deliberately differ from the hypothetical next duration.
  const first = accountFixture({
    event_count: 3,
    predictions: [
      {
        ...accountFixture().predictions[0],
        sample_count: 3,
        recorded_step: 2,
        base_step: 1,
        total_minutes: 10080,
      },
    ],
  });
  // Twenty-six independent UUIDs make the initial twelve-row count and later explicit load observable.
  const accounts = [
    first,
    ...Array.from({ length: 25 }, (_, index) =>
      accountFixture({ id: `account-${index}`, tag: `account-${index}` }),
    ),
  ];
  // This real table checks rendered data roles rather than merely asserting the fixture returned a field.
  const screen = await render(
    <AccountsTable accounts={accounts} onOpen={vi.fn()} />,
  );
  await expect
    .element(screen.getByText("12 of 26 accounts", { exact: true }))
    .toBeVisible();
  // The exact account action locates its semantic row; cells retain the published column order.
  const row = screen
    .getByRole("button", { name: "alpha", exact: true })
    .element()
    .closest("tr")!;
  expect(row.cells[2].textContent).toBe("Abandoning last S2current S1");
  expect(row.cells[3].textContent).toBe("3");
  expect(row.cells[4].textContent).toBe(
    "7dAbandoning · highest current estimate",
  );
  await screen
    .getByRole("button", { name: "Load more accounts", exact: true })
    .click();
  await expect
    .element(screen.getByText("24 of 26 accounts", { exact: true }))
    .toBeVisible();
});

it("[RQ-125 RQ-126 RQ-127 RQ-132 RQ-134 RQ-136] renders accepted account identity, history totals and independent offence estimates", async () => {
  // A nonempty history with an expired restriction should show Clear, an actual first date and a seven-day estimate.
  const account = {
    ...accountFixture({
      event_count: 3,
      first_observed: "2026-08-01T00:00:00Z",
      status: "clear",
      predictions: [
        {
          ...accountFixture().predictions[0],
          step: 4,
          total_steps: 4,
          total_minutes: 10080,
          sample_count: 3,
        },
      ],
    }),
    warnings: [],
    events: [eventFixture()],
  };
  // Only this detail boundary is mocked; the identity, prediction and history views are real components.
  const screen = await render(
    <AccountDetailScreen
      api={trackerFixture({ account: vi.fn().mockResolvedValue(account) })}
      fleetId={fleetFixture().id}
      accountId={account.id}
      canWrite
      onBack={vi.fn()}
      onEdit={vi.fn()}
      onReport={vi.fn()}
      onChanged={vi.fn()}
    />,
  );
  await expect
    .element(screen.getByRole("heading", { name: "alpha", exact: true }))
    .toBeVisible();
  // Definition descriptions are paired with their terms so a coincidental date or count elsewhere cannot satisfy the check.
  const identity = screen
    .getByRole("heading", { name: "alpha", exact: true })
    .element()
    .closest("section")!;
  expect(
    Array.from(identity.querySelectorAll("dl > div")).map(
      (pair) => pair.textContent,
    ),
  ).toEqual([
    "Recorded cooldowns3",
    "First observed2026-08-01 00:00 UTC",
    "StatusClear",
  ]);
  await expect
    .element(
      screen.getByRole("link", { name: "Open on Steam ↗", exact: true }),
    )
    .toHaveAttribute(
      "href",
      `https://steamcommunity.com/profiles/${account.steam_id}`,
    );
  await expect
    .element(
      screen.getByRole("link", { name: "Open on Steam ↗", exact: true }),
    )
    .toHaveAttribute("target", "_blank");
  await expect
    .element(
      screen.getByRole("link", { name: "Open on Steam ↗", exact: true }),
    )
    .toHaveAttribute("rel", "noopener noreferrer");
  // The same named prediction card must contain both its duration and complete step denominator.
  const prediction = screen
    .getByRole("heading", { name: "Abandoning", level: 4 })
    .element()
    .closest("article")!;
  expect(prediction.textContent).toContain("7d");
  expect(prediction.textContent).toContain("Step 4 of 4");
});

it("[RQ-128] uses an absent first-observed placeholder and explains a genuine history-free account", async () => {
  // An empty history must not fabricate a current date merely because the component mounted today.
  const account = {
    ...accountFixture({ first_observed: null, event_count: 0 }),
    warnings: [],
    events: [],
  };
  // A real detail fetch resolves to an explicit empty history, distinct from loading and failure.
  const screen = await render(
    <AccountDetailScreen
      api={trackerFixture({ account: vi.fn().mockResolvedValue(account) })}
      fleetId={fleetFixture().id}
      accountId={account.id}
      canWrite
      onBack={vi.fn()}
      onEdit={vi.fn()}
      onReport={vi.fn()}
      onChanged={vi.fn()}
    />,
  );
  await expect
    .element(
      screen.getByText("No cooldowns recorded for this account.", {
        exact: true,
      }),
    )
    .toBeVisible();
  // firstObserved is paired with its actual semantic term, avoiding another absent value in the screen.
  const firstObserved = screen
    .getByText("First observed", { exact: true })
    .element().nextElementSibling;
  expect(firstObserved?.textContent).toBe("No history");
  await expect
    .element(
      screen.getByText(
        "No history on this account. Prior cooldowns outside this fleet can affect estimates.",
        { exact: true },
      ),
    )
    .toBeVisible();
});

it("[RQ-138] explains the latest outstanding UTC expiry before clean time can begin", async () => {
  // The active expiry is independent from the first recorded date or the duration of another hypothetical offence.
  const account = {
    ...accountFixture({
      status: "active",
      active_until: "2026-09-02T12:34:00Z",
      event_count: 1,
    }),
    warnings: [],
    events: [eventFixture()],
  };
  // The accepted detail payload supplies current availability; no browser-side penalty calculation is substituted.
  const screen = await render(
    <AccountDetailScreen
      api={trackerFixture({ account: vi.fn().mockResolvedValue(account) })}
      fleetId={fleetFixture().id}
      accountId={account.id}
      canWrite
      onBack={vi.fn()}
      onEdit={vi.fn()}
      onReport={vi.fn()}
      onChanged={vi.fn()}
    />,
  );
  await expect
    .element(
      screen.getByText(
        "Currently on cooldown until 2026-09-02 12:34 UTC. Clean time cannot begin before the latest outstanding expiry for the relevant ladder.",
        { exact: true },
      ),
    )
    .toBeVisible();
});

it("[RQ-142 RQ-143 RQ-349] numbers history in supplied order and exposes dates, total and transition independently of color", async () => {
  // Three distinct saved issue times prove display ordinals follow supplied server order rather than mutable labels.
  const events = [
    eventFixture({
      id: "latest",
      started_at: "2026-08-29T10:11:00Z",
      transition: "Saved assessment advances from state 1 to step 2.",
    }),
    eventFixture({ id: "middle", started_at: "2026-08-15T00:00:00Z" }),
    eventFixture({ id: "earliest", started_at: "2026-08-01T00:00:00Z" }),
  ];
  // Real semantic rows retain assessment meaning even when severity color is ignored entirely.
  const screen = await render(
    <CooldownHistory events={events} canWrite onObserve={vi.fn()} />,
  );
  // rows excludes the table's header so sequence numbers can be checked independently from array source identities.
  const rows = screen
    .getByRole("row")
    .elements()
    .slice(1) as HTMLTableRowElement[];
  expect(rows.map((row) => row.cells[0].textContent)).toEqual(["1", "2", "3"]);
  expect(rows[0].cells[1].querySelector("time")?.getAttribute("datetime")).toBe(
    "2026-08-29T10:11:00Z",
  );
  expect(rows[0].cells[1].textContent).toContain("2026-08-29 10:11 UTC");
  expect(rows[0].cells[4].textContent).toBe("30m");
  expect(rows[0].cells[5].textContent).toBe(
    "Saved assessment advances from state 1 to step 2.",
  );
});

it("[RQ-088] applies the same seven-day severity in calendar, reference and account prediction contexts", async () => {
  // One saved seven-day policy provides the same duration to all three independent UI presentations.
  const definition = typeFixture({
      policy: { ...typeFixture().policy, steps: [10080] },
    }),
    event = eventFixture({
      total_minutes: 10080,
      started_at: "2026-08-03T00:00:00Z",
      expires_at: "2026-08-10T00:00:00Z",
    }),
    account = {
      ...accountFixture({
        predictions: [
          { ...accountFixture().predictions[0], total_minutes: 10080 },
        ],
      }),
      warnings: [],
      events: [],
    };
  // Separate component roots avoid a synthetic shared severity implementation in the test itself.
  const calendar = await render(
      <CalendarWeek
        days={Array.from({ length: 7 }, (_, index) =>
          Date.UTC(2026, 7, 3 + index),
        )}
        month={Date.UTC(2026, 7, 1)}
        now={Date.UTC(2026, 7, 3)}
        events={[event]}
        forecasts={[]}
        typeCodes={new Map()}
        onAccount={vi.fn()}
      />,
    ),
    reference = await render(
      <TypeReference
        types={[definition]}
        api={trackerFixture()}
        fleetId={fleetFixture().id}
        canWrite
        onEdit={vi.fn()}
        onChanged={vi.fn()}
      />,
    ),
    detail = await render(
      <AccountDetailScreen
        api={trackerFixture({ account: vi.fn().mockResolvedValue(account) })}
        fleetId={fleetFixture().id}
        accountId={account.id}
        canWrite
        onBack={vi.fn()}
        onEdit={vi.fn()}
        onReport={vi.fn()}
        onChanged={vi.fn()}
      />,
    );
  await expect
    .element(detail.getByRole("heading", { name: "Abandoning", level: 4 }))
    .toBeVisible();
  // Each actual styled duration carries the same severity class; the common stylesheet gives it the same text color.
  const calendarDuration = calendar
      .getByRole("button", { name: /^alpha Abandoning,/ })
      .element(),
    ladderDuration = reference
      .getByRole("heading", { name: "Abandoning ABD", exact: true })
      .element()
      .closest("article")!
      .querySelector("ol li")!,
    predictionDuration = detail
      .getByRole("heading", { name: "Abandoning", level: 4 })
      .element()
      .closest("article")!
      .querySelector("strong")!;
  expect(calendarDuration.classList.contains("severity-4")).toBe(true);
  expect(ladderDuration.classList.contains("severity-4")).toBe(true);
  expect(predictionDuration.classList.contains("severity-4")).toBe(true);
  expect(getComputedStyle(calendarDuration).color).toBe(
    getComputedStyle(predictionDuration).color,
  );
});
