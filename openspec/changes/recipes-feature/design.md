## Context

The AI Recipe Manager is a greenfield mobile-first web application being built as a monorepo. There is currently no backend or frontend code beyond an empty scaffold. This design document covers the initial architecture for the **Recipes feature**, which is the first deliverable, and establishes patterns that all future features will follow.

This iteration focuses exclusively on **basic recipe CRUD** — no AI integrations, no Supabase Auth, no file uploads. The goal is to get a working end-to-end system as fast as possible so features can be tested immediately.

## Goals / Non-Goals

**Goals:**
- Establish the monorepo folder structure and tooling baseline.
- Define the backend domain model, REST API contract, and service layer for Recipes.
- Define the frontend feature-based folder structure and page/component breakdown.
- Document the Supabase schema for recipes (no RLS for now).

**Non-Goals:**
- AI Video-to-Recipe pipeline (yt-dlp / AssemblyAI / Gemini) — deferred to a follow-up change.
- Supabase JWT Auth and Row-Level Security — deferred; HTTP Basic Auth stub used instead.
- Image file uploads — deferred; `imageUrl` is a plain URL string.
- Implementing Collections, Grocery, Discover, or Profile features.
- Deployment / CI-CD pipeline setup.

---

## Decisions

### 1. Monorepo Structure

```
ai-recipe-manager/
├── frontend/               # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── features/
│   │   │   └── recipes/
│   │   │       ├── components/   # RecipeCard, RecipeForm, IngredientList…
│   │   │       ├── pages/        # RecipeListPage, RecipeDetailPage, RecipeFormPage
│   │   │       ├── hooks/        # useRecipes, useRecipeForm
│   │   │       ├── services/     # recipeService.js (API calls)
│   │   │       └── utils/        # recipe-specific helpers
│   │   ├── shared/               # Shared UI atoms (Button, Input, Modal…)
│   │   ├── lib/                  # apiClient.js
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/                # Java 21 + Spring Boot 3 + Maven
│   └── src/main/java/com/recipemanager/
│       ├── recipes/
│       │   ├── domain/           # Recipe (aggregate root), Ingredient, Step
│       │   ├── application/      # RecipeService (interface), RecipeServiceImpl
│       │   ├── infrastructure/   # RecipeRepository (JPA), RecipeMapper
│       │   └── api/              # RecipeController, RecipeRequest, RecipeResponse
│       └── common/
│           ├── auth/             # BasicAuthConfig
│           └── exception/        # GlobalExceptionHandler, AppException
├── openspec/
└── AGENTS.md
```

**Rationale:** Feature-based folders co-locate all concerns (UI, hooks, services) for a feature, reducing cross-feature coupling. This mirrors DDD's bounded context concept.

---

### 2. Backend Domain Model

```
Recipe (Aggregate Root)
├── id: UUID (server-generated)
├── userId: UUID (derived from Basic Auth principal for now)
├── title: String (required, max 255)
├── description: String (optional)
├── ingredients: List<Ingredient>
│   ├── name: String
│   ├── quantity: String
│   └── unit: String
├── steps: List<Step>
│   ├── order: int
│   └── instruction: String
├── cuisine: String (optional)
├── servings: int (optional)
├── prepTimeMinutes: int (optional)
├── cookTimeMinutes: int (optional)
├── imageUrl: String (optional, plain URL string — user pastes any public image URL)
├── createdAt: Instant
└── updatedAt: Instant
```

Ingredients and steps are stored as JSONB columns (avoids join tables for MVP).

---

### 3. REST API Contract

Base path: `/api/v1`

