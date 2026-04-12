# CodeToLearn

Monorepo for an interactive programming learning platform: courses, lessons, tasks, and live **React / Vue sandboxes** backed by Docker. Built on [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) (TanStack Start, Fastify, oRPC, Drizzle, Better Auth).

---

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Node.js** | 20+ recommended |
| **pnpm** | `corepack enable` then use the version from `packageManager` in root `package.json` |
| **PostgreSQL** | Required for Drizzle / auth / app data |
| **Docker** | Required to build and run **playground** preview containers (see below) |

---

## Quick start

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure the server** — copy or edit `apps/server/.env` with at least:

   - `DATABASE_URL` — PostgreSQL connection string  
   - Values required by `@ctl/env/server` (Better Auth, OAuth, CORS, UploadThing, Google AI, etc. — see that package for the full schema)

   Playground sandboxes use **`PLAYGROUND_DOCKER_IMAGE`**, which defaults to **`ctl-playground:latest`**. Override only if you tag the image differently.

3. **Apply the database schema**

   ```bash
   pnpm db:push
   ```

   For versioned migrations in other environments, use `pnpm db:migrate` after `pnpm db:generate` when you change schema.

4. **Build the playground image** (once, or after template changes)

   ```bash
   pnpm docker:playground
   ```

   Equivalent to:

   ```bash
   docker build -t ctl-playground:latest -f infra/playground/Dockerfile infra/playground
   ```

   The first build can take several minutes (`npm install` runs for both React and Vue templates inside the image).

5. **Start development**

   ```bash
   pnpm dev
   ```

| Service | URL |
|---------|-----|
| Web app | [http://localhost:3001](http://localhost:3001) |
| API | [http://localhost:3000](http://localhost:3000) |

---

## Playground Docker image

The API spawns per-session containers (see `packages/api` playground session logic) using the image built from [`infra/playground/Dockerfile`](infra/playground/Dockerfile). It bundles **React** and **Vue** Vite templates under `infra/playground/templates/`.

- Ensure **Docker Desktop** (or compatible daemon) is running before using sandbox / preview features.
- Re-run **`pnpm docker:playground`** after changing templates or the Dockerfile.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web + server (and other `dev` tasks via Turborepo) |
| `pnpm dev:web` | Web app only |
| `pnpm dev:server` | API server only |
| `pnpm build` | Production build for apps/packages in the pipeline |
| `pnpm check` | Lint and format check (Ultracite / Biome) |
| `pnpm fix` | Apply safe lint/format fixes |
| `pnpm check-types` | TypeScript project references across the monorepo |
| `pnpm db:push` | Push Drizzle schema to the database (dev-friendly) |
| `pnpm db:generate` | Generate migrations from schema changes |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm docker:playground` | Build `ctl-playground:latest` for sandboxes |

---

## Repository layout

```
ctl/
├── apps/
│   ├── web/                 # TanStack Start + Vite frontend
│   └── server/              # Fastify: oRPC, auth proxy, playground preview
├── packages/
│   ├── api/                 # oRPC routers, playground session, AI runner
│   ├── auth/                # Better Auth
│   ├── db/                  # Drizzle schema & migrations
│   ├── env/                 # Typed env (web + server)
│   ├── ui/                  # Shared shadcn/Radix components & styles
│   └── config/              # Shared TS config
└── infra/
    └── playground/          # Dockerfile + React/Vue sandbox templates
```

---

## UI (shadcn)

Shared primitives live in **`packages/ui`**.

- Tokens and globals: `packages/ui/src/styles/globals.css`
- Components: `packages/ui/src/components/*`
- Config: `packages/ui/components.json`, `apps/web/components.json`

Add components to the shared package from the repo root:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

```tsx
import { Button } from "@ctl/ui/components/button";
```

For app-only blocks, run the shadcn CLI from **`apps/web`**.
