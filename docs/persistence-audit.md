# Auditoría de Persistencia y Diseño de Arquitectura (Fase 2.0 / 2.0.1)
**Proyecto**: Novelore — Suite Integrada para Escritores  
**Fase del Roadmap**: Fase 2.0 (Auditoría y Diseño) / Fase 2.0.1 (Corrección Documental)  
**Estado**: Auditoría Técnica Conservadora / Propuesta para Fase 2.1  
**Fecha de Revisión**: Septiembre 2026  
**Autores**: Antigravity / DeepMind AI Coding Agent

---

## 1. Executive Summary

Novelore es una aplicación web para escritores estructurada bajo una filosofía **local-first**, complementada con sincronización opcional en tiempo real en la nube a través de Google Firebase (Authentication y Cloud Firestore).

La presente auditoría técnica documenta el estado real y verificado de la persistencia de datos (Fase 2.0 / 2.0.1). Sigue estrictamente la regla rectora: **«Analyze First. Do Not Migrate Yet. Do Not Refactor Yet»**.

### Taxonomía de Evidencia Utilizada:
- **`[FACT]`**: Comportamiento, umbral o estructura verificado directamente en el código fuente.
- **`[MEASURED]`**: Dato cuantitativo obtenido mediante medición empírica reproducible en el entorno.
- **`[ESTIMATE]`**: Estimación analítica teórica explícitamente identificada como aproximación.
- **`[RISK]`**: Evaluación cualitativa de riesgo arquitectónico o de integridad de datos.
- **`[PROPOSED]`**: Diseño conceptual propuesto para fases futuras; no implementado actualmente.
- **`[OPEN QUESTION]`**: Decisión arquitectónica pendiente de resolución técnica o decisión humana.

### Hallazgos Principales de la Auditoría:
1. **`[FACT]` Monolito de Dominio en `NovelProject`**: Todo el estado narrativo (metadatos, estructura jerárquica de actos/capítulos/escenas, texto íntegro del manuscrito, códex, relaciones, líneas temporales, beats, configuraciones y lienzo de pizarra) reside en una única interfaz de TypeScript en memoria (`src/types.ts`).
2. **`[FACT]` Duplicación Serializada en Almacenamiento Local**: Cada mutación reactiva del proyecto desencadena el guardado independiente del objeto serializado en dos claves de almacenamiento (`novelist_current_project_v1` y `novelist_project_{id}`). Adicionalmente, el subsistema de versiones almacena hasta 3 instantáneas completas en `novelist_versions_{id}`.
3. **`[RISK]` Riesgo de Agotamiento de Cuota en Almacenamiento Local**: `localStorage` cuenta con una cuota limitada cuya capacidad efectiva varía según el navegador, la plataforma, el contexto de almacenamiento y las políticas del entorno. El almacenamiento repetido de copias completas independientes puede agotar la cuota disponible conforme el proyecto y sus instantáneas crecen.
4. **`[FACT]` Captura Silenciosa de Excepciones de Almacenamiento**: `saveCurrentProject` (`src/utils/storage.ts`) captura cualquier excepción arrojada por `localStorage.setItem` y únicamente emite `console.error`. No expone un estado de fallo de persistencia a la interfaz ni notifica al usuario.
5. **`[FACT]` Distinción entre Límite Externo de Firestore y Umbrales Internos de Novelore**:
   - **Límite externo de Firestore `[FACT]`**: Cloud Firestore impone un límite estricto de aproximadamente 1 MiB (1,048,576 bytes) por documento individual.
   - **Umbrales internos de Novelore `[FACT]`**: Novelore no calcula el tamaño en bytes de los documentos en Firestore. En su lugar, evalúa la longitud de la cadena serializada (`jsonString.length`) en caracteres como heurística de seguridad:
     - `jsonString.length > 280000` (caracteres): activa la recompresión de imágenes en lienzo y códex mediante Canvas.
     - `jsonString.length > 550000` (caracteres): activa la segregación de la pizarra raíz hacia la subcolección `/novels/{novelId}/data/whiteboard`.
6. **`[FACT]` Manejo de Archivos Binarios en Base64**:
   - `AddResourceModal.tsx` permite adjuntar archivos PDF y documentos locales en la pizarra, serializándolos directamente como Data URLs Base64 en `item.fileData`. Este campo no es procesado por la rutina de compresión de imágenes.
   - `RichTextEditor.tsx` permite cargar fuentes tipográficas (`.ttf`, `.otf`, `.woff`) como Data URLs Base64 en `project.settings.customFontData`. Este campo permanece en el documento raíz y no es procesado por la rutina de compresión ni por el offloading de pizarra.
   - Los tableros visuales de entidades (`entity.whiteboard`) permanecen siempre en el documento raíz y nunca se segregan a subcolecciones.
7. **`[PROPOSED]` Recomendaciones para Fase 2.1**:
   - Transicionar la persistencia local de proyectos e instantáneas a **IndexedDB** (`[PROPOSED]`).
   - Adoptar una arquitectura particionada en Firestore (`[PROPOSED]`), segregando la prosa continua del manuscrito y los lienzos visuales en subcolecciones dedicadas con versionado de esquema (`schemaVersion`).

---

## 2. Current Architecture (Arquitectura Actual) `[FACT]`

El sistema de persistencia opera en un modelo cliente-servidor con prioridad local (*local-first*):

