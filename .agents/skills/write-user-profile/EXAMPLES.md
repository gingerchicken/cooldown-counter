# User profile examples

These examples are teaching material for the [write-user-profile skill](./SKILL.md). They are deliberately fictional. They show the level of evidence, labelling and validation a profile needs to pass the skill's quality gate; they are not evidence for a real product.

Each complete example follows the structure in `1-user-profiles-personas.md`: a profile definition, an evidence status, sources, responsibilities and goals, current work and context, knowledge/support/access needs, differences and open questions, and a user-confirmation log. Sections are trimmed here for readability; a real profile fills in every field the template asks for.

## Example 1: Motor-claims handlers who triage new submissions

### `UP-001` - First-notification claims handlers

**Profile definition:** People who make the first triage decision on a newly submitted motor claim: assign a severity code, check for an obvious fraud flag, and route the claim onward. Defined by this shared first-triage task and shared queue tooling, not by team name or length of service, because two handlers on different teams described doing exactly this step the same way, while a senior assessor who *reviews* triage decisions does not do the triage itself and is recorded as a separate related profile.

**Evidence status:** `Reported`, with two claims observed directly (see below).

**Sources:** Intake `INT-2026-014`; interview transcript, 2026-08-12, with two handlers (Priya N., Jordan M.); 15-minute screen-share walkthrough observed 2026-08-14.

#### Responsibilities and goals

- **Responsibilities:** Triage each new claim within a same-day service target (Recorded, intake `INT-2026-014`).
- **Goal in the current process:** "Get to a clean queue before the end of shift" (Reported, direct quote, Jordan M., 2026-08-12 transcript).
- **People who rely on their work:** Senior assessors who receive claims over £10,000 (Recorded, intake); the fraud team, who receive flagged claims (Reported); policyholders awaiting acknowledgement (Reported, inferred from SLA but not directly interviewed — Provisional).
- **Handoffs:** To a senior assessor above the £10,000 threshold (Recorded); to the fraud team when a claim carries a flag code (Reported).

#### Current work and context

- **Recent task or event:** Walked through a windscreen claim submitted at 8:40am; handler checked policy status, photos and a flag code before routing it (Observed, 2026-08-14 walkthrough).
- **Current steps:** Open queue → open claim → check policy status → check for flag code → assign severity → route (Observed).
- **Tools, documents and data:** Claims queue system, policy lookup screen, a printed flag-code reference sheet taped to the monitor (Observed).
- **Workarounds:** Keeps a personal spreadsheet of "claims that need chasing" because the queue view does not show claims waiting on a third party (Reported, Jordan M.).
- **Where and how often the work happens:** Office-based, Monday–Friday; roughly 25–40 claims per handler per day (Reported, both participants gave similar figures).
- **Interruptions, connectivity or device conditions:** Frequent phone interruptions from policyholders chasing status (Reported).

#### Knowledge, support and access needs

- **What an experienced user knows:** The flag-code list and which combinations usually mean a routing exception (Reported).
- **What a newcomer needs explained:** A new starter needed the flag-code list walked through step by step (Reported, Priya N., describing onboarding a colleague).
- **Support or assistance currently used:** Asks a senior handler over desk-side chat (Reported).
- **Reported language, accessibility or other barriers:** Not asked yet (Unknown).
- **Confirmation route for unverified needs:** Team lead, Priya N., can arrange a further session.

#### Differences and open questions

| Question or difference | Evidence status | Owner | Evidence needed | Review date |
| --- | --- | --- | --- | --- |
| Do handlers in their first three months skip the fraud-flag check on claims under £500, as Jordan described, or follow the full sequence, as Priya described? | `Conflicting` | Team lead (Priya N.) | Observe two newer handlers directly | 2026-09-30 |

#### User confirmation

| Person or group consulted | What they confirmed or corrected | Date | Evidence link |
| --- | --- | --- | --- |
| Jordan M. | Confirmed the personal-spreadsheet workaround and the SLA pressure | 2026-08-12 | Interview transcript |

