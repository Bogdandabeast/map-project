/**
 * 🎓 LABORATORIO DE ARQUITECTURA: MÁQUINA DE ESTADOS PARA LOGIN
 *
 * Alumno: Principiante en React
 * Profesor: Senior Architect (El que te va a gritar si hacés código espagueti)
 *
 * OBJETIVO: Implementar el diseño de estado para evitar "estados imposibles".
 *
 * REGLA DE ORO: No busques la solución en Google. Pensá el flujo.
 * Si el estado es 'SUBMITTING', ¿puede haber errores de validación? No.
 * Si el estado es 'ERROR', ¿puede estar el botón en estado 'Cargando'? No.
 */

// =============================================================================
// 1. DEFINICIÓN DE ESTADOS
// =============================================================================
// Aquí definimos los "modos" en los que puede estar nuestra aplicación.
// Solo puede haber UNO activo a la vez.
export type AuthStatus = 'IDLE' | 'VALIDATING' | 'SUBMITTING' | 'ERROR' | 'SUCCESS'

export interface AuthState {
  status: AuthStatus
  email: string
  password: string
  // 💡 PROFE: ¿Qué pasa con los errores?
  // ¿Deberían ser un objeto como antes o algo más simple ahora que tenemos la Máquina de Estados?
  error: any
}

// =============================================================================
// 2. ESTADO INICIAL
// =============================================================================
// Este es el punto de partida. Cuando la página carga, ¿cómo se ve el mundo?
export const initialState: AuthState = {
  status: 'IDLE',
  email: '',
  password: '',
  error: null,
  // 🚩 TAREA: Completar el estado inicial si creés que falta algo.
}

// =============================================================================
// 3. ACCIONES (El "Qué pasó")
// =============================================================================
// Las acciones son mensajes que le enviamos al Reducer.
// NO dicen "cambiá el estado a X", dicen "Sucedió el evento Y".

// ✍️ TAREA: Definí aquí los tipos de acciones que necesitás.
// Ejemplo: type AuthAction = { type: 'SET_FIELD'; field: 'email' | 'password'; value: string } | ...
export interface AuthAction {
  type: string // 🚩 Cambiá 'string' por una unión de tipos real (ej: 'SET_FIELD' | 'START_LOGIN' | ...)
  payload?: any
}

// =============================================================================
// 4. EL REDUCER (El Cerebro)
// =============================================================================
// Esta función es PURA. Recibe (estado anterior, acción) -> devuelve (nuevo estado).
// NO debe tener efectos secundarios (no llames a la API aquí).

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_FIELD':
      // 💡 PROFE: Si el usuario escribe en un campo, ¿qué debería pasar con el estado 'ERROR'?
      // ¿Deberíamos seguir en estado 'ERROR' o volver a 'IDLE'?
      return {
        ...state,
        // Tu lógica acá
      }

    case 'START_LOGIN':
      // 💡 PROFE: Antes de ir a 'SUBMITTING', ¿tenemos que validar con Zod?
      // ¿Pasamos por 'VALIDATING' primero?
      return {
        ...state,
        // Tu lógica acá
      }

      // 🚩 TAREA: Agregá los casos para SUCCESS y FAIL.

    default:
      return state
  }
}

/**
 * 📝 NOTAS FINALES DEL PROFE:
 * 1. No te olvides de usar el operador spread (...state) para no borrar el resto del estado.
 * 2. Pensá en la transición: IDLE -> VALIDATING -> SUBMITTING -> (SUCCESS o ERROR).
 * 3. Si te trabás, preguntame, pero intentá razonar el flujo primero.
 */
