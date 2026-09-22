import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  Firestore,
  writeBatch,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";
import { NovelProject, ConflictInfo, CloudSceneDocument, CloudBoardDocument } from "../types";
import { calculateTotalWords, saveProjectVersion } from "../utils/storage";
import { compressDataUrlIfLarge } from "../utils/imageUtils";

let app: any = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let currentUser: User | null = null;
let isInitialized = false;

/**
 * Extracts atomic scene documents from a NovelProject for cloud partitioning.
 * Includes logical syncVersion commit marker for distributed consistency.
 */
export function extractScenesFromProject(
  project: NovelProject,
  updatedAt: string,
  syncVersion?: number
): CloudSceneDocument[] {
  const scenes: CloudSceneDocument[] = [];
  if (Array.isArray(project.acts)) {
    for (const act of project.acts) {
      if (Array.isArray(act.chapters)) {
        for (const chap of act.chapters) {
          if (Array.isArray(chap.scenes)) {
            for (const sc of chap.scenes) {
              scenes.push({
                id: sc.id,
                novelId: project.id,
                chapterId: chap.id,
                actId: act.id,
                content: sc.content || "",
                notes: sc.notes || "",
                wordCount: sc.wordCount || 0,
                updatedAt,
                syncVersion,
              });
            }
          }
        }
      }
    }
  }
  return scenes;
}

/**
 * Re-hydrates a NovelProject by injecting scene content from a map of partitioned scene documents.
 */
export function rehydrateProjectWithScenes(
  project: NovelProject,
  scenesMap: Map<string, { content: string; notes?: string; wordCount?: number }>
): NovelProject {
  if (Array.isArray(project.acts)) {
    for (const act of project.acts) {
      if (Array.isArray(act.chapters)) {
        for (const chap of act.chapters) {
          if (Array.isArray(chap.scenes)) {
            for (const sc of chap.scenes) {
              const scData = scenesMap.get(sc.id);
              if (scData) {
                sc.content = scData.content;
                if (scData.notes !== undefined) {
                  sc.notes = scData.notes;
                }
              }
            }
          }
        }
      }
    }
  }
  return project;
}

/**
 * Helper to fetch partitioned whiteboard data from /boards/main or fallback to /data/whiteboard.
 */
async function fetchPartitionedWhiteboard(database: Firestore, novelId: string): Promise<any | null> {
  try {
    let wbSnap = await getDoc(doc(database, "novels", novelId, "boards", "main"));
    if (!wbSnap.exists()) {
      wbSnap = await getDoc(doc(database, "novels", novelId, "data", "whiteboard"));
    }
    if (wbSnap.exists()) {
      const wbData = wbSnap.data();
      return {
        items: wbData.items || [],
        zoom: wbData.zoom ?? 1,
        panX: wbData.panX ?? 0,
        panY: wbData.panY ?? 0,
      };
    }
  } catch (wbErr) {
    console.warn("Aviso al cargar pizarra desde subcolección:", wbErr);
  }
  return null;
}

