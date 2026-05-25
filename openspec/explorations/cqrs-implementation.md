# Exploration: CQRS Implementation in map-project

## Current Architecture Analysis
The current backend architecture is a minimal Hono application using Drizzle ORM. 

- **Structure**: The project is a Bun monorepo. The backend is located in `apps/backend`.
- **Data Handling**: Currently, the app is focused on authentication (via `better-auth`). Data access is handled directly through Drizzle ORM, with a shared database connection pool.
- **Flow**: The flow is linear: `HTTP Request` $\rightarrow$ `Hono Handler` $\rightarrow$ `Drizzle Query` $\rightarrow$ `PostgreSQL`.
- **Observations**: There is no separate service or domain layer. Logic is (or will be) embedded directly in the route handlers. While sufficient for auth, this will become a bottleneck as complex map-related domain logic (geometry, spatial queries, multi-table updates) is added.

## Proposed CQRS Design

I propose a **Logical CQRS** approach. We will segregate the "Write" (Commands) and "Read" (Queries) responsibilities at the application layer, while sharing the same database for now.

### Folder Structure Example
I recommend organizing by feature (modules) rather than by technical role (controllers/services).

```text
apps/backend/src/modules/
└── maps/
    ├── commands/
    │   ├── create-map.handler.ts      # Logic for creating a map
    │   ├── update-map-bounds.handler.ts # Logic for updating geometry
    │   └── index.ts                   # Command dispatcher/exports
    ├── queries/
    │   ├── get-map-by-id.handler.ts   # Optimized read for single map
    │   ├── search-maps.handler.ts     # Complex search/filter logic
    │   └── index.ts                   # Query dispatcher/exports
    ├── dtos/
    │   ├── requests.ts                # Zod schemas for command input
    │   └── responses.ts               # Types for query output
    └── schema.ts                      # Drizzle table definitions for Maps
```

### Implementation Details
- **Commands**: 
    - Focus on **State Changes**.
    - Each command is a single-purpose function/class.
    - Uses Drizzle's `insert`, `update`, and `delete` methods.
    - Returns minimal data (e.g., the ID of the created resource or a success boolean).
- **Queries**:
    - Focus on **Data Retrieval**.
    - Each query is a single-purpose function.
    - Leverages Drizzle's `select` and `db.query` (Relational API) for efficient fetching.
    - Returns specialized DTOs (Data Transfer Objects) tailored for the UI, avoiding leaking DB internals.
- **Hono Integration**:
    - Route handlers act as "orchestrators". They validate input via Zod, call the appropriate command or query handler, and return the response.

## Implementation Strategy

1. **Module Identification**: Define the primary domains of the map project (e.g., `Maps`, `Markers`, `Layers`, `Users`).
2. **Handler Pattern Adoption**: Implement the first feature (e.g., `Maps`) using the `commands/` and `queries/` split.
3. **DTO Layer**: Create explicit request and response types to decouple the database schema from the API contract.
4. **Drizzle Specialization**: 
    - Use `db.transaction` strictly within Command handlers.
    - Use optimized `select` statements with specific columns in Query handlers.
5. **Gradual Migration**: As new features are added, apply this pattern. Refactor existing CRUD only when the complexity justifies it.

## Tradeoffs and Risks

| Aspect | Traditional CRUD | Proposed CQRS | Impact |
|---------|------------------|----------------|--------|
| **Boilerplate** | Low | Medium | More files and interfaces to manage. |
| **Cognitive Load** | Low (initially) | Medium | Developers must decide if a task is a Command or a Query. |
| **Maintainability**| Harder as logic grows | Higher | Read and write paths can evolve independently. |
| **Performance** | Generic | Optimized | Queries can be tuned for specific UI views without affecting writes. |
| **Testing** | Integration-heavy | Unit-friendly | Handlers can be tested in isolation from the HTTP layer. |

**Risks**:
- **Over-engineering**: For very simple tables, this might feel like overkill.
- **Consistency**: Since we are using a single DB, we have strong consistency, but if we move to separate read-models later, we'll have to handle eventual consistency.

## Recommendation: GO

**Reasoning**: 
Given that this is a "map-project", the read patterns (spatial queries, bounding box filters) will diverge significantly from the write patterns (complex geometry updates, permission checks). Implementing a logical CQRS structure now provides a scalable foundation without the operational overhead of separate databases. It enforces a clean separation of concerns that will prevent the `app.ts` from becoming a "god file".

**Next Step**: Proceed to `sdd-propose` to define the exact types and interfaces for the first module.
