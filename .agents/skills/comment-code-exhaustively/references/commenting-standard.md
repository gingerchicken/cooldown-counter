# Exhaustive Commenting Standard

## Contents

1. [Core rule](#core-rule)
2. [Coverage model](#coverage-model)
3. [Variable coverage](#variable-coverage)
4. [Logical block coverage](#logical-block-coverage)
5. [Documentation comments](#documentation-comments)
6. [Reasoning and trade-off comments](#reasoning-and-trade-off-comments)
7. [Comment quality](#comment-quality)
8. [Naming](#naming)
9. [Refactor notes](#refactor-notes)
10. [Complexity comments](#complexity-comments)
11. [Language and file caveats](#language-and-file-caveats)
12. [Review checklist](#review-checklist)

## Core Rule

Prioritise readability and maintainability over brevity. Code names describe what values represent; comments preserve purpose, reasoning, assumptions, constraints, business meaning, and failure strategy.

For code in scope:

- Give every variable a meaningful nearby comment.
- Give every logical block at least one meaningful comment.
- Give functions, methods, classes, interfaces, domain models, and public APIs idiomatic documentation comments.
- Explain non-obvious logic, decisions, compromises, and technical debt.
- Keep every statement factual, professional, and current.

Exhaustive does not mean narrating syntax. It means leaving no declaration or block without enough context for a maintainer to understand its role.

## Coverage Model

Treat the following as separate coverage obligations:

| Construct | Required documentation |
| --- | --- |
| File or module | Responsibility and architectural role when not already obvious |
| Public or exported declaration | Idiomatic API documentation |
| Complex private declaration | Documentation comment describing contract and constraints |
| Variable or field | Nearby explanation of role, meaning, units, shape, ownership, or lifecycle |
| Parameter | API documentation for named callables; callback comment for anonymous callables |
| Logical block | At least one comment explaining purpose, invariant, rule, edge case, or constraint |
| Non-obvious implementation choice | Evidence-based reasoning and trade-off comment |
| Deferred structural problem | Specific `TODO(refactor)` when appropriate |

A single comment may satisfy more than one obligation if it is adjacent, unambiguous, and contains enough information. For example, a loop comment can define the loop's purpose and explain the key and value bindings used by the iteration.

Do not count a distant module comment as coverage for every declaration and block in the file.

## Variable Coverage

Cover constants, mutable locals, fields, state holders, accumulators, loop bindings, destructured bindings, catch values, fixtures, mocks, aliases, and other named runtime values.

A variable comment should explain the most useful available facts, such as:

- its domain purpose;
- what the value means rather than merely its type;
- units such as milliseconds, bytes, miles, pence, or percentages;
- expected format, shape, encoding, or key semantics;
- whether absence, `null`, or an empty value has special meaning;
- ownership and lifecycle;
- valid ranges or sentinel values;
- why it must be stored separately;
- how downstream code uses it;
- an invariant it maintains.

Place the comment immediately before the declaration where the language permits it. Use an idiomatic field or property documentation comment for model members.

A group comment is acceptable for tightly related values only if it names or unmistakably identifies each binding. This is useful for tuple or object destructuring, loop key/value pairs, coordinate components, and paired limits. Do not use a generic paragraph to cover unrelated declarations.

Document named function parameters in the function's documentation comment. For anonymous callbacks, explain the callback's purpose and the meaning of its parameters in the comment attached to the callback block.

Routine imports are not part of the variable-comment quota. Explain imports only when they have a non-obvious architectural role, required side effect, compatibility purpose, or unusual source. Do not add a comment that simply repeats a familiar package name.

An idiomatic field or property comment may satisfy both the model's API-documentation obligation and the field's variable-documentation obligation. Do not repeat the same explanation in a class-level attribute list and again beside the field unless each location adds distinct value.

Bad:

```ts
// Store the timeout.
const timeout = 5_000;

// Filter reservations.
const result = reservations.filter(isCurrent);
```

Better:

```ts
// Maximum time, in milliseconds, that the upstream request may remain pending.
const requestTimeoutMs = 5_000;

// Reservations that remain reportable after applying the current accounting window.
const reportableReservations = reservations.filter(isWithinAccountingWindow);
```

For simple values, explain why the value exists or how its meaning differs from nearby values. Do not fabricate complexity merely to make a comment longer.

## Logical Block Coverage

A logical block includes:

- a function or method body;
- each meaningful branch of a conditional;
- a loop;
- an anonymous callback or event handler;
- each `try`, `catch`, or `finally` path;
- a transaction or resource-management section;
- a non-trivial transformation or aggregation;
- a concurrency, queueing, caching, memoisation, or state-management section;
- a group of statements performing one distinct operation;
- test arrangement, action, and assertion sections when they express distinct intent.

Each block comment must explain at least one useful fact:

- the purpose of the block;
- why it is necessary;
- an invariant that must remain true;
- a business rule being implemented;
- an edge case or failure mode being handled;
- a constraint imposed elsewhere;
- why this shape is used instead of an obvious alternative;
- what state transition or side effect occurs;
- why ordering matters.

Prefer one strong comment for a coherent block over comments on every line. Split a long block into distinct commentable operations when that reflects its actual responsibilities, but do not refactor behaviour merely to create comment locations.

Bad:

```ts
// Increment the retry count.
retryCount++;
```

Better:

```ts
// Count this failure so retry processing stops at the configured safety limit.
retryCount++;
```

For an `if` statement, explain why the condition changes behaviour or what invariant each meaningful branch preserves. For a loop, explain what is traversed and what accumulates or remains invariant. For an error path, explain whether the error is translated, retried, logged, recovered, or deliberately allowed to escape.

## Documentation Comments

Use the language's idiomatic form, such as TSDoc/JSDoc, Python docstrings, XML documentation, Rustdoc, Go doc comments, JavaDoc, or equivalent.

Document:

- what the component does;
- inputs and their business meaning;
- output meaning and absence semantics;
- side effects and state changes;
- errors or exceptions it can produce;
- important assumptions and preconditions;
- usage constraints;
- concurrency or ownership expectations;
- unusual performance characteristics;
- the architectural boundary it represents.

Give priority to public APIs, exported functions and classes, complex functions, domain models, business logic, architectural boundaries, side-effecting functions, error-producing functions, and code with unusual cost.

Do not list every implementation step in API documentation. Describe the contract that callers and maintainers must preserve.

## Reasoning and Trade-off Comments

For non-trivial logic, document reasoning when evidence supports it:

- why the approach is appropriate;
- the meaningful alternative it avoids;
- the trade-off being accepted;
- a repository, compatibility, or external-system constraint;
- an assumption the implementation relies on;
- a condition that would invalidate the approach;
- why an apparently simpler implementation would be incorrect;
- why ordering, caching, batching, or duplication is intentional.

Place the comment beside the decision, not in a detached essay.

Distinguish an observable constraint from historical intent. If history is unknown, write "Keep the lookup local so each request uses the same snapshot" when that is provable, not "This was chosen after rejecting a database join" when no evidence records that decision.

Do not infer business meaning from a variable name alone. Confirm it through tests, callers, types, documentation, configuration, or stable repository history.

## Comment Quality

Comments must be:

- meaningful rather than syntactic;
- precise rather than generic;
- local to the construct they describe;
- consistent with the current code;
- concise enough to scan but complete enough to preserve intent;
- professional and factual;
- written for a human maintainer unfamiliar with the implementation.

Avoid:

- comments that repeat the next line;
- invented motives or guarantees;
- vague phrases such as "handle data", "do logic", or "process result";
- commentary about the author or code-generation process;
- emotional, insulting, or defensive language;
- stale statements left behind after code changes;
- decorative separators and noise;
- comments that conceal a correctness or security defect;
- long tutorials for conventional language syntax.

Preserve valuable existing comments. Rewrite stale, misleading, vague, or syntax-translating comments as part of the pass.

## Naming

Prefer names that communicate domain meaning. Include units where useful and phrase booleans as states or questions, such as `timeoutMs`, `pricePence`, `isEnabled`, `hasPermission`, or `shouldSkipWeek`.

Avoid ambiguous names such as `data`, `item`, `value`, `result`, `temp`, `obj`, or `info` unless their meaning is genuinely unambiguous in the immediate context.

Do not use a comment to excuse a needlessly poor name. During a comment-only pass, make private local renames only when they are mechanically safe and fully verifiable. Preserve public names and external contracts. Report naming problems that cannot be safely corrected within scope.

## Refactor Notes

Use `TODO(refactor)` only when directly relevant code has a concrete structural problem that cannot safely be corrected during the pass.

State:

- what is structurally wrong;
- what risk or maintenance cost it creates;
- the intended direction of improvement;
- why the work is outside the present scope;
- a related issue number when known.

Preferred form:

```ts
// TODO(refactor): Extract the reservation-window calculation into a shared
// domain helper. This duplicated rule can drift between reports, but changing
// every consumer is outside the scope of this documentation pass.
```

Do not add vague TODOs, speculative wishes, repeated TODOs for one architectural issue, or TODOs describing completed work. Do not use a TODO instead of fixing or prominently reporting a correctness, security, corruption, or data-loss defect.

## Complexity Comments

Include Big O, Big Theta, or Big Omega analysis only when it explains a meaningful choice involving data structures, performance-sensitive work, memory use, repeated database or network operations, scalability, or materially different algorithms.

Explain the expected workload and the scale at which the choice becomes problematic. Do not add complexity notation to straightforward conventional code merely to appear thorough.

## Language and File Caveats

- Preserve shebangs, encoding declarations, pragmas, directives, docstring placement, decorators, annotations, preprocessor rules, and generated headers.
- Use comment syntax and documentation conventions appropriate to the language and repository.
- Ensure comments do not alter automatic semicolon insertion, macro expansion, SQL dialect behaviour, template whitespace, shell continuations, or formatter directives.
- In Python, keep the docstring as the first statement in its module, class, or function.
- In Go, begin exported declaration comments with the declaration name unless repository tooling specifies otherwise.
- In overloaded or decorated APIs, attach documentation where tooling and generated API references will retain it.
- Do not insert comments into JSON, binary files, minified output, generated files, lockfiles, snapshots, vendored code, or formats that do not support stable human-owned comments.
- Treat migrations and schema output as generated unless repository evidence shows they are manually maintained.
- Comment tests to explain scenarios, fixture meaning, business expectations, and failure intent. Do not merely label familiar testing syntax.

## Review Checklist

For every in-scope file, verify:

- [ ] The file's responsibility is clear.
- [ ] Public and complex declarations have idiomatic documentation comments.
- [ ] Every variable, field, destructured binding, loop binding, catch value, fixture, and callback parameter is explained nearby.
- [ ] Every logical block has a meaningful purpose, invariant, rule, edge-case, or constraint comment.
- [ ] Non-obvious decisions and trade-offs are documented only where supported by evidence.
- [ ] Units, formats, nullability, ranges, ownership, and lifecycle are documented where relevant.
- [ ] Existing comments remain accurate and useful.
- [ ] No comment merely translates syntax.
- [ ] No rationale, guarantee, or business rule has been invented.
- [ ] `TODO(refactor)` notes are specific, actionable, and genuinely out of scope.
- [ ] Comment placement and syntax are valid for the language.
- [ ] Runtime behaviour and external contracts are unchanged.
- [ ] Executable syntax or AST equivalence has been checked where reliable tooling permits it.
- [ ] Formatter, tests, lint, type checks, compilation, and diff checks have been run as applicable.
