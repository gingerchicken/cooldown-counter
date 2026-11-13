"""Fleet and membership HTTP endpoints delegate transactional ownership rules."""

from drf_spectacular.utils import extend_schema
from rest_framework.response import Response

from tracker.models import Membership
from tracker.queries import fleet_projection, member_projection
from tracker.serializers.inputs import (
    FleetInputSerializer,
    MembershipInputSerializer,
    MembershipUpdateSerializer,
)
from tracker.serializers.outputs import FleetSerializer, MembershipSerializer
from tracker.services.fleets import add_member, change_member, create_fleet

from .base import TrackerView


class FleetListView(TrackerView):
    """List only memberships held by the caller or create another independent workspace."""

    @extend_schema(responses=FleetSerializer(many=True), operation_id="fleets_list")
    def get(self, request):
        """Return scoped identities with the caller's effective role."""
        # Filtering memberships before projection never exposes names from an unrelated fleet.
        memberships = (
            Membership.objects.filter(user=request.user)
            .select_related("fleet")
            .order_by("fleet__name", "fleet_id")
        )
        return self.respond(
            FleetSerializer,
            [fleet_projection(member.fleet, member.role) for member in memberships],
            many=True,
        )

    @extend_schema(
        request=FleetInputSerializer, responses={201: FleetSerializer}, operation_id="fleets_create"
    )
    def post(self, request):
        """Create an owner membership and rule defaults without seeding fake accounts."""
        # The authenticated caller, not any request field, becomes this new fleet's owner.
        attributes = self.validated(FleetInputSerializer, request.data)
        fleet = create_fleet(request.user, attributes["name"])
        return self.respond(FleetSerializer, fleet_projection(fleet, "owner"), status=201)


class MemberListView(TrackerView):
    """Expose tenant membership to members while restricting grants to owners."""

    @extend_schema(responses=MembershipSerializer(many=True), operation_id="fleet_members_list")
    def get(self, request, fleet_id):
        """Read the provisioned principals who share this workspace."""
        # Every caller must be a member before even the operator list can be read.
        membership = self.membership(request, fleet_id)
        members = membership.fleet.memberships.select_related("user").order_by("user__username")
        return self.respond(
            MembershipSerializer, [member_projection(member) for member in members], many=True
        )

    @extend_schema(
        request=MembershipInputSerializer,
        responses={201: MembershipSerializer},
        operation_id="fleet_members_create",
    )
    def post(self, request, fleet_id):
        """Grant an existing active operator an explicit role."""
        # Editors can report evidence but cannot grant themselves membership administration.
        membership = self.membership(request, fleet_id, owner=True)
        attributes = self.validated(MembershipInputSerializer, request.data)
        added = add_member(membership.fleet, request.user, **attributes)
        return self.respond(MembershipSerializer, member_projection(added), status=201)


class MemberDetailView(TrackerView):
    """Update or remove only a membership belonging to the authorized fleet."""

    @extend_schema(
        request=MembershipUpdateSerializer,
        responses=MembershipSerializer,
        operation_id="fleet_members_update",
    )
    def patch(self, request, fleet_id, member_id):
        """Apply a role change after validating the last-owner invariant."""
        # The command owns serialized membership-count validation and audit attribution.
        membership = self.membership(request, fleet_id, owner=True)
        attributes = self.validated(MembershipUpdateSerializer, request.data)
        updated = change_member(membership.fleet, request.user, member_id, **attributes)
        return self.respond(MembershipSerializer, member_projection(updated))

    @extend_schema(responses={204: None}, operation_id="fleet_members_destroy")
    def delete(self, request, fleet_id, member_id):
        """Revoke fleet access without deleting the principal or their historical evidence."""
        # Removing the final owner is rejected inside the same fleet lock as other role changes.
        membership = self.membership(request, fleet_id, owner=True)
        change_member(membership.fleet, request.user, member_id, remove=True)
        return Response(status=204)
