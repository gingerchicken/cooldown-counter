"""Preserved cooldown assessments and their separate observed evidence."""

from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from .accounts import SteamAccount
from .base import IdentifiedRecord
from .policies import PolicyVersion


class CooldownEvent(IdentifiedRecord):
    """One actual offence with the immutable assessment accepted when it was reported.

    A backdated event does not rewrite another event's saved assessment. Further
    observations attach to this identity and therefore do not advance the ladder.
    """

    # Account ownership supplies the event's fleet authorization boundary.
    account = models.ForeignKey(SteamAccount, on_delete=models.PROTECT, related_name="events")
    # The pinned revision preserves the step definition even after a catalogue edit.
    policy = models.ForeignKey(PolicyVersion, on_delete=models.PROTECT, related_name="events")
    # Issue/start time is distinct from evidence observation and row creation time.
    started_at = models.DateTimeField()
    # Assigned step is the saved one-based result, including an accepted manual override.
    assigned_step = models.PositiveIntegerField()
    # Total and expiry preserve the assessment rather than replaying it against later rules.
    total_minutes = models.PositiveIntegerField()
    expires_at = models.DateTimeField()
    # Override state retains explicit operator intervention alongside its explanation.
    is_override = models.BooleanField(default=False)
    override_reason = models.TextField(blank=True, default="")
    # The original transition text records how the saved assessment was explained at acceptance.
    transition = models.TextField(blank=True, default="")
    # User deletion cannot erase attribution; deactivation is the supported access-revocation path.
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_cooldown_events"
    )

    class Meta:
        """Use chronological identity and reject scalar snapshot corruption in the database."""

        # These checks remain effective when callers bypass model.full_clean().
        constraints = [
            models.CheckConstraint(
                condition=models.Q(assigned_step__gt=0), name="tracker_event_step_positive"
            ),
            models.CheckConstraint(
                condition=models.Q(total_minutes__gt=0), name="tracker_event_total_positive"
            ),
            models.CheckConstraint(
                condition=models.Q(expires_at__gt=models.F("started_at")),
                name="tracker_event_expiry_after_start",
            ),
            models.CheckConstraint(
                condition=models.Q(is_override=False) | ~models.Q(override_reason=""),
                name="tracker_event_override_reason",
            ),
        ]
        # UUID breaks equal-time ordering ties without depending on insertion order.
        ordering = ["started_at", "id"]
        # Account and effective start are the primary chronological history lookup.
        indexes = [
            models.Index(fields=["account", "started_at"], name="tracker_event_account_start")
        ]

    def clean(self):
        """Validate cross-row ownership and the consistency of a saved policy assessment.

        Django does not invoke this automatically from save. Authoritative write
        services must call full_clean before committing an accepted assessment.
        """
        # Collect independent errors so an operator can correct the complete rejected snapshot.
        errors = {}
        if self.account_id and self.policy_id:
            # A caller belonging to both fleets still cannot combine their account and rule rows.
            if self.account.fleet_id != self.policy.offence_type.fleet_id:
                errors["policy"] = "The policy and account must belong to the same fleet."
            # The actual published step, rather than the current type version, owns this duration.
            selected_duration = (
                self.policy.steps.filter(position=self.assigned_step)
                .values_list("duration_minutes", flat=True)
                .first()
            )
            if selected_duration is None:
                # Missing steps are invalid references, never a fabricated fallback ladder.
                errors["assigned_step"] = "Choose an existing step of the saved policy."
            elif self.total_minutes != selected_duration:
                # Pinned policy and accepted snapshot must agree at initial persistence.
                errors["total_minutes"] = "The total must match the selected policy step."
        if self.started_at and self.expires_at and self.total_minutes:
            # Naive datetimes do not silently acquire the deployment server's local timezone.
            if timezone.is_naive(self.started_at) or timezone.is_naive(self.expires_at):
                errors["started_at"] = "Cooldown timestamps must include a timezone."
            else:
                # Unsupported timestamp arithmetic is invalid input, never a silent date change.
                try:
                    expected_expiry = self.started_at + timedelta(minutes=self.total_minutes)
                except (OverflowError, TypeError):
                    errors["total_minutes"] = "The duration exceeds the supported timestamp range."
                else:
                    # Expiry has one derivation; conflicting user-provided values are rejected.
                    if self.expires_at != expected_expiry:
                        errors["expires_at"] = (
                            "Expiry must equal start plus the saved total duration."
                        )
        if self.is_override and not self.override_reason.strip():
            # Whitespace alone does not explain a decision that overrides the model.
            errors["override_reason"] = "Explain why the predicted step was overridden."
        if errors:
            # Raising once preserves field-specific feedback for service and serializer callers.
            raise ValidationError(errors)


class Observation(IdentifiedRecord):
    """Append evidence about an existing cooldown without recording another offence."""

    # Historical observations protect the event they describe from destructive deletion.
    event = models.ForeignKey(CooldownEvent, on_delete=models.PROTECT, related_name="observations")
    # Observed-at identifies when this remaining time was seen, independent of server receipt time.
    observed_at = models.DateTimeField()
    # A positive whole-minute value is the selected implementation baseline for observed evidence.
    remaining_minutes = models.PositiveIntegerField()
    # Attribution survives later user deactivation or attempted account deletion.
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_cooldown_observations",
    )

    class Meta:
        """Keep evidence chronological while rejecting silent zero-minute substitutions."""

        # Nonpositive values are rejected instead of clamped to another recorded fact.
        constraints = [
            models.CheckConstraint(
                condition=models.Q(remaining_minutes__gt=0),
                name="tracker_observation_remaining_positive",
            )
        ]
        # Stable ordering distinguishes exact same-time observations by their own identity.
        ordering = ["observed_at", "id"]

    def clean(self):
        """Validate observed evidence against its saved event rather than current policy."""
        # Independent temporal and duration failures are returned together.
        errors = {}
        if self.event_id and self.observed_at:
            # Evidence cannot precede the offence it claims to describe.
            if timezone.is_naive(self.observed_at):
                errors["observed_at"] = "Observation timestamps must include a timezone."
            elif self.observed_at < self.event.started_at:
                errors["observed_at"] = "Observation time cannot precede cooldown start."
            # Remaining evidence must fit the accepted total or the assessment needs correction.
            if (
                self.remaining_minutes is not None
                and self.remaining_minutes > self.event.total_minutes
            ):
                errors["remaining_minutes"] = (
                    "Remaining time cannot exceed the saved total duration."
                )
        if errors:
            # Service code can retain the draft and expose specific correction fields.
            raise ValidationError(errors)
