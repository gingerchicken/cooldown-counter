"""Centralize tenant authorization, validated persistence and audit attribution."""

import json

from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import APIException, PermissionDenied

from tracker.models import AuditEntry, Fleet, Membership


class Conflict(APIException):
    """A reviewed command no longer matches the authoritative history or policy."""

    # Conflict is recoverable by refreshing and reviewing, never by silently replaying a write.
    status_code = 409
    default_detail = "The record changed. Refresh the preview and review it before saving."
    default_code = "conflict"


def membership_for(user, fleet_id, *, write=False, owner=False):
    """Return a scoped membership, hiding a foreign fleet's existence with HTTP 404."""
    # Scope before lookup so an authenticated outsider cannot distinguish known tenant IDs.
    membership = get_object_or_404(
        Membership.objects.select_related("fleet", "user"), fleet_id=fleet_id, user=user
    )
    if owner and membership.role != Membership.Role.OWNER:
        # Membership changes remain an owner action even when an editor can modify rules.
        raise PermissionDenied("Only fleet owners can manage membership.")
    if write and membership.role == Membership.Role.VIEWER:
        # Viewer visibility must not imply permission to call a hidden mutation directly.
        raise PermissionDenied("This fleet membership is read-only.")
    return membership


def save_validated(instance):
    """Apply model constraints before persistence; callers own the surrounding transaction."""
    # Services cannot rely on Model.save running clean(), because Django deliberately does not.
    instance.full_clean()
    instance.save()
    return instance


def audit(fleet, actor, action, subject_id, details=None):
    """Append an attributed JSON-safe fact in the same transaction as its mutation."""
    # JSON conversion preserves UUID/date strings without allowing model instances or credentials.
    safe_details = json.loads(json.dumps(details or {}, cls=DjangoJSONEncoder))
    return AuditEntry.objects.create(
        fleet=fleet, actor=actor, action=action, subject_id=subject_id, details=safe_details
    )


def lock_fleet(fleet):
    """Serialize membership administration so two changes cannot remove both last owners."""
    # A tenant parent lock gives owner-count validation one stable transaction boundary.
    return Fleet.objects.select_for_update().get(pk=fleet.pk)
