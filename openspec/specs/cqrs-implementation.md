# CQRS Implementation Specification

## Purpose
Implement a Logical CQRS (Command Query Responsibility Segregation) pattern in the backend to decouple write operations (Commands) from read operations (Queries). This ensures scalability for complex spatial queries and maintainability of domain logic.

## Requirements

### Requirement: Command Handler Pattern
The system MUST implement Command handlers as single-purpose functions that handle state changes.

#### Scenario: Create a Map
- GIVEN a valid map creation request (name, initial bounds)
- WHEN the `CreateMapCommand` is executed
- THEN the system SHALL persist the map in the database
- AND return the unique `mapId` of the created map.

#### Scenario: Update Marker Position
- GIVEN an existing marker ID and new coordinates
- WHEN the `UpdateMarkerCommand` is executed
- THEN the system SHALL update the coordinates in the database
- AND return a success confirmation.

### Requirement: Query Handler Pattern
The system MUST implement Query handlers as single-purpose functions optimized for data retrieval, returning specialized DTOs.

#### Scenario: Fetch Markers in Area
- GIVEN a map ID and a bounding box (north-east, south-west coordinates)
- WHEN the `GetMarkersInBoundsQuery` is executed
- THEN the system SHALL perform a spatial query to find all markers within those bounds
- AND return a list of `MarkerDTO` objects (excluding internal DB fields like `updatedAt`).

#### Scenario: Get Map Details
- GIVEN a valid map ID
- WHEN the `GetMapByIdQuery` is executed
- THEN the system SHALL retrieve the map and its associated metadata
- AND return a `MapDTO`.

### Requirement: DTO Decoupling
The system MUST use explicit Data Transfer Objects (DTOs) for all query responses to prevent DB schema leakage.

#### Scenario: Schema Change Protection
- GIVEN a change in the database column name for `map_description` to `description`
- WHEN a query is executed
- THEN the system SHALL map the new column name to the existing `description` field in the `MapDTO`
- AND the API response format SHALL remain unchanged.

### Requirement: Command Validation
All Command inputs MUST be validated using Zod schemas before being passed to the handler.

#### Scenario: Invalid Command Input
- GIVEN a `CreateMapCommand` request with a missing map name
- WHEN the request is processed by the Hono orchestrator
- THEN the system SHALL return a 400 Bad Request error with Zod validation details
- AND the Command handler MUST NOT be invoked.

### Requirement: Transactional Integrity
Commands that modify multiple records MUST be wrapped in a database transaction.

#### Scenario: Atomic Map Setup
- GIVEN a command to create a map and its initial default markers
- WHEN the command is executed
- THEN the system SHALL use `db.transaction` to ensure either all records are created or none are
- AND any failure during marker creation MUST rollback the map creation.

## Constraints
- **Performance**: Spatial queries in Query handlers MUST be optimized with database indexes.
- **Security**: Query handlers MUST verify that the requesting user has access to the requested `mapId`.
- **Response Format**: All CQRS handlers MUST return consistent JSON structures.
