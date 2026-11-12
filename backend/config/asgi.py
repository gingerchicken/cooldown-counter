"""Optional ASGI entry point for consumers extending the HTTP-only template."""

import os

from django.core.asgi import get_asgi_application

# This module is not the default image command but shares the exact application settings.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# ASGI servers can import this callable without altering Django's domain code.
application = get_asgi_application()