// Unique session ID for this client/browser tab to distinguish cross-device updates
let currentClientSessionId = "";
export function getClientSessionId(): string {
  if (!currentClientSessionId) {
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        currentClientSessionId = window.sessionStorage.getItem("novelore_client_session_id") || "";
      } catch {}
    }
    if (!currentClientSessionId) {
      currentClientSessionId = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      if (typeof window !== "undefined" && window.sessionStorage) {
        try {
          window.sessionStorage.setItem("novelore_client_session_id", currentClientSessionId);
        } catch {}
      }
    }
  }
  return currentClientSessionId;
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const authInstance = getFirebaseAuth();
  const u = authInstance.currentUser || currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: u?.uid,
      email: u?.email,
      emailVerified: u?.emailVerified,
      isAnonymous: u?.isAnonymous,
      tenantId: u?.tenantId,
      providerInfo: u?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function getFirebaseApp() {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    try {
      db = initializeFirestore(
        firebaseApp,
        {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        },
        firebaseConfig.firestoreDatabaseId || undefined
      );
    } catch {
      db = getFirestore(
        firebaseApp,
        firebaseConfig.firestoreDatabaseId || undefined
      );
    }
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export function getFirebaseStorageInstance(): FirebaseStorage {
  if (!storage) {
    const firebaseApp = getFirebaseApp();
    storage = getStorage(firebaseApp);
  }
  return storage;
}

/**
 * Initializes Firebase Auth state listener and tests Firestore connection.
 */
export async function initializeFirebase(): Promise<User | null> {
  if (isInitialized && currentUser) return currentUser;

  try {
    const authInstance = getFirebaseAuth();

    return new Promise((resolve) => {
      onAuthStateChanged(authInstance, (user) => {
        currentUser = user;
        isInitialized = true;
        resolve(user);
      });
    });
  } catch (err) {
    console.error("Firebase init error:", err);
    return null;
  }
}

/**
 * Subscribes to Firebase Auth user changes (Google account log-in / log-out).
 */
export function onAuthUserChanged(callback: (user: User | null) => void): () => void {
  const authInstance = getFirebaseAuth();
  return onAuthStateChanged(authInstance, (user) => {
    currentUser = user;
    callback(user);
  });
}

/**
 * Signs in with Google account popup.
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const authInstance = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(authInstance, provider);
    currentUser = result.user;
    return result.user;
  } catch (error: any) {
    console.error("Error al iniciar sesión con Google:", error);
    throw error;
  }
}

/**
 * Signs out the current Google user.
 */
export async function signOutGoogle(): Promise<void> {
  try {
    const authInstance = getFirebaseAuth();
    await signOut(authInstance);
    currentUser = null;
  } catch (error) {
    console.error("Error al cerrar sesión de Google:", error);
    throw error;
  }
}

export function getCurrentUser(): User | null {
  const authInstance = getFirebaseAuth();
  return authInstance.currentUser || currentUser;
}

export interface SaveNovelResult {
  savedAt: string;
  conflict?: ConflictInfo;
  isOffline?: boolean;
  syncVersion?: number;
  error?: string;
}

/**
 * Intelligently merges a local and remote project without losing any written content.
 */
export function smartMergeProjects(local: NovelProject, remote: NovelProject): NovelProject {
  const mergedActs = [...(local.acts || [])];

  for (const rAct of remote.acts || []) {
    const lActIndex = mergedActs.findIndex((a) => a.id === rAct.id);
    if (lActIndex === -1) {
      mergedActs.push(rAct);
    } else {
      const lAct = mergedActs[lActIndex];
      const mergedChapters = [...(lAct.chapters || [])];

      for (const rChap of rAct.chapters || []) {
        const lChapIndex = mergedChapters.findIndex((c) => c.id === rChap.id);
        if (lChapIndex === -1) {
          mergedChapters.push(rChap);
        } else {
          const lChap = mergedChapters[lChapIndex];
          const mergedScenes = [...(lChap.scenes || [])];

          for (const rScene of rChap.scenes || []) {
            const lSceneIndex = mergedScenes.findIndex((s) => s.id === rScene.id);
            if (lSceneIndex === -1) {
              mergedScenes.push(rScene);
            } else {
              const lScene = mergedScenes[lSceneIndex];
              if (lScene.content !== rScene.content) {
                if (!lScene.content && rScene.content) {
                  mergedScenes[lSceneIndex] = { ...rScene };
                } else if (lScene.content && !rScene.content) {
                  mergedScenes[lSceneIndex] = { ...lScene };
                } else {
                  const combined = `${lScene.content.trim()}\n\n[=== CAMBIOS SINCRONIZADOS DE OTRA SESIÓN ===]\n${rScene.content.trim()}`;
                  mergedScenes[lSceneIndex] = {
                    ...lScene,
                    content: combined,
                    wordCount: combined.trim().split(/\s+/).filter(Boolean).length,
                  };
                }
              }
            }
          }
          mergedChapters[lChapIndex] = { ...lChap, scenes: mergedScenes };
        }
      }
      mergedActs[lActIndex] = { ...lAct, chapters: mergedChapters };
    }
  }

  // Combine entities without losing either
  const entityMap = new Map<string, any>();
  for (const ent of remote.entities || []) {
    entityMap.set(ent.id, ent);
  }
  for (const ent of local.entities || []) {
    if (entityMap.has(ent.id)) {
      const rEnt = entityMap.get(ent.id);
      const galleryIds = new Set((ent.gallery || []).map((g: any) => g.id));
      const combinedGallery = [...(ent.gallery || [])];
      for (const rImg of rEnt.gallery || []) {
        if (!galleryIds.has(rImg.id)) {
          combinedGallery.push(rImg);
        }
      }
      entityMap.set(ent.id, { ...rEnt, ...ent, gallery: combinedGallery });
    } else {
      entityMap.set(ent.id, ent);
    }
  }

  // Combine whiteboard items
  const localBoardItems = local.whiteboard?.items || [];
  const remoteBoardItems = remote.whiteboard?.items || [];
  const boardItemMap = new Map<string, any>();
  for (const item of remoteBoardItems) {
    boardItemMap.set(item.id, item);
  }
  for (const item of localBoardItems) {
    boardItemMap.set(item.id, item);
  }

  return {
    ...local,
    title: local.title || remote.title,
    updatedAt: new Date().toISOString(),
    acts: mergedActs,
    entities: Array.from(entityMap.values()),
    relationships: local.relationships?.length ? local.relationships : remote.relationships || [],
    timelineTracks: local.timelineTracks?.length ? local.timelineTracks : remote.timelineTracks || [],
    timelineEvents: local.timelineEvents?.length ? local.timelineEvents : remote.timelineEvents || [],
    storyBeats: local.storyBeats?.length ? local.storyBeats : remote.storyBeats || [],
    whiteboard: {
      items: Array.from(boardItemMap.values()),
      zoom: local.whiteboard?.zoom ?? remote.whiteboard?.zoom ?? 1,
      panX: local.whiteboard?.panX ?? remote.whiteboard?.panX ?? 0,
      panY: local.whiteboard?.panY ?? remote.whiteboard?.panY ?? 0,
    },
  };
}

/**
 * Saves a novel project to the cloud (Firestore).
 * - Excludes demo novels from being uploaded to the cloud (local only).
 * - Verifies remote version and detects conflicts if remote is newer and has distinct edits.
 * - Protects against 1MB document limit by automatically compressing images and offloading whiteboards if needed.
 */
export async function saveNovelToCloud(
  project: NovelProject,
  sessionId?: string,
  options?: { forceOverwrite?: boolean; checkConflict?: boolean }
): Promise<SaveNovelResult> {
  // Demo project must NOT be saved to the cloud (local only)
  if (
    project.isDemo ||
    project.id === "proj-sombras-alcaraz" ||
    project.title.includes("El Susurro del Cristal de Sombras")
  ) {
    return { savedAt: project.updatedAt || new Date().toISOString() };
  }

  // Check offline status immediately
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { savedAt: "", isOffline: true };
  }

  const database = getDb();
  const authInstance = getFirebaseAuth();
  const user = authInstance.currentUser || currentUser;
  const currentSessionId = sessionId || getClientSessionId();

  // Phase 1 Security: Never attempt to save to cloud if not authenticated
  if (!user || user.isAnonymous) {
    return { savedAt: "", isOffline: false };
  }

  // Security: Verify project ownership if already assigned
  if (project.ownerId && project.ownerId !== user.uid) {
    throw new Error("No tienes permisos para modificar este proyecto porque pertenece a otro autor.");
  }

  // Version check if checkConflict is requested and not force-overwriting
  if (options?.checkConflict && !options?.forceOverwrite) {
    try {
      const remote = await checkRemoteNovelVersion(project.id);
      if (remote && remote.project && remote.meta) {
        if (remote.meta.ownerId && remote.meta.ownerId !== user.uid) {
          throw new Error("El proyecto en la nube pertenece a otro autor.");
        }
        const remoteTime = remote.meta.updatedAt ? new Date(remote.meta.updatedAt).getTime() : 0;
        const localTime = project.updatedAt ? new Date(project.updatedAt).getTime() : 0;

        // If remote was updated by another session and has newer timestamp
        if (
          remote.meta.lastModifiedBySessionId &&
          remote.meta.lastModifiedBySessionId !== currentSessionId &&
          remoteTime > localTime + 1500
        ) {
          const remoteActsStr = JSON.stringify(remote.project.acts || []);
          const localActsStr = JSON.stringify(project.acts || []);

          if (remoteActsStr !== localActsStr) {
            const remoteWordCount = calculateTotalWords(remote.project);
            const localWordCount = calculateTotalWords(project);
            return {
              savedAt: "",
              conflict: {
                remoteProject: remote.project,
                remoteUpdatedAt: remote.meta.updatedAt || new Date().toISOString(),
                remoteWordCount,
                remoteTitle: remote.project.title || "Novela remota",
                localUpdatedAt: project.updatedAt || new Date().toISOString(),
                localWordCount,
                localTitle: project.title || "Mi novela local",
              },
            };
          }
        }
      }
    } catch (checkErr) {
      console.warn("Aviso al verificar versión remota antes de guardar:", checkErr);
    }
  }

  const pathForWrite = `novels/${project.id}`;
  const now = new Date().toISOString();

  // Safety Invariant: Before migrating a project to schemaVersion: 2 in cloud,
  // guarantee an immutable local backup snapshot exists in IndexedDB
  if (!project.schemaVersion || project.schemaVersion < 2) {
    try {
      await saveProjectVersion(project, "[Respaldo Pre-Migración Cloud v2]", true);
      console.info(`[Novelore Cloud] Respaldo pre-migración v2 registrado para novela ${project.id}`);
    } catch (vErr) {
      console.warn("[Novelore Cloud] Aviso al crear snapshot de seguridad pre-migración:", vErr);
    }
  }

  // 1. Extract atomic scene documents for partitioned storage
  // Generate a monotonically increasing logical syncVersion (commit marker)
  const newSyncVersion = (project.syncVersion || 0) + 1;
  // Local state reflects transition to pending during write
  project.syncStatus = "pending";

  const scenesToSave = extractScenesFromProject(project, now, newSyncVersion);

  // 2. Prepare clean root manifest copy with schemaVersion: 2 (initially pending)
  let serialized: any = JSON.parse(
    JSON.stringify({
      ...project,
      ownerId: user.uid,
      userId: user.uid,
      userEmail: user?.email || null,
      userDisplayName: user?.displayName || null,
      userPhotoURL: user?.photoURL || null,
      updatedAt: now,
      lastModifiedBySessionId: currentSessionId,
      schemaVersion: 2,
      syncVersion: newSyncVersion,
      syncStatus: "pending",
    })
  );

  // 3. Strip continuous prose content from the root document manifest
  // (prose is persisted atomically in /novels/{novelId}/scenes/{sceneId})
  if (Array.isArray(serialized.acts)) {
    for (const act of serialized.acts) {
      if (Array.isArray(act.chapters)) {
        for (const chap of act.chapters) {
          if (Array.isArray(chap.scenes)) {
            for (const sc of chap.scenes) {
              sc.content = ""; // Decoupled from root manifest
            }
          }
        }
      }
    }
  }

  // 4. Optimize entity gallery / codex image sizes if payload approaches threshold
  let jsonString = JSON.stringify(serialized);
  if (jsonString.length > 280000) {
    try {
      const compressionTasks: Promise<void>[] = [];

      if (Array.isArray(serialized.entities)) {
        for (const ent of serialized.entities) {
          if (ent.whiteboard?.items && Array.isArray(ent.whiteboard.items)) {
            for (const item of ent.whiteboard.items) {
              if (item.type === "image" && typeof item.imageUrl === "string" && item.imageUrl.length > 40000) {
                compressionTasks.push(
                  compressDataUrlIfLarge(item.imageUrl, 40000, 640, 0.65).then((compressed) => {
                    item.imageUrl = compressed;
                  })
                );
              }
            }
          }
          if (Array.isArray(ent.gallery)) {
            for (const g of ent.gallery) {
              if (typeof g.url === "string" && g.url.length > 40000) {
                compressionTasks.push(
                  compressDataUrlIfLarge(g.url, 40000, 640, 0.65).then((compressed) => {
                    g.url = compressed;
                  })
                );
              }
            }
          }
        }
      }

      if (compressionTasks.length > 0) {
        await Promise.all(compressionTasks);
      }
      jsonString = JSON.stringify(serialized);
    } catch (e) {
      console.warn("Aviso al optimizar imágenes de entidades:", e);
    }
  }

  // 5. Segregate visual whiteboard / moodboard into /boards/main
  let boardPayload: any = null;
  if (serialized.whiteboard && Array.isArray(serialized.whiteboard.items) && serialized.whiteboard.items.length > 0) {
    boardPayload = {
      novelId: project.id,
      items: serialized.whiteboard.items,
      zoom: serialized.whiteboard.zoom ?? 1,
      panX: serialized.whiteboard.panX ?? 0,
      panY: serialized.whiteboard.panY ?? 0,
      updatedAt: now,
      syncVersion: newSyncVersion,
    };
    serialized.whiteboard = {
      isStoredInSubcollection: true,
      items: [],
      zoom: serialized.whiteboard.zoom ?? 1,
      panX: serialized.whiteboard.panX ?? 0,
      panY: serialized.whiteboard.panY ?? 0,
    };
  }

  // 6. Persist partitioned scenes to /novels/{novelId}/scenes/{sceneId} in batched writes
  if (scenesToSave.length > 0) {
    try {
      for (let i = 0; i < scenesToSave.length; i += 450) {
        const chunk = scenesToSave.slice(i, i + 450);
        const batch = writeBatch(database);
        for (const sceneDoc of chunk) {
          const scRef = doc(database, "novels", project.id, "scenes", sceneDoc.id);
          batch.set(scRef, sceneDoc, { merge: true });
        }
        await batch.commit();
      }
    } catch (sceneBatchErr: any) {
      console.error("[Novelore Cloud] Error al guardar escenas particionadas:", sceneBatchErr);
      const isOfflineOrNetwork =
        (typeof navigator !== "undefined" && !navigator.onLine) ||
        (sceneBatchErr?.message && (sceneBatchErr.message.includes("offline") || sceneBatchErr.message.includes("unavailable") || sceneBatchErr.message.includes("network"))) ||
        sceneBatchErr?.code === "unavailable";
      if (isOfflineOrNetwork) {
        return { savedAt: "", isOffline: true };
      }
      throw new Error(`Fallo al guardar escenas particionadas en la nube: ${sceneBatchErr?.message || sceneBatchErr}. El guardado del manifiesto fue abortado.`);
    }
  }

  // Limpieza defensiva de escenas eliminadas localmente (best-effort)
  // NOTA: La limpieza de escenas obsoletas es una operación defensiva no bloqueante.
  // Si falla, puede permanecer temporalmente algún documento de escena obsoleto.
  try {
    const existingScenesSnap = await getDocs(collection(database, "novels", project.id, "scenes"));
    const currentSceneIds = new Set(scenesToSave.map((s) => s.id));
    const orphanDocs = existingScenesSnap.docs.filter((d) => !currentSceneIds.has(d.id));
    if (orphanDocs.length > 0) {
      for (let i = 0; i < orphanDocs.length; i += 450) {
        const chunk = orphanDocs.slice(i, i + 450);
        const delBatch = writeBatch(database);
        for (const orphan of chunk) {
          delBatch.delete(orphan.ref);
        }
        await delBatch.commit();
      }
    }
  } catch (cleanErr) {
    console.warn("[Novelore Cloud] Aviso en limpieza best-effort de escenas remotas huérfanas:", cleanErr);
  }

  // 7. Persist visual whiteboard to /novels/{novelId}/boards/main (and /data/whiteboard for fallback)
  if (boardPayload) {
    try {
      const boardRef = doc(database, "novels", project.id, "boards", "main");
      await setDoc(boardRef, boardPayload, { merge: true });

      const legacyRef = doc(database, "novels", project.id, "data", "whiteboard");
      await setDoc(legacyRef, boardPayload, { merge: true });
    } catch (boardErr) {
      console.warn("Aviso al guardar tablero visual en subcolección:", boardErr);
    }
  }

  // 8. Persist root document manifest with commit marker
  // The root manifest acts as the logical commit point for the entire save generation.
  // We mark serialized.syncStatus as "committed" right before the root setDoc write.
  serialized.syncStatus = "committed";
  const novelDocRef = doc(database, "novels", project.id);

  // Resilient retry loop with exponential backoff (up to 3 attempts)
  let lastError: any = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await setDoc(novelDocRef, serialized, { merge: true });
      // Only upon successful commit of root manifest: update local project tracking
      project.ownerId = user.uid;
      project.schemaVersion = 2;
      project.syncVersion = newSyncVersion;
      project.syncStatus = "committed";
      return { savedAt: now, syncVersion: newSyncVersion };
    } catch (writeErr: any) {
      lastError = writeErr;
      const isOfflineOrNetwork =
        (typeof navigator !== "undefined" && !navigator.onLine) ||
        (writeErr?.message && (writeErr.message.includes("offline") || writeErr.message.includes("unavailable") || writeErr.message.includes("network"))) ||
        writeErr?.code === "unavailable";

      if (isOfflineOrNetwork) {
        console.info("Guardado en la nube en cola sin conexión");
        return { savedAt: "", isOffline: true };
      }

      console.warn(`Intento ${attempt}/3 de guardado en la nube fallido:`, writeErr?.message || writeErr);

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 350));
      }
    }
  }

  // If all attempts failed
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { savedAt: "", isOffline: true };
  }

  console.error(`[Novelore Cloud] Fallo al escribir manifiesto raíz en la nube para ${project.id}:`, lastError);
  handleFirestoreError(lastError, OperationType.WRITE, pathForWrite);
  throw new Error(`Fallo al confirmar el manifiesto raíz en la nube: ${lastError?.message || lastError}. El guardado quedó incompleto y requiere reintento.`);
}

