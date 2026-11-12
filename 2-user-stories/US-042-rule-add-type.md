# US-042 - Add an offence type

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to define a new named offence type and its ladder, so that I can track an observed category missing from the catalogue.

**Evidence:** Visible. Source lines: [2713-2713](../docs/design/cooldown-counter.html#L2713), [2957-3040](../docs/design/cooldown-counter.html#L2957), [3504-3541](../docs/design/cooldown-counter.html#L3504), [3579-3579](../docs/design/cooldown-counter.html#L3579).

**Rationale and smallest useful outcome:** The reference provides Add offence type and a full editor.

**Dependencies:** No additional outcome dependency recorded; access and data-policy questions still apply.

**Requirements:** [RQ-259](../3-requirements/requirements.md#rq-259), [RQ-260](../3-requirements/requirements.md#rq-260), [RQ-261](../3-requirements/requirements.md#rq-261), [RQ-262](../3-requirements/requirements.md#rq-262), [RQ-263](../3-requirements/requirements.md#rq-263), [RQ-264](../3-requirements/requirements.md#rq-264), [RQ-265](../3-requirements/requirements.md#rq-265).

**Constraints and questions:** [Q-042](../3-requirements/open-questions.md#q-042)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to define a new named offence type and its ladder through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-042](../3-requirements/requirements.md#br-042) and example
[EX-042](../3-requirements/requirements.md#ex-042) preserve
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
