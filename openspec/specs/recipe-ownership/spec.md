# Capability: recipe-ownership

## Purpose
Define ownership and authentication rules for recipe access during the development auth phase.

## Requirements

### Requirement: All recipe API endpoints require HTTP Basic Auth

> **Note:** This is a **development stub**. Full Supabase JWT authentication (JWKS validation, RLS) is deferred to a follow-up change. HTTP Basic Auth is used here to protect endpoints during development and testing without requiring Supabase credentials.

The system SHALL configure Spring Security with a single in-memory user. All `/api/v1/recipes/**` endpoints SHALL require a valid Basic Auth credential. Unauthenticated requests SHALL be rejected with HTTP 401.

#### Scenario: Authenticated request is accepted
- **WHEN** a client sends a request to `GET /api/v1/recipes` with a valid Basic Auth header (`Authorization: Basic <base64(user:password)>`)
- **THEN** the server responds with HTTP 200 and the recipe list

#### Scenario: Unauthenticated request is rejected
- **WHEN** a client sends a request to any `/api/v1/recipes/**` endpoint without an `Authorization` header
- **THEN** the server responds with HTTP 401

#### Scenario: Wrong credentials are rejected
- **WHEN** a client sends a request with incorrect Basic Auth credentials
- **THEN** the server responds with HTTP 401

### Requirement: Recipe ownership is derived from the Basic Auth principal

The system SHALL derive the `userId` from the authenticated principal name. For the stub, the principal maps to a fixed UUID so that all recipes created in a dev session are associated with the same user.

#### Scenario: userId is taken from principal, not request body
- **WHEN** a client sends `POST /api/v1/recipes` with a valid Basic Auth header
- **THEN** the recipe is stored with the `userId` derived from the principal, regardless of any `userId` field in the request body

### Requirement: Users can only access their own recipes (service-layer enforcement)

The service layer SHALL filter all queries by `userId`. A user cannot read, update, or delete recipes associated with a different `userId`. Attempts SHALL return HTTP 404.

> **Note:** Database-level RLS (Supabase Row-Level Security via Hibernate `StatementInspector`) is deferred to the Supabase JWT auth follow-up change. For now, ownership is enforced exclusively in the service layer.

#### Scenario: User cannot access a recipe owned by another userId
- **WHEN** a request is made for `/api/v1/recipes/{id}` where `{id}` belongs to a different `userId`
- **THEN** the server responds with HTTP 404

## Deferred Requirements

The following requirements are deferred to the **Supabase JWT Auth** follow-up change:

- JWT signature validation via Supabase JWKS endpoint
- `JwtAuthFilter` extracting `sub` claim from Bearer token
- `SupabaseRlsInterceptor` (Hibernate `StatementInspector`) setting `request.jwt.claim.sub`
- Row-Level Security policies on the `recipes` table
- Google OAuth sign-in flow in the frontend
