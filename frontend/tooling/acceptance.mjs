/** Validate acceptance traceability and derive proof only from actual Playwright executions. */
import assert from "node:assert/strict";
import console from "node:console";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

// frontendRoot resolves source, manifest and report paths independently of the invoking shell.
const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// These categories separate executable assertions from inspection, product choices and unresolved gaps.
const dispositionNames = new Set(["browser_assertion", "test_assertion", "implementation_inspected", "user_alternative", "implementation_assumption", "implementation_gap", "decision_pending"]);

/** Extract the exact source candidate contracts while ignoring unrelated document formatting. */
export function requirementCatalog(sourceText) {
  // Sections alternate canonical requirement IDs and their bodies; headings between records remain harmless.
  const sections = sourceText.split(/^### (RQ-\d+)\s*$/m);
  const records = [];
  for (let index = 1; index < sections.length; index += 2) {
    // Each record captures only the fields this ledger claims to review, rather than copying discovery prose.
    const id = sections[index];
    const body = sections[index + 1];
    const story = body.match(/- Trace: \[(US-\d+)\]/)?.[1];
    const statement = body.match(/\*\*Statement:\*\* (.*)/)?.[1];
    const acceptanceCondition = body.match(/- Acceptance condition: (.*)/)?.[1];
    assert(story && statement && acceptanceCondition, `Incomplete source contract ${id}.`);
    records.push({ id, story, statement, acceptanceCondition });
  }
  return records;
}

/** Count disposition classes without treating implementation inspection as executed acceptance proof. */
export function dispositionSummary(dispositions) {
  // Every category remains in the output, including zero counts that must not silently disappear.
  return Object.fromEntries([...dispositionNames].map((name) => [name, dispositions.filter((entry) => entry.disposition === name).length]));
}

/** Require one honest disposition for every original atomic candidate and resolve its case references. */
export function validateDispositions(manifest, cases, requirementsText = null) {
  // The ledger is complete only when every one-based baseline ID appears exactly once.
  const { baselineCount, dispositions, assertions } = manifest.atomicRequirements;
  assert.equal(dispositions.length, baselineCount, "Every original atomic requirement needs a disposition.");
  const seen = new Set();
  const assertionById = new Map(assertions.map((assertion) => [assertion.id, assertion]));
  for (const record of dispositions) {
    // Source contracts and reasons remain explicit even when a candidate is replaced or not independently proven.
    const number = Number(record.id.slice(3));
    assert(/^RQ-\d{3}$/.test(record.id) && number >= 1 && number <= baselineCount, `Unknown disposition ${record.id}.`);
    assert(!seen.has(record.id), `Duplicate disposition ${record.id}.`);
    seen.add(record.id);
    assert(dispositionNames.has(record.disposition), `Unknown disposition class for ${record.id}.`);
    assert(record.statement && record.acceptanceCondition && record.reason && record.story, `Incomplete disposition ${record.id}.`);
    assert(manifest.catalog.storyIds.includes(record.story), `Unknown source story for ${record.id}.`);
    assert(record.evidence.length > 0, `No source or test references for ${record.id}.`);
    for (const identity of [...(record.cases ?? []), ...(record.relatedCases ?? [])]) {
      // Related workflow cases remain navigable context, without becoming exact assertion claims.
      assert(cases.has(identity), `${record.id} references missing case ${identity}.`);
    }
    if (record.disposition === "browser_assertion") {
      // Only this exact class may enter the independently executed full-stack proof subset.
      const assertion = assertionById.get(record.id);
      assert(assertion, `${record.id} has no executable browser assertion mapping.`);
      assert.equal(assertion.statement, record.statement, `Source statement drift for ${record.id}.`);
      assert.deepEqual(assertion.cases, record.cases, `Browser case drift for ${record.id}.`);
    }
    if (record.disposition === "test_assertion") {
      // A source path alone cannot establish that a named lower-layer assertion exists.
      assert(record.evidence.some((reference) => ["backend-test", "frontend-test"].includes(reference.kind) && reference.selector), `${record.id} has no named independent test assertion.`);
    }
    if (record.disposition === "user_alternative") {
      // A chosen policy needs a recorded decision source; implementation convenience is a different category.
      assert(record.decisionSource, `${record.id} has no user decision source.`);
    }
  }
  if (requirementsText !== null) {
    // Comparing extracted fields detects stale obligations while allowing unrelated documentation maintenance.
    const sourceRecords = requirementCatalog(requirementsText);
    const digest = createHash("sha256").update(JSON.stringify(sourceRecords)).digest("hex");
    assert.equal(digest, manifest.atomicRequirements.sourceDigest, "The atomic requirement contracts changed; review the disposition ledger.");
    assert.equal(sourceRecords.length, baselineCount, "The source atomic requirement count changed.");
    for (const original of sourceRecords) {
      const record = dispositions.find((candidate) => candidate.id === original.id);
      for (const field of ["story", "statement", "acceptanceCondition"]) assert.equal(record?.[field], original[field], `Source ${field} drift for ${original.id}.`);
    }
  }
  return { dispositions: seen.size, dispositionCounts: dispositionSummary(dispositions), atomicCatalogCompared: requirementsText !== null };
}

/** Resolve each unique referenced file once and reject invented test selectors before any proof claim. */
export async function validateEvidenceSources(manifest, root = frontendRoot) {
  // Deduplicating paths makes filesystem reads O(P), rather than O(R*E) for repeated references per criterion.
  const references = manifest.atomicRequirements.dispositions.flatMap((record) => record.evidence);
  const paths = [...new Set(references.map((reference) => reference.path))];
  const reads = await Promise.allSettled(paths.map((path) => readFile(resolve(root, path), "utf8")));
  const sources = new Map();
  for (const [index, reading] of reads.entries()) {
    // Missing files are broken traceability, rather than evidence that can be silently omitted.
    assert.equal(reading.status, "fulfilled", `Acceptance evidence source is unavailable: ${paths[index]}.`);
    sources.set(paths[index], reading.value);
  }
  for (const reference of references) {
    // Test selectors are checked against literal existing definitions, never executed as code or shell commands.
    const source = sources.get(reference.path);
    if (reference.kind === "backend-test") assert(source.includes(`def ${reference.selector}(`), `Missing backend assertion ${reference.path}::${reference.selector}.`);
    else if (reference.kind === "frontend-test") assert(source.includes(JSON.stringify(reference.selector)), `Missing frontend assertion ${reference.path}: ${reference.selector}.`);
    else assert.equal(reference.kind, "source", `Unknown evidence kind ${reference.kind}.`);
  }
  return { evidenceFiles: paths.length, evidenceReferences: references.length };
}

/** Extract a stable acceptance case identity from its literal Playwright title. */
export function caseId(title) {
  // Source story/requirement tags cannot masquerade as an independent executable case identity.
  const identity = title.match(/^\[([A-Z]+-\d{3})\]/)?.[1];
  return identity && !/^(?:US|RQ)-/.test(identity) ? identity : null;
}

/** Inspect literal source definitions without starting a browser or a service stack. */
export async function discoverCases(directory) {
  // cases maps stable IDs to source/title metadata; duplicate IDs must fail before execution.
  const cases = new Map();
  for (const filename of (await readdir(directory)).filter((name) => name.endsWith(".test.ts")).sort()) {
    // sourcePath and sourceText identify the actual file whose executable definitions are referenced.
    const sourcePath = join(directory, filename);
    const sourceText = await readFile(sourcePath, "utf8");
    for (const match of sourceText.matchAll(/\btest\(\s*"([^"\n]+)"/g)) {
      // title is a complete static test title, not a synthetic case invented from manifest metadata.
      const title = match[1];
      const identity = caseId(title);
      assert(identity, `A test in ${filename} has no stable acceptance case ID.`);
      assert(!cases.has(identity), `Duplicate executable case ${identity}.`);
      cases.set(identity, { title, file: filename, stories: [...title.matchAll(/\[(US-\d{3})\]/g)].map((story) => story[1]) });
    }
  }
  return cases;
}

/** Check all baseline stories and directly mapped atomic criteria against real source cases. */
export function validateManifest(manifest, cases, catalogText = null, requirementsText = null) {
  // Expected IDs are the captured source baseline; an optional mounted catalog also detects drift.
  const expectedStories = new Set(manifest.catalog.storyIds);
  const seenStories = new Set();
  assert.equal(expectedStories.size, 65, "This acceptance baseline requires all 65 original outcomes.");
  assert(manifest.requiredProjects.length > 0, "At least one required browser project is needed.");
  for (const story of manifest.stories) {
    // One outcome has one canonical record, even when several independent cases exercise it.
    assert(expectedStories.has(story.id), `Unknown outcome ${story.id}.`);
    assert(!seenStories.has(story.id), `Duplicate outcome ${story.id}.`);
    seenStories.add(story.id);
    assert(story.acceptance && story.source && story.title, `Missing acceptance metadata for ${story.id}.`);
    assert(["baseline", "alternative"].includes(story.implementation), `Unknown implementation status for ${story.id}.`);
    assert(story.cases.length > 0, `${story.id} has no executable cases.`);
    assert(story.cases.some((identity) => cases.get(identity)?.stories.includes(story.id)), `${story.id} is not tagged by any linked executable case.`);
    for (const identity of story.cases) assert(cases.has(identity), `${story.id} references missing case ${identity}.`);
    if (story.implementation === "alternative") assert(story.decisionNotes, `${story.id} must explain its replacement behavior.`);
  }
  assert.equal(seenStories.size, expectedStories.size, "The outcome catalog has unmapped stories.");
  // Atomic criteria are counted only when a distinct reviewed assertion record names real cases.
  const atomicIds = new Set();
  for (const assertion of manifest.atomicRequirements.assertions) {
    assert(/^RQ-\d{3}$/.test(assertion.id), `Invalid atomic requirement ${assertion.id}.`);
    assert(!atomicIds.has(assertion.id), `Duplicate atomic requirement ${assertion.id}.`);
    // Requirement numbering starts at one; accepting RQ-000 would falsely expand mapped coverage.
    const requirementNumber = Number(assertion.id.slice(3));
    assert(requirementNumber >= 1 && requirementNumber <= manifest.atomicRequirements.baselineCount, `Unknown atomic requirement ${assertion.id}.`);
    assert(assertion.statement && assertion.cases.length, `Missing assertion metadata for ${assertion.id}.`);
    atomicIds.add(assertion.id);
    for (const identity of assertion.cases) assert(cases.has(identity), `${assertion.id} references missing case ${identity}.`);
  }
  if (catalogText !== null) {
    // The source hash catches changed titles, status or outcome membership before a stale claim.
    const actualHash = createHash("sha256").update(catalogText).digest("hex");
    assert.equal(actualHash, manifest.catalog.sha256, "The story index changed; review and refresh acceptance mappings.");
    const currentIds = new Set([...catalogText.matchAll(/\| (US-\d{3}) \|/g)].map((match) => match[1]));
    assert.deepEqual(currentIds, expectedStories, "The current story catalog differs from the acceptance baseline.");
  }
  // A full disposition ledger complements the smaller browser-proof subset without expanding its proof claims.
  const dispositions = validateDispositions(manifest, cases, requirementsText);
  return { mappedStories: seenStories.size, executableCases: cases.size, independentlyMappedAtomicCriteria: atomicIds.size, atomicBaseline: manifest.atomicRequirements.baselineCount, catalogCompared: catalogText !== null, ...dispositions };
}

/** Traverse Playwright's nested suites without inferring success from test tags or a source list. */
export function executionResults(report) {
  // executions is keyed by executable identity and browser project; duplicates stay visible as errors.
  const executions = new Map();
  function visit(suites) {
    // Both file and describe suites can own specs; recursion retains each reported browser result.
    for (const suite of suites ?? []) {
      for (const specification of suite.specs ?? []) {
        const identity = caseId(specification.title);
        if (!identity) continue;
        for (const execution of specification.tests ?? []) {
          // Clean success excludes skipped, flaky, unexpectedly passed and missing executions.
          const results = execution.results ?? [];
          const cleanPass = execution.expectedStatus === "passed"
            && execution.status === "expected"
            && results.length > 0
            && results.every((result) => result.status === "passed");
          const projectName = execution.projectName ?? execution.projectId;
          const key = `${identity}:${projectName}`;
          assert(!executions.has(key), `Duplicate execution result ${key}.`);
          executions.set(key, { case: identity, project: projectName, passed: cleanPass, status: execution.status ?? "missing", attempts: results.map((result) => result.status) });
        }
      }
      visit(suite.suites);
    }
  }
  visit(report.suites);
  return executions;
}

/** Decode the XML attribute entities emitted by pytest's built-in JUnit reporter. */
function xmlText(encoded) {
  // Reports are inert text; external entities, DTDs and executable input are never evaluated.
  return encoded.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, (entity, name) => {
    // Named entities and numeric code points preserve parametrized test identities exactly.
    const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
    if (name.startsWith("#x")) return String.fromCodePoint(Number.parseInt(name.slice(2), 16));
    if (name.startsWith("#")) return String.fromCodePoint(Number.parseInt(name.slice(1), 10));
    return named[name] ?? entity;
  });
}

