# Novelore — Auditoría y Arquitectura de Assets y Datos Binarios (Fase 2.3)

Este documento constituye la fuente de verdad técnica para la **Fase 2.3: Auditoría y Arquitectura de Assets y Datos Binarios** de Novelore.

> **Regla de Rigor Epistemológico**: En cumplimiento de las directrices arquitectónicas del proyecto, cada aseveración, riesgo o especificación en este documento está estrictamente categorizada mediante etiquetas formales:
> - `[FACT]`: Hecho empíricamente verificado en el código fuente actual o en la especificación oficial de una plataforma.
> - `[RISK]`: Vulnerabilidad, cuello de botella o riesgo de fallo identificado.
> - `[PROPOSED]`: Diseño arquitectónico o especificación técnica propuesta para fases futuras. No implementado en el código actual.
> - `[REQUIRED CANDIDATE]`: Campo o requisito indispensable para la funcionalidad básica en propuestas futuras.
> - `[OPTIONAL]`: Campo o característica complementaria no indispensable para la fase inicial.
> - `[OPEN QUESTION]`: Decisión técnica o interrogante abierta pendiente de resolución o prueba reproducible.

---

## 1. Inventario Exhaustivo de Datos Binarios y Assets en el Repositorio

A continuación se detalla cada campo, estructura y flujo detectado en el código fuente de Novelore susceptible de contener datos binarios, Data URLs, Base64 o referencias a assets:

| Campo / Identificador | Estructura Contenedora | Tipo de Datos Actual | Ubicación en Persistencia | Fuente / Origen en UI | Formatos Soportados | Compresión Actual |
|---|---|---|---|---|---|---|
| `coverUrl` | `NovelProject` (`src/types.ts:260`) | `string?` | Documento Raíz `/novels/{novelId}` e IndexedDB (`projects`, `versions`) | `BookCover.tsx`, `HomeDashboard.tsx` | PNG, JPG, WebP | Canvas 600x900 JPEG (0.85). Fallback a raw Base64 si canvas falla `[FACT]` |
| `customFontData` | `ProjectSettings` (`src/types.ts:154`) | `string?` | Documento Raíz `/novels/{novelId}` e IndexedDB (`projects`, `versions`) | `RichTextEditor.tsx:239-261` | TTF, OTF, WOFF | **Ninguna**. Base64 crudo directo `[FACT]` |
| `avatarUrl` | `WorldEntity` (`src/types.ts:96`) | `string?` | Documento Raíz `/novels/{novelId}` (`entities[]`) e IndexedDB (`projects`, `versions`) | `EntityModal.tsx`, `VisualBoardView.tsx` | WebP, JPEG, PNG, URLs remotas | Canvas 1200x1200 WebP/JPEG (0.85). Fallback a raw `[FACT]` |
| `gallery[].url` | `EntityImage` (`src/types.ts:78-83`) | `string` | Documento Raíz `/novels/{novelId}` (`entities[].gallery[]`) e IndexedDB | `EntityModal.tsx:323-368` | WebP, JPEG, PNG, URLs remotas | Canvas 1200x1200 (0.85). Re-compresión en `firebase.ts:578` a 640x640 si `JSON.stringify` excede umbral interno de 280.000 caracteres `[FACT]` |
| `whiteboard` (Entidad) | `WorldEntity` (`src/types.ts:100`) | `MoodboardCanvas?` | **Documento Raíz `/novels/{novelId}`** (`entities[].whiteboard`) e IndexedDB | `EntityModal.tsx`, `VisualBoardView.tsx` | Items, notas, imágenes, documentos | No segregado. Permanece en el documento raíz `[FACT]` |
| `imageUrl` (Item Tablero) | `BoardItem` (`src/types.ts:197`) | `string?` | `/novels/{novelId}/boards/main` (si tablero principal) o Raíz (si entidad) e IndexedDB | `VisualBoardView.tsx:980-1055` (drop, paste, input) | WebP, JPEG, PNG | Canvas 720x720 (0.70) `[FACT]` |
| `fileData` (Item Tablero) | `BoardItem` (`src/types.ts:194`) | `string?` | `/novels/{novelId}/boards/main` (si tablero principal) o Raíz (si entidad) e IndexedDB | `AddResourceModal.tsx:98-120` | PDF, DOC, DOCX, TXT, MD | **Ninguna**. Base64 crudo completo vía `readAsDataURL` `[FACT]` |
| Blobs de Exportación | `src/utils/docxExport.ts`, `src/utils/storage.ts` | `Blob` | Memoria Volátil (RAM) | Acciones de exportación (.docx, .nvl, .json, .txt) | DOCX, NVL, JSON, TXT | Transitorio. Creado con `URL.createObjectURL` y revocado inmediatamente `[FACT]` |
| Lectura de Archivos Proyecto | `src/components/home/HomeDashboard.tsx`, `src/App.tsx`, `src/components/Navbar.tsx` | `string` | Memoria Volátil (RAM) | Diálogo de importación (.nvl, .json) | JSON texto | Transitorio vía `FileReader.readAsText` `[FACT]` |

