# SMART task examples

These examples are teaching material for the [write-smart-task skill](./SKILL.md). They are deliberately fictional. The story and requirement identifiers show the traceability that a real task needs, but the linked records are not present in this example directory.

A SMART task is implementation planning after a story has been selected. It names one action on one object, records observable completion evidence, identifies the owner and prerequisites, explains the link to the accepted outcome, and sets an effort allowance with a review point. It is not a second user story and it is not a list of every technical layer involved.

The effort values below are illustrative LLM/agent implementation proxies in engineer-hours. They are not promises, elapsed delivery time, or calibrated probabilities. External waits are recorded separately.

## Complete SMART task examples

### Example 1: Validate password-reset token expiry

**Status:** `Proposed - not scheduled`

**Owner:** Authentication developer

**Story link:** `US-001 - Recover account access` (fictional resolving link)

**Requirement link:** `REQ-014 - Expired reset links cannot change passwords` (fictional resolving link)

#### Task

**Action and scope:** Add expiry and single-use validation to the password-reset token service for reset requests. Do not change email wording, account creation, or password policy.

**Completion evidence:** Automated tests prove that a valid unused token is accepted, an expired token is rejected, and a used token cannot be accepted again. A code review confirms that rejected tokens do not change the password.

#### SMART review

| Criterion | Result | Evidence |
| --- | --- | --- |
| Specific | Pass | One action is named: add validation. One object is named: the password-reset token service. The excluded work bounds the task. |
| Measurable | Pass | Three automated outcomes and the no-password-change invariant provide observable completion evidence. |
| Achievable | Pass | The owner has repository access; the existing token service, test fixture, and account store are available. |
| Relevant | Pass | It directly implements `REQ-014` and contributes to `US-001` by protecting the password-reset outcome. |
| Time-boxed | Pass | The central effort is four engineer-hours, with a six-hour maximum before review. |

#### Estimate and dependency

| Estimate | Lower | Central | Upper | Units and basis |
| --- | ---: | ---: | --- | --- |
| LLM/agent implementation effort | 2 | 4 | 6 | Engineer-hours; assumes the token service and fixtures already exist. |
| Elapsed wait, if external | 0 | 0 | 0 | Working days; no external owner required. |

**Time box:** Six engineer-hours.

**Review point if exceeded:** The authentication lead reviews the failing tests and decides whether to split token storage investigation from validation or create a separate technical task.

**Technical predecessors:** Existing password-reset token service and test fixture.

**Resource-order predecessors:** None.

**External owner or dependency:** None.

**Start condition:** `US-001` and `REQ-014` are selected for the first slice, and the existing token service is available locally.

**Finish contribution:** Supplies the security behaviour needed for the account-recovery story's reset-link acceptance criteria. It does not by itself prove that the whole story is accepted.

### Example 2: Add the empty-territory row to the sales report

**Status:** `Proposed - not scheduled`

**Owner:** Reporting developer

**Story link:** `US-002 - Compare sales by territory` (fictional resolving link)

**Requirement link:** `REQ-021 - Show territories with no revenue` (fictional resolving link)

#### Task

**Action and scope:** Update the monthly territory-report transformation so that every permitted territory appears in the report result, including territories with no revenue in the selected month. Keep the existing revenue calculation and permission filter unchanged.

**Completion evidence:** A fixture containing one territory with revenue and one permitted territory without revenue produces two report rows; a restricted territory produces no row. The transformation test passes without changing existing revenue totals.

#### SMART review

| Criterion | Result | Evidence |
| --- | --- | --- |
| Specific | Pass | One transformation and one bounded no-data rule are named. Permission filtering and revenue calculation are explicitly out of scope. |
| Measurable | Pass | The fixture and expected rows, restricted territory, and unchanged totals provide checkable evidence. |
| Achievable | Pass | The reporting developer has the source module, fixture data, and permission helper; no new data source is needed. |
| Relevant | Pass | It implements `REQ-021` and supports the manager's comparison decision in `US-002`. |
| Time-boxed | Pass | The central effort is three engineer-hours, with a five-hour review threshold. |

