# US-062 - Reach tracking information on supported screens

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to reach the tracking information and actions on supported screen sizes, so that I can submit or cancel without clipped controls.

**Evidence:** Proposed. Source lines: [2800-2801](../docs/design/cooldown-counter.html#L2800), [2949-2951](../docs/design/cooldown-counter.html#L2949), [2959-2960](../docs/design/cooldown-counter.html#L2959), [3034-3036](../docs/design/cooldown-counter.html#L3034), [2296-2296](../docs/design/cooldown-counter.html#L2296).

**Rationale and smallest useful outcome:** The report width is fixed without modal scrolling, unlike the editor which at least has vertical scrolling.

**Dependencies:** [US-025](US-025-obs-report-open.md)

**Requirements:** [RQ-352](../3-requirements/requirements.md#rq-352), [RQ-353](../3-requirements/requirements.md#rq-353), [RQ-354](../3-requirements/requirements.md#rq-354), [RQ-355](../3-requirements/requirements.md#rq-355), [RQ-356](../3-requirements/requirements.md#rq-356), [RQ-357](../3-requirements/requirements.md#rq-357).

**Constraints and questions:** [Q-046](../3-requirements/open-questions.md#q-046), [Q-045](../3-requirements/open-questions.md#q-045)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Should Have - Provisional. Useful support for the represented workflow; a manual workaround may be tolerable.

**Omission consequence:** Omitting this outcome leaves the operator unable to reach the tracking information and actions on supported screen sizes through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-062](../3-requirements/requirements.md#br-062) and example
[EX-062](../3-requirements/requirements.md#ex-062) preserve
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
