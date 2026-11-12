# US-048 - Review offence type deletion impact

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to see the impact before confirming offence type removal, so that I can avoid accidental loss of recorded observations.

**Evidence:** Visible. Source lines: [2725-2725](../docs/design/cooldown-counter.html#L2725), [3459-3471](../docs/design/cooldown-counter.html#L3459).

**Rationale and smallest useful outcome:** The reference uses two delete actions and displays dependent record count; cascade policy requires approval.

**Dependencies:** [US-037](US-037-rule-inspect-ladders.md)

**Requirements:** [RQ-293](../3-requirements/requirements.md#rq-293), [RQ-294](../3-requirements/requirements.md#rq-294), [RQ-295](../3-requirements/requirements.md#rq-295), [RQ-296](../3-requirements/requirements.md#rq-296), [RQ-297](../3-requirements/requirements.md#rq-297), [RQ-298](../3-requirements/requirements.md#rq-298), [RQ-299](../3-requirements/requirements.md#rq-299), [RQ-300](../3-requirements/requirements.md#rq-300).

**Constraints and questions:** [Q-057](../3-requirements/open-questions.md#q-057), [Q-039](../3-requirements/open-questions.md#q-039), [Q-042](../3-requirements/open-questions.md#q-042), [Q-059](../3-requirements/open-questions.md#q-059), [Q-028](../3-requirements/open-questions.md#q-028)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to see the impact before confirming offence type removal through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-048](../3-requirements/requirements.md#br-048) and example
[EX-048](../3-requirements/requirements.md#ex-048) preserve
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