This profile stays `Provisional` overall until the disagreement above is resolved and until the policyholder assumption is checked directly.

## Example 2: Warehouse pickers using a handheld scanner

### `UP-002` - Zone pickers on the late shift

**Profile definition:** People who pick items from a warehouse zone against a handheld-scanner pick list during the late shift. Defined by the shared pick-and-scan task and shared shift pattern, which a site visit showed produces different pressures from the day shift (quieter aisles, fewer supervisors on the floor), not by an assumed age or experience level.

**Evidence status:** `Observed` for the walked task; `Reported` for frequency and support.

**Sources:** Site visit, 2026-07-02, shadowing two pickers for one hour each; site supervisor interview, 2026-07-02.

#### Responsibilities and goals

- **Responsibilities:** Pick listed items in scanner-assigned order and confirm each pick by scan (Observed).
- **Goal in the current process:** Clear the assigned pick list before the shift's cut-off for the next dispatch wave (Reported, supervisor).
- **People who rely on their work:** Dispatch staff who build pallets from completed picks (Reported); customers whose orders are delayed if a pick list is not cleared (Provisional — not interviewed).
- **Handoffs:** Completed pick trolleys go to the packing bench (Observed).

#### Current work and context

- **Recent task or event:** Watched a picker resolve a scan mismatch when a bin location was empty; they radioed a supervisor rather than substituting an item themselves (Observed, 2026-07-02).
- **Current steps:** Scan pick list → walk to bin → scan bin barcode → scan item → confirm quantity → move to next pick (Observed).
- **Tools, documents and data:** Handheld scanner, pick trolley; no printed backup list observed in use (Observed).
- **Workarounds:** None observed during the shadowed hour; the supervisor mentioned pickers "sometimes" note stock discrepancies on a whiteboard, but this was not seen directly (Reported, Unconfirmed by direct observation).
- **Where and how often the work happens:** Warehouse floor, late shift, four nights a week per picker (Reported).
- **Interruptions, connectivity or device conditions:** Scanner loses signal near the loading-bay doors, confirmed by watching one picker retry a scan twice (Observed).

#### Knowledge, support and access needs

- **What an experienced user knows:** Which bin locations are mislabelled and need a manual check (Reported, supervisor).
- **What a newcomer needs explained:** How to escalate a scan mismatch instead of guessing (Observed — this is what the shadowed picker did, and the supervisor confirmed it is the trained procedure).
- **Support or assistance currently used:** Radio to the floor supervisor (Observed).
- **Reported language, accessibility or other barriers:** Supervisor mentioned some agency staff have limited English and rely on the scanner's icon-based prompts rather than its text; not yet confirmed with an affected picker (Reported, Provisional).
- **Confirmation route for unverified needs:** Site supervisor to identify an agency-staff picker willing to be shadowed.

#### Differences and open questions

| Question or difference | Evidence status | Owner | Evidence needed | Review date |
| --- | --- | --- | --- | --- |
| Do agency staff rely on icon-based prompts because of language, device familiarity, or a training gap? | `Unknown` | Site supervisor | Shadow or interview an agency-staff picker directly | 2026-08-15 |

#### User confirmation

| Person or group consulted | What they confirmed or corrected | Date | Evidence link |
| --- | --- | --- | --- |
| Site supervisor | Confirmed shift pattern and escalation procedure; could not confirm the language-barrier claim first-hand | 2026-07-02 | Site visit note |

## Example 3: People affected by the outcome who do not use the system

### `UP-003` - Payroll reconciliation team receiving the monthly export

**Profile definition:** The two-person payroll team who receive a monthly CSV export from the rota system and reconcile it against timesheets. They do not use the rota system's interface at all, but the idea intake names a change to the export as in scope, so their current work and needs belong in this profile register alongside the rota system's direct users (method step 3: include people affected by the outcome even when they do not directly use the application).

