# Auth Form FSM (`auth-form-fsm`)

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
