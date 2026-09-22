# Novelore — Arquitectura de Infraestructura de Assets y Storage (Fase 2.3.1 y Hardening)

Este documento constituye la especificación técnica y fuente de verdad para la **Fase 2.3.1: Implementación de Infraestructura de Assets y Storage** y su posterior **Fase 2.3.1-Hardening** de Novelore.

---

## 1. Resumen Ejecutivo

La infraestructura desacoplada de almacenamiento de assets y datos binarios de Novelore cumple estrictamente con los siguientes principios:

- **Desacoplamiento Absoluto del Proveedor**: La aplicación y la capa de dominio no se acoplan al SDK de Firebase Storage. Toda operación se realiza a través de la abstracción `StorageProvider`.
- **Servicio Coordinador de Dominio (`AssetService`)**: Gestiona la validación de parámetros, formatos MIME, límites de tamaño propuestos `[PROPOSED]`, identificadores seguros y la generación de modelos canónicos `AssetReference`. Recibe su `StorageProvider` mediante inyección de dependencias estricta en el constructor, sin dependencias circulares ni instanciaciones por defecto de proveedores concretos.
- **Encapsulamiento del SDK (`FirebaseStorageProvider`)**: Módulo específico que interactúa directamente con `firebase/storage`, aislando tipos, excepciones y llamadas SDK del resto de la aplicación.
- **Preparación para Futuros Proveedores**: La interfaz `StorageProvider` deja la arquitectura lista para futuros adaptadores (ej. `GoogleDriveProvider`, `OneDriveProvider`, `DropboxProvider`), aunque estos **NO están implementados actualmente**; Firebase Cloud Storage es el proveedor de almacenamiento en la nube inicial.
- **Normalización de Errores**: Todos los códigos de error específicos del proveedor (`storage/unauthorized`, `storage/object-not-found`, etc.) se mapean a una jerarquía de errores propia y tipada de Novelore (`AssetError`, `AssetPermissionError`, etc.).
- **Reglas de Seguridad (`storage.rules`) `[IMPLEMENTED]` `[TESTED: DECLARATIVE]`**: Implementadas bajo el modelo ABAC (*Attribute-Based Access Control*) protegiendo el espacio `/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}`, con validación explícita de `contentType in [...]` y hard-cap de tamaño de 30 MB.
- **Preservación Estricta de Restricciones**:
  - NO se migraron datos Base64 existentes (diferido a Fase 2.3.2).
  - NO se eliminaron datos Base64 existentes.
  - NO se modificó la lógica de sincronización existente (`saveNovelToCloud`, `loadNovelFromCloud`).
  - NO se modificó la interfaz de usuario (UI).
  - NO se implementó caché en IndexedDB (diferido a evaluación posterior).

---

## 2. Diagrama de Arquitectura de Capas

```text
┌────────────────────────────────────────────────────────┐
│              UI / Capa de Dominio                      │
│   (BookCover, RichTextEditor, EntityModal, BoardView)   │
└──────────────────────────┬─────────────────────────────┘
                           │ (Llama con AssetType, Blobs, IDs)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   AssetService                         │
│   - Valida MIME types según AssetType                  │
│   - Valida límites de tamaño propuestos [PROPOSED]     │
│   - Construye paths canónicos                          │
│   - Genera AssetReference tipado                      │
│   - Coordina URL dinámica o streaming de datos         │
│   - Recibe StorageProvider inyectado en constructor    │
└──────────────────────────┬─────────────────────────────┘
                           │ (Contrato agnóstico StorageProvider)
                           ▼
┌────────────────────────────────────────────────────────┐
│                 << StorageProvider >>                  │
│            (upload, download, delete, exists)          │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│    FirebaseStorageProvider   │  │   InMemoryStorageProvider    │
│  (Encapsula Firebase Storage │  │  (Mock / Tests unitarios     │
│   y normaliza sus errores)   │  │   sin dependencias externas) │
└──────────────┬───────────────┘  └──────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Firebase Cloud Storage      │
│  (Protegido por Storage      │
│   Security Rules)            │
└──────────────────────────────┘
```

---

## 3. Contrato Agnóstico: `StorageProvider`

Ubicación: `src/lib/assets/StorageProvider.ts`

La interfaz `StorageProvider` es pequeña, cohesiva e independiente de cualquier tecnología específica de almacenamiento:

