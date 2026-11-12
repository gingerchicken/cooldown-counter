# US-014 - Reach crowded calendar records

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to reach all records represented by a crowded week, so that I can avoid overlooking observations hidden by visual density.

**Evidence:** Proposed. Source lines: [2500-2502](../docs/design/cooldown-counter.html#L2500), [3343-3347](../docs/design/cooldown-counter.html#L3343), [3629-3629](../docs/design/cooldown-counter.html#L3629).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Avoid overlooking observations hidden by visual density.

**Dependencies:** [US-012](US-012-cal-calendar-spans.md)

**Requirements:** [RQ-099](../3-requirements/requirements.md#rq-099), [RQ-100](../3-requirements/requirements.md#rq-100), [RQ-101](../3-requirements/requirements.md#rq-101).

**Constraints and questions:** [Q-005](../3-requirements/open-questions.md#q-005), [Q-004](../3-requirements/open-questions.md#q-004)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to reach all records represented by a crowded week through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-014](../3-requirements/requirements.md#br-014) and example
[EX-014](../3-requirements/requirements.md#ex-014) preserve
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
