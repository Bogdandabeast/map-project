# FSM Refactor Specifications

This document defines the explicit state machines for authentication sessions, map initialization, and authentication forms.

## 1. Session State FSM (`auth-session-fsm`)

### Purpose
Manage the global authentication session lifecycle to eliminate UI flickers during initial load.

### States
- `INITIALIZING`: The system is checking for an existing session cookie.
- `AUTHENTICATED`: A valid session was found.
- `UNAUTHENTICATED`: No session found or session is invalid.

### Events
- `SESSION_RESOLVED`: Triggered when `getSession()` completes.
  - Payload: `{ success: boolean }`

### Transition Table
| Current State | Event | Next State | Side Effect |
|---------------|-------|------------|-------------|
| `INITIALIZING` | `SESSION_RESOLVED(true)` | `AUTHENTICATED` | Update context with session data |
| `INITIALIZING` | `SESSION_RESOLVED(false)` | `UNAUTHENTICATED` | Clear any stale session data |

### Invalid Transitions
- `SESSION_RESOLVED` must be ignored if the state is already `AUTHENTICATED` or `UNAUTHENTICATED`.

### Scenarios
#### Scenario: Successful Session Recovery
- GIVEN the app is in `INITIALIZING` state
- WHEN `getSession()` resolves successfully
- THEN the state MUST transition to `AUTHENTICATED`
- AND the loading spinner MUST be hidden.

#### Scenario: No Session Found
- GIVEN the app is in `INITIALIZING` state
- WHEN `getSession()` resolves with no session
- THEN the state MUST transition to `UNAUTHENTICATED`
- AND the loading spinner MUST be hidden.

---

## 2. Map Initialization FSM (`map-init-fsm`)

### Purpose
Coordinate the multi-step asynchronous initialization of the OpenLayers map to prevent race conditions.

### States
- `UNINITIALIZED`: Initial state before any loading begins.
- `LOADING_ASSETS`: Dynamically importing `MapModelAdapter` and `MapController`.
- `INSTANTIATING`: Creating the controller instance with the loaded model.
- `READY`: Map is fully instantiated and rendered.
- `ERROR`: A failure occurred during any step of the process.

### Events
- `START_INIT`: Triggered on component mount.
- `ASSETS_LOADED`: Triggered when dynamic imports complete.
- `CONTROLLER_READY`: Triggered when the controller is instantiated.
- `INIT_FAILED`: Triggered on any exception.

### Transition Table
| Current State | Event | Next State | Side Effect |
|---------------|-------|------------|-------------|
| `UNINITIALIZED` | `START_INIT` | `LOADING_ASSETS` | Begin dynamic imports of adapter and controller |
| `LOADING_ASSETS` | `ASSETS_LOADED` | `INSTANTIATING` | Instantiate `MapModelAdapter` and `MapController` |
| `INSTANTIATING` | `CONTROLLER_READY` | `READY` | Call `controller.createMap()` |
| `ANY` | `INIT_FAILED` | `ERROR` | Log error and show error UI |

### Invalid Transitions
- `START_INIT` must be ignored if the state is `LOADING_ASSETS`, `INSTANTIATING`, or `READY`.

### Scenarios
#### Scenario: Happy Path Initialization
- GIVEN the state is `UNINITIALIZED`
- WHEN `START_INIT` is triggered
- THEN the state MUST transition to `LOADING_ASSETS`
- WHEN assets are loaded
- THEN the state MUST transition to `INSTANTIATING`
- WHEN the controller is ready
- THEN the state MUST transition to `READY`
- AND the map MUST be rendered in the container.

#### Scenario: Asset Load Failure
- GIVEN the state is `LOADING_ASSETS`
- WHEN a dynamic import fails
- THEN the state MUST transition to `ERROR`
- AND an error message MUST be displayed to the user.

---

## 3. Auth Form FSM (`auth-form-fsm`)

### Purpose
Manage the transition between validation, submission, and result states for login and signup forms.

### States
- `IDLE`: Form is ready for input.
- `VALIDATING`: Running Zod schema validation.
- `SUBMITTING`: Calling the authentication API.
- `SUCCESS`: Authentication request completed successfully.
- `ERROR`: Validation failed or API returned an error.

### Events
- `SUBMIT`: User clicks the submit button.
- `VALIDATION_PASSED`: Zod validation succeeds.
- `VALIDATION_FAILED`: Zod validation fails.
- `API_SUCCESS`: `signIn/signUp` call succeeds.
- `API_FAILED`: `signIn/signUp` call fails.
- `RESET`: User starts editing the form again.

### Transition Table
| Current State | Event | Next State | Side Effect |
|---------------|-------|------------|-------------|
| `IDLE` | `SUBMIT` | `VALIDATING` | Execute `schema.safeParse()` |
| `VALIDATING` | `VALIDATION_PASSED` | `SUBMITTING` | Call `authClient.signIn/signUp` |
| `VALIDATING` | `VALIDATION_FAILED` | `ERROR` | Set field-level validation errors |
| `SUBMITTING` | `API_SUCCESS` | `SUCCESS` | Trigger redirect to `/map` |
| `SUBMITTING` | `API_FAILED` | `ERROR` | Set API error message |
| `ERROR` | `RESET` | `IDLE` | Clear error messages |
| `SUCCESS` | `RESET` | `IDLE` | Reset form fields |

### Invalid Transitions
- `SUBMIT` must be ignored if the state is `VALIDATING`, `SUBMITTING`, or `SUCCESS`.

### Scenarios
#### Scenario: Successful Login
- GIVEN the state is `IDLE`
- WHEN `SUBMIT` is triggered
- THEN the state MUST transition to `VALIDATING`
- WHEN validation passes
- THEN the state MUST transition to `SUBMITTING`
- AND the submit button MUST be disabled.
- WHEN API returns success
- THEN the state MUST transition to `SUCCESS`.

#### Scenario: Validation Failure
- GIVEN the state is `IDLE`
- WHEN `SUBMIT` is triggered
- THEN the state MUST transition to `VALIDATING`
- WHEN validation fails
- THEN the state MUST transition to `ERROR`
- AND the invalid fields MUST be highlighted with error messages.

#### Scenario: API Error
- GIVEN the state is `SUBMITTING`
- WHEN the API returns a 401 or 500 error
- THEN the state MUST transition to `ERROR`
- AND the API error message MUST be displayed.
