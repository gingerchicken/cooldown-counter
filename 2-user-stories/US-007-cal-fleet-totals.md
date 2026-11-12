# US-007 - Assess fleet totals

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to see fleet account and cooldown totals, so that I can judge the overall scale and restriction state.

**Evidence:** Visible. Source lines: [2325-2333](../docs/design/cooldown-counter.html#L2325), [3279-3284](../docs/design/cooldown-counter.html#L3279).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Judge the overall scale and restriction state.

**Dependencies:** [US-006](US-006-cal-navigation.md)

**Requirements:** [RQ-039](../3-requirements/requirements.md#rq-039), [RQ-040](../3-requirements/requirements.md#rq-040), [RQ-041](../3-requirements/requirements.md#rq-041).

**Constraints and questions:** [Q-001](../3-requirements/open-questions.md#q-001), [Q-033](../3-requirements/open-questions.md#q-033)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to see fleet account and cooldown totals through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-007](../3-requirements/requirements.md#br-007) and example
[EX-007](../3-requirements/requirements.md#ex-007) preserve
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
