# Cooldown Counter requirements

This document preserves the discovery baseline. Implementation decisions and
the user-selected multi-fleet/history model are recorded in
[the ER model](../docs/data-model.md). Executable acceptance evidence is described
in [the testing guide](../docs/testing.md); candidate wording is not itself a
claim that a production acceptance test passed.

This is the canonical candidate list for **Cooldown Counter design baseline
v0.1**, extracted on 2026-11-12. No requirement is Reviewed or Approved.

Read the [story index](../2-user-stories/README.md),
[source and assumptions](../docs/design/README.md),
[decision register](open-questions.md) and [coverage review](coverage.md).

## Record contract

Every record below inherits version **0.1**, author **Assistant**, creation and
last-change date **2026-11-12**, named delivery **Cooldown Counter design baseline
v0.1**, decision-maker **Unassigned - product owner nomination required**, and
change history **Initial design extraction; no accepted revision**.

Every MoSCoW category is **Provisional**, assigned by the assistant on that date.
The linked story records its reason, omission consequence and workaround.
Acceptance conditions are proposed checks, not executed product tests.
Verification evidence is **Not executed against an implementation** unless a
separate record says otherwise. Source line inspection supports extraction only.

`Visible` means represented by the design; `Logic` means prototype-code evidence;
`Proposed` means a gap-driven safeguard or correction. None proves official CS2
rules. Each source range links the unchanged supplied HTML. The actor is the
[design-derived fleet operator](../1-user-profiles/UP-001-fleet-operator.md).

Each story has one Example Mapping rule set BR-NNN and one worked example EX-NNN.
The BR anchor indexes its linked atomic RQ obligations, which are the actual rules.
Mapping context explains their shared purpose; it is not a separate business rule.
Boundary cases and unanswered questions are part of the handoff. These examples
are proposed fixtures; they are not interview reports or observed real events.

## Requirement writing gate

The local write-requirements skill applies NASA Appendix C as a writing
checklist, not a certification. A structural check verifies unique IDs, one
`shall` per statement, nonempty rationale, sources, story/rule/example links,
acceptance conditions and verification methods. Human review checks atomicity,
terminology, level and evidence separation. Necessity, correctness against real
game policy, feasibility, release completeness and any linked decision remain
unconfirmed. Missing values stay in the question register; no performance,
capacity, retention, availability or accessibility conformance threshold is
invented. Candidate statements with unresolved conditions fail the approval gate.

## Terminology and scope

- **Operator**: an inferred trusted user of the tracker, not a Steam account.
- **Tracked account**: a Steam account identified by a SteamID and a display tag.
- **Observation**: entered evidence about one cooldown. Repeated observations
  versus new cooldown events remain a decision, not an assumed equivalence.
- **Remaining duration**: time left when the operator looked; distinct from total.
- **Predicted total**: the model's duration for the selected step, not a verified
  game penalty. It must not overwrite original observed evidence.
- **Stored step**: the last replay-assigned state. **Decayed state**: its state
  after clean time. **Next step**: the next offence's state after advancement.
- **Ladder**: an ordered sequence of duration steps for one offence type.
- **Clean window**: the period that causes a configured reduction in ladder state.
- **Anchor**: the timestamp from which clean time is counted.
- **Active**, **clear**, calendar entry counts and representative fleet forecasts
  have conflicting prototype interpretations. Linked questions govern them.
- **History** is recorded evidence plus traceable estimates. Whether later rule
  changes revise old estimates is unresolved.

The conceptual data model shown by the design has SteamAccount, Cooldown and
CooldownTypes. It distinguishes initial_recorded_date, recording_duration,
predicted_total_duration and account/type relationships. Field names do not
resolve time semantics, persistence, ownership, versioning or a final schema.
No new admin role, account CRUD, import, export, notification, official API
integration, signup, MFA or billing feature is approved by this inventory.

## Counts

65 user stories and 363 atomic candidate requirements.

| Evidence | Requirements |
| --- | ---: |
| Visible | 140 |
| Logic | 122 |
| Proposed | 101 |

## US-001 - Sign in to restricted records

Parent: [US-001](../2-user-stories/US-001-obs-sign-in.md).

<a id="br-001"></a>

