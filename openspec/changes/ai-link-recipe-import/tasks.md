## 1. Setup and Schema Preparation

- [x] 1.1 Add DB migration to create optional `source_url` and `source` columns on `recipes`
- [x] 1.2 Update recipe domain entity and persistence mapping to include source metadata fields
- [x] 1.3 Extend recipe request/response DTOs and mapper coverage for source metadata compatibility

## 2. Backend Import Pipeline

- [x] 2.1 Define application-layer ports for `VideoDownloader`, `TranscriptionService`, and `RecipeExtractionService`
- [x] 2.2 Implement initial adapters for `yt-dlp`, AssemblyAI, and Gemini behind those service ports
- [x] 2.3 Implement `VideoImportOrchestrator` to run download, transcription/parsing, and extraction stages
- [x] 2.4 Add import endpoint `POST /api/v1/recipes/import/video` with request validation and draft response DTO
- [x] 2.5 Extend `AppException` hierarchy and global exception mapping for download/transcription/extraction failures
- [x] 2.6 Add unit tests for orchestrator success and each failure stage

## 3. Recipe CRUD Compatibility Updates (Backend)

- [x] 3.1 Update create-recipe service path to accept imported draft-origin payloads with optional `sourceUrl` and `source`
- [x] 3.2 Ensure create/list/detail responses include source metadata when available
- [x] 3.3 Add integration tests covering create from imported draft and backward-compatible manual create

## 4. Frontend Import Experience

- [x] 4.1 Add "Create from Link" entry action in recipe creation flow (mobile-first and desktop)
- [x] 4.2 Implement client-side URL validation and import API call in recipes feature API layer
- [x] 4.3 Hydrate `RecipeFormPage` with imported draft values and preserve user edits before save
- [x] 4.4 Show stage-aware import error states with retry support
- [ ] 4.5 Add frontend tests for URL validation, successful form hydration, and failure handling

## 5. End-to-End Validation and Documentation

- [x] 5.1 Run backend tests and verify import + recipe create flows end-to-end
- [x] 5.2 Run frontend lint/build and validate create-from-link UX on mobile and desktop breakpoints
- [x] 5.3 Update relevant README/dev notes for `yt-dlp` installation plus AssemblyAI and Gemini environment variables and local testing guidance
