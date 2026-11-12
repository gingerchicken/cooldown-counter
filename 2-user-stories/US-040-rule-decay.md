# US-040 - Account for clean-time decay

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to see my next cooldown reduced after completed clean windows, so that I can understand when an earlier offence stops affecting escalation.

**Evidence:** Visible. Source lines: [2761-2763](../docs/design/cooldown-counter.html#L2761), [3141-3153](../docs/design/cooldown-counter.html#L3141), [3190-3195](../docs/design/cooldown-counter.html#L3190), [3474-3477](../docs/design/cooldown-counter.html#L3474).

**Rationale and smallest useful outcome:** The visible default model drops one level per seven clean days from expiry.

**Dependencies:** [US-039](US-039-rule-predict-independent.md)

**Requirements:** [RQ-249](../3-requirements/requirements.md#rq-249), [RQ-250](../3-requirements/requirements.md#rq-250), [RQ-251](../3-requirements/requirements.md#rq-251), [RQ-252](../3-requirements/requirements.md#rq-252), [RQ-253](../3-requirements/requirements.md#rq-253), [RQ-254](../3-requirements/requirements.md#rq-254), [RQ-255](../3-requirements/requirements.md#rq-255), [RQ-256](../3-requirements/requirements.md#rq-256).

**Constraints and questions:** [Q-050](../3-requirements/open-questions.md#q-050), [Q-052](../3-requirements/open-questions.md#q-052), [Q-053](../3-requirements/open-questions.md#q-053), [Q-030](../3-requirements/open-questions.md#q-030)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to see my next cooldown reduced after completed clean windows through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-040](../3-requirements/requirements.md#br-040) and example
[EX-040](../3-requirements/requirements.md#ex-040) preserve
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
