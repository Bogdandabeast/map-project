# Arquitectura del Stack Geospatial: PostGIS & GeoServer

## Descripción General

El proyecto utiliza un stack geospatial profesional compuesto por **PostGIS** como motor de datos espaciales y **GeoServer** como servidor de mapas y gateway de API. Esta combinación proporciona una implementación de grado de producción de los estándares del Open Geospatial Consortium (OGC).

## 1. PostGIS (Base de Datos Espacial)

PostGIS es una extensión de PostgreSQL que permite el almacenamiento y la consulta de objetos geográficos.

### Tipos Espaciales Principales

- **`GEOMETRY`**: Utilizado para sistemas de coordenadas planas (cartesianas). Ideal para mapeo local y cálculos geométricos de alto rendimiento.
- **`GEOGRAPHY`**: Utilizado para coordenadas esféricas (latitud/longitud). Esencial para cálculos a escala global donde la curvatura de la Tierra es significativa.

### Rendimiento e Indexación

Las consultas espaciales son costosas computacionalmente. Para asegurar la escalabilidad en producción, lo siguiente es obligatorio:

- **Índices GiST**: PostGIS utiliza Generalized Search Trees (basados en R-Trees) para optimizar las consultas de cajas delimitadoras (bounding boxes). Toda columna espacial debe estar indexada.
- **Operadores Eficientes**: Utilizar el operador `&&` (intersección de bounding box) para el filtrado inicial.
- **Funciones Optimizadas**: Preferir `ST_DWithin` sobre `ST_Distance` para búsquedas de proximidad, ya que `ST_DWithin` puede aprovechar los índices espaciales.

### Cumplimiento de Estándares

- Adhiere al estándar **OGC Simple Features Access (SFA)**.
- Soporta los formatos **WKT (Well-Known Text)** y **WKB (Well-Known Binary)** para una interoperabilidad total con otros software GIS.

## 2. GeoServer (Servidor de Mapas)

GeoServer actúa como la capa de presentación, exponiendo los datos de PostGIS a través de servicios web estandarizados.

### Protocolos OGC Soportados

| Protocolo | Nombre Completo      | Descripción                                      | Caso de Uso                                                  |
| :-------- | :------------------- | :----------------------------------------------- | :----------------------------------------------------------- |
| **WMS**   | Web Map Service      | Renderiza mapas como imágenes (PNG/JPEG).        | Visualización rápida de grandes conjuntos de datos.          |
| **WFS**   | Web Feature Service  | Sirve datos vectoriales crudos (GeoJSON/GML).    | Manipulación y edición de datos desde el cliente.            |
| **WCS**   | Web Coverage Service | Sirve datos ráster (Tiff/NetCDF).                | Imágenes satelitales y Modelos Digitales de Elevación (DEM). |
| **WMTS**  | Web Map Tile Service | Sirve teselas (tiles) de mapas pre-renderizadas. | Mapeo web de alto rendimiento.                               |

### Renderizado y Escalado

- **SLD (Styled Layer Descriptor)**: Lenguaje de estilizado basado en XML utilizado para definir colores, escalas y lógica de renderizado basada en reglas.
- **GeoWebCache (GWC)**: Mecanismo de caché integrado que almacena teselas pre-renderizadas para reducir la carga de CPU en la instancia de GeoServer.

## 3. Arquitectura de Integración

El flujo de datos sigue una configuración jerárquica:
`Espacio de Trabajo (Workspace)` $\rightarrow$ `Almacén de Datos (Store)` $\rightarrow$ `Capa (Layer)`.

### Flujo de Integración

1. **Almacén PostGIS**: GeoServer se conecta a la instancia de PostgreSQL vía JDBC.
2. **Publicación de Capas**: Tablas o vistas específicas de PostGIS se publican como Capas.
3. **Estilizado**: Se aplica un archivo SLD a la Capa para controlar su representación visual.
4. **Consumo**: Los clientes solicitan la capa a través de endpoints WMS/WFS.

### Ruta de Optimización Crítica

Para evitar cuellos de botella en la tubería:

- **Nivel DB**: Ejecutar `VACUUM ANALYZE` regularmente para mantener actualizadas las estadísticas del optimizador de consultas.
- **Nivel Servidor**: Configurar el pooling de conexiones en GeoServer para gestionar eficientemente las conexiones a la DB.
- **Nivel Red**: Implementar la simplificación de geometrías (vía `ST_Simplify` en PostGIS o configuraciones de GeoServer) para reducir el tamaño de la carga en niveles de zoom bajos.

## 4. Trade-offs Arquitectónicos

| Solución                  | Pros                                                                              | Contras                                                                 |
| :------------------------ | :-------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **PostGIS + GeoServer**   | Cumplimiento total OGC, estilizado potente, soporta WFS/WCS, altamente escalable. | Mayor consumo de recursos, configuración compleja.                      |
| **PostGIS + pg_tileserv** | Extremadamente liviano, entrega rápida de Vector Tiles, configuración simple.     | Sin estilizado SLD, limitado a Vector Tiles (MVT), sin soporte WFS/WCS. |
