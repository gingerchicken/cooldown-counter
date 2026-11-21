import { isMinimumDuration } from "./mechanisms";
import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "./Modal";
import { describeError } from "./api";
import type { TrackerApi } from "./api";
import type { CooldownEvent } from "./types";
import {
  formatDuration,
  newUuid,
  parseRemaining,
  parseUtcInput,
  utcInput,
} from "./format";

/**
 * Append evidence to event through the fleetId-scoped api, preserving the saved offence assessment.
 * onSaved refreshes accepted evidence; onDismiss discards the local time and remaining-minute drafts.
 */
export function ObservationDialog({
  event,
  api,
  fleetId,
  onDismiss,
  onSaved,
}: {
  event: CooldownEvent;
  api: TrackerApi;
  fleetId: string;
  onDismiss: () => void;
  onSaved: () => void;
}) {
  // observationId retains the draft's retry UUID across failed requests and unchanged retries.
  const [observationId] = useState(() => {
    // Allocate once per mounted draft instead of generating discarded identities on every input edit.
    return newUuid();
  });
  // observedAt/setObservedAt own UTC observation text; remaining/setRemaining own whole-minute evidence text.
  // pending/setPending lock this draft during writes; error/setError retain local or server rejection feedback.
  const [observedAt, setObservedAt] = useState(() => utcInput()),
    [remaining, setRemaining] = useState(""),
    [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null);
  /** Handle submitEvent without navigation, validate evidence, then append it to the saved event. */
  async function submit(submitEvent: FormEvent) {
    // Keep the evidence draft available on validation or request failure instead of navigating away.
    submitEvent.preventDefault();
    setError(null);
    // timestamp is a validated UTC ISO instant or null; minutes is positive whole evidence or null.
    // These parsers reject invalid text instead of silently substituting another time or quantity.
    const timestamp = parseUtcInput(observedAt),
      minutes = parseRemaining("", "", remaining);
    if (
      !timestamp ||
      Date.parse(timestamp) < Date.parse(event.started_at) ||
      Date.parse(timestamp) > Date.now()
    ) {
      // An observation cannot predate its event or claim evidence from a future instant.
      setError(
        "Observation time must be between cooldown start and now (UTC).",
      );
      return;
    }
    if (
      minutes === null ||
      (event.mechanism === "custom" &&
        event.total_minutes !== null &&
        minutes > event.total_minutes)
    ) {
      // The pinned custom policy retains its total constraint. Game notices may contradict a model prediction.
      setError(
        event.mechanism === "custom"
          ? `Enter positive whole minutes no greater than ${event.total_minutes}.`
          : "Enter positive whole minutes from the displayed timer.",
      );
      return;
    }
    // Retain both draft fields and their retry identity until the authoritative append has settled.
    setPending(true);
    try {
      // The event UUID supplies the offence identity, so this write cannot advance another step.
      await api.observe(fleetId, event.id, {
        id: observationId,
        observed_at: timestamp,
        remaining_minutes: minutes,
      });
      onSaved();
    } catch (failure) {
      // failure is a validation, session or transport rejection; the unchanged draft remains retryable.
      setError(describeError(failure));
    } finally {
      // Restore editing after a rejected write, and avoid leaving a still-mounted accepted form locked.
      setPending(false);
    }
  }
  return (
    <Modal title="Add an observation" busy={pending} onDismiss={onDismiss}>
      <form
        className="modal-body"
        onSubmit={(submitEvent) => {
          // submitEvent routes Enter and button activation through identical evidence validation.
          void submit(submitEvent);
        }}
      >
        <p>
          {event.account_tag} · {event.type_name}. This adds evidence to the
          same cooldown.
          {event.total_minutes !== null &&
            ` Saved total: ${isMinimumDuration(event.level_is_lower_bound, event.total_minutes) ? "at least " : ""}${formatDuration(event.total_minutes)}.`}
        </p>
        <label>
          Observed at (UTC)
          <input
            autoFocus
            type="datetime-local"
            disabled={pending}
            value={observedAt}
            onChange={(change) => {
              // change supplies local datetime text; UTC conversion waits until explicit submission.
              setObservedAt(change.target.value);
            }}
          />
        </label>
        <label>
          Remaining minutes
          <input
            type="number"
            min="1"
            step="1"
            disabled={pending}
            value={remaining}
            onChange={(change) => {
              // change retains the entered minute text so invalid or incomplete evidence stays editable.
              setRemaining(change.target.value);
            }}
          />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
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
            {pending ? "Saving observation..." : "Save observation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
