"""Explicit serializers define the OpenAPI and generated TypeScript contract."""

from rest_framework import serializers

from .models import Job


class JobSerializer(serializers.ModelSerializer):
    """Expose durable worker output while keeping account ownership server-controlled."""

    class Meta:
        """Only the bounded message is writable by a browser client."""

        # model selects durable Job rows; fields exposes only the browser's public contract.
        # read_only_fields protects identity, worker output, and timestamps from client changes.
        # Excluding user prevents callers from selecting another account's ownership.
        model = Job
        fields = ["id", "message", "status", "result", "created_at", "updated_at"]
        read_only_fields = ["id", "status", "result", "created_at", "updated_at"]


class HealthSerializer(serializers.Serializer):
    """Minimal probe output deliberately excludes secrets and infrastructure details."""

    # A literal choice is enough for typed clients to recognize a healthy response.
    status = serializers.ChoiceField(choices=["ok"])


class HeartbeatSerializer(serializers.Serializer):
    """Missing scheduler execution remains null rather than looking like a successful run."""

    # The nullable UTC timestamp is updated only by an actual Celery task execution.
    last_run_at = serializers.DateTimeField(allow_null=True)