```
[Escritor / UI React]
         │
         ▼
[React State: project (App.tsx)] ◄─── Single Source of Truth en Runtime [FACT]
         │
    ┌────┴───────────────────────────────────────┐
    ▼ Síncrono en cada cambio                    ▼ Asíncrono con Debounce de 1800ms
[Local Storage Layer]                       [Cloud Sync Layer (Firebase Firestore)]
  ├── novelist_current_project_v1             ├── saveNovelToCloud()
  ├── novelist_project_{id}                   ├── Compresión imágenes (si jsonString.length > 280,000 chars)
  ├── novelist_project_list_v1                ├── Segregación pizarra (si jsonString.length > 550,000 chars)
  └── novelist_versions_{id}                  ├── setDoc(/novels/{id}, { merge: true })
                                              └── onSnapshot(/novels/{id}) Real-time Listener
```

---

## 3. Data Flow (Ciclo de Vida de los Datos) `[FACT]`

### 3.1. Flujo de Creación `[FACT]`
1. **Acción**: El usuario solicita crear una novela en `HomeDashboard.tsx` o se invoca `createNewProject()` / `createBlankProject()` en `src/utils/storage.ts`.
2. **Estado Inicial**: Se genera un identificador (`proj-${Date.now()}`), timestamps ISO (`createdAt`, `updatedAt`), jerarquía narrativa inicial (Acto I, Capítulo 1, Escena 1), 2 pistas de timeline, 6 beats de historia y colecciones vacías para códex, relaciones y pizarra.
3. **Escritura Local**:
   - `saveCurrentProject(newProject)` escribe en `localStorage.setItem("novelist_current_project_v1", JSON.stringify(updated))`.
   - Escribe en `localStorage.setItem("novelist_project_" + updated.id, JSON.stringify(updated))`.
   - `updateProjectIndexMeta(updated)` actualiza el catálogo ligero en `novelist_project_list_v1`.
4. **Sincronización en la Nube**: Si existe un usuario autenticado (`currentUser`), el hook de efecto en `App.tsx` agenda el guardado en la nube tras un retardo de 1800 ms.

### 3.2. Flujo de Edición `[FACT]`
1. **Acción**: Edición de texto en `RichTextEditor.tsx`, modificación de fichas en `EntityModal.tsx`, organización en `CorkboardView.tsx` o manipulación del lienzo en `VisualBoardView.tsx`.
2. **Transición React**: Se ejecuta `setProject(...)` en `App.tsx`.
3. **Persistencia Local Reactiva**:
   - `useEffect([project])` en `App.tsx` ejecuta síncronamente `saveProject(project)`.
   - Se serializa el proyecto completo en `CURRENT_PROJECT_KEY` y en `novelist_project_{id}`.
4. **Instantáneas de Versiones**:
   - Un temporizador a intervalos en `App.tsx` invoca `saveProjectVersion(project)` cada 90 segundos.
   - Si han transcurrido más de 45 segundos desde la última versión y se detecta avance en el recuento de palabras o escenas, almacena una copia completa del proyecto dentro del array en `novelist_versions_{id}` (máximo 3 copias).
5. **Persistencia Cloud con Debounce**:
   - `useEffect([authUser, project])` reinicia un temporizador de 1800 ms.
   - Establece `cloudSyncStatus = "saving"`.
   - Al expirar el debounce, invoca `saveNovelToCloud(projToSave, sessionId, { checkConflict: false })`.

### 3.3. Flujo de Sincronización Cloud `[FACT]`
1. **Comprobación de Condiciones**: Descarta proyectos demo, verifica `navigator.onLine`, comprueba autenticación activa no anónima y valida coincidencia de `project.ownerId` con el UID autenticado.
2. **Serialización y Metadatos de Sesión**: Clona el proyecto agregando `ownerId`, `userId`, `userEmail`, `updatedAt` y `lastModifiedBySessionId` (obtenido de `sessionStorage`).
3. **Evaluación de Heurísticas de Longitud Serializada**:
   - Evalúa `jsonString = JSON.stringify(serialized)`.
   - Si `jsonString.length > 280000` (caracteres): ejecuta `compressDataUrlIfLarge` sobre imágenes mayores a 40,000 caracteres presentes en `whiteboard.items`, `entities[].whiteboard.items` y `entities[].gallery`.
   - Si `jsonString.length > 550000` (caracteres): escribe el objeto de pizarra en `/novels/{id}/data/whiteboard` mediante `setDoc` y reemplaza la propiedad raíz por `{ isStoredInSubcollection: true, items: [] }`.
4. **Escritura en Firestore**:
   - Ejecuta `setDoc(doc(database, "novels", project.id), serialized, { merge: true })` con hasta 3 intentos y backoff exponencial (350 ms, 700 ms).
   - En caso de error que contenga cadenas indicativas de exceso de tamaño (`exceeds maximum size`), activa el plan de contingencia de offloading de pizarra y reintenta la escritura.

### 3.4. Flujo de Carga y Escucha `[FACT]`
1. **Carga Local al Inicio**: `loadActiveProject()` lee `novelist_current_project_v1`. Si no es válido, recurre a `loadProjectById` o a la plantilla demo inicial.
2. **Carga Remota**: `loadNovelFromCloud(novelId)` consulta el documento `/novels/{novelId}`. Si `isStoredInSubcollection === true`, realiza una lectura complementaria a `/novels/{novelId}/data/whiteboard` y reconstruye `whiteboard.items`.
3. **Escucha en Tiempo Real**: `subscribeToNovel` escucha `/novels/{novelId}`. Filtra escrituras locales pendientes (`snap.metadata.hasPendingWrites`) y eventos de la misma pestaña (`lastModifiedBySessionId === currentSession`). Si existen cambios locales recientes sin sincronizar (`msSinceLastEdit < 4000`), abre `ConflictModal`; de lo contrario, incorpora la actualización remota a la memoria y al almacenamiento local.

---

## 4. Inventario de Capas de Persistencia

