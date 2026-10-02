import { app, BrowserWindow, dialog, ipcMain, protocol, net } from "electron";
import path from "node:path";
import fs from "node:fs/promises";
import url from "node:url";
declare const __dirname: string;

// Registrar esquema local novelore-asset:// con soporte de streaming y fetch
protocol.registerSchemesAsPrivileged([
  {
    scheme: "novelore-asset",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

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
  coverUrl?: string;
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
    coverUrl?: string;
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
        relationshipPositions: codexMeta.relationshipPositions || projectMeta.relationshipPositions || {},
        relationshipCategories: codexMeta.relationshipCategories || projectMeta.relationshipCategories || [],
        customEntityCategories: codexMeta.customEntityCategories || projectMeta.customEntityCategories || [],
        timelineTracks: planningMeta.timeline?.tracks || planningMeta.timelineTracks || [],
        timelineEvents: planningMeta.timeline?.events || planningMeta.timelineEvents || [],
        storyBeats: planningMeta.beats || planningMeta.storyBeats || [],
        planning: {
          timeline: planningMeta.timeline || {
            tracks: planningMeta.timelineTracks || [],
            events: planningMeta.timelineEvents || [],
          },
          corkboard: planningMeta.corkboard || { columns: [], cards: [] },
          outlineGrid: planningMeta.matrix || planningMeta.outlineGrid || { rows: [] },
          storyBeats: planningMeta.beats || planningMeta.storyBeats || [],
        },
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
        coverUrl: projectMeta.coverUrl || "",
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
      coverUrl: initialOptions?.coverUrl || "",
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

    const initialCodex = { entities: [], relationships: [], relationshipPositions: {} };
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
      relationshipPositions: initialCodex.relationshipPositions,
      relationshipCategories: [],
      timelineTracks: initialPlanning.timelineTracks,
      timelineEvents: initialPlanning.timelineEvents,
      storyBeats: initialPlanning.storyBeats,
      planning: {
        timeline: {
          tracks: initialPlanning.timelineTracks,
          events: initialPlanning.timelineEvents,
        },
        corkboard: { columns: [], cards: [] },
        outlineGrid: { rows: [] },
        storyBeats: initialPlanning.storyBeats,
      },
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
      coverUrl: initialProjectMeta.coverUrl,
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
    mainWindow.webContents.on("console-message", (event) => {
      const levelTag = event.level === "warning" ? "WARN" : (event.level || "info").toUpperCase();
      console.log(`[Renderer ${levelTag}] ${event.message} (${event.sourceId}:${event.lineNumber})`);
    });

    mainWindow.webContents.on("preload-error", (_event, preloadPath, error) => {
      console.error(`[Electron] Error en preload (${preloadPath}):`, error);
    });

    mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
      console.error(`[Electron] Falló carga de URL (${validatedURL}): ${errorCode} - ${errorDescription}`);
    });

    const loadWithRetry = async (attempts = 10, delayMs = 300) => {
      for (let i = 0; i < attempts; i++) {
        try {
          if (!mainWindow || mainWindow.isDestroyed()) return;
          await mainWindow.loadURL(devServerUrl);
          return;
        } catch (err) {
          if (i === attempts - 1) {
            console.error(`[Electron] No se pudo conectar a Vite tras ${attempts} intentos:`, err);
          } else {
            await new Promise((r) => setTimeout(r, delayMs));
          }
        }
      }
    };
    loadWithRetry();
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  let isClosing = false;
  mainWindow.on("close", async (e) => {
    if (isClosing) return;
    e.preventDefault();
    isClosing = true;
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        await Promise.race([
          mainWindow.webContents.executeJavaScript(
            "typeof window.__noveloreFlushSaves === 'function' ? window.__noveloreFlushSaves() : Promise.resolve()"
          ),
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]);
      }
    } catch (err) {
      console.error("[Electron] Error al vaciar guardados antes de cerrar:", err);
    } finally {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.destroy();
      }
    }
  });

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

