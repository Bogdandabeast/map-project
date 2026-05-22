## Exploration: Technical Debt Professionalization

### Current State
The project has several "quick-and-dirty" implementations that need professionalization to ensure production readiness and maintainability.

#### 1. Frontend Notifications
Currently, the frontend relies on the native browser `alert()` function for error reporting (e.g., in `AuthHeader.tsx`). There is no centralized or reusable notification/toast system, leading to a poor user experience and inconsistent error handling.

#### 2. Backend Lifecycle
The backend uses Bun's automatic Hono server startup. While convenient, there is no explicit handling of process termination signals (`SIGTERM`, `SIGINT`). Specifically, the Postgres connection pool in `db/index.ts` is not closed gracefully when the server stops, which can lead to hanging connections or improper resource cleanup.

#### 3. Config Parsing
The `TRUSTED_ORIGINS` environment variable is parsed using a simple `.split(',').map(o => o.trim())` in `config.ts`. This implementation is naive as it does not filter out empty strings, potentially allowing invalid origins in the trusted list if the environment variable contains trailing or double commas.

### Affected Areas
- `apps/frontend/src/components/auth/AuthHeader.tsx` — Uses `alert()` for sign-out errors.
- `apps/backend/src/app.ts` — Entry point where graceful shutdown handlers should be implemented.
- `apps/backend/src/db/index.ts` — Manages the `pg.Pool` that requires graceful shutdown.
- `apps/backend/src/config.ts` — Contains the `TRUSTED_ORIGINS` parsing logic.

### Approaches

#### 1. Incremental Patching
Apply minimal fixes to each area: add a basic filter to config parsing, add a simple `process.on` for DB closing, and use a basic toast library in frontend.
- Pros: Very fast to implement, low risk of regression.
- Cons: Doesn't establish a scalable pattern for future notifications or lifecycle management.
- Effort: Low.

#### 2. Architectural Professionalization (Recommended)
Implement robust, scalable patterns:
- **Frontend**: Create a `NotificationProvider` using React Context and a custom `useToast` hook for consistent notifications across the app.
- **Backend**: Implement a centralized `ShutdownManager` or standard signal handling in `app.ts` to ensure all resources (DB pool, HTTP server) are closed in the correct order.
- **Config**: Refactor `envSchema` in `config.ts` to use Zod's `.transform()` for `TRUSTED_ORIGINS`, including filtering of empty values and optional URL validation for each entry.
- Pros: High maintainability, production-grade stability, better developer experience.
- Cons: Slightly more initial implementation time.
- Effort: Medium.

### Recommendation
**Architectural Professionalization**. This approach moves the project from "prototype" to "production-ready" by establishing clear patterns for cross-cutting concerns like notifications, resource lifecycles, and configuration validation.

### Risks
- **Frontend**: Introducing a new provider might cause a minor re-render of the app tree if not implemented carefully.
- **Backend**: Incorrect signal handling could potentially conflict with Bun's internal process management in certain deployment environments.

### Ready for Proposal
Yes. The orchestrator should proceed to `sdd-propose` to define the specific implementation details for the notification provider, graceful shutdown logic, and Zod config transformation.
