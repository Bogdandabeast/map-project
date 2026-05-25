# Funcionamiento de Ionic Framework y Capacitor

Este documento detalla la arquitectura interna y la mecánica de funcionamiento de Ionic y Capacitor, explicando cómo una aplicación web se transforma en una experiencia móvil nativa.

## 1. Ionic Framework: La Capa de UI

Ionic no es un framework de lenguaje, sino un **Toolkit de UI basado en estándares web**. Su núcleo se basa en la filosofía de "escribir una vez, ejecutar en cualquier lugar".

### Web Components y Framework Agnosticism

Desde la versión 4, Ionic fue re-escrito utilizando **Web Components**. Esto significa que los componentes de Ionic (`ion-button`, `ion-card`, etc.) son elementos personalizados del navegador que funcionan independientemente del framework que uses (Angular, React, Vue o JS puro).

### Shadow DOM y Encapsulamiento

Ionic utiliza el **Shadow DOM** para garantizar que los estilos de los componentes no "filtren" hacia el resto de la aplicación y viceversa.

- **Aislamiento**: Cada componente tiene su propio árbol DOM interno y sus propios estilos.
- **Estabilización**: Evita colisiones de nombres de clases CSS.
- **CSS Shadow Parts**: Para permitir que el desarrollador personalice el interior de un componente sin romper el encapsulamiento, Ionic expone "partes" (`::part()`), que son puntos de entrada controlados para aplicar estilos CSS personalizados.

---

## 2. Capacitor: El Puente Nativo

Mientras que Ionic se encarga de lo que el usuario **ve**, Capacitor se encarga de cómo la aplicación **interactúa** con el dispositivo.

### El Concepto de WebView

Una aplicación de Ionic/Capacitor no se compila a código máquina (como Swift o Kotlin). En su lugar, Capacitor crea una aplicación nativa "contenedor" que instancia un **WebView** (una instancia del navegador del sistema: `WKWebView` en iOS y `WebView` en Android).
Toda tu aplicación web corre dentro de este WebView a pantalla completa.

### El Bridge (El Puente)

El corazón de Capacitor es el **Bridge**. Este mecanismo permite que el código JavaScript en el WebView se comunique con el código nativo del dispositivo.

1. **Llamada JS**: El desarrollador llama a una función de un plugin (ej: `Geolocation.getCurrentPosition()`).
2. **Serialización**: La petición se serializa y se envía a través del Bridge.
3. **Ejecución Nativa**: Capacitor intercepta la llamada y ejecuta la función correspondiente en el lenguaje nativo (Swift en iOS, Java/Kotlin en Android).
4. **Retorno**: El resultado nativo se devuelve al Bridge, se deserializa y llega al JavaScript como una `Promise`.

### Arquitectura de Plugins

Los plugins son las unidades de funcionalidad nativa. Cada plugin tiene:

- **Interfaz JS**: Una definición de TypeScript para que el desarrollador tenga autocompletado y tipado.
- **Implementación iOS**: Una clase en Swift que extiende `CAPPlugin`.
- **Implementación Android**: Una clase en Java/Kotlin que extiende `Plugin`.

Esta estructura permite que el mismo comando de JavaScript funcione en ambas plataformas, mientras que Capacitor se encarga de ejecutar la implementación nativa correcta según el OS.
