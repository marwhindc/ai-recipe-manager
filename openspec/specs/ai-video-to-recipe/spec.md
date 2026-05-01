# Capability: ai-video-to-recipe

## Purpose
Define AI-assisted recipe import from video sources. This capability is deferred in the current change.

## Requirements

No active requirements are synced for this capability in the current change.

## Deferred Scope

> **Status:** Out of scope for the `recipes-feature` change. All requirements in this capability are deferred to a dedicated follow-up change.

The following capabilities were originally planned for this change and have been explicitly removed from scope:

- `VideoDownloader` (yt-dlp subprocess)
- `TranscriptionService` (AssemblyAI)
- `RecipeExtractionService` (Gemini)
- `VideoImportOrchestrator`
- `POST /api/v1/recipes/import/video` endpoint
- "Create from Video" UI flow in `RecipeFormPage`
- `sourceUrl` / `source` fields on the `Recipe` entity

### Why deferred

Removing the AI pipeline allows the `recipes-feature` change to focus on delivering stable, testable CRUD without any external API dependencies (yt-dlp, AssemblyAI, Gemini). The AI pipeline will be re-introduced as a standalone capability once basic recipe management is working end-to-end.

### Re-introduction notes (for the future change author)

- `sourceUrl` and `source` are **not** on the `recipes` table in this iteration. A DB migration will be required to add them back.
- The `StorageService` interface (if introduced for image uploads) can serve as a pattern for the pipeline's `VideoDownloader`.
- The `AppException` hierarchy should be extended with `VideoDownloadException`, `TranscriptionException`, and `RecipeExtractionException` in the follow-up change.
