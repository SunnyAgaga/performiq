# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Frontend and backend are fully self-contained — no shared library packages.

## Pending: Email Notifications

Email notifications are planned but not yet implemented. The feature requires an API key from a transactional email service. When the user provides one, implement notifications for:
- Appraisal assigned → notify employee
- Employee submits self-review → notify reviewer (manager)
- Manager completes review → notify admin/approver
- Appraisal fully completed → notify employee
- New user account created → welcome email to new user
- Goal assigned → notify employee

**Recommended services:** Resend (resend.com) or SendGrid (sendgrid.com)
**When ready:** Store the key as `RESEND_API_KEY` or `SENDGRID_API_KEY` secret, then add `backend/src/lib/email.ts` and call it from the relevant route handlers (appraisals.ts, users.ts, goals.ts).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod
- **Build**: esbuild (backend), Vite (frontend)

## Structure

```text
performiq/
├── frontend/               # React + Vite web application (@workspace/performiq)
│   └── src/
│       ├── lib/            # Self-contained API client (React Query hooks + fetch)
│       │   ├── custom-fetch.ts
│       │   ├── index.ts
│       │   └── generated/ # API types and hooks
│       ├── hooks/          # App-level React hooks (auth, etc.)
│       ├── pages/          # Route-level page components
│       └── components/     # Shared UI components
├── backend/                # Express API server (@workspace/api-server)
│   ├── src/
│   │   ├── db/             # Self-contained database layer (Drizzle + schema)
│   │   │   ├── index.ts    # Pool + Drizzle instance
│   │   │   └── schema/     # Table definitions per domain
│   │   └── routes/         # Express route handlers
│   └── drizzle.config.ts   # Drizzle Kit config (points to src/db/schema)
├── README.md               # Project documentation
├── .gitignore
├── pnpm-workspace.yaml     # pnpm workspace (frontend, backend)
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Packages

### `frontend` (`@workspace/performiq`)

React + Vite SPA. Fully self-contained — the API client lives at `frontend/src/lib/`.

- Entry: `src/main.tsx`
- App: `src/App.tsx` — sets up routing, QueryClient, auth context
- API client: `src/lib/` — custom fetch with auth token injection, React Query hooks for every endpoint
- `pnpm --filter @workspace/performiq run dev` — start dev server (port from `PORT`)

### `backend` (`@workspace/api-server`)

Express 5 API server. Fully self-contained — the DB layer lives at `backend/src/db/`.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — CORS, JSON parsing, routes mounted at `/api`
- Routes: `src/routes/` — auth, users, appraisals, cycles, criteria, goals, departments, reports, dashboard
- DB layer: `src/db/` — Drizzle ORM connection + all schema table definitions
- `pnpm --filter @workspace/api-server run dev` — build + start (port 8080)
- `pnpm --filter @workspace/api-server run build` — esbuild bundle to `dist/index.mjs`

## Database

- **Push schema changes**: `cd backend && pnpm exec drizzle-kit push` (or `push --force`)
- **Drizzle config**: `backend/drizzle.config.ts`
- `DATABASE_URL` is automatically provided by Replit

## Auth

- JWT stored in `localStorage` as `"token"`
- All API calls attach `Authorization: Bearer <token>` via `frontend/src/lib/custom-fetch.ts`
- Role hierarchy: `super_admin`(4) > `admin`(3) > `manager`(2) > `employee`(1)

## Demo Accounts (password: `password`)

- `admin@performiq.com` — super_admin
- `Johnme@performiq.com` — manager
- `sarah@performiq.com` — manager
- `alice@performiq.com` — employee
