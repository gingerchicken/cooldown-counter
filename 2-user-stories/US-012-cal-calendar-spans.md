# US-012 - Review cooldowns by day

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to see recorded cooldowns across calendar dates, so that I can understand when each account restriction starts and expires.

**Evidence:** Visible. Source lines: [2452-2507](../docs/design/cooldown-counter.html#L2452), [3301-3376](../docs/design/cooldown-counter.html#L3301).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Understand when each account restriction starts and expires.

**Dependencies:** [US-006](US-006-cal-navigation.md)

**Requirements:** [RQ-073](../3-requirements/requirements.md#rq-073), [RQ-074](../3-requirements/requirements.md#rq-074), [RQ-075](../3-requirements/requirements.md#rq-075), [RQ-076](../3-requirements/requirements.md#rq-076), [RQ-077](../3-requirements/requirements.md#rq-077), [RQ-078](../3-requirements/requirements.md#rq-078), [RQ-079](../3-requirements/requirements.md#rq-079), [RQ-080](../3-requirements/requirements.md#rq-080), [RQ-081](../3-requirements/requirements.md#rq-081), [RQ-082](../3-requirements/requirements.md#rq-082), [RQ-083](../3-requirements/requirements.md#rq-083), [RQ-084](../3-requirements/requirements.md#rq-084), [RQ-085](../3-requirements/requirements.md#rq-085), [RQ-086](../3-requirements/requirements.md#rq-086), [RQ-087](../3-requirements/requirements.md#rq-087), [RQ-088](../3-requirements/requirements.md#rq-088).

**Constraints and questions:** [Q-007](../3-requirements/open-questions.md#q-007), [Q-019](../3-requirements/open-questions.md#q-019)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to see recorded cooldowns across calendar dates through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-012](../3-requirements/requirements.md#br-012) and example
[EX-012](../3-requirements/requirements.md#ex-012) preserve
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
