import { useState } from "react";
import type { Account, Filters, OffenceType } from "./types";
import { EMPTY_FILTERS } from "./filters";
import { formatDuration } from "./format";

/**
 * Edit filters over the supplied tenant-scoped accounts/types using native labelled controls.
 * onChange replaces the workspace filter snapshot; this component owns only offence-choice search text.
 */
export function FilterBar({
  accounts,
  types,
  filters,
  onChange,
}: {
  accounts: Account[];
  types: OffenceType[];
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  // typeSearch/setTypeSearch narrow visible offence choices without changing checked type identities.
  const [typeSearch, setTypeSearch] = useState("");
  // matchingAccounts contains real free-text matches, separate from the exact UUID filter that may remain active.
  const matchingAccounts = accounts.filter((account) => {
    // Search the full external identity without coercing its 17 digits to an imprecise numeric value.
    return `${account.tag} ${account.steam_id}`
      .toLowerCase()
      .includes(filters.search.trim().toLowerCase());
  });
  // selectedAccount resolves the active UUID; accountChoices keeps that option visible after an unmatched search.
  const selectedAccount = accounts.find(
      (account) => account.id === filters.accountId,
    ),
    accountChoices =
      selectedAccount && !matchingAccounts.includes(selectedAccount)
        ? [selectedAccount, ...matchingAccounts]
        : matchingAccounts;
  // matchingTypes supports honest zero-match feedback; typeChoices also retains selected checkboxes for removal.
  const matchingTypes = types.filter((definition) => {
      // Both the complete name and configured compact code are meaningful offence search terms.
      return `${definition.name} ${definition.code}`
        .toLowerCase()
        .includes(typeSearch.trim().toLowerCase());
    }),
    typeChoices = types.filter((definition) => {
      // A checked offence must remain inspectable even when later search text hides unselected choices.
      return (
        filters.typeIds.includes(definition.id) ||
        matchingTypes.includes(definition)
      );
    });
  // A single selected identity is more useful than a count, while unions keep an explicit total.
  const selectedTypeName = types.find(
    (definition) => definition.id === filters.typeIds[0],
  )?.name;
  // Reset appears only when an actual record-filter dimension differs from its unrestricted state.
  const hasActiveFilters = Boolean(
    filters.accountId ||
    filters.typeIds.length ||
    filters.search.trim() ||
    filters.status !== "all",
  );
  return (
    <section className="filter-bar" aria-label="Workspace filters">
      <label>
        Search accounts
        <input
          type="search"
          placeholder="Account tag or SteamID"
          value={filters.search}
          onChange={(event) => {
            // event carries free text, kept distinct from the exact selected account UUID.
            onChange({ ...filters, search: event.target.value });
          }}
        />
      </label>
      <label>
        Account filter
        <select
          value={filters.accountId}
          onChange={(event) => {
            // event supplies a chosen UUID, avoiding substring collisions between similar tags.
            onChange({ ...filters, accountId: event.target.value });
          }}
        >
          <option value="">All accounts</option>
          {accountChoices.map((account) => {
            // account retains both tag and full SteamID so duplicate human labels stay distinguishable.
            return (
              <option key={account.id} value={account.id}>
                {account.tag} · {account.steam_id}
              </option>
            );
          })}
        </select>
      </label>
      <label>
        Status filter
        <select
          value={filters.status}
          onChange={(event) => {
            // event contains one finite native status choice, with record/account meaning owned by the view.
            onChange({
              ...filters,
              status: event.target.value as Filters["status"],
            });
          }}
        >
          <option value="all">All</option>
          <option value="active">On cooldown</option>
          <option value="clear">Clear</option>
        </select>
      </label>
      <details className="offence-picker">
        <summary>
          {filters.typeIds.length === 1
            ? (selectedTypeName ?? "1 offence selected")
            : filters.typeIds.length > 1
              ? `${filters.typeIds.length} offences selected`
              : "All offences"}
        </summary>
        <fieldset>
          <legend>Offence filters</legend>
          <label>
            Search offences
            <input
              type="search"
              value={typeSearch}
              onChange={(event) => {
                // event carries offence-choice search text without changing the existing multi-selection.
                setTypeSearch(event.target.value);
              }}
            />
          </label>
          <button
            type="button"
            className="secondary"
            aria-label="All offences"
            onClick={() => {
              // Clear only the offence union while keeping account and status restrictions intact.
              setTypeSearch("");
              onChange({ ...filters, typeIds: [] });
            }}
          >
            Show all offences
          </button>
          {typeChoices.map((type) => {
            // type is one independently keyboard-operable member of the selected offence union.
            return (
              <label className="checkbox-label" key={type.id}>
                <input
                  type="checkbox"
                  aria-label={`${type.name}${type.archived_at ? " (archived)" : ""}`}
                  checked={filters.typeIds.includes(type.id)}
                  onChange={() => {
                    // Toggle only this type, preserving all other selected offence identities.
                    onChange({
                      ...filters,
                      typeIds: filters.typeIds.includes(type.id)
                        ? filters.typeIds.filter(
                            // id is another selected offence UUID; remove only this exact choice.
                            (id) => id !== type.id,
                          )
                        : [...filters.typeIds, type.id],
                    });
                  }}
                />
                {type.name}
                {type.archived_at ? " (archived)" : ""}
                <span className="muted">
                  {formatDuration(type.policy.steps[0])} first step
                </span>
              </label>
            );
          })}
          {types.length === 0 && <p>No offence types available.</p>}
          {types.length > 0 && matchingTypes.length === 0 && (
            <p role="status">No offences match this search.</p>
          )}
        </fieldset>
      </details>
      {hasActiveFilters && (
        <button
          type="button"
          className="secondary"
          onClick={() => {
            // Reset all dimensions together rather than leaving an invisible offence restriction.
            setTypeSearch("");
            onChange({ ...EMPTY_FILTERS, typeIds: [] });
          }}
        >
          Reset filters
        </button>
      )}
      {accounts.length > 0 && matchingAccounts.length === 0 && (
        <p className="filter-feedback" role="status">
          No accounts match this search.
        </p>
      )}
    </section>
  );
}
