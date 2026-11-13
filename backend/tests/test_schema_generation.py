"""API contract tooling must preserve valid generated source while edits are invalid."""

import subprocess
import threading
from pathlib import Path
from types import SimpleNamespace

import pytest

from platform_tools.management.commands.generate_api_schema import Command
from platform_tools.schema_export import export_schema_atomically
from platform_tools.schema_watch import (
    SourceChangeTracker,
    regenerate_schema,
    source_fingerprint,
    watch_schema,
)


def test_schema_export_preserves_previous_contract_when_validation_fails(tmp_path):
    """A rejected schema must never replace the frontend's last validated input."""
    # destination is the already accepted public contract consumed by TypeScript tooling.
    destination = tmp_path / "openapi.json"
    destination.write_text('{"accepted": true}\n')

    def rejected_renderer(temporary_path: Path) -> None:
        """Simulate spectacular writing partial output before rejecting the contract."""
        # temporary_path belongs to this export attempt, not the accepted destination.
        temporary_path.write_text("incomplete contract")
        raise ValueError("schema validation failed")

    # Failed validation propagates to the caller while cleanup removes private partial output.
    with pytest.raises(ValueError, match="validation failed"):
        export_schema_atomically(destination, rejected_renderer)
    assert destination.read_text() == '{"accepted": true}\n'
    assert list(tmp_path.iterdir()) == [destination]


def test_unchanged_schema_keeps_the_existing_file_timestamp(tmp_path):
    """An equivalent export must not trigger downstream regeneration or HMR loops."""
    # destination and original_modified_ns identify the prior accepted file instance.
    destination = tmp_path / "openapi.json"
    destination.write_text('{"unchanged": true}\n')
    original_modified_ns = destination.stat().st_mtime_ns

    def unchanged_renderer(temporary_path: Path) -> None:
        """Produce the same bytes as a successful unchanged serializer schema."""
        temporary_path.write_text('{"unchanged": true}\n')

    # No replacement is reported because the public contract did not change.
    assert export_schema_atomically(destination, unchanged_renderer) is False
    assert destination.stat().st_mtime_ns == original_modified_ns
    assert list(tmp_path.iterdir()) == [destination]


def test_changed_schema_is_published_after_successful_render(tmp_path):
    """A validated changed contract becomes visible as one complete file."""
    # destination intentionally starts in an absent output directory supported by --output.
    destination = tmp_path / "contract" / "openapi.json"

    def accepted_renderer(temporary_path: Path) -> None:
        """The renderer sees the original destination unchanged until it has finished."""
        assert not destination.exists()
        temporary_path.write_text('{"version": 2}\n')

    # Publishing and private-file cleanup succeed together after the render callback returns.
    assert export_schema_atomically(destination, accepted_renderer) is True
    assert destination.read_text() == '{"version": 2}\n'
    assert list(destination.parent.iterdir()) == [destination]


def test_management_export_requires_validated_warning_free_schema_before_publication(
    tmp_path, monkeypatch
):
    """The Django entry point must use the strict renderer and a private output file."""
    # destination remains accepted public source until the mocked spectacular call completes.
    destination = tmp_path / "openapi.json"
    destination.write_text("previous contract\n")
    # renderer_calls records the command boundary rather than duplicating spectacular internals.
    renderer_calls = []

    def render_schema(command_name, **options):
        """Validate the CLI contract before simulating complete renderer output."""
        renderer_calls.append((command_name, options))
        assert destination.read_text() == "previous contract\n"
        assert Path(options["file"]) != destination
        Path(options["file"]).write_text("validated contract\n")

    monkeypatch.setattr(
        "platform_tools.management.commands.generate_api_schema.call_command", render_schema
    )
    Command().handle(output=str(destination))
    assert renderer_calls[0][0] == "spectacular"
    assert renderer_calls[0][1]["validate"] is True
    assert renderer_calls[0][1]["fail_on_warn"] is True
    assert renderer_calls[0][1]["format"] == "openapi-json"
    assert destination.read_text() == "validated contract\n"


def test_source_fingerprint_detects_added_changed_and_removed_python_sources(tmp_path):
    """Schema regeneration follows backend source changes rather than generated output."""
    # source_path is an API source fixture; generated_path must never become a watched input.
    source_path = tmp_path / "serializers.py"
    generated_path = tmp_path / "openapi.json"
    source_path.write_text("field = 1\n")
    generated_path.write_text("{}")
    # initial_fingerprint represents the source state before a generated-file rewrite.
    initial_fingerprint = source_fingerprint(tmp_path)
    generated_path.write_text('{"changed": true}')
    assert source_fingerprint(tmp_path) == initial_fingerprint
    source_path.write_text("field = 'different'\n")
    assert source_fingerprint(tmp_path) != initial_fingerprint
    source_path.unlink()
    assert source_fingerprint(tmp_path) == ()


def test_source_fingerprint_ignores_tests_caches_and_virtual_environments(tmp_path):
    """Tool and test outputs cannot repeatedly regenerate their own contract."""
    # ignored_directory is each nonapplication tree excluded from the polling signature.
    for ignored_directory in ["tests", "__pycache__", ".venv", "staticfiles"]:
        # ignored_source would look like Python source without directory-boundary filtering.
        ignored_source = tmp_path / ignored_directory / "source.py"
        ignored_source.parent.mkdir()
        ignored_source.write_text("ignored = True\n")
    assert source_fingerprint(tmp_path) == ()


