# INVEST user story examples

These examples are teaching material for the [write-user-story skill](./SKILL.md). They are deliberately fictional. They show the level of evidence and conversation needed for a story to pass the skill's INVEST gate; they are not evidence for a real product.

The story sentence captures the user's outcome. Acceptance criteria then describe observable confirmation without prescribing a database, framework, endpoint, or exact visual design. The examples use `Given / When / Then` because it makes the expected behaviour easy for a client and delivery team to review.

## Example 1: Recover account access

### Story

> As a returning customer, I want to request a password reset using my email address, so that I can regain access without contacting support.

### Acceptance criteria

- Given an active account email is submitted, when the customer requests a reset, then the service sends a reset message and shows a confirmation that does not reveal whether an account exists.
- Given a valid reset link is opened before it expires, when the customer enters matching new passwords, then the password is changed and the customer can sign in with it.
- Given an expired or already-used reset link is opened, when the customer tries to use it, then the service explains that a new reset request is needed and does not change the password.

### INVEST review

| Criterion | Result | Why it passes |
| --- | --- | --- |
| Independent | Pass | It can be delivered and accepted once the existing account and email service are available; no other new customer-facing story is required. |
| Negotiable | Pass | It states the recovery outcome and security behaviour, but leaves the message wording and implementation open. |
| Valuable | Pass | A customer can regain access without waiting for support. |
| Estimable | Pass | The actor, entry point, success path, expiry boundary, and privacy behaviour are clear enough to size. |
| Small | Pass | It covers one recovery path, not registration, profile management, or all authentication features. |
| Testable | Pass | Each ordinary and boundary case has an observable result. |

## Example 2: Compare sales by territory

### Story

> As a regional sales manager, I want to compare monthly revenue by territory, so that I can identify where coaching or support is needed.

### Acceptance criteria

- Given the manager selects a month, when the report is opened, then it shows one revenue total for each territory the manager is allowed to view.
- Given the selected month contains no revenue for a territory, when the report is opened, then that territory remains visible with a zero or an agreed no-data state rather than being silently omitted.
- Given the manager is not allowed to view a territory, when the report is opened, then that territory's revenue is not included.

### INVEST review

| Criterion | Result | Why it passes |
| --- | --- | --- |
| Independent | Pass | The report can be reviewed as one read-only outcome; existing permissions and revenue data are explicit dependencies. |
| Negotiable | Pass | The story requires comparison and access control, but does not dictate a chart, table, query, or page layout. |
| Valuable | Pass | The manager can use the comparison to decide where to direct support. |
| Estimable | Pass | The reporting period, measure, grouping, permission boundary, and empty-data rule are identified. |
| Small | Pass | It covers one measure and one grouping for one reporting period, not a complete sales analytics suite. |
| Testable | Pass | Totals, restricted territories, and no-data behaviour can be checked against known data. |

## Example 3: Renew one eligible library loan

### Story

> As a library member, I want to renew an eligible loan online, so that I can keep the item without visiting a branch.

### Acceptance criteria

- Given a member has an eligible loan with no reservation from another member, when they choose renew, then the due date moves to the next permitted due date and the updated date is shown.
- Given another member has reserved the item, when the member chooses renew, then the loan remains unchanged and the service explains why renewal is unavailable.
- Given the member has reached the renewal limit, when they choose renew, then the loan remains unchanged and the service explains that the limit has been reached.

### INVEST review

| Criterion | Result | Why it passes |
| --- | --- | --- |
| Independent | Pass | It delivers one loan-renewal outcome using the existing member and loan records; catalogue search is not part of the slice. |
| Negotiable | Pass | The outcome and library rules are fixed, while the interaction and notification design remain open. |
| Valuable | Pass | The member avoids an unnecessary branch visit and keeps the item when policy allows. |
| Estimable | Pass | The permitted outcome and two important rejection rules are known. |
| Small | Pass | It covers renewing one existing loan, not checkout, fines, reservations, or account administration. |
| Testable | Pass | Each rule has a clear state change or a clear no-change result. |

## Example 4: Download a submitted application receipt

### Story

> As an applicant, I want to download a receipt after submitting an application, so that I can keep proof of what I submitted.

### Acceptance criteria

- Given an application has been submitted successfully, when the applicant requests the receipt, then a file is downloaded containing the application reference, submission date, and submitted answers.
- Given an applicant requests a receipt for an application they cannot access, when the request is made, then no application content is downloaded and an access message is shown.
- Given receipt generation is temporarily unavailable, when the applicant requests it, then the application remains submitted and the service explains how to try again.

### INVEST review

