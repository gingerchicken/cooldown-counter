"""Build an independent GitOps copy and an upstream-pinned CSI validation schema."""

import json
import shutil
import sys
from pathlib import Path

import yaml


def prepare_fixture(source_directory: Path, artifact_directory: Path) -> None:
    """Copy the deployment package without access to its original checkout during rendering."""
    # application_directory simulates an arbitrary path in the separate GitOps repository.
    application_directory = artifact_directory / "gitops/apps/copied-template"
    shutil.copytree(source_directory, application_directory, dirs_exist_ok=True)
    for environment in ("staging", "production"):
        # cluster_directory uses the exact relative registration shape in HBH-Infra/GitOps.
        cluster_directory = artifact_directory / "gitops/clusters" / environment
        cluster_directory.mkdir(parents=True, exist_ok=True)
        (cluster_directory / "kustomization.yaml").write_text(
            "apiVersion: kustomize.config.k8s.io/v1beta1\n"
            "kind: Kustomization\nresources:\n"
            f"  - ../../apps/copied-template/{environment}\n",
            encoding="utf-8",
        )

    # release_directory is a test copy; its synthetic digest is never a deployment pin.
    release_directory = artifact_directory / "release-fixture"
    shutil.copytree(source_directory, release_directory, dirs_exist_ok=True)
    for environment in ("staging", "production"):
        # overlay_path contains image selection independently of application source layout.
        overlay_path = release_directory / environment / "kustomization.yaml"
        # overlay is generated fixture metadata, so tests may substitute a clearly synthetic digest.
        overlay = yaml.safe_load(overlay_path.read_text(encoding="utf-8"))
        overlay["images"][0].pop("newTag")
        overlay["images"][0]["digest"] = "sha256:" + "a" * 64
        overlay_path.write_text(yaml.safe_dump(overlay), encoding="utf-8")
        # settings_path triggers the content-hash change used after secret rotation.
        settings_path = release_directory / environment / "settings.env"
        settings_path.write_text(
            settings_path.read_text(encoding="utf-8").replace(
                "DEPLOYMENT_REVISION=1", "DEPLOYMENT_REVISION=2"
            ),
            encoding="utf-8",
        )

    # schema_directory contains upstream CRD schemas without requiring a cluster or a live download.
    schema_directory = artifact_directory / "schemas"
    schema_directory.mkdir(parents=True, exist_ok=True)
    # definition is pinned to secrets-store-csi-driver v1.5.4:
    # https://github.com/kubernetes-sigs/secrets-store-csi-driver/commit/08a11d824a310318216c6054c159281acc55c554
    definition = yaml.safe_load(
        (Path(__file__).parent / "secretproviderclasses-crd.yaml").read_text(encoding="utf-8")
    )
    # version selects the served v1 shape used by the Azure Key Vault provider manifests.
    version = next(entry for entry in definition["spec"]["versions"] if entry["name"] == "v1")
    # schema retains upstream field validation and explicitly identifies this custom resource.
    schema = version["schema"]["openAPIV3Schema"]
    schema["properties"]["apiVersion"]["enum"] = ["secrets-store.csi.x-k8s.io/v1"]
    schema["properties"]["kind"]["enum"] = ["SecretProviderClass"]
    (schema_directory / "secretproviderclass.json").write_text(json.dumps(schema), encoding="utf-8")


if __name__ == "__main__":
    # Command arguments are mount paths, never secret values or cluster credentials.
    prepare_fixture(Path(sys.argv[1]), Path(sys.argv[2]))
