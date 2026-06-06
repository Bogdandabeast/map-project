# Tasks: Infrastructure Foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 650–800 |
| 400-line budget risk | High |

Decision needed before apply: Resolved
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High
PR 1 branch: bdb/infrastructure-foundation/pr1-config-deps → feature/infrastructure-foundation

### Suggested Work Units

| Unit | Goal | PR |
|------|------|----|
| 1 | Config + deps + docker removal (~120 lines) | PR 1 → feature/infra |
| 2 | Backend rewrite: entrypoint, DB, config, auth (~200 lines) | PR 2 → PR 1 |
| 3 | Repository + storage + stoker/validations (~250 lines) | PR 3 → PR 2 |
| 4 | Testing: frontend 13 files + backend fixes (~230 lines) | PR 4 → PR 3 |

## Phase 1: Config & Dependencies

- [x] 1.1 Create `wrangler.toml` with D1+R2 bindings, `main = "apps/backend/src/app.js"`
- [x] 1.2 Create `.dev.vars` with `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` (gitignored)
- [x] 1.3 Update `apps/backend/package.json`: add `wrangler`, `@cloudflare/workers-types`; remove `pg`
- [x] 1.4 Update `apps/frontend/package.json`: remove `vitest`
- [x] 1.5 Update `apps/backend/drizzle.config.js`: `dialect: 'sqlite'`, local D1 path
- [x] 1.6 Add `"test": {}` to `turbo.json`; add `"test": "turbo run test"` to root `package.json`
- [x] 1.7 Delete `docker-compose.yml` and `.env`

## Phase 2: Backend Core

- [x] 2.1 Rewrite `apps/backend/src/app.js`: drop `Bun.serve`, `process`, pool; `export default app`; auth per-request via `c.set('auth', getAuth(c.env))`
- [x] 2.2 Rewrite `apps/backend/src/db/index.js`: `drizzle-orm/d1`, `createDb(d1Binding)` factory
- [x] 2.3 Migrate `apps/backend/src/db/schemas/schema.js`: `pgTable`→`sqliteTable`, `varchar`→`text`, `timestamp`→`integer({mode:'timestamp'})`
- [x] 2.4 Rewrite `apps/backend/src/config.js`: `validateConfig(env)` from bindings; drop `DATABASE_URL`, `DB_POOL_*`
- [x] 2.5 Modify `apps/backend/src/lib/auth.js`: `provider: 'sqlite'`, `getAuth(env)` factory

## Phase 3: Repository & Storage

- [x] 3.1 Create `apps/backend/src/repositories/types.ts` (`PlanRepository` + `GeoQuery`)
- [x] 3.2 Create `apps/backend/src/lib/geo.ts` (`getBoundingBox` pure function)
- [x] 3.3 Create `apps/backend/src/repositories/d1-plan-repository.ts` (bounding-box + haversine)
- [x] 3.4 Create `apps/backend/src/storage/r2.js` (`createPresignedUrl` helper)

## Phase 4: Shared Packages

- [x] 4.1 Create `packages/stoker/package.json` + `src/middlewares/index.ts` (notFound, onError, serveEmojiFavicon)
- [x] 4.2 Create `packages/stoker/src/openapi/index.ts` + `src/http-status-phrases/index.ts`
- [x] 4.3 Create `packages/validations/package.json` + `src/index.ts` (signInSchema, signUpSchema)

## Phase 5: Unified Testing

- [ ] 5.1 Create `apps/frontend/tests/setup.ts` (register jest-dom matchers)
- [ ] 5.2 Migrate `apps/frontend/src/setupTests.ts`: `vi.fn`→`mock`, vitest→`bun:test`
- [ ] 5.3 Migrate 13 frontend test files: `'vitest'`→`'bun:test'`; `vi.mock`→`mock.module`; `vi.fn`→`mock`
- [ ] 5.4 Remove `test:` block from `apps/frontend/vite.config.ts`
- [x] 5.5 Update `apps/backend/tests/config.test.js` to validate bindings
- [x] 5.6 Delete `apps/backend/tests/lifecycle.test.js` + `index.test.ts`
- [ ] 5.7 Verify: `bun test` passes in both apps, `turbo test` exits 0