**Evidence status:** `Reported`.

**Sources:** Intake `INT-2026-021`, question 3 ("who encounters it, and who can show us"); follow-up call with the payroll lead, 2026-08-20.

#### Responsibilities and goals

- **Responsibilities:** Reconcile the monthly export against submitted timesheets before the payroll run cut-off (Reported).
- **Goal in the current process:** Catch discrepancies before pay is run, not after (Reported).
- **People who rely on their work:** Staff who are paid correctly and on time depend on this reconciliation (Reported, payroll lead's framing).
- **Handoffs:** Discrepancies are emailed back to line managers for confirmation (Reported).

#### Current work and context

- **Recent task or event:** Last month's export was missing three starters who joined mid-month; the team found this only when timesheets did not match, and pay for those three staff was delayed by one cycle (Reported, payroll lead, describing a specific identifiable event).
- **Current steps:** Download export → open in spreadsheet → match against timesheet totals → flag mismatches → email line managers (Reported).
- **Tools, documents and data:** CSV export, spreadsheet, email (Reported).
- **Workarounds:** Payroll lead now cross-checks the starter list from HR separately every month, because the export has been wrong before (Reported).
- **Where and how often the work happens:** Office-based, once a month around the payroll cut-off (Reported).
- **Interruptions, connectivity or device conditions:** Not asked (Unknown).

#### Knowledge, support and access needs

- **What an experienced user knows:** Which discrepancy patterns usually mean a late starter versus a timesheet error (Reported).
- **What a newcomer needs explained:** Not asked; only one team member was available for the call (Unknown).
- **Support or assistance currently used:** Escalates to the rota system's administrator by email when the export itself looks wrong (Reported).
- **Reported language, accessibility or other barriers:** Not applicable to this internal team; not asked (Unknown).
- **Confirmation route for unverified needs:** Payroll lead to arrange time with the second team member.

#### Differences and open questions

| Question or difference | Evidence status | Owner | Evidence needed | Review date |
| --- | --- | --- | --- | --- |
| Is the missing-starter problem caused by export timing, a data-entry gap in the rota system, or both? | `Unknown` | Rota system administrator | Compare export timestamps against HR starter records for one full cycle | 2026-09-25 |

#### User confirmation

| Person or group consulted | What they confirmed or corrected | Date | Evidence link |
| --- | --- | --- | --- |
| Payroll lead | Confirmed the missing-starter incident and the manual cross-check workaround | 2026-08-20 | Call note |

Note what this profile does not do: it does not claim the payroll team wants a particular fix, and it does not infer that they should get direct access to the rota system. Any access change is a separate decision for the product owner, not a conclusion drawn from this profile.

## Bad examples and better corrections

These are intentionally weak. Identify which rule from the skill's method or quality gate is broken before rewriting; do not just make the prose sound more polished.

### Bad example 1: Unsupported demographic label instead of shared work

> **Profile definition:** Older users who find the online renewal portal confusing.

**Why it fails:** "Older" is an unsupported demographic label standing in for a group defined by shared work and needs, and "confusing" is an unevidenced trait, not a recorded or observed finding. It breaks method step 1 and the quality gate's ban on invented traits.

**Better:**

> **Profile definition:** People who renew a household policy without contacting a broker first. An interview with the call-centre lead showed this group contacts the call centre partway through renewal at a noticeably higher rate than broker-assisted customers (Reported); age was not recorded and should not be assumed as the cause.

### Bad example 2: Invented quotes and traits

> **Knowledge and confidence:** Users like Maggie, 68, feel anxious about clicking the wrong button and prefer talking to a real person.

**Why it fails:** "Maggie" and her age are invented, and "feel anxious" asserts an internal state with no source or evidence label. This is exactly what the quality gate prohibits: invented quotes, traits and outcomes.

**Better:**

> **Knowledge and confidence:** One call-centre agent reported that callers "just want to check they've done it right" before submitting (Reported, direct quote, agent interview 2026-08-01). No individual caller has been interviewed directly; this remains Provisional until a caller can confirm it.

### Bad example 3: An intake description of another group treated as direct research

> **Sources:** `0-intake.md`, Q3: client states customers "get frustrated and abandon the form halfway through."
> **Evidence status:** `Observed`

**Why it fails:** The intake records what the client said about customers, not what the researcher directly saw customers do. Labelling this `Observed` misrepresents a secondhand client account as direct evidence, and the skill's Inputs section says explicitly not to treat an intake description of another group as direct user research.

**Better:**

> **Evidence status:** `Reported` (client's account of customer behaviour; not yet independently observed).
> **Differences and open questions:** Add a row naming "confirm abandonment and its cause with customers directly" as evidence needed, owner and review date, and keep the profile `Provisional` until that happens.

### Bad example 4: Flattening disagreement into one confident account

> New and experienced handlers use the same three-step process to triage a claim.

**Why it fails:** Two participants described different sequences — one skips a check step for small claims, the other does not — and the profile presents a single unified account instead of recording the disagreement, breaking method step 5.

**Better:** Record both accounts and the mismatch in the differences-and-open-questions table with an `Conflicting` evidence status, an owner, and the evidence needed to resolve it (see `UP-001` above), rather than picking one version to sound confident.

### Bad example 5: Marking a profile reviewed without a validation plan

> **Evidence status:** `Reviewed`

...with no validation plan, no user-confirmation entries, and no name of anyone who actually checked the content.

**Why it fails:** The quality gate says a profile is `Provisional` unless relevant users or direct evidence have checked it, and method step 6 requires a validation plan naming who or what evidence would confirm it. Writing `Reviewed` without that record asserts a check that did not happen.

**Better:** Keep the status `Provisional`, add a validation plan (who will check it, using which task or evidence, and by when), and only move to a confirmed status once the user-confirmation table has an actual entry.

### Bad example 6: Inferring a permission from a responsibility

> Because branch managers approve refunds over £200, they should be given admin rights in the new refund system.

**Why it fails:** The profile correctly records a business responsibility (approving refunds above a threshold), but then jumps to a system-access decision that the profile itself did not establish. Method step 7 says explicitly not to infer permissions from responsibilities — that is a separate decision for the product owner.

**Better:**

> **Responsibilities:** Approves refunds over £200 (Recorded, finance process document).

Leave the access model as an open question for the requirements or design stage, not a conclusion the profile draws on its own.

## One counterexample for each method step

Each item below is a `Draft - not usable` fragment that fails one step in the skill's method. A real profile can fail more than one step at once; these are separated to make each rule easy to recognise.

### Step 1: Group defined by label, not shared work

> **Draft - not usable:** "Tech-savvy users" versus "non-tech-savvy users."

**Why it counters step 1:** Neither label is grounded in a shared task, tool or working circumstance; it substitutes a vague self-assessment category for evidence of what the group actually does.

**Correction:** Define the group by what was actually observed or reported — for example, "people who have used the supplier portal before" versus "people submitting their first order through it" — and only if that distinction changed their behaviour in the evidence collected.

### Step 2: Goal recorded with no task, steps, tools or context behind it

> **Draft - not usable:** "Goal in the current process: complete their claim quickly." Every other field in the template is left blank.

**Why it counters step 2:** A goal alone is not the required record. Step 2 asks for responsibilities, a recent concrete task, current steps, tools, workarounds, handoffs, frequency, devices, interruptions, knowledge and support needs — a single unsupported goal statement gives a later story-writer nothing to build acceptance criteria from.

**Correction:** Walk the group through one recent, identifiable occasion and record what actually happened at each step, as in `UP-001` and `UP-002` above, not just the outcome they wanted.

### Step 3: Affected non-users left out of the register

> **Draft - not usable:** The profile register lists only the rota system's direct users (managers who build the rota) and omits the payroll team who reconcile its monthly export, even though the intake names the export as in scope.

**Why it counters step 3:** The payroll team is affected by the outcome even though they never open the rota system. Leaving them out of the register hides a stakeholder whose needs could invalidate a later requirement.

**Correction:** Add a profile for the affected non-user group, as in `UP-003` above, and register it alongside the direct-user profiles rather than treating "user" as the only category worth recording.

### Step 4: Claims left unlabelled, with no source location

> **Draft - not usable:** "Handlers find the current queue view frustrating and want a better one."

**Why it counters step 4:** No evidence label, no source, and no note of who could confirm or correct it. A reader cannot tell whether this was said in an interview, observed directly, or assumed by the person writing the profile.

**Correction:** "One handler described the queue view as showing claims in the wrong order, which made it hard to see which needed a same-day response (Reported, direct paraphrase, Jordan M., 2026-08-12 transcript)." Every material claim needs its own label and source, not one blanket label for the whole profile.

### Step 5: A meaningful difference flattened instead of recorded

> **Draft - not usable:** "All pickers rely on the scanner's icon-based prompts." Recorded as a single confident sentence with no distinction between shifts, sites or staff groups.

**Why it counters step 5:** The supervisor's account distinguished agency staff from permanent staff, and that difference was never independently confirmed. Collapsing it into one sentence about "all pickers" hides a difference that might need its own profile variant.

**Correction:** Record the distinction and its evidence status separately, as in `UP-002`'s differences-and-open-questions row, instead of generalising to the whole group.

### Step 6: No validation plan before the profile is used

> **Draft - not usable:** A complete-looking profile with responsibilities, goals and current steps all filled in, but no validation plan and no user-confirmation entries anywhere in the document.

**Why it counters step 6:** However detailed the record looks, nothing says who would check it, against what evidence, or by when. A story or requirement writer reading this profile has no way to know it is unconfirmed.

**Correction:** Add a validation plan naming a specific person or evidence source and a target date, even if the answer is currently "not yet scheduled" — an explicit gap is better than a silent one.

### Step 7: Register left stale, or a permission inferred from it

> **Draft - not usable:** The profile register still shows "Linked stories: —" for a profile that now has three accepted stories, and a separate note says the profile's users "should have edit access" to a record because they are described as responsible for it.

**Why it counters step 7:** Step 7 requires updating the register and linking later stories, and explicitly says not to infer permissions from responsibilities. This fragment does neither: the register is out of date, and it draws an access conclusion the research never established.

**Correction:** Update the profile register's "Linked stories" column as each story is written, and leave any permission or access decision to the requirements or design stage, referencing the responsibility as evidence rather than as a decision.

## Review prompts

Use these questions before treating a profile as ready to inform a story or requirement:

- Is the group defined by shared work, tools or circumstances that the evidence actually shows, or by a label nobody checked?
- Does every material claim carry an evidence label and a source location, and could the named person actually confirm it if asked?
- Who is affected by this outcome without using the system directly, and are they in the register?
- Where two sources disagreed, is that disagreement still visible, or was it smoothed into one confident account?
- Does the profile name who or what evidence would confirm it, and by when, rather than assuming it is already validated?
- Does anything in the profile quietly decide a permission, an interface choice, or a solution rather than recording a need?
- If the only source for a claim is a client's own description of someone else's group, does the profile say so, instead of treating it as direct research?

## Sources consulted

- [GOV.UK: Learning about users and their needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs) - researching current work, barriers and shared user needs before specifying a solution.
- [GOV.UK: Finding user research participants](https://www.gov.uk/service-manual/user-research/find-user-research-participants) - including different user groups and people affected by an outcome, not only its direct users.
- [ONS: User personas](https://service-manual.ons.gov.uk/content/writing-for-users/user-personas) - grouping users by differing knowledge and tasks rather than by assumed demographic labels.
- Source paper: `.agents/source/journal.pdf`, Section 4.3 and Appendix C.2.
