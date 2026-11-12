"""Serialize approved PostgreSQL migrations without running them in API pod startup."""

import time

import django
import psycopg
from django.core.management import call_command
from django.db import connection

# The constant identifies this application's migration coordination within its own database.
MIGRATION_LOCK_KEY = 723108216


def acquire_migration_lock(lock_cursor, wait_timeout_seconds: float = 300) -> None:
    """Wait at most wait_timeout_seconds for the release lock, raising on contention."""
    # lock_deadline_seconds uses a monotonic clock so wall-clock corrections cannot extend a Job.
    lock_deadline_seconds = time.monotonic() + wait_timeout_seconds
    while True:
        # Session-level ownership survives commits issued by Django's migration executor.
        lock_cursor.execute("SELECT pg_try_advisory_lock(%s)", (MIGRATION_LOCK_KEY,))
        # lock_response is the one boolean returned by PostgreSQL, or None for an invalid response.
        lock_response = lock_cursor.fetchone()
        if lock_response and lock_response[0]:
            # Only this connection may authorize the following migration invocation.
            return
        if time.monotonic() >= lock_deadline_seconds:
            # A failed Job must remain visible rather than applying concurrent schema changes.
            raise TimeoutError("Timed out waiting for the application migration lock.")
        # Avoid busy-polling PostgreSQL while another approved release is still applying changes.
        time.sleep(2)


def run_locked_migrations(connection_parameters: dict) -> None:
    """Apply Django migrations while a separate PostgreSQL connection holds the release lock.

    All deployment and operator migration entry points must use this wrapper for
    serialization. Direct manage.py migrate calls cannot participate in this lock.
    Exceptions propagate so Kubernetes marks unsuccessful schema changes as failed.
    """
    # lock_connection owns only coordination; Django retains its own transaction lifecycle.
    with psycopg.connect(**connection_parameters, autocommit=True) as lock_connection:
        # lock_cursor is released on both successful execution and database failures.
        with lock_connection.cursor() as lock_cursor:
            acquire_migration_lock(lock_cursor)
            try:
                # Schema work belongs exclusively to the controlled migration Job.
                call_command("migrate", interactive=False)
            finally:
                # Release promptly on errors; closing the connection also releases session locks.
                lock_cursor.execute("SELECT pg_advisory_unlock(%s)", (MIGRATION_LOCK_KEY,))


def main() -> None:
    """Load the image's Django settings and fail closed unless deployment uses PostgreSQL."""
    # Module invocation does not pass through manage.py's settings initialization.
    import os

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()
    if connection.vendor != "postgresql":
        # The deployment lock has PostgreSQL semantics; local SQLite is not an equivalent fallback.
        raise RuntimeError("The deployment migration wrapper requires PostgreSQL.")
    # Django derives SSL and connection parameters from DATABASE_URL without logging credentials.
    run_locked_migrations(connection.get_connection_params())


if __name__ == "__main__":
    # Unhandled command failures intentionally produce a failed migration Job.
    main()
