import { useCallback } from "react";
import type { TrackerApi } from "./api";
import { useResource } from "./useResource";
import { formatTimestamp } from "./format";

/** Inspect api's recent accepted changes for fleetId without exposing another tenant's mutations. */
export function AuditPanel({
  api,
  fleetId,
}: {
  api: TrackerApi;
  fleetId: string;
}) {
  // An exact fleet boundary owns the complete lifetime of this bounded audit read.
  const load = useCallback(
    // signal cancels this tenant-owned read when the selected workspace is no longer current.
    (signal: AbortSignal) => api.audit(fleetId, signal),
    [api, fleetId],
  );
  // resource separates accepted audit entries from pending/error feedback and an explicit retry action.
  const resource = useResource(load);
  return (
    <section className="panel" aria-label="Fleet audit history">
      <p className="muted">
        Latest 100 accepted fleet changes. Historical account and offence
        identities remain preserved.
      </p>
      {resource.pending && <p role="status">Loading audit history...</p>}
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
      {resource.data?.length === 0 && <p>No accepted changes recorded.</p>}
      <ol className="audit-list">
        {resource.data?.map((entry) => {
          // entry retains server-selected action/actor facts; details are inspectable literal JSON,
          // not HTML or a source for reconstructing credentials.
          return (
            <li key={entry.id}>
              <div>
                <strong>{entry.action}</strong>
                <span>
                  {entry.actor} · {formatTimestamp(entry.created_at)}
                </span>
              </div>
              <details>
                <summary>Change details</summary>
                <pre>{JSON.stringify(entry.details, null, 2)}</pre>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
