"""Isolated test settings do not require deployment secrets or a live broker."""

import os

# Set the harmless test secret before importing the fail-closed production configuration.
os.environ.setdefault("DJANGO_SECRET_KEY", "test-only-secret-never-use-in-deployment")

from .settings import *  # noqa: E402,F403

# ALLOWED_HOSTS permits Django's synthetic test host plus local probe hostnames.
ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]
# Both SECURE settings allow HTTP test cookies; production defaults remain enabled separately.
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
# PASSWORD_HASHERS uses a fast test-only implementation; it must never be used for real users.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
