# Guía Práctica: Compilación y Despliegue con Ionic y Capacitor

Esta guía describe el flujo de trabajo paso a paso para llevar una aplicación desde el código fuente web hasta un binario móvil instalable.

## 1. El Flujo de Trabajo (Workflow)

El proceso de compilación se divide en tres etapas críticas: **Build Web** $\rightarrow$ **Sync Nativo** $\rightarrow$ **Compilación Binaria**.

### Paso 1: Build del Frontend

Antes de mover nada al móvil, debes generar la versión de producción de tu web.

```bash
# Genera los archivos estáticos en la carpeta 'dist' o 'www'
ionic build
```

_En este punto, tenés una web optimizada, pero sigue siendo solo HTML/JS/CSS._

### Paso 2: Sincronización con Capacitor

Capacitor necesita copiar esos archivos web dentro de las carpetas nativas de Android e iOS.

```bash
# Copia los assets y actualiza los plugins nativos
npx cap sync
```

**¿Qué hace exactamente `cap sync`?**

1. Lee la configuración en `capacitor.config.json` para saber dónde está la carpeta de build (ej: `webDir: 'dist'`).
2. Copia el contenido de esa carpeta a `ios/App/App/public` y `android/app/src/main/assets/public`.
3. Actualiza las dependencias de los plugins nativos instalados vía npm.

### Paso 3: Apertura del IDE Nativo y Generación del APK/IPA

Ionic NO genera el archivo `.apk` o `.ipa` directamente. Para ello, delegamos la tarea al compilador oficial de cada plataforma.

**Para Android:**

```bash
npx cap open android
```

$\rightarrow$ Abre **Android Studio**. Desde ahí, vas a `Build` $\rightarrow$ `Build Bundle(s) / APK(s)` $\rightarrow$ `Build APK(s)`.

**Para iOS:**

```bash
npx cap open ios
```

$\rightarrow$ Abre **Xcode**. Seleccionás el dispositivo y presionás el botón de **Run** (el triángulo) o generás un `Archive` para subirlo a la App Store.

---

## 2. Ejemplo Práctico: Uso de Plugins

Para interactuar con el hardware, utilizamos plugins. Aquí un ejemplo usando el plugin `AppLauncher` para abrir otra app.

### Instalación

```bash
npm install @capacitor/app-launcher
npx cap sync
```

### Implementación en el Código (TypeScript)

```typescript
import { AppLauncher } from '@capacitor/app-launcher'

async function openExternalApp() {
  try {
    // 1. Verificar si la app puede abrirse (URL scheme o paquete)
    const { value } = await AppLauncher.canOpenUrl({ url: 'twitter://timeline' })

    if (value) {
      // 2. Abrir la aplicación
      await AppLauncher.openUrl({ url: 'twitter://timeline' })
      console.log('App abierta con éxito')
    }
    else {
      console.error('La aplicación no está instalada')
    }
  }
  catch (error) {
    console.error('Error al intentar abrir la app', error)
  }
}
```

## 3. Estructura de Archivos Clave

| Carpeta/Archivo         | Función                                                  |
| :---------------------- | :------------------------------------------------------- |
| `/src`                  | Código fuente de tu framework (React, Angular, Vue).     |
| `/dist` o `/www`        | Archivos web compilados (el resultado de `ionic build`). |
| `capacitor.config.json` | Configuración global (App ID, nombre, carpeta de build). |
| `/android`              | Proyecto nativo completo de Android Studio.              |
| `/ios`                  | Proyecto nativo completo de Xcode.                       |
