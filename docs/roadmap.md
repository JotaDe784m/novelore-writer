# Novelore Technical Roadmap

This roadmap establishes the structured multi-phase evolution of the **Novelore** platform. Each phase has specific technical goals designed to maintain system stability, preserve existing features, and guarantee data integrity for writers.

---

## Phase 0
**Project Preparation and Documentation**
- Establish project identity in `package.json` and root documentation.
- Document system architecture, real application flows, and module responsibilities.
- Create developer guidelines, code conventions, dependency audits, and technical decisions.
- Formulate this technical roadmap to guide future iterations without introducing regressions.

## Phase 1 [COMPLETED]
**Firebase Security and Project Ownership**
- Secure Firestore access rules (`firestore.rules`).
- Introduce project ownership concepts (`ownerId`, per-user document paths or access control lists).
- Protect user data from unauthorized read or write operations.
- Review and harden Firebase Authentication integration (including Phase 1.1 Firestore Security Hardening).

## Phase 2
**Persistence Architecture & Scalability**

### Phase 2.0 [COMPLETED]
**Persistence Audit and Architecture Design**
- Full lifecycle mapping: creation, editing, local autosave, debounced cloud sync, and real-time listeners.
- Complete inventory of persistence layers (`localStorage`, `sessionStorage`, memory, Firestore root & subcollections).
- Audited `NovelProject` domain model, data classifications, and qualitative size risk analysis.
- Audited serialization, whiteboard offloading threshold (>550,000 chars), canvas compression threshold (>280,000 chars), and deserialization edge cases.
- Identified SPOFs (localStorage quota exhaustion with silent failure, Firestore document size limits, PDF/font Base64 bloat).
- Formulated proposed target architecture (IndexedDB for local persistence + pragmatic hybrid Firestore partitioning for `/content/manuscript` and `/boards/main`).
- Authored comprehensive audit document: `docs/persistence-audit.md`.

### Phase 2.0.1 [COMPLETED]
**Persistence Audit Documentation Correction**
- Document-only correction of `docs/persistence-audit.md` and related technical documentation.
- Eliminated unmeasured quantitative figures and browser-specific 5 MB quota generalizations.
- Rigorously classified all technical statements using explicit evidence tags: `[FACT]`, `[MEASURED]`, `[ESTIMATE]`, `[RISK]`, `[PROPOSED]`, `[OPEN QUESTION]`.
- Clarified distinction between Novelore's internal heuristic character thresholds (280,000 and 550,000 characters) and Firestore's external ~1 MiB document limit.
- Maintained proposed architectures (IndexedDB, `schemaVersion: 2`, hybrid subcollections) strictly as `[PROPOSED]`. No functional code modified.

### Phase 2.1 [COMPLETED]
**Local Persistence Migration to IndexedDB**
- Implemented `IndexedDB` local persistence architecture using `idb` library via `src/lib/local-db.ts` (database `novelore-local`, v1).
- Object stores: `projects` (entity keyed by `id`), `versions` (snapshots keyed by `id` with index `by_project`), and `metadata` (`activeProjectId`, migration status).
- Idempotent, non-destructive legacy migration from `localStorage` without deleting user backups.
- Strict limit of 3 versions per project (`MAX_PROJECT_VERSIONS = 3`) maintained and pruned in `versions` store.
- Enqueued sequential write operations to eliminate write race conditions.
- Preserved existing offline-first capabilities and asynchronous adapter integration across consumers.

### Phase 2.2 [IMPLEMENTED]
**Cloud Persistence Architecture (Firestore Hybrid Partitioning)**
- Designed and implemented hybrid Firestore document partitioning with `schemaVersion: 2`.
- Retained lightweight structural manifest, metadata, codex text, timelines, and beats in `/novels/{novelId}` with scene prose stripped (`content: ""`), eliminating payload bloat.
- Segregated continuous manuscript prose into atomic scene documents under `/novels/{novelId}/scenes/{sceneId}`.
- Segregated visual moodboards under `/novels/{novelId}/boards/main` with backward compatibility for legacy `/data/whiteboard`.
- Guaranteed 100% backward compatibility with `schemaVersion: 1` monoliths via lazy, non-destructive migration and local pre-migration snapshots.
- Updated and deployed strict, ABAC-compliant `firestore.rules` and `firebase-blueprint.json` without wildcards.

