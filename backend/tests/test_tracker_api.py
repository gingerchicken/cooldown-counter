"""Exercise fleet authorization and recorded-evidence workflows through the real API."""

from datetime import timedelta
from unittest.mock import patch
from uuid import uuid4

import pytest
from django.db import IntegrityError
from django.utils import timezone
from rest_framework.test import APIClient

# Every test receives an isolated transaction-backed fixture database.
pytestmark = pytest.mark.django_db


def test_an_archived_selection_cannot_be_saved_from_an_old_open_draft(csrf_client, fleet, account):
    """A previously reviewed draft must respect archival that happened before its commit."""
    # Current tokens isolate this case from unrelated stale-history validation.
    report = event_request(csrf_client, fleet, account)
    definition = active_type(csrf_client, fleet)
    assert (
        csrf_client.post(
            f"/api/fleets/{fleet['id']}/types/{definition['id']}/archive/",
            {"expected_policy_id": definition["policy"]["id"]},
            format="json",
        ).status_code
        == 200
    )
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", report, format="json").status_code
        == 400
    )


def test_clearing_a_short_code_derives_a_bounded_replacement(csrf_client, fleet):
    """Editing a blank optional code follows the same normalization as initial creation."""
    # No policy change is needed to replace a display-only short code.
    definition = active_type(csrf_client, fleet)
    response = csrf_client.patch(
        f"/api/fleets/{fleet['id']}/types/{definition['id']}/",
        {
            "expected_policy_id": definition["policy"]["id"],
            "name": "Leaving early",
            "code": "",
            "steps": definition["policy"]["steps"],
        },
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["code"] == "LEA"


def test_new_policy_forecast_must_fit_retained_historical_states(
    csrf_client, fleet, account, custom_type
):
    """A short new ladder still has to represent the older saved level's future decay."""
    # Four saved levels remain meaningful after shortening the active ladder.
    report = event_request(csrf_client, fleet, account, forced_step=4, reason=custom_type["name"])
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", report, format="json").status_code
        == 201
    )
    # One window fits datetime; four retained-state windows do not.
    definition = custom_type
    response = csrf_client.patch(
        f"/api/fleets/{fleet['id']}/types/{definition['id']}/",
        {
            "expected_policy_id": definition["policy"]["id"],
            "name": definition["name"],
            "steps": [30],
            "clean_window_days": 1000000,
        },
        format="json",
    )
    assert response.status_code == 400
    assert (
        active_type(csrf_client, fleet, custom_type["name"])["policy"]["id"]
        == definition["policy"]["id"]
    )


def test_concurrent_database_uniqueness_failure_is_a_safe_conflict(csrf_client):
    """A constraint race must not leak driver text or pretend its write was accepted."""
    with patch("tracker.views.fleets.create_fleet", side_effect=IntegrityError("private SQL")):
        # The HTTP boundary translates the service error after its transaction rolled back.
        response = csrf_client.post("/api/fleets/", {"name": "A racing name"}, format="json")
    assert response.status_code == 409
    assert "private SQL" not in str(response.data)


@pytest.fixture
def fleet(csrf_client):
    """Create the primary user's fleet through the same command used by the UI."""
    # The response proves ordinary authenticated users can establish their own scoped fleet.
    response = csrf_client.post("/api/fleets/", {"name": "Primary fleet"}, format="json")
    assert response.status_code == 201, response.data
    return response.json()


@pytest.fixture
def account(csrf_client, fleet):
    """Track an exact SteamID without introducing fake initial account records."""
    # Exact identifiers must survive JSON, persistence and projection without numeric coercion.
    response = csrf_client.post(
        f"/api/fleets/{fleet['id']}/accounts/",
        {"steam_id": "76561198039452203", "tag": "Alpha"},
        format="json",
    )
    assert response.status_code == 201, response.data
    return response.json()


def active_type(client, fleet, name="Abandoning"):
    """Read a seeded editable rule rather than assuming its generated database identity."""
    # Catalogue UUIDs are scoped to each independent fleet and are never hard-coded in tests.
    response = client.get(f"/api/fleets/{fleet['id']}/types/")
    assert response.status_code == 200
    return next(definition for definition in response.json() if definition["name"] == name)


@pytest.fixture
def custom_type(csrf_client, fleet):
    """Create an independent policy to test legacy fleet-defined behavior through HTTP."""
    # Matching ordinary durations lets these tests isolate how a custom policy treats history.
    response = csrf_client.post(
        f"/api/fleets/{fleet['id']}/types/",
        {"name": "Local policy", "mechanism": "custom", "steps": [30, 120, 1440, 10080]},
        format="json",
    )
    assert response.status_code == 201, response.data
    return response.json()


