import { contextBridge, ipcRenderer } from "electron";

export interface RecentProjectMeta {
  path: string;
  title: string;
  subtitle?: string;
  author?: string;
  genre?: string;
  synopsis?: string;
  logline?: string;
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
};

contextBridge.exposeInMainWorld("electronAPI", api);
