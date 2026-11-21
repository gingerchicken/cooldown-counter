"""Keep grouped read projections faithful while fleet history and account counts grow."""

from datetime import UTC, datetime, timedelta
from unittest.mock import patch
from uuid import UUID

import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext

from tracker.models import CooldownEvent, Observation
from tracker.queries import accounts_projection, calendar_projection
from tracker.services.catalogue import create_account, create_type, current_policy, update_type
from tracker.services.fleets import create_fleet

# Real persisted rows exercise relationship loading and query budgets, not a mocked ORM shape.
pytestmark = pytest.mark.django_db


def saved_event(account, policy, actor, *, started_at, step, identity=None):
    """Arrange a valid preserved assessment and observation for projection-only tests."""
    # A policy's real step supplies the immutable original total, even after a later version exists.
    total_minutes = policy.steps.get(position=step).duration_minutes
    # Only explicit UUID fixtures override the ordinary event identity used for tie-order cases.
    attributes = {"id": identity} if identity is not None else {}
    # Saved events carry their original assessment rather than invoking the command under test.
    event = CooldownEvent.objects.create(
        account=account,
        policy=policy,
        started_at=started_at,
        assigned_step=step,
        total_minutes=total_minutes,
        expires_at=started_at + timedelta(minutes=total_minutes),
        transition=f"Saved fixture step {step}.",
        created_by=actor,
        **attributes,
    )
    # Every event has evidence so both query-count measurements include the same relationships.
    Observation.objects.create(
        event=event,
        observed_at=started_at + timedelta(minutes=1),
        remaining_minutes=1,
        created_by=actor,
    )
    return event


@pytest.fixture
def query_workspace(user):
    """Arrange overlapping and equal-start histories across independent account/type ladders."""
    # A fixed aware reference instant makes clean-window and forecast results deterministic.
    now = datetime(2026, 11, 12, 12, tzinfo=UTC)
    # Both account and offence namespaces are deliberately scoped to this fleet.
    fleet = create_fleet(user, "Projection fixture")
    alpha = create_account(fleet, user, {"steam_id": "76561198039452203", "tag": "Alpha"})
    beta = create_account(fleet, user, {"steam_id": "76561198039452204", "tag": "Beta"})
    # The histories deliberately use different duration ladders and preserved policy versions.
    abandoning = fleet.offence_types.get(name="Abandoning")
    # A legacy fleet can still use its own independent griefing estimates across custom revisions.
    grief = create_type(
        fleet, user, {"name": "Legacy grief estimate", "steps": [120, 1440, 10080, 43200]}
    )
    abandoning_policy = current_policy(abandoning)
    grief_policy = current_policy(grief)
    # A later short event must not start clean time before an earlier overlapping long event ends.
    long_event = saved_event(alpha, grief_policy, user, started_at=now - timedelta(days=10), step=4)
    saved_event(alpha, grief_policy, user, started_at=now - timedelta(days=8), step=1)
    # Insert the larger UUID first so insertion order cannot accidentally satisfy the tie rule.
    saved_event(
        alpha,
        abandoning_policy,
        user,
        started_at=now - timedelta(hours=1),
        step=2,
        identity=UUID("00000000-0000-0000-0000-000000000002"),
    )
    saved_event(
        alpha,
        abandoning_policy,
        user,
        started_at=now - timedelta(hours=1),
        step=1,
        identity=UUID("00000000-0000-0000-0000-000000000001"),
    )
    # The other account's old same-type evidence must decay independently from Alpha.
    saved_event(beta, abandoning_policy, user, started_at=now - timedelta(days=30), step=1)
    # A new policy changes future totals while every old assessment remains pinned and readable.
    update_type(
        fleet,
        user,
        grief.id,
        {"expected_policy_id": grief_policy.id, "steps": [60, 240, 480]},
    )
    return {
        "fleet": fleet,
        "alpha": alpha,
        "beta": beta,
        "abandoning": abandoning,
        "grief": grief,
        "abandoning_policy": abandoning_policy,
        "now": now,
        "long_event": long_event,
    }


