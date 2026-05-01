## 1. Backend — Dependencies & Configuration

- [x] 1.1 Get user approval for new Maven dependencies: `spring-boot-starter-oauth2-client`, `jjwt-api`, `jjwt-impl`, `jjwt-jackson`
- [x] 1.2 Add approved dependencies to `backend/pom.xml`
- [x] 1.3 Add environment variables to `application.yml`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `JWT_ACCESS_TTL_MINUTES`, `JWT_REFRESH_TTL_DAYS`, `APP_BASE_URL`
- [x] 1.4 Add `application-local.yml` overrides: `cookie.secure=false`, Google client credentials pointing to localhost

## 2. Backend — Database Migrations

- [x] 2.1 Create `V2__create_users_table.sql`: `users(id UUID DEFAULT gen_random_uuid() PRIMARY KEY, google_sub TEXT UNIQUE NOT NULL, email TEXT NOT NULL, display_name TEXT NOT NULL, avatar_url TEXT, refresh_token_hash TEXT, created_at TIMESTAMPTZ DEFAULT now())`
- [x] 2.2 Create `V3__add_users_fk_to_recipes.sql`: add `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT VALID`

## 3. Backend — Auth Domain & Infrastructure

- [x] 3.1 Create `com.recipemanager.auth.domain.User` entity mapped to `users` table
- [x] 3.2 Create `com.recipemanager.auth.infrastructure.UserRepository` (JPA, find by `googleSub`)
- [x] 3.3 Create `com.recipemanager.auth.application.UserService`: `upsertFromGoogle(googleSub, email, displayName, avatarUrl)` and `storeRefreshTokenHash(userId, hash)` and `clearRefreshTokenHash(userId)`
- [x] 3.4 Create `com.recipemanager.auth.application.JwtService`: `generateAccessToken(userId)`, `generateRefreshToken(userId)`, `validateAccessToken(token)`, `extractUserId(token)`

## 4. Backend — Auth API (OAuth Callback, Refresh, Logout, /me)

- [x] 4.1 Create `com.recipemanager.auth.api.OAuth2SuccessHandler` (implements `AuthenticationSuccessHandler`): upserts user, issues access + refresh token cookies, stores refresh token hash, redirects to `/`
- [x] 4.2 Create `com.recipemanager.auth.api.OAuth2FailureHandler`: redirects to `/login?error=oauth`, no cookies set
- [x] 4.3 Create `com.recipemanager.auth.api.AuthController` with:
  - `POST /auth/refresh` — validates refresh token cookie, rotates tokens, returns 200 or 401
  - `POST /auth/logout` — clears cookies, clears `refresh_token_hash`, returns 200
  - `GET /auth/me` — returns `{ userId, displayName, avatarUrl }` for authenticated user
- [x] 4.4 Create `com.recipemanager.auth.api.JwtCookieFilter` (extends `OncePerRequestFilter`): reads `access_token` cookie, validates JWT, sets `SecurityContext`

## 5. Backend — Security Configuration Overhaul

- [x] 5.1 Rewrite `SecurityConfig` in `com.recipemanager.auth.api`: remove in-memory user + HTTP Basic; configure `oauth2Login` with success/failure handlers; add `JwtCookieFilter` before `UsernamePasswordAuthenticationFilter`; permit `/auth/**` and `/actuator/health`; require auth for all `/api/**`
- [x] 5.2 Update `AuthUserIdResolver` to extract `userId` from `SecurityContext` principal (JWT claim) instead of principal name hash

## 6. Backend — Tests

- [x] 6.1 Unit test `JwtService`: token generation, validation, expiry, userId extraction
- [x] 6.2 Unit test `UserService`: upsert creates new user; upsert updates existing user; refresh token hash storage and clear
- [x] 6.3 Integration test `AuthController /auth/refresh`: valid rotation returns 200 + new cookies; replayed token returns 401; expired token returns 401
- [x] 6.4 Integration test `AuthController /auth/logout`: clears cookies + hash
- [x] 6.5 Integration test `AuthController /auth/me`: authenticated returns user identity; unauthenticated returns 401
- [x] 6.6 Update `RecipeServiceImplTest` and `RecipeControllerTest` to use JWT-based auth stubs instead of Basic Auth

## 7. Frontend — Auth Infrastructure

- [x] 7.1 Create `src/features/user-auth/AuthContext.jsx`: calls `GET /auth/me` on mount, stores `{ userId, displayName, avatarUrl }` or `null`; exposes `user`, `isLoading`, `logout()` via context
- [x] 7.2 Create `src/features/user-auth/ProtectedRoute.jsx`: reads `AuthContext`; if loading shows spinner; if no user redirects to `/login`; otherwise renders children
- [x] 7.3 Update `src/lib/apiClient.js`: remove hardcoded Basic Auth header; ensure `credentials: 'include'` is set on all requests so cookies are sent; add 401 interceptor that attempts `POST /auth/refresh` once, then redirects to `/login`

## 8. Frontend — Login Page

- [x] 8.1 Create `src/features/user-auth/LoginPage.jsx`: displays app name and a "Continue with Google" button; button navigates to `/auth/google`; if query param `?error=oauth` is present, shows an error message
- [x] 8.2 Add `/login` route in `App.jsx` (public, outside `ProtectedRoute`)

## 9. Frontend — Route Protection & Profile Page

- [x] 9.1 Wrap all existing app routes (Home, Recipe Detail, Create, Edit, Video Import, Profile) in `ProtectedRoute` in `App.jsx`
- [x] 9.2 Create `src/features/user-profile/ProfilePage.jsx`: reads user from `AuthContext`; displays avatar (`<img>` with fallback initials), display name; includes a logout button that calls `AuthContext.logout()`
- [x] 9.3 Wire `/profile` route in `App.jsx` to `ProfilePage`

## 10. End-to-End Verification

- [x] 10.1 Run `cd backend && mvn test` — all tests pass
- [x] 10.2 Run `cd frontend && npm run lint` — no lint errors
- [ ] 10.3 Manual smoke test: open app unauthenticated → redirected to `/login`; click "Continue with Google" → complete OAuth → lands on `/`; navigate to `/profile` → see avatar + name; click logout → redirected to `/login`
- [ ] 10.4 Manual token expiry test: wait for access token expiry or manually expire it; make a request → silent refresh fires; verify new cookies are set and request succeeds
