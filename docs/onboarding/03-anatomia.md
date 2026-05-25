# Anatomía del Proyecto

Bienvenido al equipo. Para que no te sientas perdido navegando por el código, acá tenés el mapa de responsabilidades del `map-project`.

No nos interesa que memorices dónde está cada archivo, sino que entiendas **quién es responsable de qué**.

## La Filosofía: Separación de Preocupaciones
Usamos un monorepo gestionado con **Turbo**. La idea es simple: separar la lógica de negocio de la infraestructura y la interfaz de usuario. Esto nos permite escalar sin que el proyecto se convierta en un "espagueti" de dependencias.

Si necesitás cambiar una regla de negocio, vas al backend. Si necesitás cambiar cómo se ve un botón, vas al frontend. Si necesitás cambiar una validación que usan ambos, vas a los packages.

---

## Backend (`apps/backend`)
El backend es el corazón de la verdad del sistema. Está diseñado para ser predecible y modular.

- **`src/db/`**: Acá vive la definición de nuestros datos. Encontrarás los esquemas de **Drizzle** y la configuración del cliente de base de datos. Si querés agregar una columna a una tabla, empezás acá.
- **`src/modules/`**: El cerebro del proyecto. La lógica de negocio está organizada por **dominios**. No busques "funciones", buscá "módulos de dominio". Cada módulo encapsula la lógica específica de una entidad o proceso.
- **`src/routes/`**: La puerta de entrada. Acá se definen los endpoints de la API. Su única responsabilidad es recibir la petición, validar la entrada y delegar la ejecución al módulo correspondiente. **No escribas lógica de negocio en las rutas.**
- **`drizzle/`**: El historial de cambios. Acá están las migraciones SQL. Nunca modifiques estos archivos manualmente; usá el CLI de Drizzle para generar nuevas migraciones.

---

## Frontend (`apps/frontend`)
El frontend es una capa de presentación reactiva. Priorizamos la reutilización y la gestión de estado explícita.

- **`src/pages/`**: Las vistas principales. Son componentes de alto nivel que orquestan la página. Su función es ensamblar componentes más pequeños y conectar la página con los hooks de estado.
- **`src/components/`**: La librería de piezas. Componentes de UI reutilizables y "tontos" (presentacionales). Si un componente se usa en más de una página, va acá.
- **`src/hooks/`**: Donde ocurre la magia. Acá reside la lógica compartida y, lo más importante, el núcleo de nuestras **FSM (Finite State Machines)** usando `useMachine`. Si querés entender cómo cambia el estado de la aplicación, estudiá los hooks.
- **`src/lib/`**: La caja de herramientas. Utilidades globales, configuraciones de clientes (API, SDKs) y helpers que no pertenecen a ningún dominio específico.

---

## Shared (`packages/`)
Para evitar repetirnos (DRY), sacamos lo común a paquetes compartidos.

- **Configuraciones**: `eslint`, `tsconfig` y otras reglas de calidad de código que mantienen la consistencia en todo el monorepo.
- **Lógica Común**: Validaciones (Zod) y tipos que son consumidos tanto por el frontend como por el backend. Si una regla de validación debe ser idéntica en ambos lados, va acá.

---

## Resumen rápido: "¿Dónde pongo esto?"

| Si quiero... | Voy a... |
| :--- | :--- |
| Crear una nueva tabla o campo | `apps/backend/src/db` $\rightarrow$ `apps/backend/drizzle` |
| Cambiar una regla de negocio | `apps/backend/src/modules` |
| Agregar un nuevo endpoint | `apps/backend/src/routes` |
| Crear una nueva vista/pantalla | `apps/frontend/src/pages` |
| Crear un botón o input reusable | `apps/frontend/src/components` |
| Cambiar la lógica de un flujo/estado | `apps/frontend/src/hooks` |
| Crear una validación compartida | `packages/` |

Si tenés dudas, preguntá. Es preferible que preguntes dónde va algo a que lo pongas en el lugar equivocado y tengamos que refactorizarlo después.
