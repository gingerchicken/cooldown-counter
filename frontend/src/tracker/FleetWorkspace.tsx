import { useCallback, useEffect, useState } from "react";
import type { AuthenticatedUser } from "@template/api-client";
import type { TrackerApi } from "./api";
import type { Account, Filters, Fleet, OffenceType } from "./types";
import { useResource } from "./useResource";
import {
  EMPTY_FILTERS,
  filterAccounts,
  filterEvents,
  filterForecasts,
} from "./filters";
import { isoDate, monthStart } from "./calendar";
import { FilterBar } from "./FilterBar";
import { CalendarView } from "./CalendarView";
import { AccountsTable } from "./AccountsTable";
import { AccountDetailScreen } from "./AccountDetailScreen";
import { TypeReference } from "./TypeReference";
import { MembersPanel } from "./MembersPanel";
import { AuditPanel } from "./AuditPanel";
import { ReportDialog } from "./ReportDialog";
import { AccountDialog } from "./AccountDialog";
import { TypeEditor } from "./TypeEditor";

/** One modal discriminant prevents overlapping editors and stale drafts across workspace changes. */
type ActiveModal =
  | { kind: "report" }
  | { kind: "account"; account?: Account }
  | { kind: "type"; definition?: OffenceType }
  | null;
/** Workspace destinations are presentation state, never an authorization decision. */
type View = "calendar" | "accounts" | "detail" | "types" | "members" | "audit";

