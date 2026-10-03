import React from "react";
import { motion } from "motion/react";
import { Check, RefreshCw, Settings } from "lucide-react";

interface NavbarRightActionsProps {
  hasProject: boolean;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
  onOpenSettingsModal: () => void;
}

export const NavbarRightActions: React.FC<NavbarRightActionsProps> = ({
  hasProject,
  isSaving = false,
  lastSavedAt,
  onOpenSettingsModal,
}) => {
  return (
    <div className="flex items-center gap-1.5 shrink-0 select-none">
      {/* Indicador de guardado local en disco */}
      {hasProject && (
        <div
          id="navbar-save-status"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-[var(--text-muted)] shrink-0 bg-[var(--bg-input)] border border-[var(--border-color)]/50"
          title={
            isSaving
              ? "Guardando cambios en disco..."
              : lastSavedAt
              ? `Guardado en disco: ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : "Guardado localmente en disco"
          }
        >
          {isSaving ? (
            <RefreshCw className="w-3 h-3 text-[var(--accent)] animate-spin shrink-0" />
          ) : (
            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span className="hidden sm:inline font-mono text-[10px]">
            {isSaving ? "Guardando..." : "En disco"}
          </span>
        </div>
      )}

      {/* Botón único de Ajustes Generales (incluye temas, acentos, módulos e idiomas) */}
      <motion.button
        id="settings-menu-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenSettingsModal}
        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
        title="Ajustes de Novelore (Temas, Módulos e Idiomas)"
      >
        <Settings className="w-4 h-4" />
      </motion.button>
    </div>
  );
};