def test_account_projections_keep_saved_ties_versions_and_ladder_isolation(query_workspace):
    """Shared grouping must preserve externally visible historical and prediction meanings."""
    # The fixed instant is passed through the actual projection clock boundary.
    fixture = query_workspace
    with patch("tracker.queries.timezone.now", return_value=fixture["now"]):
        # Read both aggregate rows and detailed preserved evidence through their public query API.
        rows = accounts_projection(fixture["fleet"])
        detail = accounts_projection(fixture["fleet"], account_id=fixture["alpha"].id)
    # Independent stable IDs avoid relying on incidental display order when checking each ladder.
    rows_by_id = {row["id"]: row for row in rows}
    alpha = rows_by_id[fixture["alpha"].id]
    beta = rows_by_id[fixture["beta"].id]
    # Each account exposes only its own recorded and currently active offence sets.
    assert alpha["event_count"] == 4
    assert beta["event_count"] == 1
    assert set(alpha["active_type_ids"]) == {fixture["abandoning"].id, fixture["grief"].id}
    assert beta["active_type_ids"] == []
    assert beta["recorded_type_ids"] == [fixture["abandoning"].id]
    # Current predictions are indexed by stable type identity, independent of policy revision IDs.
    alpha_predictions = {prediction["type_id"]: prediction for prediction in alpha["predictions"]}
    beta_predictions = {prediction["type_id"]: prediction for prediction in beta["predictions"]}
    assert alpha_predictions[fixture["abandoning"].id]["recorded_step"] == 2
    assert alpha_predictions[fixture["abandoning"].id]["sample_count"] == 2
    assert alpha_predictions[fixture["abandoning"].id]["total_minutes"] == 1440
    assert beta_predictions[fixture["abandoning"].id]["base_step"] == 0
    assert beta_predictions[fixture["abandoning"].id]["total_minutes"] == 30
    assert beta_predictions[fixture["grief"].id]["sample_count"] == 0
    assert beta_predictions[fixture["grief"].id]["recorded_step"] == 0
    # Latest short state and maximum outstanding expiry are distinct overlap facts.
    assert alpha_predictions[fixture["grief"].id]["recorded_step"] == 1
    assert alpha_predictions[fixture["grief"].id]["base_step"] == 1
    assert alpha_predictions[fixture["grief"].id]["total_minutes"] == 240
    # The detail still exposes the old thirty-day total despite the current shorter rule.
    preserved = next(event for event in detail["events"] if event["id"] == fixture["long_event"].id)
    assert preserved["total_minutes"] == 43200
    assert preserved["expires_at"] == fixture["now"] + timedelta(days=20)
    # Equal-time ordering follows UUIDs rather than insertion order or the assigned penalty size.
    tied = [event for event in detail["events"] if event["type_id"] == fixture["abandoning"].id]
    assert [event["assigned_step"] for event in tied] == [1, 2]


