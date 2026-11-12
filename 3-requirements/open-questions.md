# Open decisions

Every item is **Open / TBR**, recorded 2026-11-12, with **owner unassigned**.
The resolution action includes nominating the person authorized to decide.
**Review date: TBR - set at the first product review; required before baseline
approval or implementation of the affected outcome.** No calendar commitment
was supplied. The assistant has not answered these questions on the user's behalf.

These are decision records, not extra approved user stories. A missing feature
is not automatically required or excluded. Similar questions can concern
different scopes; cross-check related decisions before closing one.

## Q-001

**Question:** Does On cooldown count distinct restricted accounts or active cooldown records?

**Why this matters:** Overlapping records can make the current event count exceed the fleet size.

**Resolution:** Nominate the product decision-maker. Choose the KPI unit and label, then test overlaps.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-007](../2-user-stories/US-007-cal-fleet-totals.md).

**Directly affected requirements:** [RQ-041](requirements.md#rq-041).

## Q-002

**Question:** Do calendar status filters classify records, accounts, or records matching the selected offence?

**Why this matters:** Clear has record-level semantics in calendar and account-level semantics in fleet.

**Resolution:** Nominate the product decision-maker. Agree a filter truth table covering expired A plus active B.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-009](../2-user-stories/US-009-cal-status-filter.md).

**Directly affected requirements:** [RQ-055](requirements.md#rq-055), [RQ-056](requirements.md#rq-056), [RQ-057](requirements.md#rq-057).

## Q-003

**Question:** Must an active restriction match the selected offence before its account passes combined filters?

**Why this matters:** Historical A plus active B currently passes A and On cooldown.

**Resolution:** Nominate the product decision-maker. Agree combined-filter scope with concrete examples.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-009](../2-user-stories/US-009-cal-status-filter.md), [US-010](../2-user-stories/US-010-cal-offence-filter.md).

**Directly affected requirements:** [RQ-056](requirements.md#rq-056), [RQ-057](requirements.md#rq-057).

## Q-004

**Question:** Does entries shown count unique observations, rendered segments, forecast marks, or a documented combination?

**Why this matters:** A record can appear in several weeks and month spillover cells.

**Resolution:** Nominate the product decision-maker. Choose and label a count unit, then verify split bars and hidden items.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-014](../2-user-stories/US-014-cal-calendar-overflow.md).

**Directly affected requirements:** [RQ-100](requirements.md#rq-100).

## Q-005

**Question:** How does an operator reach every calendar item hidden by the lane limit?

**Why this matters:** The +N more indicator has no retrieval action.

**Resolution:** Nominate the product decision-maker. Choose an overflow disclosure or an explicit equivalent route.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-014](../2-user-stories/US-014-cal-calendar-overflow.md).

**Directly affected requirements:** [RQ-099](requirements.md#rq-099), [RQ-101](requirements.md#rq-101).

## Q-006

**Question:** Should activating a calendar bar focus its account, open account detail, or open an observation?

**Why this matters:** The prototype toggles the account filter despite a callback named open.

**Resolution:** Nominate the product decision-maker. Confirm the interaction and its selected-account toggle behavior.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-017](../2-user-stories/US-017-cal-calendar-account-focus.md), [US-057](../2-user-stories/US-057-obs-keyboard-workflow.md).

