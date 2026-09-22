# Technical Decisions

This document records the core architectural and technical decisions implemented in **Novelore**, describing their current behavior, underlying rationale, and areas identified as requiring future review.

---

## 1. Local-First Persistence

- **Implementation [UPDATED - Phase 2.1]**: The primary source of truth for local writing sessions is IndexedDB (`novelore-local`, v1, using the `idb` library). Full projects are stored individually in the `projects` object store keyed by `id`. Version snapshots are stored in the `versions` object store with an index on `projectId`. Active project tracking, flags, and migration statuses reside in the `metadata` object store. `localStorage` is maintained solely for non-critical visual styling preferences (`novelore_user_theme`, `novelore_user_accent`, `novelore_neutral_accent`) and existing keys are kept as a non-destructive legacy backup.
- **Rationale**: Writers require zero-latency typing, continuous offline availability, and robust local storage capacity not constrained by standard string-key storage limits.
- **Evaluation**: Fully operational and asynchronous. Race conditions are mitigated via sequential write queue enqueuing (`enqueueWrite`), and backward compatibility is ensured via automatic idempotent migration from `localStorage`.

---

## 2. Cloud Synchronization Strategy

- **Implementation**: When the user signs in with Google, `src/lib/firebase.ts` establishes a real-time Firestore `onSnapshot` listener on `/novels/{novelId}`. Local edits trigger a debounced save to the cloud. Each browser tab generates a unique session ID (`novelore_client_session_id`) to differentiate local updates from remote updates.
- **Conflict Handling**: When a remote update arrives with an `updatedAt` timestamp that differs from the local copy and local unsaved modifications exist, Novelore flags a conflict and presents the user with a 3-way resolution modal (keep local, accept remote, or smart merge).
- **Status**: Operational, but needs future review to formalize granular per-scene merging and avoid race conditions under high-frequency typing.

---

## 3. Firebase & Firestore Selection

- **Implementation**: Novelore uses the Firebase modular web SDK (v12) for Authentication (Google Sign-In) and Firestore document storage with `persistentLocalCache` and `persistentMultipleTabManager`.
- **Rationale**: Firebase provides managed identity authentication and real-time document synchronization without requiring a custom operational database cluster.
- **Cloud Security [IMPLEMENTED]**: Completed in Phase 1 and hardened in Phase 1.1. Security rules (`firestore.rules`) enforce strict per-user ownership (`request.auth.uid == resource.data.ownerId`), require authentication for read/write/list/delete operations, enforce `ownerId` immutability on update, and secure the `/data/whiteboard` subcollection via parent document ownership verification. Local usage remains 100% functional without authentication.

---

## 4. Centralized Narrative Domain Model

- **Implementation**: All domain models (`NovelProject`, `Act`, `Chapter`, `Scene`, `WorldEntity`, `TimelineEvent`, `StoryBeat`, `MoodboardCanvas`) are defined in a single source of truth at `src/types.ts`.
- **Rationale**: Keeps narrative components strictly typed, avoids duplicate interfaces, and ensures that cross-cutting features (such as linking a Codex Entity or a Historical Event to a Scene or Timeline Event) have consistent property contracts across the entire application.

---

## 5. Artificial Intelligence (AI) Integration

> **Mandate:**
> AI integration is intentionally postponed until the core application architecture, persistence, synchronization, UX, and export systems are stable.

- **Current State**: An experimental endpoint (`/api/ai/assist`) exists in `server.ts` utilizing `@google/genai` to assist with Spanish dialogue formatting, prose polishing, and tone adjustments. It operates purely as a server-side proxy to protect API keys.
- **Decision**: No new AI features, prompt redesigns, or client-side AI expansions will be implemented during foundational architectural phases (Phases 0 through 11).

---

## 6. Architectural Items Needing Future Review

Certain existing implementation patterns were noted during analysis and are marked for evaluation in future roadmap phases:

- **Root State Monolith in `App.tsx`**:
  - *Current Behavior*: All top-level domain collections, active views, modal states, and synchronization listeners reside directly in `App.tsx`.
  - *Status*: *Needs future review*. Scheduled for decomposition into modular hooks and domain contexts in Phase 4.
- **Multi-Tab Session Coordination**:
  - *Current Behavior*: Client session IDs are stored in `sessionStorage`.
  - *Status*: *Needs future review*. Multi-window synchronization and offline reconnection handling should be formalized with deterministic state machines in Phase 2.1 and Phase 3.

---

## 7. Persistence Architecture Decisions (Phase 2.0 Audit & Design)

The comprehensive persistence audit conducted in Phase 2.0 (`docs/persistence-audit.md`) established the following technical decisions for upcoming implementation in Phase 2.1:

