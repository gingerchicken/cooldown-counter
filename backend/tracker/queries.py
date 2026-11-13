"""Build tenant-scoped read projections from saved evidence and one server clock.

Response-local history indexing takes O(E) time and memory for E loaded events.
The calendar then performs O(A*T) indexed account/type lookups rather than
rescanning E events for every pair. The pure engine's per-ladder sorts remain
separate. No cross-request cache can retain stale evidence after a write.
"""

from collections.abc import Iterable
from datetime import UTC, datetime, time
from uuid import UUID

from django.db.models import OuterRef, Prefetch, Subquery
from django.shortcuts import get_object_or_404
from django.utils import timezone

from tracker.models import CooldownEvent, OffenceType, PolicyVersion, SteamAccount
from tracker.prediction import HistoryEntry, forecast, predict
from tracker.services.catalogue import current_policy
from tracker.services.reports import policy_spec


def policy_projection(policy):
    """Expose only a published policy's immutable modeled inputs."""
    # Explicit steps retain configured ordinal order without exposing database row identities.
    return {
        "id": policy.id,
        "number": policy.number,
        "decay_mode": policy.decay_mode,
        "clean_window_days": policy.clean_window_days,
        "steps": [step.duration_minutes for step in policy.steps.all()],
    }


def type_projection(definition):
    """Present stable metadata and the latest version while retaining archived definitions."""
    return {
        "id": definition.id,
        "name": definition.name,
        "code": definition.code,
        "note": definition.note,
        "archived_at": definition.archived_at,
        "policy": policy_projection(current_policy(definition)),
        "event_count": CooldownEvent.objects.filter(policy__offence_type=definition).count(),
    }


def fleet_projection(fleet, role):
    """Return the caller's role instead of relying on frontend guesses about permissions."""
    return {"id": fleet.id, "name": fleet.name, "role": role, "created_at": fleet.created_at}


def member_projection(membership):
    """Expose provisioned identity and scoped role without private Django account fields."""
    return {
        "id": membership.id,
        "user_id": membership.user_id,
        "username": membership.user.username,
        "role": membership.role,
    }


def observation_projection(observation):
    """Preserve observed time, remaining minutes and actor separately from model estimates."""
    return {
        "id": observation.id,
        "observed_at": observation.observed_at,
        "remaining_minutes": observation.remaining_minutes,
        "created_by": observation.created_by.username,
        "created_at": observation.created_at,
    }


def event_projection(event):
    """Read one saved assessment without re-evaluating it under a newer policy."""
    return {
        "id": event.id,
        "account_id": event.account_id,
        "account_tag": event.account.tag,
        "type_id": event.policy.offence_type_id,
        "type_name": event.policy.offence_type.name,
        "policy_id": event.policy_id,
        "policy_number": event.policy.number,
        "started_at": event.started_at,
        "expires_at": event.expires_at,
        "assigned_step": event.assigned_step,
        "total_minutes": event.total_minutes,
        "is_override": event.is_override,
        "override_reason": event.override_reason,
        "transition": event.transition,
        "created_by": event.created_by.username,
        "created_at": event.created_at,
        "observations": [
            observation_projection(observation) for observation in event.observations.all()
        ],
    }


def event_queryset(fleet):
    """Prefetch complete history projections without a query per displayed observation."""
    # These joins contain only rows belonging to the already-authorized fleet.
    return (
        CooldownEvent.objects.filter(account__fleet=fleet)
        .select_related("account", "policy__offence_type", "created_by")
        .prefetch_related("observations__created_by")
    )


def current_policies(fleet):
    """Fetch each active type's latest version with a portable correlated query."""
    # The subquery avoids loading every previous version just to choose the greatest number.
    latest = PolicyVersion.objects.filter(offence_type_id=OuterRef("offence_type_id")).order_by(
        "-number"
    )
    return list(
        PolicyVersion.objects.filter(
            pk=Subquery(latest.values("pk")[:1]),
            offence_type__fleet=fleet,
            offence_type__archived_at__isnull=True,
        )
        .select_related("offence_type")
        .prefetch_related("steps")
        .order_by("offence_type__name")
    )


def _group_histories(
    events: Iterable[CooldownEvent],
) -> dict[tuple[UUID, UUID], list[HistoryEntry]]:
    """Adapt each saved assessment once into its stable account/type ladder.

    Callers supply events in persisted start/UUID order. Appending preserves
    that ordering for last-recorded summaries while the pure engine retains
    its independent sort and validation boundary.
    """
    # Each pair owns a chronological snapshot list; names and policy revisions are not keys.
    histories = {}
    for event in events:
        # Stable type identity deliberately combines old and current versions of the same ladder.
        ladder_key = (event.account_id, event.policy.offence_type_id)
        # This list is reused by prediction, forecast and evidence summaries within the response.
        history = histories.setdefault(ladder_key, [])
        history.append(
            HistoryEntry(event.started_at, event.expires_at, event.assigned_step, str(event.id))
        )
    return histories


