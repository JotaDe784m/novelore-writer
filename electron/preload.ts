import { contextBridge, ipcRenderer } from "electron";

export interface RecentProjectMeta {
  path: string;
  title: string;
  subtitle?: string;
  author?: string;
  genre?: string;
  synopsis?: string;
  logline?: string;
  coverUrl?: string;
  updatedAt: string;
  wordCount?: number;
}

export interface ElectronAPI {
  isElectron: boolean;
  openProjectFolder: () => Promise<{
    canceled: boolean;
    projectPath?: string;
    project?: any;
    error?: string;
  }>;
  createProjectFolder: (options: {
    title: string;
    subtitle?: string;
    author?: string;
    genre?: string;
    synopsis?: string;
    logline?: string;
    targetWords?: number;
    coverUrl?: string;
  }) => Promise<{
    canceled: boolean;
    success?: boolean;
    projectPath?: string;
    project?: any;
    error?: string;
  }>;
  initOrLoadProject: (folderPath: string) => Promise<{
    success: boolean;
    projectPath: string;
    project: any;
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
  saveCodex: (data: {
    entities: any[];
    relationships: any[];
    relationshipPositions?: Record<string, { x: number; y: number }>;
    customRelationshipCategories?: any[];
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  readCodex: () => Promise<{
    success: boolean;
    entities?: any[];
    relationships?: any[];
    relationshipPositions?: Record<string, { x: number; y: number }>;
    customRelationshipCategories?: any[];
    error?: string;
  }>;
  savePlanning: (data: {
    timeline?: any;
    corkboard?: any;
    matrix?: any;
    beats?: any;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  readPlanning: () => Promise<{
    success: boolean;
    timeline?: any;
    corkboard?: any;
    matrix?: any;
    beats?: any;
    error?: string;
  }>;
  saveAssetImage: (options: {
    subfolder: "gallery" | "covers" | "fonts" | "documents";
    fileName?: string;
    bufferBase64: string;
    projectPath?: string;
  }) => Promise<{
    success: boolean;
    relativePath?: string;
    error?: string;
  }>;
  deleteAssetImage: (
    relativePath: string,
    projectPath?: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

const api: ElectronAPI = {
  isElectron: true,
  openProjectFolder: () => ipcRenderer.invoke("dialog:openFolder"),
  createProjectFolder: (options) => ipcRenderer.invoke("dialog:createProjectFolder", options),
  initOrLoadProject: (folderPath: string) =>
    ipcRenderer.invoke("project:initOrLoad", folderPath),
  getRecentProjects: () => ipcRenderer.invoke("projects:getRecent"),
  removeRecentProject: (projectPath: string) =>
    ipcRenderer.invoke("projects:removeRecent", projectPath),
  updateProjectMeta: (folderPath: string, updates: any) =>
    ipcRenderer.invoke("project:updateProjectMeta", folderPath, updates),
  readSceneMarkdown: (relativePath: string) =>
    ipcRenderer.invoke("fs:readSceneMarkdown", relativePath),
  writeSceneMarkdown: (relativePath: string, content: string) =>
    ipcRenderer.invoke("fs:writeSceneMarkdown", relativePath, content),
  deleteSceneMarkdown: (relativePath: string) =>
    ipcRenderer.invoke("fs:deleteSceneMarkdown", relativePath),
  saveProjectData: (data) => ipcRenderer.invoke("fs:saveProjectData", data),
  saveProjectJson: (projectData: any) =>
    ipcRenderer.invoke("fs:saveProjectJson", projectData),
  saveCodex: (data) => ipcRenderer.invoke("fs:saveCodex", data),
  readCodex: () => ipcRenderer.invoke("fs:readCodex"),
  savePlanning: (data) => ipcRenderer.invoke("fs:savePlanning", data),
  readPlanning: () => ipcRenderer.invoke("fs:readPlanning"),
  saveAssetImage: (options) => ipcRenderer.invoke("assets:saveImage", options),
  deleteAssetImage: (relativePath, projectPath) =>
    ipcRenderer.invoke("assets:deleteImage", { relativePath, projectPath }),
};

contextBridge.exposeInMainWorld("electronAPI", api);
