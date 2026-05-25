# Tasks: CQRS Implementation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450-550 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation & Domain $\rightarrow$ PR 2: Routing & Integration |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation & Domain | PR 1 | Implements base types, schema, DTOs and all Command/Query handlers. |
| 2 | Routing & Integration | PR 2 | Refactors Hono routes to use handlers and adds full test suite. |

## Phase 1: Foundation & Infrastructure

- [ ] 1.1 Create `apps/backend/src/modules/base.ts` defining `CommandHandler<TCommand, TResult>` and `QueryHandler<TQuery, TResult>` functional types.
- [ ] 1.2 Create directory structure `apps/backend/src/modules/maps/` with subdirectories `commands/`, `queries/`, and `dtos/`.

## Phase 2: Schema & DTOs

- [ ] 2.1 Define `maps` and `markers` tables in `apps/backend/src/modules/maps/schema.ts` using Drizzle ORM.
- [ ] 2.2 Create `apps/backend/src/modules/maps/dtos/requests.ts` with Zod schemas for `CreateMapSchema` and `UpdateMarkerSchema`.
- [ ] 2.3 Create `apps/backend/src/modules/maps/dtos/responses.ts` with `MapDTO` and `MarkerDTO` TypeScript types to decouple API from DB schema.

## Phase 3: Command Implementation (Writes)

- [ ] 3.1 Implement `createMapHandler` in `apps/backend/src/modules/maps/commands/create-map.handler.ts` to persist a map and return its ID.
- [ ] 3.2 Implement `updateMarkerHandler` in `apps/backend/src/modules/maps/commands/update-marker.handler.ts` to update marker coordinates.
- [ ] 3.3 Implement `setupMapHandler` in `apps/backend/src/modules/maps/commands/setup-map.handler.ts` using `db.transaction` for atomic map and initial marker creation.

## Phase 4: Query Implementation (Reads)

- [ ] 4.1 Implement `getMapByIdHandler` in `apps/backend/src/modules/maps/queries/get-map-by-id.handler.ts` returning a `MapDTO`.
- [ ] 4.2 Implement `getMarkersInBoundsHandler` in `apps/backend/src/modules/maps/queries/get-markers-in-bounds.handler.ts` using spatial filtering to return a list of `MarkerDTO`.

## Phase 5: Routing & Integration

- [x] 5.1 Refactor `apps/backend/src/routes/maps.ts`: integrate `zValidator` and `createMapHandler` for `POST /maps`.
- [x] 5.2 Refactor `apps/backend/src/routes/maps.ts`: integrate `getMapByIdHandler` for `GET /maps/:id`.
- [x] 5.3 Refactor `apps/backend/src/routes/maps.ts`: integrate `getMarkersInBoundsHandler` for `GET /maps/:id/markers`.

## Phase 6: Testing & Verification

- [x] 6.1 Create unit tests in `apps/backend/src/modules/maps/__tests__/handlers.test.ts` verifying handler logic using a mocked database.
- [x] 6.2 Create integration tests in `apps/backend/src/modules/maps/__tests__/spatial.test.ts` verifying the correctness of spatial queries.
- [x] 6.3 Create E2E tests in `apps/backend/src/tests/api/maps.test.ts` using `app.request()` to verify the Route $\rightarrow$ Handler $\rightarrow$ DB flow.
