# Codespacer examples

These examples are fictional teaching material for the [codespacer skill](./SKILL.md). Every edit is blank-line-only: nonblank lines, their order, and their content are unchanged. Use the judgment each example shows rather than copying its line counts.

## Example 1: Group statements by purpose

Before:

```javascript
// The destination must be available before a request can be prepared.
const endpoint = settings.endpoint;
if (!endpoint) throw new Error("Missing endpoint");
// The payload contains only the fields accepted by the service.
const payload = { name: account.name };
payload.enabled = account.isEnabled;
// Submit the prepared request.
await client.post(endpoint, payload);
```

After:

```javascript
// The destination must be available before a request can be prepared.
const endpoint = settings.endpoint;
if (!endpoint) throw new Error("Missing endpoint");

// The payload contains only the fields accepted by the service.
const payload = { name: account.name };
payload.enabled = account.isEnabled;

// Submit the prepared request.
await client.post(endpoint, payload);
```

Why this works:

- Only two blank lines are added, one at each change of purpose.
- The declaration and its immediate validation stay together.
- Consecutive statements building the same `payload` object stay together.
- Each existing comment stays attached to the group it introduces.

## Example 2: Keep a directive attached to its target

Before:

```javascript
const options = loadOptions(env);
const legacyKeys = Object.keys(options.legacy ?? {});
// @ts-expect-error - upstream types do not yet include the legacy bag
const merged = mergeLegacyOptions(options, legacyKeys);
return merged;
```

After:

```javascript
const options = loadOptions(env);
const legacyKeys = Object.keys(options.legacy ?? {});

// @ts-expect-error - upstream types do not yet include the legacy bag
const merged = mergeLegacyOptions(options, legacyKeys);
return merged;
```

Why this works:

- Loading options and merging the legacy bag are different purposes, so a blank line separates them.
- The blank line is placed before the directive comment, not between the comment and the line it suppresses. A next-line directive must never be separated from its target.

## Example 3: Remove unnecessary consecutive blank lines

Before:

```javascript
function buildInvoiceSummary(invoice) {

  const subtotal = sumLineItems(invoice.lines);


  const tax = calculateTax(subtotal, invoice.taxRate);

  const total = subtotal + tax;

  return { subtotal, tax, total };
}
```

After:

```javascript
function buildInvoiceSummary(invoice) {
  const subtotal = sumLineItems(invoice.lines);
  const tax = calculateTax(subtotal, invoice.taxRate);
  const total = subtotal + tax;

  return { subtotal, tax, total };
}
```

Why this works:

- The three calculations build one result and stay together as a single group, so the stray blank lines between them are removed.
- One blank line is kept before `return` because returning the assembled result is a distinct step from assembling it. Removing excess spacing does not mean collapsing every blank line.

## Example 4: Preserve whitespace that affects meaning

Before and after (identical - no change needed):

```python
def build_welcome_email(user):
    subject = "Welcome to the team"
    body = f"""Hi {user.first_name},

Welcome aboard! Your account is ready.

If you have questions, reply to this email.
"""
    return subject, body
```

Why this works:

- The blank lines inside the triple-quoted string are paragraph breaks in the email body, not source-code spacing. They are data and must never be added, removed, or reformatted.
- `subject` and `body` are consecutive assignments building the values this function returns, so no blank line is added between them either.

## Example 5: Separate independent validation stages

Before:

```javascript
function handleCreateBooking(req, res) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  const { roomId, start, end } = req.body;
  if (!roomId || !start || !end) return res.status(400).json({ error: "Missing fields" });
  if (new Date(start) >= new Date(end)) return res.status(400).json({ error: "Invalid range" });
  const booking = createBooking({ roomId, start, end, userId: req.user.id });
  res.status(201).json(booking);
}
```

After:

```javascript
function handleCreateBooking(req, res) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  const { roomId, start, end } = req.body;
  if (!roomId || !start || !end) return res.status(400).json({ error: "Missing fields" });

  if (new Date(start) >= new Date(end)) return res.status(400).json({ error: "Invalid range" });

  const booking = createBooking({ roomId, start, end, userId: req.user.id });
  res.status(201).json(booking);
}
```

Why this works:

- Authentication, input-shape validation, business-rule validation, and execution are four distinct stages, so each gets its own group.
- The destructured input and its immediate shape check stay together, matching the declaration-and-validation pairing rule.

## Example 6: Leave already-coherent code unchanged

Before and after (identical - no change needed):

```javascript
function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}
```

Why this works:

- One statement doing one thing has no second purpose to separate from.
- A blank line added merely out of habit, with nothing to divide, would not improve scanning.
