# US-032 - Understand the predicted report total

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to see the predicted total and its reasoning before recording, so that I can assess the estimate against my observation.

**Evidence:** Visible. Source lines: [2909-2918](../docs/design/cooldown-counter.html#L2909), [3483-3501](../docs/design/cooldown-counter.html#L3483).

**Rationale and smallest useful outcome:** The preview shows total, step, history sample count and decay explanation.

**Dependencies:** [US-027](US-027-obs-account-selection.md), [US-028](US-028-obs-offence-selection.md)

**Requirements:** [RQ-195](../3-requirements/requirements.md#rq-195), [RQ-196](../3-requirements/requirements.md#rq-196), [RQ-197](../3-requirements/requirements.md#rq-197), [RQ-198](../3-requirements/requirements.md#rq-198), [RQ-199](../3-requirements/requirements.md#rq-199), [RQ-200](../3-requirements/requirements.md#rq-200), [RQ-201](../3-requirements/requirements.md#rq-201), [RQ-202](../3-requirements/requirements.md#rq-202).

**Constraints and questions:** [Q-032](../3-requirements/open-questions.md#q-032), [Q-030](../3-requirements/open-questions.md#q-030), [Q-042](../3-requirements/open-questions.md#q-042)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to see the predicted total and its reasoning before recording through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-032](../3-requirements/requirements.md#br-032) and example
[EX-032](../3-requirements/requirements.md#ex-032) preserve
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
