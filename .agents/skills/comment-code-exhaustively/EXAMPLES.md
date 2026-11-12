# Exhaustive commenting examples

These examples are fictional teaching material for the [comment-code-exhaustively skill](./SKILL.md). They show how to preserve intent and coverage without changing executable behaviour. Adapt the wording to evidence from the target repository; do not copy claims about business rules, ownership or history unless the repository proves them.

## Example 1: Document an exported function and its data flow

The function documentation describes the contract. Nearby comments explain the meaning of variables and the reason for each non-trivial operation.

```ts
/**
 * Returns reservations that remain reportable for the selected accounting window.
 *
 * The caller supplies already-authorised reservations. This function does not change
 * permissions, fetch additional records, or mutate the returned objects.
 *
 * @param reservations - Reservations available to the current report request.
 * @param windowStart - Inclusive start of the reporting window, as an ISO date.
 * @param windowEnd - Exclusive end of the reporting window, as an ISO date.
 * @returns A new array containing reservations inside the requested window.
 */
export function selectReportableReservations(
  reservations: Reservation[],
  windowStart: string,
  windowEnd: string,
): Reservation[] {
  // Keep the end boundary exclusive so adjacent reporting windows do not count one
  // reservation twice when one window ends where the next one begins.
  return reservations.filter((reservation) => {
    // ISO dates are compared as sortable values because the caller contract requires
    // all three dates to use the same calendar representation.
    return reservation.arrivalDate >= windowStart && reservation.arrivalDate < windowEnd;
  });
}
```

Why this works:

- The API comment states inputs, output, boundary semantics and side effects.
- The parameter documentation explains the meaning of each value rather than repeating its name.
- The return transformation documents the inclusive/exclusive business rule.
- The example does not claim why ISO dates were chosen unless that constraint is visible in the contract.

## Example 2: Explain a branch and an external failure path

Comment the reason a branch changes behaviour, not the syntax of the branch.

```ts
/**
 * Saves one report export request and returns its queue identifier.
 *
 * @throws {ReportQueueUnavailableError} When the queue rejects the request.
 */
export async function queueReportExport(request: ReportExportRequest): Promise<string> {
  // The idempotency key prevents a retried browser request from creating two exports
  // for the same user action when the first response is delayed or lost.
  const idempotencyKey = buildExportIdempotencyKey(request);

  try {
    // The queue owns durable retry and delivery state, so this service does not keep
    // an in-memory promise or mark the export complete before enqueueing succeeds.
    const queuedExport = await reportQueue.enqueue({
      ...request,
      idempotencyKey,
    });

    // Later status requests use this identifier to distinguish this export from other
    // exports requested by the same user.
    return queuedExport.id;
  } catch (error) {
    // Translate the provider-specific failure at this boundary so callers do not need
    // to depend on the queue implementation or mistake an unqueued request for success.
    throw new ReportQueueUnavailableError({ cause: error });
  }
}
```

Do not write `// Enqueue the report` or `// Catch errors`. Those comments only translate the syntax and leave retry, ownership and failure semantics undocumented.

## Example 3: Explain a loop and an invariant

```python
def latest_event_by_reservation(events: list[Event]) -> dict[str, Event]:
    """Return the latest applicable event for each reservation reference."""

    # Each mapping entry is the best event seen so far for one reservation. Keying the
    # mapping by reference avoids comparing unrelated reservations with each other.
    latest_by_reservation: dict[str, Event] = {}

    for event in events:
        # Future-dated events must not affect an as-of report, even if they are already
        # present in the source data.
        if event.occurred_at > event.report_as_of:
            continue

        # Replace only when this event is newer, preserving the invariant that each
        # stored value is the latest applicable event processed so far.
        previous_event = latest_by_reservation.get(event.reservation_ref)
        if previous_event is None or event.occurred_at > previous_event.occurred_at:
            latest_by_reservation[event.reservation_ref] = event

    return latest_by_reservation
```

The comments explain the as-of rule, the aggregation key and the invariant maintained by the replacement branch. They do not claim that the source data is correct or that the dictionary is globally authoritative.

## Example 4: Document a model and nullable state

```ts
interface ReportRow {
  /** Stable reservation reference used to link this row to source evidence. */
  reservationRef: string;

  /**
   * Latest event time included in the report. It is absent when no applicable event
   * exists before the report as-of date; absence is different from an unknown date.
   */
  latestEventAt: string | null;

  /**
   * Display value for the report. A null price remains null when the source has no
   * verified price; callers must not turn it into zero without an agreed business rule.
   */
  netPrice: number | null;
}
```

