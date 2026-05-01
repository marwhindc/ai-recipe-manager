## Why

The AI Recipe Manager needs a foundational Recipes feature so that users can store, manage, and discover recipes. Today there is no way to save or organise a recipe digitally in this app. This change establishes the monorepo structure and delivers a fully functional CRUD interface for recipes, providing the stable foundation on which AI and social features will be layered later.

## What Changes

- Scaffold monorepo with `/frontend` (React + Vite + Tailwind CSS) and `/backend` (Java 21 + Spring Boot 3) sub-projects.
- Introduce a **Recipes** domain on the backend: `Recipe` aggregate with fields for title, description, ingredients, steps, cuisine, servings, prep/cook time, image URL, and timestamps.
- Expose a RESTful JSON API for CRUD operations on recipes (list, get, create, update, delete).
- Build a Recipes UI in the frontend: Recipe List page, Recipe Detail page, Recipe Form page (add / edit), and a Delete confirmation flow.
- Wire up **HTTP Basic Auth** as a development-time auth stub so all endpoints are protected without requiring Supabase credentials. Full Supabase JWT auth is deferred to a follow-up change.
- Set up AGENTS.md at the repo root and within each sub-project.

## Non-goals (out of scope for this change)

The following features are planned but **not** part of this change:
- **AI Video Pipeline** – importing recipes from video URLs via yt-dlp / AssemblyAI / Gemini. Deferred to a dedicated follow-up change.
- **Supabase JWT Auth** – full JWT validation, JWKS, and RLS enforcement. Replaced by HTTP Basic Auth stub for now.
- **Image upload** – direct file upload to Supabase Storage is out of scope. The app supports URL paste plus client-side camera/gallery import that is stored as `imageUrl` (base64 data URL or remote URL).
- **Collections** – grouping recipes into curated sets.
- **Grocery** – generating or managing shopping / to-do lists.
- **Discover** – browsing/searching other users' recipes or external sources.
- **Profile** – user profile view and settings.
- Social features (likes, comments, follows).
- Offline / PWA support.

## Capabilities

### New Capabilities
- `recipe-crud`: Full create / read / update / delete lifecycle for a recipe, accessible via REST API and managed through the Recipes UI pages.
- `basic-auth-stub`: HTTP Basic Auth protecting all recipe endpoints during development. A single hardcoded user is configured in Spring Security; `userId` is derived from the Basic Auth principal. Replaced by Supabase JWT in a follow-up change.
- `monorepo-scaffold`: Mono-repository skeleton with frontend and backend sub-projects, shared tooling, and AGENTS.md documentation.

### Modified Capabilities
*(None — this is a greenfield project.)*

## Impact

**Backend**
- New Spring Boot project under `/backend` with feature-based package structure (`com.recipemanager.recipes`, `com.recipemanager.common`, etc.).
- Supabase PostgreSQL: new `recipes` table (no RLS for now — RLS activated when real auth is wired up).
- Spring Security HTTP Basic Auth with one in-memory user for dev/test.
- **Dependencies (no external API keys required for this change)**:
  - `spring-boot-starter-web`, `spring-boot-starter-validation`, `spring-boot-starter-security`
  - `spring-boot-starter-data-jpa`, `postgresql` JDBC driver

**Frontend**
- New Vite + React project under `/frontend` with Tailwind CSS; feature-based folder layout under `src/features/recipes/`.
- Mobile-first responsive layout inspired by Flavorish (warm, card-based aesthetic).
- `imageUrl` is stored as text and can be set by URL paste or client-side camera/gallery import; no Supabase Storage integration yet.
- Environment variable for backend API base URL only (`VITE_API_BASE_URL`).

## Open Questions
1. **Basic Auth credentials**: What username/password should the dev stub use? (Suggested default: `dev` / `secret`)
2. **Hardcoded userId**: For the Basic Auth stub, the `userId` stored on recipes will be a fixed UUID derived from the principal. Acceptable for dev?
3. **DB hosting**: Use Supabase Postgres for dev (remote) or a local Postgres instance via Docker?
