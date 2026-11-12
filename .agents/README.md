# Project structure

This is a Docker-first Django and React TypeScript template. Read `README.md`
and `docs/architecture.md` before changing stack boundaries. `./local-dev.sh`
is the supported development and test entry point. Do not require Python,
Node, PostgreSQL, Redis, or browser binaries on the host.

- `backend/` is the Python boundary. It owns Django configuration, migrations,
  session authentication, account-owned jobs, Celery tasks, Beat scheduling,
  API tests, Python dependencies, the
  backend image, and the source OpenAPI contract in `openapi.json`.
- `frontend/` owns React, Vite, all Node dependencies, Pages Functions,
  browser configuration, and every frontend test. Unit tests are colocated
  `*.test.*`; component browser tests are colocated `*.browser.test.*`.
- `backend/accounts/` owns authentication and CSRF endpoints independently of
  the demonstration `backend/jobs/` app. Removing that demo must not remove login.
- `frontend/packages/api-client/` is the TypeScript workspace package. Django
  exports its contract; OpenAPI TypeScript generates the package schema.
  Its transport owns cookies and CSRF. React must not duplicate CSRF handling.
  Successful login/logout invalidate its cached token because Django can rotate
  CSRF credentials during authentication. The default screen requires login;
  never substitute a UI-only gate for backend permission checks.
- `frontend/functions/api/[[path]].ts` routes `/api` through the tested proxy
  in `frontend/src/platform/`. Do not put test files in `functions/`, where
  Pages would interpret them as deployed routes.
- `frontend/e2e/` contains full-stack user stories against the Docker stack.
  Do not replace the backend, broker, worker, scheduler, or proxy with mocks.
- `compose.yaml` runs development. `compose.e2e.yaml` removes host ports and
  shortens the heartbeat schedule in an isolated test project. Development
  reloads Python API, worker, scheduler, React, API client, and Function source;
  E2E explicitly restores runtime images and removes source mounts and watchers.
- `.github/workflows/` checks each test area and publishes a single backend
  image to GHCR. The same image runs Gunicorn, Celery workers, and Beat.
- `deploy/k8s/` is a copyable GitOps application tree with `base/`, `staging/`,
  and `production/`. Its README contains the environment inputs and promotion
  procedure; `docs/deployment.md` connects that runbook to Pages and GHCR.
  Promotion to GitOps is manual. Application CI never applies cluster resources.
- `backend/config/operations/` owns migration locking and the release gate in
  the shared image. API, worker, and Beat must wait for the matching successful
  migration Job. Keep those operations inside the Python boundary.

Run `./local-dev.sh api-client` after API changes and include updated generated
files. The main `up` command also regenerates the package automatically.
Keep one React component per file; ESLint enforces this for local and exported
components. Keep comments about intent, invariants, and ownership accurate.
Comment every new variable and logical block, and document callable boundaries.
Use ASCII hyphens in newly written text. Keep changes focused. Do not commit,
publish, or deploy unless the user requests that action.

## Bundled skills

The skills in `skills/` were copied from
`/home/matthew/Documents/Projects/project-template-git/.agents/skills/`.
Their bundled scripts, examples, references, fonts, and document assets are
included. Shared interview helpers live in `scripts/`; the source paper cited
by the planning skills lives in `source/journal.pdf`. Resolve paths in a skill
relative to its own directory unless the instructions specify the project root.

- [Comment code exhaustively](skills/comment-code-exhaustively/SKILL.md)
- [Commit](skills/commit/SKILL.md)
- [Codespacer](skills/codespacer/SKILL.md)
- [Create approval document](skills/create-approval-document/SKILL.md)
- [DRY refactoring](skills/dry-refactoring/SKILL.md)
- [Expand user story](skills/expand-user-story/SKILL.md)
- [Honey styled documents](skills/honey-styled-documents/SKILL.md)
- [jscpd](skills/jscpd/SKILL.md)
- [Map critical path](skills/map-critical-path/SKILL.md)
- [Process interview](skills/process-interview/SKILL.md)
- [Write interview questions](skills/write-interview-questions/SKILL.md)
- [Write requirements](skills/write-requirements/SKILL.md)
- [Write SMART task](skills/write-smart-task/SKILL.md)
- [Write user persona](skills/write-user-persona/SKILL.md)
- [Write user profile](skills/write-user-profile/SKILL.md)
- [Write user story](skills/write-user-story/SKILL.md)
