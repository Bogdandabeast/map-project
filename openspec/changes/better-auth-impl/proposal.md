# Proposal: Better-Auth Implementation

## Intent

Implement a secure, fully-typed authentication system using `better-auth` to manage user identity and session persistence for the map-project backend.

## Scope

### In Scope

- Installation and configuration of `better-auth`.
- Database schema definition for auth (users, sessions, accounts) using Drizzle ORM and PostgreSQL.
- Hono integration: mounting the `better-auth` handler.
- Type-safe session middleware for protecting routes.
- Email/Password authentication flow.
- Integration tests for the auth lifecycle.

### Out of Scope

- OAuth/Social logins.
- Multi-factor authentication (MFA).
- Complex user profile/account management.

## Capabilities

### New Capabilities

- `user-auth`: Registration, login, logout, and session management.
- `session-verification`: Middleware to validate sessions and inject typed user context.

### Modified Capabilities

- None.

## Approach

The implementation will follow a strict TDD approach using `bun test`.

### Technical Architecture

- **Persistence**: `better-auth` will be configured with the Drizzle adapter, targeting a PostgreSQL database.
- **Routing**: The auth handler will be mounted on `/api/auth/*` in Hono.
- **Middleware**: A custom middleware will call `auth.getSession(c.req.raw)` and attach the result to the Hono context.

### Typing Strategy

- **Context Augmentation**: We will extend Hono's `Env` type to include `user` and `session` in `Variables`.
- **Zod Integration**: `better-auth`'s internal Zod schemas will be aligned with the API's Zod-OpenAPI definitions to ensure consistency.
- **Strict Null Checks**: Middleware will explicitly handle the "no session" case, ensuring that downstream handlers receive a guaranteed user object or a 401 response.

### TDD Strategy

Every auth feature will follow the Red-Green-Refactor cycle:

1. **Test**: Write an integration test using `bun test` and `hono`'s `app.request()`.
2. **Fail**: Run the test and confirm it fails.
3. **Implement**: Write the minimum code to make the test pass.
4. **Verify**: Run the test and confirm it passes.
5. **Refactor**: Improve the code while maintaining passing tests.

**Essential Test Cases**:

- `POST /api/auth/sign-up`: Valid inputs create a user; invalid inputs return 400.
- `POST /api/auth/sign-in`: Correct credentials create a session; wrong credentials return 401.
- `GET /api/protected`: Valid session returns 200; missing/expired session returns 401.
- `POST /api/auth/sign-out`: Valid session is invalidated.

## Affected Areas

| Area                       | Impact   | Description                               |
| -------------------------- | -------- | ----------------------------------------- |
| `src/db/schemas/schema.ts` | New      | Auth tables (users, sessions, accounts)   |
| `src/app.ts`               | Modified | Mounting `/api/auth` handler              |
| `src/middlewares/auth.ts`  | New      | `authMiddleware` for session verification |
| `src/types/auth.ts`        | New      | Hono context type augmentations           |

## Risks

| Risk                    | Likelihood | Mitigation                                        |
| ----------------------- | ---------- | ------------------------------------------------- |
| TS Context Typings      | Medium     | Use explicit interface merging for Hono `Env`     |
| DB Migration Sync       | Low        | Use Drizzle Kit for controlled migrations         |
| Session Race Conditions | Low        | Rely on `better-auth`'s proven session management |

## Rollback Plan

1. Revert database migrations via `drizzle-kit drop`.
2. Remove auth handler and middleware from `src/app.ts`.
3. Remove `src/middlewares/auth.ts` and `src/types/auth.ts`.

## Dependencies

- `better-auth`
- `drizzle-orm`
- `pg`

## Success Criteria

- [ ] Successful registration and login via Email/Pass.
- [ ] Protected routes are inaccessible without a valid session.
- [ ] Route handlers have full TS autocomplete for the `user` object in context.
- [ ] 100% pass rate on the defined auth integration test suite.
