import React, { useState, useMemo } from "react";
import { FolderPlus } from "lucide-react";
import { NovelProject, Scene, Chapter, Act } from "../../types";
import { countWords } from "../../utils/formatters";
import { useManuscriptStore } from "../../stores/useManuscriptStore";
import { useSidebarResize } from "./sidebar/useSidebarResize";
import { useSidebarActions } from "./sidebar/useSidebarActions";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarActItem } from "./sidebar/SidebarActItem";
import { SidebarDeleteModal } from "./sidebar/SidebarDeleteModal";

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
  const storeActs = useManuscriptStore((s) => s.acts);
  const storeSelectedSceneId = useManuscriptStore((s) => s.selectedSceneId);
  const activeSceneContent = useManuscriptStore((s) => s.activeSceneContent);
  const selectSceneStore = useManuscriptStore((s) => s.selectScene);

  const acts = storeActs.length > 0 ? storeActs : (propProject?.acts || []);
  const currentActiveSceneId = storeSelectedSceneId || propSelectedSceneId || propActiveSceneId || "";

  const { sidebarWidth, isResizing, setIsResizing } = useSidebarResize();

  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedActs, setCollapsedActs] = useState<Record<string, boolean>>({});
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const {
    editingItem,
    setEditingItem,
    confirmDelete,
    setConfirmDelete,
    alertMessage,
    handleAddAct,
    handleAddChapter,
    handleAddScene,
    handleStartRename,
    handleSaveRename,
    handleDeleteActRequest,
    handleDeleteChapterRequest,
    handleDeleteSceneRequest,
    handleExecuteDelete,
  } = useSidebarActions({
    acts,
    propOnSelectScene,
    propOnUpdateProject,
    setCollapsedActs,
    setCollapsedChapters,
  });

  const handleSelectScene = (sceneId: string) => {
    selectSceneStore(sceneId);
    if (propOnSelectScene) propOnSelectScene(sceneId);
  };

  const toggleAct = (actId: string) => {
    setCollapsedActs((prev) => ({ ...prev, [actId]: !prev[actId] }));
  };

  const toggleChapter = (chapId: string) => {
    setCollapsedChapters((prev) => ({ ...prev, [chapId]: !prev[chapId] }));
  };

  const liveActiveWords = useMemo(() => countWords(activeSceneContent), [activeSceneContent]);

  const getSceneWordCount = (scene: Scene): number => {
    return scene.id === currentActiveSceneId ? liveActiveWords : scene.wordCount || 0;
  };

  const getChapterWordCount = (chapter: Chapter): number => {
    return (chapter.scenes || []).reduce((acc, sc) => acc + getSceneWordCount(sc), 0);
  };

  const getActWordCount = (act: Act): number => {
    return (act.chapters || []).reduce((acc, chap) => acc + getChapterWordCount(chap), 0);
  };

  const manuscriptTotals = useMemo(() => {
    let words = 0;
    let scenes = 0;
    for (const act of acts) {
      for (const chap of act.chapters || []) {
        for (const sc of chap.scenes || []) {
          words += sc.id === currentActiveSceneId ? liveActiveWords : sc.wordCount || 0;
          scenes++;
        }
      }
    }
    return { totalWords: words, totalScenes: scenes };
  }, [acts, currentActiveSceneId, liveActiveWords]);

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

  if (isCollapsed) return null;

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
      <SidebarHeader
        totalWords={manuscriptTotals.totalWords}
        totalScenes={manuscriptTotals.totalScenes}
        onAddAct={handleAddAct}
        onClose={onCloseSidebar || onToggleCollapse}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 overflow-y-auto px-2 pb-6 space-y-1 custom-scroll">
        {filteredActs.length === 0 ? (
          <div className="p-4 text-center text-xs text-[var(--text-muted)] space-y-2">
            <p>No se encontraron resultados para «{searchQuery}»</p>
          </div>
        ) : (
          filteredActs.map((act) => (
            <SidebarActItem
              key={act.id}
              act={act}
              isActCollapsed={searchQuery ? false : !!collapsedActs[act.id]}
              actWords={getActWordCount(act)}
              searchQuery={searchQuery}
              collapsedChapters={collapsedChapters}
              currentActiveSceneId={currentActiveSceneId}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              getSceneWordCount={getSceneWordCount}
              getChapterWordCount={getChapterWordCount}
              onToggleAct={toggleAct}
              onToggleChapter={toggleChapter}
              onSelectScene={handleSelectScene}
              onAddChapter={handleAddChapter}
              onAddScene={handleAddScene}
              onStartRename={handleStartRename}
              onSaveRename={handleSaveRename}
              onDeleteActRequest={handleDeleteActRequest}
              onDeleteChapterRequest={handleDeleteChapterRequest}
              onDeleteSceneRequest={handleDeleteSceneRequest}
            />
          ))
        )}

        <div className="pt-2 px-1">
          <button
            type="button"
            onClick={handleAddAct}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface-hover)] border border-dashed border-transparent hover:border-[var(--accent)]/40 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Nuevo Acto</span>
          </button>
        </div>
      </div>

      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        title="Arrastra para redimensionar"
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-20 flex items-center justify-end group select-none"
      >
        <div
          className={`w-0.5 h-full transition-colors ${
            isResizing ? "bg-[var(--accent)]" : "bg-transparent group-hover:bg-[var(--accent)]/40"
          }`}
        />
      </div>

      {alertMessage && (
        <div className="p-2.5 m-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 text-xs flex items-center gap-2 animate-in fade-in shadow-xs">
          <span className="leading-tight">{alertMessage}</span>
        </div>
      )}

      <SidebarDeleteModal
        confirmDelete={confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleExecuteDelete}
      />
    </aside>
  );
};