| Criterion | Result | Why it passes |
| --- | --- | --- |
| Independent | Pass | It begins after the existing submission outcome and can be accepted without adding application editing or status tracking. |
| Negotiable | Pass | It requires accessible proof with named contents, but leaves the file format and presentation open unless a real constraint is agreed. |
| Valuable | Pass | The applicant can retain evidence of the submission. |
| Estimable | Pass | The trigger, required contents, access boundary, and temporary failure behaviour are defined. |
| Small | Pass | It covers receipt retrieval after submission, not the whole application journey. |
| Testable | Pass | The downloaded contents, access denial, and preservation of the submitted application are observable. |

## Bad examples and better corrections

These are intentionally weak. A bad story is not fixed by adding more technical detail to the same sentence. First identify the failed INVEST criterion, then rewrite around a user or business outcome. If the work has no direct user outcome, record it as a technical task, spike, or constraint instead of disguising it as a user story.

### Bad example 1: Technical implementation disguised as value

> As a developer, I want a PostgreSQL table called `password_resets` with an indexed `token` column, so that the database is ready.

**Why it fails:** It prescribes the implementation and the benefit is circular. It fails Negotiable and Valuable. The table may be a valid implementation task under a real account-recovery story, but it is not independently valuable to the customer.

**Better story:**

> As a returning customer, I want to request a password reset using my email address, so that I can regain access without contacting support.

### Bad example 2: Vague outcome with no decision or boundary

> As a user, I want better reports, so that I can see useful data.

**Why it fails:** The actor is too broad, “better” and “useful” are not observable, and the team cannot estimate or test what is meant. It fails Valuable, Estimable, Small, and Testable.

**Better story:**

> As a regional sales manager, I want to compare monthly revenue by territory, so that I can identify where coaching or support is needed.

The acceptance criteria must then define the reporting period, access boundary, measure, and no-data behaviour.

### Bad example 3: Several journeys in one epic

> As a shopper, I want to browse products, create an account, save a basket, pay, track delivery, return items, and receive loyalty points, so that I can shop online.

**Why it fails:** It combines multiple independently valuable journeys and cannot be estimated or completed as one useful slice. It fails Independent, Estimable, Small, and usually Testable.

**Better first slice:**

> As a returning shopper, I want to pay for the items already in my basket, so that I can complete my purchase.

Record any genuine dependency on an existing basket and authenticated customer as a constraint. Split browsing, account creation, delivery tracking, returns, and loyalty into separate stories with their own value.

### Bad example 4: Pixel-level solution disguised as a need

> As a customer, I want a blue 320-pixel button in the top-right corner labelled “Submit”, so that the form is modern.

**Why it fails:** The wording decides the visual implementation before the team has discussed the user problem, and “modern” is not a testable benefit. It fails Negotiable and Valuable.

**Better story:**

> As an applicant, I want to submit a completed application and receive clear confirmation, so that I know my request has been received.

The team can negotiate the control, layout, and visual treatment while acceptance criteria confirm successful submission, validation failures, and confirmation.

### Bad example 5: Dependency hidden by a passing-sounding sentence

> As a customer, I want to pay by credit card, so that I can complete my purchase.

**Why it fails in this context:** The outcome is valuable and testable, but the story is not Independent if registration and basket management are still unfinished prerequisites. Marking it “independent” without naming those dependencies hides a delivery constraint.

**Better correction:** Either make the prerequisite state explicit and schedule the story after it, or split and deliver the smallest valuable slice that can be accepted in the current product state. For example:

> As a guest shopper with an existing basket, I want to pay by credit card, so that I can complete my purchase without creating an account.

This is only a candidate rewrite. Confirm whether guest checkout is a real business rule before treating it as an approved story.

## One counterexample for each INVEST criterion

The following stories deliberately counter one INVEST idea at a time. Each is a `Draft - not usable` example. The failure is judged in context: for example, a payment story may be independent after its basket and account capabilities already exist, but not while those prerequisites are still separate unfinished stories.

### Independent: hidden dependency

> **Draft - not usable:** As a customer, I want to pay by credit card, so that I can complete my purchase.

**Context:** The product still needs separate registration and basket-management stories before a customer can reach payment.

**Why it counters Independent:** The payment story cannot be delivered, tested, or reordered on its own in this backlog. It is blocked by unfinished prerequisites. The sentence itself is valuable and reasonably testable, but its dependency is hidden.

**Correction:** Name the dependency and its delivery effect, then either schedule the story after those capabilities or split a slice that can be accepted without them. Do not mark this story `Pass` for Independent merely because the dependency is written in a note.

### Negotiable: implementation fixed in the story

