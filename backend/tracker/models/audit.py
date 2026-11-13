"""Fleet-scoped evidence of accepted mutations."""

from django.conf import settings
from django.db import models

from .base import IdentifiedRecord
from .fleets import Fleet


class AuditEntry(IdentifiedRecord):
    """Retain an attributed mutation record inside the same transaction as its subject."""

    # Audit lookup uses the same explicit fleet authorization boundary as the subject.
    fleet = models.ForeignKey(Fleet, on_delete=models.PROTECT, related_name="audit_entries")
    # Deactivation preserves the actor identity and historical accountability.
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="tracker_audit_entries"
    )
    # Stable dotted actions identify the mutation without requiring a new table per action kind.
    action = models.CharField(max_length=64)
    # Subject UUID is an immutable audit locator; action identifies the relevant domain kind.
    subject_id = models.UUIDField()
    # Bounded service-written metadata records the accepted change without storing credentials.
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        """Show recent accepted changes with a stable tie-breaker."""

        # The audit trail is displayed newest first and never used to calculate ladder state.
        ordering = ["-created_at", "id"]
