# US-049 - Use an alternative decay policy if approved

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to model an agreed alternative transition policy, so that I can evaluate a rule set that differs from the default.

**Evidence:** Logic. Source lines: [3141-3153](../docs/design/cooldown-counter.html#L3141), [3190-3195](../docs/design/cooldown-counter.html#L3190), [3225-3225](../docs/design/cooldown-counter.html#L3225).

**Rationale and smallest useful outcome:** Full reset, No decay and start anchor are implemented code paths without visible controls.

**Dependencies:** [US-039](US-039-rule-predict-independent.md)

**Requirements:** [RQ-301](../3-requirements/requirements.md#rq-301), [RQ-302](../3-requirements/requirements.md#rq-302), [RQ-303](../3-requirements/requirements.md#rq-303), [RQ-304](../3-requirements/requirements.md#rq-304), [RQ-305](../3-requirements/requirements.md#rq-305).

**Constraints and questions:** [Q-052](../3-requirements/open-questions.md#q-052), [Q-051](../3-requirements/open-questions.md#q-051)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Could Have - Provisional. Optional or code-only extension; omission does not yet invalidate the represented core workflow.

**Omission consequence:** Omitting this outcome leaves the operator unable to model an agreed alternative transition policy through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-049](../3-requirements/requirements.md#br-049) and example
[EX-049](../3-requirements/requirements.md#ex-049) preserve
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
