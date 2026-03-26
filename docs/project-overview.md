# CodeLearn — AI-Powered Code Learning Platform

## Vision

A platform for learning programming languages and frameworks through hands-on coding exercises with automated testing and AI-powered code review. Users pick a course (language/framework), progress through topics with reading material, and solve coding tasks that are evaluated by auto-tests and an AI analyzer providing scores, feedback, and improvement suggestions.

---

## Tech Stack (existing monorepo)

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TanStack Router |
| Backend | Fastify + oRPC |
| Auth | Better Auth (email/password, OAuth) |
| Database | PostgreSQL + Drizzle ORM |
| UI | shadcn/ui + Tailwind CSS |
| Monorepo | pnpm workspaces + Turborepo |
| AI | OpenAI API (code analysis) |
| Code Execution | Sandboxed runner service (Docker-based) |

---

## Supported Languages

Phase 1: **JavaScript**, **TypeScript**, **Go**, **Python**, **C**, **C++**

Language list is data-driven (stored in DB), new languages can be added without code changes — only a new Docker image + DB record.

---

## Pages & Routing

### Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero section, features overview, supported languages, CTA to sign up |
| `/login` | Auth | Sign in / Sign up forms (already exists) |

### Protected Routes (require auth)

| Route | Page | Description |
|-------|------|-------------|
| `/courses` | Courses Catalog | Grid of course cards (one per language), each showing language icon, title, short description, lesson count, user progress |
| `/courses/:courseId` | Course Detail | Left sidebar with topic/lesson list + main area with course info, description, and progress stats |
| `/courses/:courseId/topics/:topicId` | Topic View | Left sidebar (same lesson list, current highlighted), main area with reading material content, "Start Task" button (if topic has a task) |
| `/courses/:courseId/topics/:topicId/task` | Task Workspace | Split-pane coding environment (see detailed spec below) |
| `/profile` | User Profile | Avatar, name, email, stats (courses enrolled, tasks completed, average score), list of enrolled courses with progress |
| `/dashboard` | Dashboard | Overview: recent activity, in-progress courses, scores summary |

---

## Page Specifications

### 1. Landing Page (`/`)

- **Hero**: headline "Master Programming with AI-Powered Feedback", subtext, CTA buttons (Sign Up / Explore Courses)
- **Features section**: 3-4 cards — "Hands-on Coding", "Auto-tested Exercises", "AI Code Review", "Multi-language Support"
- **Languages section**: icon grid of supported languages
- **How it works**: 3-step flow — Pick a course → Solve tasks → Get AI feedback
- **Footer**: links, copyright

### 2. Courses Catalog (`/courses`)

Based on mockup — grid layout of course cards:

```
┌─────────────────────────────────────────────────────┐
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │JavaScript│ │TypeScript│ │   Go     │  ...        │
│  │  icon    │ │  icon    │ │  icon    │            │
│  │ 24 topics│ │ 18 topics│ │ 12 topics│            │
│  │ Progress │ │ Progress │ │ Progress │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Python  │ │    C     │ │   C++    │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
```

Each card:
- Language icon/logo
- Course title
- Short description (1-2 lines)
- Topic/lesson count
- User progress bar (if enrolled)
- Click → navigates to `/courses/:courseId`

### 3. Course Detail (`/courses/:courseId`)

Based on mockup — two-panel layout:

```
┌──────────────────────────────────────────────────────────┐
│ ┌──────────────┐  ┌────────────────────────────────────┐ │
│ │ Course Info   │  │                                    │ │
│ │               │  │   [Language Icon + Title]           │ │
│ │  Lesson 1 ✓   │  │                                    │ │
│ │  Lesson 2     │  │   Short info about lessons         │ │
│ │  Lesson 3     │  │                                    │ │
│ │  Lesson 4     │  │                                    │ │
│ │  Lesson 5     │  │   ┌──────────────────────────┐     │ │
│ │  Lesson 6     │  │   │ Description              │     │ │
│ │  Lesson 7     │  │   │                          │     │ │
│ │  Lesson 8     │  │   │ Full course description, │     │ │
│ │               │  │   │ prerequisites, what      │     │ │
│ │               │  │   │ you'll learn             │     │ │
│ │               │  │   └──────────────────────────┘     │ │
│ └──────────────┘  └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

- **Left sidebar**: scrollable lesson list, each with title, completion status (checkmark + score if completed)
- **Main area (when no topic selected)**: course title, language icon, description, stats (total topics, estimated hours, difficulty)
- **Main area top-right**: language icon + name card, description card below
- Click a lesson → navigates to `/courses/:courseId/topics/:topicId`

### 4. Topic View (`/courses/:courseId/topics/:topicId`)

Based on mockup — same sidebar + content layout:

```
┌──────────────────────────────────────────────────────────┐
│ ┌──────────────┐  ┌────────────────────────────────────┐ │
│ │  Lesson 1 ✓  │  │   Information to read              │ │
│ │  Lesson 2 ●  │  │                                    │ │
│ │  Lesson 3    │  │   Markdown-rendered lesson content  │ │
│ │  Lesson 4    │  │   with code examples, explanations, │ │
│ │  Lesson 5    │  │   diagrams, etc.                   │ │
│ │  Lesson 6    │  │                                    │ │
│ │  Lesson 7    │  │                                    │ │
│ │  Lesson 8    │  │                        [Test →]    │ │
│ └──────────────┘  └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

