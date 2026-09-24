import React from "react";
import { ScrollText, Focus, Minimize2 } from "lucide-react";

interface ZenFloatingBadgeProps {
  sceneTitle: string;
  isTypewriterActive: boolean;
  isFocusActive: boolean;
  onToggleTypewriter: () => void;
  onToggleFocus: () => void;
  onExitZen: () => void;
}

export const ZenFloatingBadge: React.FC<ZenFloatingBadgeProps> = ({
  sceneTitle,
  isTypewriterActive,
  isFocusActive,
  onToggleTypewriter,
  onToggleFocus,
  onExitZen,
}) => {
  return (
    <div className="absolute top-4 right-8 z-30 flex items-center gap-3 bg-[var(--bg-sidebar)]/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[var(--border-subtle)] shadow-lg text-xs select-none opacity-40 hover:opacity-100 transition-opacity duration-300">
      <span className="font-novel-display font-semibold tracking-wider text-[var(--text-primary)] truncate max-w-[200px]">
        {sceneTitle}
      </span>

      {/* Quick Typewriter toggle inside Zen */}
      <button
        type="button"
        onClick={onToggleTypewriter}
        className={`p-1 rounded-md transition-colors cursor-pointer ${
          isTypewriterActive
            ? "text-[var(--accent)] font-bold"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
        title="Alternar Scroll de Máquina de Escribir (Alt+T)"
      >
        <ScrollText className="w-3.5 h-3.5" />
      </button>

      {/* Quick Focus toggle inside Zen */}
      <button
        type="button"
        onClick={onToggleFocus}
        className={`p-1 rounded-md transition-colors cursor-pointer ${
          isFocusActive
            ? "text-[var(--accent)] font-bold"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
        title="Alternar Modo Foco por Párrafo (Alt+F)"
      >
        <Focus className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={onExitZen}
        className="flex items-center gap-1 hover:text-[var(--accent)] cursor-pointer text-[var(--accent)] font-medium pl-1 border-l border-[var(--border-subtle)]"
        title="Salir de Modo Zen (Esc / Alt+Z)"
      >
        <Minimize2 className="w-3.5 h-3.5" />
        <span>Salir</span>
      </button>
    </div>
  );
};

