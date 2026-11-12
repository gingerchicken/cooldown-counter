---
name: write-user-story
description: Elicit and write one INVEST-checked Markdown user story with a provisional MoSCoW category and traceability.
---

# Write an INVEST user story

Use this skill to turn a user account, profile, persona and concrete task into one story file under `2-user-stories/`. Run `../../scripts/probe-user-stories.py` to prepare or conduct the interview. Create one file per coherent outcome, for example `US-001-review-exceptions.md`.

## Discovery

Ask about a recent event, actor, trigger, inputs, sequence, difficulty, workaround, desired capability, benefit, rules, exceptions, success and the smallest useful change. Ask the client whether the outcome is important for meeting the MVP. Ask what can remain manual. Use a paper sketch if it helps reveal missing steps, but treat the sketch as evidence of discussion rather than an approved interface.

## Story contract

Write `As a [user], I want [one capability], so that [one benefit]`. Link the actor to a profile or persona. Keep the story outcome negotiable: do not make a selected screen, database, framework or implementation technique part of the story unless it is a separately justified constraint.

Include source/evidence status, acceptance criteria, Example Mapping handoff, links to constraints and requirements, and a full INVEST table:

- **Independent:** deliverable and acceptance can be separated, or unavoidable dependencies are explicit.
- **Negotiable:** the outcome is preserved while implementation remains open.
- **Valuable:** the benefit is meaningful to the user or business.
- **Estimable:** enough context exists to assess the work without invented detail.
- **Small:** one coherent outcome fits a useful first slice.
- **Testable:** a client can recognise an acceptable result using observable examples.

Every criterion must be `Pass`. If any criterion is `Fail`, write `Draft - not usable` and state the correction. Do not use a confidence score as a substitute for a failed INVEST criterion.

## Provisional MoSCoW

For a named delivery, assign exactly one full category: `Must Have`, `Should Have`, `Could Have` or `Won't Have this time`. Record the reason, omission consequence or workaround, person assigning it, date and status. A Must Have means the named release is not viable or cannot be accepted without it. MoSCoW is not an effort estimate and is not an arithmetic score. If the client has not confirmed the category, label it provisional.

## Sources

- [Bill Wake: INVEST in Good Stories, and SMART Tasks](https://xp123.com/invest-in-good-stories-and-smart-tasks/)
- [GOV.UK: Learning about users and their needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs)
- [Agile Business Consortium: What is MoSCoW Prioritisation?](https://www.agilebusiness.org/resource/what-is-moscow-prioritization/)
- Source paper: `.agents/source/journal.pdf`, Sections 3.2, 3.3, 4.4 and Appendix C.3.

Use `2-user-stories/TEMPLATE.md`. Do not put multiple unrelated outcomes in one file merely to reduce file count.
