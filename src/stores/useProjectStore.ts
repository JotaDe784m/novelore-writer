import { create } from "zustand";
import { NovelProject, RecentProjectMeta } from "../types";

export interface CreateProjectDialogOptions {
  title: string;
  subtitle?: string;
  author?: string;
  genre?: string;
  synopsis?: string;
  logline?: string;
  targetWords?: number;
}

export interface ProjectStoreState {
  projectPath: string | null;
  project: NovelProject | null;
  recentProjects: RecentProjectMeta[];
  isLoaded: boolean;
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  errorMessage: string | null;

  // Acciones
  setProjectPath: (path: string | null) => void;
  setProject: (project: NovelProject | null) => void;
  loadRecentProjects: () => Promise<void>;
  removeRecentProject: (path: string) => Promise<void>;
  openProjectFolder: () => Promise<NovelProject | null>;
  createProjectFolder: (options: CreateProjectDialogOptions) => Promise<NovelProject | null>;
  initOrLoadFromPath: (folderPath: string) => Promise<NovelProject | null>;
  updateProjectMeta: (folderPath: string, updates: any) => Promise<boolean>;
  saveSceneMarkdown: (relativePath: string, content: string) => Promise<boolean>;
  saveProjectData: (projectData?: NovelProject) => Promise<boolean>;
  debouncedSaveScene: (relativePath: string, content: string) => void;
  debouncedSaveProjectData: (projectData: NovelProject) => void;
  clearProject: () => void;
}

