---
name: write-requirements
description: Consolidate stories and examples into a traceable Markdown requirements list that applies NASA Appendix C checks and provisional MoSCoW priorities.
---

# Write NASA-style requirements

Use this skill after stories and Example Mapping have exposed the intended behaviour. Write the canonical list to `3-requirements/requirements.md`. Keep it as one Markdown document by default; if the project is genuinely large, grouped detail files must still be indexed by that canonical document.

## Inputs and traceability

Read the intake, profiles/personas, every linked story, Example Mapping rules/examples/questions, constraints and risks, relevant policies and prior requirement revisions. Do not invent a threshold, owner, role, source, interface or acceptance result. Unknowns become owned questions with a review date.

Every requirement has a stable ID, version, type, one statement, rationale, source, links to one or more user stories where applicable, linked rules/examples, dependencies, acceptance condition, verification method/evidence, MoSCoW category for a named delivery, decision status and change history. Keep functional, quality and constraint scope distinguishable. A shared requirement can link to many stories; one story can link to many requirements.

## Strict NASA Appendix C gate

Do not mark a requirement `Reviewed` or `Approved` until every applicable check passes:

1. Use `shall` for a requirement, `will` only for fact or purpose, and `should` only for a goal.
2. Use a clear product or responsible-party subject and active voice.
3. Use exactly one `shall`, one subject, one predicate and one obligation per statement. Split compound obligations.
4. Use consistent project terminology and a uniquely referenceable ID.
5. State what is needed, not an unjustified implementation choice, operational procedure, personnel task or project-management activity.
6. Use concise, simple and grammatically correct wording with no spelling, punctuation or template errors.
7. Prefer positive wording. State units, limits, tolerances, states, interfaces and boundary conditions where they affect the obligation.
8. Check the requirement is at the correct level and in the correct section of the document.
9. Check necessity, correctness, feasibility, consistency and completeness. Check that the relevant functional, performance, interface, environment, facility, training, personnel, operability, safety, security, appearance, physical and design areas have not been silently omitted.
10. Check relevant performance margins and tolerances are realistic and defensible. Do not make a vague quality adjective appear measurable by inventing a number.
11. Define external and internal interfaces where relevant, and check they are necessary, sufficient and consistent.
12. Define maintainability, reliability, error detection, reporting, handling, recovery and undesired-event responses where relevant.
13. Make the result objectively verifiable by test, demonstration, inspection or analysis at the stated level. Replace vague terms such as `fast`, `easy`, `user-friendly`, `appropriate`, `robust`, `quickly` or `clearly` with agreed conditions and measures.
14. State applicable data conditions, including explicit `don't care` cases, rather than leaving their meaning implicit.
15. Trace upward to a need, goal, scope, constraint, rule or source and downward to stories, examples, tasks, tests or release evidence. The traceability must work in both directions.
16. Keep rationale, assumptions, MoSCoW and decision status outside the statement. Capture unresolved values as `TBR` with the reason, resolution action, owner and date.

NASA's Appendix C is a writing and validation checklist, not a claim that this small project has NASA programme assurance or certification. If a requirement cannot pass the gate, retain it as a candidate or question and report the missing decision.

## MoSCoW separation

Display the full category beside each requirement for the same named delivery. Mark a draft rating `Provisional` and record the omission consequence, workaround, assigning decision-maker and date. Never use a priority label to waive a binding constraint or risk acceptance.

## Sources

- [NASA Appendix C: How to Write a Good Requirement](https://www.nasa.gov/reference/appendix-c-how-to-write-a-good-requirement/)
- [NASA Systems Engineering Handbook, Section 4.2.1.2.3](https://science.nasa.gov/wp-content/uploads/2023/04/nasa_systems_engineering_handbook_0.pdf)
- Source paper: `.agents/source/journal.pdf`, Sections 3.2, 4.6 and Appendices B.4-B.5.

Use the record and gate in `3-requirements/requirements.md`. Report failed checks, broken links and unresolved acceptance conditions rather than claiming the list is complete.
