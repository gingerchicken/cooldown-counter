"""Shared fixtures keep every API test independent of a running broker."""

from unittest.mock import patch

import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """Return a browser-like client that really enforces Django CSRF checks."""
    # Enforcing middleware checks catches anonymous DRF CSRF exemptions as regressions.
    return APIClient(enforce_csrf_checks=True)


@pytest.fixture
def user(django_user_model):
    """Create a normal account without granting administrative permissions."""
    # The credentials are isolated test data, never a default account in a running application.
    return django_user_model.objects.create_user(username="template-user", password="test-password")


@pytest.fixture
def anonymous_csrf_client(api_client):
    """Bootstrap an anonymous browser for testing the protected login endpoint."""
    # csrf_response contains the masked header token paired with the HttpOnly cookie.
    csrf_response = api_client.get("/api/csrf/")
    api_client.credentials(HTTP_X_CSRFTOKEN=csrf_response.json()["csrfToken"])
    return api_client


@pytest.fixture
def csrf_client(api_client, user):
    """Return an authenticated API client with the same CSRF exchange as the SDK."""
    # Force login only for unrelated domain tests; authentication behavior has dedicated tests.
    api_client.force_login(user)
    # csrf_response refreshes the token after login, matching Django's token rotation contract.
    csrf_response = api_client.get("/api/csrf/")
    api_client.credentials(HTTP_X_CSRFTOKEN=csrf_response.json()["csrfToken"])
    return api_client


@pytest.fixture
def queued_task():
    """Replace only broker publication; task execution is tested separately."""
    # publish_task records broker publication calls without bypassing transaction callbacks.
    with patch("jobs.views.process_job.delay") as publish_task:
        # Keep the mock active for the consuming test and restore the real transport afterward.
        yield publish_task
