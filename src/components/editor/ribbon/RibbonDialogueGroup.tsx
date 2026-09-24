import React from "react";

interface RibbonDialogueGroupProps {
  onInsertEmDash: () => void;
  onInsertGuillemets: () => void;
  onInsertBreak: () => void;
}

export const RibbonDialogueGroup: React.FC<RibbonDialogueGroupProps> = ({
  onInsertEmDash,
  onInsertGuillemets,
  onInsertBreak,
}) => {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        id="insert-em-dash-btn"
        type="button"
        onClick={onInsertEmDash}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[var(--text-primary)] bg-[var(--accent-subtle)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] transition-colors cursor-pointer"
        title="Insertar Guion Largo de Diálogo (—) [Ctrl+Shift+M o Alt+-]"
      >
        <span className="text-base leading-none font-bold text-[var(--accent)]">—</span>
        <span className="hidden xl:inline">Guion</span>
      </button>

      <button
        id="insert-guillemets-btn"
        type="button"
        onClick={onInsertGuillemets}
        className="px-2 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
        title="Insertar Comillas Latinas (« »)"
      >
        « »
      </button>

      <button
        id="insert-break-btn"
        type="button"
        onClick={onInsertBreak}
        className="px-2 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
        title="Insertar Separador de Escena (* * *)"
      >
        * * *
      </button>
    </div>
  );
};

