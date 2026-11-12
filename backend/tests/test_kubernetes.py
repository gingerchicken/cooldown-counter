"""Rendered overlay contracts protect copied GitOps releases without touching a cluster."""

import copy
import os
import re
from pathlib import Path

import pytest
import yaml

from config.operations.migration_gate import is_current_complete

# deployment_artifacts is populated only by the Docker deployment check, not ordinary API tests.
deployment_artifacts = os.environ.get("KUBERNETES_ARTIFACTS")
pytestmark = pytest.mark.skipif(
    not deployment_artifacts,
    reason="Run ./local-dev.sh test deployment for rendered overlay checks.",
)


def rendered_resources(environment: str, copied: bool = False) -> list[dict]:
    """Load only the selected environment's rendered Kubernetes documents."""
    # file_name identifies a source render or a cluster root referencing the copied package.
    file_name = f"copied-{environment}.yaml" if copied else f"{environment}.yaml"
    return list(yaml.safe_load_all((Path(deployment_artifacts) / file_name).read_text()))


def resource_named(resources: list[dict], kind: str, name: str) -> dict:
    """Require one unambiguous resource for each deployment boundary under test."""
    return next(
        resource
        for resource in resources
        if resource["kind"] == kind and resource["metadata"]["name"] == name
    )


@pytest.mark.parametrize("environment", ["staging", "production"])
def test_copied_package_renders_from_a_separate_gitops_cluster_root(environment):
    """Copying the folder must preserve rendering without any path back into the app checkout."""
    assert rendered_resources(environment, copied=True) == rendered_resources(environment)


@pytest.mark.parametrize("environment", ["staging", "production"])
def test_environment_isolation_and_key_vault_delivery(environment):
    """Identity, secret and namespace references must remain specific to their environment."""
    # resources is the complete application overlay, including its Key Vault custom resources.
    resources = rendered_resources(environment)
    assert len(resources) == 16
    assert not any(resource["kind"] in {"Ingress", "Secret"} for resource in resources)
    # namespace is unique per environment and survives accidental application pruning.
    namespace = resource_named(resources, "Namespace", f"django-template-{environment}")
    assert namespace["metadata"]["annotations"]["kustomize.toolkit.fluxcd.io/prune"] == "disabled"
    assert all(
        resource["metadata"].get("namespace") == namespace["metadata"]["name"]
        for resource in resources
        if resource["kind"] != "Namespace"
    )
    # providers synchronize only their own role's approved secret fields from Azure Key Vault.
    providers = [resource for resource in resources if resource["kind"] == "SecretProviderClass"]
    assert len(providers) == 2
    for provider in providers:
        # mappings identify environment-variable names; objects holds vault references only.
        mappings = provider["spec"]["secretObjects"][0]["data"]
        objects = yaml.safe_load(provider["spec"]["parameters"]["objects"])["array"]
        assert all(f"django-template-{environment}-" in entry for entry in objects)
        assert provider["spec"]["parameters"]["usePodIdentity"] == "false"
        if provider["metadata"]["name"] == "backend-runtime-kv":
            # Runtime credentials must not receive the schema-owner connection string.
            assert {mapping["key"] for mapping in mappings} == {
                "DJANGO_SECRET_KEY",
                "DATABASE_URL",
                "CELERY_BROKER_URL",
            }
            assert not any("migration-database-url" in entry for entry in objects)
        else:
            # Schema work has separate identity and DB credentials without a broker secret.
            assert {mapping["key"] for mapping in mappings} == {"DJANGO_SECRET_KEY", "DATABASE_URL"}
            assert any("migration-database-url" in entry for entry in objects)
    assert (
        providers[0]["spec"]["parameters"]["clientID"]
        != providers[1]["spec"]["parameters"]["clientID"]
    )


