"""Idempotent tasks put their externally visible results in application rows."""

from celery import shared_task
from django.db import OperationalError, transaction
from django.utils import timezone

from .models import Heartbeat, Job


@shared_task(autoretry_for=(OperationalError,), retry_backoff=True, retry_kwargs={"max_retries": 5})
def process_job(job_id: int) -> None:
    """Uppercase a pending job exactly once, safely tolerating broker redelivery.

    job_id is the committed integer primary key, never a client-supplied ownership key.
    The row lock serializes concurrent deliveries. Work is deliberately tiny and has
    no external side effects, so the transformation and success write share a transaction.
    """
    # Locking one row avoids duplicate transitions without locking unrelated visitors' work.
    with transaction.atomic():
        # job is the locked pending row, or None for a deleted or already-completed delivery.
        job = Job.objects.select_for_update().filter(pk=job_id, status=Job.Status.PENDING).first()
        if job is None:
            # Celery should acknowledge the stale ID instead of retrying it forever.
            return

        # job.result and job.status commit transformed text and its success marker atomically.
        job.result = job.message.upper()
        job.status = Job.Status.SUCCEEDED
        job.save(update_fields=["result", "status", "updated_at"])


@shared_task(autoretry_for=(OperationalError,), retry_backoff=True, retry_kwargs={"max_retries": 5})
def record_heartbeat() -> None:
    """Record completion of a scheduler-delivered task in a singleton database row."""
    # A fixed key bounds storage and makes repeated or duplicate ticks harmless.
    Heartbeat.objects.update_or_create(pk=1, defaults={"last_run_at": timezone.now()})
