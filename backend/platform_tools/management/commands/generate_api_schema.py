"""Export a validated public contract without coupling tooling to a domain app."""

from pathlib import Path

from django.conf import settings
from django.core.management import BaseCommand, call_command

from platform_tools.schema_export import export_schema_atomically


class Command(BaseCommand):
    """Atomically refresh the OpenAPI input used by the TypeScript client package."""

    # help describes the supported explicit generation command in manage.py help.
    help = "Export a validated OpenAPI schema without replacing valid output on failure"

    def add_arguments(self, parser):
        """Accept an alternate output path for temporary CI and tool-validation runs."""
        # parser owns CLI validation; --output defaults to the checked-in backend contract.
        parser.add_argument("--output", default=str(settings.BASE_DIR / "openapi.json"))

    def handle(self, *args, **options):
        """Validate a private schema and publish it only after successful generation."""
        # destination is public generated source; args are retained for Django's command protocol.
        destination = Path(options["output"])

        def render_validated_schema(temporary_path: Path) -> None:
            """Use spectacular's strict gate before the accepted contract can change."""
            # temporary_path stays private until validation and warnings checks complete.
            call_command(
                "spectacular",
                file=str(temporary_path),
                format="openapi-json",
                validate=True,
                fail_on_warn=True,
            )

        # changed is useful diagnostics without causing schema timestamps to move needlessly.
        changed = export_schema_atomically(destination, render_validated_schema)
        self.stdout.write("API schema updated." if changed else "API schema unchanged.")
