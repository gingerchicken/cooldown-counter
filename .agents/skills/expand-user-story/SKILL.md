---
name: expand-user-story
description: Update one Markdown user story from an Example Map of rules, examples and unanswered questions while preserving traceability and evidence boundaries.
---

# Expand a user story with Example Mapping

Use this skill when a specific story needs concrete rules, examples, exceptions or questions before requirements can be written. Read the target story, its linked profile/persona and the supplied Example Map. Update the same story Markdown file under `2-user-stories/`; do not create a disconnected analysis file.

## Method

1. Preserve the original story ID and user outcome unless the map proves that the goal is wrong or contains separable outcomes.
2. Add a dated Example Mapping section with rules, concrete examples, expected results, unanswered questions, owner and evidence route.
3. Include ordinary, boundary and exception examples where they affect the story. Label hypothetical examples as hypothetical and observed examples with their source.
4. Update acceptance criteria only when the map establishes an observable result. Keep unknown results as open questions rather than plausible behaviour.
5. Add or update dependencies, constraints, risks and requirement links without duplicating full requirement text.
6. Re-run the INVEST gate. If the mapping changes the actor, benefit or outcome, return the story to `write-user-story` and record the revision instead of silently preserving a bad story.

## Exactly how Example Mapping works

Example Mapping is a short, structured conversation used to clarify one user story before implementation or requirements writing. It is not a requirements document, a design workshop, or a session for typing production tests. Its purpose is to reach shared understanding of what the story must do, expose uncertainty, and identify whether the story is small enough to proceed.

### Prepare one story

Select one story with a stable ID and a single user outcome. Bring the current story, linked profile or persona, existing acceptance criteria, relevant evidence, constraints, and known dependencies. Do not map several unrelated stories in one session. If the story contains several outcomes, split it first or record the possible slices discovered during the mapping.

Use a small group of people who can make or discover decisions:

- a product or domain person who can explain the need and decide business behaviour;
- a developer who understands implementation impact and technical constraints;
- a tester or quality person who can challenge whether the behaviour can be checked.

Invite operations, security, accessibility, user research, or another subject-matter owner when the story needs their knowledge. A facilitator is useful while the practice is new. The facilitator makes sure statements become cards and prevents the conversation from silently turning assumptions into rules.

Time-box the conversation to about 25 minutes for a well-understood, well-sized story. The group may finish sooner. If it cannot reach a usable understanding in the time box, treat that as evidence: the story may be too large, the domain may be unclear, or an unanswered question may require research or a spike. Do not hide that signal by extending the session indefinitely.

### Create the four card types

Start with the story under discussion. Then capture the conversation using these card types:

| Card | Meaning | Where it goes | What to write |
| --- | --- | --- | --- |
| **Yellow - story** | The single user outcome being discussed. | At the top of the map. | The story ID, short title, and current `As a ... I want ... so that ...` statement. |
| **Blue - rule** | A business rule, acceptance condition, policy, or constraint that summarises behaviour across examples. | Under the yellow story. | One rule in plain language. Keep separate rules separate; do not hide several obligations in one card. |
| **Green - example** | A concrete situation showing how one rule behaves. | Under the relevant blue rule. | The context, action or event, and expected result. Include ordinary, boundary, and exception cases where they matter. |
| **Red - question** | An unresolved outcome, assumption, missing decision, or missing evidence. | Beside or under the relevant rule or example. | The exact question, why it matters, owner, resolution route, and review date if it can block delivery. |

The colours are a visual convention, not a requirement to use physical cards. A shared Markdown table, spreadsheet, or whiteboard can represent the same four types. Keep the map quick to change and visible to everyone in the conversation.

### Build the map in this order

1. Put the current story on the yellow card. Confirm who benefits, what capability is wanted, and why it matters. Do not rewrite the outcome casually during the discussion.
2. Add blue rule cards for the behaviour that must be true. Start with known acceptance conditions and add rules discovered through discussion. A rule should generalise more than one possible example, or state an agreed constraint that bounds the story.
3. Add green example cards beneath each rule. Ask for concrete cases rather than broad adjectives such as `easy`, `fast`, `appropriate`, or `secure`. Include the normal case, important boundaries, and exceptions that could change the result.
4. When the group cannot agree on the expected result, add a red question instead of choosing the most plausible answer. Record the assumption only as an assumption, never as an approved rule.
5. Continue until the group is satisfied that the story's scope and behaviour are clear or the time box ends. Capture newly discovered slices as separate candidate stories rather than expanding the current story without a decision.
6. At the end, decide whether the story can proceed. Minor questions may be resolved during implementation only when the product representative explicitly accepts that risk. Questions that affect value, safety, security, legal obligations, scope, acceptance, or MVP viability need an owner and resolution route before the story is selected or approved.

