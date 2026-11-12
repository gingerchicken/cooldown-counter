# US-028 - Identify the observed offence

**Status:** Draft - design-derived; product validation pending.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to find and select the offence type for my observation, so that the report uses the applicable independent ladder.

**Evidence:** Visible. Source lines: [2853-2884](../docs/design/cooldown-counter.html#L2853), [3700-3719](../docs/design/cooldown-counter.html#L3700).

**Rationale and smallest useful outcome:** The report offers searchable offence definitions with first-step information.

**Dependencies:** [US-025](US-025-obs-report-open.md)

**Requirements:** [RQ-166](../3-requirements/requirements.md#rq-166), [RQ-167](../3-requirements/requirements.md#rq-167), [RQ-168](../3-requirements/requirements.md#rq-168), [RQ-169](../3-requirements/requirements.md#rq-169), [RQ-170](../3-requirements/requirements.md#rq-170), [RQ-171](../3-requirements/requirements.md#rq-171), [RQ-172](../3-requirements/requirements.md#rq-172), [RQ-173](../3-requirements/requirements.md#rq-173), [RQ-174](../3-requirements/requirements.md#rq-174), [RQ-175](../3-requirements/requirements.md#rq-175), [RQ-176](../3-requirements/requirements.md#rq-176), [RQ-177](../3-requirements/requirements.md#rq-177), [RQ-178](../3-requirements/requirements.md#rq-178), [RQ-179](../3-requirements/requirements.md#rq-179).

**Constraints and questions:** None identified for this narrow obligation.
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to find and select the offence type for my observation through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-028](../3-requirements/requirements.md#br-028) and example
[EX-028](../3-requirements/requirements.md#ex-028) preserve
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
