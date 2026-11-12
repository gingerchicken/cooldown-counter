# US-018 - Compare account availability

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to review a status and next-cooldown summary for each account, so that I can compare account availability and escalation risk.

**Evidence:** Visible. Source lines: [2598-2636](../docs/design/cooldown-counter.html#L2598), [3388-3409](../docs/design/cooldown-counter.html#L3388).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Compare account availability and escalation risk.

**Dependencies:** [US-006](US-006-cal-navigation.md)

**Requirements:** [RQ-109](../3-requirements/requirements.md#rq-109), [RQ-110](../3-requirements/requirements.md#rq-110), [RQ-111](../3-requirements/requirements.md#rq-111), [RQ-112](../3-requirements/requirements.md#rq-112), [RQ-113](../3-requirements/requirements.md#rq-113), [RQ-114](../3-requirements/requirements.md#rq-114), [RQ-115](../3-requirements/requirements.md#rq-115), [RQ-116](../3-requirements/requirements.md#rq-116), [RQ-117](../3-requirements/requirements.md#rq-117), [RQ-118](../3-requirements/requirements.md#rq-118), [RQ-119](../3-requirements/requirements.md#rq-119), [RQ-120](../3-requirements/requirements.md#rq-120).

**Constraints and questions:** [Q-033](../3-requirements/open-questions.md#q-033), [Q-010](../3-requirements/open-questions.md#q-010), [Q-011](../3-requirements/open-questions.md#q-011)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to review a status and next-cooldown summary for each account through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-018](../3-requirements/requirements.md#br-018) and example
[EX-018](../3-requirements/requirements.md#ex-018) preserve
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
