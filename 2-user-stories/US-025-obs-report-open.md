# US-025 - Start an observation report

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to open an observation report from my current workflow, so that I can capture a cooldown without losing my place.

**Evidence:** Visible. Source lines: [2336-2336](../docs/design/cooldown-counter.html#L2336), [2799-2807](../docs/design/cooldown-counter.html#L2799), [2813-2822](../docs/design/cooldown-counter.html#L2813), [3657-3659](../docs/design/cooldown-counter.html#L3657).

**Rationale and smallest useful outcome:** A global sidebar action opens a report overlay; account/time preselection is not settled.

**Dependencies:** [US-001](US-001-obs-sign-in.md)

**Requirements:** [RQ-149](../3-requirements/requirements.md#rq-149), [RQ-150](../3-requirements/requirements.md#rq-150), [RQ-151](../3-requirements/requirements.md#rq-151), [RQ-152](../3-requirements/requirements.md#rq-152).

**Constraints and questions:** [Q-029](../3-requirements/open-questions.md#q-029)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to open an observation report from my current workflow through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-025](../3-requirements/requirements.md#br-025) and example
[EX-025](../3-requirements/requirements.md#ex-025) preserve
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
