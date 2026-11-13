import { expect, test } from "./fixtures";
import { createTrackedAccount, csrfRequest, recordCooldown } from "./support";

test("[MODEL-001] [US-039] [US-040] independent ladders apply exact expiry-anchored decay boundaries and a final-step cap", async ({ fleetPage: page, trackedFleet }) => {
  // A fixed relative past origin keeps every synthetic acceptance timestamp valid on the server.
  const baseTimeMs = Date.now() - 100 * 86_400_000;
  // This seeded Abandoning definition supplies the real policy UUID used by this scenario.
  const abandoning = trackedFleet.types.find((definition) => definition.name === "Abandoning")!;
  // The unrelated Team Damage ladder must remain independent of Abandoning evidence.
  const teamDamage = trackedFleet.types.find((definition) => definition.name === "Team Damage")!;
  // This saved second-step assessment establishes the expiry from which clean time is measured.
  const prior = await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id, {
    startedAt: new Date(baseTimeMs).toISOString(),
    observedAt: new Date(baseTimeMs + 60_000).toISOString(),
    forcedStep: 2,
  });
  // These are genuine preview requests through Pages, not duplicate client-side prediction code.
  const boundaryMs = Date.parse(prior.expires_at) + 7 * 86_400_000;
  // The preview at the exact clean-window boundary must apply one completed decay window.
  const atBoundary = await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/preview/`, "POST", { account_id: trackedFleet.account.id, type_id: abandoning.id, started_at: new Date(boundaryMs).toISOString() });
  expect(atBoundary.status()).toBe(200);
  expect((await atBoundary.json()).step).toBe(2);
  // The preview one millisecond earlier must retain the undecayed state.
  const beforeBoundary = await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/preview/`, "POST", { account_id: trackedFleet.account.id, type_id: abandoning.id, started_at: new Date(boundaryMs - 1).toISOString() });
  expect((await beforeBoundary.json()).step).toBe(3);
  // A sufficiently late preview must return to the first reportable step.
  const fullyDecayed = await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/preview/`, "POST", { account_id: trackedFleet.account.id, type_id: abandoning.id, started_at: new Date(boundaryMs + 14 * 86_400_000).toISOString() });
  expect((await fullyDecayed.json()).step).toBe(1);
  // The unrelated offence preview proves histories are partitioned by stable type identity.
  const otherType = await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/preview/`, "POST", { account_id: trackedFleet.account.id, type_id: teamDamage.id, started_at: new Date(boundaryMs).toISOString() });
  expect((await otherType.json()).step).toBe(1);
  // A second account provides an independent history partition within the same fleet.
  const otherAccount = await createTrackedAccount(page.request, trackedFleet.fleet.id, "independent_account", "76561198039452204");
  // The second account's genuine preview must start at its own first ladder step.
  const untouched = await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/preview/`, "POST", { account_id: otherAccount.id, type_id: abandoning.id, started_at: new Date(boundaryMs).toISOString() });
  expect((await untouched.json()).step).toBe(1);
  // This accepted terminal-step event establishes a cap that later predictions cannot exceed.
  const final = await recordCooldown(page.request, trackedFleet.fleet.id, trackedFleet.account.id, abandoning.id, { startedAt: new Date(baseTimeMs + 86_400_000).toISOString(), observedAt: new Date(baseTimeMs + 86_400_000 + 60_000).toISOString(), forcedStep: 4 });
  // The next genuine preview verifies that escalation stops at the final configured step.
  const capped = await csrfRequest(page.request, `/api/fleets/${trackedFleet.fleet.id}/preview/`, "POST", { account_id: trackedFleet.account.id, type_id: abandoning.id, started_at: new Date(Date.parse(final.expires_at) + 60_000).toISOString() });
  expect((await capped.json()).step).toBe(4);
});
