"""Release gates must reject stale Jobs and serialize real PostgreSQL migrations."""

from copy import deepcopy
from unittest.mock import MagicMock, patch

import psycopg
import pytest
from django.db import connection

from config.operations import migrate, migration_gate


@pytest.fixture
def completed_job():
    """Return the minimal successful Job for one immutable application release."""
    # image and configuration identify the same code and settings expected by replacement pods.
    image = "ghcr.io/example/backend@sha256:" + "a" * 64
    configuration = "backend-config-1234567890"
    return {
        "spec": {
            "template": {
                "spec": {
                    "containers": [
                        {
                            "name": "migrate",
                            "image": image,
                            "envFrom": [{"configMapRef": {"name": configuration}}],
                        }
                    ]
                }
            }
        },
        "status": {"conditions": [{"type": "Complete", "status": "True"}]},
    }


def test_gate_accepts_only_the_successful_current_release(completed_job):
    """A completed release with its exact digest and generated config can start workloads."""
    assert migration_gate.is_current_complete(
        completed_job,
        "ghcr.io/example/backend@sha256:" + "a" * 64,
        "backend-config-1234567890",
    )


@pytest.mark.parametrize(
    "rejected_job",
    [None, {}, [], {"status": {"conditions": "invalid"}}],
)
def test_gate_rejects_missing_or_malformed_job(rejected_job):
    """Unexpected Kubernetes responses must keep the init container closed."""
    assert not migration_gate.is_current_complete(
        rejected_job,
        "ghcr.io/example/backend@sha256:" + "a" * 64,
        "backend-config-1234567890",
    )


@pytest.mark.parametrize("changed_input", ["image", "configuration", "pending", "failed"])
def test_gate_rejects_old_images_changed_config_and_failed_jobs(completed_job, changed_input):
    """Prior successful migrations cannot admit a new release or override failure."""
    # changed_job keeps each rejection independent from the shared successful fixture.
    changed_job = deepcopy(completed_job)
    if changed_input == "image":
        # A previous immutable digest represents different schema code.
        changed_job["spec"]["template"]["spec"]["containers"][0]["image"] = (
            "ghcr.io/example/backend@sha256:" + "b" * 64
        )
    elif changed_input == "configuration":
        # Settings changes, including a public deployment revision, require a new Job execution.
        changed_job["spec"]["template"]["spec"]["containers"][0]["envFrom"] = [
            {"configMapRef": {"name": "backend-config-abcdefghij"}}
        ]
    elif changed_input == "pending":
        # A running or not-yet-scheduled migration is not evidence of completion.
        changed_job["status"] = {}
    else:
        # Failure wins even when an inconsistent response also contains Complete=True.
        changed_job["status"]["conditions"].append({"type": "Failed", "status": "True"})
    assert not migration_gate.is_current_complete(
        changed_job,
        "ghcr.io/example/backend@sha256:" + "a" * 64,
        "backend-config-1234567890",
    )


@pytest.mark.parametrize(
    ("image", "configuration"),
    [
        ("ghcr.io/example/backend:latest", "backend-config-1234567890"),
        ("ghcr.io/example/backend:replace-with-verified-release", "backend-config-1234567890"),
        ("ghcr.io/example/backend@sha256:" + "a" * 64, "backend-config"),
    ],
)
def test_gate_rejects_mutable_or_unconfigured_release_inputs(completed_job, image, configuration):
    """Matching placeholders must never be mistaken for a safely identified release."""
    assert not migration_gate.is_current_complete(completed_job, image, configuration)


def test_gate_reports_generic_failure_without_credentials(monkeypatch, capsys):
    """Credential-bearing transport errors must not be copied into pod logs."""
    # Required non-secret inputs select the one Job authorized by the ServiceAccount Role.
    monkeypatch.setenv("POD_NAMESPACE", "example-staging")
    monkeypatch.setenv("MIGRATION_JOB_NAME", "backend-migrate")
    monkeypatch.setenv("EXPECTED_MIGRATION_IMAGE", "ghcr.io/example/backend@sha256:" + "a" * 64)
    monkeypatch.setenv("EXPECTED_MIGRATION_CONFIG", "backend-config-1234567890")
    # A diagnostic can contain headers or response text and must be hidden by the boundary.
    with patch.object(migration_gate, "read_migration_job", side_effect=OSError("private-token")):
        assert migration_gate.main() == 1
    assert "private-token" not in capsys.readouterr().out


def test_migration_lock_waits_then_admits_one_migration():
    """A competing migration must wait for the database lock before applying schema changes."""
    # lock_cursor observes contention once, then a successful lock acquisition.
    lock_cursor = MagicMock()
    lock_cursor.fetchone.side_effect = [(False,), (True,)]
    with (
        patch.object(migrate.time, "sleep") as sleep,
        patch.object(migrate.time, "monotonic", side_effect=[0, 1]),
    ):
        migrate.acquire_migration_lock(lock_cursor)
    assert lock_cursor.execute.call_count == 2
    sleep.assert_called_once_with(2)


