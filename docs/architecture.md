# Architecture

This document describes the real, existing architecture of **Novelore**, detailing its domain boundaries, state management, persistence flow, data models, and identified technical debt.

---

## Overview

Novelore is organized around cohesive narrative domains represented in the user interface and data structures:

```
Novelore Application
├── Manuscript (Acts, Chapters, Scenes, Rich Text, Spanish RAE Dialogue Formatting)
├── Planning (Timeline, Corkboard, Story Beats / Arcs, Outline Grid Matrix)
├── Codex (Worldbuilding Entities: Characters, Locations, Factions, Items, Concepts, Lore/Historical Events)
├── Relationships (Entity Relationship Map, Sentiment, Interactive Graph)
├── Visual Boards (Infinite Canvas, Moodboards, Media Embeds, PDF Document Previews)
├── Export (DOCX Formatting Engine, Markdown, Plain Text, Print Preview)
├── Persistence (Local Storage Autosave, Project Version History)
├── Cloud & Sync (Firebase Firestore, Real-Time Snapshot Synchronization, Conflict Resolution)
└── Server (Express Backend, Vite Middleware, Health Check, AI Assistant Proxy)
```

---

## Application Flow

The runtime data flow follows a local-first pattern with asynchronous cloud synchronization:

```
User Action (Typing, Planning, Structuring)
         ↓
React UI Layer (Components & Modals)
         ↓
Application State (Centralized Project State in App.tsx)
         ↓
Persistence Layer
   ├── Local Storage (IndexedDB via idb: primary projects store, versions, and metadata)
   └── Cloud Layer (Debounced Firestore synchronization via onSnapshot / setDoc)
```

1. **User Interaction**: The writer interacts with the rich text editor, moves cards on the corkboard, alters timelines, or edits worldbuilding dossiers.
2. **State Transition**: State changes trigger an immutable updater function updating the in-memory `NovelProject` state in `App.tsx`.
3. **Local Autosave**: Changes are enqueued and persisted asynchronously to client-side IndexedDB (`novelore-local`) under the `projects` store, maintaining up to 3 point-in-time snapshots in `versions`.
4. **Cloud Synchronization**: When cloud sync is active, edits trigger a debounced update to the user's document in Firestore (`novels/{novelId}`). Remote snapshots from other sessions or devices are compared with local timestamps to detect conflicts.

---

## Main Modules

### 1. Manuscript Editor (`src/components/editor/`)
- **`ManuscriptSidebar.tsx`**: Renders the hierarchical tree of Acts, Chapters, and Scenes. Handles creation, drag-and-drop reordering, scene word count targets, and status tags.
- **`RichTextEditor.tsx`**: Core writing component with formatting controls, typewriter scrolling mode, custom typography fonts, dialogue punctuation tools, and character mention highlighting.
- **`SceneInspector.tsx`**: Inspector panel providing scene metadata (POV character, characters present, scene goals, conflict, outcome, word goals, lore/historical event linkage, and writing assistant triggers).