---

## 2. Clasificación Formal de Hallazgos

De acuerdo con la taxonomía arquitectónica de Novelore, los datos del sistema se clasifican formalmente en:

- **Clase A — Datos Textuales y Metadatos**: Información alfanumérica estructurada y de tamaño acotado.
- **Clase B — Asset Binario**: Cargas binarias sustanciales representadas internamente como Data URLs, Base64 o Blobs.
- **Clase C — Referencia a Asset**: Identificadores o URLs ligeras que apuntan a un asset externo o cloud.
- **Clase D — Caso Ambiguo / Fronterizo**: Estructuras polimórficas que actualmente alternan entre Clase B y Clase C.

### Matriz de Clasificación de Campos

| Campo / Elemento | Clasificación Actual | Justificación Técnica |
|---|---|---|
| `NovelProject.coverUrl` | **Clase D (Ambiguo)** `[FACT]` | Almacena tanto Data URLs en Base64 (`data:image/jpeg;base64,...`) como strings con URLs HTTPS remotas. En la arquitectura objetivo debe transicionar estrictamente a **Clase C**. |
| `ProjectSettings.customFontData` | **Clase B (Asset Binario)** `[FACT]` | Contiene la totalidad del archivo binario tipográfico (`.ttf`, `.otf`, `.woff`) codificado en Base64 dentro del documento de configuración. |
| `WorldEntity.avatarUrl` | **Clase D (Ambiguo)** `[FACT]` | Admite tanto Data URLs en Base64 como URLs externas HTTP/HTTPS. Debe transicionar a **Clase C**. |
| `WorldEntity.gallery[].url` | **Clase D (Ambiguo)** `[FACT]` | Cada elemento de `gallery` puede albergar un Data URL Base64 o una URL externa. Debe transicionar a **Clase C**. |
| `BoardItem.imageUrl` | **Clase D (Ambiguo)** `[FACT]` | Puede contener una imagen en Base64 o una URL vinculada. Debe transicionar a **Clase C**. |
| `BoardItem.fileData` | **Clase B (Asset Binario)** `[FACT]` | Contiene la totalidad del archivo documental codificado en Base64 sin compresión ni validación de tamaño. |
| `BoardItem.fileName`, `fileSize`, `fileType` | **Clase A (Datos Textuales)** `[FACT]` | Metadatos descriptivos estructurados del documento adjunto. |
| `WorldEntity.avatarIcon` | **Clase A (Datos Textuales)** `[FACT]` | Cadena con el identificador del icono de Lucide (`"User"`, `"Shield"`, etc.). |
| `BoardItem.linkUrl` | **Clase C (Referencia a Asset)** `[FACT]` | URL canónica que apunta a recursos externos (Spotify, YouTube, web). |
| Blobs de Descarga (`docxExport.ts`, `storage.ts`) | **Clase A (Transitorio de Exportación)** `[FACT]` | No se persisten; se instancian en memoria para disparar descargas del navegador y se revocan inmediatamente. |

---

## 3. Mapas de Flujo de Assets Actuales

### 3.1 Flujo de Imagen de Portada (`coverUrl`)
1. **Entrada de Usuario `[FACT]`**: El usuario selecciona un archivo en `BookCover.tsx` o `HomeDashboard.tsx` (o arrastra y suelta).
2. **Lectura `[FACT]`**: `FileReader.readAsDataURL(file)` carga el contenido en memoria como string Data URL.
3. **Optimización en Cliente `[FACT]`**: Un elemento HTML5 `<canvas>` escala la imagen a un máximo de 600x900 px y exporta a `image/jpeg` con calidad 0.85. Si el renderizado en canvas falla, se aplica un fallback que emite el Data URL crudo original `[FACT]`.
4. **Mutación de Estado `[FACT]`**: Se propaga el callback `onCoverChange` o `onUploadCover`, actualizando `project.coverUrl` en el estado de React.
5. **Persistencia Local `[FACT]`**: `saveProjectLocally` en `src/lib/local-db.ts` almacena el proyecto completo en el almacén `projects` de IndexedDB, y opcionalmente en hasta 3 instantáneas en el almacén `versions`.
6. **Persistencia Cloud `[FACT]`**: `saveNovelToCloud` en `src/lib/firebase.ts` incluye `serialized.coverUrl` directamente en el payload del documento raíz `/novels/{novelId}`.
7. **Lectura y Renderizado `[FACT]`**: `BookCover.tsx` asigna directamente `src={coverUrl}` en una etiqueta `<img>`.

