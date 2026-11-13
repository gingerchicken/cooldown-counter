# Cooldown Counter

Track CS2 cooldown evidence in permission-scoped fleets. Django owns login,
authorization, rule evaluation and durable history. React consumes an automatically
generated TypeScript API contract through the existing same-origin Pages proxy.
Rule defaults are editable model inputs, not verified current Valve policy.

## Start development

Install Docker with Compose 2.24.4 or newer. No host Python, Node or browser
installation is required.

```bash
./local-dev.sh up
./local-dev.sh operator --username alice
```

The operator command prompts for a password without echoing it or putting it in
shell history. It creates an ordinary Django account, not an administrator. There
are no default login credentials or fabricated Steam-account histories. Use
`./local-dev.sh user` only when a Django superuser is actually needed.

Open <http://localhost:5173>, sign in and create a fleet. Each fleet starts with
five editable offence ladders and no tracked accounts. Add a real tracked account
using its exact 17-digit SteamID, then record an observation. Provision colleagues
with the same operator command before granting fleet membership.

Owners manage membership. Editors manage accounts, rules and cooldown evidence.
Viewers can read their permitted fleets. An operator can belong to several fleets;
being authenticated or being Django staff grants no implicit access to another
fleet. At least one owner must remain.

The production-build local Pages endpoint is <http://localhost:8788>. Port 5173
provides live frontend reload. Both use the real Pages Function and Django API.
Set `LOCAL_DEV_PORT`, `LOCAL_WEB_PORT` and `COMPOSE_PROJECT_NAME` when another
local application uses those ports. Normal shutdown retains development data.

## API generation and live updates

`up` exports the Django OpenAPI schema, generates TypeScript declarations, builds
the API package and applies migrations before starting the stack. Development
watchers then regenerate after backend Python edits and rebuild the client after
schema or SDK-source changes. Invalid edits leave the last valid generated
contract intact; a later correction triggers another attempt.

```bash
./local-dev.sh api-client
```

Use this explicit command after API changes when development watchers are not
running. Frontend development/build commands also generate and build the package.
CI rejects drift in the checked-in schema and TypeScript declarations. Generated
files must not be edited by hand.

The TypeScript interface comes from Django serializers. The shared client owns
session cookies, CSRF bootstrap and rotation. The browser does not contain a
second escalation engine or store passwords/session credentials in local storage.

## Recording and history

All date/time inputs are labelled UTC. Cooldown start, observation time and
server recording time are separate facts. Remaining duration uses positive whole
minutes; mixed day/hour/minute components are additive. Future timestamps,
invalid values and remaining duration above the chosen total need correction.
An override selects an existing step and requires an explanation.

A new offence advances a ladder once. Use an additional observation on an
existing cooldown when reporting it again; that does not create another offence.
Preview uses history at the entered start time and returns revision tokens.
Concurrent history or policy changes require a refreshed review before saving.
Stable request IDs prevent an ambiguous retry from creating duplicate evidence.

Rule edits publish a new immutable version. Existing cooldowns retain their saved
assessment and policy version, including after backdated evidence is added.
Archiving a type retains its history. Overlapping restrictions delay clean time
until the latest outstanding expiry. The default policy drops one level per
completed seven-day clean window, with explicit full-reset and no-decay options.

## Tests and acceptance

```bash
./local-dev.sh test backend
./local-dev.sh test frontend
./local-dev.sh test browser
./local-dev.sh test e2e
./local-dev.sh test deployment
./local-dev.sh test all
./local-dev.sh acceptance
```

Backend checks run Ruff, pytest, Django checks and migration drift against an
isolated PostgreSQL project. They include actual concurrent-write tests. Frontend
checks run ESLint, TypeScript, unit/tooling tests, the static build and Pages
Function compilation. Component tests run in real Chromium through Playwright.
Full-stack Playwright tests use Chromium, Firefox and WebKit against actual
Pages, Gunicorn, PostgreSQL, Redis, Celery and Beat, with separate test volumes.
The agreed browser baseline starts at 320 CSS pixels with 200% text enlargement.
The combined gate verifies the requirement ledger against actual results from
all test layers. `acceptance` can reassemble that evidence without rerunning
tests. Missing reports or failing named assertions do not count as passes.

Unit and component coverage are written under `frontend/coverage/unit` and
`frontend/coverage/browser`. Browser reports and failure artifacts are saved under
`frontend/playwright-report` and `frontend/test-results`. Full details and the
limits of acceptance evidence are in [docs/testing.md](docs/testing.md).

## Daily operations

```bash
./local-dev.sh logs
./local-dev.sh logs backend api-schema-watch api-client-watch
./local-dev.sh django check
./local-dev.sh django makemigrations
./local-dev.sh migrate
./local-dev.sh shell
./local-dev.sh down
```

`./local-dev.sh reset --yes` deletes this development project's data. Do not use
it for a normal restart. The full-stack test runner cleans only its disposable
project, preserving development volumes and unrelated applications.

## Design and architecture

- [ER diagram and data invariants](docs/data-model.md)
- [Standalone ER visual](docs/er-diagram.html)
- [Architecture and boundaries](docs/architecture.md)
- [Testing and acceptance strategy](docs/testing.md)
- [User-story discovery index](2-user-stories/README.md)
- [Candidate requirements](3-requirements/requirements.md)
- [Original design and evidence limits](docs/design/README.md)
- [Deployment runbook](docs/deployment.md)
- [Portable Kubernetes overlays](deploy/k8s/README.md)

Python belongs in `backend/`, frontend source and tooling in `frontend/`.
The template's background-job health and scheduler checks remain for
infrastructure compatibility; the product workspace uses the tracker domain.
Hosting publication, real cluster rollouts, operator backup policy and official
game-rule validation are separate operational responsibilities. Test results do
not claim those activities have occurred.
