# user-auth-frontend Specification

## Purpose

Login/signup pages, cookie-based session management via `better-auth/react`, route protection, and session initialization on app mount.

## Requirements

### Requirement: Session Initialization

On app mount the system MUST check for an active session via `authClient.getSession()`. While the check is pending an `IonLoading` spinner MUST be displayed. If authenticated, protected routes SHALL be accessible. If unauthenticated, the system MUST redirect to `/login`.

#### Scenario: Authenticated on mount

- GIVEN the user has a valid session cookie
- WHEN the app mounts
- THEN `getSession()` returns user data, `isPending` is `false`, and protected routes are accessible

#### Scenario: No session on mount

- GIVEN the user has no session cookie
- WHEN the app mounts
- THEN `getSession()` returns `null` and the system redirects to `/login`

#### Scenario: Session check pending

- GIVEN the app is mounting
- WHEN `getSession()` has not resolved
- THEN `IonLoading` MUST be shown and protected routes MUST NOT render

### Requirement: Client-Side Validation (Zod)

All auth forms MUST validate input with **Zod schemas** before calling better-auth. Validation MUST run on blur and on submit. Field-level errors MUST display inline using Ionic's `ion-invalid` / `ion-error` pattern.

Schemas (shared between frontend and backend via `@repo/validations`):

- **email**: `z.string().email()` — MUST be a valid email format
- **password**: `z.string().min(8)` — MUST be at least 8 characters
- **name**: `z.string().min(2).max(100)` — MUST be between 2 and 100 characters

#### Scenario: Invalid email format on submit

- GIVEN the user is on `/login` or `/signup`
- WHEN the user submits with an invalid email
- THEN the form MUST show an inline error and MUST NOT call the API

#### Scenario: Password too short on submit

- GIVEN the user is on `/signup`
- WHEN the user submits with a password shorter than 8 characters
- THEN the form MUST show an inline error and MUST NOT call the API

#### Scenario: Name too short on submit

- GIVEN the user is on `/signup`
- WHEN the user submits with a name shorter than 2 characters
- THEN the form MUST show an inline error and MUST NOT call the API

### Requirement: Server-Side Validation (Zod)

The backend MUST validate auth payloads with the same Zod schemas before delegating to `auth.handler()`. If validation fails, the backend MUST return a 400 response with a consistent error shape. This ensures defense-in-depth even if client-side validation is bypassed.

#### Scenario: Backend rejects invalid email

- GIVEN a POST to `/api/auth/sign-in/email` with an invalid email
- WHEN the request reaches the backend
- THEN Zod validation fails and the API returns 400 with `{ error, fields }` shape

#### Scenario: Backend rejects short password

- GIVEN a POST to `/api/auth/sign-up/email` with a password shorter than 8 characters
- WHEN the request reaches the backend
- THEN Zod validation fails and the API returns 400 with `{ error, fields }` shape

### Requirement: User Registration

The `/signup` page MUST provide Ionic fields for name, email, and password. On submit, the system MUST first validate with Zod, then call `authClient.signUp.email({ email, password, name })`. The submit button MUST show a loading state while the request is in flight.

#### Scenario: Successful sign-up

- GIVEN the user is on `/signup` with valid name, email, and password
- WHEN the user submits
- THEN `signUp.email()` succeeds, a session cookie is set, and the user redirects to `/map`

#### Scenario: Duplicate email

- GIVEN the user is on `/signup` with an already-registered email
- WHEN the user submits
- THEN an inline error MUST be shown and the user stays on `/signup`

#### Scenario: Weak password

- GIVEN the user is on `/signup` with an invalid password
- WHEN the user submits
- THEN an inline error MUST be shown and the user stays on `/signup`

### Requirement: User Login

The `/login` page MUST provide Ionic fields for email and password. On submit, the system MUST call `authClient.signIn.email({ email, password })`. The submit button MUST show a loading state while the request is in flight.

#### Scenario: Successful login

- GIVEN the user is on `/login` with valid credentials
- WHEN the user submits
- THEN `signIn.email()` succeeds and the user redirects to `/map`

#### Scenario: Invalid credentials

- GIVEN the user is on `/login` with incorrect email or password
- WHEN the user submits
- THEN an inline error MUST be shown and the user stays on `/login`

### Requirement: Route Protection

The `/map` route MUST be guarded by a `ProtectedRoute` component. Unauthenticated users MUST be redirected to `/login`. The `/login` and `/signup` routes MUST redirect to `/map` if already authenticated.

#### Scenario: Unauthenticated access to `/map`

- GIVEN the user has no active session
- WHEN navigating to `/map`
- THEN the system redirects to `/login`

#### Scenario: Authenticated access to `/login`

- GIVEN the user has an active session
- WHEN navigating to `/login`
- THEN the system redirects to `/map`

### Requirement: Sign-out

The system MUST provide a sign-out action that calls `authClient.signOut()`, clears local session state, and redirects to `/login`.

#### Scenario: Successful sign-out

- GIVEN the user is authenticated
- WHEN sign-out is triggered
- THEN `signOut()` is called, the user redirects to `/login`, and protected routes are no longer accessible

### Requirement: Session Persistence

The session MUST survive page reload. On reload, `useSession()` or `getSession()` MUST restore auth state from the session cookie.

#### Scenario: Session survives reload

- GIVEN the user is authenticated
- WHEN the page is reloaded
- THEN `useSession()` returns the same user data and protected routes remain accessible