export interface RemoteNovelMetadata {
  lastModifiedBySessionId?: string;
  updatedAt?: string;
  ownerId?: string;
  userId?: string;
  userEmail?: string;
}

/**
 * Subscribes to real-time changes of a novel in Firestore (cross-device sync).
 * Automatically fires onUpdate callback when another device updates the project.
 * Supports both partitioned schemaVersion: 2 and legacy schemaVersion: 1 projects.
 */
export function subscribeToNovel(
  novelId: string,
  onUpdate: (project: NovelProject, meta: RemoteNovelMetadata) => void,
  onError?: (error: unknown) => void
): () => void {
  const authInstance = getFirebaseAuth();
  const user = authInstance.currentUser || currentUser;
  if (!user || user.isAnonymous) {
    // Unauthenticated: no Firestore listener should be established
    return () => {};
  }

  const database = getDb();
  const novelDocRef = doc(database, "novels", novelId);

  return onSnapshot(
    novelDocRef,
    { includeMetadataChanges: true },
    async (snap) => {
      // If the snapshot has pending local writes, do not trigger remote sync
      if (snap.metadata.hasPendingWrites) {
        return;
      }
      if (snap.exists()) {
        const rawData = snap.data();
        const { lastModifiedBySessionId, updatedAt, ownerId, userId, userEmail, ...projectData } = rawData;

        // Verify tenant ownership
        if (ownerId && ownerId !== user.uid) {
          console.warn("Snapshot ignorado: el documento pertenece a otro usuario.");
          return;
        }

        let proj = { ...projectData, ownerId: ownerId || user.uid } as NovelProject;

        // Schema Version 2: Re-hydrate partitioned scenes from subcollection
        if (proj.schemaVersion === 2) {
          try {
            const scenesSnap = await getDocs(collection(database, "novels", novelId, "scenes"));
            const sceneMap = new Map<string, { content: string; notes?: string; wordCount?: number }>();
            scenesSnap.forEach((d) => {
              const sc = d.data();
              sceneMap.set(d.id, {
                content: sc.content || "",
                notes: sc.notes,
                wordCount: sc.wordCount,
              });
            });
            proj = rehydrateProjectWithScenes(proj, sceneMap);
          } catch (sceneErr) {
            console.warn("Aviso al sincronizar escenas en tiempo real:", sceneErr);
          }

          if (proj.whiteboard?.isStoredInSubcollection) {
            const wbData = await fetchPartitionedWhiteboard(database, novelId);
            if (wbData) {
              proj.whiteboard = wbData;
            }
          }
        } else {
          // Schema Version 1: Prose is already in acts. Hydrate whiteboard if offloaded.
          if (proj.whiteboard?.isStoredInSubcollection) {
            const wbData = await fetchPartitionedWhiteboard(database, novelId);
            if (wbData) {
              proj.whiteboard = wbData;
            }
          }
        }

        onUpdate(proj, {
          lastModifiedBySessionId,
          updatedAt,
          ownerId: ownerId || user.uid,
          userId: userId || ownerId,
          userEmail,
        });
      }
    },
    (error) => {
      console.warn("Aviso en suscripción en vivo a novela:", error);
      if (onError) onError(error);
    }
  );
}

