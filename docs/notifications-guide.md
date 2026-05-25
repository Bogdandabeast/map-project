# Guía Completa de Notificaciones en Ionic con Capacitor

## Descripción General

Las notificaciones son una pieza fundamental para el engagement en aplicaciones móviles. En el ecosistema de Ionic y Capacitor, existen tres caminos principales para implementarlas, dependiendo de la complejidad, el control y el presupuesto del proyecto.

---

## 1. El Camino "Hardcore": Implementación Directa (FCM/APNs)

Esta estrategia utiliza `@capacitor/push-notifications` para conectar la app directamente con los servicios nativos de Google (FCM) y Apple (APNs).

### Arquitectura

`Backend` $\rightarrow$ `FCM (Android) / APNs (iOS)` $\rightarrow$ `Dispositivo`

### Configuración Técnica

#### Android (Google Firebase)

1. **Firebase Console**: Crear proyecto y añadir una aplicación Android.
2. **Configuración**: Descargar el archivo `google-services.json` y colocarlo en `android/app/`.
3. **Gradle**: Configurar el plugin de Google Services en los archivos `build.gradle` (proyecto y app).

#### iOS (Apple Push Notification service)

1. **Apple Developer Portal**: Crear un **Auth Key (.p8)**. Es la forma moderna y recomendada sobre los certificados `.p12`.
2. **Xcode**:
   - Activar la capacidad de **Push Notifications**.
   - Activar **Background Modes** $\rightarrow$ **Remote notifications**.
3. **FCM**: Subir el archivo `.p8` a la consola de Firebase para que Google pueda hablar con Apple.

### Implementación en Código

- **Registro**: Usar `PushNotifications.requestPermissions()` y luego `PushNotifications.register()`.
- **Gestión de Tokens**: El evento `registration` devuelve un token único del dispositivo. **Este token debe enviarse y guardarse en tu backend** vinculado al ID del usuario.
- **Manejo de Eventos**: Implementar listeners para `pushNotificationReceived` (foreground) y `pushNotificationActionPerformed` (clic en la notificación).

**Veredicto**: Máximo control y costo cero, pero alta complejidad de mantenimiento y configuración de certificados.

---

## 2. El Camino "Managed": OneSignal

OneSignal es una plataforma que abstrae la complejidad de FCM y APNs, ofreciendo un SDK unificado y un panel de control avanzado.

### Arquitectura

`Backend/Dashboard OneSignal` $\rightarrow$ `OneSignal Gateway` $\rightarrow$ `FCM/APNs` $\rightarrow$ `Dispositivo`

### Configuración Técnica

1. **Panel de OneSignal**: Crear cuenta y configurar la app. Se suben las llaves de Firebase y el `.p8` de Apple una sola vez.
2. **Plugin**: Instalar `@onesignal/capacitor-plugin`.
3. **Configuración Crítica (iOS)**: En `capacitor.config.ts`, establecer `ios: { handleApplicationNotifications: false }` para evitar conflictos con el delegado de APNs.

### Implementación en Código

- **Inicialización**: `OneSignal.initialize("TU_APP_ID")` al inicio de la app.
- **Identificación de Usuario**: Usar `OneSignal.login("user_id")` para vincular la suscripción al usuario de tu base de datos.
- **Segmentación**: Usar `OneSignal.User.addTag("key", "value")` para enviar notificaciones solo a ciertos grupos (ej. "usuarios_premium").

**Veredicto**: Velocidad de implementación extrema y herramientas de marketing potentes. Ideal para startups y proyectos que necesitan iterar rápido.

---

## 3. El Camino "Local": Notificaciones Locales

Utiliza `@capacitor/local-notifications` para programar alertas que se disparan desde el propio dispositivo, sin necesidad de un servidor externo.

### Arquitectura

`Lógica de la App` $\rightarrow$ `Sistema Operativo` $\rightarrow$ `Usuario`

### Implementación en Código

- **Programación**: Usar `LocalNotifications.schedule()`.
  - **Inmediatas**: Para alertas instantáneas.
  - **Programadas**: Definir una fecha y hora exacta (`at`).
  - **Recurrentes**: Definir intervalos (cada hora, cada día, etc.).
- **Interacción**: Escuchar `localNotificationActionPerformed` para ejecutar acciones cuando el usuario toca la alerta.

### Casos de Uso Ideales

- Recordatorios basados en tiempo (ej. "Es hora de registrar tu ubicación").
- Alertas basadas en eventos del dispositivo.
- Modo offline donde no hay conexión al servidor.

**Veredicto**: Implementación trivial, funciona 100% offline, pero es incapaz de reaccionar a eventos externos en tiempo real.

---

## Matriz Comparativa Final

| Característica         | Directo (FCM/APNs)           | OneSignal                    | Local Notifications             |
| :--------------------- | :--------------------------- | :--------------------------- | :------------------------------ |
| **Dificultad Setup**   | Alta $\uparrow\uparrow$      | Baja $\downarrow$            | Muy Baja $\downarrow\downarrow$ |
| **Control de Datos**   | Total (Tuyo)                 | Tercerizado (OneSignal)      | Local (Dispositivo)             |
| **Costo**              | Gratis                       | Gratis $\rightarrow$ Pago    | Gratis                          |
| **Segmentación**       | Manual (en tu Backend)       | Nativa y Avanzada            | No aplica                       |
| **Dependencia de Red** | Obligatoria                  | Obligatoria                  | No requiere red                 |
| **Gestión de Tokens**  | Manual en tu DB              | Gestionada por OneSignal     | No usa tokens                   |
| **Uso Recomendado**    | Apps Enterprise / Privacidad | Apps Comerciales / Marketing | Utilidades / Recordatorios      |