This records the domain meaning of `null`, which is more useful than saying that the fields are strings or numbers. It does not rename `netPrice` or assert that it means an achieved price unless the source contract establishes that meaning.

## Example 5: Comment a test by scenario and expectation

```ts
describe('selectReportableReservations', () => {
  it('includes the start date but excludes the end date', () => {
    // Use two boundary records so the test proves the reporting-window rule rather
    // than only exercising an ordinary date in the middle of the window.
    const reservations = [
      reservationWithArrivalDate('2026-09-01'),
      reservationWithArrivalDate('2026-10-01'),
    ];

    // Apply the same window shape used by adjacent monthly reports.
    const reportableReservations = selectReportableReservations(
      reservations,
      '2026-09-01',
      '2026-10-01',
    );

    // The start record is included and the end record belongs to the next window, so
    // the result must contain exactly the first reservation.
    expect(reportableReservations.map((reservation) => reservation.arrivalDate)).toEqual([
      '2026-09-01',
    ]);
  });
});
```

Test comments should explain the scenario, fixture meaning, business expectation or failure intent. They should not label familiar syntax with `// Arrange`, `// Act` and `// Assert` unless the repository uses those labels to record meaningful test phases.

## Example 6: Record actionable structural debt

Use one `TODO(refactor)` when a relevant structural problem is real but outside the current behaviour-preserving pass.

```ts
// TODO(refactor): Extract the date-window calculation into the shared report-domain
// helper once the legacy exports use the same boundary convention. Keeping this local
// for the current compatibility fix avoids changing unrelated report outputs, but the
// duplicated rule can drift between report types.
const reportableReservations = reservations.filter(isWithinLegacyReportWindow);
```

The TODO states what is wrong, the intended direction, the risk and why the change is deferred. Do not add `TODO: clean this up`, and do not use a TODO to defer a correctness, security or data-loss defect that should be fixed now.

## Counterexamples and corrections

### Syntax-only variable comment

Bad:

```ts
// Get the timeout.
const timeout = 5000;
```

Better:

```ts
// Maximum time, in milliseconds, that the upstream request may remain pending before
// the caller receives a retryable timeout result.
const requestTimeoutMs = 5_000;
```

The better version also improves the private name. If the name is a public option or external contract, preserve the name and document its meaning without silently renaming it.

### Invented historical rationale

Bad:

```ts
// We rejected a database join here because it caused deadlocks in the original system.
const permittedSites = sites.filter(isPermittedSite);
```

Better when the repository only proves the observable constraint:

```ts
// Apply the permission predicate before building report rows so later formatting code
// cannot accidentally expose sites outside the caller's permitted set.
const permittedSites = sites.filter(isPermittedSite);
```

If the deadlock decision is documented in a design record, cite that record instead of presenting unverified history as fact.

### Over-commented routine syntax

Bad:

```ts
// Loop over reservations.
for (const reservation of reservations) {
  // Get the reservation reference.
  const reservationRef = reservation.ref;
  // Add the reference to the set.
  references.add(reservationRef);
}
```

Better:

```ts
// Build a unique reference set because downstream reconciliation must inspect each
// reservation once even when the source contains repeated event rows.
for (const reservation of reservations) {
  const reservationRef = reservation.ref;
  references.add(reservationRef);
}
```

The better version comments the block's purpose and invariant. It does not narrate each obvious statement.

### Comment that hides an unverified guarantee

Bad:

```ts
// This always returns a complete and perfectly ordered result.
return rows;
```

Better:

```ts
// Preserve source order here; callers sort the rows only when the selected report
// definition requires an explicit ordering.
return rows;
```

If completeness or ordering is required but not established by the code, tests or contract, record it as an unresolved requirement rather than claiming it in a comment.

## Review questions

Use these questions when reviewing an example or a completed batch:

- Does the comment explain purpose, meaning, invariant, edge case, constraint or trade-off?
- Could a maintainer verify the claim from the code, tests, documentation or linked history?
- Does the comment distinguish absent, empty, unknown, zero and false where that matters?
- Does it explain a branch, loop, callback, error path or transformation without narrating syntax?
- Does the example preserve the public contract and executable behaviour?
- Is a structural problem specific enough for a maintainer to act on later?
