# Map Initialization FSM (`map-init-fsm`)

### Purpose
Coordinate the multi-step asynchronous initialization of the OpenLayers map to prevent race conditions.

### States
- `UNINITIALIZED`: Initial state before any loading begins.
- `LOADING_ASSETS`: Dynamically importing `MapModelAdapter` and `MapController`.
- `INSTANTIATING`: Creating the controller instance with the loaded model.
- `READY`: Map is fully instantiated and rendered.
- `ERROR`: A failure occurred during any step of the process.

### Events
- `START_INIT`: Triggered on component mount.
- `ASSETS_LOADED`: Triggered when dynamic imports complete.
- `CONTROLLER_READY`: Triggered when the controller is instantiated.
- `INIT_FAILED`: Triggered on any exception.

### Transition Table
| Current State | Event | Next State | Side Effect |
|---------------|-------|------------|-------------|
| `UNINITIALIZED` | `START_INIT` | `LOADING_ASSETS` | Begin dynamic imports of adapter and controller |
| `LOADING_ASSETS` | `ASSETS_LOADED` | `INSTANTIATING` | Instantiate `MapModelAdapter` and `MapController` |
| `INSTANTIATING` | `CONTROLLER_READY` | `READY` | Call `controller.createMap()` |
| `ANY` | `INIT_FAILED` | `ERROR` | Log error and show error UI |

### Invalid Transitions
- `START_INIT` must be ignored if the state is `LOADING_ASSETS`, `INSTANTIATING`, or `READY`.

### Scenarios
#### Scenario: Happy Path Initialization
- GIVEN the state is `UNINITIALIZED`
- WHEN `START_INIT` is triggered
- THEN the state MUST transition to `LOADING_ASSETS`
- WHEN assets are loaded
- THEN the state MUST transition to `INSTANTIATING`
- WHEN the controller is ready
- THEN the state MUST transition to `READY`
- AND the map MUST be rendered in the container.

#### Scenario: Asset Load Failure
- GIVEN the state is `LOADING_ASSETS`
- WHEN a dynamic import fails
- THEN the state MUST transition to `ERROR`
- AND an error message MUST be displayed to the user.
