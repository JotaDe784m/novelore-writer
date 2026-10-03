import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FolderOpen,
  ChevronDown,
  Library,
  Sparkles,
  Pencil,
  Target,
  LogOut,
  Plus,
} from "lucide-react";
import { ActiveView, NovelProject } from "../../types";
import { calculateTotalWords } from "../../utils/storage";

interface NavbarProjectDropdownProps {
  project: NovelProject | null;
  onSelectView: (view: ActiveView) => void;
  onOpenDemo?: () => void;
  onOpenLocalFolder?: () => void;
  onOpenEditModal: () => void;
  onOpenWordGoals?: () => void;
  onCloseProject?: () => void;
  onNewProject: () => void;
}

export const NavbarProjectDropdown: React.FC<NavbarProjectDropdownProps> = ({
  project,
  onSelectView,
  onOpenDemo,
  onOpenLocalFolder,
  onOpenEditModal,
  onOpenWordGoals,
  onCloseProject,
  onNewProject,
}) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const totalWords = project ? calculateTotalWords(project) : 0;
  const targetWords = project?.settings?.targetTotalWords || 50000;
  const progressPercent = project
    ? Math.min(100, Math.round((totalWords / targetWords) * 100))
    : 0;

  const projectPath = (project as any)?.projectPath as string | undefined;

  return (
    <div className="flex items-center gap-2">
      {/* Botón selector desplegable */}
      <div className="relative">
        <motion.button
          id="project-selector-btn"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowProjectMenu(!showProjectMenu)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-input)] hover:bg-[var(--bg-surface-hover)] transition-colors border border-[var(--border-color)]/60 cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="max-w-[130px] sm:max-w-[170px] truncate font-serif font-semibold text-xs text-[var(--text-main)]">
            {project ? project.title || "Novela sin título" : "Sin novela activa"}
          </span>
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
        </motion.button>

        <AnimatePresence>
          {showProjectMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="absolute left-0 top-full mt-1.5 w-80 rounded-2xl shadow-2xl border p-2 z-[100] origin-top-left"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="text-[10px] font-semibold px-2 py-1 text-[var(--text-muted)] uppercase tracking-wider">
                {project ? "Novela Activa" : "Estado"}
              </div>

              {project ? (
                <div className="px-2 py-1.5 border-b mb-1 pb-2 border-[var(--border-color)]/60">
                  <div className="text-sm font-semibold truncate text-[var(--text-main)] font-serif">
                    {project.title}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {totalWords.toLocaleString()} palabras • {project.genre || "Ficción"}
                  </div>
                  {projectPath && (
                    <div
                      className="text-[10px] font-mono text-[var(--text-muted)] truncate mt-1 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md"
                      title={projectPath}
                    >
                      {projectPath}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-2 py-1.5 border-b mb-1 pb-2 border-[var(--border-color)]/60">
                  <div className="text-xs text-[var(--text-muted)]">
                    Ninguna novela abierta actualmente
                  </div>
                </div>
              )}

              <div className="space-y-0.5 pt-1">
                <button
                  onClick={() => {
                    setShowProjectMenu(false);
                    onSelectView("home");
                  }}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-[var(--bg-input)] transition-colors cursor-pointer text-[var(--text-main)]"
                >
                  <Library className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Todas las Novelas (Inicio)</span>
                </button>

                {!project && onOpenDemo && (
                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      onOpenDemo();
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--accent)] cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Probar Novela de Ejemplo</span>
                  </button>
                )}

                {onOpenLocalFolder && (
                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      onOpenLocalFolder();
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)] cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{project ? "Abrir otra carpeta local..." : "Abrir carpeta local..."}</span>
                  </button>
                )}

                {project && (
                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      onOpenEditModal();
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)] cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Configurar y editar novela...</span>
                  </button>
                )}

                {project && onOpenWordGoals && (
                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      onOpenWordGoals();
                    }}
                    className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Metas de Palabras</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold">
                      {project.settings?.enableWordGoals !== false ? "Activas" : "Libre"}
                    </span>
                  </button>
                )}

                {project && onCloseProject && (
                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      onCloseProject();
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Novela / Volver al Taller</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowProjectMenu(false);
                    onNewProject();
                  }}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-95 transition-opacity mt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Nueva Novela</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Píldora de palabras */}
      {project && (
        <button
          type="button"
          onClick={onOpenWordGoals}
          className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono border border-[var(--border-color)]/60 bg-[var(--bg-input)] hover:border-[var(--accent)] transition-all cursor-pointer select-none"
          title={`Meta: ${totalWords.toLocaleString()} / ${targetWords.toLocaleString()} palabras (${progressPercent}%)`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span className="font-semibold text-[var(--text-main)]">
            {totalWords.toLocaleString()}
          </span>
          {project.settings?.enableWordGoals !== false && (
            <span className="text-[10px] text-[var(--accent)] font-semibold">
              {progressPercent}%
            </span>
          )}
        </button>
      )}
    </div>
  );
};