def event_request(
    client, fleet, account, *, forced_step=None, started_at=None, reason="Abandoning"
):
    """Build one report against an authoritative preview and explicit observation time."""
    # The fixture start is already in the past, avoiding timing-dependent future-time failures.
    started_at = started_at or timezone.now() - timedelta(minutes=10)
    # The selected type comes from this fleet's catalogue and retains its policy identity.
    offence_type = active_type(client, fleet, reason)
    # The preview revision protects the report against concurrent account-history changes.
    preview_body = {
        "account_id": account["id"],
        "type_id": offence_type["id"],
        "started_at": started_at.isoformat(),
    }
    if forced_step is not None:
        # A manual assessment selects a real step rather than replacing the ladder itself.
        preview_body["forced_step"] = forced_step
    # The same input is sent to the preview and command boundaries.
    preview_response = client.post(
        f"/api/fleets/{fleet['id']}/preview/", preview_body, format="json"
    )
    assert preview_response.status_code == 200, preview_response.data
    # UUID retry identities are stable when this dictionary is deliberately submitted again.
    preview = preview_response.json()
    return {
        **preview_body,
        "id": str(uuid4()),
        "observation_id": str(uuid4()),
        "policy_id": preview["policy_id"],
        "history_revision": preview["history_revision"],
        "observed_at": (started_at + timedelta(minutes=1)).isoformat(),
        "remaining_minutes": min(20, preview["total_minutes"] or 20),
        "override_reason": "Observed step in game" if forced_step else "",
    }


def test_anonymous_requests_cannot_list_fleets(api_client):
    """Restricted records must be protected at the API rather than only by the login screen."""
    assert api_client.get("/api/fleets/").status_code == 403


