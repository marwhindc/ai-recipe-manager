# AI Recipe Manager

AI Recipe Manager is a mobile-first monorepo for creating, editing, and managing recipes.

## Prerequisites

- Java 21
- Node.js 20+
- npm 10+
- PostgreSQL (Supabase or local)

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

Set these environment variables before running backend:

- `DB_URL`
- `DB_USER`
- `DB_PASSWORD`
- `FRONTEND_ORIGIN` (optional, default `http://localhost:5173`)