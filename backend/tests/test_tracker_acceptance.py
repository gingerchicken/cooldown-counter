"""Independent acceptance proofs for authoritative references and shared rule durability."""

from datetime import timedelta
from unittest.mock import patch
from uuid import uuid4

import pytest
from django.conf import settings
from django.contrib.sessions.models import Session
from django.utils import timezone
from rest_framework.test import APIClient

from tracker.models import (
    AuditEntry,
    CooldownEvent,
    LadderStep,
    Observation,
    OffenceType,
    PolicyVersion,
    SteamAccount,
)
from tracker.queries import accounts_projection
from tracker.services.catalogue import create_account, current_policy, save_validated, update_type
from tracker.services.fleets import create_fleet
from tracker.services.reports import preview_report

# Every proof uses real persisted models and transactions without a running broker or web server.
pytestmark = pytest.mark.django_db


@pytest.fixture
def acceptance_workspace(user):
    """Provision one isolated tenant, exact account and editable default type for each criterion."""
    # fleet owns authorization; account is a real tracked identity without fabricated history.
    fleet = create_fleet(user, "Acceptance fleet")
    account = create_account(fleet, user, {"steam_id": "76561198039452203", "tag": "Alpha"})
    # definition is selected from this tenant's catalogue, never by a globally assumed UUID.
    definition = fleet.offence_types.get(name="Abandoning")
    return fleet, account, definition


def reviewed_report(client, fleet, account, definition, *, started_at=None):
    """Build a previewed command with optional started_at for explicit chronology."""
    # started_at is explicit history or a past default; observation remains a separate instant.
    started_at = started_at or timezone.now() - timedelta(minutes=10)
    # selection carries stable identities and an explicit timezone through the real API boundary.
    selection = {
        "account_id": str(account.id),
        "type_id": str(definition.id),
        "started_at": started_at.isoformat(),
    }
    # response proves the selected references existed and could be assessed before any later change.
    response = client.post(f"/api/fleets/{fleet.id}/preview/", selection, format="json")
    assert response.status_code == 200, response.data
    # preview may include explanatory facts; only reviewed tokens become command inputs.
    preview = response.json()
    return {
        **selection,
        "id": str(uuid4()),
        "observation_id": str(uuid4()),
        "policy_id": preview["policy_id"],
        "history_revision": preview["history_revision"],
        "observed_at": (started_at + timedelta(minutes=1)).isoformat(),
        "remaining_minutes": min(20, preview["total_minutes"]),
    }


def persisted_rule_state(fleet, account, definition, assessed_at):
    """Capture durable rows and public calculations for a rollback comparison."""
    # Ordering makes equality independent of database return order or mutable names.
    return {
        "types": list(OffenceType.objects.filter(fleet=fleet).order_by("id").values()),
        "policies": list(
            PolicyVersion.objects.filter(offence_type__fleet=fleet).order_by("id").values()
        ),
        "steps": list(
            LadderStep.objects.filter(policy__offence_type__fleet=fleet).order_by("id").values()
        ),
        "accounts": list(SteamAccount.objects.filter(fleet=fleet).order_by("id").values()),
        "events": list(CooldownEvent.objects.filter(account__fleet=fleet).order_by("id").values()),
        "observations": list(
            Observation.objects.filter(event__account__fleet=fleet).order_by("id").values()
        ),
        "audit": list(AuditEntry.objects.filter(fleet=fleet).order_by("id").values()),
        "account_projection": accounts_projection(fleet),
        "preview": preview_report(
            fleet,
            {"account_id": account.id, "type_id": definition.id, "started_at": assessed_at},
        ),
    }


