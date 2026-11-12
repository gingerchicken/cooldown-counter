# US-013 - Review future step-down dates

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to see forecasts separately from recorded cooldowns, so that I can anticipate ladder changes without mistaking a prediction for evidence.

**Evidence:** Visible. Source lines: [2456-2459](../docs/design/cooldown-counter.html#L2456), [3287-3298](../docs/design/cooldown-counter.html#L3287), [3332-3340](../docs/design/cooldown-counter.html#L3332).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Anticipate ladder changes without mistaking a prediction for evidence.

**Dependencies:** [US-012](US-012-cal-calendar-spans.md)

**Requirements:** [RQ-089](../3-requirements/requirements.md#rq-089), [RQ-090](../3-requirements/requirements.md#rq-090), [RQ-091](../3-requirements/requirements.md#rq-091), [RQ-092](../3-requirements/requirements.md#rq-092), [RQ-093](../3-requirements/requirements.md#rq-093), [RQ-094](../3-requirements/requirements.md#rq-094), [RQ-095](../3-requirements/requirements.md#rq-095), [RQ-096](../3-requirements/requirements.md#rq-096), [RQ-097](../3-requirements/requirements.md#rq-097), [RQ-098](../3-requirements/requirements.md#rq-098).

**Constraints and questions:** [Q-021](../3-requirements/open-questions.md#q-021), [Q-022](../3-requirements/open-questions.md#q-022), [Q-017](../3-requirements/open-questions.md#q-017), [Q-050](../3-requirements/open-questions.md#q-050), [Q-051](../3-requirements/open-questions.md#q-051), [Q-007](../3-requirements/open-questions.md#q-007), [Q-024](../3-requirements/open-questions.md#q-024)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to see forecasts separately from recorded cooldowns through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-013](../3-requirements/requirements.md#br-013) and example
[EX-013](../3-requirements/requirements.md#ex-013) preserve
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