@pytest.mark.parametrize("days_ago, expected_samples", [(31, 0), (25, 1), (10, 2), (0, 3)])
def test_preview_counts_only_same_account_type_evidence_effective_at_its_time(
    csrf_client, fleet, account, custom_type, days_ago, expected_samples
):
    """A backdated report must not cite later history as support for its assessment."""
    # A shared reference instant keeps the saved chronology separate from request execution time.
    now = timezone.now() - timedelta(minutes=10)
    for historical_days in (30, 20, 1):
        # Each accepted offence contributes one sample, regardless of its number of observations.
        command = event_request(
            csrf_client,
            fleet,
            account,
            started_at=now - timedelta(days=historical_days),
            reason=custom_type["name"],
        )
        assert (
            csrf_client.post(
                f"/api/fleets/{fleet['id']}/events/", command, format="json"
            ).status_code
            == 201
        )
    # An ordinary reason never inherits a fleet-defined custom escalation history.
    other_type = active_type(csrf_client, fleet, "Team Damage")
    other_preview = csrf_client.post(
        f"/api/fleets/{fleet['id']}/preview/",
        {"account_id": account["id"], "type_id": other_type["id"], "started_at": now.isoformat()},
        format="json",
    )
    assert other_preview.status_code == 200
    assert other_preview.json()["sample_count"] == 0
    # The selected assessment time bounds the independent custom samples.
    definition = custom_type
    response = csrf_client.post(
        f"/api/fleets/{fleet['id']}/preview/",
        {
            "account_id": account["id"],
            "type_id": definition["id"],
            "started_at": (now - timedelta(days=days_ago)).isoformat(),
        },
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["sample_count"] == expected_samples


def test_fleet_starts_without_demo_accounts_and_with_editable_rules(csrf_client, fleet):
    """Only documented ladder defaults are seeded; no fabricated real account evidence is stored."""
    assert fleet["role"] == "owner"
    assert csrf_client.get(f"/api/fleets/{fleet['id']}/accounts/").json() == []
    # New fleets use published ordinary durations and observation-only special mechanisms.
    rules = csrf_client.get(f"/api/fleets/{fleet['id']}/types/").json()
    assert len(rules) == 5
    for rule in rules:
        # VACNet and grief-report notices lack a verified exact duration ladder.
        mechanism = rule["policy"]["mechanism"]
        if rule["name"] in {"VACLive", "GriefReports"}:
            assert mechanism == {"VACLive": "vacnet", "GriefReports": "griefing"}[rule["name"]]
            assert rule["policy"]["steps"] == []
        else:
            assert mechanism == "ordinary" and rule["policy"]["steps"] == [30, 120, 1440, 10080]


def test_exact_steam_id_and_casefolded_rule_identity(csrf_client, fleet, account):
    """Mutable labels cannot replace stable scoped identities or corrupt long SteamID digits."""
    assert account["steam_id"] == "76561198039452203"
    # A numeric body could have lost digits in a JavaScript client before reaching this server.
    assert (
        csrf_client.post(
            f"/api/fleets/{fleet['id']}/accounts/",
            {"steam_id": 76561198039452204, "tag": "Numeric identity"},
            format="json",
        ).status_code
        == 400
    )
    # A case-only duplicate would make the offence selector ambiguous.
    response = csrf_client.post(
        f"/api/fleets/{fleet['id']}/types/",
        {"name": "abANDONING", "code": "ABD", "steps": [30]},
        format="json",
    )
    assert response.status_code == 400


def test_memberships_enforce_viewer_editor_and_nonmember_access(
    csrf_client, fleet, django_user_model
):
    """Role checks apply to direct requests, including callers who know valid object IDs."""
    # The second operator has a real Django identity and no implicit fleet access.
    colleague = django_user_model.objects.create_user(
        username="colleague", password="test-password"
    )
    # A separate client uses its own cookie and CSRF token pair.
    colleague_client = APIClient(enforce_csrf_checks=True)
    colleague_client.force_login(colleague)
    colleague_client.credentials(
        HTTP_X_CSRFTOKEN=colleague_client.get("/api/csrf/").json()["csrfToken"]
    )
    assert colleague_client.get(f"/api/fleets/{fleet['id']}/accounts/").status_code == 404
    # An owner grants viewer access without sharing an owner's session.
    response = csrf_client.post(
        f"/api/fleets/{fleet['id']}/members/",
        {"username": colleague.username, "role": "viewer"},
        format="json",
    )
    assert response.status_code == 201
    assert colleague_client.get(f"/api/fleets/{fleet['id']}/accounts/").status_code == 200
    assert (
        colleague_client.post(
            f"/api/fleets/{fleet['id']}/accounts/",
            {"steam_id": "76561198039452204", "tag": "Beta"},
            format="json",
        ).status_code
        == 403
    )
    # An editor can manage evidence but cannot manage membership itself.
    member_id = response.json()["id"]
    assert (
        csrf_client.patch(
            f"/api/fleets/{fleet['id']}/members/{member_id}/", {"role": "editor"}, format="json"
        ).status_code
        == 200
    )
    assert (
        colleague_client.post(
            f"/api/fleets/{fleet['id']}/accounts/",
            {"steam_id": "76561198039452204", "tag": "Beta"},
            format="json",
        ).status_code
        == 201
    )
    assert (
        colleague_client.post(
            f"/api/fleets/{fleet['id']}/members/",
            {"username": colleague.username, "role": "owner"},
            format="json",
        ).status_code
        == 403
    )


def test_last_owner_cannot_be_removed_or_demoted(csrf_client, fleet):
    """A fleet must retain a principal able to repair its membership configuration."""
    # The creator's owner membership is the fleet's only initial administrative membership.
    membership = csrf_client.get(f"/api/fleets/{fleet['id']}/members/").json()[0]
    assert (
        csrf_client.patch(
            f"/api/fleets/{fleet['id']}/members/{membership['id']}/",
            {"role": "viewer"},
            format="json",
        ).status_code
        == 400
    )
    assert (
        csrf_client.delete(f"/api/fleets/{fleet['id']}/members/{membership['id']}/").status_code
        == 400
    )


def test_record_retry_and_repeated_observation_do_not_create_another_offence(
    csrf_client, fleet, account
):
    """An HTTP retry and new evidence of one restriction are separate non-escalating cases."""
    # The same report identity must produce the same accepted event after a network retry.
    report = event_request(csrf_client, fleet, account)
    endpoint = f"/api/fleets/{fleet['id']}/events/"
    first = csrf_client.post(endpoint, report, format="json")
    assert first.status_code == 201, first.data
    assert csrf_client.post(endpoint, report, format="json").status_code == 200
    # Further observed evidence gets its own retry identity but belongs to the existing event.
    observed_at = timezone.now() - timedelta(minutes=2)
    observation = {
        "id": str(uuid4()),
        "observed_at": observed_at.isoformat(),
        "remaining_minutes": 15,
    }
    observation_endpoint = f"{endpoint}{first.json()['id']}/observations/"
    assert csrf_client.post(observation_endpoint, observation, format="json").status_code == 201
    assert csrf_client.post(observation_endpoint, observation, format="json").status_code == 200
    # Account history distinguishes one offence with two observations from two penalties.
    detail = csrf_client.get(f"/api/fleets/{fleet['id']}/accounts/{account['id']}/").json()
    assert detail["event_count"] == 1
    assert len(detail["events"][0]["observations"]) == 2
    assert detail["events"][0]["assigned_step"] == 1


def test_changed_retry_payload_and_stale_preview_conflict(csrf_client, fleet, account):
    """A stale or ambiguous write needs operator review rather than silent mutation."""
    # Two drafts were previewed against the same history revision.
    first_report = event_request(csrf_client, fleet, account)
    second_report = event_request(csrf_client, fleet, account)
    endpoint = f"/api/fleets/{fleet['id']}/events/"
    assert csrf_client.post(endpoint, first_report, format="json").status_code == 201
    assert csrf_client.post(endpoint, second_report, format="json").status_code == 409
    # Reusing an accepted retry identity for different evidence is also an explicit conflict.
    first_report["remaining_minutes"] = 19
    assert csrf_client.post(endpoint, first_report, format="json").status_code == 409


@pytest.mark.parametrize("remaining", [0, -1, 0.5, "NaN", 31])
def test_invalid_remaining_values_do_not_create_evidence(
    csrf_client, fleet, account, custom_type, remaining
):
    """Reject clamped, rounded or over-total evidence before recording."""
    # A fleet-defined policy can still bound evidence by its configured first step.
    report = event_request(csrf_client, fleet, account, reason=custom_type["name"])
    report["remaining_minutes"] = remaining
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", report, format="json").status_code
        == 400
    )