@pytest.mark.parametrize("environment", ["staging", "production"])
def test_all_workloads_wait_for_the_same_migrated_image_and_configuration(environment):
    """API, Celery and Beat cannot start on a previous successful release's schema evidence."""
    # resources, job and configuration identify the exact rendered release inputs.
    resources = rendered_resources(environment)
    job = resource_named(resources, "Job", "backend-migrate")
    configuration = next(resource for resource in resources if resource["kind"] == "ConfigMap")
    # migration_container is the only container authorized to change the schema.
    migration_container = job["spec"]["template"]["spec"]["containers"][0]
    assert job["metadata"]["annotations"]["kustomize.toolkit.fluxcd.io/force"] == "enabled"
    assert "ttlSecondsAfterFinished" not in job["spec"]
    assert migration_container["command"] == ["python", "-m", "config.operations.migrate"]
    assert (
        migration_container["envFrom"][0]["configMapRef"]["name"]
        == configuration["metadata"]["name"]
    )
    assert re.fullmatch(r"backend-config-[a-z0-9]{10}", configuration["metadata"]["name"])
    assert configuration["data"]["DJANGO_DEBUG"] == "false"
    assert configuration["data"]["DJANGO_SECURE_COOKIES"] == "true"
    assert configuration["data"]["DEPLOYMENT_REVISION"] == "1"
    for workload_name in ("backend", "worker", "beat"):
        # pod and gate belong to the same shared backend image but have separate credential mounts.
        pod = resource_named(resources, "Deployment", workload_name)["spec"]["template"]["spec"]
        gate = pod["initContainers"][0]
        assert gate["command"] == ["python", "-m", "config.operations.migration_gate"]
        assert gate["image"] == pod["containers"][0]["image"] == migration_container["image"]
        # gate_environment contains public expectations copied from the actual rendered Job.
        gate_environment = {entry["name"]: entry.get("value") for entry in gate["env"]}
        assert gate_environment["EXPECTED_MIGRATION_IMAGE"] == migration_container["image"]
        assert gate_environment["EXPECTED_MIGRATION_CONFIG"] == configuration["metadata"]["name"]
        assert gate_environment["MIGRATION_JOB_NAME"] == "backend-migrate"
        assert "envFrom" not in gate
        assert pod["automountServiceAccountToken"] is False
        assert pod["serviceAccountName"] == "backend-runtime"
        assert pod["imagePullSecrets"] == [{"name": "ghcr-pull"}]
        assert all(
            mount["name"] != "migration-api-credentials"
            for mount in pod["containers"][0]["volumeMounts"]
        )
        # Matching placeholder tags cannot unlock startup before an immutable digest is set.
        completed_job = copy.deepcopy(job)
        completed_job["status"] = {"conditions": [{"type": "Complete", "status": "True"}]}
        assert not is_current_complete(
            completed_job,
            gate_environment["EXPECTED_MIGRATION_IMAGE"],
            configuration["metadata"]["name"],
        )
    # A single Beat plus Recreate avoids scheduler overlap during rollout and release gating.
    beat = resource_named(resources, "Deployment", "beat")
    assert beat["spec"]["replicas"] == 1
    assert beat["spec"]["strategy"]["type"] == "Recreate"


@pytest.mark.parametrize("environment", ["staging", "production"])
def test_tunnel_ingress_and_migration_rbac_are_narrow(environment):
    """Only tunnel pods may reach the API, and startup gates can read only their named Job."""
    # resources supplies policies after all environment transformations.
    resources = rendered_resources(environment)
    # role permits no secret reads, mutations or cluster-wide migration inspection.
    role = resource_named(resources, "Role", "backend-migration-gate")
    assert role["rules"] == [
        {
            "apiGroups": ["batch"],
            "resources": ["jobs"],
            "resourceNames": ["backend-migrate"],
            "verbs": ["get"],
        }
    ]
    # tunnel_policy matches namespace and pod labels together rather than allowing either alone.
    tunnel_policy = resource_named(resources, "NetworkPolicy", "backend-from-cloudflare-tunnel")
    assert tunnel_policy["spec"]["ingress"][0]["from"] == [
        {
            "namespaceSelector": {
                "matchLabels": {"kubernetes.io/metadata.name": "cloudflare-tunnel"}
            },
            "podSelector": {"matchLabels": {"app": "cloudflared"}},
        }
    ]
    assert tunnel_policy["spec"]["ingress"][0]["ports"] == [{"protocol": "TCP", "port": 8000}]


@pytest.mark.parametrize("environment", ["staging", "production"])
def test_promoted_digest_and_revision_update_every_release_gate(environment):
    """A synthetic fixture promotion must admit only its new image and configuration together."""
    # resources is a promoted test copy, never a deployment image supplied to an operator.
    resources = list(
        yaml.safe_load_all((Path(deployment_artifacts) / f"release-{environment}.yaml").read_text())
    )
    # promoted_job and original_job distinguish a fresh release from a previous completion.
    promoted_job = resource_named(resources, "Job", "backend-migrate")
    original_job = resource_named(rendered_resources(environment), "Job", "backend-migrate")
    promoted_job["status"] = original_job["status"] = {
        "conditions": [{"type": "Complete", "status": "True"}]
    }
    for workload_name in ("backend", "worker", "beat"):
        # gate_environment reflects the promoted Job's final digest and ConfigMap references.
        gate_environment = {
            entry["name"]: entry.get("value")
            for entry in resource_named(resources, "Deployment", workload_name)["spec"]["template"][
                "spec"
            ]["initContainers"][0]["env"]
        }
        assert is_current_complete(
            promoted_job,
            gate_environment["EXPECTED_MIGRATION_IMAGE"],
            gate_environment["EXPECTED_MIGRATION_CONFIG"],
        )
        assert not is_current_complete(
            original_job,
            gate_environment["EXPECTED_MIGRATION_IMAGE"],
            gate_environment["EXPECTED_MIGRATION_CONFIG"],
        )
