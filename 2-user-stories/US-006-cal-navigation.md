# US-006 - Navigate the fleet workspace

**Status:** Draft - design-derived; product validation pending.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to switch among the calendar, accounts and cooldown rules, so that I can reach the view that supports my current task.

**Evidence:** Visible. Source lines: [2309-2364](../docs/design/cooldown-counter.html#L2309), [3258-3265](../docs/design/cooldown-counter.html#L3258).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Reach the view that supports my current task.

**Dependencies:** No additional outcome dependency recorded; access and data-policy questions still apply.

**Requirements:** [RQ-031](../3-requirements/requirements.md#rq-031), [RQ-032](../3-requirements/requirements.md#rq-032), [RQ-033](../3-requirements/requirements.md#rq-033), [RQ-034](../3-requirements/requirements.md#rq-034), [RQ-035](../3-requirements/requirements.md#rq-035), [RQ-036](../3-requirements/requirements.md#rq-036), [RQ-037](../3-requirements/requirements.md#rq-037), [RQ-038](../3-requirements/requirements.md#rq-038).

**Constraints and questions:** None identified for this narrow obligation.
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to switch among the calendar, accounts and cooldown rules through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-006](../3-requirements/requirements.md#br-006) and example
[EX-006](../3-requirements/requirements.md#ex-006) preserve
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
