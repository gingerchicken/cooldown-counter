"""Admit application processes only after their exact release's migration Job succeeds."""

import json
import os
import re
import ssl
from pathlib import Path
from urllib.parse import quote
from urllib.request import HTTPRedirectHandler, HTTPSHandler, ProxyHandler, Request, build_opener


class RejectRedirects(HTTPRedirectHandler):
    """Keep the init-only Kubernetes bearer token on its original API endpoint."""

    def redirect_request(self, request, response, code, message, headers, new_url):
        """Reject every redirect rather than forwarding credentials to another endpoint."""
        # Kubernetes Job reads have a fixed URL; a redirect cannot be a valid gate response.
        return None


def is_current_complete(job: object, expected_image: str, expected_config: str) -> bool:
    """Reject missing, pending, failed, mutable-image or stale-configuration Job responses."""
    # A matching mutable tag is not proof that the Job executed the same code as this pod.
    if not re.fullmatch(r"[a-z0-9][a-z0-9./:_-]*@sha256:[0-9a-f]{64}", expected_image):
        return False
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*-[a-z0-9]{10}", expected_config):
        # The hashed ConfigMap makes settings and deliberate revision changes release inputs.
        return False
    if not isinstance(job, dict):
        # Invalid JSON shapes must never unlock a protected startup boundary.
        return False
    try:
        # migration_container is the single schema-changing role in the Job's executed pod template.
        migration_container = next(
            container
            for container in job["spec"]["template"]["spec"]["containers"]
            if container["name"] == "migrate"
        )
        # configuration_names retains only ConfigMaps, not secret names or credential contents.
        configuration_names = [
            entry["configMapRef"]["name"]
            for entry in migration_container["envFrom"]
            if "configMapRef" in entry
        ]
        # conditions is authoritative Job completion state; failed status takes precedence.
        conditions = job.get("status", {}).get("conditions", [])
        return (
            migration_container["image"] == expected_image
            and configuration_names == [expected_config]
            and any(
                condition.get("type") == "Complete" and condition.get("status") == "True"
                for condition in conditions
            )
            and not any(
                condition.get("type") == "Failed" and condition.get("status") == "True"
                for condition in conditions
            )
        )
    except (AttributeError, KeyError, TypeError, StopIteration):
        # Partial or malformed API objects are untrusted evidence of migration success.
        return False


def read_migration_job(namespace: str, job_name: str) -> object:
    """Read exactly one namespaced Job over verified TLS with the init-only token.

    Transport, file and JSON errors propagate to main's credential-safe diagnostic.
    Proxy environment variables and HTTP redirects cannot move the bearer token.
    """
    # credentials_directory is mounted only into the gate, never the application process.
    credentials_directory = Path("/var/run/template-migration-api")
    # api_token is short-lived and remains confined to this one TLS request in process memory.
    api_token = (credentials_directory / "token").read_text(encoding="utf-8").strip()
    # tls_context verifies the Kubernetes API using its projected cluster CA.
    tls_context = ssl.create_default_context(cafile=str(credentials_directory / "ca.crt"))
    # status_request uses a fixed origin; quoted path fields cannot select another endpoint.
    status_request = Request(
        "https://kubernetes.default.svc/apis/batch/v1/namespaces/"
        f"{quote(namespace, safe='')}/jobs/{quote(job_name, safe='')}"
    )
    status_request.add_unredirected_header("Authorization", f"Bearer {api_token}")
    # api_opener disables ambient proxies and redirects before a credentialed request is sent.
    api_opener = build_opener(
        ProxyHandler({}), HTTPSHandler(context=tls_context), RejectRedirects()
    )
    with api_opener.open(status_request, timeout=5) as status_response:
        # Bounded reads keep an unexpected response from consuming unbounded init-container memory.
        response_bytes = status_response.read(1_048_577)
        if len(response_bytes) > 1_048_576:
            raise ValueError("The migration Job response exceeded its size limit.")
        return json.loads(response_bytes)


def main() -> int:
    """Return success only for the exact completed release; Kubernetes retries other states."""
    try:
        # migration_job is public deployment metadata, obtained with GET-only namespaced RBAC.
        migration_job = read_migration_job(
            os.environ["POD_NAMESPACE"], os.environ["MIGRATION_JOB_NAME"]
        )
        if is_current_complete(
            migration_job,
            os.environ["EXPECTED_MIGRATION_IMAGE"],
            os.environ["EXPECTED_MIGRATION_CONFIG"],
        ):
            return 0
    except (OSError, ValueError, KeyError):
        # Exception text and response bodies may contain credentials and must not be logged.
        pass
    print("Waiting for the current application migration Job to complete successfully.")
    return 1


if __name__ == "__main__":
    # A nonzero result keeps Gunicorn, Celery or Beat behind the same release prerequisite.
    raise SystemExit(main())
