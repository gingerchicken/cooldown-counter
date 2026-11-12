"""HTTP contracts include browser security, validation, and authenticated account isolation."""

from unittest.mock import patch

import pytest
from django.db import OperationalError as DatabaseOperationalError
from django.db import connection
from django.test.utils import CaptureQueriesContext
from kombu.exceptions import OperationalError

from jobs.models import Job

# Every API case may create a Django session, so each runs with database isolation.
pytestmark = pytest.mark.django_db


def test_csrf_bootstrap_sets_private_cookie_and_session(api_client):
    """The tokenless api_client must receive both an SDK token and visitor identity."""
    # response carries host-only cookies so the Pages domain owns both browser credentials.
    response = api_client.get("/api/csrf/")
    assert response.status_code == 200
    assert len(response.json()["csrfToken"]) == 64
    assert "csrftoken" in response.cookies
    assert "sessionid" in response.cookies
    assert "private" in response["Cache-Control"]
    assert not response.cookies["csrftoken"]["domain"]


def test_anonymous_write_without_csrf_is_rejected(api_client, queued_task):
    """Reject tokenless api_client writes without invoking the queued_task broker mock."""
    # response must reject a fresh anonymous browser with neither cookies nor a valid header.
    response = api_client.post("/api/jobs/", {"message": "hello"}, format="json")
    assert response.status_code == 403
    assert Job.objects.count() == 0
    queued_task.assert_not_called()


def test_cookie_without_token_is_rejected(api_client, queued_task):
    """A cookie-only api_client must not publish through the queued_task mock."""
    # Deliberately retain cookies but omit the header that the SDK normally supplies.
    api_client.get("/api/csrf/")
    # response tests the missing header independently from the already-established cookies.
    response = api_client.post("/api/jobs/", {"message": "hello"}, format="json")
    assert response.status_code == 403
    queued_task.assert_not_called()


def test_forged_origin_is_rejected(csrf_client, queued_task):
    """The bootstrapped csrf_client must reject a forged origin before queued_task runs."""
    # response represents an untrusted site replaying an otherwise valid token.
    response = csrf_client.post(
        "/api/jobs/", {"message": "hello"}, format="json", HTTP_ORIGIN="https://evil.invalid"
    )
    assert response.status_code == 403
    queued_task.assert_not_called()


def test_create_job_publishes_only_after_commit(
    csrf_client, queued_task, django_capture_on_commit_callbacks
):
    """csrf_client submits work and queued_task observes publication only after commit.

    django_capture_on_commit_callbacks defers and then executes the transaction callbacks.
    """
    # Executing captured callbacks mimics the outer transaction's successful commit.
    with django_capture_on_commit_callbacks(execute=True):
        # response captures the submitted job before the outer test transaction commits.
        response = csrf_client.post("/api/jobs/", {"message": "hello"}, format="json")
        queued_task.assert_not_called()
    assert response.status_code == 201
    assert response.json()["message"] == "hello"
    assert response.json()["status"] == "pending"
    assert response.json()["result"] == ""
    queued_task.assert_called_once_with(response.json()["id"])


@pytest.mark.parametrize("message", ["", "  ", "x" * 201])
def test_invalid_message_never_enqueues(csrf_client, queued_task, message):
    """csrf_client submits invalid message text; queued_task must never receive it."""
    # response must report the parametrized blank or overlong boundary as validation feedback.
    response = csrf_client.post("/api/jobs/", {"message": message}, format="json")
    assert response.status_code == 400
    assert "message" in response.json()
    assert Job.objects.count() == 0
    queued_task.assert_not_called()


def test_users_cannot_list_or_retrieve_another_users_jobs(
    csrf_client, django_user_model, queued_task, django_capture_on_commit_callbacks
):
    """csrf_client owns one account; queued_task avoids real publication.

    django_capture_on_commit_callbacks completes the simulated enqueue after persistence.
    """
    # A separate browser and account must not inherit the owner's authenticated history.
    from rest_framework.test import APIClient

    # other_user owns no jobs; other_client holds only that account's independent cookies.
    other_user = django_user_model.objects.create_user(username="other-api-user")
    other_client = APIClient(enforce_csrf_checks=True)
    other_client.force_login(other_user)
    # Complete the owning visitor's enqueue callback before checking either browser's reads.
    with django_capture_on_commit_callbacks(execute=True):
        # response records the owner's new job ID without sharing its session credentials.
        response = csrf_client.post("/api/jobs/", {"message": "private"}, format="json")
    assert len(csrf_client.get("/api/jobs/").json()) == 1
    assert other_client.get("/api/jobs/").json() == []
    assert other_client.get(f"/api/jobs/{response.json()['id']}/").status_code == 404


def test_broker_failure_records_terminal_failure(
    csrf_client, queued_task, django_capture_on_commit_callbacks
):
    """csrf_client submits work while queued_task simulates an unavailable broker.

    django_capture_on_commit_callbacks runs the failing publish after the row commits.
    """
    # The row is already committed when publication fails, so retain a visible failure.
    queued_task.side_effect = OperationalError("broker unavailable")
    # Simulate the same after-commit boundary that production uses for broker publication.
    with django_capture_on_commit_callbacks(execute=True):
        # response may still contain the original pending snapshot; polling reads durable state.
        response = csrf_client.post("/api/jobs/", {"message": "hello"}, format="json")
    # saved_job is the later API representation of the callback's persisted failure state.
    saved_job = csrf_client.get(f"/api/jobs/{response.json()['id']}/").json()
    assert saved_job["status"] == "failed"
    assert "broker unavailable" not in saved_job["result"]


def test_liveness_does_not_query_database(api_client):
    """The unbootstrapped api_client must obtain liveness without database access."""
    # captured_queries records SQL so dependency-driven restart loops become a test failure.
    with CaptureQueriesContext(connection) as captured_queries:
        # response must prove HTTP process health without creating a session or reading tables.
        response = api_client.get("/api/health/")
    assert response.json() == {"status": "ok"}
    assert len(captured_queries) == 0


def test_readiness_checks_database(api_client):
    """The unbootstrapped api_client confirms readiness through a real database query."""
    # response is the dependency gate used by Docker before starting the frontend.
    response = api_client.get("/api/ready/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_database_outage_removes_readiness_without_leaking_details(api_client):
    """The api_client must receive generic unavailability when the database query fails."""
    # A mocked connection failure leaves the test database usable for fixture cleanup.
    with patch(
        "jobs.views.connection.cursor", side_effect=DatabaseOperationalError("private database URL")
    ):
        # response must expose a routing failure without publishing the private connection detail.
        response = api_client.get("/api/ready/")
    assert response.status_code == 503
    assert response.json() == {"status": "unavailable"}
    assert "private database URL" not in response.content.decode()


def test_heartbeat_is_initially_absent(api_client):
    """The api_client must observe null before the scheduler's first completed task."""
    # A null timestamp is expected until the real Beat and worker path has run.
    assert api_client.get("/api/heartbeat/").json() == {"last_run_at": None}