**Directly affected requirements:** [RQ-107](requirements.md#rq-107), [RQ-108](requirements.md#rq-108), [RQ-338](requirements.md#rq-338).

## Q-007

**Question:** What clock, timezone, default calendar range and reset range define the present?

**Why this matters:** NOW and reset range are fixed in 2026.

**Resolution:** Nominate the product decision-maker. Specify time source and default range without treating demo dates as business rules.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [US-015](../2-user-stories/US-015-cal-calendar-range.md), [US-016](../2-user-stories/US-016-cal-calendar-present.md).

**Directly affected requirements:** [RQ-076](requirements.md#rq-076), [RQ-077](requirements.md#rq-077), [RQ-079](requirements.md#rq-079), [RQ-097](requirements.md#rq-097), [RQ-102](requirements.md#rq-102), [RQ-103](requirements.md#rq-103), [RQ-104](requirements.md#rq-104), [RQ-106](requirements.md#rq-106).

## Q-008

**Question:** What must Jump to the present do when today is not loaded?

**Why this matters:** The fallback reloads May-August 2026 and scrolls to the top.

**Resolution:** Nominate the product decision-maker. Adopt a recovery rule that loads and reveals the current day.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-016](../2-user-stories/US-016-cal-calendar-present.md).

**Directly affected requirements:** [RQ-106](requirements.md#rq-106).

## Q-009

**Question:** How can operators reach additional content when the viewport cannot scroll, and what are the list/calendar limits?

**Why this matters:** Progressive disclosure depends entirely on scroll events.

**Resolution:** Nominate the product decision-maker. Agree an accessible fallback and expected data horizon.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-015](../2-user-stories/US-015-cal-calendar-range.md), [US-019](../2-user-stories/US-019-cal-fleet-pagination.md).

**Directly affected requirements:** [RQ-102](requirements.md#rq-102), [RQ-103](requirements.md#rq-103), [RQ-123](requirements.md#rq-123).

## Q-010

**Question:** Do fleet ladder chips show the last assigned step or the currently decayed step?

**Why this matters:** The chips display terminal replay state while predictions apply decay.

**Resolution:** Nominate the product decision-maker. Choose the meaning, label it, and verify a fully decayed ladder.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-018](../2-user-stories/US-018-cal-fleet-summary.md).

**Directly affected requirements:** [RQ-113](requirements.md#rq-113).

## Q-011

**Question:** Which offence should supply the representative fleet forecast, including ties and no history?

**Why this matters:** The prototype picks the most frequent historical type, not highest predicted duration.

**Resolution:** Nominate the product decision-maker. Confirm a selection rule and tie behavior, or require a different summary.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-018](../2-user-stories/US-018-cal-fleet-summary.md).

**Directly affected requirements:** [RQ-116](requirements.md#rq-116).

## Q-012

**Question:** Must the explanation follow a cooldown-start anchor as well as an expiry anchor?

**Why this matters:** The explanation always says decay runs from expiry.

**Resolution:** Nominate the product decision-maker. Align explanation examples with the selected anchor.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-023](../2-user-stories/US-023-cal-account-explanation.md).

**Directly affected requirements:** [RQ-139](requirements.md#rq-139), [RQ-140](requirements.md#rq-140).

## Q-013

**Question:** Is one latest-record explanation sufficient, or is reasoning needed separately per offence?

**Why this matters:** Predictions are per type but explanation uses only the latest account record.

**Resolution:** Nominate the product decision-maker. Review multi-type accounts and decide explanation granularity.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-023](../2-user-stories/US-023-cal-account-explanation.md).

**Directly affected requirements:** [RQ-140](requirements.md#rq-140).

## Q-014

**Question:** Should prediction confidence be visible, and what evidence makes a confidence label valid?

**Why this matters:** Confidence values exist in logic but are not rendered. Related review concern: Labels use arbitrary sample and window heuristics; full-reset mode stays medium forever after reset, and fully decayed histories still oscillate.

**Resolution:** Nominate the product decision-maker. Confirm whether confidence is in scope before adding a visible badge. Define an honest evidence indicator or a validated confidence model and specify its boundary examples.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** Scope or research decision; no additional user story is assumed.

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..

## Q-015

**Question:** Must choosing a specific account match its stable ID rather than a tag substring?

**Why this matters:** Choosing hbh_1 can accidentally match hbh_10.

**Resolution:** Nominate the product decision-maker. Use exact stable identity for a selected account; retain substring matching only in search.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-008](../2-user-stories/US-008-cal-account-filter.md), [US-017](../2-user-stories/US-017-cal-calendar-account-focus.md).

**Directly affected requirements:** [RQ-054](requirements.md#rq-054), [RQ-107](requirements.md#rq-107).

## Q-016

**Question:** What should all views show when no accounts exist?

**Why this matters:** Detail unconditionally reads the fallback account and may crash.

**Resolution:** Nominate the product decision-maker. Define empty-fleet behavior and a supported route to acquire accounts.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-020](../2-user-stories/US-020-cal-account-detail.md).

**Directly affected requirements:** [RQ-129](requirements.md#rq-129).

## Q-017

**Question:** Is forecast-marker visibility an in-app preference or only a design-editor property?

**Why this matters:** The property has no operator control in the UI.

**Resolution:** Nominate the product decision-maker. Keep it code-only unless an operator setting is explicitly chosen.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md).

**Directly affected requirements:** [RQ-094](requirements.md#rq-094).

## Q-018

**Question:** How are tracked accounts supplied, corrected or removed?

**Why this matters:** The prototype seeds 26 accounts and provides no account CRUD/import flow.

**Resolution:** Nominate the product decision-maker. Confirm the account lifecycle and keep absent controls outside observed scope.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** Scope or research decision; no additional user story is assumed.

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..

## Q-019

**Question:** Where must exact start/expiry time and timezone remain visible when calendar/history show dates?

**Why this matters:** Date-only displays hide the time accepted by observation entry.

**Resolution:** Nominate the product decision-maker. Define display precision and time-boundary examples.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [US-024](../2-user-stories/US-024-cal-account-history.md).

**Directly affected requirements:** [RQ-078](requirements.md#rq-078), [RQ-143](requirements.md#rq-143).

## Q-020

**Question:** Which current-day cell should Jump to the present target when spillover dates duplicate it?

**Why this matters:** The same cc-today ID may occur in adjacent month grids.

**Resolution:** Nominate the product decision-maker. Choose the current-month cell and keep the anchor unique.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-016](../2-user-stories/US-016-cal-calendar-present.md).

**Directly affected requirements:** [RQ-105](requirements.md#rq-105), [RQ-106](requirements.md#rq-106).

## Q-021

**Question:** Does a step-down marker duration mean its resulting current level or the next offence duration?

**Why this matters:** The prototype indexes ladder[to], and S0 still shows the first-step duration. Related review concern: Markers say S0 while showing a step-1 duration, and Clear suppresses markers even for accounts with residual state.

**Resolution:** Nominate the product decision-maker. Specify the marker label meaning with S0 and S1 examples. Agree marker terminology and filter semantics; distinguish forecasts from recorded events.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md).

**Directly affected requirements:** [RQ-089](requirements.md#rq-089), [RQ-093](requirements.md#rq-093), [RQ-098](requirements.md#rq-098).

## Q-022

**Question:** Should On cooldown include future step-down marks for accounts that are currently clear?

**Why this matters:** Forecast generation excludes Clear but does not constrain On cooldown to active accounts.

**Resolution:** Nominate the product decision-maker. Agree forecast/status interaction and test clear accounts with pending decay.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md).

**Directly affected requirements:** [RQ-089](requirements.md#rq-089).

## Q-023

**Question:** Should Reset close open selectors and clear their search text as well as active filters?

**Why this matters:** Current Reset clears filter values only.

**Resolution:** Nominate the product decision-maker. Confirm reset behavior with an open searched selector.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-011](../2-user-stories/US-011-cal-reset-filters.md).

**Directly affected requirements:** [RQ-071](requirements.md#rq-071).

## Q-024

**Question:** Should a forecast explanation include the most recent record when it is future-dated?

**Why this matters:** The latest event and current status can be inconsistent when future observations are accepted.

**Resolution:** Nominate the product decision-maker. Resolve alongside future-record policy and explanation time context.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [US-023](../2-user-stories/US-023-cal-account-explanation.md).

**Directly affected requirements:** [RQ-097](requirements.md#rq-097), [RQ-138](requirements.md#rq-138).

## Q-025

**Question:** Which production operator authentication and provisioning policy applies?

**Why this matters:** The design explicitly accepts any credentials and stores a client flag; it does not establish operator identities.

**Resolution:** Nominate the product decision-maker. Confirm how the existing backend login is used and who provisions/deactivates operators; decide whether password recovery is in scope.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-001](../2-user-stories/US-001-obs-sign-in.md).

**Directly affected requirements:** [RQ-008](requirements.md#rq-008), [RQ-009](requirements.md#rq-009), [RQ-011](requirements.md#rq-011), [RQ-012](requirements.md#rq-012).

## Q-026

**Question:** What defines a valid returning session, its lifetime and cross-tab revocation?

**Why this matters:** Only a localStorage flag is restored; no expiry or authoritative session check exists.

**Resolution:** Nominate the product decision-maker. Agree session duration and restoration/revocation behaviour with the product and security owner.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-003](../2-user-stories/US-003-obs-session-restore.md), [US-004](../2-user-stories/US-004-obs-sign-out.md), [US-055](../2-user-stories/US-055-obs-expired-session.md).

**Directly affected requirements:** [RQ-017](requirements.md#rq-017), [RQ-018](requirements.md#rq-018), [RQ-024](requirements.md#rq-024), [RQ-327](requirements.md#rq-327), [RQ-328](requirements.md#rq-328).

## Q-027

**Question:** Does one trusted group share a fleet, or are fleets and records scoped to different operators/groups?

**Why this matters:** The design says a small trusted group but contains no authorization model; template account ownership is a separate assumption.

**Resolution:** Nominate the product decision-maker. Define memberships, fleet boundaries, read/write permissions and rule-edit permission before data modelling.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-001](../2-user-stories/US-001-obs-sign-in.md), [US-005](../2-user-stories/US-005-obs-authorization.md), [US-051](../2-user-stories/US-051-obs-durable-history.md), [US-052](../2-user-stories/US-052-obs-shared-history.md).

**Directly affected requirements:** [RQ-025](requirements.md#rq-025), [RQ-026](requirements.md#rq-026), [RQ-027](requirements.md#rq-027), [RQ-313](requirements.md#rq-313).

## Q-028

**Question:** What happens to report/editor drafts and local domain state after logout or session expiry?

**Why this matters:** The prototype clears credentials but leaves drafts, dialogs and data in memory.

**Resolution:** Nominate the product decision-maker. Agree cleanup and draft recovery boundaries for logout, expiry and subsequent sign-in by another operator.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-004](../2-user-stories/US-004-obs-sign-out.md), [US-026](../2-user-stories/US-026-obs-report-cancel.md), [US-048](../2-user-stories/US-048-rule-delete-type.md), [US-055](../2-user-stories/US-055-obs-expired-session.md).

**Directly affected requirements:** [RQ-300](requirements.md#rq-300), [RQ-329](requirements.md#rq-329).

## Q-029

**Question:** Should opening a report use the current account detail and current time, or preserve the previous draft?

**Why this matters:** The global opener only toggles the dialog; the initial form always targets a0 with a fixed sample date.

**Resolution:** Nominate the product decision-maker. Choose context-preselection and reset behaviour for first open, reopen, cancel and successful save.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-025](../2-user-stories/US-025-obs-report-open.md), [US-026](../2-user-stories/US-026-obs-report-cancel.md).

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..

## Q-030

**Question:** Does the entered timestamp mean cooldown issue time, observation time, or are both needed?

**Why this matters:** The field says start time, remaining duration says time when looked, and the model says initial_recorded_date. Related review concern: The form says cooldown start while the data model says initial recorded date. Remaining duration cannot reconstruct issue time without an observation timestamp.

**Resolution:** Nominate the product decision-maker. Define issue and observation timestamps, expiry formula, unknown-start handling and the relation to recorded remaining duration. Agree field meanings, timezone, precision and expiry derivation before implementing recording.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-029](../2-user-stories/US-029-obs-observation-time.md), [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md), [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-040](../2-user-stories/US-040-rule-decay.md), [US-041](../2-user-stories/US-041-rule-evaluate-history.md), [US-056](../2-user-stories/US-056-obs-evidence-provenance.md), [US-065](../2-user-stories/US-065-root-cooldown-identity.md).

**Directly affected requirements:** [RQ-181](requirements.md#rq-181), [RQ-182](requirements.md#rq-182), [RQ-256](requirements.md#rq-256), [RQ-257](requirements.md#rq-257).

## Q-031

**Question:** Which timezone and timestamp precision govern recording and display?

**Why this matters:** datetime-local uses browser-local interpretation, while elapsed clean days use fixed milliseconds.

**Resolution:** Nominate the product decision-maker. Agree timezone identification, storage/display conversions and daylight-saving boundary examples.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-029](../2-user-stories/US-029-obs-observation-time.md).

**Directly affected requirements:** [RQ-182](requirements.md#rq-182).

## Q-032

**Question:** Must a backdated report preview use only history before its entered time?

**Why this matters:** The preview uses fixed NOW and all terminal history; replay later sorts by entered start.

**Resolution:** Nominate the product decision-maker. Agree event-time replay and preview/save equivalence, including identical timestamp ordering.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-032](../2-user-stories/US-032-obs-report-preview.md), [US-054](../2-user-stories/US-054-obs-concurrent-consistency.md).

**Directly affected requirements:** [RQ-201](requirements.md#rq-201), [RQ-202](requirements.md#rq-202).

## Q-033

**Question:** May reports describe future cooldowns, overlapping restrictions, equal-time events or repeated observations of one cooldown; how is one offence distinguished from another?

**Why this matters:** The form permits future dates; active checks only compare expiry with NOW and every report appends another offence. Related review concern: The prototype considers any non-expired future record active. Related review concern: Fleet and detail may select different first matches. Related review concern: Current active checks ignore start time, overlapping short overrides can advance the decay anchor backwards, and ties depend on insertion order.

**Resolution:** Nominate the product decision-maker. Define permitted chronology and whether repeated observations update evidence or count as new offences. Define future-date policy and verify exact start/expiry boundaries. Define overlap policy and deterministic summary behavior. Define admissible timestamps, deterministic ordering, overlap anchor, duplicate detection and idempotent save behaviour. Decide active status using both start and expiry; define the displayed restriction for overlaps, deterministic tie handling and the clean-time anchor when a later event ends earlier.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-007](../2-user-stories/US-007-cal-fleet-totals.md), [US-009](../2-user-stories/US-009-cal-status-filter.md), [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [US-020](../2-user-stories/US-020-cal-account-detail.md), [US-023](../2-user-stories/US-023-cal-account-explanation.md), [US-029](../2-user-stories/US-029-obs-observation-time.md), [US-041](../2-user-stories/US-041-rule-evaluate-history.md), [US-065](../2-user-stories/US-065-root-cooldown-identity.md).

**Directly affected requirements:** [RQ-041](requirements.md#rq-041), [RQ-056](requirements.md#rq-056), [RQ-111](requirements.md#rq-111), [RQ-120](requirements.md#rq-120), [RQ-127](requirements.md#rq-127), [RQ-138](requirements.md#rq-138), [RQ-257](requirements.md#rq-257), [RQ-362](requirements.md#rq-362), [RQ-363](requirements.md#rq-363).

## Q-034

**Question:** What input precision, normalization and valid ranges apply to remaining duration?

**Why this matters:** The prototype rounds an additive day/hour/minute total and silently converts zero to one minute on save. Related review concern: Zero becomes one minute, muted fields still contribute, and over-total warnings do not prevent saves.

**Resolution:** Nominate the product decision-maker. Decide whole/fractional input, zero handling, component overflow and explicit invalid-input messages. Define accepted observations and blocking versus explicit exceptions; preserve what the operator actually saw. Cover zero, blank, nonfinite, negative, fractional, mixed-unit and above-maximum values; coordinate with the separate over-total evidence decision.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-031](../2-user-stories/US-031-obs-duration-validation.md).

**Directly affected requirements:** [RQ-190](requirements.md#rq-190), [RQ-191](requirements.md#rq-191), [RQ-192](requirements.md#rq-192), [RQ-193](requirements.md#rq-193), [RQ-194](requirements.md#rq-194).

## Q-035

**Question:** Should lower duration units remain additive when days or hours are present?

**Why this matters:** They appear muted with N/A placeholders but remain editable and included in the total.

**Resolution:** Nominate the product decision-maker. Choose additive entry or mutually exclusive precision and align labels, enabled states and calculation.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-030](../2-user-stories/US-030-obs-remaining-duration.md).

**Directly affected requirements:** [RQ-187](requirements.md#rq-187).

## Q-036

**Question:** May a report be saved when observed remaining duration exceeds the selected total?

**Why this matters:** The warning does not block save, including values exceeding every ladder step.

**Resolution:** Nominate the product decision-maker. Choose rejection, explicit mismatch acknowledgement, evidence-only recording or another recovery path; define >maximum behaviour.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-034](../2-user-stories/US-034-obs-duration-conflict.md), [US-035](../2-user-stories/US-035-obs-record-observation.md).

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..

## Q-037

**Question:** What evidence or reason supports an override, and when is the override reset?

**Why this matters:** Type changes reset it but account changes and successful saves retain it. Related review concern: Overrides persist in form state after saving and may be reused for another account unintentionally.

**Resolution:** Nominate the product decision-maker. Decide account/type/time binding, override audit fields and reset behaviour. Define override scope, reset defaults, reason capture and audit provenance.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-033](../2-user-stories/US-033-obs-manual-override.md), [US-039](../2-user-stories/US-039-rule-predict-independent.md).

**Directly affected requirements:** [RQ-247](requirements.md#rq-247).

## Q-038

**Question:** Which report fields are required and what are their valid values?

**Why this matters:** Invalid dates and zero duration are silently substituted; missing references can fall back to defaults.

**Resolution:** Nominate the product decision-maker. Approve field validation and missing-value rules before a save contract is finalized.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-029](../2-user-stories/US-029-obs-observation-time.md), [US-031](../2-user-stories/US-031-obs-duration-validation.md), [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-036](../2-user-stories/US-036-obs-report-integrity.md).

**Directly affected requirements:** [RQ-181](requirements.md#rq-181), [RQ-192](requirements.md#rq-192).

## Q-039

**Question:** What happens when no tracked accounts or offence types exist, including deletion of the last offence type?

**Why this matters:** Deleting the last type is possible and reporting can still create an empty-type event; zero accounts break detail assumptions. Related review concern: The prototype then falls back to a blank type with a fake one-day ladder and still saves.

**Resolution:** Nominate the product decision-maker. Define blocking empty states and the authorized route to provision an account or create an offence type. Choose protected-last-type or a disabled reporting state with a create-type route; require referential integrity.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-036](../2-user-stories/US-036-obs-report-integrity.md), [US-048](../2-user-stories/US-048-rule-delete-type.md), [US-050](../2-user-stories/US-050-rule-safe-model-changes.md).

**Directly affected requirements:** [RQ-224](requirements.md#rq-224), [RQ-225](requirements.md#rq-225), [RQ-226](requirements.md#rq-226), [RQ-227](requirements.md#rq-227), [RQ-297](requirements.md#rq-297).

## Q-040

**Question:** What data retention, backup and restore policy applies to observations and shared rules?

**Why this matters:** Domain state is memory-only, so reload removes all edits while login may survive.

**Resolution:** Nominate the product decision-maker. Confirm the authoritative store, retention and restoration responsibilities without inventing service targets.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-051](../2-user-stories/US-051-obs-durable-history.md).

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..

## Q-041

**Question:** What draft and retry behaviour is expected when a save fails or its result is unknown?

**Why this matters:** The synchronous prototype has no loading/error/timeout state or duplicate-request protection.

**Resolution:** Nominate the product decision-maker. Approve pending, failure, uncertain result and retry behaviour with idempotent save acceptance examples.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-053](../2-user-stories/US-053-obs-save-recovery.md).

**Directly affected requirements:** [RQ-317](requirements.md#rq-317), [RQ-320](requirements.md#rq-320), [RQ-321](requirements.md#rq-321), [RQ-322](requirements.md#rq-322), [RQ-323](requirements.md#rq-323).

## Q-042

**Question:** How should reports and rule edits resolve concurrent changes?

**Why this matters:** There is no shared persistence or stale-write handling in the prototype. Related review concern: All model data are local component state; only demo auth persists, and IDs use Date.now.

**Resolution:** Nominate the product decision-maker. Define whether to reject, refresh, merge or explicitly confirm stale previews and rule edits. Define durable shared writes, stable identities, retries, stale-write conflicts, atomic updates and recovery states.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-032](../2-user-stories/US-032-obs-report-preview.md), [US-036](../2-user-stories/US-036-obs-report-integrity.md), [US-042](../2-user-stories/US-042-rule-add-type.md), [US-045](../2-user-stories/US-045-rule-rename-type.md), [US-048](../2-user-stories/US-048-rule-delete-type.md), [US-050](../2-user-stories/US-050-rule-safe-model-changes.md), [US-052](../2-user-stories/US-052-obs-shared-history.md), [US-053](../2-user-stories/US-053-obs-save-recovery.md), [US-054](../2-user-stories/US-054-obs-concurrent-consistency.md).

**Directly affected requirements:** [RQ-202](requirements.md#rq-202), [RQ-224](requirements.md#rq-224), [RQ-225](requirements.md#rq-225), [RQ-281](requirements.md#rq-281), [RQ-309](requirements.md#rq-309), [RQ-322](requirements.md#rq-322), [RQ-324](requirements.md#rq-324), [RQ-325](requirements.md#rq-325), [RQ-326](requirements.md#rq-326).

## Q-043

**Question:** Which authorship, override reason and change history must be retained?

**Why this matters:** The prototype does not identify the recording operator, modification history or reason for a manual step.

**Resolution:** Nominate the product decision-maker. Decide minimum audit evidence and access to it; distinguish raw observation from derived estimate.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-056](../2-user-stories/US-056-obs-evidence-provenance.md).

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..

## Q-044

**Question:** Can operators correct, remove or merge an already recorded observation?

**Why this matters:** The design has no individual record edit/delete/merge controls.

**Resolution:** Nominate the product decision-maker. Confirm scope and permissions for correction and duplicate resolution; do not infer a CRUD interface.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-065](../2-user-stories/US-065-root-cooldown-identity.md).

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..

