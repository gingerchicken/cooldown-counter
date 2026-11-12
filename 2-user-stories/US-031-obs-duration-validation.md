# US-031 - Correct invalid remaining input

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to receive explicit feedback for invalid remaining duration, so that the stored observation is not silently changed.

**Evidence:** Proposed. Source lines: [2894-2894](../docs/design/cooldown-counter.html#L2894), [3489-3489](../docs/design/cooldown-counter.html#L3489), [3753-3753](../docs/design/cooldown-counter.html#L3753).

**Rationale and smallest useful outcome:** The prototype substitutes and rounds values; production semantics need agreement.

**Dependencies:** [US-030](US-030-obs-remaining-duration.md)

**Requirements:** [RQ-190](../3-requirements/requirements.md#rq-190), [RQ-191](../3-requirements/requirements.md#rq-191), [RQ-192](../3-requirements/requirements.md#rq-192), [RQ-193](../3-requirements/requirements.md#rq-193), [RQ-194](../3-requirements/requirements.md#rq-194).

**Constraints and questions:** [Q-034](../3-requirements/open-questions.md#q-034), [Q-038](../3-requirements/open-questions.md#q-038)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to receive explicit feedback for invalid remaining duration through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-031](../3-requirements/requirements.md#br-031) and example
[EX-031](../3-requirements/requirements.md#ex-031) preserve
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
