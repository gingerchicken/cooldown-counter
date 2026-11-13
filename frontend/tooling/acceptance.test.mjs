/** Acceptance metadata must never count source tags, skipped tests or flaky retries as proof. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { assertionResult, backendResults, buildEvidence, caseId, evidenceMarkdown, executionResults, frontendResults, requirementCatalog, validateEvidenceSources, validateManifest } from "./acceptance.mjs";

/** Build a small isolated manifest with one reviewed atomic assertion and 65 tagged outcomes. */
function fixtureManifest() {
  // storyIds names the actual baseline shape while each fixture outcome shares one synthetic case.
  const storyIds = Array.from({ length: 65 }, (_, index) => `US-${String(index + 1).padStart(3, "0")}`);
  // dispositions account for every source candidate, while only criterion one has a browser assertion.
  const dispositions = Array.from({ length: 363 }, (_, index) => ({ id: `RQ-${String(index + 1).padStart(3, "0")}`, story: "US-001", statement: "A directly checked condition.", acceptanceCondition: "An explicit fixture condition.", reason: "An isolated ledger fixture.", disposition: index === 0 ? "browser_assertion" : "implementation_inspected", ...(index === 0 ? { cases: ["FIXTURE-001"] } : {}), evidence: [{ kind: "source", path: "fixture.ts" }] }));
  return { catalog: { storyIds }, requiredProjects: ["chromium", "firefox"], stories: storyIds.map((id) => ({ id, title: id, source: `${id}.md`, acceptance: "A concrete fixture outcome.", implementation: "baseline", cases: ["FIXTURE-001"] })), atomicRequirements: { baselineCount: 363, assertions: [{ id: "RQ-001", statement: "A directly checked condition.", cases: ["FIXTURE-001"] }], dispositions }, limits: ["Fixture evidence only."] };
}

/** Generate the real Playwright JSON shape for one clean or failed project execution. */
function fixtureReport(projectResults = { chromium: ["passed"], firefox: ["passed"] }) {
  // The specification owns actual browser result records rather than an inferred story-tag score.
  return { errors: [], suites: [{ specs: [{ title: "[FIXTURE-001] an executed acceptance case", tests: Object.entries(projectResults).map(([projectName, statuses]) => ({ projectName, expectedStatus: "passed", status: statuses.every((status) => status === "passed") ? "expected" : statuses.at(-1) === "passed" ? "flaky" : "unexpected", results: statuses.map((status) => ({ status })) })) }] }] };
}

test("case identity is separate from user-story tags", () => {
  assert.equal(caseId("[AUTH-001] [US-001] signed out"), "AUTH-001");
  assert.equal(caseId("a title without a stable ID"), null);
  assert.equal(caseId("[US-001] a story tag alone"), null);
  assert.equal(caseId("[RQ-001] an atomic criterion alone"), null);
});

test("manifest validation resolves all stories and direct assertions to real source cases", () => {
  // One synthetic source case is explicitly tagged for all fixture outcomes only in this unit fixture.
  const manifest = fixtureManifest();
  const cases = new Map([["FIXTURE-001", { stories: manifest.catalog.storyIds }]]);
  // The complete ledger must not inflate the single directly mapped full-stack criterion.
  const validation = validateManifest(manifest, cases);
  assert.equal(validation.mappedStories, 65);
  assert.equal(validation.executableCases, 1);
  assert.equal(validation.independentlyMappedAtomicCriteria, 1);
  assert.equal(validation.dispositions, 363);
  assert.equal(validation.dispositionCounts.implementation_inspected, 362);
  manifest.stories[0].cases = ["MISSING-001"];
  assert.throws(() => validateManifest(manifest, cases), /not tagged|missing case/);
});

test("the optional source catalog hash rejects stale acceptance metadata", () => {
  // A mounted catalog is compared byte-for-byte before current-catalog coverage can be claimed.
  const manifest = fixtureManifest();
  const catalogText = manifest.catalog.storyIds.map((identity) => `| ${identity} |`).join("\n");
  const cases = new Map([["FIXTURE-001", { stories: manifest.catalog.storyIds }]]);
  manifest.catalog.sha256 = createHash("sha256").update(catalogText).digest("hex");
  assert.equal(validateManifest(manifest, cases, catalogText).catalogCompared, true);
  assert.throws(() => validateManifest(manifest, cases, `${catalogText}\nchanged`), /story index changed/);
});

test("atomic mappings cannot invent requirement zero outside the source baseline", () => {
  // A well-formed identifier still needs a valid one-based source position.
  const manifest = fixtureManifest();
  const cases = new Map([["FIXTURE-001", { stories: manifest.catalog.storyIds }]]);
  manifest.atomicRequirements.assertions[0].id = "RQ-000";
  assert.throws(() => validateManifest(manifest, cases), /Unknown atomic requirement/);
});

