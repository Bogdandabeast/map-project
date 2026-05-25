# Proposal: CQRS Implementation in map-project

## Intent

The current backend architecture is linear and lacks a dedicated domain layer. As the project evolves into a map-centric application, the complexity of spatial queries (Reads) will differ vastly from geometry updates (Writes). 

Implementing Logical CQRS ensures that we don't end up with "God handlers" and allows us to optimize read and write paths independently. This follows the "Concepts > Code" philosophy by establishing a scalable architectural foundation before the codebase becomes rigid, preventing technical debt from the outset.

## Scope

### In Scope
- **Backend Application Layer**: Reorganizing `apps/backend/src` to support segregated handlers.
- **Module-based Organization**: Implementation of a `modules/` directory for domain-driven structure.
- **Handler Segregation**: Splitting business logic into Command (Write) and Query (Read) handlers.
- **DTO Layer**: Introduction of explicit Data Transfer Objects (DTOs) to decouple API contracts from DB schemas.

### Out of Scope
- **Physical DB Segregation**: No separate read/write databases (sharing the same PostgreSQL instance).
- **Frontend Changes**: UI changes are not part of this architectural shift.
- **Auth Refactoring**: `better-auth` integration remains as-is unless conflicts arise.

## Capabilities

### New Capabilities
- `backend-cqrs-structure`: The core infrastructure and patterns for implementing commands and queries across the backend.
- `map-domain-cqrs`: The specific CQRS implementation for the Maps domain, including the first set of handlers.

### Modified Capabilities
- None

## Approach

We will implement **Logical CQRS**. We segregate the responsibilities at the application layer while sharing the same database.

### Folder Structure
Modules will be organized by domain feature:
```text
apps/backend/src/modules/
└── maps/
    ├── commands/           # State changes (Insert/Update/Delete)
    │   └── {action}.handler.ts
    ├── queries/            # Data retrieval (Select)
    │   └── {action}.handler.ts
    ├── dtos/               # Input validation and output types
    │   ├── requests.ts
    │   └── responses.ts
    └── schema.ts           # Domain-specific Drizzle tables
```

### Technical Implementation
- **Commands**: Single-purpose functions focusing on state changes. They will use Drizzle's `insert`, `update`, and `delete` and return minimal data (e.g., IDs).
- **Queries**: Single-purpose functions optimized for retrieval. They will leverage Drizzle's Relational API and return specialized DTOs tailored for the UI.
- **Orchestration**: Hono route handlers will act as thin orchestrators: `Validate (Zod) -> Call Handler -> Return Response`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/backend/src/modules/` | New | Core domain logic resides here |
| `apps/backend/src/routes/` | Modified | Handlers delegated to CQRS handlers |
| `apps/backend/src/db/` | Modified | DB client shared with handlers |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **Over-engineering** | Medium | Apply the pattern only to domains with divergent read/write needs (e.g., Maps) |
| **Boilerplate Increase** | High | Establish strict naming conventions to ensure predictability and ease of navigation |

## Rollback Plan

Since this is a logical reorganization of code, the rollback involves:
1. Moving business logic from `modules/` back into the corresponding `routes/` handlers.
2. Deleting the `apps/backend/src/modules/` directory.

## Dependencies

- **Drizzle ORM**: Must be configured for relational queries in the Query handlers.
- **Zod**: Used for request validation before passing data to Command handlers.

## Success Criteria

- [ ] All map-related business logic is removed from route handlers.
- [ ] Route handlers are reduced to input validation and handler invocation.
- [ ] All query responses use DTOs, ensuring DB schema internals are not leaked to the client.
- [ ] The system maintains full functionality while following the new structure.
