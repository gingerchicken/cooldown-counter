# Cooldown Counter design evidence

The source is the HTML attachment supplied on 2026-11-12. This is a discovery
baseline, not an approved release specification or an implementation plan.

- [Original design](cooldown-counter.html)
- [Story index](../../2-user-stories/README.md)
- [Canonical requirements](../../3-requirements/requirements.md)
- [Open decisions](../../3-requirements/open-questions.md)
- [Coverage and review](../../3-requirements/coverage.md)
- [Design-derived operator profile](../../1-user-profiles/UP-001-fleet-operator.md)

## Source identity

Attachment name: `cooldown-counter.html`.

Attachment reference: `file_638462d6-bee2-417b-a3ac-4543a8578027`.

Exact size: 915197 bytes. Line count: 3765.

SHA-256: `8c024f9abd60b5053c61417987ac237f2b908ffbdd771063dc13f0ee19cab3cf`.

The HTML is preserved byte-for-byte, including bundled code, quoted copy, demo
data and original punctuation. Line references in the catalog refer to this
copy. It is evidence, not application source to deploy. Embedded third-party
runtime code before line 2226 is not a set of product requirements.

## Evidence labels

| Label | Meaning |
| --- | --- |
| Visible | A control, state, explanation or rule is represented by the design. This does not prove deployed behavior. |
| Logic | A behavior exists in the prototype code. It may have no visible control and may be incidental. |
| Proposed | A safeguard or correction inferred from a gap. It needs a product decision and is not an approved feature. |

All statements remain candidates. The `shall` wording makes them testable; it
does not approve their scope. Prototype defects are recorded as defects or
questions, not silently adopted as the product contract. The seed ladders and
confidence heuristic are not verified CS2 or Valve rules.

## Inspection map

| Source lines | Area |
| --- | --- |
| 2252-2288 | Sign-in fields, errors and demo notice |
| 2294-2367 | Shared navigation, fleet totals and view headings |
| 2370-2450 | Calendar account, status and offence filters |
| 2451-2511 | Calendar dates, bars, legends, counts and overflow |
| 2516-2640 | Accounts filters, rows, empty state and continuation |
| 2645-2705 | Account identity, Steam link, predictions and history |
| 2710-2784 | Offence ladders, transition rules and conceptual data model |
| 2789-2796 | Jump to the present |
| 2799-2955 | Report observation dialog |
| 2958-3039 | Offence type editor |
| 3046-3155 | Demo defaults, data generation, formatting and state |
| 3157-3188 | Scroll loading and pointer step selection |
| 3190-3244 | Decay, event replay and prediction |
| 3247-3447 | Filter, calendar, fleet and detail view models |
| 3449-3551 | Type editing, deletion, preview and validation |
| 3554-3759 | Sign-in/out and remaining interaction handlers |

## Inspection method and limits

The review combined a full pass over the application template and logic with
three independent inspections: calendar/accounts, replay/rules, and
observation/access/quality. The supplied design was also rendered in a temporary
browser tab. The review opened sign-in, calendar, accounts, account detail,
Cooldowns, observation reporting and the type editor. The type editor and
underlying rules layout were inspected at a 390 CSS-pixel viewport as well as
the desktop layout at 1280 CSS pixels.

The preview tool rejected direct local-file navigation with
`unsupported-protocol: file:`. The exact attachment was then loaded into an
isolated blank tab in memory. No web server or deployment was created.

Only demo credentials were entered. No real Steam profile was opened. No
production account, record or rule was changed. This was not a full automated
interaction, assistive-technology, contrast, security, performance or browser
compatibility test. Current HTML behavior is not evidence that the backend
implements the tracker. The repository still contains the imported template.

## Intake and assumptions

The user asked for exhaustive stories and requirements from this design and
asked to set that work as a goal. No MVP boundary, release date, approved
priorities, interview, real operator profile, real account data or official game
rules were supplied. The bundled story interview probe was read and run in
non-interactive mode to check missing discovery areas. Its unanswered prompts
are carried into the decision register rather than filled with invented facts.

The named planning delivery is **Cooldown Counter design baseline v0.1**.
MoSCoW labels were assigned by the assistant on 2026-11-12 and remain
provisional. They are not a schedule or a commitment. Candidate Must Have
items describe the minimum integrity or core tracking outcomes for that
proposed baseline. Should Have items improve that outcome with a workaround.
Could Have items include optional or code-only extensions. No unshown feature
is classified as an approved exclusion.

The inferred actor is one fleet operator in a small trusted group. Group
boundaries and write permissions remain unresolved. The template's per-user
job ownership must not be mistaken for the tracker's sharing model. Existing
authentication and API boundaries are relevant implementation context, not
proof of a product requirement. No backend, database schema, frontend framework,
hosting provider or algorithm has been selected by this discovery work.

The 26 generated account identities and their fabricated history are demo
fixtures, not required initial fleet data. The five initial offence ladders
are recorded separately as candidate rule defaults requiring a source and owner.
