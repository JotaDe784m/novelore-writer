import React from "react";
import { ScrollText, Focus, CaseSensitive, Copy } from "lucide-react";

interface RibbonErgonomicsGroupProps {
  isTypewriterActive: boolean;
  onToggleTypewriter: () => void;
  isFocusActive: boolean;
  onToggleFocus: () => void;
  onToggleCase: () => void;
  onCopyContent: () => void;
}

export const RibbonErgonomicsGroup: React.FC<RibbonErgonomicsGroupProps> = ({
  isTypewriterActive,
  onToggleTypewriter,
  isFocusActive,
  onToggleFocus,
  onToggleCase,
  onCopyContent,
}) => {
  return (
    <>
      {/* Typewriter & Focus */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          id="toggle-typewriter-mode-btn"
          type="button"
          onClick={onToggleTypewriter}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            isTypewriterActive
              ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-2xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
          }`}
          title="Scroll de Máquina de Escribir (Mantiene la línea activa en el centro) [Alt+T]"
        >
          <ScrollText className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden xl:inline">Máquina</span>
          {isTypewriterActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />}
        </button>

        <button
          id="toggle-focus-mode-btn"
          type="button"
          onClick={onToggleFocus}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            isFocusActive
              ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-2xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
          }`}
          title="Modo Foco por Párrafo (Atenúa los párrafos circundantes) [Alt+F]"
        >
          <Focus className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden xl:inline">Foco</span>
          {isFocusActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />}
        </button>
      </div>

      <div className="h-4 w-px bg-[var(--border-subtle)] shrink-0 mx-0.5" />

      {/* Utilities: Case toggle & Copy */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          id="toggle-case-btn"
          onClick={onToggleCase}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          title="Alternar MAYÚSCULAS / minúsculas / Título en la selección"
        >
          <CaseSensitive className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          id="copy-content-btn"
          onClick={onCopyContent}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          title="Copiar texto de la escena al portapapeles"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
};

