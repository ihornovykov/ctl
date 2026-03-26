---
name: immer
description: Use Immer to update immutable arrays and objects by writing mutable-style code inside produce(). Use when updating nested state, arrays (push, splice, sort), or complex immutable structures; when the user mentions immutable updates, reducers, or avoiding spread boilerplate.
---

# Immer

Use **Immer** to work with immutable state by writing normal mutations inside a **draft**. Immer produces a new immutable value; the original is never changed.

## When to use

- Updating nested objects or arrays without deep spreads
- Array operations (push, pop, splice, sort) in an immutable way
- Reducers, Zustand, or React state that must stay immutable
- Any logic that would otherwise use lots of `{ ...obj }` or `[...arr]`

## Setup

```bash
pnpm add immer
```

```typescript
import { produce } from "immer";
```

## Basic usage

```typescript
// New state from base state
const nextState = produce(baseState, (draft) => {
  draft.items.push({ id: 1, name: "New" });
  draft.user.name = "Updated";
});

// With a single argument, produce returns a curried updater (e.g. for setState)
const updater = produce((draft) => {
  draft.count += 1;
});
setState(updater);
```

## Arrays

Mutate the draft array directly; Immer records changes and returns a new array:

```typescript
const next = produce(items, (draft) => {
  draft.push({ id: 2 });
  draft.splice(0, 1);
  draft.sort((a, b) => a.name.localeCompare(b.name));
  draft[0].done = true;
});
```

## With Zustand

```typescript
import { produce } from "immer";

const useStore = create((set) => ({
  items: [],
  addItem: (item) =>
    set(
      produce((draft) => {
        draft.items.push(item);
      }),
    ),
}));
```

## With React setState

```typescript
setState(produce((draft) => {
  draft.nested.list.push(newItem);
}));
```

## Rules

- Only mutate the **draft** (and anything you assign to it). Don’t mutate the original state or things outside the draft.
- Don’t return from the recipe unless you want to replace the whole state (return value replaces draft).
- For async work inside the recipe, use `createDraft` / `finishDraft` from `immer` (see Immer async docs).

## When not to use

- Single-level, simple updates: `setState({ ...state, count: state.count + 1 })` is fine.
- Very hot paths where you need to avoid the proxy overhead; measure first.
