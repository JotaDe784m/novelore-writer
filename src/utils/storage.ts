import { NovelProject, ProjectMeta, ProjectVersion } from "../types";
import { initialDemoProject } from "../data/demoProject";
import {
  initLocalPersistence,
  saveProjectToDB,
  getProjectFromDB,
  getAllProjectsFromDB,
  deleteProjectFromDB,
  getActiveProjectIdFromDB,
  setActiveProjectIdInDB,
  isDemoDismissedInDB,
  setDemoDismissedInDB,
  getProjectVersionsFromDB,
  saveProjectVersionToDB,
  deleteProjectVersionFromDB,
  clearProjectVersionsFromDB,
  getStorageHealth,
  onStorageHealthChange,
  isIndexedDBAvailable,
  MAX_PROJECT_VERSIONS,
} from "../lib/local-db";
import type { StorageHealthStatus, StorageOperationResult } from "../lib/local-db";

export {
  MAX_PROJECT_VERSIONS,
  getStorageHealth,
  onStorageHealthChange,
  isIndexedDBAvailable,
};
export type { StorageHealthStatus, StorageOperationResult };

export const DEMO_DISMISSED_KEY = "novelist_demo_dismissed_v1";

export function createBlankProject(title: string = "Mi Nueva Novela"): NovelProject {
  const now = new Date().toISOString();
  const actId = `act-${Date.now()}`;
  const chapId = `chap-${Date.now()}`;
  const sceneId = `scene-${Date.now()}`;

  return {
    id: `proj-${Date.now()}`,
    title,
    author: "Autor",
    genre: "Ficción General",
    logline: "",
    synopsis: "",
    createdAt: now,
    updatedAt: now,
    settings: {
      targetTotalWords: 50000,
      dialogueStyle: "dash",
      fontFamily: "serif",
      fontSize: 18,
      lineSpacing: "relaxed",
      typewriterMode: false,
      focusMode: false,
      theme: "minimal",
    },
    acts: [
      {
        id: actId,
        title: "Acto I",
        description: "Inicio de la narración",
        order: 1,
        chapters: [
          {
            id: chapId,
            actId,
            title: "Capítulo 1",
            description: "",
            order: 1,
            scenes: [
              {
                id: sceneId,
                chapterId: chapId,
                title: "Escena 1",
                content: "",
                synopsis: "",
                notes: "",
                wordCount: 0,
                targetWordCount: 1500,
                goal: "",
                conflict: "",
                outcome: "",
                order: 1,
                status: "draft",
                characterIds: [],
              },
            ],
          },
        ],
      },
    ],
    entities: [],
    relationships: [],
    timelineTracks: [],
    timelineEvents: [],
    storyBeats: [],
  };
}

export function getProjectStorageKey(id: string): string {
  return `novelist_project_${id}`;
}

/**
 * Loads the active project from IndexedDB.
 * Handles migration from legacy localStorage if necessary.
 */
export async function loadCurrentProject(): Promise<NovelProject> {
  await initLocalPersistence();

  try {
    const activeId = await getActiveProjectIdFromDB();
    if (activeId) {
      const proj = await getProjectFromDB(activeId);
      if (proj && proj.acts && proj.entities) {
        return proj;
      }
    }

    const allProjects = await getAllProjectsFromDB();
    if (allProjects.length > 0) {
      // Pick the most recently updated
      allProjects.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      const chosen = allProjects[0];
      await setActiveProjectIdInDB(chosen.id);
      return chosen;
    }

    const isDemoDismissed = await isDemoDismissedInDB();
    if (isDemoDismissed) {
      const blank = createBlankProject();
      await saveProjectToDB(blank);
      return blank;
    }

    // Default to initial demo project
    await saveProjectToDB(initialDemoProject);
    return initialDemoProject;
  } catch (err) {
    console.error("[Novelore Storage] Error al cargar proyecto actual:", err);
    return initialDemoProject;
  }
}

export const loadActiveProject = loadCurrentProject;

/**
 * Saves project to IndexedDB as an individual record.
 * Returns StorageOperationResult indicating whether data was persisted or degraded.
 */