- **Left sidebar**: same lesson list with active item highlighted (blue)
- **Main content**: rendered markdown/HTML reading material from DB
- **"Test" button** (green, top-right corner): visible only if topic `hasTask === true` in DB; navigates to task workspace
- If no task — user marks topic as "read" and moves to next

### 5. Task Workspace (`/courses/:courseId/topics/:topicId/task`)

The core experience. Based on mockups — three states:

#### State A: Coding (initial)

```
┌────────────────────────────────────────────────────────────────┐
│  [← Back]  [lang selector]         [Run] [Submit]             │
│ ┌────────────────────────────┐  ┌────────────────────────────┐ │
│ │                            │  │ [Overview] [Console]       │ │
│ │   Code Editor              │  │                            │ │
│ │                            │  │  Task description          │ │
│ │   const a = 16             │  │                            │ │
│ │   const b = 2              │  │  Write a function that...  │ │
│ │                            │  │                            │ │
│ │   const sum = (a, b) => {  │  │                            │ │
│ │     return a + b;          │  │                            │ │
│ │   }                        │  │                            │ │
│ │                            │  │                            │ │
│ │   sum(a, b)                │  │                            │ │
│ │                            │  │                            │ │
│ └────────────────────────────┘  └────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

- **Left panel**: Monaco code editor with syntax highlighting for the task language
- **Right panel tabs**:
  - **Overview** (default): task description, requirements, examples
  - **Console**: stdout/stderr output from code execution
- **Top bar buttons**:
  - **Run**: executes code on server, shows output in Console tab
  - **Submit**: runs auto-tests first → if all pass → triggers AI analysis → shows Results tab

#### State B: After Run

```
┌────────────────────────────────────────────────────────────────┐
│  [← Back]  [lang selector]         [Run] [Submit]             │
│ ┌────────────────────────────┐  ┌────────────────────────────┐ │
│ │                            │  │ [Overview] [Console ●]     │ │
│ │   Code Editor              │  │                            │ │
│ │   (still editable)         │  │  Console: 18               │ │
│ │                            │  │                            │ │
│ │                            │  │                            │ │
│ └────────────────────────────┘  └────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

- Console tab auto-activates showing execution output
- Editor remains editable, user can iterate

#### State C: After Submit (AI Review)