| Capa | Clasificación | Tecnología | Identificador / Clave | Frecuencia de Escritura | Riesgo de Pérdida | Límite Técnico Documentado |
|---|---|---|---|---|---|---|
| **Estado React** | `[FACT]` | Memoria RAM | `project`, `latestProjectRef` en `App.tsx` | En cada pulsación / interacción | Volátil ante recarga si no se persiste | Capacidad de memoria del proceso |
| **Proyecto Activo Local** | `[FACT]` | Web Storage (`localStorage`) | `novelist_current_project_v1` | Síncrona en cada mutación reactiva | `[RISK]` Bajo | Cuota del navegador `[FACT]` |
| **Ranura de Proyecto Local** | `[FACT]` | Web Storage (`localStorage`) | `novelist_project_{id}` | Síncrona en cada mutación reactiva | `[RISK]` Bajo | Cuota del navegador `[FACT]` |
| **Índice de Proyectos** | `[FACT]` | Web Storage (`localStorage`) | `novelist_project_list_v1` | Al crear, renombrar o eliminar proyectos | `[RISK]` Bajo | Cuota del navegador `[FACT]` |
| **Historial de Versiones** | `[FACT]` | Web Storage (`localStorage`) | `novelist_versions_{projectId}` | Cada 90 segundos (si hay avance en texto) | `[RISK]` Bajo | Cuota del navegador `[FACT]` |
| **Preferencias de Usuario** | `[FACT]` | Web Storage (`localStorage`) | `novelore_user_theme`, `novelore_user_accent`, etc. | Al modificar ajustes de interfaz | `[RISK]` Nulo | Cuota del navegador `[FACT]` |
| **Identificador de Sesión** | `[FACT]` | Web Storage (`sessionStorage`) | `novelore_client_session_id` | Al inicializar la pestaña | Volátil por pestaña | Cuota de sesión `[FACT]` |
| **Portapapeles de Tablero** | `[FACT]` | Web Storage (`sessionStorage`) | `novelore_board_clipboard` | Al copiar elementos en el tablero visual | Volátil por pestaña | Cuota de sesión `[FACT]` |
| **Documento Raíz Cloud** | `[FACT]` | Cloud Firestore | `/novels/{novelId}` | Debounce de 1800 ms tras edición | `[RISK]` Muy bajo | ~1 MiB (1,048,576 bytes) `[FACT]` |
| **Subcolección Pizarra** | `[FACT]` | Cloud Firestore | `/novels/{novelId}/data/whiteboard` | Condicional (`jsonString.length > 550000`) | `[RISK]` Bajo | ~1 MiB (1,048,576 bytes) `[FACT]` |
| **Archivos Propietarios** | `[FACT]` | Exportación Blob / URL | Archivo descargable `.nvl` (formato JSON) | Manual a solicitud del usuario | Depende del disco local | Capacidad de almacenamiento del usuario |

---

## 5. Auditoría del Modelo `NovelProject` `[FACT]`

El modelo raíz definido en `src/types.ts` consta de 20 campos:

| Campo | Tipo TypeScript | Obligatorio | Clasificación | Frecuencia de Modificación | Contiene Prosa Extensa | Contiene Datos Binarios / Base64 |
|---|---|---|---|---|---|---|
| `id` | `string` | Sí | Metadata | Inmutable | No | No |
| `ownerId` | `string` | Opcional | Metadata | Inmutable tras creación remota | No | No |
| `title` | `string` | Sí | Metadata | Baja | No | No |
| `subtitle` | `string` | No | Metadata | Baja | No | No |
| `author` | `string` | Sí | Metadata | Muy baja | No | No |
| `genre` | `string` | Sí | Metadata | Muy baja | No | No |
| `coverUrl` | `string` | No | Media | Rara | No | **Sí** (Data URL Base64 o URL remota) |
| `logline` | `string` | Sí | Texto | Baja | Texto breve | No |
| `synopsis` | `string` | Sí | Texto | Baja | Texto estructurado | No |
| `createdAt` | `string` | Sí | Metadata | Inmutable | No | No |
| `updatedAt` | `string` | Sí | Metadata | Continua (en cada cambio) | No | No |
| `isDemo` | `boolean` | No | Metadata | Fijo | No | No |
| `settings` | `ProjectSettings` | Sí | Config / Media | Baja | No | **Sí** (`customFontData` en Base64) |
| `acts` | `Act[]` | Sí | Estructura / Prosa | Continua | **Sí** (`scenes[].content`) | No |
| `entities` | `WorldEntity[]` | Sí | Códex / Media | Media | Sí (notas y descripciones) | **Sí** (`avatarUrl`, `gallery[]`, `whiteboard`) |
| `relationships` | `Relationship[]` | Sí | Estructura | Baja | No | No |
| `relationshipPositions` | `Record<string, {x,y}>` | No | Estructura | Media | No | No |
| `timelineTracks` | `TimelineTrack[]` | Sí | Estructura | Muy baja | No | No |
| `timelineEvents` | `TimelineEvent[]` | Sí | Estructura / Texto | Media | Texto de eventos | No |
| `storyBeats` | `StoryBeat[]` | Sí | Estructura | Baja | No | No |
| `whiteboard` | `MoodboardCanvas` | No | Lienzo / Media | Media | Notas enriquecidas | **Sí** (imágenes y `item.fileData` en Base64) |

---

## 6. Clasificación Cualitativa de Datos

