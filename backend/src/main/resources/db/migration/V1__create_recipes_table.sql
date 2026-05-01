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