export async function saveCurrentProject(
  project: NovelProject
): Promise<StorageOperationResult<void>> {
  if (!project || !project.id) {
    return {
      success: false,
      isPersisted: false,
      degraded: true,
      error: "No se proporcionó un proyecto válido",
    };
  }

  try {
    const updated: NovelProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    return await saveProjectToDB(updated);
  } catch (err: any) {
    console.error("[Novelore Storage] Error al guardar proyecto:", err);
    return {
      success: false,
      isPersisted: false,
      degraded: true,
      error: err?.message || String(err),
    };
  }
}

export const saveProject = saveCurrentProject;

/**
 * Loads a project by ID from IndexedDB.
 * Updates activeProjectId in metadata.
 */
export async function loadProjectById(id: string): Promise<NovelProject | null> {
  await initLocalPersistence();

  try {
    const proj = await getProjectFromDB(id);
    if (proj && proj.acts && proj.entities) {
      await setActiveProjectIdInDB(proj.id);
      return proj;
    }

    if (id === initialDemoProject.id) {
      await saveProjectToDB(initialDemoProject);
      return initialDemoProject;
    }
  } catch (err) {
    console.error(`[Novelore Storage] Error al cargar proyecto ${id}:`, err);
  }
  return null;
}

/**
 * Derives the list of projects directly from IndexedDB records.
 * Single source of truth.
 */
export async function listProjectsMeta(): Promise<ProjectMeta[]> {
  await initLocalPersistence();

  try {
    const isDismissed = await isDemoDismissedInDB();
    let all = await getAllProjectsFromDB();

    if (isDismissed) {
      all = all.filter(
        (p) => p.id !== initialDemoProject.id && p.id !== "proj-sombras-alcaraz"
      );
    }

    if (all.length === 0 && !isDismissed) {
      // Seed demo project if empty and not dismissed
      await saveProjectToDB(initialDemoProject);
      all = [initialDemoProject];
    }

    const metaList = all.map((p) => extractProjectMeta(p));
    metaList.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return metaList;
  } catch (err) {
    console.error("[Novelore Storage] Error al listar metadatos de proyectos:", err);
    return [];
  }
}

export function extractProjectMeta(project: NovelProject): ProjectMeta {
  const totalWords = calculateTotalWords(project);
  let sceneCount = 0;
  let chapterCount = 0;

  for (const act of project.acts || []) {
    chapterCount += (act.chapters || []).length;
    for (const chap of act.chapters || []) {
      sceneCount += (chap.scenes || []).length;
    }
  }

  return {
    id: project.id,
    title: project.title || "Novela sin título",
    subtitle: project.subtitle || "",
    author: project.author || "Anónimo",
    genre: project.genre || "Ficción",
    coverUrl: project.coverUrl || "",
    enableWordGoals: project.settings?.enableWordGoals !== false,
    synopsis: project.synopsis || "",
    logline: project.logline || "",
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || new Date().toISOString(),
    wordCount: totalWords,
    targetWords: project.settings?.targetTotalWords || 50000,
    actCount: (project.acts || []).length,
    chapterCount,
    sceneCount,
    characterCount: (project.entities || []).filter((e) => e.category === "character").length,
  };
}

export async function deleteProjectById(id: string): Promise<ProjectMeta[]> {
  try {
    if (id === initialDemoProject.id || id === "proj-sombras-alcaraz") {
      await setDemoDismissedInDB(true);
    }

    await deleteProjectFromDB(id);

    const activeId = await getActiveProjectIdFromDB();
    if (activeId === id) {
      const remaining = await getAllProjectsFromDB();
      if (remaining.length > 0) {
        remaining.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        await setActiveProjectIdInDB(remaining[0].id);
      } else {
        const blank = createBlankProject();
        await saveProjectToDB(blank);
      }
    }

    return await listProjectsMeta();
  } catch (err) {
    console.error(`[Novelore Storage] Error al eliminar proyecto ${id}:`, err);
    return await listProjectsMeta();
  }
}