def test_manual_override_and_policy_edit_preserve_original_assessment(csrf_client, fleet, account):
    """A new ladder revision cannot rewrite a recorded total, expiry or manual reason."""
    # The original event pins the third step of its original policy.
    report = event_request(csrf_client, fleet, account, forced_step=3)
    original = csrf_client.post(f"/api/fleets/{fleet['id']}/events/", report, format="json")
    assert original.status_code == 201, original.data
    # Publishing a new duration creates a new immutable policy version.
    offence_type = active_type(csrf_client, fleet)
    updated = csrf_client.patch(
        f"/api/fleets/{fleet['id']}/types/{offence_type['id']}/",
        {
            "expected_policy_id": offence_type["policy"]["id"],
            "name": "Leaving early",
            "code": "LEFT",
            "note": "Updated rule",
            "steps": [60, 180, 2880],
            "clean_window_days": 7,
            "decay_mode": "step_down",
        },
        format="json",
    )
    assert updated.status_code == 200, updated.data
    assert updated.json()["policy"]["id"] != offence_type["policy"]["id"]
    # A renamed type still identifies the old event through a stable foreign key.
    detail = csrf_client.get(f"/api/fleets/{fleet['id']}/accounts/{account['id']}/").json()
    assert detail["events"][0]["total_minutes"] == 1440
    assert detail["events"][0]["override_reason"] == "Observed step in game"
    assert detail["events"][0]["type_name"] == "Leaving early"


def test_archiving_type_preserves_history_and_blocks_new_reports(csrf_client, fleet, account):
    """Archive is a catalogue change, not deletion of an operator's evidence."""
    # First create real evidence so archival preservation is observable.
    report = event_request(csrf_client, fleet, account)
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", report, format="json").status_code
        == 201
    )
    # Archived types remain in history but are no longer valid report choices.
    offence_type = active_type(csrf_client, fleet)
    assert (
        csrf_client.post(
            f"/api/fleets/{fleet['id']}/types/{offence_type['id']}/archive/",
            {"expected_policy_id": offence_type["policy"]["id"]},
            format="json",
        ).status_code
        == 200
    )
    assert (
        csrf_client.get(f"/api/fleets/{fleet['id']}/accounts/{account['id']}/").json()[
            "event_count"
        ]
        == 1
    )
    assert (
        csrf_client.post(
            f"/api/fleets/{fleet['id']}/preview/",
            {
                "account_id": account["id"],
                "type_id": offence_type["id"],
                "started_at": timezone.now().isoformat(),
            },
            format="json",
        ).status_code
        == 400
    )


def test_cross_fleet_relationship_and_missing_csrf_are_rejected(csrf_client, fleet, account, user):
    """Belonging to two fleets must not permit mixing their account and policy relationships."""
    # The same operator owns both fleets but each catalogue remains an independent namespace.
    other_fleet = csrf_client.post("/api/fleets/", {"name": "Other fleet"}, format="json").json()
    other_type = active_type(csrf_client, other_fleet)
    assert (
        csrf_client.post(
            f"/api/fleets/{fleet['id']}/preview/",
            {
                "account_id": account["id"],
                "type_id": other_type["id"],
                "started_at": timezone.now().isoformat(),
            },
            format="json",
        ).status_code
        == 404
    )
    # Session authentication alone cannot bypass Django's mutation CSRF protection.
    unprotected_client = APIClient(enforce_csrf_checks=True)
    unprotected_client.force_login(user)
    assert unprotected_client.post("/api/fleets/", {"name": "No token"}).status_code == 403


