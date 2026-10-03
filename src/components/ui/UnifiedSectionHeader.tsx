import React, { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { SectionHelpModal, ShortcutHint } from "./SectionHelpModal";
import { useSettingsStore } from "../../stores/useSettingsStore";

interface UnifiedSectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  helpTitle?: string;
  helpDescription?: string;
  helpGifSrc?: string;
  helpShortcuts?: ShortcutHint[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const UnifiedSectionHeader: React.FC<UnifiedSectionHeaderProps> = ({
  icon: Icon,
  title,
  helpTitle,
  helpDescription,
  helpGifSrc,
  helpShortcuts = [],
  actions,
  children,
  className = "",
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isZenMode = useSettingsStore((s) => s.isZenMode);
  const toggleZenMode = useSettingsStore((s) => s.toggleZenMode);

  // Si estamos en modo Zen, la cabecera se oculta para dar inmersión absoluta
  if (isZenMode) return null;

  return (
    <div
      className={`border-b border-[var(--border-color)]/60 bg-[var(--bg-surface)] shrink-0 select-none transition-colors ${className}`}
    >
      <div className="px-5 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Lado Izquierdo: Icono, Título, Botón ? y Botón Zen */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0">
            <Icon className="w-4 h-4" />
          </div>

          <h2 className="text-base sm:text-lg font-bold font-novel-display text-[var(--text-main)] tracking-wide">
            {title}
          </h2>

          {/* Botón de Ayuda Contextual con Placeholder para GIFs */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border border-[var(--border-color)]/70 shadow-2xs shrink-0"
            title={`Guía visual de ${title}`}
          >
            ?
          </button>

          {/* Botón Zen / Pantalla Completa Unificado */}
          <button
            type="button"
            onClick={toggleZenMode}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            title="Pantalla completa / Modo Zen"
          >
            {isZenMode ? (
              <Minimize2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Lado Derecho: Acciones Específicas de la Sección */}
        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </div>

      {/* Fila Inferior Opcional (para pestañas UnderlineTabs o filtros secundarios) */}
      {children && <div className="px-5 sm:px-8 pb-1">{children}</div>}

      {/* Modal Universal de Ayuda con Soporte para GIFs */}
      <SectionHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title={helpTitle || title}
        description={
          helpDescription ||
          `Espacio de trabajo de ${title}. Organiza tu obra sin distracciones.`
        }
        gifSrc={helpGifSrc}
        shortcuts={helpShortcuts}
      />
    </div>
  );
};
