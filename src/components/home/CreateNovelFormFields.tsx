import React, { useState } from "react";
import { Feather, Sparkles, BookOpen } from "lucide-react";
import { NovelCover } from "../project/NovelCover";
import { CoverLightboxModal } from "../project/CoverLightboxModal";
import { NovelWordGoalsSection } from "./NovelWordGoalsSection";

interface CreateNovelFormFieldsProps {
  title: string;
  setTitle: (val: string) => void;
  subtitle: string;
  setSubtitle: (val: string) => void;
  author: string;
  setAuthor: (val: string) => void;
  genre: string;
  setGenre: (val: string) => void;
  targetWords: number;
  setTargetWords: (val: number) => void;
  enableWordGoals: boolean;
  setEnableWordGoals: (val: boolean) => void;
  synopsis: string;
  setSynopsis: (val: string) => void;
  coverUrl: string;
  setCoverUrl: (val: string) => void;
  onClearError: () => void;
}

export const CreateNovelFormFields: React.FC<CreateNovelFormFieldsProps> = ({
  title,
  setTitle,
  subtitle,
  setSubtitle,
  author,
  setAuthor,
  genre,
  setGenre,
  targetWords,
  setTargetWords,
  enableWordGoals,
  setEnableWordGoals,
  synopsis,
  setSynopsis,
  coverUrl,
  setCoverUrl,
  onClearError,
}) => {
  const [isCoverLightboxOpen, setIsCoverLightboxOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Bloque Hero: Portada a la izquierda + Identidad a la derecha */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Portada física del libro */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="shadow-lg rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10">
            <NovelCover
              title={title || "Nueva Novela"}
              author={author || "Autor"}
              genre={genre || "Fantasía"}
              coverUrl={coverUrl}
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
              onChange={(e) => {
                setTitle(e.target.value);
                onClearError();
              }}
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

          {/* Campos horizontales apilados uno sobre otro (como en las fichas) */}
          <div className="space-y-2">
            {/* Campo Autor */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]/60">
              <div className="flex items-center gap-2 w-20 shrink-0 text-xs font-serif text-[var(--text-muted)]">
                <Feather className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Autor</span>
              </div>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tu nombre o seudónimo"
                className="flex-1 min-w-0 text-xs sm:text-sm font-serif font-medium text-[var(--text-main)] bg-transparent focus:outline-hidden truncate"
              />
            </div>

            {/* Campo Género */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]/60">
              <div className="flex items-center gap-2 w-20 shrink-0 text-xs font-serif text-[var(--text-muted)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Género</span>
              </div>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Fantasía, Ciencia Ficción, Drama..."
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
          rows={3}
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          placeholder="¿De qué trata la historia? Describe el conflicto o premisa central..."
          className="w-full bg-transparent text-xs sm:text-sm font-serif text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-hidden resize-none leading-relaxed"
        />
      </div>

      <CoverLightboxModal
        isOpen={isCoverLightboxOpen}
        onClose={() => setIsCoverLightboxOpen(false)}
        title={title || "Nueva Novela"}
        author={author}
        genre={genre}
        coverUrl={coverUrl}
      />
    </div>
  );
};
