import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, X } from "lucide-react";
import { NovelProject } from "../../types";
import { useProjectStore } from "../../stores/useProjectStore";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [editTitle, setEditTitle] = useState(project.title || "");
  const [editSubtitle, setEditSubtitle] = useState(project.subtitle || "");
  const [editAuthor, setEditAuthor] = useState(project.author || "");
  const [editGenre, setEditGenre] = useState(project.genre || "Ficción");
  const [editTargetWords, setEditTargetWords] = useState<number>(
    project.settings?.targetTotalWords || 50000
  );
  const [editSynopsis, setEditSynopsis] = useState(
    project.synopsis || project.logline || ""
  );

  if (!isOpen) return null;

  const projectPath =
    (project as any).projectPath || useProjectStore.getState().projectPath;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const trimmedTitle = editTitle.trim();
    const trimmedAuthor = editAuthor.trim() || "Autor desconocido";
    const trimmedGenre = editGenre.trim() || "Ficción";
    const trimmedSubtitle = editSubtitle.trim();
    const trimmedSynopsis = editSynopsis.trim();
    const words = editTargetWords || 50000;

    onUpdateProject((prev) => ({
      ...prev,
      title: trimmedTitle,
      subtitle: trimmedSubtitle,
      author: trimmedAuthor,
      genre: trimmedGenre,
      synopsis: trimmedSynopsis,
      logline: trimmedSynopsis,
      settings: {
        ...prev.settings,
        targetTotalWords: words,
      },
    }));

    if (projectPath) {
      await useProjectStore.getState().updateProjectMeta(projectPath, {
        title: trimmedTitle,
        subtitle: trimmedSubtitle,
        author: trimmedAuthor,
        genre: trimmedGenre,
        synopsis: trimmedSynopsis,
        logline: trimmedSynopsis,
        targetWords: words,
      });
    }

    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-left"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="font-bold text-lg text-[var(--text-main)] font-novel-display flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[var(--accent)]" />
              <span>Configurar Datos de la Novela</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Modifica los metadatos de tu obra guardados en su archivo project.json.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="space-y-4">
          {/* Ruta física en disco */}
          {projectPath && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                Ubicación física en disco
              </label>
              <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] font-mono text-[var(--text-muted)] truncate select-all">
                {projectPath}
              </div>
            </div>
          )}

          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Título de la Obra *
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-sm text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)] font-serif"
              autoFocus
            />
          </div>

          {/* Subtítulo & Autor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                Subtítulo (Opcional)
              </label>
              <input
                type="text"
                value={editSubtitle}
                onChange={(e) => setEditSubtitle(e.target.value)}
                className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                Nombre del Autor
              </label>
              <input
                type="text"
                value={editAuthor}
                onChange={(e) => setEditAuthor(e.target.value)}
                className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* Género & Meta de Palabras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                Género Literario
              </label>
              <input
                type="text"
                value={editGenre}
                onChange={(e) => setEditGenre(e.target.value)}
                className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                Meta de Palabras Global
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={editTargetWords}
                onChange={(e) => setEditTargetWords(parseInt(e.target.value) || 0)}
                className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-mono text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* Sinopsis */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
              Descripción Corta / Sinopsis
            </label>
            <textarea
              rows={3}
              value={editSynopsis}
              onChange={(e) => setEditSynopsis(e.target.value)}
              className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)] resize-none leading-relaxed"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 shadow-xs transition-opacity cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