test("every source candidate needs one disposition and invented user approvals are rejected", () => {
  // Completeness is checked independently from story coverage or directly mapped browser criteria.
  const manifest = fixtureManifest();
  const cases = new Map([["FIXTURE-001", { stories: manifest.catalog.storyIds }]]);
  manifest.atomicRequirements.dispositions.pop();
  assert.throws(() => validateManifest(manifest, cases), /Every original atomic requirement/);
  // A replacement needs an actual decision source, not an unexplained approval label.
  const alternativeManifest = fixtureManifest();
  alternativeManifest.atomicRequirements.dispositions[1].disposition = "user_alternative";
  assert.throws(() => validateManifest(alternativeManifest, cases), /no user decision source/);
});

test("atomic source drift is checked against exact statements and acceptance contracts", () => {
  // The extracted digest deliberately ignores unrelated formatting outside the reviewed contract fields.
  const manifest = fixtureManifest();
  const cases = new Map([["FIXTURE-001", { stories: manifest.catalog.storyIds }]]);
  const source = manifest.atomicRequirements.dispositions.map((record) => `### ${record.id}\n\n**Statement:** ${record.statement}\n- Trace: [${record.story}](story.md)\n- Acceptance condition: ${record.acceptanceCondition}\n`).join("\n");
  manifest.atomicRequirements.sourceDigest = createHash("sha256").update(JSON.stringify(requirementCatalog(source))).digest("hex");
  assert.equal(validateManifest(manifest, cases, null, source).atomicCatalogCompared, true);
  assert.throws(() => validateManifest(manifest, cases, null, source.replace("An explicit fixture condition.", "A changed source contract.")), /atomic requirement contracts changed/);
});