def test_missing_account_at_authoritative_save_creates_no_orphan(csrf_client, acceptance_workspace):
    """RQ-224: removal after preview cannot silently restore or substitute the account."""
    # fleet/account/definition are the valid selected graph; report retains its pre-removal UUIDs.
    fleet, account, definition = acceptance_workspace
    report = reviewed_report(csrf_client, fleet, account, definition)
    # No event exists yet, so fixture removal does not bypass history protection.
    account.delete()
    # audit_count separates fixture removal from any accidentally accepted report side effect.
    audit_count = AuditEntry.objects.filter(fleet=fleet).count()
    # response exercises authoritative acceptance after the earlier valid preview.
    response = csrf_client.post(f"/api/fleets/{fleet.id}/events/", report, format="json")
    assert response.status_code == 404, response.data
    assert not CooldownEvent.objects.filter(account__fleet=fleet).exists()
    assert not Observation.objects.filter(event__account__fleet=fleet).exists()
    assert not SteamAccount.objects.filter(pk=report["account_id"]).exists()
    assert AuditEntry.objects.filter(fleet=fleet).count() == audit_count


def test_missing_offence_at_authoritative_save_creates_no_fallback_event(
    csrf_client, acceptance_workspace
):
    """RQ-225: removal after preview cannot store a blank or fallback offence."""
    # fleet/account/definition are valid before the referenced type disappears.
    fleet, account, definition = acceptance_workspace
    report = reviewed_report(csrf_client, fleet, account, definition)
    # Production archives types. Remove only this unused fixture graph for a missing-reference test;
    # no protected event or observation history is removed or weakened by the test.
    LadderStep.objects.filter(policy__offence_type=definition).delete()
    definition.versions.all().delete()
    definition.delete()
    # audit_count must survive rejection unchanged even though other valid types remain available.
    audit_count = AuditEntry.objects.filter(fleet=fleet).count()
    # response must reject final acceptance without selecting another available offence.
    response = csrf_client.post(f"/api/fleets/{fleet.id}/events/", report, format="json")
    assert response.status_code == 404, response.data
    account.refresh_from_db()
    assert account.history_revision == 0
    assert not CooldownEvent.objects.filter(account__fleet=fleet).exists()
    assert not Observation.objects.filter(event__account__fleet=fleet).exists()
    assert not OffenceType.objects.filter(pk=report["type_id"]).exists()
    assert AuditEntry.objects.filter(fleet=fleet).count() == audit_count


@pytest.mark.parametrize("failure_stage", ["second_step", "audit"])
def test_failed_shared_rule_change_restores_catalogue_history_and_calculations(
    csrf_client, acceptance_workspace, user, failure_stage
):
    """RQ-281/RQ-309: failed publication preserves names, complete rules and calculations."""
    # fleet/account/definition have accepted evidence, making policy relationships observable.
    fleet, account, definition = acceptance_workspace
    report = reviewed_report(csrf_client, fleet, account, definition)
    assert (
        csrf_client.post(f"/api/fleets/{fleet.id}/events/", report, format="json").status_code
        == 201
    )
    # now freezes calculations; assessed_at is an explicit non-future assessment instant.
    now = timezone.now()
    assessed_at = now - timedelta(minutes=1)
    with patch("django.utils.timezone.now", return_value=now):
        # before captures dependent rows and read/preview outcomes before the failed edit.
        before = persisted_rule_state(fleet, account, definition, assessed_at)
        # policy is the reviewed version; attributes change metadata and every rule input.
        policy = current_policy(definition)
        attributes = {
            "expected_policy_id": policy.id,
            "name": "Leaving early",
            "code": "LEFT",
            "note": "A replacement shared rule",
            "steps": [60, 180, 360],
            "clean_window_days": 3,
            "decay_mode": "full_reset",
        }

        def fail_during_second_step(instance):
            """Fail after persisting the new policy and its first dependent step."""
            # instance is the real row; unrelated writes retain their normal validation.
            if isinstance(instance, LadderStep) and instance.position == 2:
                # The partial ladder must roll back with its already-saved parent rename/version.
                raise RuntimeError("Injected shared publication failure")
            return save_validated(instance)

        # failure_patch covers an intermediate dependent write and the final required audit write.
        failure_patch = (
            patch("tracker.services.catalogue.save_validated", side_effect=fail_during_second_step)
            if failure_stage == "second_step"
            else patch(
                "tracker.services.catalogue.audit",
                side_effect=RuntimeError("Injected shared publication failure"),
            )
        )
        with (
            failure_patch,
            pytest.raises(RuntimeError, match="Injected shared publication failure"),
        ):
            # Only a required write's availability changes; the real transaction is exercised.
            update_type(fleet, user, definition.id, attributes)
        # after is fetched afresh, preventing stale in-memory instances from satisfying equality.
        after = persisted_rule_state(fleet, account, definition, assessed_at)
    assert after == before


