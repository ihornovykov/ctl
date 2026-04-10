# Frontend Framework Learning — Sandbox Workspace

## Overview

This document describes the design and implementation of the **Sandbox Workspace** feature: an in-browser coding environment for learning frontend frameworks (React first, then Vue, Svelte, Angular, etc.) with multi-file editing, live preview, in-browser testing, and AI grading.

---

## Technology: Sandpack

**Sandpack** (`@codesandbox/sandpack-react`) — Apache 2.0, self-hostable, no special server headers required.

Key capabilities used:
- `SandpackProvider` — context with virtual file system + bundler
- `SandpackCodeEditor` — CodeMirror-based editor with syntax highlighting
- `SandpackPreview` — live iframe preview with HMR
- `SandpackTests` — in-browser Jest-compatible test runner
- `SandpackConsole` — browser console output
- `useSandpack()` — hook to read/write files programmatically

**Future upgrade path:** WebContainers (StackBlitz) can be added later for advanced lessons requiring Node.js SSR, API routes, or build tooling configuration.

---

## Database Schema

### New: `framework` table

Stores Sandpack-specific config per framework.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | `"react"`, `"vue"`, `"svelte"` |
| `name` | `text` | `"React"`, `"Vue"` |
| `icon` | `text` | Icon URL |
| `sandpack_template` | `text` | `"react-ts"`, `"vue-ts"` |
| `default_dependencies` | `jsonb` | `{ "react": "^19", "react-dom": "^19" }` |
| `default_dev_dependencies` | `jsonb` | `{ "@testing-library/react": "^16" }` |

### Modified: `course` table

- Add `framework_id` (nullable FK → `framework.id`)
- Make `language_id` nullable
- App-level constraint: exactly one of `language_id` or `framework_id` must be set

### New: `sandbox_task` table

Multi-file task, 1:1 with lesson (same uniqueness pattern as `task.lesson_id`).

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | |
| `lesson_id` | `text` FK unique | 1:1 with lesson |
| `framework_id` | `text` FK | |
| `description` | `text` | Task description (markdown) |
| `starter_files` | `jsonb` | `{ "/App.tsx": "...", "/components/Button.tsx": "..." }` |
| `solution_files` | `jsonb` | Reference solution file tree |
| `dependencies` | `jsonb` | Additional npm deps beyond framework defaults |
| `entry_file` | `text` | Active file on open, e.g. `"/App.tsx"` |
| `read_only_files` | `jsonb` | Files user cannot edit: `["/index.tsx"]` |

### New: `sandbox_test` table

Test files injected into the Sandpack test runner.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | |
| `sandbox_task_id` | `text` FK | |
| `title` | `text` | `"renders counter"` |
| `test_file_path` | `text` | `"/App.test.tsx"` |
| `test_code` | `text` | Full test file content |
| `sort_order` | `integer` | |

### New: `sandbox_grading_criteria` table

Same structure as `grading_criteria`, linked to sandbox task.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | |
| `sandbox_task_id` | `text` FK | |
| `name` | `text` | `"Component composition"` |
| `description` | `text` | Rubric description for AI |
| `max_score` | `integer` | |
| `sort_order` | `integer` | |

### New: `sandbox_submission` table

Stores user's full file tree snapshot on submit.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | |
| `user_id` | `text` FK | |
| `sandbox_task_id` | `text` FK | |
| `files` | `jsonb` | Full file tree `{ "/App.tsx": "..." }` |
| `tests_passed` | `boolean` | |
| `score` | `real` | |
| `max_score` | `real` | |
| `ai_feedback` | `jsonb` | Same shape as existing submission AI feedback |
| `submitted_at` | `timestamp` | |
| | UNIQUE | `(user_id, sandbox_task_id)` |

### Entity Relationships

```
framework 1──* course (via framework_id)
course 1──* lesson
lesson 1──0..1 sandbox_task
sandbox_task 1──* sandbox_test
sandbox_task 1──* sandbox_grading_criteria
sandbox_task 1──* sandbox_submission
user 1──* sandbox_submission
```

---

## Workspace UI Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  [← Back]  [React TS badge]           [Run Tests]  [Submit]          │
├──────────┬──────────────────────┬─────────────────────────────────────┤
│ Files    │ Code Editor          │ [Preview] [Tests] [Console]         │
│          │ (open file tabs)     │                                     │
│ /App.tsx │                      │  ┌──────────────────────────────┐   │
│ /styles/ │ export const App =   │  │  Live rendered output         │   │
│   app.css│   () => {            │  │  (Sandpack iframe, HMR)       │   │
│ /compo.. │   return (           │  │                               │   │
│   Button │     <div>Hello</div> │  └──────────────────────────────┘   │
│          │   )                  │                                     │
│          │ }                    │  Task Description (collapsible)     │
│ [+] New  │                      │  → AI Feedback after submit         │
└──────────┴──────────────────────┴─────────────────────────────────────┘
```

**Layout columns:**
- **Left (18%):** File explorer — tree view, create/rename/delete, read-only file indicators
- **Center (42%):** Code editor — Sandpack's CodeMirror, file tabs for open files, syntax highlighting
- **Right (40%):** Tabbed panel:
  - **Preview** (default): live iframe with HMR
  - **Tests**: in-browser Jest results
  - **Console**: browser `console.log` output

**Bottom drawer (right panel):** Task description shown by default; replaced by AI feedback panel after successful submission.

---

## Frontend Architecture

### Feature slice: `features/sandbox/`

```
src/features/sandbox/
├── index.ts
├── hooks/
│   ├── use-sandbox-task.ts        # orpc.sandboxTasks.getByLessonId query
│   └── use-sandbox-submission.ts  # submit flow: capture files → API → AI grade
├── stores/
│   └── sandbox-workspace.ts       # Zustand: submission state, test results, active tab
├── lib/
│   └── sandpack-config.ts         # mergeFiles, buildSandpackSetup helpers
└── ui/
    ├── sandbox-workspace.tsx       # Main 3-column layout, SandpackProvider wrapper
    ├── sandbox-file-explorer.tsx   # File tree with create/delete actions
    ├── sandbox-editor.tsx          # SandpackCodeEditor wrapper with open-file tabs
    ├── sandbox-preview.tsx         # SandpackPreview with error overlay
    ├── sandbox-console.tsx         # SandpackConsole wrapper
    ├── sandbox-test-runner.tsx     # SandpackTests + maps results to sandbox_test records
    ├── sandbox-toolbar.tsx         # Top bar: back, framework badge, Run Tests, Submit
    └── sandbox-description.tsx    # Task description + AI feedback (shared right panel bottom)
