# Test strategy

All supported commands run their test tools in containers. The host only needs
Docker Compose. Run `./local-dev.sh test all` for the full local gate. The same
entry points are used in GitHub Actions.

## Layers

| Area | Files | Runner | Main evidence |
| --- | --- | --- | --- |
| Python unit and API | `backend/tests/test_*.py` | pytest + pytest-django | Credentials, account ownership, CSRF, task execution, scheduler configuration |
| Frontend unit | Colocated `frontend/**/*.test.*` | Vitest in Node | Client transport, errors, concurrency, proxy behaviour, lint contract |
| Browser components | Colocated `frontend/**/*.browser.test.*` | Vitest browser mode + Playwright | Real rendering, keyboard and form interaction, visible states |
| Full-stack stories | `frontend/e2e/*.test.ts` | Playwright | Real Pages, Gunicorn, PostgreSQL, Redis, Celery, and Beat |
| Generated API | Schema and generated declarations | Django + OpenAPI TypeScript | Reproducible contract and frontend/backend type agreement |
| Deployment configuration | Compose, Pages bundle, staging/production overlays | Docker Compose, Wrangler, Kubernetes validators | Configuration syntax, copyability, release pins, and migration ordering |

Unit test discovery excludes `*.browser.test.*` and E2E stories so browser-only
APIs never execute in Node. Browser mode only selects component test files.
Playwright only selects `frontend/e2e/`. Keep frontend tests beside the source
they check; E2E stories are the deliberate cross-application exception.

## User stories

1. As a signed-in user, I submit a message, see the queued job, and eventually see the
   uppercase result produced by a real Celery worker.
2. As a returning user, I reload the page or sign out and back in and still see
   the persisted result owned by my account.
3. As a signed-in user, I cannot submit an empty or whitespace-only message, and I get
   useful feedback for invalid input.
4. As another signed-in account, I cannot see or retrieve another user's jobs.
5. As the service owner, I can verify that unsafe requests without CSRF are
   rejected, and the typed client's valid requests succeed through Pages.
6. As the service owner, I can observe Beat publish a heartbeat that a real
   worker processes and persists.
7. As a signed-out visitor, I see the login screen by default and cannot access
   job data by calling the API directly.
8. As a user, I get a generic error for invalid credentials, can submit login
   with the keyboard, and retain authentication after reloading the app.
9. As a user, I can sign out, lose access to protected content, and sign back in
   with the SDK refreshing CSRF after each authentication transition.
10. As a user whose browser session expires, I return to the login screen and
    cannot see stale protected content, then can sign in on the first attempt.
11. As a user with two tabs sharing cookies, I see both tabs reconcile a sign-out
    or account switch before showing the new account's protected content.

The E2E overlay uses a three-second heartbeat interval to keep the test short.
Development and production use a longer default. Tests wait for observable
state rather than assuming broker or scheduler startup is instantaneous.
The script also creates ordinary test accounts with a fresh random password
inside the disposable database. Credentials are passed through the container
environment, not source defaults, and the database is deleted after the run.
Development and production are never seeded with those test accounts.

## Isolation and diagnostics

The E2E runner assigns a separate Compose project name and removes host ports.
It starts healthy dependencies before Playwright. Its exit trap collects logs,
then deletes only that test project's containers and volumes, including on
failure. The development project keeps its database when tests finish.
Browser reports and traces are written under `frontend/`. GitHub uploads those
artifacts even after a failed run.

Backend tests also use a separate Compose project. pytest creates its own
database. No test should point at a shared, hosted, or production database.
Frontend component tests may mock the API package to exercise individual UI
states; full-stack stories must use real services.

Run `./local-dev.sh test deployment` to render both Kubernetes environments and
check their safety contracts inside Docker. The checks cover shared-image
selection, separate namespaces and secret readers, migration Job recreation,
the init gate on API/worker/Beat, and private tunnel routing. A copied-tree
fixture verifies that the overlays render from `apps/<app>/<env>` under a
GitOps-style cluster root without paths back to this checkout.

Backend tests exercise migration locking and the Job gate, including failed,
pending, missing, and stale successful Jobs. Rendered YAML checks establish the
expected image and content-hashed configuration references. They do not prove
that Azure federation, Key Vault reads, Flux reconciliation, NetworkPolicy, or
real cluster rollouts work in an environment.

## Adding a feature

Write the API or task regression test first where practical, then implement the
backend change. Regenerate the client with `./local-dev.sh api-client`. Add
colocated frontend logic tests and browser component tests for UI behaviour.
Add or update a full-stack story when the feature crosses the API, persistence,
or background-worker boundary. Run the relevant suites before the full gate.

Passing container tests does not prove a hosted Cloudflare deployment, an actual
cluster rollout, an edge access policy, or a production database migration.
Those checks belong to the documented GitOps promotion procedure.

## Template verification

The deployment check validates `SecretProviderClass` resources against the
upstream CSI driver's v1 schema, pinned in
`backend/tests/deployment/secretproviderclasses-crd.yaml` to
[secrets-store-csi-driver v1.5.4](https://github.com/kubernetes-sigs/secrets-store-csi-driver/blob/08a11d824a310318216c6054c159281acc55c554/config/crd/bases/secrets-store.csi.x-k8s.io_secretproviderclasses.yaml).
The schema is an offline test fixture, not an instruction to change the cluster's
installed driver. No custom resources are skipped by the deployment check.

The login-enabled template was verified locally on 2026-11-09 using Docker:

- 45 backend tests passed with 95% Python coverage.
- 37 frontend unit tests and 25 Chromium component tests passed.
- All 39 full-stack stories passed across Chromium, Firefox, and WebKit,
  including login/logout, CSRF rotation, first-login recovery after cookie loss,
  same-origin cross-tab account changes, account isolation, real Celery results,
  and Beat delivery.
- ESLint, Ruff, TypeScript, Django checks, migration drift, the Vite build,
  and Wrangler's Pages Functions compilation passed.
- Regenerating OpenAPI and TypeScript declarations produced identical files.
- Compose configuration, ShellCheck, Actionlint, and strict Kubernetes schema
  validation passed. That original Kubernetes check covered eight rendered
  resources in the earlier generic examples; use the deployment command above
  for the current staging and production overlays.
- `./local-dev.sh up`, user creation and cleanup, and a CSRF-protected write
  through Vite -> Wrangler -> Django passed. The login-enabled startup applied
  the account-ownership migration and retained earlier unowned demo rows.
  No sample user credentials were retained in the development database.
- The locked frontend dependency audit reported no vulnerabilities.

At that 2026-11-09 verification, GHCR publication and the GitHub-hosted workflow
were configured but had not been executed from this checkout. No Cloudflare or
Kubernetes deployment was made.
The transactional outbox gap and lint dependency compatibility compromise are
recorded in [architecture.md](architecture.md).

Local reload behavior was also checked by editing and restoring real bind-mounted
source while the Docker development stack stayed running. Chromium observed a
React heading update without navigation or loss of an unsent form draft, and an
API client TypeScript change executed without rebuilding its package. API
responses and Celery results reflected Python edits, Beat picked up a changed
schedule, and Wrangler recompiled an imported Function helper. All temporary
source edits were restored byte-for-byte. This check ran on Linux Docker;
polling is configured for Docker Desktop and WSL, but those hosts were not tested.

CI also inspects the merged E2E configuration. It rejects source mounts,
development image targets, and Python reload commands in the story stack so
live development edits cannot alter the code under E2E testing.
