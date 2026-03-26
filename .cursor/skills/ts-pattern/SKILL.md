---
name: ts-pattern
description: Use ts-pattern for pattern matching to replace long if/else chains, switch statements, and nested ternaries with readable, type-safe match expressions. Use when simplifying conditional logic, handling discriminated unions, or when the user mentions pattern matching, avoiding switch/if-else, or nested ternaries.
---

# ts-pattern

Use the **ts-pattern** library for pattern matching instead of long `if/else`, `switch`, or nested ternaries. It keeps logic flat, type-safe, and exhaustively checked.

## When to use

- Replacing `switch` or long `if/else` chains on a single value or shape
- Handling discriminated unions (e.g. `{ type: 'success', data }` vs `{ type: 'error', message }`)
- Avoiding nested ternaries for conditional values or UI
- When you need exhaustiveness checking so all cases are handled

## Setup

```bash
pnpm add ts-pattern
```

```typescript
import { match, P } from "ts-pattern";
```

## Basic usage

```typescript
// Instead of switch / if-else
const statusLabel = match(status)
  .with("idle", () => "Ready")
  .with("loading", () => "Loading...")
  .with("error", () => "Failed")
  .exhaustive();

// With payload (discriminated union)
type Result = { ok: true; data: string } | { ok: false; error: string };
const message = match(result)
  .with({ ok: true }, ({ data }) => data)
  .with({ ok: false }, ({ error }) => error)
  .exhaustive();
```

## Common patterns

- **Wildcard**: `P._` for fallback. Use `.otherwise(() => value)` if you don't need exhaustiveness.
- **Predicate**: `P.when((x) => x > 0)` for custom conditions.
- **Type guards**: `P.string`, `P.number`, `P.array(P._)`, `P.instanceOf(Error)`.
- **Select**: `P.select()` to pass the matched value into the handler.

```typescript
match(value)
  .with(P.string, (s) => s.toUpperCase())
  .with(P.number, (n) => n * 2)
  .with(P.array(P._), (arr) => arr.length)
  .otherwise((x) => String(x));
```

## Exhaustiveness

Use `.exhaustive()` when the input is a union and you want a compile error if a case is missing. Use `.otherwise()` when a catch-all is valid.

## Don’t overuse

Prefer plain conditionals for one or two branches. Use ts-pattern when there are several cases or nested conditions that would become hard to read otherwise.
