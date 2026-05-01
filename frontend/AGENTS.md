# Frontend Agent Guide

This project uses React 18, Vite, Tailwind CSS, and React Router v6.

## Structure

- Keep feature code under `src/features/<feature>/`.
- Keep shared UI atoms under `src/shared/components/`.
- Keep HTTP helpers in `src/lib/`.

## Run Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`

## Conventions

- Build mobile-first UI before desktop refinements.
- Reuse shared components instead of duplicating button/input/modal styles.
- Keep route pages in `features/<feature>/pages` and hooks in `features/<feature>/hooks`.