def test_successful_shared_rename_preserves_every_stable_evidence_identity(
    csrf_client, acceptance_workspace, user
):
    """RQ-281: one rename reaches projections while type, policy and evidence keys stay stable."""
    # fleet/account/definition support two independently tracked accounts using the same offence.
    fleet, account, definition = acceptance_workspace
    second_account = create_account(fleet, user, {"steam_id": "76561198039452204", "tag": "Beta"})
    for selected_account in (account, second_account):
        # report gives each selected_account its own real offence and initial observed evidence.
        report = reviewed_report(csrf_client, fleet, selected_account, definition)
        assert (
            csrf_client.post(f"/api/fleets/{fleet.id}/events/", report, format="json").status_code
            == 201
        )
    # policy/step_ids pin the rule; saved_events/saved_observations retain every evidence field.
    policy = current_policy(definition)
    step_ids = list(policy.steps.values_list("id", flat=True))
    saved_events = list(CooldownEvent.objects.filter(account__fleet=fleet).values())
    saved_observations = list(Observation.objects.filter(event__account__fleet=fleet).values())
    # response applies metadata through the authorized HTTP boundary, retaining policy inputs.
    response = csrf_client.patch(
        f"/api/fleets/{fleet.id}/types/{definition.id}/",
        {
            "expected_policy_id": str(policy.id),
            "name": "Leaving early",
            "code": "LEFT",
            "note": "Same offence, clearer name",
            "steps": list(policy.steps.values_list("duration_minutes", flat=True)),
            "clean_window_days": policy.clean_window_days,
            "decay_mode": policy.decay_mode,
        },
        format="json",
    )
    assert response.status_code == 200, response.data
    assert response.json()["id"] == str(definition.id)
    assert response.json()["policy"]["id"] == str(policy.id)
    assert definition.versions.count() == 1
    assert list(policy.steps.values_list("id", flat=True)) == step_ids
    assert list(CooldownEvent.objects.filter(account__fleet=fleet).values()) == saved_events
    assert (
        list(Observation.objects.filter(event__account__fleet=fleet).values()) == saved_observations
    )
    for selected_account in (account, second_account):
        # detail is a fresh read; history and prediction labels must share the stable type UUID.
        detail = csrf_client.get(f"/api/fleets/{fleet.id}/accounts/{selected_account.id}/").json()
        assert detail["id"] == str(selected_account.id)
        assert detail["steam_id"] == selected_account.steam_id
        assert detail["recorded_type_ids"] == [str(definition.id)]
        assert detail["history_revision"] == 1
        assert detail["events"][0]["type_id"] == str(definition.id)
        assert detail["events"][0]["type_name"] == "Leaving early"
        # prediction is the same ladder's estimate; renaming cannot create a replacement identity.
        # entry is one current per-type estimate, selected by UUID rather than its mutable name.
        prediction = next(
            entry for entry in detail["predictions"] if entry["type_id"] == str(definition.id)
        )
        assert prediction["type_name"] == "Leaving early"


@pytest.mark.parametrize("decay_mode", ["step_down", "full_reset", "none"])
def test_accepted_transition_settings_survive_new_authenticated_client(
    csrf_client, acceptance_workspace, user, decay_mode
):
    """RQ-312: supported decay modes and a nondefault window survive a fresh client load."""
    # fleet/definition identify the edited rule; _account is unused by this persistence proof.
    fleet, _account, definition = acceptance_workspace
    # policy supplies the optimistic token for the accepted edit before the fresh client exists.
    policy = current_policy(definition)
    # accepted is a real successful edit, not a browser-local settings draft or a mocked response.
    accepted = csrf_client.patch(
        f"/api/fleets/{fleet.id}/types/{definition.id}/",
        {
            "expected_policy_id": str(policy.id),
            "name": definition.name,
            "code": definition.code,
            "note": definition.note,
            "steps": [45, 180, 720],
            "clean_window_days": 11,
            "decay_mode": decay_mode,
        },
        format="json",
    )
    assert accepted.status_code == 200, accepted.data
    # reloaded_client starts without prior response/draft state, matching a reload's fresh read.
    reloaded_client = APIClient(enforce_csrf_checks=True)
    reloaded_client.force_login(user)
    # catalogue is fetched afresh through the authorized API using stable definition identities.
    catalogue = reloaded_client.get(f"/api/fleets/{fleet.id}/types/")
    assert catalogue.status_code == 200, catalogue.data
    # restored selects the original identity; entry is one freshly read catalogue definition.
    restored = next(entry for entry in catalogue.json() if entry["id"] == str(definition.id))
    assert restored["policy"] == accepted.json()["policy"]
    assert restored["policy"]["decay_mode"] == decay_mode
    assert restored["policy"]["clean_window_days"] == 11
    assert restored["policy"]["steps"] == [45, 180, 720]


