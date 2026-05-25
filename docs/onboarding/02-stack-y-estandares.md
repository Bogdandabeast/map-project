# Stack Tecnológico y Estándares de Ingeniería

Este documento no es una lista de herramientas; es la definición de **cómo construimos software** en este proyecto. No nos importa la herramienta por la herramienta, nos importa la **predictibilidad, la velocidad de ejecución y la seguridad de tipos**. 

Si sos becario, leé esto con atención. No quiero que copies y pegues código; quiero que entiendas el **porqué** de cada decisión.

---

## 🚀 El Mindset del Stack
Hemos elegido un stack "Edge-ready" y "Type-safe". Buscamos eliminar la magia oscura y volver a los fundamentos: SQL real, estándares web reales y tipos estrictos.

### 1. Backend: Hono & Bun
Usamos **Hono** sobre **Bun**. ¿Por qué? Porque Hono es increíblemente liviano, sigue los estándares de la Web API y nos permite compartir tipos entre servidor y cliente mediante RPC. **Bun** es nuestro motor: reemplaza a Node, npm y Jest con un único binario absurdamente rápido.

**Nuestros Estándares de Hono & Bun:**
- **Rutas Encadenadas**: Para que el RPC funcione y el cliente infiera los tipos, las rutas DEBEN estar encadenadas. No uses controladores estilo Rails.
- **Testeo sin Servidor**: Usá `app.request()` para testear endpoints. No levantes un servidor HTTP en los tests unitarios.
- **Gestión de Env**: Usá `createFactory()` para definir el tipo `Env` una sola vez y compartirlo entre app, middleware y handlers.
- **Bun es el estándar**: Usá `bun run` para scripts, `bun add` para paquetes y `bun test` para tests. Olvidate de `npm` o `yarn`.

### 2. Datos: Drizzle ORM & PostgreSQL
Usamos **Drizzle**. A diferencia de otros ORMs, Drizzle no intenta esconder el SQL; lo potencia. Es "TypeScript-first" y tiene cero overhead en runtime.

**Nuestros Estándares de Datos:**
- **Schema-First**: El esquema de Drizzle es la única fuente de verdad.
- **No al `any` en JSON**: Si usás columnas JSON, usá `. $type<{...}>()` para tiparlas. El `any` está prohibido.
- **Transacciones Obligatorias**: Cualquier modificación de datos que toque más de una tabla DEBE estar envuelta en `db.transaction()`.
- **Paginación por Defecto**: Prohibido hacer `select()` sin `limit()` y `offset()` en tablas de producción. No queremos tirar el servidor trayendo 100k filas.

### 3. Autenticación: Better Auth
La seguridad no es negociable. Usamos **Better Auth** por su enfoque moderno y su capacidad de extenderse mediante plugins.

**Nuestros Estándares de Auth:**
- **Secretos en Env**: `BETTER_AUTH_SECRET` y `BETTER_AUTH_URL` van siempre en el `.env`. Nunca en el código.
- **Sincronización de Esquema**: Cada vez que agregues o cambies un plugin de auth, ejecutá `bunx @better-auth/cli@latest migrate`.
- **Type Safety**: Usá el cliente de Better Auth para que las sesiones y usuarios estén tipados en el frontend.

### 4. Validación: Zod
Zod es el "contrato" de nuestra aplicación. Si el dato entra al sistema, pasa por Zod. Si sale, se valida con Zod.

**Nuestros Estándares de Validación:**
- **`safeParse` para Inputs**: Nunca uses `.parse()` con datos de usuario; usá `.safeParse()` para manejar errores sin romper la app.
- **Tz-Inference**: No definas interfaces manuales para los datos validados; usá `z.infer<typeof schema>`.
- **Validación en los Bordes**: Validá los datos en la entrada de la API y en la salida del servicio. No lleves datos "sucios" al corazón del negocio.
- **Uniones Discriminadas**: Para estados complejos, usá uniones discriminadas en Zod para forzar el estrechamiento de tipos (type narrowing).

### 5. Frontend: React & Vite
El frontend debe ser una función pura del estado. Menos "magia" y más composición.

**Nuestros Estándares de UI:**
- **Prohibido el "Boolean Prop Hell"**: Si ves que un componente tiene props como `isEditing`, `isThread`, `isMobile`, frená. Usá **Componentes Compuestos (Compound Components)** y composición.
- **Cero Componentes Anidados**: Nunca definas un componente dentro de otro. Provoca remontajes completos en cada render y destruye el performance.
- **Estado Derivado**: Si un valor se puede calcular a partir de props o estado, NO crees un nuevo estado. Calculalo durante el render.
- **TDD en UI**: Antes de tocar el JSX, escribí el test de comportamiento.

### 6. El Pegamento: TypeScript Avanzado
TypeScript no es para "poner tipos", es para diseñar la arquitectura.

**Nuestros Estándares de Tipado:**
- **`unknown` > `any`**: El `any` es una rendición. Usá `unknown` y obligate a hacer un type guard.
- **Uniones Discriminadas**: Es la herramienta más poderosa para manejar estados (IDLE, LOADING, SUCCESS, ERROR). Usalas siempre.
- **Strict Mode**: El modo estricto de TS está activado. No lo desactives. Si el compilador grita, es porque hay un bug potencial.

---

## 🛠️ Resumen de "Reglas de Oro" para el Becario

1. **Si no está tipado, está roto.**
2. **Si no tiene test, no existe.**
3. **Si el componente tiene más de 5 booleanos, refactorizalo a composición.**
4. **Si hacés una query a la DB sin limit, alguien te va a llamar la atención.**
5. **Leé la guía de FSM antes de crear cualquier `useState` para manejar flujos.**
