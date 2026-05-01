## ADDED Requirements

### Requirement: User can start recipe creation from a source link
The frontend SHALL provide a "Create from Link" entry point that allows users to submit a source link and request an AI-generated recipe draft.

#### Scenario: User opens import flow
- **WHEN** a user opens the recipe creation experience
- **THEN** a visible "Create from Link" action is available alongside manual creation

#### Scenario: Invalid link is blocked client-side
- **WHEN** a user submits an empty or invalid URL
- **THEN** the UI shows validation feedback and does not call the import endpoint

### Requirement: Imported draft hydrates recipe form for review
The frontend SHALL hydrate `RecipeFormPage` with imported draft values so users can review and edit before saving.

#### Scenario: Import success populates form
- **WHEN** the import endpoint returns a successful draft
- **THEN** title, ingredients, steps, and available metadata are pre-filled in the recipe form
- **AND THEN** the user can edit any pre-filled value before save

#### Scenario: Import failure shows actionable error
- **WHEN** the import endpoint returns a classified import error
- **THEN** the UI shows a user-friendly error message indicating whether retrieval, transcription/parsing, or extraction failed
- **AND THEN** the user can retry with another link
