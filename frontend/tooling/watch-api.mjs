/** Keep the generated TypeScript contract synchronized with validated Django output. */
import { spawn } from "node:child_process";
import console from "node:console";
import { createHash, randomUUID } from "node:crypto";
import { readFile, readdir, rename, unlink } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { clearInterval, setInterval } from "node:timers";
import { fileURLToPath, pathToFileURL } from "node:url";

// defaultFrontendRoot locates the workspace independently of the invoking shell directory.
const defaultFrontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Execute one tooling process without shell interpolation or hidden automatic retries. */
export function runTool(command, argumentsList, workingDirectory) {
  // command and argumentsList are separate argv fields; workingDirectory is the frontend workspace.
  return new Promise((resolveRun, rejectRun) => {
    // child inherits diagnostics so generation failures remain visible in Docker logs.
    const child = spawn(command, argumentsList, { cwd: workingDirectory, stdio: "inherit" });
    child.once("error", rejectRun);
    child.once("exit", (exitCode, signal) => {
      // A signal or nonzero status cannot be treated as a successfully built interface.
      if (exitCode === 0) resolveRun();
      else rejectRun(new Error(`${command} failed (${signal ?? exitCode}).`));
    });
  });
}

/** Return generated-source bytes, or null when no previous accepted file exists. */
async function readOptionalFile(filePath) {
  // filePath points to public generated source rather than secret application configuration.
  try {
    return await readFile(filePath);
  } catch (readError) {
    // Missing initial output is normal on a fresh checkout; other failures need diagnosis.
    if (readError.code === "ENOENT") return null;
    throw readError;
  }
}

/**
 * Generate declarations into a private sibling and optionally build the SDK.
 * Invalid OpenAPI leaves the last accepted declarations intact. Changed valid
 * declarations are published atomically before TypeScript checks the SDK source.
 */
export async function regenerateApiClient({
  frontendRoot = defaultFrontendRoot,
  buildClient = true,
  runCommand = runTool,
} = {}) {
  // schemaPath is Django's validated input; outputPath is its public generated declaration.
  const schemaPath = resolve(frontendRoot, "../backend/openapi.json");
  const outputPath = join(frontendRoot, "packages/api-client/src/schema.d.ts");
  // temporaryPath is unique per process/attempt and stays on the output filesystem for rename.
  const temporaryPath = join(dirname(outputPath), `.schema-${randomUUID()}.d.ts`);
  try {
    // Use the installed locked CLI directly, avoiding npm installation or network lookup.
    await runCommand(process.execPath, [
      join(frontendRoot, "node_modules/openapi-typescript/bin/cli.js"),
      schemaPath,
      "--output",
      temporaryPath,
    ], frontendRoot);
    // generatedBytes and acceptedBytes avoid needlessly replacing unchanged declaration source.
    const generatedBytes = await readFile(temporaryPath);
    const acceptedBytes = await readOptionalFile(outputPath);
    if (acceptedBytes === null || !generatedBytes.equals(acceptedBytes)) {
      // Only complete successful conversion output becomes visible to Vite or typecheck.
      await rename(temporaryPath, outputPath);
    }
    if (buildClient) {
      // Building after generation checks the handwritten transport against its new contract.
      await runCommand("npm", ["run", "api:build"], frontendRoot);
    }
  } finally {
    // Rejected generation and unchanged output must not leave temporary declarations behind.
    await unlink(temporaryPath).catch((cleanupError) => {
      // Successful rename already removed this private path; other cleanup failures are real.
      if (cleanupError.code !== "ENOENT") throw cleanupError;
    });
  }
}

/** Serialize generation while coalescing edits that arrive during an active build. */
export function createGenerationQueue(generate, onError = console.error) {
  // requested records unsatisfied work; activeRun is shared by callers of this queue only.
  let requested = false;
  let activeRun = null;

  /** Drain one latest-state rebuild after each batch of changes without overlapping tools. */
  async function drain() {
    // Each completed pass consumes all edits that preceded its start.
    while (requested) {
      requested = false;
      try {
        await generate();
      } catch (generationError) {
        // Keep the watch process alive so another corrected schema can restore a valid build.
        onError(generationError);
      }
    }
  }

  /** Request a rebuild and return the active batch's completion promise. */
  function requestGeneration() {
    // Changes during a running pass collapse into one subsequent pass using the newest schema.
    requested = true;
    if (activeRun === null) {
      activeRun = drain().finally(() => {
        // Release ownership before handling a request queued at the promise-completion boundary.
        activeRun = null;
        if (requested) requestGeneration();
      });
    }
    return activeRun;
  }

  return requestGeneration;
}