/** Read pytest's constrained JUnit testcase shape without a host Python or XML dependency. */
export function backendResults(xml) {
  // Real testcase elements establish named assertions; a suite summary alone cannot provide proof.
  assert(/<testsuites?\b/.test(xml), "The backend report is not a JUnit test suite.");
  const tests = [];
  for (const match of xml.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g)) {
    // Attributes identify the module/function; child elements record failures and intentional skipping.
    const attributes = Object.fromEntries([...match[1].matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map((attribute) => [attribute[1], xmlText(attribute[3])]));
    const body = match[2] ?? "";
    const status = /<(?:failure|error)\b/.test(body) ? "failed" : /<skipped\b/.test(body) ? "skipped" : "passed";
    assert(attributes.name && attributes.classname, "A backend result has no module or test identity.");
    tests.push({ module: attributes.classname, name: attributes.name, status });
  }
  // Nonzero suite summaries also reject incomplete reports whose failure children were omitted.
  const failedSummary = /<testsuite\b[^>]*\b(?:errors|failures)\s*=\s*["'][1-9]\d*["']/.test(xml);
  return { kind: "backend", clean: !failedSummary && !/<(?:failure|error)\b/.test(xml), tests };
}

/** Read Vitest assertions while retaining unit and component reports as separate evidence layers. */
export function frontendResults(report) {
  // A runner failure cannot certify an otherwise partial result collection as an accepted gate.
  const tests = (report.testResults ?? []).flatMap((suite) => (suite.assertionResults ?? []).map((assertion) => ({ file: suite.name.replaceAll("\\", "/"), name: assertion.title, status: assertion.status })));
  return { kind: "frontend", clean: report.success === true, tests };
}

/** Match a literal title or declared Vitest printf placeholders to actual parameter results. */
function titlePattern(selector) {
  // Escaping literal punctuation prevents a criterion title from becoming an unintended broad regex.
  return new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%[sidfjoO]/g, ".*?")}$`);
}

/** Require all reported variants of a named independent assertion to pass in the correct layer. */
export function assertionResult(reference, reports) {
  // Components cannot borrow plain helper results, and frontend tests cannot borrow Python results.
  const layer = reference.kind === "backend-test" ? "backend" : reference.path.includes(".browser.test.") ? "component" : "unit";
  const report = reports[layer];
  if (!report) return { layer, source: reference.path, selector: reference.selector, passed: false, status: "missing-report", variants: [] };
  // File/module qualification prevents another similarly named assertion from supplying false proof.
  const module = reference.path.replace(/^\.\.\/backend\//, "").replace(/\.py$/, "").replaceAll("/", ".");
  const pattern = titlePattern(reference.selector);
  const matches = report.tests.filter((execution) => reference.kind === "backend-test"
    ? execution.module === module && (execution.name === reference.selector || execution.name.startsWith(`${reference.selector}[`))
    : (execution.file === reference.path || execution.file.endsWith(`/${reference.path}`)) && pattern.test(execution.name));
  const passed = report.clean && matches.length > 0 && matches.every((execution) => execution.status === "passed");
  return { layer, source: reference.path, selector: reference.selector, passed, status: !report.clean ? "report-failed" : matches.length === 0 ? "missing-test" : passed ? "passed" : "not-passed", variants: matches.map((execution) => ({ name: execution.name, status: execution.status })) };
}

/** Derive outcome/atomic proof while listing every criterion outside the exact executable subset. */
export function buildEvidence(manifest, report, lowerReports = {}) {
  // Real result entries are the only input capable of marking an acceptance condition as proven.
  const executions = executionResults(report);
  const reportErrors = report.errors ?? [];
  function checksFor(caseIds) {
    // Missing browser results remain explicit instead of disappearing from a percentage denominator.
    return caseIds.flatMap((identity) => manifest.requiredProjects.map((project) => executions.get(`${identity}:${project}`) ?? { case: identity, project, passed: false, status: "missing", attempts: [] }));
  }
  const stories = manifest.stories.map((story) => {
    // An alternative passes only its declared safe replacement, never the replaced original behavior.
    const checks = checksFor(story.cases);
    return { id: story.id, title: story.title, implementation: story.implementation, acceptance: story.acceptance, decisionNotes: story.decisionNotes, passed: reportErrors.length === 0 && checks.every((check) => check.passed), checks };
  });
  const atomicCriteria = manifest.atomicRequirements.assertions.map((assertion) => {
    // Direct assertions are independent records, not automatically inherited from story membership.
    const checks = checksFor(assertion.cases);
    return { ...assertion, passed: reportErrors.length === 0 && checks.every((check) => check.passed), checks };
  });
  const mappedIds = new Set(atomicCriteria.map((criterion) => criterion.id));
  const unmappedAtomicIds = Array.from({ length: manifest.atomicRequirements.baselineCount }, (_, index) => `RQ-${String(index + 1).padStart(3, "0")}`).filter((identity) => !mappedIds.has(identity));
  // Named lower-layer assertions need their own report; inspected source never borrows an execution.
  const criterionDispositions = manifest.atomicRequirements.dispositions.map((record) => {
    if (record.disposition === "browser_assertion") {
      // Only the exactly mapped browser criterion inherits its required project results.
      return { ...record, execution: atomicCriteria.find((criterion) => criterion.id === record.id)?.passed ? "passed" : "not-proven" };
    }
    if (record.disposition === "test_assertion") {
      // Every named assertion is required rather than choosing the easiest available evidence layer.
      const checks = record.evidence.filter((reference) => ["backend-test", "frontend-test"].includes(reference.kind)).map((reference) => assertionResult(reference, lowerReports));
      return { ...record, execution: checks.every((check) => check.passed) ? "passed" : "not-proven", checks };
    }
    return { ...record, execution: "not-evaluated-by-this-report" };
  });
  const lowerCriteria = criterionDispositions.filter((record) => record.disposition === "test_assertion");
  const requestedLowerLayers = Object.keys(lowerReports);
  const lowerLayerStatus = requestedLowerLayers.length === 0 ? "not-evaluated" : lowerCriteria.every((record) => record.execution === "passed") ? "passed" : "not-proven";
  return {
    status: reportErrors.length === 0 && stories.every((story) => story.passed) && atomicCriteria.every((criterion) => criterion.passed) ? "passed" : "not-proven",
    summary: { outcomes: stories.length, passedOutcomes: stories.filter((story) => story.passed).length, alternativeOutcomes: stories.filter((story) => story.implementation === "alternative").length, directlyMappedAtomicCriteria: atomicCriteria.length, passedMappedAtomicCriteria: atomicCriteria.filter((criterion) => criterion.passed).length, unmappedAtomicCriteria: unmappedAtomicIds.length, mappedLowerLayerAtomicCriteria: lowerCriteria.length, passedLowerLayerAtomicCriteria: lowerCriteria.filter((record) => record.execution === "passed").length, reportedExecutions: executions.size },
    stories,
    atomicCriteria,
    unmappedAtomicIds,
    reportErrors,
    criterionDispositions,
    lowerLayerStatus,
    requestedLowerLayers,
    dispositionCounts: dispositionSummary(manifest.atomicRequirements.dispositions),
    supportedEnvironment: manifest.supportedEnvironment ?? null,
    limits: manifest.limits,
  };
}

/** Produce a readable evidence artifact with honest scope and direct case/browser failure details. */
export function evidenceMarkdown(evidence) {
  // Lines retain outcomes and missing proof without copying browser logs or private test credentials.
  const lines = ["# Automated acceptance evidence", "", `Full-stack subset status: **${evidence.status}**.`, "", `${evidence.summary.passedOutcomes} of ${evidence.summary.outcomes} selected outcome contracts passed every required browser check.`, "", `${evidence.summary.alternativeOutcomes} outcomes use explicit implementation alternatives; this does not claim the replaced original behavior passed.`, "", `${evidence.summary.passedMappedAtomicCriteria} of ${evidence.summary.directlyMappedAtomicCriteria} directly mapped full-stack atomic criteria passed. ${evidence.summary.unmappedAtomicCriteria} original criteria are outside this full-stack subset.`, "", `Lower-layer assertion status: **${evidence.lowerLayerStatus}**; ${evidence.summary.passedLowerLayerAtomicCriteria} of ${evidence.summary.mappedLowerLayerAtomicCriteria} mapped criteria have passing independent backend/unit/component report evidence.`, "", "| Outcome | Result | Scope | Checks without proof |", "| --- | --- | --- | --- |"];
  for (const story of evidence.stories) {
    // A failed or skipped project is named, rather than hidden by another browser's success.
    const failed = story.checks.filter((check) => !check.passed).map((check) => `${check.case}/${check.project}: ${check.status}`).join(", ") || "None";
    lines.push(`| ${story.id} - ${story.title} | ${story.passed ? "Passed" : "Not proven"} | ${story.implementation} | ${failed} |`);
  }
  if (evidence.supportedEnvironment) {
    // The user-selected responsive contract retains exact CSS-pixel widths and enlargement percentages.
    const contract = evidence.supportedEnvironment;
    lines.push("", "## Exercised responsive contract", "", `Minimum width: ${contract.minimumWidthCssPixels} CSS pixels. Tested widths: ${contract.exercisedViewportWidthsCssPixels.join(", ")} CSS pixels. Text enlargement: ${contract.exercisedTextEnlargementPercent.join(", ")} percent.`, "", contract.limits);
  }
  lines.push("", "## Implementation alternatives", "");
  for (const story of evidence.stories.filter((entry) => entry.implementation === "alternative")) lines.push(`- ${story.id}: ${story.decisionNotes}`);
  lines.push("", "## Criteria outside the direct full-stack assertion subset", "", "These IDs are not asserted as passed by this Playwright report. The disposition ledger below distinguishes other named automated assertions, source inspection, alternatives and unresolved decisions.", "", evidence.unmappedAtomicIds.join(", "), "", "## Atomic candidate disposition ledger", "", "Lower-layer assertions need their own named passing report entries. Source inspection, implementation substitutions and unresolved environment decisions are not original-criterion acceptance proof.", "", "| Class | Candidates |", "| --- | ---: |");
  for (const [name, count] of Object.entries(evidence.dispositionCounts)) lines.push(`| ${name} | ${count} |`);
  lines.push("", "| Criterion | Disposition | Execution | Review |", "| --- | --- | --- | --- |");
  for (const record of evidence.criterionDispositions) {
    // Exact candidate statements remain available in JSON; prose reasons make the weaker evidence boundaries readable.
    const reason = `${record.reason}${record.acceptanceExampleVariance ? ` Source example variance: ${record.acceptanceExampleVariance}` : ""}`.replaceAll("|", "\\|").replaceAll("\n", " ");
    lines.push(`| ${record.id} | ${record.disposition} | ${record.execution} | ${reason} |`);
  }
  lines.push("", "## Evidence limits", "");
  for (const limit of evidence.limits) lines.push(`- ${limit}`);
  return `${lines.join("\n")}\n`;
}

/** Read optional catalog text when the complete repository is mounted into the tooling container. */
async function optionalCatalog(path) {
  try {
    return await readFile(path, "utf8");
  } catch (failure) {
    // A container with only frontend source can validate the captured baseline, but cannot claim drift checking.
    if (failure.code === "ENOENT") return null;
    throw failure;
  }
}

/** Validate statically, or require actual passed executions and publish JSON plus Markdown proof. */
async function main() {
  // CLI options are explicit local paths; none is executed as a shell command.
  const argumentsList = process.argv.slice(2);
  const manifest = JSON.parse(await readFile(join(frontendRoot, "acceptance.json"), "utf8"));
  const cases = await discoverCases(join(frontendRoot, "e2e"));
  const catalogIndex = argumentsList.indexOf("--catalog");
  const catalogPath = resolve(frontendRoot, catalogIndex >= 0 ? argumentsList[catalogIndex + 1] : manifest.catalog.path);
  const catalogText = await optionalCatalog(catalogPath);
  // The requirements mount is optional for source-only containers, with comparison status reported explicitly.
  const requirementsIndex = argumentsList.indexOf("--requirements");
  const requirementsPath = resolve(frontendRoot, requirementsIndex >= 0 ? argumentsList[requirementsIndex + 1] : manifest.atomicRequirements.sourcePath);
  const requirementsText = await optionalCatalog(requirementsPath);
  const validation = validateManifest(manifest, cases, catalogText, requirementsText);
  const sourceValidation = await validateEvidenceSources(manifest);
  if (catalogIndex >= 0) assert(catalogText !== null, `Explicit catalog not found: ${catalogPath}.`);
  if (requirementsIndex >= 0) assert(requirementsText !== null, `Explicit requirements not found: ${requirementsPath}.`);
  // Source-only validation never reports behavior as passed or manufactures an execution artifact.
  const reportIndex = argumentsList.indexOf("--report");
  if (reportIndex < 0) {
    console.log(JSON.stringify({ ...validation, ...sourceValidation, execution: "not evaluated" }, null, 2));
    return;
  }
  const reportPath = resolve(frontendRoot, argumentsList[reportIndex + 1]);
  const outputIndex = argumentsList.indexOf("--output");
  const outputPrefix = resolve(frontendRoot, outputIndex >= 0 ? argumentsList[outputIndex + 1] : "test-results/acceptance");
  // Optional reports combine local gate evidence without requiring artifacts from isolated CI jobs.
  const lowerReports = {};
  for (const [flag, layer] of [["--backend-report", "backend"], ["--unit-report", "unit"], ["--component-report", "component"]]) {
    // An explicitly requested missing artifact is an error, never a successful empty evidence layer.
    const optionIndex = argumentsList.indexOf(flag);
    if (optionIndex < 0) continue;
    const reportText = await readFile(resolve(frontendRoot, argumentsList[optionIndex + 1]), "utf8");
    lowerReports[layer] = layer === "backend" ? backendResults(reportText) : frontendResults(JSON.parse(reportText));
  }
  const evidence = buildEvidence(manifest, JSON.parse(await readFile(reportPath, "utf8")), lowerReports);
  await mkdir(dirname(outputPrefix), { recursive: true });
  await writeFile(`${outputPrefix}.json`, `${JSON.stringify(evidence, null, 2)}\n`);
  await writeFile(`${outputPrefix}.md`, evidenceMarkdown(evidence));
  console.log(JSON.stringify({ status: evidence.status, lowerLayerStatus: evidence.lowerLayerStatus, ...evidence.summary, artifacts: [relative(frontendRoot, `${outputPrefix}.json`), relative(frontendRoot, `${outputPrefix}.md`)] }, null, 2));
  if (evidence.status !== "passed" || (evidence.requestedLowerLayers.length > 0 && evidence.lowerLayerStatus !== "passed")) process.exitCode = 1;
}

// Importing this module for unit tests has no report-writing or process-lifecycle side effects.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
