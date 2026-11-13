"""Shared persistent identity for externally referenced tracker records."""

import uuid

from django.db import models


class IdentifiedRecord(models.Model):
    """Give public records stable retry-safe UUIDs and an immutable creation instant."""

    # UUIDs remain stable across label edits and can identify safe retries before creation.
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Creation time is an audit fact rather than the cooldown's start or observation timestamp.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Share fields without creating an unnecessary concrete parent table."""

        # Each domain table owns its own UUID, avoiding a joined inheritance hierarchy.
        abstract = True
