# US-038 - Start with the designed offence catalogue

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to start with the offence ladders represented in the design, so that I can evaluate the intended tracking model without entering every initial rule.

**Evidence:** Logic. Source lines: [3049-3055](../docs/design/cooldown-counter.html#L3049).

**Rationale and smallest useful outcome:** The defaults are explicit seed data, not independently verified game policy.

**Dependencies:** No additional outcome dependency recorded; access and data-policy questions still apply.

**Requirements:** [RQ-235](../3-requirements/requirements.md#rq-235), [RQ-236](../3-requirements/requirements.md#rq-236), [RQ-237](../3-requirements/requirements.md#rq-237), [RQ-238](../3-requirements/requirements.md#rq-238), [RQ-239](../3-requirements/requirements.md#rq-239).

**Constraints and questions:** [Q-053](../3-requirements/open-questions.md#q-053)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Should Have - Provisional. Useful support for the represented workflow; a manual workaround may be tolerable.

**Omission consequence:** Omitting this outcome leaves the operator unable to start with the offence ladders represented in the design through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-038](../3-requirements/requirements.md#br-038) and example
[EX-038](../3-requirements/requirements.md#ex-038) preserve
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
