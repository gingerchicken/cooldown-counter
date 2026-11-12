# US-060 - Understand report controls without visual guessing

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to identify fields, selections and close actions through their accessible names, so that I can operate the report with assistive technology.

**Evidence:** Proposed. Source lines: [2813-2894](../docs/design/cooldown-counter.html#L2813), [2972-3015](../docs/design/cooldown-counter.html#L2972), [3661-3719](../docs/design/cooldown-counter.html#L3661).

**Rationale and smallest useful outcome:** Labels are often adjacent rather than associated; custom dropdowns omit expanded/current-selection semantics.

**Dependencies:** [US-025](US-025-obs-report-open.md)

**Requirements:** [RQ-345](../3-requirements/requirements.md#rq-345), [RQ-346](../3-requirements/requirements.md#rq-346), [RQ-347](../3-requirements/requirements.md#rq-347), [RQ-348](../3-requirements/requirements.md#rq-348).

**Constraints and questions:** [Q-045](../3-requirements/open-questions.md#q-045)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to identify fields, selections and close actions through their accessible names through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-060](../3-requirements/requirements.md#br-060) and example
[EX-060](../3-requirements/requirements.md#ex-060) preserve
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
