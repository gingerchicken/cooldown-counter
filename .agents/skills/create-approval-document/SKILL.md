---
name: create-approval-document
description: Create a plain-language, standalone Honey-styled HTML approval document for a candidate MVP and its requirements.
---

# Create the client approval document

Use this skill when the client needs a readable approval copy of the candidate MVP. Use the local `honey-styled-documents` skill as a sub-skill and keep the output at `6-approval-document/index.html` with its adjacent local assets directory.

## Content

Read the current intake, profiles/personas, stories, requirements, constraints/risks, MVP and task schedule before writing. Explain the problem, user outcome, included requirement summaries, exclusions, acceptance conditions, estimate range, assumptions, dependencies, risk responses and approval decision in plain language for a non-project-manager. Retain stable IDs as visible text so the approval can be compared with the source records.

The document is a presentation copy, not a replacement source of truth. It must not link to the other project documentation, use external document links, invent a client name or approval, or imply that a blank signature field is a completed decision. Keep decision fields blank until the client actually decides. Do not add an approval collection workflow.

## Honey requirements

Read [Honey styled documents](../honey-styled-documents/SKILL.md), its branding reference and template before material edits. Use the supplied local fonts and wordmark, charcoal cover, orange and blue accents, semantic tables, visible focus, responsive layout and print styling. Remove template markers before handoff. Keep the document readable with JavaScript disabled and avoid remote assets.

## Validation

Check the HTML structure, local asset paths, heading order, table headers, narrow layout and print layout. Confirm it contains no links to other project documents and no unfinished starter tokens. A standalone approval document cannot prove that the client approved it; report its status as draft until an external decision is recorded.

## Sources

- Sub-skill: [Honey styled documents](../honey-styled-documents/SKILL.md)
- Source paper: `.agents/source/journal.pdf`, Sections 3.5, 4.7.5, Appendix C.6 and Appendix B.8.
