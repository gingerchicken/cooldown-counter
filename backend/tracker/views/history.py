"""Calendar and audit projections preserve recorded facts and explain modeled forecasts."""

from drf_spectacular.utils import extend_schema

from tracker.queries import calendar_projection
from tracker.serializers.inputs import CalendarQuerySerializer
from tracker.serializers.outputs import AuditSerializer, CalendarSerializer

from .base import TrackerView


class CalendarView(TrackerView):
    """Return a bounded explicit date range rather than repeat counts for week segments."""

    @extend_schema(
        parameters=[CalendarQuerySerializer],
        responses=CalendarSerializer,
        operation_id="fleet_calendar_retrieve",
    )
    def get(self, request, fleet_id):
        """Read exact account/type filters and distinct current fleet totals."""
        # A viewer's permitted read cannot cross into a different known fleet identifier.
        membership = self.membership(request, fleet_id)
        filters = self.validated(CalendarQuerySerializer, request.query_params)
        return self.respond(CalendarSerializer, calendar_projection(membership.fleet, filters))


class AuditListView(TrackerView):
    """Read recent attributed changes without exposing global account or authentication data."""

    @extend_schema(responses=AuditSerializer(many=True), operation_id="fleet_audit_list")
    def get(self, request, fleet_id):
        """Keep the audit feed bounded to the latest hundred fleet mutations."""
        # The finite feed protects this operational overview from growing with complete history.
        membership = self.membership(request, fleet_id)
        entries = membership.fleet.audit_entries.select_related("actor").order_by(
            "-created_at", "-id"
        )[:100]
        return self.respond(
            AuditSerializer,
            [
                {
                    "id": entry.id,
                    "action": entry.action,
                    "subject_id": entry.subject_id,
                    "actor": entry.actor.username,
                    "details": entry.details,
                    "created_at": entry.created_at,
                }
                for entry in entries
            ],
            many=True,
        )
