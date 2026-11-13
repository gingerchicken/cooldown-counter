"""Read contracts make every Django projection available to generated TypeScript consumers."""

from rest_framework import serializers


class FleetSerializer(serializers.Serializer):
    """A tenant summary includes the current caller's effective role."""

    # id is tenant identity, name its label, role the caller's permission and created_at its origin.
    id = serializers.UUIDField()
    name = serializers.CharField()
    role = serializers.ChoiceField(choices=["owner", "editor", "viewer"])
    created_at = serializers.DateTimeField()


class MembershipSerializer(serializers.Serializer):
    """A scoped provisioned principal without credentials or global user privileges."""

    # id names the membership; user_id/username name its principal; role is fleet-local permission.
    id = serializers.IntegerField()
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    role = serializers.ChoiceField(choices=["owner", "editor", "viewer"])


class PolicySerializer(serializers.Serializer):
    """An immutable rule version and ordered whole-minute ladder."""

    # id/number identify the revision; mode/window define decay; steps are ordered minutes.
    id = serializers.UUIDField()
    number = serializers.IntegerField()
    decay_mode = serializers.ChoiceField(choices=["step_down", "full_reset", "none"])
    clean_window_days = serializers.IntegerField()
    steps = serializers.ListField(child=serializers.IntegerField())


class OffenceTypeSerializer(serializers.Serializer):
    """Stable catalogue metadata plus its current rule revision and historical usage."""

    # id is stable; name/code label the type and note explains its trigger.
    id = serializers.UUIDField()
    name = serializers.CharField()
    code = serializers.CharField()
    note = serializers.CharField()
    # archived_at disables new selection; policy is current; event_count describes retained usage.
    archived_at = serializers.DateTimeField(allow_null=True)
    policy = PolicySerializer()
    event_count = serializers.IntegerField()


class PredictionSerializer(serializers.Serializer):
    """A server-derived next-offence estimate, distinct from a saved observation."""

    # Stable type identity accompanies the current human label to support exact filtering.
    type_id = serializers.UUIDField()
    type_name = serializers.CharField()
    # step is the next level, total_steps the ladder size, total_minutes its penalty and base_step
    # the decayed stored state before another offence advances it.
    step = serializers.IntegerField()
    total_steps = serializers.IntegerField()
    total_minutes = serializers.IntegerField()
    base_step = serializers.IntegerField()
    # Historical support and last recorded state are distinct from the decayed current base.
    sample_count = serializers.IntegerField()
    recorded_step = serializers.IntegerField()
    # next_decay_at is nullable when no reduction remains; transition explains the model's result.
    next_decay_at = serializers.DateTimeField(allow_null=True)
    transition = serializers.CharField()


class ObservationSerializer(serializers.Serializer):
    """Observed evidence keeps its timestamp and reporting principal separate from prediction."""

    # id identifies append-only evidence; observed_at is when remaining_minutes were seen.
    id = serializers.UUIDField()
    observed_at = serializers.DateTimeField()
    remaining_minutes = serializers.IntegerField()
    # created_by names the reporting operator; created_at is the separate server receipt time.
    created_by = serializers.CharField()
    created_at = serializers.DateTimeField()


class EventSerializer(serializers.Serializer):
    """An immutable offence assessment and every observation attached to that event."""

    # id identifies the offence; account_id/account_tag and type_id/type_name pair stable keys
    # with display labels so calendar and detail share one typed representation.
    id = serializers.UUIDField()
    account_id = serializers.UUIDField()
    account_tag = serializers.CharField()
    type_id = serializers.UUIDField()
    type_name = serializers.CharField()
    # policy_id/policy_number identify the pinned rule; started_at/expires_at bound its saved span.
    policy_id = serializers.UUIDField()
    policy_number = serializers.IntegerField()
    started_at = serializers.DateTimeField()
    expires_at = serializers.DateTimeField()
    # assigned_step/total_minutes preserve the original level and total, not a new replay result.
    assigned_step = serializers.IntegerField()
    total_minutes = serializers.IntegerField()
    # is_override/reason preserve intervention; transition records the accepted explanation.
    is_override = serializers.BooleanField()
    override_reason = serializers.CharField()
    transition = serializers.CharField()
    # created_by/created_at retain author and receipt time; observations are separate evidence.
    created_by = serializers.CharField()
    created_at = serializers.DateTimeField()
    observations = ObservationSerializer(many=True)


