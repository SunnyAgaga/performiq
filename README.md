# PerformIQ

An employee performance appraisal system with role-based access, appraisal cycles, goal tracking, and reporting.

## Project Structure

This is a multi-project repository with **two fully independent applications**:

```
performiq/
├── backend/           # Node.js + Express API server (standalone)
└── frontend/          # React + Vite web application (standalone)
```

Each project manages its own dependencies, configuration, and deployment independently.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js 24, Express 5, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT (JSON Web Tokens) |
| Validation | Zod |

## Roles

| Role | Access |
|---|---|
| `super_admin` | Full access to everything |
| `admin` | User management, reports, all appraisals |
| `manager` | Team appraisals, goal management |
| `employee` | Self-reviews, own goals |

## Demo Accounts

All demo accounts are created with password: `password`

| Email | Role | Department |
|---|---|---|
| admin@performiq.com | super_admin | Management |
| sarah@performiq.com | manager | Engineering |
| james@performiq.com | manager | Product |
| alice@performiq.com | employee | Engineering |
| bob@performiq.com | employee | Engineering |
| carol@performiq.com | employee | Product |
| david@performiq.com | employee | Product |

## Getting Started

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL and other config

# Run database migrations
npx drizzle-kit push --config ./drizzle.config.ts

# Seed demo data (optional)
npm run seed

# Start development server (port 8080)
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (port 5173)
npm run dev
```

### Build for Production

**Backend:**
```bash
cd backend
npm run build
```

**Frontend:**
```bash
cd frontend
npm run build
```

## Features

- Role-aware dashboards
- Appraisal cycle management
- Self-review + manager review workflow
- Rating criteria and competency scoring
- Goal tracking with achievement percentage
- Department management
- Reports with PDF and Excel export
- Department-level filtering on all reports

### Disclaimer this is built entirely from replit.