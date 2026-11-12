# US-024 - Audit recorded observations

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to review chronological observations and their ladder transitions, so that I can distinguish recorded evidence from derived cooldown totals.

**Evidence:** Visible. Source lines: [2683-2701](../docs/design/cooldown-counter.html#L2683), [3414-3414](../docs/design/cooldown-counter.html#L3414), [3440-3443](../docs/design/cooldown-counter.html#L3440).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Distinguish recorded evidence from derived cooldown totals.

**Dependencies:** [US-020](US-020-cal-account-detail.md)

**Requirements:** [RQ-141](../3-requirements/requirements.md#rq-141), [RQ-142](../3-requirements/requirements.md#rq-142), [RQ-143](../3-requirements/requirements.md#rq-143), [RQ-144](../3-requirements/requirements.md#rq-144), [RQ-145](../3-requirements/requirements.md#rq-145), [RQ-146](../3-requirements/requirements.md#rq-146), [RQ-147](../3-requirements/requirements.md#rq-147), [RQ-148](../3-requirements/requirements.md#rq-148).

**Constraints and questions:** [Q-019](../3-requirements/open-questions.md#q-019), [Q-058](../3-requirements/open-questions.md#q-058)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to review chronological observations and their ladder transitions through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-024](../3-requirements/requirements.md#br-024) and example
[EX-024](../3-requirements/requirements.md#ex-024) preserve
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
