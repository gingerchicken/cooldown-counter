# NASA-style requirement examples

These examples are teaching material for the [write-requirements skill](./SKILL.md). They use a fictional "Riverside Library" loan-renewal delivery so the gate, traceability and MoSCoW fields can be shown filled in; they are not evidence for a real project and must not be copied into `requirements.md` as if they were. Each uses the exact 19-check gate and field set from `3-requirements/requirements.md`.

## Example 1: Functional requirement that passes the full gate

**`FR-001` - Renew an eligible loan online**

**Type:** `Functional`   **Version and status:** `1.0 - Approved`

**Statement:** The Library Loan Service **shall** extend the due date of an eligible loan to the next permitted due date when the member submits a renewal request for that loan.

**Rationale:** Online renewal removes the need for a branch visit, the most frequent complaint in Intake Interview 01 (12 of 15 members).

**Source and evidence:** Intake Interview 01 (2026-01-14); Example Mapping session 2026-02-11.

**Linked user stories:** `../2-user-stories/US-003-renew-eligible-loan.md`

**Linked rules and examples:** Rule R-014 - "An eligible loan is an active loan with no reservation from another member and under the renewal limit" (Example Mapping session 2026-02-11).

**Dependencies:** Existing member authentication; reservation-record interface `INT-002`.

**Acceptance condition:** Given a loan that is active, unreserved by another member, and under the renewal limit, when the member requests renewal, then the due date moves to the next permitted due date and the new date is shown. Given the loan fails any one of those conditions, when renewal is requested, then the due date is unchanged and the specific reason is shown.

**Verification method and evidence:** Test - automated suite `loan-renewal.spec`, covering the eligible, reserved-by-another-member and limit-reached cases; evidence retained as CI run `TC-014`.

**MoSCoW for Release 1.0:** `Must Have`   **Priority status:** `Confirmed`

**Priority rationale:** Without it, every renewal still requires a branch visit; no tolerable workaround exists for Release 1.0.

**Priority decision-maker and date:** Branch Services Lead, 2026-03-10.

**Open values or assumptions:** None outstanding.

| Check | Result | Evidence |
| --- | --- | --- |
| `shall`/`will`/`should` used correctly | `Pass` | Binding obligation uses `shall`; no fact or goal wording. |
| Clear responsible subject, active voice | `Pass` | Subject is "The Library Loan Service"; active voice throughout. |
| One subject, one predicate, one `shall`, one obligation | `Pass` | Single sentence, single outcome: the due-date extension. |
| Clear, unambiguous, concise, simple | `Pass` | "Eligible loan" is a defined term (Rule R-014), not left open. |
| Grammatically correct | `Pass` | Reviewed for grammar, spelling, punctuation. |
| Positive wording, no hidden negation | `Pass` | States the positive outcome directly. |
| Consistent project terminology | `Pass` | "Eligible loan", "renewal request", "due date" match the story and glossary. |
| Correct level and document section | `Pass` | Filed under Functional, under the loan-renewal capability. |
| States the need, not an unjustified implementation choice | `Pass` | No database, API, or control named; interaction stays open. |
| No operator task or procedure | `Pass` | Describes system behaviour, not a staff or member procedure. |
| Units, limits, tolerances, boundaries stated where relevant | `Pass` | Eligibility boundary is explicit via the linked rule. |
| Relevant requirement areas considered | `Pass` | Functional and interface covered; performance moved to `NFR-002`; no safety/security area applies. |
| Interface, maintainability, error handling, recovery defined | `Pass` | Ineligible-case behaviour (no change, reason shown) is in the acceptance condition. |
| Necessary for a linked need/goal/story/constraint | `Pass` | Traced to `US-003` and the Intake Interview 01 complaint. |
| Correct, feasible, not contradicted | `Pass` | Checked against existing loan and reservation records; no conflict found. |
| Verifiable with named evidence and pass condition | `Pass` | Automated suite gives a pass/fail result per eligibility case. |
| Avoids unverifiable words | `Pass` | No use of "fast", "easy", "appropriate", etc. |
| Data and `don't care` conditions explicit | `Pass` | Zero-reservation and at-limit cases are both named; nothing implicit. |
| Bidirectionally traceable | `Pass` | Links up to `US-003` and the interview; links down to test evidence `TC-014`. |

## Example 2: Quality requirement with a properly captured TBR

**`NFR-002` - Renewal outcome response time**

**Type:** `Quality`   **Version and status:** `0.9 - Reviewed`

**Statement:** The Library Loan Service **shall** display the renewal outcome to the member within `TBR-004` seconds, measured at the 95th percentile of renewal requests submitted over the library's standard public network.

**Rationale:** A slow confirmation would undermine trust in online renewal, but the client has not yet confirmed an acceptable wait relative to the current branch-desk experience.

**Source and evidence:** Example Mapping session 2026-02-11; performance baseline pending.

**Linked user stories:** `../2-user-stories/US-003-renew-eligible-loan.md`

