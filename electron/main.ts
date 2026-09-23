import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs/promises";
declare const __dirname: string;

let mainWindow: BrowserWindow | null = null;
let currentProjectPath: string | null = null;

export interface RecentProject {
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

async function writeAtomic(targetPath: string, data: string): Promise<void> {
  const tempPath = `${targetPath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tempPath, data, "utf-8");
  await fs.rename(tempPath, targetPath);
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function getRecentProjectsList(): Promise<RecentProject[]> {
  try {
    const recentFile = path.join(app.getPath("userData"), "recent-projects.json");
    if (!(await fileExists(recentFile))) return [];
    const content = await fs.readFile(recentFile, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function addOrUpdateRecentProject(entry: RecentProject): Promise<void> {
  try {
    const recentFile = path.join(app.getPath("userData"), "recent-projects.json");
    let list = await getRecentProjectsList();
    list = list.filter((p) => p.path !== entry.path);
    list.unshift(entry);
    if (list.length > 30) list = list.slice(0, 30);
    await writeAtomic(recentFile, JSON.stringify(list, null, 2));
  } catch (err) {
    console.error("Error al actualizar proyectos recientes:", err);
  }
}

async function removeRecentProject(projectPath: string): Promise<RecentProject[]> {
  try {
    const recentFile = path.join(app.getPath("userData"), "recent-projects.json");
    let list = await getRecentProjectsList();
    list = list.filter((p) => p.path !== projectPath);
    await writeAtomic(recentFile, JSON.stringify(list, null, 2));
    return list;
  } catch (err) {
    console.error("Error al eliminar proyecto reciente:", err);
    return [];
  }
}

async function initOrLoadProject(
  folderPath: string,
  initialOptions?: {
    title?: string;
    subtitle?: string;
    author?: string;
    genre?: string;
    synopsis?: string;
    logline?: string;
    targetWords?: number;
  }
): Promise<{
  success: boolean;
  projectPath: string;
  project: any;
  error?: string;
}> {
  try {
    currentProjectPath = folderPath;
    const projectJsonPath = path.join(folderPath, "project.json");
    const manuscriptJsonPath = path.join(folderPath, "manuscript.json");
    const codexJsonPath = path.join(folderPath, "codex.json");
    const planningJsonPath = path.join(folderPath, "planning.json");

    const hasProjectJson = await fileExists(projectJsonPath);

    if (hasProjectJson) {
      // 1. Proyecto existente: leer JSONs
      const projectMeta = JSON.parse(await fs.readFile(projectJsonPath, "utf-8"));
      const manuscriptMeta = (await fileExists(manuscriptJsonPath))
        ? JSON.parse(await fs.readFile(manuscriptJsonPath, "utf-8"))
        : { acts: [] };
      const codexMeta = (await fileExists(codexJsonPath))
        ? JSON.parse(await fs.readFile(codexJsonPath, "utf-8"))
        : { entities: [], relationships: [] };
      const planningMeta = (await fileExists(planningJsonPath))
        ? JSON.parse(await fs.readFile(planningJsonPath, "utf-8"))
        : { timelineTracks: [], timelineEvents: [], storyBeats: [] };

      // Leer prosa de las escenas desde sus archivos .md si existen
      let totalWords = 0;
      const acts = manuscriptMeta.acts || [];
      for (const act of acts) {
        for (const chap of act.chapters || []) {
          for (const sc of chap.scenes || []) {
            const relPath =
              sc.filePath ||
              path.join("manuscript", `act-${act.order || 1}`, `chap-${chap.order || 1}`, `${sc.id}.md`);
            const fullMdPath = path.join(folderPath, relPath);
            if (await fileExists(fullMdPath)) {
              sc.content = await fs.readFile(fullMdPath, "utf-8");
            } else if (!sc.content) {
              sc.content = "";
            }
            totalWords += sc.wordCount || 0;
          }
        }
      }

      const assembledProject = {
        ...projectMeta,
        acts,
        entities: codexMeta.entities || [],
        relationships: codexMeta.relationships || [],
        timelineTracks: planningMeta.timelineTracks || [],
        timelineEvents: planningMeta.timelineEvents || [],
        storyBeats: planningMeta.storyBeats || [],
        projectPath: folderPath,
      };

      // Registrar en proyectos recientes
      await addOrUpdateRecentProject({
        path: folderPath,
        title: projectMeta.title || path.basename(folderPath),
        subtitle: projectMeta.subtitle || "",
        author: projectMeta.author || "",
        genre: projectMeta.genre || "",
        synopsis: projectMeta.synopsis || "",
        logline: projectMeta.logline || "",
        updatedAt: projectMeta.updatedAt || new Date().toISOString(),
        wordCount: totalWords,
      });

      return { success: true, projectPath: folderPath, project: assembledProject };
    }

    // 2. Nuevo proyecto: inicializar carpetas y archivos base
    await fs.mkdir(path.join(folderPath, "manuscript", "act-1", "chapter-1"), { recursive: true });
    await fs.mkdir(path.join(folderPath, "assets", "covers"), { recursive: true });
    await fs.mkdir(path.join(folderPath, "assets", "gallery"), { recursive: true });
    await fs.mkdir(path.join(folderPath, "assets", "fonts"), { recursive: true });
    await fs.mkdir(path.join(folderPath, "assets", "documents"), { recursive: true });
    await fs.mkdir(path.join(folderPath, "boards"), { recursive: true });

    const rawTitle = initialOptions?.title?.trim() || path.basename(folderPath).replace(/[-_]/g, " ");
    const cleanTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
    const nowIso = new Date().toISOString();

    const initialProjectMeta = {
      id: `proj-${Date.now()}`,
      title: cleanTitle,
      subtitle: initialOptions?.subtitle || "",
      author: initialOptions?.author || "Autor",
      genre: initialOptions?.genre || "Ficción",
      logline: initialOptions?.logline || "",
      synopsis: initialOptions?.synopsis || "",
      createdAt: nowIso,
      updatedAt: nowIso,
      settings: {
        targetTotalWords: initialOptions?.targetWords || 50000,
        dialogueStyle: "dash",
        fontFamily: "serif",
        fontSize: 18,
        lineSpacing: "normal",
        typewriterMode: true,
        theme: "minimal",
        customAccentColor: "#2A2A2A",
      },
    };

    const initialSceneRelPath = path.join("manuscript", "act-1", "chapter-1", "esc-1.md");
    const initialSceneText = "";
    await writeAtomic(path.join(folderPath, initialSceneRelPath), initialSceneText);

    const initialManuscript = {
      acts: [
        {
          id: "act-1",
          title: "Acto I: Planteamiento",
          description: "Inicio de la narración...",
          order: 1,
          chapters: [
            {
              id: "chap-1",
              actId: "act-1",
              title: "Capítulo 1",
              description: "",
              order: 1,
              scenes: [
                {
                  id: "scene-1",
                  chapterId: "chap-1",
                  title: "Escena 1",
                  content: initialSceneText,
                  synopsis: "Apertura del manuscrito.",
                  notes: "",
                  status: "draft",
                  goal: "",
                  conflict: "",
                  outcome: "",
                  targetWordCount: 1500,
                  wordCount: 0,
                  order: 1,
                  characterIds: [],
                  filePath: initialSceneRelPath,
                },
              ],
            },
          ],
        },
      ],
    };

    const initialCodex = { entities: [], relationships: [] };
    const initialPlanning = {
      timelineTracks: [
        { id: "trk-main", name: "Trama Principal", color: "#3b82f6", description: "Línea principal", isMainPlot: true },
        { id: "trk-lore", name: "Lore e Historia", color: "#f59e0b", description: "Antecedentes históricos", isMainPlot: false },
      ],
      timelineEvents: [],
      storyBeats: [],
    };

    await writeAtomic(projectJsonPath, JSON.stringify(initialProjectMeta, null, 2));
    await writeAtomic(manuscriptJsonPath, JSON.stringify(initialManuscript, null, 2));
    await writeAtomic(codexJsonPath, JSON.stringify(initialCodex, null, 2));
    await writeAtomic(planningJsonPath, JSON.stringify(initialPlanning, null, 2));

    const assembledNewProject = {
      ...initialProjectMeta,
      acts: initialManuscript.acts,
      entities: initialCodex.entities,
      relationships: initialCodex.relationships,
      timelineTracks: initialPlanning.timelineTracks,
      timelineEvents: initialPlanning.timelineEvents,
      storyBeats: initialPlanning.storyBeats,
      projectPath: folderPath,
    };

    // Registrar en proyectos recientes
    await addOrUpdateRecentProject({
      path: folderPath,
      title: cleanTitle,
      subtitle: initialProjectMeta.subtitle,
      author: initialProjectMeta.author,
      genre: initialProjectMeta.genre,
      synopsis: initialProjectMeta.synopsis,
      logline: initialProjectMeta.logline,
      updatedAt: nowIso,
      wordCount: 0,
    });

    return { success: true, projectPath: folderPath, project: assembledNewProject };
  } catch (err: any) {
    console.error("Error al inicializar o cargar proyecto:", err);
    return { success: false, projectPath: folderPath, project: null, error: err.message };
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: "Novelore — Suite de Escritura Local-First",
    backgroundColor: "#FDFDFB",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ---------------- IPC HANDLERS ----------------

// 1. Abrir carpeta existente
ipcMain.handle("dialog:openFolder", async () => {
  if (!mainWindow) return { canceled: true };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Seleccionar Carpeta de Novela",
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const selectedPath = result.filePaths[0];
  const loadResult = await initOrLoadProject(selectedPath);
  return { canceled: false, ...loadResult };
});

// 2. Crear nueva carpeta de proyecto con diálogo
ipcMain.handle("dialog:createProjectFolder", async (_event, options: {
  title: string;
  subtitle?: string;
  author?: string;
  genre?: string;
  synopsis?: string;
  logline?: string;
  targetWords?: number;
}) => {
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showOpenDialog(mainWindow, {
    title: `Seleccionar ubicación para la novela "${options.title || 'Nueva Novela'}"`,
    properties: ["openDirectory", "createDirectory"],
    buttonLabel: "Crear Proyecto Aquí",
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const baseDir = result.filePaths[0];

  // Si la carpeta seleccionada ya tiene un project.json, no sobreescribir sin confirmación
  const hasExistingProject = await fileExists(path.join(baseDir, "project.json"));
  if (hasExistingProject) {
    return {
      canceled: false,
      success: false,
      error: "La carpeta seleccionada ya contiene un proyecto Novelore. Por favor elige una carpeta vacía.",
    };
  }

  // Verificar si la carpeta tiene otros archivos; si los tiene, crear subcarpeta con el título
  let targetPath = baseDir;
  try {
    const files = await fs.readdir(baseDir);
    if (files.length > 0) {
      const sanitizedName = (options.title || "Novela")
        .trim()
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "-");
      targetPath = path.join(baseDir, sanitizedName || `novela-${Date.now()}`);
      await fs.mkdir(targetPath, { recursive: true });
    }
  } catch (err: any) {
    return { canceled: false, success: false, error: `Error creando directorio: ${err.message}` };
  }

  const loadResult = await initOrLoadProject(targetPath, options);
  return { canceled: false, ...loadResult };
});

// 3. Cargar directamente desde una ruta conocida (p. ej. Proyectos Recientes)
ipcMain.handle("project:initOrLoad", async (_event, folderPath: string) => {
  return await initOrLoadProject(folderPath);
});

// 4. Proyectos Recientes
ipcMain.handle("projects:getRecent", async () => {
  return await getRecentProjectsList();
});

ipcMain.handle("projects:removeRecent", async (_event, targetPath: string) => {
  return await removeRecentProject(targetPath);
});

// 5. Lectura y Escritura de Markdown de escenas
ipcMain.handle("fs:readSceneMarkdown", async (_event, relativePath: string) => {
  if (!currentProjectPath) return { success: false, error: "No hay proyecto abierto." };
  try {
    const fullPath = path.join(currentProjectPath, relativePath);
    const content = await fs.readFile(fullPath, "utf-8");
    return { success: true, content };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("fs:writeSceneMarkdown", async (_event, relativePath: string, content: string) => {
  if (!currentProjectPath) return { success: false, error: "No hay proyecto abierto." };
  try {
    const fullPath = path.join(currentProjectPath, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await writeAtomic(fullPath, content);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("fs:deleteSceneMarkdown", async (_event, relativePath: string) => {
  if (!currentProjectPath) return { success: false, error: "No hay proyecto abierto." };
  try {
    const fullPath = path.resolve(currentProjectPath, relativePath);
    // Verificar que la ruta no escape de la carpeta del proyecto
    if (!fullPath.startsWith(path.resolve(currentProjectPath))) {
      return { success: false, error: "Ruta fuera del directorio del proyecto." };
    }
    if (await fileExists(fullPath)) {
      await fs.unlink(fullPath);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// 6. Guardado atómico completo de datos del proyecto (project.json, manuscript.json, etc.)
ipcMain.handle("fs:saveProjectData", async (_event, data: {
  projectMeta?: any;
  manuscript?: any;
  codex?: any;
  planning?: any;
}) => {
  if (!currentProjectPath) return { success: false, error: "No hay proyecto abierto." };
  try {
    if (data.projectMeta) {
      await writeAtomic(
        path.join(currentProjectPath, "project.json"),
        JSON.stringify(data.projectMeta, null, 2)
      );
    }
    if (data.manuscript) {
      await writeAtomic(
        path.join(currentProjectPath, "manuscript.json"),
        JSON.stringify(data.manuscript, null, 2)
      );
    }
    if (data.codex) {
      await writeAtomic(
        path.join(currentProjectPath, "codex.json"),
        JSON.stringify(data.codex, null, 2)
      );
    }
    if (data.planning) {
      await writeAtomic(
        path.join(currentProjectPath, "planning.json"),
        JSON.stringify(data.planning, null, 2)
      );
    }

    // Actualizar proyectos recientes
    if (data.projectMeta) {
      let wordCount = 0;
      if (data.manuscript?.acts) {
        for (const act of data.manuscript.acts) {
          for (const chap of act.chapters || []) {
            for (const sc of chap.scenes || []) {
              wordCount += sc.wordCount || 0;
            }
          }
        }
      }
      await addOrUpdateRecentProject({
        path: currentProjectPath,
        title: data.projectMeta.title || "Novela",
        subtitle: data.projectMeta.subtitle || "",
        author: data.projectMeta.author || "",
        genre: data.projectMeta.genre || "",
        synopsis: data.projectMeta.synopsis || "",
        logline: data.projectMeta.logline || "",
        updatedAt: new Date().toISOString(),
        wordCount,
      });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// 7. Actualizar metadatos de novela existente
ipcMain.handle("project:updateProjectMeta", async (_event, folderPath: string, updates: any) => {
  try {
    const projectJsonPath = path.join(folderPath, "project.json");
    if (!(await fileExists(projectJsonPath))) {
      return { success: false, error: "El archivo project.json no existe en la carpeta." };
    }
    const currentMeta = JSON.parse(await fs.readFile(projectJsonPath, "utf-8"));
    const updatedMeta = {
      ...currentMeta,
      ...updates,
      updatedAt: new Date().toISOString(),
      settings: {
        ...currentMeta.settings,
        ...(updates.settings || {}),
        targetTotalWords:
          updates.targetWords !== undefined
            ? updates.targetWords
            : updates.settings?.targetTotalWords !== undefined
            ? updates.settings.targetTotalWords
            : currentMeta.settings?.targetTotalWords,
      },
    };
    await writeAtomic(projectJsonPath, JSON.stringify(updatedMeta, null, 2));

    // Actualizar proyectos recientes
    const recentList = await getRecentProjectsList();
    const existing = recentList.find((p) => p.path === folderPath);
    await addOrUpdateRecentProject({
      path: folderPath,
      title: updatedMeta.title || path.basename(folderPath),
      subtitle: updatedMeta.subtitle || "",
      author: updatedMeta.author || "",
      genre: updatedMeta.genre || "",
      synopsis: updatedMeta.synopsis || "",
      logline: updatedMeta.logline || "",
      updatedAt: updatedMeta.updatedAt,
      wordCount: existing?.wordCount || 0,
    });

    return { success: true, projectMeta: updatedMeta };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("fs:saveProjectJson", async (_event, projectData: any) => {
  if (!currentProjectPath) return { success: false, error: "No hay proyecto abierto." };
  try {
    const projectJsonPath = path.join(currentProjectPath, "project.json");
    await writeAtomic(projectJsonPath, JSON.stringify(projectData, null, 2));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// Ciclo de vida de la aplicación
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
