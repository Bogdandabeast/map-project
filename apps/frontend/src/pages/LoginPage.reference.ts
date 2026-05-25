/**
 * 📖 REFERENCIA MAESTRA: MÁQUINA DE ESTADOS PARA LOGIN
 *
 * Este archivo es tu guía. Aquí aplicamos la filosofía de "Estados Mutuamente Excluyentes"
 * para eliminar bugs y hacer que la interfaz sea predecible.
 */

// =============================================================================
// 1. LOS ESTADOS (Modos de la aplicación)
// =============================================================================
// Definimos exactamente en qué "modo" puede estar el Login.
// No puede estar en dos a la vez.
export type AuthStatus
  = | 'IDLE' // Reposo: El usuario está escribiendo o acaba de entrar.
    | 'VALIDATING' // Validando: Estamos chequeando con Zod que los datos sean correctos.
    | 'ERROR' // Error: Algo falló (ya sea la validación o la API).
    | 'SUCCESS' // Éxito: El usuario entró, estamos redirigiendo.

// =============================================================================
// 2. EL ESTADO (Los datos)
// =============================================================================
export interface AuthState {
  status: AuthStatus
  email: string
  password: string
  error: string | null // Guardamos el mensaje de error si el status es 'ERROR'
}

// La "Foto" al segundo cero.
export const initialState: AuthState = {
  status: 'IDLE',
  email: '',
  password: '',
  error: null,
}

// =============================================================================
// 3. LAS ACCIONES (Los "Papelitos" / Mensajes)
// =============================================================================
// Usamos una "Unión Discrimidada". Esto es TypeScript puro y es lo que hace que
// el código sea seguro. Si el tipo es 'SET_FIELD', TS sabe que DEBE existir un 'field' y un 'value'.
export type AuthAction
  = | { type: 'SET_FIELD', field: 'email' | 'password', value: string }
    | { type: 'START_LOGIN' }
    | { type: 'LOGIN_SUCCESS' }
    | { type: 'LOGIN_FAIL', message: string }

// =============================================================================
// 4. EL REDUCER (El Cerebro)
// =============================================================================
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_FIELD':
      // 💡 LÓGICA DE ARQUITECTO:
      // Si el usuario empieza a escribir, significa que está intentando corregir el error.
      // Por lo tanto, automáticamente volvemos al estado 'IDLE' y borramos el error.
      return {
        ...state,
        [action.field]: action.value,
        status: 'IDLE',
        error: null,
      }

    case 'START_LOGIN':
      // Iniciamos el proceso. Primero pasamos por 'VALIDATING'.
      // Borramos errores previos para que la UI esté limpia.
      return {
        ...state,
        status: 'VALIDATING',
        error: null,
      }

    case 'LOGIN_SUCCESS':
      // Todo salió bien. Pasamos a 'SUCCESS'.
      // En la UI, esto podría disparar una animación de check verde o la redirección.
      return {
        ...state,
        status: 'SUCCESS',
        error: null,
      }

    case 'LOGIN_FAIL':
      // Algo falló. Pasamos a 'ERROR' y guardamos el mensaje.
      // Ahora la UI sabe que debe mostrar el cuadro rojo de error.
      return {
        ...state,
        status: 'ERROR',
        error: action.message,
      }

    default:
      // Si llega una acción que no conocemos, devolvemos el estado tal cual.
      return state
  }
}

/**
 * 🎓 RESUMEN PARA EL ALUMNO:
 *
 * ¿Viste que no hay ningún "if (isLoading)" o "if (hasError)" esparcido por el código?
 * Todo se resume a:
 *
 * 1. Sucedió un evento -> Se dispara una Acción.
 * 2. El Reducer recibe la Acción -> Cambia el Estado.
 * 3. La UI mira el Estado -> Se dibuja sola.
 *
 * Esto es Programación Declarativa.
 */