### Phase 2.2.1 [IMPLEMENTED]
**Cloud Consistency & Deletion Hardening**
- Implemented monotonic `syncVersion` commit marker and `syncStatus` in root manifest and partitioned subcollections.
- Hardened `saveNovelToCloud`: scenes written in atomic batches of up to 450; explicit error thrown if root fails, preventing false success states and ensuring local state does not advance unconfirmed versions.
- Hardened `deleteNovelFromCloud`: pre-verifies ownership, deletes scenes in verified atomic batches, purges boards, and retains the root document intact if any subcollection cleanup fails, eliminating orphaned scenes.
- Hardened `firestore.rules`: added strict integrity assertions requiring `id == sceneId` and `novelId == novelId` on `/scenes/{sceneId}` and `novelId == novelId` on `/boards/{boardId}`.
- Validated via 23-assertion test suite spanning normal save, scene updates, root failure simulation, sequential deletion, deletion failure protection, and security rule specifications.

### Phase 2.2.2 [IMPLEMENTED]
**Final Cloud Consistency & Deletion Hardening**
- Refined deletion fault policy: failure deleting `/boards/main` or legacy `/data/whiteboard` immediately aborts and preserves the root `/novels/{novelId}` document intact; non-existence is treated as success.
- Finalized 9-step ordered deletion sequence: (1) authenticate, (2) verify root existence, (3) verify ownership, (4) list scenes, (5) batch delete scenes (failure preserves root), (6) delete `/boards/main` (failure preserves root), (7) delete `/data/whiteboard` (failure preserves root), (8) delete root document, (9) return success.
- Clarified commit marker semantics: distinguished `"pending"` during write from `"committed"` only after successful root write (`setDoc(root)`).
- Explicitly documented that no distributed global transaction is claimed; consistency relies on logical commit marker with final root confirmation.
- Formally characterized orphan scene cleanup in `saveNovelToCloud` as a non-blocking defensive best-effort operation.
- Validated via dedicated 24-assertion test suite in `src/test-phase-2-2-2.ts` (Tests A through G).

### Phase 2.3 [AUDITED & DESIGNED]
**Asset and Binary Data Audit & Architecture Design**
- Repository-wide audit of all binary data mechanisms, Data URLs, Base64 encodings, and Blobs.
- Formal classification of all domain fields into Class A (text), Class B (binary asset), Class C (asset reference), Class D (ambiguous).
- Identified critical risks: `customFontData` and attached PDFs (`fileData`) store uncompressed Base64 without size validation; entity whiteboards (`WorldEntity.whiteboard`) reside in the root document (identified as an independent data partitioning question).
- Designed target architecture: Firestore candidate metadata (`AssetReferenceCore`) + Firebase Storage binary payloads under canonical path `/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}`.
- Analyzed alternatives for download URL persistence vs dynamic resolution (`storagePath`) as an open question.
- Evaluated client-side offline caching strategies (browser HTTP cache, memory, IndexedDB) [PROPOSED].
- Evaluated migration alternatives (lazy on sync, explicit user-initiated, background, hybrid) as open questions.
- Formally characterized the absence of distributed transactions between Firestore and Storage; deletion and cleanup designed as idempotent, best-effort operations.
- Authored comprehensive audit document: `docs/assets-audit.md`.
- *Status: Strictly audit and design phase. Zero code implementation or storage provisioning.*

### Phase 2.3.1 & 2.3.1-Hardening [IMPLEMENTED]
**Asset & Storage Infrastructure Implementation & Hardening**
- Created provider-agnostic `StorageProvider` abstraction (`upload`, `download`, `delete`, `exists`, `resolveUrl`) completely independent of Firebase SDK.
- Implemented `FirebaseStorageProvider` encapsulating the Firebase Cloud Storage SDK and `InMemoryStorageProvider` for offline testing.
- Decoupled `AssetService` via strict constructor dependency injection, without default coupling to concrete providers. Prepared architecturally for future cloud providers (Google Drive, OneDrive, Dropbox, not currently implemented).
- Created `AssetService` domain coordinator enforcing canonical storage paths (`/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}`), validating MIME types, enforcing proposed size limits [PROPOSED], and generating typed `AssetReference` models.
- Established Novelore's normalized domain error hierarchy (`AssetError`, `AssetValidationError`, `AssetPermissionError`, `AssetNotFoundError`, etc.), isolating the UI from vendor-specific error codes.
- Authored and hardened `storage.rules` [IMPLEMENTED] [TESTED: DECLARATIVE] enforcing ABAC ownership (`request.auth.uid == userId`), explicit `contentType in [...]` validation, and a 30 MB infrastructure hard cap. (Live execution marked as `[NOT TESTED — FIREBASE STORAGE EMULATOR UNAVAILABLE]` due to missing Java runtime).
- Documented named Firestore database constraint [CONSTRAINT] regarding `firestore.get()` in Storage Rules.
- Maintained existing Base64 data completely untouched without regressions; migration deferred to Phase 2.3.2.
- Verified through dedicated test suite (`src/test-phase-2-3-1.ts`) with 47 automated assertions passing.
- Authored architectural reference document: `docs/asset-storage.md`.

