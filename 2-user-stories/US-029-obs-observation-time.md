# US-029 - Locate an observation in time

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to record the relevant cooldown and observation time, so that history and expiry estimates use the intended chronology.

**Evidence:** Visible. Source lines: [2848-2849](../docs/design/cooldown-counter.html#L2848), [2889-2889](../docs/design/cooldown-counter.html#L2889), [2776-2776](../docs/design/cooldown-counter.html#L2776), [3751-3752](../docs/design/cooldown-counter.html#L3751).

**Rationale and smallest useful outcome:** The date label, remaining-time label and model terms conflict; both timestamps may be necessary.

**Dependencies:** [US-025](US-025-obs-report-open.md)

**Requirements:** [RQ-180](../3-requirements/requirements.md#rq-180), [RQ-181](../3-requirements/requirements.md#rq-181), [RQ-182](../3-requirements/requirements.md#rq-182).

**Constraints and questions:** [Q-030](../3-requirements/open-questions.md#q-030), [Q-031](../3-requirements/open-questions.md#q-031), [Q-033](../3-requirements/open-questions.md#q-033), [Q-038](../3-requirements/open-questions.md#q-038)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to record the relevant cooldown and observation time through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-029](../3-requirements/requirements.md#br-029) and example
[EX-029](../3-requirements/requirements.md#ex-029) preserve
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
