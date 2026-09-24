import React from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Act, Chapter, Scene } from "../../../types";
import { EditingItem } from "./SidebarSceneItem";
import { SidebarChapterItem } from "./SidebarChapterItem";

interface SidebarActItemProps {
  act: Act;
  isActCollapsed: boolean;
  actWords: number;
  searchQuery: string;
  collapsedChapters: Record<string, boolean>;
  currentActiveSceneId: string;
  editingItem: EditingItem | null;
  setEditingItem: (item: EditingItem | null) => void;
  getSceneWordCount: (scene: Scene) => number;
  getChapterWordCount: (chapter: Chapter) => number;
  onToggleAct: (actId: string) => void;
  onToggleChapter: (chapId: string) => void;
  onSelectScene: (sceneId: string) => void;
  onAddChapter: (actId: string) => void;
  onAddScene: (chapId: string) => void;
  onStartRename: (e: React.MouseEvent, type: "act" | "chapter" | "scene", id: string, title: string) => void;
  onSaveRename: () => void;
  onDeleteActRequest: (e: React.MouseEvent, act: Act) => void;
  onDeleteChapterRequest: (e: React.MouseEvent, actId: string, chapter: Chapter) => void;
  onDeleteSceneRequest: (e: React.MouseEvent, actId: string, chapterId: string, scene: Scene) => void;
}

export const SidebarActItem: React.FC<SidebarActItemProps> = ({
  act,
  isActCollapsed,
  actWords,
  searchQuery,
  collapsedChapters,
  currentActiveSceneId,
  editingItem,
  setEditingItem,
  getSceneWordCount,
  getChapterWordCount,
  onToggleAct,
  onToggleChapter,
  onSelectScene,
  onAddChapter,
  onAddScene,
  onStartRename,
  onSaveRename,
  onDeleteActRequest,
  onDeleteChapterRequest,
  onDeleteSceneRequest,
}) => {
  return (
    <div className="space-y-0.5">
      <div className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors">
        {editingItem?.id === act.id ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSaveRename();
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
            onClick={() => onToggleAct(act.id)}
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
                onClick={() => onAddChapter(act.id)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                title="Añadir Capítulo"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => onStartRename(e, "act", act.id, act.title)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                title="Renombrar Acto"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={(e) => onDeleteActRequest(e, act)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                title="Eliminar Acto"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {!isActCollapsed && (
        <div className="space-y-0.5 pl-2">
          {(act.chapters || []).map((chap) => (
            <SidebarChapterItem
              key={chap.id}
              actId={act.id}
              chapter={chap}
              isChapCollapsed={searchQuery ? false : !!collapsedChapters[chap.id]}
              chapWords={getChapterWordCount(chap)}
              currentActiveSceneId={currentActiveSceneId}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              getSceneWordCount={getSceneWordCount}
              onToggleChapter={onToggleChapter}
              onSelectScene={onSelectScene}
              onAddScene={onAddScene}
              onStartRename={onStartRename}
              onSaveRename={onSaveRename}
              onDeleteChapterRequest={onDeleteChapterRequest}
              onDeleteSceneRequest={onDeleteSceneRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

