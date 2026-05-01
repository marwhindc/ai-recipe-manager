## Context

Recipe CRUD is now stable, but users still have to manually transcribe recipes found in videos and web links. The existing `ai-video-to-recipe` capability was intentionally deferred and currently contains no active requirements. This change activates that capability and connects it with current recipe creation behavior and UI flows.

The archived `recipes-feature` change already captured the intended provider split for this pipeline: `VideoDownloader` backed by `yt-dlp`, `TranscriptionService` backed by AssemblyAI, and `RecipeExtractionService` backed by Gemini. This design carries those references forward as the initial adapter plan, while keeping the application layer provider-agnostic.

Constraints:
- Keep current monorepo architecture: React feature folders in frontend and DDD-style Spring feature packages in backend.
- Preserve existing authenticated recipe ownership behavior.
- Avoid introducing new dependencies without explicit approval; external integrations are abstracted behind interfaces.
- Keep import as draft-first UX so users can review and edit before final save.

## Goals / Non-Goals

**Goals:**
- Provide a source-link import pipeline that turns unstructured content into a recipe draft.
- Expose a dedicated backend endpoint for AI import and return a structured draft payload.
- Extend recipe create behavior to accept imported drafts and source metadata.
- Add a frontend "Create from Link" flow integrated with existing recipe form workflow.
- Define explicit failure modes for download, transcription/parsing, and extraction.

**Non-Goals:**
- Batch imports, playlist/channel crawling, and background queue orchestration.
- Production-grade multi-provider failover.
- Fully automated publish without user review.
- Non-link ingestion modes (file upload of video/audio, browser plugin capture).

## Decisions

1. Source-link ingestion uses an orchestrator pattern in backend.
- Decision: Introduce `VideoImportOrchestrator` as an application service coordinating `VideoDownloader`, `TranscriptionService`, and `RecipeExtractionService`.
- Rationale: Keeps controller thin and encapsulates multi-step workflow and error translation.
- Alternative considered: Calling services directly from controller. Rejected because it increases coupling and makes retry/error policy harder to test.

2. External tooling/AI providers are abstracted by ports.
- Decision: Use interfaces for downloader/transcriber/extractor with infrastructure adapters.
- Initial adapter plan: `yt-dlp` subprocess for `VideoDownloader`, AssemblyAI adapter for `TranscriptionService`, and Gemini adapter for `RecipeExtractionService`, matching the archived deferred capability notes.
- Rationale: Enables provider replacement and local test doubles while avoiding hard lock-in.
- Alternative considered: Direct provider SDK usage in application layer. Rejected due to testability and layering violations.

3. Import endpoint returns a recipe draft, not an auto-persisted recipe.
- Decision: `POST /api/v1/recipes/import/video` returns a normalized draft DTO that the client can review/edit.
- Rationale: Reduces risk of low-quality imports and aligns with user expectations for manual correction.
- Alternative considered: Auto-create recipe immediately. Rejected due to potential bad data and weaker UX trust.

4. Recipe entity is extended with source metadata.
- Decision: Add `sourceUrl` and `source` fields through a DB migration and include them in create/read DTOs.
- Rationale: Preserves provenance and traceability for imported recipes.
- Alternative considered: Storing provenance in a separate audit table. Rejected for now because simple read/use cases need direct access.

5. Frontend adds a dedicated entry point while reusing `RecipeFormPage`.
- Decision: Add "Create from Link" flow that calls import endpoint, hydrates form state with draft values, then user saves via existing create API.
- Rationale: Reuses existing validated editing experience and minimizes duplicate UI.
- Alternative considered: Separate standalone import page and custom editor. Rejected due to maintenance overhead.

## Risks / Trade-offs

- [Risk] Imported content quality may vary widely by source format. → Mitigation: enforce validation and require human review before save.
- [Risk] External provider failures or throttling can degrade UX. → Mitigation: classify errors by stage and map to actionable user messages.
- [Risk] Parsing/transcription latency may be high for long videos. → Mitigation: set request timeout limits and present progress/loading state with retry.
- [Risk] Source metadata schema change may break older clients if not backward compatible. → Mitigation: keep new fields optional in DTOs and preserve old create payload compatibility.

## Migration Plan

1. Add DB migration for `recipes.source_url` and `recipes.source`.
2. Add backend interfaces, initial `yt-dlp` / AssemblyAI / Gemini adapters, orchestrator, endpoint, DTOs, and exception mappings.
3. Add frontend import UI flow and form hydration from draft payload.
4. Roll out behind normal deployment; no feature-flag dependency required for local/dev.
5. Rollback: disable import endpoint/UI route; existing CRUD remains operational. If needed, keep source columns in DB as inert optional fields.

## Open Questions

- Should the import endpoint accept only video links, or any web recipe link with dynamic strategy selection?
- What maximum source duration/content size is acceptable for synchronous import requests?
- Which `yt-dlp`, AssemblyAI, and Gemini credentials, binaries, and rate limits are available for local vs production environments?
