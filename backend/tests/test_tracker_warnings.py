"""Verify the warning-only path through normal fleet HTTP permissions and account projections."""

from datetime import timedelta
from uuid import uuid4

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from tracker.services.catalogue import create_account, current_policy
from tracker.services.fleets import add_member, create_fleet


@pytest.mark.django_db
def test_grief_warning_is_retryable_without_restricting_account(user, django_user_model):
    """A warning appears in account detail while every restriction counter stays unchanged."""
    # A real fleet supplies the warning's account, rule and effective write permission.
    fleet = create_fleet(user, "Warning fixture")
    account = create_account(fleet, user, {"steam_id": "76561198039452203", "tag": "Alpha"})
    grief = fleet.offence_types.get(name="GriefReports")
    client = APIClient()
    client.force_login(user)
    # One id describes one notice even when the client retries the same submission.
    url = f"/api/fleets/{fleet.id}/warnings/"
    body = {
        "id": str(uuid4()),
        "account_id": str(account.id),
        "type_id": str(grief.id),
        "policy_id": str(current_policy(grief).id),
        "observed_at": timezone.now().isoformat(),
    }
    assert client.post(url, body, format="json").status_code == 201
    assert client.post(url, body, format="json").status_code == 200
    # Warning evidence is readable but cannot create a timer or advance a prediction.
    detail = client.get(f"/api/fleets/{fleet.id}/accounts/{account.id}/").json()
    assert [warning["id"] for warning in detail["warnings"]] == [body["id"]]
    assert detail["active_until"] is None
    assert detail["event_count"] == detail["history_revision"] == 0
    assert all(prediction["sample_count"] == 0 for prediction in detail["predictions"])
    # A reused id with changed evidence and a future sighting cannot silently alter the notice.
    future = {**body, "observed_at": (timezone.now() + timedelta(days=1)).isoformat()}
    assert client.post(url, future, format="json").status_code == 409
    assert client.post(url, {**future, "id": str(uuid4())}, format="json").status_code == 400
    # The server rejects other reasons and stale or foreign rule identities.
    other = fleet.offence_types.get(name="Abandoning")
    invalid = {**body, "id": str(uuid4()), "type_id": str(other.id)}
    assert client.post(url, invalid, format="json").status_code == 409
    assert (
        client.post(
            url, {**invalid, "policy_id": str(current_policy(other).id)}, format="json"
        ).status_code
        == 400
    )
    # A separate principal needs editor rights even when the fleet, policy and account are known.
    viewer = django_user_model.objects.create_user(username="warning-viewer")
    client.force_login(viewer)
    assert client.post(url, body, format="json").status_code == 404
    add_member(fleet, user, viewer.username, "viewer")
    assert client.post(url, body, format="json").status_code == 403
