# Tasks: Frontend Auth

## Review Workload Forecast

| Field                   | Value                                                          |
| ----------------------- | -------------------------------------------------------------- |
| Estimated changed lines | ~500-600                                                       |
| 400-line budget risk    | Medium                                                         |
| Chained PRs recommended | Yes                                                            |
| Suggested split         | PR1: Foundation + Auth infra; PR2: Pages + Backend; PR3: Tests |
| Delivery strategy       | ask-on-risk                                                    |
| Chain strategy          | pending                                                        |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

## Phase 1: Foundation

- [x] 1.1 Create `packages/validations/` — package.json, tsconfig.json, src/index.ts (email, password, name, signInSchema, signUpSchema)
- [x] 1.2 Add `better-auth`, `zod`, `@repo/validations` to `apps/frontend/package.json`
- [x] 1.3 Add `server.proxy` `/api → localhost:3000` to `apps/frontend/vite.config.ts`

## Phase 2: Auth Infrastructure

- [x] 2.1 Create `apps/frontend/src/lib/auth-client.ts` — `createAuthClient()` singleton
- [x] 2.2 Create `apps/frontend/src/components/auth/AuthProvider.tsx` — session on mount, IonLoading, context
- [x] 2.3 Create `apps/frontend/src/components/auth/ProtectedRoute.tsx` — `useSession()` guard, redirect `/login`

## Phase 3: Pages

- [x] 3.1 Create `apps/frontend/src/pages/SignupPage.tsx` — Ionic form, Zod → signUp.email(), inline errors
- [x] 3.2 Create `apps/frontend/src/pages/LoginPage.tsx` — Ionic form, Zod → signIn.email(), inline errors
- [x] 3.3 Update `apps/frontend/src/App.tsx` — AuthProvider wrapper, /login /signup routes, /map guarded

## Phase 4: Backend Validation

- [x] 4.1 Add `trustedOrigins: ['http://localhost:5173']` to `apps/backend/src/lib/auth.ts`
- [x] 4.2 Create `apps/backend/src/middlewares/validate.ts` — Zod middleware returning 400 `{ error, fields }`
- [x] 4.3 Apply validate middleware before auth.handler in `apps/backend/src/app.ts`

## Phase 5: Tests (TDD: RED → GREEN → REFACTOR per unit)

Core logic follows TDD — write failing test first, then implement, then refactor.

- [x] 5.1 `packages/validations/src/__tests__/schemas.test.ts` — each schema valid/invalid cases
- [x] 5.2 `apps/frontend/src/pages/LoginPage.test.tsx` — invalid input shows inline error, API not called
- [x] 5.3 `apps/frontend/src/pages/SignupPage.test.tsx` — invalid input shows inline error, API not called
- [x] 5.4 `apps/frontend/src/components/auth/ProtectedRoute.test.tsx` — redirect to /login when unauthenticated
- [x] 5.5 `apps/frontend/src/components/auth/AuthProvider.test.tsx` — IonLoading while session pending
- [x] 5.6 `apps/backend/tests/validate.test.ts` — invalid body → 400 `{ error, fields }`

## Phase 6: Navigation Header

- [x] 6.1 Create `apps/frontend/src/components/auth/AuthHeader.tsx` — auth-aware nav with Sign In/Sign Up/Sign Out/Map links
- [x] 6.2 Create `apps/frontend/src/components/auth/AuthLayout.tsx` — shared layout wrapping IonPage + AuthHeader + IonContent
- [x] 6.3 Update LoginPage, SignupPage, MapPage to use AuthLayout instead of raw IonPage/IonContent

## Phase 7: Verify Fixes

- [x] 7.1 Fix LoginPage — redirect authenticated users to /map via `useSession()` check on mount
- [x] 7.2 Fix SignupPage — redirect authenticated users to /map via `useSession()` check on mount
- [x] 7.3 Add `apps/frontend/src/components/auth/AuthHeader.test.tsx` — 6 tests (unauthenticated + authenticated states)
- [x] 7.4 Add `apps/frontend/src/components/auth/AuthLayout.test.tsx` — 2 tests (header rendering, children rendering)