```typescript
export interface StorageProvider {
  readonly providerName: string;

  upload(
    path: string,
    data: Blob | Uint8Array | ArrayBuffer,
    mimeType: string
  ): Promise<StorageUploadResult>;

  download(path: string): Promise<StorageDownloadResult>;

  delete(path: string): Promise<void>;

  exists(path: string): Promise<boolean>;

  resolveUrl?(path: string): Promise<string>;
}
```

### Proveedores Implementados:
1. **`FirebaseStorageProvider` (`src/lib/assets/FirebaseStorageProvider.ts`)**: Utiliza el SDK oficial `firebase/storage`, capturando excepciones nativas y convirtiéndolas a la jerarquía de errores de Novelore.
2. **`InMemoryStorageProvider` (`src/lib/assets/InMemoryStorageProvider.ts`)**: Implementación en memoria 100% libre de dependencias de red o Firebase, utilizada para pruebas unitarias automatizadas y preparada para entornos locales u offline.

### Desacoplamiento de `AssetService`:
`AssetService` no crea instancias de `FirebaseStorageProvider` de forma oculta ni importa dicho proveedor en su definición. La inyección de dependencias se realiza en el punto de composición de la aplicación, garantizando que `AssetService` sea 100% testeable y portable a otros proveedores de almacenamiento en el futuro (tales como Google Drive, OneDrive o Dropbox).

---

## 4. Modelo Canónico de Dominio: `AssetReference`

Ubicación: `src/types/assets.ts` (re-exportado en `src/types.ts`)

De acuerdo con el diseño minimalista aprobado en la auditoría de Fase 2.3, el modelo persistible en Firestore contiene únicamente los campos indispensables:

```typescript
export interface AssetReference {
  id: string;            // Identificador único inmutable (ej: cov_a1b2c3d4...)
  novelId: string;       // Identificador de la novela contenedora
  ownerId: string;       // UID del propietario autenticado
  assetType: AssetType;  // Categoría tipada del asset
  storagePath: string;   // Ruta canónica en el proveedor de storage
  mimeType: string;      // Tipo MIME validado
  sizeBytes: number;     // Tamaño exacto en bytes
  createdAt: string;     // Timestamp ISO 8601 de creación

  // Metadatos opcionales:
  originalName?: string; // Nombre original del archivo (para documentos adjuntos)
  hash?: string;         // Hash criptográfico de verificación (opcional)
  downloadUrl?: string;  // URL resuelta dinámicamente (NO obligatoria para persistencia)
}
```

### Principio Fundamental de URLs de Descarga:
- **`downloadUrl` NO se persiste como requisito primario en Firestore**: Las URLs de descarga directas pueden expirar o quedar invalidadas. La referencia canónica e inmutable es siempre `storagePath`.
- Si la UI requiere una URL directa de visualización, `AssetService.resolveAssetUrl(storagePath)` la resuelve de forma transitoria en tiempo de ejecución.

---

## 5. Convención de Storage Path Canónico

La estructura de carpetas en el bucket de almacenamiento responde a una jerarquía estricta y predecible:

```text
users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}
```

### Tipos de Asset Soportados (`AssetType`):
1. `cover`: Portada de la novela (`NovelProject.coverUrl`).
2. `entity_avatar`: Retrato de personajes o lugares (`WorldEntity.avatarUrl`).
3. `entity_gallery`: Elementos de la galería de entidades (`WorldEntity.gallery[].url`).
4. `board_image`: Imágenes insertadas en pizarras y tableros (`BoardItem.imageUrl`).
5. `board_document`: Documentos de referencia adjuntos (`BoardItem.fileData`).
6. `custom_font`: Fuentes tipográficas personalizadas (`ProjectSettings.customFontData`).

---

## 6. Jerarquía y Normalización de Errores

Ubicación: `src/lib/assets/errors.ts`

Se aísla a la UI de cualquier mensaje o código crudo del SDK de Firebase:

