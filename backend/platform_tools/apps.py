"""Register enduring management commands without adding application data models."""

from django.apps import AppConfig


class PlatformToolsConfig(AppConfig):
    """Expose schema tooling independently of the removable background-jobs demo."""

    # name is the import path Django uses to discover this app's management commands.
    name = "platform_tools"
