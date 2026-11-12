# US-017 - Focus an account from the calendar

**Status:** Draft - not usable.

As a [fleet operator](../1-user-profiles/UP-001-fleet-operator.md), I want to focus the account associated with a calendar bar, so that I can inspect its records without another account search.

**Evidence:** Logic. Source lines: [3359-3359](../docs/design/cooldown-counter.html#L3359).

**Rationale and smallest useful outcome:** The design exposes this distinct operator outcome. Inspect its records without another account search.

**Dependencies:** [US-012](US-012-cal-calendar-spans.md), [US-008](US-008-cal-account-filter.md)

**Requirements:** [RQ-107](../3-requirements/requirements.md#rq-107), [RQ-108](../3-requirements/requirements.md#rq-108).

**Constraints and questions:** [Q-006](../3-requirements/open-questions.md#q-006), [Q-015](../3-requirements/open-questions.md#q-015)
The [shared evidence limits](../docs/design/README.md) apply.

**Named delivery:** Cooldown Counter design baseline v0.1.

**MoSCoW:** Must Have - Provisional. Proposed core tracking or integrity outcome; the candidate baseline may be unviable without it. Product confirmation is required.

**Omission consequence:** Omitting this outcome leaves the operator unable to focus the account associated with a calendar bar through this product.

**Workaround:** Manual inspection or an external record is a possible workaround; its acceptability has not been confirmed.

**Assigned by:** Assistant, 2026-11-12. Product decision-maker: unassigned;
confirmation pending. No effort estimate or release commitment is implied.

## Acceptance and Example Mapping

Rule set [BR-017](../3-requirements/requirements.md#br-017) and example
[EX-017](../3-requirements/requirements.md#ex-017) preserve
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
