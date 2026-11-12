# US-003 - Resume a valid session

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to resume a valid signed-in session on return, so that I can continue operator work without unnecessary sign-in.

**Evidence:** Logic. Source lines: [3132-3136](../docs/design/cooldown-counter.html#L3132), [3558-3559](../docs/design/cooldown-counter.html#L3558), [3563-3564](../docs/design/cooldown-counter.html#L3563).

**Rationale and smallest useful outcome:** The prototype restores a local flag; production restoration must use authoritative session validity.

**Dependencies:** [US-001](US-001-obs-sign-in.md)

**Requirements:** [RQ-017](../3-requirements/requirements.md#rq-017), [RQ-018](../3-requirements/requirements.md#rq-018), [RQ-019](../3-requirements/requirements.md#rq-019).

**Constraints and questions:** [Q-026](../3-requirements/open-questions.md#q-026)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Should Have - Provisional. Useful support for the represented workflow; a manual workaround may be tolerable.

**Omission consequence:** Omitting this outcome leaves the operator unable to resume a valid signed-in session on return through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-003](../3-requirements/requirements.md#br-003) and example
[EX-003](../3-requirements/requirements.md#ex-003) preserve
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
