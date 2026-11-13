"""Publish immutable rule versions and maintain non-destructive fleet catalogues."""

from datetime import timedelta

from django.db import transaction
from django.db.models import Max
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from tracker.models import CooldownEvent, LadderStep, OffenceType, PolicyVersion, SteamAccount
from tracker.prediction import PolicySpec

from .access import Conflict, audit, save_validated

# Defaults are editable modeling inputs, not verified current Valve policy or fabricated histories.
DEFAULT_TYPES = (
    ("VACLive", "VAC", "Live VAC detection in match", (1200, 10080, 43200)),
    ("Abandoning", "ABD", "Left before the match ended", (30, 120, 1440, 10080)),
    ("Team Damage", "TDM", "Damage threshold to teammates", (30, 120, 1440, 10080)),
    ("Kicking", "KCK", "Kicked by team vote", (30, 120, 1440, 10080)),
    ("GriefReports", "GRF", "Accumulated in-game reports", (120, 1440, 10080, 43200)),
)


def current_policy(offence_type):
    """Return the latest published version, independent of mutable display labels."""
    # A policy is always published together with its steps inside one catalogue transaction.
    return offence_type.versions.order_by("-number").prefetch_related("steps").first()


def publish_policy(offence_type, actor, steps, clean_window_days=7, decay_mode="step_down"):
    """Append one policy and its contiguous steps; the caller must lock an existing type."""
    try:
        # Service callers must preserve the complete policy invariant even outside the HTTP adapter.
        PolicySpec(tuple(steps), clean_window_days, decay_mode)
    except ValueError as error:
        # An empty, coerced or unsupported policy must fail before any version row is created.
        raise ValidationError({"steps": str(error)}) from error
    # Version numbers are serialized by the parent type lock rather than a client-side counter.
    previous = current_policy(offence_type)
    # Metadata and step rows are immutable once this transaction publishes the new version.
    policy = save_validated(
        PolicyVersion(
            offence_type=offence_type,
            number=previous.number + 1 if previous else 1,
            decay_mode=decay_mode,
            clean_window_days=clean_window_days,
            created_by=actor,
        )
    )
    for position, minutes in enumerate(steps, 1):
        # Each positive duration belongs to one explicit ordinal in this version only.
        save_validated(LadderStep(policy=policy, position=position, duration_minutes=minutes))
    return policy


@transaction.atomic
def create_type(fleet, actor, attributes):
    """Create a stable offence identity and its first complete rule version atomically."""
    # Request serializers have already bounded and trimmed the editable display fields.
    definition = save_validated(
        OffenceType(
            fleet=fleet,
            name=attributes["name"],
            code=attributes.get("code") or attributes["name"][:3].upper()[:4],
            note=attributes.get("note", ""),
        )
    )
    publish_policy(
        definition,
        actor,
        attributes["steps"],
        attributes.get("clean_window_days", 7),
        attributes.get("decay_mode", "step_down"),
    )
    audit(fleet, actor, "type.created", definition.id, {"name": definition.name})
    return definition


def seed_types(fleet, actor):
    """Give a new fleet the design's rule catalogue without creating fake Steam accounts."""
    for name, code, note, steps in DEFAULT_TYPES:
        # Each fleet has independent definitions, allowing later edits without cross-tenant effects.
        create_type(fleet, actor, {"name": name, "code": code, "note": note, "steps": steps})


