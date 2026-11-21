"""Explicit request contracts reject silent numeric and timezone coercions."""

from datetime import datetime, timedelta

from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import serializers

from tracker.models import PolicyVersion


class WholeMinutesField(serializers.IntegerField):
    """Accept representable positive whole values without treating bool as one minute."""

    def __init__(self, **kwargs):
        """Use the database's positive-integer range as the shared scalar boundary."""
        # Explicit bounds fail before a driver can truncate or overflow a persisted value.
        super().__init__(min_value=1, max_value=2147483647, **kwargs)

    def to_internal_value(self, data):
        """Reject boolean JSON values before normal integer validation."""
        if isinstance(data, bool):
            # Python's bool/int inheritance does not give a boolean domain meaning as duration.
            self.fail("invalid")
        return super().to_internal_value(data)


class AwareDateTimeField(serializers.DateTimeField):
    """Require an explicit UTC offset instead of guessing the deployment server's timezone."""

    def to_internal_value(self, data):
        """Check original awareness before DRF can attach its configured default timezone."""
        # Parsed strings and direct datetime inputs share the same offset requirement.
        try:
            # Impossible calendar dates can raise rather than simply return no parse result.
            parsed = parse_datetime(data) if isinstance(data, str) else data
        except ValueError as error:
            # Malformed dates remain field errors, never unhandled application failures.
            raise serializers.ValidationError("Enter a valid timestamp with a timezone.") from error
        if isinstance(parsed, datetime) and timezone.is_naive(parsed):
            # The UI labels UTC and submits an explicit Z; external clients must be equally precise.
            raise serializers.ValidationError("Include a timezone offset, for example Z for UTC.")
        return super().to_internal_value(data)


class FleetInputSerializer(serializers.Serializer):
    """A fleet is named by its creator; its owner membership is always server-assigned."""

    # Name is a human label rather than an authorization or relationship key.
    name = serializers.CharField(max_length=120)


class MembershipInputSerializer(serializers.Serializer):
    """Owners grant a provisioned operator one explicit tenant role."""

    # Existing Django usernames identify the granted principal without exposing passwords.
    username = serializers.CharField(max_length=150)
    # Roles are intentionally finite, with write and administration responsibilities separated.
    role = serializers.ChoiceField(choices=["owner", "editor", "viewer"])


class MembershipUpdateSerializer(serializers.Serializer):
    """A membership role can change without changing its user or fleet identity."""

    # Last-owner validation belongs to the serialized fleet command, not frontend visibility.
    role = serializers.ChoiceField(choices=["owner", "editor", "viewer"])


class SteamIdField(serializers.RegexField):
    """Require exact string input, avoiding already-rounded numeric JSON identities."""

    def __init__(self, **kwargs):
        """Constrain Steam identity to seventeen explicitly supplied decimal digits."""
        # Numeric parsing is intentionally excluded even when a Python integer could retain it.
        super().__init__(r"^[0-9]{17}$", max_length=17, **kwargs)

    def to_internal_value(self, data):
        """Reject numbers before CharField can turn them into plausible identity strings."""
        if not isinstance(data, str):
            # JavaScript can already have lost digits before a numeric body reaches Django.
            raise serializers.ValidationError("Send SteamID as an exact digit string.")
        return super().to_internal_value(data)


class AccountInputSerializer(serializers.Serializer):
    """Preserve the exact SteamID digit sequence and a separate display tag."""

    # A regular-expression string field prevents JavaScript's lossy large-number representation.
    steam_id = SteamIdField()
    # Tags can change later and are never used to join evidence or authorize access.
    tag = serializers.CharField(max_length=100)


class AccountUpdateSerializer(serializers.Serializer):
    """Rename or archive an account while protecting its stable identifier and history."""

    # Both optional fields are explicit partial-edit choices; absent fields remain unchanged.
    tag = serializers.CharField(max_length=100, required=False)
    archived = serializers.BooleanField(required=False)


class TypeInputSerializer(serializers.Serializer):
    """Describe a reason and either its game mechanism or its custom duration ladder."""

    # Name uniqueness is enforced case-insensitively within the authorized fleet.
    name = serializers.CharField(max_length=100)
    # Short codes are optional labels; blank values derive from the saved name.
    code = serializers.CharField(max_length=4, allow_blank=True, required=False)
    # The optional note explains what triggers the offence without changing its rule identity.
    note = serializers.CharField(max_length=2000, allow_blank=True, required=False)
    # steps are ordered whole-minute totals; clean_window_days is the elapsed-day interval and
    # decay_mode selects the explicit reduction strategy.
    steps = serializers.ListField(child=WholeMinutesField(), required=False)
    # Game policies select their supported defaults centrally; missing fields preserve saved edits.
    mechanism = serializers.ChoiceField(choices=PolicyVersion.Mechanism.values, required=False)
    clean_window_days = WholeMinutesField(required=False)
    decay_mode = serializers.ChoiceField(
        choices=["step_down", "full_reset", "none"], required=False
    )

    def validate_code(self, code):
        """Normalize a bounded display label without silently truncating accepted input."""
        # CharField already trimmed whitespace before this uppercase transformation.
        normalized = code.upper()
        if len(normalized) > 4:
            # Unicode uppercasing may expand characters; do not silently truncate accepted input.
            raise serializers.ValidationError("The uppercase short code must fit four characters.")
        return normalized

    def validate(self, attributes):
        """Reject ladders whose complete forecast cannot fit the supported datetime range."""
        try:
            # A full remaining ladder must be forecastable without wrapping datetime arithmetic.
            steps = attributes.get("steps", [])
            horizon = timedelta(minutes=max(steps, default=0)) + timedelta(
                days=attributes.get("clean_window_days", 7) * len(steps)
            )
            timezone.now() + horizon
        except OverflowError as error:
            # This is a representational boundary, not an invented maximum game duration.
            raise serializers.ValidationError(
                "This ladder exceeds the supported timestamp range."
            ) from error
        return attributes


