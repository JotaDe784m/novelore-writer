import { openDB, DBSchema, IDBPDatabase } from "idb";
import { NovelProject, ProjectVersion, ProjectMeta } from "../types";
import { initialDemoProject } from "../data/demoProject";

/**
 * =====================================================================
 * Novelore Local Persistence Layer (IndexedDB via idb)
 * =====================================================================
 * Database: novelore-local
 * Version: 1
 *
 * Object Stores:
 * 1. projects: Stores complete NovelProject entities by 'id'. Single source of truth.
 * 2. versions: Stores ProjectVersion snapshots by 'id', indexed by 'projectId'. Max 3 per project.
 * 3. metadata: Lightweight key-value store for activeProjectId, flags, migration markers.
 *
 * Designed according to Phase 2.1 specifications:
 * - No duplicated full-project records (no novelist_current_project_v1 equivalent).
 * - Active project identified by activeProjectId in metadata.
 * - Idempotent, non-destructive legacy localStorage migration.
 * - Concurrency serialization via write queue.
 * - Encapsulated error handling and fallback.
 */

export const DB_NAME = "novelore-local";
export const DB_VERSION = 1;
export const MAX_PROJECT_VERSIONS = 3;

export interface StorageHealthStatus {
  isAvailable: boolean; // True if IndexedDB is available and functioning
  isDegraded: boolean; // True if operating in fallback / degraded mode
  lastError: string | null; // Last persistence failure message if any
}

export interface StorageOperationResult<T = void> {
  success: boolean;
  isPersisted: boolean;
  degraded: boolean;
  data?: T;
  error?: string | null;
}

export interface NoveloreLocalDBSchema extends DBSchema {
  projects: {
    key: string;
    value: NovelProject;
  };
  versions: {
    key: string;
    value: ProjectVersion;
    indexes: { by_project: string };
  };
  metadata: {
    key: string;
    value: { key: string; value: any };
  };
}

let dbInstancePromise: Promise<IDBPDatabase<NoveloreLocalDBSchema>> | null = null;

/**
 * Global storage health status to allow UI components to distinguish between
 * durable persistence and degraded in-memory storage.
 */
let isPersistenceDegraded = false;
let lastPersistenceError: string | null = null;
const healthListeners = new Set<(status: StorageHealthStatus) => void>();

export function getStorageHealth(): StorageHealthStatus {
  const available = isIndexedDBAvailable();
  const degraded = !available || isPersistenceDegraded;
  return {
    isAvailable: available && !isPersistenceDegraded,
    isDegraded: degraded,
    lastError: lastPersistenceError,
  };
}

export function onStorageHealthChange(callback: (status: StorageHealthStatus) => void): () => void {
  healthListeners.add(callback);
  callback(getStorageHealth());
  return () => {
    healthListeners.delete(callback);
  };
}

function notifyStorageHealth(degraded: boolean, error?: string | null): void {
  const previousDegraded = isPersistenceDegraded;
  const previousError = lastPersistenceError;
  isPersistenceDegraded = degraded;
  if (error !== undefined) {
    lastPersistenceError = error;
  }

  if (previousDegraded !== degraded || previousError !== lastPersistenceError) {
    const status = getStorageHealth();
    for (const listener of healthListeners) {
      try {
        listener(status);
      } catch (e) {
        console.error("[Novelore Storage] Error en listener de salud de almacenamiento:", e);
      }
    }
  }
}

/**
 * Sequential write queue to prevent race conditions during concurrent saves.
 */
let writeQueue: Promise<any> = Promise.resolve();

export function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task);
  writeQueue = result.then(
    () => {},
    () => {}
  );
  return result;
}

/**
 * Detect whether IndexedDB is available and functional in the current environment.
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.indexedDB !== "undefined" && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Emergency secondary backup helpers for localStorage in case of IndexedDB failure.
 * Ensures the project is not lost silently even in degraded mode.
 */
function tryEmergencyLocalStorageSave(project: NovelProject): void {
  try {
    if (typeof window !== "undefined" && window.localStorage && project?.id) {
      localStorage.setItem(`novelore_emergency_backup_${project.id}`, JSON.stringify(project));
      localStorage.setItem("novelore_emergency_active_id", project.id);
    }
  } catch {
    // If localStorage is unavailable or full, continue without crashing
  }
}

