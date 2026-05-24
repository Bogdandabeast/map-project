# Session State FSM (`auth-session-fsm`)

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
