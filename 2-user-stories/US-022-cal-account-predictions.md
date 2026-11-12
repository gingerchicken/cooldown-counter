# US-022 - Compare per-offence predictions

**Status:** Draft - design-derived; product validation pending.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to see the next cooldown prediction on every configured offence ladder, so that I can understand each type-specific escalation risk.

**Evidence:** Visible. Source lines: [2668-2677](../docs/design/cooldown-counter.html#L2668), [3416-3418](../docs/design/cooldown-counter.html#L3416).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Understand each type-specific escalation risk.

**Dependencies:** [US-020](US-020-cal-account-detail.md)

**Requirements:** [RQ-133](../3-requirements/requirements.md#rq-133), [RQ-134](../3-requirements/requirements.md#rq-134), [RQ-135](../3-requirements/requirements.md#rq-135), [RQ-136](../3-requirements/requirements.md#rq-136).

**Constraints and questions:** None identified for this narrow obligation.
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to see the next cooldown prediction on every configured offence ladder through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-022](../3-requirements/requirements.md#br-022) and example
[EX-022](../3-requirements/requirements.md#ex-022) preserve
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
