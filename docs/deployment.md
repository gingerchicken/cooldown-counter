# Deployment

The template contains CI image publication and a copyable application tree for
HBH-Infra/GitOps. It does not provision a Cloudflare account, Kubernetes cluster,
database, broker, Azure identities, or production secrets. Image promotion to
GitOps is manual; Flux reconciles the resulting reviewed configuration. No
workflow in this repository applies Kubernetes manifests or changes GitOps.

## Backend image and GHCR

The GitHub workflow runs backend, frontend, component-browser, generated-client,
full-stack story, and Kubernetes configuration jobs. Only after all pass does
the publication job push `ghcr.io/<owner>/<repository>-backend` on the default
branch or a `v*` release tag. Pull requests never publish. The job uses the
repository's `GITHUB_TOKEN` with package-write permission.

The image has one runtime target with Python and production dependencies.
The development target adds test and lint tools. Neither Celery nor Gunicorn
needs a second production image. Select a role with its command:

| Role | Command |
| --- | --- |
| API | `gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2` |
| Worker | `celery -A config worker --loglevel=INFO --concurrency=2` |
| Beat | `celery -A config beat --scheduler django_celery_beat.schedulers:DatabaseScheduler --loglevel=INFO --pidfile=` |
| Migration Job | `python -m config.operations.migrate` |
| Workload init gate | `python -m config.operations.migration_gate` |

Use the immutable digest reported in the workflow summary for every role and
init container. The migration wrapper holds a PostgreSQL advisory lock around
the Django migration command; production operators must use that wrapper too.
The image is built for the CI runner's architecture. Add a deliberate build
matrix before deploying to another CPU architecture. Set package visibility or
configure image pull credentials for the cluster; the template cannot infer
your organisation's registry policy.

## Cloudflare Pages and the API Function

`frontend/wrangler.jsonc` is the configuration source. Replace the project name
and the `.invalid` production and preview backend origins before publication.
Keep `ALLOW_INSECURE_BACKEND` false for both environments. The local Compose
command overrides these bindings for internal HTTP without weakening deployed
settings. Origins must contain only the scheme and authority, without a path,
credentials, query, or fragment.

The frontend deploy has two parts: `dist/` contains Vite's static assets, and
`frontend/functions/api/[[path]].ts` supplies the Function. `_routes.json` only
invokes the Function for `/api` and `/api/*`. Run Wrangler from `frontend/` so
it discovers the Functions directory alongside the static build. Do not use
the dashboard's static-only drag-and-drop upload for this application.

Run deployment tools in the existing frontend tooling container. Supply a
Cloudflare API token and account ID through your shell or secret manager as
exported environment variables; the following commands reference the variables
without embedding their values in command arguments:

```bash
./local-dev.sh api-client
docker compose run --rm --no-deps frontend-test npm run build
docker compose run --rm --no-deps frontend-test npm run pages:build

# One-time project creation. Skip this if the project already exists.
docker compose run --rm --no-deps \
  -e CLOUDFLARE_API_TOKEN -e CLOUDFLARE_ACCOUNT_ID \
  frontend-test npx wrangler pages project create django-react-template --production-branch main

# Publication is an explicit manual command.
docker compose run --rm --no-deps \
  -e CLOUDFLARE_API_TOKEN -e CLOUDFLARE_ACCOUNT_ID \
  frontend-test npm run pages:deploy -- --branch main
```

Use the actual default branch if it is not `main`. Pages chooses production
or preview bindings according to the deployed branch. For a preview, deploy
with a different `--branch` and configure its matching Django host and trusted
origin. Do not use broad wildcard trusted origins for unrelated previews.

Cloudflare documents the [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
and [Pages deployment commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/).
The Function preserves separate cookie headers, following the runtime's
[Set-Cookie handling](https://developers.cloudflare.com/workers/runtime-apis/headers/).

## Kubernetes through HBH GitOps

[`deploy/k8s/README.md`](../deploy/k8s/README.md) is the self-contained application
runbook. It covers copying `base/`, `staging/`, and `production/` into
`HBH-Infra/GitOps/apps/<app>/`, replacing environment inputs, registering each
overlay in the matching cluster root, and promoting verified image digests.
The copied directory has no file dependencies outside its own tree; operational
Python code comes from the published backend image.

The overlays follow the existing GitOps patterns: separate Key Vault workload
identities for runtime and migrations, private ClusterIP routing through the
existing Cloudflare Tunnel, and release-specific migration gates on API, worker,
and Beat. They replace the earlier generic NGINX ingress and manually ordered
application/migration directories. Staging is the root Kustomization's
compatibility default; choose an environment directory explicitly for releases.

The reference is [HBH-Infra/GitOps's application layout](https://github.com/HBH-Infra/GitOps/blob/7ddd8386aa42561b4336cd0f6a5b5f209124f0ae/README.md)
and its [Honey-HR migration Job pattern](https://github.com/HBH-Infra/GitOps/blob/7ddd8386aa42561b4336cd0f6a5b5f209124f0ae/apps/honey-hr/base/migrations.yaml),
reviewed at commit `7ddd838`. The template keeps its own settings, probes, and
Celery workloads rather than copying Honey-HR's application configuration.

Validate locally without a cluster:

```bash
./local-dev.sh test deployment

# Inspect either environment's rendered resources in Docker.
docker run --rm -v "$PWD/deploy/k8s:/work:ro" \
  registry.k8s.io/kubectl:v1.34.1 kustomize /work/staging
docker run --rm -v "$PWD/deploy/k8s:/work:ro" \
  registry.k8s.io/kubectl:v1.34.1 kustomize /work/production
```

Passing these checks means the package renders and satisfies its tested safety
contracts. Placeholder vault names, identity IDs, hosts, and image tags still
need actual environment values. Rendering does not provision resources or prove
that a live AKS cluster can retrieve secrets or run migrations.

The edge and tunnel must retain Pages' validated public host and HTTPS scheme
and reject untrusted forwarded headers. Configure Cloudflare Access, origin
restrictions, and shared login rate limits separately. The NetworkPolicy assumes
HBH's `cloudflare-tunnel` namespace and `app: cloudflared` connector labels and
requires an enforcing CNI. It does not authorize a public hostname or replace
the edge policy. Django's [forwarded-header and CSRF settings](https://docs.djangoproject.com/en/5.2/ref/settings/)
depend on that trusted proxy boundary.

When upgrading the earlier anonymous template, stop the old API and worker
deployments before the account-ownership migration. That migration removes the
old session ownership column, so the old image cannot use the new schema.
Earlier anonymous job rows are retained without an owner and remain inaccessible
to signed-in users. Resume with the matching authentication-enabled release.

## Rollback and limits

Retain the prior image digest and Pages deployment. Roll back application roles
to the prior digest only if they remain compatible with the current database
schema. Database migrations may not be reversible. Plan restoration or forward
fixes for destructive changes rather than assuming an image rollback restores
data. Revert the frontend to a compatible Pages deployment separately.

The sample's after-commit broker publication is not a transactional outbox.
Known broker failures become failed jobs, but process death between commit and
publication can strand pending work. Implement a durable outbox for critical
workflows. The sample also has no rate limiting, account management screen,
task retention, or tenant model; those choices belong to the application built
from this template.
