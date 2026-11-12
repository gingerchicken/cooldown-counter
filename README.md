# Django + React template

Cooldown Counter product discovery is recorded in the
[user stories](2-user-stories/README.md) and
[candidate requirements](3-requirements/requirements.md), with the
[supplied design and evidence limits](docs/design/README.md). The application
below is still the imported template; these records do not claim the tracker
has been implemented.

Django, React, TypeScript, Vite, PostgreSQL, Redis, Celery, Beat, and Gunicorn.
Cloudflare Pages serves the static frontend; a Pages Function forwards `/api`
to Django. Development and every test runner run in Docker containers.

## Start development

Install Docker with Compose 2.24.4 or newer. No host Python or Node is required.

```bash
./local-dev.sh up
./local-dev.sh user
```

Open <http://localhost:5173> for Vite hot reload, or <http://localhost:8788>
for the production frontend build served by local Wrangler. Both use the real
Pages Function for API requests. The user command creates a Django superuser
interactively and keeps its password out of shell history. The default screen is
login: enter that Django username and password to open the application. There
are no preconfigured accounts or default login passwords. Existing active
Django users can sign in without superuser privileges.

If either port is occupied, use `LOCAL_DEV_PORT=5174 LOCAL_WEB_PORT=8789
./local-dev.sh up`. Use the same environment values for later commands, or copy
`.env.example` to `.env` and set them there. Existing local services are left alone.

The included example accepts a message and queues an uppercase conversion.
Each signed-in account can see only its own jobs, including after signing out
and back in. The worker writes the result
to PostgreSQL. Beat schedules a heartbeat, which the E2E tests verify through
the real broker and worker. The example demonstrates infrastructure; replace
it with your application's domain and tenant rules before exposing customer
data. Login, logout, session restoration, and API access checks are included;
self-service registration and password reset are not included.

## Daily commands

```bash
./local-dev.sh logs                  # Follow the stack
./local-dev.sh logs worker beat      # Follow background processes
./local-dev.sh django check          # Any Django management command
./local-dev.sh django makemigrations # Create migrations inside Docker
./local-dev.sh migrate               # Apply migrations
./local-dev.sh shell                 # Django shell
./local-dev.sh api-client            # Refresh schema, TypeScript, and package
./local-dev.sh down                  # Stop; retain database and broker volumes
./local-dev.sh reset --yes           # Delete this development project's data
```

`up` builds the tooling images, exports Django's OpenAPI contract, generates
and builds the frontend's API package, applies migrations, then starts the
stack. Keep <http://localhost:5173> open while editing: React and API client
TypeScript updates use Vite hot reload. Gunicorn, the Celery worker, and Beat
restart automatically when application Python changes. Local Wrangler also
reloads Pages Function and API proxy edits.

File watchers use polling by default for Docker Desktop and WSL compatibility.
Set `DEV_WATCH_POLLING=false` before starting the stack to use native file events
instead. Polling uses more CPU, so Python dependency folders, collected static
files, test files, and frontend tool output are excluded from watching.

The built frontend on port 8788 remains a production-build preview; use port 5173
for frontend hot reload. Dependency or container changes need another
`./local-dev.sh up`. Database changes still need migration generation and
`./local-dev.sh migrate`. API contract changes need `./local-dev.sh api-client`
to refresh generated types; normal API client source edits reload automatically.

## Tests

```bash
./local-dev.sh test backend
./local-dev.sh test frontend
./local-dev.sh test browser
./local-dev.sh test e2e
./local-dev.sh test deployment
./local-dev.sh test all
```

Backend checks include Ruff, pytest, Django system checks, and migration drift.
Frontend checks include ESLint, TypeScript, Vitest unit tests, the static build,
and the Pages Functions bundle. Component tests run in real browsers.
Deployment checks render staging and production, check the migration gate,
and verify the Kubernetes tree can be copied into the GitOps layout.
Playwright user stories run the complete stack in a separate Compose project,
with its own database and broker volumes and no published host ports. Cleanup
preserves the development database. Failure logs and browser reports are saved
under `frontend/test-results/` and `frontend/playwright-report/`.

Tests are described in [docs/testing.md](docs/testing.md). The GitHub workflow
runs each area and checks generated client drift before publishing an image.

## Structure and deployment

- [Architecture and boundaries](docs/architecture.md)
- [Tests and user stories](docs/testing.md)
- [Cloudflare Pages, GHCR, and GitOps deployment](docs/deployment.md)
- [Copyable staging and production overlays](deploy/k8s/README.md)
- [Agent structure guide and skills](.agents/README.md)

Python lives in `backend/`. All frontend source, dependencies, test tools,
and the generated `@template/api-client` package live in `frontend/`.
Frontend unit tests sit beside their source as `*.test.*`; real-browser
component tests use `*.browser.test.*`. ESLint rejects multiple components
in one source file, including components that are not exported.

GitHub CI builds and publishes one backend image to GHCR after the checks pass.
Gunicorn, Celery workers, Beat, and the migration Job use that image with
different commands. `deploy/k8s/` contains a shared base and self-contained
staging and production overlays for `HBH-Infra/GitOps/apps/<app>/`. Replace the
documented environment inputs, then promote a verified image digest through
GitOps. Flux reconciles that reviewed configuration; this repository does not
apply manifests or update GitOps automatically. Cloudflare publication remains
a separate manual Wrangler command documented in the deployment guide.
