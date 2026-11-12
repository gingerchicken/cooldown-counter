# US-035 - Record a validated observation

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to save an observation to the selected account history, so that future review and predictions include that evidence.

**Evidence:** Visible. Source lines: [2949-2951](../docs/design/cooldown-counter.html#L2949), [3750-3758](../docs/design/cooldown-counter.html#L3750).

**Rationale and smallest useful outcome:** The report append carries account, type, start, observed remaining and optional forced step, then opens account detail.

**Dependencies:** [US-027](US-027-obs-account-selection.md), [US-028](US-028-obs-offence-selection.md), [US-029](US-029-obs-observation-time.md), [US-030](US-030-obs-remaining-duration.md), [US-032](US-032-obs-report-preview.md)

**Requirements:** [RQ-217](../3-requirements/requirements.md#rq-217), [RQ-218](../3-requirements/requirements.md#rq-218), [RQ-219](../3-requirements/requirements.md#rq-219), [RQ-220](../3-requirements/requirements.md#rq-220), [RQ-221](../3-requirements/requirements.md#rq-221), [RQ-222](../3-requirements/requirements.md#rq-222), [RQ-223](../3-requirements/requirements.md#rq-223).

**Constraints and questions:** [Q-038](../3-requirements/open-questions.md#q-038), [Q-030](../3-requirements/open-questions.md#q-030), [Q-036](../3-requirements/open-questions.md#q-036)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to save an observation to the selected account history through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-035](../3-requirements/requirements.md#br-035) and example
[EX-035](../3-requirements/requirements.md#ex-035) preserve
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
