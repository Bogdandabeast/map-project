# Guía de Implementación de Máquinas de Estados Finitos (FSM)

## Resumen
Para eliminar las condiciones de carrera (race conditions), los destellos de interfaz (UI flickers) y los estados inconsistentes, el frontend ha transicionado de una gestión de estado implícita (uso fragmentado de `useState` y `useEffect`) a un patrón explícito de **Máquina de Estados Finitos (FSM)**.

Esta guía explica la arquitectura y proporciona un modelo para implementar nuevas funcionalidades utilizando FSMs.

---

## 1. Arquitectura Core

### El Hook `useMachine`
El corazón del sistema es la utilidad `useMachine` ubicada en `apps/frontend/src/hooks/useMachine.ts`. Es un envoltorio (wrapper) tipado sobre `useReducer` que obliga a que las transiciones de estado sigan una configuración predefinida.

### El Plano de la FSM
Cada máquina se compone de tres partes:
1.  **Estados (States)**: Una unión discriminada que representa todos los estados mutuamente excluyentes de la funcionalidad.
2.  **Eventos (Events)**: Una unión discriminada que representa todas las acciones posibles que pueden disparar una transición.
3.  **Reducer**: Una función pura que toma el `estado actual` + `evento` $\rightarrow$ `nuevo estado`.

### Seguridad de Tipos (Uniones Discriminadas)
Utilizamos uniones discriminadas de TypeScript para asegurar que la UI solo acceda a los datos disponibles en el estado actual.

```typescript
type State = 
  | { type: 'IDLE' } 
  | { type: 'LOADING' } 
  | { type: 'SUCCESS', data: string } 
  | { type: 'ERROR', message: string };
```
Si `state.type` es `'SUCCESS'`, TypeScript permite el acceso a `state.data`. Si es `'IDLE'`, intentar acceder a `state.data` provocará un error de compilación.

---

## 2. Implementaciones Existentes

### Máquina de Sesión (`sessionMachine.ts`)
- **Propósito**: Gestiona la sesión global de autenticación (Initializing $\rightarrow$ Authenticated/Anonymous).
- **Solución**: Eliminó el "flicker" donde la pantalla de login aparecía brevemente antes de detectar una sesión activa.

### Máquina de Inicialización del Mapa (`mapInitMachine.ts`)
- **Propósito**: Gestiona el ciclo de vida complejo del mapa (Carga de Assets $\rightarrow$ Instanciación $\rightarrow$ Listo).
- **Solución**: Evita que el mapa intente renderizarse antes de que el controlador de OpenLayers esté completamente inicializado.

### Máquina de Formularios de Auth (`authFormMachine.ts`)
- **Propósito**: Gestiona los flujos de Login y Signup (Idle $\rightarrow$ Validando $\rightarrow$ Enviando $\rightarrow$ Éxito/Error).
- **Solución**: Previno envíos duplicados y manejó los errores de validación de forma determinista.

---

## 3. Cómo implementar una nueva funcionalidad con FSM

Sigue estos pasos para implementar una nueva feature con estado:

### Paso 1: Definir Estados y Eventos
Crea un nuevo archivo (ej. `featureMachine.ts`). Define tus uniones. Pregúntate: *"¿Cuáles son los estados mutuamente excluyentes de esta funcionalidad?"*

```typescript
export type FeatureState = 
  | { type: 'IDLE' }
  | { type: 'PROCESSING' }
  | { type: 'COMPLETED', result: any }
  | { type: 'FAILED', error: string };

export type FeatureEvent = 
  | { type: 'START' }
  | { type: 'RESOLVE', result: any }
  | { type: 'REJECT', error: string }
  | { type: 'RESET' };
```

### Paso 2: Implementar el Reducer Puro
El reducer debe ser una función pura. **No realices llamadas a API ni efectos secundarios dentro del reducer.**

```typescript
export function featureReducer(state: FeatureState, event: FeatureEvent): FeatureState {
  switch (state.type) {
    case 'IDLE':
      return event.type === 'START' ? { type: 'PROCESSING' } : state;
    case 'PROCESSING':
      if (event.type === 'RESOLVE') return { type: 'COMPLETED', result: event.result };
      if (event.type === 'REJECT') return { type: 'FAILED', error: event.error };
      return state;
    case 'FAILED':
      return event.type === 'START' ? { type: 'PROCESSING' } : state;
    // ... otros casos
    default:
      return state;
  }
}
```

### Paso 3: Crear la Configuración de la Máquina
```typescript
import { MachineConfig } from '../hooks/useMachine';

export const featureMachine: MachineConfig<FeatureState, FeatureEvent> = {
  initialState: { type: 'IDLE' },
  reducer: featureReducer,
};
```

### Paso 4: Integrar en el Componente
```tsx
import { useMachine } from '../hooks/useMachine';
import { featureMachine } from './featureMachine';

export function FeatureComponent() {
  const [state, send] = useMachine(featureMachine);

  const handleAction = async () => {
    send({ type: 'START' });
    try {
      const result = await apiCall();
      send({ type: 'RESOLVE', result });
    } catch (e) {
      send({ type: 'REJECT', error: e.message });
    }
  };

  return (
    <div>
      {state.type === 'PROCESSING' && <Spinner />}
      {state.type === 'FAILED' && <Error message={state.error} />}
      <button disabled={state.type === 'PROCESSING'} onClick={handleAction}>
        Ejecutar Acción
      </button>
    </div>
  );
}
```

---

## 4. Buenas Prácticas y Guías

1.  **TDD Estricto**: Escribe siempre los tests unitarios del reducer primero. Al ser una función pura, debe tener una cobertura del 100%.
2.  **Sin Efectos Secundarios en Reducers**: Los reducers solo calculan el *siguiente estado*. Los efectos secundarios (llamadas a API, temporizadores) ocurren en el componente/hook y disparan eventos mediante `send()`.
3.  **Verificación Exhaustiva**: Asegúrate de que cada estado maneje cada evento (aunque sea devolviendo el estado actual) para evitar comportamientos indefinidos.
4.  **Bloqueo de UI**: Deshabilita siempre los botones de acción/inputs cuando la máquina esté en un estado transitorio (ej. `SUBMITTING`, `LOADING`, `PROCESSING`).
5.  **Inmutabilidad**: Nunca mutes el objeto de estado directamente. Devuelve siempre un nuevo objeto desde el reducer.
