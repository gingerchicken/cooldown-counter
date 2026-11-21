"""Preview, recording and append-only observation HTTP contracts."""

from drf_spectacular.utils import extend_schema

from tracker.queries import event_projection, observation_projection
from tracker.serializers.inputs import (
    EventInputSerializer,
    ObservationInputSerializer,
    PreviewInputSerializer,
    WarningInputSerializer,
)
from tracker.serializers.outputs import (
    EventSerializer,
    ObservationSerializer,
    PreviewSerializer,
    WarningSerializer,
)
from tracker.services.reports import preview_report, record_event, record_observation
from tracker.services.warnings import record_warning

from .base import TrackerView


class PreviewView(TrackerView):
    """Preview a report without accepting evidence or consuming a retry identity."""

    @extend_schema(
        request=PreviewInputSerializer,
        responses=PreviewSerializer,
        operation_id="fleet_preview_create",
    )
    def post(self, request, fleet_id):
        """Use entered event time rather than the browser's or demo's current date."""
        # Viewers may inspect current predictions but reporting controls require editor permission.
        membership = self.membership(request, fleet_id, write=True)
        attributes = self.validated(PreviewInputSerializer, request.data)
        return self.respond(PreviewSerializer, preview_report(membership.fleet, attributes))


class EventCreateView(TrackerView):
    """Accept exactly one offence and its first observation under reviewed revision tokens."""

    @extend_schema(
        request=EventInputSerializer,
        responses={200: EventSerializer, 201: EventSerializer},
        operation_id="fleet_events_create",
    )
    def post(self, request, fleet_id):
        """Return 200 for an accepted identical retry and 201 for newly committed evidence."""
        # A hidden button cannot substitute for tenant-specific write authorization.
        membership = self.membership(request, fleet_id, write=True)
        attributes = self.validated(EventInputSerializer, request.data)
        event, created = record_event(membership.fleet, request.user, attributes)
        return self.respond(
            EventSerializer, event_projection(event), status=201 if created else 200
        )


class ObservationCreateView(TrackerView):
    """Record another observation of a known restriction without incrementing offence count."""

    @extend_schema(
        request=ObservationInputSerializer,
        responses={200: ObservationSerializer, 201: ObservationSerializer},
        operation_id="fleet_observations_create",
    )
    def post(self, request, fleet_id, event_id):
        """Retain observed facts while preserving the parent event's original assessment."""
        # Tenant scoping is checked for the event as well as for the authenticated membership.
        membership = self.membership(request, fleet_id, write=True)
        attributes = self.validated(ObservationInputSerializer, request.data)
        observation, created = record_observation(
            membership.fleet, request.user, event_id, attributes
        )
        return self.respond(
            ObservationSerializer,
            observation_projection(observation),
            status=201 if created else 200,
        )


class WarningCreateView(TrackerView):
    """Accept a warning notice without creating an issued restriction."""

    @extend_schema(
        request=WarningInputSerializer,
        responses={200: WarningSerializer, 201: WarningSerializer},
        operation_id="fleet_warnings_create",
    )
    def post(self, request, fleet_id):
        """Record a new notice or return the original on an identical retry."""
        # Fleet editors and owners use the same evidence permissions as for cooldown reports.
        membership = self.membership(request, fleet_id, write=True)
        attributes = self.validated(WarningInputSerializer, request.data)
        warning, created = record_warning(membership.fleet, request.user, attributes)
        return self.respond(WarningSerializer, warning, status=201 if created else 200)
