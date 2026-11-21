import type { Account, CooldownEvent, Filters, Forecast } from "./types";

/** A new workspace starts without a hidden inherited account or offence restriction. */
export const EMPTY_FILTERS: Filters = {
  search: "",
  accountId: "",
  typeIds: [],
  status: "all",
};

/** Match account identity/labels against filters, keeping exact UUID selection separate from search. */
export function matchesAccount(
  account: Pick<Account, "id" | "tag" | "steam_id">,
  filters: Filters,
): boolean {
  // query is normalized free text; accountId remains an exact UUID so similar tags stay distinct.
  const query = filters.search.trim().toLowerCase();
  return (
    (!filters.accountId || filters.accountId === account.id) &&
    (!query ||
      account.tag.toLowerCase().includes(query) ||
      account.steam_id.includes(query))
  );
}

/** Return a new subset of accounts matching filters, using the same selected offence for status. */
export function filterAccounts(
  accounts: Account[],
  filters: Filters,
): Account[] {
  // The backend supplies recorded/active type IDs; predictions alone cannot prove historical use.
  return accounts.filter((account) => {
    // account is one server summary; a search or exact-identity failure is independent of availability.
    if (!matchesAccount(account, filters)) return false;
    // recorded means a selected type has historical evidence; active means that same selected
    // union is currently restricted. With no type selection, active uses whole-account status.
    const recorded = filters.typeIds.length
      ? account.recorded_type_ids.some(
          // id names an offence with saved evidence, not merely an available prediction.
          (id) => filters.typeIds.includes(id),
        )
      : true;
    const active = filters.typeIds.length
      ? account.active_type_ids.some(
          // id identifies a currently active offence so unrelated ladders cannot satisfy the filter.
          (id) => filters.typeIds.includes(id),
        )
      : account.status === "active";
    return (
      recorded &&
      (filters.status === "all" ||
        (filters.status === "active" ? active : !active))
    );
  });
}

/**
 * Return event records matching accounts/filters at epoch-millisecond now.
 * Calendar clear means an expired event, while fleet clear means an unrestricted account.
 */
export function filterEvents(
  events: CooldownEvent[],
  accounts: Account[],
  filters: Filters,
  now: number,
): CooldownEvent[] {
  // Account metadata is indexed once so each event avoids a repeated full-account search.
  const accountById = new Map(
    // account supplies one stable UUID-to-metadata pair for later exact event lookups.
    accounts.map((account) => [account.id, account]),
  );
  return events.filter((event) => {
    // event is one saved assessment; account is its metadata or undefined for a missing identity.
    const account = accountById.get(event.account_id);
    // active requires both temporal bounds; a future event cannot already restrict availability.
    const active =
      Date.parse(event.started_at) <= now && now < Date.parse(event.expires_at);
    return (
      Boolean(account && matchesAccount(account, filters)) &&
      (!filters.typeIds.length || filters.typeIds.includes(event.type_id)) &&
      (filters.status === "all" ||
        (filters.status === "active"
          ? active
          : Date.parse(event.expires_at) <= now))
    );
  });
}

/** Return forecasts matching account/type filters; event-status choices do not classify predictions. */
export function filterForecasts(
  forecasts: Forecast[],
  accounts: Account[],
  filters: Filters,
): Forecast[] {
  // Exact UUID filtering is shared with observed records but does not fabricate forecast status.
  const accountById = new Map(
    // account supplies the same exact identity metadata used by recorded-event filtering.
    accounts.map((account) => [account.id, account]),
  );
  return forecasts.filter((forecast) => {
    // forecast is a modeled reduction; account is its metadata or undefined when not available.
    // The caller keeps predictions visually and numerically distinct from recorded cooldowns.
    const account = accountById.get(forecast.account_id);
    if (!account || !matchesAccount(account, filters)) return false;
    // A direct reason match also covers independent custom ladders.
    if (!filters.typeIds.length || filters.typeIds.includes(forecast.type_id))
      return true;
    // All ordinary reasons share this account's marker. Other mechanisms still require their own exact ID.
    const ordinaryReasons = account.predictions.filter(
      (prediction) => prediction.mechanism === "ordinary",
    );
    return (
      ordinaryReasons.some((reason) => reason.type_id === forecast.type_id) &&
      ordinaryReasons.some((reason) => filters.typeIds.includes(reason.type_id))
    );
  });
}
