# US-033 - Record a known ladder step

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to override a predicted step when I know the issue level, so that the record can reflect stronger evidence than the estimate.

**Evidence:** Visible. Source lines: [2923-2944](../docs/design/cooldown-counter.html#L2923), [3175-3184](../docs/design/cooldown-counter.html#L3175), [3727-3748](../docs/design/cooldown-counter.html#L3727).

**Rationale and smallest useful outcome:** The report offers a draggable ladder map and explains manual precedence.

**Dependencies:** [US-032](US-032-obs-report-preview.md)

**Requirements:** [RQ-203](../3-requirements/requirements.md#rq-203), [RQ-204](../3-requirements/requirements.md#rq-204), [RQ-205](../3-requirements/requirements.md#rq-205), [RQ-206](../3-requirements/requirements.md#rq-206), [RQ-207](../3-requirements/requirements.md#rq-207), [RQ-208](../3-requirements/requirements.md#rq-208), [RQ-209](../3-requirements/requirements.md#rq-209), [RQ-210](../3-requirements/requirements.md#rq-210), [RQ-211](../3-requirements/requirements.md#rq-211), [RQ-212](../3-requirements/requirements.md#rq-212).

**Constraints and questions:** [Q-037](../3-requirements/open-questions.md#q-037)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Should Have - Provisional. Useful support for the represented workflow; a manual workaround may be tolerable.

**Omission consequence:** Omitting this outcome leaves the operator unable to override a predicted step when I know the issue level through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-033](../3-requirements/requirements.md#br-033) and example
[EX-033](../3-requirements/requirements.md#ex-033) preserve
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
