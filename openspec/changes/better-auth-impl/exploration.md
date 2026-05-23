## Exploration: Integration of better-auth into map-project backend

### Current State

The backend is a minimal Hono application using `@hono/zod-openapi`. It currently has no database setup, no authentication mechanism, and only a single root endpoint. The project is structured as a monorepo using Bun.

### Affected Areas

- `apps/backend/src/app.ts` — Needs to mount the `better-auth` handler and apply auth middleware to protected routes.
- `apps/backend/src/lib/auth.ts` (New) — Configuration for the `better-auth` instance.
- `apps/backend/src/middlewares/auth.ts` (New) — Middleware to verify sessions and inject user context.
- `apps/backend/package.json` — Addition of `better-auth` and database-related dependencies.
- Root/Backend `.env` — New environment variables for `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`.

### Approaches

1. **Stateless Session Management** — Use `better-auth` without a database, storing sessions in encrypted cookies.
   - Pros: Zero DB overhead, extremely fast setup.
   - Cons: Cannot easily revoke sessions, no persistent user data (unless using a separate DB for users), not suitable for complex auth needs (e.g., multi-device management).
   - Effort: Low

2. **Database-backed Session Management (Recommended)** — Integrate `better-auth` with a relational database (e.g., PostgreSQL via Drizzle).
   - Pros: Full control over sessions, persistence, support for all `better-auth` plugins, scalable.
   - Cons: Requires DB setup and migrations.
   - Effort: Medium

### Recommendation

**Approach 2: Database-backed Session Management**. Given that `map-project` is likely to grow, having a persistent store for users and sessions is critical. I recommend using **PostgreSQL** with **Drizzle ORM** due to its excellent TypeScript support and compatibility with Bun.

### Risks

- **CORS/Cookie Issues**: If the frontend and backend are served from different domains, secure cookie configuration (`SameSite`, `Secure`) will be critical.
- **Zod-OpenAPI Integration**: `better-auth` handles its own routing. Ensuring that the OpenAPI spec correctly reflects authenticated routes will require a custom middleware approach that doesn't interfere with the schema validation.
- **DB Migration**: Since there is no current DB, the initial schema setup must be handled carefully using the `better-auth` CLI or Drizzle migrations.

### Ready for Proposal

Yes. The orchestrator should proceed to the Proposal phase to define the specific DB choice, the exact middleware implementation, and the authentication flow.
