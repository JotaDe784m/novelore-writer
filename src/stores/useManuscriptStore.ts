import { create } from "zustand";
import { Act, Chapter, Scene } from "../types";
import { countWords } from "../utils/formatters";
import { useProjectStore } from "./useProjectStore";

export interface ManuscriptStoreState {
  acts: Act[];
  selectedSceneId: string;
  activeSceneContent: string;
  isSavingScene: boolean;
  lastSavedAt: Date | null;

  // Acciones de Selección y Contenido
  loadManuscript: (acts: Act[], initialSceneId?: string) => void;
  selectScene: (sceneId: string) => void;
  updateActiveSceneContent: (content: string) => void;
  updateSceneMeta: (sceneId: string, updates: Partial<Scene>) => void;

  // Acciones de Estructura (Árbol del Manuscrito)
  addScene: (chapterId: string, title?: string) => Scene | null;
  deleteScene: (sceneId: string) => void;
  reorderScenes: (chapterId: string, orderedSceneIds: string[]) => void;
  moveScene: (sceneId: string, targetChapterId: string, targetIndex?: number) => void;
  addChapter: (actId: string, title?: string) => Chapter | null;
  updateChapterTitle: (chapterId: string, title: string) => void;
  deleteChapter: (chapterId: string) => void;
  reorderChapters: (actId: string, orderedChapterIds: string[]) => void;
  addAct: (title?: string) => Act | null;
  updateActTitle: (actId: string, title: string) => void;
  deleteAct: (actId: string) => void;
  reorderActs: (orderedActIds: string[]) => void;

  // Getters computados
  getSelectedScene: () => Scene | null;
  getTotals: () => {
    totalWords: number;
    sceneCount: number;
    chapterCount: number;
    actCount: number;
  };
}

let sceneSaveTimeout: ReturnType<typeof setTimeout> | null = null;
let manuscriptMetaSaveTimeout: ReturnType<typeof setTimeout> | null = null;

const getElectronAPI = () => {
  if (typeof window !== "undefined" && window.electronAPI) {
    return window.electronAPI;
  }
  return undefined;
};

