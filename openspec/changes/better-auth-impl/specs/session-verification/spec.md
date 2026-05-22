# Session Verification Specification

## Purpose

Ensure that protected routes are only accessible to users with a valid session and provide typed access to the user's identity.

## Requirements

### Requirement: Session Validation Middleware

The system MUST provide middleware to protect routes and inject authenticated user context.

#### Scenario: Valid Session Access

- GIVEN a request to a protected route with a valid session token
- WHEN the session verification middleware executes
- THEN the system SHALL validate the token against the database
- AND inject the `user` and `session` objects into the Hono context variables
- AND allow the request to proceed to the route handler

#### Scenario: Missing Session Token

- GIVEN a request to a protected route without a session token
- WHEN the session verification middleware executes
- THEN the system MUST return a 401 Unauthorized response
- AND block the request from reaching the route handler

#### Scenario: Expired Session Token

- GIVEN a request to a protected route with an expired session token
- WHEN the session verification middleware executes
- THEN the system MUST return a 401 Unauthorized response
- AND block the request from reaching the route handler

#### Scenario: Malformed Session Token

- GIVEN a request to a protected route with a malformed session token
- WHEN the session verification middleware executes
- THEN the system MUST return a 401 Unauthorized response
- AND block the request from reaching the route handler
