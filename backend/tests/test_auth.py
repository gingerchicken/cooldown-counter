"""Session authentication must protect application data and preserve browser security."""

import pytest
from rest_framework.test import APIClient

from jobs.models import Job

# Every authentication scenario owns isolated database users, sessions, and application rows.
pytestmark = pytest.mark.django_db


def test_anonymous_session_has_no_user_and_is_never_cached(api_client):
    """A fresh browser can discover its signed-out state without logging in."""
    # response distinguishes a valid anonymous session from a failed authentication service.
    response = api_client.get("/api/auth/session/")
    assert response.status_code == 200
    assert response.json() == {"user": None}
    assert "no-store" in response["Cache-Control"]


@pytest.mark.parametrize("path", ["/api/jobs/", "/api/jobs/99999/"])
def test_anonymous_browser_cannot_read_jobs(api_client, path):
    """Backend permissions must enforce the login boundary independently of React."""
    # response denies both collection and detail reads without revealing record existence.
    response = api_client.get(path)
    assert response.status_code == 403


def test_valid_login_rotates_session_and_csrf_and_exposes_only_public_user(
    anonymous_csrf_client, user
):
    """Django login must prevent fixation and return only the frontend's identity fields."""
    # previous_session_key and previous_csrf_cookie capture anonymous credentials to invalidate.
    previous_session_key = anonymous_csrf_client.cookies["sessionid"].value
    previous_csrf_cookie = anonymous_csrf_client.cookies["csrftoken"].value
    # response authenticates a real password through Django's configured backends.
    response = anonymous_csrf_client.post(
        "/api/auth/login/",
        {"username": user.username, "password": "test-password"},
        format="json",
    )
    assert response.status_code == 200
    assert response.json() == {"user": {"id": user.pk, "username": user.username}}
    assert anonymous_csrf_client.cookies["sessionid"].value != previous_session_key
    assert anonymous_csrf_client.cookies["csrftoken"].value != previous_csrf_cookie
    assert "no-store" in response["Cache-Control"]
    assert anonymous_csrf_client.get("/api/auth/session/").json() == response.json()
    assert "password" not in response.content.decode()
    # old_browser replays the pre-login cookie and must not inherit the authenticated account.
    old_browser = APIClient(enforce_csrf_checks=True)
    old_browser.cookies["sessionid"] = previous_session_key
    assert old_browser.get("/api/auth/session/").json() == {"user": None}