### 3.2 Flujo de Archivo de Fuente Propia (`customFontData`)
1. **Entrada de Usuario `[FACT]`**: El usuario selecciona un archivo `.ttf`, `.otf` o `.woff` en `RichTextEditor.tsx`.
2. **Lectura `[FACT]`**: `FileReader.readAsDataURL(file)` carga el binario completo sin compresión ni validación de tamaño `[FACT]`.
3. **Mutación de Estado `[FACT]`**: Se actualiza `project.settings.customFontData` con el string Data URL completo y `project.settings.customFontName` con un nombre sanitizado.
4. **Persistencia Local `[FACT]`**: Se persiste en IndexedDB (`projects` y snapshots en `versions`).
5. **Persistencia Cloud `[FACT]`**: Se persiste dentro del objeto `settings` en el documento raíz de Firestore `/novels/{novelId}`.
6. **Consumo `[FACT]`**: `useEffect` en `RichTextEditor.tsx` inyecta dinámicamente una etiqueta `<style id="novelore-custom-font-face">` en el `<head>` del DOM con la regla `@font-face { font-family: "..."; src: url("data:..."); font-display: swap; }`. También es consumido por `docxExport.ts` para vistas previas de exportación.

### 3.3 Flujo de Galería y Avatares de Entidades (`avatarUrl`, `gallery[].url`)
1. **Entrada de Usuario `[FACT]`**: El usuario sube una o más imágenes en `EntityModal.tsx`.
2. **Lectura y Compresión `[FACT]`**: Se lee con `FileReader.readAsDataURL`. Pasa por `compressImage()` en `src/utils/imageUtils.ts` (canvas escalado a máx 1200x1200 px, calidad 0.85 WebP o JPEG) `[FACT]`.
3. **Mutación de Estado `[FACT]`**: Se añade un objeto `EntityImage` al array `gallery` y/o se asigna a `avatarUrl`.
4. **Persistencia Local `[FACT]`**: Se persiste en IndexedDB dentro de `project.entities`.
5. **Persistencia Cloud (con Re-compresión Heurística) `[FACT]`**: Al guardar en Firestore, si la longitud de caracteres de `JSON.stringify(serialized)` excede el umbral heurístico interno de 280.000 caracteres (`src/lib/firebase.ts:561`), `saveNovelToCloud` itera sobre `serialized.entities[].gallery` y re-comprime mediante `compressDataUrlIfLarge(g.url, 40000, 640, 0.65)` a un máximo de 640x640 px. Posteriormente, todo el array `entities` se escribe en el documento raíz `/novels/{novelId}`.
6. **Consumo `[FACT]`**: Renderizado directo mediante `<img>` en `EntityModal.tsx`, `WorldbuildingHub.tsx`, `RelationshipMapView.tsx` y `SceneInspector.tsx`.

### 3.4 Flujo de Documentos Adjuntos en Tablero (`fileData`)
1. **Entrada de Usuario `[FACT]`**: El usuario selecciona un archivo PDF, DOC o TXT en `AddResourceModal.tsx`.
2. **Lectura `[FACT]`**: `FileReader.readAsDataURL(file)` convierte el archivo binario completo a Data URL en memoria. **No existe validación de tamaño máximo ni compresión** `[FACT]`.
3. **Mutación de Estado `[FACT]`**: Se crea un `BoardItem` con `type: "link"`, `linkType: "document"`, y `fileData: dataUrl`.
4. **Persistencia Local `[FACT]`**: Se almacena en IndexedDB como parte de `project.whiteboard.items` (tablero principal) o `entity.whiteboard.items` (tablero de entidad).
5. **Persistencia Cloud `[FACT]`**:
   - Si pertenece al tablero principal: se segrega a `/novels/{novelId}/boards/main` (y fallback `/data/whiteboard`).
   - Si pertenece a la pizarra de una entidad (`WorldEntity.whiteboard`): **no se segrega a subcolecciones** y se almacena directamente en el documento raíz `/novels/{novelId}` dentro del array `entities[]` `[FACT]`.
6. **Consumo `[FACT]`**: `BoardResourceCard.tsx` permite descargar el archivo mediante enlace directo de datos (`a.href = item.fileData`). `PdfPreviewModal.tsx` convierte el string Data URL a `Uint8Array` mediante `window.atob()` y lo renderiza en un canvas utilizando `pdfjs-dist`.

