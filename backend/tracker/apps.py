"""Register the tracker without seeding demo identities or histories."""

from django.apps import AppConfig


class TrackerConfig(AppConfig):
    """Keep tracker metadata independent of Django's authentication application."""

    # Django supplies integer identities only for the deliberately small child rows.
    default_auto_field = "django.db.models.BigAutoField"
    # The import path owns models, services and API code beneath the Python boundary.
    name = "tracker"
