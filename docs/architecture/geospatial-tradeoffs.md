# Trade-offs del Enfoque Geospatial: Profesional vs. Minimalista

## Descripción General

Este documento analiza los compromisos (trade-offs) entre dos paradigmas principales para implementar funcionalidad geospatial: el **Stack GIS Profesional** (PostGIS + GeoServer) y el **Stack Minimalista/Edge** (SQLite/Turso + procesamiento en cliente).

## 1. El Stack Profesional (El "Tanque")

**Paradigma**: Inteligencia espacial en el servidor y entrega estandarizada.

### Pros (La Potencia)

- **Análisis Espacial Avanzado**: Capaz de realizar consultas complejas (ej. intersecciones, buffering, topología) que serían computacionalmente imposibles o ineficientes en el lado del cliente.
- **Escalabilidad de Datos Masivos**: Gracias a los índices GiST y el renderizado en el servidor (WMS/WMTS), puede manejar millones de geometrías sin colapsar el navegador del cliente.
- **Estandarización Industrial**: El cumplimiento total de OGC (WMS, WFS, WCS) asegura que el sistema sea interoperable con cualquier software GIS profesional (QGIS, ArcGIS).
- **Alta Precisión**: El soporte para tipos `GEOGRAPHY` permite cálculos globales precisos que tienen en cuenta la curvatura de la Tierra.

### Contras (La Carga)

- **Overhead de Infraestructura**: Requiere servidores dedicados para ejecutar Java (GeoServer) y PostgreSQL. No es compatible con modelos de despliegue "Serverless" o "Edge".
- **Curva de Aprendizaje Pronunciada**: Requiere conocimientos especializados en SQL espacial, SLD (Styled Layer Descriptor) para el renderizado y administración de servidores GIS.
- **Fricción en el Desarrollo**: Los cambios en la visualización de datos a menudo requieren una tubería de varios pasos (DB $\rightarrow$ Store $\rightarrow$ Layer $\rightarrow$ SLD).

---

## 2. El Stack Minimalista (El "Monopatín")

**Paradigma**: Procesamiento en el cliente y entrega ligera orientada al Edge.

### Pros (La Agilidad)

- **Velocidad de Desarrollo Extrema**: Prototipado rápido. Los datos se tratan como JSON simple, eliminando la necesidad de middleware GIS.
- **Bajo Costo y Alta Capacidad de Despliegue**: Ideal para entornos Serverless/Edge (ej. Turso/LibSQL). Gestión de infraestructura casi nula.
- **UX Fluida**: Al trasladar el renderizado al cliente (MapLibre/Mapbox), las interacciones del mapa (zoom, filtros) son instantáneas ya que no requieren viajes de ida y vuelta al servidor.

### Contras (El Techo)

- **El "Muro" de los Datos**: El rendimiento decae drásticamente una vez que el conjunto de datos supera los pocos miles de puntos, ya que el navegador debe cargar y renderizar todos los datos JSON crudos.
- **Sin Inteligencia Espacial**: Limitado a filtrados numéricos básicos. No puede realizar uniones espaciales complejas o análisis topológicos de manera eficiente.
- **Dependencia del Cliente**: El rendimiento está ligado directamente al hardware del usuario. Los dispositivos de gama baja tendrán dificultades con el renderizado pesado en el cliente.

---

## 3. Matriz de Decisión

| Dimensión                | Profesional (PostGIS/GS)   | Minimalista (SQLite/Edge) | Ganador         |
| :----------------------- | :------------------------- | :------------------------ | :-------------- |
| **Volumen de Datos**     | Millones de registros      | Miles de registros        | **Profesional** |
| **Complejidad de Query** | Análisis Espacial Avanzado | Filtrado Numérico Básico  | **Profesional** |
| **Velocidad de Setup**   | Lento (Días/Semanas)       | Rápido (Horas)            | **Minimalista** |
| **Costo Infra**          | Medio/Alto (VPS)           | Muy Bajo (Serverless)     | **Minimalista** |
| **Mantenimiento**        | Complejo (Java/Postgres)   | Simple (JS/TS/SQLite)     | **Minimalista** |
| **Estándares**           | OGC (Universal)            | JSON Custom (Propietario) | **Profesional** |

## 4. Veredicto Arquitectónico para `map-project`

Para `map-project`, el **Stack Profesional** es la arquitectura elegida.

**Justificación**:
Aunque el enfoque minimalista ofrece beneficios atractivos en velocidad y costo, introduce un techo duro en la escalabilidad y la funcionalidad. Dados los objetivos del proyecto de capacidades geospatiales de grado profesional y escalabilidad a largo plazo, el enfoque del "Tanque" es obligatorio para evitar una reescritura arquitectónica completa una vez que los datos crezcan o se requieran análisis complejos.

**Estrategia de Mitigación**:
Para compensar la "carga" del stack profesional, adoptaremos patrones de UX específicos del enfoque minimalista, tales como:

- Implementar el **Ajuste Automático de Bordes (Bounds Fitting)** en el frontend.
- Optimizar la capa de API para entregar solo los datos necesarios para el viewport actual.
- Utilizar librerías de frontend modernas (MapLibre) para asegurar que la experiencia del cliente siga siendo fluida.
