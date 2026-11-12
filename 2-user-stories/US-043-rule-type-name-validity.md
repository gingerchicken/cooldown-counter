# US-043 - Prevent ambiguous offence type names

**Status:** Draft - design-derived; product validation pending.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to receive feedback when an offence name is empty or already used, so that I can keep the catalogue unambiguous.

**Evidence:** Visible. Source lines: [3508-3509](../docs/design/cooldown-counter.html#L3508), [3532-3537](../docs/design/cooldown-counter.html#L3532).

**Rationale and smallest useful outcome:** The editor validates trimmed names and case-insensitive duplicates.

**Dependencies:** [US-042](US-042-rule-add-type.md)

**Requirements:** [RQ-266](../3-requirements/requirements.md#rq-266), [RQ-267](../3-requirements/requirements.md#rq-267), [RQ-268](../3-requirements/requirements.md#rq-268), [RQ-269](../3-requirements/requirements.md#rq-269), [RQ-270](../3-requirements/requirements.md#rq-270).

**Constraints and questions:** None identified for this narrow obligation.
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to receive feedback when an offence name is empty or already used through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-043](../3-requirements/requirements.md#br-043) and example
[EX-043](../3-requirements/requirements.md#ex-043) preserve
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
| Estimable | Pass | Enough detail exists for this narrow design-level slice; real workload and release estimates are not asserted. |
| Small | Pass | One coherent outcome; its atomic rules share a single purpose. |
| Testable | Pass | Concrete acceptance conditions and a worked example are linked. |

All six checks pass only at the proposed design-outcome level. This is not scope approval.
