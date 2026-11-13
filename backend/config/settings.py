"""Environment-based Django settings shared by API, workers, and scheduler.

Production requires an explicit secret key. Forwarded host and protocol headers are
trusted only because the documented ingress boundary strips client-supplied values.
"""

import os
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured


def environment_boolean(name: str, default: bool = False) -> bool:
    """Read environment variable name, using default only when it is absent.

    Invalid strings raise ImproperlyConfigured rather than weakening a security control.
    """
    # configured_value is the normalized string; explicit spellings avoid truthy surprises.
    configured_value = os.environ.get(name, str(default)).strip().lower()
    if configured_value not in {"true", "false", "1", "0"}:
        # Failing during startup is safer than silently disabling a security setting.
        raise ImproperlyConfigured(f"{name} must be true, false, 1, or 0")
    return configured_value in {"true", "1"}


def environment_list(name: str, default: str = "") -> list[str]:
    """Read environment variable name, falling back to the comma-separated default."""
    # Each entry is one raw CSV segment; trimmed blanks have no allowlist meaning.
    return [entry.strip() for entry in os.environ.get(name, default).split(",") if entry.strip()]


# BASE_DIR is the Python boundary, used for local SQLite and generated schema paths.
BASE_DIR = Path(__file__).resolve().parent.parent

# DEBUG enables local diagnostics only; SECRET_KEY signs sessions and must be private in production.
DEBUG = environment_boolean("DJANGO_DEBUG")
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "")
if not SECRET_KEY:
    # Local Docker enables DEBUG explicitly, while production fails before serving requests.
    if not DEBUG:
        raise ImproperlyConfigured("Set DJANGO_SECRET_KEY when DJANGO_DEBUG is false")
    # This public SECRET_KEY fallback is only reachable after explicit local debug opt-in.
    SECRET_KEY = "development-only-change-this-key-before-deployment"

# ALLOWED_HOSTS limits public hostnames accepted from the trusted Pages proxy.
ALLOWED_HOSTS = environment_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,[::1]")
# CSRF_TRUSTED_ORIGINS lists exact frontend origins allowed to make protected writes.
CSRF_TRUSTED_ORIGINS = environment_list("DJANGO_CSRF_TRUSTED_ORIGINS")
# USE_X_FORWARDED_HOST selects Pages' validated public host instead of the backend hostname.
USE_X_FORWARDED_HOST = True
# SECURE_PROXY_SSL_HEADER maps the trusted proxy's HTTPS marker to Django's secure-request state.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Framework apps supply sessions, user administration, and persistent Beat schedules.
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "drf_spectacular",
    "django_celery_beat",
    # Tracker owns tenant-scoped cooldown evidence; platform tools own schema generation.
    "tracker",
    "platform_tools",
    "jobs",
]

# CSRF remains enabled globally, and API dispatch adds protection for anonymous DRF writes.
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ROOT_URLCONF selects Python API and operator routes, not frontend application routing.
ROOT_URLCONF = "config.urls"
# TEMPLATES enables only Django's admin templates; the product UI lives in frontend/.
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]
# WSGI_APPLICATION is Gunicorn's callable; ASGI_APPLICATION is the optional async server callable.
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# SQLite is a convenience for isolated Python tests; Docker and deployment use PostgreSQL.
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=60,
        conn_health_checks=True,
    )
}

# Standard validators keep interactively created Django users from using weak passwords.
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# LANGUAGE_CODE sets framework messages to British English.
LANGUAGE_CODE = "en-gb"
# TIME_ZONE aligns database timestamps and Beat's scheduler clock to UTC.
TIME_ZONE = "UTC"
# USE_I18N allows translation of Django's built-in messages.
USE_I18N = True
# USE_TZ keeps stored datetimes timezone-aware rather than assuming server local time.
USE_TZ = True
# DEFAULT_AUTO_FIELD gives models 64-bit integer IDs unless they define their own primary key.
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# STATIC_URL is the admin asset URL prefix; STATIC_ROOT is its collected directory in the image.
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
# Manifest storage serves versioned admin assets from the same image as the Python API.
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# SESSION_COOKIE_SECURE and CSRF_COOKIE_SECURE require HTTPS outside explicit local debug.
SESSION_COOKIE_SECURE = environment_boolean("DJANGO_SECURE_COOKIES", not DEBUG)
CSRF_COOKIE_SECURE = SESSION_COOKIE_SECURE
# Both HTTPONLY settings hide cookie values from scripts; the SDK obtains a masked token as JSON.
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
# Both SAMESITE settings reject normal cross-site cookie use while permitting top-level navigation.
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
# SECURE_SSL_REDIRECT is opt-in because production HTTPS normally terminates at the ingress.
SECURE_SSL_REDIRECT = environment_boolean("DJANGO_SECURE_SSL_REDIRECT")
# NOSNIFF prevents guessed content types; X_FRAME_OPTIONS blocks embedding the backend in frames.
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Browser sessions authenticate application APIs; public auth and probe views opt out explicitly.
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
}

# The schema is the sole source for the generated TypeScript client contract.
SPECTACULAR_SETTINGS = {
    "TITLE": "Cooldown Counter API",
    "DESCRIPTION": (
        "Django sessions, permission-scoped fleets, cooldown evidence and policy versions."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    # These endpoints validate explicit request serializers, including required revision tokens.
    # DRF's automatic PATCH optionalization would otherwise misstate their runtime contracts.
    "COMPONENT_SPLIT_PATCH": False,
    # Distinct account, calendar and job states need stable generated names rather than hashes.
    "ENUM_NAME_OVERRIDES": {
        "AccountStatusEnum": ["active", "clear", "clean"],
        "CalendarStatusEnum": ["all", "active", "clear"],
        "JobStatusEnum": ["pending", "running", "succeeded", "failed"],
    },
}

# CELERY_BROKER_URL selects Redis for dispatch; application database rows own durable results.
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
# ACCEPT_CONTENT and both SERIALIZER settings restrict message and result encoding to JSON.
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
# IGNORE_RESULT avoids an unnecessary broker result store; Job rows are the polling contract.
CELERY_TASK_IGNORE_RESULT = True
# ACKS_LATE defers acknowledgement until work returns, so task handlers must tolerate redelivery.
CELERY_TASK_ACKS_LATE = True
# PREFETCH_MULTIPLIER limits reservations to one task per worker slot for fairer dispatch.
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
# CONNECTION_RETRY_ON_STARTUP lets workers survive a temporarily unavailable broker on startup.
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
# CELERY_TIMEZONE matches Django storage; BEAT_SCHEDULER stores periodic state in PostgreSQL.
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

# BEAT_INTERVAL_SECONDS is a positive duration; E2E overrides it to avoid a production-minute wait.
BEAT_INTERVAL_SECONDS = float(os.environ.get("BEAT_INTERVAL_SECONDS", "60"))
if BEAT_INTERVAL_SECONDS <= 0:
    # Invalid scheduler intervals should fail loudly rather than busy-loop in production.
    raise ImproperlyConfigured("BEAT_INTERVAL_SECONDS must be greater than zero")
# CELERY_BEAT_SCHEDULE seeds the DB scheduler with the registered heartbeat task and interval.
CELERY_BEAT_SCHEDULE = {
    "record-heartbeat": {
        "task": "jobs.tasks.record_heartbeat",
        "schedule": BEAT_INTERVAL_SECONDS,
    }
}

# Console output is collected by Docker and Kubernetes; no process writes application logfiles.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": os.environ.get("LOG_LEVEL", "INFO")},
}