@transaction.atomic
def update_type(fleet, actor, type_id, attributes):
    """Rename metadata or publish changed rules without rewriting existing assessments."""
    # The parent lock serializes policy IDs, archival and concurrent number allocation.
    definition = get_object_or_404(OffenceType.objects.select_for_update(), pk=type_id, fleet=fleet)
    # A stale editor must be reviewed against the version another operator actually published.
    policy = current_policy(definition)
    if policy.id != attributes["expected_policy_id"]:
        raise Conflict()
    if definition.archived_at:
        # Archived rules remain queryable but cannot be republished through a stale open editor.
        raise ValidationError({"detail": "Archived offence types cannot be edited."})
    for field in ("name", "code", "note"):
        # Stable identity makes metadata updates independent of every historical relationship.
        if field in attributes:
            setattr(definition, field, attributes[field])
    if not definition.code:
        # Blank short-code edits use the same bounded derived label as initial creation.
        definition.code = definition.name[:3].upper()[:4]
    save_validated(definition)
    # Compare complete effective rule inputs so metadata-only edits do not create empty revisions.
    existing_steps = list(
        policy.steps.order_by("position").values_list("duration_minutes", flat=True)
    )
    # Missing optional policy fields retain their current value rather than resetting to defaults.
    next_steps = attributes.get("steps", existing_steps)
    next_days = attributes.get("clean_window_days", policy.clean_window_days)
    next_mode = attributes.get("decay_mode", policy.decay_mode)
    if (next_steps, next_days, next_mode) != (
        existing_steps,
        policy.clean_window_days,
        policy.decay_mode,
    ):
        # A shorter new ladder can still inherit a larger saved state from an old version.
        saved_bounds = CooldownEvent.objects.filter(policy__offence_type=definition).aggregate(
            maximum_step=Max("assigned_step"), latest_expiry=Max("expires_at")
        )
        # Both an existing long restriction and retained states must fit the complete forecast.
        maximum_state = max(len(next_steps), saved_bounds["maximum_step"] or 0)
        latest_anchor = max(timezone.now(), saved_bounds["latest_expiry"] or timezone.now())
        try:
            # Reject unsupported timestamp arithmetic before publishing an unusable shared rule.
            latest_anchor + timedelta(days=maximum_state * next_days)
        except OverflowError as error:
            raise ValidationError(
                {"clean_window_days": "This rule exceeds the supported historical forecast range."}
            ) from error
        # Existing events still point at their original immutable version and saved totals.
        publish_policy(definition, actor, next_steps, next_days, next_mode)
    audit(fleet, actor, "type.updated", definition.id, {"name": definition.name})
    return definition


@transaction.atomic
def archive_type(fleet, actor, type_id, expected_policy_id):
    """Archive a definition while preserving all policy versions, events and observations."""
    # Locking the definition also excludes a concurrent report that validates the current policy.
    definition = get_object_or_404(OffenceType.objects.select_for_update(), pk=type_id, fleet=fleet)
    if current_policy(definition).id != expected_policy_id:
        # A changed policy needs a new impact review rather than inheriting an armed confirmation.
        raise Conflict()
    if definition.archived_at is None:
        # Retrying archival is safe and does not append duplicate audit facts.
        definition.archived_at = timezone.now()
        save_validated(definition)
        audit(fleet, actor, "type.archived", definition.id, {"name": definition.name})
    return definition


@transaction.atomic
def create_account(fleet, actor, attributes):
    """Track a scoped exact SteamID with explicit operator attribution in the audit trail."""
    # A string field and scoped uniqueness preserve every input digit across fleets.
    account = save_validated(SteamAccount(fleet=fleet, **attributes))
    audit(fleet, actor, "account.created", account.id, {"steam_id": account.steam_id})
    return account


@transaction.atomic
def update_account(fleet, actor, account_id, attributes):
    """Rename or archive a tracked account without deleting its evidence."""
    # The account row is also the serialization boundary for concurrent history writes.
    account = get_object_or_404(
        SteamAccount.objects.select_for_update(), pk=account_id, fleet=fleet
    )
    if "tag" in attributes:
        # Renaming the display tag never alters the SteamID or existing event relationships.
        account.tag = attributes["tag"]
    if "archived" in attributes:
        # Reopening an account is explicit and retains its complete previous evidence.
        account.archived_at = timezone.now() if attributes["archived"] else None
    save_validated(account)
    audit(fleet, actor, "account.updated", account.id, attributes)
    return account
