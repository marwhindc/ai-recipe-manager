# Capability: ai-video-to-recipe

## Purpose
Define AI-assisted recipe import from video and other source links. The system accepts a source link and produces a structured recipe draft via a staged pipeline of source retrieval, transcription/parsing, and recipe extraction.

## Requirements

### Requirement: System can import recipe draft from a source link
The system SHALL accept a source link and produce a structured recipe draft by executing a staged pipeline: source retrieval, transcription/parsing, and recipe extraction.

#### Scenario: Import succeeds for a valid source link
- **WHEN** an authenticated user submits `POST /api/v1/recipes/import/video` with a valid `sourceUrl`
- **THEN** the backend executes download, transcription/parsing, and extraction in order
- **AND THEN** the server responds with HTTP 200 and a recipe draft payload containing title, ingredients, steps, and optional metadata

#### Scenario: Source retrieval fails
- **WHEN** the import pipeline cannot retrieve or download content for the provided `sourceUrl`
- **THEN** the server responds with a structured error mapped from `VideoDownloadException`
- **AND THEN** no recipe is persisted

#### Scenario: Transcription/parsing fails
- **WHEN** source retrieval succeeds but transcription/parsing fails
- **THEN** the server responds with a structured error mapped from `TranscriptionException`
- **AND THEN** no recipe is persisted

#### Scenario: Extraction fails
- **WHEN** transcription/parsing succeeds but recipe extraction fails
- **THEN** the server responds with a structured error mapped from `RecipeExtractionException`
- **AND THEN** no recipe is persisted

### Requirement: Imported drafts include source provenance
The system SHALL include source provenance in import results so clients can preserve recipe origin.

#### Scenario: Draft includes source metadata
- **WHEN** the import endpoint returns a draft
- **THEN** the payload includes `sourceUrl`
- **AND THEN** the payload includes a normalized `source` value identifying the source type or provider
