# GitOps application package

Copy this entire directory into `HBH-Infra/GitOps/apps/<app>/`. Its shared base
and environment overlays follow the repository's application layout. All file
references stay inside the copied tree. Runtime operations are Python modules in
the published backend image, not scripts imported from another checkout.

The package still needs application-specific values and provisioned services.
It creates Kubernetes application resources after promotion to GitOps; it does
not create Azure identities, Key Vault objects, PostgreSQL, Redis, registry
credentials, DNS, or Cloudflare routes. No secret values belong in these files.

## Directory layout

```text
base/         API, worker, Beat, migration Job, service, gate RBAC, network policy
staging/      Staging namespace, settings, identities, secret references, image pin
production/   Production namespace, settings, identities, secret references, image pin
```

The root `kustomization.yaml` aliases staging for compatibility. Register the
explicit environment directory in GitOps rather than relying on that default.
Staging starts with one API pod and one worker pod; production starts with two
of each.
Both run exactly one Beat instance with `Recreate`. Resource requests, limits,
and replica counts are starting settings, not tested capacity guarantees.

## Copy and configure

From the GitOps checkout, copy the package under a new application name:

```sh
cp -R /path/to/django-template/deploy/k8s apps/my-app
```

Review both environment overlays before adding either one to a cluster root:

1. Choose an application namespace per environment. Update the overlay's
   `namespace` and Namespace resource together. The supplied defaults are
   `django-template-staging` and `django-template-production`. Keep the
   namespace's Flux prune protection so removing an application entry does not
   automatically delete its namespace and unrelated retained resources.
2. Replace vault, Azure tenant, and workload identity placeholders in each
   environment. Use separate runtime and migration identities for this
   application. Do not reuse another application's identity or secret objects.
   Match each ServiceAccount annotation to its SecretProviderClass client ID.
   Federate the identities against the correct cluster issuer and subjects
   `system:serviceaccount:<namespace>:backend-runtime` and
   `system:serviceaccount:<namespace>:backend-migrations`.
3. Set exact public hostnames and CSRF origins in each `settings.env` and the
   API's probe Host headers in the overlay. Keep debug disabled and secure
   cookies enabled. Production and staging need their own frontend origins and
   API origins. `DEPLOYMENT_REVISION` is a public revision counter, not a secret
   or a hash of one.
4. Replace the example Key Vault object names with application-owned references.
   Provision the secrets and their least-privilege read grants as described
   below. Key Vault CSI, secret synchronization, and workload identity must
   already be enabled on the cluster.
5. Set `newName` to the actual backend GHCR package. Remove the placeholder
   `newTag` and add its verified immutable `digest: sha256:...` from a successful
   image publication. Do not invent a digest. Kustomize applies this one image
   entry to API, worker, Beat, migration Job, and all migration init gates.
   The gate also rejects an unpinned expected image.
   Build and publish an image containing `config.operations.migrate` and
   `config.operations.migration_gate` from this change. Earlier template images
   cannot run those entry points, even if their digest is valid.
6. Create a namespaced `ghcr-pull` Secret with pull access to that package when
   it is private. Every workload references that name. Do not put the registry
   credential in Git or in an environment settings file.
7. Provision PostgreSQL and Redis with persistence, backups, TLS, monitoring,
   and network access appropriate to the application. This package does not
   reuse the Honey-HR database or assume an existing shared Redis instance.
8. Configure the existing Cloudflare Tunnel for the API origin and the Pages
   Function's matching `BACKEND_ORIGIN`. The tunnel target is
   `http://backend.<namespace>.svc.cluster.local:80`; Gunicorn listens on 8000
   behind that Service. No NGINX ingress class or public load balancer is needed.

## Secret readers and database permissions

Keep different secret values for staging and production. The two
SecretProviderClass resources synchronize namespaced Secrets consumed as the
environment variables below by their intended readers:

| Reader | Variables | Purpose |
| --- | --- | --- |
| API, worker, Beat | `DJANGO_SECRET_KEY`, `DATABASE_URL`, `CELERY_BROKER_URL` | Signing, runtime database operations, and broker access. |
| Migration Job | `DJANGO_SECRET_KEY`, `DATABASE_URL` | The same signing configuration and a separate schema-owner database login. |

The migration database URL must use a different PostgreSQL role from runtime.
Grant runtime only the DML and sequence access required by the application;
grant the migrator the schema ownership needed by Django migrations. Configure
default privileges so newly migrated tables and sequences remain usable by
runtime. The migration identity must not share the runtime SecretProviderClass.

Use TLS-enabled database and broker URLs and URL-encode credential characters
where required. Keep the actual URLs in Key Vault. Runtime containers never
receive the schema-owner credential. The migration Job does not need the broker
credential. The gate init container receives neither set of application secret
environment variables.

