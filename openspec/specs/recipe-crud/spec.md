# Capability: recipe-crud

## Purpose
Define manual recipe CRUD behavior across backend API and frontend recipe pages.

## Requirements

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
- **WHEN** a user navigates to `/` (or legacy `/recipes`, which redirects)
- **THEN** all their recipes are shown as cards in a responsive grid (1 column on mobile, 2+ on wider screens)

#### Scenario: Empty state is shown
- **WHEN** a user navigates to `/` (or legacy `/recipes`, which redirects) and has no saved recipes
- **THEN** a friendly empty-state illustration and a "Create your first recipe" CTA button are shown

### Requirement: Recipe detail page shows full recipe
The frontend SHALL display all recipe fields (title, image, description, ingredients, steps, cuisine, servings, prep/cook time) on the Recipe Detail page at `/recipe/:id` (legacy `/recipes/:id` redirects).

#### Scenario: Ingredients and steps are rendered
- **WHEN** a user opens a recipe detail page
- **THEN** each ingredient is listed with its quantity and unit, and each step is numbered in order

### Requirement: Recipe form page supports create and edit modes
The frontend SHALL render a single `RecipeFormPage` component that operates in either create mode (`/recipe/new`) or edit mode (`/recipe/:id/edit`). In edit mode, all fields are pre-populated with existing recipe data.

The cover photo field SHALL support three input methods:
1. **Upload from gallery** — opens the device file picker (no `capture` attribute), allowing the user to select an existing photo.
2. **Take a photo** — opens the device camera directly via `capture="environment"` on the hidden `<input type="file">`.
3. **Paste a URL** — reveals a text input for a remote image URL.

When a file is selected (upload or camera), the frontend SHALL resize and compress the image client-side using an offscreen `<canvas>` (max 900 px on the longest side, JPEG quality 0.82) and store the resulting base64 data URL as `imageUrl`. No backend file-storage endpoint is required; the data URL is saved as-is in the `imageUrl` text column.

#### Scenario: Create mode starts with blank form
- **WHEN** a user navigates to `/recipe/new`
- **THEN** all form fields are empty and the bottom submit button reads "Save Recipe"

#### Scenario: Edit mode pre-populates fields
- **WHEN** a user navigates to `/recipe/:id/edit`
- **THEN** all form fields are populated with the recipe's current values

#### Scenario: User uploads a cover photo from gallery
- **WHEN** a user taps "Upload" on the cover photo area
- **THEN** the device file picker opens; on selection the image is resized/compressed client-side and previewed immediately

#### Scenario: User takes a photo with the camera
- **WHEN** a user taps "Camera" on the cover photo area
- **THEN** the device camera opens; on capture the image is resized/compressed client-side and previewed immediately

#### Scenario: User pastes a remote image URL
- **WHEN** a user taps "URL" on the cover photo area
- **THEN** a text input appears; typing a valid URL renders a live preview

### Requirement: Delete confirmation prevents accidental deletion
The frontend SHALL show a confirmation modal before calling the delete API, giving the user a chance to cancel.

#### Scenario: Delete requires confirmation
- **WHEN** a user taps the Delete button on a Recipe Detail page
- **THEN** a modal appears with the text "Delete this recipe?" and "Delete" / "Cancel" actions
- **AND WHEN** the user confirms
- **THEN** the recipe is deleted and the user is redirected to `/` (legacy `/recipes` remains supported)
