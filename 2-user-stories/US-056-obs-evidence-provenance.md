# US-056 - Distinguish observation from derived estimate

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to review which cooldown information was observed and which was predicted, so that I can judge the reliability of history and overrides.

**Evidence:** Visible. Source lines: [2805-2805](../docs/design/cooldown-counter.html#L2805), [2687-2696](../docs/design/cooldown-counter.html#L2687), [3440-3444](../docs/design/cooldown-counter.html#L3440), [3494-3501](../docs/design/cooldown-counter.html#L3494).

**Rationale and smallest useful outcome:** The form and history already separate observed remaining and total; authorship/version policy is not shown.

**Dependencies:** [US-035](US-035-obs-record-observation.md)

**Requirements:** [RQ-330](../3-requirements/requirements.md#rq-330), [RQ-331](../3-requirements/requirements.md#rq-331), [RQ-332](../3-requirements/requirements.md#rq-332).

**Constraints and questions:** [Q-030](../3-requirements/open-questions.md#q-030), [Q-043](../3-requirements/open-questions.md#q-043)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to review which cooldown information was observed and which was predicted through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-056](../3-requirements/requirements.md#br-056) and example
[EX-056](../3-requirements/requirements.md#ex-056) preserve
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
