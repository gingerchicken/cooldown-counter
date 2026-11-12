# US-002 - Correct missing login inputs

**Status:** Draft - design-derived; product validation pending.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to see which sign-in information is missing, so that I can correct the form without guessing.

**Evidence:** Logic. Source lines: [3555-3557](../docs/design/cooldown-counter.html#L3555), [3569-3570](../docs/design/cooldown-counter.html#L3569).

**Rationale and smallest useful outcome:** The prototype contains three explicit missing-input messages and clears them on editing.

**Dependencies:** No additional outcome dependency recorded; access and data-policy questions still apply.

**Requirements:** [RQ-013](../3-requirements/requirements.md#rq-013), [RQ-014](../3-requirements/requirements.md#rq-014), [RQ-015](../3-requirements/requirements.md#rq-015), [RQ-016](../3-requirements/requirements.md#rq-016).

**Constraints and questions:** None identified for this narrow obligation.
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to see which sign-in information is missing through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-002](../3-requirements/requirements.md#br-002) and example
[EX-002](../3-requirements/requirements.md#ex-002) preserve
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
| Estimable | Pass | Enough detail exists for this narrow design-level slice; real workload and release estimates are not asserted. |
| Small | Pass | One coherent outcome; its atomic rules share a single purpose. |
| Testable | Pass | Concrete acceptance conditions and a worked example are linked. |

All six checks pass only at the proposed design-outcome level. This is not scope approval.