/**
 * Checks the remote version of a novel project without holding a permanent listener.
 * Re-hydrates partitioned scenes for schemaVersion: 2 projects to ensure complete comparison.
 */
export async function checkRemoteNovelVersion(
  novelId: string
): Promise<{ project: NovelProject; meta: RemoteNovelMetadata } | null> {
  const authInstance = getFirebaseAuth();
  const user = authInstance.currentUser || currentUser;
  if (!user || user.isAnonymous) {
    return null;
  }

  const database = getDb();
  try {
    const novelDocRef = doc(database, "novels", novelId);
    const snap = await getDoc(novelDocRef);

    if (snap.exists()) {
      const rawData = snap.data();
      const { lastModifiedBySessionId, updatedAt, ownerId, userId, userEmail, ...projectData } = rawData;

      if (ownerId && ownerId !== user.uid) {
        return null;
      }

      let proj = { ...projectData, ownerId: ownerId || user.uid } as NovelProject;

      // Schema Version 2: Re-hydrate partitioned scenes from subcollection
      if (proj.schemaVersion === 2) {
        try {
          const scenesSnap = await getDocs(collection(database, "novels", novelId, "scenes"));
          const sceneMap = new Map<string, { content: string; notes?: string; wordCount?: number }>();
          scenesSnap.forEach((d) => {
            const sc = d.data();
            sceneMap.set(d.id, {
              content: sc.content || "",
              notes: sc.notes,
              wordCount: sc.wordCount,
            });
          });
          proj = rehydrateProjectWithScenes(proj, sceneMap);
        } catch (sceneErr) {
          console.warn("Aviso al recuperar escenas para checkRemoteNovelVersion:", sceneErr);
        }

        if (proj.whiteboard?.isStoredInSubcollection) {
          const wbData = await fetchPartitionedWhiteboard(database, novelId);
          if (wbData) {
            proj.whiteboard = wbData;
          }
        }
      } else {
        // Schema Version 1
        if (proj.whiteboard?.isStoredInSubcollection) {
          const wbData = await fetchPartitionedWhiteboard(database, novelId);
          if (wbData) {
            proj.whiteboard = wbData;
          }
        }
      }

      return {
        project: proj,
        meta: {
          lastModifiedBySessionId,
          updatedAt,
          ownerId: ownerId || user.uid,
          userId: userId || ownerId,
          userEmail,
        },
      };
    }
    return null;
  } catch (error) {
    console.warn(`Aviso al comprobar versión remota de novela ${novelId}:`, error);
    return null;
  }
}

