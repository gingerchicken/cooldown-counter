"""Build tenant-scoped read projections from saved evidence and one server clock.

Index each issued event and its timer readings once per response. Ordinary reasons
reuse one progression per account. Calendar forecasts visit only boundaries
inside the selected date range. No cache survives a request.
"""

from collections import Counter
from collections.abc import Iterable
from datetime import UTC, datetime, time

from django.db.models import OuterRef, Prefetch, Subquery
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.utils import timezone

from tracker.models import CooldownEvent, OffenceType, PolicyVersion, SteamAccount
from tracker.prediction import forecast, predict
from tracker.services.catalogue import current_policy, policy_spec
from tracker.services.reports import (
    history_entry,
    history_key,
    observation_only_explanation,
)


def policy_projection(policy):
    """Expose only a published policy's immutable modeled inputs."""
    # Explicit steps retain configured ordinal order without exposing database row identities.
    return {
        "id": policy.id,
        "number": policy.number,
        "mechanism": policy.mechanism,
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
        # Keep the pinned estimate readable alongside the currently observed release time.
        "expires_at": event.observed_expires_at or event.expires_at,
        "observed_expires_at": event.observed_expires_at,
        "predicted_expires_at": event.expires_at,
        "mechanism": event.policy.mechanism,
        "level_is_lower_bound": event.level_is_lower_bound,
        "vac_attribution": event.vac_attribution,
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


def _group_histories(events: Iterable[CooldownEvent]):
    """Index saved assessments by account and by the progression pinned to each event."""
    # Ordinary reasons share one key. Custom policy versions retain their stable reason identity.
    histories = {}
    for event in events:
        # Observation-only events affect availability but cannot supply an escalation level.
        entry = history_entry(event)
        if entry is not None:
            histories.setdefault((event.account_id, history_key(event.policy)), []).append(entry)
    return histories


def account_projection(account, policies, now, *, detail=False):
    """Project availability from evidence and conditional predictions from applicable history."""
    # Prefetched events are already in chronological order with deterministic ties.
    events = list(account.events.all())
    histories = _group_histories(events)
    # Observation-only sample counts count issued restrictions independently of timer updates.
    counts = Counter(history_key(event.policy) for event in events)
    # The newest game timer can extend or shorten the active span relative to the initial guess.
    active = [
        event
        for event in events
        if event.started_at <= now < (event.observed_expires_at or event.expires_at)
    ]
    # An account may have many ordinary reasons; evaluate their identical shared history once.
    predictions_by_history = {}
    # Keep a prediction card per selectable reason so operators can still filter by its identity.
    predictions = []
    for policy in policies:
        # Unknown special schedules have no level, automatic duration, or forecast of recovery.
        key = history_key(policy)
        history = histories.get((account.id, key), ())
        special = policy.mechanism in (
            PolicyVersion.Mechanism.VACNET,
            PolicyVersion.Mechanism.GRIEFING,
        )
        if not special and key not in predictions_by_history:
            predictions_by_history[key] = predict(policy_spec(policy), history, now)
        # Special notices expose their observation count and explanation without inventing a level.
        prediction = predictions_by_history.get(key)
        predictions.append(
            {
                "type_id": policy.offence_type_id,
                "type_name": policy.offence_type.name,
                "mechanism": policy.mechanism,
                "step": prediction.step if prediction else None,
                "total_steps": len(policy.steps.all()),
                "total_minutes": prediction.total_minutes if prediction else None,
                "base_step": prediction.base_step if prediction else None,
                "level_is_lower_bound": prediction.level_is_lower_bound if prediction else False,
                "sample_count": counts[key],
                "recorded_step": history[-1].assigned_step if history else (None if special else 0),
                "next_decay_at": prediction.next_decay_at if prediction else None,
                "transition": prediction.transition
                if prediction
                else observation_only_explanation(policy),
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
        "active_until": max(
            ((event.observed_expires_at or event.expires_at) for event in active), default=None
        ),
        "first_observed": min((event.started_at for event in events), default=None),
    }
    if detail:
        # Detail has all immutable assessments and observations, not just a representative row.
        projection["warnings"] = list(
            account.warnings.select_related("created_by", "policy__offence_type")
        )
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
    events = (
        event_queryset(fleet)
        .alias(effective_expiry=Coalesce("observed_expires_at", "expires_at"))
        .filter(started_at__lt=end, effective_expiry__gt=start)
    )
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
        events = events.filter(started_at__lte=now, effective_expiry__gt=now)
    elif filters["status"] == "clear":
        # The calendar explicitly means expired records, while account lists name clear accounts.
        events = events.filter(effective_expiry__lte=now)
    # Index complete scoped history once; visible-range records cannot provide every decay anchor.
    histories = _group_histories(event_queryset(fleet))
    # Active definitions have current rules; archived history remains visible as recorded events.
    policies = current_policies(fleet)
    # Account identities are reused across markers instead of requiring one database read per
    # marker.
    accounts = {account.id: account for account in SteamAccount.objects.filter(fleet=fleet)}
    # Select one representative reason per progression. A reason filter selects its own label/ID.
    marker_policies = {}
    for policy in policies:
        # Observation-only restrictions cannot generate inferred step-down dates.
        if policy.mechanism in (PolicyVersion.Mechanism.VACNET, PolicyVersion.Mechanism.GRIEFING):
            continue
        if not filters.get("type_id") or policy.offence_type_id == filters["type_id"]:
            marker_policies.setdefault(history_key(policy), policy)
    # Each returned marker describes a single account transition, even with many ordinary reasons.
    markers = []
    for account in accounts.values():
        # Archived accounts are historical evidence, not sources of new availability forecasts.
        if account.archived_at or (
            filters.get("account_id") and account.id != filters["account_id"]
        ):
            continue
        for key, policy in marker_policies.items():
            # All qualifying ordinary reasons read the same progression for this account.
            history = histories.get((account.id, key), ())
            for point in forecast(policy_spec(policy), history, now, start=start, end=end):
                # A shared marker represents all ordinary reasons for this account.
                markers.append(
                    {
                        "account_id": account.id,
                        "account_tag": account.tag,
                        "type_id": policy.offence_type_id,
                        "type_name": "Ordinary competitive"
                        if policy.mechanism == PolicyVersion.Mechanism.ORDINARY
                        else policy.offence_type.name,
                        "at": point.at,
                        "stored_step": point.stored_step,
                        "next_step": point.next_step,
                        "total_minutes": point.total_minutes,
                    }
                )
    # Fleet totals are explicitly fleet-wide, independent of visible date segments and filters.
    global_events = CooldownEvent.objects.filter(account__fleet=fleet).alias(
        effective_expiry=Coalesce("observed_expires_at", "expires_at")
    )
    return {
        "events": [event_projection(event) for event in events],
        "forecasts": markers,
        "account_count": SteamAccount.objects.filter(fleet=fleet, archived_at__isnull=True).count(),
        "active_count": global_events.filter(
            started_at__lte=now, effective_expiry__gt=now, account__archived_at__isnull=True
        )
        .values("account_id")
        .distinct()
        .count(),
        "recorded_count": global_events.count(),
        "as_of": now,
    }