---

## 4. Análisis de Rendimiento, Memoria y Cuotas

### 4.1 Análisis de Base64 y Sobrecarga Teórica
- **Overhead Matemático de Base64 `[FACT]`**: En la codificación Base64 estándar, cada grupo de 3 bytes de datos binarios se representa mediante 4 caracteres ASCII imprimibles. Esto introduce una sobrecarga teórica determinista de exactamente $\approx 33,33\%$ respecto del tamaño binario puro (un factor de $4/3$).
- **Distinción entre Tamaños de Representación `[FACT]`**:
  - *Tamaño binario original*: Bytes crudos del archivo (ej. Blob o File en el sistema de archivos).
  - *Tamaño de la cadena Base64*: Longitud en caracteres UTF-16 del Data URL (`data:[mime];base64,...`).
  - *Tamaño del JSON serializado*: Cantidad total de caracteres generada por `JSON.stringify()`.
  - *Tamaño del documento Firestore*: Bytes binarios calculados internamente por Firestore (que no coinciden linealmente con `JSON.stringify().length`).
  - *Copias en IndexedDB*: Almacenamiento local del objeto en `projects` y en `versions`.
- **Riesgo de Extrapolación `[RISK]`**: El overhead de Base64 afecta exclusivamente al campo que contiene la cadena, no a la totalidad del manuscrito ni a las propiedades textuales.
- **Riesgo de Bloqueo del Hilo Principal `[RISK]`**: La serialización y deserialización síncrona mediante `JSON.stringify()` y `JSON.parse()` en el hilo principal (*main thread*) de objetos que contengan cadenas Base64 de longitud considerable introduce un riesgo potencial de latencia o degradación en la fluidez de la interfaz durante guardados frecuentes.
- **Determinación del Impacto Real `[OPEN QUESTION]`**: El impacto empírico exacto en milisegundos de CPU y consumo de memoria heap debe determinarse mediante benchmarks reproducibles sobre proyectos con cargas representativas.

### 4.2 Almacenamiento Local en IndexedDB
- **Estructura Actual `[FACT]`**: La base de datos local `novelore-local` mantiene el proyecto activo en el almacén `projects` y hasta 3 instantáneas históricas en el almacén `versions` (`MAX_PROJECT_VERSIONS = 3` en `src/lib/local-db.ts:74`).
- **Riesgo de Amplificación Local `[RISK]`**: Los assets binarios embebidos en Base64 pueden aumentar significativamente el tamaño de los datos persistidos localmente, especialmente cuando el proyecto activo y las versiones contienen copias del mismo contenido.
- **Medición de Cuota Local `[OPEN QUESTION]`**: El consumo real en disco/cuota de IndexedDB varía según el motor de base de datos del navegador (IndexedDB de Chromium, WebKit o Gecko) y debe evaluarse mediante pruebas reproducibles.

### 4.3 Límites de Documento en Firestore vs. Heurísticas Internas de Novelore
- **Límite Hard de Firestore `[FACT]`**: Google Cloud Firestore impone un límite estricto de **1.048.576 bytes ($\approx 1$ MiB)** por documento. Si la representación interna de un documento excede este límite, la API de Firestore rechaza la operación con el error `ResourceExhausted` o `invalid-argument`.
- **Naturaleza de los Umbrales Internos de Novelore `[FACT]`**:
  - `280.000` caracteres en `src/lib/firebase.ts:561`: Es un umbral heurístico preventivo programado en el cliente para activar la re-compresión de imágenes de galería antes de que el documento se acerque al límite de Firestore. **No es una cuota impuesta por Firebase**.
  - `550.000` caracteres en `src/lib/firebase.ts:311`: Es un umbral heurístico histórico programado en el cliente a partir del cual Novelore segregaba la pizarra hacia `/data/whiteboard`. **No es una cuota impuesta por Firebase**.
  - `JSON.stringify().length` **no es una medición directa del tamaño en bytes del documento de Firestore** `[FACT]`. Firestore serializa a nivel de protocolo binario interno con metadatos adicionales por campo.
- **Riesgo de Saturación por Carga no Validada `[RISK]`**: Debido a que `AddResourceModal.tsx` no valida el tamaño máximo de los documentos adjuntos (`fileData`) y `RichTextEditor.tsx` no valida el tamaño de los archivos tipográficos (`customFontData`), un archivo de tamaño suficiente puede provocar que el documento supere el límite de 1 MiB de Firestore, ocasionando el rechazo del guardado en la nube.

---

## 5. Arquitectura Objetivo: Separación de Metadatos y Binarios `[PROPOSED]`