#### Estimate and dependency

| Estimate | Lower | Central | Upper | Units and basis |
| --- | ---: | ---: | --- | --- |
| LLM/agent implementation effort | 1.5 | 3 | 5 | Engineer-hours; assumes the report transformation and permission helper are understood. |
| Elapsed wait, if external | 0 | 0 | 0 | Working days; no external wait expected. |

**Time box:** Five engineer-hours.

**Review point if exceeded:** The reporting lead checks whether the source data lacks a complete territory list. If so, pause this task and create a separate data-availability task rather than expanding the transformation silently.

**Technical predecessors:** Existing monthly report transformation and permission helper.

**Resource-order predecessors:** None.

**External owner or dependency:** None.

**Start condition:** The report's permitted-territory fixture is available and `REQ-021` has an agreed zero-versus-no-data display value.

**Finish contribution:** Makes the comparison complete for permitted territories without revenue. It does not prove the full report, access model, or manager acceptance.

### Example 3: Assess low-light pedestrian detection feasibility

**Status:** `Proposed - not scheduled`

**Owner:** Computer-vision engineer

**Story link:** `US-003 - Monitor crosswalk safety` (fictional resolving link)

**Requirement link:** `REQ-030 - Decide whether automated detection is viable` (fictional resolving link)

#### Task

**Action and scope:** Run a time-boxed feasibility assessment against the supplied representative low-light video sample and record detection accuracy, false positives, processing constraints, and a recommendation. Do not build production monitoring or promise a final accuracy threshold.

**Completion evidence:** A short assessment records the sample used, method tried, measured results, known limitations, and a go/no-go recommendation for a later implementation task.

#### SMART review

| Criterion | Result | Evidence |
| --- | --- | --- |
| Specific | Pass | One bounded assessment on one named sample is required; production implementation is excluded. |
| Measurable | Pass | The assessment must contain the sample, method, results, limitations, and recommendation. |
| Achievable | Pass | The named owner has the sample and analysis environment; the task is deliberately a feasibility check rather than a full solution. |
| Relevant | Pass | It reduces the uncertainty blocking the decision in `REQ-030` and informs `US-003`. |
| Time-boxed | Pass | The assessment has an eight-hour maximum and a review at the end of the time box. |

#### Estimate and dependency

| Estimate | Lower | Central | Upper | Units and basis |
| --- | ---: | ---: | --- | --- |
| LLM/agent implementation effort | 4 | 6 | 8 | Engineer-hours; assumes the sample and analysis environment are ready. |
| Elapsed wait, if external | 0 | 0 | 2 | Working days if the safety officer must approve use of the sample. |

**Time box:** Eight engineer-hours, excluding the external approval wait.

**Review point if exceeded:** The safety officer and technical lead review the evidence. They decide whether to stop, repeat with a better sample, or create a separately estimated implementation task.

**Technical predecessors:** Analysis environment and representative video sample.

**Resource-order predecessors:** None.

**External owner or dependency:** Safety officer approval for using the sample, if not already recorded.

**Start condition:** Sample access and approval status are confirmed.

**Finish contribution:** Provides evidence for deciding whether automated monitoring is viable. It does not deliver automated monitoring or prove the user story is accepted.

## Counterexample for each SMART criterion

Each item below is a `Proposed - not scheduled` task that should fail one primary SMART check. The task must be corrected before scheduling. A task can fail more than one criterion in real work; the examples focus attention on the main defect.

### Specific: vague activity with no bounded object

> **Draft - not schedulable:** Improve authentication.

**Why it counters Specific:** It does not name an action, object, boundary, or excluded work. Different developers could implement unrelated changes and still claim completion.

**Correction:**

> Add expiry and single-use validation to the password-reset token service for reset requests; leave email wording and password policy unchanged.

The corrected task identifies one action, one object, and a bounded result.

