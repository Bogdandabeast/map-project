# Tasks: Better-Auth Implementation

## Review Workload Forecast

| Field                   | Value                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| Estimated changed lines | 400-600                                                              |
| 400-line budget risk    | Medium                                                               |
| Chained PRs recommended | Yes                                                                  |
| Suggested split         | PR 1: Foundation & Middleware → PR 2: Auth flows & Integration Tests |
| Delivery strategy       | ask-on-risk                                                          |
| Chain strategy          | pending                                                              |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal                            | Likely PR | Notes                                                              |
| ---- | ------------------------------- | --------- | ------------------------------------------------------------------ |
| 1    | Foundation & Session Middleware | PR 1      | Includes DB schema, types, and `authMiddleware`.                   |
| 2    | Auth Flow Implementation & TDD  | PR 2      | Sign-up, Sign-in, Sign-out integration tests and handler mounting. |

## Phase 1: Foundation

- [ ] 1.1 Install `better-auth`, `drizzle-orm`, and `pg` in `apps/backend`.
- [ ] 1.2 Create `apps/backend/src/db/schemas/schema.ts` defining `user`, `session`, and `account` tables compatible with `better-auth`.
- [ ] 1.3 Create `apps/backend/src/lib/auth.ts` to initialize the `better-auth` instance using the Drizzle adapter.
- [ ] 1.4 Create `apps/backend/src/types/auth.ts` to extend Hono's `Env` Variables with `user` and `session` types.

## Phase 2: Session Verification (TDD)

- [ ] 2.1 (RED): Create `apps/backend/tests/auth-middleware.test.ts` with failing tests for `authMiddleware` (Valid session -> 200, Missing/Expired token -> 401).
- [ ] 2.2 (GREEN): Implement `authMiddleware` in `apps/backend/src/middlewares/auth.ts` using `auth.getSession(c.req.raw)`.
- [ ] 2.3 (REFACTOR): Optimize `authMiddleware` types, removing all `any` and ensuring the injected `user` object is strictly typed.

## Phase 3: User Auth Flows (TDD)

- [ ] 3.1 (RED): Create `apps/backend/tests/user-auth.test.ts` with failing tests for Sign-up (Successful registration, Duplicate email, Invalid input).
- [ ] 3.2 (GREEN): Mount the `better-auth` handler in `apps/backend/src/app.ts` at `/api/auth/*` to enable the sign-up endpoint.
- [ ] 3.3 (REFACTOR): Ensure sign-up response and cookie behavior match the User Auth specification.
- [ ] 3.4 (RED): Add failing tests to `apps/backend/tests/user-auth.test.ts` for Sign-in (Correct credentials, Incorrect password, Non-existent user).
- [ ] 3.5 (GREEN): Verify the `better-auth` sign-in handler satisfies the tests.
- [ ] 3.6 (REFACTOR): Refactor auth-related types or helper functions to ensure consistency across the auth flow.
- [ ] 3.7 (RED): Add failing tests to `apps/backend/tests/user-auth.test.ts` for Sign-out (Successful sign-out, Sign-out without session).
- [ ] 3.8 (GREEN): Verify the `better-auth` sign-out handler satisfies the tests.
- [ ] 3.9 (REFACTOR): Final cleanup of the auth implementation and test suite.

## Phase 4: Final Verification

- [ ] 4.1 Run the full auth test suite (`bun test apps/backend/tests`) to ensure no regressions.
- [ ] 4.2 Verify TS compiler happiness across the backend app.
