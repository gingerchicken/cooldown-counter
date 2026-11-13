"""Exact external account identity scoped to an independently authorized fleet."""

from django.core.validators import RegexValidator
from django.db import models

from .base import IdentifiedRecord
from .fleets import Fleet


class SteamAccount(IdentifiedRecord):
    """Track a Steam account without interpreting its 17-digit identity as a number."""

    # An account record belongs to exactly one fleet even if another fleet tracks the same SteamID.
    fleet = models.ForeignKey(Fleet, on_delete=models.PROTECT, related_name="accounts")
    # String identity preserves every digit through Python, JSON and TypeScript round trips.
    steam_id = models.CharField(
        max_length=17,
        validators=[RegexValidator(r"\A[0-9]{17}\Z", "Enter exactly 17 SteamID digits.")],
    )
    # The operator's mutable tag does not determine identity or authorization.
    tag = models.CharField(max_length=120)
    # Archival hides new-report choices without destroying existing evidence.
    archived_at = models.DateTimeField(null=True, blank=True)
    # Services increment this monotonically when history changes, invalidating stale previews.
    history_revision = models.PositiveIntegerField(default=0)

    class Meta:
        """Enforce fleet-local external identity and predictable list ordering."""

        # Independent fleets may deliberately track the same real external account.
        constraints = [
            models.UniqueConstraint(
                fields=["fleet", "steam_id"], name="tracker_account_fleet_steam_unique"
            )
        ]
        # Tag is useful display order; UUID breaks ties without merging equal labels.
        ordering = ["tag", "id"]

    def __str__(self):
        """Keep administration readable while preserving the exact external identifier."""
        # Both tag and SteamID help an operator distinguish similarly named accounts.
        return f"{self.tag} ({self.steam_id})"
