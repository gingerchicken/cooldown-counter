"""Expose Celery when Django imports its application configuration package."""

from .celery import app as celery_app

# Celery's documented Django integration discovers the shared application here.
__all__ = ("celery_app",)
