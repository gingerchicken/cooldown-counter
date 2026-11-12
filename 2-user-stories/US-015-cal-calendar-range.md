# US-015 - Browse calendar history and later months

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to browse the dates containing tracked cooldowns, so that I can inspect recorded history and later restrictions beyond the initial range.

**Evidence:** Visible. Source lines: [2510-2510](../docs/design/cooldown-counter.html#L2510), [3137-3139](../docs/design/cooldown-counter.html#L3137), [3166-3167](../docs/design/cooldown-counter.html#L3166).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Review long cooldowns and future ladder changes.

**Dependencies:** [US-012](US-012-cal-calendar-spans.md)

**Requirements:** [RQ-102](../3-requirements/requirements.md#rq-102), [RQ-103](../3-requirements/requirements.md#rq-103).

**Constraints and questions:** [Q-009](../3-requirements/open-questions.md#q-009), [Q-007](../3-requirements/open-questions.md#q-007)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Should Have - Provisional. Useful support for the represented workflow; a manual workaround may be tolerable.

**Omission consequence:** Omitting this outcome leaves the operator unable to browse the dates containing tracked cooldowns through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-015](../3-requirements/requirements.md#br-015) and example
[EX-015](../3-requirements/requirements.md#ex-015) preserve
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