**BR-001 - atomic rule set:** [RQ-001](#rq-001), [RQ-002](#rq-002), [RQ-003](#rq-003), [RQ-004](#rq-004), [RQ-005](#rq-005), [RQ-006](#rq-006), [RQ-007](#rq-007), [RQ-008](#rq-008), [RQ-009](#rq-009), [RQ-010](#rq-010), [RQ-011](#rq-011), [RQ-012](#rq-012).

**Mapping context:** The login copy restricts access to fleet operators; the demo bypass is not a production access policy.

<a id="ex-001"></a>

**EX-001 - proposed worked example:**

- Given An operator has provisioned credentials.
- When The operator submits valid credentials.
- Then The permitted application view opens.
- Boundary or exception: Missing credentials remain on sign-in.
- Boundary or exception: Invalid credentials are a separate production failure case.
- Boundary or exception: Demo acceptance of any credentials is not carried into product scope.

**Unanswered mapping questions:** [Q-025](open-questions.md#q-025), [Q-027](open-questions.md#q-027), [Q-048](open-questions.md#q-048)

### RQ-001

**Statement:** The system shall present a sign-in view to a signed-out visitor.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The login copy restricts access to fleet operators; the demo bypass is not a production access policy.
- Source lines: [2252-2254](../docs/design/cooldown-counter.html#L2252), [3563-3564](../docs/design/cooldown-counter.html#L3563).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: With no valid session, opening the application shows the sign-in view.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-002

**Statement:** The system shall identify restricted access as available to fleet operators on the sign-in view.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The login copy restricts access to fleet operators; the demo bypass is not a production access policy.
- Source lines: [2266-2266](../docs/design/cooldown-counter.html#L2266).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Inspect the sign-in view and find the fleet-operator restriction text.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-003

**Statement:** The system shall provide a username input on the sign-in view.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The login copy restricts access to fleet operators; the demo bypass is not a production access policy.
- Source lines: [2269-2272](../docs/design/cooldown-counter.html#L2269).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: The visitor can enter a username independently of the password.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-004

**Statement:** The system shall mask entered password characters on the sign-in view.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The login copy restricts access to fleet operators; the demo bypass is not a production access policy.
- Source lines: [2274-2277](../docs/design/cooldown-counter.html#L2274).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Typing a password displays masking characters rather than its text.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-005

**Statement:** The system shall supply credential autocomplete hints on the sign-in inputs.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The login copy restricts access to fleet operators; the demo bypass is not a production access policy.
- Source lines: [2271-2271](../docs/design/cooldown-counter.html#L2271), [2276-2276](../docs/design/cooldown-counter.html#L2276).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Inspect username autocomplete=username and password autocomplete=current-password.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-006

**Statement:** The system shall submit the sign-in attempt from the Sign in control.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The login copy restricts access to fleet operators; the demo bypass is not a production access policy.
- Source lines: [2283-2283](../docs/design/cooldown-counter.html#L2283), [3572-3572](../docs/design/cooldown-counter.html#L3572).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Clicking Sign in invokes one attempt with the entered credentials.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-007

**Statement:** The system shall submit the sign-in attempt when Enter is pressed in a credential input.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The login copy restricts access to fleet operators; the demo bypass is not a production access policy.
- Source lines: [2271-2271](../docs/design/cooldown-counter.html#L2271), [2276-2276](../docs/design/cooldown-counter.html#L2276), [3571-3571](../docs/design/cooldown-counter.html#L3571).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Enter in either username or password invokes a sign-in attempt.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-008

**Statement:** The system shall verify submitted credentials at the authoritative authentication boundary before granting restricted access.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The login copy restricts access to fleet operators; the demo bypass is not a production access policy.
- Source lines: [2266-2266](../docs/design/cooldown-counter.html#L2266), [3554-3559](../docs/design/cooldown-counter.html#L3554).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: An invalid credential pair cannot access protected records even if client state is altered.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-025](open-questions.md#q-025)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-009

**Statement:** The system shall report invalid production credentials without revealing whether the username exists.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The login copy restricts access to fleet operators; the demo bypass is not a production access policy.
- Source lines: [2279-2281](../docs/design/cooldown-counter.html#L2279), [3554-3559](../docs/design/cooldown-counter.html#L3554).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Unknown-user and wrong-password attempts have the same public failure meaning.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-025](open-questions.md#q-025)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-010

**Statement:** The system shall clear the in-memory password input after successful sign-in.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The login copy restricts access to fleet operators; the demo bypass is not a production access policy.
- Source lines: [3559-3559](../docs/design/cooldown-counter.html#L3559).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: After a successful sign-in the password input value retained by the login view is empty.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-011

**Statement:** The system shall distinguish an unavailable authentication service from rejected credentials.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Operators need the correct recovery path when the service cannot check a password.
- Source lines: [3554-3559](../docs/design/cooldown-counter.html#L3554).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Simulate an authentication service failure; show service unavailability rather than claiming the supplied credentials were rejected, with no restricted access granted.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-025](open-questions.md#q-025), [Q-048](open-questions.md#q-048)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-012

**Statement:** The system shall retain the entered username after a recoverable sign-in service failure.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Retrying the unavailable service does not require reconstructing an already supplied identity.
- Source lines: [3554-3559](../docs/design/cooldown-counter.html#L3554), [3565-3570](../docs/design/cooldown-counter.html#L3565).
- Trace: [US-001](../2-user-stories/US-001-obs-sign-in.md), [BR-001](#br-001), [EX-001](#ex-001).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Enter operator-name and simulate a failed sign-in request; the username remains editable for the next attempt.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-025](open-questions.md#q-025)
- Change history: 2026-11-12 - Initial design extraction.

## US-002 - Correct missing login inputs

Parent: [US-002](../2-user-stories/US-002-obs-login-errors.md).

<a id="br-002"></a>

**BR-002 - atomic rule set:** [RQ-013](#rq-013), [RQ-014](#rq-014), [RQ-015](#rq-015), [RQ-016](#rq-016).

**Mapping context:** The prototype contains three explicit missing-input messages and clears them on editing.

<a id="ex-002"></a>

**EX-002 - proposed worked example:**

- Given The sign-in form is visible.
- When The visitor submits an incomplete credential pair.
- Then The corresponding missing-input message is displayed.
- Boundary or exception: Both empty.
- Boundary or exception: Only username missing.
- Boundary or exception: Only password missing.
- Boundary or exception: Username containing only whitespace.

**Unanswered mapping questions:** None identified for this narrow obligation.

### RQ-013

**Statement:** The system shall report both credentials as required when both sign-in inputs are empty.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The prototype contains three explicit missing-input messages and clears them on editing.
- Source lines: [3557-3557](../docs/design/cooldown-counter.html#L3557).
- Trace: [US-002](../2-user-stories/US-002-obs-login-errors.md), [BR-002](#br-002), [EX-002](#ex-002).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Submit empty username and password; both required fields are identified.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-014

**Statement:** The system shall report a required username when the username is blank after trimming.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The prototype contains three explicit missing-input messages and clears them on editing.
- Source lines: [3555-3557](../docs/design/cooldown-counter.html#L3555).
- Trace: [US-002](../2-user-stories/US-002-obs-login-errors.md), [BR-002](#br-002), [EX-002](#ex-002).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Submit spaces as username and a nonempty password; username-required message appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-015

**Statement:** The system shall report a required password when the password input is empty.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The prototype contains three explicit missing-input messages and clears them on editing.
- Source lines: [3556-3557](../docs/design/cooldown-counter.html#L3556).
- Trace: [US-002](../2-user-stories/US-002-obs-login-errors.md), [BR-002](#br-002), [EX-002](#ex-002).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Submit a nonblank username and empty password; password-required message appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-016

**Statement:** The system shall clear the displayed missing-input error when either credential input changes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The prototype contains three explicit missing-input messages and clears them on editing.
- Source lines: [3569-3570](../docs/design/cooldown-counter.html#L3569).
- Trace: [US-002](../2-user-stories/US-002-obs-login-errors.md), [BR-002](#br-002), [EX-002](#ex-002).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: After a missing-input error, edit either field; that error is removed.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-003 - Resume a valid session

Parent: [US-003](../2-user-stories/US-003-obs-session-restore.md).

<a id="br-003"></a>

**BR-003 - atomic rule set:** [RQ-017](#rq-017), [RQ-018](#rq-018), [RQ-019](#rq-019).

**Mapping context:** The prototype restores a local flag; production restoration must use authoritative session validity.

<a id="ex-003"></a>

**EX-003 - proposed worked example:**

- Given A previously signed-in visitor returns.
- When The application checks the existing session.
- Then A valid session resumes access and an invalid session requires sign-in.
- Boundary or exception: Expired session.
- Boundary or exception: Unavailable client storage.
- Boundary or exception: Revoked session.

**Unanswered mapping questions:** [Q-026](open-questions.md#q-026)

### RQ-017

**Statement:** The system shall restore restricted access only for a session accepted by the authoritative authentication boundary.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype restores a local flag; production restoration must use authoritative session validity.
- Source lines: [3132-3136](../docs/design/cooldown-counter.html#L3132).
- Trace: [US-003](../2-user-stories/US-003-obs-session-restore.md), [BR-003](#br-003), [EX-003](#ex-003).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: A valid returning session opens the permitted view; a client flag without a valid server session does not.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-026](open-questions.md#q-026)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-018

**Statement:** The system shall require sign-in when the returning session is invalid.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype restores a local flag; production restoration must use authoritative session validity.
- Source lines: [3132-3136](../docs/design/cooldown-counter.html#L3132), [3563-3564](../docs/design/cooldown-counter.html#L3563).
- Trace: [US-003](../2-user-stories/US-003-obs-session-restore.md), [BR-003](#br-003), [EX-003](#ex-003).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Return with an expired or revoked session; records are not shown before sign-in.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-026](open-questions.md#q-026)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-019

**Statement:** The system shall remain able to sign in when optional browser storage is unavailable.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype restores a local flag; production restoration must use authoritative session validity.
- Source lines: [3133-3133](../docs/design/cooldown-counter.html#L3133), [3558-3559](../docs/design/cooldown-counter.html#L3558).
- Trace: [US-003](../2-user-stories/US-003-obs-session-restore.md), [BR-003](#br-003), [EX-003](#ex-003).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: With localStorage access throwing, a valid authoritative sign-in still succeeds for the current session.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-004 - End the operator session

Parent: [US-004](../2-user-stories/US-004-obs-sign-out.md).

<a id="br-004"></a>

**BR-004 - atomic rule set:** [RQ-020](#rq-020), [RQ-021](#rq-021), [RQ-022](#rq-022), [RQ-023](#rq-023), [RQ-024](#rq-024).

**Mapping context:** The sidebar provides sign-out but a client-only flag cannot invalidate a production session.

<a id="ex-004"></a>

**EX-004 - proposed worked example:**

- Given An operator is signed in.
- When The operator signs out.
- Then The sign-in view is displayed and the former session cannot access protected records.
- Boundary or exception: Another tab shares the session.
- Boundary or exception: Storage removal fails.
- Boundary or exception: An unfinished report exists.

**Unanswered mapping questions:** [Q-026](open-questions.md#q-026), [Q-028](open-questions.md#q-028)

### RQ-020

**Statement:** The system shall expose a Sign out control in the signed-in navigation.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The sidebar provides sign-out but a client-only flag cannot invalidate a production session.
- Source lines: [2337-2337](../docs/design/cooldown-counter.html#L2337).
- Trace: [US-004](../2-user-stories/US-004-obs-sign-out.md), [BR-004](#br-004), [EX-004](#ex-004).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Each signed-in view presents the Sign out control.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-021

**Statement:** The system shall return to the sign-in view after sign-out.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The sidebar provides sign-out but a client-only flag cannot invalidate a production session.
- Source lines: [3573-3575](../docs/design/cooldown-counter.html#L3573), [3563-3564](../docs/design/cooldown-counter.html#L3563).
- Trace: [US-004](../2-user-stories/US-004-obs-sign-out.md), [BR-004](#br-004), [EX-004](#ex-004).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Invoke Sign out; the login screen replaces the restricted application.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-022

**Statement:** The system shall clear sign-in credential fields after sign-out.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The sidebar provides sign-out but a client-only flag cannot invalidate a production session.
- Source lines: [3575-3575](../docs/design/cooldown-counter.html#L3575).
- Trace: [US-004](../2-user-stories/US-004-obs-sign-out.md), [BR-004](#br-004), [EX-004](#ex-004).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: After sign-out the username and password inputs are empty.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-023

**Statement:** The system shall clear displayed login validation errors after sign-out.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The sidebar provides sign-out but a client-only flag cannot invalidate a production session.
- Source lines: [3575-3575](../docs/design/cooldown-counter.html#L3575).
- Trace: [US-004](../2-user-stories/US-004-obs-sign-out.md), [BR-004](#br-004), [EX-004](#ex-004).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Sign out and inspect the login form; no previous login error remains.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-024

**Statement:** The system shall invalidate the authenticated server session on sign-out.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The sidebar provides sign-out but a client-only flag cannot invalidate a production session.
- Source lines: [3573-3575](../docs/design/cooldown-counter.html#L3573).
- Trace: [US-004](../2-user-stories/US-004-obs-sign-out.md), [BR-004](#br-004), [EX-004](#ex-004).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Reusing the former session for a protected request fails after logout.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-026](open-questions.md#q-026)
- Change history: 2026-11-12 - Initial design extraction.

## US-005 - Limit records to permitted operators

Parent: [US-005](../2-user-stories/US-005-obs-authorization.md).

<a id="br-005"></a>

**BR-005 - atomic rule set:** [RQ-025](#rq-025), [RQ-026](#rq-026), [RQ-027](#rq-027), [RQ-028](#rq-028), [RQ-029](#rq-029), [RQ-030](#rq-030).

**Mapping context:** The design promises restricted records but contains no server access boundary or membership definition.

<a id="ex-005"></a>

**EX-005 - proposed worked example:**

- Given Two visitors have different agreed fleet permissions.
- When Each requests protected data or submits a mutation directly.
- Then The authoritative boundary applies the agreed permission model.
- Boundary or exception: Signed-out request.
- Boundary or exception: Other fleet identifier.
- Boundary or exception: Unauthorized rule edit.

**Unanswered mapping questions:** [Q-027](open-questions.md#q-027)

### RQ-025

**Statement:** The system shall enforce the agreed fleet read permission on each protected data request.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The design promises restricted records but contains no server access boundary or membership definition.
- Source lines: [2266-2266](../docs/design/cooldown-counter.html#L2266), [3640-3640](../docs/design/cooldown-counter.html#L3640).
- Trace: [US-005](../2-user-stories/US-005-obs-authorization.md), [BR-005](#br-005), [EX-005](#ex-005).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: A request outside the visitor's permitted fleet cannot retrieve account or cooldown records.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-027](open-questions.md#q-027)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-026

**Statement:** The system shall enforce the agreed fleet write permission on each observation mutation.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The design promises restricted records but contains no server access boundary or membership definition.
- Source lines: [2266-2266](../docs/design/cooldown-counter.html#L2266), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-005](../2-user-stories/US-005-obs-authorization.md), [BR-005](#br-005), [EX-005](#ex-005).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: An operator without mutation permission cannot add or change a cooldown through a direct request.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-027](open-questions.md#q-027)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-027

**Statement:** The system shall enforce the agreed configuration permission on each offence or transition-rule mutation.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The design promises restricted records but contains no server access boundary or membership definition.
- Source lines: [2266-2266](../docs/design/cooldown-counter.html#L2266), [3459-3471](../docs/design/cooldown-counter.html#L3459), [3536-3548](../docs/design/cooldown-counter.html#L3536).
- Trace: [US-005](../2-user-stories/US-005-obs-authorization.md), [BR-005](#br-005), [EX-005](#ex-005).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: An unauthorized direct request cannot change a shared ladder or decay setting.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-027](open-questions.md#q-027)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-028

**Statement:** The system shall protect session-authenticated mutations against cross-site request forgery.

- Version: 0.1. Type: Constraint. Evidence: Proposed.
- Rationale: The design promises restricted records but contains no server access boundary or membership definition.
- Source lines: [3554-3559](../docs/design/cooldown-counter.html#L3554), [3573-3575](../docs/design/cooldown-counter.html#L3573), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-005](../2-user-stories/US-005-obs-authorization.md), [BR-005](#br-005), [EX-005](#ex-005).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: A mutation submitted without the session model's valid request-forgery protection is rejected.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-029

**Statement:** The system shall exclude passwords and session credentials from report drafts.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: The design promises restricted records but contains no server access boundary or membership definition.
- Source lines: [3136-3143](../docs/design/cooldown-counter.html#L3136), [3554-3559](../docs/design/cooldown-counter.html#L3554).
- Trace: [US-005](../2-user-stories/US-005-obs-authorization.md), [BR-005](#br-005), [EX-005](#ex-005).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Inspect a saved or recoverable report draft and find no password or session credential.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-030

**Statement:** The system shall render operator-supplied account and offence text as content without executing it.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Names, notes and short codes are displayed throughout the restricted workspace.
- Source lines: [2720-2722](../docs/design/cooldown-counter.html#L2720), [2973-2991](../docs/design/cooldown-counter.html#L2973), [3538-3545](../docs/design/cooldown-counter.html#L3538).
- Trace: [US-005](../2-user-stories/US-005-obs-authorization.md), [BR-005](#br-005), [EX-005](#ex-005).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Save an allowed text value containing HTML-like markup in a note; the rendered value causes no script execution or injected control.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-006 - Navigate the fleet workspace

Parent: [US-006](../2-user-stories/US-006-cal-navigation.md).

<a id="br-006"></a>

**BR-006 - atomic rule set:** [RQ-031](#rq-031), [RQ-032](#rq-032), [RQ-033](#rq-033), [RQ-034](#rq-034), [RQ-035](#rq-035), [RQ-036](#rq-036), [RQ-037](#rq-037), [RQ-038](#rq-038).

**Mapping context:** The design exposes this distinct operator outcome. Reach the view that supports my current task.

<a id="ex-006"></a>

**EX-006 - proposed worked example:**

- Given I am signed in on Calendar.
- When I open Accounts, then hbh_01, then its Accounts breadcrumb.
- Then The correct account detail and account list appear with the active navigation and breadcrumb context.
- Boundary or exception: Accounts remains active in account detail.
- Boundary or exception: The shared report and sign-out actions remain reachable.

**Unanswered mapping questions:** None identified for this narrow obligation.

### RQ-031

**Statement:** The system shall provide a Calendar destination.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Reach the view that supports my current task.
- Source lines: [3258-3264](../docs/design/cooldown-counter.html#L3258).
- Trace: [US-006](../2-user-stories/US-006-cal-navigation.md), [BR-006](#br-006), [EX-006](#ex-006).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: From Accounts, activate Calendar; the cooldown calendar appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-032

**Statement:** The system shall provide an Accounts destination.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Reach the view that supports my current task.
- Source lines: [3258-3264](../docs/design/cooldown-counter.html#L3258).
- Trace: [US-006](../2-user-stories/US-006-cal-navigation.md), [BR-006](#br-006), [EX-006](#ex-006).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: From Calendar, activate Accounts; tracked account rows appear.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-033

**Statement:** The system shall provide a Cooldowns destination.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Reach the view that supports my current task.
- Source lines: [3258-3264](../docs/design/cooldown-counter.html#L3258).
- Trace: [US-006](../2-user-stories/US-006-cal-navigation.md), [BR-006](#br-006), [EX-006](#ex-006).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: From Calendar, activate Cooldowns; the offence-ladder reference appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-034

**Statement:** The system shall identify the active navigation destination.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Reach the view that supports my current task.
- Source lines: [2310-2321](../docs/design/cooldown-counter.html#L2310), [3263-3264](../docs/design/cooldown-counter.html#L3263).
- Trace: [US-006](../2-user-stories/US-006-cal-navigation.md), [BR-006](#br-006), [EX-006](#ex-006).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Activate Calendar; Calendar has the selected navigation treatment while Accounts and Cooldowns do not.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-035

**Statement:** The system shall identify Accounts as active while viewing an account detail.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Reach the view that supports my current task.
- Source lines: [3260-3264](../docs/design/cooldown-counter.html#L3260).
- Trace: [US-006](../2-user-stories/US-006-cal-navigation.md), [BR-006](#br-006), [EX-006](#ex-006).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Open hbh_01 detail; Accounts remains selected in the navigation.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-036

**Statement:** The system shall show the current view title.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Reach the view that supports my current task.
- Source lines: [2362-2362](../docs/design/cooldown-counter.html#L2362), [3639-3639](../docs/design/cooldown-counter.html#L3639).
- Trace: [US-006](../2-user-stories/US-006-cal-navigation.md), [BR-006](#br-006), [EX-006](#ex-006).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Open hbh_01 detail; the title identifies hbh_01.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-037

**Statement:** The system shall show the current view's explanatory subtitle.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Reach the view that supports my current task.
- Source lines: [2363-2363](../docs/design/cooldown-counter.html#L2363), [3640-3640](../docs/design/cooldown-counter.html#L3640).
- Trace: [US-006](../2-user-stories/US-006-cal-navigation.md), [BR-006](#br-006), [EX-006](#ex-006).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Open Calendar; its subtitle explains the difference between recorded spans and predicted step-downs.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-038

**Statement:** The system shall provide an Accounts breadcrumb from account detail.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Reach the view that supports my current task.
- Source lines: [2344-2359](../docs/design/cooldown-counter.html#L2344), [3632-3637](../docs/design/cooldown-counter.html#L3632).
- Trace: [US-006](../2-user-stories/US-006-cal-navigation.md), [BR-006](#br-006), [EX-006](#ex-006).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Open hbh_01 detail and activate its Accounts breadcrumb; the account list appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-007 - Assess fleet totals

Parent: [US-007](../2-user-stories/US-007-cal-fleet-totals.md).

<a id="br-007"></a>

**BR-007 - atomic rule set:** [RQ-039](#rq-039), [RQ-040](#rq-040), [RQ-041](#rq-041).

**Mapping context:** The design exposes this distinct operator outcome. Judge the overall scale and restriction state.

<a id="ex-007"></a>

**EX-007 - proposed worked example:**

- Given Account A has two overlapping active records and account B has expired history.
- When I review the fleet totals.
- Then Accounts is 2, Recorded is 3, and the active figure follows the agreed count unit.
- Boundary or exception: No accounts or observations.
- Boundary or exception: Several active events on one account.
- Boundary or exception: Future start and exact expiry boundary.

**Unanswered mapping questions:** [Q-001](open-questions.md#q-001), [Q-033](open-questions.md#q-033)

### RQ-039

**Statement:** The system shall show the tracked-account total.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Judge the overall scale and restriction state.
- Source lines: [2325-2333](../docs/design/cooldown-counter.html#L2325), [3281-3281](../docs/design/cooldown-counter.html#L3281).
- Trace: [US-007](../2-user-stories/US-007-cal-fleet-totals.md), [BR-007](#br-007), [EX-007](#ex-007).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Load three tracked accounts; the Accounts fleet total is 3.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-040

**Statement:** The system shall show the recorded-cooldown total.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Judge the overall scale and restriction state.
- Source lines: [2325-2333](../docs/design/cooldown-counter.html#L2325), [3283-3283](../docs/design/cooldown-counter.html#L3283).
- Trace: [US-007](../2-user-stories/US-007-cal-fleet-totals.md), [BR-007](#br-007), [EX-007](#ex-007).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Load five observations across three accounts; Recorded is 5.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-041

**Statement:** The system shall show the number of distinct accounts with a currently active cooldown in the fleet On cooldown total.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Judge the overall scale and restriction state.
- Source lines: [3282-3282](../docs/design/cooldown-counter.html#L3282).
- Trace: [US-007](../2-user-stories/US-007-cal-fleet-totals.md), [BR-007](#br-007), [EX-007](#ex-007).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: At time T, give account A two overlapping active cooldowns and account B one expired cooldown; the restricted-account KPI is 1 under the proposed distinct-account definition.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-001](open-questions.md#q-001), [Q-033](open-questions.md#q-033)
- Change history: 2026-11-12 - Initial design extraction.

## US-008 - Find a tracked account

Parent: [US-008](../2-user-stories/US-008-cal-account-filter.md).

<a id="br-008"></a>

**BR-008 - atomic rule set:** [RQ-042](#rq-042), [RQ-043](#rq-043), [RQ-044](#rq-044), [RQ-045](#rq-045), [RQ-046](#rq-046), [RQ-047](#rq-047), [RQ-048](#rq-048), [RQ-049](#rq-049), [RQ-050](#rq-050), [RQ-051](#rq-051), [RQ-052](#rq-052), [RQ-053](#rq-053), [RQ-054](#rq-054).

**Mapping context:** The design exposes this distinct operator outcome. Isolate the account I need to inspect.

<a id="ex-008"></a>

**EX-008 - proposed worked example:**

- Given hbh_1 and hbh_10 are tracked.
- When I search hbh_1 and select its exact account result.
- Then Only the chosen account becomes the account-filter target under the proposed exact-identity behavior.
- Boundary or exception: Mixed-case tag search.
- Boundary or exception: SteamID substring.
- Boundary or exception: Whitespace-only query.
- Boundary or exception: No results.

**Unanswered mapping questions:** [Q-015](open-questions.md#q-015)

### RQ-042

**Statement:** The system shall offer an account selector in the calendar.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Isolate the account I need to inspect.
- Source lines: [2371-2405](../docs/design/cooldown-counter.html#L2371).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Open Calendar; an account-selection control is available above the calendar.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-043

**Statement:** The system shall offer an account selector in the fleet view.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Isolate the account I need to inspect.
- Source lines: [2518-2552](../docs/design/cooldown-counter.html#L2518).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Open Accounts; an account-selection control is available above the account rows.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-044

**Statement:** The system shall search account-selector results by tag without case sensitivity.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Isolate the account I need to inspect.
- Source lines: [3593-3594](../docs/design/cooldown-counter.html#L3593).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: With hbh_01 and other_02 available, search HBH_; only hbh_01 is returned.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-045

**Statement:** The system shall search account-selector results by SteamID substring.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Isolate the account I need to inspect.
- Source lines: [3593-3594](../docs/design/cooldown-counter.html#L3593).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: With SteamIDs 76561198012345678 and 76561198099999999, search 123456; only the first account is returned.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-046

**Statement:** The system shall trim surrounding whitespace in account-selector search.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Isolate the account I need to inspect.
- Source lines: [3593-3593](../docs/design/cooldown-counter.html#L3593).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Search for "  HBH_01  "; the same results appear as for hbh_01.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-047

**Statement:** The system shall show the tag for each account-selector result.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Isolate the account I need to inspect.
- Source lines: [2394-2395](../docs/design/cooldown-counter.html#L2394), [2541-2542](../docs/design/cooldown-counter.html#L2541).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Open the account selector; the hbh_01 result displays the hbh_01 tag.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-048

**Statement:** The system shall show the SteamID for each account-selector result.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Isolate the account I need to inspect.
- Source lines: [2395-2396](../docs/design/cooldown-counter.html#L2395), [2542-2543](../docs/design/cooldown-counter.html#L2542).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Open the account selector; the hbh_01 result displays its full SteamID as account identity.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-049

**Statement:** The system shall identify the selected account in the selector.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Isolate the account I need to inspect.
- Source lines: [2398-2398](../docs/design/cooldown-counter.html#L2398), [3596-3597](../docs/design/cooldown-counter.html#L3596).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Select hbh_01 and reopen the selector; hbh_01 is marked as selected.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-050

**Statement:** The system shall close the account selector after selecting an account.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Isolate the account I need to inspect.
- Source lines: [3598-3598](../docs/design/cooldown-counter.html#L3598).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Choose hbh_01 in the account selector; the result list closes.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-051

**Statement:** The system shall offer an All accounts selector choice.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Isolate the account I need to inspect.
- Source lines: [2386-2388](../docs/design/cooldown-counter.html#L2386), [2533-2535](../docs/design/cooldown-counter.html#L2533), [3605-3605](../docs/design/cooldown-counter.html#L3605).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: With hbh_01 selected, choose All accounts; records from hbh_01 and hbh_02 become eligible for display.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-052

**Statement:** The system shall show a no-account-match state for an unsuccessful selector search.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Isolate the account I need to inspect.
- Source lines: [2400-2402](../docs/design/cooldown-counter.html#L2400), [2547-2549](../docs/design/cooldown-counter.html#L2547).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Search the account selector for nonexistent; a no-account-match message appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-053

**Statement:** The system shall show the selected account identity on the closed selector.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Isolate the account I need to inspect.
- Source lines: [3586-3590](../docs/design/cooldown-counter.html#L3586).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Select hbh_01; the closed selector shows hbh_01 and its SteamID.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-054

**Statement:** The system shall restrict a selected account filter to that account's stable identity.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: A tag-prefix collision must not include another account after explicit selection.
- Source lines: [3271-3271](../docs/design/cooldown-counter.html#L3271), [3598-3598](../docs/design/cooldown-counter.html#L3598).
- Trace: [US-008](../2-user-stories/US-008-cal-account-filter.md), [BR-008](#br-008), [EX-008](#ex-008).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Select hbh_1 while hbh_10 also exists; only hbh_1 is included.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-015](open-questions.md#q-015)
- Change history: 2026-11-12 - Initial design extraction.

## US-009 - Focus by cooldown status

Parent: [US-009](../2-user-stories/US-009-cal-status-filter.md).

<a id="br-009"></a>

**BR-009 - atomic rule set:** [RQ-055](#rq-055), [RQ-056](#rq-056), [RQ-057](#rq-057), [RQ-058](#rq-058).

**Mapping context:** The design exposes this distinct operator outcome. Focus on the availability state relevant to my task.

<a id="ex-009"></a>

**EX-009 - proposed worked example:**

- Given An account has expired offence A and active offence B.
- When I select A and On cooldown.
- Then The result follows the agreed account-versus-record combined-filter rule.
- Boundary or exception: Expiry exactly now.
- Boundary or exception: Future record.
- Boundary or exception: Account with no history.

**Unanswered mapping questions:** [Q-002](open-questions.md#q-002), [Q-003](open-questions.md#q-003), [Q-033](open-questions.md#q-033)

### RQ-055

**Statement:** The system shall offer All as a status filter.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Focus on the availability state relevant to my task.
- Source lines: [3275-3275](../docs/design/cooldown-counter.html#L3275).
- Trace: [US-009](../2-user-stories/US-009-cal-status-filter.md), [BR-009](#br-009), [EX-009](#ex-009).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: With expired and active records present, choose All; both status classes are eligible under the agreed filter scope.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-002](open-questions.md#q-002)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-056

**Statement:** The system shall offer On cooldown as a status filter.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Focus on the availability state relevant to my task.
- Source lines: [3275-3275](../docs/design/cooldown-counter.html#L3275).
- Trace: [US-009](../2-user-stories/US-009-cal-status-filter.md), [BR-009](#br-009), [EX-009](#ex-009).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Choose On cooldown with one active and one expired restriction; only the active status class remains under the agreed filter scope.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-002](open-questions.md#q-002), [Q-003](open-questions.md#q-003), [Q-033](open-questions.md#q-033)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-057

**Statement:** The system shall offer Clear as a status filter.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Focus on the availability state relevant to my task.
- Source lines: [3275-3275](../docs/design/cooldown-counter.html#L3275).
- Trace: [US-009](../2-user-stories/US-009-cal-status-filter.md), [BR-009](#br-009), [EX-009](#ex-009).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Choose Clear with one restricted and one clear account; the agreed clear status class remains.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-002](open-questions.md#q-002), [Q-003](open-questions.md#q-003)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-058

**Statement:** The system shall identify the selected status filter.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Focus on the availability state relevant to my task.
- Source lines: [2410-2410](../docs/design/cooldown-counter.html#L2410), [2557-2557](../docs/design/cooldown-counter.html#L2557), [3273-3275](../docs/design/cooldown-counter.html#L3273).
- Trace: [US-009](../2-user-stories/US-009-cal-status-filter.md), [BR-009](#br-009), [EX-009](#ex-009).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Choose On cooldown; its status control has the selected treatment while All and Clear do not.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-010 - Focus by offence type

Parent: [US-010](../2-user-stories/US-010-cal-offence-filter.md).

<a id="br-010"></a>

**BR-010 - atomic rule set:** [RQ-059](#rq-059), [RQ-060](#rq-060), [RQ-061](#rq-061), [RQ-062](#rq-062), [RQ-063](#rq-063), [RQ-064](#rq-064), [RQ-065](#rq-065), [RQ-066](#rq-066), [RQ-067](#rq-067), [RQ-068](#rq-068), [RQ-069](#rq-069).

**Mapping context:** The design exposes this distinct operator outcome. Investigate the ladders relevant to my question.

<a id="ex-010"></a>

**EX-010 - proposed worked example:**

- Given VACLive and Abandoning are configured.
- When I select both and then deselect VACLive.
- Then Only Abandoning remains selected and eligible results update.
- Boundary or exception: Search by short code.
- Boundary or exception: No matching types.
- Boundary or exception: All offences clears the restriction.

**Unanswered mapping questions:** [Q-003](open-questions.md#q-003)

### RQ-059

**Statement:** The system shall offer an offence-type selector in the calendar and fleet views.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [2413-2445](../docs/design/cooldown-counter.html#L2413), [2560-2592](../docs/design/cooldown-counter.html#L2560).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Open Calendar and then Accounts; each view offers an offence filter.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-060

**Statement:** The system shall search offence-selector results by name without case sensitivity.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [3617-3618](../docs/design/cooldown-counter.html#L3617).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: With VACLive and Abandoning configured, search vac; VACLive is returned.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-061

**Statement:** The system shall search offence-selector results by short code without case sensitivity.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [3617-3618](../docs/design/cooldown-counter.html#L3617).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: With a type whose code is VAC, search vaC; that type is returned.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-062

**Statement:** The system shall permit selecting more than one offence filter.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [3622-3622](../docs/design/cooldown-counter.html#L3622).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Select VACLive and then Abandoning; both remain selected.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-063

**Statement:** The system shall permit deselecting an offence filter without clearing other selected types.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [3622-3622](../docs/design/cooldown-counter.html#L3622).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: With VACLive and Abandoning selected, deselect VACLive; Abandoning remains selected.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-064

**Statement:** The system shall identify selected offence types in the selector.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [2436-2436](../docs/design/cooldown-counter.html#L2436), [3620-3621](../docs/design/cooldown-counter.html#L3620).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Select VACLive and reopen its selector; VACLive is marked as selected.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-065

**Statement:** The system shall show each offence selector choice's first-step duration.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [2435-2435](../docs/design/cooldown-counter.html#L2435), [3619-3619](../docs/design/cooldown-counter.html#L3619).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Configure Abandoning first step as 30 minutes; its offence-selector choice shows 30m.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-066

**Statement:** The system shall offer an All offences selector choice.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [2428-2430](../docs/design/cooldown-counter.html#L2428), [3610-3611](../docs/design/cooldown-counter.html#L3610).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Select VACLive and then All offences; no offence restriction remains.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-067

**Statement:** The system shall show a no-offence-match state for an unsuccessful selector search.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [2439-2441](../docs/design/cooldown-counter.html#L2439), [3625-3627](../docs/design/cooldown-counter.html#L3625).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Search the offence selector for nonexistent; a no-offence-match message appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-068

**Statement:** The system shall show the selected offence name when exactly one type is selected.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [3612-3612](../docs/design/cooldown-counter.html#L3612).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Select only VACLive; the closed offence selector reads VACLive.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-069

**Statement:** The system shall show the number of selected offence types when multiple types are selected.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Investigate the ladders relevant to my question.
- Source lines: [3612-3612](../docs/design/cooldown-counter.html#L3612).
- Trace: [US-010](../2-user-stories/US-010-cal-offence-filter.md), [BR-010](#br-010), [EX-010](#ex-010).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Select VACLive and Abandoning; the closed selector reports 2 offences.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-011 - Restore an unfiltered workspace

Parent: [US-011](../2-user-stories/US-011-cal-reset-filters.md).

<a id="br-011"></a>

**BR-011 - atomic rule set:** [RQ-070](#rq-070), [RQ-071](#rq-071), [RQ-072](#rq-072).

**Mapping context:** The design exposes this distinct operator outcome. Return to the complete account and cooldown context.

<a id="ex-011"></a>

**EX-011 - proposed worked example:**

- Given Account hbh_01, offence VACLive and On cooldown are selected.
- When I activate Reset.
- Then Account, offence and status restrictions are removed.
- Boundary or exception: An open selector has search text.
- Boundary or exception: No filters are active.
- Boundary or exception: Selections persist across calendar and fleet navigation.

**Unanswered mapping questions:** [Q-023](open-questions.md#q-023)

### RQ-070

**Statement:** The system shall offer Reset when any account, offence or status filter is active.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Return to the complete account and cooldown context.
- Source lines: [2446-2448](../docs/design/cooldown-counter.html#L2446), [2593-2595](../docs/design/cooldown-counter.html#L2593), [3270-3270](../docs/design/cooldown-counter.html#L3270).
- Trace: [US-011](../2-user-stories/US-011-cal-reset-filters.md), [BR-011](#br-011), [EX-011](#ex-011).
- Dependencies: [US-008](../2-user-stories/US-008-cal-account-filter.md), [US-009](../2-user-stories/US-009-cal-status-filter.md), [US-010](../2-user-stories/US-010-cal-offence-filter.md)
- Acceptance condition: With no active filters Reset is absent; selecting hbh_01 makes Reset available.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-071

**Statement:** The system shall clear all three filter dimensions on Reset.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Return to the complete account and cooldown context.
- Source lines: [3276-3276](../docs/design/cooldown-counter.html#L3276).
- Trace: [US-011](../2-user-stories/US-011-cal-reset-filters.md), [BR-011](#br-011), [EX-011](#ex-011).
- Dependencies: [US-008](../2-user-stories/US-008-cal-account-filter.md), [US-009](../2-user-stories/US-009-cal-status-filter.md), [US-010](../2-user-stories/US-010-cal-offence-filter.md)
- Acceptance condition: Select hbh_01, VACLive and On cooldown, then Reset; account=all, offences=all and status=All.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-023](open-questions.md#q-023)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-072

**Statement:** The system shall retain filter choices when switching between calendar and fleet views.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Return to the complete account and cooldown context.
- Source lines: [3264-3264](../docs/design/cooldown-counter.html#L3264), [3270-3276](../docs/design/cooldown-counter.html#L3270), [3138-3138](../docs/design/cooldown-counter.html#L3138).
- Trace: [US-011](../2-user-stories/US-011-cal-reset-filters.md), [BR-011](#br-011), [EX-011](#ex-011).
- Dependencies: [US-008](../2-user-stories/US-008-cal-account-filter.md), [US-009](../2-user-stories/US-009-cal-status-filter.md), [US-010](../2-user-stories/US-010-cal-offence-filter.md)
- Acceptance condition: Select hbh_01 and VACLive on Calendar, switch to Accounts, then return; both filter selections remain.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-012 - Review cooldowns by day

Parent: [US-012](../2-user-stories/US-012-cal-calendar-spans.md).

<a id="br-012"></a>

**BR-012 - atomic rule set:** [RQ-073](#rq-073), [RQ-074](#rq-074), [RQ-075](#rq-075), [RQ-076](#rq-076), [RQ-077](#rq-077), [RQ-078](#rq-078), [RQ-079](#rq-079), [RQ-080](#rq-080), [RQ-081](#rq-081), [RQ-082](#rq-082), [RQ-083](#rq-083), [RQ-084](#rq-084), [RQ-085](#rq-085), [RQ-086](#rq-086), [RQ-087](#rq-087), [RQ-088](#rq-088).

**Mapping context:** The design exposes this distinct operator outcome. Understand when each account restriction starts and expires.

<a id="ex-012"></a>

**EX-012 - proposed worked example:**

- Given A seven-day VACLive cooldown starts on the last day of a month.
- When I inspect both affected month grids.
- Then Its bar occupies the correct dates and distinguishes continuation edges from its true start and expiry.
- Boundary or exception: Monday-first layout.
- Boundary or exception: Midnight expiry.
- Boundary or exception: Year boundary and leap day.
- Boundary or exception: Single-day short code.
- Boundary or exception: Overlapping bars.

**Unanswered mapping questions:** [Q-007](open-questions.md#q-007), [Q-019](open-questions.md#q-019)

### RQ-073

**Statement:** The system shall show calendar weekdays in Monday-to-Sunday order.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [2473-2478](../docs/design/cooldown-counter.html#L2473), [3641-3641](../docs/design/cooldown-counter.html#L3641).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Inspect any calendar week; its headers are MON, TUE, WED, THU, FRI, SAT, SUN in that order.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-074

**Statement:** The system shall label each calendar month with month and year.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [2463-2471](../docs/design/cooldown-counter.html#L2463), [3376-3376](../docs/design/cooldown-counter.html#L3376).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Display August 2026; its month heading identifies August 2026.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-075

**Statement:** The system shall distinguish dates outside the displayed month.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [3365-3373](../docs/design/cooldown-counter.html#L3365).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Display a month grid containing adjacent-month dates; adjacent-month cells have a distinct treatment.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-076

**Statement:** The system shall identify the current calendar date.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [2484-2488](../docs/design/cooldown-counter.html#L2484), [3367-3372](../docs/design/cooldown-counter.html#L3367).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Set agreed current time to 29 August 2026; the 29 August date is identified as NOW.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-007](open-questions.md#q-007)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-077

**Statement:** The system shall identify the current month.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [2467-2469](../docs/design/cooldown-counter.html#L2467), [3376-3376](../docs/design/cooldown-counter.html#L3376).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Set agreed current time to August 2026; August is identified as CURRENT while July is not.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-007](open-questions.md#q-007)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-078

**Statement:** The system shall display each recorded cooldown from its start through its derived expiry.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [3314-3330](../docs/design/cooldown-counter.html#L3314).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Record a cooldown starting 31 July and ending 2 August; its span appears on each occupied date and no later date.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-019](open-questions.md#q-019)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-079

**Statement:** The system shall continue cooldown bars across week boundaries.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [3320-3321](../docs/design/cooldown-counter.html#L3320), [3350-3358](../docs/design/cooldown-counter.html#L3350).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Record a cooldown spanning Sunday through Tuesday; its bar continues into the following calendar week.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-007](open-questions.md#q-007)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-080

**Statement:** The system shall distinguish a cooldown's true start from a continuation edge.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [3350-3358](../docs/design/cooldown-counter.html#L3350).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Record a cooldown spanning two weeks; only its actual start has the start-edge treatment.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-081

**Statement:** The system shall distinguish a cooldown's true expiry from a continuation edge.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [3350-3358](../docs/design/cooldown-counter.html#L3350).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Record a cooldown spanning two weeks; only its actual expiry has the expiry-edge treatment.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-082

**Statement:** The system shall identify the account associated with a calendar bar.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [2494-2497](../docs/design/cooldown-counter.html#L2494), [3325-3325](../docs/design/cooldown-counter.html#L3325).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Render cooldowns for hbh_01 and hbh_02; each bar carries its associated account identity badge.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-083

**Statement:** The system shall show the cooldown duration on each recorded calendar bar.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [2496-2496](../docs/design/cooldown-counter.html#L2496), [3325-3325](../docs/design/cooldown-counter.html#L3325).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Record a cooldown derived as seven days; its calendar bar displays 7d.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-084

**Statement:** The system shall identify the offence associated with a recorded calendar bar.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [3325-3325](../docs/design/cooldown-counter.html#L3325), [3355-3355](../docs/design/cooldown-counter.html#L3355).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Render a multi-day VACLive bar and a one-day VACLive bar; each identifies the offence through its name or configured code.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-085

**Statement:** The system shall distinguish predicted step-down marks from recorded cooldown bars.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [2457-2459](../docs/design/cooldown-counter.html#L2457), [3335-3339](../docs/design/cooldown-counter.html#L3335).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Render a cooldown and a forecast on the same week; recorded spans use solid treatment and forecasts use dashed treatment.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-086

**Statement:** The system shall separate overlapping bars into visible calendar lanes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [3342-3348](../docs/design/cooldown-counter.html#L3342).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Render two cooldown spans occupying the same day; their visible bars do not occupy the same lane.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-087

**Statement:** The system shall show the displayed calendar month range.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [2453-2453](../docs/design/cooldown-counter.html#L2453), [3651-3651](../docs/design/cooldown-counter.html#L3651).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Display May through August 2026; the range label identifies May 2026 through August 2026.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-088

**Statement:** The system shall use duration severity consistently across calendar bars, ladder chips and predictions.

- Version: 0.1. Type: Quality. Evidence: Visible.
- Rationale: Understand when each account restriction starts and expires.
- Source lines: [3323-3326](../docs/design/cooldown-counter.html#L3323), [3399-3406](../docs/design/cooldown-counter.html#L3399), [3418-3418](../docs/design/cooldown-counter.html#L3418).
- Trace: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [BR-012](#br-012), [EX-012](#ex-012).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Render the same seven-day duration in calendar and prediction contexts; both use the shared seven-day severity treatment.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-013 - Review future step-down dates

Parent: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md).

<a id="br-013"></a>

**BR-013 - atomic rule set:** [RQ-089](#rq-089), [RQ-090](#rq-090), [RQ-091](#rq-091), [RQ-092](#rq-092), [RQ-093](#rq-093), [RQ-094](#rq-094), [RQ-095](#rq-095), [RQ-096](#rq-096), [RQ-097](#rq-097), [RQ-098](#rq-098).

**Mapping context:** The design exposes this distinct operator outcome. Anticipate ladder changes without mistaking a prediction for evidence.

<a id="ex-013"></a>

**EX-013 - proposed worked example:**

- Given A step-2 ladder has a seven-day clean window.
- When I inspect the future step-down dates.
- Then Dashed forecasts identify each resulting step according to the agreed marker-duration meaning.
- Boundary or exception: Target step 0.
- Boundary or exception: Full reset and No decay modes.
- Boundary or exception: Offence and account filters.
- Boundary or exception: Currently clear account under On cooldown.
- Boundary or exception: Stored state 2 forecasts S1 at expiry plus seven days and S0 at expiry plus fourteen days; distinguish those stored states from their next-offence steps.

**Unanswered mapping questions:** [Q-021](open-questions.md#q-021), [Q-022](open-questions.md#q-022), [Q-017](open-questions.md#q-017), [Q-050](open-questions.md#q-050), [Q-051](open-questions.md#q-051), [Q-007](open-questions.md#q-007), [Q-024](open-questions.md#q-024)

### RQ-089

**Statement:** The system shall show future step-down marks when step-down decay is enabled.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Anticipate ladder changes without mistaking a prediction for evidence.
- Source lines: [3287-3298](../docs/design/cooldown-counter.html#L3287).
- Trace: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [BR-013](#br-013), [EX-013](#ex-013).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Enable step-down decay with a seven-day window and a future drop date; a forecast mark appears on that date.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-021](open-questions.md#q-021), [Q-022](open-questions.md#q-022)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-090

**Statement:** The system shall omit step-down marks in Full reset and No decay modes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Anticipate ladder changes without mistaking a prediction for evidence.
- Source lines: [3288-3288](../docs/design/cooldown-counter.html#L3288).
- Trace: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [BR-013](#br-013), [EX-013](#ex-013).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Choose Full reset and then No decay; neither mode renders step-down marks.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-091

**Statement:** The system shall apply account filtering to predicted marks.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Anticipate ladder changes without mistaking a prediction for evidence.
- Source lines: [3295-3295](../docs/design/cooldown-counter.html#L3295).
- Trace: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [BR-013](#br-013), [EX-013](#ex-013).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Select hbh_01 with forecasts for hbh_01 and hbh_02; only hbh_01 forecasts remain.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-092

**Statement:** The system shall apply offence filtering to predicted marks.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Anticipate ladder changes without mistaking a prediction for evidence.
- Source lines: [3295-3295](../docs/design/cooldown-counter.html#L3295).
- Trace: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [BR-013](#br-013), [EX-013](#ex-013).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Select VACLive with forecasts for VACLive and Abandoning; only VACLive forecasts remain.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-093

**Statement:** The system shall show the target step on a predicted mark.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Anticipate ladder changes without mistaking a prediction for evidence.
- Source lines: [3297-3297](../docs/design/cooldown-counter.html#L3297), [3336-3336](../docs/design/cooldown-counter.html#L3336).
- Trace: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [BR-013](#br-013), [EX-013](#ex-013).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Forecast a transition to level 1; its mark identifies S1.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-021](open-questions.md#q-021)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-094

**Statement:** The system shall omit step-down marks when decay markers are disabled.

- Version: 0.1. Type: Constraint. Evidence: Logic.
- Rationale: Inspect the calendar with or without forecast overlays.
- Source lines: [3147-3154](../docs/design/cooldown-counter.html#L3147), [3288-3288](../docs/design/cooldown-counter.html#L3288).
- Trace: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [BR-013](#br-013), [EX-013](#ex-013).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Set the design showDecayMarkers property to false; forecast marks disappear while recorded spans remain.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-017](open-questions.md#q-017)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-095

**Statement:** The system shall schedule each default step-down forecast at the terminal expiry plus its completed clean-window offset.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A dashed marker needs a reproducible date derived from the effective model.
- Source lines: [3290-3292](../docs/design/cooldown-counter.html#L3290).
- Trace: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [BR-013](#br-013), [EX-013](#ex-013).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: For stored state 2 and a seven-day expiry-anchored window, forecast reductions at expiry plus 7 days and expiry plus 14 days.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-050](open-questions.md#q-050), [Q-051](open-questions.md#q-051)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-096

**Statement:** The system shall stop default step-down forecasts when the stored ladder state reaches zero.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A fully decayed ladder cannot fall below its initial state.
- Source lines: [3291-3294](../docs/design/cooldown-counter.html#L3291).
- Trace: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [BR-013](#br-013), [EX-013](#ex-013).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: For stored state 2, generate only the two eligible reductions toward state zero; do not create a third negative-state reduction.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-097

**Statement:** The system shall exclude forecast step-down times earlier than the current reference time from the future-forecast layer.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Future predictions must remain distinct from historical transition evidence.
- Source lines: [3292-3293](../docs/design/cooldown-counter.html#L3292).
- Trace: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [BR-013](#br-013), [EX-013](#ex-013).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Place one forecast one millisecond before the reference time and another exactly at it; omit the earlier forecast and retain the exact-boundary forecast subject to the other filters.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-007](open-questions.md#q-007), [Q-024](open-questions.md#q-024)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-098

**Statement:** The system shall identify a forecast marker duration as the next-offence duration after that reduction.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Stored state S0 is not a zero-minute penalty; it predicts the first-step duration for another offence.
- Source lines: [3294-3297](../docs/design/cooldown-counter.html#L3294).
- Trace: [US-013](../2-user-stories/US-013-cal-calendar-forecasts.md), [BR-013](#br-013), [EX-013](#ex-013).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: On an Abandoning ladder, show that a reduction from stored state 2 to state 1 predicts the next offence at step 2, or 2 hours; a later reduction to state 0 predicts step 1, or 30 minutes.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-021](open-questions.md#q-021)
- Change history: 2026-11-12 - Initial design extraction.

## US-014 - Reach crowded calendar records

Parent: [US-014](../2-user-stories/US-014-cal-calendar-overflow.md).

<a id="br-014"></a>

**BR-014 - atomic rule set:** [RQ-099](#rq-099), [RQ-100](#rq-100), [RQ-101](#rq-101).

**Mapping context:** The design exposes this distinct operator outcome. Avoid overlooking observations hidden by visual density.

<a id="ex-014"></a>

**EX-014 - proposed worked example:**

- Given Six mutually overlapping records exceed a five-lane week.
- When I inspect the overflow indicator.
- Then The indicator reports the hidden quantity; access to those records follows the agreed disclosure design.
- Boundary or exception: Split records across weeks.
- Boundary or exception: Forecasts and observations mixed.
- Boundary or exception: All six records remain discoverable.

**Unanswered mapping questions:** [Q-005](open-questions.md#q-005), [Q-004](open-questions.md#q-004)

### RQ-099

**Statement:** The system shall show a hidden-entry count when a calendar week overflows its visible lanes.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Avoid overlooking observations hidden by visual density.
- Source lines: [2500-2502](../docs/design/cooldown-counter.html#L2500), [3347-3347](../docs/design/cooldown-counter.html#L3347).
- Trace: [US-014](../2-user-stories/US-014-cal-calendar-overflow.md), [BR-014](#br-014), [EX-014](#ex-014).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Render six mutually overlapping spans in a week with a five-lane display limit; the week shows +1 more.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-005](open-questions.md#q-005)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-100

**Statement:** The system shall label the calendar result count with its agreed counting unit.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Avoid overlooking observations hidden by visual density.
- Source lines: [2449-2449](../docs/design/cooldown-counter.html#L2449), [3629-3629](../docs/design/cooldown-counter.html#L3629).
- Trace: [US-014](../2-user-stories/US-014-cal-calendar-overflow.md), [BR-014](#br-014), [EX-014](#ex-014).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Render a known set of eligible calendar items; the displayed count equals the agreed count unit for that set, including an explicit decision about split segments and predictions.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-004](open-questions.md#q-004)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-101

**Statement:** The system shall provide access to every cooldown hidden by calendar lane overflow.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The visible +N more indicator currently leaves records inaccessible within the calendar.
- Source lines: [2500-2502](../docs/design/cooldown-counter.html#L2500), [3347-3347](../docs/design/cooldown-counter.html#L3347).
- Trace: [US-014](../2-user-stories/US-014-cal-calendar-overflow.md), [BR-014](#br-014), [EX-014](#ex-014).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Load six fully overlapping observations with five visible lanes; the operator can identify and inspect all six through the agreed overflow route.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-005](open-questions.md#q-005)
- Change history: 2026-11-12 - Initial design extraction.

## US-015 - Browse calendar history and later months

Parent: [US-015](../2-user-stories/US-015-cal-calendar-range.md).

<a id="br-015"></a>

**BR-015 - atomic rule set:** [RQ-102](#rq-102), [RQ-103](#rq-103).

**Mapping context:** The design exposes this distinct operator outcome. Review long cooldowns and future ladder changes.

<a id="ex-015"></a>

**EX-015 - proposed worked example:**

- Given The first set of months is displayed.
- When I reach its end.
- Then The next chronological month becomes reachable.
- Boundary or exception: Content shorter than viewport.
- Boundary or exception: Agreed maximum horizon.
- Boundary or exception: Calendar starts before current month.
- Boundary or exception: A recorded event earlier than the initial month remains reachable; no previous-month button is claimed to exist in the prototype.

**Unanswered mapping questions:** [Q-009](open-questions.md#q-009), [Q-007](open-questions.md#q-007)

### RQ-102

**Statement:** The system shall append later months as the operator scrolls toward the calendar end.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Review long cooldowns and future ladder changes.
- Source lines: [2510-2510](../docs/design/cooldown-counter.html#L2510), [3166-3167](../docs/design/cooldown-counter.html#L3166).
- Trace: [US-015](../2-user-stories/US-015-cal-calendar-range.md), [BR-015](#br-015), [EX-015](#ex-015).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Scroll to the calendar end; at least the next chronological month becomes available within the agreed horizon.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-009](open-questions.md#q-009), [Q-007](open-questions.md#q-007)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-103

**Statement:** The system shall provide a route to calendar dates containing recorded cooldowns earlier than the initial displayed range.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The demo can seed history before May but exposes only forward month loading.
- Source lines: [3106-3109](../docs/design/cooldown-counter.html#L3106), [3137-3139](../docs/design/cooldown-counter.html#L3137), [3166-3168](../docs/design/cooldown-counter.html#L3166).
- Trace: [US-015](../2-user-stories/US-015-cal-calendar-range.md), [BR-015](#br-015), [EX-015](#ex-015).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: With a recorded cooldown in April and an initial May-August range, reach its April calendar date without changing or discarding the record.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-007](open-questions.md#q-007), [Q-009](open-questions.md#q-009)
- Change history: 2026-11-12 - Initial design extraction.

## US-016 - Return to the present

Parent: [US-016](../2-user-stories/US-016-cal-calendar-present.md).

<a id="br-016"></a>

**BR-016 - atomic rule set:** [RQ-104](#rq-104), [RQ-105](#rq-105), [RQ-106](#rq-106).

**Mapping context:** The design exposes this distinct operator outcome. Recover my calendar position after browsing.

<a id="ex-016"></a>

**EX-016 - proposed worked example:**

- Given I have scrolled away from today.
- When I activate Jump to the present.
- Then The current date becomes visible, including when it was outside the loaded range.
- Boundary or exception: Today appears in adjacent-month spillover.
- Boundary or exception: Reset retains filters.
- Boundary or exception: Current date differs from demo date.

**Unanswered mapping questions:** [Q-007](open-questions.md#q-007), [Q-008](open-questions.md#q-008), [Q-020](open-questions.md#q-020)

### RQ-104

**Statement:** The system shall provide a reset for the calendar view independently of filter reset.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Recover my calendar position after browsing.
- Source lines: [2454-2454](../docs/design/cooldown-counter.html#L2454), [3643-3643](../docs/design/cooldown-counter.html#L3643).
- Trace: [US-016](../2-user-stories/US-016-cal-calendar-present.md), [BR-016](#br-016), [EX-016](#ex-016).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Extend the calendar beyond its initial range, then choose Reset view; the agreed default range is restored and selected filters remain.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-007](open-questions.md#q-007)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-105

**Statement:** The system shall offer Jump to the present while the present day is outside the visible calendar area.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Recover my calendar position after browsing.
- Source lines: [2789-2796](../docs/design/cooldown-counter.html#L2789), [3160-3164](../docs/design/cooldown-counter.html#L3160).
- Trace: [US-016](../2-user-stories/US-016-cal-calendar-present.md), [BR-016](#br-016), [EX-016](#ex-016).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: Scroll until the current day leaves the calendar viewport; Jump to the present becomes available.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-020](open-questions.md#q-020)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-106

**Statement:** The system shall reveal the current day when Jump to the present is activated outside the loaded calendar range.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Recover my calendar position after browsing.
- Source lines: [3645-3649](../docs/design/cooldown-counter.html#L3645).
- Trace: [US-016](../2-user-stories/US-016-cal-calendar-present.md), [BR-016](#br-016), [EX-016](#ex-016).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md)
- Acceptance condition: With today outside the loaded range, activate Jump to the present; today is loaded and brought into view under the proposed recovery behavior.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-008](open-questions.md#q-008), [Q-007](open-questions.md#q-007), [Q-020](open-questions.md#q-020)
- Change history: 2026-11-12 - Initial design extraction.

## US-017 - Focus an account from the calendar

Parent: [US-017](../2-user-stories/US-017-cal-calendar-account-focus.md).

<a id="br-017"></a>

**BR-017 - atomic rule set:** [RQ-107](#rq-107), [RQ-108](#rq-108).

**Mapping context:** The design exposes this distinct operator outcome. Inspect its records without another account search.

<a id="ex-017"></a>

**EX-017 - proposed worked example:**

- Given All accounts are displayed.
- When I activate a hbh_01 bar, then activate it again.
- Then The prototype focuses hbh_01 and then returns to all accounts, subject to confirmation of this interaction.
- Boundary or exception: Other active filters remain.
- Boundary or exception: Tags with shared prefixes.

**Unanswered mapping questions:** [Q-006](open-questions.md#q-006), [Q-015](open-questions.md#q-015)

### RQ-107

**Statement:** The system shall focus the account filter when a bar for an unselected account is activated.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Inspect its records without another account search.
- Source lines: [3359-3359](../docs/design/cooldown-counter.html#L3359).
- Trace: [US-017](../2-user-stories/US-017-cal-calendar-account-focus.md), [BR-017](#br-017), [EX-017](#ex-017).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [US-008](../2-user-stories/US-008-cal-account-filter.md)
- Acceptance condition: Activate a hbh_01 bar while All accounts is selected; the account filter becomes hbh_01.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-006](open-questions.md#q-006), [Q-015](open-questions.md#q-015)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-108

**Statement:** The system shall clear the account filter when an already-focused account's bar is activated.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Inspect its records without another account search.
- Source lines: [3359-3359](../docs/design/cooldown-counter.html#L3359).
- Trace: [US-017](../2-user-stories/US-017-cal-calendar-account-focus.md), [BR-017](#br-017), [EX-017](#ex-017).
- Dependencies: [US-012](../2-user-stories/US-012-cal-calendar-spans.md), [US-008](../2-user-stories/US-008-cal-account-filter.md)
- Acceptance condition: Activate a hbh_01 bar while hbh_01 is already focused; the account filter returns to All accounts.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-006](open-questions.md#q-006)
- Change history: 2026-11-12 - Initial design extraction.

## US-018 - Compare account availability

Parent: [US-018](../2-user-stories/US-018-cal-fleet-summary.md).

<a id="br-018"></a>

**BR-018 - atomic rule set:** [RQ-109](#rq-109), [RQ-110](#rq-110), [RQ-111](#rq-111), [RQ-112](#rq-112), [RQ-113](#rq-113), [RQ-114](#rq-114), [RQ-115](#rq-115), [RQ-116](#rq-116), [RQ-117](#rq-117), [RQ-118](#rq-118), [RQ-119](#rq-119), [RQ-120](#rq-120).

**Mapping context:** The design exposes this distinct operator outcome. Compare account availability and escalation risk.

<a id="ex-018"></a>

**EX-018 - proposed worked example:**

- Given One account is active, one has expired history and one has no history.
- When I open Accounts.
- Then Their rows distinguish those statuses and show their identity, record count and the agreed ladder and next-prediction summaries.
- Boundary or exception: Overlapping active records.
- Boundary or exception: Fully decayed ladder.
- Boundary or exception: Two offence types tied in sample count.
- Boundary or exception: No rows match filters.

**Unanswered mapping questions:** [Q-033](open-questions.md#q-033), [Q-010](open-questions.md#q-010), [Q-011](open-questions.md#q-011)

### RQ-109

**Statement:** The system shall show each fleet account's tag.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Compare account availability and escalation risk.
- Source lines: [2607-2607](../docs/design/cooldown-counter.html#L2607).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Load hbh_01; its fleet row displays hbh_01.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-110

**Statement:** The system shall show each fleet account's SteamID.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Compare account availability and escalation risk.
- Source lines: [2608-2608](../docs/design/cooldown-counter.html#L2608).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Load hbh_01 with SteamID 76561198012345678; its fleet row identifies that SteamID.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-111

**Statement:** The system shall show each fleet account's status.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Compare account availability and escalation risk.
- Source lines: [2611-2613](../docs/design/cooldown-counter.html#L2611), [3404-3405](../docs/design/cooldown-counter.html#L3404).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Give hbh_01 a currently active VACLive cooldown; its fleet row displays the restricted status.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-033](open-questions.md#q-033)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-112

**Statement:** The system shall distinguish accounts with expired history from accounts with no recorded cooldown.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Compare account availability and escalation risk.
- Source lines: [3404-3404](../docs/design/cooldown-counter.html#L3404).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Load one account with only expired history and another with no history; their row labels distinguish clear from never cooled down.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-113

**Statement:** The system shall label fleet ladder-position chips according to their agreed recorded-step or current-step meaning.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Compare account availability and escalation risk.
- Source lines: [2615-2621](../docs/design/cooldown-counter.html#L2615), [3399-3399](../docs/design/cooldown-counter.html#L3399).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Give hbh_01 a VACLive ladder record at step 2; its fleet row shows the VACLive step according to the agreed recorded-versus-current semantics.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-010](open-questions.md#q-010)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-114

**Statement:** The system shall show a no-recorded-offences state for a fleet account without history.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Compare account availability and escalation risk.
- Source lines: [2622-2624](../docs/design/cooldown-counter.html#L2622).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Load an account without observations; its fleet row shows no recorded offences.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-115

**Statement:** The system shall show each fleet account's recorded-cooldown count.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Compare account availability and escalation risk.
- Source lines: [2626-2626](../docs/design/cooldown-counter.html#L2626), [3403-3403](../docs/design/cooldown-counter.html#L3403).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Load three observations for hbh_01; its fleet cooldown count is 3.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-116

**Statement:** The system shall select each fleet row's representative next-cooldown estimate according to the agreed offence-selection rule.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Compare account availability and escalation risk.
- Source lines: [2627-2631](../docs/design/cooldown-counter.html#L2627), [3400-3406](../docs/design/cooldown-counter.html#L3400).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Load one account with records on two offence types; its fleet row shows the next duration selected by the agreed representative-forecast rule.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-011](open-questions.md#q-011)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-117

**Statement:** The system shall name the offence associated with the fleet row's next-cooldown estimate.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Compare account availability and escalation risk.
- Source lines: [2630-2630](../docs/design/cooldown-counter.html#L2630), [3406-3406](../docs/design/cooldown-counter.html#L3406).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Show a VACLive estimate in a fleet row; VACLive appears beside that duration.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-118

**Statement:** The system shall open the selected account's detail from its fleet row.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Compare account availability and escalation risk.
- Source lines: [2603-2603](../docs/design/cooldown-counter.html#L2603), [3408-3408](../docs/design/cooldown-counter.html#L3408).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Activate the hbh_01 row; account detail for hbh_01 appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-119

**Statement:** The system shall show an empty fleet-results state when no account passes the filters.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Compare account availability and escalation risk.
- Source lines: [2635-2636](../docs/design/cooldown-counter.html#L2635).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: Apply filters excluding every account; an explicit no-accounts-match message appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-120

**Statement:** The system shall classify a cooldown as active only within its accepted start-inclusive and expiry-exclusive interval.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: A future observation is not a current restriction under the proposed active-time definition.
- Source lines: [3392-3394](../docs/design/cooldown-counter.html#L3392), [3415-3415](../docs/design/cooldown-counter.html#L3415).
- Trace: [US-018](../2-user-stories/US-018-cal-fleet-summary.md), [BR-018](#br-018), [EX-018](#ex-018).
- Dependencies: [US-006](../2-user-stories/US-006-cal-navigation.md)
- Acceptance condition: At time T, an event starting T+1 minute is not active; an event starting T is active; an event expiring T is clear.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-033](open-questions.md#q-033)
- Change history: 2026-11-12 - Initial design extraction.

## US-019 - Reach later accounts

Parent: [US-019](../2-user-stories/US-019-cal-fleet-pagination.md).

<a id="br-019"></a>

**BR-019 - atomic rule set:** [RQ-121](#rq-121), [RQ-122](#rq-122), [RQ-123](#rq-123).

**Mapping context:** The design exposes this distinct operator outcome. Reach accounts beyond the initial visible rows.

<a id="ex-019"></a>

**EX-019 - proposed worked example:**

- Given 26 accounts match and 12 are displayed.
- When I reach the end of the displayed list.
- Then More matching accounts become reachable and the displayed-versus-total count updates.
- Boundary or exception: Filtered list shorter than viewport.
- Boundary or exception: Final partial batch.
- Boundary or exception: No matching accounts.

**Unanswered mapping questions:** [Q-009](open-questions.md#q-009)

### RQ-121

**Statement:** The system shall show the number of displayed accounts relative to matching accounts.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Reach accounts beyond the initial visible rows.
- Source lines: [2596-2596](../docs/design/cooldown-counter.html#L2596), [3655-3655](../docs/design/cooldown-counter.html#L3655).
- Trace: [US-019](../2-user-stories/US-019-cal-fleet-pagination.md), [BR-019](#br-019), [EX-019](#ex-019).
- Dependencies: [US-018](../2-user-stories/US-018-cal-fleet-summary.md)
- Acceptance condition: With 26 matching accounts and 12 displayed rows, show 12 of 26 accounts.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-122

**Statement:** The system shall indicate that more matching accounts remain to be displayed.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Reach accounts beyond the initial visible rows.
- Source lines: [2638-2639](../docs/design/cooldown-counter.html#L2638), [3653-3654](../docs/design/cooldown-counter.html#L3653).
- Trace: [US-019](../2-user-stories/US-019-cal-fleet-pagination.md), [BR-019](#br-019), [EX-019](#ex-019).
- Dependencies: [US-018](../2-user-stories/US-018-cal-fleet-summary.md)
- Acceptance condition: With 26 matches and 12 displayed rows, the list indicates that 14 more remain.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-123

**Statement:** The system shall reveal more accounts as the operator scrolls toward the account-list end.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Reach accounts beyond the initial visible rows.
- Source lines: [3166-3168](../docs/design/cooldown-counter.html#L3166).
- Trace: [US-019](../2-user-stories/US-019-cal-fleet-pagination.md), [BR-019](#br-019), [EX-019](#ex-019).
- Dependencies: [US-018](../2-user-stories/US-018-cal-fleet-summary.md)
- Acceptance condition: With matching accounts beyond the first set, scroll to the list end; additional matching accounts become visible.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-009](open-questions.md#q-009)
- Change history: 2026-11-12 - Initial design extraction.

## US-020 - Inspect one account

Parent: [US-020](../2-user-stories/US-020-cal-account-detail.md).

<a id="br-020"></a>

**BR-020 - atomic rule set:** [RQ-124](#rq-124), [RQ-125](#rq-125), [RQ-126](#rq-126), [RQ-127](#rq-127), [RQ-128](#rq-128), [RQ-129](#rq-129), [RQ-130](#rq-130).

**Mapping context:** The design exposes this distinct operator outcome. Confirm I am reviewing the intended Steam account.

<a id="ex-020"></a>

**EX-020 - proposed worked example:**

- Given hbh_01 has three observations with earliest date 1 August 2026.
- When I open its account detail.
- Then The page identifies hbh_01, reports three recorded cooldowns, and shows its first observed date and agreed current status.
- Boundary or exception: Account with no history.
- Boundary or exception: No accounts in the fleet.
- Boundary or exception: Multiple active restrictions.

**Unanswered mapping questions:** [Q-033](open-questions.md#q-033), [Q-016](open-questions.md#q-016)

### RQ-124

**Statement:** The system shall show the account identity in account detail.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Confirm I am reviewing the intended Steam account.
- Source lines: [2651-2657](../docs/design/cooldown-counter.html#L2651).
- Trace: [US-020](../2-user-stories/US-020-cal-account-detail.md), [BR-020](#br-020), [EX-020](#ex-020).
- Dependencies: [US-018](../2-user-stories/US-018-cal-fleet-summary.md)
- Acceptance condition: Open hbh_01 detail; its tag and SteamID identify hbh_01.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-125

**Statement:** The system shall show the total recorded cooldowns in account detail.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Confirm I am reviewing the intended Steam account.
- Source lines: [2661-2661](../docs/design/cooldown-counter.html#L2661), [3433-3433](../docs/design/cooldown-counter.html#L3433).
- Trace: [US-020](../2-user-stories/US-020-cal-account-detail.md), [BR-020](#br-020), [EX-020](#ex-020).
- Dependencies: [US-018](../2-user-stories/US-018-cal-fleet-summary.md)
- Acceptance condition: Open an account with three observations; Recorded cooldowns is 3.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-126

**Statement:** The system shall show the first observed date in account detail.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Confirm I am reviewing the intended Steam account.
- Source lines: [2662-2662](../docs/design/cooldown-counter.html#L2662), [3434-3434](../docs/design/cooldown-counter.html#L3434).
- Trace: [US-020](../2-user-stories/US-020-cal-account-detail.md), [BR-020](#br-020), [EX-020](#ex-020).
- Dependencies: [US-018](../2-user-stories/US-018-cal-fleet-summary.md)
- Acceptance condition: Open an account whose earliest record starts on 1 August 2026; First observed identifies 1 August 2026.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-127

**Statement:** The system shall show the account's current availability status in account detail.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Confirm I am reviewing the intended Steam account.
- Source lines: [2663-2663](../docs/design/cooldown-counter.html#L2663), [3435-3435](../docs/design/cooldown-counter.html#L3435).
- Trace: [US-020](../2-user-stories/US-020-cal-account-detail.md), [BR-020](#br-020), [EX-020](#ex-020).
- Dependencies: [US-018](../2-user-stories/US-018-cal-fleet-summary.md)
- Acceptance condition: Open an account with no current restriction; its detail status is clear or clean according to history.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-033](open-questions.md#q-033)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-128

**Statement:** The system shall show an absent first-observed value for an account without history.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Confirm I am reviewing the intended Steam account.
- Source lines: [3434-3434](../docs/design/cooldown-counter.html#L3434).
- Trace: [US-020](../2-user-stories/US-020-cal-account-detail.md), [BR-020](#br-020), [EX-020](#ex-020).
- Dependencies: [US-018](../2-user-stories/US-018-cal-fleet-summary.md)
- Acceptance condition: Open an account without observations; First observed has an absent-value placeholder rather than an invented date.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-129

**Statement:** The system shall show an empty-fleet state when no account is available for account detail.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype dereferences a missing fallback account when the fleet is empty.
- Source lines: [3413-3415](../docs/design/cooldown-counter.html#L3413).
- Trace: [US-020](../2-user-stories/US-020-cal-account-detail.md), [BR-020](#br-020), [EX-020](#ex-020).
- Dependencies: [US-018](../2-user-stories/US-018-cal-fleet-summary.md)
- Acceptance condition: Load zero accounts and request account detail; an empty state appears without a runtime failure.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-016](open-questions.md#q-016)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-130

**Statement:** The system shall preserve the complete SteamID digit sequence throughout account identification.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: A rounded or truncated SteamID can select or link to a different account.
- Source lines: [3094-3099](../docs/design/cooldown-counter.html#L3094), [3431-3433](../docs/design/cooldown-counter.html#L3431), [3592-3598](../docs/design/cooldown-counter.html#L3592).
- Trace: [US-020](../2-user-stories/US-020-cal-account-detail.md), [BR-020](#br-020), [EX-020](#ex-020).
- Dependencies: [US-018](../2-user-stories/US-018-cal-fleet-summary.md)
- Acceptance condition: Use distinct identifiers 76561198039452203 and 76561198039452204; each stored identity, search result and Steam profile URL retains its exact input digits.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-021 - Open the external Steam account

Parent: [US-021](../2-user-stories/US-021-cal-steam-profile.md).

<a id="br-021"></a>

**BR-021 - atomic rule set:** [RQ-131](#rq-131), [RQ-132](#rq-132).

**Mapping context:** The design exposes this distinct operator outcome. Inspect the same account outside the tracker.

<a id="ex-021"></a>

**EX-021 - proposed worked example:**

- Given The selected account SteamID is 76561198012345678.
- When I activate Open on Steam.
- Then That Steam profile opens separately while the tracker detail remains available.
- Boundary or exception: Profile unavailable or private does not change the local account identity.

**Unanswered mapping questions:** None identified for this narrow obligation.

### RQ-131

**Statement:** The system shall provide a link to the account's Steam profile.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Inspect the same account outside the tracker.
- Source lines: [2665-2665](../docs/design/cooldown-counter.html#L2665), [3432-3432](../docs/design/cooldown-counter.html#L3432).
- Trace: [US-021](../2-user-stories/US-021-cal-steam-profile.md), [BR-021](#br-021), [EX-021](#ex-021).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Open hbh_01 detail with SteamID 76561198012345678; Open on Steam targets https://steamcommunity.com/profiles/76561198012345678.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-132

**Statement:** The system shall open the Steam profile in a separate browsing context.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Inspect the same account outside the tracker.
- Source lines: [2665-2665](../docs/design/cooldown-counter.html#L2665).
- Trace: [US-021](../2-user-stories/US-021-cal-steam-profile.md), [BR-021](#br-021), [EX-021](#ex-021).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Activate Open on Steam; the Steam profile opens separately and the current account detail remains available.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-022 - Compare per-offence predictions

Parent: [US-022](../2-user-stories/US-022-cal-account-predictions.md).

<a id="br-022"></a>

**BR-022 - atomic rule set:** [RQ-133](#rq-133), [RQ-134](#rq-134), [RQ-135](#rq-135), [RQ-136](#rq-136).

**Mapping context:** The design exposes this distinct operator outcome. Understand each type-specific escalation risk.

<a id="ex-022"></a>

**EX-022 - proposed worked example:**

- Given VACLive and Abandoning are configured with different ladders.
- When I inspect account detail.
- Then Each configured type has its own predicted duration and next-step position.
- Boundary or exception: No history on one or all ladders.
- Boundary or exception: Maximum step.
- Boundary or exception: One-step ladder.

**Unanswered mapping questions:** None identified for this narrow obligation.

### RQ-133

**Statement:** The system shall show a next-cooldown prediction for every configured offence type on account detail.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand each type-specific escalation risk.
- Source lines: [2671-2677](../docs/design/cooldown-counter.html#L2671), [3416-3418](../docs/design/cooldown-counter.html#L3416).
- Trace: [US-022](../2-user-stories/US-022-cal-account-predictions.md), [BR-022](#br-022), [EX-022](#ex-022).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Configure VACLive and Abandoning; account detail includes one prediction for each configured type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-134

**Statement:** The system shall show the predicted duration for each offence.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand each type-specific escalation risk.
- Source lines: [2674-2674](../docs/design/cooldown-counter.html#L2674).
- Trace: [US-022](../2-user-stories/US-022-cal-account-predictions.md), [BR-022](#br-022), [EX-022](#ex-022).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Derive a VACLive prediction of seven days; its account-detail prediction displays 7d.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-135

**Statement:** The system shall show the predicted next step for each offence.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand each type-specific escalation risk.
- Source lines: [2675-2675](../docs/design/cooldown-counter.html#L2675).
- Trace: [US-022](../2-user-stories/US-022-cal-account-predictions.md), [BR-022](#br-022), [EX-022](#ex-022).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Derive a next offence at step 2; the prediction identifies step 2.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-136

**Statement:** The system shall show the number of available steps for each offence prediction.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Understand each type-specific escalation risk.
- Source lines: [2675-2675](../docs/design/cooldown-counter.html#L2675).
- Trace: [US-022](../2-user-stories/US-022-cal-account-predictions.md), [BR-022](#br-022), [EX-022](#ex-022).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Configure a four-step ladder; its prediction identifies a total of 4 steps.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-023 - Understand a prediction

Parent: [US-023](../2-user-stories/US-023-cal-account-explanation.md).

<a id="br-023"></a>

**BR-023 - atomic rule set:** [RQ-137](#rq-137), [RQ-138](#rq-138), [RQ-139](#rq-139), [RQ-140](#rq-140).

**Mapping context:** The design exposes this distinct operator outcome. Judge how observation history and clean time affect the result.

<a id="ex-023"></a>

**EX-023 - proposed worked example:**

- Given An account has records on two ladders and its last restriction has expired.
- When I read its prediction explanation.
- Then The explanation follows the selected decay and anchor rules without claiming that one ladder's history describes every other ladder.
- Boundary or exception: No history.
- Boundary or exception: Currently active.
- Boundary or exception: Full reset.
- Boundary or exception: No decay.
- Boundary or exception: Future-dated last record.

**Unanswered mapping questions:** [Q-012](open-questions.md#q-012), [Q-013](open-questions.md#q-013), [Q-024](open-questions.md#q-024), [Q-033](open-questions.md#q-033)

### RQ-137

**Statement:** The system shall explain first-offence predictions for an account without history.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Judge how observation history and clean time affect the result.
- Source lines: [3421-3421](../docs/design/cooldown-counter.html#L3421).
- Trace: [US-023](../2-user-stories/US-023-cal-account-explanation.md), [BR-023](#br-023), [EX-023](#ex-023).
- Dependencies: [US-022](../2-user-stories/US-022-cal-account-predictions.md)
- Acceptance condition: Open an account without records; its explanation states that first offences use each ladder's first step.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-138

**Statement:** The system shall explain when an account's active cooldown ends.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Judge how observation history and clean time affect the result.
- Source lines: [3426-3426](../docs/design/cooldown-counter.html#L3426).
- Trace: [US-023](../2-user-stories/US-023-cal-account-explanation.md), [BR-023](#br-023), [EX-023](#ex-023).
- Dependencies: [US-022](../2-user-stories/US-022-cal-account-predictions.md)
- Acceptance condition: Open an account currently restricted until 2 September 2026; its explanation identifies that expiry date.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-033](open-questions.md#q-033), [Q-024](open-questions.md#q-024)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-139

**Statement:** The system shall explain elapsed clean time using the selected decay anchor.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Judge how observation history and clean time affect the result.
- Source lines: [3424-3426](../docs/design/cooldown-counter.html#L3424).
- Trace: [US-023](../2-user-stories/US-023-cal-account-explanation.md), [BR-023](#br-023), [EX-023](#ex-023).
- Dependencies: [US-022](../2-user-stories/US-022-cal-account-predictions.md)
- Acceptance condition: With a record starting at T and expiring at T+1 day, evaluate at T+6 days: the explanation identifies six days under a start anchor or five days under an expiry anchor.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-012](open-questions.md#q-012)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-140

**Statement:** The system shall explain the configured decay mode's effect on the next prediction.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Judge how observation history and clean time affect the result.
- Source lines: [3427-3429](../docs/design/cooldown-counter.html#L3427).
- Trace: [US-023](../2-user-stories/US-023-cal-account-explanation.md), [BR-023](#br-023), [EX-023](#ex-023).
- Dependencies: [US-022](../2-user-stories/US-022-cal-account-predictions.md)
- Acceptance condition: Switch among Step down one level, Full reset and No decay; the explanation describes the selected mode under the agreed anchor semantics.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-012](open-questions.md#q-012), [Q-013](open-questions.md#q-013)
- Change history: 2026-11-12 - Initial design extraction.

## US-024 - Audit recorded observations

Parent: [US-024](../2-user-stories/US-024-cal-account-history.md).

<a id="br-024"></a>

**BR-024 - atomic rule set:** [RQ-141](#rq-141), [RQ-142](#rq-142), [RQ-143](#rq-143), [RQ-144](#rq-144), [RQ-145](#rq-145), [RQ-146](#rq-146), [RQ-147](#rq-147), [RQ-148](#rq-148).

**Mapping context:** The design exposes this distinct operator outcome. Distinguish recorded evidence from derived cooldown totals.

<a id="ex-024"></a>

**EX-024 - proposed worked example:**

- Given Records arrive out of order and one has a manual step override.
- When I inspect history.
- Then Records appear chronologically with separate observed remaining and total durations, plus the override transition.
- Boundary or exception: No observations.
- Boundary or exception: Equal timestamps.
- Boundary or exception: Observation is less than derived total.
- Boundary or exception: Exact time hidden by date-only format.

**Unanswered mapping questions:** [Q-019](open-questions.md#q-019), [Q-058](open-questions.md#q-058)

### RQ-141

**Statement:** The system shall list account history in chronological order.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Distinguish recorded evidence from derived cooldown totals.
- Source lines: [3414-3414](../docs/design/cooldown-counter.html#L3414), [3440-3443](../docs/design/cooldown-counter.html#L3440).
- Trace: [US-024](../2-user-stories/US-024-cal-account-history.md), [BR-024](#br-024), [EX-024](#ex-024).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Load observations on 3 August, 1 August and 2 August; history displays 1, 2, then 3 August.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-142

**Statement:** The system shall number account-history records in their displayed order.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Distinguish recorded evidence from derived cooldown totals.
- Source lines: [2691-2691](../docs/design/cooldown-counter.html#L2691), [3441-3441](../docs/design/cooldown-counter.html#L3441).
- Trace: [US-024](../2-user-stories/US-024-cal-account-history.md), [BR-024](#br-024), [EX-024](#ex-024).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Load three history records; their displayed sequence numbers are 1, 2 and 3.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-143

**Statement:** The system shall show each history record's recorded date.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Distinguish recorded evidence from derived cooldown totals.
- Source lines: [2692-2692](../docs/design/cooldown-counter.html#L2692), [3441-3441](../docs/design/cooldown-counter.html#L3441).
- Trace: [US-024](../2-user-stories/US-024-cal-account-history.md), [BR-024](#br-024), [EX-024](#ex-024).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Load a record starting 29 August 2026; history identifies that recorded date.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-019](open-questions.md#q-019)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-144

**Statement:** The system shall show each history record's offence type.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Distinguish recorded evidence from derived cooldown totals.
- Source lines: [2693-2693](../docs/design/cooldown-counter.html#L2693), [3441-3441](../docs/design/cooldown-counter.html#L3441).
- Trace: [US-024](../2-user-stories/US-024-cal-account-history.md), [BR-024](#br-024), [EX-024](#ex-024).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Load a VACLive record; its history row identifies VACLive.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-145

**Statement:** The system shall show each history record's observed remaining duration.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Distinguish recorded evidence from derived cooldown totals.
- Source lines: [2694-2694](../docs/design/cooldown-counter.html#L2694), [3442-3442](../docs/design/cooldown-counter.html#L3442).
- Trace: [US-024](../2-user-stories/US-024-cal-account-history.md), [BR-024](#br-024), [EX-024](#ex-024).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Load an observation with 90 minutes remaining; its history observed column reports 90 minutes using the agreed duration format.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-146

**Statement:** The system shall show each history record's derived total duration separately from its observation.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Distinguish recorded evidence from derived cooldown totals.
- Source lines: [2695-2695](../docs/design/cooldown-counter.html#L2695), [3442-3442](../docs/design/cooldown-counter.html#L3442).
- Trace: [US-024](../2-user-stories/US-024-cal-account-history.md), [BR-024](#br-024), [EX-024](#ex-024).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Load an observation with 90 minutes remaining and a derived seven-day total; history presents those as separate values.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-147

**Statement:** The system shall show each history record's escalation or override transition.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Distinguish recorded evidence from derived cooldown totals.
- Source lines: [2696-2696](../docs/design/cooldown-counter.html#L2696), [3443-3443](../docs/design/cooldown-counter.html#L3443).
- Trace: [US-024](../2-user-stories/US-024-cal-account-history.md), [BR-024](#br-024), [EX-024](#ex-024).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Load a manually forced step-2 observation; its history transition identifies the manual override to step 2.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-148

**Statement:** The system shall show a no-recorded-cooldowns state for empty account history.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Distinguish recorded evidence from derived cooldown totals.
- Source lines: [2699-2700](../docs/design/cooldown-counter.html#L2699).
- Trace: [US-024](../2-user-stories/US-024-cal-account-history.md), [BR-024](#br-024), [EX-024](#ex-024).
- Dependencies: [US-020](../2-user-stories/US-020-cal-account-detail.md)
- Acceptance condition: Open an account without observations; history shows No cooldowns recorded for this account.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-025 - Start an observation report

Parent: [US-025](../2-user-stories/US-025-obs-report-open.md).

<a id="br-025"></a>

**BR-025 - atomic rule set:** [RQ-149](#rq-149), [RQ-150](#rq-150), [RQ-151](#rq-151), [RQ-152](#rq-152).

**Mapping context:** A global sidebar action opens a report overlay; account/time preselection is not settled.

<a id="ex-025"></a>

**EX-025 - proposed worked example:**

- Given The operator is viewing Calendar, Accounts, account detail or Cooldowns.
- When The operator chooses Report observation.
- Then The observation dialog opens over the current view.
- Boundary or exception: Current detail is a different account from the last report.
- Boundary or exception: A prior draft exists.

**Unanswered mapping questions:** [Q-029](open-questions.md#q-029)

### RQ-149

**Statement:** The system shall expose Report observation from the signed-in sidebar.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: A global sidebar action opens a report overlay; account/time preselection is not settled.
- Source lines: [2336-2336](../docs/design/cooldown-counter.html#L2336).
- Trace: [US-025](../2-user-stories/US-025-obs-report-open.md), [BR-025](#br-025), [EX-025](#ex-025).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Inspect all signed-in navigation views; Report observation is available.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-150

**Statement:** The system shall open an observation dialog when Report observation is selected.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: A global sidebar action opens a report overlay; account/time preselection is not settled.
- Source lines: [2799-2805](../docs/design/cooldown-counter.html#L2799), [3657-3658](../docs/design/cooldown-counter.html#L3657).
- Trace: [US-025](../2-user-stories/US-025-obs-report-open.md), [BR-025](#br-025), [EX-025](#ex-025).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Select Report observation; the report overlay becomes visible.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-151

**Statement:** The system shall explain that the operator supplies an observation while the ladder derives total duration.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: A global sidebar action opens a report overlay; account/time preselection is not settled.
- Source lines: [2804-2805](../docs/design/cooldown-counter.html#L2804).
- Trace: [US-025](../2-user-stories/US-025-obs-report-open.md), [BR-025](#br-025), [EX-025](#ex-025).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Inspect the open dialog and find the evidence-versus-estimate explanation.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-152

**Statement:** The system shall display the target account identity before accepting a report.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: A global sidebar action opens a report overlay; account/time preselection is not settled.
- Source lines: [2813-2822](../docs/design/cooldown-counter.html#L2813), [3661-3661](../docs/design/cooldown-counter.html#L3661).
- Trace: [US-025](../2-user-stories/US-025-obs-report-open.md), [BR-025](#br-025), [EX-025](#ex-025).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md)
- Acceptance condition: Open a report from any view and inspect its selected tag and SteamID before submission.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-026 - Leave an unfinished report

Parent: [US-026](../2-user-stories/US-026-obs-report-cancel.md).

<a id="br-026"></a>

**BR-026 - atomic rule set:** [RQ-153](#rq-153), [RQ-154](#rq-154), [RQ-155](#rq-155).

**Mapping context:** Both close and Cancel toggle the dialog off without appending an event; draft retention needs an explicit decision.

<a id="ex-026"></a>

**EX-026 - proposed worked example:**

- Given The report contains unsaved changes.
- When The operator closes it or selects Cancel.
- Then The dialog closes without a new cooldown.
- Boundary or exception: Reopening the draft.
- Boundary or exception: Cancel after an override.
- Boundary or exception: Logout with unfinished data.

**Unanswered mapping questions:** [Q-029](open-questions.md#q-029), [Q-028](open-questions.md#q-028)

### RQ-153

**Statement:** The system shall close the observation dialog from its close control.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Both close and Cancel toggle the dialog off without appending an event; draft retention needs an explicit decision.
- Source lines: [2807-2807](../docs/design/cooldown-counter.html#L2807), [3659-3659](../docs/design/cooldown-counter.html#L3659).
- Trace: [US-026](../2-user-stories/US-026-obs-report-cancel.md), [BR-026](#br-026), [EX-026](#ex-026).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Activate the close control and observe the dialog disappear.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-154

**Statement:** The system shall close the observation dialog from Cancel.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Both close and Cancel toggle the dialog off without appending an event; draft retention needs an explicit decision.
- Source lines: [2950-2950](../docs/design/cooldown-counter.html#L2950), [3659-3659](../docs/design/cooldown-counter.html#L3659).
- Trace: [US-026](../2-user-stories/US-026-obs-report-cancel.md), [BR-026](#br-026), [EX-026](#ex-026).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Activate Cancel and observe the dialog disappear.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-155

**Statement:** The system shall leave the cooldown history unchanged when an unfinished report is cancelled.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Both close and Cancel toggle the dialog off without appending an event; draft retention needs an explicit decision.
- Source lines: [3659-3659](../docs/design/cooldown-counter.html#L3659).
- Trace: [US-026](../2-user-stories/US-026-obs-report-cancel.md), [BR-026](#br-026), [EX-026](#ex-026).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Compare cooldown count before opening and after cancellation; no new event exists.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-027 - Identify the report account

Parent: [US-027](../2-user-stories/US-027-obs-account-selection.md).

<a id="br-027"></a>

**BR-027 - atomic rule set:** [RQ-156](#rq-156), [RQ-157](#rq-157), [RQ-158](#rq-158), [RQ-159](#rq-159), [RQ-160](#rq-160), [RQ-161](#rq-161), [RQ-162](#rq-162), [RQ-163](#rq-163), [RQ-164](#rq-164), [RQ-165](#rq-165).

**Mapping context:** Searchable account identity combines tag, SteamID and avatar cues.

<a id="ex-027"></a>

**EX-027 - proposed worked example:**

- Given The tracked fleet includes hbh_01 and a different account.
- When The operator searches part of a tag or SteamID and selects a match.
- Then The selected report account displays that tag and SteamID.
- Boundary or exception: Case difference.
- Boundary or exception: Surrounding search whitespace.
- Boundary or exception: No matches.
- Boundary or exception: No accounts.

**Unanswered mapping questions:** None identified for this narrow obligation.

### RQ-156

**Statement:** The system shall display the selected report account tag.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Searchable account identity combines tag, SteamID and avatar cues.
- Source lines: [2818-2818](../docs/design/cooldown-counter.html#L2818), [3661-3661](../docs/design/cooldown-counter.html#L3661).
- Trace: [US-027](../2-user-stories/US-027-obs-account-selection.md), [BR-027](#br-027), [EX-027](#ex-027).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Select hbh_01; hbh_01 appears in the closed selector.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-157

**Statement:** The system shall display the selected report account SteamID.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Searchable account identity combines tag, SteamID and avatar cues.
- Source lines: [2819-2819](../docs/design/cooldown-counter.html#L2819), [3661-3661](../docs/design/cooldown-counter.html#L3661).
- Trace: [US-027](../2-user-stories/US-027-obs-account-selection.md), [BR-027](#br-027), [EX-027](#ex-027).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Select an account; its full SteamID is available in the selected identity.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-158

**Statement:** The system shall display an account avatar or initials cue in report selection.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Searchable account identity combines tag, SteamID and avatar cues.
- Source lines: [2816-2816](../docs/design/cooldown-counter.html#L2816), [2831-2831](../docs/design/cooldown-counter.html#L2831).
- Trace: [US-027](../2-user-stories/US-027-obs-account-selection.md), [BR-027](#br-027), [EX-027](#ex-027).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Inspect selected and listed account identities; each includes its avatar/initials cue.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-159

**Statement:** The system shall filter report accounts by case-insensitive tag substring.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Searchable account identity combines tag, SteamID and avatar cues.
- Source lines: [3668-3669](../docs/design/cooldown-counter.html#L3668).
- Trace: [US-027](../2-user-stories/US-027-obs-account-selection.md), [BR-027](#br-027), [EX-027](#ex-027).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Searching HBH_01 includes the account tagged hbh_01.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-160

**Statement:** The system shall filter report accounts by SteamID substring.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Searchable account identity combines tag, SteamID and avatar cues.
- Source lines: [3668-3669](../docs/design/cooldown-counter.html#L3668).
- Trace: [US-027](../2-user-stories/US-027-obs-account-selection.md), [BR-027](#br-027), [EX-027](#ex-027).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Searching a unique suffix includes the account whose SteamID has that suffix.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-161

**Statement:** The system shall ignore surrounding whitespace in account search.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Searchable account identity combines tag, SteamID and avatar cues.
- Source lines: [3668-3668](../docs/design/cooldown-counter.html#L3668).
- Trace: [US-027](../2-user-stories/US-027-obs-account-selection.md), [BR-027](#br-027), [EX-027](#ex-027).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Searching a matching tag with leading and trailing spaces returns the same accounts.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-162

**Statement:** The system shall mark the selected account in the report account results.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Searchable account identity combines tag, SteamID and avatar cues.
- Source lines: [2836-2836](../docs/design/cooldown-counter.html#L2836), [3672-3673](../docs/design/cooldown-counter.html#L3672).
- Trace: [US-027](../2-user-stories/US-027-obs-account-selection.md), [BR-027](#br-027), [EX-027](#ex-027).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Open the account dropdown and find the selection indicator on the chosen account.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-163

**Statement:** The system shall show an account no-match state when the report search returns no accounts.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Searchable account identity combines tag, SteamID and avatar cues.
- Source lines: [2839-2841](../docs/design/cooldown-counter.html#L2839), [3677-3679](../docs/design/cooldown-counter.html#L3677).
- Trace: [US-027](../2-user-stories/US-027-obs-account-selection.md), [BR-027](#br-027), [EX-027](#ex-027).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Search an unmatched token; the no-account-matches message appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-164

**Statement:** The system shall close the account dropdown after an account is selected.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Searchable account identity combines tag, SteamID and avatar cues.
- Source lines: [3674-3674](../docs/design/cooldown-counter.html#L3674).
- Trace: [US-027](../2-user-stories/US-027-obs-account-selection.md), [BR-027](#br-027), [EX-027](#ex-027).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Choose a result; the dropdown closes and the target identity updates.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-165

**Statement:** The system shall clear the report account search when the account dropdown is toggled.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Searchable account identity combines tag, SteamID and avatar cues.
- Source lines: [3666-3666](../docs/design/cooldown-counter.html#L3666).
- Trace: [US-027](../2-user-stories/US-027-obs-account-selection.md), [BR-027](#br-027), [EX-027](#ex-027).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Enter a search, close and reopen the dropdown; its search is empty.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-028 - Identify the observed offence

Parent: [US-028](../2-user-stories/US-028-obs-offence-selection.md).

<a id="br-028"></a>

**BR-028 - atomic rule set:** [RQ-166](#rq-166), [RQ-167](#rq-167), [RQ-168](#rq-168), [RQ-169](#rq-169), [RQ-170](#rq-170), [RQ-171](#rq-171), [RQ-172](#rq-172), [RQ-173](#rq-173), [RQ-174](#rq-174), [RQ-175](#rq-175), [RQ-176](#rq-176), [RQ-177](#rq-177), [RQ-178](#rq-178), [RQ-179](#rq-179).

**Mapping context:** The report offers searchable offence definitions with first-step information.

<a id="ex-028"></a>

**EX-028 - proposed worked example:**

- Given Abandoning and Team Damage are configured.
- When The operator searches a name, short code or note and selects a match.
- Then The selected offence and its ladder metadata appear in the report.
- Boundary or exception: Case and whitespace differences.
- Boundary or exception: No matches.
- Boundary or exception: Existing manual override.

**Unanswered mapping questions:** None identified for this narrow obligation.

### RQ-166

**Statement:** The system shall display the selected report offence name.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [2858-2858](../docs/design/cooldown-counter.html#L2858), [3701-3701](../docs/design/cooldown-counter.html#L3701).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Choose Team Damage; the selected offence displays Team Damage.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-167

**Statement:** The system shall display the selected offence ladder length in the report.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [2859-2859](../docs/design/cooldown-counter.html#L2859), [3701-3701](../docs/design/cooldown-counter.html#L3701).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Choose a four-step type; its selector metadata reports four steps.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-168

**Statement:** The system shall display the selected offence first-step duration in the report.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [2859-2859](../docs/design/cooldown-counter.html#L2859), [3701-3701](../docs/design/cooldown-counter.html#L3701).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Choose Abandoning with its default ladder; metadata reports a 30-minute start.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-169

**Statement:** The system shall search report offence names case-insensitively.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [3707-3708](../docs/design/cooldown-counter.html#L3707).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Searching abandoning matches Abandoning.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-170

**Statement:** The system shall search report offence short codes case-insensitively.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [3707-3708](../docs/design/cooldown-counter.html#L3707).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Searching abd matches the default Abandoning type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-171

**Statement:** The system shall search report offence notes case-insensitively.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [3707-3708](../docs/design/cooldown-counter.html#L3707).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Searching text present only in a note returns that type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-172

**Statement:** The system shall ignore surrounding whitespace in report offence search.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [3707-3707](../docs/design/cooldown-counter.html#L3707).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: A note/name/code query with surrounding spaces produces the same matches.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-173

**Statement:** The system shall display an offence note or short-code fallback in each report option.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [2873-2873](../docs/design/cooldown-counter.html#L2873), [3709-3709](../docs/design/cooldown-counter.html#L3709).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: A type with a note shows the note; a type without a note shows its code.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-174

**Statement:** The system shall display the first-step duration in each report offence option.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [2875-2875](../docs/design/cooldown-counter.html#L2875), [3710-3710](../docs/design/cooldown-counter.html#L3710).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Each option shows the configured duration at its first step.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-175

**Statement:** The system shall mark the selected report offence in the option list.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [2876-2876](../docs/design/cooldown-counter.html#L2876), [3711-3712](../docs/design/cooldown-counter.html#L3711).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Open the type selector; the current type carries the selected indicator.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-176

**Statement:** The system shall show an offence no-match state when report offence search returns no types.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [2879-2881](../docs/design/cooldown-counter.html#L2879), [3716-3718](../docs/design/cooldown-counter.html#L3716).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Search an unmatched token; the no-offence-type-matches message appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-177

**Statement:** The system shall clear the manual step override when the report offence changes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [3713-3713](../docs/design/cooldown-counter.html#L3713).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Override Abandoning, then choose Team Damage; its predicted step is selected.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-178

**Statement:** The system shall close the report offence dropdown after selection.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [3713-3713](../docs/design/cooldown-counter.html#L3713).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Choose a type; the dropdown closes.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-179

**Statement:** The system shall clear the report offence search after selection.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers searchable offence definitions with first-step information.
- Source lines: [3713-3713](../docs/design/cooldown-counter.html#L3713).
- Trace: [US-028](../2-user-stories/US-028-obs-offence-selection.md), [BR-028](#br-028), [EX-028](#ex-028).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Search and choose a type, then reopen the selector; search is empty.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-029 - Locate an observation in time

Parent: [US-029](../2-user-stories/US-029-obs-observation-time.md).

<a id="br-029"></a>

**BR-029 - atomic rule set:** [RQ-180](#rq-180), [RQ-181](#rq-181), [RQ-182](#rq-182).

**Mapping context:** The date label, remaining-time label and model terms conflict; both timestamps may be necessary.

<a id="ex-029"></a>

**EX-029 - proposed worked example:**

- Given An operator sees 30 minutes remaining on a cooldown issued earlier.
- When The operator enters its time evidence.
- Then The saved record distinguishes the agreed event and observation times without silent substitution.
- Boundary or exception: Historical event.
- Boundary or exception: Unknown issue time.
- Boundary or exception: Daylight-saving transition.
- Boundary or exception: Different operator timezone.

**Unanswered mapping questions:** [Q-030](open-questions.md#q-030), [Q-031](open-questions.md#q-031), [Q-033](open-questions.md#q-033), [Q-038](open-questions.md#q-038)

### RQ-180

**Statement:** The system shall provide a date-and-time input in the observation report.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The date label, remaining-time label and model terms conflict; both timestamps may be necessary.
- Source lines: [2848-2849](../docs/design/cooldown-counter.html#L2848).
- Trace: [US-029](../2-user-stories/US-029-obs-observation-time.md), [BR-029](#br-029), [EX-029](#ex-029).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: The operator can enter a date and a time independently of remaining duration.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-181

**Statement:** The system shall reject an invalid required report timestamp with a field error.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The date label, remaining-time label and model terms conflict; both timestamps may be necessary.
- Source lines: [2849-2849](../docs/design/cooldown-counter.html#L2849), [3751-3752](../docs/design/cooldown-counter.html#L3751).
- Trace: [US-029](../2-user-stories/US-029-obs-observation-time.md), [BR-029](#br-029), [EX-029](#ex-029).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Clear the required timestamp and submit; no record is created and the invalid field is identified.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-030](open-questions.md#q-030), [Q-038](open-questions.md#q-038)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-182

**Statement:** The system shall preserve the agreed temporal meaning of a report timestamp across operator timezones.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The date label, remaining-time label and model terms conflict; both timestamps may be necessary.
- Source lines: [2848-2849](../docs/design/cooldown-counter.html#L2848), [3751-3752](../docs/design/cooldown-counter.html#L3751).
- Trace: [US-029](../2-user-stories/US-029-obs-observation-time.md), [BR-029](#br-029), [EX-029](#ex-029).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Two operators view the same saved instant in different zones; it denotes the same agreed event time.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-030](open-questions.md#q-030), [Q-031](open-questions.md#q-031)
- Change history: 2026-11-12 - Initial design extraction.

## US-030 - Enter observed time remaining

Parent: [US-030](../2-user-stories/US-030-obs-remaining-duration.md).

<a id="br-030"></a>

**BR-030 - atomic rule set:** [RQ-183](#rq-183), [RQ-184](#rq-184), [RQ-185](#rq-185), [RQ-186](#rq-186), [RQ-187](#rq-187), [RQ-188](#rq-188), [RQ-189](#rq-189).

**Mapping context:** The form represents remaining duration separately from derived total and sums three components.

<a id="ex-030"></a>

**EX-030 - proposed worked example:**

- Given A report is open.
- When The operator enters one day, two hours and three minutes.
- Then Under additive-entry semantics the summary represents 1563 minutes remaining.
- Boundary or exception: All blank or zero.
- Boundary or exception: Negative/nonfinite input.
- Boundary or exception: 25 hours.
- Boundary or exception: Fractional minutes.
- Boundary or exception: Lower units currently appear muted.

**Unanswered mapping questions:** [Q-034](open-questions.md#q-034), [Q-035](open-questions.md#q-035), [Q-030](open-questions.md#q-030), [Q-058](open-questions.md#q-058)

### RQ-183

**Statement:** The system shall provide a days component for observed remaining duration.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The form represents remaining duration separately from derived total and sums three components.
- Source lines: [2891-2896](../docs/design/cooldown-counter.html#L2891), [3685-3685](../docs/design/cooldown-counter.html#L3685).
- Trace: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [BR-030](#br-030), [EX-030](#ex-030).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: The operator can enter a days component in the report.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-184

**Statement:** The system shall provide an hours component for observed remaining duration.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The form represents remaining duration separately from derived total and sums three components.
- Source lines: [2891-2896](../docs/design/cooldown-counter.html#L2891), [3686-3686](../docs/design/cooldown-counter.html#L3686).
- Trace: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [BR-030](#br-030), [EX-030](#ex-030).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: The operator can enter an hours component in the report.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-185

**Statement:** The system shall provide a minutes component for observed remaining duration.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The form represents remaining duration separately from derived total and sums three components.
- Source lines: [2891-2896](../docs/design/cooldown-counter.html#L2891), [3687-3687](../docs/design/cooldown-counter.html#L3687).
- Trace: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [BR-030](#br-030), [EX-030](#ex-030).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: The operator can enter a minutes component in the report.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-186

**Statement:** The system shall identify remaining duration as the time left when the operator looked.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The form represents remaining duration separately from derived total and sums three components.
- Source lines: [2889-2889](../docs/design/cooldown-counter.html#L2889).
- Trace: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [BR-030](#br-030), [EX-030](#ex-030).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Inspect the duration label and find the observation-time meaning.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-187

**Statement:** The system shall calculate additive remaining duration using 1440 minutes per day and 60 minutes per hour.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The form represents remaining duration separately from derived total and sums three components.
- Source lines: [3489-3489](../docs/design/cooldown-counter.html#L3489).
- Trace: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [BR-030](#br-030), [EX-030](#ex-030).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: For accepted additive input 1d, 2h, 3m, the combined remaining value is 1563 minutes.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-035](open-questions.md#q-035)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-188

**Statement:** The system shall display a combined remaining-duration summary.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The form represents remaining duration separately from derived total and sums three components.
- Source lines: [2897-2897](../docs/design/cooldown-counter.html#L2897), [3699-3699](../docs/design/cooldown-counter.html#L3699).
- Trace: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [BR-030](#br-030), [EX-030](#ex-030).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Enter an accepted remaining duration and inspect the corresponding day/hour/minute summary.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-189

**Statement:** The system shall represent observed remaining duration separately from predicted total duration.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The form represents remaining duration separately from derived total and sums three components.
- Source lines: [2687-2687](../docs/design/cooldown-counter.html#L2687), [2694-2695](../docs/design/cooldown-counter.html#L2694), [3442-3442](../docs/design/cooldown-counter.html#L3442), [2776-2776](../docs/design/cooldown-counter.html#L2776).
- Trace: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [BR-030](#br-030), [EX-030](#ex-030).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Save a valid observation whose remaining value differs from total; history exposes both values separately.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-031 - Correct invalid remaining input

Parent: [US-031](../2-user-stories/US-031-obs-duration-validation.md).

<a id="br-031"></a>

**BR-031 - atomic rule set:** [RQ-190](#rq-190), [RQ-191](#rq-191), [RQ-192](#rq-192), [RQ-193](#rq-193), [RQ-194](#rq-194).

**Mapping context:** The prototype substitutes and rounds values; production semantics need agreement.

<a id="ex-031"></a>

**EX-031 - proposed worked example:**

- Given A report has a valid account and offence.
- When The operator enters invalid remaining input and submits.
- Then The invalid input is identified without creating a silently changed observation.
- Boundary or exception: Negative days with compensating positive hours.
- Boundary or exception: NaN/nonnumeric input.
- Boundary or exception: Infinity.
- Boundary or exception: All empty.
- Boundary or exception: Zero.
- Boundary or exception: Fractional/overflow components.

**Unanswered mapping questions:** [Q-034](open-questions.md#q-034), [Q-038](open-questions.md#q-038)

### RQ-190

**Statement:** The system shall reject nonfinite remaining-duration input.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype substitutes and rounds values; production semantics need agreement.
- Source lines: [2894-2894](../docs/design/cooldown-counter.html#L2894), [3489-3489](../docs/design/cooldown-counter.html#L3489), [3753-3753](../docs/design/cooldown-counter.html#L3753).
- Trace: [US-031](../2-user-stories/US-031-obs-duration-validation.md), [BR-031](#br-031), [EX-031](#ex-031).
- Dependencies: [US-030](../2-user-stories/US-030-obs-remaining-duration.md)
- Acceptance condition: Submit an infinite or nonfinite duration through the authoritative boundary; no observation is stored.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-034](open-questions.md#q-034)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-191

**Statement:** The system shall reject negative remaining-duration components.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype substitutes and rounds values; production semantics need agreement.
- Source lines: [2894-2894](../docs/design/cooldown-counter.html#L2894), [3489-3489](../docs/design/cooldown-counter.html#L3489), [3753-3753](../docs/design/cooldown-counter.html#L3753).
- Trace: [US-031](../2-user-stories/US-031-obs-duration-validation.md), [BR-031](#br-031), [EX-031](#ex-031).
- Dependencies: [US-030](../2-user-stories/US-030-obs-remaining-duration.md)
- Acceptance condition: Submit -1 day and +25 hours; the negative component is identified rather than netting to a valid hour.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-034](open-questions.md#q-034)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-192

**Statement:** The system shall identify an invalid required remaining-duration value before recording.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype substitutes and rounds values; production semantics need agreement.
- Source lines: [2894-2894](../docs/design/cooldown-counter.html#L2894), [3489-3489](../docs/design/cooldown-counter.html#L3489), [3753-3753](../docs/design/cooldown-counter.html#L3753).
- Trace: [US-031](../2-user-stories/US-031-obs-duration-validation.md), [BR-031](#br-031), [EX-031](#ex-031).
- Dependencies: [US-030](../2-user-stories/US-030-obs-remaining-duration.md)
- Acceptance condition: Submit an invalid required remaining duration; the field error appears and event count stays unchanged.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-034](open-questions.md#q-034), [Q-038](open-questions.md#q-038)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-193

**Statement:** The system shall preserve a valid entered remaining duration without unannounced substitution.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype substitutes and rounds values; production semantics need agreement.
- Source lines: [3489-3489](../docs/design/cooldown-counter.html#L3489), [3753-3755](../docs/design/cooldown-counter.html#L3753).
- Trace: [US-031](../2-user-stories/US-031-obs-duration-validation.md), [BR-031](#br-031), [EX-031](#ex-031).
- Dependencies: [US-030](../2-user-stories/US-030-obs-remaining-duration.md)
- Acceptance condition: A zero value is either accepted as zero or rejected under the agreed rule; it is never silently saved as one minute.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-034](open-questions.md#q-034)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-194

**Statement:** The system shall apply the agreed duration precision consistently in preview and save.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype substitutes and rounds values; production semantics need agreement.
- Source lines: [3489-3489](../docs/design/cooldown-counter.html#L3489), [3699-3699](../docs/design/cooldown-counter.html#L3699), [3753-3755](../docs/design/cooldown-counter.html#L3753).
- Trace: [US-031](../2-user-stories/US-031-obs-duration-validation.md), [BR-031](#br-031), [EX-031](#ex-031).
- Dependencies: [US-030](../2-user-stories/US-030-obs-remaining-duration.md)
- Acceptance condition: For an accepted fractional or overflow input, the preview and persisted remaining value match the agreed normalization.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-034](open-questions.md#q-034)
- Change history: 2026-11-12 - Initial design extraction.

## US-032 - Understand the predicted report total

Parent: [US-032](../2-user-stories/US-032-obs-report-preview.md).

<a id="br-032"></a>

**BR-032 - atomic rule set:** [RQ-195](#rq-195), [RQ-196](#rq-196), [RQ-197](#rq-197), [RQ-198](#rq-198), [RQ-199](#rq-199), [RQ-200](#rq-200), [RQ-201](#rq-201), [RQ-202](#rq-202).

**Mapping context:** The preview shows total, step, history sample count and decay explanation.

<a id="ex-032"></a>

**EX-032 - proposed worked example:**

- Given An account has no prior cooldown for the chosen type.
- When The operator reviews the report preview.
- Then The first step, total duration and no-prior-history explanation appear.
- Boundary or exception: History with decay.
- Boundary or exception: Maximum ladder step.
- Boundary or exception: Historical insertion.
- Boundary or exception: Manual override.

**Unanswered mapping questions:** [Q-032](open-questions.md#q-032), [Q-030](open-questions.md#q-030), [Q-042](open-questions.md#q-042)

### RQ-195

**Statement:** The system shall display the report's selected total cooldown duration before recording.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The preview shows total, step, history sample count and decay explanation.
- Source lines: [2912-2914](../docs/design/cooldown-counter.html#L2912), [3494-3494](../docs/design/cooldown-counter.html#L3494).
- Trace: [US-032](../2-user-stories/US-032-obs-report-preview.md), [BR-032](#br-032), [EX-032](#ex-032).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md)
- Acceptance condition: Open a report on default first Abandoning; preview displays 30m total.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-196

**Statement:** The system shall display the report's selected ladder step number.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The preview shows total, step, history sample count and decay explanation.
- Source lines: [2915-2915](../docs/design/cooldown-counter.html#L2915), [3494-3494](../docs/design/cooldown-counter.html#L3494).
- Trace: [US-032](../2-user-stories/US-032-obs-report-preview.md), [BR-032](#br-032), [EX-032](#ex-032).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md)
- Acceptance condition: On step 2 of a four-step ladder, preview identifies step 2.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-197

**Statement:** The system shall display the report's ladder step count.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The preview shows total, step, history sample count and decay explanation.
- Source lines: [2915-2915](../docs/design/cooldown-counter.html#L2915), [3494-3494](../docs/design/cooldown-counter.html#L3494).
- Trace: [US-032](../2-user-stories/US-032-obs-report-preview.md), [BR-032](#br-032), [EX-032](#ex-032).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md)
- Acceptance condition: For the default Abandoning ladder the preview denominator is 4.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-198

**Statement:** The system shall explain a first-step prediction when the selected account has no prior history for that type.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The preview shows total, step, history sample count and decay explanation.
- Source lines: [3498-3499](../docs/design/cooldown-counter.html#L3498).
- Trace: [US-032](../2-user-stories/US-032-obs-report-preview.md), [BR-032](#br-032), [EX-032](#ex-032).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md)
- Acceptance condition: Choose a type with no history; the explanation identifies no prior cooldown and step 1.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-199

**Statement:** The system shall state the prior same-type sample count in a history-based report explanation.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The preview shows total, step, history sample count and decay explanation.
- Source lines: [3500-3500](../docs/design/cooldown-counter.html#L3500).
- Trace: [US-032](../2-user-stories/US-032-obs-report-preview.md), [BR-032](#br-032), [EX-032](#ex-032).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md)
- Acceptance condition: For an account with two prior same-type events, the explanation reports two prior samples.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-200

**Statement:** The system shall explain the post-decay base step used for a history-based report prediction.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The preview shows total, step, history sample count and decay explanation.
- Source lines: [3500-3500](../docs/design/cooldown-counter.html#L3500).
- Trace: [US-032](../2-user-stories/US-032-obs-report-preview.md), [BR-032](#br-032), [EX-032](#ex-032).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md)
- Acceptance condition: For a known base step, the explanation identifies that base before the next offence advances it.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-201

**Statement:** The system shall calculate an event-time report preview from history preceding that event time.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The preview shows total, step, history sample count and decay explanation.
- Source lines: [3483-3483](../docs/design/cooldown-counter.html#L3483), [3237-3239](../docs/design/cooldown-counter.html#L3237), [3208-3225](../docs/design/cooldown-counter.html#L3208).
- Trace: [US-032](../2-user-stories/US-032-obs-report-preview.md), [BR-032](#br-032), [EX-032](#ex-032).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md)
- Acceptance condition: Insert a backdated report between existing events; its preview uses only the agreed preceding history.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-032](open-questions.md#q-032)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-202

**Statement:** The system shall preserve the accepted preview outcome when recording against unchanged inputs and history.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The preview shows total, step, history sample count and decay explanation.
- Source lines: [3483-3501](../docs/design/cooldown-counter.html#L3483), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-032](../2-user-stories/US-032-obs-report-preview.md), [BR-032](#br-032), [EX-032](#ex-032).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md)
- Acceptance condition: Preview a valid report, save without changes, and compare the recorded step and total; they match.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-032](open-questions.md#q-032), [Q-042](open-questions.md#q-042)
- Change history: 2026-11-12 - Initial design extraction.

## US-033 - Record a known ladder step

Parent: [US-033](../2-user-stories/US-033-obs-manual-override.md).

<a id="br-033"></a>

**BR-033 - atomic rule set:** [RQ-203](#rq-203), [RQ-204](#rq-204), [RQ-205](#rq-205), [RQ-206](#rq-206), [RQ-207](#rq-207), [RQ-208](#rq-208), [RQ-209](#rq-209), [RQ-210](#rq-210), [RQ-211](#rq-211), [RQ-212](#rq-212).

**Mapping context:** The report offers a draggable ladder map and explains manual precedence.

<a id="ex-033"></a>

**EX-033 - proposed worked example:**

- Given The estimate selects step 2 in a four-step ladder.
- When The operator selects step 3 on the step map.
- Then The report shows step 3 and identifies manual override.
- Boundary or exception: First/final bounds.
- Boundary or exception: One-step ladder.
- Boundary or exception: Reset to predicted.
- Boundary or exception: Change account or offence.

**Unanswered mapping questions:** [Q-037](open-questions.md#q-037)

### RQ-203

**Statement:** The system shall display every configured step on the report step map.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The report offers a draggable ladder map and explains manual precedence.
- Source lines: [2932-2937](../docs/design/cooldown-counter.html#L2932), [3740-3742](../docs/design/cooldown-counter.html#L3740).
- Trace: [US-033](../2-user-stories/US-033-obs-manual-override.md), [BR-033](#br-033), [EX-033](#ex-033).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Open a four-step ladder; all four step numbers and durations are present.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-204

**Statement:** The system shall mark the report's selected ladder step.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The report offers a draggable ladder map and explains manual precedence.
- Source lines: [2940-2942](../docs/design/cooldown-counter.html#L2940), [3737-3738](../docs/design/cooldown-counter.html#L3737).
- Trace: [US-033](../2-user-stories/US-033-obs-manual-override.md), [BR-033](#br-033), [EX-033](#ex-033).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Select step 3; the map marker aligns with step 3.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-205

**Statement:** The system shall distinguish a manually selected step from the predicted step in the report marker.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers a draggable ladder map and explains manual precedence.
- Source lines: [2941-2941](../docs/design/cooldown-counter.html#L2941), [3739-3739](../docs/design/cooldown-counter.html#L3739).
- Trace: [US-033](../2-user-stories/US-033-obs-manual-override.md), [BR-033](#br-033), [EX-033](#ex-033).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: After overriding, marker text indicates the moved/manual state rather than the predicted state.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-206

**Statement:** The system shall select the nearest ladder step when the operator drags the report step map.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers a draggable ladder map and explains manual precedence.
- Source lines: [3182-3184](../docs/design/cooldown-counter.html#L3182), [3728-3734](../docs/design/cooldown-counter.html#L3728).
- Trace: [US-033](../2-user-stories/US-033-obs-manual-override.md), [BR-033](#br-033), [EX-033](#ex-033).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Drag between adjacent markers across their midpoint; selection snaps to the nearest step.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-207

**Statement:** The system shall clamp drag selection to the first and final configured steps.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers a draggable ladder map and explains manual precedence.
- Source lines: [3182-3183](../docs/design/cooldown-counter.html#L3182).
- Trace: [US-033](../2-user-stories/US-033-obs-manual-override.md), [BR-033](#br-033), [EX-033](#ex-033).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Drag left or right beyond the track; selected step remains within ladder bounds.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-208

**Statement:** The system shall support selecting the sole step of a one-step report ladder.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers a draggable ladder map and explains manual precedence.
- Source lines: [3180-3183](../docs/design/cooldown-counter.html#L3180), [3737-3737](../docs/design/cooldown-counter.html#L3737).
- Trace: [US-033](../2-user-stories/US-033-obs-manual-override.md), [BR-033](#br-033), [EX-033](#ex-033).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Use a one-step type; dragging or selecting cannot produce step zero or a second step.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-209

**Statement:** The system shall explain the active manual override in the report preview.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers a draggable ladder map and explains manual precedence.
- Source lines: [3496-3497](../docs/design/cooldown-counter.html#L3496).
- Trace: [US-033](../2-user-stories/US-033-obs-manual-override.md), [BR-033](#br-033), [EX-033](#ex-033).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Override the prediction; preview states selected manual step and predicted alternative.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-210

**Statement:** The system shall offer Reset to predicted while a report override is active.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The report offers a draggable ladder map and explains manual precedence.
- Source lines: [2925-2928](../docs/design/cooldown-counter.html#L2925).
- Trace: [US-033](../2-user-stories/US-033-obs-manual-override.md), [BR-033](#br-033), [EX-033](#ex-033).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: With an override active, Reset to predicted is available.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-211

**Statement:** The system shall remove the report override when Reset to predicted is selected.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers a draggable ladder map and explains manual precedence.
- Source lines: [3736-3736](../docs/design/cooldown-counter.html#L3736).
- Trace: [US-033](../2-user-stories/US-033-obs-manual-override.md), [BR-033](#br-033), [EX-033](#ex-033).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Select Reset to predicted; selection returns to the current prediction.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-212

**Statement:** The system shall preserve an accepted manual step in the recorded observation.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report offers a draggable ladder map and explains manual precedence.
- Source lines: [3217-3218](../docs/design/cooldown-counter.html#L3217), [3755-3755](../docs/design/cooldown-counter.html#L3755).
- Trace: [US-033](../2-user-stories/US-033-obs-manual-override.md), [BR-033](#br-033), [EX-033](#ex-033).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Override to step 3, save a valid report, and inspect replay/history; the forced step remains step 3.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-034 - Resolve evidence that exceeds the estimate

Parent: [US-034](../2-user-stories/US-034-obs-duration-conflict.md).

<a id="br-034"></a>

**BR-034 - atomic rule set:** [RQ-213](#rq-213), [RQ-214](#rq-214), [RQ-215](#rq-215), [RQ-216](#rq-216).

**Mapping context:** A warning and first-fitting-step correction exist; saving an unresolved mismatch is not defined.

<a id="ex-034"></a>

**EX-034 - proposed worked example:**

- Given The selected step total is 30 minutes.
- When The operator enters 90 minutes remaining.
- Then A mismatch warning appears and the 2-hour step is offered if configured.
- Boundary or exception: Remaining equals total.
- Boundary or exception: Remaining exceeds every step.
- Boundary or exception: Nonmonotonic configured ladder.

**Unanswered mapping questions:** [Q-036](open-questions.md#q-036)

### RQ-213

**Statement:** The system shall warn when observed remaining duration exceeds the selected total.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A warning and first-fitting-step correction exist; saving an unresolved mismatch is not defined.
- Source lines: [2899-2901](../docs/design/cooldown-counter.html#L2899), [3490-3490](../docs/design/cooldown-counter.html#L3490), [3723-3723](../docs/design/cooldown-counter.html#L3723).
- Trace: [US-034](../2-user-stories/US-034-obs-duration-conflict.md), [BR-034](#br-034), [EX-034](#ex-034).
- Dependencies: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Enter 90m remaining against a 30m selected total; the warning appears.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-214

**Statement:** The system shall identify the conflicting remaining duration and selected total in the warning.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A warning and first-fitting-step correction exist; saving an unresolved mismatch is not defined.
- Source lines: [2901-2901](../docs/design/cooldown-counter.html#L2901), [3723-3723](../docs/design/cooldown-counter.html#L3723).
- Trace: [US-034](../2-user-stories/US-034-obs-duration-conflict.md), [BR-034](#br-034), [EX-034](#ex-034).
- Dependencies: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: The 90m-versus-30m warning exposes both amounts and the selected step.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-215

**Statement:** The system shall offer the first configured step capable of containing the remaining duration when a different fitting step exists.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A warning and first-fitting-step correction exist; saving an unresolved mismatch is not defined.
- Source lines: [2902-2903](../docs/design/cooldown-counter.html#L2902), [3491-3492](../docs/design/cooldown-counter.html#L3491), [3724-3725](../docs/design/cooldown-counter.html#L3724).
- Trace: [US-034](../2-user-stories/US-034-obs-duration-conflict.md), [BR-034](#br-034), [EX-034](#ex-034).
- Dependencies: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: With [30,120,1440] and 90m remaining at step 1, the correction offers step 2 / 120m.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-216

**Statement:** The system shall select the offered fitting step when the operator accepts the mismatch correction.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A warning and first-fitting-step correction exist; saving an unresolved mismatch is not defined.
- Source lines: [2903-2903](../docs/design/cooldown-counter.html#L2903), [3726-3726](../docs/design/cooldown-counter.html#L3726).
- Trace: [US-034](../2-user-stories/US-034-obs-duration-conflict.md), [BR-034](#br-034), [EX-034](#ex-034).
- Dependencies: [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Accept the step-2 correction; the report is manually set to step 2.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-035 - Record a validated observation

Parent: [US-035](../2-user-stories/US-035-obs-record-observation.md).

<a id="br-035"></a>

**BR-035 - atomic rule set:** [RQ-217](#rq-217), [RQ-218](#rq-218), [RQ-219](#rq-219), [RQ-220](#rq-220), [RQ-221](#rq-221), [RQ-222](#rq-222), [RQ-223](#rq-223).

**Mapping context:** The report append carries account, type, start, observed remaining and optional forced step, then opens account detail.

<a id="ex-035"></a>

**EX-035 - proposed worked example:**

- Given A report contains accepted account, offence, times, remaining duration and optional override.
- When The operator records it successfully.
- Then Exactly one observation appears in that account history and detail is opened.
- Boundary or exception: Cancelled report.
- Boundary or exception: Failed save.
- Boundary or exception: Duplicate click.
- Boundary or exception: Unresolved invalid field.

**Unanswered mapping questions:** [Q-038](open-questions.md#q-038), [Q-030](open-questions.md#q-030), [Q-036](open-questions.md#q-036)

### RQ-217

**Statement:** The system shall expose Record cooldown in the observation dialog.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The report append carries account, type, start, observed remaining and optional forced step, then opens account detail.
- Source lines: [2951-2951](../docs/design/cooldown-counter.html#L2951).
- Trace: [US-035](../2-user-stories/US-035-obs-record-observation.md), [BR-035](#br-035), [EX-035](#ex-035).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md), [US-029](../2-user-stories/US-029-obs-observation-time.md), [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Inspect the report footer and find Record cooldown.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-218

**Statement:** The system shall associate a recorded observation with the selected tracked account.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report append carries account, type, start, observed remaining and optional forced step, then opens account detail.
- Source lines: [3755-3755](../docs/design/cooldown-counter.html#L3755).
- Trace: [US-035](../2-user-stories/US-035-obs-record-observation.md), [BR-035](#br-035), [EX-035](#ex-035).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md), [US-029](../2-user-stories/US-029-obs-observation-time.md), [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Select account B and save; B history contains the observation and A history does not.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-219

**Statement:** The system shall associate a recorded observation with the selected offence type.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report append carries account, type, start, observed remaining and optional forced step, then opens account detail.
- Source lines: [3755-3755](../docs/design/cooldown-counter.html#L3755).
- Trace: [US-035](../2-user-stories/US-035-obs-record-observation.md), [BR-035](#br-035), [EX-035](#ex-035).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md), [US-029](../2-user-stories/US-029-obs-observation-time.md), [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Save Team Damage; history identifies Team Damage rather than a previous selection.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-220

**Statement:** The system shall retain the accepted observed remaining duration in the recorded event.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report append carries account, type, start, observed remaining and optional forced step, then opens account detail.
- Source lines: [3753-3755](../docs/design/cooldown-counter.html#L3753), [3442-3442](../docs/design/cooldown-counter.html#L3442).
- Trace: [US-035](../2-user-stories/US-035-obs-record-observation.md), [BR-035](#br-035), [EX-035](#ex-035).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md), [US-029](../2-user-stories/US-029-obs-observation-time.md), [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Record a valid 45m observation; history shows 45m left independently of predicted total.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-221

**Statement:** The system shall close the report dialog after successful recording.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report append carries account, type, start, observed remaining and optional forced step, then opens account detail.
- Source lines: [3756-3756](../docs/design/cooldown-counter.html#L3756).
- Trace: [US-035](../2-user-stories/US-035-obs-record-observation.md), [BR-035](#br-035), [EX-035](#ex-035).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md), [US-029](../2-user-stories/US-029-obs-observation-time.md), [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Save a valid observation successfully; the report overlay closes.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-222

**Statement:** The system shall open the recorded account's detail view after successful recording.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report append carries account, type, start, observed remaining and optional forced step, then opens account detail.
- Source lines: [3756-3756](../docs/design/cooldown-counter.html#L3756).
- Trace: [US-035](../2-user-stories/US-035-obs-record-observation.md), [BR-035](#br-035), [EX-035](#ex-035).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md), [US-029](../2-user-stories/US-029-obs-observation-time.md), [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Save for account B while viewing Calendar; B detail opens.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-223

**Statement:** The system shall position the calendar base month at the newly recorded event's month after recording.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The report append carries account, type, start, observed remaining and optional forced step, then opens account detail.
- Source lines: [3757-3757](../docs/design/cooldown-counter.html#L3757).
- Trace: [US-035](../2-user-stories/US-035-obs-record-observation.md), [BR-035](#br-035), [EX-035](#ex-035).
- Dependencies: [US-027](../2-user-stories/US-027-obs-account-selection.md), [US-028](../2-user-stories/US-028-obs-offence-selection.md), [US-029](../2-user-stories/US-029-obs-observation-time.md), [US-030](../2-user-stories/US-030-obs-remaining-duration.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Save an accepted historical event; returning to Calendar starts from that event month.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-036 - Prevent invalid observation references

Parent: [US-036](../2-user-stories/US-036-obs-report-integrity.md).

<a id="br-036"></a>

**BR-036 - atomic rule set:** [RQ-224](#rq-224), [RQ-225](#rq-225), [RQ-226](#rq-226), [RQ-227](#rq-227).

**Mapping context:** The prototype assumes valid references and falls back to another account/type or a one-day ladder.

<a id="ex-036"></a>

**EX-036 - proposed worked example:**

- Given A report references an account or type removed before save.
- When The operator submits it.
- Then No invalid record is stored and the unavailable selection is identified.
- Boundary or exception: No accounts.
- Boundary or exception: No types.
- Boundary or exception: Last type deleted.
- Boundary or exception: Stale selected account.

**Unanswered mapping questions:** [Q-038](open-questions.md#q-038), [Q-039](open-questions.md#q-039), [Q-042](open-questions.md#q-042)

### RQ-224

**Statement:** The system shall reject a report whose selected account does not exist at the authoritative save boundary.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype assumes valid references and falls back to another account/type or a one-day ladder.
- Source lines: [3484-3484](../docs/design/cooldown-counter.html#L3484), [3755-3755](../docs/design/cooldown-counter.html#L3755).
- Trace: [US-036](../2-user-stories/US-036-obs-report-integrity.md), [BR-036](#br-036), [EX-036](#ex-036).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md)
- Acceptance condition: Remove the selected account before submission; save fails without creating an orphan.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-039](open-questions.md#q-039), [Q-042](open-questions.md#q-042)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-225

**Statement:** The system shall reject a report whose selected offence type does not exist at the authoritative save boundary.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype assumes valid references and falls back to another account/type or a one-day ladder.
- Source lines: [3188-3188](../docs/design/cooldown-counter.html#L3188), [3482-3485](../docs/design/cooldown-counter.html#L3482), [3755-3755](../docs/design/cooldown-counter.html#L3755).
- Trace: [US-036](../2-user-stories/US-036-obs-report-integrity.md), [BR-036](#br-036), [EX-036](#ex-036).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md)
- Acceptance condition: Remove the selected type before submission; no blank-type or fallback-type event is stored.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-039](open-questions.md#q-039), [Q-042](open-questions.md#q-042)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-226

**Statement:** The system shall show an unavailable-account state when no account can be selected for reporting.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype assumes valid references and falls back to another account/type or a one-day ladder.
- Source lines: [3413-3413](../docs/design/cooldown-counter.html#L3413), [3484-3484](../docs/design/cooldown-counter.html#L3484), [3661-3661](../docs/design/cooldown-counter.html#L3661), [3667-3679](../docs/design/cooldown-counter.html#L3667).
- Trace: [US-036](../2-user-stories/US-036-obs-report-integrity.md), [BR-036](#br-036), [EX-036](#ex-036).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md)
- Acceptance condition: With zero tracked accounts, report UI explains the unavailable account requirement without throwing.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-039](open-questions.md#q-039)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-227

**Statement:** The system shall show an unavailable-offence state when no offence type can be selected for reporting.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype assumes valid references and falls back to another account/type or a one-day ladder.
- Source lines: [3461-3467](../docs/design/cooldown-counter.html#L3461), [3482-3485](../docs/design/cooldown-counter.html#L3482), [3755-3755](../docs/design/cooldown-counter.html#L3755).
- Trace: [US-036](../2-user-stories/US-036-obs-report-integrity.md), [BR-036](#br-036), [EX-036](#ex-036).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md)
- Acceptance condition: Delete all types; report UI explains that no valid offence is available rather than offering an unnamed one-day ladder.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-039](open-questions.md#q-039)
- Change history: 2026-11-12 - Initial design extraction.

## US-037 - Inspect offence ladders

Parent: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md).

<a id="br-037"></a>

**BR-037 - atomic rule set:** [RQ-228](#rq-228), [RQ-229](#rq-229), [RQ-230](#rq-230), [RQ-231](#rq-231), [RQ-232](#rq-232), [RQ-233](#rq-233), [RQ-234](#rq-234).

**Mapping context:** The Cooldowns view exposes names, notes, usage and the final-step hold rule.

<a id="ex-037"></a>

**EX-037 - proposed worked example:**

- Given The five demonstration types are configured.
- When I open Cooldowns.
- Then I can inspect names, notes, usage counts, ordered numbered durations and the final hold.
- Boundary or exception: A one-step ladder is both the first and final step.
- Boundary or exception: No-record and singular-record usage labels remain distinct.

**Unanswered mapping questions:** [Q-053](open-questions.md#q-053)

### RQ-228

**Statement:** The system shall display each configured offence type name.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Operators need to identify the rule being inspected.
- Source lines: [2720-2720](../docs/design/cooldown-counter.html#L2720).
- Trace: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md), [BR-037](#br-037), [EX-037](#ex-037).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: An offence type named Kicking appears under that name.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-229

**Statement:** The system shall display the trigger note for an offence type when one is supplied.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The note describes the category trigger.
- Source lines: [2721-2721](../docs/design/cooldown-counter.html#L2721), [3451-3451](../docs/design/cooldown-counter.html#L3451).
- Trace: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md), [BR-037](#br-037), [EX-037](#ex-037).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: A saved note Left before the match ended appears for Abandoning.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-230

**Statement:** The system shall display the number of observations associated with each offence type.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Usage exposes the impact of changing or deleting the type.
- Source lines: [2722-2722](../docs/design/cooldown-counter.html#L2722), [3449-3452](../docs/design/cooldown-counter.html#L3449).
- Trace: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md), [BR-037](#br-037), [EX-037](#ex-037).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: A type referenced by three observations shows 3 records; an unused type shows no records.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-231

**Statement:** The system shall display the configured offence-type count.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Operators can recognise catalogue size.
- Source lines: [2712-2712](../docs/design/cooldown-counter.html#L2712), [3578-3578](../docs/design/cooldown-counter.html#L3578).
- Trace: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md), [BR-037](#br-037), [EX-037](#ex-037).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Five configured types produce the label 5 TYPES; one produces 1 TYPE.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-232

**Statement:** The system shall display each offence ladder in its configured step order.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Order defines escalation.
- Source lines: [2728-2745](../docs/design/cooldown-counter.html#L2728), [3453-3456](../docs/design/cooldown-counter.html#L3453).
- Trace: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md), [BR-037](#br-037), [EX-037](#ex-037).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Abandoning displays 30m, 2h, 1d and 7d in that order.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-233

**Statement:** The system shall number offence ladder steps from one.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Displayed indices match report selections.
- Source lines: [2742-2745](../docs/design/cooldown-counter.html#L2742), [3454-3454](../docs/design/cooldown-counter.html#L3454).
- Trace: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md), [BR-037](#br-037), [EX-037](#ex-037).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: A four-step ladder displays Step 1 through Step 4.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-234

**Statement:** The system shall indicate that repeated offences hold at the final ladder step.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The final duration is a cap rather than an endless extension.
- Source lines: [2746-2750](../docs/design/cooldown-counter.html#L2746).
- Trace: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md), [BR-037](#br-037), [EX-037](#ex-037).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: The reference shows then holds after the final configured duration.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-038 - Start with the designed offence catalogue

Parent: [US-038](../2-user-stories/US-038-rule-seed-ladders.md).

<a id="br-038"></a>

**BR-038 - atomic rule set:** [RQ-235](#rq-235), [RQ-236](#rq-236), [RQ-237](#rq-237), [RQ-238](#rq-238), [RQ-239](#rq-239).

**Mapping context:** The defaults are explicit seed data, not independently verified game policy.

<a id="ex-038"></a>

**EX-038 - proposed worked example:**

- Given A new installation has no configured catalogue.
- When Initial model data are prepared.
- Then The five represented ladders are available as candidate defaults.
- Boundary or exception: These values need rule-owner confirmation.
- Boundary or exception: Existing customised ladders must not be silently replaced by reseeding.

**Unanswered mapping questions:** [Q-053](open-questions.md#q-053)

### RQ-235

**Statement:** The system shall initialise VACLive with ordered durations of 1200, 10080 and 43200 minutes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The design includes this starting ladder.
- Source lines: [3050-3050](../docs/design/cooldown-counter.html#L3050).
- Trace: [US-038](../2-user-stories/US-038-rule-seed-ladders.md), [BR-038](#br-038), [EX-038](#ex-038).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: VACLive begins with 20h, 7d and 30d.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-053](open-questions.md#q-053)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-236

**Statement:** The system shall initialise Abandoning with ordered durations of 30, 120, 1440 and 10080 minutes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The design includes this starting ladder.
- Source lines: [3051-3051](../docs/design/cooldown-counter.html#L3051).
- Trace: [US-038](../2-user-stories/US-038-rule-seed-ladders.md), [BR-038](#br-038), [EX-038](#ex-038).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Abandoning begins with 30m, 2h, 1d and 7d.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-053](open-questions.md#q-053)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-237

**Statement:** The system shall initialise Team Damage with ordered durations of 30, 120, 1440 and 10080 minutes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The design includes this starting ladder.
- Source lines: [3052-3052](../docs/design/cooldown-counter.html#L3052).
- Trace: [US-038](../2-user-stories/US-038-rule-seed-ladders.md), [BR-038](#br-038), [EX-038](#ex-038).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Team Damage begins with 30m, 2h, 1d and 7d.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-053](open-questions.md#q-053)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-238

**Statement:** The system shall initialise Kicking with ordered durations of 30, 120, 1440 and 10080 minutes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The design includes this starting ladder.
- Source lines: [3053-3053](../docs/design/cooldown-counter.html#L3053).
- Trace: [US-038](../2-user-stories/US-038-rule-seed-ladders.md), [BR-038](#br-038), [EX-038](#ex-038).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Kicking begins with 30m, 2h, 1d and 7d.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-053](open-questions.md#q-053)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-239

**Statement:** The system shall initialise GriefReports with ordered durations of 120, 1440, 10080 and 43200 minutes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The design includes this starting ladder.
- Source lines: [3054-3054](../docs/design/cooldown-counter.html#L3054).
- Trace: [US-038](../2-user-stories/US-038-rule-seed-ladders.md), [BR-038](#br-038), [EX-038](#ex-038).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: GriefReports begins with 2h, 1d, 7d and 30d.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-053](open-questions.md#q-053)
- Change history: 2026-11-12 - Initial design extraction.

## US-039 - Predict escalation independently per account and offence

Parent: [US-039](../2-user-stories/US-039-rule-predict-independent.md).

<a id="br-039"></a>

**BR-039 - atomic rule set:** [RQ-240](#rq-240), [RQ-241](#rq-241), [RQ-242](#rq-242), [RQ-243](#rq-243), [RQ-244](#rq-244), [RQ-245](#rq-245), [RQ-246](#rq-246), [RQ-247](#rq-247), [RQ-248](#rq-248).

**Mapping context:** Isolation and single-step escalation are explicit transition rules.

<a id="ex-039"></a>

**EX-039 - proposed worked example:**

- Given Account A has one Abandoning observation and no Team Damage history.
- When I inspect its predictions before a clean window completes.
- Then Abandoning predicts step 2 at two hours while Team Damage predicts step 1 at 30 minutes.
- Boundary or exception: First offence starts at step 1.
- Boundary or exception: Final-step advancement remains capped.
- Boundary or exception: Accounts and offence types remain isolated.

**Unanswered mapping questions:** [Q-053](open-questions.md#q-053), [Q-037](open-questions.md#q-037), [Q-051](open-questions.md#q-051)

### RQ-240

**Statement:** The system shall maintain a separate ladder state for each account and offence-type pair.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Unrelated history cannot affect the relevant ladder.
- Source lines: [2762-2762](../docs/design/cooldown-counter.html#L2762), [3202-3209](../docs/design/cooldown-counter.html#L3202).
- Trace: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [BR-039](#br-039), [EX-039](#ex-039).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: An Abandoning observation on A does not change Team Damage on A or Abandoning on B.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-241

**Statement:** The system shall initialise an unobserved account and offence-type pair at ladder state zero.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: First offences need a defined initial state.
- Source lines: [3210-3210](../docs/design/cooldown-counter.html#L3210), [3421-3421](../docs/design/cooldown-counter.html#L3421).
- Trace: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [BR-039](#br-039), [EX-039](#ex-039).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: An account with no Abandoning history has stored state zero.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-242

**Statement:** The system shall predict step one for an account and offence-type pair with no history.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A prediction remains available without prior samples.
- Source lines: [3236-3236](../docs/design/cooldown-counter.html#L3236).
- Trace: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [BR-039](#br-039), [EX-039](#ex-039).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: No Abandoning history yields the first 30-minute step.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-243

**Statement:** The system shall apply eligible decay before advancing an unoverridden observation.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Decay and advancement have an ordered meaning.
- Source lines: [3212-3216](../docs/design/cooldown-counter.html#L3212).
- Trace: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [BR-039](#br-039), [EX-039](#ex-039).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Prior step 2 at exactly seven clean days drops to state 1 before advancing to step 2.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-244

**Statement:** The system shall advance an unoverridden observation by one ladder step from its decayed state.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: One offence represents one advancement.
- Source lines: [2760-2760](../docs/design/cooldown-counter.html#L2760), [3216-3216](../docs/design/cooldown-counter.html#L3216).
- Trace: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [BR-039](#br-039), [EX-039](#ex-039).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Prior state 1 with no clean window advances to step 2.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-245

**Statement:** The system shall cap advancement at the final configured ladder step.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Repeated offences cannot index beyond the ladder.
- Source lines: [2750-2750](../docs/design/cooldown-counter.html#L2750), [2760-2760](../docs/design/cooldown-counter.html#L2760), [3216-3216](../docs/design/cooldown-counter.html#L3216).
- Trace: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [BR-039](#br-039), [EX-039](#ex-039).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Another Abandoning offence at step 4 without decay remains at step 4 with a seven-day total.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-246

**Statement:** The system shall use the assigned ladder step duration as the predicted total cooldown duration.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The ladder defines the total penalty.
- Source lines: [3219-3219](../docs/design/cooldown-counter.html#L3219).
- Trace: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [BR-039](#br-039), [EX-039](#ex-039).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: An Abandoning observation assigned step 3 has predicted total 1440 minutes.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-247

**Statement:** The system shall assign a saved cooldown its recorded manual override step in place of automatic advancement.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A deliberate known step replaces the model assignment.
- Source lines: [3217-3218](../docs/design/cooldown-counter.html#L3217).
- Trace: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [BR-039](#br-039), [EX-039](#ex-039).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: A report automatically predicted at step 2 but saved with override step 3 receives the step-3 total.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-037](open-questions.md#q-037)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-248

**Statement:** The system shall use a recorded override state when evaluating later observations of the same account and offence type.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The recorded state becomes the next transition basis.
- Source lines: [3218-3227](../docs/design/cooldown-counter.html#L3218).
- Trace: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [BR-039](#br-039), [EX-039](#ex-039).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: An Abandoning step-3 override followed by an offence without a clean window advances to step 4.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-051](open-questions.md#q-051)
- Change history: 2026-11-12 - Initial design extraction.

## US-040 - Account for clean-time decay

Parent: [US-040](../2-user-stories/US-040-rule-decay.md).

<a id="br-040"></a>

**BR-040 - atomic rule set:** [RQ-249](#rq-249), [RQ-250](#rq-250), [RQ-251](#rq-251), [RQ-252](#rq-252), [RQ-253](#rq-253), [RQ-254](#rq-254), [RQ-255](#rq-255), [RQ-256](#rq-256).

**Mapping context:** The visible default model drops one level per seven clean days from expiry.

<a id="ex-040"></a>

**EX-040 - proposed worked example:**

- Given Abandoning is at stored state 3 after a one-day cooldown.
- When Fourteen clean days pass after its expiry and I inspect the next prediction.
- Then Stored state decays to 1 and the next offence predicts step 2 at two hours.
- Boundary or exception: At 6d 23h 59m there is no full seven-day drop.
- Boundary or exception: At exactly seven days there is one drop.
- Boundary or exception: No clean time accrues before expiry under the default model.
- Boundary or exception: For stored Abandoning state 2, a next offence at expiry plus seven elapsed days produces step 2 (2 hours); one millisecond earlier produces step 3 (1 day).
- Boundary or exception: For stored state 3, fourteen clean days produce next step 2; twenty-one clean days produce next step 1.
- Boundary or exception: At exact expiry an event is no longer active under the proposed start-inclusive, expiry-exclusive status definition.
- Boundary or exception: The prototype clamps a negative clean interval to zero; overlapping-event acceptance and the correct anchor still require a decision.

**Unanswered mapping questions:** [Q-050](open-questions.md#q-050), [Q-052](open-questions.md#q-052), [Q-053](open-questions.md#q-053), [Q-030](open-questions.md#q-030)

### RQ-249

**Statement:** The system shall use a seven-day clean window for the default step-down model.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Seven is the explicit model default.
- Source lines: [3141-3141](../docs/design/cooldown-counter.html#L3141).
- Trace: [US-040](../2-user-stories/US-040-rule-decay.md), [BR-040](#br-040), [EX-040](#ex-040).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: A complete default clean window equals seven elapsed days under the agreed clock definition.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-050](open-questions.md#q-050), [Q-052](open-questions.md#q-052)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-250

**Statement:** The system shall anchor default clean time to the previous cooldown expiry.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Issue time would decay the ladder too early.
- Source lines: [2763-2763](../docs/design/cooldown-counter.html#L2763), [3225-3225](../docs/design/cooldown-counter.html#L3225).
- Trace: [US-040](../2-user-stories/US-040-rule-decay.md), [BR-040](#br-040), [EX-040](#ex-040).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: A cooldown issued on day zero for one day begins accumulating clean time at day one.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-251

**Statement:** The system shall count only completed clean windows for default decay.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Partial clean windows do not produce partial steps.
- Source lines: [3194-3194](../docs/design/cooldown-counter.html#L3194), [3475-3475](../docs/design/cooldown-counter.html#L3475).
- Trace: [US-040](../2-user-stories/US-040-rule-decay.md), [BR-040](#br-040), [EX-040](#ex-040).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: A gap one millisecond short of seven elapsed days causes no drop; exactly seven days causes one drop.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-252

**Statement:** The system shall reduce stored ladder state by one for each completed clean window in the default model.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Repeated windows can remove multiple levels.
- Source lines: [3194-3194](../docs/design/cooldown-counter.html#L3194), [3475-3475](../docs/design/cooldown-counter.html#L3475).
- Trace: [US-040](../2-user-stories/US-040-rule-decay.md), [BR-040](#br-040), [EX-040](#ex-040).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: Prior state 3 at fourteen clean days decays to state 1 before the next offence.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-253

**Statement:** The system shall floor a decayed ladder state at zero.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Stored state cannot become negative.
- Source lines: [3194-3194](../docs/design/cooldown-counter.html#L3194), [3475-3475](../docs/design/cooldown-counter.html#L3475).
- Trace: [US-040](../2-user-stories/US-040-rule-decay.md), [BR-040](#br-040), [EX-040](#ex-040).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: Prior state 3 after at least 21 clean days becomes zero and the next offence receives step 1.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-254

**Statement:** The system shall explain the configured decay rule in the Cooldowns reference.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Operators need the rule behind a result.
- Source lines: [2761-2761](../docs/design/cooldown-counter.html#L2761), [3474-3477](../docs/design/cooldown-counter.html#L3474).
- Trace: [US-040](../2-user-stories/US-040-rule-decay.md), [BR-040](#br-040), [EX-040](#ex-040).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: The default reference says each full seven-day clean stretch after expiry drops one step to a minimum of zero.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-255

**Statement:** The system shall derive the next-offence step from the decayed terminal ladder state.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Predictions follow the same decay and advance sequence.
- Source lines: [3237-3239](../docs/design/cooldown-counter.html#L3237).
- Trace: [US-040](../2-user-stories/US-040-rule-decay.md), [BR-040](#br-040), [EX-040](#ex-040).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: Prior state 3 after fourteen clean days predicts next step 2.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-256

**Statement:** The system shall derive a cooldown expiry from its effective start plus its assigned total duration.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Default decay has to anchor to a defined expiry.
- Source lines: [3219-3220](../docs/design/cooldown-counter.html#L3219).
- Trace: [US-040](../2-user-stories/US-040-rule-decay.md), [BR-040](#br-040), [EX-040](#ex-040).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: A cooldown starting at 12:00 with a 120-minute assigned total expires at 14:00 on the agreed time basis.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-030](open-questions.md#q-030), [Q-050](open-questions.md#q-050)
- Change history: 2026-11-12 - Initial design extraction.

## US-041 - Evaluate observations in historical order

Parent: [US-041](../2-user-stories/US-041-rule-evaluate-history.md).

<a id="br-041"></a>

**BR-041 - atomic rule set:** [RQ-257](#rq-257), [RQ-258](#rq-258).

**Mapping context:** Replay sorts observations and preserves observed evidence separately from derived totals.

<a id="ex-041"></a>

**EX-041 - proposed worked example:**

- Given An account has same-type observations entered out of time order.
- When The model evaluates their transitions.
- Then Effective cooldown-start order drives escalation while recorded remaining durations stay unchanged.
- Boundary or exception: Equal timestamps require an agreed tie-breaker.
- Boundary or exception: Backdated records need the agreed historical recalculation policy.

**Unanswered mapping questions:** [Q-033](open-questions.md#q-033), [Q-051](open-questions.md#q-051), [Q-030](open-questions.md#q-030)

### RQ-257

**Statement:** The system shall evaluate each account and offence-type history in cooldown-start order.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Chronology drives escalation.
- Source lines: [3208-3208](../docs/design/cooldown-counter.html#L3208).
- Trace: [US-041](../2-user-stories/US-041-rule-evaluate-history.md), [BR-041](#br-041), [EX-041](#ex-041).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [US-040](../2-user-stories/US-040-rule-decay.md)
- Acceptance condition: A backdated observation is evaluated before later same-pair observations regardless of entry order.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-030](open-questions.md#q-030), [Q-033](open-questions.md#q-033)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-258

**Statement:** The system shall preserve the explicitly observed remaining duration during transition evaluation.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Raw evidence differs from model output.
- Source lines: [3224-3224](../docs/design/cooldown-counter.html#L3224).
- Trace: [US-041](../2-user-stories/US-041-rule-evaluate-history.md), [BR-041](#br-041), [EX-041](#ex-041).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md), [US-040](../2-user-stories/US-040-rule-decay.md)
- Acceptance condition: A recorded observation of 20 minutes left remains 20 minutes after replay even when the predicted total differs.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-042 - Add an offence type

Parent: [US-042](../2-user-stories/US-042-rule-add-type.md).

<a id="br-042"></a>

**BR-042 - atomic rule set:** [RQ-259](#rq-259), [RQ-260](#rq-260), [RQ-261](#rq-261), [RQ-262](#rq-262), [RQ-263](#rq-263), [RQ-264](#rq-264), [RQ-265](#rq-265).

**Mapping context:** The reference provides Add offence type and a full editor.

<a id="ex-042"></a>

**EX-042 - proposed worked example:**

- Given The catalogue has no type named Griefing.
- When I add Griefing with a 30-minute first step and save.
- Then The catalogue gains the new type and its ladder.
- Boundary or exception: Cancel and close discard the draft.
- Boundary or exception: A type with one step is valid.
- Boundary or exception: Persistence and shared-save failure states remain open.

**Unanswered mapping questions:** [Q-042](open-questions.md#q-042)

### RQ-259

**Statement:** The system shall provide an action to create an offence type.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Operators can extend the catalogue.
- Source lines: [2713-2713](../docs/design/cooldown-counter.html#L2713), [2963-2964](../docs/design/cooldown-counter.html#L2963), [3511-3512](../docs/design/cooldown-counter.html#L3511), [3579-3579](../docs/design/cooldown-counter.html#L3579).
- Trace: [US-042](../2-user-stories/US-042-rule-add-type.md), [BR-042](#br-042), [EX-042](#ex-042).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Add offence type opens an editor labelled Add offence type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-260

**Statement:** The system shall accept an offence type name in the editor.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: A type needs an operator-facing label.
- Source lines: [2972-2973](../docs/design/cooldown-counter.html#L2972), [3514-3514](../docs/design/cooldown-counter.html#L3514).
- Trace: [US-042](../2-user-stories/US-042-rule-add-type.md), [BR-042](#br-042), [EX-042](#ex-042).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Entering Griefing populates the new type name.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-261

**Statement:** The system shall accept an optional short code in the offence type editor.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Compact calendar labels need a short identifier.
- Source lines: [2976-2977](../docs/design/cooldown-counter.html#L2976), [3516-3516](../docs/design/cooldown-counter.html#L3516).
- Trace: [US-042](../2-user-stories/US-042-rule-add-type.md), [BR-042](#br-042), [EX-042](#ex-042).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Entering GRF makes it available as the new short code.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-262

**Statement:** The system shall accept an optional trigger note in the offence type editor.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Operators can explain the category.
- Source lines: [2982-2983](../docs/design/cooldown-counter.html#L2982), [3515-3515](../docs/design/cooldown-counter.html#L3515).
- Trace: [US-042](../2-user-stories/US-042-rule-add-type.md), [BR-042](#br-042), [EX-042](#ex-042).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Entering Accumulated reports saves that description with the type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-263

**Statement:** The system shall create a new offence type after a valid editor save.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A valid form becomes a usable catalogue entry.
- Source lines: [3540-3541](../docs/design/cooldown-counter.html#L3540).
- Trace: [US-042](../2-user-stories/US-042-rule-add-type.md), [BR-042](#br-042), [EX-042](#ex-042).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Saving a unique named type adds one entry to the catalogue without changing existing entries.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-264

**Statement:** The system shall close the offence type editor after a successful save.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A completed edit exits its modal.
- Source lines: [3541-3541](../docs/design/cooldown-counter.html#L3541), [3548-3548](../docs/design/cooldown-counter.html#L3548).
- Trace: [US-042](../2-user-stories/US-042-rule-add-type.md), [BR-042](#br-042), [EX-042](#ex-042).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Saving a valid new type returns to the catalogue.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-265

**Statement:** The system shall discard unsaved offence type changes when Cancel is chosen.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Exploring an editor must not create a partial type.
- Source lines: [2966-2966](../docs/design/cooldown-counter.html#L2966), [3035-3035](../docs/design/cooldown-counter.html#L3035), [3535-3535](../docs/design/cooldown-counter.html#L3535).
- Trace: [US-042](../2-user-stories/US-042-rule-add-type.md), [BR-042](#br-042), [EX-042](#ex-042).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: Changing a new draft and pressing Cancel leaves the catalogue unchanged.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-043 - Prevent ambiguous offence type names

Parent: [US-043](../2-user-stories/US-043-rule-type-name-validity.md).

<a id="br-043"></a>

**BR-043 - atomic rule set:** [RQ-266](#rq-266), [RQ-267](#rq-267), [RQ-268](#rq-268), [RQ-269](#rq-269), [RQ-270](#rq-270).

**Mapping context:** The editor validates trimmed names and case-insensitive duplicates.

<a id="ex-043"></a>

**EX-043 - proposed worked example:**

- Given Kicking already exists.
- When I attempt to create a second type named kIcKiNg.
- Then The editor identifies the duplicate and does not save it.
- Boundary or exception: Space-only names fail.
- Boundary or exception: Surrounding spaces are trimmed.
- Boundary or exception: The edited record does not conflict with itself.

**Unanswered mapping questions:** None identified for this narrow obligation.

### RQ-266

**Statement:** The system shall trim leading and trailing whitespace from a saved offence type name.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Cosmetic whitespace must not create a distinct type.
- Source lines: [3508-3508](../docs/design/cooldown-counter.html#L3508), [3541-3544](../docs/design/cooldown-counter.html#L3541).
- Trace: [US-043](../2-user-stories/US-043-rule-type-name-validity.md), [BR-043](#br-043), [EX-043](#ex-043).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md)
- Acceptance condition: Saving a unique name with surrounding spaces stores the name without those spaces.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-267

**Statement:** The system shall reject an offence type name that is empty after trimming.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: An empty label cannot identify an offence.
- Source lines: [3532-3537](../docs/design/cooldown-counter.html#L3532).
- Trace: [US-043](../2-user-stories/US-043-rule-type-name-validity.md), [BR-043](#br-043), [EX-043](#ex-043).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md)
- Acceptance condition: A blank or space-only name produces A name is required and creates no type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-268

**Statement:** The system shall reject a case-insensitive name duplicate belonging to another offence type.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Case-only names would confuse selection and reference.
- Source lines: [3509-3509](../docs/design/cooldown-counter.html#L3509), [3532-3537](../docs/design/cooldown-counter.html#L3532).
- Trace: [US-043](../2-user-stories/US-043-rule-type-name-validity.md), [BR-043](#br-043), [EX-043](#ex-043).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md)
- Acceptance condition: Adding kIcKiNg while Kicking exists produces the duplicate-name warning and creates no type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-269

**Statement:** The system shall show a reason when an offence type name cannot be saved.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: An operator needs an actionable reason for rejection.
- Source lines: [3029-3030](../docs/design/cooldown-counter.html#L3029), [3532-3533](../docs/design/cooldown-counter.html#L3532).
- Trace: [US-043](../2-user-stories/US-043-rule-type-name-validity.md), [BR-043](#br-043), [EX-043](#ex-043).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md)
- Acceptance condition: An empty name shows the required-name warning; a duplicate shows the duplicate-name warning.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-270

**Statement:** The system shall allow an existing offence type to retain its current name during editing.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Uniqueness validation must exclude the edited record.
- Source lines: [3509-3509](../docs/design/cooldown-counter.html#L3509).
- Trace: [US-043](../2-user-stories/US-043-rule-type-name-validity.md), [BR-043](#br-043), [EX-043](#ex-043).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md)
- Acceptance condition: Editing Kicking note without changing its name does not trigger a duplicate error.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-044 - Update offence labels and trigger notes

Parent: [US-044](../2-user-stories/US-044-rule-edit-metadata.md).

<a id="br-044"></a>

**BR-044 - atomic rule set:** [RQ-271](#rq-271), [RQ-272](#rq-272), [RQ-273](#rq-273), [RQ-274](#rq-274), [RQ-275](#rq-275), [RQ-276](#rq-276).

**Mapping context:** Edit preloads the current metadata and short-code normalisation is explicit in save logic.

<a id="ex-044"></a>

**EX-044 - proposed worked example:**

- Given Kicking has saved metadata.
- When I edit its note and short code then save.
- Then The same type displays the updated note and normalised code.
- Boundary or exception: Whitespace-only and duplicate codes require a policy.
- Boundary or exception: Truncation must not silently surprise the operator.
- Boundary or exception: Cancel leaves the saved metadata unchanged.

**Unanswered mapping questions:** [Q-056](open-questions.md#q-056)

### RQ-271

**Statement:** The system shall prepopulate an offence type editor with the selected type metadata.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Corrections begin from the current saved values.
- Source lines: [3458-3458](../docs/design/cooldown-counter.html#L3458).
- Trace: [US-044](../2-user-stories/US-044-rule-edit-metadata.md), [BR-044](#br-044), [EX-044](#ex-044).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md), [US-043](../2-user-stories/US-043-rule-type-name-validity.md)
- Acceptance condition: Editing Kicking shows its current name, code and note.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-272

**Statement:** The system shall update saved offence type metadata after a valid edit.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: An edit changes the selected entry.
- Source lines: [3543-3544](../docs/design/cooldown-counter.html#L3543).
- Trace: [US-044](../2-user-stories/US-044-rule-edit-metadata.md), [BR-044](#br-044), [EX-044](#ex-044).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md), [US-043](../2-user-stories/US-043-rule-type-name-validity.md)
- Acceptance condition: Changing the selected type note changes its reference description without creating a second type.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-273

**Statement:** The system shall trim leading and trailing whitespace from saved offence type notes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Descriptions avoid accidental whitespace.
- Source lines: [3541-3541](../docs/design/cooldown-counter.html#L3541), [3544-3544](../docs/design/cooldown-counter.html#L3544).
- Trace: [US-044](../2-user-stories/US-044-rule-edit-metadata.md), [BR-044](#br-044), [EX-044](#ex-044).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md), [US-043](../2-user-stories/US-043-rule-type-name-validity.md)
- Acceptance condition: A note entered with surrounding spaces appears without those spaces after save.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-274

**Statement:** The system shall uppercase a saved offence short code.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Compact identifiers use the demonstrated uppercase convention.
- Source lines: [3539-3539](../docs/design/cooldown-counter.html#L3539).
- Trace: [US-044](../2-user-stories/US-044-rule-edit-metadata.md), [BR-044](#br-044), [EX-044](#ex-044).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md), [US-043](../2-user-stories/US-043-rule-type-name-validity.md)
- Acceptance condition: The code grf is saved as GRF.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-056](open-questions.md#q-056)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-275

**Statement:** The system shall limit a saved offence short code to four characters.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Calendar codes use a compact representation.
- Source lines: [3539-3539](../docs/design/cooldown-counter.html#L3539).
- Trace: [US-044](../2-user-stories/US-044-rule-edit-metadata.md), [BR-044](#br-044), [EX-044](#ex-044).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md), [US-043](../2-user-stories/US-043-rule-type-name-validity.md)
- Acceptance condition: The entered code GRIEF is represented as GRIE under the agreed validation feedback.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-056](open-questions.md#q-056)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-276

**Statement:** The system shall derive an absent short code from the first three characters of the saved type name.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The prototype supports optional code entry.
- Source lines: [3539-3539](../docs/design/cooldown-counter.html#L3539).
- Trace: [US-044](../2-user-stories/US-044-rule-edit-metadata.md), [BR-044](#br-044), [EX-044](#ex-044).
- Dependencies: [US-042](../2-user-stories/US-042-rule-add-type.md), [US-043](../2-user-stories/US-043-rule-type-name-validity.md)
- Acceptance condition: A new Griefing type with no supplied code receives GRI under the agreed code policy.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-056](open-questions.md#q-056)
- Change history: 2026-11-12 - Initial design extraction.

## US-045 - Rename an offence type without losing history

Parent: [US-045](../2-user-stories/US-045-rule-rename-type.md).

<a id="br-045"></a>

**BR-045 - atomic rule set:** [RQ-277](#rq-277), [RQ-278](#rq-278), [RQ-279](#rq-279), [RQ-280](#rq-280), [RQ-281](#rq-281).

**Mapping context:** The design explicitly states that renaming carries records with it.

<a id="ex-045"></a>

**EX-045 - proposed worked example:**

- Given VACLive has three observations and is selected in a filter and report.
- When I rename it Anti-cheat.
- Then The same type retains all three observations and current selections follow the new name.
- Boundary or exception: Case-insensitive collision with another type is rejected.
- Boundary or exception: A failed shared save leaves prior associations intact.

**Unanswered mapping questions:** [Q-042](open-questions.md#q-042)

### RQ-277

**Statement:** The system shall retain an offence type identity when its name changes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A mutable label should not define identity.
- Source lines: [3544-3544](../docs/design/cooldown-counter.html#L3544).
- Trace: [US-045](../2-user-stories/US-045-rule-rename-type.md), [BR-045](#br-045), [EX-045](#ex-045).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: Renaming VACLive to Anti-cheat updates the same type rather than creating a new one.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-278

**Statement:** The system shall retain existing observations under the renamed offence type.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: A name correction must not discard history.
- Source lines: [3512-3512](../docs/design/cooldown-counter.html#L3512), [3545-3545](../docs/design/cooldown-counter.html#L3545).
- Trace: [US-045](../2-user-stories/US-045-rule-rename-type.md), [BR-045](#br-045), [EX-045](#ex-045).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: Three VACLive observations remain associated after the type is renamed Anti-cheat.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-279

**Statement:** The system shall update an active offence filter after its selected type is renamed.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The active filter must not point to a vanished label.
- Source lines: [3546-3546](../docs/design/cooldown-counter.html#L3546).
- Trace: [US-045](../2-user-stories/US-045-rule-rename-type.md), [BR-045](#br-045), [EX-045](#ex-045).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: A selected VACLive filter follows the rename to Anti-cheat.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-280

**Statement:** The system shall update an unsaved report selection after its offence type is renamed.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Draft selections retain the same semantic type.
- Source lines: [3547-3547](../docs/design/cooldown-counter.html#L3547).
- Trace: [US-045](../2-user-stories/US-045-rule-rename-type.md), [BR-045](#br-045), [EX-045](#ex-045).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: A report selecting VACLive refers to Anti-cheat after the rename.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-281

**Statement:** The system shall apply a shared offence type rename as one atomic change.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: A server implementation cannot rely on one local setState for consistency.
- Source lines: [3544-3547](../docs/design/cooldown-counter.html#L3544).
- Trace: [US-045](../2-user-stories/US-045-rule-rename-type.md), [BR-045](#br-045), [EX-045](#ex-045).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: A failed rename leaves the type and all its associations unchanged; a successful rename exposes no orphaned records.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-042](open-questions.md#q-042)
- Change history: 2026-11-12 - Initial design extraction.

## US-046 - Edit a ladder step duration

Parent: [US-046](../2-user-stories/US-046-rule-edit-duration.md).

<a id="br-046"></a>

**BR-046 - atomic rule set:** [RQ-282](#rq-282), [RQ-283](#rq-283), [RQ-284](#rq-284), [RQ-285](#rq-285), [RQ-286](#rq-286), [RQ-287](#rq-287).

**Mapping context:** The editor exposes per-step amount, unit and formatted preview.

<a id="ex-046"></a>

**EX-046 - proposed worked example:**

- Given The selected offence has a two-hour second step.
- When I enter 1.5 with hours selected.
- Then The draft previews 1.5 hours and a valid save records 90 minutes.
- Boundary or exception: Blank, zero, negative and non-finite values need explicit validation.
- Boundary or exception: Rounding and finite upper bounds need decisions.
- Boundary or exception: Changing units needs agreed reinterpretation or conversion semantics.

**Unanswered mapping questions:** [Q-054](open-questions.md#q-054), [Q-055](open-questions.md#q-055), [Q-051](open-questions.md#q-051), [Q-058](open-questions.md#q-058)

### RQ-282

**Statement:** The system shall allow a configured ladder step duration amount to be edited.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: An existing level can be corrected.
- Source lines: [3009-3009](../docs/design/cooldown-counter.html#L3009), [3521-3521](../docs/design/cooldown-counter.html#L3521).
- Trace: [US-046](../2-user-stories/US-046-rule-edit-duration.md), [BR-046](#br-046), [EX-046](#ex-046).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: Changing the second step amount updates its draft duration.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-283

**Statement:** The system shall support minute, hour and day units for an edited ladder step.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Operators use different natural units.
- Source lines: [3011-3012](../docs/design/cooldown-counter.html#L3011), [3522-3522](../docs/design/cooldown-counter.html#L3522).
- Trace: [US-046](../2-user-stories/US-046-rule-edit-duration.md), [BR-046](#br-046), [EX-046](#ex-046).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: The selected step can use min, hrs or days.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-284

**Statement:** The system shall show a formatted duration preview for each edited ladder step.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: An operator can recognise the interpreted duration before save.
- Source lines: [3015-3015](../docs/design/cooldown-counter.html#L3015), [3518-3518](../docs/design/cooldown-counter.html#L3518).
- Trace: [US-046](../2-user-stories/US-046-rule-edit-duration.md), [BR-046](#br-046), [EX-046](#ex-046).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: An amount of 1.5 with hour units previews 1.5h.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-285

**Statement:** The system shall represent a saved ladder duration in whole minutes.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The prototype uses minute-based calculations.
- Source lines: [3507-3507](../docs/design/cooldown-counter.html#L3507), [3538-3538](../docs/design/cooldown-counter.html#L3538).
- Trace: [US-046](../2-user-stories/US-046-rule-edit-duration.md), [BR-046](#br-046), [EX-046](#ex-046).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: An accepted 1.5-hour step is stored as 90 minutes under the agreed rounding policy.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-054](open-questions.md#q-054)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-286

**Statement:** The system shall reject a non-finite ladder step duration.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Silent coercion and invalid date arithmetic corrupt predictions.
- Source lines: [3507-3507](../docs/design/cooldown-counter.html#L3507), [3220-3220](../docs/design/cooldown-counter.html#L3220).
- Trace: [US-046](../2-user-stories/US-046-rule-edit-duration.md), [BR-046](#br-046), [EX-046](#ex-046).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: An infinite or non-numeric amount does not produce a saved duration or invalid expiry.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-054](open-questions.md#q-054)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-287

**Statement:** The system shall reject a non-positive ladder step duration.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Invalid input must not fabricate a different rule.
- Source lines: [3507-3507](../docs/design/cooldown-counter.html#L3507).
- Trace: [US-046](../2-user-stories/US-046-rule-edit-duration.md), [BR-046](#br-046), [EX-046](#ex-046).
- Dependencies: [US-044](../2-user-stories/US-044-rule-edit-metadata.md)
- Acceptance condition: Zero and negative durations show validation feedback instead of silently becoming one minute.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-054](open-questions.md#q-054)
- Change history: 2026-11-12 - Initial design extraction.

## US-047 - Change the number of escalation steps

Parent: [US-047](../2-user-stories/US-047-rule-ladder-length.md).

<a id="br-047"></a>

**BR-047 - atomic rule set:** [RQ-288](#rq-288), [RQ-289](#rq-289), [RQ-290](#rq-290), [RQ-291](#rq-291), [RQ-292](#rq-292).

**Mapping context:** The editor permits adding steps and removal while more than one remains.

<a id="ex-047"></a>

**EX-047 - proposed worked example:**

- Given A type has three escalation steps.
- When I remove its middle step.
- Then Two contiguous steps remain and the final-step hold remains visible.
- Boundary or exception: A single-step ladder cannot become empty.
- Boundary or exception: Historic overrides and removed step identities require a migration decision.
- Boundary or exception: No maximum step count or monotonicity rule is agreed.

**Unanswered mapping questions:** [Q-054](open-questions.md#q-054), [Q-051](open-questions.md#q-051)

### RQ-288

**Statement:** The system shall append a new ladder step when Add step is chosen.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The escalation model can be extended.
- Source lines: [2989-2989](../docs/design/cooldown-counter.html#L2989), [3526-3526](../docs/design/cooldown-counter.html#L3526).
- Trace: [US-047](../2-user-stories/US-047-rule-ladder-length.md), [BR-047](#br-047), [EX-047](#ex-047).
- Dependencies: [US-046](../2-user-stories/US-046-rule-edit-duration.md)
- Acceptance condition: A two-step draft becomes a three-step draft after Add step.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-289

**Statement:** The system shall allow a selected ladder step to be removed when another step remains.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The escalation model can be shortened.
- Source lines: [3004-3005](../docs/design/cooldown-counter.html#L3004), [3523-3524](../docs/design/cooldown-counter.html#L3523).
- Trace: [US-047](../2-user-stories/US-047-rule-ladder-length.md), [BR-047](#br-047), [EX-047](#ex-047).
- Dependencies: [US-046](../2-user-stories/US-046-rule-edit-duration.md)
- Acceptance condition: Removing the middle step of a three-step draft leaves two steps.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-290

**Statement:** The system shall retain at least one ladder step for a configured offence type.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Prediction requires a valid first duration.
- Source lines: [3523-3524](../docs/design/cooldown-counter.html#L3523).
- Trace: [US-047](../2-user-stories/US-047-rule-ladder-length.md), [BR-047](#br-047), [EX-047](#ex-047).
- Dependencies: [US-046](../2-user-stories/US-046-rule-edit-duration.md)
- Acceptance condition: The only remaining step has no available remove action.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-291

**Statement:** The system shall renumber later draft steps after a step is removed.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Step positions must remain contiguous.
- Source lines: [3517-3518](../docs/design/cooldown-counter.html#L3517), [3524-3524](../docs/design/cooldown-counter.html#L3524).
- Trace: [US-047](../2-user-stories/US-047-rule-ladder-length.md), [BR-047](#br-047), [EX-047](#ex-047).
- Dependencies: [US-046](../2-user-stories/US-046-rule-edit-duration.md)
- Acceptance condition: Removing step 2 from steps 1, 2, 3 makes the former step 3 the new step 2.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-292

**Statement:** The system shall indicate that the edited ladder holds at its final step.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: Changing length must not obscure the final cap.
- Source lines: [3024-3024](../docs/design/cooldown-counter.html#L3024).
- Trace: [US-047](../2-user-stories/US-047-rule-ladder-length.md), [BR-047](#br-047), [EX-047](#ex-047).
- Dependencies: [US-046](../2-user-stories/US-046-rule-edit-duration.md)
- Acceptance condition: The last edited step is followed by then holds at the final step.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-048 - Review offence type deletion impact

Parent: [US-048](../2-user-stories/US-048-rule-delete-type.md).

<a id="br-048"></a>

**BR-048 - atomic rule set:** [RQ-293](#rq-293), [RQ-294](#rq-294), [RQ-295](#rq-295), [RQ-296](#rq-296), [RQ-297](#rq-297), [RQ-298](#rq-298), [RQ-299](#rq-299), [RQ-300](#rq-300).

**Mapping context:** The reference uses two delete actions and displays dependent record count; cascade policy requires approval.

<a id="ex-048"></a>

**EX-048 - proposed worked example:**

- Given An offence type is associated with three observations.
- When I choose Delete once.
- Then The type remains while the second action displays the three-record impact.
- Boundary or exception: Unused types display Confirm delete.
- Boundary or exception: Cascade deletion versus archiving is not approved.
- Boundary or exception: Deleting the last type requires a safe empty-catalogue policy.
- Boundary or exception: Arm deletion, leave Cooldowns, return, and check the explicitly agreed fresh-confirmation policy before any history can be removed.

**Unanswered mapping questions:** [Q-057](open-questions.md#q-057), [Q-039](open-questions.md#q-039), [Q-042](open-questions.md#q-042), [Q-059](open-questions.md#q-059), [Q-028](open-questions.md#q-028)

### RQ-293

**Statement:** The system shall require a second confirmation action before removing the selected offence type.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A single accidental click must not remove it.
- Source lines: [3460-3460](../docs/design/cooldown-counter.html#L3460).
- Trace: [US-048](../2-user-stories/US-048-rule-delete-type.md), [BR-048](#br-048), [EX-048](#ex-048).
- Dependencies: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md)
- Acceptance condition: The first Delete action changes its confirmation state without removing the type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-057](open-questions.md#q-057)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-294

**Statement:** The system shall show the dependent observation count in a deletion confirmation when records exist.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The data-loss impact is explicit.
- Source lines: [3470-3470](../docs/design/cooldown-counter.html#L3470).
- Trace: [US-048](../2-user-stories/US-048-rule-delete-type.md), [BR-048](#br-048), [EX-048](#ex-048).
- Dependencies: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md)
- Acceptance condition: A type used by three observations displays Delete + 3 records before confirmation.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-057](open-questions.md#q-057)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-295

**Statement:** The system shall remove the confirmed offence type according to the agreed retention policy.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A deliberate removal affects the catalogue.
- Source lines: [3461-3463](../docs/design/cooldown-counter.html#L3461).
- Trace: [US-048](../2-user-stories/US-048-rule-delete-type.md), [BR-048](#br-048), [EX-048](#ex-048).
- Dependencies: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md)
- Acceptance condition: Confirming an unused type removal removes it from selectable active types.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-057](open-questions.md#q-057)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-296

**Statement:** The system shall remove a deleted offence type from active filters.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Filters cannot refer to a removed category.
- Source lines: [3465-3465](../docs/design/cooldown-counter.html#L3465).
- Trace: [US-048](../2-user-stories/US-048-rule-delete-type.md), [BR-048](#br-048), [EX-048](#ex-048).
- Dependencies: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md)
- Acceptance condition: A filter selecting a removed type no longer contains that type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-297

**Statement:** The system shall replace a removed draft report type with an available valid type when one exists.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: A draft must not save a nonexistent type.
- Source lines: [3467-3467](../docs/design/cooldown-counter.html#L3467).
- Trace: [US-048](../2-user-stories/US-048-rule-delete-type.md), [BR-048](#br-048), [EX-048](#ex-048).
- Dependencies: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md)
- Acceptance condition: Removing selected VACLive changes the draft report to a remaining valid type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-039](open-questions.md#q-039)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-298

**Statement:** The system shall clear a pending type deletion confirmation after successful removal.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Deletion confirmation has a bounded lifetime.
- Source lines: [3466-3466](../docs/design/cooldown-counter.html#L3466).
- Trace: [US-048](../2-user-stories/US-048-rule-delete-type.md), [BR-048](#br-048), [EX-048](#ex-048).
- Dependencies: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md)
- Acceptance condition: A completed deletion leaves no armed confirmation for that type.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-299

**Statement:** The system shall clear a pending type deletion confirmation when an offence type editor opens.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: An unrelated editing task must not leave a destructive action armed.
- Source lines: [3458-3458](../docs/design/cooldown-counter.html#L3458), [3579-3579](../docs/design/cooldown-counter.html#L3579).
- Trace: [US-048](../2-user-stories/US-048-rule-delete-type.md), [BR-048](#br-048), [EX-048](#ex-048).
- Dependencies: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md)
- Acceptance condition: After the first Delete click, opening Add or Edit clears the pending deletion.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-300

**Statement:** The system shall invalidate a pending type deletion confirmation when the authenticated session ends.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: A later operator must not inherit an earlier operator's destructive action.
- Source lines: [3460-3470](../docs/design/cooldown-counter.html#L3460), [3573-3575](../docs/design/cooldown-counter.html#L3573).
- Trace: [US-048](../2-user-stories/US-048-rule-delete-type.md), [BR-048](#br-048), [EX-048](#ex-048).
- Dependencies: [US-037](../2-user-stories/US-037-rule-inspect-ladders.md)
- Acceptance condition: Arm deletion, sign out, then sign in again; deleting that type requires a new explicit confirmation rather than using the old armed action.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-059](open-questions.md#q-059), [Q-028](open-questions.md#q-028)
- Change history: 2026-11-12 - Initial design extraction.

## US-049 - Use an alternative decay policy if approved

Parent: [US-049](../2-user-stories/US-049-rule-optional-policies.md).

<a id="br-049"></a>

**BR-049 - atomic rule set:** [RQ-301](#rq-301), [RQ-302](#rq-302), [RQ-303](#rq-303), [RQ-304](#rq-304), [RQ-305](#rq-305).

**Mapping context:** Full reset, No decay and start anchor are implemented code paths without visible controls.

<a id="ex-049"></a>

**EX-049 - proposed worked example:**

- Given A rule owner approves an alternative policy for evaluation.
- When The model applies the selected policy.
- Then Predictions and explanations follow that policy consistently.
- Boundary or exception: There are no visible controls for these modes in the supplied design.
- Boundary or exception: Window bounds, permissions and history impact remain unresolved.
- Boundary or exception: Default expiry policy remains distinct from optional start anchoring.

**Unanswered mapping questions:** [Q-052](open-questions.md#q-052), [Q-051](open-questions.md#q-051)

### RQ-301

**Statement:** The system shall reset stored ladder state to zero when a full-reset policy completes its configured clean window.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: This is the code-only full-reset candidate.
- Source lines: [3193-3193](../docs/design/cooldown-counter.html#L3193).
- Trace: [US-049](../2-user-stories/US-049-rule-optional-policies.md), [BR-049](#br-049), [EX-049](#ex-049).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: Under a seven-day full reset, prior state 3 becomes zero at exactly seven clean days.
- Verification: Test - planned; no product test result.
- MoSCoW: Could Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-052](open-questions.md#q-052)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-302

**Statement:** The system shall retain stored ladder state before a full-reset policy completes its configured clean window.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: Full reset has no partial step-downs.
- Source lines: [3193-3193](../docs/design/cooldown-counter.html#L3193).
- Trace: [US-049](../2-user-stories/US-049-rule-optional-policies.md), [BR-049](#br-049), [EX-049](#ex-049).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: Under a seven-day full reset, prior state 3 remains 3 immediately before seven clean days.
- Verification: Test - planned; no product test result.
- MoSCoW: Could Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-052](open-questions.md#q-052)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-303

**Statement:** The system shall retain stored ladder state between observations when the selected policy has no decay.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: This is the code-only no-decay candidate.
- Source lines: [3192-3192](../docs/design/cooldown-counter.html#L3192).
- Trace: [US-049](../2-user-stories/US-049-rule-optional-policies.md), [BR-049](#br-049), [EX-049](#ex-049).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: Prior state 3 remains 3 after 100 clean days in No decay mode.
- Verification: Test - planned; no product test result.
- MoSCoW: Could Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-052](open-questions.md#q-052)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-304

**Statement:** The system shall measure the configured interval from the previous start when an approved start-anchored policy is selected.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: This is a code-only alternative that conflicts with visible expiry guidance.
- Source lines: [3225-3225](../docs/design/cooldown-counter.html#L3225).
- Trace: [US-049](../2-user-stories/US-049-rule-optional-policies.md), [BR-049](#br-049), [EX-049](#ex-049).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: With an approved start anchor, a one-day cooldown contributes that day to the interval before the next offence.
- Verification: Test - planned; no product test result.
- MoSCoW: Could Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-052](open-questions.md#q-052)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-305

**Statement:** The system shall present rule explanations consistent with the effective transition policy.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Mixed policy copy produces contradictory predictions.
- Source lines: [2763-2763](../docs/design/cooldown-counter.html#L2763), [3428-3429](../docs/design/cooldown-counter.html#L3428), [3474-3477](../docs/design/cooldown-counter.html#L3474).
- Trace: [US-049](../2-user-stories/US-049-rule-optional-policies.md), [BR-049](#br-049), [EX-049](#ex-049).
- Dependencies: [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: If a start anchor is approved, the reference does not claim that expiry is always the anchor.
- Verification: Test - planned; no product test result.
- MoSCoW: Could Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-052](open-questions.md#q-052)
- Change history: 2026-11-12 - Initial design extraction.

## US-050 - Understand the impact of a model change

Parent: [US-050](../2-user-stories/US-050-rule-safe-model-changes.md).

<a id="br-050"></a>

**BR-050 - atomic rule set:** [RQ-306](#rq-306), [RQ-307](#rq-307), [RQ-308](#rq-308), [RQ-309](#rq-309).

**Mapping context:** This is a proposed safeguard for prototype-wide retrospective replay.

<a id="ex-050"></a>

**EX-050 - proposed worked example:**

- Given A configured duration is already used by observations.
- When I propose changing that duration.
- Then The agreed history policy governs any affected totals and the change cannot leave inconsistent records.
- Boundary or exception: Removed steps may affect saved overrides.
- Boundary or exception: New values must not silently overwrite raw observation evidence.
- Boundary or exception: Concurrent edits require the agreed conflict route.

**Unanswered mapping questions:** [Q-051](open-questions.md#q-051), [Q-042](open-questions.md#q-042), [Q-039](open-questions.md#q-039)

### RQ-306

**Statement:** The system shall identify affected historical observations before applying a ladder change that recalculates their totals.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The prototype silently changes past results.
- Source lines: [3209-3220](../docs/design/cooldown-counter.html#L3209), [3538-3544](../docs/design/cooldown-counter.html#L3538).
- Trace: [US-050](../2-user-stories/US-050-rule-safe-model-changes.md), [BR-050](#br-050), [EX-050](#ex-050).
- Dependencies: [US-046](../2-user-stories/US-046-rule-edit-duration.md), [US-045](../2-user-stories/US-045-rule-rename-type.md)
- Acceptance condition: Changing a used step identifies observations whose predicted total or expiry would change before confirmation.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-051](open-questions.md#q-051)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-307

**Statement:** The system shall retain the policy provenance required by the agreed historical-calculation policy.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: An auditable total needs a defined policy basis.
- Source lines: [3209-3220](../docs/design/cooldown-counter.html#L3209), [3538-3544](../docs/design/cooldown-counter.html#L3538).
- Trace: [US-050](../2-user-stories/US-050-rule-safe-model-changes.md), [BR-050](#br-050), [EX-050](#ex-050).
- Dependencies: [US-046](../2-user-stories/US-046-rule-edit-duration.md), [US-045](../2-user-stories/US-045-rule-rename-type.md)
- Acceptance condition: A historical total can be traced to either its recorded rule version or an explicitly applied recalculation.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-051](open-questions.md#q-051)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-308

**Statement:** The system shall preserve original observed remaining durations when a rule change recalculates model output.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Model changes must not rewrite raw evidence.
- Source lines: [3224-3224](../docs/design/cooldown-counter.html#L3224), [3538-3544](../docs/design/cooldown-counter.html#L3538).
- Trace: [US-050](../2-user-stories/US-050-rule-safe-model-changes.md), [BR-050](#br-050), [EX-050](#ex-050).
- Dependencies: [US-046](../2-user-stories/US-046-rule-edit-duration.md), [US-045](../2-user-stories/US-045-rule-rename-type.md)
- Acceptance condition: A stored 20-minute observation stays 20 minutes after a new ladder changes predicted total.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-051](open-questions.md#q-051)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-309

**Statement:** The system shall apply a model change and its required dependent updates atomically.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Partial writes can orphan records or mix model versions.
- Source lines: [3543-3548](../docs/design/cooldown-counter.html#L3543), [3461-3468](../docs/design/cooldown-counter.html#L3461).
- Trace: [US-050](../2-user-stories/US-050-rule-safe-model-changes.md), [BR-050](#br-050), [EX-050](#ex-050).
- Dependencies: [US-046](../2-user-stories/US-046-rule-edit-duration.md), [US-045](../2-user-stories/US-045-rule-rename-type.md)
- Acceptance condition: A failed shared update leaves the prior catalogue and related calculation state consistent.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-042](open-questions.md#q-042), [Q-051](open-questions.md#q-051)
- Change history: 2026-11-12 - Initial design extraction.

## US-051 - Retain recorded history

Parent: [US-051](../2-user-stories/US-051-obs-durable-history.md).

<a id="br-051"></a>

**BR-051 - atomic rule set:** [RQ-310](#rq-310), [RQ-311](#rq-311), [RQ-312](#rq-312).

**Mapping context:** The shared-tracker design needs durable records; only the prototype auth flag survives reload.

<a id="ex-051"></a>

**EX-051 - proposed worked example:**

- Given An operator successfully saves an observation and a permitted configuration edit.
- When The application reloads and reauthenticates as required.
- Then The accepted records and configuration are still available.
- Boundary or exception: Save fails.
- Boundary or exception: Browser storage cleared.
- Boundary or exception: Another authorized operator returns.

**Unanswered mapping questions:** [Q-040](open-questions.md#q-040), [Q-027](open-questions.md#q-027)

### RQ-310

**Statement:** The system shall retain accepted observations across application reload.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The shared-tracker design needs durable records; only the prototype auth flag survives reload.
- Source lines: [3132-3143](../docs/design/cooldown-counter.html#L3132), [3754-3758](../docs/design/cooldown-counter.html#L3754).
- Trace: [US-051](../2-user-stories/US-051-obs-durable-history.md), [BR-051](#br-051), [EX-051](#ex-051).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md)
- Acceptance condition: Save an observation successfully, reload, and find the same observation once in history.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-311

**Statement:** The system shall retain accepted offence type definitions across application reload.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The shared-tracker design needs durable records; only the prototype auth flag survives reload.
- Source lines: [3132-3143](../docs/design/cooldown-counter.html#L3132), [3541-3548](../docs/design/cooldown-counter.html#L3541).
- Trace: [US-051](../2-user-stories/US-051-obs-durable-history.md), [BR-051](#br-051), [EX-051](#ex-051).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md)
- Acceptance condition: Save an allowed type edit, reload, and find that accepted definition.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-312

**Statement:** The system shall retain accepted transition-rule settings across application reload.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The shared-tracker design needs durable records; only the prototype auth flag survives reload.
- Source lines: [3141-3141](../docs/design/cooldown-counter.html#L3141), [3147-3154](../docs/design/cooldown-counter.html#L3147).
- Trace: [US-051](../2-user-stories/US-051-obs-durable-history.md), [BR-051](#br-051), [EX-051](#ex-051).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md)
- Acceptance condition: Save allowed decay settings, reload, and find those accepted settings.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-052 - Review the group's accepted history

Parent: [US-052](../2-user-stories/US-052-obs-shared-history.md).

<a id="br-052"></a>

**BR-052 - atomic rule set:** [RQ-313](#rq-313).

**Mapping context:** The UI says accounts are tracked by a small trusted group but has no sharing implementation.

<a id="ex-052"></a>

**EX-052 - proposed worked example:**

- Given Two operators belong to the same agreed fleet.
- When One saves an observation and the other refreshes their authorized view.
- Then Both see the same accepted event in that fleet.
- Boundary or exception: Operator outside the group.
- Boundary or exception: Concurrent edits.
- Boundary or exception: Deactivated membership.

**Unanswered mapping questions:** [Q-027](open-questions.md#q-027), [Q-042](open-questions.md#q-042)

### RQ-313

**Statement:** The system shall expose an accepted fleet observation to every operator with the agreed permission to read that fleet.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The UI says accounts are tracked by a small trusted group but has no sharing implementation.
- Source lines: [3640-3640](../docs/design/cooldown-counter.html#L3640), [3754-3758](../docs/design/cooldown-counter.html#L3754).
- Trace: [US-052](../2-user-stories/US-052-obs-shared-history.md), [BR-052](#br-052), [EX-052](#ex-052).
- Dependencies: [US-005](../2-user-stories/US-005-obs-authorization.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Operator A saves an event; authorized operator B refreshes and sees the same event.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-027](open-questions.md#q-027)
- Change history: 2026-11-12 - Initial design extraction.

## US-053 - Recover an interrupted change

Parent: [US-053](../2-user-stories/US-053-obs-save-recovery.md).

<a id="br-053"></a>

**BR-053 - atomic rule set:** [RQ-314](#rq-314), [RQ-315](#rq-315), [RQ-316](#rq-316), [RQ-317](#rq-317), [RQ-318](#rq-318), [RQ-319](#rq-319), [RQ-320](#rq-320), [RQ-321](#rq-321), [RQ-322](#rq-322), [RQ-323](#rq-323).

**Mapping context:** No network or pending/error/retry path exists in the prototype append.

<a id="ex-053"></a>

**EX-053 - proposed worked example:**

- Given A completed report is submitted to persistence.
- When The save fails or its response is lost.
- Then The operator sees an accurate outcome and can recover without duplicating the observation.
- Boundary or exception: Double click.
- Boundary or exception: Response lost after commit.
- Boundary or exception: Server rejection.
- Boundary or exception: Timeout.

**Unanswered mapping questions:** [Q-041](open-questions.md#q-041), [Q-057](open-questions.md#q-057), [Q-042](open-questions.md#q-042)

### RQ-314

**Statement:** The system shall distinguish a pending observation save from a completed save.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: No network or pending/error/retry path exists in the prototype append.
- Source lines: [2951-2951](../docs/design/cooldown-counter.html#L2951), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-053](../2-user-stories/US-053-obs-save-recovery.md), [BR-053](#br-053), [EX-053](#ex-053).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Delay the save response; UI indicates pending rather than claiming completion.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-315

**Statement:** The system shall show save success only after the authoritative boundary accepts the observation.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: No network or pending/error/retry path exists in the prototype append.
- Source lines: [2951-2951](../docs/design/cooldown-counter.html#L2951), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-053](../2-user-stories/US-053-obs-save-recovery.md), [BR-053](#br-053), [EX-053](#ex-053).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Reject persistence; UI does not close as though the record succeeded.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-316

**Statement:** The system shall preserve the editable report draft after a failed save.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: No network or pending/error/retry path exists in the prototype append.
- Source lines: [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-053](../2-user-stories/US-053-obs-save-recovery.md), [BR-053](#br-053), [EX-053](#ex-053).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Cause save failure; previously entered accepted fields remain available to correct or retry.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-317

**Statement:** The system shall display a recoverable error for a failed observation save.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: No network or pending/error/retry path exists in the prototype append.
- Source lines: [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-053](../2-user-stories/US-053-obs-save-recovery.md), [BR-053](#br-053), [EX-053](#ex-053).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Reject a report save; an error explains that it did not complete and exposes the agreed next action.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-041](open-questions.md#q-041)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-318

**Statement:** The system shall prevent repeated submission of one save attempt from creating duplicate observations.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: No network or pending/error/retry path exists in the prototype append.
- Source lines: [2951-2951](../docs/design/cooldown-counter.html#L2951), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-053](../2-user-stories/US-053-obs-save-recovery.md), [BR-053](#br-053), [EX-053](#ex-053).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Double-submit or retry the same acknowledged operation; exactly one event is retained.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-319

**Statement:** The system shall assign a unique stable identity to each accepted observation.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: No network or pending/error/retry path exists in the prototype append.
- Source lines: [3755-3755](../docs/design/cooldown-counter.html#L3755).
- Trace: [US-053](../2-user-stories/US-053-obs-save-recovery.md), [BR-053](#br-053), [EX-053](#ex-053).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Accept two independent concurrent observations; their identities differ and remain stable after reload.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-320

**Statement:** The system shall preserve unsaved offence-editor input after a failed configuration save.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: A server failure must not discard a carefully edited ladder.
- Source lines: [3536-3548](../docs/design/cooldown-counter.html#L3536).
- Trace: [US-053](../2-user-stories/US-053-obs-save-recovery.md), [BR-053](#br-053), [EX-053](#ex-053).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Simulate a rejected type save; retain the edited name, code, note and ladder in the open editor for correction or retry.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-041](open-questions.md#q-041)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-321

**Statement:** The system shall report a failed type deletion without presenting the type as successfully removed.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: A synchronous local deletion has no real persistence-failure behavior.
- Source lines: [3459-3471](../docs/design/cooldown-counter.html#L3459).
- Trace: [US-053](../2-user-stories/US-053-obs-save-recovery.md), [BR-053](#br-053), [EX-053](#ex-053).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Simulate authoritative rejection of a confirmed deletion; show failure and retain the last accepted type and records.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-041](open-questions.md#q-041), [Q-057](open-questions.md#q-057)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-322

**Statement:** The system shall distinguish a pending configuration change from an accepted configuration change.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Predictions must not imply a rule change has been accepted while its save is unresolved.
- Source lines: [3459-3468](../docs/design/cooldown-counter.html#L3459), [3536-3548](../docs/design/cooldown-counter.html#L3536).
- Trace: [US-053](../2-user-stories/US-053-obs-save-recovery.md), [BR-053](#br-053), [EX-053](#ex-053).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Delay a type-edit response; identify its pending state without presenting it as an accepted update.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-041](open-questions.md#q-041), [Q-042](open-questions.md#q-042)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-323

**Statement:** The system shall display a recoverable error for a failed configuration save.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: An editor needs a recovery result instead of silently closing on a failed shared write.
- Source lines: [3536-3548](../docs/design/cooldown-counter.html#L3536).
- Trace: [US-053](../2-user-stories/US-053-obs-save-recovery.md), [BR-053](#br-053), [EX-053](#ex-053).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Reject a valid type-save request at the persistence boundary; show a failure with the draft still available for the approved retry or correction path.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-041](open-questions.md#q-041)
- Change history: 2026-11-12 - Initial design extraction.

## US-054 - Resolve changes during reporting

Parent: [US-054](../2-user-stories/US-054-obs-concurrent-consistency.md).

<a id="br-054"></a>

**BR-054 - atomic rule set:** [RQ-324](#rq-324), [RQ-325](#rq-325), [RQ-326](#rq-326).

**Mapping context:** A shared app can invalidate previews while the prototype only has single in-memory state.

<a id="ex-054"></a>

**EX-054 - proposed worked example:**

- Given An operator previews a report against a known history and ladder revision.
- When Another permitted operation changes that history or ladder before save.
- Then The agreed stale-preview policy is applied explicitly.
- Boundary or exception: Type renamed.
- Boundary or exception: Type deleted.
- Boundary or exception: Historical event inserted.
- Boundary or exception: Ladder step removed.

**Unanswered mapping questions:** [Q-042](open-questions.md#q-042), [Q-032](open-questions.md#q-032)

### RQ-324

**Statement:** The system shall detect when a report preview depends on configuration changed before save.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: A shared app can invalidate previews while the prototype only has single in-memory state.
- Source lines: [3483-3501](../docs/design/cooldown-counter.html#L3483), [3543-3548](../docs/design/cooldown-counter.html#L3543), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-054](../2-user-stories/US-054-obs-concurrent-consistency.md), [BR-054](#br-054), [EX-054](#ex-054).
- Dependencies: [US-052](../2-user-stories/US-052-obs-shared-history.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Change the selected ladder after preview; save detects the different revision.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-042](open-questions.md#q-042)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-325

**Statement:** The system shall detect when a report preview depends on history changed before save.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: A shared app can invalidate previews while the prototype only has single in-memory state.
- Source lines: [3208-3225](../docs/design/cooldown-counter.html#L3208), [3483-3501](../docs/design/cooldown-counter.html#L3483), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-054](../2-user-stories/US-054-obs-concurrent-consistency.md), [BR-054](#br-054), [EX-054](#ex-054).
- Dependencies: [US-052](../2-user-stories/US-052-obs-shared-history.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Insert an earlier event after preview; the save identifies stale dependent history.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-042](open-questions.md#q-042)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-326

**Statement:** The system shall apply the agreed stale-preview resolution before accepting a changed prediction.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: A shared app can invalidate previews while the prototype only has single in-memory state.
- Source lines: [3483-3501](../docs/design/cooldown-counter.html#L3483), [3543-3548](../docs/design/cooldown-counter.html#L3543), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-054](../2-user-stories/US-054-obs-concurrent-consistency.md), [BR-054](#br-054), [EX-054](#ex-054).
- Dependencies: [US-052](../2-user-stories/US-052-obs-shared-history.md), [US-032](../2-user-stories/US-032-obs-report-preview.md)
- Acceptance condition: Exercise the approved stale-history case; the operator receives the approved refresh/review outcome.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-042](open-questions.md#q-042)
- Change history: 2026-11-12 - Initial design extraction.

## US-055 - Recover when access expires

Parent: [US-055](../2-user-stories/US-055-obs-expired-session.md).

<a id="br-055"></a>

**BR-055 - atomic rule set:** [RQ-327](#rq-327), [RQ-328](#rq-328), [RQ-329](#rq-329).

**Mapping context:** Session expiry is absent in demo; draft retention is a privacy and data-loss decision.

<a id="ex-055"></a>

**EX-055 - proposed worked example:**

- Given An operator has an unfinished report and their session becomes invalid.
- When They attempt a protected action.
- Then The agreed reauthentication and draft policy applies without creating an unauthorized record.
- Boundary or exception: Another user signs in next.
- Boundary or exception: Other tab signs out.
- Boundary or exception: Expiry while save is pending.

**Unanswered mapping questions:** [Q-026](open-questions.md#q-026), [Q-028](open-questions.md#q-028)

### RQ-327

**Statement:** The system shall require reauthentication before accepting a mutation from an expired session.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Session expiry is absent in demo; draft retention is a privacy and data-loss decision.
- Source lines: [3133-3136](../docs/design/cooldown-counter.html#L3133), [3573-3576](../docs/design/cooldown-counter.html#L3573), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-055](../2-user-stories/US-055-obs-expired-session.md), [BR-055](#br-055), [EX-055](#ex-055).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md), [US-025](../2-user-stories/US-025-obs-report-open.md), [US-053](../2-user-stories/US-053-obs-save-recovery.md)
- Acceptance condition: Expire the session before save; no event is created until valid authentication returns.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-026](open-questions.md#q-026)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-328

**Statement:** The system shall stop exposing protected records after authoritative session invalidation is detected.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Session expiry is absent in demo; draft retention is a privacy and data-loss decision.
- Source lines: [2293-2294](../docs/design/cooldown-counter.html#L2293), [3563-3564](../docs/design/cooldown-counter.html#L3563), [3573-3575](../docs/design/cooldown-counter.html#L3573).
- Trace: [US-055](../2-user-stories/US-055-obs-expired-session.md), [BR-055](#br-055), [EX-055](#ex-055).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md), [US-025](../2-user-stories/US-025-obs-report-open.md), [US-053](../2-user-stories/US-053-obs-save-recovery.md)
- Acceptance condition: Invalidate the session then perform a protected operation; the restricted view is gated.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-026](open-questions.md#q-026)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-329

**Statement:** The system shall apply the agreed draft privacy policy when a session ends.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Session expiry is absent in demo; draft retention is a privacy and data-loss decision.
- Source lines: [3136-3143](../docs/design/cooldown-counter.html#L3136), [3573-3575](../docs/design/cooldown-counter.html#L3573).
- Trace: [US-055](../2-user-stories/US-055-obs-expired-session.md), [BR-055](#br-055), [EX-055](#ex-055).
- Dependencies: [US-001](../2-user-stories/US-001-obs-sign-in.md), [US-025](../2-user-stories/US-025-obs-report-open.md), [US-053](../2-user-stories/US-053-obs-save-recovery.md)
- Acceptance condition: End a session with an unfinished report, then sign in as another operator; the agreed retain/remove boundary holds.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-028](open-questions.md#q-028)
- Change history: 2026-11-12 - Initial design extraction.

## US-056 - Distinguish observation from derived estimate

Parent: [US-056](../2-user-stories/US-056-obs-evidence-provenance.md).

<a id="br-056"></a>

**BR-056 - atomic rule set:** [RQ-330](#rq-330), [RQ-331](#rq-331), [RQ-332](#rq-332).

**Mapping context:** The form and history already separate observed remaining and total; authorship/version policy is not shown.

<a id="ex-056"></a>

**EX-056 - proposed worked example:**

- Given An observation has an entered remaining value and a derived total.
- When An operator reviews its history.
- Then Observed evidence and estimated values are distinguishable.
- Boundary or exception: Manual override.
- Boundary or exception: Rules changed after recording.
- Boundary or exception: Corrected evidence.

**Unanswered mapping questions:** [Q-030](open-questions.md#q-030), [Q-043](open-questions.md#q-043)

### RQ-330

**Statement:** The system shall label the recorded remaining duration as observed evidence.

- Version: 0.1. Type: Functional. Evidence: Visible.
- Rationale: The form and history already separate observed remaining and total; authorship/version policy is not shown.
- Source lines: [2687-2687](../docs/design/cooldown-counter.html#L2687), [2694-2695](../docs/design/cooldown-counter.html#L2694), [3442-3442](../docs/design/cooldown-counter.html#L3442).
- Trace: [US-056](../2-user-stories/US-056-obs-evidence-provenance.md), [BR-056](#br-056), [EX-056](#ex-056).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md)
- Acceptance condition: Inspect history; the remaining value is identified as time left rather than total issued duration.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-331

**Statement:** The system shall identify a manually forced step in its recorded transition explanation.

- Version: 0.1. Type: Functional. Evidence: Logic.
- Rationale: The form and history already separate observed remaining and total; authorship/version policy is not shown.
- Source lines: [3221-3224](../docs/design/cooldown-counter.html#L3221), [3443-3443](../docs/design/cooldown-counter.html#L3443).
- Trace: [US-056](../2-user-stories/US-056-obs-evidence-provenance.md), [BR-056](#br-056), [EX-056](#ex-056).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md)
- Acceptance condition: Save an overridden report; history transition indicates manual override.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-332

**Statement:** The system shall distinguish estimated cooldown totals from independently verified game outcomes.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: The form and history already separate observed remaining and total; authorship/version policy is not shown.
- Source lines: [2805-2805](../docs/design/cooldown-counter.html#L2805), [2912-2918](../docs/design/cooldown-counter.html#L2912), [3494-3501](../docs/design/cooldown-counter.html#L3494).
- Trace: [US-056](../2-user-stories/US-056-obs-evidence-provenance.md), [BR-056](#br-056), [EX-056](#ex-056).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md)
- Acceptance condition: Inspect report and history copy; a derived ladder total is not presented as a verified Valve response.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-057 - Use the tracking workflow without a mouse

Parent: [US-057](../2-user-stories/US-057-obs-keyboard-workflow.md).

<a id="br-057"></a>

**BR-057 - atomic rule set:** [RQ-333](#rq-333), [RQ-334](#rq-334), [RQ-335](#rq-335), [RQ-336](#rq-336), [RQ-337](#rq-337), [RQ-338](#rq-338).

**Mapping context:** Inputs and buttons are keyboard-capable in principle, but the map uses mouse handlers and custom selectors have no defined keyboard model.

<a id="ex-057"></a>

**EX-057 - proposed worked example:**

- Given The operator uses only a keyboard.
- When They select an account/type, enter evidence, choose a step and submit or cancel.
- Then Each required action can be completed without a mouse.
- Boundary or exception: One-step ladder.
- Boundary or exception: Long search results.
- Boundary or exception: No-match result.

**Unanswered mapping questions:** [Q-045](open-questions.md#q-045), [Q-006](open-questions.md#q-006)

### RQ-333

**Statement:** The system shall expose a keyboard-operable method of selecting every report ladder step.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Inputs and buttons are keyboard-capable in principle, but the map uses mouse handlers and custom selectors have no defined keyboard model.
- Source lines: [2925-2942](../docs/design/cooldown-counter.html#L2925), [3175-3184](../docs/design/cooldown-counter.html#L3175), [3728-3734](../docs/design/cooldown-counter.html#L3728).
- Trace: [US-057](../2-user-stories/US-057-obs-keyboard-workflow.md), [BR-057](#br-057), [EX-057](#ex-057).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md), [US-033](../2-user-stories/US-033-obs-manual-override.md)
- Acceptance condition: Using only the keyboard, select first, intermediate and final configured steps.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-334

**Statement:** The system shall support keyboard selection from report account search results.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Inputs and buttons are keyboard-capable in principle, but the map uses mouse handlers and custom selectors have no defined keyboard model.
- Source lines: [2823-2841](../docs/design/cooldown-counter.html#L2823), [3667-3675](../docs/design/cooldown-counter.html#L3667).
- Trace: [US-057](../2-user-stories/US-057-obs-keyboard-workflow.md), [BR-057](#br-057), [EX-057](#ex-057).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md), [US-033](../2-user-stories/US-033-obs-manual-override.md)
- Acceptance condition: Search and select the intended account without pointer input.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-335

**Statement:** The system shall support keyboard selection from report offence search results.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Inputs and buttons are keyboard-capable in principle, but the map uses mouse handlers and custom selectors have no defined keyboard model.
- Source lines: [2863-2881](../docs/design/cooldown-counter.html#L2863), [3706-3714](../docs/design/cooldown-counter.html#L3706).
- Trace: [US-057](../2-user-stories/US-057-obs-keyboard-workflow.md), [BR-057](#br-057), [EX-057](#ex-057).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md), [US-033](../2-user-stories/US-033-obs-manual-override.md)
- Acceptance condition: Search and select the intended type without pointer input.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-336

**Statement:** The system shall preserve visible keyboard focus on report controls.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Inputs and buttons are keyboard-capable in principle, but the map uses mouse handlers and custom selectors have no defined keyboard model.
- Source lines: [2813-2951](../docs/design/cooldown-counter.html#L2813).
- Trace: [US-057](../2-user-stories/US-057-obs-keyboard-workflow.md), [BR-057](#br-057), [EX-057](#ex-057).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md), [US-033](../2-user-stories/US-033-obs-manual-override.md)
- Acceptance condition: Tab through the reporting workflow and identify the focused actionable control at every step.
- Verification: Demonstration - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-337

**Statement:** The system shall provide keyboard activation for account rows.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Clickable generic fleet rows are otherwise unreachable by keyboard.
- Source lines: [2602-2604](../docs/design/cooldown-counter.html#L2602), [3408-3408](../docs/design/cooldown-counter.html#L3408).
- Trace: [US-057](../2-user-stories/US-057-obs-keyboard-workflow.md), [BR-057](#br-057), [EX-057](#ex-057).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md), [US-033](../2-user-stories/US-033-obs-manual-override.md)
- Acceptance condition: Using only keyboard focus and activation, open the chosen fleet account detail.
- Verification: Demonstration - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-045](open-questions.md#q-045)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-338

**Statement:** The system shall provide keyboard activation for calendar entries.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Clickable generic calendar bars are otherwise unreachable by keyboard.
- Source lines: [2493-2498](../docs/design/cooldown-counter.html#L2493), [3359-3359](../docs/design/cooldown-counter.html#L3359).
- Trace: [US-057](../2-user-stories/US-057-obs-keyboard-workflow.md), [BR-057](#br-057), [EX-057](#ex-057).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md), [US-033](../2-user-stories/US-033-obs-manual-override.md)
- Acceptance condition: Using only the keyboard, activate a chosen recorded bar and obtain the same approved account-focus action as pointer activation.
- Verification: Demonstration - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-045](open-questions.md#q-045), [Q-006](open-questions.md#q-006)
- Change history: 2026-11-12 - Initial design extraction.

## US-058 - Choose an override on a touch device

Parent: [US-058](../2-user-stories/US-058-obs-touch-override.md).

<a id="br-058"></a>

**BR-058 - atomic rule set:** [RQ-339](#rq-339).

**Mapping context:** The supplied step map listens only to mousedown/mousemove/mouseup.

<a id="ex-058"></a>

**EX-058 - proposed worked example:**

- Given The operator uses a touch device.
- When They choose an override step.
- Then The chosen step is available without synthetic mouse interaction.
- Boundary or exception: Single-step ladder.
- Boundary or exception: Drag outside the track.
- Boundary or exception: Touch scrolling near the map.

**Unanswered mapping questions:** [Q-045](open-questions.md#q-045), [Q-046](open-questions.md#q-046)

### RQ-339

**Statement:** The system shall provide a touch-operable method of choosing a report override step.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: The supplied step map listens only to mousedown/mousemove/mouseup.
- Source lines: [2930-2942](../docs/design/cooldown-counter.html#L2930), [3175-3184](../docs/design/cooldown-counter.html#L3175), [3728-3734](../docs/design/cooldown-counter.html#L3728).
- Trace: [US-058](../2-user-stories/US-058-obs-touch-override.md), [BR-058](#br-058), [EX-058](#ex-058).
- Dependencies: [US-033](../2-user-stories/US-033-obs-manual-override.md)
- Acceptance condition: On a supported touch device, choose a different step and observe that override in preview.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-059 - Navigate modal reporting with assistive technology

Parent: [US-059](../2-user-stories/US-059-obs-accessible-dialogs.md).

<a id="br-059"></a>

**BR-059 - atomic rule set:** [RQ-340](#rq-340), [RQ-341](#rq-341), [RQ-342](#rq-342), [RQ-343](#rq-343), [RQ-344](#rq-344).

**Mapping context:** Report and type editor overlays are plain divs without named modal semantics or focus handling.

<a id="ex-059"></a>

**EX-059 - proposed worked example:**

- Given Focus is on a control that opens a modal.
- When The modal opens and is later dismissed.
- Then Its name is exposed, focus stays within it while active, and returns to its launcher on close.
- Boundary or exception: Report modal.
- Boundary or exception: Offence editor modal.
- Boundary or exception: Long dialog content.

**Unanswered mapping questions:** [Q-045](open-questions.md#q-045)

### RQ-340

**Statement:** The system shall expose an accessible dialog name for each modal.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Report and type editor overlays are plain divs without named modal semantics or focus handling.
- Source lines: [2799-2807](../docs/design/cooldown-counter.html#L2799), [2958-2966](../docs/design/cooldown-counter.html#L2958).
- Trace: [US-059](../2-user-stories/US-059-obs-accessible-dialogs.md), [BR-059](#br-059), [EX-059](#ex-059).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Assistive technology identifies the report or editor by its visible title.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-341

**Statement:** The system shall expose modal dialog semantics for active report and editor overlays.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Report and type editor overlays are plain divs without named modal semantics or focus handling.
- Source lines: [2799-2807](../docs/design/cooldown-counter.html#L2799), [2958-2966](../docs/design/cooldown-counter.html#L2958).
- Trace: [US-059](../2-user-stories/US-059-obs-accessible-dialogs.md), [BR-059](#br-059), [EX-059](#ex-059).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Inspect the accessibility tree; active overlays are identified as modal dialogs.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-342

**Statement:** The system shall move keyboard focus into an opened modal.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Report and type editor overlays are plain divs without named modal semantics or focus handling.
- Source lines: [2799-2807](../docs/design/cooldown-counter.html#L2799), [2958-2966](../docs/design/cooldown-counter.html#L2958), [3658-3658](../docs/design/cooldown-counter.html#L3658), [3579-3579](../docs/design/cooldown-counter.html#L3579).
- Trace: [US-059](../2-user-stories/US-059-obs-accessible-dialogs.md), [BR-059](#br-059), [EX-059](#ex-059).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Open either modal with a keyboard; focus moves to a meaningful control in that modal.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-343

**Statement:** The system shall keep keyboard focus within an active modal.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Report and type editor overlays are plain divs without named modal semantics or focus handling.
- Source lines: [2799-2807](../docs/design/cooldown-counter.html#L2799), [2958-2966](../docs/design/cooldown-counter.html#L2958).
- Trace: [US-059](../2-user-stories/US-059-obs-accessible-dialogs.md), [BR-059](#br-059), [EX-059](#ex-059).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Tab and Shift+Tab through an active modal; focus does not reach the obscured background.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-344

**Statement:** The system shall restore keyboard focus to the modal launcher after dismissal.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Report and type editor overlays are plain divs without named modal semantics or focus handling.
- Source lines: [2807-2807](../docs/design/cooldown-counter.html#L2807), [2950-2950](../docs/design/cooldown-counter.html#L2950), [2966-2966](../docs/design/cooldown-counter.html#L2966), [3035-3035](../docs/design/cooldown-counter.html#L3035), [3535-3535](../docs/design/cooldown-counter.html#L3535), [3659-3659](../docs/design/cooldown-counter.html#L3659).
- Trace: [US-059](../2-user-stories/US-059-obs-accessible-dialogs.md), [BR-059](#br-059), [EX-059](#ex-059).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Close either modal; focus returns to its launching control or the agreed valid replacement.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-060 - Understand report controls without visual guessing

Parent: [US-060](../2-user-stories/US-060-obs-accessible-controls.md).

<a id="br-060"></a>

**BR-060 - atomic rule set:** [RQ-345](#rq-345), [RQ-346](#rq-346), [RQ-347](#rq-347), [RQ-348](#rq-348).

**Mapping context:** Labels are often adjacent rather than associated; custom dropdowns omit expanded/current-selection semantics.

<a id="ex-060"></a>

**EX-060 - proposed worked example:**

- Given A screen-reader user opens the report.
- When They traverse fields, selectors and close controls.
- Then Each control has a meaningful name, state and value.
- Boundary or exception: Icon-only close.
- Boundary or exception: Duration units.
- Boundary or exception: Expanded and collapsed dropdown.
- Boundary or exception: No-match list.

**Unanswered mapping questions:** [Q-045](open-questions.md#q-045)

### RQ-345

**Statement:** The system shall associate an accessible name with every report and offence-editor input.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Labels are often adjacent rather than associated; custom dropdowns omit expanded/current-selection semantics.
- Source lines: [2813-2849](../docs/design/cooldown-counter.html#L2813), [2854-2866](../docs/design/cooldown-counter.html#L2854), [2889-2894](../docs/design/cooldown-counter.html#L2889), [2972-2983](../docs/design/cooldown-counter.html#L2972), [3002-3009](../docs/design/cooldown-counter.html#L3002).
- Trace: [US-060](../2-user-stories/US-060-obs-accessible-controls.md), [BR-060](#br-060), [EX-060](#ex-060).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Inspect date, duration, search, type name/code/note and step-amount inputs; each exposes its purpose.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-346

**Statement:** The system shall expose meaningful accessible names for icon-only close and remove actions.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Labels are often adjacent rather than associated; custom dropdowns omit expanded/current-selection semantics.
- Source lines: [2807-2807](../docs/design/cooldown-counter.html#L2807), [2966-2966](../docs/design/cooldown-counter.html#L2966), [3004-3005](../docs/design/cooldown-counter.html#L3004).
- Trace: [US-060](../2-user-stories/US-060-obs-accessible-controls.md), [BR-060](#br-060), [EX-060](#ex-060).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Inspect report/editor close and step remove buttons; their names identify the action and context.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-347

**Statement:** The system shall expose the expanded state of each custom selector.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Labels are often adjacent rather than associated; custom dropdowns omit expanded/current-selection semantics.
- Source lines: [2815-2824](../docs/design/cooldown-counter.html#L2815), [2856-2864](../docs/design/cooldown-counter.html#L2856), [3662-3666](../docs/design/cooldown-counter.html#L3662), [3702-3705](../docs/design/cooldown-counter.html#L3702).
- Trace: [US-060](../2-user-stories/US-060-obs-accessible-controls.md), [BR-060](#br-060), [EX-060](#ex-060).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Open and close account/type selectors; accessibility state changes with the visible popup.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-348

**Statement:** The system shall expose the selected option in each custom selector.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Labels are often adjacent rather than associated; custom dropdowns omit expanded/current-selection semantics.
- Source lines: [2830-2836](../docs/design/cooldown-counter.html#L2830), [2870-2876](../docs/design/cooldown-counter.html#L2870), [3672-3673](../docs/design/cooldown-counter.html#L3672), [3711-3712](../docs/design/cooldown-counter.html#L3711).
- Trace: [US-060](../2-user-stories/US-060-obs-accessible-controls.md), [BR-060](#br-060), [EX-060](#ex-060).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: Choose an account or type and inspect its accessible selected state.
- Verification: Inspection - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

## US-061 - Perceive status and validation feedback

Parent: [US-061](../2-user-stories/US-061-obs-perceivable-feedback.md).

<a id="br-061"></a>

**BR-061 - atomic rule set:** [RQ-349](#rq-349), [RQ-350](#rq-350), [RQ-351](#rq-351).

**Mapping context:** Color-coded durations and inline validation need equivalent labels and announcements.

<a id="ex-061"></a>

**EX-061 - proposed worked example:**

- Given The user cannot rely on color or is using a screen reader.
- When The predicted step changes or validation feedback appears.
- Then The changed meaning remains available through text and an agreed announcement.
- Boundary or exception: Overlong remaining warning.
- Boundary or exception: Login error.
- Boundary or exception: Save result.
- Boundary or exception: Manual override.

**Unanswered mapping questions:** [Q-045](open-questions.md#q-045)

### RQ-349

**Statement:** The system shall preserve cooldown duration and step meaning independently of color.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Color-coded durations and inline validation need equivalent labels and announcements.
- Source lines: [2694-2696](../docs/design/cooldown-counter.html#L2694), [2912-2918](../docs/design/cooldown-counter.html#L2912), [2935-2937](../docs/design/cooldown-counter.html#L2935), [3065-3071](../docs/design/cooldown-counter.html#L3065).
- Trace: [US-061](../2-user-stories/US-061-obs-perceivable-feedback.md), [BR-061](#br-061), [EX-061](#ex-061).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md), [US-034](../2-user-stories/US-034-obs-duration-conflict.md)
- Acceptance condition: Review preview and history without color; total, step and transition remain identifiable.
- Verification: Demonstration - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-350

**Statement:** The system shall expose validation errors to assistive technology when they appear.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Color-coded durations and inline validation need equivalent labels and announcements.
- Source lines: [2279-2281](../docs/design/cooldown-counter.html#L2279), [2899-2905](../docs/design/cooldown-counter.html#L2899), [3029-3031](../docs/design/cooldown-counter.html#L3029).
- Trace: [US-061](../2-user-stories/US-061-obs-perceivable-feedback.md), [BR-061](#br-061), [EX-061](#ex-061).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md), [US-034](../2-user-stories/US-034-obs-duration-conflict.md)
- Acceptance condition: Trigger a login or report field error; the agreed assistive-technology interaction identifies it.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-045](open-questions.md#q-045)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-351

**Statement:** The system shall expose observation save outcomes to assistive technology.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Color-coded durations and inline validation need equivalent labels and announcements.
- Source lines: [2951-2951](../docs/design/cooldown-counter.html#L2951), [3750-3758](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-061](../2-user-stories/US-061-obs-perceivable-feedback.md), [BR-061](#br-061), [EX-061](#ex-061).
- Dependencies: [US-032](../2-user-stories/US-032-obs-report-preview.md), [US-034](../2-user-stories/US-034-obs-duration-conflict.md)
- Acceptance condition: Complete or fail a save; the agreed assistive-technology interaction reports its outcome.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-045](open-questions.md#q-045)
- Change history: 2026-11-12 - Initial design extraction.

## US-062 - Reach tracking information on supported screens

Parent: [US-062](../2-user-stories/US-062-obs-responsive-report.md).

<a id="br-062"></a>

**BR-062 - atomic rule set:** [RQ-352](#rq-352), [RQ-353](#rq-353), [RQ-354](#rq-354), [RQ-355](#rq-355), [RQ-356](#rq-356), [RQ-357](#rq-357).

**Mapping context:** The report width is fixed without modal scrolling, unlike the editor which at least has vertical scrolling.

<a id="ex-062"></a>

**EX-062 - proposed worked example:**

- Given A supported small viewport or enlarged-text setting is active.
- When The operator opens the report or editor.
- Then All required inputs and submit/cancel actions remain reachable.
- Boundary or exception: Short viewport.
- Boundary or exception: Enlarged text.
- Boundary or exception: Search popup open.
- Boundary or exception: Virtual keyboard visible.

**Unanswered mapping questions:** [Q-046](open-questions.md#q-046), [Q-045](open-questions.md#q-045)

### RQ-352

**Statement:** The system shall keep report inputs reachable at the agreed supported viewport sizes.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: The report width is fixed without modal scrolling, unlike the editor which at least has vertical scrolling.
- Source lines: [2800-2801](../docs/design/cooldown-counter.html#L2800), [2811-2811](../docs/design/cooldown-counter.html#L2811), [2296-2296](../docs/design/cooldown-counter.html#L2296).
- Trace: [US-062](../2-user-stories/US-062-obs-responsive-report.md), [BR-062](#br-062), [EX-062](#ex-062).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: At each agreed viewport, the operator reaches every report input without clipped inaccessible content.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-046](open-questions.md#q-046)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-353

**Statement:** The system shall keep report save and cancel actions reachable at the agreed text enlargement settings.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: The report width is fixed without modal scrolling, unlike the editor which at least has vertical scrolling.
- Source lines: [2800-2801](../docs/design/cooldown-counter.html#L2800), [2949-2951](../docs/design/cooldown-counter.html#L2949).
- Trace: [US-062](../2-user-stories/US-062-obs-responsive-report.md), [BR-062](#br-062), [EX-062](#ex-062).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: At each agreed text enlargement setting, save and cancel remain reachable after filling the report.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-046](open-questions.md#q-046), [Q-045](open-questions.md#q-045)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-354

**Statement:** The system shall keep offence-editor controls reachable at the agreed supported viewport sizes.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: The report width is fixed without modal scrolling, unlike the editor which at least has vertical scrolling.
- Source lines: [2959-2960](../docs/design/cooldown-counter.html#L2959), [2970-2970](../docs/design/cooldown-counter.html#L2970), [3008-3015](../docs/design/cooldown-counter.html#L3008), [3034-3036](../docs/design/cooldown-counter.html#L3034).
- Trace: [US-062](../2-user-stories/US-062-obs-responsive-report.md), [BR-062](#br-062), [EX-062](#ex-062).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: At each agreed viewport, all editor fields, step actions and save/cancel controls are reachable.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-046](open-questions.md#q-046)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-355

**Statement:** The system shall keep account-list information reachable at the supported viewport sizes.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: The fixed fleet columns exceed the main region on narrow screens.
- Source lines: [2294-2296](../docs/design/cooldown-counter.html#L2294), [2598-2604](../docs/design/cooldown-counter.html#L2598).
- Trace: [US-062](../2-user-stories/US-062-obs-responsive-report.md), [BR-062](#br-062), [EX-062](#ex-062).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: At each viewport agreed in the responsive decision, inspect every fleet field and activate each row without information being clipped beyond an unreachable area.
- Verification: Demonstration - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-046](open-questions.md#q-046)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-356

**Statement:** The system shall keep account-detail information reachable at the supported viewport sizes.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Fixed identity and history panels need a defined narrow-screen alternative.
- Source lines: [2647-2650](../docs/design/cooldown-counter.html#L2647), [2684-2696](../docs/design/cooldown-counter.html#L2684).
- Trace: [US-062](../2-user-stories/US-062-obs-responsive-report.md), [BR-062](#br-062), [EX-062](#ex-062).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: At each agreed viewport, inspect identity, every per-type estimate and every history field without an unreachable clipped region.
- Verification: Demonstration - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-046](open-questions.md#q-046)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-357

**Statement:** The system shall keep calendar dates and their associated entries reachable at the supported viewport sizes.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: Seven date columns and a fixed sidebar can leave insufficient room for the calendar.
- Source lines: [2294-2296](../docs/design/cooldown-counter.html#L2294), [2473-2502](../docs/design/cooldown-counter.html#L2473).
- Trace: [US-062](../2-user-stories/US-062-obs-responsive-report.md), [BR-062](#br-062), [EX-062](#ex-062).
- Dependencies: [US-025](../2-user-stories/US-025-obs-report-open.md)
- Acceptance condition: At each agreed viewport, identify an event date and reach its complete account/type/duration information using the approved layout.
- Verification: Demonstration - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-046](open-questions.md#q-046)
- Change history: 2026-11-12 - Initial design extraction.

## US-063 - Use equivalent interactions with reduced motion

Parent: [US-063](../2-user-stories/US-063-obs-reduced-motion.md).

<a id="br-063"></a>

**BR-063 - atomic rule set:** [RQ-358](#rq-358).

**Mapping context:** The prototype uses pop/fade animations and smooth scrolling without a preference check.

<a id="ex-063"></a>

**EX-063 - proposed worked example:**

- Given The user has requested reduced motion.
- When They open a dialog or jump to the present.
- Then The agreed reduced-motion alternative provides the same destination and controls.
- Boundary or exception: Dialog opening.
- Boundary or exception: Smooth-scroll jump.

**Unanswered mapping questions:** [Q-047](open-questions.md#q-047)

### RQ-358

**Statement:** The system shall provide the agreed reduced-motion alternative for animated modal and navigation effects.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: The prototype uses pop/fade animations and smooth scrolling without a preference check.
- Source lines: [2247-2248](../docs/design/cooldown-counter.html#L2247), [2800-2801](../docs/design/cooldown-counter.html#L2800), [2959-2960](../docs/design/cooldown-counter.html#L2959), [3645-3649](../docs/design/cooldown-counter.html#L3645).
- Trace: [US-063](../2-user-stories/US-063-obs-reduced-motion.md), [BR-063](#br-063), [EX-063](#ex-063).
- Dependencies: No additional outcome dependency recorded; access and data-policy questions still apply.
- Acceptance condition: With the agreed preference enabled, modal opening and jump navigation use the agreed reduced-motion behaviour.
- Verification: Test - planned; no product test result.
- MoSCoW: Could Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-047](open-questions.md#q-047)
- Change history: 2026-11-12 - Initial design extraction.

## US-064 - Understand delayed or failed data loading

Parent: [US-064](../2-user-stories/US-064-obs-load-recovery.md).

<a id="br-064"></a>

**BR-064 - atomic rule set:** [RQ-359](#rq-359), [RQ-360](#rq-360), [RQ-361](#rq-361).

**Mapping context:** The prototype uses local seed arrays, so loading and service-failure states are absent.

<a id="ex-064"></a>

**EX-064 - proposed worked example:**

- Given The application requests protected fleet data.
- When The response is delayed, fails or legitimately contains no records.
- Then Loading, failure and empty results are represented distinctly.
- Boundary or exception: No accounts.
- Boundary or exception: No history.
- Boundary or exception: Unauthorized response.
- Boundary or exception: Retry succeeds.

**Unanswered mapping questions:** [Q-048](open-questions.md#q-048), [Q-049](open-questions.md#q-049)

### RQ-359

**Statement:** The system shall distinguish pending data loading from an empty result.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: The prototype uses local seed arrays, so loading and service-failure states are absent.
- Source lines: [3094-3112](../docs/design/cooldown-counter.html#L3094), [3135-3143](../docs/design/cooldown-counter.html#L3135).
- Trace: [US-064](../2-user-stories/US-064-obs-load-recovery.md), [BR-064](#br-064), [EX-064](#ex-064).
- Dependencies: [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Delay a fleet response; the UI does not claim no accounts while the request remains pending.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-360

**Statement:** The system shall distinguish failed data loading from an empty result.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: The prototype uses local seed arrays, so loading and service-failure states are absent.
- Source lines: [3094-3112](../docs/design/cooldown-counter.html#L3094), [3135-3143](../docs/design/cooldown-counter.html#L3135).
- Trace: [US-064](../2-user-stories/US-064-obs-load-recovery.md), [BR-064](#br-064), [EX-064](#ex-064).
- Dependencies: [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Fail a fleet/history read; the UI reports an error rather than an empty list.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - product validation pending. Questions: None identified for this narrow obligation.
- Change history: 2026-11-12 - Initial design extraction.

### RQ-361

**Statement:** The system shall provide the agreed retry path after a recoverable data-load failure.

- Version: 0.1. Type: Quality. Evidence: Proposed.
- Rationale: The prototype uses local seed arrays, so loading and service-failure states are absent.
- Source lines: [3094-3112](../docs/design/cooldown-counter.html#L3094), [3135-3143](../docs/design/cooldown-counter.html#L3135).
- Trace: [US-064](../2-user-stories/US-064-obs-load-recovery.md), [BR-064](#br-064), [EX-064](#ex-064).
- Dependencies: [US-051](../2-user-stories/US-051-obs-durable-history.md)
- Acceptance condition: Cause a recoverable read failure, use the approved retry, and observe the subsequent successful result.
- Verification: Test - planned; no product test result.
- MoSCoW: Should Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-048](open-questions.md#q-048)
- Change history: 2026-11-12 - Initial design extraction.

## US-065 - Keep an offence distinct from its observations

Parent: [US-065](../2-user-stories/US-065-root-cooldown-identity.md).

<a id="br-065"></a>

**BR-065 - atomic rule set:** [RQ-362](#rq-362), [RQ-363](#rq-363).

**Mapping context:** The design records remaining-time evidence, but replay treats every saved report as a new offence. The event-versus-observation policy is unresolved; this proposed outcome is not an existing edit workflow.

<a id="ex-065"></a>

**EX-065 - proposed worked example:**

- Given One actual Abandoning cooldown has already been recorded with 30 minutes remaining.
- When An operator later reports 20 minutes remaining on that same restriction.
- Then Under the proposed repeated-evidence policy, the added observation belongs to the same offence rather than advancing the ladder a second time; product confirmation is required.
- Boundary or exception: A genuinely new offence still advances the ladder.
- Boundary or exception: This differs from retrying the same failed save attempt.
- Boundary or exception: The product may instead prohibit repeated reports, but that alternative requires an explicit decision.

**Unanswered mapping questions:** [Q-033](open-questions.md#q-033), [Q-030](open-questions.md#q-030), [Q-044](open-questions.md#q-044)

### RQ-362

**Statement:** The system shall distinguish a cooldown offence identity from an observation identity when repeated evidence is supported.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Multiple observations do not necessarily represent multiple penalties.
- Source lines: [3212-3225](../docs/design/cooldown-counter.html#L3212), [3750-3755](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-065](../2-user-stories/US-065-root-cooldown-identity.md), [BR-065](#br-065), [EX-065](#ex-065).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: Record two reports about one accepted cooldown identity; both reports refer to that one offence, while a genuinely new offence has a distinct identity.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-033](open-questions.md#q-033)
- Change history: 2026-11-12 - Initial design extraction.

### RQ-363

**Statement:** The system shall exclude an additional observation of an existing cooldown from offence advancement when repeated evidence is supported.

- Version: 0.1. Type: Functional. Evidence: Proposed.
- Rationale: Counting new evidence as a new offence corrupts escalation.
- Source lines: [3212-3225](../docs/design/cooldown-counter.html#L3212), [3750-3755](../docs/design/cooldown-counter.html#L3750).
- Trace: [US-065](../2-user-stories/US-065-root-cooldown-identity.md), [BR-065](#br-065), [EX-065](#ex-065).
- Dependencies: [US-035](../2-user-stories/US-035-obs-record-observation.md), [US-039](../2-user-stories/US-039-rule-predict-independent.md)
- Acceptance condition: Add a later 20-minute-remaining observation to the already recorded first 30-minute Abandoning cooldown; the offence count and assigned step remain one.
- Verification: Test - planned; no product test result.
- MoSCoW: Must Have - Provisional; rationale and omission consequence in parent story.
- Decision: Candidate - blocked by linked decisions. Questions: [Q-033](open-questions.md#q-033)
- Change history: 2026-11-12 - Initial design extraction.
