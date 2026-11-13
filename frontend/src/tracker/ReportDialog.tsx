import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "@template/api-client";
import { Modal } from "./Modal";
import { describeError } from "./api";
import type { TrackerApi } from "./api";
import type {
  Account,
  CooldownEvent,
  OffenceType,
  Preview,
  PreviewInput,
} from "./types";
import {
  formatDuration,
  formatTimestamp,
  newUuid,
  parseRemaining,
  parseUtcInput,
  severity,
  utcInput,
} from "./format";

/** Record one event-time assessment and its first observation using explicit review tokens. */
export function ReportDialog({
  accounts,
  types,
  accountContext,
  api,
  fleetId,
  onDismiss,
  onSaved,
}: {
  accounts: Account[];
  types: OffenceType[];
  accountContext?: string;
  api: TrackerApi;
  fleetId: string;
  onDismiss: () => void;
  onSaved: (event: CooldownEvent) => void;
}) {
  // availableAccounts and availableTypes exclude archived identities from new evidence while history retains them.
  const availableAccounts = accounts.filter((account) => !account.archived_at),
    availableTypes = types.filter((type) => !type.archived_at);
  // accountId is the exact Steam-account UUID; typeId selects its independent offence ladder for this draft.
  const [accountId, setAccountId] = useState(
      accountContext ?? availableAccounts[0]?.id ?? "",
    ),
    [typeId, setTypeId] = useState(availableTypes[0]?.id ?? "");
  // startedAt is the issue-time UTC input; observedAt is separate UTC evidence about when remaining time was seen.
  const [startedAt, setStartedAt] = useState(() => utcInput()),
    [observedAt, setObservedAt] = useState(() => utcInput());
  // days, hours and minutes remain additive text drafts so invalid evidence can be corrected without coercion.
  const [days, setDays] = useState(""),
    [hours, setHours] = useState(""),
    [minutes, setMinutes] = useState("30");
  // accountSearch and typeSearch narrow native options without replacing the selected UUID identities.
  const [accountSearch, setAccountSearch] = useState(""),
    [typeSearch, setTypeSearch] = useState("");
  // forcedStep is an optional one-based ladder override; reason records why this account/type assessment needs it.
  const [forcedStep, setForcedStep] = useState<number | null>(null),
    [reason, setReason] = useState("");
  // preview holds accepted policy/history tokens, pending identifies the active request, and error holds correctable feedback.
  const [preview, setPreview] = useState<Preview | null>(null),
    [pending, setPending] = useState<"preview" | "save" | null>(null),
    [error, setError] = useState<string | null>(null);
  // These identities survive failed writes and changed preview tokens throughout this modal lifetime.
  const [identities] = useState(() => ({
    event: newUuid(),
    observation: newUuid(),
  }));
  // selectedType and selectedAccount resolve UUID choices; remaining is the validated additive duration in whole minutes.
  const selectedType = availableTypes.find((type) => type.id === typeId),
    selectedAccount = availableAccounts.find(
      (account) => account.id === accountId,
    ),
    remaining = parseRemaining(days, hours, minutes);
  // matchingAccounts and matchingTypes represent actual text matches, before keeping either selected UUID visible.
  const matchingAccounts = availableAccounts.filter((account) => {
      // Search considers the readable tag and full external identity, without changing report ownership.
      return `${account.tag} ${account.steam_id}`
        .toLowerCase()
        .includes(accountSearch.trim().toLowerCase());
    }),
    matchingTypes = availableTypes.filter((definition) => {
      // Explanatory notes and configured codes are searchable alongside the full offence name.
      return `${definition.name} ${definition.code} ${definition.note}`
        .toLowerCase()
        .includes(typeSearch.trim().toLowerCase());
    });
  // accountOptions and typeOptions retain the current exact choices even when the new search matches nothing.
  const accountOptions =
      selectedAccount && !matchingAccounts.includes(selectedAccount)
        ? [selectedAccount, ...matchingAccounts]
        : matchingAccounts,
    typeOptions =
      selectedType && !matchingTypes.includes(selectedType)
        ? [selectedType, ...matchingTypes]
        : matchingTypes;
  // selectedTotal colours the display using the reviewed result, or the current ladder choice before review.
  const selectedTotal =
    preview?.total_minutes ??
    selectedType?.policy.steps[(forcedStep ?? 1) - 1] ??
    0;
  // overTotal compares evidence only against an authoritative preview, never an unreviewed local guess.
  const overTotal =
    remaining !== null && preview !== null && remaining > preview.total_minutes;
  // fittingStep is the first zero-based ladder position that can contain the evidence, or -1 when none fits.
  const fittingStep =
    selectedType?.policy.steps.findIndex(
      (duration) => duration >= (remaining ?? 0),
    ) ?? -1;
  /** Every model-input change invalidates its former policy/history assessment tokens. */
  function invalidate() {
    // A former response no longer authorizes a write after any model input changes.
    setPreview(null);
    setError(null);
  }
  /** Check required evidence against the event-captured clock without fabricating input. */
  function validatedInput(currentTimeMs: number): PreviewInput | null {
    // Exact references must still be selectable when the user submits the draft.
    if (!selectedAccount || !selectedType) {
      setError("Choose an available Steam account and offence type.");
      return null;
    }
    // Native datetime controls carry no zone, so their explicitly UTC-labelled values acquire Z.
    const start = parseUtcInput(startedAt),
      observed = parseUtcInput(observedAt);
    // Time ordering must be checked locally without treating the observation time as the issue time.
    if (
      !start ||
      !observed ||
      Date.parse(start) > Date.parse(observed) ||
      Date.parse(observed) > currentTimeMs
    ) {
      setError(
        "Use valid UTC times with cooldown start before observation and observation no later than now.",
      );
      return null;
    }
    // Zero, fractional and malformed duration components cannot become accepted evidence.
    if (remaining === null) {
      setError(
        "Enter a positive whole-minute remaining duration. Days, hours and minutes are additive.",
      );
      return null;
    }
    return {
      account_id: accountId,
      type_id: typeId,
      started_at: start,
      ...(forcedStep === null ? {} : { forced_step: forcedStep }),
    };
  }
  /** Ask the backend for an assessment at the event's entered start time, never the current clock. */
  async function review(currentTimeMs: number) {
    // Local evidence validation keeps malformed requests out of the review endpoint.
    const input = validatedInput(currentTimeMs);
    // Invalid local evidence stays editable instead of starting a network request.
    if (!input) return;
    setPending("preview");
    setError(null);
    try {
      // The server alone resolves event-time state and returns the tokens needed for a later save.
      setPreview(await api.preview(fleetId, input));
    } catch (failure) {
      // A failed review leaves the entered evidence intact for correction or an explicit retry.
      setError(describeError(failure));
    } finally {
      // Release busy controls after either outcome so the operator can continue deliberately.
      setPending(null);
    }
  }
  /** Record once using the reviewed revision and retain the same UUIDs on a failed retry. */
  async function submit(event: FormEvent, currentTimeMs: number) {
    event.preventDefault();
    // A valid preview is mandatory; the frontend never supplies its own total or expiry.
    const input = validatedInput(currentTimeMs);
    // Invalid local evidence stays editable instead of starting a network request.
    if (!input) return;
    // Saving requires the exact accepted policy and history revisions from a completed review.
    if (!preview) {
      setError("Preview this cooldown before recording it.");
      return;
    }
    // Inconsistent observed duration needs correction or an explicit, newly reviewed override.
    if (overTotal) {
      setError(
        "Remaining duration exceeds the selected total. Correct the evidence or review a fitting override.",
      );
      return;
    }
    // Every manual intervention needs an attributable reason preserved with the historical event.
    if (forcedStep !== null && !reason.trim()) {
      setError("Explain the manual override in Override reason.");
      return;
    }
    setPending("save");
    setError(null);
    try {
      // Reuse both exact identities when a response is lost after the transaction committed.
      const recorded = await api.record(fleetId, {
        ...input,
        id: identities.event,
        observation_id: identities.observation,
        policy_id: preview.policy_id,
        history_revision: preview.history_revision,
        observed_at: parseUtcInput(observedAt)!,
        remaining_minutes: remaining!,
        override_reason: reason.trim(),
      });
      onSaved(recorded);
    } catch (failure) {
      // A rejected stale preview did not authorize another estimate; retain all entered evidence.
      if (failure instanceof ApiError && failure.status === 409) {
        // A changed policy or history revision invalidates its former approval to write.
        setPreview(null);
      }
      setError(describeError(failure));
    } finally {
      // Release busy controls after either outcome so the operator can continue deliberately.
      setPending(null);
    }
  }
  return (
    <Modal
      title="Report an observation"
      busy={pending !== null}
      onDismiss={onDismiss}
    >
      <form
        className="modal-body"
        onSubmit={(event) => {
          // Use the interaction clock for local evidence checks before the authoritative write.
          void submit(event, performance.timeOrigin + event.timeStamp);
        }}
      >
        <p>
          Record what you saw. The server derives the total from the policy and
          earlier saved assessments.
        </p>
        <fieldset disabled={pending !== null}>
          <legend>Identity and time</legend>
          <div className="form-columns">
            <label>
              Account search
              <input
                autoFocus
                type="search"
                value={accountSearch}
                onChange={(event) => {
                  // Narrow visible choices without changing the exact selected Steam identity.
                  setAccountSearch(event.target.value);
                }}
              />
            </label>
            <label>
              Steam account
              <select
                value={accountId}
                onChange={(event) => {
                  // An override never carries silently to a different account's history.
                  setAccountId(event.target.value);
                  setForcedStep(null);
                  setReason("");
                  invalidate();
                }}
              >
                {accountOptions.map((account) => {
                  // Initials supplement the readable tag and exact SteamID without claiming an external avatar.
                  return (
                    <option value={account.id} key={account.id}>
                      [
                      {Array.from(account.tag)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                      ] {account.tag} · {account.steam_id}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
          {availableAccounts.length > 0 && matchingAccounts.length === 0 && (
            <p role="status">
              No accounts match this search. The selected account is kept.
            </p>
          )}
          {!availableAccounts.length && (
            <p className="error">
              No available accounts. Add an account before reporting.
            </p>
          )}
          <div className="form-columns">
            <label>
              Cooldown start (UTC)
              <input
                type="datetime-local"
                value={startedAt}
                onChange={(event) => {
                  // Changing issue time invalidates the previous event-time assessment and its tokens.
                  setStartedAt(event.target.value);
                  invalidate();
                }}
              />
            </label>
            <label>
              Observed at (UTC)
              <input
                type="datetime-local"
                value={observedAt}
                onChange={(event) => {
                  // Observed-at is evidence about this event, separate from its issue timestamp.
                  setObservedAt(event.target.value);
                  setError(null);
                }}
              />
            </label>
          </div>
          <div className="form-columns">
            <label>
              Offence search
              <input
                type="search"
                value={typeSearch}
                onChange={(event) => {
                  // Narrow offence choices while retaining the explicitly selected ladder identity.
                  setTypeSearch(event.target.value);
                }}
              />
            </label>
            <label>
              Offence type
              <select
                value={typeId}
                onChange={(event) => {
                  // Another ladder has different valid positions, so reset its former override and review.
                  setTypeId(event.target.value);
                  setForcedStep(null);
                  setReason("");
                  invalidate();
                }}
              >
                {typeOptions.map((type) => {
                  // Notes and first-step duration help select the observed category without numeric guessing.
                  return (
                    <option key={type.id} value={type.id}>
                      {type.name} · {formatDuration(type.policy.steps[0])} ·{" "}
                      {type.note || type.code} · {type.policy.steps.length}{" "}
                      steps
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
          {availableTypes.length > 0 && matchingTypes.length === 0 && (
            <p role="status">
              No offence types match this search. The selected type is kept.
            </p>
          )}
          {!availableTypes.length && (
            <p className="error">
              No available offence types. Add a type before reporting.
            </p>
          )}
        </fieldset>
        <fieldset disabled={pending !== null}>
          <legend>Remaining duration - time left when you looked</legend>
          <div className="duration-inputs">
            <label>
              Days
              <input
                type="number"
                min="0"
                step="1"
                value={days}
                onChange={(event) => {
                  // Retain this additive day component for validation instead of silently replacing it.
                  setDays(event.target.value);
                  setError(null);
                }}
              />
            </label>
            <label>
              Hours
              <input
                type="number"
                min="0"
                step="1"
                value={hours}
                onChange={(event) => {
                  // Retain hours even when days are present; the complete duration remains additive.
                  setHours(event.target.value);
                  setError(null);
                }}
              />
            </label>
            <label>
              Minutes
              <input
                type="number"
                min="0"
                step="1"
                value={minutes}
                onChange={(event) => {
                  // Keep the minute evidence editable without rounding or one-minute substitution.
                  setMinutes(event.target.value);
                  setError(null);
                }}
              />
            </label>
          </div>
          <output aria-label="Remaining duration" aria-live="polite">
            {remaining === null
              ? "Enter a positive whole-minute duration."
              : `${formatDuration(remaining)} remaining (${remaining} minutes)`}
          </output>
        </fieldset>
        <section className="prediction-preview" aria-label="Cooldown preview">
          <div className="split-heading">
            <div>
              <span className="eyebrow">PREDICTED TOTAL DURATION</span>
              <strong className={`large-duration ${severity(selectedTotal)}`}>
                {preview
                  ? formatDuration(preview.total_minutes)
                  : "Not reviewed"}
              </strong>
            </div>
            <button
              type="button"
              className="secondary"
              disabled={pending !== null || !selectedType || !selectedAccount}
              onClick={(event) => {
                // Capture the review interaction time before requesting a backend assessment.
                void review(performance.timeOrigin + event.timeStamp);
              }}
            >
              {pending === "preview" ? "Previewing..." : "Preview cooldown"}
            </button>
          </div>
          {preview && (
            <>
              <p>
                Step {preview.step} of {selectedType?.policy.steps.length} ·
                base state {preview.base_step}
              </p>
              <p>{preview.transition}</p>
              <p>
                {preview.sample_count} prior same-type{" "}
                {preview.sample_count === 1 ? "sample" : "samples"} at this
                cooldown start.
              </p>
              <p className="muted">
                Predicted expiry: {formatTimestamp(preview.expires_at)}
              </p>
            </>
          )}
          <label>
            Override step
            <input
              type="range"
              min="1"
              max={selectedType?.policy.steps.length ?? 1}
              value={forcedStep ?? preview?.step ?? 1}
              disabled={pending !== null || !selectedType}
              onChange={(event) => {
                // A changed override requires a real ladder position and a new authoritative preview.
                setForcedStep(Number(event.target.value));
                invalidate();
              }}
            />
          </label>
          <div className="step-map">
            {selectedType?.policy.steps.map((duration, index) => {
              // The map is supplementary text; native range supplies keyboard and touch selection.
              return (
                <span className={severity(duration)} key={index}>
                  Step {index + 1}: {formatDuration(duration)}
                </span>
              );
            })}
          </div>
          {forcedStep !== null && (
            <>
              <p className="badge">
                Manual override: step {forcedStep}. Review before recording.
              </p>
              <label>
                Override reason
                <textarea
                  rows={2}
                  maxLength={2000}
                  disabled={pending !== null}
                  value={reason}
                  onChange={(event) => {
                    // Preserve why this particular event needs a manual assessment override.
                    setReason(event.target.value);
                  }}
                />
              </label>
              <button
                type="button"
                className="secondary"
                disabled={pending !== null}
                onClick={() => {
                  // Discard manual intervention and require review of the automatic prediction again.
                  setForcedStep(null);
                  setReason("");
                  invalidate();
                }}
              >
                Reset to predicted
              </button>
            </>
          )}
        </section>
        {overTotal && (
          <section className="warning" role="status">
            <p>
              {formatDuration(remaining!)} remaining exceeds the{" "}
              {formatDuration(preview!.total_minutes)} total at step{" "}
              {preview!.step}.
            </p>
            {fittingStep >= 0 &&
            fittingStep + 1 !== (forcedStep ?? preview!.step) ? (
              <button
                type="button"
                disabled={pending !== null}
                onClick={() => {
                  // Accepting a fitting step is an explicit override, followed by authoritative review.
                  setForcedStep(fittingStep + 1);
                  invalidate();
                }}
              >
                Move to step {fittingStep + 1} ·{" "}
                {formatDuration(selectedType!.policy.steps[fittingStep])}
              </button>
            ) : (
              <p>
                No configured step contains this evidence. Correct the duration
                or revise the rule.
              </p>
            )}
          </section>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            type="button"
            className="secondary"
            disabled={pending !== null}
            onClick={onDismiss}
          >
            Cancel
          </button>
          <button disabled={pending !== null || !preview}>
            {pending === "save" ? "Recording cooldown..." : "Record cooldown"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