**Dependencies:** `FR-001` must complete before an outcome exists to display; branch network conditions.

**Acceptance condition:** Given a renewal request submitted over the library's standard public network, when the outcome is returned, then at least 95% of requests display the outcome within the confirmed `TBR-004` threshold.

**Verification method and evidence:** Analysis - baseline measurement session (10 members, standard network), followed by an automated performance test once `TBR-004` is confirmed.

**MoSCoW for Release 1.0:** `Should Have`   **Priority status:** `Provisional`

**Priority rationale:** A slow confirmation reduces trust but does not block the renewal itself; a loading indicator is a tolerable interim workaround.

**Priority decision-maker and date:** Provisional - Product Owner, pending client confirmation by 2026-04-01.

**Open values or assumptions:** `TBR-004` - exact response-time threshold in seconds. Reason: client has not confirmed an acceptable wait relative to the branch-desk experience. Resolution: run the baseline measurement session and agree a threshold at the 2026-04-01 requirements review. Owner: Product Owner.

**Gate notes:** This still passes the "verifiable" and "avoids unverifiable words" checks because the *structure* of the measurement (95th percentile, named network condition, named threshold ID) is fixed even though the number is open. A statement that instead said "shall respond quickly" would fail those checks: `TBR-004` is a tracked placeholder with an owner and date, "quickly" is not. Because a value is still open, status stays `Reviewed`, not `Approved`, per the gate in `3-requirements/README.md`.

## Example 3: Constraint requirement

**`CON-001` - Authenticated renewal only**

**Type:** `Constraint`   **Version and status:** `1.0 - Approved`

**Statement:** The Library Loan Service **shall** refuse a renewal transaction unless the request is authenticated with a valid membership card number, in accordance with the Library Authority's Data Protection and Membership Policy v3 (2025), Section 4.2.

**Rationale:** This is imposed by policy, not a discretionary design choice.

**Source and evidence:** Library Authority Data Protection and Membership Policy v3 (2025), Section 4.2.

**Linked user stories:** `../2-user-stories/US-003-renew-eligible-loan.md` (shared constraint; other authenticated-transaction stories may also link to it).

**Dependencies:** Existing member authentication capability.

**Acceptance condition:** Given a renewal request without a valid authenticated membership card number, when it is submitted, then the transaction is refused and no due date changes.

**Verification method and evidence:** Inspection - policy compliance review confirming authentication runs before every renewal; Test - automated test for the unauthenticated case.

**MoSCoW for Release 1.0:** `Must Have`   **Priority status:** `Confirmed`

**Priority rationale:** A legal/policy constraint; no acceptable workaround or omission exists.

**Priority decision-maker and date:** Legal/Compliance sign-off, 2026-02-20.

**Open values or assumptions:** None outstanding.

**Gate notes:** Naming "membership card number" does not fail the "states the need, not an unjustified implementation choice" check, because the cited policy itself names that identifier; it is a sourced constraint, not an invented implementation detail. Contrast this with Example 4, where "PostgreSQL audit table" is an invented implementation choice with no such source.

## Example 4: A bad requirement and its correction

**Bad statement:** "The system should have a fast and user-friendly renewal button that renews the loan, sends a confirmation email, and logs the transaction in the PostgreSQL audit table."

| Check | Result | Why |
| --- | --- | --- |
| `shall`/`will`/`should` used correctly | `Fail` | Uses `should` for a binding obligation; that wording is reserved for a goal, not a requirement. |
| One subject, one predicate, one `shall`, one obligation | `Fail` | Bundles three obligations (renew, email, log) into one statement. |
| States the need, not an unjustified implementation choice | `Fail` | "Button" and "PostgreSQL audit table" prescribe an interface control and a storage technology that no source requires. |
| Avoids unverifiable words | `Fail` | "Fast" and "user-friendly" have no agreed measure. |
| Clear responsible subject | `Fail` | "The system" does not name the specific responsible component. |

**Correction:** Split by responsible subject and obligation, remove the invented implementation detail, and replace the vague adjectives with a measurable statement or drop them if no real need supports them:

- `FR-005`: The Library Loan Service **shall** renew an eligible loan when the member submits a renewal request. *(Functional outcome; duplicates `FR-001`'s intent here only because this is a teaching example - in a real document this obligation would already exist as `FR-001` and would not be re-created.)*
- `FR-006`: The Notification Service **shall** send a renewal confirmation email to the member's registered email address when a renewal succeeds. *(Separate responsible subject, separate obligation.)*
- `NFR-006`: The Library Loan Service **shall** record a renewal transaction in the audit log, including the member ID, loan ID, previous due date and new due date, within 5 seconds of the renewal completing. *(States the auditable need and its content and timing; leaves the storage technology open unless a real constraint requires PostgreSQL specifically.)*

There is no requirement for the "fast and user-friendly button": if usability genuinely matters here, it belongs in the linked story's acceptance criteria with an agreed, observable measure, not as an unverifiable adjective inside a `shall` statement.
