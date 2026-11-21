"""Record warning-only notices independently of cooldown history and predictions."""

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from tracker.models import GriefWarning, OffenceType, PolicyVersion, SteamAccount
from tracker.services.access import Conflict, audit, save_validated
from tracker.services.catalogue import current_policy


@transaction.atomic
def record_warning(fleet, actor, attributes):
    """Record a grief warning once, preserving account availability and escalation state."""
    # Serialize concurrent retries for the same account before checking the notice UUID.
    account = get_object_or_404(
        SteamAccount.objects.select_for_update(), fleet=fleet, id=attributes["account_id"]
    )
    # Retry comparison uses the pinned version even after an operator archives or edits the reason.
    existing = GriefWarning.objects.filter(id=attributes["id"]).select_related("policy").first()
    if existing is not None:
        if (
            existing.account_id != account.id
            or existing.created_by_id != actor.id
            or existing.policy_id != attributes["policy_id"]
            or existing.policy.offence_type_id != attributes["type_id"]
            or existing.observed_at != attributes["observed_at"]
        ):
            # Never return details about an unrelated notice whose UUID was reused.
            raise Conflict()
        return existing, False
    # The reason lock protects the reviewed policy and archive status through the insert.
    definition = get_object_or_404(
        OffenceType.objects.select_for_update(), fleet=fleet, id=attributes["type_id"]
    )
    policy = current_policy(definition)
    if policy.id != attributes["policy_id"]:
        # A changed mechanism needs a new review before classifying the notice.
        raise Conflict()
    if (
        account.archived_at
        or definition.archived_at
        or policy.mechanism != PolicyVersion.Mechanism.GRIEFING
    ):
        raise ValidationError("Choose an active account and a grief-report reason.")
    if attributes["observed_at"] > timezone.now():
        # Evidence requires an observation that has already occurred.
        raise ValidationError({"observed_at": "A warning cannot be observed in the future."})
    # A warning has no timer or assigned step and does not invalidate a cooldown preview.
    warning = save_validated(
        GriefWarning(
            id=attributes["id"],
            account=account,
            policy=policy,
            observed_at=attributes["observed_at"],
            created_by=actor,
        )
    )
    audit(
        fleet,
        actor,
        "warning.recorded",
        warning.id,
        {"account_id": account.id, "type_id": definition.id},
    )
    return warning, True
