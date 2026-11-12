# US-051 - Retain recorded history

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to retain accepted observations and configuration after reload, so that my work remains available for later operator review.

**Evidence:** Proposed. Source lines: [3132-3143](../docs/design/cooldown-counter.html#L3132), [3541-3548](../docs/design/cooldown-counter.html#L3541), [3754-3758](../docs/design/cooldown-counter.html#L3754).

**Rationale and smallest useful outcome:** The shared-tracker design needs durable records; only the prototype auth flag survives reload.

**Dependencies:** [US-035](US-035-obs-record-observation.md)

**Requirements:** [RQ-310](../3-requirements/requirements.md#rq-310), [RQ-311](../3-requirements/requirements.md#rq-311), [RQ-312](../3-requirements/requirements.md#rq-312).

**Constraints and questions:** [Q-040](../3-requirements/open-questions.md#q-040), [Q-027](../3-requirements/open-questions.md#q-027)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to retain accepted observations and configuration after reload through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-051](../3-requirements/requirements.md#br-051) and example
[EX-051](../3-requirements/requirements.md#ex-051) preserve
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