def test_calendar_grouping_keeps_forecasts_scoped_and_saved_expiry_anchored(query_workspace, user):
    """A shared history index must never mix tenants, accounts, types or old/current policies."""
    # A separate fleet with a same-named rule must not contribute evidence or forecast markers.
    fixture = query_workspace
    foreign_fleet = create_fleet(user, "Other projection fleet")
    foreign_account = create_account(
        foreign_fleet, user, {"steam_id": fixture["alpha"].steam_id, "tag": "Alpha"}
    )
    foreign_policy = current_policy(foreign_fleet.offence_types.get(name="Abandoning"))
    saved_event(
        foreign_account,
        foreign_policy,
        user,
        started_at=fixture["now"] - timedelta(hours=1),
        step=4,
    )
    # The range includes the retained long restriction and its eventual clean-window forecast.
    filters = {
        "start": (fixture["now"] - timedelta(days=31)).date(),
        "end": (fixture["now"] + timedelta(days=40)).date(),
        "status": "all",
    }
    with patch("tracker.queries.timezone.now", return_value=fixture["now"]):
        # The public projection handles all eligible account/type pairs from one tenant.
        calendar = calendar_projection(fixture["fleet"], filters)
    assert calendar["account_count"] == 2
    assert calendar["active_count"] == 1
    assert calendar["recorded_count"] == 5
    assert len(calendar["events"]) == 5
    assert all(event["account_id"] != foreign_account.id for event in calendar["events"])
    # Three ordinary reasons share one set of markers for each account, including filtered views.
    ordinary = [
        point for point in calendar["forecasts"] if point["type_name"] == "Ordinary competitive"
    ]
    assert ordinary
    assert len({(point["account_id"], point["at"]) for point in ordinary}) == len(ordinary)
    kicking = fixture["fleet"].offence_types.get(name="Kicking")
    with patch("tracker.queries.timezone.now", return_value=fixture["now"]):
        filtered = calendar_projection(fixture["fleet"], {**filters, "type_id": kicking.id})
    assert {point["at"] for point in filtered["forecasts"]} == {point["at"] for point in ordinary}
    assert not filtered["events"]
    # A retained stored level one reaches zero seven days after the longest outstanding expiry.
    grief_markers = [
        marker for marker in calendar["forecasts"] if marker["type_id"] == fixture["grief"].id
    ]
    assert len(grief_markers) == 1
    assert grief_markers[0]["account_id"] == fixture["alpha"].id
    assert grief_markers[0]["at"] == fixture["now"] + timedelta(days=27)
    assert grief_markers[0]["stored_step"] == 0
    assert grief_markers[0]["next_step"] == 1
    assert grief_markers[0]["total_minutes"] == 60


def test_projection_query_counts_do_not_grow_per_added_account_or_history(query_workspace, user):
    """Bulk projections must retain a constant database-query budget as their row count grows."""
    # Both initial captures contain real observations so each scale exercises identical relations.
    fixture = query_workspace
    filters = {
        "start": (fixture["now"] - timedelta(days=31)).date(),
        "end": (fixture["now"] + timedelta(days=40)).date(),
        "status": "all",
    }
    with patch("tracker.queries.timezone.now", return_value=fixture["now"]):
        # Materialized projections make these measurements include all child and actor loading.
        with CaptureQueriesContext(connection) as baseline_accounts:
            baseline_rows = accounts_projection(fixture["fleet"])
        with CaptureQueriesContext(connection) as baseline_calendar:
            baseline_events = calendar_projection(fixture["fleet"], filters)
    for index in range(6):
        # Additional accounts and offences vary result size without changing required associations.
        account = create_account(
            fixture["fleet"], user, {"steam_id": f"765611981{index:08}", "tag": f"Extra {index}"}
        )
        for days_ago in (1, 2):
            # Both same-ladder records must be loaded by bulk prefetch, not a per-event fallback.
            saved_event(
                account,
                fixture["abandoning_policy"],
                user,
                started_at=fixture["now"] - timedelta(days=days_ago),
                step=1,
            )
    with patch("tracker.queries.timezone.now", return_value=fixture["now"]):
        # Repeating the same public reads after growth checks query behavior, not private helpers.
        with CaptureQueriesContext(connection) as expanded_accounts:
            expanded_rows = accounts_projection(fixture["fleet"])
        with CaptureQueriesContext(connection) as expanded_calendar:
            expanded_events = calendar_projection(fixture["fleet"], filters)
    assert len(expanded_rows) == len(baseline_rows) + 6
    assert len(expanded_events["events"]) == len(baseline_events["events"]) + 12
    assert len(expanded_accounts) == len(baseline_accounts)
    assert len(expanded_calendar) == len(baseline_calendar)
