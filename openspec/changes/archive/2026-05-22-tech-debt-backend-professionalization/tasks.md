# Tasks: Backend Technical Debt Professionalization

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 60-100 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Professionalize backend config and lifecycle | PR 1 | Combined config refactor and graceful shutdown |

## Phase 1: Config & Foundation

- [x] 1.1 Export `pool` from `apps/backend/src/db/index.ts` to allow closing it during shutdown.
- [x] 1.2 Update `envSchema` in `apps/backend/src/config.ts` with `.transform()` for `TRUSTED_ORIGINS` to handle comma-separated strings.
- [x] 1.3 Simplify `validateConfig` in `apps/backend/src/config.ts` by removing manual `TRUSTED_ORIGINS` mapping.

## Phase 2: Lifecycle Implementation

- [x] 2.1 Refactor `apps/backend/src/app.ts`: replace `export default app` with explicit `Bun.serve` call and named exports `{ app, server }`.
- [x] 2.2 Implement `gracefulShutdown` coordinator in `apps/backend/src/app.ts` to call `server.stop()` and `pool.end()`.
- [x] 2.3 Wire up `process.on('SIGTERM')` and `process.on('SIGINT')` to trigger `gracefulShutdown` in `apps/backend/src/app.ts`.

## Phase 3: Verification

- [x] 3.1 Update imports in `apps/backend/tests/auth.test.ts` and `apps/backend/tests/index.test.ts` to use named `{ app }` import.
- [x] 3.2 Add unit tests for `TRUSTED_ORIGINS` transformation in `apps/backend/src/config.ts` covering malformed and missing config scenarios.
- [x] 3.3 Verify graceful shutdown manually by sending `SIGTERM` and confirming the process exits with code 0.
- [x] 3.4 Run all existing backend tests to ensure no regressions.
