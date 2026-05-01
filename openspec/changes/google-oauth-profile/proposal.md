## Why

The app currently uses a hardcoded HTTP Basic Auth stub (`dev`/`secret`) with no real user identity. A soft launch requires real authentication so that users own their own recipes and can be identified across sessions.

## What Changes

- Replace HTTP Basic Auth stub with Google OAuth 2.0 (backend-driven redirect flow via Spring Security)
- Issue short-lived access tokens (15 min) and long-lived refresh tokens (30 days, rotated on use) as httpOnly cookies
- Introduce a `users` table to persist Google identity on first login
- Add a `/login` page (minimal: app name + "Continue with Google" button)
- Add a read-only `/profile` page showing the authenticated user's Google avatar and display name
- Protect all app routes — unauthenticated requests redirect to `/login`
- Remove hardcoded Basic Auth header from the frontend API client
- **BREAKING**: All recipe ownership is now tied to a real `users.id` UUID (foreign key), replacing the in-memory derived UUID from the `dev` username

## Capabilities

### New Capabilities

- `user-auth`: Google OAuth 2.0 login flow, JWT issuance (access + refresh tokens in httpOnly cookies), token refresh rotation, logout, and protected route enforcement
- `user-profile`: Read-only profile page displaying authenticated user's Google avatar and display name

### Modified Capabilities

- `recipe-ownership`: `recipes.user_id` now references `users.id` (a real persisted user), replacing the ephemeral principal-derived UUID

## Impact

- **Backend**: New `users` table migration; new `auth` feature package (OAuth callback, JWT filter, token issuance, refresh endpoint, logout); updated `SecurityConfig`; `recipe-ownership` spec updated to reflect FK to `users`
- **Frontend**: New `AuthContext`; new `/login` route; new `ProtectedRoute` wrapper; new `/profile` route; API client updated to remove hardcoded Basic Auth header
- **Database**: New `V2__create_users_table.sql` migration; `V3__add_users_fk_to_recipes.sql` to add FK constraint
- **Dependencies (to be approved)**: `spring-boot-starter-oauth2-client`, `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (backend); no new frontend npm packages

## Non-goals

- Facebook or other OAuth providers
- Editable profile (display name, bio, avatar override)
- User preferences (dietary, units)
- Recipe stats or social features on the profile page
- Public/shareable recipe links
- Email/password signup
- Full refresh token revocation list (beyond rotation)
- Migrating or reassigning existing dev-user recipe data