La arquitectura conceptual propuesta para la gestión de assets y binarios en fases futuras se fundamenta en la **separación de responsabilidades**:
1. **Firestore**: Almacena metadatos estructurados, referencias tipadas e identificadores de estado (**Clase A** y **Clase C**).
2. **Firebase Storage**: Almacena los objetos binarios puros organizados jerárquicamente por usuario y novela.
3. **Caché Local en Cliente**: Mecanismo para posibilitar trabajo offline y evitar descargas redundantes.

```text
ARQUITECTURA OBJETIVO DE ASSETS [PROPOSED]:

Cliente (Novelore App)
   │
   ├── 1. Upload Binario ──► Firebase Storage
   │                          └── /users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}
   │
   ├── 2. Metadatos / Ref ──► Firestore
   │                          ├── /novels/{novelId} (AssetReference en cover, settings, entities)
   │                          └── /novels/{novelId}/boards/main (AssetReference en items)
   │
   └── 3. Cache Local ──────► IndexedDB / Memoria [PROPOSED]
```

---

## 6. Convención Única de Rutas en Firebase Storage `[PROPOSED]`

Para evitar inconsistencias en el diseño, se establece una **convención canónica única** para todas las rutas de assets en Firebase Storage:

```text
/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}
```

### Ejemplos Estrictos de Rutas por Tipo de Asset:
- Portadas: `/users/UID/novels/NID/assets/cover/ASSET_ID`
- Avatares de Entidad: `/users/UID/novels/NID/assets/entity_avatar/ASSET_ID`
- Galería de Entidad: `/users/UID/novels/NID/assets/entity_gallery/ASSET_ID`
- Imágenes de Tablero: `/users/UID/novels/NID/assets/board_image/ASSET_ID`
- Documentos de Tablero: `/users/UID/novels/NID/assets/board_document/ASSET_ID`
- Fuentes Tipográficas: `/users/UID/novels/NID/assets/custom_font/ASSET_ID`

*Nota: Esta estructura es un diseño arquitectónico conceptual; no ha sido implementada en el código ni configurada en Firebase.*

---

## 7. Revisión y Clasificación del Modelo `AssetReference` `[PROPOSED]`

A fin de evitar un modelo sobrecargado, se analiza individualmente cada campo candidato clasificándolo según su necesidad funcional:

### 7.1 Clasificación de Campos Candidatos

| Campo | Clasificación | Justificación Arquitectónica |
|---|---|---|
| `id` | `[REQUIRED CANDIDATE]` | Identificador único e inmutable del asset dentro del proyecto. |
| `novelId` | `[REQUIRED CANDIDATE]` | Identificador de la novela a la que pertenece el asset; requerido para validar coherencia con la ruta. |
| `ownerId` | `[REQUIRED CANDIDATE]` | UID del autor propietario; requerido para coherencia de seguridad con Firebase Auth. |
| `assetType` | `[REQUIRED CANDIDATE]` | Dominio del asset (`cover`, `entity_avatar`, etc.); define la subruta y reglas de validación. |
| `storagePath` | `[REQUIRED CANDIDATE]` | Ruta canónica relativa en Firebase Storage (`/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}`). |
| `mimeType` | `[REQUIRED CANDIDATE]` | Tipo MIME validado, indispensable para interpretar el archivo y determinar el visor correspondiente. |
| `sizeBytes` | `[REQUIRED CANDIDATE]` | Tamaño exacto en bytes del archivo binario; permite mostrar metadatos y validar cuotas sin descargar el archivo. |
| `createdAt` | `[REQUIRED CANDIDATE]` | Marca temporal de creación para auditoría y ordenamiento. |
| `originalName` | `[OPTIONAL]` | Nombre de archivo original del usuario; útil para documentos de tablero o descargas, prescindible para portadas. |
| `hash` | `[OPTIONAL]` | Hash criptográfico (MD5/SHA-256); útil para deduplicación e integridad, no crítico para la fase inicial. |
| `dimensions` | `[OPTIONAL]` | Ancho, alto y aspect ratio; relevante para imágenes, no aplicable a fuentes ni documentos. |
| `metadata` | `[OPTIONAL]` | Metadatos especializados (ej. nombre de familia tipográfica o páginas de PDF). |
| `updatedAt` | `[OPTIONAL]` | Marca temporal de modificación; si los assets son inmutables por diseño, coincide con `createdAt`. |
| `downloadUrl` | `[OPEN QUESTION]` | Véase análisis detallado en Sección 8. |
| `localBlobKey` | `[OPEN QUESTION]` | Véase análisis detallado en Sección 15 sobre caché local. |

