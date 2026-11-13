import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import type { Membership } from "./types";
import type { TrackerApi } from "./api";
import { describeError } from "./api";
import { useResource } from "./useResource";
import { MembershipRow } from "./MembershipRow";

/**
 * Load memberships for fleetId through api and let canManage owners grant existing operators access.
 * onChanged refreshes workspace permissions after a successful grant or row mutation.
 */
export function MembersPanel({
  api,
  fleetId,
  canManage,
  onChanged,
}: {
  api: TrackerApi;
  fleetId: string;
  canManage: boolean;
  onChanged: () => void;
}) {
  // This resource is cancelled immediately if the selected tenant or operator changes.
  const load = useCallback(
    // signal cancels an obsolete fleet-scoped read when the resource's owner changes.
    (signal: AbortSignal) => api.members(fleetId, signal),
    [api, fleetId],
  );
  // resource owns the selected fleet's cancellable membership snapshot and explicit retry action.
  const resource = useResource(load);
  // username/setUsername identify an existing operator; role/setRole hold the unaccepted access grant.
  // pending/setPending serialize form submission; error/setError retain recoverable grant feedback.
  const [username, setUsername] = useState(""),
    [role, setRole] = useState<Membership["role"]>("viewer"),
    [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null);
  /** Refresh roles as well as rows after a mutation can change the current operator's privileges. */
  function changed() {
    resource.retry();
    onChanged();
  }
  /** Prevent native event navigation and grant the selected role to an already provisioned operator. */
  async function add(event: FormEvent) {
    // Keep the current fleet view mounted while reporting validation or backend failures locally.
    event.preventDefault();
    setError(null);
    if (!username.trim()) {
      // Blank input cannot resolve a principal; do not send a grant with an invented account identity.
      setError("Enter an existing operator username.");
      return;
    }
    // Disable repeated grants until the current authoritative request has settled.
    setPending(true);
    try {
      // Clear the username only after acceptance; refresh roles in case the current operator was affected.
      await api.addMember(fleetId, { username: username.trim(), role });
      setUsername("");
      changed();
    } catch (failure) {
      // failure may describe an inactive/missing principal or a conflicting membership; retain the draft.
      setError(describeError(failure));
    } finally {
      // Re-enable the form even when the API rejected the grant.
      setPending(false);
    }
  }
  return (
    <section className="panel" aria-label="Fleet membership">
      <p>
        Owners manage membership. Editors maintain accounts, rules and evidence.
        Viewers read only. The last owner is protected.
      </p>
      <form
        aria-label="Add member"
        className="inline-form"
        onSubmit={(event) => {
          // event supports Enter and button activation through the same validation path.
          void add(event);
        }}
      >
        <label>
          Operator username
          <input
            disabled={!canManage || pending}
            value={username}
            onChange={(event) => {
              // event supplies the username draft only; operator provisioning remains a separate concern.
              setUsername(event.target.value);
            }}
          />
        </label>
        <label>
          Member role
          <select
            disabled={!canManage || pending}
            value={role}
            onChange={(event) => {
              // event selects one backend role; choosing it does not grant privileges before submission.
              setRole(event.target.value as Membership["role"]);
            }}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="owner">Owner</option>
          </select>
        </label>
        <button disabled={!canManage || pending}>
          {pending ? "Adding member..." : "Add member"}
        </button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {resource.pending && <p role="status">Loading fleet members...</p>}
      {resource.error && (
        <div>
          <p role="alert" className="error">
            {resource.error}
          </p>
          <button className="secondary" onClick={resource.retry}>
            Retry loading
          </button>
        </div>
      )}
      {resource.data && (
        <div className="table-scroll">
          <table aria-label="Fleet members">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resource.data.map((member) => (
                // member is one saved grant; role in the key resets its draft after an accepted change.
                <MembershipRow
                  key={`${member.id}-${member.role}`}
                  member={member}
                  api={api}
                  fleetId={fleetId}
                  canManage={canManage}
                  onChanged={changed}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