```
┌────────────────────────────────────────────────────────────────┐
│  [← Back]                           [Next Topic →]            │
│ ┌────────────────────────────┐  ┌────────────────────────────┐ │
│ │                            │  │ [Overview] [Console]       │ │
│ │   Code Editor              │  │            [Results ●]     │ │
│ │   (read-only, greyed out)  │  │                            │ │
│ │                            │  │  Score 8/10                │ │
│ │                            │  │                            │ │
│ │                            │  │  Main points:              │ │
│ │                            │  │  • Clean function design   │ │
│ │                            │  │  • Good use of arrow fn    │ │
│ │                            │  │  • Correct return value    │ │
│ │                            │  │                            │ │
│ │                            │  │  Improvements:             │ │
│ │                            │  │  • Add type annotations    │ │
│ │                            │  │  • Handle edge cases       │ │
│ │                            │  │  • Use descriptive names   │ │
│ └────────────────────────────┘  └────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

- **Code editor becomes read-only** (greyed background) — submitted code is locked
- **Results tab** appears and auto-activates:
  - **Score**: X/10 (based on criteria from DB)
  - **Main points**: what the AI identified as good
  - **Improvements**: what could be better
- **"Next Topic"** button replaces Submit — navigates to next topic in course
- Run/Submit buttons hidden after successful submission

### 6. User Profile (`/profile`)

- User info: avatar, name, email (editable)
- Stats cards: courses enrolled, tasks completed, average score
- Enrolled courses list with progress bars and scores
- Recent submissions history

### 7. Dashboard (`/dashboard`)

- Welcome message with user name
- Cards: courses in progress (with progress %), recent task scores
- Quick links to continue where user left off

---

## Database Schema Design

### Existing tables (Better Auth)
- `user`, `session`, `account`, `verification`

### New tables

#### `language`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | e.g. "javascript", "typescript", "go" |
| `name` | `text` | Display name: "JavaScript" |
| `icon` | `text` | Icon URL or identifier |
| `docker_image` | `text` | Docker image for code execution |
| `file_extension` | `text` | e.g. ".js", ".ts", ".go" |
| `monaco_language` | `text` | Monaco editor language ID |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

#### `course`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | UUID |
| `language_id` | `text` FK → language | |
| `title` | `text` | "JavaScript Fundamentals" |
| `slug` | `text` UNIQUE | URL-friendly: "javascript-fundamentals" |
| `description` | `text` | Full course description (markdown) |
| `short_description` | `text` | Card preview text |
| `difficulty` | `text` | "beginner" / "intermediate" / "advanced" |
| `estimated_hours` | `integer` | |
| `sort_order` | `integer` | Display ordering |
| `is_published` | `boolean` | |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

#### `topic`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | UUID |
| `course_id` | `text` FK → course | |
| `title` | `text` | "Variables and Data Types" |
| `slug` | `text` | |
| `content` | `text` | Lesson reading material (markdown) |
| `sort_order` | `integer` | Position within course |
| `has_task` | `boolean` | Whether this topic has a coding task |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

#### `task`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | UUID |
| `topic_id` | `text` FK → topic (unique) | 1:1 with topic |
| `description` | `text` | Task description (markdown) |
| `starter_code` | `text` | Pre-filled code template |
| `solution_code` | `text` | Reference solution (for AI context) |
| `language_id` | `text` FK → language | Execution language |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

#### `task_test`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | UUID |
| `task_id` | `text` FK → task | |
| `title` | `text` | "should return sum of two numbers" |
| `test_code` | `text` | Auto-test source code |
| `sort_order` | `integer` | |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

#### `grading_criteria`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | UUID |
| `task_id` | `text` FK → task | |
| `name` | `text` | "Code readability" |
| `description` | `text` | What AI should evaluate |
| `max_score` | `integer` | Points for this criterion |
| `sort_order` | `integer` | |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

#### `enrollment`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | UUID |
| `user_id` | `text` FK → user | |
| `course_id` | `text` FK → course | |
| `enrolled_at` | `timestamp` | |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |
| | UNIQUE | (`user_id`, `course_id`) |

#### `topic_progress`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | UUID |
| `user_id` | `text` FK → user | |
| `topic_id` | `text` FK → topic | |
| `status` | `text` | "not_started" / "in_progress" / "completed" |
| `completed_at` | `timestamp` | Nullable |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |
| | UNIQUE | (`user_id`, `topic_id`) |

#### `submission`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | UUID |
| `user_id` | `text` FK → user | |
| `task_id` | `text` FK → task | |
| `code` | `text` | Submitted source code |
| `language_id` | `text` FK → language | |
| `tests_passed` | `boolean` | All auto-tests passed? |
| `score` | `integer` | AI-assigned total score |
| `max_score` | `integer` | Maximum possible score |
| `ai_feedback` | `jsonb` | `{ mainPoints: string[], improvements: string[], criteriaScores: { criteriaId, score, comment }[] }` |
| `submitted_at` | `timestamp` | |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

### Entity Relationship Summary

```
user ─┬─< enrollment >─── course ──< topic ──< task ──< task_test
      │                                              └──< grading_criteria
      ├─< topic_progress >── topic
      └─< submission >────── task
