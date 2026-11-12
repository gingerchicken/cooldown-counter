# Cooldown Counter user stories

All outcomes are candidates for **Cooldown Counter design baseline v0.1**.
They are grounded in the [supplied design](../docs/design/README.md), not an
operator interview. Each file contains one coherent outcome, acceptance links,
Example Mapping, dependencies, provisional MoSCoW and a full INVEST check.

`Draft - not usable` means a material question prevents estimation or fixed
acceptance. Other drafts pass only a design-level INVEST screen and still need
product validation. No story is approved for implementation.

See [requirements](../3-requirements/requirements.md),
[open decisions](../3-requirements/open-questions.md), and
[coverage](../3-requirements/coverage.md).

| Story | Outcome | Evidence | Priority - provisional | Requirements | INVEST |
| --- | --- | --- | --- | --- | --- |
| US-001 | [Sign in to restricted records](US-001-obs-sign-in.md) | Visible | Must Have | 12 | Blocked draft |
| US-002 | [Correct missing login inputs](US-002-obs-login-errors.md) | Logic | Must Have | 4 | Design-level pass |
| US-003 | [Resume a valid session](US-003-obs-session-restore.md) | Logic | Should Have | 3 | Blocked draft |
| US-004 | [End the operator session](US-004-obs-sign-out.md) | Visible | Must Have | 5 | Blocked draft |
| US-005 | [Limit records to permitted operators](US-005-obs-authorization.md) | Proposed | Must Have | 6 | Blocked draft |
| US-006 | [Navigate the fleet workspace](US-006-cal-navigation.md) | Visible | Must Have | 8 | Design-level pass |
| US-007 | [Assess fleet totals](US-007-cal-fleet-totals.md) | Visible | Must Have | 3 | Blocked draft |
| US-008 | [Find a tracked account](US-008-cal-account-filter.md) | Visible | Must Have | 13 | Blocked draft |
| US-009 | [Focus by cooldown status](US-009-cal-status-filter.md) | Visible | Must Have | 4 | Blocked draft |
| US-010 | [Focus by offence type](US-010-cal-offence-filter.md) | Visible | Must Have | 11 | Blocked draft |
| US-011 | [Restore an unfiltered workspace](US-011-cal-reset-filters.md) | Visible | Must Have | 3 | Blocked draft |
| US-012 | [Review cooldowns by day](US-012-cal-calendar-spans.md) | Visible | Must Have | 16 | Blocked draft |
| US-013 | [Review future step-down dates](US-013-cal-calendar-forecasts.md) | Visible | Must Have | 10 | Blocked draft |
| US-014 | [Reach crowded calendar records](US-014-cal-calendar-overflow.md) | Proposed | Must Have | 3 | Blocked draft |
| US-015 | [Browse calendar history and later months](US-015-cal-calendar-range.md) | Visible | Should Have | 2 | Blocked draft |
| US-016 | [Return to the present](US-016-cal-calendar-present.md) | Visible | Must Have | 3 | Blocked draft |
| US-017 | [Focus an account from the calendar](US-017-cal-calendar-account-focus.md) | Logic | Must Have | 2 | Blocked draft |
| US-018 | [Compare account availability](US-018-cal-fleet-summary.md) | Visible | Must Have | 12 | Blocked draft |
| US-019 | [Reach later accounts](US-019-cal-fleet-pagination.md) | Visible | Must Have | 3 | Blocked draft |
| US-020 | [Inspect one account](US-020-cal-account-detail.md) | Visible | Must Have | 7 | Blocked draft |
| US-021 | [Open the external Steam account](US-021-cal-steam-profile.md) | Visible | Should Have | 2 | Design-level pass |
| US-022 | [Compare per-offence predictions](US-022-cal-account-predictions.md) | Visible | Must Have | 4 | Design-level pass |
| US-023 | [Understand a prediction](US-023-cal-account-explanation.md) | Visible | Must Have | 4 | Blocked draft |
| US-024 | [Audit recorded observations](US-024-cal-account-history.md) | Visible | Must Have | 8 | Blocked draft |
| US-025 | [Start an observation report](US-025-obs-report-open.md) | Visible | Must Have | 4 | Blocked draft |
| US-026 | [Leave an unfinished report](US-026-obs-report-cancel.md) | Visible | Must Have | 3 | Blocked draft |
| US-027 | [Identify the report account](US-027-obs-account-selection.md) | Visible | Must Have | 10 | Design-level pass |
| US-028 | [Identify the observed offence](US-028-obs-offence-selection.md) | Visible | Must Have | 14 | Design-level pass |
| US-029 | [Locate an observation in time](US-029-obs-observation-time.md) | Visible | Must Have | 3 | Blocked draft |
| US-030 | [Enter observed time remaining](US-030-obs-remaining-duration.md) | Visible | Must Have | 7 | Blocked draft |
| US-031 | [Correct invalid remaining input](US-031-obs-duration-validation.md) | Proposed | Must Have | 5 | Blocked draft |
| US-032 | [Understand the predicted report total](US-032-obs-report-preview.md) | Visible | Must Have | 8 | Blocked draft |
| US-033 | [Record a known ladder step](US-033-obs-manual-override.md) | Visible | Should Have | 10 | Blocked draft |
| US-034 | [Resolve evidence that exceeds the estimate](US-034-obs-duration-conflict.md) | Visible | Must Have | 4 | Blocked draft |
| US-035 | [Record a validated observation](US-035-obs-record-observation.md) | Visible | Must Have | 7 | Blocked draft |
| US-036 | [Prevent invalid observation references](US-036-obs-report-integrity.md) | Proposed | Must Have | 4 | Blocked draft |
| US-037 | [Inspect offence ladders](US-037-rule-inspect-ladders.md) | Visible | Must Have | 7 | Blocked draft |
| US-038 | [Start with the designed offence catalogue](US-038-rule-seed-ladders.md) | Logic | Should Have | 5 | Blocked draft |
| US-039 | [Predict escalation independently per account and offence](US-039-rule-predict-independent.md) | Visible | Must Have | 9 | Blocked draft |
| US-040 | [Account for clean-time decay](US-040-rule-decay.md) | Visible | Must Have | 8 | Blocked draft |
| US-041 | [Evaluate observations in historical order](US-041-rule-evaluate-history.md) | Logic | Must Have | 2 | Blocked draft |
| US-042 | [Add an offence type](US-042-rule-add-type.md) | Visible | Must Have | 7 | Blocked draft |
| US-043 | [Prevent ambiguous offence type names](US-043-rule-type-name-validity.md) | Visible | Must Have | 5 | Design-level pass |
| US-044 | [Update offence labels and trigger notes](US-044-rule-edit-metadata.md) | Visible | Should Have | 6 | Blocked draft |
| US-045 | [Rename an offence type without losing history](US-045-rule-rename-type.md) | Visible | Must Have | 5 | Blocked draft |
| US-046 | [Edit a ladder step duration](US-046-rule-edit-duration.md) | Visible | Should Have | 6 | Blocked draft |
| US-047 | [Change the number of escalation steps](US-047-rule-ladder-length.md) | Visible | Should Have | 5 | Blocked draft |
| US-048 | [Review offence type deletion impact](US-048-rule-delete-type.md) | Visible | Must Have | 8 | Blocked draft |
| US-049 | [Use an alternative decay policy if approved](US-049-rule-optional-policies.md) | Logic | Could Have | 5 | Blocked draft |
| US-050 | [Understand the impact of a model change](US-050-rule-safe-model-changes.md) | Proposed | Must Have | 4 | Blocked draft |
| US-051 | [Retain recorded history](US-051-obs-durable-history.md) | Proposed | Must Have | 3 | Blocked draft |
| US-052 | [Review the group's accepted history](US-052-obs-shared-history.md) | Proposed | Must Have | 1 | Blocked draft |
| US-053 | [Recover an interrupted change](US-053-obs-save-recovery.md) | Proposed | Must Have | 10 | Blocked draft |
| US-054 | [Resolve changes during reporting](US-054-obs-concurrent-consistency.md) | Proposed | Should Have | 3 | Blocked draft |
| US-055 | [Recover when access expires](US-055-obs-expired-session.md) | Proposed | Must Have | 3 | Blocked draft |
| US-056 | [Distinguish observation from derived estimate](US-056-obs-evidence-provenance.md) | Visible | Must Have | 3 | Blocked draft |
| US-057 | [Use the tracking workflow without a mouse](US-057-obs-keyboard-workflow.md) | Proposed | Must Have | 6 | Blocked draft |
| US-058 | [Choose an override on a touch device](US-058-obs-touch-override.md) | Proposed | Should Have | 1 | Blocked draft |
| US-059 | [Navigate modal reporting with assistive technology](US-059-obs-accessible-dialogs.md) | Proposed | Must Have | 5 | Blocked draft |
| US-060 | [Understand report controls without visual guessing](US-060-obs-accessible-controls.md) | Proposed | Must Have | 4 | Blocked draft |
| US-061 | [Perceive status and validation feedback](US-061-obs-perceivable-feedback.md) | Proposed | Must Have | 3 | Blocked draft |
| US-062 | [Reach tracking information on supported screens](US-062-obs-responsive-report.md) | Proposed | Should Have | 6 | Blocked draft |
| US-063 | [Use equivalent interactions with reduced motion](US-063-obs-reduced-motion.md) | Proposed | Could Have | 1 | Blocked draft |
| US-064 | [Understand delayed or failed data loading](US-064-obs-load-recovery.md) | Proposed | Should Have | 3 | Blocked draft |
| US-065 | [Keep an offence distinct from its observations](US-065-root-cooldown-identity.md) | Proposed | Must Have | 2 | Blocked draft |
