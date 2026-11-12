---
name: commit
description: Inspect Git changes, define an intentional scope, write concise GitHub-style commit messages, and create local commits when requested. Use when Codex needs to draft a commit message, review staged changes, stage specified changes, or make a local Git commit. A commit request does not authorize a push, amend, rebase, or pull request.
---

# Commit Changes

Create one or more focused local commits whose messages accurately describe each committed diff.

## Establish the requested outcome

- Distinguish between drafting a message, reviewing a proposed commit, committing already staged changes, and staging plus committing selected changes.
- Treat an explicit request to commit as authority for a local commit only.
- Keep message-only and review-only requests read-only.
- Do not amend, push, rebase, or open a pull request unless the user separately requests that action.

## Inspect the repository

1. Read the repository instructions that apply to the files in scope.
2. Inspect `git status --short`, the unstaged diff, and the staged diff.
3. Review recent commit titles when history exists so the message follows any stronger repository convention.
4. Identify unrelated, generated, binary, secret-bearing, or suspicious files before staging anything.

Do not assume every worktree change belongs in one commit. Preserve unrelated user changes and report unclear ownership instead of silently including them.

## Define and verify the scope

- Prefer one coherent change per commit.
- For large changes, prefer multiple small, coherent commits that are easier to review and can be reverted independently when dependencies allow.
- Keep each commit easy to reverse by excluding unrelated changes and giving it one clear purpose.
- Order a multi-commit sequence so each commit leaves the project in a valid state. Do not force a split that creates broken intermediate commits or misleading history.
- Split along behavior and dependency boundaries rather than arbitrary file counts. Keep tests and documentation with the behavior they verify or describe unless the repository has a stronger convention.
- Re-read the target files and `git status` immediately before staging because another process may have changed the worktree.
- Stage only reviewed paths or hunks. Never use `git add .`, `git add -A`, or an equivalent broad staging command.
- Do not disturb changes that were already staged unless the user explicitly authorizes it.
- If the index mixes requested and unrelated changes, stop and ask how the user wants the commit split.
- Review `git diff --cached --stat` and `git diff --cached` after staging.
- Do not create an empty commit unless the user explicitly requests one.

Run checks that are proportionate to the change when the surrounding task includes validation. Do not invent a passing result, and do not broaden a commit-only request into unrelated code changes merely to make every repository check pass.

## Write the message

Use this shape:

```text
<Imperative title>

<Optional explanation of why or important impact>
```

Write the title to:

- Start with one of these approved imperative verbs: `Add`, `Fix`, `Update`, `Remove`, `Refactor`, `Bump`, `Rename`, `Merge`, or `Revert`. Avoid all other opening verbs.
- Use present tense.
- Summarize the whole staged change, not the act of editing files.
- Be specific enough to distinguish the change from nearby work.
- Stay concise and on one line.
- Avoid vague wording, implementation diary language, and unnecessary punctuation.
- Follow an established repository format, such as Conventional Commits or issue prefixes, when the history or instructions require it.

Use the `This commit will ...` test before finalizing the title. Imagine the title completing this sentence, with its first word lowercased:

```text
This commit will <commit title>.
```

For example, `Fix session timeout handling` becomes `This commit will fix session timeout handling.` If the sentence is ungrammatical, as in `This commit will fixed session timeout handling`, rewrite the title in the imperative form. Do not include `This commit will` in the actual commit message.

Add a body only when it provides useful context. Use it to explain:

- Why the change was needed.
- Important behavior, side effects, migrations, or compatibility constraints.
- A breaking change.
- An issue reference supplied by the user or repository context.

Use bullets when the body contains several distinct points. Never invent issue numbers, test results, motivations, or effects that the diff does not support.

Good messages:

```text
Add user login flow
```

```text
Fix session timeout handling

- Keep sessions active while tokens refresh
- Remove the race between refresh and logout
- Fix #142
```

Avoid messages such as:

```text
Fixed stuff
Changes
Update code
WIP
Final fix maybe
```

## Create and confirm the commit

1. Show or state each planned commit's scope and message before committing when either is ambiguous.
2. Stage and review only the current commit's scope, then run `git commit` with the reviewed message. Quote shell arguments safely and never allow message text to become shell syntax.
3. Do not bypass hooks with `--no-verify`. If a hook fails, report the failure and only fix it when that work is within scope.
4. After each commit, confirm it with `git show --stat --oneline --decorate --no-renames HEAD` and re-check `git status --short` before starting the next commit.
5. Report every commit hash, title, and included scope, plus the validation performed and any remaining worktree changes or validation gaps.