## Q-045

**Question:** Which accessibility, browser and assistive-technology targets apply?

**Why this matters:** The markup omits dialog/combobox semantics and uses mouse-only override and small text. Related review concern: Those controls are clickable div elements without keyboard equivalents.

**Resolution:** Nominate the product decision-maker. Agree testable access targets and representative keyboard, touch, screen reader and zoom checks. Set the accessibility target and test semantic controls and focus behavior. Include keyboard access to calendar bars, fleet rows, overflow, both editors and searchable selectors.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-057](../2-user-stories/US-057-obs-keyboard-workflow.md), [US-058](../2-user-stories/US-058-obs-touch-override.md), [US-059](../2-user-stories/US-059-obs-accessible-dialogs.md), [US-060](../2-user-stories/US-060-obs-accessible-controls.md), [US-061](../2-user-stories/US-061-obs-perceivable-feedback.md), [US-062](../2-user-stories/US-062-obs-responsive-report.md).

**Directly affected requirements:** [RQ-337](requirements.md#rq-337), [RQ-338](requirements.md#rq-338), [RQ-350](requirements.md#rq-350), [RQ-351](requirements.md#rq-351), [RQ-353](requirements.md#rq-353).

## Q-046

**Question:** Which viewport sizes and enlarged-text layouts must be supported?

**Why this matters:** The report is fixed at 660px, the editor at 640px and the sidebar at 236px; no mobile alternative is shown. Related review concern: The design does not specify mobile navigation or full reflow.

**Resolution:** Nominate the product decision-maker. Agree supported viewports and responsive behaviour for navigation, reporting and calendar content. Choose supported viewports and reflow acceptance examples. Include the fixed sidebar, fleet grid, account detail panels, calendar and both dialogs.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-058](../2-user-stories/US-058-obs-touch-override.md), [US-062](../2-user-stories/US-062-obs-responsive-report.md).

