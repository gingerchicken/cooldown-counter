# US-059 - Navigate modal reporting with assistive technology

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to enter and leave report dialogs with predictable focus, so that I can understand and control the current interaction.

**Evidence:** Proposed. Source lines: [2799-2807](../docs/design/cooldown-counter.html#L2799), [2958-2966](../docs/design/cooldown-counter.html#L2958), [3535-3535](../docs/design/cooldown-counter.html#L3535), [3658-3659](../docs/design/cooldown-counter.html#L3658).

**Rationale and smallest useful outcome:** Report and type editor overlays are plain divs without named modal semantics or focus handling.

**Dependencies:** [US-025](US-025-obs-report-open.md)

**Requirements:** [RQ-340](../3-requirements/requirements.md#rq-340), [RQ-341](../3-requirements/requirements.md#rq-341), [RQ-342](../3-requirements/requirements.md#rq-342), [RQ-343](../3-requirements/requirements.md#rq-343), [RQ-344](../3-requirements/requirements.md#rq-344).

**Constraints and questions:** [Q-045](../3-requirements/open-questions.md#q-045)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to enter and leave report dialogs with predictable focus through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-059](../3-requirements/requirements.md#br-059) and example
[EX-059](../3-requirements/requirements.md#ex-059) preserve
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