test("source validation rejects a named test that does not exist in its referenced file", async (context) => {
  // A temporary source tree exercises real file checks without touching repository tests or services.
  const root = await mkdtemp(join(tmpdir(), "acceptance-sources-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, "fixture.ts"), 'it("an actual behavior", () => {});\n');
  const manifest = fixtureManifest();
  manifest.atomicRequirements.dispositions[0].evidence = [{ kind: "frontend-test", path: "fixture.ts", selector: "an actual behavior" }];
  assert.equal((await validateEvidenceSources(manifest, root)).evidenceFiles, 1);
  manifest.atomicRequirements.dispositions[0].evidence[0].selector = "an invented passing behavior";
  await assert.rejects(validateEvidenceSources(manifest, root), /Missing frontend assertion/);
});

test("only real clean passing executions prove mapped outcomes and atomic criteria", () => {
  // The remaining 362 criteria stay unmapped despite every fixture story having a source reference.
  const evidence = buildEvidence(fixtureManifest(), fixtureReport());
  assert.equal(evidence.status, "passed");
  assert.equal(evidence.summary.passedOutcomes, 65);
  assert.equal(evidence.summary.passedMappedAtomicCriteria, 1);
  assert.equal(evidence.unmappedAtomicIds.length, 362);
  assert(!evidence.unmappedAtomicIds.includes("RQ-001"));
});

test("a missing browser project cannot disappear from the proof denominator", () => {
  const evidence = buildEvidence(fixtureManifest(), fixtureReport({ chromium: ["passed"] }));
  assert.equal(evidence.status, "not-proven");
  assert.equal(evidence.summary.passedOutcomes, 0);
  assert.equal(evidence.stories[0].checks.find((check) => check.project === "firefox").status, "missing");
});

test("a failed skipped or flaky browser execution is never counted as clean acceptance", () => {
  // Retried passes remain visible as flaky instead of disguising the preceding failed execution.
  for (const statuses of [["failed"], ["skipped"], ["failed", "passed"]]) {
    const evidence = buildEvidence(fixtureManifest(), fixtureReport({ chromium: ["passed"], firefox: statuses }));
    assert.equal(evidence.summary.passedOutcomes, 0);
    assert.equal(evidence.summary.passedMappedAtomicCriteria, 0);
  }
});

test("report-level errors prevent a passing claim even when case results look successful", () => {
  const report = fixtureReport();
  report.errors.push({ message: "Runner failed after collecting results." });
  assert.equal(buildEvidence(fixtureManifest(), report).status, "not-proven");
});

test("nested report suites and explicit implementation alternatives stay inspectable", () => {
  const manifest = fixtureManifest();
  manifest.stories[0].implementation = "alternative";
  manifest.stories[0].decisionNotes = "Archive replaces delete; deletion is not claimed.";
  const report = fixtureReport();
  report.suites = [{ suites: report.suites }];
  assert.equal(executionResults(report).size, 2);
  const evidence = buildEvidence(manifest, report);
  assert.equal(evidence.summary.alternativeOutcomes, 1);
  assert.match(evidenceMarkdown(evidence), /Archive replaces delete/);
  assert.match(evidenceMarkdown(evidence), /362 original criteria are outside this full-stack subset/);
});

test("pytest JUnit retains module and parametrized identities including XML entities", () => {
  // Escaped attributes and both empty/nonempty testcase forms match pytest's actual report contract.
  const report = backendResults('<testsuites><testsuite failures="0" errors="0"><testcase classname="tests.test_domain" name="test_accepts[one&amp;two]" /><testcase classname="tests.test_domain" name="test_accepts[three]" time="0.1"></testcase></testsuite></testsuites>');
  const reference = { kind: "backend-test", path: "../backend/tests/test_domain.py", selector: "test_accepts" };
  const proof = assertionResult(reference, { backend: report });
  assert.equal(proof.passed, true);
  assert.deepEqual(proof.variants.map((entry) => entry.name), ["test_accepts[one&two]", "test_accepts[three]"]);
  // A matching function in another module cannot certify the named source definition.
  assert.equal(assertionResult({ ...reference, path: "../backend/tests/test_other.py" }, { backend: report }).status, "missing-test");
});

test("failed skipped or absent backend variants cannot certify an assertion", () => {
  // All variants reported for a named parametrized function are required, including intentional skips.
  const reference = { kind: "backend-test", path: "../backend/tests/test_domain.py", selector: "test_accepts" };
  for (const outcome of ['<skipped message="unsupported" />', '<failure message="rejected" />', '<error message="setup failed" />']) {
    const report = backendResults(`<testsuite><testcase classname="tests.test_domain" name="test_accepts[first]"/><testcase classname="tests.test_domain" name="test_accepts[second]">${outcome}</testcase></testsuite>`);
    assert.equal(assertionResult(reference, { backend: report }).passed, false);
  }
  assert.equal(assertionResult(reference, {}).status, "missing-report");
  assert.equal(backendResults('<testsuite errors="1"><testcase classname="tests.test_domain" name="test_accepts"/></testsuite>').clean, false);
  assert.throws(() => backendResults("not a test report"), /not a JUnit/);
});

test("Vitest parameter titles resolve only to the correct file and evidence layer", () => {
  // A parameterized helper and a component may share a phrase without sharing execution evidence.
  const report = frontendResults({ success: true, testResults: [{ name: "/app/frontend/src/format.test.ts", assertionResults: [{ title: "adds 5 minutes", status: "passed" }, { title: "adds 10 minutes", status: "passed" }] }] });
  const reference = { kind: "frontend-test", path: "src/format.test.ts", selector: "adds %s minutes" };
  assert.equal(assertionResult(reference, { unit: report }).passed, true);
  assert.equal(assertionResult({ ...reference, path: "src/other.test.ts" }, { unit: report }).status, "missing-test");
  assert.equal(assertionResult({ ...reference, path: "src/format.browser.test.tsx" }, { unit: report }).status, "missing-report");
  // Empty printf substitutions are still real variants and must not disappear from the checked set.
  report.tests.push({ file: "/app/frontend/src/format.test.ts", name: "adds  minutes", status: "skipped" });
  assert.equal(assertionResult(reference, { unit: report }).passed, false);
});

test("failed Vitest runners and pending assertion results never provide passing proof", () => {
  // Missing reporter success must remain false even when one partial assertion happens to look successful.
  const reference = { kind: "frontend-test", path: "src/format.test.ts", selector: "checks a condition" };
  for (const [success, status] of [[false, "passed"], [undefined, "passed"], [true, "pending"], [true, "failed"]]) {
    const report = frontendResults({ success, testResults: [{ name: "/app/frontend/src/format.test.ts", assertionResults: [{ title: reference.selector, status }] }] });
    assert.equal(assertionResult(reference, { unit: report }).passed, false);
  }
});

test("combined evidence proves lower-layer criteria only from their own complete supplied reports", () => {
  // Criterion two is independent Python evidence; passing all story tags cannot establish it alone.
  const manifest = fixtureManifest();
  manifest.atomicRequirements.dispositions[1] = { ...manifest.atomicRequirements.dispositions[1], disposition: "test_assertion", evidence: [{ kind: "backend-test", path: "../backend/tests/test_domain.py", selector: "test_accepts" }] };
  assert.equal(buildEvidence(manifest, fixtureReport()).summary.passedLowerLayerAtomicCriteria, 0);
  const backend = backendResults('<testsuite><testcase classname="tests.test_domain" name="test_accepts"/></testsuite>');
  const evidence = buildEvidence(manifest, fixtureReport(), { backend });
  assert.equal(evidence.lowerLayerStatus, "passed");
  assert.equal(evidence.summary.passedLowerLayerAtomicCriteria, 1);
  assert.equal(evidence.criterionDispositions[1].execution, "passed");
  // An additional required unit assertion cannot borrow the Python result or silently leave the denominator.
  manifest.atomicRequirements.dispositions[1].evidence.push({ kind: "frontend-test", path: "src/format.test.ts", selector: "checks a condition" });
  assert.equal(buildEvidence(manifest, fixtureReport(), { backend }).lowerLayerStatus, "not-proven");
});
