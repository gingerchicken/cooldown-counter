# US-039 - Predict escalation independently per account and offence

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to get a next-offence prediction for each account and offence type, so that I can anticipate the relevant cooldown without unrelated histories changing it.

**Evidence:** Visible. Source lines: [2757-2764](../docs/design/cooldown-counter.html#L2757), [3198-3244](../docs/design/cooldown-counter.html#L3198), [3413-3418](../docs/design/cooldown-counter.html#L3413).

**Rationale and smallest useful outcome:** Isolation and single-step escalation are explicit transition rules.

**Dependencies:** No additional outcome dependency recorded; access and data-policy questions still apply.

**Requirements:** [RQ-240](../3-requirements/requirements.md#rq-240), [RQ-241](../3-requirements/requirements.md#rq-241), [RQ-242](../3-requirements/requirements.md#rq-242), [RQ-243](../3-requirements/requirements.md#rq-243), [RQ-244](../3-requirements/requirements.md#rq-244), [RQ-245](../3-requirements/requirements.md#rq-245), [RQ-246](../3-requirements/requirements.md#rq-246), [RQ-247](../3-requirements/requirements.md#rq-247), [RQ-248](../3-requirements/requirements.md#rq-248).

**Constraints and questions:** [Q-053](../3-requirements/open-questions.md#q-053), [Q-037](../3-requirements/open-questions.md#q-037), [Q-051](../3-requirements/open-questions.md#q-051)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to get a next-offence prediction for each account and offence type through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-039](../3-requirements/requirements.md#br-039) and example
[EX-039](../3-requirements/requirements.md#ex-039) preserve
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
