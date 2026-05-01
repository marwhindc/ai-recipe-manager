# Backend Agent Guide

This project uses Java 21, Spring Boot 3, and Spring Data JPA.

## Structure

- Domain packages follow DDD shape under `com.recipemanager.<feature>`.
- Each feature package contains `domain`, `application`, `infrastructure`, and `api`.
- Common cross-cutting concerns live under `com.recipemanager.common`.

## Run Commands

- Run app: `./mvnw spring-boot:run`
- Run tests: `./mvnw test`

## Database Setup

Run the SQL in `src/main/resources/db/migration/V1__create_recipes_table.sql` against Supabase Postgres (or local Postgres):

```sql
create extension if not exists pgcrypto;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  ingredients jsonb not null default '[]',
  steps jsonb not null default '[]',
  cuisine text,
  servings int,
  prep_time_min int,
  cook_time_min int,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Environment

- `DB_URL`
- `DB_USER`
- `DB_PASSWORD`
- `FRONTEND_ORIGIN`
