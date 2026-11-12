---
name: comment-code-exhaustively
description: Perform an exhaustive, behaviour-preserving commenting pass over an existing codebase. Use when the user asks to add inline comments throughout a repository or selected source tree; comment every variable or logical block; add documentation comments to functions, classes, interfaces, domain models, or APIs; explain business rules, invariants, design decisions, trade-offs, workarounds, and technical debt; or make code unusually easy for humans to understand. Do not use for ordinary feature work that only requires normal documentation, or for generated, vendored, minified, lock, snapshot, or machine-owned files.
---

# Comment Code Exhaustively

Make the requested source code understandable to a future maintainer without changing its behaviour. Treat comment quality and factual accuracy as more important than comment count, while still meeting the user's deliberately exhaustive coverage requirement.

Read [references/commenting-standard.md](references/commenting-standard.md) completely before editing. Treat it as the normative coverage and quality standard.

Use [EXAMPLES.md](EXAMPLES.md) when deciding how to comment variables, logical blocks, public APIs, error paths, tests and deferred structural problems. The examples are fictional teaching material, not evidence about a target repository.

## Preserve the Codebase

- Read every applicable `AGENTS.md` and repository instruction before acting.
- Inspect `git status` and preserve unrelated or pre-existing user changes. Never overwrite, revert, or absorb them into the documentation pass.
- Follow repository-specific comment, formatting, lint, test, and generated-file conventions.
- Keep runtime behaviour, public contracts, data shapes, ordering, error handling, and performance characteristics unchanged unless the user separately authorises implementation changes.
- Use `apply_patch` for edits. Work in reviewable batches rather than rewriting whole files mechanically.
- Do not claim exhaustive coverage until every in-scope file has been inspected and accounted for.

## Establish Scope

1. Use an explicit path, language, subsystem, or diff supplied by the user as the boundary.
2. When the user says "the codebase" without narrowing it, include version-controlled, first-party source code and tests throughout the repository.
3. Exclude generated code, third-party or vendored code, dependency directories, build output, minified bundles, lockfiles, snapshots, copied external sources, and data formats that cannot contain comments.
4. Detect additional exclusions from repository configuration, generated-file headers, code-generation scripts, ignore files, and ownership documentation. Do not guess from a filename alone when authorship is unclear.
5. Build a private inventory of included and excluded files, grouped into sensible batches. Use `rg --files` as the starting point.
6. For a large repository, create a task plan, report progress by batch, and continue until the inventory is exhausted. Do not silently redefine "the codebase" to mean a sample.

Before editing, identify the relevant formatter, linter, type checker, compiler, and tests. Run a practical baseline so pre-existing failures can be distinguished from regressions.

## Understand Before Commenting

For each batch:

1. Read complete files, not isolated declarations.
2. Inspect related types, call sites, tests, documentation, configuration, and history available in the workspace when they determine meaning.
3. Identify module responsibilities, data ownership, units, nullability, lifecycle, external contracts, business rules, failure strategy, concurrency assumptions, and performance constraints.
4. Base design and trade-off comments on evidence. Never invent a historical motivation, rejected alternative, business rule, or guarantee.
5. When the reason for code cannot be established, document its observable purpose and constraints only. Report important unresolved rationale in the final handoff instead of manufacturing certainty.

## Apply the Commenting Standard

Comment the code manually and semantically. Do not use line-to-comment ratios or bulk comment generation as a substitute for understanding.

For every in-scope file:

- Add or improve a module-level explanation when the file's responsibility or architectural boundary is not already clear.
- Add idiomatic documentation comments to public and exported APIs, functions, methods, classes, interfaces, domain models, side-effecting components, and complex private abstractions.
- Give every variable declaration a nearby explanation of its role. Document parameters through the containing API documentation or the anonymous callback's block comment. A group comment is allowed only when it identifies every binding in a tightly related declaration or destructuring pattern.
- Add at least one meaningful comment to every logical block, including function bodies, branches, loops, callbacks, exception paths, transactions, resource lifecycles, data transformations, state transitions, concurrency sections, caching sections, and distinct operation groups.
- Place decision and trade-off comments at the point where the constraint affects the implementation.
- Improve stale, misleading, redundant, or syntax-translating existing comments while preserving useful context.
- Use specific `TODO(refactor)` comments only for relevant, actionable structural debt that is unsafe or out of scope to fix now.

Do not comment routine imports, punctuation, keywords, or conventional syntax merely to increase density. Comment an import group only when its architectural role, side effect, compatibility purpose, or unusual source needs explanation. Let one strong field or property comment satisfy both API and variable coverage rather than duplicating the same statement in two places.

Do not use comments to conceal poor naming. Rename a private or local symbol only when the new name is clearly better, every reference can be verified, and the change remains behaviour-preserving. Never rename public APIs, persisted or serialised fields, database identifiers, environment variables, protocol fields, or external contracts without explicit authorisation.

## Validate Each Batch

After editing each batch:

1. Format the affected files with the repository's normal formatter when available.
2. Run the narrowest relevant tests, type checks, compilation, and lint checks.
3. Inspect the entire diff and run `git diff --check` where Git is available.
4. Confirm that comments are idiomatic, professional, useful, and attached to the correct construct.
5. Confirm that every variable and logical block in the batch is covered, including destructuring bindings, loop variables, catch values, callback parameters, fields, test fixtures, and error paths.
6. Confirm that no comment asserts more than the code, tests, or documentation prove.
7. Confirm that edits did not change executable behaviour except for separately authorised, verified local renames or formatting.
8. Where language tooling makes it reliable, compare executable syntax or abstract syntax trees before and after the pass. Use this as additional evidence, not as a substitute for tests.

If validation fails, determine whether the failure was present at baseline. Fix regressions caused by the pass; do not disguise them as pre-existing failures.

## Complete the Repository Audit

Revisit the original inventory after all batches. Account for every included file and every exclusion. Search for uncovered declarations and concise blocks, but verify candidates by reading them rather than assuming a textual match proves coverage.

Do not declare success while known gaps remain. If a file cannot be safely documented because its meaning is unavailable, identify the exact file and missing context rather than adding speculative comments.

## Report the Result

Lead with the outcome and include:

- the scope completed;
- notable documentation added, especially business rules and design constraints;
- files or categories intentionally excluded and why;
- validation commands and their outcomes;
- pre-existing failures or unresolved ambiguities;
- structural concerns, stating what is wrong, why it matters, what a better direction looks like, and whether it needs action now or should become technical debt;
- any serious correctness, security, corruption, or data-loss concern discovered during the pass.

Be direct but do not manufacture criticism. Criticise implementations rather than authors, keep repository comments professional, and reserve blunt assessment for the final handoff. Do not present a correctness or security defect as ordinary technical debt. Raise it prominently and do not alter behaviour unless the user's request also authorises a fix.
