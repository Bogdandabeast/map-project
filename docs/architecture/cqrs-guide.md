# CQRS Implementation Guide — Map-Project

This guide explains how to implement and extend the **Logical CQRS (Command Query Responsibility Segregation)** pattern used in the backend. Use this to add new features, entities, or modify existing ones without breaking the architectural boundaries.

## 🎯 Core Concept
We separate **Writes (Commands)** from **Reads (Queries)**.
- **Commands**: Change state. They validate the intent and ensure integrity.
- **Queries**: Retrieve data. They are optimized for performance and return DTOs.
- **Thin Routes**: Hono routes only orchestrate; they don't contain business logic.

---

## 🚀 Quick Path: Adding a New Feature
Follow these steps in order to add a new entity or functionality.

1. **Schema**: Define the table in `apps/backend/src/modules/[feature]/schema.ts`.
2. **DTOs**: Create request/response shapes in `apps/backend/src/modules/[feature]/dtos/`.
3. **Command**: Implement the logic in `apps/backend/src/modules/[feature]/commands/[action].handler.ts`.
4. **Query**: Implement the retrieval in `apps/backend/src/modules/[feature]/queries/[action].handler.ts`.
5. **Route**: Connect everything in `apps/backend/src/routes/[feature].ts`.
6. **Test**: Write an integration test in `apps/backend/src/tests/api/[feature].test.ts`.

---

## 🛠️ Detailed Implementation

### 1. Defining Entities (Drizzle)
All domain schemas live in the module folder.
**Example:** `apps/backend/src/modules/maps/schema.ts`
- Use Drizzle for type-safe schemas.
- Ensure all tables are registered in `apps/backend/src/db/index.ts`.

### 2. DTOs & Validation (Zod)
Never return database entities directly to the client. Use DTOs to decouple the API from the DB.
- **Requests**: Use Zod schemas for input validation.
- **Responses**: Define TS types for the exact shape the frontend expects.
- **Location**: `apps/backend/src/modules/[feature]/dtos/`

### 3. Command Handlers (The "Writes")
Commands should be atomic and focused on a single action.
- **Pattern**: `export const [action]Handler: CommandHandler<TRequest, TResult> = async (data) => { ... }`
- **Rule**: If the operation is complex, wrap it in a transaction.
- **Location**: `apps/backend/src/modules/[feature]/commands/`

### 4. Query Handlers (The "Reads")
Queries should be read-only and optimized for the UI.
- **Pattern**: `export const [action]Handler: QueryHandler<TRequest, TResult> = async (data) => { ... }`
- **Rule**: Return DTOs, not Drizzle entities.
- **Location**: `apps/backend/src/modules/[feature]/queries/`

### 5. API Routes (Hono Thin Handlers)
Routes should only handle HTTP concerns.
**Example Flow:**
```typescript
app.post('/maps', zValidator('json', CreateMapSchema), async (c) => {
  const data = c.req.valid('json');
  const result = await createMapHandler(data);
  return c.json(result, 201);
});
```
- **Location**: `apps/backend/src/routes/`

### 6. Middlewares
Middlewares are used for cross-cutting concerns (Auth, Logging, Rate Limiting).
- **Global**: Defined in `apps/backend/src/app.ts`.
- **Route-specific**: Passed as an argument to the route definition.
- **Integration**: Handlers should assume that middleware has already handled authentication/authorization.

---

## 🧪 Testing Strategy

### Unit Tests (Handlers)
Every handler must have a corresponding test.
- **Location**: `apps/backend/src/modules/[feature]/__tests__/`
- **Focus**: Test edge cases, validation errors, and success paths.

### Integration Tests (API)
Verify the full request-response cycle.
- **Location**: `apps/backend/src/tests/api/`
- **Setup**: Use a dedicated Test Database.
- **Cleanup**: Use `beforeEach` to clear tables for determinism.

---

## ✅ Checklist for Reviewers
- [ ] Is business logic inside a Handler (not in the route)?
- [ ] Does the Command use Zod validation?
- [ ] Does the Query return a DTO (not a DB entity)?
- [ ] Are there corresponding unit tests for new handlers?
- [ ] Does the integration test use a clean state?
