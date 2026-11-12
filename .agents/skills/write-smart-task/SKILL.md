---
name: write-smart-task
description: Break a selected story and its requirements into one small, traceable SMART implementation task with an agent-based time estimate.
---

# Write a SMART task

Use this skill for implementation planning after the MVP boundary is selected. Create one Markdown file per task under `5-smart-tasks/`, using the task template. The task is a developer-sized unit, not a duplicate of the user story or a broad technical layer.

## Method

1. Read the selected story, linked requirements, acceptance examples, constraints, risks and any enabling decisions.
2. Identify the smallest independently checkable action on a named object. Split work with different prerequisites, outputs, owners or checks. Aim for about one day of actual available capacity, but keep a larger task when splitting would create meaningless fragments and record why.
3. Link the task to at least one user story or requirement. Link both when both exist. A task without a resolving Markdown link is not justified and must not be scheduled.
4. Define completion evidence, owner, prerequisites, technical versus resource-order dependencies, external waits and contribution to the accepted first result.
5. Estimate lower, central and upper LLM/agent implementation effort in engineer-hours as a planning proxy. State the assumptions and a time box. This is not a promise or a calibrated probability.
6. Check Specific, Measurable, Achievable, Relevant and Time-boxed. All five must pass before scheduling.

## SMART gate

Specific names one bounded action and object. Measurable names observable evidence. Achievable identifies owner, access, data and prerequisites. Relevant links to the selected outcome or enabling decision. Time-boxed gives an effort allowance and a review point if exceeded. Completing one task alone does not prove the whole story or release is accepted.

## Sources

- [Bill Wake: INVEST in Good Stories, and SMART Tasks](https://xp123.com/invest-in-good-stories-and-smart-tasks/)
- Source paper: `.agents/source/journal.pdf`, Sections 2.8.1, 4.7.1 and Appendix B.6.

Use `5-smart-tasks/TASK-TEMPLATE.md`. Keep estimates separate from elapsed external waits and count shared work once.
