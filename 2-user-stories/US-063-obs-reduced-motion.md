# US-063 - Use equivalent interactions with reduced motion

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to use reporting and navigation with reduced animation, so that motion preferences do not obstruct the task.

**Evidence:** Proposed. Source lines: [2247-2248](../docs/design/cooldown-counter.html#L2247), [2800-2801](../docs/design/cooldown-counter.html#L2800), [2959-2960](../docs/design/cooldown-counter.html#L2959), [3645-3649](../docs/design/cooldown-counter.html#L3645).

**Rationale and smallest useful outcome:** The prototype uses pop/fade animations and smooth scrolling without a preference check.

**Dependencies:** No additional outcome dependency recorded; access and data-policy questions still apply.

**Requirements:** [RQ-358](../3-requirements/requirements.md#rq-358).

**Constraints and questions:** [Q-047](../3-requirements/open-questions.md#q-047)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Could Have - Provisional. Optional or code-only extension; omission does not yet invalidate the represented core workflow.

**Omission consequence:** Omitting this outcome leaves the operator unable to use reporting and navigation with reduced animation through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-063](../3-requirements/requirements.md#br-063) and example
[EX-063](../3-requirements/requirements.md#ex-063) preserve
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
