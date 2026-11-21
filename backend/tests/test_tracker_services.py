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


def report_for(fleet, account, start, reason="Abandoning"):
    """Prepare typed command inputs against the authoritative event-time preview."""
    # Stable type identity is obtained from this specific tenant's independent default catalogue.
    definition = fleet.offence_types.get(name=reason)
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
    report["remaining_minutes"] = 0
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


@pytest.mark.parametrize("reason", ["VACLive", "GriefReports"])
def test_special_notice_saves_unknown_assessment_and_chronological_timer(workspace, user, reason):
    """A long restriction remains reportable and a backfilled reading cannot undo a later one."""
    # A confirmed notice does not imply a known initial duration or enforcement level.
    fleet, account = workspace
    start = timezone.now() - timedelta(days=5)
    report = report_for(fleet, account, start, reason)
    report["remaining_minutes"] = 90 * 24 * 60
    if reason == "VACLive":
        # The affected player can be a member of the party of the flagged player.
        report["vac_attribution"] = "party"
    event, created = record_event(fleet, user, report)
    assert created and event.assigned_step is event.total_minutes is event.expires_at is None
    assert event.observed_expires_at == report["observed_at"] + timedelta(days=90)
    assert event.vac_attribution == report.get("vac_attribution", "unknown")
    assert record_event(fleet, user, report) == (event, False)

    # A recent shorter timer corrects the displayed release time without editing the first reading.
    latest = {"id": uuid4(), "observed_at": start + timedelta(days=3), "remaining_minutes": 90}
    record_observation(fleet, user, event.id, latest)
    # This earlier notice is entered last. Its timer stays in history without moving release.
    record_observation(
        fleet,
        user,
        event.id,
        {
            "id": uuid4(),
            "observed_at": start + timedelta(days=2),
            "remaining_minutes": 43200,
        },
    )
    event.refresh_from_db()
    assert event.observations.count() == 3
    assert event.observed_expires_at == latest["observed_at"] + timedelta(minutes=90)


def test_mixed_ordinary_reasons_and_timer_evidence_do_not_rewrite_prediction(workspace, user):
    """A first long timer proves a higher minimum even if the saved prediction was 30 minutes."""
    # The original forecast represents what was known before the first timer was recorded.
    fleet, account = workspace
    start = timezone.now() - timedelta(days=12)
    report = report_for(fleet, account, start)
    report["remaining_minutes"] = 7 * 24 * 60
    event, _ = record_event(fleet, user, report)
    assert event.total_minutes == 30 and event.expires_at == start + timedelta(minutes=30)

    # A qualifying kick uses the same state and the actual timer to estimate the start of recovery.
    kick_request = {
        "account_id": account.id,
        "type_id": fleet.offence_types.get(name="Kicking").id,
        "started_at": start + timedelta(days=8),
    }
    later_preview = preview_report(fleet, kick_request)
    assert later_preview["sample_count"] == 1 and later_preview["step"] == 5
    assert later_preview["level_is_lower_bound"] and later_preview["total_minutes"] == 10080

    # A backdated draft that predates the long timer sees only the original accepted assessment.
    kick_request["started_at"] = start + timedelta(seconds=30)
    before_observation = preview_report(fleet, kick_request)
    assert before_observation["step"] == 2 and not before_observation["level_is_lower_bound"]


def test_timer_seen_after_predicted_expiry_raises_minimum_level(workspace, user):
    """An account still serving time after its 30-minute prediction has a higher minimum level."""
    # The remaining reading alone fits the first band; elapsed minutes demonstrate the mismatch.
    fleet, account = workspace
    start = timezone.now() - timedelta(days=1)
    report = report_for(fleet, account, start)
    report.update(observed_at=start + timedelta(hours=1), remaining_minutes=5)
    event, _ = record_event(fleet, user, report)
    assert event.total_minutes == 30
    # New predictions advance once from the supported minimum level two.
    later = preview_report(
        fleet,
        {
            "account_id": account.id,
            "type_id": report["type_id"],
            "started_at": start + timedelta(hours=2),
        },
    )
    assert later["step"] == 3 and later["level_is_lower_bound"]


def test_custom_ladder_rejects_an_out_of_range_observation(workspace, user):
    """Existing fleet rules retain their original observation validation and expiry behavior."""
    # Changing reason metadata can never make an independent custom ladder use game timer rules.
    fleet, account = workspace
    create_type(fleet, user, {"name": "Custom", "steps": [30]})
    report = report_for(fleet, account, timezone.now() - timedelta(days=1), "Custom")
    report["remaining_minutes"] = 31
    with pytest.raises(ValidationError, match="cannot exceed"):
        record_event(fleet, user, report)
