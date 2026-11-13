"""Fleet ownership and explicit operator permissions."""

from django.conf import settings
from django.db import models

from .base import IdentifiedRecord


class Fleet(IdentifiedRecord):
    """One independently authorized group of tracked accounts and rule definitions."""

    # The fleet label is presentation metadata; stable identity controls relationships.
    name = models.CharField(max_length=120)

    class Meta:
        """Provide repeatable catalogue order without assigning meaning to UUID ordering."""

        # Name and identity together make pagination stable when labels happen to match.
        ordering = ["name", "id"]

    def __str__(self):
        """Use the fleet label in Django administration and validation messages."""
        # The display string never substitutes for the UUID in access checks.
        return self.name


class Membership(models.Model):
    """Authorize one Django user for one fleet with exactly one effective role."""

    class Role(models.TextChoices):
        """Keep API role identifiers separate from their human-readable labels."""

        # Owners manage membership and retain all editor capabilities.
        OWNER = "owner", "Owner"
        # Editors may manage accounts, rules and evidence but not membership.
        EDITOR = "editor", "Editor"
        # Viewers can inspect the authorized fleet without performing mutations.
        VIEWER = "viewer", "Viewer"

    # Fleet membership is removed deliberately, never by cascading deletion of its context.
    fleet = models.ForeignKey(Fleet, on_delete=models.PROTECT, related_name="memberships")
    # Deactivate users to revoke login while preserving historical authorization context.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="fleet_memberships"
    )
    # Role has no privilege-granting default; provisioning must choose explicitly.
    role = models.CharField(max_length=8, choices=Role)

    class Meta:
        """Prevent conflicting permissions even when callers bypass model validation."""

        # One role row is authoritative for each user/fleet pair.
        constraints = [
            models.UniqueConstraint(fields=["fleet", "user"], name="tracker_membership_unique"),
            models.CheckConstraint(
                condition=models.Q(role__in=["owner", "editor", "viewer"]),
                name="tracker_membership_valid_role",
            ),
        ]
