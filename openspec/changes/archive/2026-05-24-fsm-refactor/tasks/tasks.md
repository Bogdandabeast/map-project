# Tasks: FSM Refactor for Auth, Map, and Session Flows

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600 - 800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Core) $\rightarrow$ PR 2 (Session) / PR 3 (Map) / PR 4 (Forms) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Implement `useMachine` utility and tests | PR 1 | Base: main; Foundation for all other machines |
| 2 | Refactor `AuthProvider` with `sessionMachine` | PR 2 | Base: PR 1; Low risk, global impact |
| 3 | Refactor `MapView` with `mapInitMachine` | PR 3 | Base: PR 1; Medium risk, fixes race conditions |
| 4 | Refactor Auth Forms with `authFormMachine` | PR 4 | Base: PR 1; Low risk, improves UX |

## Phase 1: Core Infrastructure

- [x] 1.1 Create `apps/frontend/src/hooks/useMachine.ts` implementing the generic `useMachine` hook and `MachineConfig` types.
- [x] 1.2 Implement unit tests for `useMachine` to verify state updates and event dispatching.

## Phase 2: Session Machine (AuthProvider)

- [x] 2.1 Create `apps/frontend/src/components/auth/sessionMachine.ts` defining `SessionState`, `SessionEvent`, and the pure `sessionReducer`.
- [x] 2.2 Refactor `apps/frontend/src/components/auth/AuthProvider.tsx` to use `useMachine(sessionMachine)`, replacing implicit booleans and `useState` calls.
- [x] 2.3 Write unit tests for `sessionReducer` verifying transitions for `SESSION_RESOLVED`.

## Phase 3: Map Init Machine (MapView)

- [x] 3.1 Create `apps/frontend/src/components/map/view/mapInitMachine.ts` defining `MapInitState`, `MapInitEvent`, and the pure `mapInitReducer`.
- [x] 3.2 Refactor `apps/frontend/src/components/map/view/MapView.tsx` to use `useMachine(mapInitMachine)`, replacing the implicit asset loading and instantiation state.
- [x] 3.3 Write unit tests for `mapInitReducer` verifying the full sequence: `START_INIT` $\rightarrow$ `ASSETS_LOADED` $\rightarrow$ `CONTROLLER_READY`.

## Phase 4: Auth Form Machine (Login & Signup)

- [ ] 4.1 Create `apps/frontend/src/pages/authFormMachine.ts` defining `AuthFormState`, `AuthFormEvent`, and the pure `authFormReducer`.
- [ ] 4.2 Refactor `apps/frontend/src/pages/LoginPage.tsx` to use `useMachine(authFormMachine)` for validation and submission.
- [ ] 4.3 Refactor `apps/frontend/src/pages/SignupPage.tsx` to use `useMachine(authFormMachine)` for validation and submission.
- [ ] 4.4 Write unit tests for `authFormReducer` verifying `SUBMIT` $\rightarrow$ `VALIDATION_FAILED` / `API_SUCCESS` flows.

## Phase 5: Verification & Polish

- [ ] 5.1 Verify `AuthProvider` state transitions (Initializing $\rightarrow$ Authenticated/Unauthenticated) using React DevTools.
- [ ] 5.2 Verify `MapView` loading sequence and error state rendering in the browser.
- [ ] 5.3 Verify `LoginPage` and `SignupPage` error messaging and button disabled states during `SUBMITTING`.
- [ ] 5.4 Remove any leftover implicit state variables from refactored components.