### Phase 2.3.2 [PROPOSED]
**Lazy Migration of Existing Binary Data**
- Progressively detect existing inline Base64 data URLs (`coverUrl`, `customFontData`, `avatarUrl`, `gallery[].url`, `imageUrl`, `fileData`) during active user sessions.
- Upload binary payloads via `AssetService` and replace inline Base64 strings with lightweight canonical `storagePath` / `AssetReference` objects.
- Maintain transparent fallback reading for legacy un-migrated projects.
- Preserve local backup snapshots in IndexedDB prior to any cloud schema transition.
- Evaluate client-side caching strategies (`asset_blobs` vs browser cache) [OPEN QUESTION].



## Phase 3
**Synchronization and Conflict Resolution**
- Prevent destructive automatic text merging across concurrent sessions and devices.
- Improve conflict detection mechanisms with granular entity-level and scene-level timestamps.
- Provide clear, user-controlled manual conflict resolution workflows with side-by-side diff previews.

## Phase 4
**Core Architecture Refactoring**
- Reduce `App.tsx` complexity by extracting single-responsibility domain hooks.
- Separate navigation, modal management, and persistence orchestration from root UI components.
- Introduce structured application context or modular state providers where appropriate.

## Phase 5
**Large Component Refactoring**
- Systematically analyze large components individually (`SceneInspector`, `EntityModal`, `TimelineView`, `VisualBoardView`).
- Split presentation, business logic, and sub-views into cohesive sub-components.
- Preserve 100% of existing behavior and visual styling.
- *Rule: Do not refactor all large components simultaneously.*

## Phase 6
**Data Model and Narrative Domain Review**
- Audit domain relationships between Scenes, Timeline Events, and Codex Entities.
- Improve data model consistency and eliminate redundant or loose fields in `src/types.ts`.
- Define clear narrative data contracts and schema validation helpers.

## Phase 7
**Writer Experience and UX**
- Improve editor workflow, distraction-free typing, and keyboard shortcuts.
- Enhance chapter and scene navigation speed.
- Refine focus modes, typewriter scrolling, and fullscreen presentation.
- Elevate overall writing and outlining ergonomics.

## Phase 8
**Visual Consistency**
- Conduct design system review across all modal dialogs, sidebars, and panels.
- Standardize spacing, typographic scale, button styles, and color tokens.
- Enhance responsive behavior across tablet and varying desktop viewports.

## Phase 9
**Testing and Stability**
- Define critical end-to-end writer flows.
- Implement comprehensive automated tests for local persistence and snapshot restoration.
- Test cloud synchronization and offline mode recovery.
- Test export engines (DOCX, Markdown, Plain Text).
- Test Editor, Codex, Timeline, and Visual Board functionality.

## Phase 10
**Advanced Narrative Tools (Without AI)**
- Develop narrative continuity checkers (e.g., character appearance tracking, timeline inconsistencies).
- Track character arcs across chapters and structural beats.
- Enhance story graph relationships and narrative progression indicators.

## Phase 11
**Professional Export**
- Enhance Microsoft Word (`.docx`) export fidelity, front-matter support, and running headers.
- Improve print-to-PDF layout and page break precision.
- Add industry-standard export presets (Standard Manuscript Format, Novel Submission, etc.).
- Refine chapter heading layouts and typography.

## Phase 12
**AI Integration**
- **IMPORTANT:** AI development must remain **LAST**.
- Do not implement new AI features or refactor the AI assistant before phases 1 through 11 are completely stabilized.
- Future work: Streaming responses, structured context windows from the Codex, and configurable writer prompts.
