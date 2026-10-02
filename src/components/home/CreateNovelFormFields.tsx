import React from "react";
import { AlertTriangle } from "lucide-react";
import { NovelCover } from "../project/NovelCover";

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
  synopsis,
  setSynopsis,
  coverUrl,
  setCoverUrl,
  onClearError,
}) => {
  return (
    <>
      <div className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-input)]/60">
        <NovelCover
          title={title || "Nueva Novela"}
          author={author || "Autor"}
          genre={genre}
          coverUrl={coverUrl}
          size="sm"
          editable={true}
          onCoverChange={setCoverUrl}
          onRemoveCover={() => setCoverUrl("")}
        />
        <div className="text-xs space-y-1">
          <span className="font-semibold text-[var(--text-main)] block">Portada del Libro (Opcional)</span>
          <p className="text-[11px] text-[var(--text-muted)]">Sube una imagen o deja que Novelore genere una portada tipográfica.</p>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">Título de la Obra *</label>
        <input
          type="text"
          required
          placeholder="Ej: Crónica del Viento de Obsidiana"
          value={title}
          onChange={(e) => { setTitle(e.target.value); onClearError(); }}
          className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-sm text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)] font-serif"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[var(--text-muted)] block">Subtítulo (Opcional)</label>
          <input
            type="text"
            placeholder="Ej: Libro Primero de las Sombras"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[var(--text-muted)] block">Nombre del Autor</label>
          <input
            type="text"
            placeholder="Tu nombre o seudónimo"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[var(--text-muted)] block">Género Literario</label>
          <input
            type="text"
            placeholder="Fantasía, Ciencia Ficción, Thriller..."
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[var(--text-muted)] block">Meta de Palabras Global</label>
          <input
            type="number"
            min={1000}
            step={1000}
            value={targetWords}
            onChange={(e) => setTargetWords(parseInt(e.target.value) || 0)}
            className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-mono text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-[var(--text-muted)] block">Premisa / Sinopsis Breve</label>
        <textarea
          rows={2}
          placeholder="¿De qué trata la historia? (puedes cambiarla después)"
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)] resize-none"
        />
      </div>

      <div className="p-3 rounded-xl border border-amber-500/30 bg-[var(--bg-input)] space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          <span className="font-semibold text-[var(--text-main)]">Aviso: Se modificará la carpeta seleccionada</span>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          Novelore creará la estructura local (project.json, manuscript/, assets/, etc.). Te recomendamos seleccionar una carpeta vacía o una carpeta dedicada.
        </p>
      </div>
    </>
  );
};