### 2. Planning Tools (`src/components/planning/`)
- **`PlanningDashboard.tsx`**: Container switching between timeline, corkboard, story arcs, and outline matrix.
- **`TimelineView.tsx`**: Chronological multi-track view (Main plot, Subplots, Historical Lore) with event ordering, importance tagging, and direct manuscript scene linking.
- **`CorkboardView.tsx`**: Visual card index arranged by chapter and act, allowing scene reorganization and synopsis editing.
- **`StoryArcView.tsx`**: Story structure framework mapping narrative milestones (Three-Act, Save the Cat, Hero's Journey) to manuscript completion percentages.
- **`OutlineGridView.tsx`**: Structured spreadsheet view consolidating acts, chapters, POV characters, and plot goals.

### 3. Codex & Worldbuilding (`src/components/codex/`)
- **`WorldbuildingHub.tsx`**: Categorized directory for Characters, Locations, Factions, Items, Concepts, and Historical Events with live search and tag filtering.
- **`EntityModal.tsx`**: In-depth dossier modal editing entity summaries, dynamic attributes, image galleries, aliases, notes, and dedicated entity whiteboards.
- **`RelationshipMapView.tsx`**: Interactive graph visualizing connections between characters and factions with customizable relationship types, emotional sentiment, and manual curve handles.

### 4. Visual Boards (`src/components/board/`)
- **`VisualBoardView.tsx`**: Infinite moodboard canvas supporting draggable and resizable notes, text blocks, geometric shapes, directional arrows, uploaded images, embedded audio/video links (Spotify, YouTube), and PDF documents via `pdfjs-dist`.

### 5. Export Engine (`src/components/export/` & `src/utils/docxExport.ts`)
- Configurable export modal producing structured Microsoft Word documents (`.docx`), plain text (`.txt`), and Markdown (`.md`), styled according to editorial standards or custom typography presets.

### 6. Persistence (`src/utils/storage.ts`)
- Manages local client storage keys (`novelist_current_project_v1`, `novelist_project_list_v1`), version snapshot creation, and project import/export in JSON format.

### 7. Cloud Synchronization & Authentication (`src/lib/firebase.ts`)
- Wraps Firebase Auth (Google Sign-In) and Firestore document storage (`/novels/{novelId}`).
- Utilizes Firestore persistent offline cache (`persistentLocalCache`) and cross-tab multi-session identifiers to differentiate client edits.
- Handles real-time remote updates, conflict detection between divergent branches, and smart property merging.

### 8. Server (`server.ts`)
- Node.js Express server running on port 3000.
- Integrates Vite in middleware mode during development and serves the built client in production.
- Provides `/api/health` and `/api/ai/assist` proxy routes to securely isolate API keys from the browser bundle.

---

## Data Model

The domain models are strictly defined in `src/types.ts` and `src/types/exportTemplates.ts`:

- **`NovelProject`**: Root entity containing project metadata, global settings, and collections of all narrative sub-elements.
- **`Act`**: Highest narrative division containing an ordered list of `Chapter` elements.
- **`Chapter`**: Container for an ordered list of `Scene` records.
- **`Scene`**: Atomic writing unit with prose content, synopsis, status, word count metrics, POV assignment, participating characters, conflict parameters, and linked historical events.
- **`WorldEntity`**: Encyclopedia entry classified under `EntityCategory` (`character`, `location`, `faction`, `item`, `concept`, `event`), featuring dynamic key-value attributes, aliases, galleries, and whiteboard assets.
- **`Relationship`**: Directed connection between two `WorldEntity` instances with type taxonomy, sentiment, and visual curve anchors.
- **`TimelineTrack` & `TimelineEvent`**: Temporal markers with position, importance rating, character linkages, historical classification, and manuscript scene references.
- **`MoodboardCanvas` & `BoardItem`**: Infinite canvas layout definitions for visual moodboards and whiteboards.

---

## Persistence Architecture

Currently, Novelore follows a dual-persistence model:
1. **Local State [IMPLEMENTED - Phase 2.1 & 2.1.1]**: Client-side IndexedDB (`novelore-local` v1, managed via `src/lib/local-db.ts` with `idb`). Full project entities are stored individually in the `projects` store keyed by `id`. Historical versions are managed in the `versions` store with a strict limit of 3 point-in-time snapshots (`MAX_PROJECT_VERSIONS = 3`). Transient visual preferences (theme, accent color) are retained in `localStorage`.
2. **Cloud State [UPDATED - Phase 2.2 Hybrid Partitioning & Phase 2.2.1 Cloud Consistency]**:
   When authenticated with Google, cloud persistence operates under a partitioned hybrid architecture (`schemaVersion: 2`):
   - **Root Document (`/novels/{novelId}`)**: Contains project metadata, narrative settings, worldbuilding codex dossiers, relationships, timeline tracks/events, story beats, and the complete structural hierarchy of Acts, Chapters, and Scenes (including titles, synopsis, word counts, goals, POV, and statuses). Continuous prose content is stripped from the root document (`content: ""`), shrinking root document payload by over 95% and eliminating Firestore's ~1 MiB document limit risk.
   - **Manuscript Scenes Subcollection (`/novels/{novelId}/scenes/{sceneId}`)**: Continuous manuscript prose is partitioned into atomic scene documents (`{ id, novelId, chapterId, actId, content, notes, wordCount, updatedAt, syncVersion }`). This decouples manuscript growth from the root manifest, enables fine-grained incremental writes, and prevents monolithic payload bloat.
   - **Visual Canvas Subcollection (`/novels/{novelId}/boards/main`)**: Moodboards and whiteboards containing visual items, notes, connectors, and diagrams are stored in a dedicated subcollection document, with backward compatibility for legacy `/data/whiteboard`.
   - **Distributed Consistency via Commit Marker (`syncVersion` & `syncStatus`) [Phase 2.2.1 & 2.2.2]**: To coordinate consistency between partitioned scenes and the structural manifest across independent network requests without assuming global distributed multi-document transactions:
     1. A monotonically increasing logical `syncVersion` is generated upon each save.
     2. Local state transitions to `project.syncStatus = "pending"`.
     3. Scenes are written in atomic batches of up to 450 documents tagged with `syncVersion`. If any scene batch fails, the save is aborted immediately.
     4. Orphan scene cleanup is executed as a non-blocking defensive best-effort operation. If cleanup fails, obsolete scene documents may temporarily remain in Firestore, but this does not abort the valid save.
     5. Visual board documents are updated tagged with `syncVersion`.
     6. The root document manifest payload is prepared with `syncStatus: "committed"` immediately prior to the final write.
     7. The root manifest is written to Firestore via an exponential-backoff retry loop (up to 3 attempts), serving as the logical commit marker for the entire generation.
     8. Only upon successful confirmation of the root manifest write, local state transitions to `project.syncStatus = "committed"` and `project.syncVersion = newSyncVersion`. If root writing fails, an explicit error is thrown, the save is marked as incomplete, and `project.syncStatus` remains `"pending"`.
   - **Fail-Safe Ordered Deletion [Phase 2.2.1 & 2.2.2]**: Deleting a cloud novel follows a strict, sequential protocol to prevent orphaned documents:
     1. Verificar autenticación (Google account required).
     2. Verificar existencia del documento raíz `/novels/{novelId}`.
     3. Verificar ownership (`ownerId == user.uid`).
     4. Listar escenas particionadas en `/novels/{novelId}/scenes`.
     5. Borrar escenas por batches atómicos de hasta 450 con `writeBatch`. Si cualquier batch falla, la operación aborta y el root se mantiene intacto.
     6. Borrar `/novels/{novelId}/boards/main`. Si existe y falla la eliminación, se lanza un error y el root se mantiene intacto. Si no existe, se considera éxito.
     7. Borrar `/novels/{novelId}/data/whiteboard`. Si existe y falla la eliminación, se lanza un error y el root se mantiene intacto. Si no existe, se considera éxito.
     8. Eliminar el documento raíz `/novels/{novelId}` **únicamente tras confirmar la eliminación exitosa de todas las subcolecciones**.
     9. Devolver éxito.
   - **Subcollection Integrity Rules [Phase 2.2.1 & 2.2.2]**: Firestore rules enforce that scene documents must satisfy `request.resource.data.id == sceneId` and `request.resource.data.novelId == novelId`, and board documents must satisfy `request.resource.data.novelId == novelId`, guarded by the parent document ownership gate.
   - **Backward Compatibility & Lazy Migration**: Cloud loaders automatically distinguish between legacy `schemaVersion: 1` monoliths (where prose resides in `scenes[].content`) and `schemaVersion: 2` partitioned structures. Projects are migrated lazily upon active user write, accompanied by an automatic immutable pre-migration snapshot in IndexedDB.
   - **Offline & Local Sovereignty**: IndexedDB remains the local single source of truth. Unauthenticated offline use remains 100% operational. Incomplete remote writes or network errors never overwrite or corrupt local project integrity.
   - **Asset & Binary Storage Infrastructure [IMPLEMENTED - Phase 2.3.1 & Hardening]**: Binary payloads (custom fonts, attached PDFs, cover images, entity avatars, and entity gallery photos) have a decoupled storage infrastructure:
     - **Agnostic Contract (`StorageProvider`)**: Pure interface (`upload`, `download`, `delete`, `exists`, `resolveUrl`) decoupled from vendor SDKs, ready for future adapters (e.g. Google Drive, OneDrive, Dropbox, not currently implemented).
     - **Implementations**: `FirebaseStorageProvider` (encapsulating `firebase/storage`) and `InMemoryStorageProvider` (offline/test mock).
     - **Domain Service (`AssetService`)**: Pure domain coordinator receiving `StorageProvider` strictly via constructor dependency injection. Enforces canonical path conventions (`/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}`), validates MIME types, enforces proposed product size limits [PROPOSED], generates opaque asset IDs, and produces strongly-typed `AssetReference` models.
     - **Security Rules (`storage.rules`) [IMPLEMENTED] [TESTED: DECLARATIVE]**: ABAC enforcement restricting access to `request.auth.uid == userId`, enforcing explicit `request.resource.contentType in [...]` validation for each asset type and a 30 MB infrastructure hard cap. (Live rules emulator execution marked as `[NOT TESTED — FIREBASE STORAGE EMULATOR UNAVAILABLE]` due to missing Java runtime).
     - **Existing Data**: Base64 strings in existing projects are completely preserved; lazy migration is deferred to Phase 2.3.2.

---

## Cloud Integration & Security

Firebase Auth and Firestore provide multi-device capability.

- **Security Hardening [IMPLEMENTED]**: Completed in Phase 1 and Phase 1.1. Firestore rules in `firestore.rules` enforce strict per-user ownership (`request.auth.uid == resource.data.ownerId`), require authentication for remote access, enforce `ownerId` immutability upon update, and secure the `/data/whiteboard` subcollection. Unauthenticated offline use remains 100% operational locally.

---

## Known Technical Debt

An objective evaluation of the current codebase reveals several areas requiring careful, planned attention in future phases:

1. **Centralized Application State in `App.tsx`**:
   - `App.tsx` currently spans over 900 lines and orchestrates multiple orthogonal concerns, including route/view switching, modal display state, conflict management, cloud synchronization listeners, and project CRUD operations.
2. **Large UI Components**:
   - Several components exceed 1,000 lines (e.g., `SceneInspector.tsx` ~1,670 lines, `EntityModal.tsx` ~1,730 lines, `TimelineView.tsx` ~1,340 lines, and `VisualBoardView.tsx` ~1,400 lines). These components mix state management, DOM event handling, and complex view rendering.
3. **Complex Cloud Synchronization Logic**:
   - `src/lib/firebase.ts` handles complex client-side conflict resolution, retry timers, and image compression directly within Firestore helper routines.
4. **Experimental AI Integration**:
   - AI assistant logic in `server.ts` is implemented as an experimental prototype using standard non-streaming generation, requiring formal prompt contracts and error telemetry in future stages.
