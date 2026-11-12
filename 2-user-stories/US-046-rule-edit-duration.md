# US-046 - Edit a ladder step duration

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to edit the amount and unit of a ladder step, so that I can correct the modelled cooldown at that level.

**Evidence:** Visible. Source lines: [3003-3034](../docs/design/cooldown-counter.html#L3003), [3507-3507](../docs/design/cooldown-counter.html#L3507), [3517-3522](../docs/design/cooldown-counter.html#L3517), [3538-3538](../docs/design/cooldown-counter.html#L3538).

**Rationale and smallest useful outcome:** The editor exposes per-step amount, unit and formatted preview.

**Dependencies:** [US-044](US-044-rule-edit-metadata.md)

**Requirements:** [RQ-282](../3-requirements/requirements.md#rq-282), [RQ-283](../3-requirements/requirements.md#rq-283), [RQ-284](../3-requirements/requirements.md#rq-284), [RQ-285](../3-requirements/requirements.md#rq-285), [RQ-286](../3-requirements/requirements.md#rq-286), [RQ-287](../3-requirements/requirements.md#rq-287).

**Constraints and questions:** [Q-054](../3-requirements/open-questions.md#q-054), [Q-055](../3-requirements/open-questions.md#q-055), [Q-051](../3-requirements/open-questions.md#q-051), [Q-058](../3-requirements/open-questions.md#q-058)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Should Have - Provisional. Useful support for the represented workflow; a manual workaround may be tolerable.

**Omission consequence:** Omitting this outcome leaves the operator unable to edit the amount and unit of a ladder step through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-046](../3-requirements/requirements.md#br-046) and example
[EX-046](../3-requirements/requirements.md#ex-046) preserve
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
