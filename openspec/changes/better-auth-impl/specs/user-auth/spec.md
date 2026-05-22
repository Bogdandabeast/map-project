# User Auth Specification

## Purpose

Handle user registration, authentication, and session termination.

## Requirements

### Requirement: User Registration (Sign-up)

The system MUST allow new users to create an account using a valid email and password.

#### Scenario: Successful Registration

- GIVEN a valid email and a password meeting security requirements
- WHEN the user submits the sign-up request
- THEN the system SHALL create a new user record in the database
- AND return a 200 OK response with the created user's basic info
- AND set a valid session cookie

#### Scenario: Duplicate Email

- GIVEN an email address that is already associated with an account
- WHEN the user submits the sign-up request
- THEN the system MUST return a 400 Bad Request response
- AND not create a duplicate user record

#### Scenario: Invalid Input

- GIVEN an invalid email format or a password that is too short
- WHEN the user submits the sign-up request
- THEN the system MUST return a 400 Bad Request response with a validation error message

### Requirement: User Authentication (Sign-in)

The system MUST verify user credentials and establish a secure session.

#### Scenario: Successful Sign-in

- GIVEN a registered email and the correct password
- WHEN the user submits the sign-in request
- THEN the system SHALL verify the credentials
- AND create a new session record in the database
- AND return a 200 OK response with a session cookie

#### Scenario: Incorrect Password

- GIVEN a registered email but an incorrect password
- WHEN the user submits the sign-in request
- THEN the system MUST return a 401 Unauthorized response

#### Scenario: Non-existent User

- GIVEN an email address that is not registered
- WHEN the user submits the sign-in request
- THEN the system MUST return a 401 Unauthorized response

### Requirement: User Sign-out

The system MUST invalidate the current session and remove authentication credentials from the client.

#### Scenario: Successful Sign-out

- GIVEN a valid active session
- WHEN the user submits the sign-out request
- THEN the system SHALL remove the session record from the database
- AND clear the session cookie from the client
- AND return a 200 OK response

#### Scenario: Sign-out Without Session

- GIVEN no active session
- WHEN the user submits the sign-out request
- THEN the system SHOULD return a 200 OK response (idempotent behavior)
