# Coverage and review

This inventory contains **65 user stories, 363 atomic candidate requirements,
65 Example Mapping handoffs and 60 open decisions**. The
[canonical requirements](requirements.md) link each obligation to a story,
rationale, source lines, acceptance condition and planned verification.
The [story index](../2-user-stories/README.md) enumerates every outcome.

The requirements comprise 140 Visible, 122 Logic and 101 Proposed records.
These are evidence labels, not confidence scores or approved release scope.
Seven stories pass the narrow design-level INVEST screen. The other 58 retain
`Draft - not usable` because material decisions block estimation or acceptance.
Every priority remains provisional.

## Coverage matrix

| Area | Stories | States and boundaries covered |
| --- | --- | --- |
| Access and session | US-001 to US-005, US-055 | Signed out, missing fields, invalid credentials, unavailable login service, valid/invalid returning session, unavailable optional storage, sign-out, expired access, draft privacy, read/write/configuration authorization and request forgery |
| Navigation and totals | US-006 to US-007 | Calendar, Accounts, Cooldowns, active section, detail breadcrumb, titles/subtitles, tracked/recorded/active totals, count-unit conflict |
| Shared filtering | US-008 to US-011 | Account tag/SteamID search, exact selection, no matches, All choices, zero/one/many offence selections, name/code search, combined status/offence truth table, selection state, reset and cross-view persistence |
| Calendar | US-012 to US-017 | Monday-first grids, adjacent-month dates, current day/month, multiweek and multimonth spans, exact midnight endpoints, overlap lanes, overflow retrieval, displayed-entry units, forecast distinction, future markers, earlier history, later months, present-day jump and missing/duplicate today anchors |
| Accounts and history | US-018 to US-024 | Restricted, clear, no history, empty results, list continuation, exact SteamID digits, missing account, external link, per-type forecast, representative forecast ambiguity, stored/decayed/next steps, first observation, chronological evidence and transition trace |
| Observation entry | US-025 to US-036 | Open/close/cancel, target confirmation, account/type selectors, date/time validity, timezone meaning, days/hours/minutes, nonfinite/negative/zero/fractional/overflow inputs, combined summary, over-total evidence, fitting/no-fitting step, event-time preview, manual override/reset, one-step ladder, successful recording and missing references |
| Rule reference and defaults | US-037 to US-038 | Names, notes, usage/type counts, ordered steps, terminal hold, five seed ladders, unverified game-rule authority |
| Calculation | US-039 to US-041 | Per-account/type isolation, first offence, advance-after-decay, top-step cap, explicit override replay, expiry, exact clean-window boundary, multiple windows, floor zero, chronological replay, raw-evidence preservation, overlap/tie/future ambiguity |
| Type maintenance | US-042 to US-048 | Add/edit/cancel, trimmed names, empty/duplicate/self names, optional note/code, case/length/code fallback, duration units and precision, step add/remove/renumber, last-step invariant, rename propagation, delete impact, second confirmation and session-end invalidation |
| Optional model paths | US-049 | Code-only full reset, no decay and start anchoring; no demonstrated operator configuration controls |
| Rule-change integrity | US-050 | Historical recalculation impact, policy provenance, unchanged raw evidence, atomic dependent updates, shorter-ladder override migration question |
| Persistence and recovery | US-051 to US-054, US-064 | Reload durability, shared permitted history, pending/success/failure/unknown saves, retained drafts, stable identity, duplicate submission, type-save/delete failures, stale history/rules, loading versus empty versus failure |
| Evidence credibility | US-056, US-065 | Observed versus estimated total, manual provenance, repeated evidence versus a genuinely new offence, model claims distinct from verified game outcomes |
| Inclusive use | US-057 to US-063 | Keyboard calendar/rows/report/selectors, touch override, named modal semantics, focus entry/containment/return, input/icon names, expanded/selected state, noncolor meaning, announced errors/results, narrow layouts, enlarged text and reduced-motion decisions |

## Material conflicts

These must be resolved as specification questions. They are not harmless
implementation details to copy from the prototype.

1. **Reports and offences are conflated.** Two reports of the same live penalty
   can count as two offences. Decide the event-versus-observation identity before
   designing storage or replay. A duplicate-click guard alone does not solve it.
2. **Time has three possible meanings.** Start time, observation time and record
   creation time are not interchangeable. The form and conceptual data model
   do not settle them. Expiry and remaining-time comparisons depend on the answer.
