## MODIFIED Requirements

### Requirement: All recipe API endpoints require authentication
The system SHALL configure Spring Security with a JWT cookie filter. All `/api/v1/recipes/**` endpoints SHALL require a valid `access_token` cookie. Unauthenticated requests SHALL be rejected with HTTP 401. The previous HTTP Basic Auth stub is removed.

#### Scenario: Authenticated request is accepted
- **WHEN** a client sends a request to `GET /api/v1/recipes` with a valid `access_token` cookie
- **THEN** the server responds with HTTP 200 and the recipe list

#### Scenario: Unauthenticated request is rejected
- **WHEN** a client sends a request to any `/api/v1/recipes/**` endpoint without a valid `access_token` cookie
- **THEN** the server responds with HTTP 401

#### Scenario: Expired access token is rejected
- **WHEN** a client sends a request with an expired `access_token` cookie
- **THEN** the server responds with HTTP 401

---

### Requirement: Recipe ownership is derived from the authenticated JWT userId claim
The system SHALL derive the `userId` from the `userId` claim in the verified `access_token` JWT. This UUID MUST correspond to a row in the `users` table. The userId SHALL never be accepted from the request body or query parameters.

#### Scenario: userId is taken from JWT claim, not request body
- **WHEN** a client sends `POST /api/v1/recipes` with a valid `access_token` cookie
- **THEN** the recipe is stored with the `userId` from the JWT `userId` claim, regardless of any `userId` field in the request body

---

### Requirement: Users can only access their own recipes (service-layer enforcement)
The service layer SHALL filter all queries by `userId`. A user cannot read, update, or delete recipes associated with a different `userId`. Attempts SHALL return HTTP 404.

> **Note:** Database-level RLS via Supabase JWKS remains deferred.

#### Scenario: User cannot access a recipe owned by another userId
- **WHEN** a request is made for `/api/v1/recipes/{id}` where `{id}` belongs to a different `userId`
- **THEN** the server responds with HTTP 404
