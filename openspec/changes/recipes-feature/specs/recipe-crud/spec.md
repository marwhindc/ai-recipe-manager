## ADDED Requirements

### Requirement: User can create a recipe manually
The system SHALL allow an authenticated user to create a recipe by submitting a JSON body to `POST /api/v1/recipes`. The response SHALL include the persisted recipe with a server-generated UUID and timestamps.

#### Scenario: Valid recipe creation
- **WHEN** an authenticated user sends `POST /api/v1/recipes` with a valid JSON body containing at least a `title`
- **THEN** the server responds with HTTP 201 and the full `RecipeResponse` object, including the generated `id`, `createdAt`, and `updatedAt`

#### Scenario: Missing required field is rejected
- **WHEN** an authenticated user sends `POST /api/v1/recipes` with a body that omits the `title` field
- **THEN** the server responds with HTTP 400 and a JSON error body listing the validation failures

### Requirement: User can list their own recipes
The system SHALL allow an authenticated user to retrieve a paginated list of their own recipes via `GET /api/v1/recipes`. Results SHALL be ordered by `createdAt` descending by default.

#### Scenario: Empty recipe list
- **WHEN** an authenticated user with no recipes calls `GET /api/v1/recipes`
- **THEN** the server responds with HTTP 200 and a JSON body `{ "data": [], "total": 0, "page": 1, "pageSize": 20 }`

#### Scenario: Paginated recipe list
- **WHEN** an authenticated user calls `GET /api/v1/recipes?page=2&pageSize=10`
- **THEN** the server responds with HTTP 200 and at most 10 recipe summaries for page 2

### Requirement: User can view a single recipe
The system SHALL allow an authenticated user to retrieve a single recipe by its UUID via `GET /api/v1/recipes/{id}`, including all ingredients and steps.

#### Scenario: Existing recipe is returned
- **WHEN** an authenticated user calls `GET /api/v1/recipes/{id}` for a recipe they own
- **THEN** the server responds with HTTP 200 and the full `RecipeResponse` with all fields

#### Scenario: Non-existent recipe returns 404
- **WHEN** an authenticated user calls `GET /api/v1/recipes/{id}` with an ID that does not exist
- **THEN** the server responds with HTTP 404

### Requirement: User can update a recipe
The system SHALL allow an authenticated user to update any field of their own recipe via `PUT /api/v1/recipes/{id}`. The `updatedAt` timestamp SHALL be refreshed on every successful update.

#### Scenario: Full recipe update
- **WHEN** an authenticated user sends `PUT /api/v1/recipes/{id}` with an updated `title` and modified `steps`
- **THEN** the server responds with HTTP 200 and the updated `RecipeResponse` with a new `updatedAt`

#### Scenario: Updating another user's recipe is rejected
- **WHEN** an authenticated user sends `PUT /api/v1/recipes/{id}` for a recipe owned by a different user
- **THEN** the server responds with HTTP 404

### Requirement: User can delete a recipe
The system SHALL allow an authenticated user to permanently delete their own recipe via `DELETE /api/v1/recipes/{id}`. The operation SHALL return HTTP 204 on success.

#### Scenario: Successful delete
- **WHEN** an authenticated user sends `DELETE /api/v1/recipes/{id}` for a recipe they own
- **THEN** the server responds with HTTP 204 and subsequent `GET /api/v1/recipes/{id}` returns HTTP 404

#### Scenario: Deleting another user's recipe is rejected
- **WHEN** an authenticated user sends `DELETE /api/v1/recipes/{id}` for a recipe owned by another user
- **THEN** the server responds with HTTP 404

### Requirement: Recipe list page displays recipe cards
The frontend SHALL render a scrollable grid of `RecipeCard` components on the Recipe List page, each showing the recipe image (or a placeholder), title, cuisine, and total cook time.

#### Scenario: Recipe cards are displayed
- **WHEN** a user navigates to `/recipes`
- **THEN** all their recipes are shown as cards in a responsive grid (1 column on mobile, 2+ on wider screens)

#### Scenario: Empty state is shown
- **WHEN** a user navigates to `/recipes` and has no saved recipes
- **THEN** a friendly empty-state illustration and a "Create your first recipe" CTA button are shown

### Requirement: Recipe detail page shows full recipe
The frontend SHALL display all recipe fields (title, image, description, ingredients, steps, cuisine, servings, prep/cook time, source) on the Recipe Detail page at `/recipes/:id`.

#### Scenario: Ingredients and steps are rendered
- **WHEN** a user opens a recipe detail page
- **THEN** each ingredient is listed with its quantity and unit, and each step is numbered in order

### Requirement: Recipe form page supports create and edit modes
The frontend SHALL render a single `RecipeFormPage` component that operates in either create mode (`/recipes/new`) or edit mode (`/recipes/:id/edit`). In edit mode, all fields are pre-populated with existing recipe data.

#### Scenario: Create mode starts with blank form
- **WHEN** a user navigates to `/recipes/new`
- **THEN** all form fields are empty and the submit button reads "Save Recipe"

#### Scenario: Edit mode pre-populates fields
- **WHEN** a user navigates to `/recipes/:id/edit`
- **THEN** all form fields are populated with the recipe's current values

### Requirement: Delete confirmation prevents accidental deletion
The frontend SHALL show a confirmation modal before calling the delete API, giving the user a chance to cancel.

#### Scenario: Delete requires confirmation
- **WHEN** a user taps the Delete button on a Recipe Detail page
- **THEN** a modal appears with the text "Delete this recipe?" and "Delete" / "Cancel" actions
- **AND WHEN** the user confirms
- **THEN** the recipe is deleted and the user is redirected to `/recipes`
