"""Pure model tests describe time, saved assessments and independent prediction inputs."""

from datetime import UTC, datetime, timedelta

import pytest

from tracker.prediction import HistoryEntry, PolicySpec, forecast, predict


@pytest.fixture
def instant():
    """Use a fixed aware instant so exact clean-window boundaries are reproducible."""
    # The fixture represents the current prediction time rather than a server clock substitute.
    return datetime(2026, 11, 12, 12, tzinfo=UTC)


def test_no_history_predicts_first_step(instant):
    """An unobserved ladder begins at state zero and advances to the first duration."""
    # The policy is the familiar four-step example, with all durations measured in minutes.
    policy = PolicySpec((30, 120, 1440, 10080))
    # The prediction carries the explanation and state needed by every API projection.
    prediction = predict(policy, [], instant)
    assert (prediction.step, prediction.total_minutes, prediction.base_step) == (1, 30, 0)
    assert prediction.next_decay_at is None


@pytest.mark.parametrize(
    "mode, expected_explanation",
    [
        ("step_down", "Step down one level after each 7-day clean window"),
        ("full_reset", "Full reset after one 7-day clean window"),
        ("none", "No decay; clean time does not reduce the saved state"),
    ],
)
def test_explanation_names_elapsed_expiry_anchored_days_and_selected_policy(
    instant, mode, expected_explanation
):
    """An explanation must describe the same anchor and policy used by the calculation."""
    # The saved restriction started six days ago but ended five days ago.
    history = [HistoryEntry(instant - timedelta(days=6), instant - timedelta(days=5), 2)]
    # Only the selected mode changes; the fixed history must always yield five clean days.
    prediction = predict(PolicySpec((30, 120, 1440), decay_mode=mode), history, instant)
    assert "5 elapsed clean days since latest expiry" in prediction.transition
    assert expected_explanation in prediction.transition


@pytest.mark.parametrize("offset_ms, expected_step", [(-1, 3), (0, 2), (1, 2)])
def test_only_completed_clean_windows_reduce_state(instant, offset_ms, expected_step):
    """A one-millisecond difference must not round an incomplete window into a decay."""
    # The saved assessment reached step two before the seven-day clean interval.
    expiry = instant - timedelta(days=7) - timedelta(milliseconds=offset_ms)
    # The event's saved duration and assigned state are historical facts.
    history = [HistoryEntry(expiry - timedelta(hours=2), expiry, 2)]
    assert predict(PolicySpec((30, 120, 1440, 10080)), history, instant).step == expected_step


@pytest.mark.parametrize("clean_days, expected_step", [(14, 2), (21, 1), (90, 1)])
def test_multiple_windows_floor_state_at_zero(instant, clean_days, expected_step):
    """Clean time may remove several stored levels but cannot produce negative state."""
    # The prior event reached step three, whose snapshot remains unchanged during prediction.
    expiry = instant - timedelta(days=clean_days)
    # The historical total is one day independently of the currently selected policy.
    history = [HistoryEntry(expiry - timedelta(days=1), expiry, 3)]
    assert predict(PolicySpec((30, 120, 1440, 10080)), history, instant).step == expected_step


def test_terminal_step_holds_without_clean_time(instant):
    """Further offences cannot advance beyond the configured ladder."""
    # An active highest-level penalty has not begun its clean interval.
    history = [HistoryEntry(instant - timedelta(days=1), instant + timedelta(days=6), 4)]
    assert predict(PolicySpec((30, 120, 1440, 10080)), history, instant).step == 4


def test_overlapping_event_does_not_start_clean_time_early(instant):
    """The latest outstanding expiry governs clean time even after a shorter later event."""
    # The first record remains outstanding while a later override ended eight days ago.
    history = [
        HistoryEntry(instant - timedelta(days=12), instant + timedelta(days=2), 4),
        HistoryEntry(instant - timedelta(days=9), instant - timedelta(days=8), 2),
    ]
    # Saved step two remains the latest assigned state; zero clean time makes the next step three.
    prediction = predict(PolicySpec((30, 120, 1440, 10080)), history, instant)
    assert (prediction.step, prediction.base_step) == (3, 2)
    assert prediction.next_decay_at == instant + timedelta(days=9)


