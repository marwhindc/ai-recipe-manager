## 1. Monorepo Scaffold

- [ ] 1.1 Initialise `/frontend` with Vite + React 18 template and install Tailwind CSS; configure `tailwind.config.js` and `postcss.config.js`
- [ ] 1.2 Create feature-based folder structure under `frontend/src/features/recipes/` (components/, pages/, hooks/, services/, utils/)
- [ ] 1.3 Create `frontend/src/shared/` for reusable UI atoms (Button, Input, Modal, Spinner, etc.)
- [ ] 1.4 Create `frontend/src/lib/` with `apiClient.js` (Axios or fetch wrapper that attaches Basic Auth credentials to every request)
- [ ] 1.5 Add `.env.example` to `/frontend` with `VITE_API_BASE_URL`; add `.env` to `.gitignore`
- [ ] 1.6 Initialise `/backend` as a Spring Boot 3 + Java 21 Maven project with `spring-boot-starter-web`, `spring-boot-starter-validation`, `spring-boot-starter-security`, `spring-boot-starter-data-jpa`, and `postgresql` JDBC driver
- [ ] 1.7 Create domain-driven package structure under `com.recipemanager` (recipes/{domain,application,infrastructure,api}, common/{auth,exception})
- [ ] 1.8 Add `application.yml` and `application-local.yml`; configure JDBC datasource env vars (`DB_URL`, `DB_USER`, `DB_PASSWORD`); add `.gitignore` entries for secrets
- [ ] 1.9 Write root `AGENTS.md` documenting repo layout, how to run each sub-project, and contribution conventions
- [ ] 1.10 Write `frontend/AGENTS.md` and `backend/AGENTS.md` with sub-project-specific instructions

## 2. Database Setup

- [ ] 2.1 Create `recipes` table in Supabase (or local Postgres) with the schema defined in `design.md` — UUID PK, `user_id` UUID, JSONB for ingredients/steps;
- [ ] 2.2 Document the table schema and how to run it in `backend/AGENTS.md`
- [ ] 2.3 (Optional / deferred) Enable Row-Level Security when Supabase JWT auth is wired up in the follow-up change

## 3. Backend — Common Infrastructure

- [ ] 3.1 Configure Spring Security HTTP Basic Auth with a single in-memory user (e.g. username `dev`, password `secret`); permit CORS from the frontend dev origin
- [ ] 3.2 Map the Basic Auth principal name to a fixed `userId` UUID (e.g. via a `UserPrincipal` wrapper); all recipe operations use this userId so ownership is consistent across requests
- [ ] 3.3 Implement `GlobalExceptionHandler` (`@RestControllerAdvice`) mapping `AppException` subclasses to HTTP status codes and a consistent JSON error shape `{ "error": "<code>", "message": "..." }`
- [ ] 3.4 Add `AppException` hierarchy: `ResourceNotFoundException` (404), `UnauthorizedException` (401)

## 4. Backend — Recipe Domain

- [ ] 4.1 Define `Recipe` `@Entity` with fields: UUID id, userId, title, description, ingredients, steps (JSONB via `@JdbcTypeCode(SqlTypes.JSON)`), cuisine, servings, prepTimeMinutes, cookTimeMinutes, imageUrl, createdAt, updatedAt
- [ ] 4.2 Define `Ingredient` and `Step` as plain Java records (serialised into JSONB via Jackson)
- [ ] 4.3 Implement `RecipeRepository` extending `JpaRepository<Recipe, UUID>` with custom finders: `findAllByUserId(UUID userId, Pageable pageable)`, `findByIdAndUserId(UUID id, UUID userId)`, `deleteByIdAndUserId`
- [ ] 4.4 Implement `RecipeMapper`: `RecipeRequest` → `Recipe` and `Recipe` → `RecipeResponse` (compute `totalTimeMinutes`)
- [ ] 4.5 Implement `RecipeServiceImpl` with methods: `listRecipes(userId, page, pageSize)`, `getRecipe(userId, id)`, `createRecipe(userId, request)`, `updateRecipe(userId, id, request)`, `deleteRecipe(userId, id)`
- [ ] 4.6 Implement `RecipeController` with all 5 CRUD endpoints; annotate with `@Valid` on request bodies; extract userId from `SecurityContext`
- [ ] 4.7 Write unit tests for `RecipeServiceImpl` (mock repository) covering happy paths and error cases

## 5. Frontend — Shared UI Foundation

- [ ] 5.1 Define Tailwind design tokens in `tailwind.config.js`: warm brand palette (inspired by Flavorish), font families (e.g. `Outfit` or `Inter` from Google Fonts), border-radius scale
- [ ] 5.2 Create shared `Button` component with variants: primary, secondary, ghost, danger; with loading state prop
- [ ] 5.3 Create shared `Input`, `Textarea`, `Select` form components with label, error message, and disabled state
- [ ] 5.4 Create shared `Modal` / `ConfirmDialog` component
- [ ] 5.5 Create shared `Spinner` / `LoadingOverlay` component
- [ ] 5.6 Create shared `BottomNav` (mobile) component with tab icons for Recipes, Collections, Grocery, Discover, Profile — Recipes is the only active route for now
- [ ] 5.7 Set up React Router v6 in `App.jsx` with routes: `/`, `/recipes`, `/recipes/new`, `/recipes/:id`, `/recipes/:id/edit`

## 6. Frontend — Recipes Feature

- [ ] 6.1 Implement `recipeService.js`: functions `listRecipes()`, `getRecipe(id)`, `createRecipe(data)`, `updateRecipe(id, data)`, `deleteRecipe(id)` — all calling the backend API with Basic Auth credentials attached by `apiClient.js`
- [ ] 6.2 Implement `useRecipes` hook: fetches recipe list, exposes loading/error states
- [ ] 6.3 Implement `useRecipeForm` hook: manages form state, validation, submit handler for both create and edit modes
- [ ] 6.4 Build `RecipeCard` component: image (with placeholder fallback for missing `imageUrl`), title, cuisine badge, total time chip, tappable link to detail page
- [ ] 6.5 Build `RecipeListPage`: fetch and render `RecipeCard` grid; empty state with CTA; FAB (floating action button) to navigate to `/recipes/new`
- [ ] 6.6 Build `RecipeDetailPage`: display all recipe fields; sticky header with back button, edit button, delete button; render ingredient list and numbered steps
- [ ] 6.7 Build `RecipeFormPage` (create + edit modes): form fields for title, description, ingredients, steps, cuisine, servings, prep/cook time, and `imageUrl` text input; edit mode pre-populates all fields
- [ ] 6.8 Add delete confirmation modal to `RecipeDetailPage` using the shared `ConfirmDialog` component

## 7. Polish & Verification

- [ ] 7.1 Verify all backend endpoints return the expected HTTP status codes and JSON shapes (manual testing via Postman or httpie)
- [ ] 7.2 Verify that one user's `userId` cannot access or modify recipes belonging to a different `userId` (service-layer enforcement)
- [ ] 7.3 Verify mobile-first layout on a 375 px-wide viewport: card grid, form, and detail page all render correctly
- [ ] 7.4 Check that no credentials or secrets are committed to Git
- [ ] 7.5 Update `README.md` at repo root with: project description, prerequisites (Java 21, Node 20), and commands to run each sub-project
