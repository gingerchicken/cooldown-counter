# US-047 - Change the number of escalation steps

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to add or remove steps in an offence ladder, so that I can represent the observed number of escalation levels.

**Evidence:** Visible. Source lines: [3003-3034](../docs/design/cooldown-counter.html#L3003), [3517-3526](../docs/design/cooldown-counter.html#L3517).

**Rationale and smallest useful outcome:** The editor permits adding steps and removal while more than one remains.

**Dependencies:** [US-046](US-046-rule-edit-duration.md)

**Requirements:** [RQ-288](../3-requirements/requirements.md#rq-288), [RQ-289](../3-requirements/requirements.md#rq-289), [RQ-290](../3-requirements/requirements.md#rq-290), [RQ-291](../3-requirements/requirements.md#rq-291), [RQ-292](../3-requirements/requirements.md#rq-292).

**Constraints and questions:** [Q-054](../3-requirements/open-questions.md#q-054), [Q-051](../3-requirements/open-questions.md#q-051)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Should Have - Provisional. Useful support for the represented workflow; a manual workaround may be tolerable.

**Omission consequence:** Omitting this outcome leaves the operator unable to add or remove steps in an offence ladder through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-047](../3-requirements/requirements.md#br-047) and example
[EX-047](../3-requirements/requirements.md#ex-047) preserve
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
