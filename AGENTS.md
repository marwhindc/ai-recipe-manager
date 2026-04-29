# AI Agent Instructions (AGENTS.md)

Welcome! You are an AI agent working on the AI Recipe Manager monorepo. Please adhere strictly to the following guidelines and conventions when making changes, writing code, or creating commits in this repository.

## 1. Commit Message Standard

We follow a strict **Conventional Commits** approach, enhanced with detailed descriptions in paragraph form. 

### Format
```text
<type>(<optional scope>): <subject>

<what/how>

<why>
```

### Rules
- **Type**: Must be one of `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, or `revert`.
- **Subject**: A short, imperative-mood description of the change (e.g., "add basic auth stub", "refactor recipe service"). Do not capitalize the first letter. No period at the end.
- **Body / Description**: 
  - Must be written in **paragraph form**.
  - **What/How**: Detail exactly what was changed and how the implementation works. Mention architectural decisions, patterns used, or notable code changes.
  - **Why**: Explain the reasoning behind the change. Why is this necessary? What problem does it solve?

### Example
```text
feat(backend): implement recipe entity and crud service

Added the `Recipe` aggregate root along with the `RecipeService` interface and its implementation. The service layer handles standard CRUD operations, connecting to the Supabase PostgreSQL database via Spring Data JPA. We also mapped the ingredients and steps to JSONB columns to avoid complex join tables for the MVP.

This foundational domain model is necessary to allow users to store and manage their recipes digitally. By establishing the service layer now, we create a stable base upon which we can layer the AI video pipeline and social features in subsequent updates.
```

## 2. Tech Stack & Architecture

This is a monorepo containing both the frontend and backend applications.

- **Frontend (`/frontend`)**:
  - React 18, Vite, and Tailwind CSS.
  - Follow a **feature-based folder structure** (`src/features/...`), NOT component-based. Keep UI, hooks, and services co-located within their bounded context.
  - Design aesthetic: Flavorish-inspired – warm, appetising, mobile-first, clean cards.

- **Backend (`/backend`)**:
  - Java 21 and Spring Boot 3.
  - Follow **CLEAN code standards** and **Domain-Driven Design (DDD)**.
  - Package structure should be feature-based / domain-driven (e.g., `com.recipemanager.recipes.domain`).
  - All API endpoints must be RESTful JSON.
  - Use UUIDs for public/internal IDs instead of exposing auto-incrementing integers.

- **Database / Infrastructure**:
  - Supabase (PostgreSQL). 

## 3. General Rules

- **Dependencies**: Do NOT add new dependencies without explicit user approval. Suggest them first.
- **Code Style**: Maintain high-quality, readable code. Do not remove comments or documentation unless explicitly instructed.
