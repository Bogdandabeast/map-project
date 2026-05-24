# Design: FSM Refactor for Auth, Map, and Session Flows

## Technical Approach

The goal is to replace implicit state (booleans and scattered `useState` calls) with explicit Finite State Machines (FSMs). This ensures that the application can only be in one valid state at a time and that transitions are predictable and type-safe.

We will implement a lightweight `useMachine` hook that wraps `useReducer`, leveraging TypeScript's **Discriminated Unions** to enforce exhaustive state and event handling.

## Architecture Decisions

### Decision: Custom `useMachine` vs. XState
**Choice**: Custom `useMachine` utility.
**Alternatives considered**: XState, Redux.
**Rationale**: The complexity of these flows does not justify the bundle size and learning curve of XState. A simple `useReducer` wrapper provides 90% of the benefit (explicit states, transitions) with near-zero overhead.

### Decision: Pure Reducer Logic
**Choice**: Reducers will be pure functions defined outside the React components.
**Alternatives considered**: Inline reducer functions.
**Rationale**: Pure reducers are trivial to unit test without mounting components, ensuring the state transition logic is correct independently of the UI.

### Decision: Discriminated Unions for States and Events
**Choice**: Every machine will define its state as `type State = { type: 'STATE_A', ... } | { type: 'STATE_B', ... }`.
**Alternatives considered**: Enum-based state or simple string union.
**Rationale**: This allows TypeScript to narrow the type of the state object in the reducer, providing access to state-specific data (e.g., `error` only available in `ERROR` state) with full type safety.

## Data Flow

### Generic Machine Flow
`UI Event` $\rightarrow$ `send(event)` $\rightarrow$ `Reducer(state, event)` $\rightarrow$ `Next State` $\rightarrow$ `UI Update`

### Map Initialization Flow
`Mount` $\rightarrow$ `START_INIT` $\rightarrow$ `LOADING_ASSETS` $\rightarrow$ `ASSETS_LOADED` $\rightarrow$ `INSTANTIATING` $\rightarrow$ `CONTROLLER_READY` $\rightarrow$ `READY`

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/frontend/src/hooks/useMachine.ts` | Create | Generic `useMachine` hook and types. |
| `apps/frontend/src/components/auth/AuthProvider.tsx` | Modify | Integrate `sessionMachine` to manage loading/auth states. |
| `apps/frontend/src/components/map/view/MapView.tsx` | Modify | Integrate `mapInitMachine` to coordinate asset loading and instantiation. |
| `apps/frontend/src/pages/LoginPage.tsx` | Modify | Integrate `authFormMachine` for validation and submission flow. |
| `apps/frontend/src/pages/SignupPage.tsx` | Modify | Integrate `authFormMachine` for validation and submission flow. |

## Interfaces / Contracts

### `useMachine` Definition
```typescript
type MachineConfig<S, E> = {
  initialState: S;
  reducer: (state: S, event: E) => S;
};

function useMachine<S, E>(config: MachineConfig<S, E>): [S, (event: E) => void];
```

### Session Machine Types
```typescript
type SessionState = 
  | { type: 'INITIALIZING' }
  | { type: 'AUTHENTICATED', session: Session }
  | { type: 'UNAUTHENTICATED' };

type SessionEvent = 
  | { type: 'SESSION_RESOLVED', success: boolean, session?: Session };
```

### Map Init Machine Types
```typescript
type MapInitState = 
  | { type: 'UNINITIALIZED' }
  | { type: 'LOADING_ASSETS' }
  | { type: 'INSTANTIATING' }
  | { type: 'READY', controller: MapController }
  | { type: 'ERROR', error: string };

type MapInitEvent = 
  | { type: 'START_INIT' }
  | { type: 'ASSETS_LOADED' }
  | { type: 'CONTROLLER_READY', controller: MapController }
  | { type: 'INIT_FAILED', error: string };
```

### Auth Form Machine Types
```typescript
type AuthFormState = 
  | { type: 'IDLE' }
  | { type: 'VALIDATING' }
  | { type: 'SUBMITTING' }
  | { type: 'SUCCESS' }
  | { type: 'ERROR', errors: FieldErrors, apiError?: string };

type AuthFormEvent = 
  | { type: 'SUBMIT' }
  | { type: 'VALIDATION_PASSED' }
  | { type: 'VALIDATION_FAILED', errors: FieldErrors }
  | { type: 'API_SUCCESS' }
  | { type: 'API_FAILED', error: string }
  | { type: 'RESET' };
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Reducer transitions | Pure function tests: `expect(reducer(stateA, event)).toEqual(stateB)` |
| Integration | `useMachine` hook | Test hook state changes using `@testing-library/react-hooks` |
| E2E | UI State binding | Verify spinner visibility and button disabled states for each FSM state |

## Migration / Rollout

No data migration required. The rollout will be incremental:
1. Implement `useMachine` utility.
2. Refactor `AuthProvider` (low risk, global impact).
3. Refactor `MapView` (medium risk, fixes race conditions).
4. Refactor Auth forms (low risk, improves UX).

## Open Questions
- None.
