# Interview cycle classification

Use the conversation's decisions and evidence to classify one or more stages. The seven guides organise linked records; they do not require seven separate meetings.

| Stage | Classify when the conversation mainly covers | Primary record or skill |
| --- | --- | --- |
| `01 - Initial intake` | The problem or opportunity, recent event, affected people, current workaround, desired outcome, owner or next disposition are being understood for triage. | `docs/0-intake.md` and the intake guide |
| `02 - User profile and persona` | The groups doing or relying on the work, their responsibilities, context, tools, handoffs, support needs or meaningful differences are being described. | `$write-user-profile`; optionally `$write-user-persona` |
| `03 - User story and MoSCoW` | One actor, capability, benefit, acceptance outcome, INVEST boundary or provisional delivery priority is being selected. | `$write-user-story` |
| `04 - Example Mapping` | A story is being made concrete through rules, ordinary examples, boundaries, exceptions, missing data, access or unanswered questions. | `$expand-user-story` |
| `05 - Requirements review` | Existing requirements, constraints or risks are being checked for meaning, source, verification, priority, authority or response. | `$write-requirements` and the constraints/risk record |
| `06 - MVP and approval` | The smallest complete useful result, included and excluded IDs, acceptance boundary, capacity, estimate, risk decisions or authorisation are being considered. | `$write-smart-task`, `$map-critical-path` and approval-document skill as applicable |
| `07 - Delivery review` | An approved slice is being demonstrated or reviewed against scope, acceptance evidence, actual timing, client satisfaction, defects and the next decision. | `docs/8-review.md` |

## Classification evidence

Use at least two concrete signals when possible: the participant's stated purpose, the records or IDs discussed, the decision being made, and timestamped examples from the transcript. A generic request for "requirements" is not enough to classify a requirements review. A conversation can be `02 + 03`, for example, when it first establishes who performs the work and then selects one outcome.

Use these confidence labels:

- `High`: the stated purpose, decision and record type agree.
- `Medium`: the content supports a stage but the meeting purpose or target record is incomplete.
- `Low`: the label depends on inference, ambiguous terminology or an unverified speaker account.
- `Unclear`: available evidence cannot distinguish the stage.

Do not resolve ambiguity by selecting the most advanced stage. Route it to the earliest plausible record and create a follow-up question set for the missing distinction.

## Update order

When several stages are present, update in this order:

`01 intake -> 02 profile/persona -> 03 story/MoSCoW -> 04 Example Mapping -> 05 requirements/risks -> 06 MVP/tasks/approval -> 07 delivery review`

This order is a dependency order, not a claim that the meeting happened in that sequence. If later content corrects an earlier record, revise the earlier record first and re-check downstream links and gates.

## Evidence labels

Keep these claims separate:

- `Recorded`: content transcribed from a permitted recording.
- `Reported`: a participant's account that has not been independently observed.
- `Observed`: behaviour or a record directly inspected during the conversation.
- `Proposed`: a desired future behaviour or solution suggestion.
- `Conflicting`: accounts or records disagree.
- `Unknown`: the recording does not establish the answer.

An audio transcript can establish what was said. It cannot, by itself, establish that a rule is authoritative, a requirement is approved, work is implemented, a client accepted a delivery or a business outcome was achieved.
