import React from "react";
import { motion } from "motion/react";
import { FolderOpen, Sparkles, Library, BookOpen } from "lucide-react";

interface NoActiveProjectStateProps {
  sectionName?: string;
  onOpenDemo: () => void;
  onOpenFolder: () => void;
  onGoHome: () => void;
}

export const NoActiveProjectState: React.FC<NoActiveProjectStateProps> = ({
  sectionName = "esta sección",
  onOpenDemo,
  onOpenFolder,
  onGoHome,
}) => {
  return (
    <div
      id="no-active-project-container"
      className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 select-none text-center min-h-0 w-full"
      style={{
        backgroundColor: "var(--bg-editor)",
        color: "var(--text-primary)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="max-w-md w-full flex flex-col items-center space-y-5 p-8 rounded-3xl"
        style={{
          backgroundColor: "var(--bg-card)",
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="p-4 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0">
          <BookOpen className="w-8 h-8 opacity-90" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold font-novel-display text-[var(--text-main)]">
            No hay ninguna novela abierta
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Para acceder a {sectionName} necesitas tener un proyecto activo. Puedes cargar la novela de
            demostración para pruebas o abrir una carpeta de tu equipo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
          <button
            type="button"
            onClick={onOpenDemo}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 shadow-xs transition-all cursor-pointer"
            title="Cargar novela de ejemplo para pruebas inmediatas"
          >
            <Sparkles className="w-4 h-4 text-[var(--accent-contrast)]" />
            <span>Probar Novela de Ejemplo</span>
          </button>

          <button
            type="button"
            onClick={onOpenFolder}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-semibold text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            title="Abrir carpeta existente en disco"
          >
            <FolderOpen className="w-4 h-4 text-[var(--accent)]" />
            <span>Abrir Carpeta Local</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onGoHome}
          className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1.5 pt-1 transition-colors cursor-pointer"
        >
          <Library className="w-3.5 h-3.5" />
          <span>Volver al Taller de Inicio</span>
        </button>
      </motion.div>
    </div>
  );
};
