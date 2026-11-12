"""Durable application state is shared by Gunicorn, Celery, and Beat."""

from django.conf import settings
from django.db import models


class Job(models.Model):
    """One account's input and the durable result of its background processing."""

    class Status(models.TextChoices):
        """Stable API values remain independent of human-readable admin labels."""

        # PENDING is the only state a worker may transition, making redelivery idempotent.
        PENDING = "pending", "Pending"
        # SUCCEEDED means the result was committed and duplicate deliveries must leave it alone.
        SUCCEEDED = "succeeded", "Succeeded"
        # FAILED records known dispatch failures so the browser does not poll indefinitely.
        FAILED = "failed", "Failed"

    # user persists ownership across login-session rotation and is always assigned on API writes.
    # Null preserves legacy anonymous rows without guessing which account should own them.
    # TODO(refactor): Make ownership non-null after explicitly archiving or removing unowned
    # demo rows. Nullable ownership permits future callers to create inaccessible orphan jobs,
    # but discarding existing anonymous content is outside this authentication change.
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)

    # A small bounded payload keeps the sample safe to render and cheap to queue.
    message = models.CharField(max_length=200)

    # status is the durable task state, independent of Celery's ephemeral result backend.
    status = models.CharField(max_length=16, choices=Status, default=Status.PENDING)
    # result holds transformed text or a safe failure message; it stays empty while pending.
    result = models.TextField(blank=True, default="")

    # created_at records initial submission; updated_at records the latest saved state in UTC.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Return recent work first with a deterministic tie-breaker."""

        # Newest-first ordering keeps reload behavior stable across database engines.
        ordering = ["-created_at", "-pk"]


class Heartbeat(models.Model):
    """Singleton row proving that Beat dispatched a task and a worker executed it."""

    # A fixed primary key lets periodic updates replace one timestamp instead of growing logs.
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)
    # last_run_at is the UTC completion time of the latest heartbeat task, not Beat's dispatch time.
    last_run_at = models.DateTimeField()