@pytest.mark.parametrize("timestamp", ["2026-01-01T12:00:00", "2026-15-01T12:00:00Z", "bad"])
def test_report_timestamps_require_a_valid_explicit_offset(csrf_client, fleet, account, timestamp):
    """An input without a meaningful timezone must never silently inherit server local time."""
    # Parsing is tested before command execution so malformed values cannot create history.
    definition = active_type(csrf_client, fleet)
    response = csrf_client.post(
        f"/api/fleets/{fleet['id']}/preview/",
        {"account_id": account["id"], "type_id": definition["id"], "started_at": timestamp},
        format="json",
    )
    assert response.status_code == 400


def test_future_start_and_prestart_observation_are_rejected(csrf_client, fleet, account):
    """Time bounds distinguish prospective values from already observed facts."""
    # A future event cannot be accepted merely because its predicted expiry is also future.
    definition = active_type(csrf_client, fleet)
    response = csrf_client.post(
        f"/api/fleets/{fleet['id']}/preview/",
        {
            "account_id": account["id"],
            "type_id": definition["id"],
            "started_at": (timezone.now() + timedelta(days=1)).isoformat(),
        },
        format="json",
    )
    assert response.status_code == 400
    # Observing an existing penalty before it began is also invalid evidence.
    report = event_request(csrf_client, fleet, account)
    report["observed_at"] = (timezone.now() - timedelta(days=1)).isoformat()
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", report, format="json").status_code
        == 400
    )


def test_manual_step_requires_reason_and_a_real_ladder_position(csrf_client, fleet, account):
    """Overrides are explicit evidence-backed choices, not unchecked numeric corrections."""
    # A valid overridden draft still needs a reason before authoritative acceptance.
    report = event_request(csrf_client, fleet, account, forced_step=2)
    report["override_reason"] = "   "
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", report, format="json").status_code
        == 400
    )
    # Drag clamping in the UI cannot substitute for the same invariant at the API boundary.
    report["forced_step"] = 999
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/preview/", report, format="json").status_code
        == 400
    )


@pytest.mark.parametrize("steps", [[], [0], [-2], [0.5], [True]])
def test_invalid_ladders_never_publish_a_partial_type(csrf_client, fleet, steps):
    """An invalid rule cannot silently become a one-minute or empty policy."""
    # Using a new name keeps failures attributable to step validation rather than uniqueness.
    response = csrf_client.post(
        f"/api/fleets/{fleet['id']}/types/",
        {"name": "Invalid ladder", "steps": steps},
        format="json",
    )
    assert response.status_code == 400
    assert len(csrf_client.get(f"/api/fleets/{fleet['id']}/types/").json()) == 5


def test_archived_accounts_preserve_detail_and_require_explicit_reopening(
    csrf_client, fleet, account
):
    """Account archival blocks new reports without erasing the account identity."""
    # The account is still addressable by its scoped stable UUID after its archive flag changes.
    endpoint = f"/api/fleets/{fleet['id']}/accounts/{account['id']}/"
    archived = csrf_client.patch(endpoint, {"tag": "Renamed", "archived": True}, format="json")
    assert archived.status_code == 200
    assert archived.json()["archived_at"] is not None
    assert csrf_client.get(endpoint).json()["steam_id"] == "76561198039452203"
    # Preview refuses archived choices even when a stale selector still remembers their UUID.
    definition = active_type(csrf_client, fleet)
    assert (
        csrf_client.post(
            f"/api/fleets/{fleet['id']}/preview/",
            {
                "account_id": account["id"],
                "type_id": definition["id"],
                "started_at": timezone.now().isoformat(),
            },
            format="json",
        ).status_code
        == 400
    )
    assert (
        csrf_client.patch(endpoint, {"archived": False}, format="json").json()["archived_at"]
        is None
    )
    # A later label-only edit does not accidentally archive or unarchive the account.
    assert (
        csrf_client.patch(endpoint, {"tag": "Final tag"}, format="json").json()["tag"]
        == "Final tag"
    )


