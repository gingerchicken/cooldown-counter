# US-027 - Identify the report account

**Status:** Draft - design-derived; product validation pending.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to find and select the tracked Steam account for my observation, so that I do not attribute the cooldown to the wrong account.

**Evidence:** Visible. Source lines: [2813-2844](../docs/design/cooldown-counter.html#L2813), [3661-3679](../docs/design/cooldown-counter.html#L3661).

**Rationale and smallest useful outcome:** Searchable account identity combines tag, SteamID and avatar cues.

**Dependencies:** [US-025](US-025-obs-report-open.md)

**Requirements:** [RQ-156](../3-requirements/requirements.md#rq-156), [RQ-157](../3-requirements/requirements.md#rq-157), [RQ-158](../3-requirements/requirements.md#rq-158), [RQ-159](../3-requirements/requirements.md#rq-159), [RQ-160](../3-requirements/requirements.md#rq-160), [RQ-161](../3-requirements/requirements.md#rq-161), [RQ-162](../3-requirements/requirements.md#rq-162), [RQ-163](../3-requirements/requirements.md#rq-163), [RQ-164](../3-requirements/requirements.md#rq-164), [RQ-165](../3-requirements/requirements.md#rq-165).

**Constraints and questions:** None identified for this narrow obligation.
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to find and select the tracked Steam account for my observation through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-027](../3-requirements/requirements.md#br-027) and example
[EX-027](../3-requirements/requirements.md#ex-027) preserve
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
