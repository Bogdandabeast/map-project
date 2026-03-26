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
    *Este comando levantará automáticamente el contenedor de PostGIS en segundo plano e iniciará tanto el frontend como el backend de forma paralela.*

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
│   └── typescript-config/ # Configuraciones compartidas de TypeScript
├── docker-compose.yml   # Configuración de PostgreSQL + PostGIS
└── turbo.json           # Configuración del pipeline de Turborepo
```

---

## 🛰 Tecnologías Utilizadas

-   **Frontend:** [Ionic Framework](https://ionicframework.com/) con React, Vite para el empaquetado y Capacitor para despliegue nativo.
-   **Backend:** [Hono](https://hono.dev/), un framework ultra rápido para TypeScript que corre nativamente en Bun.
-   **Base de Datos:** [PostgreSQL 18](https://www.postgresql.org/) con la extensión espacial [PostGIS 3.6](https://postgis.net/).
-   **Monorepo:** [Turborepo](https://turbo.build/repo), optimiza las tareas de construcción y linting mediante cache inteligente.

---

## ⚡ Comandos Útiles

| Comando | Descripción |
| :--- | :--- |
| `bun run dev` | Levanta Docker y arranca frontend/backend en modo desarrollo. |
| `bun run build` | Compila todas las aplicaciones del monorepo. |
| `bun run lint` | Ejecuta el linter en todos los paquetes. |
| `bun run check-types` | Valida los tipos de TypeScript en todo el proyecto. |
| `docker compose up -d` | Levanta manualmente la base de datos. |
| `docker compose stop` | Detiene los contenedores de la base de datos. |

---

## 🏎 Turborepo: Uso Avanzado

Turborepo gestiona las tareas de forma eficiente. Puedes filtrar qué aplicación ejecutar:

-   **Ejecutar solo el frontend:**
    ```bash
    bun turbo run dev --filter=apps-frontend
    ```

-   **Ejecutar solo el backend:**
    ```bash
    bun turbo run dev --filter=backend
    ```

### Pipeline de Tareas
Las tareas están definidas en `turbo.json`:
-   `build`: Depende de la construcción de sus dependencias internas (`^build`).
-   `dev`: Tarea persistente que no usa cache, ideal para desarrollo local.

---

## 🗄 Base de Datos (PostGIS)

La base de datos está configurada con las siguientes credenciales por defecto (modificar para producción):

-   **Host:** `localhost`
-   **Puerto:** `5432`
-   **Usuario:** `postgres`
-   **Contraseña:** `postgres`
-   **BD:** `mydb`

Para ver el estado de la base de datos:
```bash
docker ps -f name=postgres18_postgis
```
