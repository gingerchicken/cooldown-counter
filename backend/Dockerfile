# syntax=docker/dockerfile:1

# Both test and production roles use the same Python minor and locked dependency graph.
FROM python:3.13-slim-bookworm AS base
COPY --from=ghcr.io/astral-sh/uv:0.13.7 /uv /uvx /usr/local/bin/
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_CACHE_DIR=/tmp/uv-cache \
    PATH="/opt/venv/bin:$PATH"
WORKDIR /app/backend

# A fixed unprivileged identity works with Kubernetes runAsNonRoot and read-only roots.
RUN groupadd --gid 10001 app && useradd --uid 10001 --gid app --create-home app
COPY pyproject.toml uv.lock ./

# Development contains verification tools but is never the image published for deployment.
FROM base AS development
RUN uv sync --frozen --no-install-project
COPY --chown=app:app . .
# Admin CSS is part of the image; application frontend assets are deployed separately to Pages.
RUN DJANGO_DEBUG=true python manage.py collectstatic --noinput
USER app
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--access-logfile", "-", "--error-logfile", "-"]

# The single production image runs Gunicorn, a Celery worker, Beat, or migrations by command.
FROM base AS runtime
RUN uv sync --frozen --no-dev --no-install-project
COPY --chown=app:app . .
# A build-only debug flag permits collectstatic without embedding deployment credentials.
RUN DJANGO_DEBUG=true python manage.py collectstatic --noinput
USER app
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--access-logfile", "-", "--error-logfile", "-"]