| Error Novelore | Código | Causa / Mapeo desde Firebase |
|---|---|---|
| `AssetValidationError` | `ASSET_VALIDATION_ERROR` | Parámetros inválidos, MIME no permitido, IDs con caracteres prohibidos o tamaño excedido. |
| `AssetAuthenticationError` | `ASSET_UNAUTHENTICATED` | Usuario sin sesión activa (`storage/unauthenticated`). |
| `AssetPermissionError` | `ASSET_PERMISSION_DENIED` | Acceso denegado por reglas de seguridad (`storage/unauthorized`, `permission-denied`). |
| `AssetNotFoundError` | `ASSET_NOT_FOUND` | El archivo no existe en la ruta dada (`storage/object-not-found`). |
| `AssetNetworkError` | `ASSET_NETWORK_ERROR` | Pérdida de conexión o reintentos agotados (`storage/retry-limit-exceeded`, `storage/canceled`). |
| `AssetUploadError` | `ASSET_UPLOAD_FAILED` | Fallo de escritura o cuota excedida (`storage/quota-exceeded`). |
| `AssetDeleteError` | `ASSET_DELETE_FAILED` | Fallo durante la eliminación física del objeto. |
| `AssetDownloadError` | `ASSET_DOWNLOAD_FAILED` | Fallo durante la descarga del objeto. |

---

## 7. Reglas de Seguridad en Cloud Storage (`storage.rules`)

Ubicación: `/storage.rules` `[IMPLEMENTED]` `[TESTED: DECLARATIVE]`

Las reglas de seguridad implementadas en `storage.rules` refuerzan las políticas de acceso a nivel de infraestructura, con validaciones explícitas de `contentType in [...]` y límite estricto de tamaño de 30 MB:

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isValidAssetType(assetType) {
      return assetType in [
        'cover', 'entity_avatar', 'entity_gallery',
        'board_image', 'board_document', 'custom_font'
      ];
    }

    function isValidImageContentType() {
      return request.resource.contentType in [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml'
      ];
    }

    function isValidDocumentContentType() {
      return request.resource.contentType in [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown'
      ];
    }

    function isValidFontContentType() {
      return request.resource.contentType in [
        'font/ttf',
        'font/otf',
        'font/woff',
        'font/woff2',
        'application/x-font-ttf',
        'application/x-font-otf',
        'application/font-woff',
        'application/font-woff2',
        'font/opentype'
      ];
    }

    function isValidContentType(assetType) {
      return (assetType in ['cover', 'entity_avatar', 'entity_gallery', 'board_image'] && isValidImageContentType()) ||
             (assetType == 'board_document' && isValidDocumentContentType()) ||
             (assetType == 'custom_font' && isValidFontContentType());
    }

    match /users/{userId}/novels/{novelId}/assets/{assetType}/{assetId} {
      allow read: if isOwner(userId) && isValidAssetType(assetType);

      allow create, update: if isOwner(userId) &&
                               isValidAssetType(assetType) &&
                               isValidContentType(assetType) &&
                               request.resource.size > 0 &&
                               request.resource.size <= 30 * 1024 * 1024;

      allow delete: if isOwner(userId) && isValidAssetType(assetType);
    }

    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Justificación Técnica de la Estrategia de Autorización `[CONSTRAINT]`:
La estrategia de autorización de Cloud Storage **no depende de `firestore.get()` ni de `firestore.exists()`** para verificar la autoría del `novelId` en Firestore. El acceso se restringe mediante la comprobación estricta de namespace `request.auth.uid == userId`.

Las razones y restricciones técnicas directas son:
1. **Restricción de Base de Datos Nombrada `[CONSTRAINT]`**: El proyecto utiliza una base de datos Firestore nombrada (`ai-studio-novelistsuitepar-9a23ef1b-b3fb-42f3-952c-35d539a09284`). La función `firestore.get()` en Storage Rules históricamente espera `/databases/(default)/...`, lo que genera problemas de incompatibilidad y errores en proyectos con bases de datos Firestore nombradas.
2. **Impacto en Latencia y Costes**: Cada subida, descarga y verificación incurriría en una lectura de documento de Firestore adicional por cada asset binario, añadiendo latencia de red y coste de facturación sin aportar beneficio de seguridad real en un modelo single-user con namespace aislado.
3. **Condición de Carrera en la Creación de Proyectos**: Al crear una nueva novela con portada, el asset binario puede subirse concurrentemente o antes de que el documento raíz de la novela haya completado su escritura distribuida en Firestore. Una verificación cruzada estricta abortaría erróneamente la subida con un falso rechazo de permisos.
4. **División de Responsabilidades**: Cloud Storage garantiza que ningún usuario pueda leer, escribir o borrar assets fuera de su propio árbol `/users/{userId}/`. A su vez, `firestore.rules` garantiza la integridad y propiedad del documento de la novela y sus subcolecciones.

