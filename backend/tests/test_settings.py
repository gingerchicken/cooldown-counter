"""Configuration errors must fail during startup instead of silently weakening security."""

import os
import subprocess
import sys

import pytest
from django.core.exceptions import ImproperlyConfigured

from config.settings import BASE_DIR, environment_boolean, environment_list


@pytest.mark.parametrize("configured_value", ["yes", "FALSEE", "", "2"])
def test_invalid_boolean_is_rejected(monkeypatch, configured_value):
    """monkeypatch supplies each invalid configured_value without changing later tests."""
    # This setting name is isolated from the process's real Django configuration.
    monkeypatch.setenv("TEST_TEMPLATE_BOOLEAN", configured_value)
    # Reject invalid syntax at startup instead of interpreting it as a disabled control.
    with pytest.raises(ImproperlyConfigured, match="must be true, false, 1, or 0"):
        environment_boolean("TEST_TEMPLATE_BOOLEAN")


def test_csv_allowlist_ignores_surrounding_whitespace_and_empty_entries(monkeypatch):
    """monkeypatch supplies a messy allowlist while restoring the environment afterward."""
    # The parser preserves exact nonblank host entries while discarding meaningless blanks.
    monkeypatch.setenv("TEST_TEMPLATE_LIST", "localhost, , example.test, ")
    assert environment_list("TEST_TEMPLATE_LIST") == ["localhost", "example.test"]


def test_production_without_secret_fails_closed():
    """An image must not start production using a bundled fallback secret."""
    # production_environment copies the process environment, then removes any test-secret fallback.
    production_environment = os.environ.copy()
    production_environment.pop("DJANGO_SECRET_KEY", None)
    production_environment["DJANGO_SETTINGS_MODULE"] = "config.settings"
    production_environment["DJANGO_DEBUG"] = "false"
    # startup captures exit status and stderr without printing private environment values.
    startup = subprocess.run(
        [sys.executable, "manage.py", "check"],
        cwd=BASE_DIR,
        env=production_environment,
        capture_output=True,
        text=True,
        check=False,
    )
    assert startup.returncode != 0
    assert "Set DJANGO_SECRET_KEY when DJANGO_DEBUG is false" in startup.stderr


def test_debug_without_secret_is_explicitly_supported():
    """The local Docker path works without making the development fallback a production default."""
    # development_environment opts into local debug without inheriting the test secret.
    development_environment = os.environ.copy()
    development_environment.pop("DJANGO_SECRET_KEY", None)
    development_environment["DJANGO_SETTINGS_MODULE"] = "config.settings"
    development_environment["DJANGO_DEBUG"] = "true"
    # startup records whether the same Django command used in local containers accepts debug mode.
    startup = subprocess.run(
        [sys.executable, "manage.py", "check"],
        cwd=BASE_DIR,
        env=development_environment,
        capture_output=True,
        text=True,
        check=False,
    )
    assert startup.returncode == 0, startup.stderr


def test_nonpositive_beat_interval_fails_during_startup():
    """A bad interval must not turn Beat into an accidental busy loop."""
    # invalid_environment carries a zero-second interval into a fresh, uncached settings import.
    invalid_environment = os.environ.copy()
    invalid_environment["DJANGO_SETTINGS_MODULE"] = "config.settings"
    invalid_environment["BEAT_INTERVAL_SECONDS"] = "0"
    # startup captures the expected failure and identifies the deployment variable to correct.
    startup = subprocess.run(
        [sys.executable, "manage.py", "check"],
        cwd=BASE_DIR,
        env=invalid_environment,
        capture_output=True,
        text=True,
        check=False,
    )
    assert startup.returncode != 0
    assert "BEAT_INTERVAL_SECONDS must be greater than zero" in startup.stderr
