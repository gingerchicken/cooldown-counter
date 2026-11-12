# US-061 - Perceive status and validation feedback

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to understand predictions, status and errors without relying only on color, so that I can act on the same information with differing visual or access needs.

**Evidence:** Proposed. Source lines: [2279-2281](../docs/design/cooldown-counter.html#L2279), [2899-2905](../docs/design/cooldown-counter.html#L2899), [2912-2918](../docs/design/cooldown-counter.html#L2912), [3440-3444](../docs/design/cooldown-counter.html#L3440), [3029-3031](../docs/design/cooldown-counter.html#L3029).

**Rationale and smallest useful outcome:** Color-coded durations and inline validation need equivalent labels and announcements.

**Dependencies:** [US-032](US-032-obs-report-preview.md), [US-034](US-034-obs-duration-conflict.md)

**Requirements:** [RQ-349](../3-requirements/requirements.md#rq-349), [RQ-350](../3-requirements/requirements.md#rq-350), [RQ-351](../3-requirements/requirements.md#rq-351).

**Constraints and questions:** [Q-045](../3-requirements/open-questions.md#q-045)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to understand predictions, status and errors without relying only on color through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-061](../3-requirements/requirements.md#br-061) and example
[EX-061](../3-requirements/requirements.md#ex-061) preserve
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
