# Architecture

## Boundaries

The template has two language boundaries. `backend/` owns Python and the API
contract. `frontend/` owns TypeScript, React, the generated API package, Pages
Functions, browser tooling, and all frontend tests. Root files orchestrate
containers, CI, and documentation. Kubernetes manifests live in `deploy/k8s/`.

The request path is browser -> Pages static assets or `/api` Function ->
Gunicorn -> Django -> PostgreSQL. Django publishes background work to Redis;
Celery workers consume it and write results to PostgreSQL. One Beat instance
publishes scheduled tasks to the same broker. Vite development requests use
Vite's proxy to local Wrangler, so development also exercises the Function.

Local development mounts Python source and runs Gunicorn, the Celery worker,
and Beat through a development-only Python file watcher. Each watcher stops its
current child before replacing it. Watching the backend directory rather than
only imported modules covers new apps and saves made during process startup.
Dependency installations, collected static files, and test folders are excluded.
The published image and full-stack E2E stack run the normal processes without
source mounts or watcher dependencies.

Vite serves the API client's TypeScript source during development so package
edits update alongside React. Production builds resolve the compiled package to
retain package-boundary validation. Wrangler mounts only Function routes and
their shared proxy source, preserving its built static assets. All development
watchers use polling by default to observe host edits through Docker bind mounts.
This trades some CPU for consistent updates on Docker Desktop and WSL; native
events can be selected with `DEV_WATCH_POLLING=false`.

The same backend image supplies Gunicorn, the worker, Beat, migrations, and
the migration gate. Processes run in separate containers so they can scale and
restart separately. Local Compose runs migrations before starting the app.
Kubernetes uses a separate migration Job and an init gate on API, worker, and
Beat. The gate accepts only a successful Job with the same image and generated
configuration name as the new workload. An old successful Job cannot admit a
new release. Migration execution takes a bounded PostgreSQL advisory lock;
other production migration entry points must use the same wrapper.

`deploy/k8s/` can be copied as one application directory into HBH-Infra/GitOps.
The shared base defines the workloads, service, migration Job, narrow gate
RBAC, and network policies. Staging and production overlays supply separate
namespaces, host settings, workload identities, Key Vault secret references,
and image pins. Each overlay is registered in its matching cluster root.
The root Kustomization aliases staging for compatibility; release operations
should select `staging/` or `production/` explicitly.

Application CI publishes GHCR images but does not update GitOps or apply to a
cluster. An operator promotes a verified digest in the chosen GitOps overlay.
Flux then reconciles it. Flux recreates the migration Job when immutable
template inputs change, and the init gates hold replacement workloads until
that execution succeeds. A public deployment revision can force another
execution after a relevant secret change without placing secret values in Git.

## API contract and generated package

Django REST Framework serializers and drf-spectacular define `backend/openapi.json`.
The backend's `generate_api_schema` command exports it deterministically. The
frontend's `api:generate` script generates TypeScript declarations from that
contract. `api:build` builds `frontend/packages/api-client/` as a workspace
package. `./local-dev.sh api-client` orchestrates these containerised steps;
`./local-dev.sh up` does so automatically before building the app.

The generated declarations are checked in for a reviewable API diff and a
frontend image build that does not need Python. CI regenerates both contract
and types and rejects drift. Do not edit generated declarations by hand.
Add endpoints and serializers in Django, export the schema, then regenerate.

The package uses relative same-origin API URLs. Its transport sends credentials
and obtains Django's masked CSRF token from `/api/csrf/` before unsafe calls.
Concurrent mutations share one bootstrap request. Cookie and header handling
belongs to the package rather than React components. Mutations are not blindly
retried: a network error can occur after a server has already committed work.

## Authentication

The application checks `/api/auth/session/` before showing protected content.
Signed-out visitors see a username/password login form. Login and logout use
Django's session authentication through the same-origin API client. Passwords
are submitted only to the login endpoint and are never saved in browser
storage. Django owns password hashing, inactive-account checks, session ID
rotation, and server-side logout. An active Django user created with
`./local-dev.sh user` can sign in; superuser privileges are not required.

`/api/auth/login/` and `/api/auth/logout/` require CSRF protection even for
anonymous requests. After either successful operation the SDK discards its
cached masked CSRF token and obtains a fresh one before another mutation.
Public session and probe endpoints never expose password hashes, privileges,
or session keys. Authentication responses cannot be cached. Job endpoints
require authentication on the server as well as at the UI boundary.

Tabs on the same origin share Django's cookies. Successful UI login/logout
broadcasts a credential-free session-change message to other tabs, which clear
their protected screen and recheck identity. The notification applies to login
and logout performed through this app. Rejected protected reads and confirmed anonymous
sessions invalidate cached CSRF, allowing the first login after cookie loss to
obtain a valid token instead of failing once.

