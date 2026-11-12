"""Browser-facing APIs enforce CSRF and authenticated account isolation."""

import logging
from functools import partial

from django.db import DatabaseError, connection, transaction
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from drf_spectacular.utils import extend_schema
from kombu.exceptions import OperationalError as BrokerOperationalError
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Heartbeat, Job
from .serializers import HealthSerializer, HeartbeatSerializer, JobSerializer
from .tasks import process_job

# Infrastructure publication details belong in server logs, never in browser error messages.
logger = logging.getLogger(__name__)


def enqueue_job(job_id: int) -> None:
    """Publish committed integer job_id and persist a safe failure if the broker is unavailable."""
    # Publication follows commit so workers cannot race a not-yet-visible database row.
    try:
        process_job.delay(job_id)
    except BrokerOperationalError:
        # A known unavailable broker must not leave a visible job pending indefinitely.
        logger.exception("Could not publish background job %s", job_id)
        Job.objects.filter(pk=job_id, status=Job.Status.PENDING).update(
            status=Job.Status.FAILED,
            result="The job could not be queued. Please try again.",
            updated_at=timezone.now(),
        )
    # TODO(refactor): Use a transactional outbox before adding business-critical jobs.
    # Process termination between commit and publication can otherwise strand pending work;
    # a durable outbox and publisher are outside this bounded demonstration's scope.


@method_decorator([never_cache, csrf_protect], name="dispatch")
class JobListCreateView(generics.ListCreateAPIView):
    """List the signed-in account's work or queue a validated new message."""

    # The serializer exposes only message as writable and derives all other fields on server.
    serializer_class = JobSerializer

    def get_queryset(self):
        """Keep account histories stable across sessions and ownership outside client JSON."""
        # Schema generation has no signed-in account and must not query or infer an owner.
        if getattr(self, "swagger_fake_view", False):
            # Empty metadata queries keep schema generation independent of any user database.
            return Job.objects.none()
        return Job.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Persist first and publish only after the corresponding transaction commits."""
        # Both the row and its enqueue callback share the same commit boundary.
        with transaction.atomic():
            # serializer holds validated input; job belongs to the permission-checked account.
            job = serializer.save(user=self.request.user)
            transaction.on_commit(partial(enqueue_job, job.pk))


@method_decorator(never_cache, name="dispatch")
class JobDetailView(generics.RetrieveAPIView):
    """Poll a durable result without exposing another account's job IDs."""

    # The same serializer keeps list, create, and poll responses structurally identical.
    serializer_class = JobSerializer

    def get_queryset(self):
        """Unknown and foreign IDs intentionally have the same 404 response."""
        # Schema generation must not use the synthetic request's anonymous user as a foreign key.
        if getattr(self, "swagger_fake_view", False):
            # Only model metadata is needed; no application rows are exposed to the generator.
            return Job.objects.none()
        # Filtering before lookup prevents record-existence disclosure across accounts.
        return Job.objects.filter(user=self.request.user)


@method_decorator(never_cache, name="dispatch")
class HealthView(APIView):
    """Process-only liveness deliberately avoids all dependency checks."""

    # Docker and Kubernetes probes have no browser credentials.
    permission_classes = [AllowAny]

    @extend_schema(responses=HealthSerializer, operation_id="health_retrieve", auth=[])
    def get(self, request):
        """Confirm that this Gunicorn process can answer an HTTP request."""
        # request needs no session or dependency access for this process-only health response.
        # A database outage must remove readiness rather than cause liveness restart loops.
        return Response({"status": "ok"})


@method_decorator(never_cache, name="dispatch")
class ReadyView(APIView):
    """Dependency readiness returns 503 while the database cannot answer a query."""

    # Dependency readiness is an infrastructure endpoint rather than user application data.
    permission_classes = [AllowAny]

    @extend_schema(
        responses={200: HealthSerializer, 503: None}, operation_id="ready_retrieve", auth=[]
    )
    def get(self, request):
        """Check the API's database connection without leaking connection details."""
        # request is intentionally unused: readiness must not create a visitor session.
        # This cheap query detects a lost database even before application tables are accessed.
        try:
            # database_cursor is scoped to this probe and closed even when its query fails.
            with connection.cursor() as database_cursor:
                # No application state is read or modified by this connection-only probe.
                database_cursor.execute("SELECT 1")
        except DatabaseError:
            # Orchestrators should stop routing new requests until the dependency recovers.
            return Response({"status": "unavailable"}, status=503)
        return Response({"status": "ok"})


@method_decorator(never_cache, name="dispatch")
class HeartbeatView(APIView):
    """Expose scheduler execution independently from API process liveness."""

    # The scheduler heartbeat is a minimal public infrastructure signal, not account-owned data.
    permission_classes = [AllowAny]

    @extend_schema(responses=HeartbeatSerializer, operation_id="heartbeat_retrieve", auth=[])
    def get(self, request):
        """Return null until Beat has dispatched a task and a worker has executed it."""
        # request needs no visitor state; last_run_at is a UTC timestamp or None before first run.
        last_run_at = Heartbeat.objects.filter(pk=1).values_list("last_run_at", flat=True).first()
        return Response(HeartbeatSerializer({"last_run_at": last_run_at}).data)
