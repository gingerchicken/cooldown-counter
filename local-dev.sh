#!/usr/bin/env bash
# Keep development, code generation, and every test runner inside Docker containers.
set -euo pipefail

# Resolve the checkout once so commands also work when invoked from another directory.
PROJECT_ROOT="$(CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Match the checkout owner for schema generation and Python tool output on Linux.
LOCAL_UID="$(id -u)"
LOCAL_GID="$(id -g)"
export LOCAL_UID LOCAL_GID

# Each test subshell derives its project name without changing the development project.
TEST_PROJECT_PREFIX="${COMPOSE_PROJECT_NAME:-django-template}"

if ! docker compose version >/dev/null 2>&1; then
  # Compose supports dependency health checks and the E2E overlay's !reset tag.
  printf '%s\n' 'Docker with Compose 2.24.4 or newer is required.' >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  # Report a stopped engine before attempting lengthy image builds.
  printf '%s\n' 'Start the Docker engine before running this script.' >&2
  exit 1
fi

# Rootless Docker maps the host checkout owner to container root, not the same numeric UID.
# Only writable tooling adopts that mapped identity; application runtime images stay unprivileged.
case "$(docker info --format '{{json .SecurityOptions}}')" in
  *name=rootless*)
    # Browser reports share host mounts too; namespace root maps to their actual checkout owner.
    LOCAL_UID=0; LOCAL_GID=0; BROWSER_TEST_USER=root
    export LOCAL_UID LOCAL_GID BROWSER_TEST_USER
    ;;
esac

## Run the development Compose project from its fixed configuration file.
compose() {
  # Absolute configuration paths keep caller working directories irrelevant.
  docker compose -f "$PROJECT_ROOT/compose.yaml" "$@"
}

## Bring the persistent Node dependency volume in line with the checkout owner and lockfile.
prepare_frontend_tools() {
  # Image builds do not replace a named volume left over from an earlier dependency graph.
  compose build frontend-test
  # Change only dependency storage, without following workspace links into source files.
  compose run --rm --no-deps --user root frontend-test \
    chown -hR "$LOCAL_UID:$LOCAL_GID" /app/frontend/node_modules
  compose run --rm --no-deps frontend-test npm ci
}

## Build and regenerate the backend contract and the frontend-owned TypeScript package.
generate_client() {
  # Explicit services build test tooling without starting runtime dependencies.
  compose build backend-test
  prepare_frontend_tools
  compose run --rm --no-deps backend-test python manage.py generate_api_schema
  compose run --rm --no-deps frontend-test npm run api:generate
  compose run --rm --no-deps frontend-test npm run api:build
}

## Capture logs and remove only resources belonging to the current isolated test project.
cleanup_tests() {
  # Preserve the original test exit status even if artifact collection or teardown fails.
  local test_exit_status="$?"
  trap - EXIT
  mkdir -p "$PROJECT_ROOT/frontend/test-results"
  docker compose -f "$PROJECT_ROOT/compose.yaml" -f "$PROJECT_ROOT/compose.e2e.yaml" \
    logs --no-color > "$PROJECT_ROOT/frontend/test-results/docker-compose.log" 2>&1 || true
  docker compose -f "$PROJECT_ROOT/compose.yaml" -f "$PROJECT_ROOT/compose.e2e.yaml" \
    down --volumes --remove-orphans >/dev/null 2>&1 || true
  exit "$test_exit_status"
}

## Run backend checks against a separate database project, never development volumes.
test_backend() (
  # Process ID suffixes allow independent local and CI runs on the same Docker engine.
  # This exported override deliberately ends with the test subshell.
  # shellcheck disable=SC2030,SC2031
  export COMPOSE_PROJECT_NAME="${TEST_PROJECT_PREFIX}-backend-test-$$"
  trap cleanup_tests EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
  compose build backend-test
  compose run --rm backend-test ruff check .
  compose run --rm --no-deps backend-test ruff format --check .
  # Create report storage as the same mapped tool user that writes coverage and JUnit evidence.
  compose run --rm --no-deps backend-test mkdir -p test-results
  compose run --rm --no-deps backend-test pytest --cov --cov-branch --cov-report=term-missing --cov-report=xml \
    --junitxml=test-results/backend.xml
  compose run --rm --no-deps backend-test python manage.py check
  compose run --rm --no-deps backend-test python manage.py makemigrations --check --dry-run
)

## Check frontend types, lint rules, package transport, and colocated unit tests.
test_frontend() (
  # Tests need a separate dependency volume so npm ci cannot interrupt a running Vite server.
  # This exported override deliberately ends with the test subshell.
  # shellcheck disable=SC2030,SC2031
  export COMPOSE_PROJECT_NAME="${TEST_PROJECT_PREFIX}-frontend-test-$$"
  trap cleanup_tests EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
  # Browser tooling uses the same locked dependencies as the application build.
  prepare_frontend_tools
  # Source mounts hide package output baked into the image, including on a fresh checkout.
  compose run --rm --no-deps frontend-test npm run api:generate
  compose run --rm --no-deps frontend-test npm run api:build
  compose run --rm --no-deps frontend-test npm run test:tooling
  compose run --rm --no-deps frontend-test npm run lint
  compose run --rm --no-deps frontend-test npm run typecheck
  compose run --rm --no-deps frontend-test npm run test:unit
  compose run --rm --no-deps frontend-test npm run build
  compose run --rm --no-deps frontend-test npm run pages:build
)

