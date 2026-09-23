import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  FileText,
  Folder,
  FolderOpen,
  Search,
  Edit2,
  Check,
  X,
  AlertCircle,
  PanelLeftClose,
  BookOpen,
} from "lucide-react";
import { Act, Chapter, NovelProject, Scene, SceneStatus } from "../../types";
import { countWords } from "../../utils/formatters";
import { useManuscriptStore } from "../../stores/useManuscriptStore";
import { useProjectStore } from "../../stores/useProjectStore";

interface ManuscriptSidebarProps {
  project?: NovelProject;
  selectedSceneId?: string | null;
  activeSceneId?: string | null;
  onSelectScene?: (sceneId: string) => void;
  onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseSidebar?: () => void;
}

const MIN_WIDTH = 220;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 280;
const STORAGE_KEY_WIDTH = "novelore:manuscript_sidebar_width";

export const ManuscriptSidebar: React.FC<ManuscriptSidebarProps> = ({
  project: propProject,
  selectedSceneId: propSelectedSceneId,
  activeSceneId: propActiveSceneId,
  onSelectScene: propOnSelectScene,
  onUpdateProject: propOnUpdateProject,
  isCollapsed = false,
  onToggleCollapse,
  onCloseSidebar,
}) => {
  // Conexión reactiva directa al store modular de manuscrito
  const storeActs = useManuscriptStore((s) => s.acts);
  const storeSelectedSceneId = useManuscriptStore((s) => s.selectedSceneId);
  const activeSceneContent = useManuscriptStore((s) => s.activeSceneContent);
  const selectSceneStore = useManuscriptStore((s) => s.selectScene);
  const addSceneStore = useManuscriptStore((s) => s.addScene);
  const deleteSceneStore = useManuscriptStore((s) => s.deleteScene);
  const updateSceneMetaStore = useManuscriptStore((s) => s.updateSceneMeta);
  const addChapterStore = useManuscriptStore((s) => s.addChapter);
  const updateChapterTitleStore = useManuscriptStore((s) => s.updateChapterTitle);
  const deleteChapterStore = useManuscriptStore((s) => s.deleteChapter);
  const addActStore = useManuscriptStore((s) => s.addAct);
  const updateActTitleStore = useManuscriptStore((s) => s.updateActTitle);
  const deleteActStore = useManuscriptStore((s) => s.deleteAct);

  // Determinar los actos a utilizar (store prioritario, fallback a project prop)
  const acts = storeActs.length > 0 ? storeActs : (propProject?.acts || []);
  const currentActiveSceneId = storeSelectedSceneId || propSelectedSceneId || propActiveSceneId || "";

  // Estado de ancho redimensionable persistido en localStorage
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WIDTH);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          return parsed;
        }
      }
    } catch {
      // Ignorar error de acceso a localStorage
    }
    return DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedActs, setCollapsedActs] = useState<Record<string, boolean>>({});
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const [editingItem, setEditingItem] = useState<{
    type: "act" | "chapter" | "scene";
    id: string;
    title: string;
  } | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    type: "act" | "chapter" | "scene";
    id: string;
    title: string;
    actId?: string;
    chapterId?: string;
  } | null>(null);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

  // Redimensionamiento interactivo de la barra lateral
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      try {
        localStorage.setItem(STORAGE_KEY_WIDTH, sidebarWidth.toString());
      } catch {
        // Ignorar
      }
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, sidebarWidth]);

  // Selección de escena con doble sincronización (store y prop)
  const handleSelectScene = (sceneId: string) => {
    selectSceneStore(sceneId);
    if (propOnSelectScene) {
      propOnSelectScene(sceneId);
    }
  };

  // Alternar colapso de Actos y Capítulos
  const toggleAct = (actId: string) => {
    setCollapsedActs((prev) => ({ ...prev, [actId]: !prev[actId] }));
  };

  const toggleChapter = (chapId: string) => {
    setCollapsedChapters((prev) => ({ ...prev, [chapId]: !prev[chapId] }));
  };

  // Cálculo en vivo de conteo de palabras
  const liveActiveWords = useMemo(() => {
    return countWords(activeSceneContent);
  }, [activeSceneContent]);

  const getSceneWordCount = (scene: Scene): number => {
    if (scene.id === currentActiveSceneId) {
      return liveActiveWords;
    }
    return scene.wordCount || 0;
  };

  const getChapterWordCount = (chapter: Chapter): number => {
    return (chapter.scenes || []).reduce(
      (acc, sc) => acc + getSceneWordCount(sc),
      0
    );
  };

  const getActWordCount = (act: Act): number => {
    return (act.chapters || []).reduce(
      (acc, chap) => acc + getChapterWordCount(chap),
      0
    );
  };

  const manuscriptTotals = useMemo(() => {
    let totalWords = 0;
    let totalScenes = 0;
    for (const act of acts) {
      for (const chap of act.chapters || []) {
        for (const sc of chap.scenes || []) {
          totalScenes++;
          totalWords += sc.id === currentActiveSceneId ? liveActiveWords : (sc.wordCount || 0);
        }
      }
    }
    return { totalWords, totalScenes };
  }, [acts, currentActiveSceneId, liveActiveWords]);

  // Operaciones de Creación
  const handleAddAct = () => {
    const newAct = addActStore();
    if (newAct && propOnUpdateProject) {
      const currentStoreActs = useManuscriptStore.getState().acts;
      propOnUpdateProject((prev) => ({ ...prev, acts: currentStoreActs }));
    }
  };

  const handleAddChapter = (actId: string) => {
    const newChap = addChapterStore(actId);
    if (newChap && propOnUpdateProject) {
      const currentStoreActs = useManuscriptStore.getState().acts;
      propOnUpdateProject((prev) => ({ ...prev, acts: currentStoreActs }));
    }
  };

  const handleAddScene = (chapterId: string) => {
    const newScene = addSceneStore(chapterId);
    if (newScene) {
      handleSelectScene(newScene.id);
      if (propOnUpdateProject) {
        const currentStoreActs = useManuscriptStore.getState().acts;
        propOnUpdateProject((prev) => ({ ...prev, acts: currentStoreActs }));
      }
    }
  };

  // Operaciones de Renombrado
  const handleStartRename = (
    e: React.MouseEvent,
    type: "act" | "chapter" | "scene",
    id: string,
    currentTitle: string
  ) => {
    e.stopPropagation();
    setEditingItem({ type, id, title: currentTitle });
  };

  const handleSaveRename = () => {
    if (!editingItem || !editingItem.title.trim()) {
      setEditingItem(null);
      return;
    }
    const trimmed = editingItem.title.trim();
    const { type, id } = editingItem;

    if (type === "act") {
      updateActTitleStore(id, trimmed);
    } else if (type === "chapter") {
      updateChapterTitleStore(id, trimmed);
    } else if (type === "scene") {
      updateSceneMetaStore(id, { title: trimmed });
    }

    if (propOnUpdateProject) {
      const currentStoreActs = useManuscriptStore.getState().acts;
      propOnUpdateProject((prev) => ({ ...prev, acts: currentStoreActs }));
    }

    setEditingItem(null);
  };

  // Operaciones de Eliminación
  const handleDeleteActRequest = (e: React.MouseEvent, act: Act) => {
    e.stopPropagation();
    if (acts.length <= 1) {
      showAlert("No se puede eliminar el único acto de la novela.");
      return;
    }
    setConfirmDelete({
      type: "act",
      id: act.id,
      title: act.title,
    });
  };

  const handleDeleteChapterRequest = (e: React.MouseEvent, actId: string, chap: Chapter) => {
    e.stopPropagation();
    const act = acts.find((a) => a.id === actId);
    if (!act || (act.chapters || []).length <= 1) {
      showAlert("El acto debe contener al menos un capítulo.");
      return;
    }
    setConfirmDelete({
      type: "chapter",
      id: chap.id,
      actId,
      title: chap.title,
    });
  };

  const handleDeleteSceneRequest = (
    e: React.MouseEvent,
    actId: string,
    chapterId: string,
    scene: Scene
  ) => {
    e.stopPropagation();
    const act = acts.find((a) => a.id === actId);
    const chap = act?.chapters.find((c) => c.id === chapterId);
    if (!chap || (chap.scenes || []).length <= 1) {
      showAlert("El capítulo debe contener al menos una escena.");
      return;
    }
    setConfirmDelete({
      type: "scene",
      id: scene.id,
      actId,
      chapterId,
      title: scene.title,
    });
  };

  const handleExecuteDelete = () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;

    if (type === "act") {
      deleteActStore(id);
    } else if (type === "chapter") {
      deleteChapterStore(id);
    } else if (type === "scene") {
      deleteSceneStore(id);
    }

    if (propOnUpdateProject) {
      const currentStoreActs = useManuscriptStore.getState().acts;
      propOnUpdateProject((prev) => ({ ...prev, acts: currentStoreActs }));
    }

    setConfirmDelete(null);
  };

  // Colores sutiles de estado de escena
  const getStatusBadge = (status: SceneStatus) => {
    switch (status) {
      case "idea":
        return { label: "Idea", bg: "rgba(168, 85, 247, 0.15)", text: "rgb(192, 132, 252)" };
      case "draft":
        return { label: "Borrador", bg: "rgba(245, 158, 11, 0.15)", text: "rgb(251, 191, 36)" };
      case "revised":
        return { label: "Revisado", bg: "rgba(59, 130, 246, 0.15)", text: "rgb(96, 165, 250)" };
      case "polished":
        return { label: "Pulido", bg: "rgba(16, 185, 129, 0.15)", text: "rgb(52, 211, 153)" };
      case "final":
        return { label: "Final", bg: "rgba(20, 184, 166, 0.15)", text: "rgb(45, 212, 191)" };
      default:
        return { label: status, bg: "rgba(156, 163, 175, 0.15)", text: "rgb(156, 163, 175)" };
    }
  };

  const handleClose = onCloseSidebar || onToggleCollapse;

  // Filtrado reactivo de búsqueda
  const filteredActs = useMemo(() => {
    if (!searchQuery.trim()) return acts;
    const q = searchQuery.toLowerCase();

    return acts
      .map((act) => {
        const filteredChapters = (act.chapters || [])
          .map((chap) => {
            const filteredScenes = (chap.scenes || []).filter(
              (sc) =>
                sc.title.toLowerCase().includes(q) ||
                (sc.synopsis && sc.synopsis.toLowerCase().includes(q)) ||
                (sc.notes && sc.notes.toLowerCase().includes(q)) ||
                (sc.content && sc.content.toLowerCase().includes(q))
            );
            return { ...chap, scenes: filteredScenes };
          })
          .filter((chap) => chap.scenes.length > 0 || chap.title.toLowerCase().includes(q));

        return { ...act, chapters: filteredChapters };
      })
      .filter((act) => act.chapters.length > 0 || act.title.toLowerCase().includes(q));
  }, [acts, searchQuery]);

  return (
    <aside
      id="manuscript-sidebar"
      style={{
        width: `${sidebarWidth}px`,
        backgroundColor: "var(--bg-sidebar)",
        color: "var(--text-primary)",
      }}
      className="relative flex flex-col shrink-0 min-h-0 h-full overflow-hidden select-none transition-[width] duration-75 ease-out"
    >
      {/* Cabecera Principal del Árbol (Sin bordes rígidos) */}
      <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between">
        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] truncate">
              Manuscrito
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5 truncate">
            {manuscriptTotals.totalWords.toLocaleString()} pal. · {manuscriptTotals.totalScenes} esc.
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleAddAct}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface-hover)] active:bg-[var(--bg-surface-active)] transition-colors cursor-pointer"
            title="Añadir nuevo Acto"
          >
            <Plus className="w-4 h-4" />
          </button>
          {handleClose && (
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] active:bg-[var(--bg-surface-active)] transition-colors cursor-pointer"
              title="Colapsar panel (Ctrl+\ o Cmd+\)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Buscador Integrado y Sutil */}
      <div className="px-3 py-1.5">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar escena, notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg bg-[var(--bg-surface-hover)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border-none outline-none focus:ring-1 focus:ring-[var(--accent)]/50 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Árbol del Manuscrito: Actos > Capítulos > Escenas (Estilo Obsidian / Scrivener) */}
      <div
        id="manuscript-tree-scroll-container"
        className="flex-1 min-h-0 overflow-y-auto pl-2 pr-1 mr-3 py-1 space-y-1 custom-scroll"
      >
        {filteredActs.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-[var(--text-muted)]">
            {searchQuery ? "No se encontraron escenas que coincidan." : "El manuscrito está vacío."}
          </div>
        ) : (
          filteredActs.map((act) => {
            const isActCollapsed = searchQuery ? false : collapsedActs[act.id];
            const actWords = getActWordCount(act);

            return (
              <div key={act.id} className="space-y-0.5">
                {/* Cabecera del Acto */}
                <div className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors">
                  {editingItem?.id === act.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveRename();
                      }}
                      className="flex items-center gap-1 flex-1 mr-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editingItem.title}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, title: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setEditingItem(null);
                        }}
                        className="w-full text-xs font-semibold px-2 py-1 rounded bg-[var(--bg-app)] text-[var(--text-primary)] border border-[var(--accent)]/60 outline-none"
                      />
                      <button
                        type="submit"
                        className="p-1 rounded bg-[var(--accent)] text-[var(--accent-contrast)] cursor-pointer"
                        title="Guardar"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="p-1 rounded hover:bg-[var(--bg-surface-active)] text-[var(--text-muted)] cursor-pointer"
                        title="Cancelar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleAct(act.id)}
                      className="flex items-center gap-1.5 flex-1 min-w-0 text-left cursor-pointer py-0.5"
                    >
                      {isActCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      )}
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] truncate">
                        {act.title}
                      </span>
                    </button>
                  )}

                  {editingItem?.id !== act.id && (
                    <div className="flex items-center gap-1 shrink-0 ml-1.5">
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        {actWords.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleAddChapter(act.id)}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                          title="Añadir Capítulo"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(e, "act", act.id, act.title)}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                          title="Renombrar Acto"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteActRequest(e, act)}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                          title="Eliminar Acto"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lista de Capítulos del Acto */}
                {!isActCollapsed && (
                  <div className="space-y-0.5 pl-2">
                    {(act.chapters || []).map((chap) => {
                      const isChapCollapsed = searchQuery ? false : collapsedChapters[chap.id];
                      const chapWords = getChapterWordCount(chap);

                      return (
                        <div key={chap.id} className="space-y-0.5">
                          {/* Fila del Capítulo */}
                          <div className="group flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors">
                            {editingItem?.id === chap.id ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleSaveRename();
                                }}
                                className="flex items-center gap-1 flex-1 mr-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingItem.title}
                                  onChange={(e) =>
                                    setEditingItem({ ...editingItem, title: e.target.value })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape") setEditingItem(null);
                                  }}
                                  className="w-full text-xs font-medium px-2 py-0.5 rounded bg-[var(--bg-app)] text-[var(--text-primary)] border border-[var(--accent)]/60 outline-none"
                                />
                                <button
                                  type="submit"
                                  className="p-1 rounded bg-[var(--accent)] text-[var(--accent-contrast)] cursor-pointer"
                                  title="Guardar"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItem(null)}
                                  className="p-1 rounded hover:bg-[var(--bg-surface-active)] text-[var(--text-muted)] cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </form>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleChapter(chap.id)}
                                className="flex items-center gap-1.5 flex-1 min-w-0 text-left cursor-pointer py-0.5"
                              >
                                {isChapCollapsed ? (
                                  <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                )}
                                {isChapCollapsed ? (
                                  <Folder className="w-3.5 h-3.5 text-[var(--accent)]/80 shrink-0" />
                                ) : (
                                  <FolderOpen className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                                )}
                                <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                                  {chap.title}
                                </span>
                              </button>
                            )}

                            {editingItem?.id !== chap.id && (
                              <div className="flex items-center gap-1 shrink-0 ml-1.5">
                                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                                  {chapWords.toLocaleString()}
                                </span>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleAddScene(chap.id)}
                                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                                    title="Añadir Escena"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartRename(e, "chapter", chap.id, chap.title)}
                                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                                    title="Renombrar Capítulo"
                                  >
                                    <Edit2 className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteChapterRequest(e, act.id, chap)}
                                    className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                                    title="Eliminar Capítulo"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Lista de Escenas del Capítulo */}
                          {!isChapCollapsed && (
                            <div className="space-y-0.5 pl-3">
                              {(chap.scenes || []).map((scene) => {
                                const isActive = currentActiveSceneId === scene.id;
                                const sceneWords = getSceneWordCount(scene);
                                const statusBadge = getStatusBadge(scene.status);

                                return (
                                  <div
                                    key={scene.id}
                                    onClick={() => handleSelectScene(scene.id)}
                                    className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                                      isActive
                                        ? "bg-[var(--bg-surface-active)] text-[var(--text-primary)] font-medium"
                                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                                    }`}
                                  >
                                    {/* Indicador sutil de escena activa */}
                                    {isActive && (
                                      <div
                                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[var(--accent)]"
                                      />
                                    )}

                                    {editingItem?.id === scene.id ? (
                                      <form
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          handleSaveRename();
                                        }}
                                        className="flex items-center gap-1 flex-1 py-0.5"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          type="text"
                                          autoFocus
                                          value={editingItem.title}
                                          onChange={(e) =>
                                            setEditingItem({
                                              ...editingItem,
                                              title: e.target.value,
                                            })
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === "Escape") setEditingItem(null);
                                          }}
                                          className="w-full text-xs px-2 py-0.5 rounded bg-[var(--bg-app)] text-[var(--text-primary)] border border-[var(--accent)]/60 outline-none"
                                        />
                                        <button
                                          type="submit"
                                          className="p-1 rounded bg-[var(--accent)] text-[var(--accent-contrast)] cursor-pointer"
                                          title="Guardar"
                                        >
                                          <Check className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingItem(null)}
                                          className="p-1 rounded hover:bg-[var(--bg-surface-active)] text-[var(--text-muted)] cursor-pointer"
                                          title="Cancelar"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </form>
                                    ) : (
                                      <div className="flex items-center gap-2 truncate flex-1 mr-1.5">
                                        <FileText
                                          className={`w-3.5 h-3.5 shrink-0 ${
                                            isActive
                                              ? "text-[var(--accent)]"
                                              : "text-[var(--text-muted)]"
                                          }`}
                                        />
                                        <span className="truncate leading-normal">{scene.title}</span>
                                      </div>
                                    )}

                                    {editingItem?.id !== scene.id && (
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {/* Status pill sutil */}
                                        <span
                                          style={{
                                            backgroundColor: statusBadge.bg,
                                            color: statusBadge.text,
                                          }}
                                          className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                                        >
                                          {statusBadge.label}
                                        </span>

                                        {/* Conteo de palabras */}
                                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                                          {sceneWords.toLocaleString()}
                                        </span>

                                        {/* Botones fantasma en hover */}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            type="button"
                                            onClick={(e) =>
                                              handleStartRename(e, "scene", scene.id, scene.title)
                                            }
                                            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                                            title="Renombrar Escena"
                                          >
                                            <Edit2 className="w-2.5 h-2.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) =>
                                              handleDeleteSceneRequest(e, act.id, chap.id, scene)
                                            }
                                            className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                                            title="Eliminar Escena"
                                          >
                                            <Trash2 className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Manejador de Redimensionamiento interactivo */}
      <div
        ref={resizeHandleRef}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        title="Arrastra para redimensionar"
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-20 flex items-center justify-end group select-none"
      >
        <div
          className={`w-0.5 h-full transition-colors ${
            isResizing
              ? "bg-[var(--accent)]"
              : "bg-transparent group-hover:bg-[var(--accent)]/40"
          }`}
        />
      </div>

      {/* Alerta de notificación flotante */}
      {alertMessage && (
        <div className="p-2.5 m-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 text-xs flex items-center gap-2 animate-in fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="leading-tight">{alertMessage}</span>
        </div>
      )}

      {/* Modal de Confirmación de Borrado (Acorde a Sistema de Diseño) */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4"
            style={{
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  {confirmDelete.type === "act"
                    ? "¿Eliminar Acto?"
                    : confirmDelete.type === "chapter"
                    ? "¿Eliminar Capítulo?"
                    : "¿Eliminar Escena?"}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Esta acción es permanente
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {confirmDelete.type === "act" && (
                <>
                  ¿Deseas eliminar el acto <strong>«{confirmDelete.title}»</strong> con todos sus capítulos y escenas?
                </>
              )}
              {confirmDelete.type === "chapter" && (
                <>
                  ¿Deseas eliminar el capítulo <strong>«{confirmDelete.title}»</strong> y todas sus escenas?
                </>
              )}
              {confirmDelete.type === "scene" && (
                <>
                  ¿Deseas eliminar la escena <strong>«{confirmDelete.title}»</strong> y su archivo de prosa Markdown?
                </>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-xs cursor-pointer transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