class TypeUpdateSerializer(TypeInputSerializer):
    """An editor supplies the reviewed policy token before publishing or renaming."""

    # Adopting a mechanism alone must preserve the reason name, code and trigger note.
    name = serializers.CharField(max_length=100, required=False)
    # Stable policy identity detects stale editors even when only the label changes.
    expected_policy_id = serializers.UUIDField()


class ArchiveInputSerializer(serializers.Serializer):
    """Archive only the definition version whose impact the operator reviewed."""

    # A refreshed catalogue is required if another operator published a different version.
    expected_policy_id = serializers.UUIDField()


class PreviewInputSerializer(serializers.Serializer):
    """Calculate an assessment at the proposed issue time without modifying any evidence."""

    # IDs are validated against the fleet by services rather than trusted merely because they parse.
    account_id = serializers.UUIDField()
    type_id = serializers.UUIDField()
    started_at = AwareDateTimeField()
    # Absence means automatic prediction; zero/null must not become a fictional valid step.
    forced_step = WholeMinutesField(required=False)


class EventInputSerializer(PreviewInputSerializer):
    """Accept reviewed rule/history tokens and initial evidence, never a client total."""

    # Separate retry UUIDs distinguish one offence from the first observation of that offence.
    id = serializers.UUIDField()
    observation_id = serializers.UUIDField()
    # A stale policy or history token is a recoverable conflict at the write boundary.
    policy_id = serializers.UUIDField()
    history_revision = serializers.IntegerField(min_value=0)
    # Observed-at remains distinct from start and the server's immutable creation timestamp.
    observed_at = AwareDateTimeField()
    # Remaining minutes preserve the observed fact rather than a derived total duration.
    remaining_minutes = WholeMinutesField()
    # The VACNet notice can attribute a restriction to the player or to a party member.
    vac_attribution = serializers.ChoiceField(choices=["unknown", "self", "party"], required=False)
    # A nonempty reason is mandatory only when forced_step is actually supplied.
    override_reason = serializers.CharField(
        max_length=2000, allow_blank=True, required=False, default=""
    )


class ObservationInputSerializer(serializers.Serializer):
    """Append evidence to one known offence without creating another escalation event."""

    # id is the retry identity, observed_at the seen instant and remaining_minutes the time left;
    # all remain independent of the parent event's saved assessment.
    id = serializers.UUIDField()
    observed_at = AwareDateTimeField()
    remaining_minutes = WholeMinutesField()


class CalendarQuerySerializer(serializers.Serializer):
    """Read a half-open UTC date range with optional exact account and type selection."""

    # start/end are half-open UTC date bounds, filled together from one clock when absent.
    start = serializers.DateField(required=False)
    end = serializers.DateField(required=False)
    # Exact optional account/type IDs filter one authorized tenant without substring matching.
    account_id = serializers.UUIDField(required=False)
    type_id = serializers.UUIDField(required=False)
    # Clear explicitly means expired event records in this calendar projection.
    status = serializers.ChoiceField(choices=["all", "active", "clear"], default="all")

    def validate(self, attributes):
        """Require increasing bounds and a bounded one-year projection per request."""
        # A default window is based on the real clock rather than the prototype's fixed demo date.
        today = timezone.now().date()
        attributes.setdefault("start", today - timedelta(days=90))
        attributes.setdefault("end", today + timedelta(days=31))
        if not timedelta(0) < attributes["end"] - attributes["start"] <= timedelta(days=366):
            # Clients can page to earlier/later dates without asking the server for unbounded
            # history.
            raise serializers.ValidationError("Choose a date range from one through 366 days.")
        return attributes


class WarningInputSerializer(serializers.Serializer):
    """Record a warning without requesting a predicted level or timer."""

    # The notice UUID identifies a retry; the scoped IDs pin the account, reason and policy.
    id = serializers.UUIDField()
    account_id = serializers.UUIDField()
    type_id = serializers.UUIDField()
    policy_id = serializers.UUIDField()
    # Warnings have no duration; their only game timestamp is when the operator saw the notice.
    observed_at = AwareDateTimeField()
