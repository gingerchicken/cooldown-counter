"""Gunicorn entry point used by the shared backend runtime image."""

import os

from django.core.wsgi import get_wsgi_application

# Explicit settings keep this entry point equivalent to manage.py and worker startup.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Gunicorn imports this callable once per worker process.
application = get_wsgi_application()