// Declaración global para TypeScript del objeto expuesto por preload
declare global {
  interface Window {
    electronAPI?: {
      isElectron?: boolean;
      openProjectFolder: () => Promise<{
        canceled: boolean;
        projectPath?: string;
        project?: NovelProject;
        error?: string;
      }>;
      createProjectFolder: (options: CreateProjectDialogOptions) => Promise<{
        canceled: boolean;
        success?: boolean;
        projectPath?: string;
        project?: NovelProject;
        error?: string;
      }>;
      initOrLoadProject: (folderPath: string) => Promise<{
        success: boolean;
        projectPath: string;
        project: NovelProject;
        error?: string;
      }>;
      getRecentProjects: () => Promise<RecentProjectMeta[]>;
      removeRecentProject: (projectPath: string) => Promise<RecentProjectMeta[]>;
      updateProjectMeta: (folderPath: string, updates: any) => Promise<{
        success: boolean;
        projectMeta?: any;
        error?: string;
      }>;
      readSceneMarkdown: (relativePath: string) => Promise<{
        success: boolean;
        content?: string;
        error?: string;
      }>;
      writeSceneMarkdown: (relativePath: string, content: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
      deleteSceneMarkdown: (relativePath: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
      saveProjectData: (data: {
        projectMeta?: any;
        manuscript?: any;
        codex?: any;
        planning?: any;
      }) => Promise<{
        success: boolean;
        error?: string;
      }>;
      saveProjectJson: (projectData: any) => Promise<{
        success: boolean;
        error?: string;
      }>;
    };
  }
}

// Variables privadas para el debounce de guardado
let sceneSaveTimeout: ReturnType<typeof setTimeout> | null = null;
let projectSaveTimeout: ReturnType<typeof setTimeout> | null = null;

const getElectronAPI = () => {
  if (typeof window !== "undefined" && window.electronAPI) {
    return window.electronAPI;
  }
  return undefined;
};

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projectPath: null,
  project: null,
  recentProjects: [],
  isLoaded: false,
  isLoading: false,
  isSaving: false,
  lastSavedAt: null,
  errorMessage: null,

  setProjectPath: (path) => set({ projectPath: path }),

  setProject: (project) =>
    set({
      project,
      projectPath: project ? (project as any).projectPath || get().projectPath : null,
      isLoaded: !!project,
      errorMessage: null,
    }),

  loadRecentProjects: async () => {
    const electronAPI = getElectronAPI();
    if (!electronAPI?.getRecentProjects) return;
    try {
      const recents = await electronAPI.getRecentProjects();
      set({ recentProjects: recents });
    } catch (err: any) {
      console.error("Error al cargar proyectos recientes:", err);
    }
  },

  removeRecentProject: async (pathToRemove: string) => {
    const electronAPI = getElectronAPI();
    if (!electronAPI?.removeRecentProject) return;
    try {
      const updated = await electronAPI.removeRecentProject(pathToRemove);
      set({ recentProjects: updated });
    } catch (err: any) {
      console.error("Error al quitar proyecto reciente:", err);
    }
  },

  openProjectFolder: async () => {
    const electronAPI = getElectronAPI();
    if (!electronAPI?.openProjectFolder) {
      const msg = "Electron API no está disponible en este entorno.";
      console.warn(msg);
      set({ errorMessage: msg });
      return null;
    }

    set({ isLoading: true, errorMessage: null });
    try {
      const result = await electronAPI.openProjectFolder();
      if (result.canceled || !result.projectPath) {
        set({ isLoading: false });
        return null;
      }

      if (result.error) {
        set({ isLoading: false, errorMessage: result.error });
        return null;
      }

      set({
        projectPath: result.projectPath,
        project: result.project,
        isLoaded: true,
        isLoading: false,
        errorMessage: null,
      });

      // Recargar lista de recientes
      get().loadRecentProjects();
      return result.project || null;
    } catch (err: any) {
      console.error("Error abriendo carpeta de proyecto:", err);
      set({ isLoading: false, errorMessage: err.message });
      return null;
    }
  },

  createProjectFolder: async (options: CreateProjectDialogOptions) => {
    const electronAPI = getElectronAPI();
    if (!electronAPI?.createProjectFolder) {
      const msg = "Electron API no está disponible en este entorno.";
      console.warn(msg);
      set({ errorMessage: msg });
      return null;
    }

    set({ isLoading: true, errorMessage: null });
    try {
      const result = await electronAPI.createProjectFolder(options);
      if (result.canceled || !result.projectPath) {
        set({ isLoading: false });
        return null;
      }

      if (result.error || !result.success) {
        set({ isLoading: false, errorMessage: result.error || "No se pudo crear el proyecto." });
        return null;
      }

      set({
        projectPath: result.projectPath,
        project: result.project,
        isLoaded: true,
        isLoading: false,
        errorMessage: null,
      });

      // Recargar lista de recientes
      get().loadRecentProjects();
      return result.project || null;
    } catch (err: any) {
      console.error("Error creando proyecto:", err);
      set({ isLoading: false, errorMessage: err.message });
      return null;
    }
  },

  initOrLoadFromPath: async (folderPath: string) => {
    const electronAPI = getElectronAPI();
    if (!electronAPI?.initOrLoadProject) {
      const msg = "Electron API no está disponible en este entorno.";
      console.warn(msg);
      set({ errorMessage: msg });
      return null;
    }

    set({ isLoading: true, errorMessage: null });
    try {
      const result = await electronAPI.initOrLoadProject(folderPath);
      if (!result.success || result.error) {
        set({ isLoading: false, errorMessage: result.error || "Fallo al inicializar proyecto." });
        return null;
      }

      set({
        projectPath: result.projectPath,
        project: result.project,
        isLoaded: true,
        isLoading: false,
        errorMessage: null,
      });

      get().loadRecentProjects();
      return result.project || null;
    } catch (err: any) {
      console.error("Error cargando ruta de proyecto:", err);
      set({ isLoading: false, errorMessage: err.message });
      return null;
    }
  },

  updateProjectMeta: async (folderPath: string, updates: any) => {
    const electronAPI = getElectronAPI();
    if (!electronAPI?.updateProjectMeta) return false;
    try {
      set({ isSaving: true });
      const result = await electronAPI.updateProjectMeta(folderPath, updates);
      if (result.success) {
        // Si la novela editada es la actualmente cargada en memoria, sincronizar estado
        const current = get().project;
        if (current && get().projectPath === folderPath) {
          set({
            project: {
              ...current,
              ...updates,
              settings: {
                ...current.settings,
                ...(updates.settings || {}),
                targetTotalWords:
                  updates.targetWords !== undefined
                    ? updates.targetWords
                    : updates.settings?.targetTotalWords !== undefined
                    ? updates.settings.targetTotalWords
                    : current.settings?.targetTotalWords,
              },
            },
            lastSavedAt: new Date(),
          });
        }
        await get().loadRecentProjects();
        set({ isSaving: false });
        return true;
      } else {
        set({ isSaving: false, errorMessage: result.error || "Error al actualizar metadatos" });
        return false;
      }
    } catch (err: any) {
      set({ isSaving: false, errorMessage: err.message });
      return false;
    }
  },

  saveSceneMarkdown: async (relativePath: string, content: string) => {
    const electronAPI = getElectronAPI();
    if (!electronAPI?.writeSceneMarkdown) return false;
    try {
      set({ isSaving: true });
      const result = await electronAPI.writeSceneMarkdown(relativePath, content);
      if (result.success) {
        set({ isSaving: false, lastSavedAt: new Date() });
        return true;
      } else {
        set({ isSaving: false, errorMessage: result.error || "Error al guardar escena" });
        return false;
      }
    } catch (err: any) {
      set({ isSaving: false, errorMessage: err.message });
      return false;
    }
  },

  saveProjectData: async (projectData?: NovelProject) => {
    const electronAPI = getElectronAPI();
    if (!electronAPI?.saveProjectData) return false;
    const targetProject = projectData || get().project;
    if (!targetProject) return false;

    try {
      set({ isSaving: true });

      const projectMeta = {
        id: targetProject.id,
        title: targetProject.title,
        subtitle: targetProject.subtitle || "",
        author: targetProject.author,
        genre: targetProject.genre,
        logline: targetProject.logline || "",
        synopsis: targetProject.synopsis || "",
        createdAt: targetProject.createdAt,
        updatedAt: new Date().toISOString(),
        settings: targetProject.settings,
        coverUrl: targetProject.coverUrl,
      };

      // Limpiar content de las escenas para manuscript.json (la prosa vive en .md)
      const cleanManuscript = {
        acts: (targetProject.acts || []).map((act) => ({
          ...act,
          chapters: (act.chapters || []).map((chap) => ({
            ...chap,
            scenes: (chap.scenes || []).map((sc) => ({
              ...sc,
              content: undefined, // no inflar el json
            })),
          })),
        })),
      };

      const codexData = {
        entities: targetProject.entities || [],
        relationships: targetProject.relationships || [],
      };

      const planningData = {
        timelineTracks: targetProject.timelineTracks || [],
        timelineEvents: targetProject.timelineEvents || [],
        storyBeats: targetProject.storyBeats || [],
      };

      const electronAPI = getElectronAPI();
      const result = await electronAPI!.saveProjectData({
        projectMeta,
        manuscript: cleanManuscript,
        codex: codexData,
        planning: planningData,
      });

      if (result.success) {
        set({ isSaving: false, lastSavedAt: new Date() });
        return true;
      } else {
        set({ isSaving: false, errorMessage: result.error || "Error al guardar proyecto" });
        return false;
      }
    } catch (err: any) {
      set({ isSaving: false, errorMessage: err.message });
      return false;
    }
  },

  debouncedSaveScene: (relativePath: string, content: string) => {
    if (sceneSaveTimeout) clearTimeout(sceneSaveTimeout);
    set({ isSaving: true });
    sceneSaveTimeout = setTimeout(() => {
      get().saveSceneMarkdown(relativePath, content);
    }, 500);
  },

  debouncedSaveProjectData: (projectData: NovelProject) => {
    if (projectSaveTimeout) clearTimeout(projectSaveTimeout);
    set({ isSaving: true });
    projectSaveTimeout = setTimeout(() => {
      get().saveProjectData(projectData);
    }, 500);
  },

  clearProject: () =>
    set({
      projectPath: null,
      project: null,
      isLoaded: false,
      isLoading: false,
      isSaving: false,
      errorMessage: null,
    }),
}));
