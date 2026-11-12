"""Task tests exercise durable business results without a real Celery broker."""

import pytest
from django.conf import settings

from jobs.models import Heartbeat, Job
from jobs.tasks import process_job, record_heartbeat

# Task results live in the application database rather than a Celery result backend.
pytestmark = pytest.mark.django_db


def test_worker_persists_uppercase_result():
    """The example task demonstrates an observable worker-side database write."""
    # job is a legacy unowned row; its ownership is unrelated to worker execution permissions.
    job = Job.objects.create(message="Hello Django")
    process_job(job.pk)
    job.refresh_from_db()
    assert job.status == Job.Status.SUCCEEDED
    assert job.result == "HELLO DJANGO"


def test_duplicate_delivery_does_not_modify_completed_job():
    """At-least-once broker delivery must not repeat completed work."""
    # job starts pending so the first invocation establishes the completed state to preserve.
    job = Job.objects.create(message="hello")
    process_job(job.pk)
    job.refresh_from_db()
    # completed_at preserves the first success timestamp so duplicate writes are observable.
    completed_at = job.updated_at
    process_job(job.pk)
    job.refresh_from_db()
    assert job.updated_at == completed_at
    assert job.result == "HELLO"


def test_deleted_job_delivery_is_ignored():
    """A stale queued ID must not poison the queue after its row is removed."""
    # Missing work has nothing to mutate and is a successful no-op.
    process_job(99999)
    assert Job.objects.count() == 0


def test_heartbeat_updates_single_persistent_row():
    """Periodic execution must update one observable timestamp, not grow a log."""
    # Repeat delivery and repeated schedule ticks share the same singleton row.
    record_heartbeat()
    record_heartbeat()
    assert Heartbeat.objects.count() == 1
    assert Heartbeat.objects.get(pk=1).last_run_at is not None


def test_beat_schedule_uses_registered_task_and_positive_interval():
    """The configured DB scheduler must have a task it can actually dispatch."""
    # heartbeat_schedule is the task name and interval imported by Beat's database scheduler.
    heartbeat_schedule = settings.CELERY_BEAT_SCHEDULE["record-heartbeat"]
    assert heartbeat_schedule["task"] == "jobs.tasks.record_heartbeat"
    assert heartbeat_schedule["schedule"] > 0
