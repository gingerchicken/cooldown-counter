/** Exercise automatic contract tooling with isolated files and controllable generation processes. */
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { clientSourceDigest, createGenerationQueue, regenerateApiClient, schemaDigest } from "./watch-api.mjs";

/** Build a disposable workspace without installing dependencies or using the real contract. */
async function fixtureWorkspace() {
  // workspaceRoot owns every generated fixture file and is removed by each test's cleanup hook.
  const workspaceRoot = await mkdtemp(join(tmpdir(), "cooldown-contract-"));
  // frontendRoot, outputPath and schemaPath mirror the actual repository boundary paths.
  const frontendRoot = join(workspaceRoot, "frontend");
  const outputPath = join(frontendRoot, "packages/api-client/src/schema.d.ts");
  const schemaPath = join(workspaceRoot, "backend/openapi.json");
  await mkdir(dirname(outputPath), { recursive: true });
  await mkdir(dirname(schemaPath), { recursive: true });
  await writeFile(schemaPath, '{"openapi":"3.0.3"}\n');
  return { workspaceRoot, frontendRoot, outputPath, schemaPath };
}

test("failed schema conversion preserves prior declarations and removes private output", async (context) => {
  // fixture paths belong only to this test and do not touch the checked-in generated interface.
  const { workspaceRoot, frontendRoot, outputPath } = await fixtureWorkspace();
  context.after(() => rm(workspaceRoot, { recursive: true, force: true }));
  await writeFile(outputPath, "export interface Accepted {}\n");

  // runCommand simulates partial CLI output followed by an invalid-schema failure.
  const runCommand = async (_command, argumentsList) => {
    await writeFile(argumentsList.at(-1), "partial output");
    throw new Error("invalid schema");
  };
  await assert.rejects(regenerateApiClient({ frontendRoot, runCommand }), /invalid schema/);
  assert.equal(await readFile(outputPath, "utf8"), "export interface Accepted {}\n");
  assert.deepEqual(await readdir(dirname(outputPath)), ["schema.d.ts"]);
});

test("unchanged generated declarations retain their timestamp and still build the SDK", async (context) => {
  // outputPath and originalModifiedMs identify accepted declaration source before regeneration.
  const { workspaceRoot, frontendRoot, outputPath } = await fixtureWorkspace();
  context.after(() => rm(workspaceRoot, { recursive: true, force: true }));
  await writeFile(outputPath, "export interface Accepted {}\n");
  const originalModifiedMs = (await stat(outputPath)).mtimeMs;
  // commands captures sequencing without invoking real npm or generating real application source.
  const commands = [];
  const runCommand = async (command, argumentsList) => {
    commands.push({ command, argumentsList });
    if (command !== "npm") await writeFile(argumentsList.at(-1), "export interface Accepted {}\n");
  };
  await regenerateApiClient({ frontendRoot, runCommand });
  assert.equal((await stat(outputPath)).mtimeMs, originalModifiedMs);
  assert.equal(commands.length, 2);
  assert.deepEqual(commands[1], { command: "npm", argumentsList: ["run", "api:build"] });
});

test("valid changed declarations become public before the package builds", async (context) => {
  // This workspace has old source so publication order can be asserted from the fake builder.
  const { workspaceRoot, frontendRoot, outputPath } = await fixtureWorkspace();
  context.after(() => rm(workspaceRoot, { recursive: true, force: true }));
  await writeFile(outputPath, "old declaration\n");
  // runCommand checks that npm compilation sees the complete newly accepted declarations.
  const runCommand = async (command, argumentsList) => {
    if (command === "npm") assert.equal(await readFile(outputPath, "utf8"), "new declaration\n");
    else await writeFile(argumentsList.at(-1), "new declaration\n");
  };
  await regenerateApiClient({ frontendRoot, runCommand });
  assert.deepEqual(await readdir(dirname(outputPath)), ["schema.d.ts"]);
});

