---
name: codespacer
description: Improve code readability by adding or removing blank lines between logical groups of statements. Use when asked to space code into paragraphs, separate changes of purpose, or apply a blank-line-only readability pass across a project or directory. Do not use for general formatting, commenting, or refactoring.
---

# Codespacer

Code should read like paragraphs, with one coherent purpose per group.

See [EXAMPLES.md](./EXAMPLES.md) for worked before/after passes, including purpose grouping, directive attachment, removing excess blank lines, preserving meaningful whitespace, and cases that need no changes.

## Discover and understand the scope

1. Read applicable repository instructions and respect the user's explicit scope restrictions. Establish the working-tree state with `git status --short` and relevant staged and unstaged diffs when Git is available. Preserve pre-edit file contents as the comparison baseline, including existing user edits and untracked files.
2. Build an inventory with `rg --files` or equivalent discovery. Check for hidden and ignored first-party source within the requested scope so default discovery does not silently omit eligible files. Include application code, tests, scripts, and configuration written in code. Exclude dependencies, vendored sources, generated or minified files, build outputs, lockfiles, and binary assets; use repository metadata and file contents to confirm exclusions.
3. Process the inventory systematically in reviewable batches. Read and understand every eligible file completely before editing it. Identify changes of purpose such as configuration, validation, data retrieval, transformation, request construction, execution, error handling, cleanup, and returning results. Inspect related context when needed to understand a boundary. Do not replace whole-scope coverage with a sample.

## Group statements by purpose

- Insert a single blank line when the code changes purpose. Keep closely related statements together, including a declaration and its immediate validation, or consecutive assignments constructing the same object.
- Separate independent route categories, validation stages, and other distinct cases when this improves scanning. Do not split a coherent operation merely because it contains several statements.
- Place separation before a comment introducing the next group. Keep comments and documentation attached to the code they describe, including lint and type-checking directives. Never insert a blank line between a next-line directive and its target.
- Use judgment rather than fixed line counts. Do not add blank lines after every statement, brace, declaration, or comment. Small functions and already readable sections may need no changes.
- Remove unnecessary consecutive blank lines where safe and consistent with repository conventions. Aim for a consistent rhythm within each file. Preserve an already coherent arrangement instead of repeatedly choosing between equally readable layouts.

## Keep edits strictly to blank lines

- Add or remove blank lines only. Preserve the exact contents and order of every existing nonblank line, including logic, identifiers, imports, comments, indentation, line wrapping, punctuation, and line endings. Do not rewrite whitespace on retained lines or otherwise normalize the file.
- Do not refactor functions, extract helpers, rewrite conditions, rename anything, add commentary to source files, or change formatter configuration. Preserve unrelated user changes; never reset or revert a file to obtain a clean baseline.
- Preserve whitespace that affects meaning, including inside strings, template literals, JSX text, heredocs, and line continuations. Respect language-specific syntax, documentation content, and directive attachment. Never collapse blank lines globally: a visually empty line may be data. Leave uncertain locations unchanged and record why.

## Review, verify, and report

1. Review every resulting diff against its pre-edit working-tree baseline, including untracked files. Verify that the ordered nonblank lines remain exactly identical. Review staged and unstaged state again to confirm unrelated user changes remain intact.
2. Inspect each changed location for meaningful whitespace and directive attachment. A blank-line-only diff does not prove unchanged behaviour. Use appropriate existing syntax, lint, or formatting checks in check-only mode where useful; do not run automatic fixes that can change nonblank lines. Distinguish pre-existing failures from regressions, and undo only spacing edits that introduce a regression or conflict with repository rules.
3. Revisit the entire inventory and repeat the spacing review using the same grouping decisions. A second pass on the resulting code must produce no further spacing changes. If a boundary remains uncertain, preserve its original spacing. Account for every eligible file as examined (changed or unchanged) or skipped with a reason before claiming full coverage.
4. Finish with a concise summary of the requested scope, files examined, files changed, and skipped files or categories with reasons. Count examined files that needed no changes as covered. Include checks run and their outcomes, unavailable checks, and any unresolved limits on coverage or confidence.
