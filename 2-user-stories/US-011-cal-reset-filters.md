# US-011 - Restore an unfiltered workspace

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to clear the active filters together, so that I can return to the complete account and cooldown context.

**Evidence:** Visible. Source lines: [2446-2448](../docs/design/cooldown-counter.html#L2446), [2593-2596](../docs/design/cooldown-counter.html#L2593), [3270-3276](../docs/design/cooldown-counter.html#L3270).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Return to the complete account and cooldown context.

**Dependencies:** [US-008](US-008-cal-account-filter.md), [US-009](US-009-cal-status-filter.md), [US-010](US-010-cal-offence-filter.md)

**Requirements:** [RQ-070](../3-requirements/requirements.md#rq-070), [RQ-071](../3-requirements/requirements.md#rq-071), [RQ-072](../3-requirements/requirements.md#rq-072).

**Constraints and questions:** [Q-023](../3-requirements/open-questions.md#q-023)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to clear the active filters together through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-011](../3-requirements/requirements.md#br-011) and example
[EX-011](../3-requirements/requirements.md#ex-011) preserve
the trigger, input, action, expected outcome and boundary cases. Each linked
requirement states its own acceptance condition and planned verification.
No acceptance result is claimed. The unanswered questions above are the handoff
for product review; do not implement an arbitrary answer.

## INVEST

| Criterion | Result | Reason |
| --- | --- | --- |
| Independent | Pass | One outcome has separate acceptance; recorded dependencies are explicit. |
| Negotiable | Pass | The outcome is separate from stack, storage and implementation choices. |
| Valuable | Pass | The stated operator benefit is a design-derived hypothesis requiring validation. |
| Estimable | Fail | Material behavior or scope questions remain; resolve the linked decisions before estimating. |
| Small | Pass | One coherent outcome; its atomic rules share a single purpose. |
| Testable | Fail | Proposed checks exist, but linked decisions can change the accepted result. |

Correction: resolve the linked decisions, update the acceptance examples, and repeat the INVEST check. This draft must not be treated as ready for implementation.