```

### View: `views/courses/sandbox-workspace-view.tsx`

Mirrors the existing `task-workspace-view.tsx`. Fetches lesson via `useLesson`, then renders the sandbox workspace with `lessonId`.

### Route detection

The existing route `courses/$slug/lessons/$lessonSlug/task` queries both task types and renders the appropriate workspace:

```typescript
// Lesson route queries for both task types
const { data: task } = useTask(lessonId)            // Docker task
const { data: sandboxTask } = useSandboxTask(lessonId) // Sandbox task

if (sandboxTask) return <SandboxWorkspaceView ... />
if (task) return <TaskWorkspaceView ... />
```

---

## API Design

### `sandboxTasks` router (`packages/api/src/routers/sandbox-tasks/`)

| Procedure | Auth | Description |
|-----------|------|-------------|
| `sandboxTasks.getByLessonId` | auth | Returns sandbox task + tests + existing submission |
| `sandboxTasks.submit` | auth | Receives file tree + test results; runs AI grading; upserts submission |

### Submit flow

Sandbox tests run **client-side** in Sandpack's browser iframe. The submit flow:

```
1. User clicks Submit
2. Client runs all test files via SandpackTests
3. Client captures: { files, testResults }
4. Client sends to sandboxTasks.submit
5. Server verifies test file hashes against DB (integrity check)
6. Server calls Gemini AI with all files + solution files + criteria
7. Server upserts sandbox_submission
8. Returns: submission + aiFeedback
```

### Progress saving (v1)

User file changes are saved to `localStorage` keyed by `sandbox_task_id`. On workspace load, stored files are merged on top of `starter_files`. Server-side progress persistence can be added in v2.

---

## Sandpack Integration

```tsx
<SandpackProvider
  template={framework.sandpackTemplate}
  files={mergedFiles}  // starter_files + localStorage overrides + test files
  customSetup={{
    dependencies: {
      ...framework.defaultDependencies,
      ...task.dependencies,
    },
    devDependencies: framework.defaultDevDependencies,
  }}
  options={{
    activeFile: task.entryFile,
    recompileMode: "delayed",
    recompileDelay: 300,
  }}
>
  <SandboxWorkspaceLayout />
</SandpackProvider>
```

---

## Framework Extensibility

Adding Vue (or Svelte, Angular, Solid) requires only:
1. Insert a `framework` row: `{ id: "vue", sandpack_template: "vue-ts", ... }`
2. Create a course + lessons + sandbox tasks with Vue-specific starter files
3. **Zero code changes** — Sandpack handles Vue bundling and preview natively

Supported Sandpack templates: `react`, `react-ts`, `vue`, `vue-ts`, `vue3`, `svelte`, `angular`, `solid`, `vanilla`, `vanilla-ts`.

---

## Migration Strategy

- All existing Docker-based courses work unchanged
- New FE framework courses use `framework_id` instead of `language_id`
- Dashboard, progress, and certificates continue working — they operate at lesson level, not task-type level
- The `hasTask` flag on `lesson` stays unchanged; the route detects which task type exists

---

## Files Created / Modified

| File | Action |
|------|--------|
| `packages/db/src/schema/sandbox.ts` | New — framework + sandbox_task + sandbox_test + sandbox_grading_criteria + sandbox_submission tables |
| `packages/db/src/schema/course.ts` | Modified — add nullable `frameworkId` column, make `languageId` nullable |
| `packages/db/src/schema/index.ts` | Modified — re-export sandbox schema |
| `packages/api/src/routers/sandbox-tasks/index.ts` | New — sandboxTasks router |
| `packages/api/src/routers/sandbox-tasks/validation.ts` | New — Zod schemas |
| `packages/api/src/routers/index.ts` | Modified — mount sandboxTasks router |
| `apps/web/src/features/sandbox/` | New — entire feature slice |
| `apps/web/src/views/courses/sandbox-workspace-view.tsx` | New — sandbox workspace view |
| `apps/web/src/views/courses/index.ts` | Modified — re-export sandbox view |
| `apps/web/src/routes/courses/$slug/lessons.$lessonSlug.task.tsx` | Modified — detect sandbox vs docker task |
| `packages/db/src/seed.ts` | Modified — seed React framework + course + lessons + tasks |