def test_changed_policy_rejects_old_report_without_consuming_retry_identity(
    csrf_client, acceptance_workspace
):
    """RQ-324: a ladder edit after preview requires fresh review before report acceptance."""
    # fleet/account/definition form a valid report whose history stays unchanged during review.
    fleet, account, definition = acceptance_workspace
    report = reviewed_report(csrf_client, fleet, account, definition)
    # changed publishes a new policy while retaining the same type and account UUIDs.
    changed = csrf_client.patch(
        f"/api/fleets/{fleet.id}/types/{definition.id}/",
        {
            "expected_policy_id": report["policy_id"],
            "name": definition.name,
            "steps": [60, 240, 1440],
            "clean_window_days": 3,
            "decay_mode": "full_reset",
        },
        format="json",
    )
    assert changed.status_code == 200, changed.data
    assert changed.json()["policy"]["id"] != report["policy_id"]
    # audit_count includes the accepted rule edit; rejecting the report must add no mutation fact.
    audit_count = AuditEntry.objects.filter(fleet=fleet).count()
    # rejected must identify a policy conflict without silently accepting a recalculated total.
    rejected = csrf_client.post(f"/api/fleets/{fleet.id}/events/", report, format="json")
    assert rejected.status_code == 409, rejected.data
    account.refresh_from_db()
    assert account.history_revision == report["history_revision"] == 0
    assert not CooldownEvent.objects.filter(account=account).exists()
    assert not Observation.objects.filter(event__account=account).exists()
    assert AuditEntry.objects.filter(fleet=fleet).count() == audit_count
    # refreshed is a new authoritative review for exactly the original account/type/start selection.
    # field ranges over only the selection inputs; saved totals and stale tokens are excluded.
    refreshed = csrf_client.post(
        f"/api/fleets/{fleet.id}/preview/",
        {field: report[field] for field in ("account_id", "type_id", "started_at")},
        format="json",
    )
    assert refreshed.status_code == 200, refreshed.data
    assert refreshed.json()["policy_id"] == changed.json()["policy"]["id"]
    assert refreshed.json()["total_minutes"] == 60
    # Reuse the original retry identities: failed acceptance must not have reserved either UUID.
    report["policy_id"] = refreshed.json()["policy_id"]
    report["history_revision"] = refreshed.json()["history_revision"]
    # accepted uses the rejected draft's original retry UUIDs after a real fresh review.
    accepted = csrf_client.post(f"/api/fleets/{fleet.id}/events/", report, format="json")
    assert accepted.status_code == 201, accepted.data
    assert accepted.json()["id"] == report["id"]
    assert accepted.json()["observations"][0]["id"] == report["observation_id"]
    assert accepted.json()["policy_id"] == changed.json()["policy"]["id"]
    assert accepted.json()["total_minutes"] == 60