All endpoints require HTTP Basic Auth (`Authorization: Basic <base64(user:password)>`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/recipes` | ✅ | List own recipes (paginated) |
| `GET` | `/recipes/{id}` | ✅ | Get recipe by UUID |
| `POST` | `/recipes` | ✅ | Create recipe manually |
| `PUT` | `/recipes/{id}` | ✅ | Update recipe |
| `DELETE` | `/recipes/{id}` | ✅ | Delete recipe |

**Request — Create Recipe (`POST /recipes`)**
```json
{
  "title": "Sinigang na Baboy",
  "description": "Classic Filipino sour soup",
  "ingredients": [
    { "name": "pork ribs", "quantity": "500", "unit": "g" }
  ],
  "steps": [
    { "order": 1, "instruction": "Boil the pork..." }
  ],
  "cuisine": "Filipino",
  "servings": 4,
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 45,
  "imageUrl": "https://example.com/sinigang.jpg"
}
```

**Response — Recipe (`RecipeResponse`)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Sinigang na Baboy",
  "description": "Classic Filipino sour soup",
  "ingredients": [...],
  "steps": [...],
  "cuisine": "Filipino",
  "servings": 4,
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 45,
  "totalTimeMinutes": 60,
  "imageUrl": "https://example.com/sinigang.jpg",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

---

---

### 4. Authentication Strategy

- **Spring Security in-memory user** — one hardcoded username/password (e.g. `dev` / `secret`) configured in `application.yml`.
- All `/api/v1/recipes/**` endpoints require Basic Auth. Unauthenticated requests return HTTP 401.
- `userId` is derived from the principal name and mapped to a fixed UUID so all recipes in a dev session share one owner.
- The frontend `apiClient.js` attaches the Basic Auth header to every API call.

---

### 5. Frontend Routing & Pages

```
/                     → RecipeListPage    (grid of RecipeCard components)
/recipe/new           → RecipeFormPage    (create mode)
/recipe/:id           → RecipeDetailPage  (full recipe view)
/recipe/:id/edit      → RecipeFormPage    (edit mode)

# Legacy compatibility redirects
/recipes              → /
/recipes/new          → /recipe/new
/recipes/:id          → /recipe/:id
/recipes/:id/edit     → /recipe/:id/edit
```

---

### 6. Supabase Schema

```sql
create table public.recipes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  title         text not null,
  description   text,
  ingredients   jsonb not null default '[]',
  steps         jsonb not null default '[]',
  cuisine       text,
  servings      int,
  prep_time_min int,
  cook_time_min int,
  image_url     text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| JSONB for ingredients/steps limits query flexibility | Acceptable for MVP; migration path documented when search/filter feature is needed. |
| Basic Auth credentials in frontend code | Only used in development; never shipped to production. Replaced by token-based auth before any public deployment. |
| `user_id` is a fixed UUID (not real auth) | Acceptable for dev/test; all data is single-tenant during this phase. |
| No RLS on Supabase table | Low risk while auth is stubbed and the app is in local dev; RLS activated in the JWT auth follow-up. |
| `imageUrl` as a plain string | Users can only reference publicly hosted images. Sufficient for dev; real upload support added later. |

---

### 7. Data Access — Spring Data JPA + Direct Postgres

The backend connects directly to Supabase's Postgres instance via JDBC (not the PostgREST REST API). This is the conventional Spring Boot approach and gives full SQL power.

```
Spring Boot (JPA / Hibernate)
      │
      └──JDBC (port 6543 pooler)──▶ Supabase Postgres
```

- Use the **Supabase connection pooler** (port 6543, Transaction mode) for serverless-friendly connections.
- Entities are standard `@Entity` classes; repositories extend `JpaRepository`.
- Connection string format: `jdbc:postgresql://db.<project>.supabase.co:6543/postgres?pgbouncer=true`
- `DB_URL`, `DB_USER`, `DB_PASSWORD` are externalised as environment variables.

**Rationale:** Spring Data JPA is idiomatic, testable, and avoids a bespoke HTTP client layer.

---

### 8. Image Handling

Images are stored in the `image_url` text column as either a remote URL or a base64 data URL generated client-side.

```
User chooses image input method (Upload, Camera, or URL)
      │
  If file input is used, frontend resizes/compresses client-side and converts to base64 data URL
    │
  Frontend sends imageUrl in POST /recipes or PUT /recipes/{id}
      │
  Backend stores text value in image_url column
      │
  Frontend renders <img src={imageUrl} /> with a placeholder fallback
```

---

## Resolved Decisions

| Question | Decision |
|---|---|
| Auth | HTTP Basic Auth (Spring Security in-memory user) |
| Image handling | `imageUrl` text field supporting remote URL or client-generated base64 data URL |
| Data access | Spring Data JPA + JDBC (direct Postgres connection) |
| Ownership enforcement | Service-layer `userId` filter (`findByIdAndUserId`) |

---

## UI/UX Mockups

Refer to the mockups folder for the visual direction of the frontend.
