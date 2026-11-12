# US-020 - Inspect one account

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to open an account identity and status summary, so that I can confirm I am reviewing the intended Steam account.

**Evidence:** Visible. Source lines: [2645-2664](../docs/design/cooldown-counter.html#L2645), [3431-3438](../docs/design/cooldown-counter.html#L3431).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Confirm I am reviewing the intended Steam account.

**Dependencies:** [US-018](US-018-cal-fleet-summary.md)

**Requirements:** [RQ-124](../3-requirements/requirements.md#rq-124), [RQ-125](../3-requirements/requirements.md#rq-125), [RQ-126](../3-requirements/requirements.md#rq-126), [RQ-127](../3-requirements/requirements.md#rq-127), [RQ-128](../3-requirements/requirements.md#rq-128), [RQ-129](../3-requirements/requirements.md#rq-129), [RQ-130](../3-requirements/requirements.md#rq-130).

**Constraints and questions:** [Q-033](../3-requirements/open-questions.md#q-033), [Q-016](../3-requirements/open-questions.md#q-016)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to open an account identity and status summary through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-020](../3-requirements/requirements.md#br-020) and example
[EX-020](../3-requirements/requirements.md#ex-020) preserve
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
