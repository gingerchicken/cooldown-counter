---
name: write-user-profile
description: Create or update an evidence-grounded user profile from an intake, interview, observation or other project source.
---

# Write a user profile

Use this skill when a project needs a profile of a group of people who share relevant goals, tasks, behaviours or working circumstances. Write the profile into `1-user-profiles-personas.md`; do not create a persona in this step.

## Inputs

Read `0-intake.md`, the supplied interview or observation notes, and any source documents named by the user. Run `../../scripts/probe-user-profiles.py` when a question guide or structured notes are needed. Do not treat an intake description of another group as direct user research.

## Method

1. Define the group by shared work and needs, not by an unsupported demographic label.
2. Record responsibilities, goals, a recent concrete task, current steps, tools, workarounds, handoffs, frequency, devices, interruptions, knowledge and support needs.
3. Include people affected by the outcome even when they do not directly use the application.
4. Label every material claim as recorded, observed, reported, proposed, provisional, conflicting or unknown. Preserve the source location and the person who can confirm it.
5. Identify meaningful differences that might require a separate profile or a profile variant. Do not flatten disagreement into one confident account.
6. Add a validation plan naming the user or evidence needed to confirm the profile before it informs a story or requirement.
7. Update the profile register and link later stories, but do not infer permissions from responsibilities.

## Quality gate

A profile is `Provisional` unless relevant users or direct evidence have checked it. It must not contain invented quotes, traits, accessibility needs, tools, frustrations or outcomes. If the only source is a client statement, say so. Keep research findings distinct from proposed interface choices.

## Sources

- [GOV.UK: Learning about users and their needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs)
- [GOV.UK: Finding user research participants](https://www.gov.uk/service-manual/user-research/find-user-research-participants)
- [ONS: User personas](https://service-manual.ons.gov.uk/content/writing-for-users/user-personas)
- Source paper: `.agents/source/journal.pdf`, Section 4.3 and Appendix C.2.

The template in `1-user-profiles-personas.md` is the output contract. Report unresolved evidence and the next checking action when the profile cannot pass the quality gate.
