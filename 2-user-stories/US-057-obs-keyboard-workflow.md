# US-057 - Use the tracking workflow without a mouse

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to complete the represented tracking tasks with a keyboard, so that I can record evidence without pointer-only controls.

**Evidence:** Proposed. Source lines: [2813-2951](../docs/design/cooldown-counter.html#L2813), [3175-3184](../docs/design/cooldown-counter.html#L3175), [3728-3734](../docs/design/cooldown-counter.html#L3728).

**Rationale and smallest useful outcome:** Inputs and buttons are keyboard-capable in principle, but the map uses mouse handlers and custom selectors have no defined keyboard model.

**Dependencies:** [US-025](US-025-obs-report-open.md), [US-033](US-033-obs-manual-override.md)

**Requirements:** [RQ-333](../3-requirements/requirements.md#rq-333), [RQ-334](../3-requirements/requirements.md#rq-334), [RQ-335](../3-requirements/requirements.md#rq-335), [RQ-336](../3-requirements/requirements.md#rq-336), [RQ-337](../3-requirements/requirements.md#rq-337), [RQ-338](../3-requirements/requirements.md#rq-338).

**Constraints and questions:** [Q-045](../3-requirements/open-questions.md#q-045), [Q-006](../3-requirements/open-questions.md#q-006)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to complete the represented tracking tasks with a keyboard through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-057](../3-requirements/requirements.md#br-057) and example
[EX-057](../3-requirements/requirements.md#ex-057) preserve
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