def test_calendar_counts_distinct_accounts_and_filters_unique_events(csrf_client, fleet, account):
    """Overlapping records do not inflate the number of restricted accounts."""
    # Two separate offences on one account remain two records but only one active account.
    first = event_request(csrf_client, fleet, account)
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", first, format="json").status_code
        == 201
    )
    second = event_request(
        csrf_client, fleet, account, started_at=timezone.now() - timedelta(minutes=3)
    )
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", second, format="json").status_code
        == 201
    )
    # Explicit UTC dates define a half-open range around both active events.
    today = timezone.now().date()
    query = {
        "start": (today - timedelta(days=1)).isoformat(),
        "end": (today + timedelta(days=20)).isoformat(),
        "account_id": account["id"],
        "type_id": first["type_id"],
        "status": "active",
    }
    calendar = csrf_client.get(f"/api/fleets/{fleet['id']}/calendar/", query)
    assert calendar.status_code == 200, calendar.data
    assert calendar.json()["active_count"] == 1
    assert calendar.json()["recorded_count"] == 2
    assert len(calendar.json()["events"]) == 2
    assert len(calendar.json()["forecasts"]) == 2
    assert all(marker["next_step"] >= 1 for marker in calendar.json()["forecasts"])
    # Fleet filtering can match recorded and active offence scopes without detail fanout.
    row = csrf_client.get(f"/api/fleets/{fleet['id']}/accounts/").json()[0]
    assert row["recorded_type_ids"] == [first["type_id"]]
    assert row["active_type_ids"] == [first["type_id"]]
    # The last recorded level remains distinct from the base after future decay windows.
    prediction = next(
        prediction for prediction in row["predictions"] if prediction["type_id"] == first["type_id"]
    )
    assert prediction["sample_count"] == 2
    assert prediction["recorded_step"] == 2
    # A narrower range before the next reduction omits future marks without losing current events.
    query["end"] = (today + timedelta(days=1)).isoformat()
    assert csrf_client.get(f"/api/fleets/{fleet['id']}/calendar/", query).json()["forecasts"] == []
    query["status"] = "clear"
    assert csrf_client.get(f"/api/fleets/{fleet['id']}/calendar/", query).json()["events"] == []


def test_calendar_expired_history_and_bad_ranges_are_explicit(csrf_client, fleet, account):
    """Expired evidence remains accessible and a malformed range is not silently reset."""
    # Historical evidence is deliberately earlier than the active-now boundary.
    report = event_request(
        csrf_client, fleet, account, started_at=timezone.now() - timedelta(days=2)
    )
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", report, format="json").status_code
        == 201
    )
    # The default range includes recent history while still naming a real current server clock.
    endpoint = f"/api/fleets/{fleet['id']}/calendar/"
    response = csrf_client.get(endpoint, {"status": "clear"})
    assert response.status_code == 200
    assert len(response.json()["events"]) == 1
    assert response.json()["active_count"] == 0
    # Expired evidence remains filterable even when it no longer restricts availability.
    row = csrf_client.get(f"/api/fleets/{fleet['id']}/accounts/").json()[0]
    assert row["recorded_type_ids"] == [report["type_id"]]
    assert row["active_type_ids"] == []
    assert (
        csrf_client.get(endpoint, {"start": "2026-01-01", "end": "2026-01-01"}).status_code == 400
    )
    assert csrf_client.get(endpoint, {"account_id": str(uuid4())}).status_code == 404
    assert csrf_client.get(endpoint, {"type_id": str(uuid4())}).status_code == 404


def test_policy_only_patch_preserves_operator_metadata(csrf_client, fleet):
    """Operators can adopt game rules without resending labels from the last catalogue read."""
    # Custom metadata deliberately differs from what the service would derive for a blank label.
    endpoint = f"/api/fleets/{fleet['id']}/types/"
    custom = csrf_client.post(
        endpoint,
        {
            "name": "Vote removal",
            "code": "KICK",
            "note": "Issued after repeated votes",
            "steps": [25],
        },
        format="json",
    ).json()
    # The new revision keeps the historical type identity, name, short code and description.
    response = csrf_client.patch(
        f"{endpoint}{custom['id']}/",
        {"expected_policy_id": custom["policy"]["id"], "mechanism": "ordinary"},
        format="json",
    )
    assert response.status_code == 200, response.data
    adopted = response.json()
    assert adopted["policy"]["mechanism"] == "ordinary"
    assert all(adopted[field] == custom[field] for field in ("id", "name", "code", "note"))


def test_metadata_only_edit_reuses_policy_and_stale_type_changes_conflict(csrf_client, fleet):
    """Labels can change without publishing duplicate policies or overriding another editor."""
    # The full editor payload deliberately leaves all policy inputs identical.
    definition = active_type(csrf_client, fleet)
    endpoint = f"/api/fleets/{fleet['id']}/types/{definition['id']}/"
    payload = {
        "expected_policy_id": definition["policy"]["id"],
        "name": "Abandoning",
        "code": "ABD",
        "note": "Clearer trigger note",
        "steps": definition["policy"]["steps"],
        "clean_window_days": definition["policy"]["clean_window_days"],
        "decay_mode": definition["policy"]["decay_mode"],
    }
    assert (
        csrf_client.patch(endpoint, payload, format="json").json()["policy"]["id"]
        == definition["policy"]["id"]
    )
    # A changed duration publishes a new version; the original token is then stale.
    payload["steps"] = [60, 120]
    assert csrf_client.patch(endpoint, payload, format="json").status_code == 200
    assert csrf_client.patch(endpoint, payload, format="json").status_code == 409
    assert (
        csrf_client.post(
            f"{endpoint}archive/", {"expected_policy_id": definition["policy"]["id"]}, format="json"
        ).status_code
        == 409
    )


