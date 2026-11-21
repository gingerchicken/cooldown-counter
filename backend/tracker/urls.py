"""UUID-scoped API paths make fleet ownership explicit at every domain boundary."""

from django.urls import path

from .views.catalogue import (
    AccountDetailView,
    AccountListView,
    TypeArchiveView,
    TypeDetailView,
    TypeListView,
)
from .views.fleets import FleetListView, MemberDetailView, MemberListView
from .views.history import AuditListView, CalendarView
from .views.reports import EventCreateView, ObservationCreateView, PreviewView, WarningCreateView

# Health/auth remain independent template boundaries; this module owns only tracker endpoints.
urlpatterns = [
    path("fleets/", FleetListView.as_view(), name="fleet-list"),
    path("fleets/<uuid:fleet_id>/members/", MemberListView.as_view(), name="fleet-members"),
    path(
        "fleets/<uuid:fleet_id>/members/<int:member_id>/",
        MemberDetailView.as_view(),
        name="fleet-member",
    ),
    path("fleets/<uuid:fleet_id>/accounts/", AccountListView.as_view(), name="fleet-accounts"),
    path(
        "fleets/<uuid:fleet_id>/accounts/<uuid:account_id>/",
        AccountDetailView.as_view(),
        name="fleet-account",
    ),
    path("fleets/<uuid:fleet_id>/types/", TypeListView.as_view(), name="fleet-types"),
    path(
        "fleets/<uuid:fleet_id>/types/<uuid:type_id>/", TypeDetailView.as_view(), name="fleet-type"
    ),
    path(
        "fleets/<uuid:fleet_id>/types/<uuid:type_id>/archive/",
        TypeArchiveView.as_view(),
        name="fleet-type-archive",
    ),
    path("fleets/<uuid:fleet_id>/preview/", PreviewView.as_view(), name="fleet-preview"),
    path("fleets/<uuid:fleet_id>/warnings/", WarningCreateView.as_view(), name="fleet-warnings"),
    path("fleets/<uuid:fleet_id>/events/", EventCreateView.as_view(), name="fleet-events"),
    path(
        "fleets/<uuid:fleet_id>/events/<uuid:event_id>/observations/",
        ObservationCreateView.as_view(),
        name="fleet-observations",
    ),
    path("fleets/<uuid:fleet_id>/calendar/", CalendarView.as_view(), name="fleet-calendar"),
    path("fleets/<uuid:fleet_id>/audit/", AuditListView.as_view(), name="fleet-audit"),
]
