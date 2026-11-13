"""Pure expiry-anchored prediction over immutable saved event assessments.

The caller supplies one account/offence-type history. These functions perform
no database access, mutate no saved assessment and use only the explicit aware
assessment time. Sorting is O(E log E) for E supplied events; forecast output
is bounded by the number of remaining stored levels.
"""

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime, timedelta


def _positive_integer(value: object) -> bool:
    """Reject bools and fractional coercions despite Python's bool/int inheritance."""
    # Explicit type identity prevents True from being treated as a real duration or step.
    return type(value) is int and value > 0


def _require_aware(instant: datetime, field: str) -> None:
    """Reject timestamps without a meaningful UTC offset instead of guessing a zone."""
    # The error label identifies the caller-supplied boundary that needs correction.
    if not isinstance(instant, datetime) or instant.utcoffset() is None:
        raise ValueError(f"{field} must be a timezone-aware datetime.")


def _checked_interval(**components: int) -> timedelta:
    """Convert validated integer units while rejecting unsupported interval magnitudes."""
    # Positive database integers may still exceed the datetime library's representable interval.
    try:
        return timedelta(**components)
    except OverflowError as failure:
        # API callers can report a validation failure instead of leaking an arithmetic exception.
        raise ValueError("The policy interval exceeds the supported timestamp range.") from failure


def _add_interval(instant: datetime, interval: timedelta) -> datetime:
    """Keep otherwise valid intervals inside the concrete timestamp's remaining calendar range."""
    # Representable intervals can still overflow when added near datetime's upper year boundary.
    try:
        return instant + interval
    except OverflowError as failure:
        # The requested policy cannot provide an assessment or marker at this supplied instant.
        raise ValueError("The policy result exceeds the supported timestamp range.") from failure


@dataclass(frozen=True)
class PolicySpec:
    """A complete published rule definition expressed as positive whole minutes."""

    # Ordered durations correspond to one-based ladder step positions.
    durations: tuple[int, ...]
    # Clean days mean 24 elapsed hours, not daylight-saving-sensitive calendar dates.
    clean_window_days: int = 7
    # Mode identifiers match the persisted Django choices without importing Django here.
    decay_mode: str = "step_down"

    def __post_init__(self):
        """Validate the full policy before any caller can perform a calculation."""
        # Empty or coerced values cannot become fabricated one-minute policy defaults.
        if not self.durations or any(
            not _positive_integer(duration) for duration in self.durations
        ):
            raise ValueError("Policy durations must contain positive whole-minute integers.")
        if not _positive_integer(self.clean_window_days):
            # A zero window would divide by zero and a fractional day has no agreed meaning.
            raise ValueError("Clean-window days must be a positive whole integer.")
        if self.decay_mode not in {"step_down", "full_reset", "none"}:
            # Unknown policies must not quietly inherit a different strategy.
            raise ValueError("Choose a supported decay mode.")
        # Each published interval must be representable before an anchor is supplied later.
        for duration in self.durations:
            _checked_interval(minutes=duration)
        _checked_interval(days=self.clean_window_days)


@dataclass(frozen=True)
class HistoryEntry:
    """The minimal saved assessment facts needed by another same-ladder prediction."""

    # Start time orders assessments and excludes events after a backdated preview.
    started_at: datetime
    # Saved expiry remains authoritative even after policy definitions change.
    expires_at: datetime
    # Assigned state is the original assessment, including any accepted override.
    assigned_step: int
    # Optional stable identity aligns equal-start ordering with persisted event UUID ordering.
    event_id: str = ""

    def __post_init__(self):
        """Ensure historical state has the same temporal invariants as persisted events."""
        # Both timestamps must carry an offset before comparison or interval arithmetic.
        _require_aware(self.started_at, "Event start")
        _require_aware(self.expires_at, "Event expiry")
        if self.expires_at <= self.started_at:
            # Nonpositive penalties cannot provide a meaningful clean-time anchor.
            raise ValueError("Event expiry must follow its start.")
        if not _positive_integer(self.assigned_step):
            # State zero describes no history, not an assigned event assessment.
            raise ValueError("A saved event step must be a positive whole integer.")


@dataclass(frozen=True)
class Prediction:
    """One next-event assessment plus the explanation and current decay context."""

    # Step and total describe the next offence or an explicitly requested override.
    step: int
    total_minutes: int
    # Base is the decayed saved state before this hypothetical offence advances it.
    base_step: int
    # Transition is safe explanatory text without claims of verified game-policy authority.
    transition: str
    # Next decay is absent without prior state or when the effective policy never decays.
    next_decay_at: datetime | None


@dataclass(frozen=True)
class Forecast:
    """One future reduction, separating stored state from the next-offence outcome."""

    # The boundary is measured from the latest outstanding historical expiry.
    at: datetime
    # Stored step can reach zero without implying a zero-duration next penalty.
    stored_step: int
    # Next step and total identify the penalty predicted after the reduction.
    next_step: int
    total_minutes: int


def _terminal_state(history: Iterable[HistoryEntry], at: datetime):
    """Return latest assigned state and latest outstanding expiry as independent facts."""
    # Only effective prior events belong in a backdated assessment.
    eligible = sorted(
        (entry for entry in history if entry.started_at <= at),
        # UUID ordering matches the database; other facts break ties for legacy ID-free callers.
        key=lambda entry: (entry.started_at, entry.event_id, entry.expires_at, entry.assigned_step),
    )
    if not eligible:
        # No prior event means base state zero without a fictional anchor.
        return None
    # Latest assigned state follows chronology; maximum expiry preserves overlapping restrictions.
    return eligible[-1].assigned_step, max(entry.expires_at for entry in eligible)


