import React from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Chapter, Scene } from "../../../types";
import { EditingItem, SidebarSceneItem } from "./SidebarSceneItem";

interface SidebarChapterItemProps {
  actId: string;
  chapter: Chapter;
  isChapCollapsed: boolean;
  chapWords: number;
  currentActiveSceneId: string;
  editingItem: EditingItem | null;
  setEditingItem: (item: EditingItem | null) => void;
  getSceneWordCount: (scene: Scene) => number;
  onToggleChapter: (chapId: string) => void;
  onSelectScene: (sceneId: string) => void;
  onAddScene: (chapId: string) => void;
  onStartRename: (e: React.MouseEvent, type: "chapter" | "scene", id: string, title: string) => void;
  onSaveRename: () => void;
  onDeleteChapterRequest: (e: React.MouseEvent, actId: string, chapter: Chapter) => void;
  onDeleteSceneRequest: (e: React.MouseEvent, actId: string, chapterId: string, scene: Scene) => void;
}

export const SidebarChapterItem: React.FC<SidebarChapterItemProps> = ({
  actId,
  chapter,
  isChapCollapsed,
  chapWords,
  currentActiveSceneId,
  editingItem,
  setEditingItem,
  getSceneWordCount,
  onToggleChapter,
  onSelectScene,
  onAddScene,
  onStartRename,
  onSaveRename,
  onDeleteChapterRequest,
  onDeleteSceneRequest,
}) => {
  return (
    <div className="space-y-0.5">
      <div className="group flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors">
        {editingItem?.id === chapter.id ? (
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
            onClick={() => onToggleChapter(chapter.id)}
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
              {chapter.title}
            </span>
          </button>
        )}

        {editingItem?.id !== chapter.id && (
          <div className="flex items-center gap-1 shrink-0 ml-1.5">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {chapWords.toLocaleString()}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onAddScene(chapter.id)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                title="Añadir Escena"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => onStartRename(e, "chapter", chapter.id, chapter.title)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                title="Renombrar Capítulo"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={(e) => onDeleteChapterRequest(e, actId, chapter)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                title="Eliminar Capítulo"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {!isChapCollapsed && (
        <div className="space-y-0.5 pl-3">
          {(chapter.scenes || []).map((scene) => (
            <SidebarSceneItem
              key={scene.id}
              scene={scene}
              actId={actId}
              chapterId={chapter.id}
              isActive={currentActiveSceneId === scene.id}
              sceneWords={getSceneWordCount(scene)}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              onSelectScene={onSelectScene}
              onSaveRename={onSaveRename}
              onStartRename={onStartRename}
              onDeleteRequest={onDeleteSceneRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

