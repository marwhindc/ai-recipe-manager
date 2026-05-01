## ADDED Requirements

### Requirement: Google OAuth login flow
The system SHALL initiate Google OAuth 2.0 authentication when a user visits `GET /auth/google`. Spring Security SHALL redirect the browser to Google's authorization endpoint. After the user approves, Google SHALL redirect back to `GET /auth/google/callback`. The backend SHALL exchange the authorization code for an ID token, extract the user's `sub`, `email`, `name`, and `picture`, upsert a `users` row, issue JWT cookies, and redirect the browser to `/`.

#### Scenario: New user completes Google login
- **WHEN** a new user navigates to `/auth/google` and approves the Google consent screen
- **THEN** the backend upserts a `users` row with the Google `sub`, `email`, `display_name`, and `avatar_url`
- **THEN** the backend sets `access_token` and `refresh_token` httpOnly cookies on the response
- **THEN** the browser is redirected to `/`

#### Scenario: Returning user completes Google login
- **WHEN** a returning user completes the Google OAuth flow
- **THEN** the backend updates the existing `users` row's `email`, `display_name`, and `avatar_url` from Google
- **THEN** the backend issues new JWT cookies and redirects to `/`

#### Scenario: OAuth error from Google
- **WHEN** Google returns an error on the callback (e.g. user denied consent)
- **THEN** the backend redirects the browser to `/login?error=oauth`
- **THEN** no cookies are set

---

### Requirement: Access token issued as httpOnly cookie
The system SHALL issue a short-lived access token (TTL: 15 minutes) as an `httpOnly; SameSite=Lax; Secure` cookie named `access_token`. The token SHALL be a signed JWT containing the `userId` (UUID) claim. The `Secure` flag SHALL be omitted in the `local` Spring profile only.

#### Scenario: Access token cookie is set on successful login
- **WHEN** the OAuth callback succeeds and a user is upserted
- **THEN** the response includes `Set-Cookie: access_token=<jwt>; HttpOnly; SameSite=Lax; Secure; Path=/`

#### Scenario: Expired access token is rejected
- **WHEN** a request is made to a protected endpoint with an expired `access_token` cookie
- **THEN** the server responds with HTTP 401

#### Scenario: Missing access token is rejected
- **WHEN** a request is made to a protected endpoint with no `access_token` cookie
- **THEN** the server responds with HTTP 401

---

### Requirement: Refresh token rotation
The system SHALL issue a long-lived refresh token (TTL: 30 days) as an `httpOnly; SameSite=Lax; Secure` cookie named `refresh_token`. On `POST /auth/refresh`, the system SHALL validate the refresh token, issue a new access token and a new refresh token, and invalidate the old refresh token (stored as a bcrypt hash in `users.refresh_token_hash`). A replayed (already-rotated) refresh token SHALL be rejected.

#### Scenario: Silent refresh issues new tokens
- **WHEN** a client posts to `POST /auth/refresh` with a valid `refresh_token` cookie
- **THEN** the server responds with HTTP 200
- **THEN** new `access_token` and `refresh_token` cookies are set
- **THEN** the old refresh token hash is replaced in `users.refresh_token_hash`

#### Scenario: Replayed refresh token is rejected
- **WHEN** a client posts to `POST /auth/refresh` with a refresh token that has already been rotated
- **THEN** the server responds with HTTP 401
- **THEN** no new cookies are set

#### Scenario: Expired refresh token is rejected
- **WHEN** a client posts to `POST /auth/refresh` with an expired `refresh_token` cookie
- **THEN** the server responds with HTTP 401

---

### Requirement: Logout clears JWT cookies
The system SHALL provide `POST /auth/logout`. On logout, the server SHALL clear the `access_token` and `refresh_token` cookies (set `Max-Age=0`) and clear `users.refresh_token_hash` for the authenticated user.

#### Scenario: Logout clears cookies
- **WHEN** an authenticated user posts to `POST /auth/logout`
- **THEN** the server responds with HTTP 200
- **THEN** the `access_token` and `refresh_token` cookies are expired (cleared)
- **THEN** `users.refresh_token_hash` is set to null for that user

---

### Requirement: All API endpoints require a valid access token
The system SHALL reject requests to any `/api/**` endpoint that do not present a valid, non-expired `access_token` cookie with HTTP 401. The `/auth/**` endpoints (login, callback, refresh, logout) SHALL be publicly accessible.

#### Scenario: Authenticated request proceeds
- **WHEN** a client sends a request to `GET /api/v1/recipes` with a valid `access_token` cookie
- **THEN** the server responds with HTTP 200

#### Scenario: Unauthenticated API request is rejected
- **WHEN** a client sends a request to any `/api/**` endpoint with no `access_token` cookie
- **THEN** the server responds with HTTP 401

---

### Requirement: Frontend login page
The system SHALL provide a `/login` route in the frontend. The page SHALL display the application name and a single "Continue with Google" button. Clicking the button SHALL navigate the browser to `GET /auth/google`.

#### Scenario: Login page renders
- **WHEN** an unauthenticated user navigates to `/login`
- **THEN** the login page is displayed with a "Continue with Google" button

#### Scenario: Login button initiates OAuth
- **WHEN** the user clicks "Continue with Google"
- **THEN** the browser navigates to `/auth/google`

---

### Requirement: Frontend protected routes
The system SHALL wrap all authenticated routes in a `ProtectedRoute` component. If no valid session is detected (backend returns 401 on session check), the user SHALL be redirected to `/login`. The session check SHALL call `GET /auth/me` which returns the current user's identity or 401.

#### Scenario: Unauthenticated user is redirected to login
- **WHEN** an unauthenticated user navigates to any protected route (e.g. `/`)
- **THEN** the frontend redirects to `/login`

#### Scenario: Authenticated user accesses protected route
- **WHEN** an authenticated user navigates to a protected route
- **THEN** the route renders normally with no redirect

---

### Requirement: Current user identity endpoint
The system SHALL provide `GET /auth/me` which returns the authenticated user's `userId`, `displayName`, and `avatarUrl` as JSON. This endpoint requires a valid `access_token` cookie.

#### Scenario: Authenticated user fetches own identity
- **WHEN** an authenticated user calls `GET /auth/me`
- **THEN** the server responds with HTTP 200 and `{ userId, displayName, avatarUrl }`

#### Scenario: Unauthenticated request to /auth/me
- **WHEN** a request is made to `GET /auth/me` with no valid access token
- **THEN** the server responds with HTTP 401
