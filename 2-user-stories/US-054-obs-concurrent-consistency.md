# US-054 - Resolve changes during reporting

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to know when shared history or rules have changed before my report is saved, so that I can review a changed estimate before relying on it.

**Evidence:** Proposed. Source lines: [3208-3225](../docs/design/cooldown-counter.html#L3208), [3483-3501](../docs/design/cooldown-counter.html#L3483), [3543-3548](../docs/design/cooldown-counter.html#L3543), [3750-3758](../docs/design/cooldown-counter.html#L3750).

**Rationale and smallest useful outcome:** A shared app can invalidate previews while the prototype only has single in-memory state.

**Dependencies:** [US-052](US-052-obs-shared-history.md), [US-032](US-032-obs-report-preview.md)

**Requirements:** [RQ-324](../3-requirements/requirements.md#rq-324), [RQ-325](../3-requirements/requirements.md#rq-325), [RQ-326](../3-requirements/requirements.md#rq-326).

**Constraints and questions:** [Q-042](../3-requirements/open-questions.md#q-042), [Q-032](../3-requirements/open-questions.md#q-032)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Should Have - Provisional. Useful support for the represented workflow; a manual workaround may be tolerable.

**Omission consequence:** Omitting this outcome leaves the operator unable to know when shared history or rules have changed before my report is saved through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-054](../3-requirements/requirements.md#br-054) and example
[EX-054](../3-requirements/requirements.md#ex-054) preserve
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