test("types-only generation leaves package compilation to its explicit caller", async (context) => {
  // The startup API script deliberately separates declaration generation and package building.
  const { workspaceRoot, frontendRoot } = await fixtureWorkspace();
  context.after(() => rm(workspaceRoot, { recursive: true, force: true }));
  // commandCount proves the types-only path invokes only its converter.
  let commandCount = 0;
  const runCommand = async (_command, argumentsList) => {
    commandCount += 1;
    await writeFile(argumentsList.at(-1), "generated declaration\n");
  };
  await regenerateApiClient({ frontendRoot, buildClient: false, runCommand });
  assert.equal(commandCount, 1);
});

test("queued source changes never overlap generators and coalesce during an active pass", async () => {
  // releaseFirst and firstPass gate the first tool run while several schema changes arrive.
  let releaseFirst;
  const firstPass = new Promise((resolveFirst) => { releaseFirst = resolveFirst; });
  // generatedPasses, activePasses and maximumActive measure externally observable queue behavior.
  let generatedPasses = 0;
  let activePasses = 0;
  let maximumActive = 0;
  const requestGeneration = createGenerationQueue(async () => {
    activePasses += 1;
    maximumActive = Math.max(maximumActive, activePasses);
    generatedPasses += 1;
    if (generatedPasses === 1) await firstPass;
    activePasses -= 1;
  });
  // activeBatch represents all requests accumulated before the initial generation completes.
  const activeBatch = requestGeneration();
  requestGeneration();
  requestGeneration();
  releaseFirst();
  await activeBatch;
  assert.equal(generatedPasses, 2);
  assert.equal(maximumActive, 1);
});

test("a later corrected schema can generate after a failed queued attempt", async () => {
  // attempts and failures distinguish recovery from an automatic repeat of the rejected input.
  let attempts = 0;
  const failures = [];
  const requestGeneration = createGenerationQueue(async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("broken schema");
  }, (failure) => { failures.push(failure.message); });
  await requestGeneration();
  assert.equal(attempts, 1);
  await requestGeneration();
  assert.equal(attempts, 2);
  assert.deepEqual(failures, ["broken schema"]);
});

test("content digest follows changed contracts while missing input remains recoverable", async (context) => {
  // schemaPath models the accepted Django output as it changes between watcher snapshots.
  const { workspaceRoot, schemaPath } = await fixtureWorkspace();
  context.after(() => rm(workspaceRoot, { recursive: true, force: true }));
  // firstDigest identifies initial content rather than an inode or only a modification timestamp.
  const firstDigest = await schemaDigest(schemaPath);
  await writeFile(schemaPath, '{"openapi":"3.1.0"}\n');
  assert.notEqual(await schemaDigest(schemaPath), firstDigest);
  await rm(schemaPath);
  assert.equal(await schemaDigest(schemaPath), null);
});

test("SDK source digest follows handwritten modules without retriggering on generated declarations", async (context) => {
  // The fixture source directory has both handwritten transport code and generated declarations.
  const { workspaceRoot, outputPath } = await fixtureWorkspace();
  context.after(() => rm(workspaceRoot, { recursive: true, force: true }));
  // sourceDirectory and transportPath identify the SDK's watched handwritten boundary.
  const sourceDirectory = dirname(outputPath);
  const transportPath = join(sourceDirectory, "index.ts");
  await writeFile(transportPath, "export const endpoint = 'first';\n");
  await writeFile(outputPath, "first generated schema\n");
  // initialDigest captures the transport before a schema-generation-only edit.
  const initialDigest = await clientSourceDigest(sourceDirectory);
  await writeFile(outputPath, "second generated schema\n");
  assert.equal(await clientSourceDigest(sourceDirectory), initialDigest);
  await writeFile(transportPath, "export const endpoint = 'changed';\n");
  assert.notEqual(await clientSourceDigest(sourceDirectory), initialDigest);
});
