"""Create fleet ownership and apply role changes without orphaning tenant administration."""

from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

from tracker.models import Fleet, Membership

from .access import audit, lock_fleet, save_validated
from .catalogue import seed_types


@transaction.atomic
def create_fleet(actor, name):
    """Create an independent workspace, its owner membership and editable default rules."""
    # A fleet is never externally visible without the creator's owner membership.
    fleet = save_validated(Fleet(name=name))
    save_validated(Membership(fleet=fleet, user=actor, role=Membership.Role.OWNER))
    seed_types(fleet, actor)
    audit(fleet, actor, "fleet.created", fleet.id, {"name": name})
    return fleet


@transaction.atomic
def add_member(fleet, actor, username, role):
    """Grant an already provisioned active Django operator access to one fleet."""
    # Parent locking serializes grants with owner removal and last-owner validation.
    lock_fleet(fleet)
    # Owner-only provisioning lookup never creates public signup or invents a user password.
    user = get_object_or_404(get_user_model(), username=username, is_active=True)
    # Model validation gives a duplicate membership an explicit field error.
    membership = save_validated(Membership(fleet=fleet, user=user, role=role))
    audit(fleet, actor, "membership.created", fleet.id, {"username": username, "role": role})
    return membership


@transaction.atomic
def change_member(fleet, actor, member_id, role=None, *, remove=False):
    """Change one scoped role while retaining at least one fleet owner."""
    # Two simultaneous demotions must not each count the other owner's uncommitted membership.
    lock_fleet(fleet)
    # Scope membership IDs to this fleet even when the caller owns another workspace.
    membership = get_object_or_404(
        Membership.objects.select_related("user"), pk=member_id, fleet=fleet
    )
    if membership.role == Membership.Role.OWNER and (remove or role != Membership.Role.OWNER):
        # The invariant prevents a fleet from losing every principal able to administer it.
        if (
            not Membership.objects.filter(fleet=fleet, role=Membership.Role.OWNER)
            .exclude(pk=membership.pk)
            .exists()
        ):
            raise ValidationError({"role": "A fleet must retain at least one owner."})
    # Attribution must be copied before a membership row can be removed.
    username = membership.user.username
    if remove:
        # Membership removal revokes access; it never removes the user's historical evidence.
        membership.delete()
    else:
        # The request serializer restricts role values to the three supported permission levels.
        membership.role = role
        save_validated(membership)
    audit(
        fleet,
        actor,
        "membership.removed" if remove else "membership.updated",
        fleet.id,
        {"username": username, "role": role},
    )
    return membership
