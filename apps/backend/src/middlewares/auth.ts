import type { Context, Next } from 'hono'
import { auth } from '../lib/auth'

/**
 * authMiddleware - El Guardia de la Aplicación
 *
 * Este middleware intercepta las peticiones a rutas protegidas.
 * Verifica si existe una sesión válida a través de better-auth.
 * Si la sesión es válida, inyecta el usuario y la sesión en el contexto.
 * Si no, bloquea la petición con un 401 Unauthorized.
 */
export async function authMiddleware(c: Context, next: Next) {
  // 1. Intentamos obtener la sesión desde el request crudo
  // better-auth analiza la cookie/header y consulta la base de datos
  const session = await auth.api.getSession(c.req.raw)

  // 2. Si la sesión es null o undefined, el acceso es denegado
  if (!session) {
    return c.json({
      error: 'Unauthorized',
      message: 'Debes iniciar sesión para acceder a este recurso',
    }, 401)
  }

  // 3. Inyectamos la información en el contexto de Hono
  // Gracias al Interface Merging en src/types/auth.ts, esto es type-safe
  c.set('user', session.user)
  c.set('session', session)

  // 4. El paso más importante: dejamos que la petición siga su camino
  return await next()
}
