# US-036 - Prevent invalid observation references

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to receive a report error when its account or offence is unavailable, so that records do not become orphaned or silently attach to a fallback.

**Evidence:** Proposed. Source lines: [3188-3188](../docs/design/cooldown-counter.html#L3188), [3413-3413](../docs/design/cooldown-counter.html#L3413), [3461-3467](../docs/design/cooldown-counter.html#L3461), [3482-3485](../docs/design/cooldown-counter.html#L3482), [3755-3755](../docs/design/cooldown-counter.html#L3755).

**Rationale and smallest useful outcome:** The prototype assumes valid references and falls back to another account/type or a one-day ladder.

**Dependencies:** [US-035](US-035-obs-record-observation.md)

**Requirements:** [RQ-224](../3-requirements/requirements.md#rq-224), [RQ-225](../3-requirements/requirements.md#rq-225), [RQ-226](../3-requirements/requirements.md#rq-226), [RQ-227](../3-requirements/requirements.md#rq-227).

**Constraints and questions:** [Q-038](../3-requirements/open-questions.md#q-038), [Q-039](../3-requirements/open-questions.md#q-039), [Q-042](../3-requirements/open-questions.md#q-042)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to receive a report error when its account or offence is unavailable through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-036](../3-requirements/requirements.md#br-036) and example
[EX-036](../3-requirements/requirements.md#ex-036) preserve
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