def account_projection(account, policies, now, *, detail=False):
    """Show current availability and per-type next outcomes without rewriting stored steps."""
    # One prefetched event sequence supports both current status and each independent ladder.
    events = list(account.events.all())
    # A single pass creates reusable saved-state lists instead of filtering events per policy.
    histories = _group_histories(events)
    # Active requires both temporal bounds; future facts are never prematurely restricted.
    active = [event for event in events if event.started_at <= now < event.expires_at]
    # Predictions are generated at the same explicit instant as every fleet status value.
    predictions = []
    for policy in policies:
        # Current policy can differ from historical versions, which retain their original totals.
        history = histories.get((account.id, policy.offence_type_id), ())
        prediction = predict(policy_spec(policy), history, now)
        predictions.append(
            {
                "type_id": policy.offence_type_id,
                "type_name": policy.offence_type.name,
                "step": prediction.step,
                "total_steps": len(policy.steps.all()),
                "total_minutes": prediction.total_minutes,
                "base_step": prediction.base_step,
                "sample_count": len(history),
                "recorded_step": history[-1].assigned_step if history else 0,
                "next_decay_at": prediction.next_decay_at,
                "transition": prediction.transition,
            }
        )
    # Identity and counts remain available even for archived accounts and empty histories.
    projection = {
        "id": account.id,
        "steam_id": account.steam_id,
        "tag": account.tag,
        "archived_at": account.archived_at,
        "history_revision": account.history_revision,
        "event_count": len(events),
        "recorded_type_ids": sorted({event.policy.offence_type_id for event in events}),
        "active_type_ids": sorted({event.policy.offence_type_id for event in active}),
        "status": "active" if active else ("clear" if events else "clean"),
        "predictions": predictions,
        "active_until": max((event.expires_at for event in active), default=None),
        "first_observed": min((event.started_at for event in events), default=None),
    }
    if detail:
        # Detail has all immutable assessments and observations, not just a representative row.
        projection["events"] = [event_projection(event) for event in events]
    return projection


def accounts_projection(fleet, *, account_id=None):
    """Read a fleet's identity/history rows with bounded query count across its accounts."""
    # Current versions are fetched once rather than per account or per prediction card.
    policies = current_policies(fleet)
    # Prefetching joins children only after the fleet boundary has been applied.
    accounts = (
        SteamAccount.objects.filter(fleet=fleet)
        .prefetch_related(Prefetch("events", queryset=event_queryset(fleet)))
        .order_by("tag", "id")
    )
    # A single clock keeps list and detail statuses consistent within each response.
    now = timezone.now()
    if account_id is not None:
        # A foreign or missing account is the same scoped 404.
        account = get_object_or_404(accounts, pk=account_id)
        return account_projection(account, policies, now, detail=True)
    return [account_projection(account, policies, now) for account in accounts]


def calendar_projection(fleet, filters):
    """Return unique records and forecast facts for an explicit half-open UTC date range."""
    # Dates name UTC midnight bounds, independent of browser timezone or local DST.
    start = datetime.combine(filters["start"], time.min, UTC)
    end = datetime.combine(filters["end"], time.min, UTC)
    # Calendar records are unique events; weekly rendering never changes this count unit.
    events = event_queryset(fleet).filter(started_at__lt=end, expires_at__gt=start)
    # One authoritative reference time governs active filtering and future forecasts.
    now = timezone.now()
    if filters.get("account_id"):
        # Lookup validates account ownership even when a query would otherwise return no rows.
        get_object_or_404(SteamAccount, pk=filters["account_id"], fleet=fleet)
        events = events.filter(account_id=filters["account_id"])
    if filters.get("type_id"):
        # Each type selection is checked against the current fleet, not merely used as a filter.
        get_object_or_404(OffenceType, pk=filters["type_id"], fleet=fleet)
        events = events.filter(policy__offence_type_id=filters["type_id"])
    if filters["status"] == "active":
        # Status and offence conditions apply to the same event, avoiding cross-ladder matches.
        events = events.filter(started_at__lte=now, expires_at__gt=now)
    elif filters["status"] == "clear":
        # The calendar explicitly means expired records, while account lists name clear accounts.
        events = events.filter(expires_at__lte=now)
    # Index complete scoped history once; visible-range records cannot provide every decay anchor.
    histories = _group_histories(event_queryset(fleet))
    # Active definitions have current rules; archived history remains visible as recorded events.
    policies = current_policies(fleet)
    # Account identities are reused across markers instead of requiring one database read per
    # marker.
    accounts = {account.id: account for account in SteamAccount.objects.filter(fleet=fleet)}
    markers = []
    for account in accounts.values():
        # Archived accounts are historical evidence, not sources of new availability forecasts.
        if account.archived_at or (
            filters.get("account_id") and account.id != filters["account_id"]
        ):
            continue
        for policy in policies:
            # The same offence restriction applies to forecasts and recorded events.
            if filters.get("type_id") and policy.offence_type_id != filters["type_id"]:
                continue
            # One indexed ladder retains overlap anchors without scanning unrelated saved events.
            history = histories.get((account.id, policy.offence_type_id), ())
            for point in forecast(policy_spec(policy), history, now):
                # A future marker is included only when it is actually inside the requested dates.
                if start <= point.at < end:
                    markers.append(
                        {
                            "account_id": account.id,
                            "account_tag": account.tag,
                            "type_id": policy.offence_type_id,
                            "type_name": policy.offence_type.name,
                            "at": point.at,
                            "stored_step": point.stored_step,
                            "next_step": point.next_step,
                            "total_minutes": point.total_minutes,
                        }
                    )
    # Fleet totals are explicitly fleet-wide, independent of visible date segments and filters.
    global_events = CooldownEvent.objects.filter(account__fleet=fleet)
    return {
        "events": [event_projection(event) for event in events],
        "forecasts": markers,
        "account_count": SteamAccount.objects.filter(fleet=fleet, archived_at__isnull=True).count(),
        "active_count": global_events.filter(
            started_at__lte=now, expires_at__gt=now, account__archived_at__isnull=True
        )
        .values("account_id")
        .distinct()
        .count(),
        "recorded_count": global_events.count(),
        "as_of": now,
    }
