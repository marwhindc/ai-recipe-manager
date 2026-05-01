# AGENTS.md

Agent instructions for the AI Recipe Manager monorepo.

Closest file wins: when working in a subproject, prefer that directory's `AGENTS.md` over this root file.

## Project Overview

AI Recipe Manager is a mobile-first monorepo for creating, editing, and managing recipes.

- Frontend: React 18 + Vite + Tailwind CSS (`frontend/`)
- Backend: Java 21 + Spring Boot 3 + Spring Data JPA (`backend/`)
- Database: PostgreSQL (Supabase or local)
- Architectural style:
  - Frontend uses feature-based folders (`src/features/<feature>/...`)
  - Backend uses domain-driven feature packages (`com.recipemanager.<feature>.*`)

## Monorepo Layout

- `frontend/`: Vite app, mobile-first UI, shared UI atoms in `src/shared/components/`
- `backend/`: REST API, recipe domain and auth/exception common modules
- `mockups/`: visual references
- `openspec/`: proposals, design docs, specs, and implementation tasks

## Setup Commands

### Prerequisites

- Java 21
- Node.js 20+
- npm 10+
- PostgreSQL (Supabase or local)
- Maven 3.9+ available in shell `PATH`

### Frontend setup

```bash
cd frontend
npm install
```

### Backend setup

```bash
cd backend
mvn -v
```

Note for Windows: if `mvn` is not available in PowerShell but works in Git Bash, run backend commands from Git Bash.

## Environment Configuration

Keep secrets in environment variables or `.env` files that are gitignored.

### Backend environment variables

- `DB_URL`
- `DB_USER`
- `DB_PASSWORD`
- `FRONTEND_ORIGIN` (optional, defaults to `http://localhost:5173`)
- `PORT` (optional, defaults to `8080`)

Backend config files:

- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-local.yml`

### Frontend environment variables

- `VITE_API_BASE_URL` (required by `src/lib/apiClient.js`)

The frontend throws a startup/runtime error if `VITE_API_BASE_URL` is missing.

## Development Workflow

### Start frontend

```bash
cd frontend
npm run dev
```

### Start backend

```bash
cd backend
mvn spring-boot:run
```

Backend local auth currently uses HTTP Basic with a dev account:

- username: `dev`
- password: `secret`

Core API route:

- `/api/v1/recipes`

Health endpoint:

- `/actuator/health`

## Testing Instructions

### Backend tests

Run all backend tests:

```bash
cd backend
mvn test
```

Run a single backend test class:

```bash
cd backend
mvn -Dtest=RecipeServiceImplTest test
```

Backend tests live under `backend/src/test/java`.

### Frontend checks

Run linting:

```bash
cd frontend
npm run lint
```

Current status: lint command exists and runs, but the repository may contain existing lint violations. Do not assume a clean lint baseline unless you fixed/verified it in your branch.

## Code Style and Conventions

### Global rules

- Do not add new dependencies without explicit user approval.
- Keep comments and documentation unless explicitly asked to remove them.
- Prefer small, focused changes over broad refactors.

### Frontend conventions

- Keep feature code in `src/features/<feature>/`.
- Keep shared building blocks in `src/shared/components/`.
- Keep API helpers in `src/lib/`.
- Reuse existing shared components before creating duplicates.
- Build mobile-first layouts before desktop refinements.

### Backend conventions

- Keep feature packages split by `api`, `application`, `domain`, `infrastructure`.
- Return RESTful JSON responses.
- Use UUIDs for identifiers.
- Keep cross-cutting concerns in `com.recipemanager.common`.

## Database and Migrations

- Migration SQL: `backend/src/main/resources/db/migration/V1__create_recipes_table.sql`
- Recipe ingredients and steps are stored as JSONB.
- Recipe IDs are UUIDs (`gen_random_uuid()` in Postgres).

## Build and Packaging

### Frontend build

```bash
cd frontend
npm run build
```

Build output: `frontend/dist/`

### Backend build

```bash
cd backend
mvn clean package
```

Build outputs are generated under `backend/target/`.

## Security Notes

- Never commit secrets or `.env` files.
- Keep CORS origin aligned with `FRONTEND_ORIGIN`.
- Local Basic Auth credentials are for development only.

## Pull Request and Commit Guidance

Use Conventional Commits with paragraph-form body.

Format:

```text
<type>(<optional scope>): <subject>

<what/how>

<why>
```

Rules:

- `type` must be one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Subject is imperative, lowercase start, no trailing period
- Body must explain both implementation details (what/how) and rationale (why)

Before opening a PR, run what applies to your changes:

- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `cd backend && mvn test`

## Troubleshooting

- `mvn: command not found` in PowerShell:
  - Use Git Bash if Maven is installed there, or add Maven to system `PATH`.
- Frontend request failures at startup:
  - Confirm `VITE_API_BASE_URL` is set.
- CORS issues:
  - Confirm `FRONTEND_ORIGIN` matches your frontend dev origin.
- Database connectivity issues:
  - Verify `DB_URL`, `DB_USER`, and `DB_PASSWORD` and that Postgres is reachable.