def test_backdated_prediction_excludes_later_events(instant):
    """A preview cannot use evidence whose event starts after its requested assessment time."""
    # This future record belongs to another point in the same chronological history.
    history = [HistoryEntry(instant + timedelta(hours=1), instant + timedelta(days=7), 4)]
    assert predict(PolicySpec((30, 120, 1440, 10080)), history, instant).step == 1


def test_history_order_does_not_change_prediction(instant):
    """Callers can provide an unordered queryset without changing the historical result."""
    # The newest saved event reached step two and is still within its first clean window.
    history = [
        HistoryEntry(instant - timedelta(days=20), instant - timedelta(days=19), 1),
        HistoryEntry(instant - timedelta(days=2), instant - timedelta(days=1), 2),
    ]
    assert predict(PolicySpec((30, 120, 1440)), history, instant) == predict(
        PolicySpec((30, 120, 1440)), list(reversed(history)), instant
    )


def test_new_shorter_policy_caps_after_decaying_saved_state(instant):
    """Changing policy length does not silently replace the historical assigned level."""
    # The saved old policy had at least five steps; two windows reduce five to three.
    expiry = instant - timedelta(days=14)
    # A three-step current policy caps the final result after applying historical-state decay.
    history = [HistoryEntry(expiry - timedelta(days=30), expiry, 5)]
    assert predict(PolicySpec((30, 120, 1440)), history, instant).step == 3


@pytest.mark.parametrize("clean_days, expected_step", [(6, 4), (7, 1), (100, 1)])
def test_full_reset_policy_has_an_exact_boundary(instant, clean_days, expected_step):
    """Full reset removes the entire stored level once its configured clean window finishes."""
    # State three is held before the boundary and fully cleared afterward.
    expiry = instant - timedelta(days=clean_days)
    history = [HistoryEntry(expiry - timedelta(days=1), expiry, 3)]
    assert (
        predict(PolicySpec((30, 120, 1440, 10080), decay_mode="full_reset"), history, instant).step
        == expected_step
    )


def test_no_decay_keeps_saved_state(instant):
    """The explicit no-decay policy does not reduce state after a long interval."""
    # The old event ended well before now, making accidental default decay observable.
    expiry = instant - timedelta(days=100)
    history = [HistoryEntry(expiry - timedelta(hours=2), expiry, 2)]
    # No future reduction exists when the selected policy does not decay.
    prediction = predict(PolicySpec((30, 120, 1440), decay_mode="none"), history, instant)
    assert prediction.step == 3
    assert prediction.next_decay_at is None


def test_override_replaces_prediction_with_a_real_step(instant):
    """An explicit override changes the selected total while preserving computed base state."""
    # A new account would automatically receive step one rather than the requested step three.
    prediction = predict(PolicySpec((30, 120, 1440)), [], instant, forced_step=3)
    assert (prediction.step, prediction.total_minutes, prediction.base_step) == (3, 1440, 0)
    assert "override" in prediction.transition.lower()
    assert "step 3 (predicted step 1)" in prediction.transition


@pytest.mark.parametrize("forced_step", [0, -1, 4, True, 1.5])
def test_invalid_override_is_rejected(instant, forced_step):
    """Out-of-range or nonintegral steps must not be silently clamped into another fact."""
    # The ladder has exactly three real choices.
    with pytest.raises(ValueError, match="step"):
        predict(PolicySpec((30, 120, 1440)), [], instant, forced_step=forced_step)


@pytest.mark.parametrize(
    "durations, window, mode",
    [
        ((), 7, "step_down"),
        ((0,), 7, "step_down"),
        ((1.5,), 7, "step_down"),
        ((True,), 7, "step_down"),
        ((30,), 0, "step_down"),
        ((30,), 1.5, "step_down"),
        ((30,), 7, "unknown"),
    ],
)
def test_invalid_policy_cannot_enter_prediction(durations, window, mode):
    """Pure computations fail explicitly for policy inputs the database also rejects."""
    # Invalid input is not converted into a one-minute fallback ladder.
    with pytest.raises(ValueError):
        PolicySpec(durations, clean_window_days=window, decay_mode=mode)


