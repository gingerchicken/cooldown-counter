# US-008 - Find a tracked account

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to find and select an account by tag or SteamID, so that I can isolate the account I need to inspect.

**Evidence:** Visible. Source lines: [2371-2405](../docs/design/cooldown-counter.html#L2371), [2518-2552](../docs/design/cooldown-counter.html#L2518), [3581-3605](../docs/design/cooldown-counter.html#L3581).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Isolate the account I need to inspect.

**Dependencies:** [US-006](US-006-cal-navigation.md)

**Requirements:** [RQ-042](../3-requirements/requirements.md#rq-042), [RQ-043](../3-requirements/requirements.md#rq-043), [RQ-044](../3-requirements/requirements.md#rq-044), [RQ-045](../3-requirements/requirements.md#rq-045), [RQ-046](../3-requirements/requirements.md#rq-046), [RQ-047](../3-requirements/requirements.md#rq-047), [RQ-048](../3-requirements/requirements.md#rq-048), [RQ-049](../3-requirements/requirements.md#rq-049), [RQ-050](../3-requirements/requirements.md#rq-050), [RQ-051](../3-requirements/requirements.md#rq-051), [RQ-052](../3-requirements/requirements.md#rq-052), [RQ-053](../3-requirements/requirements.md#rq-053), [RQ-054](../3-requirements/requirements.md#rq-054).

**Constraints and questions:** [Q-015](../3-requirements/open-questions.md#q-015)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to find and select an account by tag or SteamID through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-008](../3-requirements/requirements.md#br-008) and example
[EX-008](../3-requirements/requirements.md#ex-008) preserve
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