export const useManuscriptStore = create<ManuscriptStoreState>((set, get) => ({
  acts: [],
  selectedSceneId: "",
  activeSceneContent: "",
  isSavingScene: false,
  lastSavedAt: null,

  loadManuscript: (acts, initialSceneId) => {
    let targetSceneId = initialSceneId;
    let initialContent = "";

    // Si no se proporcionó initialSceneId, seleccionar la primera escena disponible
    if (!targetSceneId && acts.length > 0) {
      const first = acts[0]?.chapters[0]?.scenes[0];
      if (first) {
        targetSceneId = first.id;
        initialContent = first.content || "";
      }
    } else if (targetSceneId) {
      for (const act of acts) {
        for (const chap of act.chapters || []) {
          const found = (chap.scenes || []).find((s) => s.id === targetSceneId);
          if (found) {
            initialContent = found.content || "";
            break;
          }
        }
      }
    }

    set({
      acts,
      selectedSceneId: targetSceneId || "",
      activeSceneContent: initialContent,
    });
  },

  selectScene: (sceneId) => {
    const { acts } = get();
    let foundContent = "";

    for (const act of acts) {
      for (const chap of act.chapters || []) {
        const found = (chap.scenes || []).find((s) => s.id === sceneId);
        if (found) {
          foundContent = found.content || "";
          break;
        }
      }
    }

    set({
      selectedSceneId: sceneId,
      activeSceneContent: foundContent,
    });
  },

  updateActiveSceneContent: (content: string) => {
    const { selectedSceneId, acts } = get();
    if (!selectedSceneId) return;

    const words = countWords(content);
    let targetFilePath: string | undefined;

    // Actualizar árbol reactivo de actos
    const updatedActs = acts.map((act) => ({
      ...act,
      chapters: (act.chapters || []).map((chap) => ({
        ...chap,
        scenes: (chap.scenes || []).map((sc) => {
          if (sc.id === selectedSceneId) {
            targetFilePath =
              sc.filePath ||
              `manuscript/act-${act.order || 1}/chapter-${chap.order || 1}/${sc.id}.md`;
            return {
              ...sc,
              content,
              wordCount: words,
              filePath: targetFilePath,
            };
          }
          return sc;
        }),
      })),
    }));

    set({
      activeSceneContent: content,
      acts: updatedActs,
      isSavingScene: true,
    });

    // Sincronizar en useProjectStore
    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: updatedActs,
        updatedAt: new Date().toISOString(),
      });
    }

    // Debounce de 500 ms para persistir a disco
    if (sceneSaveTimeout) clearTimeout(sceneSaveTimeout);
    sceneSaveTimeout = setTimeout(async () => {
      const electronAPI = getElectronAPI();
      if (targetFilePath && electronAPI?.writeSceneMarkdown) {
        try {
          await electronAPI.writeSceneMarkdown(targetFilePath, content);
          set({ isSavingScene: false, lastSavedAt: new Date() });
          // También guardar manuscript.json con los conteos actualizados
          if (currentProj) {
            projectStore.debouncedSaveProjectData({
              ...currentProj,
              acts: updatedActs,
            });
          }
        } catch (err) {
          console.error("Error guardando escena .md:", err);
          set({ isSavingScene: false });
        }
      } else {
        set({ isSavingScene: false });
      }
    }, 500);
  },

  updateSceneMeta: (sceneId, updates) => {
    const { acts } = get();
    const updatedActs = acts.map((act) => ({
      ...act,
      chapters: (act.chapters || []).map((chap) => ({
        ...chap,
        scenes: (chap.scenes || []).map((sc) => {
          if (sc.id === sceneId) {
            return { ...sc, ...updates };
          }
          return sc;
        }),
      })),
    }));

    set({ acts: updatedActs });

    // Sincronizar y persistir manuscript.json
    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: updatedActs,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: updatedActs,
      });
    }
  },

  addScene: (chapterId, title) => {
    const { acts } = get();
    let newScene: Scene | null = null;

    const updatedActs = acts.map((act) => ({
      ...act,
      chapters: (act.chapters || []).map((chap) => {
        if (chap.id === chapterId) {
          const sceneOrder = (chap.scenes || []).length + 1;
          const sceneId = `sc-${Date.now()}`;
          const relPath = `manuscript/act-${act.order || 1}/chapter-${chap.order || 1}/${sceneId}.md`;

          newScene = {
            id: sceneId,
            chapterId: chap.id,
            title: title || `Escena ${sceneOrder}`,
            content: "",
            synopsis: "",
            notes: "",
            status: "draft",
            characterIds: [],
            goal: "",
            conflict: "",
            outcome: "",
            targetWordCount: 1500,
            wordCount: 0,
            order: sceneOrder,
            filePath: relPath,
          };

          return {
            ...chap,
            scenes: [...(chap.scenes || []), newScene],
          };
        }
        return chap;
      }),
    }));

    if (newScene) {
      const created = newScene as Scene;
      set({
        acts: updatedActs,
        selectedSceneId: created.id,
        activeSceneContent: "",
      });

      // Escribir archivo .md en blanco en disco
      const electronAPI = getElectronAPI();
      if (electronAPI?.writeSceneMarkdown && created.filePath) {
        electronAPI.writeSceneMarkdown(created.filePath, "");
      }

      // Sincronizar proyecto
      const projectStore = useProjectStore.getState();
      const currentProj = projectStore.project;
      if (currentProj) {
        projectStore.setProject({
          ...currentProj,
          acts: updatedActs,
          updatedAt: new Date().toISOString(),
        });
        projectStore.debouncedSaveProjectData({
          ...currentProj,
          acts: updatedActs,
        });
      }
    }

    return newScene;
  },

  deleteScene: (sceneId) => {
    const { acts, selectedSceneId } = get();
    let nextSelectedSceneId = selectedSceneId;
    let sceneToDeleteFilePath: string | undefined;

    for (const act of acts) {
      for (const chap of act.chapters || []) {
        const found = (chap.scenes || []).find((s) => s.id === sceneId);
        if (found) {
          sceneToDeleteFilePath = found.filePath;
          break;
        }
      }
      if (sceneToDeleteFilePath) break;
    }

    const updatedActs = acts.map((act) => ({
      ...act,
      chapters: (act.chapters || []).map((chap) => {
        const remaining = (chap.scenes || []).filter((s) => s.id !== sceneId);
        return {
          ...chap,
          scenes: remaining.map((sc, idx) => ({ ...sc, order: idx + 1 })),
        };
      }),
    }));

    // Si la escena borrada era la activa, seleccionar otra
    if (selectedSceneId === sceneId) {
      const allScenes = updatedActs.flatMap((a) =>
        (a.chapters || []).flatMap((c) => c.scenes || [])
      );
      nextSelectedSceneId = allScenes[0]?.id || "";
    }

    let nextContent = "";
    if (nextSelectedSceneId) {
      for (const act of updatedActs) {
        for (const chap of act.chapters || []) {
          const found = (chap.scenes || []).find((s) => s.id === nextSelectedSceneId);
          if (found) {
            nextContent = found.content || "";
            break;
          }
        }
      }
    }

    set({
      acts: updatedActs,
      selectedSceneId: nextSelectedSceneId,
      activeSceneContent: nextContent,
    });

    // Eliminar archivo físico en disco de forma segura si Electron está disponible
    const electronAPI = getElectronAPI();
    if (sceneToDeleteFilePath && electronAPI?.deleteSceneMarkdown) {
      electronAPI.deleteSceneMarkdown(sceneToDeleteFilePath).catch((err) => {
        console.warn("No se pudo eliminar archivo físico de escena:", err);
      });
    }

    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: updatedActs,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: updatedActs,
      });
    }
  },

  reorderScenes: (chapterId, orderedSceneIds) => {
    const { acts } = get();
    const updatedActs = acts.map((act) => ({
      ...act,
      chapters: (act.chapters || []).map((chap) => {
        if (chap.id === chapterId) {
          const sceneMap = new Map((chap.scenes || []).map((s) => [s.id, s]));
          const reordered: Scene[] = [];
          orderedSceneIds.forEach((id, idx) => {
            const found = sceneMap.get(id);
            if (found) {
              reordered.push({ ...found, order: idx + 1 });
            }
          });
          return { ...chap, scenes: reordered };
        }
        return chap;
      }),
    }));

    set({ acts: updatedActs });

    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: updatedActs,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: updatedActs,
      });
    }
  },

  moveScene: (sceneId, targetChapterId, targetIndex) => {
    const { acts } = get();
    let targetScene: Scene | null = null;

    // 1. Extraer escena de su capítulo origen
    const actsWithoutScene = acts.map((act) => ({
      ...act,
      chapters: (act.chapters || []).map((chap) => {
        const found = (chap.scenes || []).find((s) => s.id === sceneId);
        if (found) {
          targetScene = { ...found, chapterId: targetChapterId };
          return {
            ...chap,
            scenes: (chap.scenes || [])
              .filter((s) => s.id !== sceneId)
              .map((s, idx) => ({ ...s, order: idx + 1 })),
          };
        }
        return chap;
      }),
    }));

    if (!targetScene) return;
    const sceneToInsert = targetScene as Scene;

    // 2. Insertar escena en capítulo destino
    const updatedActs = actsWithoutScene.map((act) => ({
      ...act,
      chapters: (act.chapters || []).map((chap) => {
        if (chap.id === targetChapterId) {
          const currentScenes = [...(chap.scenes || [])];
          const insertPos =
            targetIndex !== undefined && targetIndex >= 0 && targetIndex <= currentScenes.length
              ? targetIndex
              : currentScenes.length;
          currentScenes.splice(insertPos, 0, sceneToInsert);
          return {
            ...chap,
            scenes: currentScenes.map((s, idx) => ({ ...s, order: idx + 1 })),
          };
        }
        return chap;
      }),
    }));

    set({ acts: updatedActs });

    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: updatedActs,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: updatedActs,
      });
    }
  },

  addChapter: (actId, title) => {
    const { acts } = get();
    let newChapter: Chapter | null = null;

    const updatedActs = acts.map((act) => {
      if (act.id === actId) {
        const chapOrder = (act.chapters || []).length + 1;
        const chapId = `chap-${Date.now()}`;
        const sceneId = `sc-${Date.now()}`;
        const sceneRelPath = `manuscript/act-${act.order || 1}/chapter-${chapOrder}/${sceneId}.md`;

        const initialScene: Scene = {
          id: sceneId,
          chapterId: chapId,
          title: "Escena 1",
          content: "",
          synopsis: "",
          notes: "",
          status: "draft",
          characterIds: [],
          goal: "",
          conflict: "",
          outcome: "",
          targetWordCount: 1500,
          wordCount: 0,
          order: 1,
          filePath: sceneRelPath,
        };

        newChapter = {
          id: chapId,
          actId: act.id,
          title: title || `Capítulo ${chapOrder}`,
          description: "",
          order: chapOrder,
          scenes: [initialScene],
        };

        return {
          ...act,
          chapters: [...(act.chapters || []), newChapter],
        };
      }
      return act;
    });

    if (newChapter) {
      const created = newChapter as Chapter;
      const initialScene = created.scenes[0];
      set({
        acts: updatedActs,
        selectedSceneId: initialScene.id,
        activeSceneContent: "",
      });

      const electronAPI = getElectronAPI();
      if (electronAPI?.writeSceneMarkdown && initialScene.filePath) {
        electronAPI.writeSceneMarkdown(initialScene.filePath, "");
      }

      const projectStore = useProjectStore.getState();
      const currentProj = projectStore.project;
      if (currentProj) {
        projectStore.setProject({
          ...currentProj,
          acts: updatedActs,
          updatedAt: new Date().toISOString(),
        });
        projectStore.debouncedSaveProjectData({
          ...currentProj,
          acts: updatedActs,
        });
      }
    }

    return newChapter;
  },

  updateChapterTitle: (chapterId, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const { acts } = get();
    const updatedActs = acts.map((act) => ({
      ...act,
      chapters: (act.chapters || []).map((chap) =>
        chap.id === chapterId ? { ...chap, title: trimmed } : chap
      ),
    }));

    set({ acts: updatedActs });

    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: updatedActs,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: updatedActs,
      });
    }
  },

  deleteChapter: (chapterId) => {
    const { acts, selectedSceneId } = get();
    let nextSceneId = selectedSceneId;
    const filePathsToDelete: string[] = [];

    for (const act of acts) {
      const foundChap = (act.chapters || []).find((c) => c.id === chapterId);
      if (foundChap) {
        for (const sc of foundChap.scenes || []) {
          if (sc.filePath) filePathsToDelete.push(sc.filePath);
        }
        break;
      }
    }

    const updatedActs = acts.map((act) => {
      const remainingChaps = (act.chapters || []).filter((c) => c.id !== chapterId);
      return {
        ...act,
        chapters: remainingChaps.map((c, idx) => ({ ...c, order: idx + 1 })),
      };
    });

    // Verificar si la escena activa estaba en el capítulo eliminado
    const allScenes = updatedActs.flatMap((a) =>
      (a.chapters || []).flatMap((c) => c.scenes || [])
    );
    if (!allScenes.some((s) => s.id === selectedSceneId)) {
      nextSceneId = allScenes[0]?.id || "";
    }

    let nextContent = "";
    if (nextSceneId) {
      for (const act of updatedActs) {
        for (const chap of act.chapters || []) {
          const found = (chap.scenes || []).find((s) => s.id === nextSceneId);
          if (found) {
            nextContent = found.content || "";
            break;
          }
        }
      }
    }

    set({ acts: updatedActs, selectedSceneId: nextSceneId, activeSceneContent: nextContent });

    const electronAPI = getElectronAPI();
    if (electronAPI?.deleteSceneMarkdown && filePathsToDelete.length > 0) {
      filePathsToDelete.forEach((fp) => {
        electronAPI?.deleteSceneMarkdown(fp).catch((err) => {
          console.warn("Error eliminando archivo físico:", err);
        });
      });
    }

    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: updatedActs,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: updatedActs,
      });
    }
  },

  reorderChapters: (actId, orderedChapterIds) => {
    const { acts } = get();
    const updatedActs = acts.map((act) => {
      if (act.id === actId) {
        const chapMap = new Map((act.chapters || []).map((c) => [c.id, c]));
        const reordered: Chapter[] = [];
        orderedChapterIds.forEach((id, idx) => {
          const found = chapMap.get(id);
          if (found) {
            reordered.push({ ...found, order: idx + 1 });
          }
        });
        return { ...act, chapters: reordered };
      }
      return act;
    });

    set({ acts: updatedActs });

    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: updatedActs,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: updatedActs,
      });
    }
  },

  addAct: (title) => {
    const { acts } = get();
    const actOrder = acts.length + 1;
    const actId = `act-${Date.now()}`;
    const chapId = `chap-${Date.now()}`;
    const sceneId = `sc-${Date.now()}`;
    const sceneRelPath = `manuscript/act-${actOrder}/chapter-1/${sceneId}.md`;

    const initialScene: Scene = {
      id: sceneId,
      chapterId: chapId,
      title: "Escena 1",
      content: "",
      synopsis: "",
      notes: "",
      status: "draft",
      characterIds: [],
      goal: "",
      conflict: "",
      outcome: "",
      targetWordCount: 1500,
      wordCount: 0,
      order: 1,
      filePath: sceneRelPath,
    };

    const initialChap: Chapter = {
      id: chapId,
      actId,
      title: "Capítulo 1",
      description: "",
      order: 1,
      scenes: [initialScene],
    };

    const newAct: Act = {
      id: actId,
      title: title || `Acto ${actOrder}`,
      description: "",
      order: actOrder,
      chapters: [initialChap],
    };

    const updatedActs = [...acts, newAct];

    set({
      acts: updatedActs,
      selectedSceneId: initialScene.id,
      activeSceneContent: "",
    });

    const electronAPI = getElectronAPI();
    if (electronAPI?.writeSceneMarkdown && initialScene.filePath) {
      electronAPI.writeSceneMarkdown(initialScene.filePath, "");
    }

    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: updatedActs,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: updatedActs,
      });
    }

    return newAct;
  },

  updateActTitle: (actId, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const { acts } = get();
    const updatedActs = acts.map((act) =>
      act.id === actId ? { ...act, title: trimmed } : act
    );

    set({ acts: updatedActs });

    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: updatedActs,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: updatedActs,
      });
    }
  },

  deleteAct: (actId) => {
    const { acts, selectedSceneId } = get();
    const filePathsToDelete: string[] = [];

    const foundAct = acts.find((a) => a.id === actId);
    if (foundAct) {
      for (const chap of foundAct.chapters || []) {
        for (const sc of chap.scenes || []) {
          if (sc.filePath) filePathsToDelete.push(sc.filePath);
        }
      }
    }

    const remainingActs = acts
      .filter((a) => a.id !== actId)
      .map((a, idx) => ({ ...a, order: idx + 1 }));

    const allScenes = remainingActs.flatMap((a) =>
      (a.chapters || []).flatMap((c) => c.scenes || [])
    );

    let nextSceneId = selectedSceneId;
    if (!allScenes.some((s) => s.id === selectedSceneId)) {
      nextSceneId = allScenes[0]?.id || "";
    }

    let nextContent = "";
    if (nextSceneId) {
      for (const act of remainingActs) {
        for (const chap of act.chapters || []) {
          const found = (chap.scenes || []).find((s) => s.id === nextSceneId);
          if (found) {
            nextContent = found.content || "";
            break;
          }
        }
      }
    }

    set({ acts: remainingActs, selectedSceneId: nextSceneId, activeSceneContent: nextContent });

    const electronAPI = getElectronAPI();
    if (electronAPI?.deleteSceneMarkdown && filePathsToDelete.length > 0) {
      filePathsToDelete.forEach((fp) => {
        electronAPI?.deleteSceneMarkdown(fp).catch((err) => {
          console.warn("Error eliminando archivo físico:", err);
        });
      });
    }

    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: remainingActs,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: remainingActs,
      });
    }
  },

  reorderActs: (orderedActIds) => {
    const { acts } = get();
    const actMap = new Map(acts.map((a) => [a.id, a]));
    const reordered: Act[] = [];
    orderedActIds.forEach((id, idx) => {
      const found = actMap.get(id);
      if (found) {
        reordered.push({ ...found, order: idx + 1 });
      }
    });

    set({ acts: reordered });

    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        acts: reordered,
        updatedAt: new Date().toISOString(),
      });
      projectStore.debouncedSaveProjectData({
        ...currentProj,
        acts: reordered,
      });
    }
  },

  getSelectedScene: () => {
    const { acts, selectedSceneId } = get();
    if (!selectedSceneId) return null;
    for (const act of acts) {
      for (const chap of act.chapters || []) {
        const found = (chap.scenes || []).find((s) => s.id === selectedSceneId);
        if (found) return found;
      }
    }
    return null;
  },

  getTotals: () => {
    const { acts } = get();
    let totalWords = 0;
    let sceneCount = 0;
    let chapterCount = 0;

    for (const act of acts) {
      for (const chap of act.chapters || []) {
        chapterCount++;
        for (const sc of chap.scenes || []) {
          sceneCount++;
          totalWords += sc.wordCount || 0;
        }
      }
    }

    return {
      totalWords,
      sceneCount,
      chapterCount,
      actCount: acts.length,
    };
  },
}));