/** Own only one fleet's protected data; changing its key discards filters, drafts and confirmations. */
export function FleetWorkspace({
  api,
  fleet,
  fleets,
  user,
  onFleet,
  onCreateFleet,
  onFleetsChanged,
  onSignOut,
  isLoggingOut,
  logoutError,
}: {
  api: TrackerApi;
  fleet: Fleet;
  fleets: Fleet[];
  user: AuthenticatedUser;
  onFleet: (id: string) => void;
  onCreateFleet: () => void;
  onFleetsChanged: () => void;
  onSignOut: () => Promise<void>;
  isLoggingOut?: boolean;
  logoutError?: string | null;
}) {
  // view selects the destination, filters narrow its records, modal owns one draft, selectedId identifies detail,
  // and detailVersion refreshes that detail after accepted writes. All belong to this tenant mount only.
  const [view, setView] = useState<View>("calendar"),
    [filters, setFilters] = useState<Filters>({
      ...EMPTY_FILTERS,
      typeIds: [],
    }),
    [modal, setModal] = useState<ActiveModal>(null),
    [selectedId, setSelectedId] = useState(""),
    [detailVersion, setDetailVersion] = useState(0);
  // Accepted changes are announced in a persistent live region after their modal disappears.
  const [saveNotice, setSaveNotice] = useState("");
  // Present-day navigation must survive the calendar view unmounting during a different-range read.
  const [shouldRevealToday, setShouldRevealToday] = useState(false);
  // baseMonth and monthCount bound the requested UTC range; now is the periodically refreshed presentation clock.
  // The initial four-month range begins three months before the present month.
  const [baseMonth, setBaseMonth] = useState(() => monthStart(Date.now(), -3)),
    [monthCount, setMonthCount] = useState(4),
    [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    // Presentation date boundaries update without inventing a browser implementation of decay.
    const timer = setInterval(() => {
      // Update presentation dates while leaving all penalty calculations on the server.
      setNow(Date.now());
    }, 30000);
    return () => {
      // Release the display clock when this tenant workspace is unmounted.
      clearInterval(timer);
    };
  }, []);
  // Server role drives visible write affordances; every endpoint independently rechecks it.
  const canWrite = fleet.role !== "viewer";
  // load identifies one exact tenant/range generation so earlier responses cannot populate another range.
  const load = useCallback(
    async (signal: AbortSignal) => {
      // Shared cancellation keeps one consistent generation of accounts, rules and calendar records.
      const [accounts, types, calendar] = await Promise.all([
        api.accounts(fleet.id, signal),
        api.types(fleet.id, signal),
        api.calendar(
          fleet.id,
          {
            start: isoDate(baseMonth),
            end: isoDate(monthStart(baseMonth, monthCount)),
          },
          signal,
        ),
      ]);
      return { accounts, types, calendar };
    },
    [api, fleet.id, baseMonth, monthCount],
  );
  // resource owns accepted projections and serializes minute polls with explicit denial and outage states.
  const resource = useResource(load, 60000);
  useEffect(() => {
    // Wait for the accepted range before touching its owning-month anchor; other views cancel this intent.
    if (!shouldRevealToday || !resource.data || view !== "calendar") return;
    // frame owns one post-render reveal, cancelled if a newer range or view replaces it first.
    const frame = requestAnimationFrame(() => {
      // today is unique to the owning month, avoiding duplicate dates in adjacent-month spillover cells.
      const today = document.getElementById("calendar-today");
      if (today) {
        // Reduced-motion users receive the same destination without an animated journey.
        today.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
        setShouldRevealToday(false);
      }
    });
    return () => {
      // Superseded layout work must not pull the operator back to an obsolete navigation request.
      cancelAnimationFrame(frame);
    };
  }, [shouldRevealToday, resource.data, view]);
  // accounts and types are the accepted fleet-local catalogues; absent snapshots remain explicitly pending or failed.
  const accounts = resource.data?.accounts ?? [],
    types = resource.data?.types ?? [];
  // typeCodes maps stable offence UUIDs to configured display codes once per render instead of rescanning each calendar span.
  const typeCodes = new Map(
    types.map((definition) => {
      // Current catalogue metadata supplies compact text; saved events retain their complete type identity and history.
      return [definition.id, definition.code];
    }),
  );
  // events are saved assessments; forecasts are separately filtered modelled transitions, never historical evidence.
  const events = filterEvents(
      resource.data?.calendar.events ?? [],
      accounts,
      filters,
      now,
    ),
    forecasts = filterForecasts(
      resource.data?.calendar.forecasts ?? [],
      accounts,
      filters,
    );
  // selectedAccount supplies the readable detail heading without treating mutable tags as identity.
  const selectedAccount = accounts.find((account) => account.id === selectedId);
  // firstDates orders recorded ISO UTC timestamps so earliest-history navigation has an exact lower anchor.
  const firstDates = accounts
    .flatMap((account) =>
      account.first_observed ? [account.first_observed] : [],
    )
    .sort();
  // Headings describe each destination without exposing internal API/schema implementation terms.
  const title =
    view === "calendar"
      ? "Cooldown calendar"
      : view === "accounts"
        ? "Accounts"
        : view === "detail"
          ? (selectedAccount?.tag ?? "Account")
          : view === "types"
            ? "Cooldowns"
            : view === "members"
              ? "Members"
              : "Audit history";
  /** Navigation dismisses old editors/confirmations instead of carrying a destructive action forward. */
  function navigate(destination: View) {
    // Never carry an unsaved modal or destructive confirmation to a different destination.
    setModal(null);
    setView(destination);
    setSaveNotice("");
    setShouldRevealToday(false);
  }
  /** Accepted writes refresh all affected projections and any mounted account detail. */
  function changed(message = "Changes saved.") {
    // Both aggregate projections and independent detail reads can change after one accepted command.
    setSaveNotice(message);
    resource.retry();
    setDetailVersion((version) => {
      // A fresh detail mount must not reuse the history snapshot captured before this write.
      return version + 1;
    });
  }
  /** Open account detail from an exact fleet-local UUID rather than the currently searched tag. */
  function openAccount(id: string) {
    // Route through the exact fleet-local UUID and discard any completed or cancelled editor.
    setSelectedId(id);
    setView("detail");
    setModal(null);
  }
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Fleet navigation">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            CC
          </span>
          <div>
            <h1>Cooldown Counter</h1>
            <p>CS2 competitive cooldown tracking</p>
          </div>
        </div>
        <label className="fleet-select">
          Fleet
          <select
            value={fleet.id}
            onChange={(event) => {
              // The parent mounts a fresh tenant boundary, removing all old records and drafts immediately.
              onFleet(event.target.value);
            }}
          >
            {fleets.map((available) => {
              // Choices come only from this authenticated operator's accepted memberships.
              return (
                <option key={available.id} value={available.id}>
                  {available.name}
                </option>
              );
            })}
          </select>
        </label>
        <p className="role-label">
          {fleet.role} · {user.username}
        </p>
        <nav>
          {(
            [
              ["calendar", "Calendar"],
              ["accounts", "Accounts"],
              ["types", "Cooldowns"],
              ["members", "Members"],
              ["audit", "Audit"],
            ] as const
          ).map(([destination, label], index) => {
            // Account detail belongs to Accounts in the shared navigation hierarchy.
            const active =
              view === destination ||
              (destination === "accounts" && view === "detail");
            return (
              <button
                key={destination}
                className={active ? "nav-active" : ""}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  // Switch views through the boundary that dismisses unsaved modal state.
                  navigate(destination);
                }}
              >
                <span className="mono" aria-hidden="true">
                  0{index + 1}
                </span>
                {label}
              </button>
            );
          })}
        </nav>
        <div className="fleet-kpis">
          <p className="eyebrow">FLEET</p>
          <dl aria-label="Fleet totals">
            <div>
              <dt>Accounts</dt>
              <dd>{resource.data?.calendar.account_count ?? "..."}</dd>
            </div>
            <div>
              <dt>On cooldown</dt>
              <dd className="severity-4">
                {resource.data?.calendar.active_count ?? "..."}
              </dd>
            </div>
            <div>
              <dt>Recorded</dt>
              <dd>{resource.data?.calendar.recorded_count ?? "..."}</dd>
            </div>
          </dl>
        </div>
        <div className="sidebar-actions">
          <button
            disabled={
              !canWrite ||
              !accounts.some((account) => !account.archived_at) ||
              !types.some((type) => !type.archived_at)
            }
            onClick={() => {
              // Start a fresh report scoped to this fleet and the current account context.
              setModal({ kind: "report" });
            }}
          >
            Report observation
          </button>
          <button className="secondary" onClick={onCreateFleet}>
            Create fleet
          </button>
          <button
            className="text-button"
            disabled={isLoggingOut}
            onClick={() => {
              // Let the parent confirm Django logout before removing the authenticated workspace.
              void onSignOut();
            }}
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
      <main className="workspace">
        <header className="workspace-heading">
          <div>
            <p className="eyebrow">
              {fleet.name} / {view === "detail" ? "Accounts" : title}
            </p>
            <h2>{title}</h2>
            <p className="muted">
              {view === "calendar"
                ? "Every account, by day. Solid bars are recorded cooldowns; dashed marks are modelled step-downs."
                : view === "accounts"
                  ? "Exact Steam identities, current availability and independent ladder histories."
                  : view === "types"
                    ? "Maintain modelled ladders while preserving historical assessments."
                    : "Private fleet records with explicit membership and preserved evidence."}
            </p>
          </div>
          <div className="toolbar-buttons">
            {(view === "calendar" || view === "accounts") && (
              <button
                className="secondary"
                disabled={!canWrite}
                onClick={() => {
                  // Provision a real fleet-local identity rather than introducing demo account data.
                  setModal({ kind: "account" });
                }}
              >
                Add account
              </button>
            )}
            {view === "types" && (
              <button
                disabled={!canWrite}
                onClick={() => {
                  // Start a complete new policy draft without modifying saved historical assessments.
                  setModal({ kind: "type" });
                }}
              >
                Add offence type
              </button>
            )}
            <button
              className="secondary"
              onClick={() => {
                // Refresh role membership as well as rows after another owner changes permissions.
                resource.retry();
                onFleetsChanged();
              }}
            >
              Refresh
            </button>
          </div>
        </header>
        <div className="workspace-content">
          <p role="status" className={saveNotice ? "success" : "sr-only"}>
            {saveNotice}
          </p>
          {logoutError && (
            <p role="alert" className="error">
              {logoutError}
            </p>
          )}
          {resource.pending && <p role="status">Loading fleet records...</p>}
          {resource.error && (
            <div className="error-panel">
              <p role="alert" className="error">
                {resource.error}
              </p>
              <button className="secondary" onClick={resource.retry}>
                Retry loading
              </button>
              <button className="secondary" onClick={onFleetsChanged}>
                Refresh fleet access
              </button>
              {resource.data && (
                <p>
                  Showing the last accepted snapshot. Refresh failed; this
                  information may be out of date.
                </p>
              )}
            </div>
          )}
          {resource.data && (
            <>
              {!accounts.some((account) => !account.archived_at) && (
                <section className="empty-state">
                  <h3>No active accounts tracked</h3>
                  <p>
                    {canWrite
                      ? "Add a real Steam account to begin recording cooldowns. The default ladders are editable model inputs."
                      : "An editor or owner can add accounts to this fleet."}
                  </p>
                </section>
              )}
              {(view === "calendar" || view === "accounts") && (
                <FilterBar
                  accounts={accounts}
                  types={types}
                  filters={filters}
                  onChange={setFilters}
                />
              )}
              {view === "calendar" && (
                <CalendarView
                  baseMonth={baseMonth}
                  monthCount={monthCount}
                  now={now}
                  events={events}
                  forecasts={forecasts}
                  typeCodes={typeCodes}
                  earliest={firstDates[0] ?? null}
                  onRange={(base, count, revealToday = false) => {
                    // Change the explicit UTC range; resource ownership hides its previous-range snapshot.
                    setShouldRevealToday(revealToday);
                    setBaseMonth(base);
                    setMonthCount(count);
                  }}
                  onAccount={(id) => {
                    // Repeated activation toggles exact account focus while retaining other filter dimensions.
                    setFilters((current) => {
                      // Preserve independent search/type/status constraints while toggling this exact UUID.
                      return {
                        ...current,
                        accountId: current.accountId === id ? "" : id,
                      };
                    });
                  }}
                />
              )}
              {view === "accounts" && (
                <AccountsTable
                  key={JSON.stringify(filters)}
                  accounts={filterAccounts(accounts, filters)}
                  onOpen={openAccount}
                />
              )}
              {view === "detail" && (
                <AccountDetailScreen
                  key={`${selectedId}-${detailVersion}`}
                  api={api}
                  fleetId={fleet.id}
                  accountId={selectedId}
                  canWrite={canWrite}
                  onBack={() => {
                    // Return to the same tenant account list without carrying an open report dialog.
                    navigate("accounts");
                  }}
                  onEdit={(account) => {
                    // Edit only this exact selected account identity and retain its historical evidence.
                    setModal({ kind: "account", account });
                  }}
                  onReport={() => {
                    // Start a fresh report scoped to this fleet and the current account context.
                    setModal({ kind: "report" });
                  }}
                  onChanged={changed}
                />
              )}
              {view === "types" && (
                <TypeReference
                  types={types}
                  canWrite={canWrite}
                  api={api}
                  fleetId={fleet.id}
                  onEdit={(definition) => {
                    // Review the selected type and its current version before accepting any new policy.
                    setModal({ kind: "type", definition });
                  }}
                  onChanged={changed}
                />
              )}
              {view === "members" && (
                <MembersPanel
                  api={api}
                  fleetId={fleet.id}
                  canManage={fleet.role === "owner"}
                  onChanged={() => {
                    // Membership changes can affect this operator's own role as well as the displayed rows.
                    onFleetsChanged();
                    changed();
                  }}
                />
              )}
              {view === "audit" && <AuditPanel api={api} fleetId={fleet.id} />}
            </>
          )}
          {resource.data && modal?.kind === "report" && (
            <ReportDialog
              accounts={accounts}
              types={types}
              accountContext={view === "detail" ? selectedId : undefined}
              api={api}
              fleetId={fleet.id}
              onDismiss={() => {
                // Discard the local editor after cancellation or acceptance rather than retain a stale draft.
                setModal(null);
              }}
              onSaved={(event) => {
                // Refresh accepted projections before opening the account named by the saved event.
                // Returning to Calendar must reveal a backdated record rather than the former range.
                setBaseMonth(monthStart(Date.parse(event.started_at)));
                changed("Cooldown and observation saved.");
                openAccount(event.account_id);
              }}
            />
          )}
          {resource.data && modal?.kind === "account" && (
            <AccountDialog
              account={modal.account}
              onDismiss={() => {
                // Discard the local editor after cancellation or acceptance rather than retain a stale draft.
                setModal(null);
              }}
              onSave={async (tag, steamId) => {
                // Provisioning and renaming remain separate generated API commands with exact identity.
                // account is the accepted server identity used to navigate after creation or metadata editing.
                const account = modal.account
                  ? await api.updateAccount(fleet.id, modal.account.id, { tag })
                  : await api.createAccount(fleet.id, {
                      tag,
                      steam_id: steamId,
                    });
                changed();
                openAccount(account.id);
              }}
            />
          )}
          {resource.data && modal?.kind === "type" && (
            <TypeEditor
              definition={modal.definition}
              types={types}
              api={api}
              fleetId={fleet.id}
              onDismiss={() => {
                // Discard the local editor after cancellation or acceptance rather than retain a stale draft.
                setModal(null);
              }}
              onSaved={() => {
                // Discard the local editor after cancellation or acceptance rather than retain a stale draft.
                setModal(null);
                changed();
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
