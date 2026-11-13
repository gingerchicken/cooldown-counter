"""Command-unit regression tests verify transaction rollback and snapshot preservation."""

from datetime import timedelta
from uuid import uuid4

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.exceptions import ValidationError as CommandValidationError

from tracker.models import AuditEntry, CooldownEvent, Observation
from tracker.services.access import Conflict
from tracker.services.catalogue import create_account, create_type, current_policy, update_type
from tracker.services.fleets import create_fleet
from tracker.services.reports import preview_report, record_event, record_observation

# Service commands need real model constraints but remain independent of HTTP and browser rendering.
pytestmark = pytest.mark.django_db


@pytest.fixture
def workspace(user):
    """Create a tenant and exact account once per isolated service behavior."""
    # Service fixtures exercise the same complete publication transaction as application creation.
    fleet = create_fleet(user, "Service fixture")
    account = create_account(fleet, user, {"steam_id": "76561198039452203", "tag": "Alpha"})
    return fleet, account


def report_for(fleet, account, start):
    """Prepare typed command inputs against the authoritative event-time preview."""
    # Stable type identity is obtained from this specific tenant's independent default catalogue.
    definition = fleet.offence_types.get(name="Abandoning")
    # Each draft carries its own reviewed revision and policy identity.
    attributes = {"account_id": account.id, "type_id": definition.id, "started_at": start}
    preview = preview_report(fleet, attributes)
    return {
        **attributes,
        "id": uuid4(),
        "observation_id": uuid4(),
        "policy_id": preview["policy_id"],
        "history_revision": preview["history_revision"],
        "observed_at": start + timedelta(minutes=1),
        "remaining_minutes": 20,
    }


def test_invalid_initial_evidence_rolls_back_event_revision_and_audit(workspace, user):
    """A failed observation must not leave behind an offence without evidence."""
    # Preserve each aggregate before deliberately failing the nested observation validation.
    fleet, account = workspace
    audit_count = AuditEntry.objects.filter(fleet=fleet).count()
    report = report_for(fleet, account, timezone.now() - timedelta(minutes=5))
    report["remaining_minutes"] = 31
    with pytest.raises(ValidationError):
        # The event would otherwise be valid, so rollback must encompass earlier command writes.
        record_event(fleet, user, report)
    account.refresh_from_db()
    assert CooldownEvent.objects.filter(account=account).count() == 0
    assert Observation.objects.filter(event__account=account).count() == 0
    assert account.history_revision == 0
    assert AuditEntry.objects.filter(fleet=fleet).count() == audit_count


@pytest.mark.parametrize("steps", [[], [True]])
def test_service_rejects_incomplete_policy_before_publishing(workspace, user, steps):
    """Non-HTTP callers must preserve the same nonempty, whole-duration policy invariant."""
    # A rejected initial policy must also roll back its newly allocated offence identity.
    fleet, _account = workspace
    with pytest.raises(CommandValidationError):
        # Domain validation is deliberately exercised without a DRF request serializer.
        create_type(fleet, user, {"name": "Invalid service policy", "steps": steps})
    assert not fleet.offence_types.filter(name="Invalid service policy").exists()


def test_partial_metadata_command_retains_unedited_labels_and_policy(workspace, user):
    """A service-level note correction must not reset a display code or create another revision."""
    # Keep the original identity/version so preservation is checked directly rather than by count.
    fleet, _account = workspace
    definition = fleet.offence_types.get(name="Abandoning")
    policy = current_policy(definition)
    updated = update_type(
        fleet,
        user,
        definition.id,
        {"expected_policy_id": policy.id, "note": "Clarified trigger"},
    )
    assert updated.name == "Abandoning"
    assert updated.code == "ABD"
    assert updated.note == "Clarified trigger"
    assert current_policy(updated).id == policy.id


def test_backdated_event_does_not_rewrite_saved_later_assessment(workspace, user):
    """New earlier evidence affects new estimates without silently mutating recorded history."""
    # The first accepted assessment was made without the earlier evidence being known.
    fleet, account = workspace
    later_input = report_for(fleet, account, timezone.now() - timedelta(days=1))
    later, _ = record_event(fleet, user, later_input)
    # Backdating is a separate accepted offence, not a request to recalculate the later snapshot.
    earlier_input = report_for(fleet, account, timezone.now() - timedelta(days=2))
    earlier, _ = record_event(fleet, user, earlier_input)
    later.refresh_from_db()
    assert earlier.assigned_step == 1
    assert later.assigned_step == 1
    assert later.total_minutes == 30
    assert later.expires_at == later_input["started_at"] + timedelta(minutes=30)


def test_reused_observation_identity_rejects_changed_facts(workspace, user):
    """Append-only observations cannot be overwritten by changing a retried body."""
    # One accepted event provides the stable parent for further observations.
    fleet, account = workspace
    report = report_for(fleet, account, timezone.now() - timedelta(minutes=10))
    event, _ = record_event(fleet, user, report)
    # A second observation has its own retry identity and preserves the original offence count.
    attributes = {
        "id": uuid4(),
        "observed_at": timezone.now() - timedelta(minutes=2),
        "remaining_minutes": 10,
    }
    record_observation(fleet, user, event.id, attributes)
    attributes["remaining_minutes"] = 9
    with pytest.raises(Conflict):
        # The identity is already committed to a different remaining-time fact.
        record_observation(fleet, user, event.id, attributes)
    assert CooldownEvent.objects.filter(account=account).count() == 1
    assert event.observations.count() == 2
