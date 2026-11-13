"""Watch backend Python edits using fresh Django generation processes.

The standalone entry point deliberately imports no Django modules. It remains
alive when an edited model, serializer or settings module cannot be imported,
then retries generation after a later source correction.
"""

import argparse
import math
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

# IGNORED_SOURCE_DIRECTORIES exclude tools and tests that cannot change the public API.
IGNORED_SOURCE_DIRECTORIES = frozenset({".venv", "__pycache__", "tests", "staticfiles"})


def source_fingerprint(source_root: Path) -> tuple[tuple[str, int, int], ...]:
    """Return a stable Python-source signature while ignoring generated contracts."""
    # fingerprints contain relative path, modification nanoseconds and byte length for each source.
    fingerprints = []
    for source_path in source_root.rglob("*.py"):
        # relative_path is also the directory-boundary filter, not a substring match on filenames.
        relative_path = source_path.relative_to(source_root)
        if any(part in IGNORED_SOURCE_DIRECTORIES for part in relative_path.parts):
            # Cache, test and environment writes must not retrigger contract generation.
            continue
        try:
            # source_metadata can disappear during an editor's atomic save or file removal.
            source_metadata = source_path.stat()
        except FileNotFoundError:
            # The next polling snapshot will reflect the completed editor operation.
            continue
        fingerprints.append(
            (str(relative_path), source_metadata.st_mtime_ns, source_metadata.st_size)
        )
    return tuple(sorted(fingerprints))


class SourceChangeTracker:
    """Coalesce repeated source saves into one generation after a quiet interval."""

    def __init__(self, quiet_seconds: float = 0.3):
        """Set a positive source-settling interval measured in monotonic seconds."""
        # quiet_seconds is a delay rather than an API response or user-visible freshness target.
        if not math.isfinite(quiet_seconds) or quiet_seconds <= 0:
            raise ValueError("quiet_seconds must be positive")
        # _quiet_seconds, _signature, _changed_at and _pending belong to this single watcher.
        self._quiet_seconds = quiet_seconds
        self._signature = None
        self._changed_at = 0.0
        self._pending = False

    def should_generate(self, signature: tuple, *, now: float) -> bool:
        """Claim each settled snapshot once, including one initial startup export."""
        # signature is the current source state; now must come from a monotonic clock.
        if signature != self._signature:
            # Restart the quiet interval so a multi-file save generates from its final state.
            self._signature = signature
            self._changed_at = now
            self._pending = True
        if self._pending and now - self._changed_at >= self._quiet_seconds:
            # A failed attempt is not retried until source changes, avoiding an error busy loop.
            self._pending = False
            return True
        return False


def regenerate_schema(source_root: Path, output_path: Path, *, timeout_seconds: float = 60) -> bool:
    """Start a fresh Django process so serializer and model imports reflect current source."""
    try:
        # generation is bounded so an unexpected schema introspection cannot stall watching forever.
        generation = subprocess.run(
            [sys.executable, "manage.py", "generate_api_schema", "--output", str(output_path)],
            cwd=source_root,
            check=False,
            timeout=timeout_seconds,
        )
    except subprocess.TimeoutExpired:
        # The subprocess was terminated; a subsequent code edit can initiate a fresh attempt.
        print("API schema generation timed out; watching for another source edit.", flush=True)
        return False
    if generation.returncode != 0:
        # The last accepted OpenAPI file remains valid because the export command is atomic.
        print("API schema generation failed; watching for a source correction.", flush=True)
        return False
    return True


def watch_schema(
    source_root: Path,
    output_path: Path,
    *,
    poll_seconds: float = 0.5,
    quiet_seconds: float = 0.3,
    stop_event: threading.Event | None = None,
) -> None:
    """Poll portable source metadata and run serial exports until cancellation.

    Polling works on Docker Desktop and WSL mounts without an extra filesystem
    watcher dependency. A change during export is noticed on the next snapshot,
    so no concurrent generation subprocesses can overwrite one another.
    """
    # poll_seconds is a positive sleep interval; stop_event belongs to the process entry point.
    if not math.isfinite(poll_seconds) or poll_seconds <= 0:
        raise ValueError("poll_seconds must be positive")
    stop_event = stop_event or threading.Event()
    # tracker owns debounce state for this source tree and emits at most one claim per snapshot.
    tracker = SourceChangeTracker(quiet_seconds)
    while not stop_event.is_set():
        # Each snapshot is observed after the previous bounded generation process has finished.
        if tracker.should_generate(source_fingerprint(source_root), now=time.monotonic()):
            regenerate_schema(source_root, output_path)
        stop_event.wait(poll_seconds)


def main() -> None:
    """Run without Django setup, retaining the watcher through invalid application edits."""
    # parser holds development-only paths and polling configuration, not deployment credentials.
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--poll-seconds", type=float, default=0.5)
    parser.add_argument("--quiet-seconds", type=float, default=0.3)
    # arguments are resolved once so the loop does not depend on the caller's changing cwd.
    arguments = parser.parse_args()
    # source_root and output_path identify watched Python source and its separate JSON output.
    source_root = arguments.source_root.resolve()
    output_path = (arguments.output or source_root / "openapi.json").resolve()
    # stop_event lets container signals interrupt the polling wait without a forced exit.
    stop_event = threading.Event()

    def request_stop(_signal_number, _frame) -> None:
        """Request graceful shutdown after any current bounded generation finishes."""
        stop_event.set()

    # Only the standalone process owns signal handlers; library callers provide their own event.
    signal.signal(signal.SIGTERM, request_stop)
    signal.signal(signal.SIGINT, request_stop)
    watch_schema(
        source_root,
        output_path,
        poll_seconds=arguments.poll_seconds,
        quiet_seconds=arguments.quiet_seconds,
        stop_event=stop_event,
    )


if __name__ == "__main__":
    # The module entry avoids loading Django before the persistent watch loop is ready.
    main()