### 7.2 Interfaz Minimalista Candidata `[PROPOSED]`

```typescript
/**
 * Modelo minimalista candidato para referencia a assets en Firestore [PROPOSED]
 * No implementado en código fuente.
 */
export interface AssetReferenceCore {
  id: string;                                                                                     // [REQUIRED CANDIDATE]
  novelId: string;                                                                                // [REQUIRED CANDIDATE]
  ownerId: string;                                                                                // [REQUIRED CANDIDATE]
  assetType: "cover" | "entity_avatar" | "entity_gallery" | "board_image" | "board_document" | "custom_font"; // [REQUIRED CANDIDATE]
  storagePath: string;                                                                            // [REQUIRED CANDIDATE]
  mimeType: string;                                                                               // [REQUIRED CANDIDATE]
  sizeBytes: number;                                                                              // [REQUIRED CANDIDATE]
  createdAt: string;                                                                              // [REQUIRED CANDIDATE]

  // Campos opcionales evaluables en implementación
  originalName?: string;                                                                          // [OPTIONAL]
  hash?: string;                                                                                  // [OPTIONAL]
  downloadUrl?: string;                                                                           // [OPEN QUESTION]
}
```

---

## 8. Análisis Arquitectónico: `downloadUrl` vs. `storagePath` `[OPEN QUESTION]`

No se asume que una URL de descarga tokenizada deba persistirse de forma permanente en Firestore. Se analizan formalmente las dos alternativas:

### Alternativa A: Almacenar `downloadUrl` en Firestore
- **Ventajas**:
  - Renderizado directo en elementos HTML estándar (`<img src={ref.downloadUrl}>`) sin llamadas asíncronas previas.
  - Simplicidad en componentes de UI.
- **Desventajas**:
  - Las URLs generadas por `getDownloadURL()` contienen un token de descarga. Si el documento se comparte o filtra, cualquiera con la URL puede acceder al binario sin sesión activa mientras el token no se revoque.
  - La revocación de un token invalida la URL en todos los clientes, obligando a reescribir el documento de Firestore.
  - Si el bucket se migra o reconfigura, las URLs absolutas quedan rotas.

### Alternativa B: Almacenar únicamente `storagePath` y resolver el acceso dinámicamente
- **Ventajas**:
  - Seguridad estricta gobernada por las reglas de Firebase Storage en cada solicitud.
  - Desacoplamiento total: los documentos en Firestore no contienen URLs absolutas ni tokens sensibles.
  - Facilidad para rotar buckets, dominios o políticas de acceso.
- **Desventajas**:
  - Requiere una operación asíncrona del SDK (`getDownloadURL()` o descarga de blob) antes de renderizar el asset.
  - Puede introducir latencia percibida en la UI si no se implementa una capa de caché en memoria de URLs resueltas.

> **Estado**: `[OPEN QUESTION]`. La decisión final debe adoptarse durante la implementación práctica evaluando la latencia percibida y los requisitos de seguridad.

---

## 9. Análisis de Ownership y Autorización en Firebase Storage

### 9.1 Distinción entre Validación de Ruta y Ownership del Manuscrito
- `[FACT]`: La ruta `/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}` contiene explícitamente `userId` y `novelId`.
- `[RISK]`: En las reglas de Firebase Storage, validar `request.auth.uid == userId` comprueba que el usuario autenticado está escribiendo dentro de su propio árbol de rutas (`/users/{userId}/...`), pero **no demuestra por sí solo que el usuario sea el legítimo propietario de `{novelId}` en Firestore**.
- `[OPEN QUESTION]`: Determinar durante la implementación de Storage Rules cómo validar de forma segura la relación entre `userId` y `novelId` sin introducir dependencias cruzadas de alto costo (como `firestore.get()` en Storage Rules, que presenta latencia adicional y límites de cuota específicos).

---

## 10. Separación Arquitectónica: Binarios Pesados vs. Particionamiento de Datos

Es fundamental mantener separados dos problemas conceptualmente distintos:

1. **Problema A: Datos binarios pesados embebidos** (portadas, fotos, fuentes, PDFs).
   - *Solución candidata*: Firebase Storage + `AssetReference` `[PROPOSED]`.
2. **Problema B: Estructuras de datos grandes o anidadas que no son binarios** (colecciones de entidades, nodos de pizarra, notas).
   - *Solución candidata*: Particionamiento adicional de documentos/subcolecciones en Firestore.

