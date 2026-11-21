"""Grief-report warning notices that do not restrict account availability."""

from django.conf import settings
from django.db import models

from .accounts import SteamAccount
from .base import IdentifiedRecord
from .policies import PolicyVersion


class GriefWarning(IdentifiedRecord):
    """Preserve a warning notice without turning it into an issued cooldown."""

    # The account scopes the notice to its fleet; the revision pins its reason at receipt.
    account = models.ForeignKey(SteamAccount, on_delete=models.PROTECT, related_name="warnings")
    policy = models.ForeignKey(PolicyVersion, on_delete=models.PROTECT)
    # Keep the time the operator saw the warning separate from its server receipt time.
    observed_at = models.DateTimeField()
    # Attribution survives account deactivation and remains visible alongside the notice.
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)

    class Meta:
        """Show recent warnings first, with stable ordering for simultaneous notices."""

        # A retry reuses the notice UUID and cannot introduce a second entry in this timeline.
        ordering = ["-observed_at", "id"]