def test_naive_prediction_time_is_rejected():
    """Timezone-free datetimes cannot silently acquire server-local meaning."""
    # This naive timestamp deliberately has no UTC offset.
    with pytest.raises(ValueError, match="aware"):
        predict(PolicySpec((30,)), [], datetime(2026, 11, 12))


def test_forecast_reaches_zero_and_labels_next_offence_duration(instant):
    """A forecast state of zero still predicts the first-step penalty for a new offence."""
    # The current assessment is still active; clean windows start at its later expiry.
    expiry = instant + timedelta(hours=2)
    history = [HistoryEntry(instant - timedelta(hours=1), expiry, 2)]
    # Each forecast point distinguishes the resulting stored state from the next offence step.
    points = forecast(PolicySpec((30, 120, 1440)), history, instant)
    assert [
        (point.at, point.stored_step, point.next_step, point.total_minutes) for point in points
    ] == [
        (expiry + timedelta(days=7), 1, 2, 120),
        (expiry + timedelta(days=14), 0, 1, 30),
    ]


def test_forecast_excludes_past_reductions(instant):
    """A future layer omits completed reductions while retaining the next one."""
    # The first of two reductions happened yesterday and must not reappear as a forecast.
    expiry = instant - timedelta(days=8)
    history = [HistoryEntry(expiry - timedelta(hours=2), expiry, 2)]
    assert [point.at for point in forecast(PolicySpec((30, 120, 1440)), history, instant)] == [
        expiry + timedelta(days=14)
    ]


@pytest.mark.parametrize("durations, window", [((10**30,), 7), ((30,), 10**30)])
def test_policy_rejects_unrepresentable_intervals(durations, window):
    """Huge positive integers must not escape scalar validation as datetime overflows."""
    # These inputs satisfy positivity while exceeding Python's supported interval representation.
    with pytest.raises(ValueError, match="range"):
        PolicySpec(durations, clean_window_days=window)


def test_prediction_rejects_expiry_outside_datetime_range():
    """Even a representable interval may exceed the remaining supported calendar range."""
    # An instant near the maximum supported year cannot accept a two-day penalty.
    instant = datetime(9999, 12, 30, tzinfo=UTC)
    with pytest.raises(ValueError, match="range"):
        predict(PolicySpec((2880,)), [], instant)


def test_forecast_rejects_boundary_outside_datetime_range():
    """Unsupported future reductions fail as validation instead of crashing API responses."""
    # A saved late-year assessment leaves insufficient room for another seven-day boundary.
    instant = datetime(9999, 12, 29, tzinfo=UTC)
    history = [HistoryEntry(instant - timedelta(days=1), instant, 1)]
    with pytest.raises(ValueError, match="range"):
        forecast(PolicySpec((30,)), history, instant)


def test_equal_start_order_uses_stable_event_identity(instant):
    """An explicit saved UUID tie-breaker matches the queryset's documented event order."""
    # Later UUID ordering selects saved state two even though the other record expires later.
    history = [
        HistoryEntry(instant - timedelta(days=1), instant, 2, event_id="b"),
        HistoryEntry(instant - timedelta(days=1), instant + timedelta(days=1), 4, event_id="a"),
    ]
    assert predict(PolicySpec((30, 120, 1440, 10080)), history, instant).step == 3


@pytest.mark.parametrize("assigned_step", [0, -1, True, 1.5])
def test_invalid_saved_step_is_rejected(instant, assigned_step):
    """A historical entry must represent a real accepted level rather than arbitrary state."""
    # Invalid persisted inputs are rejected before they can influence another assessment.
    with pytest.raises(ValueError, match="step"):
        HistoryEntry(instant - timedelta(minutes=30), instant, assigned_step)


def test_saved_expiry_must_follow_start(instant):
    """An invalid historical interval cannot become a clean-time anchor."""
    # Equal start and expiry would imply a zero-duration accepted penalty.
    with pytest.raises(ValueError, match="expiry"):
        HistoryEntry(instant, instant, 1)