def test_source_tracker_coalesces_edits_until_the_quiet_interval_has_passed():
    """Rapid saves result in one generation using the final settled source state."""
    # tracker uses monotonic seconds; first_signature and later_signature are source snapshots.
    tracker = SourceChangeTracker(quiet_seconds=0.3)
    first_signature = (("serializers.py", 1, 10),)
    later_signature = (("serializers.py", 2, 11),)
    assert tracker.should_generate(first_signature, now=0.0) is False
    assert tracker.should_generate(later_signature, now=0.2) is False
    assert tracker.should_generate(later_signature, now=0.4) is False
    assert tracker.should_generate(later_signature, now=0.6) is True
    assert tracker.should_generate(later_signature, now=0.9) is False


def test_source_tracker_retries_after_a_later_edit_without_repeating_a_failed_snapshot():
    """An invalid edit is retried after correction, without a busy failure loop."""
    # tracker remembers attempted snapshots independently of whether Django accepted them.
    tracker = SourceChangeTracker(quiet_seconds=0.1)
    # invalid_signature and fixed_signature model a broken serializer followed by its fix.
    invalid_signature = (("serializers.py", 1, 10),)
    fixed_signature = (("serializers.py", 2, 12),)
    assert tracker.should_generate(invalid_signature, now=0.0) is False
    assert tracker.should_generate(invalid_signature, now=0.2) is True
    assert tracker.should_generate(invalid_signature, now=0.4) is False
    assert tracker.should_generate(fixed_signature, now=0.6) is False
    assert tracker.should_generate(fixed_signature, now=0.8) is True


@pytest.mark.parametrize("quiet_seconds", [-1, 0, float("nan"), float("inf")])
def test_source_tracker_rejects_nonpositive_quiet_intervals(quiet_seconds):
    """Invalid polling configuration must fail rather than produce a busy process."""
    # quiet_seconds is in seconds and must allow a positive source-settling interval.
    with pytest.raises(ValueError, match="positive"):
        SourceChangeTracker(quiet_seconds=quiet_seconds)


@pytest.mark.parametrize("exit_status", [0, 1])
def test_watcher_starts_a_fresh_bounded_generation_process(tmp_path, monkeypatch, exit_status):
    """Fresh imports see edited serializers rather than the watcher's cached modules."""
    # invocations records argv and process options without starting Django for this unit fixture.
    invocations = []

    def capture_generation(arguments, **options):
        """Simulate a completed standalone schema export with the requested exit status."""
        invocations.append((arguments, options))
        return SimpleNamespace(returncode=exit_status)

    monkeypatch.setattr("platform_tools.schema_watch.subprocess.run", capture_generation)
    # output_path is the explicit generated destination passed through to the child process.
    output_path = tmp_path / "openapi.json"
    assert regenerate_schema(tmp_path, output_path, timeout_seconds=15) is (exit_status == 0)
    assert invocations[0][0][1:] == [
        "manage.py",
        "generate_api_schema",
        "--output",
        str(output_path),
    ]
    assert invocations[0][1] == {"cwd": tmp_path, "check": False, "timeout": 15}


def test_watcher_reports_a_timed_out_generation_without_ending_the_process(tmp_path, monkeypatch):
    """A bounded introspection failure must leave the watcher available for a corrected edit."""

    def timed_out_generation(arguments, **_options):
        """Simulate a child whose schema introspection exceeded the allowed duration."""
        raise subprocess.TimeoutExpired(arguments, timeout=1)

    monkeypatch.setattr("platform_tools.schema_watch.subprocess.run", timed_out_generation)
    assert regenerate_schema(tmp_path, tmp_path / "openapi.json", timeout_seconds=1) is False


def test_watch_loop_generates_each_settled_edit_and_honours_cancellation(tmp_path, monkeypatch):
    """A failed settled edit and its correction are handled in one persistent watcher."""
    # stop_event belongs to this test; generations records attempts before cancellation.
    stop_event = threading.Event()
    generations = []
    # signatures and observed_times model two multi-poll source snapshots in monotonic seconds.
    signatures = iter([(("api.py", 1, 10),)] * 2 + [(("api.py", 2, 11),)] * 2)
    observed_times = iter([0.0, 0.2, 0.3, 0.5])
    monkeypatch.setattr(
        "platform_tools.schema_watch.source_fingerprint", lambda _root: next(signatures)
    )
    monkeypatch.setattr("platform_tools.schema_watch.time.monotonic", lambda: next(observed_times))

    def record_generation(source_root, output_path):
        """Fail once, then stop only after a later corrected snapshot is processed."""
        generations.append((source_root, output_path))
        if len(generations) == 2:
            stop_event.set()
            return True
        return False

    monkeypatch.setattr("platform_tools.schema_watch.regenerate_schema", record_generation)
    watch_schema(
        tmp_path,
        tmp_path / "openapi.json",
        poll_seconds=0.001,
        quiet_seconds=0.1,
        stop_event=stop_event,
    )
    assert len(generations) == 2


@pytest.mark.parametrize("poll_seconds", [0, -1, float("nan"), float("inf")])
def test_watch_loop_rejects_invalid_poll_intervals(tmp_path, poll_seconds):
    """A process configuration error must not create a tight polling loop."""
    # poll_seconds is a finite positive delay between source snapshots.
    with pytest.raises(ValueError, match="positive"):
        watch_schema(tmp_path, tmp_path / "openapi.json", poll_seconds=poll_seconds)