3. **The demo clock is frozen.** NOW is local midnight on 29 August 2026; the
   default report is 18:00 that day. The default report is therefore in the
   future relative to the model clock. A live clock, timezone, display precision
   and clean-day definition need agreement.
4. **Preview can disagree with replay.** Preview uses the fixed present and all
   terminal history, while recording inserts by entered start time. Backdated
   previews can count later evidence as prior history.
5. **Active status ignores the start bound.** Future events are counted active
   whenever their expiry is later than NOW. The active KPI counts events rather
   than distinct accounts. Overlaps can make that number exceed fleet size.
6. **Filter semantics conflict.** Clear is record-scoped in calendar and
   account-scoped in fleet. An historical offence A plus an active offence B can
   pass A plus On cooldown. Clear also hides all forecasts even though a clear
   account can still have a decaying ladder.
7. **Displayed counts are ambiguous.** Calendar entries count rendered weekly
   segments and forecasts, including spillover duplication, rather than unique
   observations. Fleet count and usage count may need different labels if
   multiple observations can belong to one cooldown.
8. **Evidence can be silently altered.** Empty/zero remaining becomes one minute;
   invalid dates become demo NOW; invalid step amounts become one minute. Muted
   N/A lower-unit fields still contribute to the total. Above-total evidence
   warns but still saves. These are explicit policy decisions, not safe defaults.
9. **Rule edits rewrite history.** Replay uses current ladder durations for old
   records, changing totals, expiry, status and later decay. Removing steps clamps
   earlier overrides. Decide snapshots/versioned policies versus reviewed
   retrospective recalculation before implementation.
10. **Type deletion destroys evidence.** The demo removes every associated
    record. The last type can also be deleted, after which reporting can save a
    blank type using a fallback ladder. Retention, integrity, permission and
    recovery decisions are required before any destructive implementation.
11. **Confirmation can outlive its context.** An armed delete survives navigation
    and sign-out. Decide cancellation and reconfirmation of the current impact.
12. **Account selection and summaries can mislead.** A selected tag still uses
    substring matching, ladder chips show the last assigned rather than current
    decayed state, and the representative fleet forecast uses the most frequent
    type instead of an agreed risk measure. Simultaneous active restrictions
    have no agreed display policy.
13. **Some information is unreachable.** Calendar overflow has no reveal action.
    Only later months load; older seeded data can predate the initial range.
    Scroll-only continuation can fail when the page cannot scroll. Repeated
    spillover today IDs make the jump target ambiguous.
14. **Login and persistence are demo shortcuts.** Any nonempty credentials work;
    only an authentication flag survives reload. Records and edits exist only
    in component state. A client-side flag does not authorize the intended
    restricted shared tracker.
15. **Inclusive use is incomplete.** Generic clickable rows/bars lack keyboard
    semantics; override dragging uses mouse events; dialogs lack focus handling.
    Narrow-screen inspection showed the sidebar consuming most of the available
    width and underlying rules extending beyond the main region. Conformance
    targets remain unagreed; no accessibility compliance claim is made.

Each conflict is connected to the affected stories and requirements through
the [decision register](open-questions.md).

## Code-only and presentation evidence

These details were inspected. Their presence does not make them approved
operator features or mandatory numeric product limits.

| Evidence | Source | Treatment |
| --- | --- | --- |
| Alternative Full reset and No decay; configurable window; start anchor | 3141, 3147-3154, 3190-3195, 3225 | US-049 candidates and policy questions; no visible settings UI |
| `showDecayMarkers` | 3045, 3153, 3288 | Design configuration constraint under US-013; no operator preference control |
| Prediction support heuristic | 3232-3244 | Open question only: no history when zero samples, medium with fewer than two samples or near a clean-window boundary, high otherwise; computed labels are not rendered by the supplied fleet/detail markup |
| Near-boundary heuristic | 3240-3243 | In step-down mode, phase remainder below one day or above window minus one day; thresholds are unvalidated, not calibrated probabilities |
| Duration formatting | 3059-3085 | Minutes below 60, hours below 1440 minutes, days thereafter; hour/day precision up to two decimals; mixed-span rounding and full timestamp display remain questions |
| Duration severity buckets | 3065-3071 | At most 60, 360, 1440 and 10080 minutes, then the highest bucket; an appearance convention, not an official penalty classification |
| Calendar/list caps | 3166-3168, 3347 | Demo appends to 48 months, starts 12 fleet rows, adds 12, shows at most five week lanes; these are recorded evidence, not agreed capacity limits |
| Step-map callbacks | 3740-3748 versus 2930-2939 | A computed per-step pick callback is not a rendered dot-click action; only the track's mouse handler is bound |
| Fake accounts and history | 3090-3130 | Demo fixtures only; not required initial fleet records |
| Data-model panel | 2767-2782 | Conceptual evidence only; schema, timestamp meaning, observation/event cardinality and sharing remain open |