## Make disposable browser reports writable across Docker user mappings and earlier test runs.
prepare_browser_artifacts() {
  # Only ignored test output is shared; application source and persistent databases are excluded.
  mkdir -p "$PROJECT_ROOT/frontend/test-results" "$PROJECT_ROOT/frontend/playwright-report" \
    "$PROJECT_ROOT/frontend/coverage/browser"
  # Match host ownership and let the image's distinct browser UID refresh these disposable reports.
  # Positional UID/GID values expand inside the container shell, not in this outer runner.
  # shellcheck disable=SC2016
  compose run --rm --no-deps --user root e2e sh -c '
    chown -R "$1:$2" /app/frontend/test-results /app/frontend/playwright-report /app/frontend/coverage
    chmod -R a+rwX /app/frontend/test-results /app/frontend/playwright-report /app/frontend/coverage
  ' sh "$LOCAL_UID" "$LOCAL_GID"
}

## Exercise components in real browsers using the dedicated Playwright image.
test_browser() {
  # OS libraries and browser binaries come from the image rather than the host.
  compose build e2e
  prepare_browser_artifacts
  compose run --rm --no-deps e2e npm run test:browser
}

## Validate both environment overlays and their copied GitOps release contracts without a cluster.
test_deployment() (
  # This project keeps the PostgreSQL lock proof separate from the development database.
  # shellcheck disable=SC2030,SC2031
  export COMPOSE_PROJECT_NAME="${TEST_PROJECT_PREFIX}-deployment-test-$$"
  trap cleanup_tests EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
  compose build backend-test
  mkdir -p "$PROJECT_ROOT/test-artifacts/kubernetes"
  # Prepare an independent apps/ and clusters/ tree plus a pinned upstream CSI schema in Docker.
  compose run --rm --no-deps \
    -v "$PROJECT_ROOT/deploy/k8s:/deployment-source:ro" \
    -v "$PROJECT_ROOT/test-artifacts/kubernetes:/deployment-artifacts" \
    backend-test python tests/deployment/prepare_fixture.py \
    /deployment-source /deployment-artifacts
  # environment selects source, copied-cluster and synthetic release renders independently.
  local environment
  for environment in staging production; do
    docker run --rm -v "$PROJECT_ROOT/deploy/k8s:/work:ro" \
      registry.k8s.io/kubectl:v1.34.1 kustomize "/work/$environment" \
      > "$PROJECT_ROOT/test-artifacts/kubernetes/$environment.yaml"
    docker run --rm -v "$PROJECT_ROOT/test-artifacts/kubernetes:/work:ro" \
      registry.k8s.io/kubectl:v1.34.1 kustomize "/work/gitops/clusters/$environment" \
      > "$PROJECT_ROOT/test-artifacts/kubernetes/copied-$environment.yaml"
    docker run --rm -v "$PROJECT_ROOT/test-artifacts/kubernetes:/work:ro" \
      registry.k8s.io/kubectl:v1.34.1 kustomize "/work/release-fixture/$environment" \
      > "$PROJECT_ROOT/test-artifacts/kubernetes/release-$environment.yaml"
    # Custom resources are checked against the pinned CSI schema, never silently skipped.
    docker run --rm -v "$PROJECT_ROOT/test-artifacts/kubernetes:/work:ro" \
      ghcr.io/yannh/kubeconform:v0.7.0 -strict -summary -kubernetes-version 1.34.0 \
      -schema-location default -schema-location '/work/schemas/{{.ResourceKind}}.json' \
      "/work/$environment.yaml"
  done
  # PostgreSQL sessions prove lock exclusion; rendered manifests prove every workload's release gate.
  compose run --rm \
    -v "$PROJECT_ROOT/test-artifacts/kubernetes:/deployment-artifacts:ro" \
    -e KUBERNETES_ARTIFACTS=/deployment-artifacts \
    backend-test pytest tests/test_kubernetes.py tests/test_deployment_operations.py
)

