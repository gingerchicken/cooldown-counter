---
name: write-interview-questions
description: Turn documented project unknowns into simple, neutral interview questions with traceable follow-ups and evidence needs. Use when preparing or revising a semi-structured interview guide from intake, profile, story, Example Mapping, requirements, risk or review questions.
---

# Write interview questions from unknowns

Use this skill when the source material already contains gaps, open questions, assumptions or unresolved decisions. The output is a selective question menu for a real conversation. It is not an answer to the unknowns, a requirements document, a script to read verbatim or evidence that an interview happened.

## Prepare

Read the named source record and the linked records needed to understand each unknown. In this repository, check the relevant records in this order:

1. the explicit unknowns or open-question table;
2. the current intake, profile/persona, story, Example Map, requirement, constraint/risk or review record;
3. the matching guide in `docs/interviews/`;
4. the supplied example, observation, policy or other evidence named by the record.

Keep the existing IDs, wording, evidence labels and unresolved decisions recoverable. Do not fill a gap with a plausible answer. If an unknown is already answered by reliable evidence, mark it as resolved or confirmatory rather than writing a discovery question that assumes the answer.

For each unknown, identify:

- the single decision or understanding it needs to support;
- who can answer it or what evidence could answer it;
- whether it blocks the next decision, affects scope or is useful only for a later option; and
- the earliest record that must change if the answer changes the actor, goal, benefit, rule or scope.

## Write the questions

Create only the questions needed to reduce the identified uncertainty. Ask one question at a time and order the questions so the participant can explain a concrete case before being asked to judge a proposed future state.

Use this sequence when it fits the unknown:

1. Start with a recent, identifiable event: ask what happened, who acted and what triggered it.
2. Trace the current work: ask what information was available, what happened next, who or what was involved, and what result was produced.
3. Probe the specific gap: ask about the rule, exception, handoff, consequence, access condition or quality need that remains unknown.
4. Ask for evidence: request a record, example, screen, document, calculation or observation when one would distinguish competing answers.
5. Ask about the intended result only after the current situation is understood. Keep a desired behaviour or feature separate from the current account.
6. Close with confirmation: ask what was misunderstood, which case would challenge the answer, and who or what can confirm anything still unresolved.

Use plain wording such as:

- “Tell me about the most recent time this happened.”
- “What happened next?”
- “What information did you have at that point?”
- “How did you decide what to do?”
- “Can you show me an example?”
- “What should happen in that case?”
- “Who could confirm that answer?”

These are patterns, not mandatory wording. Adapt them to the participant's language and the domain.

## Split complicated unknowns

Do not write a single question that asks for several independent facts. Split a complicated topic into short questions, each with one purpose. For example, replace:

> How does the approval process work, who can approve it, what happens when information is missing, and how quickly must it be completed?

with a relevant subset of:

1. “What starts the approval process?”
2. “What information is available when it starts?”
3. “What do you do first?”
4. “Who acts before you can continue?”
5. “Who can approve it?”
6. “What happens when information is missing?”
7. “What showed that the approval was complete?”
8. “When would waiting prevent the work from being useful?”

Split further when a question still contains separate actors, conditions, decisions or outcomes. Do not create every possible probe automatically; retain only the questions that address the source unknown or a material boundary around it.

## Question-writing rules

- Prefer open, neutral questions over yes/no questions, leading wording or a preferred solution.
- Ask about a specific past event before asking for a general opinion, rating or prediction.
- Use “what”, “how”, “who”, “when” and “can you show me” to uncover observable detail.
- Avoid blame, loaded terms, assumed causes and words such as `obviously`, `always`, `never`, `easy`, `simple`, `fast` or `user-friendly` unless the participant defines them.
- Avoid double-barrelled questions joined by `and` or `or` when the parts could receive different answers.
- Keep current behaviour, proposed behaviour and acceptance expectations in separate questions.
- Ask about the underlying task or outcome before accepting a suggested screen, feature or technical design.
- Change one condition at a time when testing a boundary or exception. For a limit, ask what happens below it, at it and above it only when that boundary matters.
- Ask for the source of a rule and the person who owns it. A confident statement from someone without authority remains evidence to check, not an approved rule.
- Ask about missing data, failed handoffs, access, conflicting sources and recovery only when those conditions could change the outcome or next decision.
- Treat “I do not know” as a useful result. Record the missing answer, owner, evidence route and review point instead of pressing the participant to guess.
- Use hypothetical examples only when no real example exists, and label them as hypothetical in the output.

## Output

Use the target document's existing format where one exists. For a new or substantial question set, use a Markdown table with one row per atomic question:

```markdown
| ID | Unknown or decision | Question | Evidence or answer to capture | Owner or route | Priority |
| --- | --- | --- | --- | --- | --- |
| IQ-001 | [source unknown] | [one simple question] | [what would resolve it] | [person, record or `Unassigned`] | `Blocking` / `Important` / `Later` |
```

Keep the source unknown visible instead of replacing it with an interpretation. Add a short `Follow-up logic` note when the next question depends on the answer. If the question set is used inside an interview guide, include a brief opening, the question menu, closing playback questions and an exit condition.

The final question set should make it possible to see:

- which source unknown each question addresses;
- why the question is needed for the next decision;
- what evidence or answer is sufficient;
- who should answer or confirm it; and
- what remains unknown after the interview.

## Quality gate

Before finishing, check that:

- every material unknown is covered, deliberately deferred with a reason, or marked as needing another evidence route;
- each question asks one understandable thing and uses plain language;
- the questions do not imply an answer, technical solution or approval;
- concrete examples come before general opinions where practical;
- questions about rules, exceptions, quality or acceptance are separate and observable;
- evidence status remains `Unknown`, `Reported`, `Observed`, `Proposed` or another supported label until the conversation or evidence changes it;
- blocking questions have an owner and resolution route;
- an answer that changes an earlier story or profile is routed back to that record rather than hidden in a later question; and
- the list is a menu sized for the next decision, not an exhaustive questionnaire.

## Source basis

This skill applies the local research and its cited guidance, without claiming that any fixed question set guarantees complete requirements:

- `.agents/source/journal.pdf`, Sections 2.6.1, 4.3.1, 4.4.1 and 4.5, and Appendices C.2-C.5.
- [GOV.UK: Using in-depth interviews](https://www.gov.uk/service-manual/user-research/using-in-depth-interviews) for open, neutral questions and flexible follow-up.
- [GOV.UK: Contextual research and observation](https://www.gov.uk/service-manual/user-research/contextual-research-and-observation) for examining work in its normal setting and using real records.
- [Mike Cohn: Writing User Stories - Questioning Your Users](https://learn.mountaingoatsoftware.com/articles/questioning-your-users) for open-ended, context-free questions that uncover the need behind a proposed solution.
- [Teresa Torres: Story-Based Customer Interviews](https://www.producttalk.org/story-based-customer-interviews/) for asking about specific past events rather than general opinions.
- [Matt Wynne: Introducing Example Mapping](https://cucumber.io/blog/bdd/example-mapping-introduction/) for separating rules, examples and unanswered questions.
