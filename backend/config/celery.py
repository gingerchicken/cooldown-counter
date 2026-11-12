"""Configure the worker and Beat from the same Django settings as Gunicorn."""

import os

from celery import Celery

# CLI workers need the same settings module even outside Django's manage.py entry point.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# One application owns task registration for all process roles in the shared image.
app = Celery("django_template")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