- **Categoría A — Metadatos Básicos**: Identificadores, autoría, marcas temporales y configuraciones elementales. Tienen un volumen acotado y predecible.
- **Categoría B — Datos Estructurales**: Jerarquías de actos, capítulos, metadatos de escenas, eventos temporales y fichas textuales del códex. Crecen de forma proporcional a la complejidad de la trama.
- **Categoría C — Prosa Continua (Manuscrito)**: El contenido textual de `scenes[].content`. Su tamaño serializado crece de forma continua conforme avanza la redacción de la obra.
- **Categoría D — Archivos Binarios y Recursos Gráficos**: Portadas, avatares, galerías de personajes, archivos adjuntos en el tablero visual (`item.fileData`), lienzos embebidos y fuentes tipográficas personalizadas (`customFontData`). Pueden incrementar significativamente el tamaño serializado del proyecto.
- **Categoría E — Datos Derivados**: Métricas computadas en tiempo de ejecución (conteo de palabras global, resúmenes del catálogo). No requieren persistencia redundante independiente.

---

## 7. Análisis Cualitativo de Riesgo de Crecimiento `[RISK ASSESSMENT]`

| Componente del Proyecto | Patrón de Crecimiento `[FACT]` | Riesgo en Persistencia Local `[RISK]` | Riesgo en Persistencia Cloud `[RISK]` | Justificación Cualitativa del Riesgo |
|---|---|---|---|---|
| **Manuscrito (`scenes[].content`)** | Continuo | **HIGH** | **HIGH** | El volumen de texto aumenta con cada sesión de escritura y se serializa conjuntamente en el documento raíz. |
| **Lienzo Pizarra Raíz (`whiteboard`)** | Variable / Discreto | **VERY HIGH** | **VERY HIGH** | Permite adjuntar imágenes y documentos (`item.fileData`) como cadenas Base64. |
| **Códex (`entities[].gallery` y avatar)** | Acumulativo | **HIGH** | **HIGH** | La incorporación de múltiples entidades con imágenes acumuladas eleva el tamaño serializado del documento raíz. |
| **Pizarras de Entidades (`entities[].whiteboard`)** | Esporádico | **HIGH** | **CRITICAL** | A diferencia de la pizarra raíz, las pizarras de entidades **nunca se descargan** a subcolecciones. |
| **Fuente Tipográfica (`settings.customFontData`)** | Discreto (un solo paso) | **HIGH** | **CRITICAL** | Una fuente en Base64 se almacena íntegra en el documento raíz sin procesamiento de compresión. |
| **Estructura y Planificación (Beats/Timeline)** | Gradual | **LOW** | **LOW** | Contenido textual estructurado con impacto reducido en el tamaño del documento. |
| **Instantáneas de Versiones (`novelist_versions_`)** | Frecuente (cada 90s) | **CRITICAL** | N/A (Solo local) | Almacena hasta 3 copias completas adicionales del proyecto en el almacenamiento local. |

---

## 8. Auditoría de Serialización `[FACT]`

### 8.1. Transformaciones en `saveNovelToCloud` `[FACT]`
1. Se realiza un clonado profundo del proyecto inyectando metadatos de auditoría: `ownerId`, `userId`, `userEmail`, `updatedAt`, `lastModifiedBySessionId`.
2. Se evalúa la longitud de la cadena serializada: `jsonString = JSON.stringify(serialized)`.
3. **Umbral de Compresión de Imágenes**: Si `jsonString.length > 280000` (caracteres), se procesan en paralelo las imágenes cuya propiedad `url` o `imageUrl` supere 40,000 caracteres en `whiteboard.items`, `entities[].whiteboard.items` y `entities[].gallery`, redimensionándolas a un máximo de 640px de ancho/alto con calidad JPEG/WebP 0.65.
4. **Umbral de Descarga de Pizarra**: Si tras la compresión `jsonString.length > 550000` (caracteres), se guarda la pizarra en `/novels/{id}/data/whiteboard` y se reemplaza en el documento raíz por `{ isStoredInSubcollection: true, items: [] }`.
5. Se invoca `setDoc(doc(database, "novels", project.id), serialized, { merge: true })`.

### 8.2. Observaciones Técnicas sobre la Serialización:
- **`[FACT]`** La condición se evalúa sobre la longitud en caracteres de la cadena JSON (`.length`), lo que representa una heurística aproximada y no el cómputo exacto de bytes del documento en Firestore.
- **`[FACT]`** Los campos `item.fileData` (documentos en el tablero) y `project.settings.customFontData` (fuentes personalizadas) no son evaluados ni modificados por la rutina de compresión.
- **`[POTENTIAL RISK]`** La serialización y compresión sincrónica en el hilo principal de JavaScript mediante Canvas puede generar retrasos de respuesta en la interfaz durante sesiones de escritura activa.

---

## 9. Auditoría de Deserialización y Reconstrucción `[FACT]`

### 9.1. Flujo de Reconstrucción:
1. `getDoc` recupera el documento raíz `/novels/{novelId}`.
2. Si `projectData.whiteboard?.isStoredInSubcollection === true`, se efectúa una lectura a `/novels/{novelId}/data/whiteboard` para reasignar `items`.

### 9.2. Análisis de Casos de Borde:
1. **Ausencia de `ownerId` `[FACT]`**: En la nube, `loadNovelFromCloud` asigna preventivamente `user.uid` si la propiedad no estuviera presente. En local, `ownerId` es opcional para permitir uso offline sin autenticación.
2. **Ausencia de `whiteboard` `[FACT]`**: Las vistas comprueban `project.whiteboard?.items || []`, evitando excepciones de ejecución.
3. **Documento de Pizarra Presente sin Documento Raíz `[FACT]`**: `loadNovelFromCloud` consulta en primer lugar el documento raíz. Si no existe, retorna `null`. El subdocumento queda huérfano e inaccesible debido a las reglas de seguridad que requieren verificar la propiedad en el documento padre.
4. **Fallo al Leer Subcolección `[FACT]`**: Si `isStoredInSubcollection` es verdadero pero la lectura de la subcolección falla o no existe, el bloque `catch` emite una advertencia en consola y preserva el proyecto con `whiteboard.items = []`.
5. **Datos Corruptos en Almacenamiento Local `[FACT]`**: Si `JSON.parse` falla al leer `localStorage`, el sistema captura el error y recurre al proyecto demo o a uno en blanco.

