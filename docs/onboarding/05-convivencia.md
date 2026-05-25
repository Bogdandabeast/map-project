# Normas de Convivencia

Bienvenido al equipo. En `map-project` no solo construimos software; cultivamos ingenieros. Para lograrlo, operamos bajo un estándar de **profesionalismo absoluto**. La disciplina técnica no es una restricción, sino la base que nos permite movernos rápido sin romper nada y, sobre todo, la que garantiza que cada uno de ustedes crezca profesionalmente.

Aquí definimos cómo trabajamos. Estas no son sugerencias, son las reglas del juego.

## 1. Git Flow y Gestión de Ramas

El historial de Git es la memoria del proyecto. Debe ser limpio, legible y estructurado.

- **Ramas Descriptivas**: Queda prohibido el uso de nombres genéricos como `update` o `mi-rama`. Toda rama debe seguir el prefijo según su propósito:
  - `feat/...` para nuevas funcionalidades.
  - `fix/...` para corrección de errores.
  - `chore/...` para tareas de mantenimiento, configuración o dependencias.
  - `docs/...` para cambios exclusivamente en la documentación.
- **Protección de `main`**: La rama `main` es sagrada. Representa el estado estable y productivo del software. **Bajo ninguna circunstancia se pushea directamente a `main`**. Todo cambio debe entrar vía Pull Request (PR).

## 2. Conventional Commits

Para que cualquier desarrollador (o tu "yo" del futuro) entienda qué pasó en el proyecto sin leer cada línea de código, utilizamos el estándar de *Conventional Commits*.

Cada mensaje de commit debe seguir este formato:
`<tipo>(<alcance>): <mensaje corto en imperativo>`

**Ejemplos:**
- `feat(auth): add google login integration`
- `fix(map): resolve marker overlap on zoom`
- `chore(deps): update zod to v3.23`

**Tipos comunes:**
- `feat`: Una nueva característica.
- `fix`: Solución a un bug.
- `chore`: Cambios que no afectan el código de producción (ej. actualizar `.gitignore`).
- `refactor`: Cambio de código que ni corrige un bug ni añade una feature.
- `docs`: Cambios en la documentación.

## 3. El Arte del Code Review

El *Code Review* es nuestra herramienta de aprendizaje más potente. No es un examen, es una mentoría colectiva.

- **Cómo pedir una review**: Al abrir un PR, describí claramente **qué** hiciste y **por qué** lo hiciste así. Facilitá la vida del revisor.
- **Cómo recibir feedback**: El feedback se dirige al **código**, nunca a la **persona**. 
  - Si un Senior te pide cambiar algo, no lo tomes como una crítica personal, sino como una oportunidad de evitar un error en producción.
  - Preguntá el "por qué" técnico detrás de la sugerencia. Esa es la verdadera ganancia.
- **Cómo dar feedback**: Sé directo, técnico y constructivo. Evitá ambigüedades. En lugar de "esto se ve raro", usá "esta implementación aumenta la complejidad ciclomática, sugiero usar un map en su lugar".

## 4. Comunicación y Trazabilidad

Si no está trackeado, no existe.

- **GitHub Issues**: Toda tarea, bug o mejora debe tener un Issue asociado. No se empieza a programar nada que no tenga un ticket.
- **Vínculo**: Los commits y los PRs deben hacer referencia al número del Issue (ej. `Closes #123`). Esto nos permite mantener una trazabilidad total desde la necesidad del negocio hasta la línea de código.

## 5. Definición de 'Hecho' (Definition of Done - DoD)

Un ticket no está "terminado" porque el código "funcione en mi máquina". Para que una tarea se considere **Hecha (Done)** y pueda ser mergeada, debe cumplir estrictamente con:

- [ ] **Tests pasando**: Se han escrito y ejecutado tests que cubren la nueva funcionalidad o el fix.
- [ ] **Tipado correcto**: No existen `any` injustificados. El código es type-safe y respeta las interfaces del proyecto.
- [ ] **Documentación actualizada**: Si cambiaste la lógica o agregaste un endpoint, el README o la doc técnica debe reflejarlo.
- [ ] **Review aprobada**: Al menos un desarrollador Senior ha revisado el código y dado su visto bueno (`Approved`).
- [ ] **Cero regresiones**: El cambio no rompe funcionalidades existentes.

---

*La excelencia no es un acto, sino un hábito. El respeto por estas normas es el respeto por el trabajo de tus compañeros y por tu propia carrera.*