@pytest.mark.parametrize("username", ["template-user", "unknown-user"])
def test_invalid_login_returns_generic_error(anonymous_csrf_client, user, username):
    """Unknown users and wrong passwords must share the same safe failure contract."""
    # response must not reveal whether the supplied username belongs to a real account.
    response = anonymous_csrf_client.post(
        "/api/auth/login/", {"username": username, "password": "incorrect"}, format="json"
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid username or password."}
    assert anonymous_csrf_client.get("/api/auth/session/").json() == {"user": None}


def test_inactive_account_cannot_log_in(anonymous_csrf_client, user):
    """Disabled users must fail through Django's normal authentication backend."""
    # user is deliberately disabled while retaining an otherwise valid password.
    user.is_active = False
    user.save(update_fields=["is_active"])
    # response must match the wrong-password response rather than expose account state.
    response = anonymous_csrf_client.post(
        "/api/auth/login/",
        {"username": user.username, "password": "test-password"},
        format="json",
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid username or password."}


def test_login_preserves_password_whitespace(anonymous_csrf_client, user):
    """Credential validation must not change characters belonging to a real password."""
    # user keeps significant surrounding spaces that must reach Django unchanged.
    user.set_password(" password with spaces ")
    user.save(update_fields=["password"])
    # response succeeds only if the API serializer has not trimmed the submitted password.
    response = anonymous_csrf_client.post(
        "/api/auth/login/",
        {"username": user.username, "password": " password with spaces "},
        format="json",
    )
    assert response.status_code == 200


def test_disabling_an_account_revokes_existing_session_access(csrf_client, user):
    """An existing cookie must not bypass Django's inactive-account rule."""
    # user retains its password and browser cookie while its administrator disables access.
    user.is_active = False
    user.save(update_fields=["is_active"])
    assert csrf_client.get("/api/auth/session/").json() == {"user": None}
    assert csrf_client.get("/api/jobs/").status_code == 403


@pytest.mark.parametrize("path", ["/api/auth/login/", "/api/auth/logout/"])
def test_authentication_writes_require_csrf_even_when_anonymous(api_client, path):
    """DRF's anonymous CSRF exemption must not apply to either authentication action."""
    # Cookies alone cannot prove this action came from the legitimate application origin.
    api_client.get("/api/csrf/")
    # response must be rejected before credential validation or session mutation.
    response = api_client.post(path, {"username": "test", "password": "test"}, format="json")
    assert response.status_code == 403


def test_login_rejects_forged_origin_with_an_otherwise_valid_token(anonymous_csrf_client, user):
    """A valid CSRF header must not permit a cross-origin login request."""
    # response represents a forged browser origin that replays a valid masked token.
    response = anonymous_csrf_client.post(
        "/api/auth/login/",
        {"username": user.username, "password": "test-password"},
        format="json",
        HTTP_ORIGIN="https://evil.invalid",
    )
    assert response.status_code == 403
    assert anonymous_csrf_client.get("/api/auth/session/").json() == {"user": None}


def test_logout_rejects_missing_token_and_preserves_the_authenticated_session(csrf_client, user):
    """A forged logout must not clear a real user's session."""
    # Removing the fixture's token leaves its real authenticated session cookie intact.
    csrf_client.credentials()
    # response must fail before Django flushes the authenticated session.
    response = csrf_client.post("/api/auth/logout/", {}, format="json")
    assert response.status_code == 403
    assert csrf_client.get("/api/auth/session/").json()["user"]["id"] == user.pk


def test_logout_clears_authentication_and_subsequent_job_access(csrf_client):
    """A successful explicit logout must revoke the browser's protected application access."""
    # response flushes the cookie session and returns the same public anonymous shape.
    response = csrf_client.post("/api/auth/logout/", {}, format="json")
    assert response.status_code == 200
    assert response.json() == {"user": None}
    assert "no-store" in response["Cache-Control"]
    assert csrf_client.get("/api/auth/session/").json() == {"user": None}
    assert csrf_client.get("/api/jobs/").status_code == 403


def test_old_csrf_token_is_rejected_after_login_then_fresh_bootstrap_succeeds(
    anonymous_csrf_client, user, queued_task, django_capture_on_commit_callbacks
):
    """The SDK must discard its cached anonymous token when Django rotates it at login."""
    # Login replaces the CSRF cookie while the test intentionally retains the old request header.
    anonymous_csrf_client.post(
        "/api/auth/login/",
        {"username": user.username, "password": "test-password"},
        format="json",
    )
    assert (
        anonymous_csrf_client.post("/api/jobs/", {"message": "stale"}, format="json").status_code
        == 403
    )
    # csrf_response represents the SDK refreshing its token after authentication succeeds.
    csrf_response = anonymous_csrf_client.get("/api/csrf/")
    anonymous_csrf_client.credentials(HTTP_X_CSRFTOKEN=csrf_response.json()["csrfToken"])
    # Publication must still occur only after the new authenticated job transaction commits.
    with django_capture_on_commit_callbacks(execute=True):
        # response proves that a new token and the rotated session work together.
        response = anonymous_csrf_client.post("/api/jobs/", {"message": "fresh"}, format="json")
    assert response.status_code == 201
    queued_task.assert_called_once_with(response.json()["id"])


def test_jobs_follow_the_user_across_sessions_and_hide_legacy_anonymous_rows(user):
    """Reauthentication must retain account history without claiming legacy anonymous work."""
    # owned_job belongs to this account; legacy_job deliberately has no trustworthy account owner.
    owned_job = Job.objects.create(message="owned", user=user)
    legacy_job = Job.objects.create(message="legacy")
    # new_browser has a different session from the account's previous browser.
    new_browser = APIClient(enforce_csrf_checks=True)
    new_browser.force_login(user)
    assert [job["id"] for job in new_browser.get("/api/jobs/").json()] == [owned_job.pk]
    assert new_browser.get(f"/api/jobs/{legacy_job.pk}/").status_code == 404


def test_jobs_are_isolated_between_authenticated_accounts(user, django_user_model):
    """Knowing another user's job ID must not permit reading that account's work."""
    # owned_job must remain visible only to its authenticated account.
    owned_job = Job.objects.create(message="private", user=user)
    # other_user and other_browser represent a separate authenticated account and cookie jar.
    other_user = django_user_model.objects.create_user(
        username="another-user", password="different"
    )
    other_browser = APIClient(enforce_csrf_checks=True)
    other_browser.force_login(other_user)
    assert other_browser.get("/api/jobs/").json() == []
    assert other_browser.get(f"/api/jobs/{owned_job.pk}/").status_code == 404