### Distinguish rules, examples, and questions

Use the following test when deciding which card to create:

- If the statement applies across multiple situations and tells the system or service what must be true, it is a **rule**.
- If the statement describes one recognisable situation and its expected result, it is an **example**.
- If the group does not know or has not agreed what the result should be, it is a **question**.

For example, for `As a library member, I want to renew an eligible loan, so that I can keep the item without visiting a branch`:

| Card | Example content |
| --- | --- |
| Blue rule | A member may renew a loan only when no other member has reserved the item. |
| Green example | An eligible loan with no reservation is renewed and its due date moves to the next permitted date. |
| Green example | A loan with another member's reservation remains unchanged and the member sees why renewal is unavailable. |
| Red question | Does a renewal count toward the limit when the item becomes reserved while the request is being processed? Owner: library policy lead. Route: policy decision recorded in the story. |

The green examples do not need to be formal Gherkin during the mapping session. A short form such as `The one where the member has reached the renewal limit` is acceptable while the conversation is happening, provided the expected result is captured before the map is accepted. If the expected result is unknown, that card is a red question, not an example.

### Use examples to drive confirmation

Examples are not decoration. Each important example should make it possible to say what would be observed if the story were implemented. Ask:

- What is true before the action?
- What does the user or external event do?
- What should change?
- What must not change?
- What evidence would let the client accept or reject the result?

Write or update an acceptance criterion only when the group has agreed the expected result and the result is observable. `Given / When / Then` can be used when it improves clarity, but it is not a prerequisite for Example Mapping. The mapping conversation and confirmation come before formal test syntax; a later team may turn the agreed examples into Gherkin or another test form.

### Record the map in the target story

Update the existing story file, not a disconnected analysis file. Add a dated section that preserves the map's traceability. At minimum, record:

```markdown
## Example Mapping - YYYY-MM-DD

**Participants:** Product/domain owner; developer; tester; [additional subject-matter owners]
**Facilitator:** [name or role]
**Time box:** [minutes]; **Outcome:** `Proceed` / `Proceed with owned questions` / `Split` / `Research first`
**Source and evidence:** [interview, policy, observation, or `Hypothetical workshop example`]

| Rule | Concrete examples and expected results | Unanswered question, owner and resolution route |
| --- | --- | --- |
| [Blue rule] | [Green example; label observed or hypothetical] | [Red question, or `None`] |
```

For each new entry:

- label an observed rule or example with its source, such as an interview note, policy, support case, or supplied dataset;
- label a workshop assumption or invented illustration as `Hypothetical`;
- state the expected result separately from the example context;
- link or name the resulting acceptance criterion when one is added;
- give every blocking question an owner, resolution route, and review date or decision point;
- record deferred slices, constraints, risks, and dependencies in their appropriate story sections rather than burying them in prose.

The story's original statement and earlier acceptance criteria should remain recoverable through the change history. If a rule changes the actor, benefit, or outcome, stop expanding the story and return it to `write-user-story` for a new INVEST review.

### Decide what happens next

Use the map as a decision aid, not as a numerical score:

- **Proceed:** rules and examples are understood, questions do not block the agreed slice, and the story still passes INVEST.
- **Proceed with owned questions:** the product representative accepts the residual uncertainty, each question has an owner and route, and the uncertainty does not affect MVP viability or acceptance.
- **Split:** the rules reveal several independently valuable outcomes or the story is too large. Create or propose separate story slices and map them separately.
- **Research first:** a red question controls the outcome, a required owner is missing, or the team cannot estimate or test the work without new evidence. Create a discovery or technical spike with its own owner and time box.

Do not mark a story ready merely because it has many green cards. A map with many red questions may show that discovery is incomplete; a map with many blue rules may show that the story is too broad; a rule with many examples may show that the rule should be split. The useful result is a smaller, shared, evidence-backed decision about what the story includes now.

## Quality gate

The updated story must still have all INVEST criteria marked `Pass`, or remain explicitly `Draft - not usable`. Every new rule/example/question needs a source or an evidence label. Questions that block the MVP need an owner and resolution route before MVP selection.

## Sources

- [Matt Wynne: Introducing Example Mapping](https://cucumber.io/blog/bdd/example-mapping-introduction/)
- Source paper: `.agents/source/journal.pdf`, Sections 3.2, 4.5 and Appendix C.5.

The output is the revised target story file in Markdown. Do not convert an Example Map into implementation requirements without running `write-requirements`.
