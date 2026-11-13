import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "./Modal";
import { describeError } from "./api";
import type { Fleet } from "./types";

/**
 * Collect a new fleet name and await onSave's authoritative creation result before calling onSaved.
 * onDismiss discards this local draft; fleet ownership and default rules are assigned by the backend.
 */
export function FleetDialog({
  onDismiss,
  onSave,
  onSaved,
}: {
  onDismiss: () => void;
  onSave: (name: string) => Promise<Fleet>;
  onSaved: (fleet: Fleet) => void;
}) {
  // name/setName own the editable label; pending/setPending lock a submitted draft.
  // error/setError retain a recoverable validation or service message until the next attempt.
  const [name, setName] = useState(""),
    [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null);
  /** Handle the native event without navigation, retaining the name when fleet creation fails. */
  async function submit(event: FormEvent) {
    // The application owns navigation after an accepted API response.
    event.preventDefault();
    if (!name.trim()) {
      // Whitespace cannot identify a useful workspace; preserve it for the operator to correct.
      setError("Enter a fleet name.");
      return;
    }
    // Lock this exact draft and clear an earlier attempt's feedback while the request is unresolved.
    setPending(true);
    setError(null);
    try {
      // fleet is the accepted workspace whose owner membership and default ladders were created atomically.
      const fleet = await onSave(name.trim());
      onSaved(fleet);
    } catch (failure) {
      // failure is an API or network rejection; display its safe message without losing the name draft.
      setError(describeError(failure));
    } finally {
      // Both acceptance and failure must release the interaction lock before the next mounted render.
      setPending(false);
    }
  }
  return (
    <Modal title="Create fleet" onDismiss={onDismiss} busy={pending}>
      <form
        className="modal-body"
        onSubmit={(event) => {
          // event comes from native submission, supporting both Enter and the labelled create action.
          void submit(event);
        }}
      >
        <p>
          A fleet has its own members, Steam accounts and cooldown rules. You
          become its owner.
        </p>
        <label>
          Fleet name
          <input
            autoFocus
            value={name}
            maxLength={120}
            disabled={pending}
            onChange={(event) => {
              // event carries a revised local name, making earlier field feedback obsolete.
              setName(event.target.value);
              setError(null);
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
            {pending ? "Creating fleet..." : "Create fleet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