## Run user stories against PostgreSQL, Redis, Gunicorn, Celery, Beat, and Pages.
test_e2e() (
  # An isolated, port-free stack can run while the user's development stack is open.
  # This exported override deliberately ends with the test subshell.
  # shellcheck disable=SC2030,SC2031
  export COMPOSE_PROJECT_NAME="${TEST_PROJECT_PREFIX}-e2e-$$"
  trap cleanup_tests EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
  docker compose -f compose.yaml -f compose.e2e.yaml build backend web e2e
  prepare_browser_artifacts
  docker compose -f compose.yaml -f compose.e2e.yaml up --detach --wait --wait-timeout 240 web worker beat
  # Generate credentials inside Docker and pass them by environment, never into logs or defaults.
  # E2E_PASSWORD exists only for this isolated stack and disappears when its database is removed.
  E2E_PASSWORD="$(docker compose -f compose.yaml -f compose.e2e.yaml run --rm --no-deps migrate \
    python -c 'import secrets; print(secrets.token_urlsafe(32))')"
  export E2E_PASSWORD
  # Ordinary accounts cover both worker slots and cross-account isolation without admin privileges.
  docker compose -f compose.yaml -f compose.e2e.yaml run --rm --no-deps -e E2E_PASSWORD migrate \
    python manage.py shell -c '
import os
from django.contrib.auth import get_user_model
# Each worker has separate primary and secondary accounts so parallel stories cannot mix history.
for worker_index in range(2):
    for account_role in ("worker", "other"):
        # Credentials are valid only in this disposable test database.
        get_user_model().objects.create_user(
            username=f"e2e-{account_role}-{worker_index}",
            password=os.environ["E2E_PASSWORD"],
        )
'
  # Pass explicit Playwright options as argv, preserving quoting without shell evaluation.
  docker compose -f compose.yaml -f compose.e2e.yaml run --rm --no-deps -e E2E_PASSWORD e2e \
    npm run test:e2e -- "$@"
)

## Describe the supported entry points without requiring host language runtimes.
usage() {
  # Commands intentionally separate local development from production publication.
  cat <<'USAGE'
Usage: ./local-dev.sh [command]

  up                       Build, generate the API client, migrate, and start with HMR
  down                     Stop development containers and retain their database
  logs [service...]        Follow development service logs
  user [Django options]    Interactively create a Django superuser
  operator --username NAME Create an ordinary Django operator using hidden password prompts
  django [arguments...]    Run a Django management command in the backend container
  shell                    Open the Django shell in the backend container
  migrate                  Apply Django migrations in the backend container
  api-client               Regenerate OpenAPI, TypeScript types, and client package
  test backend             Backend lint, format, unit/API tests, and migration checks
  test frontend            Frontend lint, types, unit tests, build, and Pages bundle
  test browser             Component tests in real browsers
  test deployment          Render and validate portable staging/production GitOps overlays
  test e2e [options...]    Full Docker stack; optional Playwright arguments select diagnostics
  test all                 Run every test category
  reset --yes              Delete ONLY this development project's containers and data
  help                     Show these commands

Docker with Compose 2.24.4+ is the only host prerequisite.
Use LOCAL_WEB_PORT, LOCAL_DEV_PORT, and COMPOSE_PROJECT_NAME to avoid local conflicts.
USAGE
}

# An omitted command starts development; all remaining arguments belong to that command.
development_command="${1:-up}"
if [ "$#" -gt 0 ]; then
  # Forward user-management flags and management-command arguments without shell evaluation.
  shift
fi

case "$development_command" in
  up)
    # The Python schema and frontend package are refreshed before application images build.
    generate_client
    # Development-only contract watchers are excluded from production-shaped E2E stacks.
    compose --profile development up --build --detach --wait --wait-timeout 240
    printf 'Development app: http://%s\n' "$(compose port vite 5173)"
    printf 'Built Pages app: http://%s\n' "$(compose port web 8788)"
    ;;
  down)
    # Include development-only contract watchers in the normal shutdown boundary.
    compose --profile development down
    ;;
  logs) compose logs --follow "$@" ;;
  user) compose exec backend python manage.py createsuperuser "$@" ;;
  operator)
    # Operator provisioning needs no global administrator role or password argument.
    compose run --rm --no-deps backend-test python manage.py create_operator "$@"
    ;;
  django)
    # Tooling has a writable source mount for commands such as makemigrations.
    compose run --rm --no-deps backend-test python manage.py "$@"
    ;;
  shell) compose exec backend python manage.py shell ;;
  migrate) compose exec backend python manage.py migrate ;;
  api-client) generate_client ;;
  test)
    # Select suites explicitly so failed checks stop the command with a nonzero exit status.
    case "${1:-all}" in
      backend) test_backend ;;
      frontend) test_frontend ;;
      browser) test_browser ;;
      deployment) test_deployment ;;
      e2e) test_e2e "${@:2}" ;;
      all) test_backend; test_frontend; test_browser; test_deployment; test_e2e ;;
      *) usage >&2; exit 2 ;;
    esac
    ;;
  reset)
    # Require the caller's explicit deletion flag; normal shutdown always retains data.
    if [ "${1:-}" != "--yes" ]; then
      printf '%s\n' 'Use ./local-dev.sh reset --yes to delete local development data.' >&2
      exit 2
    fi
    compose down --volumes --remove-orphans
    ;;
  help|--help|-h) usage ;;
  *) usage >&2; exit 2 ;;
esac