export async function duplicateProject(id: string): Promise<NovelProject | null> {
  try {
    const original = await loadProjectById(id);
    if (!original) return null;

    const newId = `proj-${Date.now()}`;
    const cloned: NovelProject = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      title: `${original.title} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProject(cloned);
    return cloned;
  } catch (err) {
    console.error(`[Novelore Storage] Error al duplicar proyecto ${id}:`, err);
    return null;
  }
}

export async function getMostRecentProjectMeta(): Promise<ProjectMeta | null> {
  const list = await listProjectsMeta();
  return list.length > 0 ? list[0] : null;
}

export function calculateTotalWords(project: NovelProject): number {
  let count = 0;
  for (const act of project.acts || []) {
    for (const chap of act.chapters || []) {
      for (const scene of chap.scenes || []) {
        count += scene.wordCount || 0;
      }
    }
  }
  return count;
}

export interface CreateProjectOptions {
  title: string;
  subtitle?: string;
  author?: string;
  genre?: string;
  coverUrl?: string;
  logline?: string;
  synopsis?: string;
  targetWords?: number;
  enableWordGoals?: boolean;
  actWordGoal?: number;
  chapterWordGoal?: number;
  sceneWordGoal?: number;
  defaultActTargetWords?: number;
  defaultChapterTargetWords?: number;
  defaultSceneTargetWords?: number;
  dialogueStyle?: "dash" | "guillemets" | "quotes";
  theme?: "minimal" | "clean" | "sepia" | "dark" | "light" | "forest" | "midnight";
}

export async function createNewProject(
  titleOrOptions?: string | CreateProjectOptions
): Promise<NovelProject> {
  const options: CreateProjectOptions =
    typeof titleOrOptions === "string"
      ? { title: titleOrOptions }
      : titleOrOptions || { title: "Nueva Novela" };

  const newId = `proj-${Date.now()}`;
  const sceneGoal = options.sceneWordGoal || options.defaultSceneTargetWords || 1500;
  const chapGoal = options.chapterWordGoal || options.defaultChapterTargetWords || 3000;
  const actGoal = options.actWordGoal || options.defaultActTargetWords || 15000;

  const newProject: NovelProject = {
    id: newId,
    title: options.title || "Nueva Novela",
    subtitle: options.subtitle || "",
    author: options.author || "",
    genre: options.genre || "Fantasía / Ficción",
    coverUrl: options.coverUrl || "",
    logline: options.logline || "",
    synopsis: options.synopsis || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      targetTotalWords: options.targetWords || 50000,
      enableWordGoals: options.enableWordGoals ?? true,
      defaultActWordGoal: actGoal,
      defaultChapterWordGoal: chapGoal,
      defaultSceneWordGoal: sceneGoal,
      dialogueStyle: options.dialogueStyle || "dash",
      fontFamily: "serif",
      fontSize: 18,
      lineSpacing: "relaxed",
      typewriterMode: false,
      focusMode: false,
      theme: options.theme || "minimal",
    },
    acts: [
      {
        id: `act-${Date.now()}-1`,
        title: "Acto I: Planteamiento",
        description: "Presentación del mundo, el protagonista y el detonante.",
        order: 1,
        targetWordCount: actGoal,
        chapters: [
          {
            id: `chap-${Date.now()}-1`,
            actId: `act-${Date.now()}-1`,
            title: "Capítulo 1: El Comienzo",
            description: "Inicio de la aventura.",
            order: 1,
            targetWordCount: chapGoal,
            scenes: [
              {
                id: `scene-${Date.now()}-1`,
                chapterId: `chap-${Date.now()}-1`,
                title: "Escena 1: Apertura",
                content: `—Esta es la primera línea de tu nueva historia —dijo el narrador mientras la pluma tocaba el papel.`,
                synopsis: "Primera escena introductoria.",
                notes: "",
                status: "draft",
                characterIds: [],
                goal: "Presentar al protagonista en su entorno ordinario.",
                conflict: "Algo inesperado perturba la calma.",
                outcome: "Se abre el misterio o la aventura.",
                targetWordCount: sceneGoal,
                wordCount: 15,
                order: 1,
              },
            ],
          },
        ],
      },
    ],
    entities: [],
    relationships: [],
    timelineTracks: [
      {
        id: `trk-${Date.now()}-main`,
        name: "Trama Principal",
        color: "#3a3a3a",
        description: "El arco conductor de la historia.",
        isMainPlot: true,
      },
      {
        id: `trk-${Date.now()}-sub1`,
        name: "Subtrama 1",
        color: "#8a8a88",
        description: "Relaciones o misterio secundario.",
        isMainPlot: false,
      },
    ],
    timelineEvents: [],
    storyBeats: [
      {
        id: "beat-1",
        name: "Mundo Ordinario",
        structure: "three_act",
        percentage: 5,
        description: "La vida del protagonista antes del cambio.",
      },
      {
        id: "beat-2",
        name: "Incidente Incitador",
        structure: "three_act",
        percentage: 12,
        description: "El suceso que rompe el equilibrio.",
      },
      {
        id: "beat-3",
        name: "Punto de No Retorno (Plot Point 1)",
        structure: "three_act",
        percentage: 25,
        description: "El protagonista acepta la llamada o cruza el umbral.",
      },
      {
        id: "beat-4",
        name: "Punto Medio (Midpoint)",
        structure: "three_act",
        percentage: 50,
        description: "Gran revelación o cambio de juego.",
      },
      {
        id: "beat-5",
        name: "Momento más Oscuro",
        structure: "three_act",
        percentage: 75,
        description: "Todo parece perdido antes del empuje final.",
      },
      {
        id: "beat-6",
        name: "Clímax",
        structure: "three_act",
        percentage: 90,
        description: "La confrontación decisiva.",
      },
    ],
  };

  await saveProject(newProject);
  return newProject;
}

export async function resetToDemoProject(): Promise<NovelProject> {
  const currentProject = await loadCurrentProject();
  const savedTheme =
    (typeof window !== "undefined" && localStorage.getItem("novelore_user_theme")) ||
    currentProject?.settings?.theme ||
    "minimal";
  const savedAccent =
    (typeof window !== "undefined" && localStorage.getItem("novelore_user_accent")) ||
    currentProject?.settings?.customAccentColor;

  const demoProjectWithPreservedTheme: NovelProject = {
    ...initialDemoProject,
    settings: {
      ...initialDemoProject.settings,
      theme: (savedTheme as any) || initialDemoProject.settings.theme,
      customAccentColor: savedAccent || initialDemoProject.settings.customAccentColor,
    },
  };

  await saveProject(demoProjectWithPreservedTheme);
  return demoProjectWithPreservedTheme;
}

/**
 * Export proprietary .nvl (Novelore) project file.
 */
export function exportProjectToNvlFile(project: NovelProject): void {
  const payload = {
    $schema: "https://novelore.app/schemas/project-v1.json",
    format: "novelore-project",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    generator: "Novelore Studio",
    metrics: {
      totalWords: calculateTotalWords(project),
      actsCount: (project.acts || []).length,
      entitiesCount: (project.entities || []).length,
    },
    project,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/x-novelore+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const cleanTitle = (project.title || "novela")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  a.download = `${cleanTitle || "mi_novela"}.nvl`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Backward compatibility alias
export const exportProjectToNovelistFile = exportProjectToNvlFile;

export function exportProjectToJson(project: NovelProject): void {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cleanTitle = (project.title || "novela")
    .toLowerCase()
    .replace(/\s+/g, "_");
  a.download = `${cleanTitle}_backup.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import project from either .nvl / .novelist file or raw JSON.
 */
export async function importProjectFromNvlOrJson(
  fileContent: string
): Promise<{ project: NovelProject; isNvlFormat: boolean; isNovelistFormat: boolean } | null> {
  try {
    const parsed = JSON.parse(fileContent);
    let targetProject: any = null;
    let isNvlFormat = false;

    if (
      parsed &&
      (parsed.format === "novelore-project" || parsed.format === "novelist-project") &&
      parsed.project
    ) {
      targetProject = parsed.project;
      isNvlFormat = true;
    } else if (parsed && Array.isArray(parsed.acts)) {
      targetProject = parsed;
    }

    if (targetProject && Array.isArray(targetProject.acts)) {
      const newId = targetProject.id || `proj-${Date.now()}`;

      const validated: NovelProject = {
        id: newId,
        title: targetProject.title || "Novela Importada",
        subtitle: targetProject.subtitle || "",
        author: targetProject.author || "",
        genre: targetProject.genre || "Ficción",
        logline: targetProject.logline || "",
        synopsis: targetProject.synopsis || "",
        createdAt: targetProject.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: targetProject.settings || {
          targetTotalWords: 50000,
          dialogueStyle: "dash",
          fontFamily: "serif",
          fontSize: 18,
          lineSpacing: "relaxed",
          typewriterMode: false,
          theme: "minimal",
        },
        acts: targetProject.acts,
        entities: Array.isArray(targetProject.entities) ? targetProject.entities : [],
        relationships: Array.isArray(targetProject.relationships) ? targetProject.relationships : [],
        timelineTracks: Array.isArray(targetProject.timelineTracks) ? targetProject.timelineTracks : [],
        timelineEvents: Array.isArray(targetProject.timelineEvents) ? targetProject.timelineEvents : [],
        storyBeats: Array.isArray(targetProject.storyBeats) ? targetProject.storyBeats : [],
      };

      await saveProject(validated);
      return { project: validated, isNvlFormat, isNovelistFormat: isNvlFormat };
    }
  } catch (err) {
    console.error("[Novelore Storage] Error importando archivo .nvl o JSON:", err);
  }
  return null;
}

export const importProjectFromNovelistOrJson = importProjectFromNvlOrJson;

export async function importProjectFromJson(jsonString: string): Promise<NovelProject | null> {
  const result = await importProjectFromNvlOrJson(jsonString);
  return result ? result.project : null;
}

/**
 * =====================================================================
 * VERSIONES LOCALES (IndexedDB: store 'versions')
 * Mantiene estrictamente hasta MAX_PROJECT_VERSIONS (3) versiones.
 * =====================================================================
 */

export function getVersionStorageKey(projectId: string): string {
  return `novelist_versions_${projectId}`;
}

export async function getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
  await initLocalPersistence();
  return await getProjectVersionsFromDB(projectId);
}

export async function saveProjectVersion(
  project: NovelProject,
  label?: string,
  force: boolean = false
): Promise<ProjectVersion[]> {
  if (!project || !project.id) return [];

  await initLocalPersistence();

  try {
    const currentVersions = await getProjectVersionsFromDB(project.id);
    const totalWords = calculateTotalWords(project);
    let sceneCount = 0;
    let chapterCount = 0;

    for (const act of project.acts || []) {
      chapterCount += (act.chapters || []).length;
      for (const chap of act.chapters || []) {
        sceneCount += (chap.scenes || []).length;
      }
    }

    // Debounce non-forced versions if identical within 45s
    if (!force && currentVersions.length > 0) {
      const last = currentVersions[0];
      const timeDiffMs = Date.now() - new Date(last.timestamp).getTime();
      if (timeDiffMs < 45000 && last.wordCount === totalWords && last.sceneCount === sceneCount) {
        return currentVersions;
      }
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newVersion: ProjectVersion = {
      id: `ver-${Date.now()}`,
      projectId: project.id,
      timestamp: now.toISOString(),
      label: label || `Autoguardado (${timeFormatted})`,
      wordCount: totalWords,
      actCount: (project.acts || []).length,
      chapterCount,
      sceneCount,
      projectSnapshot: JSON.parse(JSON.stringify(project)),
    };

    return await saveProjectVersionToDB(newVersion);
  } catch (err) {
    console.error("[Novelore Storage] Error al guardar versión en IndexedDB:", err);
    return await getProjectVersionsFromDB(project.id);
  }
}

export async function restoreProjectVersion(
  versionId: string,
  projectId: string
): Promise<NovelProject | null> {
  await initLocalPersistence();

  try {
    const versions = await getProjectVersionsFromDB(projectId);
    const target = versions.find((v) => v.id === versionId);
    if (!target || !target.projectSnapshot) {
      console.warn("[Novelore Storage] Versión solicitada no encontrada");
      return null;
    }

    const restoredProject: NovelProject = {
      ...JSON.parse(JSON.stringify(target.projectSnapshot)),
      updatedAt: new Date().toISOString(),
    };

    await saveProject(restoredProject);
    return restoredProject;
  } catch (err) {
    console.error("[Novelore Storage] Error al restaurar versión del proyecto:", err);
    return null;
  }
}

export async function deleteProjectVersion(
  versionId: string,
  projectId: string
): Promise<ProjectVersion[]> {
  await initLocalPersistence();
  return await deleteProjectVersionFromDB(versionId, projectId);
}

export async function clearProjectVersions(projectId: string): Promise<void> {
  await initLocalPersistence();
  await clearProjectVersionsFromDB(projectId);
}

export async function updateProjectCover(
  id: string,
  coverUrl?: string
): Promise<NovelProject | null> {
  await initLocalPersistence();

  try {
    const proj = await loadProjectById(id);
    if (!proj) return null;
    const updated: NovelProject = {
      ...proj,
      coverUrl,
      updatedAt: new Date().toISOString(),
    };
    await saveProject(updated);
    return updated;
  } catch (err) {
    console.error("[Novelore Storage] Error al actualizar portada del proyecto:", err);
    return null;
  }
}