**Directly affected requirements:** [RQ-352](requirements.md#rq-352), [RQ-353](requirements.md#rq-353), [RQ-354](requirements.md#rq-354), [RQ-355](requirements.md#rq-355), [RQ-356](requirements.md#rq-356), [RQ-357](requirements.md#rq-357).

## Q-047

**Question:** Should the application honor reduced-motion preferences?

**Why this matters:** The design animates modal opening and uses smooth scrolling without a preference check.

**Resolution:** Nominate the product decision-maker. Confirm reduced-motion support and an equivalent nonanimated path.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-063](../2-user-stories/US-063-obs-reduced-motion.md).

**Directly affected requirements:** [RQ-358](requirements.md#rq-358).

## Q-048

**Question:** What initial-load, unavailable-service and empty-data states are required?

**Why this matters:** Seed data is synchronous, so the prototype cannot expose delayed or failed network reads. Related review concern: The design uses seeded client-memory data rather than server responses.

**Resolution:** Nominate the product decision-maker. Define loading/error/retry states and distinguish failure from a genuinely empty result. Define these states before production data integration.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-001](../2-user-stories/US-001-obs-sign-in.md), [US-064](../2-user-stories/US-064-obs-load-recovery.md).

**Directly affected requirements:** [RQ-011](requirements.md#rq-011), [RQ-361](requirements.md#rq-361).

## Q-049

**Question:** What fleet/history volume and acceptable response conditions must the product support?

**Why this matters:** The sample has 26 accounts; no workload, latency, offline or scale targets are agreed.

**Resolution:** Nominate the product decision-maker. Agree representative workload and measurable response targets before writing numerical performance requirements.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-064](../2-user-stories/US-064-obs-load-recovery.md).

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..

