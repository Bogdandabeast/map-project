# Proposal: FSM Refactor for Auth, Map, and Session Flows

## Intent
Eliminate race conditions, UI flickers, and inconsistent state transitions caused by implicit state management (scattered `useState` and `useEffect` hooks) in critical application flows.

## Scope

### In Scope
- Implement a lightweight `useMachine` hook utility based on `useReducer` and discriminated unions.
- Refactor `AuthProvider` session state management.
- Refactor `MapView.tsx` initialization sequence.
- Refactor `LoginPage` and `SignupPage` form state transitions.

### Out of Scope
- Integration of XState or other heavy FSM libraries.
- State machine implementation on the Hono backend (remains stateless).

## Capabilities

### New Capabilities
- `auth-session-fsm`: Explicit session lifecycle management (`Initializing` $\rightarrow$ `Authenticated` | `Unauthenticated` | `Expired`).
- `map-init-fsm`: Explicit map initialization sequence (`Uninitialized` $\rightarrow$ `LoadingAssets` $\rightarrow$ `Instantiating` $\rightarrow$ `Ready` | `Error`).
- `auth-form-fsm`: Explicit auth form state transitions (`Idle` $\rightarrow$ `Validating` $\rightarrow$ `Submitting` $\rightarrow$ `Success` | `Error`).

## Approach
1. **Generic Utility**: Create a `useMachine` hook that wraps `useReducer`. It will take a `machine` definition containing `initialState` and a `reducer` function that handles `(state, event) => nextState`.
2. **Strict Typing**: Use TypeScript discriminated unions for both `State` and `Event` types for every flow, ensuring exhaustive checks in the reducer.
3. **Incremental Migration**:
   - Start with `AuthProvider` to stabilize the global session state.
   - Implement `map-init-fsm` to fix initialization race conditions.
   - Refactor auth forms to simplify error handling and submission logic.
4. **UI Binding**: Bind UI elements (spinners, error alerts, buttons) directly to the explicit FSM state.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/frontend/src/hooks/useMachine.ts` | New | Lightweight FSM hook utility |
| `apps/frontend/src/components/auth/AuthProvider.tsx` | Modified | Replace `isLoading` with `SessionState` FSM |
| `apps/frontend/src/components/map/view/MapView.tsx` | Modified | Replace implicit init flags with `MapInitState` FSM |
| `apps/frontend/src/pages/LoginPage.tsx` | Modified | Replace form flags with `AuthFormState` FSM |
| `apps/frontend/src/pages/SignupPage.tsx` | Modified | Replace form flags with `AuthFormState` FSM |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Increased Boilerplate | Med | `useMachine` utility will encapsulate reducer logic to minimize component clutter. |
| Over-engineering | Low | Strictly limit FSM application to the three identified complex flows. |

## Rollback Plan
Revert affected components to their previous state using git. The refactor is isolated to state management and does not change the external API of the components.

## Dependencies
- TypeScript 5.0+ (for advanced discriminated union support).

## Success Criteria
- [ ] `AuthProvider`: No flicker/unnecessary re-renders during session resolution.
- [ ] `MapView`: Zero race conditions during asset loading and controller instantiation.
- [ ] Auth Forms: No manual state resetting required for errors/loading; submission is disabled in non-idle states.
- [ ] Type Safety: TypeScript errors when attempting invalid state transitions (e.g., `SUBMIT` while `SUBMITTING`).