```

---

## API Design (oRPC Routers)

### `courses` router
| Procedure | Auth | Description |
|-----------|------|-------------|
| `courses.list` | public | List published courses with language info |
| `courses.getBySlug` | public | Get course detail by slug |
| `courses.getTopics` | auth | List topics for a course (with user progress) |

### `topics` router
| Procedure | Auth | Description |
|-----------|------|-------------|
| `topics.getById` | auth | Get topic content + task info |
| `topics.markRead` | auth | Mark topic as completed (for topics without tasks) |

### `tasks` router
| Procedure | Auth | Description |
|-----------|------|-------------|
| `tasks.getByTopicId` | auth | Get task details, starter code, tests count |
| `tasks.run` | auth | Execute code → return stdout/stderr |
| `tasks.runTests` | auth | Run auto-tests → return results per test |
| `tasks.submit` | auth | Run tests + AI analysis → return score & feedback |

### `submissions` router
| Procedure | Auth | Description |
|-----------|------|-------------|
| `submissions.getForTask` | auth | Get user's latest submission for a task |
| `submissions.history` | auth | List user's submissions (profile page) |

### `profile` router
| Procedure | Auth | Description |
|-----------|------|-------------|
| `profile.get` | auth | Get user profile with stats |
| `profile.update` | auth | Update name, avatar |
| `profile.getEnrollments` | auth | Enrolled courses with progress |

---

## Code Execution Engine

### Architecture

```
Client (browser)
  │
  ▼
Fastify API server
  │
  ▼
Code Runner Service
  │
  ▼
Docker Container (per language)
  - Isolated execution
  - Resource limits (CPU, memory, time)
  - Network disabled
  - Read-only filesystem (except /tmp)
```

### Execution Flow

1. **Run button**: client sends code to `tasks.run`
   - Server creates a temp file with user code
   - Spawns Docker container for the language
   - Captures stdout/stderr with timeout (10s default)
   - Returns output to client

2. **Submit button**: client sends code to `tasks.submit`
   - Step 1: Run all `task_test` entries against user code
   - Step 2: If all tests pass → call AI analysis
   - Step 3: If any test fails → return test results, no AI analysis
   - AI analysis uses grading criteria from DB to evaluate code
   - Returns score + structured feedback

### Docker Images per Language

| Language | Image | Run Command |
|----------|-------|-------------|
| JavaScript | `node:20-alpine` | `node /tmp/code.js` |
| TypeScript | `node:20-alpine` + tsx | `npx tsx /tmp/code.ts` |
| Python | `python:3.12-alpine` | `python /tmp/code.py` |
| Go | `golang:1.22-alpine` | `go run /tmp/code.go` |
| C | `gcc:14` | `gcc /tmp/code.c -o /tmp/out && /tmp/out` |
| C++ | `gcc:14` | `g++ /tmp/code.cpp -o /tmp/out && /tmp/out` |

### Auto-tests Execution

Tests are stored as code strings in `task_test` table. The runner wraps user code + test code into a single execution unit per language:

- **JS/TS**: test code imports user functions, uses simple assert-style checks
- **Python**: test code uses `assert` statements
- **Go/C/C++**: test code compiled together with user code

Each test returns: `{ title, passed, error? }`.

---

## AI Code Analysis

### Provider
OpenAI API (`gpt-4o` or similar) via structured output.

### Prompt Structure

```
You are an expert code reviewer evaluating a student's solution.

Language: {language}
Task: {taskDescription}
Reference solution: {solutionCode}

Grading criteria:
{criteriaList with names, descriptions, and max scores}

Student's code:
{submittedCode}

Evaluate the code against each criterion and provide:
1. Score for each criterion (0 to max_score)
2. Main positive points (2-4 bullet points)
3. Improvement suggestions (2-4 bullet points)
4. Total score out of max possible

