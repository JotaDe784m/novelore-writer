import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  FileText,
  Folder,
  Layers,
  Search,
  MoreVertical,
  Edit2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Circle,
  HelpCircle,
  Eye,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { Act, Chapter, NovelProject, Scene, SceneStatus } from "../../types";
import { countWords } from "../../utils/formatters";

interface ManuscriptSidebarProps {
  project: NovelProject;
  selectedSceneId?: string | null;
  activeSceneId?: string | null;
  onSelectScene: (sceneId: string) => void;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseSidebar?: () => void;
}

export const ManuscriptSidebar: React.FC<ManuscriptSidebarProps> = ({
  project,
  selectedSceneId,
  activeSceneId,
  onSelectScene,
  onUpdateProject,
  isCollapsed = false,
  onToggleCollapse,
  onCloseSidebar,
}) => {
  const currentActiveSceneId = selectedSceneId ?? activeSceneId ?? null;
  const handleToggleOrClose = onCloseSidebar || onToggleCollapse || (() => {});
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedActs, setCollapsedActs] = useState<Record<string, boolean>>({});
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{
    type: "act" | "chapter" | "scene";
    id: string;
    title: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "act" | "chapter" | "scene";
    actId: string;
    chapterId?: string;
    sceneId?: string;
    title: string;
  } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

  const toggleAct = (actId: string) => {
    setCollapsedActs((prev) => ({ ...prev, [actId]: !prev[actId] }));
  };

  const toggleChapter = (chapId: string) => {
    setCollapsedChapters((prev) => ({ ...prev, [chapId]: !prev[chapId] }));
  };

  const addAct = () => {
    const actNumber = project.acts.length + 1;
    const newActId = `act-${Date.now()}`;
    const newChapId = `chap-${Date.now()}`;
    const newSceneId = `scene-${Date.now()}`;

    const newAct: Act = {
      id: newActId,
      title: `Acto ${actNumber}: Nuevo Acto`,
      description: "Descripción del arco...",
      order: actNumber,
      chapters: [
        {
          id: newChapId,
          actId: newActId,
          title: `Capítulo 1`,
          description: "",
          order: 1,
          scenes: [
            {
              id: newSceneId,
              chapterId: newChapId,
              title: "Escena 1",
              content: "",
              synopsis: "Sinopsis inicial...",
              notes: "",
              status: "draft",
              characterIds: [],
              goal: "",
              conflict: "",
              outcome: "",
              targetWordCount: 1500,
              wordCount: 0,
              order: 1,
            },
          ],
        },
      ],
    };

    onUpdateProject((p) => ({
      ...p,
      acts: [...p.acts, newAct],
    }));
    onSelectScene(newSceneId);
  };

  const addChapter = (actId: string) => {
    const act = project.acts.find((a) => a.id === actId);
    if (!act) return;

    const chapNumber = act.chapters.length + 1;
    const newChapId = `chap-${Date.now()}`;
    const newSceneId = `scene-${Date.now()}`;

    const newChapter: Chapter = {
      id: newChapId,
      actId,
      title: `Capítulo ${chapNumber}`,
      description: "",
      order: chapNumber,
      scenes: [
        {
          id: newSceneId,
          chapterId: newChapId,
          title: `Escena 1`,
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
        },
      ],
    };

    onUpdateProject((p) => ({
      ...p,
      acts: p.acts.map((a) =>
        a.id === actId ? { ...a, chapters: [...a.chapters, newChapter] } : a
      ),
    }));
    onSelectScene(newSceneId);
  };

  const addScene = (actId: string, chapterId: string) => {
    const act = project.acts.find((a) => a.id === actId);
    const chap = act?.chapters.find((c) => c.id === chapterId);
    if (!chap) return;

    const sceneNumber = chap.scenes.length + 1;
    const newSceneId = `scene-${Date.now()}`;

    const newScene: Scene = {
      id: newSceneId,
      chapterId,
      title: `Escena ${sceneNumber}`,
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
      order: sceneNumber,
    };

    onUpdateProject((p) => ({
      ...p,
      acts: p.acts.map((a) =>
        a.id === actId
          ? {
              ...a,
              chapters: a.chapters.map((c) =>
                c.id === chapterId ? { ...c, scenes: [...c.scenes, newScene] } : c
              ),
            }
          : a
      ),
    }));
    onSelectScene(newSceneId);
  };

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

    onUpdateProject((p) => {
      if (type === "act") {
        return {
          ...p,
          acts: p.acts.map((a) => (a.id === id ? { ...a, title: trimmed } : a)),
        };
      }
      if (type === "chapter") {
        return {
          ...p,
          acts: p.acts.map((a) => ({
            ...a,
            chapters: a.chapters.map((c) =>
              c.id === id ? { ...c, title: trimmed } : c
            ),
          })),
        };
      }
      if (type === "scene") {
        return {
          ...p,
          acts: p.acts.map((a) => ({
            ...a,
            chapters: a.chapters.map((c) => ({
              ...c,
              scenes: c.scenes.map((s) =>
                s.id === id ? { ...s, title: trimmed } : s
              ),
            })),
          })),
        };
      }
      return p;
    });
    setEditingItem(null);
  };

  const handleDeleteActRequest = (e: React.MouseEvent, act: Act) => {
    e.stopPropagation();
    if (project.acts.length <= 1) {
      showAlert("No se puede eliminar el único acto de la novela.");
      return;
    }
    setConfirmDelete({
      type: "act",
      actId: act.id,
      title: act.title,
    });
  };

  const handleDeleteChapterRequest = (e: React.MouseEvent, actId: string, chap: Chapter) => {
    e.stopPropagation();
    const act = project.acts.find((a) => a.id === actId);
    if (!act || act.chapters.length <= 1) {
      showAlert("El acto debe contener al menos un capítulo.");
      return;
    }
    setConfirmDelete({
      type: "chapter",
      actId,
      chapterId: chap.id,
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
    const act = project.acts.find((a) => a.id === actId);
    const chap = act?.chapters.find((c) => c.id === chapterId);
    if (!chap || chap.scenes.length <= 1) {
      showAlert("El capítulo debe contener al menos una escena.");
      return;
    }
    setConfirmDelete({
      type: "scene",
      actId,
      chapterId,
      sceneId: scene.id,
      title: scene.title,
    });
  };

  const handleExecuteDelete = () => {
    if (!confirmDelete) return;
    const { type, actId, chapterId, sceneId } = confirmDelete;

    let remainingSceneIds: string[] = [];

    onUpdateProject((p) => {
      let updatedActs = p.acts;
      if (type === "act") {
        updatedActs = p.acts.filter((a) => a.id !== actId);
      } else if (type === "chapter" && chapterId) {
        updatedActs = p.acts.map((a) =>
          a.id === actId
            ? { ...a, chapters: a.chapters.filter((c) => c.id !== chapterId) }
            : a
        );
      } else if (type === "scene" && chapterId && sceneId) {
        updatedActs = p.acts.map((a) =>
          a.id === actId
            ? {
                ...a,
                chapters: a.chapters.map((c) =>
                  c.id === chapterId
                    ? { ...c, scenes: c.scenes.filter((s) => s.id !== sceneId) }
                    : c
                ),
              }
            : a
        );
      }

      updatedActs.forEach((a) =>
        a.chapters.forEach((c) =>
          c.scenes.forEach((s) => remainingSceneIds.push(s.id))
        )
      );

      return {
        ...p,
        acts: updatedActs,
      };
    });

    if (
      currentActiveSceneId &&
      !remainingSceneIds.includes(currentActiveSceneId) &&
      remainingSceneIds.length > 0
    ) {
      onSelectScene(remainingSceneIds[0]);
    }

    setConfirmDelete(null);
  };

  const getStatusColor = (status: SceneStatus) => {
    switch (status) {
      case "idea":
        return "bg-purple-500/20 text-purple-600 dark:text-purple-400";
      case "draft":
        return "bg-amber-500/20 text-amber-700 dark:text-amber-300";
      case "revised":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300";
      case "polished":
        return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300";
      case "final":
        return "bg-teal-500/20 text-teal-800 dark:text-teal-200";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  if (isCollapsed) {
    return (
      <div
        id="manuscript-sidebar-collapsed"
        className="w-12 border-r flex flex-col items-center py-3 shrink-0 gap-4"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <button
          onClick={handleToggleOrClose}
          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)]"
          title="Expandir Manuscrito"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="writing-vertical text-xs tracking-wider uppercase font-semibold text-[var(--text-muted)] mt-4">
          Manuscrito
        </div>
      </div>
    );
  }

  return (
    <aside
      id="manuscript-sidebar"
      className="w-64 sm:w-72 lg:w-80 max-w-[85vw] border-r flex flex-col shrink-0 min-h-0 overflow-hidden transition-all select-none"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-color)",
        color: "var(--text-main)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b flex items-center justify-between border-[var(--border-color)]">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Estructura del Manuscrito
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={addAct}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--accent)] cursor-pointer"
            title="Añadir nuevo Acto"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleOrClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] cursor-pointer"
            title="Cerrar/Colapsar panel"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-3 border-b border-[var(--border-color)]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar escena, personaje, notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] shadow-2xs"
          />
        </div>
      </div>

      {/* Acts / Chapters / Scenes Tree */}
      <div
        id="manuscript-tree-scroll-container"
        className="flex-1 min-h-0 overflow-y-scroll p-3 space-y-3 custom-scroll always-scroll"
        style={{
          overflowY: "scroll",
          scrollbarGutter: "stable",
        }}
      >
        {project.acts.map((act) => {
          const isActCollapsed = collapsedActs[act.id];
          const actWordCount = act.chapters.reduce(
            (cAcc, chap) =>
              cAcc +
              chap.scenes.reduce((sAcc, sc) => sAcc + (sc.wordCount || 0), 0),
            0
          );

          return (
            <div
              key={act.id}
              className="rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-card)] shadow-xs transition-shadow hover:shadow-sm"
            >
              {/* Act Header */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-black/5 dark:bg-white/5 group border-b border-[var(--border-color)]/50">
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
                      className="w-full text-xs px-2 py-1 rounded-md border border-[var(--accent)] bg-[var(--bg-input)] text-[var(--text-main)] font-bold focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="p-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                      title="Guardar nombre"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="p-1.5 rounded-md bg-black/10 dark:bg-white/10 hover:bg-black/20 text-[var(--text-muted)] cursor-pointer"
                      title="Cancelar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => toggleAct(act.id)}
                    className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)] truncate flex-1 text-left cursor-pointer py-0.5"
                  >
                    {isActCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    )}
                    <span className="truncate tracking-wide">{act.title}</span>
                  </button>
                )}

                <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] shrink-0 ml-1">
                  <span className="font-mono text-[10px] mr-1">{actWordCount.toLocaleString()} pal.</span>
                  <button
                    onClick={() => addChapter(act.id)}
                    className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--accent)] opacity-80 group-hover:opacity-100 cursor-pointer"
                    title="Añadir Capítulo a este Acto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleStartRename(e, "act", act.id, act.title)}
                    className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 opacity-70 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                    title="Renombrar Acto"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteActRequest(e, act)}
                    className="p-1 rounded-md hover:bg-red-500/15 opacity-70 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                    title="Eliminar Acto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Chapters List */}
              {!isActCollapsed && (
                <div className="p-2 space-y-2">
                  {act.chapters.map((chap) => {
                    const isChapCollapsed = collapsedChapters[chap.id];
                    const chapWordCount = chap.scenes.reduce(
                      (acc, sc) => acc + (sc.wordCount || 0),
                      0
                    );

                    return (
                      <div key={chap.id} className="space-y-1">
                        {/* Chapter Row */}
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 group transition-colors">
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
                                  setEditingItem({
                                    ...editingItem,
                                    title: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") setEditingItem(null);
                                }}
                                className="w-full text-xs px-2 py-0.5 rounded border border-[var(--accent)] bg-[var(--bg-input)] text-[var(--text-main)] font-semibold focus:outline-hidden"
                              />
                              <button
                                type="submit"
                                className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                title="Guardar nombre"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="p-1 rounded bg-black/10 dark:bg-white/10 hover:bg-black/20 text-[var(--text-muted)] cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => toggleChapter(chap.id)}
                              className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)] truncate flex-1 text-left cursor-pointer py-0.5"
                            >
                              {isChapCollapsed ? (
                                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                              )}
                              <Folder className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                              <span className="truncate">{chap.title}</span>
                            </button>
                          )}

                          <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] shrink-0 ml-1">
                            <span className="font-mono text-[10px] mr-0.5">{chapWordCount.toLocaleString()}</span>
                            <button
                              onClick={() => addScene(act.id, chap.id)}
                              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--accent)] opacity-80 group-hover:opacity-100 cursor-pointer"
                              title="Añadir Escena"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleStartRename(e, "chapter", chap.id, chap.title)}
                              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                              title="Renombrar Capítulo"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteChapterRequest(e, act.id, chap)}
                              className="p-1 rounded hover:bg-red-500/15 opacity-70 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                              title="Eliminar Capítulo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Scenes List */}
                        {!isChapCollapsed && (
                          <div className="pl-4 space-y-1 mt-1 border-l-2 border-[var(--border-color)]/70 ml-3.5 py-0.5">
                            {chap.scenes
                              .filter((sc) =>
                                searchQuery
                                  ? sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    sc.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    sc.content.toLowerCase().includes(searchQuery.toLowerCase())
                                  : true
                              )
                              .map((scene) => {
                                const isActive = currentActiveSceneId === scene.id;

                                return (
                                  <div
                                    key={scene.id}
                                    onClick={() => onSelectScene(scene.id)}
                                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-all ${
                                      isActive
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-medium shadow-xs"
                                        : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)]"
                                    }`}
                                  >
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
                                          className="w-full text-xs px-2 py-0.5 rounded border border-[var(--accent)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-hidden"
                                        />
                                        <button
                                          type="submit"
                                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                          title="Guardar"
                                        >
                                          <Check className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingItem(null)}
                                          className="p-1 rounded bg-black/10 dark:bg-white/10 hover:bg-black/20 text-[var(--text-muted)] cursor-pointer"
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
                                              ? "text-[var(--accent-contrast)]"
                                              : "text-[var(--text-muted)]"
                                          }`}
                                        />
                                        <span className="truncate leading-normal">{scene.title}</span>
                                      </div>
                                    )}

                                    {editingItem?.id !== scene.id && (
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {/* Status pill */}
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                                            isActive
                                              ? "bg-[var(--accent-contrast)]/20 text-[var(--accent-contrast)]"
                                              : getStatusColor(scene.status)
                                          }`}
                                        >
                                          {scene.status}
                                        </span>

                                        {/* Word count */}
                                        <span
                                          className={`text-[10px] font-mono ${
                                            isActive
                                              ? "text-[var(--accent-contrast)] opacity-85"
                                              : "text-[var(--text-muted)]"
                                          }`}
                                        >
                                          {(scene.wordCount || 0).toLocaleString()}
                                        </span>

                                        {/* Action buttons on hover */}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={(e) =>
                                              handleStartRename(e, "scene", scene.id, scene.title)
                                            }
                                            className={`p-1 rounded cursor-pointer ${
                                              isActive
                                                ? "hover:bg-white/20 text-[var(--accent-contrast)]"
                                                : "hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                            }`}
                                            title="Renombrar Escena"
                                          >
                                            <Edit2 className="w-2.5 h-2.5" />
                                          </button>

                                          <button
                                            onClick={(e) =>
                                              handleDeleteSceneRequest(e, act.id, chap.id, scene)
                                            }
                                            className={`p-1 rounded cursor-pointer ${
                                              isActive
                                                ? "hover:bg-red-500 text-white"
                                                : "hover:bg-red-500/15 text-[var(--text-muted)] hover:text-red-500"
                                            }`}
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
        })}
      </div>

      {/* Alert toast notification */}
      {alertMessage && (
        <div className="p-2.5 m-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="leading-tight">{alertMessage}</span>
        </div>
      )}

      {/* In-app Modal: Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-3"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                <Trash2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">
                  {confirmDelete.type === "act"
                    ? "¿Eliminar Acto?"
                    : confirmDelete.type === "chapter"
                    ? "¿Eliminar Capítulo?"
                    : "¿Eliminar Escena?"}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Esta acción es irreversible
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-main)] leading-relaxed">
              {confirmDelete.type === "act" && (
                <>
                  ¿Eliminar permanentemente el acto <strong>«{confirmDelete.title}»</strong> y todos sus capítulos y escenas asociadas?
                </>
              )}
              {confirmDelete.type === "chapter" && (
                <>
                  ¿Eliminar permanentemente el capítulo <strong>«{confirmDelete.title}»</strong> y todas sus escenas asociadas?
                </>
              )}
              {confirmDelete.type === "scene" && (
                <>
                  ¿Eliminar permanentemente la escena <strong>«{confirmDelete.title}»</strong> y todo su texto redactado?
                </>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-xs cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