def test_audit_records_scope_and_actor_without_request_credentials(
    csrf_client, fleet, account, user
):
    """The read-only audit feed proves attribution without echoing raw requests or secrets."""
    # The account creation has already appended one service-selected domain audit fact.
    response = csrf_client.get(f"/api/fleets/{fleet['id']}/audit/")
    assert response.status_code == 200
    assert response.json()[0]["actor"] == user.username
    assert response.json()[0]["action"] == "account.created"
    assert response.json()[0]["details"] == {"steam_id": account["steam_id"]}
    assert response["Cache-Control"].startswith("max-age=0")


def test_fleet_list_and_owner_membership_removal_keep_permissions_scoped(
    csrf_client, fleet, django_user_model
):
    """Owner succession is explicit and listing does not invent implicit fleet access."""
    # A second real principal can retain ownership when the original owner leaves.
    colleague = django_user_model.objects.create_user(username="successor", password="test-only")
    added = csrf_client.post(
        f"/api/fleets/{fleet['id']}/members/",
        {"username": colleague.username, "role": "owner"},
        format="json",
    )
    assert added.status_code == 201
    assert csrf_client.get("/api/fleets/").json()[0]["role"] == "owner"
    # Removing the original membership is allowed only because another owner is retained.
    own_membership = next(
        member
        for member in csrf_client.get(f"/api/fleets/{fleet['id']}/members/").json()
        if member["username"] != colleague.username
    )
    assert (
        csrf_client.delete(f"/api/fleets/{fleet['id']}/members/{own_membership['id']}/").status_code
        == 204
    )
    assert csrf_client.get("/api/fleets/").json() == []
    assert csrf_client.get(f"/api/fleets/{fleet['id']}/accounts/").status_code == 404


def test_type_creation_normalization_and_archived_edit_rejection(csrf_client, fleet):
    """A blank short code gets a bounded derived label; archived versions cannot be edited."""
    # The new type exercises explicit rule creation rather than only seeded definitions.
    attributes = {"name": "  Custom rule  ", "code": "", "steps": [30, 90]}
    created = csrf_client.post(f"/api/fleets/{fleet['id']}/types/", attributes, format="json")
    assert created.status_code == 201
    assert created.json()["name"] == "Custom rule"
    assert created.json()["code"] == "CUS"
    # The same stable policy is archived twice without duplicating evidence or failing retries.
    definition = created.json()
    endpoint = f"/api/fleets/{fleet['id']}/types/{definition['id']}/"
    archive_body = {"expected_policy_id": definition["policy"]["id"]}
    assert csrf_client.post(f"{endpoint}archive/", archive_body, format="json").status_code == 200
    assert csrf_client.post(f"{endpoint}archive/", archive_body, format="json").status_code == 200
    assert (
        csrf_client.patch(endpoint, {**attributes, **archive_body}, format="json").status_code
        == 400
    )


def test_unrepresentable_policy_and_expanded_short_code_are_validation_errors(csrf_client, fleet):
    """Storage and display boundaries reject impossible values before a rule can be published."""
    # Positive integers alone do not guarantee that a forecast can fit a supported datetime.
    assert (
        csrf_client.post(
            f"/api/fleets/{fleet['id']}/types/",
            {"name": "Impossible dates", "steps": [2147483647], "clean_window_days": 2147483647},
            format="json",
        ).status_code
        == 400
    )
    # Unicode uppercase expansion must not silently produce an overlong saved display code.
    assert (
        csrf_client.post(
            f"/api/fleets/{fleet['id']}/types/",
            {"name": "Expanded code", "code": "ßßßß", "steps": [30]},
            format="json",
        ).status_code
        == 400
    )


def test_archived_account_omits_future_forecasts_but_keeps_calendar_history(
    csrf_client, fleet, account
):
    """Archival hides future report choices without deleting earlier recorded restrictions."""
    # An actual first event gives the account both a restriction and a later decay forecast.
    report = event_request(csrf_client, fleet, account)
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", report, format="json").status_code
        == 201
    )
    assert (
        csrf_client.patch(
            f"/api/fleets/{fleet['id']}/accounts/{account['id']}/",
            {"archived": True},
            format="json",
        ).status_code
        == 200
    )
    # The default range covers the event and its ordinarily expected seven-day step-down.
    calendar = csrf_client.get(f"/api/fleets/{fleet['id']}/calendar/").json()
    assert len(calendar["events"]) == 1
    assert calendar["forecasts"] == []
    assert calendar["active_count"] == 0