---

## 10. Auditoría de Segregación de Pizarra (Whiteboard Offloading) `[FACT]`

- **Heurística de Activación**: `jsonString.length > 550000` (caracteres) en `saveNovelToCloud`, o como rescate en el bloque `catch` ante errores que indiquen superación del límite de tamaño del documento.
- **Destino**: Subcolección `/novels/{project.id}/data/whiteboard`.
- **Estructura en Documento Raíz**: Se sustituye el array de elementos por `items: []` y se establece `isStoredInSubcollection: true`.
- **`[POTENTIAL RISK]` Inconsistencia por Contracción**: Si en una edición posterior el proyecto reduce su longitud serializada por debajo del umbral de 550,000 caracteres, el código vuelve a guardar la pizarra en el documento raíz, pero no elimina el documento preexistente en `/data/whiteboard`, dejando un documento desactualizado en la base de datos.
- **`[FACT]` Exclusión de Pizarras de Entidades**: El mecanismo solo opera sobre `project.whiteboard`. Las pizarras asociadas a entidades individuales del códex no disponen de descarga a subcolección.

---

## 11. Auditoría de Compresión de Medios `[FACT]`

- **Tecnología**: API nativa de **HTML5 Canvas** (`document.createElement("canvas")` en `src/utils/imageUtils.ts`). No se utilizan librerías externas de compresión.
- **Formato**: Exportación mediante `canvas.toDataURL("image/webp", quality)` con contingencia a `image/jpeg`.
- **Comportamiento en Componentes**:
  - `BookCover.tsx`: Redimensiona imágenes a un límite de 600x900px con calidad JPEG 0.85.
  - `EntityModal.tsx`: Redimensiona imágenes de personajes a un límite de 1200x1200px con calidad 0.85.
  - `saveNovelToCloud`: Comprime imágenes mayores a 40,000 caracteres a un límite de 640x640px con calidad 0.65 cuando la cadena serializada del proyecto supera 280,000 caracteres.

---

## 12. Auditoría de Archivos y Recursos Binarios `[FACT]`

1. **Almacenamiento en Data URLs Base64**: Todas las imágenes y documentos adjuntos se almacenan directamente como cadenas de texto Base64 dentro del objeto del proyecto.
2. **Archivos No Gráficos en Pizarra**: En `AddResourceModal.tsx`, la selección de archivos locales (PDF, documentos) se procesa con `FileReader.readAsDataURL` y se asigna a `item.fileData`. Dado que la codificación Base64 incrementa el tamaño del contenido en aproximadamente un tercio y este campo no es procesado por ninguna rutina de compresión, su inclusión incrementa sustancialmente el tamaño serializado del documento.
3. **Duplicación de Referencias**: Al asignar un avatar en `EntityModal.tsx`, la misma cadena Base64 se almacena tanto en `entity.avatarUrl` como en la primera posición de `entity.gallery`.

---

## 13. Auditoría de Persistencia Local (`localStorage`)

### 13.1. Factores Observados en Código `[FACT]`
1. **Multiplicación de Copias**: El proyecto se persiste en:
   - `novelist_current_project_v1` (proyecto activo).
   - `novelist_project_{id}` (ranura por identificador).
   - `novelist_versions_{projectId}` (hasta 3 copias históricas completas).
2. **Captura Silenciosa de Errores**: `saveCurrentProject` envuelve `localStorage.setItem` en un bloque `try/catch` que emite `console.error("Failed to save project to localStorage", err)` sin notificar a la interfaz de usuario.

### 13.2. Evaluación de Capacidad del Almacenamiento Local `[FACT] & [RISK]`
- **`[FACT]` Cuota Limitada**: `localStorage` tiene una cuota limitada y su capacidad efectiva depende del navegador, la plataforma, el contexto de almacenamiento y las políticas del entorno.
- **`[RISK]` Riesgo de Saturación**: Debido a que se almacenan múltiples representaciones serializadas completas del mismo proyecto, el consumo total de almacenamiento local crece como un múltiplo del tamaño serializado del proyecto. Cuando el contenido acumulado excede la cuota disponible del entorno, se producen excepciones `QuotaExceededError` que impiden la persistencia local de nuevas modificaciones.

---

## 14. Impacto de Listeners y Concurrencia `[FACT]`

1. **Discriminación de Sesión**: Cada pestaña genera un identificador único en `sessionStorage` (`novelore_client_session_id`). El listener `onSnapshot` compara `lastModifiedBySessionId !== currentSession` para descartar eventos originados por la propia sesión activa.
2. **Protección durante Escritura Activa**: Si se recibe una instantánea remota mientras existen modificaciones locales en los últimos 4 segundos (`msSinceLastEdit < 4000`), el sistema bloquea la sobrescritura silenciosa y presenta el componente `ConflictModal`. En caso de inactividad, aplica los datos remotos en memoria y actualiza el almacenamiento local.

---

## 15. Puntos Críticos de Fallo (Single Points of Failure)