## Q-050

**Question:** Which live clock and timezone govern expiry, calendar dates and a clean day: elapsed 24 hours or local calendar days?

**Why this matters:** NOW is fixed at 29 Aug 2026; calculations use 86400000 ms days while inputs and labels use local time.

**Resolution:** Nominate the product decision-maker. Replace demo clock with an agreed reference and define daylight-saving, timezone and clock-change examples.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [US-040](../2-user-stories/US-040-rule-decay.md).

**Directly affected requirements:** [RQ-095](requirements.md#rq-095), [RQ-249](requirements.md#rq-249), [RQ-256](requirements.md#rq-256).

## Q-051

**Question:** Do ladder changes recalculate old predictions or preserve the policy and total used when each observation was recorded?

**Why this matters:** Prototype edits silently alter historical durations, expiry, status, decay and clamped manual overrides.

**Resolution:** Nominate the product decision-maker. Choose versioned snapshots or explicit retrospective recalculation with impact review and acceptance examples.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [US-039](../2-user-stories/US-039-rule-predict-independent.md), [US-041](../2-user-stories/US-041-rule-evaluate-history.md), [US-046](../2-user-stories/US-046-rule-edit-duration.md), [US-047](../2-user-stories/US-047-rule-ladder-length.md), [US-049](../2-user-stories/US-049-rule-optional-policies.md), [US-050](../2-user-stories/US-050-rule-safe-model-changes.md).

**Directly affected requirements:** [RQ-095](requirements.md#rq-095), [RQ-248](requirements.md#rq-248), [RQ-306](requirements.md#rq-306), [RQ-307](requirements.md#rq-307), [RQ-308](requirements.md#rq-308), [RQ-309](requirements.md#rq-309).

## Q-052

**Question:** Are seven-day step-down rules fixed, or should operators be able to select Full reset, No decay, a different window, or a start anchor?

**Why this matters:** Alternative modes exist in code but have no controls; the visible anchor rule explicitly says expiry.

**Resolution:** Nominate the product decision-maker. Confirm scope and rule owner; either expose agreed controls with consistent copy or remove unused alternatives.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-040](../2-user-stories/US-040-rule-decay.md), [US-049](../2-user-stories/US-049-rule-optional-policies.md).

**Directly affected requirements:** [RQ-249](requirements.md#rq-249), [RQ-301](requirements.md#rq-301), [RQ-302](requirements.md#rq-302), [RQ-303](requirements.md#rq-303), [RQ-304](requirements.md#rq-304), [RQ-305](requirements.md#rq-305).

## Q-053

**Question:** Who owns and verifies the initial offence ladders and the assumption that offence types decay independently?

**Why this matters:** Prototype text claims Valve-issued durations without supplying a rule source. This extraction does not verify game policy.

**Resolution:** Nominate the product decision-maker. Obtain an owner and authoritative evidence, or label the configured rules as model assumptions.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-037](../2-user-stories/US-037-rule-inspect-ladders.md), [US-038](../2-user-stories/US-038-rule-seed-ladders.md), [US-039](../2-user-stories/US-039-rule-predict-independent.md), [US-040](../2-user-stories/US-040-rule-decay.md).

**Directly affected requirements:** [RQ-235](requirements.md#rq-235), [RQ-236](requirements.md#rq-236), [RQ-237](requirements.md#rq-237), [RQ-238](requirements.md#rq-238), [RQ-239](requirements.md#rq-239).

## Q-054

**Question:** What finite positive duration range, precision and ladder ordering are valid?

**Why this matters:** Blank/negative/invalid steps silently become one minute; duplicates and decreasing ladders are accepted; no maximum exists.

**Resolution:** Nominate the product decision-maker. Agree finite bounds, rounding, equal/decreasing-step policy, invalid-input messages and tests without inventing limits.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-046](../2-user-stories/US-046-rule-edit-duration.md), [US-047](../2-user-stories/US-047-rule-ladder-length.md).

**Directly affected requirements:** [RQ-285](requirements.md#rq-285), [RQ-286](requirements.md#rq-286), [RQ-287](requirements.md#rq-287).

## Q-055

**Question:** Should changing a step unit preserve its duration or reinterpret the entered number?

**Why this matters:** The prototype changes 30 min into 30 hours when hrs is selected without changing the amount.

**Resolution:** Nominate the product decision-maker. Choose conversion or reinterpretation and make the preview and label support that decision.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-046](../2-user-stories/US-046-rule-edit-duration.md).

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..

## Q-056

**Question:** Which characters, uniqueness and whitespace rules apply to short codes, and should truncation be explicit?

**Why this matters:** Save uppercases and truncates to four characters, but whitespace-only and duplicate codes remain possible.

**Resolution:** Nominate the product decision-maker. Agree validation and fallback-code collision behaviour; present any shortening before save.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-044](../2-user-stories/US-044-rule-edit-metadata.md).