def test_reusing_an_observation_id_for_a_new_event_conflicts(csrf_client, fleet, account):
    """An observation retry key belongs to one accepted fact and cannot be reassigned."""
    # Initial evidence commits both identities and increments the account history revision.
    first = event_request(csrf_client, fleet, account)
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", first, format="json").status_code
        == 201
    )
    # A fresh preview leaves only the deliberately reused observation identity invalid.
    second = event_request(csrf_client, fleet, account)
    second["observation_id"] = first["observation_id"]
    assert (
        csrf_client.post(f"/api/fleets/{fleet['id']}/events/", second, format="json").status_code
        == 409
    )
    assert (
        csrf_client.get(f"/api/fleets/{fleet['id']}/accounts/{account['id']}/").json()[
            "event_count"
        ]
        == 1
    )


def test_vacnet_long_timer_and_party_reason_round_trip_through_fleet_views(
    csrf_client, fleet, account
):
    """A long observed timer drives availability even when the original duration is unknown."""
    # A 90-day observation and explicit party notice must survive every API projection.
    command = event_request(csrf_client, fleet, account, reason="VACLive")
    command.update(remaining_minutes=90 * 1440, vac_attribution="party")
    events_url = f"/api/fleets/{fleet['id']}/events/"
    recorded = csrf_client.post(events_url, command, format="json")
    assert recorded.status_code == 201, recorded.data
    event = recorded.json()
    assert event["vac_attribution"] == "party" and event["mechanism"] == "vacnet"
    assert event["assigned_step"] is event["total_minutes"] is event["predicted_expires_at"] is None
    assert event["expires_at"] == event["observed_expires_at"]
    # A changed attribution is different evidence even when the retry identities are unchanged.
    assert (
        csrf_client.post(
            events_url, {**command, "vac_attribution": "self"}, format="json"
        ).status_code
        == 409
    )
    detail = csrf_client.get(f"/api/fleets/{fleet['id']}/accounts/{account['id']}/").json()
    assert detail["active_until"] == event["observed_expires_at"] and detail["status"] == "active"
    prediction = next(row for row in detail["predictions"] if row["type_name"] == "VACLive")
    assert prediction["step"] is prediction["total_minutes"] is prediction["next_decay_at"] is None
    assert detail["events"][0]["observations"][0]["remaining_minutes"] == 90 * 1440
    # The calendar must include a special restriction beyond the old 30-day fleet maximum.
    visible = timezone.now().date() + timedelta(days=60)
    calendar = csrf_client.get(
        f"/api/fleets/{fleet['id']}/calendar/",
        {
            "start": visible.isoformat(),
            "end": (visible + timedelta(days=1)).isoformat(),
        },
    ).json()
    assert [row["id"] for row in calendar["events"]] == [event["id"]]
    assert calendar["forecasts"] == []


def test_shared_unbounded_ordinary_state_survives_mixed_reason_writes(csrf_client, fleet, account):
    """Five successive ordinary restrictions share one progression and retain the fifth level."""
    # Space starts by one hour after every timer expiry so the clean-week rule never decays.
    start = timezone.now() - timedelta(days=40)
    expected_minutes = [30, 120, 1440, 10080, 10080]
    reasons = ["Abandoning", "Kicking", "Team Damage", "Abandoning", "Kicking"]
    for index, (reason, duration) in enumerate(zip(reasons, expected_minutes, strict=True), 1):
        # Snapshot and timer agree at each event; only the reason changes across ordinary writes.
        command = event_request(csrf_client, fleet, account, reason=reason, started_at=start)
        command["remaining_minutes"] = duration - 1
        response = csrf_client.post(f"/api/fleets/{fleet['id']}/events/", command, format="json")
        assert response.status_code == 201, response.data
        assert (
            response.json()["assigned_step"] == index
            and response.json()["total_minutes"] == duration
        )
        start += timedelta(minutes=duration, hours=1)
    # Two full clean weeks leave level three before the next offence advances it to level four.
    preview = csrf_client.post(
        f"/api/fleets/{fleet['id']}/preview/",
        {
            "type_id": active_type(csrf_client, fleet, "Team Damage")["id"],
            "account_id": account["id"],
            "started_at": (start + timedelta(weeks=2) - timedelta(hours=1)).isoformat(),
        },
        format="json",
    ).json()
    assert preview["sample_count"] == 5 and preview["base_step"] == 3
    assert preview["step"] == 4 and preview["total_minutes"] == 10080
