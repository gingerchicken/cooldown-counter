# US-005 - Limit records to permitted operators

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to access only the fleet records and actions permitted to me, so that restricted account history remains within its intended group.

**Evidence:** Proposed. Source lines: [2266-2266](../docs/design/cooldown-counter.html#L2266), [3640-3640](../docs/design/cooldown-counter.html#L3640), [3554-3559](../docs/design/cooldown-counter.html#L3554), [3459-3471](../docs/design/cooldown-counter.html#L3459), [3536-3548](../docs/design/cooldown-counter.html#L3536), [3750-3758](../docs/design/cooldown-counter.html#L3750).

**Rationale and smallest useful outcome:** The design promises restricted records but contains no server access boundary or membership definition.

**Dependencies:** [US-001](US-001-obs-sign-in.md)

**Requirements:** [RQ-025](../3-requirements/requirements.md#rq-025), [RQ-026](../3-requirements/requirements.md#rq-026), [RQ-027](../3-requirements/requirements.md#rq-027), [RQ-028](../3-requirements/requirements.md#rq-028), [RQ-029](../3-requirements/requirements.md#rq-029), [RQ-030](../3-requirements/requirements.md#rq-030).

**Constraints and questions:** [Q-027](../3-requirements/open-questions.md#q-027)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to access only the fleet records and actions permitted to me through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-005](../3-requirements/requirements.md#br-005) and example
[EX-005](../3-requirements/requirements.md#ex-005) preserve
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