- **7.1 Migration from `localStorage` to `IndexedDB` [IMPLEMENTED - Phase 2.1]**:
  - *Rationale*: The local persistence model stored independent serialized copies of the project and up to 3 version snapshots. This duplicated storage could exhaust `localStorage` quota in browsers.
  - *Decision*: Transitioned full project entities and version histories to client-side `IndexedDB` (`novelore-local` v1). `localStorage` is kept strictly for UI styling preferences and non-destructive legacy backup.
- **7.2 Pragmatic Hybrid Firestore Partitioning [IMPLEMENTED - Phase 2.2]**:
  - *Rationale*: Storing the entire manuscript inside the root `/novels/{novelId}` document risks hitting Firestore's ~1 MiB document limit as prose grows, and re-writing the entire manuscript on every save causes excessive bandwidth consumption. Conversely, hyper-fragmenting into 20+ subcollections introduces severe read amplification.
  - *Decision*: Adopted a partitioned hybrid cloud architecture. The root document retains the lightweight project manifest, metadata, codex text, timelines, relationships, and the complete structural tree (`acts -> chapters -> scenes`), with scene prose stripped (`content: ""`). Continuous prose is partitioned into atomic scene documents under `/novels/{novelId}/scenes/{sceneId}`, and visual canvases are segregated under `/novels/{novelId}/boards/main` (with backward-compatible support for legacy `/data/whiteboard`).
- **7.3 Versioned Schema (`schemaVersion: 2`) [IMPLEMENTED - Phase 2.2]**:
  - *Decision*: Introduced explicit `schemaVersion: 2` on Firestore documents. Cloud loaders automatically detect `v1` (monolithic) and `v2` (hybrid) structures, supporting seamless backward compatibility. Legacy `v1` projects load transparently, and are migrated lazily to `v2` upon active write with an automatic immutable pre-migration snapshot in IndexedDB.
- **7.4 Persistence Invariants [REQUIRED DESIGN INVARIANTS]**:
  - *Decision*: All persistence code respects the core persistence invariants formulated in Section 21 of `docs/persistence-audit.md`, guaranteeing local sovereignty, manuscript integrity, and non-destructive fallbacks.
- **7.5 IndexedDB Engine Selection [RESOLVED - Phase 2.1]**:
  - *Decision*: Selected the `idb` library (Promise-wrapped standard IndexedDB API) for type safety, zero bloat, native transaction lifecycle support, and seamless index query capabilities.
- **7.6 Distributed Save Consistency via Commit Marker (`syncVersion`) [IMPLEMENTED - Phase 2.2.1 & 2.2.2]**:
  - *Rationale*: A partitioned cloud architecture writes scenes, boards, and manifest in separate network requests. Firestore does not support multi-document cross-collection atomic transactions of unbounded size.
  - *Decision*: Rather than claiming false distributed atomicity, the architecture relies on a **logical commit marker with final root manifest confirmation**:
    1. A monotonic `syncVersion` is generated for the generation.
    2. Local state transitions to `project.syncStatus = "pending"`.
    3. Scenes are written in atomic batches of up to 450 documents tagged with `syncVersion`.
    4. Defensive orphan scene cleanup runs as a non-blocking best-effort step (does not abort valid save).
    5. Visual boards are written with `syncVersion`.
    6. The root document payload is marked `syncStatus: "committed"` right before writing.
    7. Root manifest is written to Firestore via exponential backoff (up to 3 attempts), functioning as the commit marker.
    8. Local state transitions to `project.syncStatus = "committed"` and `project.syncVersion = newSyncVersion` **only after `setDoc(root)` succeeds**. If root write fails, an explicit error is thrown and `project.syncStatus` remains `"pending"`.
- **7.7 Fail-Safe Ordered Deletion & Subcollection Integrity [IMPLEMENTED - Phase 2.2.1 & 2.2.2]**:
  - *Rationale*: If deletion of scenes, boards, or whiteboard fails partway through, deleting the root document leaves invisible orphaned documents in Firestore.
  - *Decision*: Deletion follows a strict fail-safe sequence:
    1. Verificar autenticación.
    2. Verificar existencia del root.
    3. Verificar ownership (`ownerId == user.uid`).
    4. Listar escenas particionadas.
    5. Borrar escenas por batches (si falla, se aborta y el root se preserva).
    6. Borrar `/boards/main` (si existe y falla la eliminación, se aborta y el root se preserva; si no existe, es éxito).
    7. Borrar `/data/whiteboard` (si existe y falla la eliminación, se aborta y el root se preserva; si no existe, es éxito).
    8. Eliminar el documento raíz `/novels/{novelId}` únicamente tras purga confirmada de todas las subcolecciones.
    9. Devolver éxito.
  - *Integrity Rules*: `firestore.rules` enforces that subcollection documents match their path IDs (`scene.id == sceneId`, `scene.novelId == novelId`, `board.novelId == novelId`), guarded by parent ownership.
