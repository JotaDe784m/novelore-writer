import React, { useMemo } from "react";
import { ScrollText, BookOpen } from "lucide-react";
import { DossierNotesTabProps } from "./dossierTypes";

export const DossierNotesTab: React.FC<DossierNotesTabProps> = ({
  notes,
  onNotesChange,
  entityName,
}) => {
  const wordCount = useMemo(() => {
    const trimmed = notes.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [notes]);

  const handleInsertDivider = () => {
    const divider = "\n\n* * *\n\n";
    onNotesChange(notes ? `${notes.trimEnd()}${divider}` : "* * *\n\n");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Cabecera Editorial & Contador de Palabras */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)]/45 border border-[var(--border-color)]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-color)]/50 shrink-0">
            <ScrollText className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-bold font-novel-display text-sm text-[var(--text-main)] truncate">
            Lore Profundo {entityName ? `de ${entityName}` : ""}
          </h4>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Contador de Palabras de Trasfondo */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)]/50 shadow-2xs"
            title="Palabras acumuladas en este lore"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{wordCount} palabras</span>
          </div>

          <button
            type="button"
            onClick={handleInsertDivider}
            className="px-2.5 py-1 rounded-full text-xs font-sans text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)]/40 transition-colors cursor-pointer"
            title="Insertar corte escénico (* * *)"
          >
            + Corte (* * *)
          </button>
        </div>
      </div>

      {/* 2. Área Amplia de Redacción Literaria */}
      <div className="relative rounded-2xl bg-[var(--bg-input)]/40 border border-[var(--border-color)]/60 p-4 sm:p-5 focus-within:border-[var(--accent)] transition-colors">
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Escribe libremente el trasfondo, secretos, evolución futura de este elemento en los próximos libros o giros argumentales no revelados al lector..."
          rows={16}
          className="w-full bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-muted)]/45 focus:outline-hidden leading-relaxed text-sm sm:text-base font-novel-serif custom-scroll resize-y min-h-[360px]"
        />
      </div>
    </div>
  );
};
