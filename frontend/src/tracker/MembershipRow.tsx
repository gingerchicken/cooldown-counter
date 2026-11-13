import { useState } from "react";
import type { Membership } from "./types";
import type { TrackerApi } from "./api";
import { describeError } from "./api";

/**
 * Edit member's saved role through fleetId-scoped api calls when canManage allows owner controls.
 * onChanged reloads accepted grants and workspace permissions; the backend protects the last owner.
 */
export function MembershipRow({
  member,
  canManage,
  api,
  fleetId,
  onChanged,
}: {
  member: Membership;
  canManage: boolean;
  api: TrackerApi;
  fleetId: string;
  onChanged: () => void;
}) {
  // role/setRole own the unsaved role; confirm/setConfirm arm removal only for this mounted member.
  // pending/setPending lock a mutation; error/setError preserve its recoverable rejection message.
  const [role, setRole] = useState(member.role),
    [confirm, setConfirm] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null);
  /** Apply a role update, or arm/confirm deletion when remove is true; surface backend rejection locally. */
  async function change(remove = false) {
    if (remove && !confirm) {
      // The first removal action requests explicit confirmation rather than revoking access immediately.
      setConfirm(true);
      return;
    }
    // One unresolved membership change must not race another action from this row.
    setPending(true);
    setError(null);
    try {
      // Both branches use the saved member identity and selected fleet, not an editable username.
      if (remove) await api.removeMember(fleetId, member.id);
      else await api.updateMember(fleetId, member.id, role);
      onChanged();
    } catch (failure) {
      // failure includes last-owner protection; disarm deletion so retry requires fresh confirmation.
      setConfirm(false);
      setError(describeError(failure));
    } finally {
      // Accepted and rejected requests both release the row's interaction lock.
      setPending(false);
    }
  }
  return (
    <tr>
      <td>
        {member.username}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </td>
      <td>
        <label className="sr-only" htmlFor={`member-${member.id}`}>
          Role for {member.username}
        </label>
        <select
          id={`member-${member.id}`}
          disabled={!canManage || pending}
          value={role}
          onChange={(event) => {
            // event changes only the role draft; a different intended action invalidates armed removal.
            setRole(event.target.value as Membership["role"]);
            setConfirm(false);
          }}
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="owner">Owner</option>
        </select>
      </td>
      <td>
        <div className="toolbar-buttons">
          <button
            className="secondary"
            disabled={!canManage || pending}
            onClick={() => {
              // Saving publishes the selected role through the common feedback and permission refresh path.
              void change();
            }}
          >
            Save role {member.username}
          </button>
          <button
            className="danger-button"
            disabled={!canManage || pending}
            onClick={() => {
              // Use the same action for arm and confirm so both steps target this exact saved member.
              void change(true);
            }}
          >
            {confirm ? "Confirm remove" : "Remove"} {member.username}
          </button>
          {confirm && (
            <button
              className="secondary"
              onClick={() => {
                // Cancel affects only removal confirmation and preserves any unsaved role selection.
                setConfirm(false);
              }}
            >
              Cancel removal
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
