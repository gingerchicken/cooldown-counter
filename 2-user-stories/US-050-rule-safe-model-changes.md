# US-050 - Understand the impact of a model change

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to review how changing a ladder affects existing records and predictions, so that I can correct rules without silently rewriting the meaning of history.

**Evidence:** Proposed. Source lines: [3208-3227](../docs/design/cooldown-counter.html#L3208), [3538-3544](../docs/design/cooldown-counter.html#L3538), [3463-3464](../docs/design/cooldown-counter.html#L3463).

**Rationale and smallest useful outcome:** This is a proposed safeguard for prototype-wide retrospective replay.

**Dependencies:** [US-046](US-046-rule-edit-duration.md), [US-045](US-045-rule-rename-type.md)

**Requirements:** [RQ-306](../3-requirements/requirements.md#rq-306), [RQ-307](../3-requirements/requirements.md#rq-307), [RQ-308](../3-requirements/requirements.md#rq-308), [RQ-309](../3-requirements/requirements.md#rq-309).

**Constraints and questions:** [Q-051](../3-requirements/open-questions.md#q-051), [Q-042](../3-requirements/open-questions.md#q-042), [Q-039](../3-requirements/open-questions.md#q-039)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to review how changing a ladder affects existing records and predictions through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-050](../3-requirements/requirements.md#br-050) and example
[EX-050](../3-requirements/requirements.md#ex-050) preserve
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
