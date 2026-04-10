---
name: FE Framework Learning Design
overview: Design document for adding frontend framework learning (React, Vue, etc.) to CodeLearn using Sandpack for in-browser code execution, multi-file editing, and live preview. The design introduces a separate sandbox task model alongside the existing Docker-based task system.
todos: []
isProject: false
---

# Frontend Framework Learning Feature -- Design Document

## Context

CodeLearn currently supports learning programming languages (JS, TS, Go, Python, C, C++) through single-file coding tasks executed via Docker on the server. To support **frontend framework learning** (React first, then Vue, Svelte, Angular, etc.), we need:

- **Multi-file editing** with a file explorer (components, styles, configs)
- **Live preview** rendering the user's components in real-time
- **In-browser execution** (no Docker needed for FE -- Sandpack handles bundling + HMR)
- **In-browser testing** (Jest/Vitest via Sandpack's test runner)
- **AI grading** (reuse existing Gemini flow, adapted for multi-file submissions)

## Technology Choice: Sandpack

**Sandpack** (`@codesandbox/sandpack-react`) is the best fit:

- Apache 2.0, fully open source, self-hostable
- Built-in templates: `react`, `react-ts`, `vue`, `vue-ts`, `svelte`, `angular`, `vanilla`, `vanilla-ts`
- Composable React components: `SandpackProvider`, `SandpackCodeEditor`, `SandpackPreview`, `SandpackFileExplorer`, `SandpackConsole`, `SandpackTests`
- File management via `useSandpack()` hook -- create, update, delete files
- In-browser bundler (no server dependency), HMR, error overlay
- No special COOP/COEP headers required
- Test runner built in (Jest-compatible, runs in browser)

**Future upgrade path:** For advanced lessons (Next.js SSR, API routes, build tooling), WebContainers can be added later as a separate execution backend.

---

## Database Schema (New Tables)

All new tables live alongside the existing `task`/`task_test`/`submission` tables. The existing Docker-based system stays untouched.

### `framework` table

Equivalent of `language` but for FE frameworks. Stores Sandpack-specific config.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | e.g. `"react"`, `"vue"`, `"svelte"` |
| `name` | `text` | `"React"`, `"Vue"` |
| `icon` | `text` | Icon URL |
| `sandpack_template` | `text` | Sandpack template id: `"react-ts"`, `"vue-ts"` |
| `default_dependencies` | `jsonb` | Default npm deps: `{ "react": "^19", "react-dom": "^19" }` |
| `default_dev_dependencies` | `jsonb` | Default dev deps: `{ "@testing-library/react": "^16" }` |
| `created_at` / `updated_at` | `timestamp` | Standard |

### `course` table modification (minimal)

Add one nullable column:

- `framework_id` (`text`, nullable, FK to `framework.id`)
- Make existing `language_id` **nullable** (currently `NOT NULL`)
- Application-level constraint: exactly one of `language_id` or `framework_id` must be set

### `sandbox_task` table

Multi-file task linked 1:1 to a lesson (same pattern as `task.lesson_id` unique).

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | |
| `lesson_id` | `text` FK unique | 1:1 with lesson |
| `framework_id` | `text` FK | Which framework |
| `description` | `text` | Task description (markdown) |
| `starter_files` | `jsonb` | `{ "/App.tsx": "...", "/components/Button.tsx": "..." }` |
| `solution_files` | `jsonb` | Reference solution file tree |
| `dependencies` | `jsonb` | Additional npm deps beyond framework defaults |
| `entry_file` | `text` | Active file on open, e.g. `"/App.tsx"` |
| `read_only_files` | `jsonb` | Files user cannot edit: `["/index.tsx", "/styles.css"]` |
| `created_at` / `updated_at` | `timestamp` | |

### `sandbox_test` table

Test files for Sandpack's Jest runner.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | |
| `sandbox_task_id` | `text` FK | |
| `title` | `text` | `"renders counter"` |
| `test_file_path` | `text` | `"/App.test.tsx"` |
| `test_code` | `text` | Full test file content |
| `sort_order` | `integer` | |
| `created_at` / `updated_at` | `timestamp` | |

### `sandbox_grading_criteria` table

Same structure as existing `grading_criteria`, linked to sandbox task.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | |
| `sandbox_task_id` | `text` FK | |
| `name` | `text` | `"Component composition"` |
| `description` | `text` | Rubric description |
| `max_score` | `integer` | |
| `sort_order` | `integer` | |
| `created_at` / `updated_at` | `timestamp` | |

### `sandbox_submission` table

Stores the user's full file tree snapshot on submit.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | |
| `user_id` | `text` FK | |
| `sandbox_task_id` | `text` FK | |
| `files` | `jsonb` | Full file tree snapshot `{ "/App.tsx": "..." }` |
| `tests_passed` | `boolean` | |
| `score` | `real` | |
| `max_score` | `real` | |
| `ai_feedback` | `jsonb` | Same structure as existing |
| `submitted_at` | `timestamp` | |
| `created_at` / `updated_at` | `timestamp` | |
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

## Frontend Architecture

### New Feature Slice: `features/sandbox/`

```
src/features/sandbox/
├── index.ts
├── hooks/
│   ├── use-sandbox-task.ts        # Fetch sandbox task by lessonId
│   ├── use-sandbox-submission.ts  # Submit flow (capture files → API → AI grade)
│   └── use-sandbox-tests.ts      # Bridge to Sandpack test runner results
├── stores/
│   └── sandbox-workspace.ts      # Zustand: files, activeFile, testResults, submission state
├── lib/
│   └── sandpack-config.ts        # Template configs, default files per framework
└── ui/
    ├── sandbox-workspace.tsx      # Main layout (3 panels)
    ├── sandbox-file-explorer.tsx  # File tree with create/rename/delete
    ├── sandbox-editor.tsx         # Sandpack code editor (or Monaco bridge)
    ├── sandbox-preview.tsx        # Live preview iframe
    ├── sandbox-console.tsx        # Browser console output
    ├── sandbox-test-runner.tsx    # Test results panel
    ├── sandbox-toolbar.tsx        # Top bar with actions
    └── sandbox-description.tsx    # Task description + AI feedback
```

### New View: `views/courses/sandbox-workspace-view.tsx`

Mirrors `task-workspace-view.tsx` but renders the sandbox workspace.

### Route Detection

The existing lesson route at `courses/$slug/lessons.$lessonSlug.task.tsx` will detect which workspace to render:

```typescript
// In the task route component
const { data: task } = useTask(lessonId)
const { data: sandboxTask } = useSandboxTask(lessonId)

// Render appropriate workspace
if (sandboxTask) return <SandboxWorkspaceView ... />
if (task) return <TaskWorkspaceView ... />
```

Or cleaner: the API returns a discriminated union with `type: "docker" | "sandbox"` so the client switches once.

---

## Workspace UI Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [← Back]  [React badge]              [Run Tests] [Submit]       │
├──────────┬─────────────────────┬─────────────────────────────────┤
│ Files    │ Code Editor         │ ┌─[Preview]─[Tests]─[Console]─┐│
│          │ (tabs for open      │ │                              ││
│ 📁 src/  │  files)             │ │  Live rendered output        ││
│  App.tsx │                     │ │  (Sandpack iframe)           ││
│  main.tsx│ export const App    │ │                              ││
│  ...     │ = () => {           │ │  Updates on every keystroke  ││
│          │   return <h1>Hi</h1>│ │  with HMR                   ││
│ styles/  │ }                   │ │                              ││
│  app.css │                     │ │                              ││
│          │                     │ └──────────────────────────────┘│
│ [+] New  │                     │ Task Description / AI Feedback  │
│          │                     │ (collapsible bottom panel)      │
├──────────┴─────────────────────┴─────────────────────────────────┤
└──────────────────────────────────────────────────────────────────┘
```

**Three-column layout:**
- **Left (15-20%):** File explorer with tree view, create/rename/delete actions
- **Center (40-45%):** Code editor with file tabs, Sandpack's CodeMirror or bridged Monaco
- **Right (35-40%):** Tabbed panel -- Preview (default), Tests, Console

**Bottom overlay/drawer:** Task description (collapsible) shown by default, replaced by AI feedback after submission.

---

## API Design (New Routes)

### `sandboxTasks` router (`packages/api/src/routers/sandbox-tasks/`)

| Procedure | Auth | Description |
|-----------|------|-------------|
| `sandboxTasks.getByLessonId` | auth | Returns sandbox task + tests + existing submission |
| `sandboxTasks.submit` | auth | Receives file tree, test results; triggers AI grading |
| `sandboxTasks.saveProgress` | auth | Auto-saves user's current file tree (debounced) |

### Submit Flow

Unlike Docker tasks where the server runs tests, **sandbox tests run client-side** in Sandpack. The submit flow:

```
1. Client runs all tests via Sandpack
2. Client captures: file tree + test results
3. Client sends to sandboxTasks.submit:
   { files: Record<string, string>, testResults: TestResult[], sandboxTaskId: string }
4. Server validates test results (optional: re-verify by checking test file hashes)
5. Server runs AI grading (sends all files + solution + criteria to Gemini)
6. Server upserts sandbox_submission
7. Returns: submission with AI feedback
```

### Progress Saving

Auto-save the user's file tree periodically so they don't lose work:

```
sandboxTasks.saveProgress({ sandboxTaskId, files })
→ Stores in a lightweight `sandbox_progress` table or Redis/localStorage hybrid
```

For v1, `localStorage` keyed by `sandbox_task_id` is simplest. Server-side persistence can come later.

---

## Sandpack Integration Details

### Provider Setup

```tsx
<SandpackProvider
  template={framework.sandpackTemplate}
  files={mergedFiles}
  customSetup={{
    dependencies: { ...framework.defaultDependencies, ...task.dependencies },
    devDependencies: framework.defaultDevDependencies,
  }}
  options={{
    activeFile: task.entryFile,
    visibleFiles: Object.keys(task.starterFiles),
    recompileMode: "delayed",
    recompileDelay: 500,
  }}
>
  <SandboxWorkspace />
</SandpackProvider>
```

### File Management

Sandpack's `useSandpack()` hook provides:
- `sandpack.files` -- current file state
- `sandpack.updateFile(path, code)` -- edit a file
- `sandpack.addFile(path, code)` -- create a file
- `sandpack.deleteFile(path)` -- remove a file
- `sandpack.