- **7.8 Best-Effort Orphan Scene Cleanup [IMPLEMENTED - Phase 2.2.2]**:
  - *Decision*: La limpieza de escenas obsoletas eliminadas localmente es una operación defensiva no bloqueante (`best-effort`). Si falla por problemas de red transitorios, no aborta el guardado válido de la novela ni compromete la integridad del manuscrito. Se documenta explícitamente que no constituye una garantía de consistencia distribuida.
- **7.9 Asset and Binary Data Architecture Strategy [IMPLEMENTED INFRASTRUCTURE - Phase 2.3.1]**:
  - *Rationale*: Documents containing inline Base64 data URLs (`customFontData`, unvalidated attached PDFs in `fileData`, `coverUrl`, entity gallery images, and entity whiteboards) introduce risks of exceeding Firestore's ~1 MiB document limit, increase IndexedDB local consumption across version snapshots (`MAX_PROJECT_VERSIONS = 3`), and carry potential main-thread serialization latency risks.
  - *Decision*: Segregate binary payloads to dedicated storage under a single canonical path convention (`/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}`). Retain minimal `AssetReference` metadata objects in Firestore (`id`, `novelId`, `ownerId`, `assetType`, `storagePath`, `mimeType`, `sizeBytes`, `createdAt`). Dynamic URL resolution is performed at runtime without persisting ephemeral download URLs in primary database records.
  - *Status*: Phase 2.3.1 completed. Provider-agnostic infrastructure, `storage.rules`, and domain service implemented. Existing Base64 data preserved without modification; migration deferred to Phase 2.3.2.
- **7.10 Provider-Agnostic Storage Infrastructure & Error Normalization [IMPLEMENTED - Phase 2.3.1 & Hardening]**:
  - *Rationale*: Directly binding the UI or domain logic to the Firebase Storage SDK violates clean architecture principles and impedes future support for user-owned cloud drives (e.g. Google Drive, OneDrive, Dropbox) or offline mocks.
  - *Decision*:
    1. **Contract**: Defined `StorageProvider` interface (`upload`, `download`, `delete`, `exists`, `resolveUrl`) completely independent of Firebase types.
    2. **Encapsulation**: Implemented `FirebaseStorageProvider` to isolate the Firebase Storage SDK and `InMemoryStorageProvider` for offline testing.
    3. **Domain Coordinator**: Implemented `AssetService` to validate MIME types, enforce proposed product size boundaries [PROPOSED], generate collision-resistant asset IDs, construct canonical paths, and produce strongly-typed `AssetReference` models.
    4. **Error Isolation**: All low-level storage vendor exceptions are normalized into a unified, descriptive domain error hierarchy (`AssetError`, `AssetValidationError`, `AssetPermissionError`, `AssetNotFoundError`, etc.), insulating user interfaces from raw SDK failures.
- **7.11 Strict Constructor Dependency Injection in `AssetService` [IMPLEMENTED - Phase 2.3.1-Hardening]**:
  - *Rationale*: Providing default fallback instantiations of `FirebaseStorageProvider` inside `AssetService` leaked concrete vendor dependencies into domain-level code.
  - *Decision*: `AssetService` strictly mandates that a `StorageProvider` instance be provided in its constructor. The composition of concrete providers occurs at higher application wiring boundaries. Architectural readiness for external providers (Google Drive, OneDrive, Dropbox) is formally established, while noting they are not currently implemented.
- **7.12 Storage Security Rules Hardening & Named Firestore Database Constraint [IMPLEMENTED - Phase 2.3.1-Hardening]**:
  - *Decision*: `storage.rules` implements strict ABAC access control enforcing `request.auth.uid == userId`, explicit MIME validation via `request.resource.contentType in [...]` checks for image, document, and font types, and a 30 MB infrastructure hard cap.
  - *Named Database Constraint `[CONSTRAINT]`*: Authorization does not rely on `firestore.get()` because Novelore utilizes a named Firestore database (`ai-studio-novelistsuitepar-9a23ef1b-b3fb-42f3-952c-35d539a09284`), creating incompatibility with Storage Rules syntax. Furthermore, cross-service lookups would incur latency penalties, document read costs, and race conditions during initial novel creation. Namespace ownership in Storage Rules (`request.auth.uid == userId`) combined with `firestore.rules` document validation delivers robust multi-tenant isolation.
- **7.13 Storage Rules Testing Strategy & Emulator Assessment [IMPLEMENTED & TESTED: DECLARATIVE - Phase 2.3.1-Hardening]**:
  - *Taxonomy*:
    1. **Unit Tests [TESTED]**: 11 automated test suites in `src/test-phase-2-3-1.ts` verify TypeScript contracts, validations, and error normalization.
    2. **Declarative Rules Matrix [TESTED: DECLARATIVE]**: 9 security vectors verified against actual `storage.rules` conditions.
    3. **Firebase Storage Emulator Tests [NOT TESTED — FIREBASE STORAGE EMULATOR UNAVAILABLE]**: Live emulator testing cannot run because the container environment lacks a Java runtime (`java: not found`) and emulator suite configuration.


