"""Exercise opt-in to game rules and immutable custom history through policy services."""

import pytest
from rest_framework.exceptions import ValidationError

from tracker.services.catalogue import create_type, current_policy, policy_spec, update_type
from tracker.services.fleets import create_fleet

# These policies pass through the same database constraints as operator-created revisions.
pytestmark = pytest.mark.django_db


def test_legacy_custom_ladder_can_adopt_ordinary_without_reinterpreting_its_old_policy(user):
    """An explicit opt-in publishes a new revision even when the durations already coincide."""
    # A custom copy of the ordinary durations still describes one independent reason at creation.
    fleet = create_fleet(user, "Adoption")
    reason = create_type(fleet, user, {"name": "AFK", "steps": [30, 120, 1440, 10080]})
    custom = current_policy(reason)
    assert custom.mechanism == "custom"
    # No relabeling or matching on name can opt old assessments into account-wide progression.
    update_type(fleet, user, reason.id, {"expected_policy_id": custom.id, "mechanism": "ordinary"})
    adopted = current_policy(reason)
    custom.refresh_from_db()
    assert policy_spec(custom).mechanism == "custom"
    assert adopted.number == custom.number + 1
    assert policy_spec(adopted).mechanism == "ordinary"
    assert policy_spec(adopted).durations == policy_spec(custom).durations


def test_legacy_numeric_edit_creates_custom_revision_and_explicit_game_edit_validates(user):
    """Existing API clients retain editable ladders without changing the rules of other reasons."""
    # An old editor can send a steps-only PATCH to the seeded ordinary abandon policy.
    fleet = create_fleet(user, "Custom revision")
    reason = fleet.offence_types.get(name="Abandoning")
    original = current_policy(reason)
    # Explicitly choosing the game model must reject durations that conflict with it.
    with pytest.raises(ValidationError, match="four published durations"):
        update_type(
            fleet,
            user,
            reason.id,
            {
                "expected_policy_id": original.id,
                "steps": [45],
                "mechanism": "ordinary",
            },
        )
    assert current_policy(reason).id == original.id
    # Omission of the new mechanism field preserves the legacy rule-edit operation.
    update_type(fleet, user, reason.id, {"expected_policy_id": original.id, "steps": [45]})
    changed = current_policy(reason)
    assert (changed.mechanism, policy_spec(changed).durations) == ("custom", (45,))
    assert policy_spec(original).mechanism == "ordinary"
    assert current_policy(fleet.offence_types.get(name="Kicking")).mechanism == "ordinary"