function loadEmergencyLocalStorageProject(id: string): NovelProject | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = localStorage.getItem(`novelore_emergency_backup_${id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id === id) return parsed;
      }
    }
  } catch {}
  return null;
}

/**
 * In-memory fallback stores in case IndexedDB is blocked or disabled by browser policy.
 */
class MemoryFallbackStorage {
  private projects = new Map<string, NovelProject>();
  private versions = new Map<string, ProjectVersion>();
  private metadata = new Map<string, any>();

  constructor() {
    console.warn("[Novelore Storage] Inicializando almacenamiento en memoria como fallback de contingencia.");
  }

  getProject(id: string): NovelProject | null {
    const p = this.projects.get(id);
    return p ? JSON.parse(JSON.stringify(p)) : null;
  }

  saveProject(project: NovelProject): void {
    this.projects.set(project.id, JSON.parse(JSON.stringify(project)));
    this.metadata.set("activeProjectId", project.id);
  }

  getAllProjects(): NovelProject[] {
    return Array.from(this.projects.values()).map((p) => JSON.parse(JSON.stringify(p)));
  }

  deleteProject(id: string): void {
    this.projects.delete(id);
    for (const [vId, v] of this.versions.entries()) {
      if (v.projectId === id) {
        this.versions.delete(vId);
      }
    }
  }

  getMetadata(key: string): any {
    return this.metadata.get(key);
  }

  setMetadata(key: string, value: any): void {
    this.metadata.set(key, value);
  }

  getVersions(projectId: string): ProjectVersion[] {
    return Array.from(this.versions.values())
      .filter((v) => v.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, MAX_PROJECT_VERSIONS);
  }

  saveVersion(version: ProjectVersion): ProjectVersion[] {
    this.versions.set(version.id, JSON.parse(JSON.stringify(version)));
    const list = this.getVersions(version.projectId);
    // Prune excess
    if (list.length > MAX_PROJECT_VERSIONS) {
      const excess = list.slice(MAX_PROJECT_VERSIONS);
      for (const ex of excess) {
        this.versions.delete(ex.id);
      }
    }
    return this.getVersions(version.projectId);
  }

  deleteVersion(versionId: string, projectId: string): ProjectVersion[] {
    this.versions.delete(versionId);
    return this.getVersions(projectId);
  }

  clearVersions(projectId: string): void {
    for (const [vId, v] of this.versions.entries()) {
      if (v.projectId === projectId) {
        this.versions.delete(vId);
      }
    }
  }
}

let memoryFallback: MemoryFallbackStorage | null = null;
function getMemoryFallback(): MemoryFallbackStorage {
  if (!memoryFallback) {
    memoryFallback = new MemoryFallbackStorage();
  }
  return memoryFallback;
}

/**
 * Open or retrieve the singleton IndexedDB database connection.
 */
export async function getDB(): Promise<IDBPDatabase<NoveloreLocalDBSchema> | null> {
  if (!isIndexedDBAvailable()) {
    return null;
  }

  if (!dbInstancePromise) {
    dbInstancePromise = openDB<NoveloreLocalDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Store 1: projects
        if (!db.objectStoreNames.contains("projects")) {
          db.createObjectStore("projects", { keyPath: "id" });
        }

        // Store 2: versions with index on projectId
        if (!db.objectStoreNames.contains("versions")) {
          const versionStore = db.createObjectStore("versions", { keyPath: "id" });
          versionStore.createIndex("by_project", "projectId");
        }

        // Store 3: metadata
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata", { keyPath: "key" });
        }
      },
      blocked() {
        console.warn("[Novelore Storage] La base de datos IndexedDB está bloqueada por otra pestaña.");
      },
      blocking() {
        console.warn("[Novelore Storage] Esta conexión de base de datos está bloqueando una actualización.");
      },
      terminated() {
        console.error("[Novelore Storage] La conexión con IndexedDB se cerró inesperadamente.");
        dbInstancePromise = null;
      },
    }).catch((err) => {
      console.error("[Novelore Storage] Error al abrir la base de datos IndexedDB:", err);
      dbInstancePromise = null;
      return null as any;
    });
  }

  return dbInstancePromise;
}

/**
 * Idempotent, non-destructive migration from legacy localStorage keys.
 * Reads legacy data, validates structure, writes to IndexedDB, strictly enforces MAX_PROJECT_VERSIONS (3)
 * through physical deletion, and marks migration complete.
 * Preserves legacy localStorage keys as temporary backup.
 */
export async function runLegacyLocalStorageMigration(
  db: IDBPDatabase<NoveloreLocalDBSchema>,
  force = false
): Promise<void> {
  if (typeof window === "undefined" || !window.localStorage) return;
  const storage = window.localStorage;

  try {
    const status = await db.get("metadata", "legacy_migration_status");
    if (!force && status && status.value?.migrated) {
      return; // Migration already successfully recorded
    }

    const legacyProjects: NovelProject[] = [];
    const seenProjectIds = new Set<string>();

    // 1. Gather project from novelist_current_project_v1
    const currentRaw = storage.getItem("novelist_current_project_v1");
    if (currentRaw) {
      try {
        const parsed = JSON.parse(currentRaw);
        if (parsed && parsed.id && Array.isArray(parsed.acts) && Array.isArray(parsed.entities)) {
          legacyProjects.push(parsed);
          seenProjectIds.add(parsed.id);
        }
      } catch (e) {
        console.warn("[Novelore Migration] No se pudo parsear novelist_current_project_v1:", e);
      }
    }

    // 2. Gather projects from individual project keys novelist_project_*
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith("novelist_project_") && key !== "novelist_project_list_v1") {
        const raw = storage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (
              parsed &&
              parsed.id &&
              Array.isArray(parsed.acts) &&
              Array.isArray(parsed.entities) &&
              !seenProjectIds.has(parsed.id)
            ) {
              legacyProjects.push(parsed);
              seenProjectIds.add(parsed.id);
            }
          } catch (e) {
            console.warn(`[Novelore Migration] No se pudo parsear clave legacy ${key}:`, e);
          }
        }
      }
    }

    // 3. Write projects to IndexedDB (only if missing or if legacy timestamp is newer)
    for (const proj of legacyProjects) {
      const existing = await db.get("projects", proj.id);
      if (!existing) {
        await db.put("projects", proj);
      } else {
        const legacyTime = new Date(proj.updatedAt || 0).getTime();
        const existingTime = new Date(existing.updatedAt || 0).getTime();
        if (legacyTime > existingTime) {
          await db.put("projects", proj);
        }
      }

      // 4. Strict legacy versions migration (Problem B requirements):
      // Step 1: Read legacy versions
      const versionsRaw = storage.getItem(`novelist_versions_${proj.id}`);
      if (versionsRaw) {
        try {
          const versionsList = JSON.parse(versionsRaw);
          if (Array.isArray(versionsList)) {
            // Step 2 & 3: Validate and insert only valid entries; keep existing DB records to avoid overwriting newer data
            for (const v of versionsList) {
              if (v && v.id && v.projectSnapshot && v.timestamp) {
                const existingVer = await db.get("versions", v.id);
                if (!existingVer) {
                  await db.put("versions", {
                    ...v,
                    projectId: proj.id,
                  });
                }
              }
            }
          }
        } catch (e) {
          console.warn(`[Novelore Migration] No se pudieron migrar versiones para ${proj.id}:`, e);
        }
      }

      // Step 4: Obtenemos todas las versiones del proyecto desde IndexedDB
      const allForProject = await db.getAllFromIndex("versions", "by_project", proj.id);
      if (allForProject && allForProject.length > 0) {
        // Step 5: Ordenamos por timestamp descendente (más recientes primero)
        const sorted = allForProject.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeB - timeA;
        });

        // Step 6 & 7: Conservar las 3 más recientes y eliminar físicamente las restantes
        if (sorted.length > MAX_PROJECT_VERSIONS) {
          const excess = sorted.slice(MAX_PROJECT_VERSIONS);
          for (const verToDelete of excess) {
            await db.delete("versions", verToDelete.id);
          }
        }
      }
    }

    // Verify all existing projects in DB to guarantee physical limit: count(versions) <= 3
    const allDbProjects = await db.getAll("projects");
    for (const p of allDbProjects) {
      const vers = await db.getAllFromIndex("versions", "by_project", p.id);
      if (vers && vers.length > MAX_PROJECT_VERSIONS) {
        const sorted = vers.sort(
          (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
        );
        const excess = sorted.slice(MAX_PROJECT_VERSIONS);
        for (const ex of excess) {
          await db.delete("versions", ex.id);
        }
      }
    }

    // 5. Determine and store activeProjectId in metadata
    const activeMeta = await db.get("metadata", "activeProjectId");
    if (!activeMeta || !activeMeta.value) {
      let activeId = "";
      if (currentRaw) {
        try {
          const parsed = JSON.parse(currentRaw);
          if (parsed && parsed.id) activeId = parsed.id;
        } catch {}
      }
      if (!activeId && legacyProjects.length > 0) {
        activeId = legacyProjects[0].id;
      }
      if (activeId) {
        await db.put("metadata", { key: "activeProjectId", value: activeId });
      }
    }

    // 6. Check demo dismissed flag
    if (storage.getItem("novelist_demo_dismissed_v1") === "true") {
      await db.put("metadata", { key: "demoDismissed", value: true });
    }

    // Step 8: Only mark migration as completed after physical pruning and validation
    await db.put("metadata", {
      key: "legacy_migration_status",
      value: { migrated: true, migratedAt: new Date().toISOString() },
    });

    console.info("[Novelore Storage] Migración desde localStorage a IndexedDB completada con retención física estricta de versiones.");
  } catch (err) {
    console.error("[Novelore Storage] Error durante la migración legacy a IndexedDB:", err);
  }
}

/**
 * Initialize local persistence layer and run migration if needed.
 */
export async function initLocalPersistence(): Promise<void> {
  const db = await getDB();
  if (db) {
    await runLegacyLocalStorageMigration(db);
  }
}

/**
 * =====================================================================
 * CRUD DE PROYECTOS (Object Store: projects)
 * =====================================================================
 */

export async function saveProjectToDB(
  project: NovelProject
): Promise<StorageOperationResult<void>> {
  return enqueueWrite(async () => {
    const db = await getDB();
    if (!db) {
      notifyStorageHealth(true, "IndexedDB no está disponible en este entorno");
      getMemoryFallback().saveProject(project);
      tryEmergencyLocalStorageSave(project);
      return {
        success: true,
        isPersisted: false,
        degraded: true,
        error: "IndexedDB no disponible; guardado temporalmente en memoria",
      };
    }

    try {
      const tx = db.transaction(["projects", "metadata"], "readwrite");
      await tx.objectStore("projects").put(project);
      await tx.objectStore("metadata").put({ key: "activeProjectId", value: project.id });
      await tx.done;

      notifyStorageHealth(false, null);
      return {
        success: true,
        isPersisted: true,
        degraded: false,
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error(`[Novelore Storage] Error guardando proyecto ${project.id} en IndexedDB:`, err);
      notifyStorageHealth(true, errMsg);
      getMemoryFallback().saveProject(project);
      tryEmergencyLocalStorageSave(project);
      return {
        success: true,
        isPersisted: false,
        degraded: true,
        error: errMsg,
      };
    }
  });
}

export async function getProjectFromDB(id: string): Promise<NovelProject | null> {
  const db = await getDB();
  if (!db) {
    notifyStorageHealth(true, "IndexedDB no disponible");
    const mem = getMemoryFallback().getProject(id);
    if (mem) return mem;
    return loadEmergencyLocalStorageProject(id);
  }

  try {
    const proj = await db.get("projects", id);
    if (proj) return proj;
    const mem = getMemoryFallback().getProject(id);
    if (mem) return mem;
    return loadEmergencyLocalStorageProject(id);
  } catch (err: any) {
    console.error(`[Novelore Storage] Error leyendo proyecto ${id} de IndexedDB:`, err);
    notifyStorageHealth(true, err?.message || String(err));
    const mem = getMemoryFallback().getProject(id);
    if (mem) return mem;
    return loadEmergencyLocalStorageProject(id);
  }
}

export async function getAllProjectsFromDB(): Promise<NovelProject[]> {
  const db = await getDB();
  if (!db) {
    notifyStorageHealth(true, "IndexedDB no disponible");
    return getMemoryFallback().getAllProjects();
  }

  try {
    const list = await db.getAll("projects");
    const memProjects = getMemoryFallback().getAllProjects();
    if (memProjects.length === 0) return list || [];

    const map = new Map<string, NovelProject>();
    for (const p of list || []) map.set(p.id, p);
    for (const p of memProjects) map.set(p.id, p);
    return Array.from(map.values());
  } catch (err: any) {
    console.error("[Novelore Storage] Error leyendo lista de proyectos de IndexedDB:", err);
    notifyStorageHealth(true, err?.message || String(err));
    return getMemoryFallback().getAllProjects();
  }
}

export async function deleteProjectFromDB(
  id: string
): Promise<StorageOperationResult<void>> {
  return enqueueWrite(async () => {
    getMemoryFallback().deleteProject(id);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(`novelore_emergency_backup_${id}`);
      }
    } catch {}

    const db = await getDB();
    if (!db) {
      notifyStorageHealth(true, "IndexedDB no disponible");
      return { success: true, isPersisted: false, degraded: true };
    }

    try {
      const tx = db.transaction(["projects", "versions"], "readwrite");
      await tx.objectStore("projects").delete(id);

      // Clean up versions associated with this project physically
      const versionStore = tx.objectStore("versions");
      const projectIndex = versionStore.index("by_project");
      const versions = await projectIndex.getAll(id);
      for (const ver of versions) {
        await versionStore.delete(ver.id);
      }

      await tx.done;
      return { success: true, isPersisted: true, degraded: false };
    } catch (err: any) {
      console.error(`[Novelore Storage] Error eliminando proyecto ${id} de IndexedDB:`, err);
      notifyStorageHealth(true, err?.message || String(err));
      return { success: true, isPersisted: false, degraded: true };
    }
  });
}

/**
 * =====================================================================
 * GESTIÓN DE METADATOS Y PROYECTO ACTIVO (Object Store: metadata)
 * =====================================================================
 */

export async function getActiveProjectIdFromDB(): Promise<string | null> {
  const db = await getDB();
  if (!db) {
    const memId = getMemoryFallback().getMetadata("activeProjectId");
    if (memId) return memId;
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("novelore_emergency_active_id") || null;
    }
    return null;
  }

  try {
    const record = await db.get("metadata", "activeProjectId");
    return record ? record.value : null;
  } catch (err: any) {
    console.error("[Novelore Storage] Error leyendo activeProjectId de IndexedDB:", err);
    return getMemoryFallback().getMetadata("activeProjectId") || null;
  }
}

export async function setActiveProjectIdInDB(id: string): Promise<void> {
  return enqueueWrite(async () => {
    getMemoryFallback().setMetadata("activeProjectId", id);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("novelore_emergency_active_id", id);
      }
    } catch {}

    const db = await getDB();
    if (!db) return;

    try {
      await db.put("metadata", { key: "activeProjectId", value: id });
    } catch (err) {
      console.error(`[Novelore Storage] Error actualizando activeProjectId ${id}:`, err);
    }
  });
}

export async function isDemoDismissedInDB(): Promise<boolean> {
  const db = await getDB();
  if (!db) {
    return Boolean(getMemoryFallback().getMetadata("demoDismissed"));
  }

  try {
    const record = await db.get("metadata", "demoDismissed");
    return Boolean(record?.value);
  } catch (err) {
    console.error("[Novelore Storage] Error leyendo demoDismissed de IndexedDB:", err);
    return Boolean(getMemoryFallback().getMetadata("demoDismissed"));
  }
}

export async function setDemoDismissedInDB(dismissed: boolean): Promise<void> {
  return enqueueWrite(async () => {
    getMemoryFallback().setMetadata("demoDismissed", dismissed);

    const db = await getDB();
    if (!db) return;

    try {
      await db.put("metadata", { key: "demoDismissed", value: dismissed });
    } catch (err) {
      console.error("[Novelore Storage] Error guardando demoDismissed en IndexedDB:", err);
    }
  });
}

/**
 * =====================================================================
 * HISTORIAL DE VERSIONES (Object Store: versions)
 * Máximo estricto: 3 versiones por proyecto (MAX_PROJECT_VERSIONS = 3)
 * =====================================================================
 */

export async function getProjectVersionsFromDB(projectId: string): Promise<ProjectVersion[]> {
  const db = await getDB();
  if (!db) {
    notifyStorageHealth(true, "IndexedDB no disponible");
    return getMemoryFallback().getVersions(projectId);
  }

  try {
    const versions = await db.getAllFromIndex("versions", "by_project", projectId);
    return (versions || [])
      .filter((v) => v && v.id && v.projectSnapshot)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, MAX_PROJECT_VERSIONS);
  } catch (err: any) {
    console.error(`[Novelore Storage] Error recuperando versiones para ${projectId} de IndexedDB:`, err);
    notifyStorageHealth(true, err?.message || String(err));
    return getMemoryFallback().getVersions(projectId);
  }
}

export async function saveProjectVersionToDB(
  version: ProjectVersion
): Promise<ProjectVersion[]> {
  return enqueueWrite(async () => {
    const db = await getDB();
    if (!db) {
      notifyStorageHealth(true, "IndexedDB no disponible");
      return getMemoryFallback().saveVersion(version);
    }

    try {
      const tx = db.transaction("versions", "readwrite");
      const store = tx.objectStore("versions");
      await store.put(version);

      // Enforce MAX_PROJECT_VERSIONS (3) physically in the object store
      const projectIndex = store.index("by_project");
      const allForProject = await projectIndex.getAll(version.projectId);
      const sorted = (allForProject || []).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      if (sorted.length > MAX_PROJECT_VERSIONS) {
        const excess = sorted.slice(MAX_PROJECT_VERSIONS);
        for (const item of excess) {
          await store.delete(item.id);
        }
      }

      await tx.done;
      notifyStorageHealth(false, null);

      return sorted.slice(0, MAX_PROJECT_VERSIONS);
    } catch (err: any) {
      console.error(`[Novelore Storage] Error guardando versión en IndexedDB:`, err);
      notifyStorageHealth(true, err?.message || String(err));
      return getMemoryFallback().saveVersion(version);
    }
  });
}

export async function deleteProjectVersionFromDB(
  versionId: string,
  projectId: string
): Promise<ProjectVersion[]> {
  return enqueueWrite(async () => {
    getMemoryFallback().deleteVersion(versionId, projectId);

    const db = await getDB();
    if (!db) {
      notifyStorageHealth(true, "IndexedDB no disponible");
      return getMemoryFallback().getVersions(projectId);
    }

    try {
      await db.delete("versions", versionId);
      return getProjectVersionsFromDB(projectId);
    } catch (err: any) {
      console.error(`[Novelore Storage] Error eliminando versión ${versionId} de IndexedDB:`, err);
      notifyStorageHealth(true, err?.message || String(err));
      return getMemoryFallback().deleteVersion(versionId, projectId);
    }
  });
}

export async function clearProjectVersionsFromDB(projectId: string): Promise<void> {
  return enqueueWrite(async () => {
    getMemoryFallback().clearVersions(projectId);

    const db = await getDB();
    if (!db) {
      notifyStorageHealth(true, "IndexedDB no disponible");
      return;
    }

    try {
      const tx = db.transaction("versions", "readwrite");
      const store = tx.objectStore("versions");
      const projectIndex = store.index("by_project");
      const versions = await projectIndex.getAll(projectId);
      for (const v of versions) {
        await store.delete(v.id);
      }
      await tx.done;
    } catch (err: any) {
      console.error(`[Novelore Storage] Error limpiando versiones de ${projectId}:`, err);
      notifyStorageHealth(true, err?.message || String(err));
    }
  });
}
