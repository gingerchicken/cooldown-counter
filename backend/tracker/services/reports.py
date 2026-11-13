"""Record assessment snapshots and append evidence under explicit concurrency tokens."""

from datetime import timedelta

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from tracker.models import CooldownEvent, Observation, OffenceType, SteamAccount
from tracker.prediction import HistoryEntry, PolicySpec, predict

from .access import Conflict, audit, save_validated
from .catalogue import current_policy


def policy_spec(policy):
    """Translate one immutable ORM version into the independently tested pure model."""
    # Step order belongs to published ordinals, never to magnitude or client display sorting.
    return PolicySpec(
        tuple(step.duration_minutes for step in policy.steps.all()),
        policy.clean_window_days,
        policy.decay_mode,
    )


def history_entries(account, offence_type_id):
    """Read only saved same-account/type assessment facts, including archived versions."""
    # A stable type ID joins versions without mutating or regrouping records by display name.
    return [
        HistoryEntry(event.started_at, event.expires_at, event.assigned_step, str(event.id))
        for event in account.events.filter(policy__offence_type_id=offence_type_id).order_by(
            "started_at", "id"
        )
    ]


def validate_report_time(started_at, observed_at=None):
    """Reject invented future facts and observations preceding their underlying offence."""
    # The authoritative clock is evaluated once so the two fields share the same upper bound.
    now = timezone.now()
    if started_at > now:
        # Future input is not silently treated as an already-active cooldown.
        raise ValidationError({"started_at": "Cooldown start cannot be in the future."})
    if observed_at is not None and not started_at <= observed_at <= now:
        # Observation time is distinct from the event issue time and server creation time.
        raise ValidationError({"observed_at": "Observation must be between start and now."})


def preview_report(fleet, attributes):
    """Assess a report without changing history and return tokens needed by its command."""
    # IDs are scoped before lookup, including when an operator belongs to both fleets.
    account = get_object_or_404(SteamAccount, pk=attributes["account_id"], fleet=fleet)
    offence_type = get_object_or_404(OffenceType, pk=attributes["type_id"], fleet=fleet)
    if account.archived_at or offence_type.archived_at:
        # Historical references remain readable but cannot be chosen for new events.
        raise ValidationError({"detail": "Choose an active account and offence type."})
    validate_report_time(attributes["started_at"])
    # Current policy identity and history revision form an optimistic review boundary.
    policy = current_policy(offence_type)
    # Reuse the same scoped history for calculation and its event-time evidence count.
    entries = history_entries(account, offence_type.id)
    try:
        # The pure engine excludes events later than the entered assessment time.
        assessment = predict(
            policy_spec(policy),
            entries,
            attributes["started_at"],
            attributes.get("forced_step"),
        )
        # An unsupported datetime range is rejected, never wrapped or fabricated.
        expires_at = attributes["started_at"] + timedelta(minutes=assessment.total_minutes)
    except (ValueError, OverflowError) as error:
        # Public validation text contains only the known domain condition, never a traceback.
        raise ValidationError({"detail": str(error)}) from error
    return {
        "policy_id": policy.id,
        "history_revision": account.history_revision,
        "step": assessment.step,
        "total_minutes": assessment.total_minutes,
        "expires_at": expires_at,
        "base_step": assessment.base_step,
        "transition": assessment.transition,
        # Later recorded offences cannot support an assessment made for an earlier instant.
        "sample_count": sum(entry.started_at <= attributes["started_at"] for entry in entries),
    }


def _same_event_request(event, attributes):
    """Check that a stable retry identity has not been reused for another accepted payload."""
    # The first observation has its own explicit identity, so later appended evidence cannot alter
    # retry matching.
    observation = event.observations.filter(pk=attributes["observation_id"]).first()
    return (
        event.account_id == attributes["account_id"]
        and event.policy_id == attributes["policy_id"]
        and event.policy.offence_type_id == attributes["type_id"]
        and event.started_at == attributes["started_at"]
        and event.is_override == (attributes.get("forced_step") is not None)
        and (not event.is_override or event.assigned_step == attributes["forced_step"])
        and event.override_reason == attributes.get("override_reason", "")
        and observation is not None
        and observation.observed_at == attributes["observed_at"]
        and observation.remaining_minutes == attributes["remaining_minutes"]
    )


