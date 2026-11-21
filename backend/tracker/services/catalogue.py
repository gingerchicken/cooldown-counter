"""Publish immutable rule versions and maintain non-destructive fleet catalogues."""

from datetime import timedelta

from django.db import transaction
from django.db.models import Max
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from tracker.models import CooldownEvent, LadderStep, OffenceType, PolicyVersion, SteamAccount
from tracker.prediction import ORDINARY_DURATIONS, PolicySpec

from .access import Conflict, audit, save_validated

# Stable mechanisms describe how to interpret a notice; editable reason labels never select rules.
DEFAULT_TYPES = (
    ("VACLive", "VAC", "VACNet restriction issued to the player or their party", "vacnet"),
    ("Abandoning", "ABD", "Issued cooldown for abandoning or failing to reconnect", "ordinary"),
    ("Team Damage", "TDM", "Issued cooldown for excessive team damage", "ordinary"),
    ("Kicking", "KCK", "Issued cooldown for repeated removal or kick vote abuse", "ordinary"),
    ("GriefReports", "GRF", "Issued cooldown for excessive griefing reports", "griefing"),
)


def current_policy(offence_type):
    """Return the latest published version, independent of mutable display labels."""
    # A policy is always published together with its steps inside one catalogue transaction.
    return offence_type.versions.order_by("-number").prefetch_related("steps").first()


def policy_spec(policy):
    """Translate an immutable ORM policy revision into its validated prediction inputs."""
    # Duration order comes from the published ordinals and is retained across queries and edits.
    return PolicySpec(
        tuple(step.duration_minutes for step in policy.steps.all()),
        policy.clean_window_days,
        policy.decay_mode,
        policy.mechanism,
    )


def _requested_policy(attributes, current=None):
    """Resolve partial edits, permitting fleet choices without redefining a CS2 mechanism."""
    # Unspecified fields inherit the existing snapshot for partial edits of its rules.
    mechanism = attributes.get("mechanism", current.mechanism if current else "custom")
    steps = current.durations if current else ()
    days = current.clean_window_days if current else 7
    mode = current.decay_mode if current else "step_down"
    if mechanism != "custom" and ("mechanism" in attributes or current is None):
        # Adoption of a game mechanism uses its own defaults, independent of the old ladder.
        steps = ORDINARY_DURATIONS if mechanism == "ordinary" else ()
        days = 7
        mode = "step_down" if mechanism == "ordinary" else "none"
    # An older client can still edit rule values; a changed game schedule becomes a custom policy.
    requested = (
        tuple(attributes.get("steps", steps)),
        attributes.get("clean_window_days", days),
        attributes.get("decay_mode", mode),
    )
    if current and "mechanism" not in attributes and requested != (steps, days, mode):
        mechanism = "custom"
    try:
        # Validate the resolved rule in exactly the representation used by the prediction engine.
        return PolicySpec(*requested, mechanism=mechanism)
    except ValueError as error:
        # Invalid or incompatible fields must fail atomically, including calls outside HTTP.
        raise ValidationError({"steps": str(error)}) from error


def publish_policy(offence_type, actor, spec):
    """Append one validated policy and its ordered steps while holding the parent type lock."""
    # Version numbers are serialized by the parent type lock rather than a client-side counter.
    previous = current_policy(offence_type)
    # Metadata and step rows are immutable once this transaction publishes the new version.
    policy = save_validated(
        PolicyVersion(
            offence_type=offence_type,
            number=previous.number + 1 if previous else 1,
            mechanism=spec.mechanism,
            decay_mode=spec.decay_mode,
            clean_window_days=spec.clean_window_days,
            created_by=actor,
        )
    )
    for position, minutes in enumerate(spec.durations, 1):
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
    publish_policy(definition, actor, _requested_policy(attributes))
    audit(fleet, actor, "type.created", definition.id, {"name": definition.name})
    return definition


def seed_types(fleet, actor):
    """Give a new fleet the design's rule catalogue without creating fake Steam accounts."""
    for name, code, note, mechanism in DEFAULT_TYPES:
        # Each fleet owns its definitions; only ordinary reasons share an account's progression.
        create_type(
            fleet, actor, {"name": name, "code": code, "note": note, "mechanism": mechanism}
        )


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
    current = policy_spec(policy)
    # A mechanism change gets its own immutable revision even if the durations coincide.
    requested = _requested_policy(attributes, current)
    if requested != current:
        if requested.mechanism == "custom":
            # Only custom schedules can introduce arbitrary window lengths. Previous game rules
            # belong to other progressions and must not constrain a later custom policy.
            saved_bounds = CooldownEvent.objects.filter(
                policy__offence_type=definition, policy__mechanism="custom"
            ).aggregate(maximum_step=Max("assigned_step"), latest_expiry=Max("expires_at"))
            # Both an existing long restriction and retained states must fit the complete forecast.
            maximum_state = max(len(requested.durations), saved_bounds["maximum_step"] or 0)
            latest_anchor = max(timezone.now(), saved_bounds["latest_expiry"] or timezone.now())
            try:
                # Reject unsupported arithmetic before publishing an unusable rule.
                latest_anchor + timedelta(days=maximum_state * requested.clean_window_days)
            except OverflowError as error:
                raise ValidationError(
                    {"clean_window_days": "Rule exceeds the supported historical forecast range."}
                ) from error
        # Existing events still point at their original immutable version and saved totals.
        publish_policy(definition, actor, requested)
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
