"""Export the backend contract without importing Node into the Python image."""

from django.conf import settings
from django.core.management import BaseCommand, call_command


class Command(BaseCommand):
    """Regenerate the checked-in OpenAPI contract consumed by the TypeScript package."""

    # The root Docker script runs frontend generation immediately after this command.
    help = "Export a validated OpenAPI JSON schema for the generated TypeScript package"

    def add_arguments(self, parser):
        """Allow CI to render elsewhere and compare without changing committed files."""
        # parser is Django's CLI parser; --output allows a temporary schema drift-check path.
        parser.add_argument("--output", default=str(settings.BASE_DIR / "openapi.json"))

    def handle(self, *args, **options):
        """Write deterministic JSON beneath backend/, keeping Python output self-contained."""
        # options supplies the chosen output; args is unused but retained for Django's protocol.
        # drf-spectacular validates schema semantics before CI checks generated-file drift.
        call_command(
            "spectacular",
            file=options["output"],
            format="openapi-json",
            validate=True,
            fail_on_warn=True,
        )
