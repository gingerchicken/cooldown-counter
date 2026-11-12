# US-055 - Recover when access expires

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to recover safely when my session expires during work, so that I can resume authorized reporting without exposing the draft to another visitor.

**Evidence:** Proposed. Source lines: [3133-3136](../docs/design/cooldown-counter.html#L3133), [3573-3576](../docs/design/cooldown-counter.html#L3573), [3750-3758](../docs/design/cooldown-counter.html#L3750).

**Rationale and smallest useful outcome:** Session expiry is absent in demo; draft retention is a privacy and data-loss decision.

**Dependencies:** [US-001](US-001-obs-sign-in.md), [US-025](US-025-obs-report-open.md), [US-053](US-053-obs-save-recovery.md)

**Requirements:** [RQ-327](../3-requirements/requirements.md#rq-327), [RQ-328](../3-requirements/requirements.md#rq-328), [RQ-329](../3-requirements/requirements.md#rq-329).

**Constraints and questions:** [Q-026](../3-requirements/open-questions.md#q-026), [Q-028](../3-requirements/open-questions.md#q-028)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to recover safely when my session expires during work through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-055](../3-requirements/requirements.md#br-055) and example
[EX-055](../3-requirements/requirements.md#ex-055) preserve
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
