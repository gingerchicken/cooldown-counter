# US-037 - Inspect offence ladders

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to inspect each offence type and its ordered cooldown ladder, so that I can understand escalation before recording an observation.

**Evidence:** Visible. Source lines: [2707-2754](../docs/design/cooldown-counter.html#L2707), [3447-3456](../docs/design/cooldown-counter.html#L3447).

**Rationale and smallest useful outcome:** The Cooldowns view exposes names, notes, usage and the final-step hold rule.

**Dependencies:** No additional outcome dependency recorded; access and data-policy questions still apply.

**Requirements:** [RQ-228](../3-requirements/requirements.md#rq-228), [RQ-229](../3-requirements/requirements.md#rq-229), [RQ-230](../3-requirements/requirements.md#rq-230), [RQ-231](../3-requirements/requirements.md#rq-231), [RQ-232](../3-requirements/requirements.md#rq-232), [RQ-233](../3-requirements/requirements.md#rq-233), [RQ-234](../3-requirements/requirements.md#rq-234).

**Constraints and questions:** [Q-053](../3-requirements/open-questions.md#q-053)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to inspect each offence type and its ordered cooldown ladder through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-037](../3-requirements/requirements.md#br-037) and example
[EX-037](../3-requirements/requirements.md#ex-037) preserve
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
