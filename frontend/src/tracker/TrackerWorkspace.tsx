import { useCallback, useMemo, useState } from "react";
import type { ApiClient, AuthenticatedUser } from "@template/api-client";
import { typedTrackerApi } from "./api";
import { useResource } from "./useResource";
import { FleetWorkspace } from "./FleetWorkspace";
import { FleetDialog } from "./FleetDialog";

/** Mount authorized fleet state beneath the existing Django and cross-tab identity gate. */
export function TrackerWorkspace({
  client,
  user,
  onSessionExpired,
  onSignOut,
  isLoggingOut,
  logoutError,
}: {
  client: ApiClient;
  user: AuthenticatedUser;
  onSessionExpired: () => void;
  onSignOut: () => Promise<void>;
  isLoggingOut?: boolean;
  logoutError?: string | null;
}) {
  // One adapter shares the existing HttpOnly cookies and CSRF transport without copying secrets.
  const api = useMemo(() => {
    // Adapter identity stays stable across presentation renders and shares the parent session transport.
    return typedTrackerApi(client, onSessionExpired);
  }, [client, onSessionExpired]);
  // load is stable until the session transport changes, keeping membership polling within one ownership boundary.
  const load = useCallback(
    (signal: AbortSignal) => {
      // Cancellation prevents an obsolete session read from restoring earlier memberships.
      return api.listFleets(signal);
    },
    [api],
  );
  // Remote membership removal or role changes must eventually update the protected UI boundary.
  const resource = useResource(load, 60000);
  // selectedId is the requested tenant UUID; creating controls a local fleet draft. Neither persists across users.
  const [selectedId, setSelectedId] = useState(""),
    [creating, setCreating] = useState(false);
  // fleets is the accepted membership list; selected falls back to its first authorized fleet after removal.
  const fleets = resource.data ?? [],
    selected = fleets.find((fleet) => fleet.id === selectedId) ?? fleets[0];
  return (
    <>
      {selected ? (
        <FleetWorkspace
          key={`${selected.id}-${selected.role}`}
          api={api}
          fleet={selected}
          fleets={fleets}
          user={user}
          onFleet={setSelectedId}
          onCreateFleet={() => {
            // Open a new fleet draft inside the current authenticated session only.
            setCreating(true);
          }}
          onFleetsChanged={resource.retry}
          onSignOut={onSignOut}
          isLoggingOut={isLoggingOut}
          logoutError={logoutError}
        />
      ) : (
        <main className="onboarding">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              CC
            </span>
            <div>
              <h1>Cooldown Counter</h1>
              <p>Private CS2 fleet tracking</p>
            </div>
          </div>
          {resource.pending && <p role="status">Loading your fleets...</p>}
          {resource.error && (
            <section>
              <p role="alert" className="error">
                {resource.error}
              </p>
              <button className="secondary" onClick={resource.retry}>
                Retry loading
              </button>
            </section>
          )}
          {resource.data && !resource.data.length && (
            <section className="panel">
              <h2>No fleets yet</h2>
              <p>
                Create a fleet or ask an existing owner to add your username:{" "}
                <strong>{user.username}</strong>.
              </p>
              <button
                onClick={() => {
                  // Open a new fleet draft inside the current authenticated session only.
                  setCreating(true);
                }}
              >
                Create fleet
              </button>
            </section>
          )}
          <button
            className="secondary"
            disabled={isLoggingOut}
            onClick={() => {
              // Let the parent confirm Django logout before removing the authenticated workspace.
              void onSignOut();
            }}
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
          {logoutError && (
            <p role="alert" className="error">
              {logoutError}
            </p>
          )}
        </main>
      )}
      {resource.error && selected && (
        <p role="alert" className="floating-error">
          Fleet membership could not be refreshed. {resource.error}
        </p>
      )}
      {creating && (
        <FleetDialog
          onDismiss={() => {
            // Close the local creation draft without retaining it across a later session.
            setCreating(false);
          }}
          onSave={api.createFleet}
          onSaved={(fleet) => {
            // Select the accepted new identity and refresh memberships before exposing its private records.
            setCreating(false);
            setSelectedId(fleet.id);
            resource.retry();
          }}
        />
      )}
    </>
  );
}