| Identificador | Clasificación | Punto Crítico | Causa Raíz | Impacto en el Usuario |
|---|---|---|---|---|
| **SPOF-1** | `[OBSERVED FACT]` | Fallo silencioso en almacenamiento local | `saveCurrentProject` captura excepciones de almacenamiento sin exponer un estado de fallo a la UI. | El escritor podría continuar editando sin advertir que las modificaciones no se están persistiendo localmente. |
| **SPOF-2** | `[POTENTIAL RISK]` | Rechazo de escritura en Firestore por tamaño | Inclusión de archivos binarios extensos (PDFs en pizarra, fuentes en settings) o manuscritos de gran extensión en un solo documento. | Rechazo de la operación de guardado en la nube por exceder el límite de documento de Firestore (~1 MiB). |
| **SPOF-3** | `[POTENTIAL RISK]` | Inconsistencia en escritura de dos fases | Fallo de red tras guardar la subcolección `/data/whiteboard` pero antes de completar la escritura del documento raíz. | La subcolección contiene datos actualizados mientras que el documento raíz retiene una versión previa. |
| **SPOF-4** | `[POTENTIAL RISK]` | Bloqueo por fuentes personalizadas | La propiedad `settings.customFontData` almacena la fuente completa en Base64 en el documento raíz sin opciones de compresión ni descarga. | Aumento drástico del tamaño del documento raíz ante la carga de una fuente tipográfica. |
| **SPOF-5** | `[POTENTIAL RISK]` | Saturación por pizarras de entidades | `entities[].whiteboard` permanece indefinidamente en el documento raíz sin mecanismo de offloading. | El documento raíz puede aproximarse al límite de tamaño debido a notas gráficas en fichas del códex. |

---

## 16. Inventario de Redundancia de Datos `[FACT]`

1. **Redundancia Local**: El proyecto activo coexiste de forma idéntica en memoria React, en `CURRENT_PROJECT_KEY` y en su clave específica `novelist_project_{id}`.
2. **Redundancia en Versiones**: El array `novelist_versions_{id}` almacena copias completas independientes del proyecto en lugar de diferencias (*diffs*) o deltas incrementales.
3. **Redundancia en Imágenes de Entidad**: El avatar de una entidad se almacena como cadena Base64 duplicada en `entity.avatarUrl` y en `entity.gallery[0].url`.
4. **Redundancia de Metadatos de Catálogo**: Ciertos campos básicos (`title`, `coverUrl`, `updatedAt`) se replican en el array de metadatos `novelist_project_list_v1`.

---

## 17. Evaluación de Alternativas Arquitectónicas `[PROPOSED]`

### Alternativa 1: Monolito Actual con Compresión de Texto `[PROPOSED - DESCARTADA]`
- *Descripción*: Mantener todo el proyecto en `/novels/{novelId}` y comprimir el payload JSON mediante librerías de compresión como LZ-String o Gzip.
- *Evaluación*: Solución paliativa temporal. No elimina el riesgo estructural ante proyectos extensos con múltiples elementos binarios y traslada una carga computacional continua a la CPU del cliente.

### Alternativa 2: Hiperfragmentación en Subcolecciones `[PROPOSED - DESCARTADA]`
- *Descripción*: Descomponer cada entidad, escena, capítulo y evento en documentos individuales de Firestore (más de 20 subcolecciones).
- *Evaluación*: Multiplica sustancialmente el número de operaciones de lectura y escritura en Firestore, incrementando la latencia en la carga inicial y complicando de forma innecesaria las transacciones offline y la resolución de conflictos.

### Alternativa 3: Arquitectura Híbrida Pragmática `[PROPOSED - RECOMENDADA]`
- *Descripción*: Conservar la estructura jerárquica y metadatos en el documento raíz, segregando únicamente los dominios de texto continuo extenso y lienzos gráficos pesados en subcolecciones específicas bajo demanda.

---

## 18. Arquitectura Objetivo Propuesta (Para Fase 2.1) `[PROPOSED]`

> **Nota de Estado**: La siguiente estructura corresponde a una **PROPUESTA TÉCNICA** para la Fase 2.1. No está implementada en el código actual.

```
FIRESTORE ESTRUCTURA PROPUESTA [PROPOSED]:

/novels/{novelId} (Documento Principal: Metadatos y Estructura)
  ├── id, ownerId, title, subtitle, author, genre, coverUrl
  ├── createdAt, updatedAt
  ├── schemaVersion: 2 [PROPOSED - actualmente no existe en el código]
  ├── settings (sin binarios de fuentes pesadas)
  ├── acts[] -> chapters[] -> scenes[] (Estructura: id, title, order, synopsis, status, sin texto de prosa)
  ├── entities[] (Atributos, notas, etiquetas; sin galerías completas en Base64)
  ├── relationships[], timelineTracks[], timelineEvents[], storyBeats[]
  └── whiteboardMeta: { itemCount, hasCustomCanvas: boolean }

SUBCOLECCIONES PROPUESTAS [PROPOSED]:

/novels/{novelId}/content/manuscript
  └── Documento consolidado con la prosa de las escenas: Record<sceneId, { content, notes }>

/novels/{novelId}/boards/main
  └── Documento con los elementos del tablero visual: { items: BoardItem[], zoom, panX, panY }

PERSISTENCIA LOCAL PROPUESTA [PROPOSED]:
- Transicionar el almacenamiento de proyectos e instantáneas a IndexedDB.
- Mantener localStorage exclusivamente para preferencias de UI ligeras (tema, paleta de acento, ID activo).
```

---

## 19. Análisis de Segregación de Dominios `[PROPOSED]`

