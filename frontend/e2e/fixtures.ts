import { test as base } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { components } from "@template/api-client";
import { createFleet, createTrackedAccount, readJson, selectFleet, signInThroughForm } from "./support";

/** Credentials exist only in the disposable Docker test database. */
export interface TestAccount {
  /** A provisioned ordinary Django username for this worker's test principals. */
  username: string;
  /** A fresh random secret supplied by the test runner, never a committed default. */
  password: string;
}

/** One isolated tenant and account created through authenticated public API commands. */
export interface TrackedFleet {
  /** Current owner-scoped tenant response from the generated public contract. */
  fleet: components["schemas"]["Fleet"];
  /** A real persisted tracked account, separate from its operator's Django identity. */
  account: components["schemas"]["AccountDetail"];
  /** Editable rule defaults belong to this unique fleet rather than shared fixture history. */
  types: components["schemas"]["OffenceType"][];
}

/** Fixtures isolate cookie jars and tenant data while reusing provisioned operator passwords. */
interface ApplicationFixtures {
  /** The primary ordinary operator owns every unique fleet created by this case. */
  account: TestAccount;
  /** A separate ordinary operator starts without membership of this case's new fleet. */
  otherAccount: TestAccount;
  /** A page signed in through the real Django login and browser API transport. */
  signedInPage: Page;
  /** A per-test tenant avoids count and history assumptions about earlier worker cases. */
  trackedFleet: TrackedFleet;
  /** The authenticated page has selected its own unique fleet and loaded its real records. */
  fleetPage: Page;
}

// parallelIndex matches the two ordinary principal pairs seeded by local-dev.sh for each run.
export const test = base.extend<ApplicationFixtures>({
  account: async ({ browserName }, provideAccount, testInfo) => {
    // password is injected once for this disposable run and must never fall back to a default.
    const password = process.env.E2E_PASSWORD;
    if (!password) throw new Error(`Run ./local-dev.sh test e2e to provision ${browserName} test accounts.`);
    await provideAccount({ username: `e2e-worker-${testInfo.parallelIndex}`, password });
  },
  otherAccount: async ({ account }, provideOtherAccount, testInfo) => {
    // This user has no implicit access to a fleet newly created by the current case.
    await provideOtherAccount({ username: `e2e-other-${testInfo.parallelIndex}`, password: account.password });
  },
  signedInPage: async ({ page, account }, providePage) => {
    // Every case starts with a new browser context and the actual username/password form.
    await signInThroughForm(page, account);
    await providePage(page);
  },
  trackedFleet: async ({ signedInPage: page }, provideFleet) => {
    // All seed operations use the same protected APIs as the application, including CSRF.
    const fleet = await createFleet(page.request);
    // This account is owned by the current case's isolated fleet, with identity returned by the real API.
    const account = await createTrackedAccount(page.request, fleet.id);
    const types = await readJson<components["schemas"]["OffenceType"][]>(page.request, `/api/fleets/${fleet.id}/types/`);
    await provideFleet({ fleet, account, types });
  },
  fleetPage: async ({ signedInPage: page, trackedFleet }, providePage) => {
    // Reload discovers the case's newly created tenant through the normal session/bootstrap path.
    await selectFleet(page, trackedFleet.fleet.id);
    await providePage(page);
  },
});

// Existing tests and new acceptance files share one assertion and authentication boundary.
export { expect } from "@playwright/test";
export { signInRequest, signInThroughForm } from "./support";