---

## 8. Validaciones de Archivos y Límites de Producto `[PROPOSED]`

Las validaciones a nivel de aplicación en `AssetService` (`src/lib/assets/validation.ts`) son coherentes con las reglas de Storage y definen límites de producto para proteger la experiencia de usuario:

| Categoría (`AssetType`) | Formatos MIME Permitidos | Límite Propuesto de Producto `[PROPOSED]` | Límite de Infraestructura (`storage.rules`) `[FACT]` |
|---|---|---|---|
| `cover` | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml` | 5 MB | 30 MB hard-cap |
| `entity_avatar` | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml` | 5 MB | 30 MB hard-cap |
| `entity_gallery` | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml` | 10 MB | 30 MB hard-cap |
| `board_image` | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml` | 10 MB | 30 MB hard-cap |
| `board_document` | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`, `text/markdown` | 25 MB | 30 MB hard-cap |
| `custom_font` | `font/ttf`, `font/otf`, `font/woff`, `font/woff2`, `application/x-font-ttf`, `application/x-font-otf`, etc. | 5 MB | 30 MB hard-cap |

> **Diferenciación Epistemológica**:
> - **Límites de Producto `[PROPOSED]`**: 5 MB, 10 MB, 25 MB son reglas de negocio a nivel de aplicación diseñadas para preservar el ancho de banda y la fluidez del navegador.
> - **Límite de Infraestructura `[FACT]`**: El hard-cap de 30 MB en `storage.rules` es una barrera de seguridad de infraestructura que deniega físicamente cargas maliciosas de gran tamaño.

---

## 9. Verificación de Seguridad y Entorno de Pruebas

### Taxonomía de Pruebas:
1. **Pruebas Unitarias de Código Novelore `[TESTED]`**: Prueban la lógica TypeScript en `src/test-phase-2-3-1.ts` (Tests 1 al 11). Cobertura completa de generación de IDs, construcción y parseo de paths canónicos, validación de MIME, normalización de errores, contrato del proveedor, desacoplamiento y límites de producto.
2. **Pruebas Declarativas de Reglas de Seguridad `[TESTED: DECLARATIVE]`**: Verifican en `src/test-phase-2-3-1.ts` (Test 12) la correspondencia exacta entre la matriz declarativa de vectores de ataque (9 vectores auditados) y las condiciones reales de `storage.rules`.
3. **Pruebas Reales de Storage Rules con Firebase Emulator**:
   - **Estado Actual**: `[NOT TESTED — FIREBASE STORAGE EMULATOR UNAVAILABLE]`
   - **Motivo Técnico**: El entorno de ejecución en contenedor carece del runtime de Java (`java: not found`) y no dispone de la suite configurada de Firebase Emulator.
   - **Garantía**: Las reglas fueron formalmente auditadas mediante revisión estática y la matriz declarativa de 9 vectores.

---

## 10. Estado de Fases y Próximos Pasos

1. **Fase 2.3.1 y Hardening (Completadas)**:
   - Infraestructura desacoplada de assets y providers implementada y verificada.
   - Reglas de almacenamiento `storage.rules` endurecidas con validación explícita de MIME.
   - Decoupling completo de `AssetService` con inyección obligatoria en constructor.
   - Suite de pruebas de verificación automatizadas `src/test-phase-2-3-1.ts` (47 pruebas superadas).
   - Matriz declarativa y estado de emulador documentados con precisión epistemológica.
2. **Fase 2.3.2 (Migración Perezosa / Lazy Migration — Próxima)**:
   - Detección progresiva de strings Base64 en componentes durante la interacción del usuario.
   - Subida a Storage en segundo plano mediante `AssetService`.
   - Sustitución de Data URLs por `storagePath` / `AssetReference`.
   - Preservación de retrocompatibilidad con proyectos existentes.
3. **Caché Local de Assets (`asset_blobs`) `[OPEN QUESTION]`**:
   - Diferido a evaluación posterior para analizar el compromiso entre el consumo de cuota de IndexedDB del navegador y la disponibilidad offline de imágenes y adjuntos.

