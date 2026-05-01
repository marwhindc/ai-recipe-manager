## ADDED Requirements

### Requirement: Monorepo skeleton is initialised
The system SHALL provide a single Git repository containing both `/frontend` and `/backend` sub-projects, each with their own package manager / build tool configuration, so that developers can work on either project from one clone.

#### Scenario: Frontend project is bootstrapped
- **WHEN** a developer runs the Vite dev server inside `/frontend`
- **THEN** the app compiles and serves a placeholder page without errors

#### Scenario: Backend project is bootstrapped
- **WHEN** a developer runs `mvn spring-boot:run` inside `/backend`
- **THEN** the Spring Boot application starts and returns HTTP 200 from the `/actuator/health` endpoint

#### Scenario: Root AGENTS.md exists
- **WHEN** a developer opens the repository root
- **THEN** an `AGENTS.md` file is present documenting the purpose of each sub-project, how to run them, and conventions for AI agents contributing to the repo

### Requirement: Feature-based folder structure is enforced
The frontend SHALL organise source files by feature (`src/features/<feature>/`) rather than by file type, so that all code for a feature is co-located.

#### Scenario: Recipes feature folder exists
- **WHEN** the frontend project is initialised
- **THEN** the path `src/features/recipes/` contains `components/`, `pages/`, `hooks/`, `services/`, and `utils/` sub-directories

### Requirement: Backend is structured by domain
The backend SHALL organise Java packages by domain feature under `com.recipemanager.<feature>`, each containing `domain/`, `application/`, `infrastructure/`, and `api/` sub-packages, following CLEAN / DDD conventions.

#### Scenario: Recipes domain packages exist
- **WHEN** the backend project is compiled
- **THEN** the package `com.recipemanager.recipes` and its four sub-packages compile without errors

### Requirement: Environment configuration is externalised
Both frontend and backend SHALL load sensitive configuration (Supabase URL, API keys, base URLs) from environment variables / `.env` files that are excluded from version control.

#### Scenario: Missing environment variable causes clear error
- **WHEN** a required environment variable (e.g. `VITE_SUPABASE_URL` or `SUPABASE_JWT_SECRET`) is absent at startup
- **THEN** the application fails to start with a descriptive error message naming the missing variable

#### Scenario: .env files are gitignored
- **WHEN** a developer runs `git status` after adding a `.env` file
- **THEN** the `.env` file does not appear in the untracked files list
