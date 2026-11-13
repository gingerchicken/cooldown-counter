import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "./Modal";
import { describeError } from "./api";
import type { Account } from "./types";

/**
 * Edit optional account metadata or provision a new exact SteamID through onSave(tag, steamId).
 * onDismiss discards this mounted draft; accepted onSave owns subsequent navigation and unmounting.
 */
export function AccountDialog({
  account,
  onDismiss,
  onSave,
}: {
  account?: Account;
  onDismiss: () => void;
  onSave: (tag: string, steamId: string) => Promise<void>;
}) {
  // tag and steamId retain raw editable labels/identity; pending gates submission and error keeps
  // recoverable feedback. Modal unmount resets all four values and their paired setters.
  const [tag, setTag] = useState(account?.tag ?? ""),
    [steamId, setSteamId] = useState(account?.steam_id ?? ""),
    [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null);
  /** Validate the native submit event and exact digit sequence without numeric SteamID coercion. */
  async function submit(event: FormEvent) {
    // A cancelled or invalid form never changes the tracked fleet.
    event.preventDefault();
    if (!tag.trim()) {
      // An empty display label cannot help operators distinguish this tracked account.
      setError("Enter an account tag.");
      return;
    }
    if (!/^[0-9]{17}$/.test(steamId)) {
      // Preserve a rejected identity draft rather than rounding or padding it into another account.
      setError("Enter exactly 17 SteamID digits.");
      return;
    }
    // The command retains both draft fields until its parent confirms an accepted response.
    setPending(true);
    setError(null);
    try {
      // Existing accounts use the same form while their identity remains read-only in the control.
      await onSave(tag.trim(), steamId);
    } catch (failure) {
      // failure is translated to literal display feedback while the operator's draft stays editable.
      setError(describeError(failure));
    } finally {
      // A failed save must release the form so the retained draft can be corrected or retried.
      setPending(false);
    }
  }
  return (
    <Modal
      title={account ? "Edit account" : "Add account"}
      onDismiss={onDismiss}
      busy={pending}
    >
      <form
        className="modal-body"
        onSubmit={(event) => {
          // event is the native submit action, shared by keyboard Enter and the visible save button.
          void submit(event);
        }}
      >
        <label>
          Account tag
          <input
            autoFocus
            value={tag}
            maxLength={100}
            disabled={pending}
            onChange={(event) => {
              // event carries raw label text; editing it cannot change an account relationship.
              setTag(event.target.value);
            }}
          />
        </label>
        <label>
          SteamID
          <input
            inputMode="numeric"
            value={steamId}
            readOnly={Boolean(account)}
            disabled={pending}
            maxLength={17}
            onChange={(event) => {
              // event supplies identity text; string state preserves all digits in the generated request.
              setSteamId(event.target.value);
            }}
          />
        </label>
        <p className="muted">
          SteamID is an exact 17-digit identity. Archival preserves every
          recorded cooldown.
        </p>
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
            {pending ? "Saving account..." : "Save account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
