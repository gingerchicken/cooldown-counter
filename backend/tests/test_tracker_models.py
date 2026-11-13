"""Storage tests exercise fleet identity, stable references and historical invariants."""

from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models.deletion import ProtectedError
from django.utils import timezone

from tracker.models import (
    AuditEntry,
    CooldownEvent,
    Fleet,
    LadderStep,
    Membership,
    Observation,
    OffenceType,
    PolicyVersion,
    SteamAccount,
)

# Real database writes distinguish model constraints from serializer-only validation.
pytestmark = pytest.mark.django_db


@pytest.fixture
def storage_graph(user):
    """Create a minimal related graph without seeding fabricated data into normal startup."""
    # The fleet owns every tracked account and offence definition in this fixture.
    fleet = Fleet.objects.create(name="Test fleet")
    # Steam identity remains a string so its 17 digits survive API round trips.
    account = SteamAccount.objects.create(fleet=fleet, steam_id="76561198039452203", tag="main")
    # Stable type identity is independent of mutable display labels.
    offence_type = OffenceType.objects.create(fleet=fleet, name="Abandoning", code="ABD")
    # A version owns the durations used by saved historical assessments.
    policy = PolicyVersion.objects.create(offence_type=offence_type, number=1, created_by=user)
    LadderStep.objects.create(policy=policy, position=1, duration_minutes=30)
    return fleet, account, offence_type, policy


def test_steam_id_is_exact_and_unique_only_within_fleet(storage_graph):
    """Independent fleets may track the same external account without sharing history."""
    # Fixture identities supply one existing fleet and exact account identifier.
    fleet, account, _, _ = storage_graph
    account.refresh_from_db()
    assert account.steam_id == "76561198039452203"
    # A second fleet has its own account record for the same external Steam identity.
    other_fleet = Fleet.objects.create(name="Other")
    SteamAccount.objects.create(fleet=other_fleet, steam_id=account.steam_id, tag="other")
    # The database rejects duplicate identity within the original fleet.
    with pytest.raises(IntegrityError), transaction.atomic():
        SteamAccount.objects.create(fleet=fleet, steam_id=account.steam_id, tag="duplicate")


@pytest.mark.parametrize("steam_id", ["123", "7656119803945220x", "765611980394522031"])
def test_invalid_steam_id_fails_model_validation(storage_graph, steam_id):
    """Storage-facing model validation does not silently pad or round an external identity."""
    # The account is unsaved so full_clean exercises the actual field validators.
    account = SteamAccount(fleet=storage_graph[0], steam_id=steam_id, tag="invalid")
    with pytest.raises(ValidationError):
        account.full_clean()


def test_offence_name_is_case_insensitively_unique_within_fleet(storage_graph):
    """Case differences cannot create two indistinguishable ladders in one catalogue."""
    # The first fixture already owns the mixed-case Abandoning label.
    fleet = storage_graph[0]
    with pytest.raises(IntegrityError), transaction.atomic():
        OffenceType.objects.create(fleet=fleet, name="aBaNdOnInG", code="DUP")
    # Another fleet owns a separate catalogue and may reuse the same visible label.
    other_fleet = Fleet.objects.create(name="Other")
    OffenceType.objects.create(fleet=other_fleet, name="Abandoning", code="ABD")


def test_membership_is_unique_per_user_and_fleet(storage_graph, user):
    """One person cannot accumulate contradictory permission rows in the same fleet."""
    # Owner is a persisted role rather than an inference from Django administrative privilege.
    Membership.objects.create(fleet=storage_graph[0], user=user, role=Membership.Role.OWNER)
    with pytest.raises(IntegrityError), transaction.atomic():
        Membership.objects.create(fleet=storage_graph[0], user=user, role=Membership.Role.VIEWER)


@pytest.mark.parametrize("position, duration_minutes", [(0, 30), (1, 0), (1, -1)])
def test_ladder_bounds_are_database_constraints(storage_graph, position, duration_minutes):
    """Direct database writes cannot create zero steps or nonpositive durations."""
    # A new policy avoids the first fixture's valid position-one uniqueness constraint.
    policy = PolicyVersion.objects.create(offence_type=storage_graph[2], number=2)
    with pytest.raises(IntegrityError), transaction.atomic():
        LadderStep.objects.create(
            policy=policy, position=position, duration_minutes=duration_minutes
        )


def test_policy_version_and_step_order_are_unique(storage_graph):
    """Published identity and ordered step position both have authoritative uniqueness."""
    # The fixture already contains policy one and its first step.
    policy = storage_graph[3]
    with pytest.raises(IntegrityError), transaction.atomic():
        PolicyVersion.objects.create(offence_type=storage_graph[2], number=1)
    with pytest.raises(IntegrityError), transaction.atomic():
        LadderStep.objects.create(policy=policy, position=1, duration_minutes=120)


def test_event_rejects_a_policy_from_another_fleet(storage_graph, user):
    """Membership in both fleets must not permit their account and policy rows to be mixed."""
    # A foreign definition deliberately violates ownership inherited from the tracked account.
    foreign_fleet = Fleet.objects.create(name="Foreign")
    foreign_type = OffenceType.objects.create(fleet=foreign_fleet, name="Other", code="OTH")
    foreign_policy = PolicyVersion.objects.create(offence_type=foreign_type, number=1)
    # This otherwise valid snapshot isolates the ownership failure.
    started_at = timezone.now() - timedelta(hours=1)
    event = CooldownEvent(
        account=storage_graph[1],
        policy=foreign_policy,
        started_at=started_at,
        assigned_step=1,
        total_minutes=30,
        expires_at=started_at + timedelta(minutes=30),
        created_by=user,
    )
    with pytest.raises(ValidationError) as failure:
        event.full_clean()
    assert "policy" in failure.value.message_dict