| Dominio Narrativo | Recomendación Propuesta | Justificación Arquitectónica |
|---|---|---|
| **Metadatos y Configuración** | **Mantener en documento raíz** `[PROPOSED]` | Permite listar y renderizar encabezados de forma inmediata sin lecturas adicionales. |
| **Jerarquía de Actos y Capítulos** | **Mantener en documento raíz** `[PROPOSED]` | Estructura ligera que permite dibujar el árbol de navegación del manuscrito instantáneamente. |
| **Prosa de Escenas (`scenes[].content`)** | **Segregar a `/content/manuscript`** `[PROPOSED]` | Es el contenido de crecimiento continuo que puede comprometer el tamaño del documento raíz. |
| **Pizarra Raíz (`whiteboard`)** | **Segregar a `/boards/main`** `[PROPOSED]` | Lienzo visual requerido únicamente cuando el usuario navega a la vista de tablero. |
| **Códex (Datos Textuales)** | **Mantener en documento raíz** `[PROPOSED]` | Información requerida continuamente durante la redacción para autocompletado e inspección de personajes. |
| **Pizarras de Entidades** | **Segregar bajo demanda** `[PROPOSED]` | Necesarias únicamente al consultar la vista de moodboard de la entidad específica. |

---

## 20. Propuesta de Estrategia de Migración (Fase 2.1) `[PROPOSED]`

La estrategia de migración futura debe basarse en los principios de **seguridad, reversibilidad e incrementalidad**:

1. **Introducción de Versionado de Esquema `[PROPOSED]`**:
   - Proyectos actuales: interpretados como `schemaVersion: 1` (monolíticos).
   - Proyectos migrados: etiquetados con `schemaVersion: 2` (híbridos).
2. **Compatibilidad Hacia Atrás `[PROPOSED]`**: Los módulos de carga verificarán `schemaVersion`. Si no está definido o es igual a 1, leerán el texto directamente de `scenes[].content` en el documento raíz; si es igual a 2, cargarán la subcolección de manuscrito.
3. **Migración Perezosa (*Lazy Migration*) `[PROPOSED]`**: No se aplicarán transformaciones masivas en la base de datos. La migración de un proyecto ocurrirá de forma individual y progresiva cuando el usuario abra y guarde activamente dicho proyecto.
4. **Copia de Seguridad Previa Obligatoria `[PROPOSED]`**: Antes de escribir en el nuevo formato v2, el cliente generará automáticamente un respaldo local inmutable.

---

## 21. Invariantes de Diseño de Persistencia `[REQUIRED DESIGN INVARIANTS]`

Las fases 2.1 y posteriores deberán someterse a los siguientes principios de diseño arquitectónico:

1. **Invariante de Soberanía Local**: Ningún fallo de red, respuesta de error del servidor o pérdida de sesión en la nube debe sobrescribir o eliminar datos válidos persistidos localmente.
2. **Invariante de Integridad del Manuscrito**: Un fragmento de datos incompleto o fallido jamás reemplazará a un proyecto completo en el almacenamiento persistente.
3. **Invariante de Propiedad Inmutable**: El identificador `ownerId` no puede ser alterado ni eliminado una vez fijado en la nube.
4. **Invariante de Visibilidad de Almacenamiento**: Cualquier fallo o saturación en la cuota de almacenamiento local debe comunicarse explícitamente a la interfaz de usuario.
5. **Invariante de Tolerancia en Componentes Opcionales**: La indisponibilidad o fallo al leer una subcolección complementaria (como la pizarra) no debe impedir la carga ni la edición del manuscrito principal.
6. **Invariante de No Regresión Offline**: Todo escritor sin conexión a internet o sin cuenta de usuario debe conservar la totalidad de las funcionalidades locales del editor.

---

## 22. Matriz Cualitativa de Riesgos `[RISK ASSESSMENT]`

| Escenario de Riesgo | Probabilidad Cualitativa | Impacto Cualitativo | Estrategia de Mitigación Propuesta |
|---|---|---|---|
| Fallo no detectado de persistencia local por agotamiento de cuota | **MEDIA** | **CRÍTICO** | Transición a IndexedDB con detector de errores y notificación visual en la interfaz. |
| Rechazo de sincronización en Firestore por tamaño de documento | **MEDIA** | **CRÍTICO** | Segregación del contenido del manuscrito a una subcolección dedicada. |
| Carga de archivos binarios extensos que degraden el rendimiento | **MEDIA** | **ALTO** | Establecer restricciones de tamaño en la selección de archivos locales o incorporar almacenamiento de objetos. |
| Bloqueo temporal de la interfaz durante serializaciones pesadas | **MEDIA** | **MEDIO** | Evaluar la ejecución de serialización y compresión fuera del hilo principal o diferida en períodos de inactividad. |

---

## 23. Preguntas Abiertas (Decisiones Pendientes) `[OPEN QUESTION]`

1. **`[OPEN QUESTION]` Persistencia Local: ¿API Nativa de IndexedDB o Utilidad Ligera?**  
   Determinar si la implementación de la capa IndexedDB en `src/utils/storage.ts` debe basarse en la API nativa del navegador o en un paquete estándar y ligero (como `idb` o `idb-keyval`).
2. **`[OPEN QUESTION]` Política sobre Archivos Binarios en Tableros Visuales:**  
   Definir si los archivos PDF adjuntos deben restringirse con un límite estricto de tamaño o si su soporte debe pausarse hasta integrar un servicio de almacenamiento binario dedicado (como Firebase Storage).
3. **`[RESOLVED - Phase 2.2]` Nivel de Particionado del Manuscrito en Cloud:**  
   Resuelto mediante particionamiento atómico por escenas (`/novels/{novelId}/scenes/{sceneId}`) y tableros visuales (`/novels/{novelId}/boards/main`), evitando que el manuscrito dependa de un único documento monolítico y reduciendo drásticamente la huella del documento raíz.
4. **`[OPEN QUESTION]` Política de Retención de Versiones Locales:**  
   Determinar si el límite de 3 instantáneas en el historial de versiones debe mantenerse o ampliarse una vez que el almacenamiento local se migre a IndexedDB.

---

## 24. Recomendaciones para la Fase 2.1 `[PROPOSED]`

