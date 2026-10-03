import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Feather, Sparkles, BookOpen, BookMarked } from "lucide-react";
import { RecentProjectMeta } from "../../types";
import { NovelCover } from "../project/NovelCover";
import { CoverLightboxModal } from "../project/CoverLightboxModal";
import { NovelWordGoalsSection } from "./NovelWordGoalsSection";

interface HomeEditProjectModalProps {
  isOpen: boolean;
  projectMeta: RecentProjectMeta | null;
  onClose: () => void;
  onSave: (updates: {
    title: string;
    subtitle: string;
    author: string;
    genre: string;
    synopsis: string;
    targetWords: number;
    enableWordGoals: boolean;
    coverUrl: string;
  }) => Promise<void>;
}

export const HomeEditProjectModal: React.FC<HomeEditProjectModalProps> = ({
  isOpen,
  projectMeta,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("Ficción");
  const [synopsis, setSynopsis] = useState("");
  const [targetWords, setTargetWords] = useState(50000);
  const [enableWordGoals, setEnableWordGoals] = useState(true);
  const [coverUrl, setCoverUrl] = useState("");
  const [isCoverLightboxOpen, setIsCoverLightboxOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectMeta) {
      setTitle(projectMeta.title || "");
      setSubtitle(projectMeta.subtitle || "");
      setAuthor(projectMeta.author || "");
      setGenre(projectMeta.genre || "Ficción");
      setSynopsis(projectMeta.synopsis || projectMeta.logline || "");
      setCoverUrl(projectMeta.coverUrl || "");
      setTargetWords(projectMeta.targetWords || 50000);
      setEnableWordGoals(projectMeta.enableWordGoals !== false);
    }
  }, [projectMeta]);

  if (!isOpen || !projectMeta) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        title: title.trim(),
        subtitle: subtitle.trim(),
        author: author.trim() || "Autor",
        genre: genre.trim() || "Ficción",
        synopsis: synopsis.trim(),
        targetWords: targetWords || 50000,
        enableWordGoals,
        coverUrl,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera estilo Dossier */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-bold text-lg text-[var(--text-main)] font-novel-display">
              Ficha de la Obra
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bloque Hero: Portada a la izquierda + Identidad a la derecha */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Portada física */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="shadow-lg rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10">
                <NovelCover
                  title={title || projectMeta.title}
                  author={author || projectMeta.author}
                  genre={genre || projectMeta.genre}
                  coverUrl={coverUrl}
                  projectPath={projectMeta.path}
                  size="md"
                  editable={true}
                  onCoverChange={setCoverUrl}
                  onRemoveCover={() => setCoverUrl("")}
                  onViewLarge={() => setIsCoverLightboxOpen(true)}
                />
              </div>
            </div>

            {/* Identidad y Metadatos estilo Dossier */}
            <div className="flex-1 w-full space-y-3.5">
              {/* Título editorial orgánico */}
              <div className="space-y-1">
                <input
                  type="text"
                  required
                  placeholder="Título de la Obra..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-2xl sm:text-3xl font-bold font-novel-display text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-[var(--accent)] focus:outline-hidden pb-1 transition-colors leading-tight"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Subtítulo o lema literario (opcional)..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-sm font-serif italic text-[var(--text-muted)] placeholder:text-[var(--text-muted)]/40 bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-[var(--accent)] focus:outline-hidden pb-0.5 transition-colors"
                />
              </div>

              {/* Campos horizontales de Autor y Género apilados uno sobre otro (como en las fichas) */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]/60">
                  <div className="flex items-center gap-2 w-20 shrink-0 text-xs font-serif text-[var(--text-muted)]">
                    <Feather className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Autor</span>
                  </div>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Autor"
                    className="flex-1 min-w-0 text-xs sm:text-sm font-serif font-medium text-[var(--text-main)] bg-transparent focus:outline-hidden truncate"
                  />
                </div>

                <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]/60">
                  <div className="flex items-center gap-2 w-20 shrink-0 text-xs font-serif text-[var(--text-muted)]">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Género</span>
                  </div>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Género"
                    className="flex-1 min-w-0 text-xs sm:text-sm font-serif font-medium text-[var(--text-main)] bg-transparent focus:outline-hidden truncate"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meta de Escritura Sincronizada con modo libre */}
          <NovelWordGoalsSection
            enableWordGoals={enableWordGoals}
            setEnableWordGoals={setEnableWordGoals}
            targetWords={targetWords}
            setTargetWords={setTargetWords}
          />

          {/* Sinopsis estilo Cuaderno Literario */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)] font-novel-display">
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Sinopsis o Premisa Narrativa</span>
            </div>
            <textarea
              rows={4}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Escribe la premisa o el conflicto central que da vida a tu historia..."
              className="w-full bg-transparent text-xs sm:text-sm font-serif text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-hidden resize-none leading-relaxed"
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-serif text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full text-xs font-bold font-serif transition-all cursor-pointer shadow-md disabled:opacity-50"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-contrast)",
              }}
            >
              {isSubmitting ? "Guardando..." : "Guardar Ficha"}
            </button>
          </div>
        </form>

        <CoverLightboxModal
          isOpen={isCoverLightboxOpen}
          onClose={() => setIsCoverLightboxOpen(false)}
          title={title || projectMeta.title}
          author={author || projectMeta.author}
          genre={genre || projectMeta.genre}
          coverUrl={coverUrl}
          projectPath={projectMeta.path}
        />
      </div>
    </div>,
    document.body
  );
};