/**
 * Loads a novel project from the cloud.
 * Transparently re-hydrates partitioned scenes for schemaVersion: 2,
 * while maintaining 100% backward compatibility for legacy schemaVersion: 1 projects.
 */
export async function loadNovelFromCloud(novelId: string): Promise<NovelProject | null> {
  const authInstance = getFirebaseAuth();
  const user = authInstance.currentUser || currentUser;
  if (!user || user.isAnonymous) {
    throw new Error("Debes iniciar sesión con Google para cargar novelas desde la nube.");
  }

  const database = getDb();
  const pathForGet = `novels/${novelId}`;
  try {
    const novelDocRef = doc(database, "novels", novelId);
    const snap = await getDoc(novelDocRef);

    if (snap.exists()) {
      const rawData = snap.data();
      if (rawData.ownerId && rawData.ownerId !== user.uid) {
        throw new Error("No tienes permisos para acceder a esta novela.");
      }
      let projectData = { ...rawData, ownerId: rawData.ownerId || user.uid } as NovelProject;

      // Schema Version 2: Re-hydrate partitioned scenes from subcollection
      if (projectData.schemaVersion === 2) {
        try {
          const scenesSnap = await getDocs(collection(database, "novels", novelId, "scenes"));
          const sceneMap = new Map<string, { content: string; notes?: string; wordCount?: number }>();
          scenesSnap.forEach((d) => {
            const sc = d.data();
            sceneMap.set(d.id, {
              content: sc.content || "",
              notes: sc.notes,
              wordCount: sc.wordCount,
            });
          });
          projectData = rehydrateProjectWithScenes(projectData, sceneMap);
        } catch (sceneErr) {
          console.warn("Aviso al cargar subcolección de escenas:", sceneErr);
        }

        if (projectData.whiteboard?.isStoredInSubcollection) {
          const wbData = await fetchPartitionedWhiteboard(database, novelId);
          if (wbData) {
            projectData.whiteboard = wbData;
          }
        }
      } else {
        // Schema Version 1 (legacy monolith): scenes[].content is in root document
        if (projectData.whiteboard?.isStoredInSubcollection) {
          const wbData = await fetchPartitionedWhiteboard(database, novelId);
          if (wbData) {
            projectData.whiteboard = wbData;
          }
        }
      }

      return projectData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pathForGet);
  }
}

