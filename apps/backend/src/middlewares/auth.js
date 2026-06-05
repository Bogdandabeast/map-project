/**
 * authMiddleware - El Guardia de la Aplicación
 *
 * Este middleware intercepta las peticiones a rutas protegidas.
 * Verifica si existe una sesión válida a través de better-auth.
 * Si la sesión es válida, inyecta el usuario y la sesión en el contexto.
 * Si no, bloquea la petición con un 401 Unauthorized.
 *
 * Expects auth to be set in context via app.use('*', (c, next) => {
 *   c.set('auth', getAuth(c.env)); return next();
 * })
 */
export async function authMiddleware(c, next) {
  const auth = c.get('auth');
  // 1. Intentamos obtener la sesión desde el request crudo
  const session = await auth.api.getSession(c.req.raw);

  // 2. Si la sesión es null o undefined, el acceso es denegado
  if (!session) {
    return c.json({
      error: 'Unauthorized',
      message: 'Debes iniciar sesión para acceder a este recurso',
    }, 401);
  }

  // 3. Inyectamos la información en el contexto de Hono
  c.set('user', session.user);
  c.set('session', session);

  // 4. Dejamos que la petición siga su camino
  return await next();
}
