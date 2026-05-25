# Design: Logical CQRS Implementation

## Technical Approach

The implementation will follow a **Logical CQRS (Command Query Responsibility Segregation)** pattern. We will segregate the application logic into **Commands** (write operations that change state) and **Queries** (read operations that retrieve data). 

This segregation happens at the application layer within the `apps/backend/src/modules/` directory. While the system will continue to use a single PostgreSQL database via Drizzle ORM, the paths for reading and writing will be decoupled. This prevents the emergence of "God handlers" in the routing layer and allows for independent optimization of read-heavy spatial queries and write-heavy geometry updates.

The orchestration will be handled by "thin" Hono route handlers that perform three steps:
1. **Validate**: Use Zod schemas to ensure input integrity.
2. **Execute**: Delegate business logic to a specific Command or Query handler.
3. **Respond**: Map the result to a JSON response.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|------------|
| **Handler Pattern** | Functional Handlers | Class-based Handlers | Functions are more lightweight, easier to test, and align with Hono's functional style. |
| **Module Structure** | Feature-based (Domain) | Layer-based (Technical) | Organizing by feature (e.g., `maps/`) improves discoverability and scalability as new domains are added. |
| **DTO Strategy** | Explicit TS Types + Zod | Direct DB Entity Leak | Decoupling ensures that database schema changes (e.g., renaming a column) don't break the public API contract. |
| **Transaction Mgmt** | Handler-level Transactions | Middleware Transactions | Transactions are domain-specific. Placing them in Command handlers ensures atomic operations only where necessary. |

## Data Flow

```text
HTTP Request ──→ Hono Route ──→ Zod Validator ──→ Command/Query Handler ──→ Drizzle ORM ──→ PostgreSQL
                                                                              │
                                                                              ▼
HTTP Response ←── Hono Response ←── JSON Mapper ←── DTO Mapping ←─────────────┘
```

1. **Request**: Client sends an HTTP request to a Hono route.
2. **Validation**: A Zod validator middleware ensures the request body/params match the expected `RequestDTO`.
3. **Delegation**: The route handler calls the corresponding handler from `modules/{domain}/commands` or `modules/{domain}/queries`.
4. **Persistence/Retrieval**: The handler interacts with the DB using Drizzle ORM.
5. **Transformation**: The DB entity is mapped to a `ResponseDTO` to remove internal fields (e.g., `updated_at`, `internal_id`).
6. **Response**: Hono returns the DTO as JSON.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/backend/src/modules/` | Create | Root directory for domain-driven modules |
| `apps/backend/src/modules/maps/` | Create | Maps domain module |
| `apps/backend/src/modules/maps/commands/` | Create | Folder for write handlers |
| `apps/backend/src/modules/maps/queries/` | Create | Folder for read handlers |
| `apps/backend/src/modules/maps/dtos/` | Create | Folder for request/response types |
| `apps/backend/src/modules/maps/schema.ts` | Create | Drizzle table definitions for the Maps domain |
| `apps/backend/src/routes/maps.ts` | Modify | Refactor to use CQRS handlers instead of inline logic |

## Interfaces / Contracts

### Handler Signatures
We will use functional types to define our handlers to ensure consistency across modules.

```typescript
// apps/backend/src/modules/base.ts (or similar utility)
export type CommandHandler<TCommand, TResult> = (command: TCommand) => Promise<TResult>;
export type QueryHandler<TQuery, TResult> = (query: TQuery) => Promise<TResult>;
```

### Example: Maps Module
**DTOs (`apps/backend/src/modules/maps/dtos/requests.ts`)**
```typescript
import { z } from 'zod';

export const CreateMapSchema = z.object({
  name: z.string().min(1),
  bounds: z.object({
    northEast: z.object({ lat: z.number(), lng: z.number() }),
    southWest: z.object({ lat: z.number(), lng: z.number() }),
  }),
});

export type CreateMapRequest = z.infer<typeof CreateMapSchema>;
```

**Command Handler (`apps/backend/src/modules/maps/commands/create-map.handler.ts`)**
```typescript
import { db } from '@/db';
import { maps } from '../schema';
import { CreateMapRequest } from '../dtos/requests';
import { CommandHandler } from '@/modules/base';

export const createMapHandler: CommandHandler<CreateMapRequest, { id: string }> = async (data) => {
  const [result] = await db.insert(maps).values({
    name: data.name,
    bounds: data.bounds,
  }).returning({ id: maps.id });
  
  return { id: result.id };
};
```

**Query Handler (`apps/backend/src/modules/maps/queries/get-map-by-id.handler.ts`)**
```typescript
import { db } from '@/db';
import { maps } from '../schema';
import { eq } from 'drizzle-orm';
import { MapDTO } from '../dtos/responses';
import { QueryHandler } from '@/modules/base';

export const getMapByIdHandler: QueryHandler<{ id: string }, MapDTO | null> = async ({ id }) => {
  const map = await db.query.maps.findFirst({
    where: eq(maps.id, id),
  });

  if (!map) return null;

  return {
    id: map.id,
    name: map.name,
    bounds: map.bounds,
  };
};
```

## Drizzle Implementation Guide

### Write Operations (Commands)
- Use `insert`, `update`, and `delete` exclusively.
- Always use `.returning()` to get the updated state or IDs.
- **Transactions**: For multi-table updates, wrap the logic:
  ```typescript
  await db.transaction(async (tx) => {
    const map = await tx.insert(maps).values(...).returning();
    await tx.insert(markers).values({ mapId: map[0].id, ... });
  });
  ```

### Read Operations (Queries)
- Use `db.query` (Relational API) for complex fetches with joins.
- Use `db.select().from().where()` for high-performance, specific column retrieval.
- **DTO Mapping**: Never return the Drizzle entity directly. Map it to a Response DTO to hide DB internals.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Unit** | Command/Query Handlers | Mock `db` instance and verify logic/mappings. |
| **Integration**| Database Interactions | Run handlers against a test PostgreSQL container. |
| **E2E** | API Endpoints | Use `app.request()` to verify Route $\rightarrow$ Handler $\rightarrow$ DB flow. |

## Migration / Rollout

1. **Infrastructure**: Create `apps/backend/src/modules/` and base types.
2. **Pilot Module**: Implement the `Maps` domain first as a proof of concept.
3. **Route Migration**: Move existing map-related logic from `routes/` to `modules/maps/`.
4. **Expansion**: Apply the pattern to other domains (`Markers`, `Users`) as they are developed.

## Open Questions

- [ ] Should we implement a generic `CommandBus` or `QueryBus` for dependency injection, or keep it as direct function calls for simplicity? (Current decision: Direct calls to minimize boilerplate).
- [ ] How to handle global error mapping? (Proposed: Hono `onError` middleware mapping domain errors to HTTP status codes).
