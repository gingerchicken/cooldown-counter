"""Offer the schema watcher as an explicit management command for valid projects."""

from pathlib import Path

from django.conf import settings
from django.core.management import BaseCommand

from platform_tools.schema_watch import watch_schema


class Command(BaseCommand):
    """Use the shared watcher while standalone Docker startup tolerates import failures."""

    # System checks belong to each fresh generation child, not the long-lived watcher parent.
    requires_system_checks = []
    # help explains that the command refreshes the backend input, not Node package output.
    help = "Watch Python API sources and regenerate the validated OpenAPI contract"

    def add_arguments(self, parser):
        """Accept the same output and timing options as the standalone development service."""
        # parser owns CLI values; intervals are validated by the common watcher helper.
        parser.add_argument("--output", default=str(settings.BASE_DIR / "openapi.json"))
        parser.add_argument("--poll-seconds", type=float, default=0.5)
        parser.add_argument("--quiet-seconds", type=float, default=0.3)

    def handle(self, *args, **options):
        """Watch using fresh generation subprocesses rather than cached serializer imports."""
        # options retains Django's CLI protocol; source root is the configured Python boundary.
        watch_schema(
            settings.BASE_DIR,
            Path(options["output"]).resolve(),
            poll_seconds=options["poll_seconds"],
            quiet_seconds=options["quiet_seconds"],
        )
