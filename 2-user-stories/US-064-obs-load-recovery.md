# US-064 - Understand delayed or failed data loading

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to distinguish unavailable data from an empty fleet or history, so that I can decide whether to retry or continue.

**Evidence:** Proposed. Source lines: [3094-3112](../docs/design/cooldown-counter.html#L3094), [3135-3143](../docs/design/cooldown-counter.html#L3135).

**Rationale and smallest useful outcome:** The prototype uses local seed arrays, so loading and service-failure states are absent.

**Dependencies:** [US-051](US-051-obs-durable-history.md)

**Requirements:** [RQ-359](../3-requirements/requirements.md#rq-359), [RQ-360](../3-requirements/requirements.md#rq-360), [RQ-361](../3-requirements/requirements.md#rq-361).

**Constraints and questions:** [Q-048](../3-requirements/open-questions.md#q-048), [Q-049](../3-requirements/open-questions.md#q-049)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Should Have - Provisional. Useful support for the represented workflow; a manual workaround may be tolerable.

**Omission consequence:** Omitting this outcome leaves the operator unable to distinguish unavailable data from an empty fleet or history through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-064](../3-requirements/requirements.md#br-064) and example
[EX-064](../3-requirements/requirements.md#ex-064) preserve
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
