## Context

The app currently uses HTTP Basic Auth with a single in-memory `dev`/`secret` account. All recipe ownership is derived by hashing the principal name to a deterministic UUID — there is no `users` table. The frontend hardcodes credentials in the API client. This setup is only appropriate for local development; a real launch requires verifiable user identity, per-user data isolation, and a proper session lifecycle.

The backend is Java 21 + Spring Boot 3 with Spring Security already on the classpath. The frontend is React 18 + Vite. Database is PostgreSQL on Supabase with Flyway migrations.

## Goals / Non-Goals

**Goals:**
- Replace the Basic Auth stub with Google OAuth 2.0 (backend-driven redirect, no frontend SDK dependency)
- Issue short-lived access tokens (15 min) and long-lived refresh tokens (30 days) as `httpOnly; SameSite=Lax; Secure` cookies
- Rotate refresh tokens on every use; invalidate the previous token
- Persist Google identity in a `users` table on first login (upsert by `google_sub`)
- Protect all API endpoints and frontend routes; unauthenticated → redirect to `/login`
- Read-only `/profile` page: Google avatar + display name

**Non-Goals:**
- Facebook or other OAuth providers
- Email/password or magic-link auth
- Editable profile, user preferences, or stats
- Refresh token revocation list / server-side session store
- Migrating or reassigning dev-user recipe data
- Public/shareable recipe links

## Decisions

### D1 — Backend-driven OAuth redirect (not frontend PKCE)

**Decision:** The OAuth flow starts with the browser navigating to `GET /auth/google`. Spring Security handles the redirect to Google, receives the callback at `GET /auth/google/callback`, exchanges the code, fetches the user info, upserts the user, issues JWT cookies, and redirects the browser to `/`.

**Rejected alternative:** Frontend-side PKCE using `@react-oauth/google` — sends the Google ID token to `POST /auth/google/verify`. This splits auth logic across both sides and adds a frontend npm dependency for no architectural benefit.

**Rationale:** Credentials never touch the frontend. Spring Security's `OAuth2LoginConfigurer` handles the entire flow with minimal custom code. The redirect-to-`/` pattern works naturally with cookie-based tokens.

---

### D2 — httpOnly cookies for token transport (not Authorization header)

**Decision:** Access token and refresh token are issued as separate `httpOnly; SameSite=Lax; Secure` cookies (`access_token`, `refresh_token`). The frontend never reads or stores tokens. All authenticated API requests include the cookie automatically.

**Rejected alternative:** `localStorage` + `Authorization: Bearer` header. Exposes tokens to XSS.

**Rationale:** httpOnly cookies are invisible to JavaScript, eliminating token theft via XSS. `SameSite=Lax` mitigates CSRF for GET-initiated flows; mutating endpoints (POST/PUT/DELETE) are protected by the fact that cross-site requests don't trigger cookie sends under `SameSite=Lax` by default. No CSRF token needed for this risk profile.

---

### D3 — Refresh token rotation (not a single long-lived token)

**Decision:** Access token TTL = 15 minutes. Refresh token TTL = 30 days. On `POST /auth/refresh`, the backend validates the incoming refresh token, issues a new access token + new refresh token, and invalidates the old refresh token (stored as a hashed value in `users.refresh_token_hash`). A stolen, already-rotated token returns 401.

**Rejected alternative:** Single long-lived token (~7 days). Simpler, but a stolen token remains valid for the full window.

**Rationale:** Soft launch requires a reasonable security posture. Rotation detects token replay without requiring a full server-side token store (only one hash per user is stored).

---

### D4 — `users` table owns `google_sub`, not a separate OAuth provider table

**Decision:** Single `users` table with a `google_sub` column. On login, upsert by `google_sub` — update `email`, `display_name`, `avatar_url` from Google on each login.

**Rejected alternative:** Separate `oauth_accounts` table with a `provider` column. Necessary for multi-provider support, but overkill for Google-only.

**Rationale:** Minimises schema complexity. Adding Facebook later requires only a migration to add `facebook_sub` or a pivot to the `oauth_accounts` pattern at that point.

---

### D5 — New `auth` feature package in backend, `user-auth` feature folder in frontend

**Decision:**
- Backend: `com.recipemanager.auth.*` with sub-packages `api`, `application`, `domain`, `infrastructure` per DDD conventions. `SecurityConfig` moves into `auth.api`.
- Frontend: `src/features/user-auth/` contains `AuthContext`, `ProtectedRoute`, `LoginPage`; `src/features/user-profile/` contains `ProfilePage`.

**Rationale:** Matches the existing DDD feature-package convention in the backend. Keeps auth concerns isolated from the recipes feature.

---

### D6 — `recipes.user_id` FK to `users.id` via a Flyway migration

**Decision:** A new migration (`V3__add_users_fk_to_recipes.sql`) adds `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`. Existing dev-user recipes (orphaned after migration) are left in place — they are unreachable via the API but cause no constraint violation since the FK is added `NOT VALID` initially and validated in a subsequent step.

**Rejected alternative:** Delete orphaned rows in the migration. Unnecessary risk on a live DB.

**Rationale:** `NOT VALID` constraint addition is non-blocking on PostgreSQL (no full table scan at migration time). It enforces integrity for new rows immediately.

---

### D7 — New JWT dependencies require explicit approval

The following backend dependencies are required and need user approval before implementation:
- `spring-boot-starter-oauth2-client` (Spring Security OAuth2 support)
- `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson` (JWT signing/parsing)

No new frontend npm packages are needed.

## Risks / Trade-offs

- **Risk: `SameSite=Lax` cookie doesn't work on the dev environment (HTTP)**
  → Mitigation: Use `Secure=false` in the `local` Spring profile only. Never disable `Secure` in production config.

- **Risk: Google changes the OAuth callback or user info fields**
  → Mitigation: Map only stable fields (`sub`, `email`, `name`, `picture`). These are part of the OIDC standard.

- **Risk: Refresh token hash in `users` table means only one active session per user**
  → Mitigation: Acceptable for a personal recipe manager MVP. Multi-device sessions can be added later with a `refresh_tokens` table.

- **Risk: JWT secret rotation requires re-login for all users**
  → Mitigation: Store the JWT signing secret in an environment variable (`JWT_SECRET`). Document that rotating it invalidates all sessions.

- **Risk: `NOT VALID` FK on `recipes.user_id` leaves orphaned dev rows indefinitely**
  → Mitigation: Orphaned rows are unreachable via API (owner filter). Can be cleaned up manually or via a future migration.

## Migration Plan

1. Apply `V2__create_users_table.sql` — creates `users` table
2. Apply `V3__add_users_fk_to_recipes.sql` — adds FK `NOT VALID`
3. Deploy new backend with OAuth2 + JWT config; Basic Auth stub removed
4. Deploy new frontend with `AuthContext`, `ProtectedRoute`, login page
5. Verify Google OAuth callback works end-to-end in staging
6. **Rollback:** If needed, revert backend to previous JAR (restores Basic Auth config); FK migration is non-destructive so no rollback SQL needed

## Open Questions

- *(resolved)* JWT storage → httpOnly cookie
- *(resolved)* Refresh token strategy → rotation with hash in `users` table
- *(resolved)* Provider → Google only
- *(resolved)* Profile scope → read-only identity (no editing)
- **Pending approval:** `spring-boot-starter-oauth2-client` + `jjwt-*` dependencies
