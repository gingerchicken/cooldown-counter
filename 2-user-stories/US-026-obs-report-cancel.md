# US-026 - Leave an unfinished report

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to close an unfinished observation without recording it, so that I can leave exploratory input without adding a cooldown.

**Evidence:** Visible. Source lines: [2807-2807](../docs/design/cooldown-counter.html#L2807), [2949-2951](../docs/design/cooldown-counter.html#L2949), [3659-3659](../docs/design/cooldown-counter.html#L3659).

**Rationale and smallest useful outcome:** Both close and Cancel toggle the dialog off without appending an event; draft retention needs an explicit decision.

**Dependencies:** [US-025](US-025-obs-report-open.md)

**Requirements:** [RQ-153](../3-requirements/requirements.md#rq-153), [RQ-154](../3-requirements/requirements.md#rq-154), [RQ-155](../3-requirements/requirements.md#rq-155).

**Constraints and questions:** [Q-029](../3-requirements/open-questions.md#q-029), [Q-028](../3-requirements/open-questions.md#q-028)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to close an unfinished observation without recording it through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-026](../3-requirements/requirements.md#br-026) and example
[EX-026](../3-requirements/requirements.md#ex-026) preserve
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
