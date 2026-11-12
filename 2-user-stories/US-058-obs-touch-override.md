# US-058 - Choose an override on a touch device

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to select a known ladder step with touch input, so that I can record the same evidence on a touch device.

**Evidence:** Proposed. Source lines: [2930-2942](../docs/design/cooldown-counter.html#L2930), [3175-3184](../docs/design/cooldown-counter.html#L3175), [3728-3734](../docs/design/cooldown-counter.html#L3728).

**Rationale and smallest useful outcome:** The supplied step map listens only to mousedown/mousemove/mouseup.

**Dependencies:** [US-033](US-033-obs-manual-override.md)

**Requirements:** [RQ-339](../3-requirements/requirements.md#rq-339).

**Constraints and questions:** [Q-045](../3-requirements/open-questions.md#q-045), [Q-046](../3-requirements/open-questions.md#q-046)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Should Have - Provisional. Useful support for the represented workflow; a manual workaround may be tolerable.

**Omission consequence:** Omitting this outcome leaves the operator unable to select a known ladder step with touch input through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-058](../3-requirements/requirements.md#br-058) and example
[EX-058](../3-requirements/requirements.md#ex-058) preserve
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
