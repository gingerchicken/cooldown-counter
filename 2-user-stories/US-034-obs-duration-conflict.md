# US-034 - Resolve evidence that exceeds the estimate

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to see and resolve a remaining-duration mismatch, so that I do not mistake an inconsistent estimate for a valid total.

**Evidence:** Visible. Source lines: [2899-2905](../docs/design/cooldown-counter.html#L2899), [3490-3492](../docs/design/cooldown-counter.html#L3490), [3722-3726](../docs/design/cooldown-counter.html#L3722).

**Rationale and smallest useful outcome:** A warning and first-fitting-step correction exist; saving an unresolved mismatch is not defined.

**Dependencies:** [US-030](US-030-obs-remaining-duration.md), [US-032](US-032-obs-report-preview.md)

**Requirements:** [RQ-213](../3-requirements/requirements.md#rq-213), [RQ-214](../3-requirements/requirements.md#rq-214), [RQ-215](../3-requirements/requirements.md#rq-215), [RQ-216](../3-requirements/requirements.md#rq-216).

**Constraints and questions:** [Q-036](../3-requirements/open-questions.md#q-036)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to see and resolve a remaining-duration mismatch through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-034](../3-requirements/requirements.md#br-034) and example
[EX-034](../3-requirements/requirements.md#ex-034) preserve
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
