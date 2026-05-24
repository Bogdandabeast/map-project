# Proposal: Vitest to Bun test migration

## Intent

Standardize the entire monorepo on `bun test`. Eliminate vitest as a transitive dependency (currently in 2 packages, stoker relies on hoisting). Removes a redundant test runner, simplifies CI config, and aligns the repo on Bun's native test infrastructure.

## Scope

### In Scope
- **apps/frontend** — 11 test files, setupTests.ts, vite.config.ts, package.json
- **packages/validations** — 1 test file, vite.config.ts (delete), package.json
- **packages/stoker** — 5 test files, package.json (add bun dep)

### Out of Scope
- **apps/backend** — already on bun test, no changes
- Test refactoring, new tests, or coverage improvements
- CI pipeline changes beyond test script names

## Capabilities

### New Capabilities
None — pure toolchain migration, no spec-level behavior changes.

### Modified Capabilities
None — no spec-level requirements change.

## Approach

1. **happy-dom via preload**: jsdom doesn't work in Bun. Install `@happy-dom/global-registrator`. Register DOM globals in a preload script loaded via `bunfig.toml` `[test.preload]`.
2. **Import removal**: Delete all `import { ... } from 'vitest'`. Bun provides `describe`, `test`, `expect`, `beforeEach`, `afterEach` as globals. `vi.fn`, `vi.spyOn`, `vi.mock`, `vi.clearAllMocks`, `vi.restoreAllMocks` available globally.
3. **`vi.stubGlobal` → `globalThis`**: 2 usages in setupTests.ts — assign directly to `globalThis.ResizeObserver`.
4. **`vi.mocked` → type assertion**: 3 usages in MapView test — replace with `as Mock` or explicit cast.
5. **Config cleanup**: Delete vitest blocks from `vite.config.ts`. Delete `packages/validations/vite.config.ts` entirely. Add `[test]` section to root `bunfig.toml`.
6. **Dependency cleanup**: Remove `vitest` from `apps/frontend/package.json` and `packages/validations/package.json`. Add `bun-types` to `packages/stoker/package.json` devDeps. Add `@happy-dom/global-registrator` as needed.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/frontend/src/**/*.test.tsx` (11) | Modified | Remove vitest imports, vi.mocked → casts |
| `apps/frontend/src/setupTests.ts` | Modified | vi.stubGlobal → globalThis, add happy-dom register |
| `apps/frontend/vite.config.ts` | Modified | Remove vitest test block |
| `apps/frontend/package.json` | Modified | Remove vitest dep, script → `bun test` |
| `packages/validations/**/*.test.ts` (1) | Modified | Remove vitest imports |
| `packages/validations/vite.config.ts` | Deleted | Standalone vitest config, no longer needed |
| `packages/validations/package.json` | Modified | Remove vitest dep, script → `bun test` |
| `packages/stoker/**/*.test.ts` (5) | Modified | Remove vitest imports |
| `packages/stoker/package.json` | Modified | Add bun-types, script → `bun test` |
| `bunfig.toml` | New/Modified | `[test]` section with preload scripts |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| happy-dom rendering differs from jsdom | Low | Run full suite, diff any failures against expected DOM queries |
| `vi.mock` hoisting semantics differ in Bun | Low | Isolate and verify mock behavior per test file |
| `@testing-library/jest-dom` type resolution | Med | Import from `jest-dom/vitest` or configure tsconfig refs |
| Preload script order with Turbo caching | Low | Verify `bun test` runs locally and via turbo |

## Rollback Plan

1. `git checkout` all changed files — every change is file-level and reversible.
2. Restore vitest deps and scripts in package.json files.
3. Revert `vite.config.ts` test blocks, restore deleted configs.
4. Remove `bunfig.toml` `[test]` section.
5. Verify tests pass with `bunx vitest run` in each affected package.

## Success Criteria

- [ ] `bun test` passes for all 3 packages (17 test files total)
- [ ] Zero `from 'vitest'` imports remain in the repo
- [ ] `vitest` removed from all package.json files
- [ ] `bun test` scripts execute correctly via turbo as well as standalone
