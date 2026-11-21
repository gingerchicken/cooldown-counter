"""Record assessment snapshots and append evidence under explicit concurrency tokens."""

from datetime import timedelta

from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from tracker.models import CooldownEvent, Observation, OffenceType, SteamAccount
from tracker.prediction import ORDINARY_DURATIONS, HistoryEntry, predict

from .access import Conflict, audit, save_validated
from .catalogue import current_policy, policy_spec


def history_key(policy):
    """Return the progression identity within a single Steam account and fleet."""
    # Ordinary reasons share probation. An opt-in to a new mechanism starts a distinct history.
    return (
        "ordinary" if policy.mechanism == "ordinary" else (policy.mechanism, policy.offence_type_id)
    )


def history_entry(event, readings=None):
    """Return the level supported by the saved prediction and available timer observations.

    Current projections supply prefetched events. A backdated preview passes only readings
    visible by its assessment time, so a later observation cannot change its input history.
    """
    if event.assigned_step is None:
        # Observation-only notices never advance a numeric ladder.
        return None
    # Saved assessments remain authoritative for a custom rule. A game notice can add evidence.
    expiry = event.expires_at
    level = event.assigned_step
    lower_bound = event.level_is_lower_bound
    if event.policy.mechanism == "ordinary":
        # Stable chronological ordering makes the last eligible reading the current expiry estimate.
        observations = list(event.observations.all() if readings is None else readings)
        if observations:
            latest = observations[-1]
            expiry = _observed_expiry(latest.observed_at, latest.remaining_minutes)
            # A timer seen after issue also proves the restriction lasted through the intervening
            # whole minutes. Discard fractional elapsed minutes to respect the input precision.
            whole_minute = timedelta(minutes=1)
            observed_total = max(
                (reading.observed_at - event.started_at) // whole_minute + reading.remaining_minutes
                for reading in observations
            )
            if observed_total > event.total_minutes:
                # A later, shorter reading cannot erase a previous sighting's minimum level.
                level = max(
                    level,
                    1 + sum(observed_total > minutes for minutes in ORDINARY_DURATIONS[:-1]),
                )
                lower_bound = True
    return HistoryEntry(event.started_at, expiry, level, str(event.id), lower_bound)


def observation_only_explanation(policy):
    """Describe what is known without assigning an invented stage or recovery schedule."""
    if policy.mechanism == "vacnet":
        # Valve publishes a repeat maximum, but its FAQ gives inconsistent minimum durations.
        return "VACNet restrictions can reach 180 days. Record the timer shown in game."
    # The current public grief-report guidance supplies no reliable sequence of durations.
    return "Grief-report duration and recovery are unknown. Record the timer shown in game."


def _preview_history(account, policy, at):
    """Read only history effective at the draft start, within the selected progression."""
    # Ordinary reasons share a level across types; other mechanisms stay with their type.
    events = account.events.filter(policy__mechanism=policy.mechanism, started_at__lte=at)
    if policy.mechanism != "ordinary":
        events = events.filter(policy__offence_type_id=policy.offence_type_id)
    return events


def _observed_expiry(observed_at, remaining_minutes):
    """Convert a timer reading into an expiry estimate, rejecting calendar overflow."""
    # Both inputs describe the same sighting even when the operator submits it much later.
    try:
        return observed_at + timedelta(minutes=remaining_minutes)
    except OverflowError as error:
        raise ValidationError(
            {"remaining_minutes": "Timer exceeds the supported timestamp range."}
        ) from error


def _history_at(events, policy, at):
    """Recover the expiry known at a historical assessment without leaking later readings."""
    if policy.mechanism == "ordinary":
        # Fetch eligible readings in one ordered query with a stable chronological tie-break.
        events = events.prefetch_related(
            Prefetch(
                "observations",
                queryset=Observation.objects.filter(observed_at__lte=at).order_by(
                    "observed_at", "id"
                ),
                to_attr="eligible_readings",
            )
        )
    # Joining the policy avoids a query per event while determining which readings affect its state.
    return [
        history_entry(event, getattr(event, "eligible_readings", None))
        for event in events.select_related("policy")
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
    # Select only the rows supporting this assessment, including other qualifying ordinary reasons.
    events = _preview_history(account, policy, attributes["started_at"])
    if policy.mechanism in {"vacnet", "griefing"}:
        # No exact public ladder exists. The subsequent report requires an actual timer reading.
        if attributes.get("forced_step") is not None:
            raise ValidationError({"forced_step": "This mechanism has no published steps."})
        return {
            "policy_id": policy.id,
            "history_revision": account.history_revision,
            "step": None,
            "total_minutes": None,
            "expires_at": None,
            "base_step": None,
            "level_is_lower_bound": False,
            "sample_count": events.count(),
            "transition": observation_only_explanation(policy),
        }
    # Select eligible readings separately from receipt time when a draft is backdated.
    entries = _history_at(events, policy, attributes["started_at"])
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
        "level_is_lower_bound": assessment.level_is_lower_bound,
        "transition": assessment.transition,
        # Later recorded offences cannot support an assessment made for an earlier instant.
        "sample_count": len(entries),
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
        and event.vac_attribution == attributes.get("vac_attribution", "unknown")
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
            level_is_lower_bound=preview["level_is_lower_bound"],
            # Game timers provide independent evidence. Custom rules retain their model expiry.
            observed_expires_at=(
                _observed_expiry(attributes["observed_at"], attributes["remaining_minutes"])
                if policy.mechanism != "custom"
                else None
            ),
            vac_attribution=attributes.get("vac_attribution", "unknown"),
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
    if event.policy.mechanism != "custom":
        # An older sighting remains in the audit history but cannot supersede newer timer evidence.
        observed_expiry = _observed_expiry(observation.observed_at, observation.remaining_minutes)
        latest_id = (
            event.observations.order_by("-observed_at", "-id").values_list("id", flat=True).first()
        )
        if latest_id == observation.id:
            # The account lock serializes this cache with every observation on the same event.
            event.observed_expires_at = observed_expiry
            event.save(update_fields=["observed_expires_at"])
    account.history_revision += 1
    account.save(update_fields=["history_revision"])
    audit(fleet, actor, "observation.recorded", observation.id, {"event_id": event.id})
    return observation, True