**Directly affected requirements:** [RQ-274](requirements.md#rq-274), [RQ-275](requirements.md#rq-275), [RQ-276](requirements.md#rq-276).

## Q-057

**Question:** Should deleting an offence type cascade-delete observations or archive the type, and who may authorise that action?

**Why this matters:** The second click currently destroys all records with no restore, audit or lasting confirmation context.

**Resolution:** Nominate the product decision-maker. Choose retention, permissions, impact acknowledgement, audit and recovery; treat destructive data loss as a release decision.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-048](../2-user-stories/US-048-rule-delete-type.md), [US-053](../2-user-stories/US-053-obs-save-recovery.md).

**Directly affected requirements:** [RQ-293](requirements.md#rq-293), [RQ-294](requirements.md#rq-294), [RQ-295](requirements.md#rq-295), [RQ-321](requirements.md#rq-321).

## Q-058

**Question:** What timestamp precision and duration rounding should operators see?

**Why this matters:** History shows only a date despite sub-day penalties; fractional span formatting can output 1h 60m.

**Resolution:** Nominate the product decision-maker. Agree full timestamp access and normalised minute/hour/day formatting at boundaries.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-024](../2-user-stories/US-024-cal-account-history.md), [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-046](../2-user-stories/US-046-rule-edit-duration.md).

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..

## Q-059

**Question:** What cancels a pending type deletion, and how must changed dependent-record counts be reconfirmed?

**Why this matters:** The demo keeps its armed confirmation across navigation and logout. Another visit can treat a first visible click as destructive confirmation.

**Resolution:** Nominate the product decision-maker. Specify cancellation on navigation, session change or editor opening, and define confirmation when the current type or dependent-record count changes; do not invent an expiry timeout.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** [US-048](../2-user-stories/US-048-rule-delete-type.md).

**Directly affected requirements:** [RQ-300](requirements.md#rq-300).

## Q-060

**Question:** Which outcomes are required for the actual MVP, who accepts them, and what may remain manual?

**Why this matters:** The design-baseline name and MoSCoW labels are assistant proposals, not a user-approved release or an interview finding.

**Resolution:** Nominate the product decision-maker. Name the delivery, nominate its decision-maker, validate the actor and recent real workflow, confirm omissions and workarounds, and review every provisional category.

**Owner:** Unassigned. **Review date:** TBR - before affected baseline approval. **Status:** Open.

**Affected stories:** Scope or research decision; no additional user story is assumed.

**Directly affected requirements:** Parent-story acceptance and scope decisions apply..
