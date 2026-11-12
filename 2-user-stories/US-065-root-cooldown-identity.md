# US-065 - Keep an offence distinct from its observations

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to retain additional evidence about one cooldown without counting another offence, so that I can avoid false escalation from repeated reports of the same restriction.

**Evidence:** Proposed. Source lines: [2774-2776](../docs/design/cooldown-counter.html#L2774), [2804-2805](../docs/design/cooldown-counter.html#L2804), [2888-2897](../docs/design/cooldown-counter.html#L2888), [3212-3225](../docs/design/cooldown-counter.html#L3212), [3750-3757](../docs/design/cooldown-counter.html#L3750).

**Rationale and smallest useful outcome:** The design records remaining-time evidence, but replay treats every saved report as a new offence. The event-versus-observation policy is unresolved; this proposed outcome is not an existing edit workflow.

**Dependencies:** [US-035](US-035-obs-record-observation.md), [US-039](US-039-rule-predict-independent.md)

**Requirements:** [RQ-362](../3-requirements/requirements.md#rq-362), [RQ-363](../3-requirements/requirements.md#rq-363).

**Constraints and questions:** [Q-033](../3-requirements/open-questions.md#q-033), [Q-030](../3-requirements/open-questions.md#q-030), [Q-044](../3-requirements/open-questions.md#q-044)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to retain additional evidence about one cooldown without counting another offence through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-065](../3-requirements/requirements.md#br-065) and example
[EX-065](../3-requirements/requirements.md#ex-065) preserve
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
