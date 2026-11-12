# US-001 - Sign in to restricted records

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to sign in as a fleet operator, so that I can access the cooldown records available to me.

**Evidence:** Visible. Source lines: [2252-2287](../docs/design/cooldown-counter.html#L2252), [3554-3559](../docs/design/cooldown-counter.html#L3554), [3563-3572](../docs/design/cooldown-counter.html#L3563).

**Rationale and smallest useful outcome:** The login copy restricts access to fleet operators; the demo bypass is not a production access policy.

**Dependencies:** No additional outcome dependency recorded; access and data-policy questions still apply.

**Requirements:** [RQ-001](../3-requirements/requirements.md#rq-001), [RQ-002](../3-requirements/requirements.md#rq-002), [RQ-003](../3-requirements/requirements.md#rq-003), [RQ-004](../3-requirements/requirements.md#rq-004), [RQ-005](../3-requirements/requirements.md#rq-005), [RQ-006](../3-requirements/requirements.md#rq-006), [RQ-007](../3-requirements/requirements.md#rq-007), [RQ-008](../3-requirements/requirements.md#rq-008), [RQ-009](../3-requirements/requirements.md#rq-009), [RQ-010](../3-requirements/requirements.md#rq-010), [RQ-011](../3-requirements/requirements.md#rq-011), [RQ-012](../3-requirements/requirements.md#rq-012).

**Constraints and questions:** [Q-025](../3-requirements/open-questions.md#q-025), [Q-027](../3-requirements/open-questions.md#q-027), [Q-048](../3-requirements/open-questions.md#q-048)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to sign in as a fleet operator through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-001](../3-requirements/requirements.md#br-001) and example
[EX-001](../3-requirements/requirements.md#ex-001) preserve
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
