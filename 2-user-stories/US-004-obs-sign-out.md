# US-004 - End the operator session

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to sign out of the application, so that I can stop access through my session.

**Evidence:** Visible. Source lines: [2337-2337](../docs/design/cooldown-counter.html#L2337), [3573-3576](../docs/design/cooldown-counter.html#L3573).

**Rationale and smallest useful outcome:** The sidebar provides sign-out but a client-only flag cannot invalidate a production session.

**Dependencies:** [US-001](US-001-obs-sign-in.md)

**Requirements:** [RQ-020](../3-requirements/requirements.md#rq-020), [RQ-021](../3-requirements/requirements.md#rq-021), [RQ-022](../3-requirements/requirements.md#rq-022), [RQ-023](../3-requirements/requirements.md#rq-023), [RQ-024](../3-requirements/requirements.md#rq-024).

**Constraints and questions:** [Q-026](../3-requirements/open-questions.md#q-026), [Q-028](../3-requirements/open-questions.md#q-028)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to sign out of the application through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-004](../3-requirements/requirements.md#br-004) and example
[EX-004](../3-requirements/requirements.md#ex-004) preserve
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
