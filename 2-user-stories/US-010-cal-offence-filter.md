# US-010 - Focus by offence type

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to filter by one or more offence types, so that I can investigate the ladders relevant to my question.

**Evidence:** Visible. Source lines: [2413-2445](../docs/design/cooldown-counter.html#L2413), [2560-2592](../docs/design/cooldown-counter.html#L2560), [3610-3627](../docs/design/cooldown-counter.html#L3610).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Investigate the ladders relevant to my question.

**Dependencies:** [US-006](US-006-cal-navigation.md)

**Requirements:** [RQ-059](../3-requirements/requirements.md#rq-059), [RQ-060](../3-requirements/requirements.md#rq-060), [RQ-061](../3-requirements/requirements.md#rq-061), [RQ-062](../3-requirements/requirements.md#rq-062), [RQ-063](../3-requirements/requirements.md#rq-063), [RQ-064](../3-requirements/requirements.md#rq-064), [RQ-065](../3-requirements/requirements.md#rq-065), [RQ-066](../3-requirements/requirements.md#rq-066), [RQ-067](../3-requirements/requirements.md#rq-067), [RQ-068](../3-requirements/requirements.md#rq-068), [RQ-069](../3-requirements/requirements.md#rq-069).

**Constraints and questions:** [Q-003](../3-requirements/open-questions.md#q-003)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to filter by one or more offence types through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-010](../3-requirements/requirements.md#br-010) and example
[EX-010](../3-requirements/requirements.md#ex-010) preserve
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
