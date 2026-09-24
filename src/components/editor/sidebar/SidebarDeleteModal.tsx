import React from "react";
import { Trash2 } from "lucide-react";

export interface ConfirmDeleteItem {
  type: "act" | "chapter" | "scene";
  id: string;
  title: string;
  actId?: string;
  chapterId?: string;
}

interface SidebarDeleteModalProps {
  confirmDelete: ConfirmDeleteItem | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SidebarDeleteModal: React.FC<SidebarDeleteModalProps> = ({
  confirmDelete,
  onCancel,
  onConfirm,
}) => {
  if (!confirmDelete) return null;

  return (
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
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-xs cursor-pointer transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

