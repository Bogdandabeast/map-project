# El Camino Dorado (The Golden Path)

En este proyecto, la velocidad es una consecuencia de la calidad, no un objetivo en sí mismo. No somos "cowboys" que pushean código y rezan para que no se rompa; somos ingenieros que diseñan soluciones robustas.

El **Camino Dorado** es el proceso obligatorio que debés seguir para cualquier cambio en el codebase. Saltarse pasos es aceptar la deuda técnica, y acá no aceptamos deuda no planificada.

## 🛠️ El Flujo de Trabajo Paso a Paso

### 1. Entender el Ticket (Análisis)
**Regla de oro: No toques el teclado hasta que entiendas el "porqué".**
Antes de escribir una sola línea de código, debés tener una especificación clara. 
- ¿Cuál es el problema real?
- ¿Cómo afecta a los módulos existentes?
- ¿Cuáles son los casos borde (edge cases)?
Si el ticket es ambiguo, preguntá. Programar sobre suposiciones es la forma más rápida de generar bugs.

### 2. Escribir el Test (TDD)
**Regla de oro: El test define la funcionalidad.**
Implementamos Test Driven Development (TDD). El flujo es: `Red` $\rightarrow$ `Green` $\rightarrow$ `Refactor`.
- Creá un test que represente la nueva funcionalidad o el fix.
- Ejecutalo y verificá que **falle**. Si el test pasa antes de escribir el código, el test no sirve.
- **Para FSMs**: Empezá siempre por el Reducer. Al ser una función pura, es el lugar más fácil y crítico para testear. Definí todas las transiciones de estado antes de tocar la UI.

### 3. Implementar la Lógica
Ahora que tenés un test fallando, escribí la **mínima** cantidad de código necesaria para que el test pase.

#### En el Frontend:
Seguí el flujo de las Máquinas de Estado:
1. **Definir Estados y Eventos**: ¿Qué estados mutuamente excluyentes tiene esta feature?
2. **Implementar el Reducer**: Lógica pura de transición. Consultá la `GUIA_FSM.md`.
3. **Integración**: Conectá el reducer mediante `useMachine` en el componente.

#### En el Backend:
Seguí la arquitectura modular:
1. **Esquema**: Actualizá el esquema de Drizzle si hay cambios en los datos.
2. **Módulo de Dominio**: Implementá la lógica en `src/modules/`. Mantené los controladores delgados y los servicios robustos.
3. **Ruta API**: Creá o actualizá el endpoint en `src/routes/` para exponer la funcionalidad.

### 4. Verificación y Pulido
Una vez que el test pase, no termines ahí.
- **Verificación**: Corré toda la suite de tests para asegurarte de que no rompiste nada (regresiones).
- **Estándares**: Revisá que estés usando Zod para las validaciones y que el tipado sea estricto (cero `any`).
- **Refactor**: Ahora que el código funciona, limpialo. Aplicá patrones de composición si el componente se volvió complejo.

### 5. El Proceso de Entrega (PR)
Tu código no llega a `main` sin pasar por el fuego.
- **Commits**: Usá *Conventional Commits*. Un commit por unidad de trabajo.
- **Pull Request**: Abrí el PR con una descripción clara: qué cambió, por qué y cómo testearlo.
- **Review**: El PR será revisado por un Senior. Tomá el feedback como una mentoría. El objetivo es que el código sea excelente, no que vos tengas razón.

---

**Recordatorio Final**: Apoyate siempre en la documentación técnica y en las skills del proyecto. La disciplina técnica es lo que nos separa de los amateurs.