def test_account_history_is_fully_chronological_after_out_of_order_recording(
    csrf_client, acceptance_workspace
):
    """RQ-141: full history stays chronological after out-of-order offence recording."""
    # fleet/account/definition own one history; reference is a safely past shared chronology anchor.
    fleet, account, definition = acceptance_workspace
    reference = timezone.now() - timedelta(minutes=10)
    # accepted_ids records returned UUIDs by age, independent of database/display ordering.
    accepted_ids = {}
    for days_ago in (1, 9, 4):
        # days_ago inserts newest, oldest, then middle; report is a valid reviewed command.
        report = reviewed_report(
            csrf_client,
            fleet,
            account,
            definition,
            started_at=reference - timedelta(days=days_ago),
        )
        # accepted confirms all rows exist before checking the complete returned sequence.
        accepted = csrf_client.post(f"/api/fleets/{fleet.id}/events/", report, format="json")
        assert accepted.status_code == 201, accepted.data
        accepted_ids[days_ago] = accepted.json()["id"]
    # response is a fresh detail read, not an independently sorted fixture or a filtered tie subset.
    response = csrf_client.get(f"/api/fleets/{fleet.id}/accounts/{account.id}/")
    assert response.status_code == 200, response.data
    # events is the full history in actual display order; event is one returned row.
    events = response.json()["events"]
    assert [event["id"] for event in events] == [
        accepted_ids[9],
        accepted_ids[4],
        accepted_ids[1],
    ]
    assert [event["started_at"] for event in events] == [
        (reference - timedelta(days=days_ago)).isoformat().replace("+00:00", "Z")
        for days_ago in (9, 4, 1)
    ]


def test_session_expiry_between_preview_and_save_requires_real_reauthentication(
    csrf_client, acceptance_workspace, user
):
    """RQ-327: an expired preview's session cannot mutate until password login and fresh review."""
    # fleet/account/definition are available to a real cookie session before its expiry.
    fleet, account, definition = acceptance_workspace
    report = reviewed_report(csrf_client, fleet, account, definition)
    # session_key identifies the same persisted cookie session used to obtain the accepted preview.
    session_key = csrf_client.cookies[settings.SESSION_COOKIE_NAME].value
    assert (
        Session.objects.filter(session_key=session_key).update(
            expire_date=timezone.now() - timedelta(seconds=1)
        )
        == 1
    )
    # audit_count excludes setup; rejected must fail authentication before recording any evidence.
    audit_count = AuditEntry.objects.filter(fleet=fleet).count()
    rejected = csrf_client.post(f"/api/fleets/{fleet.id}/events/", report, format="json")
    assert rejected.status_code == 403, rejected.data
    assert csrf_client.get("/api/auth/session/").json() == {"user": None}
    account.refresh_from_db()
    assert account.history_revision == 0
    assert not CooldownEvent.objects.filter(account=account).exists()
    assert not Observation.objects.filter(event__account=account).exists()
    assert AuditEntry.objects.filter(fleet=fleet).count() == audit_count
    # csrf_response bootstraps an anonymous token; logging in must use credentials, not force_login.
    csrf_response = csrf_client.get("/api/csrf/")
    csrf_client.credentials(HTTP_X_CSRFTOKEN=csrf_response.json()["csrfToken"])
    # login proves the expired browser can establish a new session using valid credentials.
    login = csrf_client.post(
        "/api/auth/login/",
        {"username": user.username, "password": "test-password"},
        format="json",
    )
    assert login.status_code == 200, login.data
    assert login.json()["user"]["id"] == user.pk
    assert csrf_client.cookies[settings.SESSION_COOKIE_NAME].value != session_key
    # renewed_csrf follows Django's login rotation before any new authenticated mutation.
    renewed_csrf = csrf_client.get("/api/csrf/")
    csrf_client.credentials(HTTP_X_CSRFTOKEN=renewed_csrf.json()["csrfToken"])
    # fresh_report obtains new review; original UUIDs prove expiry did not consume the draft.
    fresh_report = reviewed_report(csrf_client, fleet, account, definition)
    fresh_report["id"] = report["id"]
    fresh_report["observation_id"] = report["observation_id"]
    # accepted is the first evidence write, after actual authentication and fresh review.
    accepted = csrf_client.post(f"/api/fleets/{fleet.id}/events/", fresh_report, format="json")
    assert accepted.status_code == 201, accepted.data
    assert accepted.json()["id"] == report["id"]
    assert accepted.json()["observations"][0]["id"] == report["observation_id"]
    assert CooldownEvent.objects.filter(account=account).count() == 1
    assert Observation.objects.filter(event__account=account).count() == 1