def test_migration_lock_times_out_instead_of_running_concurrent_schema_changes():
    """Bound contention so a stuck release becomes an operator-visible failed Job."""
    # lock_cursor represents a different migration still holding the advisory lock.
    lock_cursor = MagicMock()
    lock_cursor.fetchone.return_value = (False,)
    with (
        patch.object(migrate.time, "monotonic", side_effect=[0, 301]),
        pytest.raises(TimeoutError, match="migration lock"),
    ):
        migrate.acquire_migration_lock(lock_cursor)


@pytest.mark.parametrize("migration_fails", [False, True])
def test_migration_wrapper_releases_lock_on_success_and_failure(migration_fails):
    """The dedicated lock connection must survive Django commits and release on errors."""
    # lock_connection and lock_cursor are independent of Django's schema-editing connection.
    lock_connection = MagicMock()
    lock_cursor = lock_connection.cursor.return_value.__enter__.return_value
    lock_cursor.fetchone.return_value = (True,)
    with (
        patch.object(migrate.psycopg, "connect") as connect,
        patch.object(migrate, "call_command") as call_command,
    ):
        connect.return_value.__enter__.return_value = lock_connection
        if migration_fails:
            # The original migration failure must make the Job fail after releasing its lock.
            call_command.side_effect = RuntimeError("schema change failed")
            with pytest.raises(RuntimeError, match="schema change failed"):
                migrate.run_locked_migrations({"dbname": "example"})
        else:
            # Successful completion proves both the command and cleanup path ran.
            migrate.run_locked_migrations({"dbname": "example"})
        connect.assert_called_once_with(dbname="example", autocommit=True)
        call_command.assert_called_once_with("migrate", interactive=False)
    assert "pg_advisory_unlock" in lock_cursor.execute.call_args.args[0]


@pytest.mark.django_db(transaction=True)
def test_postgresql_sessions_cannot_hold_the_release_lock_concurrently():
    """Use real independent database sessions to prove cross-Job lock exclusion and release."""
    if connection.vendor != "postgresql":
        # This proof needs PostgreSQL advisory locks; SQLite cannot simulate deployment exclusion.
        pytest.skip("Deployment lock concurrency requires PostgreSQL.")
    # connection_parameters includes this isolated test database, never the deployment database.
    connection_parameters = connection.get_connection_params()
    with (
        psycopg.connect(**connection_parameters, autocommit=True) as first_connection,
        psycopg.connect(**connection_parameters, autocommit=True) as second_connection,
        first_connection.cursor() as first_cursor,
        second_connection.cursor() as second_cursor,
    ):
        migrate.acquire_migration_lock(first_cursor)
        with pytest.raises(TimeoutError, match="migration lock"):
            # A zero wait makes actual contention deterministic without sleeping in the test.
            migrate.acquire_migration_lock(second_cursor, wait_timeout_seconds=0)
        first_cursor.execute("SELECT pg_advisory_unlock(%s)", (migrate.MIGRATION_LOCK_KEY,))
        # The waiting release can acquire only after the first session explicitly relinquishes it.
        migrate.acquire_migration_lock(second_cursor, wait_timeout_seconds=0)
        second_cursor.execute("SELECT pg_advisory_unlock(%s)", (migrate.MIGRATION_LOCK_KEY,))


def test_gate_transport_uses_verified_tls_without_redirects_or_ambient_proxies():
    """The Kubernetes token is confined to the fixed API endpoint and a bounded read."""
    # token_file and status_response simulate projected credentials and a public Job payload.
    token_file = MagicMock()
    token_file.read_text.return_value = "private-token\n"
    status_response = MagicMock()
    status_response.read.return_value = b'{"status": {}}'
    with (
        patch.object(migration_gate, "Path") as credential_path,
        patch.object(migration_gate.ssl, "create_default_context") as tls_context,
        patch.object(migration_gate, "build_opener") as build_opener,
    ):
        credential_path.return_value.__truediv__.return_value = token_file
        build_opener.return_value.open.return_value.__enter__.return_value = status_response
        assert migration_gate.read_migration_job("example-staging", "backend-migrate") == {
            "status": {}
        }
        # status_request retains credentials for this endpoint without making them redirect headers.
        status_request = build_opener.return_value.open.call_args.args[0]
        assert status_request.full_url == (
            "https://kubernetes.default.svc/apis/batch/v1/namespaces/"
            "example-staging/jobs/backend-migrate"
        )
        assert status_request.unredirected_hdrs["Authorization"] == "Bearer private-token"
        assert not status_request.headers
        assert any(
            isinstance(handler, migration_gate.RejectRedirects)
            for handler in build_opener.call_args.args
        )
        assert any(
            isinstance(handler, migration_gate.ProxyHandler) and handler.proxies == {}
            for handler in build_opener.call_args.args
        )
        tls_context.assert_called_once()
        status_response.read.assert_called_once_with(1_048_577)


def test_gate_redirect_handler_never_forwards_the_token():
    """An unexpected redirect response cannot move the bearer credential off the API server."""
    assert (
        migration_gate.RejectRedirects().redirect_request(
            None, None, 302, "Found", {}, "https://untrusted.invalid"
        )
        is None
    )
