"""Account and immutable-rule endpoints keep write roles separate from read visibility."""

from drf_spectacular.utils import extend_schema

from tracker.queries import accounts_projection, type_projection
from tracker.serializers.inputs import (
    AccountInputSerializer,
    AccountUpdateSerializer,
    ArchiveInputSerializer,
    TypeInputSerializer,
    TypeUpdateSerializer,
)
from tracker.serializers.outputs import (
    AccountDetailSerializer,
    AccountSerializer,
    OffenceTypeSerializer,
)
from tracker.services.catalogue import (
    archive_type,
    create_account,
    create_type,
    update_account,
    update_type,
)

from .base import TrackerView


class AccountListView(TrackerView):
    """List exact scoped identities or track an additional real Steam account."""

    @extend_schema(responses=AccountSerializer(many=True), operation_id="fleet_accounts_list")
    def get(self, request, fleet_id):
        """Read per-account availability and server-derived per-type predictions."""
        # The projection performs no write and returns only this authorized tenant's accounts.
        membership = self.membership(request, fleet_id)
        return self.respond(AccountSerializer, accounts_projection(membership.fleet), many=True)

    @extend_schema(
        request=AccountInputSerializer,
        responses={201: AccountDetailSerializer},
        operation_id="fleet_accounts_create",
    )
    def post(self, request, fleet_id):
        """Create an account only after editor permission and exact string validation."""
        # Client-supplied fleet IDs or owner IDs cannot override this permission boundary.
        membership = self.membership(request, fleet_id, write=True)
        attributes = self.validated(AccountInputSerializer, request.data)
        account = create_account(membership.fleet, request.user, attributes)
        return self.respond(
            AccountDetailSerializer,
            accounts_projection(membership.fleet, account_id=account.id),
            status=201,
        )


class AccountDetailView(TrackerView):
    """Read preserved observations or update an account's mutable display/archive state."""

    @extend_schema(responses=AccountDetailSerializer, operation_id="fleet_accounts_retrieve")
    def get(self, request, fleet_id, account_id):
        """Read the same scoped UUID selected by the operator, never a tag substring."""
        # Missing and foreign account IDs intentionally share a 404 response.
        membership = self.membership(request, fleet_id)
        return self.respond(
            AccountDetailSerializer,
            accounts_projection(membership.fleet, account_id=account_id),
        )

    @extend_schema(
        request=AccountUpdateSerializer,
        responses=AccountDetailSerializer,
        operation_id="fleet_accounts_update",
    )
    def patch(self, request, fleet_id, account_id):
        """Archive or rename without removing associated event/observation facts."""
        # A viewer cannot mutate even when this account is otherwise visible to them.
        membership = self.membership(request, fleet_id, write=True)
        attributes = self.validated(AccountUpdateSerializer, request.data)
        account = update_account(membership.fleet, request.user, account_id, attributes)
        return self.respond(
            AccountDetailSerializer,
            accounts_projection(membership.fleet, account_id=account.id),
        )


class TypeListView(TrackerView):
    """Read active and archived catalogue definitions or publish a new one."""

    @extend_schema(responses=OffenceTypeSerializer(many=True), operation_id="fleet_types_list")
    def get(self, request, fleet_id):
        """Retain archived names so history is never rendered as an unknown reference."""
        # Stable UUIDs permit current labels while event policy snapshots remain immutable.
        membership = self.membership(request, fleet_id)
        definitions = membership.fleet.offence_types.order_by("name", "id")
        return self.respond(
            OffenceTypeSerializer,
            [type_projection(definition) for definition in definitions],
            many=True,
        )

    @extend_schema(
        request=TypeInputSerializer,
        responses={201: OffenceTypeSerializer},
        operation_id="fleet_types_create",
    )
    def post(self, request, fleet_id):
        """Publish the initial nonempty policy and its stable offence identity atomically."""
        # Input validation prevents silent one-minute substitution or arbitrary code truncation.
        membership = self.membership(request, fleet_id, write=True)
        attributes = self.validated(TypeInputSerializer, request.data)
        definition = create_type(membership.fleet, request.user, attributes)
        return self.respond(OffenceTypeSerializer, type_projection(definition), status=201)


class TypeDetailView(TrackerView):
    """Publish a changed policy or rename metadata under an optimistic current-version token."""

    @extend_schema(
        request=TypeUpdateSerializer,
        responses=OffenceTypeSerializer,
        operation_id="fleet_types_update",
    )
    def patch(self, request, fleet_id, type_id):
        """Reject a stale editor rather than overwrite another accepted policy change."""
        # History remains pinned to the original policy version after this command succeeds.
        membership = self.membership(request, fleet_id, write=True)
        attributes = self.validated(TypeUpdateSerializer, request.data)
        definition = update_type(membership.fleet, request.user, type_id, attributes)
        return self.respond(OffenceTypeSerializer, type_projection(definition))


class TypeArchiveView(TrackerView):
    """Replace destructive deletion with an explicit reviewed archival operation."""

    @extend_schema(
        request=ArchiveInputSerializer,
        responses=OffenceTypeSerializer,
        operation_id="fleet_types_archive",
    )
    def post(self, request, fleet_id, type_id):
        """Archive the selected version without touching any associated evidence."""
        # Both tenant role and current policy identity are checked server-side.
        membership = self.membership(request, fleet_id, write=True)
        attributes = self.validated(ArchiveInputSerializer, request.data)
        definition = archive_type(membership.fleet, request.user, type_id, **attributes)
        return self.respond(OffenceTypeSerializer, type_projection(definition))
