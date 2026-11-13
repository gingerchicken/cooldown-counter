import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "./Modal";
import { describeError } from "./api";
import type { TrackerApi } from "./api";
import type { OffenceType, TypeInput } from "./types";
import { editableStep, formatDuration, severity, stepMinutes } from "./format";

/**
 * Create a type or edit definition using the fleetId-scoped api while preserving published history.
 * types supplies duplicate-name checks; onSaved refreshes accepted rules and onDismiss abandons the draft.
 */
export function TypeEditor({
  definition,
  types,
  api,
  fleetId,
  onDismiss,
  onSaved,
}: {
  definition?: OffenceType;
  types: OffenceType[];
  api: TrackerApi;
  fleetId: string;
  onDismiss: () => void;
  onSaved: () => void;
}) {
  // name/setName, code/setCode and note/setNote own metadata drafts, separate from saved source objects.
  // policyId/setPolicyId retain the immutable version token last reviewed for optimistic conflict checks.
  const [name, setName] = useState(definition?.name ?? ""),
    [code, setCode] = useState(definition?.code ?? ""),
    [note, setNote] = useState(definition?.note ?? ""),
    [policyId, setPolicyId] = useState(definition?.policy.id ?? "");
  // steps/setSteps retain ordered amount/unit text; windowDays/setWindowDays retain clean-window day text.
  // mode/setMode select the next revision's decay rule without changing existing event assessments.
  const [steps, setSteps] = useState(
      (definition?.policy.steps ?? [30]).map(editableStep),
    ),
    [windowDays, setWindowDays] = useState(
      String(definition?.policy.clean_window_days ?? 7),
    ),
    [mode, setMode] = useState<TypeInput["decay_mode"]>(
      definition?.policy.decay_mode ?? "step_down",
    );
  // pending/setPending lock an operation; error/setError retain rejection feedback without clearing drafts.
  // review/setReview expose the latest saved rule after explicit optimistic-conflict recovery.
  const [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null),
    [review, setReview] = useState<string | null>(null);
  /** Merge amount/unit patch into the zero-based index draft, preserving the saved source definition. */
  function changeStep(
    index: number,
    patch: Partial<{ amount: string; unit: string }>,
  ) {
    // current is the latest ordered draft; step/position identify the one row receiving patch.
    // Replace only that object so neighbouring steps and the accepted source remain unchanged.
    setSteps((current) =>
      current.map((step, position) =>
        position === index ? { ...step, ...patch } : step,
      ),
    );
  }
  /** Confirm the latest version after a conflict without discarding the operator's draft. */
  async function reviewLatest() {
    // Lock review alongside saves so the reviewed token cannot change during an unresolved write.
    setPending(true);
    setError(null);
    try {
      // latest is this same type's newest scoped definition, never another name-matching catalogue entry.
      const latest = (await api.types(fleetId)).find(
        // type is one refreshed candidate; stable UUID survives metadata changes by another operator.
        (type) => type.id === definition?.id,
      );
      // Removed or archived definitions cannot supply a usable token for another edit attempt.
      if (!latest || latest.archived_at)
        throw new Error("This offence is no longer available for editing.");
      // Display the accepted rule explicitly while preserving every local field for a considered retry.
      setPolicyId(latest.policy.id);
      setReview(
        `Latest policy v${latest.policy.number}: ${latest.policy.steps.map(formatDuration).join(" -> ")}. Your draft is unchanged; review it before saving.`,
      );
    } catch (failure) {
      // failure may mean lost permission or an unavailable type; keep the draft and previous review visible.
      setError(describeError(failure));
    } finally {
      // Release both save and review controls regardless of whether a usable version was found.
      setPending(false);
    }
  }
  /** Handle native event submission and publish a fully validated ladder or retain a rejected draft. */
  async function submit(event: FormEvent) {
    // The application owns feedback and refresh; native navigation must not discard an invalid draft.
    event.preventDefault();
    setError(null);
    // A whitespace-only label cannot identify a reporting choice; leave it editable for correction.
    if (!name.trim()) {
      setError("A name is required.");
      return;
    }
    if (
      types.some(
        // type is another saved choice; exclude the edited identity before comparing normalized names.
        (type) =>
          type.id !== definition?.id &&
          type.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      // Case-insensitive duplicate labels are ambiguous; the backend repeats this check for concurrent writes.
      setError("Another offence type already uses that name.");
      return;
    }
    // durations holds whole-minute totals or null for each ordered draft; step is its amount/unit pair.
    // Preserve invalid text for correction instead of rounding or substituting a duration.
    const durations = steps.map((step) => stepMinutes(step.amount, step.unit));
    // duration is one conversion result; any null prevents publishing the entire inconsistent ladder.
    if (durations.some((duration) => duration === null)) {
      setError("Every step must represent a positive whole-minute duration.");
      return;
    }
    if (
      !/^\d+$/.test(windowDays) ||
      !Number.isSafeInteger(Number(windowDays)) ||
      Number(windowDays) < 1
    ) {
      // A clean window is a positive integral day count, not an implicitly rounded or exponent-form value.
      setError("Enter a positive whole clean-window day count.");
      return;
    }
    // body contains normalized metadata and validated minutes/day/mode values for one atomic publication.
    const body: TypeInput = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      note: note.trim(),
      steps: durations as number[],
      clean_window_days: Number(windowDays),
      decay_mode: mode,
    };
    // Lock the complete draft until metadata and any new immutable policy version are accepted together.
    setPending(true);
    try {
      // Existing definitions require their reviewed token; creation lets the backend assign a fresh identity.
      if (definition)
        await api.updateType(fleetId, definition.id, {
          ...body,
          expected_policy_id: policyId,
        });
      else await api.createType(fleetId, body);
      onSaved();
    } catch (failure) {
      // failure includes stale-policy conflicts; retain all fields so explicit review can precede another save.
      setError(describeError(failure));
    } finally {
      // Both rejected and accepted operations release this mounted dialog's interaction lock.
      setPending(false);
    }
  }
  return (
    <Modal
      title={definition ? "Edit offence type" : "Add offence type"}
      busy={pending}
      onDismiss={onDismiss}
    >
      <form
        className="modal-body"
        onSubmit={(event) => {
          // event carries either keyboard Enter or the save action through identical validation.
          void submit(event);
        }}
      >
        <p>
          Define the modelled ladder. Saved cooldowns keep their original policy
          and assessment.
        </p>
        <div className="form-columns">
          <label>
            Name
            <input
              autoFocus
              maxLength={100}
              disabled={pending}
              value={name}
              onChange={(event) => {
                // event changes the display-name draft; duplicate validation waits for explicit publication.
                setName(event.target.value);
              }}
            />
          </label>
          <label>
            Short code
            <input
              maxLength={4}
              disabled={pending}
              value={code}
              onChange={(event) => {
                // event retains the short-code draft; request normalization applies uppercase on save.
                setCode(event.target.value);
              }}
            />
          </label>
        </div>
        <label>
          Note
          <textarea
            rows={2}
            maxLength={2000}
            disabled={pending}
            value={note}
            onChange={(event) => {
              // event edits the trigger note without changing the accepted catalogue while typing.
              setNote(event.target.value);
            }}
          />
        </label>
        <fieldset>
          <legend>Escalation ladder</legend>
          {steps.map((step, index) => {
            // step/index identify this ordered draft row; minutes is its whole-minute preview or null.
            // Show invalid conversion explicitly instead of presenting a fabricated saved duration.
            const minutes = stepMinutes(step.amount, step.unit);
            return (
              <div className="step-editor" key={index}>
                <strong>Step {index + 1}</strong>
                <label>
                  Step {index + 1} amount
                  <input
                    type="number"
                    min="0"
                    step="any"
                    disabled={pending}
                    value={step.amount}
                    onChange={(event) => {
                      // event retains raw quantity text; only this row's amount is replaced in the draft.
                      changeStep(index, { amount: event.target.value });
                    }}
                  />
                </label>
                <label>
                  Step {index + 1} unit
                  <select
                    disabled={pending}
                    value={step.unit}
                    onChange={(event) => {
                      // event selects the interpretation of this amount; other rows keep their own units.
                      changeStep(index, { unit: event.target.value });
                    }}
                  >
                    <option value="m">Minutes</option>
                    <option value="h">Hours</option>
                    <option value="d">Days</option>
                  </select>
                </label>
                <span className={severity(minutes ?? 0)}>
                  {minutes === null
                    ? "Invalid duration"
                    : formatDuration(minutes)}
                </span>
                <button
                  type="button"
                  className="secondary"
                  disabled={pending || steps.length === 1}
                  aria-label={`Remove step ${index + 1}`}
                  onClick={() => {
                    // At least one step remains, matching the server's nonempty policy invariant.
                    // current is the latest draft; position, rather than the unused step, identifies removal.
                    setSteps((current) =>
                      current.filter((_, position) => position !== index),
                    );
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className="secondary"
            disabled={pending}
            onClick={() => {
              // current is the latest ordered draft; append an editable one-day row before publication.
              setSteps((current) => [...current, { amount: "1", unit: "d" }]);
            }}
          >
            Add step
          </button>
          <p className="muted">
            Changing units reinterprets the amount. Preview shows the exact
            saved duration. Then holds at the final step.
          </p>
        </fieldset>
        <div className="form-columns">
          <label>
            Clean window (days)
            <input
              type="number"
              min="1"
              step="1"
              disabled={pending}
              value={windowDays}
              onChange={(event) => {
                // event retains clean-window day text for integral validation at the publication boundary.
                setWindowDays(event.target.value);
              }}
            />
          </label>
          <label>
            Decay mode
            <select
              disabled={pending}
              value={mode}
              onChange={(event) => {
                // event selects one supported decay rule; existing assessments keep their pinned policy.
                setMode(event.target.value as TypeInput["decay_mode"]);
              }}
            >
              <option value="step_down">Step down one level</option>
              <option value="full_reset">Full reset</option>
              <option value="none">No decay</option>
            </select>
          </label>
        </div>
        <p className="muted">
          Clean time starts at the latest outstanding expiry. One day is 24
          elapsed hours.
        </p>
        {review && <p role="status">{review}</p>}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {definition && (
          <button
            type="button"
            className="secondary"
            disabled={pending}
            onClick={() => {
              // Explicit review acknowledges a newer token without silently replacing the operator's draft.
              void reviewLatest();
            }}
          >
            Review latest policy
          </button>
        )}
        <div className="dialog-actions">
          <button
            type="button"
            className="secondary"
            disabled={pending}
            onClick={onDismiss}
          >
            Cancel
          </button>
          <button disabled={pending}>
            {pending ? "Saving offence type..." : "Save offence type"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