Notifications use BroadcastChannel and therefore cover tabs on the same origin.
The local development and built-preview ports are different origins; use one
frontend origin when switching accounts. External admin or custom authentication
flows must also trigger an identity refresh if they change the shared cookies.

The current application does not include registration, password reset, MFA,
SSO, or a tenant model. Configure login rate limits at the production ingress
and select the account recovery and identity policies required by the product.
In-memory throttling in individual Gunicorn workers would not provide a shared
limit across replicas, so this template does not claim to implement that control.

## Demonstration domain

A job contains a message, a status, a result, and timestamps. Django validates
nonblank messages with a maximum of 200 characters and stores the authenticated
owner. A user can list or retrieve only their own jobs, across browser sessions.
Enqueuing occurs
after the database transaction commits, so the worker can see the record.
The worker converts the message to uppercase. Duplicate deliveries must not
change a finished job's result. Beat's heartbeat makes scheduler integration
observable without pretending it is an application business feature.

The ownership migration retains earlier anonymous sample jobs with a null user
and hides them from every account. It does not guess ownership or assign those
rows to the first user. New API submissions always receive the authenticated
owner. The nullable database field is a migration compromise for existing demo
data; an application can explicitly archive or remove those rows before making
ownership non-null. The sample still has no tenant model or retention policy.

## CSRF and proxy trust

Django validates unsafe methods even for anonymous API callers. This is an
explicit choice because DRF's default session authentication only applies
CSRF checks to authenticated callers. CSRF bootstrap also establishes the
browser session. Session and CSRF cookies are host-only and use SameSite=Lax;
production cookies must be Secure. No cross-origin browser API or CORS setup is
needed because the browser calls `/api` on the Pages origin.

The Function retains the browser's Origin, cookies, CSRF header, query, request
body, response status, and separate Set-Cookie headers. It replaces forwarded
host and protocol headers, forbids caching of API responses, and targets one
configured origin. It never follows upstream redirects with browser credentials.
Production requires HTTPS for the backend hop; local Compose explicitly enables
HTTP. Placeholder origins fail with a service-unavailable response.

Django trusts the proxy's forwarded headers. The HBH overlays route the API
origin through the existing Cloudflare Tunnel to a private ClusterIP service;
they do not require an NGINX ingress or a public load balancer. NetworkPolicy
permits incoming API traffic from the connector namespace and labels used by
HBH-Infra. Its enforcement depends on the cluster CNI. The tunnel and edge
configuration must preserve the validated Pages host and HTTPS scheme and
reject untrusted forwarding headers. Configure and test Cloudflare Access,
origin restrictions, and login rate limits for the actual deployment. A tunnel
hostname or frontend URL alone does not enforce those controls, and this
template has no application gateway-secret check. See [deployment.md](deployment.md).

## Operational compromises

The demonstration uses a database transaction plus broker publication after
commit. PostgreSQL and Redis do not share a transaction. Known broker failures
mark the job failed, but process termination between commit and publication can
leave a pending job unqueued. A production workflow that must never lose
dispatch needs a transactional outbox and a retrying dispatcher. Keep this limit
explicit when replacing the example domain.

Celery delivery is at least once; task handlers must remain idempotent. Beat
must have one active scheduler instance. Both overlays use one replica and
Recreate to avoid scheduler overlap during upgrades. Beat can therefore pause
while a release waits at its migration gate. Staging starts with one API pod and
one worker pod; production starts with two of each. These counts and resource
limits are initial settings, not measured capacity guarantees.

Each environment uses separate Azure workload identities for runtime and
migrations. Key Vault CSI mounts synchronize the runtime signing key, runtime
database URL, and broker URL into a namespaced Secret. The migration identity
reads the signing key and a separate schema-owner database URL. The normal
processes never receive that migration credential. The gate's projected
Kubernetes API token is mounted only in its init container and can read only
the named migration Job; Azure workload identity uses a separate projection.
Environment values do not refresh inside running containers when Key Vault
changes, so secret rotation includes an explicit workload restart or deployment
revision change.

PostgreSQL, Redis, backups, Azure identity federation and permissions, Key Vault
objects, private GHCR pull access, DNS, and Cloudflare routing remain operator
prerequisites. NetworkPolicy limits egress ports but does not express database,
broker, or Azure hostnames. Review the CNI and destination restrictions for the
chosen services. Existing compatible API and worker pods may serve while their
replacements wait; schema-breaking changes still need an expand/contract release.

The frontend retains ESLint 9 because the React lint plugin's supported peer
range does not yet include ESLint 10. A narrow minimatch override in the
TypeScript ESLint dependency tree addresses its dependency advisory; keep the
lint rule regression tests when updating those packages. Review and remove the
override once the upstream dependency graph includes the corrected version.