@transaction.atomic
def record_event(fleet, actor, attributes):
    """Persist one new offence and its initial observation, or acknowledge an identical retry."""
    # Account locking serializes history snapshots without placing unrelated fleets in one lock
    # queue.
    account = get_object_or_404(
        SteamAccount.objects.select_for_update(), pk=attributes["account_id"], fleet=fleet
    )
    # Check accepted retries before current revisions, which legitimately changed after the first
    # acceptance.
    existing = CooldownEvent.objects.select_related("policy").filter(pk=attributes["id"]).first()
    if existing is not None:
        # Reused identities cannot expose a foreign event or change previously recorded evidence.
        if existing.account.fleet_id != fleet.id or not _same_event_request(existing, attributes):
            raise Conflict("This request identity was already used for different evidence.")
        return existing, False
    # A type lock excludes concurrent archival or publication during final acceptance.
    offence_type = get_object_or_404(
        OffenceType.objects.select_for_update(), pk=attributes["type_id"], fleet=fleet
    )
    policy = current_policy(offence_type)
    if (
        account.history_revision != attributes["history_revision"]
        or policy.id != attributes["policy_id"]
    ):
        # No write is accepted against an estimate the operator did not actually review.
        raise Conflict()
    if account.archived_at or offence_type.archived_at:
        # A stale open form must not resurrect an archived account or rule.
        raise ValidationError({"detail": "Choose an active account and offence type."})
    validate_report_time(attributes["started_at"], attributes["observed_at"])
    # Re-evaluate inside the lock rather than accepting a client-provided total or expiry.
    preview = preview_report(fleet, attributes)
    if (
        attributes.get("forced_step") is not None
        and not attributes.get("override_reason", "").strip()
    ):
        # The model can be overridden only with durable human attribution and reasoning.
        raise ValidationError({"override_reason": "Explain the manual step override."})
    if Observation.objects.filter(pk=attributes["observation_id"]).exists():
        # An observation retry identity cannot be borrowed by a distinct event command.
        raise Conflict("This observation identity was already used.")
    # Saved assessment facts pin the rule version and do not change on later backdated reports.
    event = save_validated(
        CooldownEvent(
            id=attributes["id"],
            account=account,
            policy=policy,
            started_at=attributes["started_at"],
            assigned_step=preview["step"],
            total_minutes=preview["total_minutes"],
            expires_at=preview["expires_at"],
            is_override=attributes.get("forced_step") is not None,
            override_reason=attributes.get("override_reason", ""),
            transition=preview["transition"],
            created_by=actor,
        )
    )
    # One offence always has at least its initial observed evidence at commit time.
    save_validated(
        Observation(
            id=attributes["observation_id"],
            event=event,
            observed_at=attributes["observed_at"],
            remaining_minutes=attributes["remaining_minutes"],
            created_by=actor,
        )
    )
    # The locked revision invalidates every other draft based on the old account evidence.
    account.history_revision += 1
    account.save(update_fields=["history_revision"])
    audit(
        fleet,
        actor,
        "event.recorded",
        event.id,
        {"policy_id": policy.id, "step": event.assigned_step},
    )
    return event, True


@transaction.atomic
def record_observation(fleet, actor, event_id, attributes):
    """Attach new evidence to an existing offence without applying another ladder advance."""
    # Find the tenant-scoped event before acquiring its shared account history lock.
    event = get_object_or_404(
        CooldownEvent.objects.select_related("account"), pk=event_id, account__fleet=fleet
    )
    # All evidence writes for this account share one revision and lock owner.
    account = SteamAccount.objects.select_for_update().get(pk=event.account_id)
    # Idempotent observation replay remains valid even when newer observations now exist.
    existing = Observation.objects.filter(pk=attributes["id"]).first()
    if existing is not None:
        # Matching IDs with changed fields are explicit conflicts rather than silent amendments.
        if (
            existing.event_id != event.id
            or existing.observed_at != attributes["observed_at"]
            or existing.remaining_minutes != attributes["remaining_minutes"]
        ):
            raise Conflict("This observation identity was already used for different evidence.")
        return existing, False
    validate_report_time(event.started_at, attributes["observed_at"])
    # The observation model validates against the saved assessment, not the current ladder.
    observation = save_validated(Observation(event=event, created_by=actor, **attributes))
    account.history_revision += 1
    account.save(update_fields=["history_revision"])
    audit(fleet, actor, "observation.recorded", observation.id, {"event_id": event.id})
    return observation, True