def test_forecast_has_no_markers_without_history_or_decay(instant):
    """An empty or explicitly nondecaying ladder has no future reductions."""
    # The second scenario includes history so the no-decay branch is independently covered.
    history = [HistoryEntry(instant - timedelta(minutes=30), instant, 1)]
    assert forecast(PolicySpec((30,)), [], instant) == ()
    assert forecast(PolicySpec((30,), decay_mode="none"), history, instant) == ()


def test_full_reset_forecast_has_one_state_zero_marker(instant):
    """Full reset produces one reduction rather than one marker per old stored level."""
    # A three-level saved assessment is cleared together after the clean window.
    history = [HistoryEntry(instant - timedelta(days=1), instant, 3)]
    points = forecast(PolicySpec((30, 120, 1440), decay_mode="full_reset"), history, instant)
    assert [(point.at, point.stored_step, point.next_step) for point in points] == [
        (instant + timedelta(days=7), 0, 1)
    ]


def test_ordinary_duration_saturates_but_account_level_keeps_increasing(instant):
    """Two consecutive week-long penalties must retain their distinct recovery periods."""
    # Start with a known fourth-level penalty that has just expired.
    policy = PolicySpec((30, 120, 1440, 10080), mechanism="ordinary")
    fourth = HistoryEntry(instant - timedelta(days=7), instant, 4)
    fifth = predict(policy, [fourth], instant)
    assert (fifth.step, fifth.total_minutes) == (5, 10080)
    # The fifth level still predicts a week after two clean weeks since its expiry.
    expiry = instant + timedelta(days=7)
    history = [fourth, HistoryEntry(instant, expiry, fifth.step)]
    recovered = predict(policy, history, expiry + timedelta(days=14))
    assert (recovered.base_step, recovered.step, recovered.total_minutes) == (3, 4, 10080)
    # Calendar reductions preserve the underlying level even with identical visible duration.
    points = forecast(policy, history, expiry)
    assert [(point.next_step, point.total_minutes) for point in points[:2]] == [
        (5, 10080),
        (4, 10080),
    ]


def test_imported_ordinary_seven_day_penalty_has_unknown_recovery(instant):
    """A seven-day timer alone cannot establish when the account will fall below level four."""
    # Selecting the top displayed duration on an imported event identifies only a lower bound.
    policy = PolicySpec((30, 120, 1440, 10080), mechanism="ordinary")
    imported = predict(policy, [], instant, forced_step=4)
    assert imported.level_is_lower_bound
    # An unknown historical upper bound survives even long periods of elapsed clean time.
    expiry = instant + timedelta(days=7)
    history = [HistoryEntry(instant, expiry, imported.step, level_is_lower_bound=True)]
    latest = predict(policy, history, expiry + timedelta(days=28))
    assert latest.level_is_lower_bound
    assert latest.next_decay_at is None
    assert forecast(policy, history, expiry) == ()
    # A lower ordinary tier from an actual notice identifies the exact assigned level again.
    assert not predict(policy, history, expiry, forced_step=2).level_is_lower_bound


@pytest.mark.parametrize("mechanism", ["vacnet", "griefing"])
def test_observation_only_policies_have_no_duration_schedule(instant, mechanism):
    """A game mechanism with unpublished stages cannot issue an invented next duration."""
    # Empty durations describe an observation-only policy and cannot enter the ladder engine.
    policy = PolicySpec((), decay_mode="none", mechanism=mechanism)
    with pytest.raises(ValueError, match="observation"):
        predict(policy, [], instant)
    assert forecast(policy, [], instant) == ()


def test_calendar_window_bounds_an_ordinary_forecast(instant):
    """A single page returns only weekly markers in its half-open date range."""
    # This high known level represents many consecutive penalties with the same seven-day duration.
    policy = PolicySpec((30, 120, 1440, 10080), mechanism="ordinary")
    history = [HistoryEntry(instant - timedelta(days=7), instant, 100000)]
    # Only the lower bound belongs to this calendar page; its exclusive end is the next marker.
    points = forecast(
        policy,
        history,
        instant,
        start=instant + timedelta(days=14),
        end=instant + timedelta(days=21),
    )
    assert [(point.at, point.stored_step) for point in points] == [
        (instant + timedelta(days=14), 99998)
    ]