def test_saved_event_protects_its_historical_policy_and_account(storage_graph, user):
    """Deleting referenced state must never cascade into the recorded evidence."""
    # The event snapshot records a real policy step, independent of later catalogue edits.
    started_at = timezone.now() - timedelta(hours=1)
    event = CooldownEvent.objects.create(
        account=storage_graph[1],
        policy=storage_graph[3],
        started_at=started_at,
        assigned_step=1,
        total_minutes=30,
        expires_at=started_at + timedelta(minutes=30),
        created_by=user,
    )
    # Additional observed evidence belongs to the event rather than another offence.
    Observation.objects.create(
        event=event, observed_at=started_at, remaining_minutes=30, created_by=user
    )
    with pytest.raises(ProtectedError):
        storage_graph[1].delete()
    with pytest.raises(ProtectedError):
        storage_graph[3].delete()
    with pytest.raises(ProtectedError):
        event.delete()


def test_observation_rejects_time_before_event_and_above_total(storage_graph, user):
    """Observed evidence has explicit temporal and duration bounds."""
    # The historical start makes the fixture independent of network or wall-clock races.
    started_at = timezone.now() - timedelta(hours=1)
    event = CooldownEvent.objects.create(
        account=storage_graph[1],
        policy=storage_graph[3],
        started_at=started_at,
        assigned_step=1,
        total_minutes=30,
        expires_at=started_at + timedelta(minutes=30),
        created_by=user,
    )
    # Both errors are reported instead of silently changing the evidence.
    observation = Observation(
        event=event,
        observed_at=started_at - timedelta(minutes=1),
        remaining_minutes=31,
        created_by=user,
    )
    with pytest.raises(ValidationError) as failure:
        observation.full_clean()
    assert {"observed_at", "remaining_minutes"} <= failure.value.message_dict.keys()


def test_override_requires_an_explanation(storage_graph, user):
    """A manually assigned assessment must preserve why the operator changed it."""
    # All scalar fields are valid, leaving the missing override reason as the failing rule.
    started_at = timezone.now() - timedelta(hours=1)
    event = CooldownEvent(
        account=storage_graph[1],
        policy=storage_graph[3],
        started_at=started_at,
        assigned_step=1,
        total_minutes=30,
        expires_at=started_at + timedelta(minutes=30),
        is_override=True,
        override_reason="",
        created_by=user,
    )
    with pytest.raises(ValidationError):
        event.full_clean()


def test_audit_retains_actor_and_fleet_references(storage_graph, user):
    """Deactivation can preserve attribution, while deletion cannot erase audit context."""
    # Subject identity remains a UUID even when the audit describes another model kind.
    audit = AuditEntry.objects.create(
        fleet=storage_graph[0],
        actor=user,
        action="account.created",
        subject_id=storage_graph[1].id,
        details={"tag": "main"},
    )
    assert audit.details == {"tag": "main"}
    with pytest.raises(ProtectedError):
        user.delete()


@pytest.mark.parametrize(
    "updates, expected_field",
    [
        ({"assigned_step": 2}, "assigned_step"),
        ({"total_minutes": 31}, "total_minutes"),
        ({"expires_minutes": 31}, "expires_at"),
        ({"naive": True}, "started_at"),
    ],
)
def test_event_snapshot_validation_rejects_inconsistent_facts(
    storage_graph, user, updates, expected_field
):
    """A pinned assessment must identify a real step and preserve one exact expiry derivation."""
    # Default fixture fields describe the sole thirty-minute policy step correctly.
    started_at = timezone.now() - timedelta(hours=1)
    event = CooldownEvent(
        account=storage_graph[1],
        policy=storage_graph[3],
        started_at=started_at,
        assigned_step=updates.get("assigned_step", 1),
        total_minutes=updates.get("total_minutes", 30),
        expires_at=started_at + timedelta(minutes=updates.get("expires_minutes", 30)),
        created_by=user,
    )
    if updates.get("naive"):
        # Stripping the timezone deliberately challenges validation without guessing local time.
        event.started_at = event.started_at.replace(tzinfo=None)
    with pytest.raises(ValidationError) as failure:
        event.full_clean()
    assert expected_field in failure.value.message_dict


def test_event_overflow_is_field_validation_not_arithmetic_failure(storage_graph, user):
    """A positive but unrepresentable snapshot fails before an overflow reaches the API."""
    # The deliberately excessive total exceeds both the actual ladder and datetime capacity.
    started_at = timezone.now()
    event = CooldownEvent(
        account=storage_graph[1],
        policy=storage_graph[3],
        started_at=started_at,
        assigned_step=1,
        total_minutes=10**30,
        expires_at=started_at + timedelta(minutes=30),
        created_by=user,
    )
    with pytest.raises(ValidationError) as failure:
        event.full_clean()
    assert "total_minutes" in failure.value.message_dict


def test_observation_rejects_naive_timestamp(storage_graph, user):
    """A separate observed-at field needs the same explicit timezone contract as event start."""
    # The saved assessment is valid; only its new evidence omits an offset.
    started_at = timezone.now() - timedelta(hours=1)
    event = CooldownEvent.objects.create(
        account=storage_graph[1],
        policy=storage_graph[3],
        started_at=started_at,
        assigned_step=1,
        total_minutes=30,
        expires_at=started_at + timedelta(minutes=30),
        created_by=user,
    )
    # A naive observation must not inherit the server's current timezone silently.
    observation = Observation(
        event=event,
        observed_at=started_at.replace(tzinfo=None),
        remaining_minutes=30,
        created_by=user,
    )
    with pytest.raises(ValidationError) as failure:
        observation.full_clean()
    assert "observed_at" in failure.value.message_dict
