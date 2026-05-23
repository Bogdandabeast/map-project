# Proposal: Backend Technical Debt Professionalization

## Intent

Address critical production-readiness gaps in the backend by implementing graceful process lifecycle management and robust configuration parsing. This ensures resources are cleaned up correctly on shutdown and that environment-driven configuration is validated and sanitized.

## Scope

### In Scope
- Implementation of `SIGTERM` and `SIGINT` signal handlers for graceful shutdown.
- Explicit closing of the Postgres connection pool (`pg.Pool`) upon shutdown.
- Refactoring of `TRUSTED_ORIGINS` parsing to use Zod transformations for sanitization (trimming and empty-string filtering).

### Out of Scope
- Frontend notification system (handled in a separate effort).
- Database migration or schema changes.
- Comprehensive load testing of the shutdown sequence.

## Capabilities

### New Capabilities
- `backend-lifecycle`: Management of the application process lifecycle, ensuring graceful shutdown of all active resources (HTTP server, DB pools).
- `backend-config-validation`: Strict validation and transformation of environment variables to prevent malformed configuration from affecting app behavior.

## Approach

### Backend Lifecycle
Implement a centralized shutdown coordination mechanism in `apps/backend/src/app.ts`.
1. Capture `SIGTERM` and `SIGINT` signals.
2. Trigger a shutdown sequence:
   - Stop accepting new HTTP requests (close the Hono/Bun server).
   - Close the Postgres connection pool via `await pool.end()`.
3. Exit the process with the appropriate status code.

### Config Parsing
Enhance the `envSchema` in `apps/backend/src/config.ts` using Zod:
1. Define `TRUSTED_ORIGINS` as a string.
2. Use `.transform()` to:
   - Split the string by commas.
   - Trim whitespace from each entry.
   - Filter out empty strings.
3. Ensure the resulting array is passed to the application.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/backend/src/app.ts` | Modified | Add signal handlers and shutdown logic. |
| `apps/backend/src/db/index.ts` | Modified | Export the pool or provide a `closePool` function. |
| `apps/backend/src/config.ts` | Modified | Update `envSchema` with Zod transformation for `TRUSTED_ORIGINS`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Shutdown timeout | Low | Implement a forced exit timeout (e.g., 10s) if graceful shutdown hangs. |
| Bun signal handling quirks | Low | Test signal handling specifically within the Bun runtime environment. |

## Rollback Plan

1. Revert changes in `apps/backend/src/config.ts` to the previous `.split().map()` implementation.
2. Remove signal handlers from `apps/backend/src/app.ts`.
3. Restore the previous DB pool initialization if exported methods were changed.

## Dependencies

- `zod` (already present in the project).

## Success Criteria

- [ ] `process.on('SIGTERM')` and `process.on('SIGINT')` trigger the shutdown sequence.
- [ ] `pg.Pool.end()` is successfully called and resolved before the process exits.
- [ ] An environment variable `TRUSTED_ORIGINS="http://localhost:3000, , http://example.com,"` results in `['http://localhost:3000', 'http://example.com']`.
- [ ] The application starts and stops without leaking database connections.
