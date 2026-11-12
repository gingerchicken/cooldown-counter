# US-041 - Evaluate observations in historical order

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to have observations evaluated in their effective chronological order, so that I can correct history without entry order changing escalation.

**Evidence:** Logic. Source lines: [2683-2701](../docs/design/cooldown-counter.html#L2683), [3198-3229](../docs/design/cooldown-counter.html#L3198), [3440-3443](../docs/design/cooldown-counter.html#L3440).

**Rationale and smallest useful outcome:** Replay sorts observations and preserves observed evidence separately from derived totals.

**Dependencies:** [US-039](US-039-rule-predict-independent.md), [US-040](US-040-rule-decay.md)

**Requirements:** [RQ-257](../3-requirements/requirements.md#rq-257), [RQ-258](../3-requirements/requirements.md#rq-258).

**Constraints and questions:** [Q-033](../3-requirements/open-questions.md#q-033), [Q-051](../3-requirements/open-questions.md#q-051), [Q-030](../3-requirements/open-questions.md#q-030)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to have observations evaluated in their effective chronological order through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-041](../3-requirements/requirements.md#br-041) and example
[EX-041](../3-requirements/requirements.md#ex-041) preserve
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