class AccountSerializer(serializers.Serializer):
    """A fleet row with exact identity, availability and all independent predictions."""

    # id is scoped identity; steam_id retains exact digits; tag is the mutable operator label.
    id = serializers.UUIDField()
    steam_id = serializers.CharField()
    tag = serializers.CharField()
    # archived_at controls report selection; history_revision detects stale previews; event_count
    # counts actual offences rather than repeated observations.
    archived_at = serializers.DateTimeField(allow_null=True)
    history_revision = serializers.IntegerField()
    event_count = serializers.IntegerField()
    # Per-type evidence sets permit correct list filtering without fetching every account detail.
    recorded_type_ids = serializers.ListField(child=serializers.UUIDField())
    active_type_ids = serializers.ListField(child=serializers.UUIDField())
    # status summarizes availability; predictions contain independent next results for each type.
    status = serializers.ChoiceField(choices=["active", "clear", "clean"])
    predictions = PredictionSerializer(many=True)
    # active_until is latest outstanding expiry; first_observed is earliest recorded event start.
    active_until = serializers.DateTimeField(allow_null=True)
    first_observed = serializers.DateTimeField(allow_null=True)


class AccountDetailSerializer(AccountSerializer):
    """Detail adds preserved history without changing the base account response contract."""

    # Events have distinct observation lists rather than one row per report pretending to be an
    # offence.
    events = EventSerializer(many=True)


class PreviewSerializer(serializers.Serializer):
    """An assessment and its reviewed policy/history concurrency tokens."""

    # policy_id/history_revision are concurrency tokens, not client authority to choose a total.
    policy_id = serializers.UUIDField()
    history_revision = serializers.IntegerField()
    # step/total_minutes/expires_at describe the assessment; base_step is its prior decayed state
    # and transition explains how that state produced the next offence level.
    step = serializers.IntegerField()
    total_minutes = serializers.IntegerField()
    expires_at = serializers.DateTimeField()
    base_step = serializers.IntegerField()
    transition = serializers.CharField()
    # Only same-account/type events effective by the entered start support this assessment.
    sample_count = serializers.IntegerField()


class ForecastSerializer(serializers.Serializer):
    """One future reduction distinguishes stored state from the next offence outcome."""

    # account_id/account_tag and type_id/type_name identify the marker's scoped ladder.
    account_id = serializers.UUIDField()
    account_tag = serializers.CharField()
    type_id = serializers.UUIDField()
    type_name = serializers.CharField()
    # at is the future boundary; stored_step is its state after decay; next_step/total_minutes
    # describe a later offence, so stored state zero still predicts a positive first penalty.
    at = serializers.DateTimeField()
    stored_step = serializers.IntegerField()
    next_step = serializers.IntegerField()
    total_minutes = serializers.IntegerField()


class CalendarSerializer(serializers.Serializer):
    """Unique event/forecast facts plus clearly fleet-wide totals at one reference instant."""

    # events/forecasts are unique facts; account_count counts tracked accounts, active_count
    # distinct restricted accounts, recorded_count offences, and as_of the shared server clock.
    events = EventSerializer(many=True)
    forecasts = ForecastSerializer(many=True)
    account_count = serializers.IntegerField()
    active_count = serializers.IntegerField()
    recorded_count = serializers.IntegerField()
    as_of = serializers.DateTimeField()


class AuditSerializer(serializers.Serializer):
    """An attributed mutation record without passwords, sessions or arbitrary request dumps."""

    # id identifies the audit entry, action names the mutation and subject_id its domain target.
    id = serializers.UUIDField()
    action = serializers.CharField()
    subject_id = serializers.UUIDField()
    # actor names the operator, details hold service-selected facts and created_at is receipt time.
    actor = serializers.CharField()
    details = serializers.JSONField()
    created_at = serializers.DateTimeField()
