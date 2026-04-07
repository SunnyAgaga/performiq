# Overview

PerformIQ is a standalone HR performance management system built with a separated frontend and backend architecture. It streamlines employee performance appraisals, goal setting, feedback, and attendance tracking.

CommsCRM is a customer relationship management system accessible at the `/crm/` path, running as a second app within the same Replit project.

# User Preferences

I prefer iterative development with clear, concise communication. Please ask before making significant architectural changes or adding new external dependencies. I value detailed explanations for complex features and design decisions.

# System Architecture

The project uses a standalone architecture with separate frontend and backend directories, each with its own dependencies managed by npm. CommsCRM runs as a secondary application at `/crm/`.

## Core Technologies:
- **Node.js**: 24
- **Package Manager**: npm (per-directory)
- **TypeScript**: 5.9
- **Database**: PostgreSQL (Drizzle ORM for PerformIQ, Sequelize for CommsCRM)
- **Validation**: Zod
- **Build Tools**: esbuild (both backends), Vite (both frontends)

## Application Structure:
- `frontend/`: PerformIQ React + Vite web application
- `backend/`: PerformIQ Express 5 API server (port 8080)
- `commscrm-temp/frontend/`: CommsCRM React + Vite web application
- `commscrm-temp/backend/`: CommsCRM Express API server (port 3002)

### PerformIQ Frontend (`frontend/`):
- React + Vite SPA with TailwindCSS 4
- UI components: Radix UI primitives + shadcn/ui pattern
- Routing: wouter
- State: TanStack React Query
- Auth: JWT stored in localStorage, useAuth hook
- Pages: login, dashboard, profile, employees, appraisals, goals, attendance, appearance settings
- Charting: Recharts
- PDF export: jsPDF + jsPDF-AutoTable
- Excel export: xlsx

### PerformIQ Backend (`backend/`):
- Express 5 API server with esbuild bundling
- Database: Drizzle ORM with PostgreSQL
- Auth: JWT + bcryptjs, role-based (super_admin > admin > manager > employee)
- Logging: pino + pino-http
- Email: Mailgun integration
- Proxies `/crm/api` to CommsCRM backend (port 3002) with path rewrite (`/crm/api/...` → `/api/...`)
- Proxies `/crm` to CommsCRM Vite dev server (port 4000) in development
- Spawns CommsCRM backend as child process in development
- Dev mode: proxies non-API/non-CRM requests to Vite dev server on port 3000
- Prod mode: serves static frontend from `frontend/dist/public/`

### CommsCRM Frontend (`commscrm-temp/frontend/`):
- React + Vite SPA with TailwindCSS
- Vite base path: `/crm/`
- Routing: wouter with `/crm` base
- API calls use `BASE_URL` from Vite's `import.meta.env.BASE_URL` → `/crm/api/...`
- Dev server: port 4000

### CommsCRM Backend (`commscrm-temp/backend/`):
- Express API server with esbuild bundling
- Database: Sequelize with PostgreSQL (pool.min: 1 to prevent idle exit)
- Auth: JWT + bcryptjs, roles include super_admin
- API routes mounted at `/api` only
- Port: 3002 (via CRM_PORT env var)
- Uses `--legacy-peer-deps` for npm install

## Proxy Architecture (Development):
```
Port 80 (Replit proxy) → Port 8080 (PerformIQ backend)
  /crm/api/* → pathFilter+pathRewrite → Port 3002 (CRM backend as /api/*)
  /crm/*     → pathFilter → Port 4000 (CRM Vite dev server)
  /api/*     → PerformIQ Express routes
  /*         → Port 3000 (PerformIQ Vite dev server)
```

## Authentication:
### PerformIQ:
- JWTs stored in `localStorage` as "token"
- All API calls include `Authorization: Bearer <token>`
- Role hierarchy: `super_admin`(4) > `admin`(3) > `manager`(2) > `employee`(1)

### CommsCRM:
- JWTs stored in `localStorage`
- Role: super_admin
- Login: superadmin@commscrm.com / superadmin123

## Login credentials:
### PerformIQ (seeded via `npm run db:seed` in backend/):
- admin@performiq.com / password — Admin
- sarah@performiq.com / password — Manager (Engineering)
- james@performiq.com / password — Manager (Product)
- alice@performiq.com / password — Employee (Engineering)
- bob@performiq.com / password — Employee (Engineering)
- carol@performiq.com / password — Employee (Product)
- david@performiq.com / password — Employee (Product)
- Legacy: admin@performiq.com / Admin@2024, hruser@performiq.com / HrUser@2024

### CommsCRM:
- superadmin@commscrm.com / superadmin123

## UI/UX:
- Sidebar navigation with bold/semibold black text on white background, active items use primary highlight
- Profile page with clickable avatar for photo upload (camera overlay, file picker, 5MB limit, base64)
- Login page customization from Appearance settings (headline, subtext, gradient colors)
- App settings stored in database: company name, logo letter, primary color, theme, login customization

## Ports:
- PerformIQ Frontend (Vite dev): 3000
- PerformIQ Backend (Express): 8080
- CommsCRM Frontend (Vite dev): 4000
- CommsCRM Backend (Express): 3002

## External Dependencies:
- **PostgreSQL**: Primary database (Drizzle ORM for PerformIQ, Sequelize for CommsCRM)
- **Mailgun**: For email notifications (PerformIQ)
- **JWT_SECRET**: Environment variable for JWT signing

## GitHub:
- Repos: SunnyAgaga/performiq, whitecrusthq/performiq