CSI secret synchronization requires a mounting pod. Each consuming workload
mounts its own provider. Azure workload identity projects its own token; the
normal Kubernetes service-account token remains disabled. A separate projected
Kubernetes API token is mounted only in the migration gate init container, whose
RBAC permits GET on the single `backend-migrate` Job.

## Register and validate

In `clusters/staging/kustomization.yaml`, add the application's staging overlay:

```yaml
resources:
  - ../../apps/my-app/staging
```

Preserve the cluster root's existing resources. Add
`../../apps/my-app/production` to the production cluster root only when ready to
promote that environment. Never register both overlays in the same cluster root.
Application namespaces keep shared resource names such as `backend` isolated.

Before copying, this template's `./local-dev.sh test deployment` command checks
both overlays and a copied GitOps-style fixture in Docker. After copying, render
the application and the actual cluster root using the GitOps repository's
validation tools. For a Docker-only render from the GitOps checkout:

```sh
docker run --rm -v "$PWD:/work:ro" \
  registry.k8s.io/kubectl:v1.34.1 kustomize /work/apps/my-app/staging
docker run --rm -v "$PWD:/work:ro" \
  registry.k8s.io/kubectl:v1.34.1 kustomize /work/clusters/staging
```

Rendering accepts configuration placeholders so the template can be reviewed
without credentials. It does not make those placeholders deployable or verify
Azure federation, Key Vault authorization, CNI policy enforcement, or live Flux
health. Complete the inputs before promoting the cluster-root change.

## Promote a release

Application CI publishes the backend image but does not edit GitOps. Promotion
is a reviewed GitOps change to the chosen overlay's image digest. Promote the
same tested digest from staging into production after verifying staging.

1. Back up the database and confirm the new schema remains compatible with any
   API and worker pods still running the previous image. Use expand/contract
   changes for destructive migrations; a migration gate does not stop old pods.
2. Set the verified digest in the target environment's Kustomization and review
   the rendered image and configuration references. Commit and promote through
   the GitOps repository's normal process.
   Do not promote another revision while a migration Job is running: Flux's
   immutable-template replacement can terminate that execution.
3. Flux recreates `backend-migrate` when an immutable Job template input changes.
   The Job takes a bounded PostgreSQL advisory lock before running Django
   migrations. Keep every production migration entry point on
   `python -m config.operations.migrate`; direct `manage.py migrate` calls bypass
   that coordination.
4. New API, worker, and Beat pods wait for the Job to complete successfully with
   their exact backend image and content-hashed configuration reference. A
   missing, pending, failed, or stale successful Job keeps those pods blocked.
   Do not bypass the gate to make a rollout appear healthy. Beat's Recreate
   strategy can pause scheduling while its replacement waits.
5. Inspect Job logs and rollout state using the correct cluster and namespace.
   Retain the completed Job; its success is the release gate's evidence. It has
   no TTL. For a safe retry of a failed release, fix the cause and remove only
   the failed Job after confirming no migration is still running. Flux recreates
   it. Never delete a running Job or database volume as a retry shortcut.
6. Through the actual Pages domain, check sign-in, session restoration, sign-out,
   a valid CSRF mutation, rejection of tokenless writes, a Celery result, and an
   advancing heartbeat. Check backend readiness and worker readiness too.
   Publish a compatible frontend only after the backend release is ready.

## Rotation, routing, and operational limits

Key Vault rotation does not refresh environment variables in existing
containers. For a reviewed rotation, update the backing database/broker login
when required, update the vault secret, and increment `DEPLOYMENT_REVISION` in
the environment's settings. Promote that non-secret change through GitOps. It
changes the generated ConfigMap reference, reruns the migration Job, and rolls
the gated workloads. Editing a PostgreSQL password in Key Vault alone does not
change the actual PostgreSQL login. A Django signing-key change also invalidates
sessions; plan that separately from routine application releases.

The network policy permits API ingress from the existing `cloudflare-tunnel`
namespace with `app: cloudflared`. Confirm those selectors and an enforcing CNI
in the target cluster. Egress allows the necessary DNS, PostgreSQL, Redis, and
HTTPS ports; standard NetworkPolicy does not restrict those destinations by DNS
hostname. Tighten destination rules for your actual services and CNI where
needed. Operator privileges can still change or bypass these policies.

Configure Cloudflare Access and origin restrictions separately, and verify that
the tunnel preserves Pages' validated forwarded host and HTTPS scheme. The
template does not implement an application gateway-secret check. A public API
hostname and NetworkPolicy alone do not prove that only the intended Pages
Function can reach it. Configure a shared login rate limit at the edge.

Retain the prior image digest and Pages deployment for rollback. An image rollback
is safe only while the database remains compatible; migrations may need a
forward fix or backup restoration. Namespace prune protection does not replace
database backups or protect against an explicit privileged deletion. No cluster
deployment, secret read, migration, or Cloudflare policy is proven by rendering
these manifests offline.
