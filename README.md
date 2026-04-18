# Monorepo Map Project

Este proyecto es un monorepo gestionado con **Turborepo** que integra una aplicación móvil/web con **Ionic React**, un backend con **Hono** ejecutado en **Bun**, y una base de datos **PostgreSQL con PostGIS** mediante Docker.

---

## 🛠 Requisitos Previos

Para ejecutar este proyecto, necesitas tener instalado:

1.  **[Bun](https://bun.sh/)** (v1.3.4 o superior): El gestor de paquetes y runtime de JavaScript/TypeScript.
2.  **[Docker Desktop / Engine](https://www.docker.com/)**: Con soporte para **Docker Compose V2** (comando `docker compose`).
3.  **Git**: Para el control de versiones.

---

## 🚀 Inicio Rápido

1.  **Instalar dependencias:**

    ```bash
    bun install
    ```

2.  **Iniciar el entorno de desarrollo:**
    ```bash
    bun run dev
    ```
    _Este comando ejecuta `docker compose up -d` para levantar el stack completo (PostGIS y GeoServer) e inicia tanto el frontend como el backend de forma paralela._

---

## 🏗 Estructura del Proyecto

```text
.
├── apps/
│   ├── frontend/        # App Ionic React (Vite + Capacitor)
│   ├── backend/         # API REST con Hono (Bun)
│   └── docs/            # Documentación adicional
├── packages/
│   ├── eslint-config/   # Configuraciones compartidas de ESLint
│   ├── typescript-config/ # Configuraciones compartidas de TypeScript
│   └── stoker/          # Utilidades para Hono y OpenAPI (códigos HTTP, middlewares, helpers)
├── docker-compose.yml   # Configuración de PostgreSQL + PostGIS y GeoServer
└── turbo.json           # Configuración del pipeline de Turborepo
```

---

## 📦 Paquetes Internos

### @repo/stoker

Un conjunto de utilidades optimizadas para **Hono** y **@hono/zod-openapi**. Proporciona una forma tipada y consistente de manejar respuestas HTTP y esquemas OpenAPI.

#### Características principales:

- **Códigos y Frases de Estado HTTP:** Constantes tipadas para evitar errores de escritura (ej. `HttpStatusCodes.OK`, `HttpStatusPhrases.NOT_FOUND`).
- **Middlewares Estándar:**
  - `notFound`: Manejador de rutas no encontradas con formato JSON consistente.
  - `onError`: Manejador de errores global que oculta el stack trace en producción.
  - `serveEmojiFavicon`: Middleware para servir un favicon basado en un emoji.
- **OpenAPI Helpers:**
  - `jsonContent`: Simplifica la definición de respuestas JSON en rutas OpenAPI.
  - `jsonContentRequired`: Igual que el anterior, pero marcando el contenido como obligatorio.
  - `defaultHook`: Un hook de validación que devuelve errores 422 de forma automática y formateada.

#### Ejemplo de uso en el Backend:

```typescript
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { NOT_FOUND } from '@repo/stoker/http-status-codes'
import * as middlewares from '@repo/stoker/middlewares'
import { defaultHook } from '@repo/stoker/openapi'
import { jsonContent } from '@repo/stoker/openapi/helpers'
import { IdParamsSchema } from '@repo/stoker/openapi/schemas'

const app = new OpenAPIHono({ defaultHook })

// Middlewares globales
app.notFound(middlewares.notFound)
app.onError(middlewares.onError)

const route = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: jsonContent(UserSchema, 'El usuario solicitado'),
    [NOT_FOUND]: jsonContent(ErrorSchema, 'Usuario no encontrado'),
  },
})
```

---

## 🛰 Tecnologías Utilizadas

- **Frontend:** [Ionic Framework](https://ionicframework.com/) con React, Vite para el empaquetado y Capacitor para despliegue nativo.
- **Backend:** [Hono](https://hono.dev/), un framework ultra rápido para TypeScript que corre nativamente en Bun.
- **Base de Datos:** [PostgreSQL 18](https://www.postgresql.org/) con la extensión espacial [PostGIS 3.6](https://postgis.net/).
- **OGC Server** [GeoServer](https://geoserver.org/), un servidor de código abierto para compartir datos geoespaciales.
- **Monorepo:** [Turborepo](https://turbo.build/repo), optimiza las tareas de construcción y linting mediante cache inteligente.

## 📦 Gestión de Dependencias

Para añadir nuevas librerías a los proyectos, utiliza el comando `bun add` con el flag `--filter` para especificar la aplicación o paquete:

### En el Frontend (Ionic React)

```bash
bun add <nombre-paquete> --filter apps-frontend
```

### En el Backend (Hono)

```bash
bun add <nombre-paquete> --filter backend
```

### Dependencias de Desarrollo (en la raíz o un proyecto específico)

```bash
# En el backend como devDependency
bun add -d <nombre-paquete> --filter backend

# En la raíz del monorepo (globales)
bun add -d <nombre-paquete> -w
```

---

## 🧪 Metodología de Desarrollo: TDD (Test Driven Development)

Este proyecto sigue rigurosamente la metodología TDD para asegurar la robustez del código. El ciclo es:

1.  **Red:** Escribir un test que falle para la funcionalidad deseada.
2.  **Green:** Escribir el código mínimo necesario para que el test pase.
3.  **Refactor:** Limpiar y mejorar el código manteniendo los tests en verde.

### Ejecutar Tests

- **Backend:** `bun turbo run test --filter=backend` (o `cd apps/backend && bun test`)
- **Frontend (Unitarios):** `bun turbo run test.unit --filter=apps-frontend` (o `cd apps/frontend && bun run test.unit`)

---

## 📝 Convención de Commits

Para mantener un historial limpio y compatible con herramientas de automatización, utilizamos **Conventional Commits**. El formato es:

`<tipo>[alcance opcional]: <descripción>`

### Tipos comunes:

- `feat`: Una nueva funcionalidad.
- `fix`: Solución de un bug.
- `docs`: Cambios en la documentación.
- `style`: Cambios que no afectan el significado del código (espacios, formato, etc.).
- `refactor`: Cambio en el código que ni corrige un bug ni añade una funcionalidad.
- `test`: Añadir tests faltantes o corregir existentes.
- `chore`: Cambios en el proceso de construcción o herramientas auxiliares.

### Ejemplo:

`feat(backend): añadir endpoint de geolocalización`

---

## ⚡ Comandos Útiles

| Comando                | Descripción                                                   |
| :--------------------- | :------------------------------------------------------------ |
| `bun run dev`          | Levanta Docker y arranca frontend/backend en modo desarrollo. |
| `bun run build`        | Compila todas las aplicaciones del monorepo.                  |
| `bun run lint`         | Ejecuta el linter en todos los paquetes.                      |
| `bun run check-types`  | Valida los tipos de TypeScript en todo el proyecto.           |
| `docker compose up -d` | Levanta manualmente la base de datos.                         |
| `docker compose stop`  | Detiene los contenedores de la base de datos.                 |

---

## 🏎 Turborepo: Uso Avanzado

Turborepo gestiona las tareas de forma eficiente. Puedes filtrar qué aplicación ejecutar:

- **Ejecutar solo el frontend:**

  ```bash
  bun turbo run dev --filter=apps-frontend
  ```

- **Ejecutar solo el backend:**
  ```bash
  bun turbo run dev --filter=backend
  ```

### Pipeline de Tareas

Las tareas están definidas en `turbo.json`:

- `build`: Compila todas las aplicaciones. Depende de la construcción de sus dependencias internas (`^build`).
- `lint`: Ejecuta el linter en todos los paquetes. Depende de que las dependencias internas hayan sido linteadas primero (`^lint`).
- `check-types`: Valida los tipos de TypeScript en todo el proyecto. Depende de las dependencias internas (`^check-types`).
- `dev`: Tarea persistente que no usa cache, ideal para desarrollo local.

---

## 🗄 Base de Datos (PostGIS)

La base de datos está configurada con las siguientes credenciales por defecto (modificar para producción):

- **Host:** `localhost`
- **Puerto:** `5432`
- **Usuario:** `postgres`
- **Contraseña:** `postgres`
- **BD:** `mydb`

> **Producción:** Nunca uses credenciales hardcodeadas. Configura las variables de entorno `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` (y `GEOSERVER_USER`, `GEOSERVER_PASS` para GeoServer) en un archivo `.env` (no commitear) o usa un gestor de secretos. Consulta `.env.example` para las claves requeridas.

Para ver el estado de la base de datos:

```bash
docker ps -f name=postgres18_postgis
```

---

## 🗺️ OGC server (GeoServer)

GeoServer expone un panel de control en [GeoServer](http://localhost:8080/geoserver/web/) donde poder crear los geo-servicios siguiendo los estándares del consorcio abierto geoespacial [OGC (Open Geospatial Consortium)](https://www.ogc.org/es/)

El servidor está configurado con las siguientes credenciales por defecto (modificar para producción):

- **Host:** `localhost`
- **Puerto:** `8080`
- **Usuario:** `admin`
- **Contraseña:** `geoserver`

> **Producción:** Usa las variables `GEOSERVER_USER` y `GEOSERVER_PASS` definidas en tu `.env` o gestor de secretos.

Para ver el estado del servidor:

```bash
docker ps -f name=geoserver
```
