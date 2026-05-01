## Why

Manual recipe entry is slow and error-prone when users discover recipes in videos or web links. Re-introducing AI-assisted import now unlocks faster recipe capture while building on the already-stable recipe CRUD foundation.

## What Changes

- Add AI-assisted recipe import from a user-provided source link, including source retrieval, transcription/parsing, structured recipe extraction, and draft creation.
- Use the archived provider split as the initial implementation direction: `yt-dlp` for source retrieval, AssemblyAI for transcription/parsing, and Gemini for recipe extraction, behind replaceable service interfaces.
- Add a backend import orchestration flow and a REST endpoint to create recipe drafts from link-based content.
- Add frontend "Create from Link" flow to submit a source URL and review/edit imported recipe drafts before saving.
- Reintroduce recipe source metadata fields to persist provenance for imported recipes.
- Add explicit error handling for source download failures, transcription failures, and extraction failures.

## Capabilities

### New Capabilities
- `link-recipe-import-ui`: User flow and validation for creating recipe drafts from a source link.

### Modified Capabilities
- `ai-video-to-recipe`: Change from deferred scope to active requirements for AI-driven import orchestration, endpoint behavior, and persistence.
- `recipe-crud`: Extend recipe creation requirements to support imported draft payloads and source metadata.

## Impact

- Backend: new/updated services for source download, transcription/parsing, extraction, orchestration, and new import endpoint.
- Frontend: new import entry flow and integration with recipe form/edit workflow.
- Database: migration to add source metadata columns to recipes.
- External systems: integration points for `yt-dlp`, AssemblyAI, and Gemini, while preserving adapter boundaries for future provider swaps.
- Reliability: richer exception taxonomy and clearer user-facing import error states.

## Non-goals

- Implementing batch or playlist imports.
- Supporting non-link ingestion channels (file uploads, live recording, browser extension capture).
- Automating publish without user review of imported content.
- Building production-grade provider failover across multiple AI vendors in this change.