def _decayed_state(policy: PolicySpec, previous_step: int, anchor: datetime, at: datetime):
    """Return decayed state and completed-window count without changing saved history."""
    # A still-active overlapping restriction contributes zero completed clean time.
    elapsed = max(timedelta(0), at - anchor)
    # Whole interval division gives exact behavior at and immediately before a clean boundary.
    window = _checked_interval(days=policy.clean_window_days)
    completed_windows = elapsed // window
    if policy.decay_mode == "none":
        # No-decay ignores elapsed windows while still respecting the selected ladder's cap.
        return previous_step, completed_windows
    if policy.decay_mode == "full_reset":
        # One full window resets every stored level together.
        return (0 if completed_windows else previous_step), completed_windows
    # Step-down counts only completed windows and cannot cross below the no-history state.
    return max(0, previous_step - completed_windows), completed_windows


def predict(
    policy: PolicySpec,
    history: Iterable[HistoryEntry],
    at: datetime,
    forced_step: int | None = None,
) -> Prediction:
    """Assess the next event at an explicit time using saved same-ladder history.

    Raises ValueError for an invalid timestamp or override. Future events are
    excluded. Old assessments are neither recalculated nor mutated. When a new
    shorter policy is selected, decay applies to saved state before its cap.
    """
    # The explicit time makes tests deterministic and avoids a frozen client-side clock.
    _require_aware(at, "Assessment time")
    if forced_step is not None and (
        not _positive_integer(forced_step) or forced_step > len(policy.durations)
    ):
        # Invalid overrides are rejected rather than silently assigned to another step.
        raise ValueError("Override step must identify an existing policy step.")
    # Terminal state is absent only when no event was effective by the assessment time.
    terminal = _terminal_state(history, at)
    # Base, next-decay and clean-time explanation stay empty until evidence supplies an anchor.
    base_step, next_decay_at, clean_time_explanation = 0, None, ""
    if terminal is not None:
        # Previous state and expiry can come from different overlapping events intentionally.
        previous_step, anchor = terminal
        # Explain completed elapsed days from the same outstanding expiry used by the calculation.
        clean_days = max(0, (at - anchor).days)
        clean_time_explanation = f"{clean_days} elapsed clean days since latest expiry. "
        decayed_step, completed_windows = _decayed_state(policy, previous_step, anchor, at)
        base_step = min(decayed_step, len(policy.durations))
        if decayed_step > 0 and policy.decay_mode != "none":
            # Full reset has one future boundary; step-down schedules the next uncompleted window.
            next_window = 1 if policy.decay_mode == "full_reset" else completed_windows + 1
            next_decay_at = _add_interval(
                anchor, _checked_interval(days=next_window * policy.clean_window_days)
            )
    # An automatic event advances exactly once; an explicit override replaces that choice.
    automatic_step = min(base_step + 1, len(policy.durations))
    selected_step = forced_step if forced_step is not None else automatic_step
    # The eventual event expiry must fit before a preview can promise this selected assessment.
    _add_interval(at, _checked_interval(minutes=policy.durations[selected_step - 1]))
    if forced_step is not None:
        # The transition preserves intervention rather than presenting it as automatic prediction.
        transition = f"Manual override -> step {selected_step} (predicted step {automatic_step})."
    elif terminal is None:
        # First-event wording distinguishes no evidence from a fully decayed prior history.
        transition = "First offence -> step 1."
    else:
        # Saved and decayed state stay visible even when a policy revision changes the final cap.
        transition = (
            f"Saved step {terminal[0]} -> clean-time state {base_step} -> step {selected_step}."
        )
    # Describe the selected mode, not a generic seven-day promise that may contradict its policy.
    policy_explanation = {
        "step_down": f"Step down one level after each {policy.clean_window_days}-day clean window.",
        "full_reset": f"Full reset after one {policy.clean_window_days}-day clean window.",
        "none": "No decay; clean time does not reduce the saved state.",
    }[policy.decay_mode]
    transition = f"{transition} {clean_time_explanation}{policy_explanation}"
    return Prediction(
        step=selected_step,
        total_minutes=policy.durations[selected_step - 1],
        base_step=base_step,
        transition=transition,
        next_decay_at=next_decay_at,
    )


def forecast(
    policy: PolicySpec, history: Iterable[HistoryEntry], at: datetime
) -> tuple[Forecast, ...]:
    """List future default reductions through state zero for the supplied ladder.

    Full-reset produces one marker; no-decay produces none. Markers at the exact
    reference instant remain visible, while earlier reductions are historical.
    """
    # Forecasts share the same authoritative reference time as ordinary prediction.
    _require_aware(at, "Forecast time")
    terminal = _terminal_state(history, at)
    if terminal is None or policy.decay_mode == "none":
        # No stored state or no decay has no later state transition to forecast.
        return ()
    # Keep the latest saved level and outstanding restriction expiry separate for overlaps.
    previous_step, anchor = terminal
    # The immutable result tuple is assembled from only reductions that have not passed.
    points = []
    # Full reset reaches zero at once; other policies reduce one stored level per boundary.
    reductions = (
        (previous_step,) if policy.decay_mode == "full_reset" else range(1, previous_step + 1)
    )
    for reduction in reductions:
        # A full reset occurs after one window regardless of the number of stored levels.
        window_number = 1 if policy.decay_mode == "full_reset" else reduction
        boundary = _add_interval(
            anchor, _checked_interval(days=window_number * policy.clean_window_days)
        )
        if boundary < at:
            # Completed reductions belong in history, not in the future marker layer.
            continue
        # Stored zero still predicts the first real step when another offence occurs.
        stored_step = max(0, previous_step - reduction)
        next_step = min(stored_step + 1, len(policy.durations))
        points.append(Forecast(boundary, stored_step, next_step, policy.durations[next_step - 1]))
    return tuple(points)
