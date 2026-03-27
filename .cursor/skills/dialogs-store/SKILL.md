---
name: dialogs-store
description: Imperatively open and close modal dialogs via a Zustand store without needing React component wrappers or trigger elements. Use when the user needs to open a dialog programmatically (from event handlers, hooks, or stores), add confirmation modals, or show dialogs from outside the React tree. Triggers on tasks involving confirmation dialogs, imperative dialogs, dialogs.open(), or useDialogsStore.
---

# Dialogs Store

Open dialogs imperatively anywhere — inside event handlers, hooks, or stores — via `dialogs.open()`.

## Architecture

| File | Role |
|------|------|
| `src/shared/stores/dialogs.ts` | Zustand store + `dialogs` singleton |
| `src/shared/ui/dialog-renderer.tsx` | Reads store, renders all stacked dialogs |
| `src/routes/__root.tsx` | Mounts `<DialogRenderer />` once, app-wide |

## Opening a dialog

```ts
import { dialogs } from "@/shared/stores";

dialogs.open({
  title: "Delete item",
  titleIcon: <Trash2 className="size-4 text-destructive" />,
  description: "This action cannot be undone.",
  buttons: [
    { text: "Cancel",  variant: "secondary", onClick: () => dialogs.close() },
    { text: "Delete",  variant: "primary",   onClick: () => { dialogs.close(); doDelete(); } },
  ],
});
```

## Options reference

```ts
type DialogOpenOptions = {
  title?: string;
  titleIcon?: ReactNode;        // icon rendered next to the title
  description?: string;
  buttons?: DialogButton[];     // rendered in DialogFooter
  content?: ReactNode           // arbitrary JSX inside the dialog body
          | ((controls: { close: () => void }) => ReactNode); // render-prop form
};

type DialogButton = {
  text: string;
  variant?: "primary" | "secondary";  // "primary" → default button, "secondary" → outline
  onClick: () => void | Promise<void>;
};
```

## Custom content (render-prop)

```tsx
dialogs.open({
  title: "Rename file",
  content: ({ close }) => (
    <RenameForm onSuccess={(name) => { close(); applyRename(name); }} />
  ),
});
```

## Closing from inside content

Use the injected `close` from the render-prop, or call `dialogs.close()` directly.

## Stack behaviour

- `dialogs.open()` pushes a new item onto the stack and returns its `id`.
- `dialogs.close()` sets `visible: false` on the last visible item (triggers exit animation).
- Multiple dialogs can coexist; only the top-most is interactive.

## Do not

- Don't render `<DialogRenderer />` in more than one place.
- Don't import `useDialogsStore` in components that just need to open a dialog — use the `dialogs` singleton instead.
