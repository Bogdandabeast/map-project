# Design: Backend Technical Debt Professionalization

## Technical Approach

This change focuses on improving the production-readiness of the backend by implementing a graceful shutdown sequence and enhancing environment configuration validation. 

The approach maps to the proposal by centralizing the lifecycle management in `app.ts` and moving the `TRUSTED_ORIGINS` parsing logic directly into the Zod schema via transformations.

## Architecture Decisions

### Decision: Graceful Shutdown Coordination

**Choice**: Implement a `gracefulShutdown` coordinator in `app.ts` triggered by `SIGTERM` and `SIGINT`.
**Alternatives considered**: Using a dedicated lifecycle library (e.g., `lifecycle.js`).
**Rationale**: The current requirements are simple enough that a native implementation using `process.on` and `Promise.race` for timeouts is sufficient and avoids adding unnecessary dependencies.

### Decision: Config Parsing with Zod Transform

**Choice**: Use `.transform()` in the `envSchema` for `TRUSTED_ORIGINS`.
**Alternatives considered**: Keeping the manual mapping inside `validateConfig`.
**Rationale**: Moving transformation into the schema ensures that the `config` object is fully validated and transformed at the point of parsing, providing a single source of truth for the configuration's shape and content.

### Decision: Explicit Server Management

**Choice**: Replace `export default app` with explicit `Bun.serve` call and named exports for both `app` and `server`.
**Alternatives considered**: Keeping `export default app` and relying on Bun's automatic server startup.
**Rationale**: `Bun.serve` is required to obtain the server instance, which is necessary to call `.stop()` during the graceful shutdown sequence. This will require updating test imports.

## Data Flow

### Shutdown Sequence

```
Signal (SIGTERM/SIGINT) ──→ gracefulShutdown()
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ 1. server.stop()         │
                    │ 2. pool.end()            │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                        Process Exit (0 or 1)
```

### Config Validation Flow

```
process.env ──→ envSchema.parse() ──→ [Transform TRUSTED_ORIGINS] ──→ config object
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/backend/src/db/index.ts` | Modify | Export the `pool` instance to allow closing it during shutdown. |
| `apps/backend/src/config.ts` | Modify | Update `envSchema` with `.transform()` for `TRUSTED_ORIGINS` and simplify `validateConfig`. |
| `apps/backend/src/app.ts` | Modify | Replace default export with `Bun.serve`, implement `gracefulShutdown` and signal handlers. |
| `apps/backend/tests/auth.test.ts` | Modify | Update import from `app` to named import `{ app }`. |
| `apps/backend/tests/index.test.ts` | Modify | Update import from `app` to named import `{ app }`. |

## Interfaces / Contracts

### Shutdown Coordinator

```typescript
async function gracefulShutdown(signal: string): Promise<void> {
  // 1. server.stop()
  // 2. pool.end()
  // 3. process.exit(0)
}
```

### Config Schema Transformation

```typescript
TRUSTED_ORIGINS: z.string()
  .default('http://localhost:5173')
  .transform((val) => 
    val.split(',')
       .map((o) => o.trim())
       .filter((o) => o.length > 0)
  ),
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Config transformation | Test `validateConfig` with various `TRUSTED_ORIGINS` strings (empty, whitespace, malformed). |
| Integration | Graceful shutdown | Manually send `SIGTERM` to the process and verify DB connections are closed and process exits. |
| E2E | App startup | Ensure the server still responds to requests after changing the export structure. |

## Migration / Rollout

No migration required.
