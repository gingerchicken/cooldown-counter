"""The same /api prefix is used behind Pages and directly in backend unit tests."""

from django.urls import path

from .views import HealthView, HeartbeatView, JobDetailView, JobListCreateView, ReadyView

# Trailing slashes are explicit in the generated client, avoiding redirecting unsafe requests.
urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("ready/", ReadyView.as_view(), name="ready"),
    path("heartbeat/", HeartbeatView.as_view(), name="heartbeat"),
    path("jobs/", JobListCreateView.as_view(), name="job-list"),
    path("jobs/<int:pk>/", JobDetailView.as_view(), name="job-detail"),
]