// 2a. Inspeccionar carpeta para creación de proyecto (proporciona estado detallado a la UI)
ipcMain.handle("dialog:inspectProjectFolder", async (_event, options?: { title?: string }) => {
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showOpenDialog(mainWindow, {
    title: `Seleccionar ubicación para la novela "${options?.title || 'Nueva Novela'}"`,
    properties: ["openDirectory", "createDirectory"],
    buttonLabel: "Seleccionar Carpeta",
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const baseDir = result.filePaths[0];

  // 1. ¿Ya tiene un project.json?
  const hasExistingProject = await fileExists(path.join(baseDir, "project.json"));
  if (hasExistingProject) {
    let existingTitle = "existente";
    try {
      const existingMeta = JSON.parse(await fs.readFile(path.join(baseDir, "project.json"), "utf-8"));
      if (existingMeta.title) existingTitle = existingMeta.title;
    } catch {}

    return {
      canceled: false,
      status: "existing_project",
      existingTitle,
      folderPath: baseDir,
      folderName: path.basename(baseDir),
      error: `La carpeta seleccionada ya contiene la novela "${existingTitle}" de Novelore.`,
    };
  }

  // 2. ¿Tiene otros archivos o carpetas existentes?
  try {
    const files = await fs.readdir(baseDir);
    if (files.length > 0) {
      const sanitizedName = (options?.title || "Novela")
        .trim()
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "-");
      const candidateSubfolder = path.join(baseDir, sanitizedName || `novela-${Date.now()}`);

      return {
        canceled: false,
        status: "non_empty_folder",
        folderPath: baseDir,
        folderName: path.basename(baseDir),
        fileCount: files.length,
        candidateSubfolder,
      };
    }
  } catch (err: any) {
    return {
      canceled: false,
      status: "error",
      error: `Error al inspeccionar la carpeta: ${err.message}`,
    };
  }

  // 3. Carpeta vacía
  return {
    canceled: false,
    status: "empty",
    folderPath: baseDir,
    folderName: path.basename(baseDir),
  };
});

// 2b. Crear proyecto en una ruta física directa
ipcMain.handle("dialog:createProjectInPath", async (_event, payload: {
  targetPath: string;
  options: {
    title: string;
    subtitle?: string;
    author?: string;
    genre?: string;
    synopsis?: string;
    logline?: string;
    targetWords?: number;
    coverUrl?: string;
  };
}) => {
  const { targetPath, options } = payload;
  if (!targetPath) {
    return { success: false, error: "Ruta de destino no válida." };
  }

  if (await fileExists(path.join(targetPath, "project.json"))) {
    return {
      success: false,
      error: "La carpeta de destino ya contiene una novela de Novelore.",
    };
  }

  try {
    await fs.mkdir(targetPath, { recursive: true });
    const loadResult = await initOrLoadProject(targetPath, options);
    return { canceled: false, ...loadResult };
  } catch (err: any) {
    return { success: false, error: `Error inicializando proyecto: ${err.message}` };
  }
});

// 2c. Crear nueva carpeta de proyecto con diálogo directo
ipcMain.handle("dialog:createProjectFolder", async (_event, options: {
  title: string;
  subtitle?: string;
  author?: string;
  genre?: string;
  synopsis?: string;
  logline?: string;
  targetWords?: number;
  coverUrl?: string;
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

  // 1. Si la carpeta seleccionada ya tiene un project.json, advertir y no sobreescribir
  const hasExistingProject = await fileExists(path.join(baseDir, "project.json"));
  if (hasExistingProject) {
    let existingTitle = "existente";
    try {
      const existingMeta = JSON.parse(await fs.readFile(path.join(baseDir, "project.json"), "utf-8"));
      if (existingMeta.title) existingTitle = `"${existingMeta.title}"`;
    } catch {}

    await dialog.showMessageBox(mainWindow, {
      type: "warning",
      title: "Carpeta no disponible",
      message: `La carpeta seleccionada ya contiene la novela ${existingTitle} de Novelore.`,
      detail: "Para abrirla, utiliza 'Abrir Carpeta' en el taller de novelas. Si deseas crear una novela nueva, por favor elige una carpeta vacía distinta.",
      buttons: ["Aceptar"],
    });

    return {
      canceled: false,
      success: false,
      error: `La carpeta seleccionada ya contiene la novela ${existingTitle}. Elige una carpeta vacía.`,
    };
  }

  // 2. Si la carpeta seleccionada contiene otros archivos / elementos existentes
  let targetPath = baseDir;
  try {
    const files = await fs.readdir(baseDir);
    if (files.length > 0) {
      const sanitizedName = (options.title || "Novela")
        .trim()
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "-");
      const subfolderCandidate = path.join(baseDir, sanitizedName || `novela-${Date.now()}`);

      const choice = await dialog.showMessageBox(mainWindow, {
        type: "question",
        title: "Carpeta con elementos existentes",
        message: `La carpeta "${path.basename(baseDir)}" contiene elementos (${files.length} archivo${files.length > 1 ? "s o carpetas" : ""}).`,
        detail: `Para no mezclar tus archivos personales, Novelore creará una subcarpeta dedicada para tu novela:\n\n${subfolderCandidate}\n\n¿Deseas continuar y crear la novela dentro de esa subcarpeta?`,
        buttons: ["Crear subcarpeta dedicada", "Cancelar y elegir otra"],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice.response === 1) {
        return {
          canceled: true,
          error: "Creación cancelada para elegir otra carpeta.",
        };
      }

      targetPath = subfolderCandidate;
      if (await fileExists(path.join(targetPath, "project.json"))) {
        await dialog.showMessageBox(mainWindow, {
          type: "warning",
          title: "Subcarpeta no disponible",
          message: "La subcarpeta ya contiene una novela de Novelore.",
          buttons: ["Aceptar"],
        });
        return {
          canceled: false,
          success: false,
          error: "La subcarpeta ya contiene una novela existente.",
        };
      }

      await fs.mkdir(targetPath, { recursive: true });
    }
  } catch (err: any) {
    return { canceled: false, success: false, error: `Error verificando directorio: ${err.message}` };
  }

  const loadResult = await initOrLoadProject(targetPath, options);
  return { canceled: false, ...loadResult };
});

// 2b. Cerrar proyecto activo en Electron (evita sobreescritura accidental)
ipcMain.handle("project:closeCurrent", async () => {
  currentProjectPath = null;
  return { success: true };
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
        coverUrl: data.projectMeta.coverUrl || "",
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
      coverUrl: updatedMeta.coverUrl !== undefined ? updatedMeta.coverUrl : (existing?.coverUrl || ""),
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

// 8. Guardado y lectura atómica del Códice (codex.json)
ipcMain.handle("fs:saveCodex", async (_event, data: {
  entities?: any[];
  relationships?: any[];
  relationshipPositions?: any;
  customRelationshipCategories?: any[];
  customEntityCategories?: any[];
}) => {
  if (!currentProjectPath) return { success: false, error: "No hay proyecto abierto." };
  try {
    const codexJsonPath = path.join(currentProjectPath, "codex.json");
    const codexPayload = {
      entities: Array.isArray(data?.entities) ? data.entities : [],
      relationships: Array.isArray(data?.relationships) ? data.relationships : [],
      relationshipPositions:
        data?.relationshipPositions && typeof data.relationshipPositions === "object"
          ? data.relationshipPositions
          : {},
      customRelationshipCategories: Array.isArray(data?.customRelationshipCategories)
        ? data.customRelationshipCategories
        : [],
      customEntityCategories: Array.isArray(data?.customEntityCategories)
        ? data.customEntityCategories
        : [],
    };
    await writeAtomic(codexJsonPath, JSON.stringify(codexPayload, null, 2));

    // Mantener sincronizado updatedAt en project.json
    const projectJsonPath = path.join(currentProjectPath, "project.json");
    if (await fileExists(projectJsonPath)) {
      try {
        const meta = JSON.parse(await fs.readFile(projectJsonPath, "utf-8"));
        meta.updatedAt = new Date().toISOString();
        await writeAtomic(projectJsonPath, JSON.stringify(meta, null, 2));
      } catch {}
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("fs:readCodex", async () => {
  if (!currentProjectPath) return { success: false, error: "No hay proyecto abierto." };
  try {
    const codexJsonPath = path.join(currentProjectPath, "codex.json");
    if (await fileExists(codexJsonPath)) {
      const parsed = JSON.parse(await fs.readFile(codexJsonPath, "utf-8"));
      return {
        success: true,
        entities: parsed.entities || [],
        relationships: parsed.relationships || [],
        relationshipPositions: parsed.relationshipPositions || {},
        customRelationshipCategories: parsed.customRelationshipCategories || [],
        customEntityCategories: parsed.customEntityCategories || [],
      };
    }
    return {
      success: true,
      entities: [],
      relationships: [],
      relationshipPositions: {},
      customRelationshipCategories: [],
      customEntityCategories: [],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// 8b. Guardado y lectura atómica de Planificación (planning.json)
ipcMain.handle(
  "fs:savePlanning",
  async (
    _event,
    data: {
      timeline?: any;
      corkboard?: any;
      matrix?: any;
      beats?: any;
    }
  ) => {
    if (!currentProjectPath) return { success: false, error: "No hay proyecto abierto." };
    try {
      const planningJsonPath = path.join(currentProjectPath, "planning.json");
      const planningPayload = {
        timeline: data?.timeline || { tracks: [], events: [] },
        corkboard: data?.corkboard || { columns: [], cards: [] },
        matrix: data?.matrix || { rows: [] },
        beats: data?.beats || [],
      };
      await writeAtomic(planningJsonPath, JSON.stringify(planningPayload, null, 2));

      // Mantener sincronizado updatedAt en project.json
      const projectJsonPath = path.join(currentProjectPath, "project.json");
      if (await fileExists(projectJsonPath)) {
        try {
          const meta = JSON.parse(await fs.readFile(projectJsonPath, "utf-8"));
          meta.updatedAt = new Date().toISOString();
          await writeAtomic(projectJsonPath, JSON.stringify(meta, null, 2));
        } catch {}
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
);

ipcMain.handle("fs:readPlanning", async () => {
  if (!currentProjectPath) return { success: false, error: "No hay proyecto abierto." };
  try {
    const planningJsonPath = path.join(currentProjectPath, "planning.json");
    if (await fileExists(planningJsonPath)) {
      const parsed = JSON.parse(await fs.readFile(planningJsonPath, "utf-8"));
      return {
        success: true,
        timeline: parsed.timeline || {
          tracks: parsed.timelineTracks || [],
          events: parsed.timelineEvents || [],
        },
        corkboard: parsed.corkboard || { columns: [], cards: [] },
        matrix: parsed.matrix || { rows: [] },
        beats: parsed.beats || parsed.storyBeats || [],
      };
    }
    return {
      success: true,
      timeline: { tracks: [], events: [] },
      corkboard: { columns: [], cards: [] },
      matrix: { rows: [] },
      beats: [],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// 9. Guardar imagen física en subcarpeta local del proyecto (/assets/gallery/ o /assets/covers/)
ipcMain.handle(
  "assets:saveImage",
  async (
    _event,
    data: {
      subfolder: "gallery" | "covers" | "fonts" | "documents";
      fileName?: string;
      bufferBase64: string;
      projectPath?: string;
    }
  ) => {
    const targetProject = data.projectPath || currentProjectPath;
    if (!targetProject) {
      return { success: false, error: "No hay proyecto especificado." };
    }

    try {
      const allowedSubfolders = ["gallery", "covers", "fonts", "documents"];
      const subfolder = allowedSubfolders.includes(data.subfolder) ? data.subfolder : "gallery";
      const assetsDir = path.join(targetProject, "assets", subfolder);
      await fs.mkdir(assetsDir, { recursive: true });

      let cleanBase64 = data.bufferBase64;
      let extension = "png";
      const match = data.bufferBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
      if (match) {
        extension = match[1].toLowerCase();
        if (extension === "jpeg") extension = "jpg";
        cleanBase64 = data.bufferBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
      }

      const rawName = data.fileName
        ? path.basename(data.fileName, path.extname(data.fileName)).replace(/[^a-zA-Z0-9_-]/g, "_")
        : "img";
      const finalFileName = `${rawName}_${Date.now()}.${extension}`;
      const targetFilePath = path.join(assetsDir, finalFileName);

      const buffer = Buffer.from(cleanBase64, "base64");
      await fs.writeFile(targetFilePath, buffer);

      const relativePath = path.join("assets", subfolder, finalFileName).replace(/\\/g, "/");
      return { success: true, relativePath };
    } catch (err: any) {
      console.error("Error al guardar archivo multimedia local:", err);
      return { success: false, error: err.message };
    }
  }
);

// 10. Eliminar imagen física
ipcMain.handle(
  "assets:deleteImage",
  async (_event, data: { relativePath: string; projectPath?: string }) => {
    let targetProject = data.projectPath || currentProjectPath;
    if (!data.relativePath) return { success: true };

    try {
      let relPath = data.relativePath.trim();
      if (relPath.startsWith("novelore-asset://")) {
        try {
          const parsed = new URL(relPath);
          if (parsed.hostname === "project-asset") {
            const proj = parsed.searchParams.get("projectPath");
            const rel = parsed.searchParams.get("relPath");
            if (proj) targetProject = proj;
            if (rel) relPath = decodeURIComponent(rel);
          } else {
            const host = parsed.hostname ? decodeURIComponent(parsed.hostname) : "";
            const pathname = decodeURIComponent(parsed.pathname || "");
            relPath = `${host}${pathname}`;
          }
        } catch {
          // Ignorar error de parseo de URL
        }
      }

      // Eliminar barras iniciales para evitar que path.resolve lo considere ruta absoluta a nivel de SO
      relPath = relPath.replace(/^[/\\]+/, "");

      if (!targetProject) {
        const recent = await getRecentProjectsList();
        if (recent && recent.length > 0 && recent[0].path) {
          targetProject = recent[0].path;
        }
      }

      if (!targetProject) return { success: false, error: "No hay proyecto especificado." };

      let fullPath = path.resolve(targetProject, relPath);
      const assetsRoot = path.resolve(targetProject, "assets");

      if (!(await fileExists(fullPath)) && !relPath.startsWith("assets")) {
        const withAssets = path.resolve(targetProject, "assets", relPath);
        if (await fileExists(withAssets)) {
          fullPath = withAssets;
        }
      }

      if (!fullPath.startsWith(assetsRoot)) {
        return { success: false, error: "Operación denegada fuera del directorio assets." };
      }

      if (await fileExists(fullPath)) {
        await fs.unlink(fullPath);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
);

// Ciclo de vida de la aplicación
app.whenReady().then(() => {
  // Protocolo nativo de alta velocidad para servir archivos de assets
  protocol.handle("novelore-asset", async (request) => {
    try {
      const parsed = new URL(request.url);
      let targetProject = currentProjectPath;
      let relPath = "";

      if (parsed.hostname === "project-asset") {
        const proj = parsed.searchParams.get("projectPath");
        const rel = parsed.searchParams.get("relPath");
        if (proj && rel) {
          targetProject = proj;
          relPath = decodeURIComponent(rel).replace(/^\/+/, "");
        }
      } else {
        const host = parsed.hostname ? decodeURIComponent(parsed.hostname) : "";
        const pathname = decodeURIComponent(parsed.pathname || "");
        relPath = `${host}${pathname}`.replace(/^\/+/, "");
      }

      if (!targetProject) {
        const recent = await getRecentProjectsList();
        if (recent && recent.length > 0 && recent[0].path) {
          targetProject = recent[0].path;
        }
      }

      if (!targetProject) {
        return new Response("No project specified", { status: 404 });
      }

      let fullPath = path.resolve(targetProject, relPath);
      if (!fullPath.startsWith(path.resolve(targetProject))) {
        return new Response("Access denied", { status: 403 });
      }

      if (!(await fileExists(fullPath))) {
        // Fallback: Si no existe directamente, comprobar si agregando 'assets/' existe
        const withAssets = path.resolve(targetProject, "assets", relPath);
        if (await fileExists(withAssets)) {
          fullPath = withAssets;
        } else {
          return new Response("Asset not found", { status: 404 });
        }
      }

      return net.fetch(url.pathToFileURL(fullPath).toString());
    } catch (err: any) {
      return new Response(`Error loading asset: ${err.message}`, { status: 500 });
    }
  });

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
