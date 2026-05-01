## MODIFIED Requirements

### Requirement: User can create a recipe manually
The system SHALL allow an authenticated user to create a recipe by submitting a JSON body to `POST /api/v1/recipes`. The request MAY originate from manual user input or an AI-imported draft edited by the user. The response SHALL include the persisted recipe with a server-generated UUID and timestamps.

If present, `sourceUrl` and `source` SHALL be persisted as recipe provenance metadata. These fields SHALL be optional so existing manual-create flows remain backward compatible.

#### Scenario: Valid manual recipe creation
- **WHEN** an authenticated user sends `POST /api/v1/recipes` with a valid JSON body containing at least a `title`
- **THEN** the server responds with HTTP 201 and the full `RecipeResponse` object, including the generated `id`, `createdAt`, and `updatedAt`

#### Scenario: Valid create from imported draft
- **WHEN** an authenticated user sends `POST /api/v1/recipes` with AI-imported values plus optional edits and includes `sourceUrl`
- **THEN** the server responds with HTTP 201 and the persisted `RecipeResponse`
- **AND THEN** `sourceUrl` and `source` are present in the response when provided or derived

#### Scenario: Missing required field is rejected
- **WHEN** an authenticated user sends `POST /api/v1/recipes` with a body that omits the `title` field
- **THEN** the server responds with HTTP 400 and a JSON error body listing the validation failures
