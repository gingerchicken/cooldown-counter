"""Stable offence identity with immutable, ordered policy revisions."""

from django.conf import settings
from django.db import models
from django.db.models.functions import Lower

from .base import IdentifiedRecord
from .fleets import Fleet


class OffenceType(IdentifiedRecord):
    """Keep an offence identity stable while labels and its published policy evolve."""

    # Types share the fleet authorization boundary of the accounts they assess.
    fleet = models.ForeignKey(Fleet, on_delete=models.PROTECT, related_name="offence_types")
    # Human labels are case-insensitively unique within a fleet, including archived definitions.
    name = models.CharField(max_length=120)
    # Short code is a compact calendar label rather than an identity or relationship key.
    code = models.CharField(max_length=4)
    # Optional trigger context is retained as literal text, not executable markup.
    note = models.TextField(blank=True, default="")
    # An archived type remains readable through historical references.
    archived_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        """Enforce catalogue naming without requiring application-side race-prone checks."""

        # A functional unique index catches concurrent case-only duplicate creation.
        constraints = [
            models.UniqueConstraint(Lower("name"), "fleet", name="tracker_type_fleet_name_unique")
        ]
        # Stable display ordering does not determine which revision is current.
        ordering = ["name", "id"]

    def __str__(self):
        """Show the readable offence label in administration."""
        # Historical references continue to use the UUID when the label changes.
        return self.name


class PolicyVersion(IdentifiedRecord):
    """Publish a rule snapshot that existing event assessments can retain forever.

    Application services create versions and step rows atomically. They do not
    update published versions; scalar checks here supplement that write boundary.
    """

    class Mechanism(models.TextChoices):
        """Choose the account history and evidence rules for this immutable revision."""

        # A custom policy retains its own fleet-configured durations and same-reason history.
        CUSTOM = "custom", "Custom ladder"
        # Qualifying ordinary reasons advance a shared competitive level for this account.
        ORDINARY = "ordinary", "Ordinary competitive"
        # The public VACNet and grief-report rules do not define a predictable duration sequence.
        VACNET = "vacnet", "VACNet restriction"
        GRIEFING = "griefing", "Griefing reports"

    class DecayMode(models.TextChoices):
        """Expose only the supported expiry-anchored reduction strategies."""

        # Each completed clean window removes one stored level.
        STEP_DOWN = "step_down", "Step down one level"
        # The first completed clean window removes the entire stored state.
        FULL_RESET = "full_reset", "Full reset"
        # State remains until a new event changes its assigned level.
        NONE = "none", "No decay"

    # Stable offence identity lets renaming preserve every policy relationship.
    offence_type = models.ForeignKey(OffenceType, on_delete=models.PROTECT, related_name="versions")
    # Services serialize publication on the parent type before choosing the next number.
    number = models.PositiveIntegerField()
    # Legacy revisions default to custom so migration does not reinterpret evidence by its name.
    mechanism = models.CharField(max_length=10, choices=Mechanism, default=Mechanism.CUSTOM)
    # The visible default is one-level decay rather than an implicit hidden setting.
    decay_mode = models.CharField(max_length=10, choices=DecayMode, default=DecayMode.STEP_DOWN)
    # A day means 24 elapsed hours, independent of operator timezone or daylight saving.
    clean_window_days = models.PositiveIntegerField(default=7)
    # Null permits explicitly documented system-created rule defaults, never guessed authorship.
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="created_tracker_policies",
    )

    class Meta:
        """Make the greatest published version number the deterministic current revision."""

        # Uniqueness and positive bounds remain authoritative for direct database callers.
        constraints = [
            models.UniqueConstraint(
                fields=["offence_type", "number"], name="tracker_policy_type_number_unique"
            ),
            models.CheckConstraint(
                condition=models.Q(number__gt=0), name="tracker_policy_number_positive"
            ),
            models.CheckConstraint(
                condition=models.Q(clean_window_days__gt=0), name="tracker_policy_window_positive"
            ),
            models.CheckConstraint(
                condition=models.Q(decay_mode__in=["step_down", "full_reset", "none"]),
                name="tracker_policy_mode_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(mechanism__in=["custom", "ordinary", "vacnet", "griefing"]),
                name="tracker_policy_mechanism_valid",
            ),
        ]
        # Descending number supports the current-version lookup under one type.
        ordering = ["-number"]


class LadderStep(models.Model):
    """One positive whole-minute duration in a published policy's ordered ladder."""

    # PROTECT prevents version removal from silently deleting the rule's ordered definition.
    policy = models.ForeignKey(PolicyVersion, on_delete=models.PROTECT, related_name="steps")
    # Services validate contiguous one-based positions before publishing the complete set.
    position = models.PositiveIntegerField()
    # Whole minutes avoid floating-point ambiguity in saved penalty assessments.
    duration_minutes = models.PositiveIntegerField()

    class Meta:
        """Keep the ladder order unambiguous and prevent unusable zero-duration steps."""

        # Database constraints complement cross-row contiguity and nonempty checks in services.
        constraints = [
            models.UniqueConstraint(
                fields=["policy", "position"], name="tracker_step_policy_position_unique"
            ),
            models.CheckConstraint(
                condition=models.Q(position__gt=0), name="tracker_step_position_positive"
            ),
            models.CheckConstraint(
                condition=models.Q(duration_minutes__gt=0), name="tracker_step_duration_positive"
            ),
        ]
        # Query order is domain order; creation identity has no ladder meaning.
        ordering = ["position"]
