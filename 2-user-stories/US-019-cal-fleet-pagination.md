# US-019 - Reach later accounts

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to continue through the full matching account list, so that I can reach accounts beyond the initial visible rows.

**Evidence:** Visible. Source lines: [2638-2639](../docs/design/cooldown-counter.html#L2638), [3166-3168](../docs/design/cooldown-counter.html#L3166), [3652-3655](../docs/design/cooldown-counter.html#L3652).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Reach accounts beyond the initial visible rows.

**Dependencies:** [US-018](US-018-cal-fleet-summary.md)

**Requirements:** [RQ-121](../3-requirements/requirements.md#rq-121), [RQ-122](../3-requirements/requirements.md#rq-122), [RQ-123](../3-requirements/requirements.md#rq-123).

**Constraints and questions:** [Q-009](../3-requirements/open-questions.md#q-009)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to continue through the full matching account list through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-019](../3-requirements/requirements.md#br-019) and example
[EX-019](../3-requirements/requirements.md#ex-019) preserve
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