### Caso Específico: Pizarras de Entidades (`WorldEntity.whiteboard`)
- `[FACT]`: `WorldEntity.whiteboard` continúa persistido dentro del documento raíz en el array `entities[]`.
- `[RISK]`: Una pizarra de entidad con múltiples notas, conexiones, imágenes o documentos adjuntos puede aumentar significativamente el tamaño del documento raíz.
- **Decisión Arquitectónica**: No mover `WorldEntity.whiteboard` en esta fase ni mezclarlo de forma automática con la implementación de Storage. Cualquier segregación de pizarras de entidades a subcolecciones debe evaluarse como una decisión de particionamiento independiente.

---

## 11. Revisión de Estrategias de Migración de Base64 `[OPEN QUESTION]`

No se asume que la política de migración esté cerrada en "Lazy on Sync". Se presentan y comparan las alternativas arquitectónicas:

| Alternativa | Complejidad | Riesgo de Corrupción | Experiencia Offline | Impacto en Sync | Facilidad de Rollback |
|---|---|---|---|---|---|
| **A. Automática en Sincronización (*Lazy on Sync*)** | Media | Bajo (por novela individual) | Transparente; se difiere si no hay red | Aumenta latencia del guardado activo | Alta (afecta solo a la novela abierta) |
| **B. Explícita iniciada por el usuario (Botón en UI)** | Baja | Mínimo (usuario tiene visibilidad) | El usuario decide cuándo ejecutar con buena red | Ninguno durante la edición normal | Muy alta |
| **C. Progresiva en segundo plano (*Background Worker*)** | Alta | Medio (concurrencia con ediciones del usuario) | Requiere pausar si se pierde conexión | Nulo en edición directa | Media |
| **D. Híbrida (Explícita con sugerencia al usuario)** | Media-Alta | Bajo | Permite control manual y fallback reactivo | Controlado | Alta |

> **Estado**: `[OPEN QUESTION]`. La selección final dependerá de pruebas de usabilidad y estabilidad de red en la fase de implementación.

---

## 12. Reversibilidad y Ciclo de Vida de Datos Legacy Base64

- `[FACT]`: Actualmente IndexedDB mantiene el proyecto activo y hasta 3 versiones históricas según la arquitectura existente.
- **Riesgo sobre la Reversibilidad `[RISK]`**: La reversibilidad no está garantizada automáticamente por la existencia de IndexedDB; depende de la política de retención de versiones y de en qué momento se purguen los campos Base64.
- **Propuesta de Retención Segura `[PROPOSED]`**: Durante la migración inicial, no eliminar de inmediato los datos Base64 locales; mantenerlos en la copia local o en un campo de respaldo hasta que la sincronización en Storage y Firestore haya sido verificada.
- `[OPEN QUESTION]`: Definir durante la implementación los criterios exactos para declarar una migración como irreversible y proceder a la purga definitiva de los binarios Base64 legacy.

---

## 13. Eliminación de Assets y Ausencia de Transacción Distribuida

- `[FACT]`: Google Cloud Firestore y Firebase Storage son servicios independientes. **No existe una transacción atómica distribuida global entre ambos sistemas**.
- `[RISK]`: Puede producirse un estado parcial si una operación de eliminación en Storage falla tras una operación exitosa en Firestore, o viceversa (p. ej. documento de Firestore eliminado pero assets remanentes en Storage).
- `[PROPOSED]`: Diseñar las operaciones de borrado bajo principios de **idempotencia, estados explícitos y cleanup defensivo *best-effort***, manteniendo coherencia con las garantías establecidas en la Fase 2.2.2.

---

## 14. Política sobre Assets Huérfanos `[OPEN QUESTION]`

Se mantienen como interrogantes abiertas las políticas de gestión de assets desvinculados:
1. *Borrado Inmediato*: Eliminar de Storage en el instante en que el usuario retira un asset en la UI. Riesgo: si el usuario descarta los cambios o revierte a una versión previa en IndexedDB, el archivo ya no existe.
2. *Garbage Collection (GC)*: Tarea periódica de limpieza que identifica assets en Storage no referenciados por ningún documento activo en Firestore.
3. *Marcado como Huérfano*: Marcar metadatos como obsoletos y purgar tras un período de gracia.
4. *Cleanup exclusivo en borrado de novela*: Purgar el directorio completo de la novela únicamente al eliminar el proyecto.

> **Estado**: `[OPEN QUESTION]`. No se implementarán procesos automáticos ni Cloud Functions en esta fase.

---

## 15. Límites de Tamaño para Assets `[PROPOSED]`

Las propuestas previas de límites de tamaño (p. ej. 5 MB para imágenes, 15 MB para documentos, 3 MB para fuentes):
- `[PROPOSED]`: Constituyen únicamente propuestas iniciales de producto para evaluación futura.
- **No son límites de infraestructura de Firebase `[FACT]`**: Firebase Storage admite archivos de hasta múltiples terabytes.
- La definición final de cuotas por archivo debe establecerse como una decisión de producto durante la fase de implementación.