1. **Aislamiento de Cambios**: No modificar componentes de interfaz de usuario ni la lógica del editor de texto durante la Fase 2.1; centrar el trabajo exclusivamente en los adaptadores de persistencia (`src/utils/storage.ts` y `src/lib/firebase.ts`).
2. **Adaptador IndexedDB**: Diseñar e implementar el adaptador de IndexedDB para la persistencia de proyectos e historial de versiones, garantizando la migración transparente de los datos alojados en `localStorage`.
3. **Manejo de Errores de Persistencia**: Implementar un mecanismo explícito para capturar fallos de almacenamiento y exponer un indicador en la interfaz.
4. **Estructura Versionada**: Diseñar los contratos de datos para soportar `schemaVersion: 2` asegurando la compatibilidad retroactiva con proyectos existentes.
5. **Verificación Previa**: Realizar pruebas de carga y escenarios límite antes de activar cualquier migración de datos en entornos de producción.

---

## 25. Hardening de Consistencia Cloud y Borrado (Fase 2.2.1 & 2.2.2) `[IMPLEMENTED]`

1. **`[FACT]` Consistencia Distribuida mediante Marcador de Confirmación Lógico (`syncVersion` / `syncStatus`)**:
   - En la arquitectura particionada, las escenas se envían antes del documento raíz. No existe una transacción atómica global distribuida entre colecciones; en su lugar, se implementa un **marcador de confirmación lógico con confirmación final del manifiesto raíz**.
   - Cada guardado genera un `syncVersion` incremental único para esa generación. El estado local pasa a `syncStatus = "pending"`.
   - Si la confirmación final del manifiesto raíz falla, el proceso arroja una excepción explícita, no reporta éxito a la interfaz, y el estado local permanece en `pending`, impidiendo falsas confirmaciones.
   - El estado local solo pasa a `syncStatus = "committed"` y avanza su versión confirmada **únicamente tras la escritura exitosa del manifiesto raíz**.
2. **`[FACT]` Borrado Seguro Secuencial y Prevención de Documentos Huérfanos**:
   - El protocolo de borrado sigue un orden estricto de 9 pasos: autenticación -> existencia -> ownership -> listado de escenas -> borrado de escenas por batches -> borrado de `/boards/main` -> borrado de `/data/whiteboard` -> borrado del documento raíz -> éxito.
   - Si falla la eliminación de escenas, de `/boards/main` o de `/data/whiteboard`, la operación se aborta de inmediato y el documento raíz permanece intacto. Si un tablero no existe, se considera éxito.
   - El documento raíz se elimina **únicamente tras confirmar la eliminación exitosa de todas las subcolecciones**.
3. **`[FACT]` Limpieza Defensiva de Escenas Obsoletas como Operación Best-Effort**:
   - La limpieza de escenas obsoletas eliminadas localmente es una operación defensiva no bloqueante (`best-effort`). Si falla, puede permanecer temporalmente algún documento obsoleto en la subcolección, pero esto no aborta el guardado válido ni afecta la consistencia del manuscrito. No se presenta como una garantía de consistencia distribuida.
4. **`[FACT]` Integridad Estricta en Reglas de Seguridad**:
   - Las reglas en `firestore.rules` validan explícitamente `request.resource.data.id == sceneId` y `request.resource.data.novelId == novelId` en la subcolección `/scenes`, y `request.resource.data.novelId == novelId` en `/boards`, cerrando vectores de desalineación o suplantación de identificadores.

---

## 26. Auditoría y Arquitectura de Assets y Datos Binarios (Fase 2.3) `[AUDITED & DESIGNED]`

Documentación completa de auditoría y diseño disponible en: `docs/assets-audit.md`.

1. **`[FACT]` Inventario de Binarios Inline en Firestore e IndexedDB**:
   - Identificados 5 vectores principales de persistencia binaria inline como Data URLs / Base64: `coverUrl` (escalado en canvas a máx 600x900 JPEG 0.85 con fallback a raw), `settings.customFontData` (fuentes TTF/OTF completas en Base64 sin compresión ni validación), `entities[].avatarUrl` y `entities[].gallery[].url` (fotos de personajes y lugares), `whiteboard.items[].imageUrl` (imágenes de tableros), y `whiteboard.items[].fileData` (documentos PDF/DOC adjuntos completos en Base64 sin compresión ni validación de tamaño).
2. **`[FACT]` Hallazgo Arquitectónico en Pizarras de Entidades**:
   - Mientras que la pizarra principal del proyecto (`NovelProject.whiteboard`) se segrega a `/novels/{novelId}/boards/main`, las pizarras visuales de entidades individuales (`WorldEntity.whiteboard`) permanecen dentro del array `entities` en el documento raíz `/novels/{novelId}`. Esto se documenta como una decisión de particionamiento estructural independiente de la arquitectura de assets binarios.
3. **`[PROPOSED]` Arquitectura Objetivo (Firestore Metadatos + Firebase Storage Binarios)**:
   - Transición conceptual de Base64 inline a referencias `AssetReference` en Firestore con campos candidatos indispensables (`id`, `novelId`, `ownerId`, `assetType`, `storagePath`, `mimeType`, `sizeBytes`, `createdAt`).
   - Convención canónica única de rutas en Firebase Storage: `/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}`.
   - La persistencia de `downloadUrl` vs. resolución dinámica mediante `storagePath`, y el mecanismo de caché local (HTTP, memoria o IndexedDB), se mantienen formalmente como `[OPEN QUESTION]`.
4. **`[PROPOSED]` Ausencia de Transacción Distribuida y Cleanup de Assets**:
   - Se reconoce que no existe una transacción distribuida entre Firestore y Storage; los protocolos de eliminación se diseñan como operaciones idempotentes con limpieza defensiva best-effort.


