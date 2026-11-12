# US-023 - Understand a prediction

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to read the reason for the account's next cooldown estimate, so that I can judge how observation history and clean time affect the result.

**Evidence:** Visible. Source lines: [2679-2679](../docs/design/cooldown-counter.html#L2679), [3420-3429](../docs/design/cooldown-counter.html#L3420).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Judge how observation history and clean time affect the result.

**Dependencies:** [US-022](US-022-cal-account-predictions.md)

**Requirements:** [RQ-137](../3-requirements/requirements.md#rq-137), [RQ-138](../3-requirements/requirements.md#rq-138), [RQ-139](../3-requirements/requirements.md#rq-139), [RQ-140](../3-requirements/requirements.md#rq-140).

**Constraints and questions:** [Q-012](../3-requirements/open-questions.md#q-012), [Q-013](../3-requirements/open-questions.md#q-013), [Q-024](../3-requirements/open-questions.md#q-024), [Q-033](../3-requirements/open-questions.md#q-033)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to read the reason for the account's next cooldown estimate through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-023](../3-requirements/requirements.md#br-023) and example
[EX-023](../3-requirements/requirements.md#ex-023) preserve
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