---

## 16. Evaluación de Caché Local en IndexedDB (`asset_blobs`) `[PROPOSED]`

La propuesta de incorporar un almacén `asset_blobs` en IndexedDB se categoriza formalmente:
- `[PROPOSED]`: Es una alternativa viable para posibilitar trabajo offline, pero no la única.
- **Alternativas Evaluables `[OPEN QUESTION]`**:
  - *Caché HTTP del navegador*: Apoyarse en los encabezados `Cache-Control` provistos por Google Cloud Storage.
  - *Caché en memoria volátil (RAM)*: Mantener URLs de objetos (`URL.createObjectURL`) durante la sesión activa.
  - *Almacén dedicado en IndexedDB*: Almacenar Blobs indexados por `assetId`.
- **Decisión**: No se modificará la estructura de IndexedDB en esta fase; la estrategia de caché local se determinará empíricamente al implementar el adaptador de Storage.

---

## 17. Comportamiento de Assets en Exportaciones Offline (.nvl / .json) `[OPEN QUESTION]`

Se documenta la interrogante abierta sobre el empaquetado de assets en copias de seguridad portables:
- *Alternativa A (Empaquetada)*: Exportar un archivo comprimido o bundle que incluya los binarios reales, garantizando portabilidad 100% desconectada.
- *Alternativa B (Solo Referencias)*: Exportar únicamente los metadatos y `storagePath` / URLs, generando archivos livianos pero dependientes de conectividad para visualizar assets.
- *Alternativa C (Híbrida)*: Diálogo de exportación donde el usuario selecciona si desea un respaldo completo con binarios o solo el manuscrito con referencias.

---

## 18. Plan de Verificación y Testing para Fases Futuras `[PROPOSED]`

Para cuando se aborde la implementación, se contemplan las siguientes pruebas:
1. **Firebase Storage Emulator**: Validación de reglas de acceso y cuotas en entorno local con `@firebase/rules-unit-testing`.
2. **Integridad Binaria**: Pruebas de conversión y consistencia de bytes entre Blobs y almacenamiento.
3. **Resiliencia ante Fallos de Red**: Simulación de desconexión durante la carga para comprobar la preservación de datos locales.
4. **Benchmarks Reproducibles**: Medición real de latencia de serialización y memoria heap con proyectos de prueba.

---

## 19. Confirmación de Restricciones Cumplidas en la Fase 2.3

En estricta observancia de los mandatos de la Fase 2.3:
- **NO se implementó Firebase Storage en el código** `[FACT]`.
- **NO se crearon Storage Rules** `[FACT]`.
- **NO se migraron ni eliminaron datos existentes en Base64** `[FACT]`.
- **NO se modificó la persistencia funcional** `[FACT]`.
- **NO se modificaron las reglas `firestore.rules`** `[FACT]`.
- **NO se implementó `AssetService`** `[FACT]`.
- **NO se modificó la UI** `[FACT]`.
- **NO se introdujo IA** `[FACT]`.
- **NO se realizaron refactors funcionales** `[FACT]`.
- La presente fase es **estrictamente de auditoría, investigación y diseño arquitectónico formal** `[FACT]`.

---

## 20. Estado Posterior: Implementación y Hardening en Fase 2.3.1 `[FACT]`

El diseño arquitectónico formalizado en este documento sirvió como base directa para la ejecución de la **Fase 2.3.1** y su posterior **Fase 2.3.1-Hardening**:
- Se implementó la abstracción de almacenamiento `StorageProvider` desacoplada del SDK de Firebase `[FACT]`.
- Se implementó `FirebaseStorageProvider` e `InMemoryStorageProvider` `[FACT]`.
- Se implementó `AssetService` con validación estricta de MIME types, límites de tamaño propuestos `[PROPOSED]`, paths canónicos y desacoplamiento estricto mediante inyección en constructor `[FACT]`.
- Se creó y endureció `storage.rules` protegiendo `/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}` mediante ABAC y validación explícita de `contentType in [...]` `[IMPLEMENTED]` `[TESTED: DECLARATIVE]`.
- Se documentó el estado del Firebase Storage Emulator: `[NOT TESTED — FIREBASE STORAGE EMULATOR UNAVAILABLE]` debido a la ausencia de Java en el contenedor `[FACT]`.
- Se mantuvieron los datos en Base64 existentes al 100% intactos sin alteraciones funcionales `[FACT]`.
- Para detalles de implementación, consultar la especificación técnica en `docs/asset-storage.md` `[FACT]`.