> **Draft - not usable:** As an applicant, I want a blue 320-pixel button in the top-right corner labelled `Submit`, so that I can send my application.

**Why it counters Negotiable:** The story fixes the control, colour, size, position, and label before the team has discussed the user outcome and the design constraints. It leaves little room to co-create a suitable solution.

**Correction:**

> As an applicant, I want to submit my completed application and receive confirmation, so that I know my request has been received.

Keep a genuinely required brand or accessibility constraint separately linked to the story. Do not use a user story to prescribe an implementation choice that is still open for discussion.

### Valuable: technical work with no customer outcome

> **Draft - not usable:** As a developer, I want a new `password_resets` database table with an indexed `token` column, so that the database is ready.

**Why it counters Valuable:** A customer cannot use the table or recognise a benefit from it. The work may be necessary, but the stated benefit is circular and valuable only as an internal implementation step.

**Correction:** Put the work under a valuable vertical slice:

> As a returning customer, I want to request a password reset using my email address, so that I can regain access without contacting support.

If the database change must be tracked separately, record it as a technical task linked to that story, not as a user story claiming customer value.

### Estimable: outcome is clear but the solution is research

> **Draft - not usable:** As a safety officer, I want the system to automatically identify every pedestrian in this complex, low-light video feed, so that I can monitor crosswalk safety without reviewing hours of footage manually.

**Why it counters Estimable:** The desired outcome is understandable and could be tested, but the team cannot yet put useful bounds on the effort, accuracy, data quality, or technical approach. It is a research problem rather than an implementation slice with known scope.

**Correction:** Time-box discovery first:

> As a safety officer, I want an evidence-based feasibility assessment of pedestrian detection on a representative low-light sample, so that I can decide whether an automated monitoring trial is viable.

Define the time-box and evidence required for that spike. Use its result to estimate a smaller implementation story instead of pretending the original research outcome is estimable.

### Small: several journeys bundled together

> **Draft - not usable:** As a shopper, I want to browse products, create an account, save a basket, pay, track delivery, return items, and earn loyalty points, so that I can shop online.

**Why it counters Small:** It contains several user journeys, rules, integrations, and acceptance boundaries. The team cannot reliably complete or learn from it as one useful slice, and the size hides the scope.

**Correction:** Choose one meaningful vertical slice, for example:

> As a returning shopper, I want to pay for the items already in my basket, so that I can complete my purchase.

Give browsing, account creation, delivery tracking, returns, and loyalty their own stories when each has a distinct outcome. Do not split only into database, API, and interface layers, because those technical fragments do not independently deliver the shopper's value.

### Testable: subjective acceptance

> **Draft - not usable:** As a site administrator, I want the dashboard to feel fast and modern, so that users are not frustrated.

**Why it counters Testable:** “Fast”, “modern”, and “not frustrated” do not define an objective yes-or-no completion test. Different people could accept different results, even if the team agrees that performance matters.

**Correction:** Operationalise the need:

> As a site administrator, I want the dashboard's key information to become available within an agreed response threshold, so that I can review the day's status without waiting for the page to finish loading.

Then add measurable acceptance criteria, such as a named page, representative data volume, device or network condition, percentile, and threshold. The exact threshold must come from the user's need or an agreed constraint; do not invent it just to make the story appear testable.

## Practical review prompts

Use these questions during refinement:

- Who benefits, and what decision or action becomes possible?
- Does the story describe an outcome rather than a screen, database, API, framework, or internal task?
- Can it be delivered and accepted without an unrelated story? If not, is the dependency explicit?
- What is the smallest vertical slice that still gives the user meaningful value?
- What ordinary case, boundary, and failure case would let a client say yes or no?
- Is any uncertainty large enough to need a separate discovery or technical spike?

## Sources consulted

- [Bill Wake, “INVEST in Good Stories, and SMART Tasks”](https://xp123.com/invest-in-good-stories-and-smart-tasks/) - original INVEST definitions, negotiability, customer value, vertical slicing, and testability.
- [GOV.UK, “Writing user stories”](https://www.gov.uk/service-manual/agile-delivery/writing-user-stories) - actor, need, goal, acceptance criteria, and splitting epics into smaller stories.
- [Mountain Goat Software, “Good User Stories”](https://www.mountaingoatsoftware.com/agile/user-stories/good-user-stories) - shared understanding, common weak-story patterns, and INVEST as a diagnostic rather than a score.
- [SE Book, “User Stories”](https://tobiasduerschmid.github.io/SEBook/userstories.html) - acceptance-criteria boundaries and examples of dependency, implementation-detail, technical-only, and testability failures.
