# Exploration: FSM Refactor for Map Project

## Current State

The application currently manages state using "implicit" FSMs—groups of `useState` and `useEffect` hooks that collectively represent the current state of a flow. These are scattered across components and providers.

### 1. Frontend Authentication Flows (`LoginPage`, `SignupPage`)
Currently uses a combination of `isSubmitting`, `errors`, and `apiError` booleans/strings.
- **Implicit States**:
  - `IDLE`: Waiting for user input.
  - `VALIDATING`: Running Zod `safeParse`.
  - `SUBMITTING`: Awaiting `authClient.signIn.email()` or `signUp.email()`.
  - `ERROR`: Displaying Zod or API errors.
  - `SUCCESS`: Redirecting to `/map`.
- **Transitions**: 
  - `SUBMIT` $\rightarrow$ `VALIDATING` $\rightarrow$ (`VALIDATION_ERROR` $\rightarrow$ `ERROR`) or (`VALID` $\rightarrow$ `SUBMITTING`)
  - `SUBMITTING` $\rightarrow$ (`API_ERROR` $\rightarrow$ `ERROR`) or (`API_SUCCESS` $\rightarrow$ `SUCCESS`)

### 2. Frontend Map Initialization (`MapView.tsx`)
Managed via `useEffect` with a `mounted` flag and `controllerRef`.
- **Implicit States**:
  - `UNINITIALIZED`: Initial render, `controllerRef` is null.
  - `INITIALIZING`: Awaiting dynamic imports of `MapModelAdapter` and `MapController`.
  - `READY`: Controller created and `createMap()` called.
  - `DESTROYED`: Component unmounted, `controller.destroy()` called.
- **Transitions**:
  - `MOUNT` $\rightarrow$ `INITIALIZING` $\rightarrow$ `READY`
  - `UNMOUNT` $\rightarrow$ `DESTROYED`

### 3. Frontend Session State (`AuthProvider.tsx`)
Managed by `isLoading` state.
- **Implicit States**:
  - `CHECKING`: Initial `getSession()` call on mount.
  - `AUTHENTICATED`: Session found.
  - `UNAUTHENTICATED`: No session found.
- **Transitions**:
  - `MOUNT` $\rightarrow$ `CHECKING` $\rightarrow$ (`SESSION_FOUND` $\rightarrow$ `AUTHENTICATED`) or (`SESSION_NOT_FOUND` $\rightarrow$ `UNAUTHENTICATED`)

### 4. Backend Flows (Hono)
Currently very lean.
- **Auth Guard**: The `authMiddleware` implements a simple state transition: `REQUEST` $\rightarrow$ (`SESSION_VALID` $\rightarrow$ `NEXT`) or (`SESSION_INVALID` $\rightarrow$ `401`).
- **Better Auth**: The core auth logic is encapsulated in `better-auth`, which internally manages its own state machine for sign-in/sign-up.

## Affected Areas

- `apps/frontend/src/pages/LoginPage.tsx` — Refactor form state to FSM.
- `apps/frontend/src/pages/SignupPage.tsx` — Refactor form state to FSM.
- `apps/frontend/src/components/map/view/MapView.tsx` — Refactor init logic to FSM.
- `apps/frontend/src/components/auth/AuthProvider.tsx` — Refactor session state to FSM.

## Analysis of Issues

- **Race Conditions**: In `MapView.tsx`, while the `mounted` flag prevents state updates after unmount, the transition from `INITIALIZING` to `READY` is implicit. If `createMap()` fails or takes too long, there's no explicit `ERROR` state.
- **Flickers**: `AuthProvider` causes a full-page loading spinner (`IonLoading`) until `getSession` resolves. An FSM could allow for more nuanced transitions (e.g., "Optimistic" states).
- **State Inconsistency**: In Auth pages, manually resetting `errors` and `apiError` at the start of `handleSubmit` is a manual transition that could be missed as the form grows.

## Proposed FSM Structures

### Auth Form FSM
- **States**: `IDLE`, `VALIDATING`, `SUBMITTING`, `ERROR`, `SUCCESS`.
- **Events**: `SUBMIT`, `VALIDATION_FAIL`, `API_FAIL`, `API_SUCCESS`, `RESET`.

### Map Init FSM
- **States**: `IDLE`, `LOADING_ASSETS`, `INSTANTIATING`, `READY`, `ERROR`.
- **Events**: `MOUNT`, `ASSETS_LOADED`, `CONTROLLER_CREATED`, `INIT_FAIL`, `UNMOUNT`.

### Session State FSM
- **States**: `INITIALIZING`, `AUTHENTICATED`, `UNAUTHENTICATED`, `EXPIRED`.
- **Events**: `SESSION_FOUND`, `SESSION_NOT_FOUND`, `LOGOUT`, `TOKEN_EXPIRED`.

## Recommendation: Implementation Approach

**Lightweight Custom FSM (Reducer-based)**
Given the project's current complexity, **XState is overkill**. The overhead of the library outweighs the benefits for these specific flows.

I recommend implementing a lightweight `useMachine` hook or utilizing `useReducer` with a strictly defined `State` union and `Event` union.

**Why**:
1. **Bundle Size**: Keeps the frontend lean.
2. **Type Safety**: TypeScript's discriminated unions provide almost all the safety XState's formal definitions offer.
3. **Complexity**: The flows are linear (mostly) and don't require complex hierarchical states or parallel states.

## Risks
- **Over-engineering**: Creating a "machine" for a simple 2-state toggle.
- **Boilerplate**: Transitioning from `useState` to `useReducer` increases the amount of code per component.