## Review passes and stopping rule

1. Full application-markup and logic pass, with source areas mapped in the
   [evidence record](../docs/design/README.md).
2. Three independent extraction passes over calendar/accounts,
   replay/rules/editor, and observation/access/quality.
3. Browser inspection of all major views and both dialogs, including a narrow
   viewport check. No live external Steam account was opened.
4. Cross-domain consolidation removed duplicate report controls, prediction
   display, shared-shell actions and marker settings outcomes. Related questions
   were combined without dropping their narrower boundary concerns.
5. An independent challenge found repeated-observation identity, exact SteamID
   preservation, earlier history, stale destructive confirmation, configuration
   recovery, login-service failure and demo-data separation. Each was added as a
   proposed obligation or an explicit decision/evidence note.
6. Citation repair checked all observation requirements against the unchanged
   numbered source. It corrected shifted markup/logic references rather than
   merely checking that line numbers were in range.
7. Final root review covered every visible action, every application state field,
   replay branch, default, empty state and gap category against the catalog.
   No further distinct design-grounded outcome was found after integrating the
   challenge. More detail now depends on resolving recorded decisions or
   obtaining new evidence; it must not be invented as approved scope.
8. Final independent review caught four forecast calculation obligations lost
   during consolidation, story-sentence grammar, and mapping-context text that
   had been labelled as a business rule. The forecast rules were restored,
   sentences were corrected, and BR anchors now index the actual atomic RQ
   rules. Precision and marker questions were linked to their affected outcomes.
   That review found no further distinct design-grounded gaps after these fixes.

This is evidence-relative saturation, not a claim that every possible future
feature or production requirement is known.

## Validation

- Original HTML size, line count and SHA-256 are checked against the attachment.
- Stable story, requirement, rule, example and question IDs are checked for
  uniqueness, required fields and valid cross references in both directions.
- Every requirement has one `shall`, an acceptance condition, rationale, source,
  type, evidence label, provisional priority, status and planned verification.
- Every story has the full INVEST table. Failed checks retain a blocked draft.
- Local document paths and catalog anchors are checked. Source `#L` links are
  line locators, not application DOM elements.
- New Markdown is checked for Unicode dash characters. Quoted original HTML is
  retained unchanged.
- Twelve isolated checks against the supplied calculation class passed: exact
  seven-day boundary, one millisecond before, two/three windows, top cap, a
  chronological overlap, unchanged raw evidence, other-account/type isolation,
  full-reset boundary/before-boundary and no-decay behavior. These confirm the
  examples describe the prototype; they do not validate real CS2 rules.
- `git diff --check` is run for tracked changes; new Markdown whitespace is
  checked separately.

No application code or automated application tests were added or changed.
The full template test suite was not run for this documentation-only task.
No deployment, production authentication, official game-policy verification,
load benchmark, assistive-technology audit or contrast conformance test was
performed. Acceptance conditions are future test plans, not passing product
tests. Temporary authoring and example-check scripts remain outside the repo.

## Technical debt and recommended next work

The source is a monolithic prototype. Event relationships use mutable type names
despite separate type IDs; timestamp-derived IDs can collide; every view model
is rebuilt inside the same render path. Replaying grouped histories requires
sorting, with worst-case O(E log E) for E events. Calendar generation repeatedly
scans events for each visible week, and fleet summaries repeatedly scan events
for each account. These costs may become material as the calendar expands or
the history grows. The workload question must be answered before choosing
limits or optimizations.

A better implementation would separate a tested domain model from presentation,
use stable account/type/event identities, preserve raw observation evidence,
and evaluate scoped histories under an explicit policy. This is design debt in
the supplied prototype, not a change made here. The raw source was deliberately
preserved, so no `TODO(refactor)` comments were inserted into it.

Resolve data identity/time/history/deletion/sharing decisions first. Then confirm
the actor, release boundary and provisional priorities. Update affected examples
and INVEST checks before turning an outcome into implementation tasks. Account
creation, correction/removal, imports/exports, notifications, signup/recovery,
SSO/MFA, tenancy, audit/retention depth and official integrations are questions or
unshown scope; they are neither automatically included nor declared excluded.
