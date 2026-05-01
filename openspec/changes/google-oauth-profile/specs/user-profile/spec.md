## ADDED Requirements

### Requirement: Profile page displays authenticated user identity
The system SHALL provide a `/profile` route that displays the currently authenticated user's Google avatar and display name. The profile data SHALL be fetched from `GET /auth/me`. The page SHALL be a protected route (requires auth).

#### Scenario: Profile page renders authenticated user identity
- **WHEN** an authenticated user navigates to `/profile`
- **THEN** the page displays the user's Google avatar image and display name
- **THEN** no edit controls are shown

#### Scenario: Unauthenticated access to profile redirects to login
- **WHEN** an unauthenticated user navigates to `/profile`
- **THEN** the frontend redirects to `/login`

#### Scenario: Avatar image fails to load
- **WHEN** the user's Google avatar URL is unreachable
- **THEN** a fallback avatar (initials or placeholder) is displayed