export interface CloudNovelSummary {
  id: string;
  ownerId?: string;
  title: string;
  author: string;
  updatedAt: string;
  genre?: string;
  userId?: string;
  userEmail?: string;
  userDisplayName?: string;
  isOwnedByCurrentUser?: boolean;
}

/**
 * Lists novel projects stored in the cloud.
 * Strictly queries projects owned by the currently authenticated Google Account.
 * Thanks to schemaVersion: 2, root documents are compact and load with minimal bandwidth.
 */
export async function listCloudNovels(): Promise<CloudNovelSummary[]> {
  const authInstance = getFirebaseAuth();
  const user = authInstance.currentUser || currentUser;
  if (!user || user.isAnonymous) {
    // Return empty list immediately without making any unauthenticated network request
    return [];
  }

  const database = getDb();
  const pathForList = "novels";
  try {
    const novelsCol = collection(database, pathForList);
    const q = query(novelsCol, where("ownerId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const results: CloudNovelSummary[] = [];

    querySnapshot.forEach((d) => {
      const data = d.data();
      results.push({
        id: data.id || d.id,
        ownerId: data.ownerId || user.uid,
        title: data.title || "Novela sin título",
        author: data.author || "Autor anónimo",
        updatedAt: data.updatedAt || "",
        genre: data.genre,
        userId: data.userId || data.ownerId,
        userEmail: data.userEmail,
        userDisplayName: data.userDisplayName,
        isOwnedByCurrentUser: true,
      });
    });

    results.sort((a, b) => {
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, pathForList);
  }
}

/**
 * Deletes a novel project from the cloud.
 * Hardened Deletion Sequence (Phase 2.2.2 Final):
 * 1. Verificar autenticación (Google user required).
 * 2. Verificar existencia del documento raíz.
 * 3. Verificar ownership (ownerId must match currentUser.uid).
 * 4. Listar escenas particionadas.
 * 5. Borrar escenas por batches (si falla -> abortar y preservar root).
 * 6. Borrar /boards/main (si existe y falla -> abortar y preservar root; si no existe -> éxito).
 * 7. Borrar /data/whiteboard (si existe y falla -> abortar y preservar root; si no existe -> éxito).
 * 8. Eliminar documento raíz /novels/{novelId} (solo tras purga confirmada de subcolecciones).
 * 9. Devolver éxito.
 */
export async function deleteNovelFromCloud(novelId: string): Promise<void> {
  // 1. Verificar autenticación
  const authInstance = getFirebaseAuth();
  const user = authInstance.currentUser || currentUser;
  if (!user || user.isAnonymous) {
    throw new Error("Debes iniciar sesión con Google para eliminar novelas en la nube.");
  }

  const database = getDb();
  const pathForDelete = `novels/${novelId}`;
  const novelDocRef = doc(database, "novels", novelId);

  // 2 & 3. Verificar existencia y ownership del documento raíz
  let rootSnap;
  try {
    rootSnap = await getDoc(novelDocRef);
  } catch (getErr: any) {
    console.error(`[Novelore Cloud] Error al verificar existencia para borrado de ${novelId}:`, getErr);
    handleFirestoreError(getErr, OperationType.GET, pathForDelete);
    throw getErr;
  }

  if (!rootSnap.exists()) {
    // Si ya no existe, no hay nada que eliminar
    return;
  }

  const rootData = rootSnap.data();
  if (rootData?.ownerId && rootData.ownerId !== user.uid) {
    throw new Error("No tienes permisos para eliminar esta novela porque pertenece a otro autor.");
  }

  // 4. Listar escenas particionadas
  let scenesSnap;
  try {
    scenesSnap = await getDocs(collection(database, "novels", novelId, "scenes"));
  } catch (scenesErr: any) {
    console.error(`[Novelore Cloud] Error al listar escenas para borrado de ${novelId}:`, scenesErr);
    throw new Error(`Fallo al acceder a las escenas de la novela para borrado: ${scenesErr?.message || scenesErr}. El documento raíz se mantuvo intacto.`);
  }

  // 5. Borrar escenas por batches de hasta 450 y asegurar commit exitoso
  // Si cualquier lote falla, abortar de inmediato: NO eliminar documento raíz (previene huérfanos)
  if (!scenesSnap.empty) {
    const docs = scenesSnap.docs;
    for (let i = 0; i < docs.length; i += 450) {
      const chunk = docs.slice(i, i + 450);
      const batch = writeBatch(database);
      for (const scDoc of chunk) {
        batch.delete(scDoc.ref);
      }
      try {
        await batch.commit();
      } catch (batchErr: any) {
        console.error(`[Novelore Cloud] Error crítico al eliminar lote de escenas (${i}-${i + chunk.length}) para ${novelId}:`, batchErr);
        throw new Error(
          `Fallo crítico al eliminar escenas en la nube: ${batchErr?.message || batchErr}. El manifiesto raíz NO fue eliminado para prevenir documentos huérfanos.`
        );
      }
    }
  }

  // 6. Borrar /boards/main
  // Si existe y su eliminación falla: lanzar error y preservar root. Si no existe: éxito.
  const boardRef = doc(database, "novels", novelId, "boards", "main");
  try {
    const boardSnap = await getDoc(boardRef);
    if (boardSnap.exists()) {
      await deleteDoc(boardRef);
    }
  } catch (boardErr: any) {
    console.error(`[Novelore Cloud] Error crítico al eliminar boards/main para ${novelId}:`, boardErr);
    throw new Error(
      `Fallo crítico al eliminar tablero visual en la nube: ${boardErr?.message || boardErr}. El manifiesto raíz NO fue eliminado.`
    );
  }

  // 7. Borrar legacy /data/whiteboard
  // Si existe y su eliminación falla: lanzar error y preservar root. Si no existe: éxito.
  const legacyRef = doc(database, "novels", novelId, "data", "whiteboard");
  try {
    const legacySnap = await getDoc(legacyRef);
    if (legacySnap.exists()) {
      await deleteDoc(legacyRef);
    }
  } catch (legacyErr: any) {
    console.error(`[Novelore Cloud] Error crítico al eliminar data/whiteboard para ${novelId}:`, legacyErr);
    throw new Error(
      `Fallo crítico al eliminar pizarra legacy en la nube: ${legacyErr?.message || legacyErr}. El manifiesto raíz NO fue eliminado.`
    );
  }

  // 8. Eliminar documento raíz /novels/{novelId} ÚNICAMENTE tras confirmación de subcolecciones
  try {
    await deleteDoc(novelDocRef);
  } catch (rootDelErr: any) {
    console.error(`[Novelore Cloud] Error al eliminar documento raíz ${novelId}:`, rootDelErr);
    handleFirestoreError(rootDelErr, OperationType.DELETE, pathForDelete);
    throw rootDelErr;
  }

  // 9. Devolver éxito
  console.info(`[Novelore Cloud] Novela ${novelId} y todas sus subcolecciones eliminadas con éxito.`);
}
