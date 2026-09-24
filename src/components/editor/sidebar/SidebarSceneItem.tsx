import React from "react";
import { FileText, Check, X, Edit2, Trash2 } from "lucide-react";
import { Scene, SceneStatus } from "../../../types";

export interface EditingItem {
  type: "act" | "chapter" | "scene";
  id: string;
  title: string;
}

interface SidebarSceneItemProps {
  scene: Scene;
  actId: string;
  chapterId: string;
  isActive: boolean;
  sceneWords: number;
  editingItem: EditingItem | null;
  setEditingItem: (item: EditingItem | null) => void;
  onSelectScene: (sceneId: string) => void;
  onSaveRename: () => void;
  onStartRename: (e: React.MouseEvent, type: "scene", id: string, title: string) => void;
  onDeleteRequest: (e: React.MouseEvent, actId: string, chapterId: string, scene: Scene) => void;
}

function getStatusBadge(status: SceneStatus) {
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
}

export const SidebarSceneItem: React.FC<SidebarSceneItemProps> = ({
  scene,
  actId,
  chapterId,
  isActive,
  sceneWords,
  editingItem,
  setEditingItem,
  onSelectScene,
  onSaveRename,
  onStartRename,
  onDeleteRequest,
}) => {
  const statusBadge = getStatusBadge(scene.status);

  return (
    <div
      onClick={() => onSelectScene(scene.id)}
      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
        isActive
          ? "bg-[var(--bg-surface-active)] text-[var(--text-primary)] font-medium"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
      }`}
    >
      {/* Indicador sutil de escena activa */}
      {isActive && (
        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[var(--accent)]" />
      )}

      {editingItem?.id === scene.id ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSaveRename();
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
              isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
            }`}
          />
          <span className="truncate leading-normal">{scene.title}</span>
        </div>
      )}

      {editingItem?.id !== scene.id && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            style={{
              backgroundColor: statusBadge.bg,
              color: statusBadge.text,
            }}
            className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
          >
            {statusBadge.label}
          </span>

          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {sceneWords.toLocaleString()}
          </span>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => onStartRename(e, "scene", scene.id, scene.title)}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
              title="Renombrar Escena"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={(e) => onDeleteRequest(e, actId, chapterId, scene)}
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
};
