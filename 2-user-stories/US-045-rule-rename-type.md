# US-045 - Rename an offence type without losing history

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to rename an offence type while retaining its associations, so that I can correct a label without losing observations.

**Evidence:** Visible. Source lines: [3512-3512](../docs/design/cooldown-counter.html#L3512), [3544-3547](../docs/design/cooldown-counter.html#L3544).

**Rationale and smallest useful outcome:** The design explicitly states that renaming carries records with it.

**Dependencies:** [US-044](US-044-rule-edit-metadata.md)

**Requirements:** [RQ-277](../3-requirements/requirements.md#rq-277), [RQ-278](../3-requirements/requirements.md#rq-278), [RQ-279](../3-requirements/requirements.md#rq-279), [RQ-280](../3-requirements/requirements.md#rq-280), [RQ-281](../3-requirements/requirements.md#rq-281).

**Constraints and questions:** [Q-042](../3-requirements/open-questions.md#q-042)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to rename an offence type while retaining its associations through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-045](../3-requirements/requirements.md#br-045) and example
[EX-045](../3-requirements/requirements.md#ex-045) preserve
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