/** Detect schema content changes even when an editor or Django replaces its inode. */
export async function schemaDigest(schemaPath) {
  // contents is null while an initial or temporarily unavailable schema is not yet present.
  const contents = await readOptionalFile(schemaPath);
  return contents === null ? null : createHash("sha256").update(contents).digest("hex");
}

/** Hash handwritten SDK sources so fixing a transport compile error triggers a fresh build. */
export async function clientSourceDigest(sourceDirectory) {
  // sourceEntries are sorted before hashing so filesystem enumeration order cannot trigger builds.
  const sourceEntries = await readdir(sourceDirectory, { withFileTypes: true });
  sourceEntries.sort((leftEntry, rightEntry) => leftEntry.name.localeCompare(rightEntry.name));
  // digest includes file names and bytes, but excludes generated declarations and tests.
  const digest = createHash("sha256");
  for (const sourceEntry of sourceEntries) {
    // sourcePath identifies the next handwritten module or nested source directory.
    const sourcePath = join(sourceDirectory, sourceEntry.name);
    if (sourceEntry.isDirectory()) {
      // Nested transport modules are included without treating generated output as another root.
      digest.update(sourceEntry.name).update(await clientSourceDigest(sourcePath));
    } else if (
      sourceEntry.name.endsWith(".ts")
      && sourceEntry.name !== "schema.d.ts"
      && !sourceEntry.name.startsWith(".schema-")
      && !sourceEntry.name.includes(".test.")
    ) {
      // Generated schema replacement cannot feed back into its own generation signature.
      digest.update(sourceEntry.name).update(await readFile(sourcePath));
    }
  }
  return digest.digest("hex");
}

/** Poll the schema and rebuild serially; return a stop callback for container shutdown. */
export function watchApiClient({
  frontendRoot = defaultFrontendRoot,
  pollIntervalMs = 500,
  generate = () => regenerateApiClient({ frontendRoot }),
  onError = console.error,
} = {}) {
  // pollIntervalMs is a portable Docker-mount polling delay, not a product latency guarantee.
  if (!Number.isFinite(pollIntervalMs) || pollIntervalMs <= 0) {
    throw new Error("pollIntervalMs must be positive and finite.");
  }
  // schemaPath, clientSourceDirectory, previousDigest and pollingInProgress belong to this watcher.
  const schemaPath = resolve(frontendRoot, "../backend/openapi.json");
  const clientSourceDirectory = join(frontendRoot, "packages/api-client/src");
  let previousDigest;
  let pollingInProgress = false;
  // requestGeneration owns serialization independently of asynchronous filesystem polling.
  const requestGeneration = createGenerationQueue(generate, onError);

  /** Observe one accepted schema snapshot without overlapping filesystem reads. */
  async function poll() {
    // Slow mounts must not accumulate concurrent polling work or duplicate rebuild requests.
    if (pollingInProgress) return;
    pollingInProgress = true;
    try {
      // currentSchemaDigest follows atomic renames; currentDigest also includes handwritten SDK edits.
      const currentSchemaDigest = await schemaDigest(schemaPath);
      const currentDigest = `${currentSchemaDigest}:${await clientSourceDigest(clientSourceDirectory)}`;
      if (currentSchemaDigest !== null && currentDigest !== previousDigest) {
        previousDigest = currentDigest;
        void requestGeneration();
      }
    } catch (pollError) {
      // A transient missing/unreadable mount is reported without ending the watch process.
      onError(pollError);
    } finally {
      pollingInProgress = false;
    }
  }

  // timer also handles the initial schema; independent generation remains idempotent at startup.
  const timer = setInterval(() => { void poll(); }, pollIntervalMs);
  void poll();
  return () => { clearInterval(timer); };
}

// Direct invocation owns process lifecycle; importing this module only exposes testable helpers.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.includes("--once")) {
    // Existing startup/build commands retain explicit failure status and generate before compiling.
    await regenerateApiClient({ buildClient: !process.argv.includes("--types-only") });
  } else {
    // The stop callback cancels only this watcher; running tools finish within normal container grace.
    const stopWatching = watchApiClient();
    process.once("SIGTERM", stopWatching);
    process.once("SIGINT", stopWatching);
  }
}