### Measurable: no evidence of done

> **Draft - not schedulable:** Add the empty-territory behaviour to the report and make sure it works.

**Why it counters Measurable:** “Works” does not say what evidence proves completion. There is no fixture, test result, inspection, demonstration, or invariant that lets the team mark the task done.

**Correction:**

> A fixture with one territory with revenue and one permitted territory without revenue produces two report rows; a restricted territory produces no row; existing revenue totals remain unchanged.

Add the owner, traceability link, and effort allowance as well. Measurable completion does not require automated tests, but it does require observable evidence.

### Achievable: owner and prerequisites are missing

> **Draft - not schedulable:** Configure production email delivery and verify password-reset messages.

**Why it counters Achievable:** No owner, provider access, credentials, environment, test mailbox, or approval is named. The task may be reasonable in principle but cannot be expected to complete with the stated resources.

**Correction:** Name the owner and prerequisites, or split the work:

> The platform owner configures the staging email provider using the approved secret, sends a reset message to the test mailbox, and records the delivery result. Start only after provider access and the test mailbox are available.

If provider access depends on an external team, record the external wait separately from engineer effort.

### Relevant: orphaned technical work

> **Draft - not schedulable:** Replace the icon library with the latest version.

**Why it counters Relevant:** No selected story, requirement, risk, or enabling decision explains why this work belongs in the current slice. It may be useful later, but the task cannot be justified from the approved outcome.

**Correction:** Link a concrete reason and bound the work:

> Upgrade the icon library to the approved version and update the application-submission icon usage so the accessibility review can verify the required focus treatment for `US-004`.

If no such story or requirement exists, do not schedule the upgrade as part of the current delivery. Record it as a candidate backlog item instead.

### Time-boxed: no effort allowance or review point

> **Draft - not schedulable:** Investigate why the monthly report is slow and fix any performance issues.

**Why it counters Time-boxed:** The task has no maximum effort, review point, or decision if investigation expands. “Fix any issues” can absorb unbounded work and hides when the owner should seek help or split the task.

**Correction:**

> Within six engineer-hours, profile the monthly report using the agreed representative dataset, record the slowest three operations and their measured timings, and propose one bounded follow-up fix. At six hours, the reporting lead decides whether to implement the fix, create a separate task, or stop.

The time box controls discovery. It does not pretend that an unknown performance fix can be estimated before the evidence exists.

## Distinguish task scope from story scope

| User story | SMART task |
| --- | --- |
| Describes a user outcome and why it matters. | Describes one developer-sized action that contributes to that outcome. |
| Can include several acceptance examples for the complete slice. | Has its own completion evidence and does not prove the whole story alone. |
| Is selected and prioritised as a valuable product outcome. | Is scheduled only after traceability, owner, prerequisites, and SMART checks pass. |
| Should not prescribe an implementation unnecessarily. | Can name the implementation object because the task is about doing bounded technical work. |

Do not turn one story into a horizontal task list such as “build the database, API, frontend, tests, and deployment.” Split by independently checkable outputs and keep shared work counted once.

## Review prompts

- What one action will be completed, and on what named object?
- What evidence lets someone mark this task done without interpreting intent?
- Who owns it, and are access, data, tools, and prerequisites available?
- Which selected story, requirement, risk, or enabling decision justifies it?
- What is the lower, central, and upper effort proxy, and what assumptions support it?
- What is the maximum effort before review, and what decision follows if it is exceeded?
- Are technical predecessors, resource-order predecessors, and external waits recorded separately?

## Sources consulted

- [Bill Wake, “INVEST in Good Stories, and SMART Tasks”](https://xp123.com/invest-in-good-stories-and-smart-tasks/) - original SMART task guidance on specificity, observable completion, ownership, relevance, and time-boxing.
- [Acronymat, “SMART Tasks / Goals”](https://www.acronymat.com/2020/12/14/smart/) - concise descriptions of measurable completion, available resources, relevance, and knowing when to seek help or split work.

