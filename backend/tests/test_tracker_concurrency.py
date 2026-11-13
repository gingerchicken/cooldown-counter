"""Prove write serialization against PostgreSQL rather than simulated SQLite locks."""

from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from threading import Barrier
from uuid import uuid4

import pytest
from django.db import close_old_connections, connection, connections
from django.utils import timezone

from tracker.models import CooldownEvent, Membership, Observation
from tracker.services.access import Conflict
from tracker.services.catalogue import create_account
from tracker.services.fleets import change_member, create_fleet
from tracker.services.reports import preview_report, record_event

# Real transaction commits expose fixtures to independent thread-local connections.
pytestmark = [
    pytest.mark.django_db(transaction=True),
    pytest.mark.skipif(connection.vendor != "postgresql", reason="Requires real row locking"),
]


@pytest.mark.parametrize("same_request", [False, True])
def test_simultaneous_reports_serialize_history_and_retries(user, same_request):
    """US-035/US-053/US-054: stale drafts conflict; identical concurrent retries agree."""
    # One fleet/account gives the competing writes the same authoritative lock boundary.
    fleet = create_fleet(user, "Concurrent evidence")
    account = create_account(fleet, user, {"tag": "Race", "steam_id": "76561198039452203"})
    # The editable default supplies a real published policy for both reviewed drafts.
    definition = fleet.offence_types.get(name="Abandoning")
    # Both reports describe an already-issued cooldown, avoiding clock-dependent future failures.
    started_at = timezone.now() - timedelta(minutes=5)
    preview_input = {"account_id": account.id, "type_id": definition.id, "started_at": started_at}
    # The same revision is deliberately held by both simultaneous attempts.
    preview = preview_report(fleet, preview_input)
    request_body = {
        **preview_input,
        "id": uuid4(),
        "observation_id": uuid4(),
        "policy_id": preview["policy_id"],
        "history_revision": preview["history_revision"],
        "observed_at": started_at + timedelta(minutes=1),
        "remaining_minutes": 20,
    }
    # Different UUIDs represent competing drafts; matching UUIDs represent one retried command.
    competing_body = dict(request_body)
    if not same_request:
        # Each distinct draft must be rejected if its reviewed history becomes stale.
        competing_body.update(id=uuid4(), observation_id=uuid4())
    # Both workers reach the command boundary before either is permitted to acquire its row lock.
    barrier = Barrier(2, timeout=10)

    def submit(attributes):
        """Run one command using a separate database connection and bounded synchronization."""
        # Django connection state cannot be shared across concurrent worker threads.
        close_old_connections()
        try:
            # Synchronization makes a stale-draft race reproducible without arbitrary sleeps.
            barrier.wait()
            try:
                # The command's transaction owns locking and identical-request acknowledgement.
                _event, created = record_event(fleet, user, attributes)
                return "created" if created else "replayed"
            except Conflict:
                # A conflict is the expected safe response for a distinct stale draft.
                return "conflict"
        finally:
            # Release the thread's connection before the test database is torn down.
            connections.close_all()

    with ThreadPoolExecutor(max_workers=2) as executor:
        # Submitting both futures first allows the barrier to release without deadlock.
        futures = [executor.submit(submit, body) for body in (request_body, competing_body)]
        outcomes = sorted(future.result(timeout=20) for future in futures)
    assert outcomes == (["created", "replayed"] if same_request else ["conflict", "created"])
    assert CooldownEvent.objects.filter(account=account).count() == 1
    assert Observation.objects.filter(event__account=account).count() == 1
    account.refresh_from_db()
    assert account.history_revision == 1


def test_simultaneous_owner_demotions_retain_an_owner(user, django_user_model):
    """Fleet administration cannot become ownerless when two owners are demoted together."""
    # Two owners are necessary for a serial check to allow the first demotion only.
    fleet = create_fleet(user, "Concurrent membership")
    colleague = django_user_model.objects.create_user(username="second-owner", password="test-only")
    second_membership = Membership.objects.create(fleet=fleet, user=colleague, role="owner")
    first_membership = fleet.memberships.get(user=user)
    # Both calls enter the shared fleet-lock boundary from independent connections.
    barrier = Barrier(2, timeout=10)

    def demote(member_id):
        """Return the domain outcome while keeping transaction state local to this thread."""
        # Import the expected validation exception without catching unrelated programming errors.
        from rest_framework.exceptions import ValidationError

        close_old_connections()
        try:
            # Start both commands together so only database locking can preserve the invariant.
            barrier.wait()
            try:
                # The parent fleet lock makes the owner count a serialized decision.
                change_member(fleet, user, member_id, role="viewer")
                return "demoted"
            except ValidationError:
                # The second committed view has only one owner and must reject its removal.
                return "retained"
        finally:
            # Connections belong to the worker, not the pytest controlling thread.
            connections.close_all()

    with ThreadPoolExecutor(max_workers=2) as executor:
        # Both future handles must exist before waiting on either worker's barrier.
        futures = [
            executor.submit(demote, member.id) for member in (first_membership, second_membership)
        ]
        outcomes = sorted(future.result(timeout=20) for future in futures)
    assert outcomes == ["demoted", "retained"]
    assert fleet.memberships.filter(role="owner").count() == 1
