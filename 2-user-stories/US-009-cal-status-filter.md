# US-009 - Focus by cooldown status

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to filter the workspace by restriction status, so that I can focus on the availability state relevant to my task.

**Evidence:** Visible. Source lines: [2407-2412](../docs/design/cooldown-counter.html#L2407), [2554-2559](../docs/design/cooldown-counter.html#L2554), [3275-3275](../docs/design/cooldown-counter.html#L3275), [3314-3318](../docs/design/cooldown-counter.html#L3314), [3389-3395](../docs/design/cooldown-counter.html#L3389).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Focus on the availability state relevant to my task.

**Dependencies:** [US-006](US-006-cal-navigation.md)

**Requirements:** [RQ-055](../3-requirements/requirements.md#rq-055), [RQ-056](../3-requirements/requirements.md#rq-056), [RQ-057](../3-requirements/requirements.md#rq-057), [RQ-058](../3-requirements/requirements.md#rq-058).

**Constraints and questions:** [Q-002](../3-requirements/open-questions.md#q-002), [Q-003](../3-requirements/open-questions.md#q-003), [Q-033](../3-requirements/open-questions.md#q-033)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to filter the workspace by restriction status through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-009](../3-requirements/requirements.md#br-009) and example
[EX-009](../3-requirements/requirements.md#ex-009) preserve
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
