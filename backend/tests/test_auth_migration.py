"""Account ownership upgrades preserve anonymous history without guessing a user."""

import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor


@pytest.mark.django_db(transaction=True)
def test_ownership_migration_preserves_legacy_job_without_assigning_an_account():
    """Existing anonymous data must remain stored and hidden after authentication is introduced."""
    # executor changes only the jobs schema; Django's user/session tables remain available.
    executor = MigrationExecutor(connection)
    # previous_migration and current_migration identify the exact ownership transition to exercise.
    previous_migration = [("jobs", "0001_initial")]
    current_migration = [("jobs", "0002_account_owned_jobs")]
    executor.migrate(previous_migration)
    try:
        # legacy_apps exposes the historical model, including its former session_key field.
        legacy_apps = executor.loader.project_state(previous_migration).apps
        # legacy_job is a pre-authentication row whose content must survive the upgrade.
        legacy_job = legacy_apps.get_model("jobs", "Job").objects.create(
            session_key="legacy-browser-session",
            message="previous anonymous work",
            status="succeeded",
            result="PREVIOUS ANONYMOUS WORK",
        )
        # Refresh applied-migration state after rollback; executor caches its initial graph state.
        executor = MigrationExecutor(connection)
        executor.migrate(current_migration)
        # current_apps and upgraded_job inspect the migrated row using the new account model.
        current_apps = executor.loader.project_state(current_migration).apps
        upgraded_job = current_apps.get_model("jobs", "Job").objects.get(pk=legacy_job.pk)
        assert upgraded_job.user_id is None
        assert upgraded_job.message == "previous anonymous work"
        assert upgraded_job.result == "PREVIOUS ANONYMOUS WORK"
    finally:
        # Restore the current schema even on failure so later tests never inherit a stale table.
        MigrationExecutor(connection).migrate(current_migration)