Return structured JSON.
```

### Response Schema

```typescript
type AIFeedback = {
  totalScore: number
  maxScore: number
  mainPoints: string[]
  improvements: string[]
  criteriaScores: {
    criteriaId: string
    score: number
    maxScore: number
    comment: string
  }[]
}
```

---

## Frontend Architecture (FSD)

### Feature Slices

```
src/
├── shared/
│   ├── api/            # oRPC client, query utils
│   ├── ui/             # Page loader, code editor wrapper, markdown renderer
│   ├── lib/            # Utilities
│   ├── hooks/          # usePermissions, useIsMobile
│   ├── stores/         # User store (Zustand)
│   ├── constants/      # Roles, score thresholds
│   └── providers/      # QueryProvider, AuthProvider
│
├── features/
│   ├── auth/           # Sign in/up forms, auth hooks (existing, to refactor)
│   │   ├── ui/         # sign-in-form.tsx, sign-up-form.tsx
│   │   └── hooks/      # use-session.ts
│   │
│   ├── courses/        # Course catalog and details
│   │   ├── ui/         # course-card.tsx, course-list.tsx, topic-sidebar.tsx
│   │   ├── hooks/      # use-courses.ts, use-course.ts, use-enrollment.ts
│   │   └── lib/        # progress-utils.ts
│   │
│   ├── topics/         # Topic reading content
│   │   ├── ui/         # topic-content.tsx, topic-nav.tsx
│   │   └── hooks/      # use-topic.ts
│   │
│   ├── tasks/          # Task workspace
│   │   ├── ui/         # code-editor.tsx, task-description.tsx, console-output.tsx
│   │   │               # test-results.tsx, ai-feedback.tsx, task-toolbar.tsx
│   │   ├── hooks/      # use-task.ts, use-code-runner.ts, use-submission.ts
│   │   ├── stores/     # task-workspace.ts (editor state, active tab, submission state)
│   │   └── lib/        # language-config.ts
│   │
│   └── profile/        # User profile
│       ├── ui/         # profile-card.tsx, stats-cards.tsx, enrollment-list.tsx
│       └── hooks/      # use-profile.ts
│
├── views/
│   ├── landing/        # landing-view.tsx
│   ├── auth/           # sign-in-view.tsx
│   ├── courses/        # courses-view.tsx, course-detail-view.tsx
│   ├── topics/         # topic-view.tsx
│   ├── tasks/          # task-workspace-view.tsx
│   ├── profile/        # profile-view.tsx
│   └── dashboard/      # dashboard-view.tsx
│
└── routes/
    ├── __root.tsx
    ├── index.tsx                              # → LandingView
    ├── login.tsx                              # → SignInView
    ├── dashboard.tsx                          # → DashboardView
    ├── profile.tsx                            # → ProfileView
    ├── courses/
    │   ├── index.tsx                          # → CoursesView
    │   ├── $courseId.tsx                       # layout: course shell
    │   ├── $courseId/
    │   │   ├── index.tsx                      # → CourseDetailView
    │   │   ├── topics.$topicId.tsx            # → TopicView
    │   │   └── topics.$topicId.task.tsx       # → TaskWorkspaceView
    └── ...
```

### Key State Management

**Task Workspace Store** (Zustand):
- `code`: current editor content
- `activeTab`: "overview" | "console" | "results"
- `isRunning`: boolean
- `isSubmitting`: boolean
- `consoleOutput`: string
- `testResults`: TestResult[]
- `submission`: Submission | null (locks editor when present)
- `isReadOnly`: derived from submission state

---

## Implementation Order

### Phase 1: Foundation
1. DB schema — add all new tables, generate migrations
2. Seed data — create 1-2 sample courses with topics, tasks, tests, criteria
3. API routers — `courses`, `topics`, `tasks`, `submissions`, `profile`
4. Refactor web app to FSD structure (move existing components)

### Phase 2: Core Pages
5. Landing page
6. Courses catalog page
7. Course detail page with topic sidebar
8. Topic reading page

### Phase 3: Task Workspace
9. Code editor integration (Monaco)
10. Code execution endpoint (Docker runner)
11. Auto-test execution
12. Task workspace UI (all 3 states)

### Phase 4: AI & Polish
13. AI code analysis integration (OpenAI)
14. Submit flow with scoring and feedback display
15. Profile page with stats and history
16. Dashboard with progress overview

### Phase 5: Production
17. Rate limiting on code execution
18. Execution queue (prevent abuse)
19. Admin panel for course management (optional/future)
20. Additional languages

---

## Environment Variables (new)

### Server (`packages/env/src/server.ts`)

```
OPENAI_API_KEY          # OpenAI API key for code analysis
DOCKER_SOCKET_PATH      # Docker socket (default: /var/run/docker.sock)
CODE_EXECUTION_TIMEOUT  # Max execution time in ms (default: 10000)
CODE_EXECUTION_MEMORY   # Max memory per container (default: "128m")
```

### Web (`packages/env/src/web.ts`)

No new env vars needed — all config comes from API.

---

## Security Considerations

- **Code execution**: fully sandboxed Docker containers with no network, limited CPU/memory, read-only FS
- **Rate limiting**: max N executions per user per minute
- **Input validation**: Zod schemas on all API inputs, code size limits
- **Auth guards**: all task/submission endpoints require authentication
- **AI prompt injection**: user code is passed as data, not as instructions; system prompt is fixed
- **Submission integrity**: server-side test execution only, no client-side test running
