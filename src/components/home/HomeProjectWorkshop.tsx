import React from "react";
import { motion } from "motion/react";
import { FolderOpen, Plus, Search, Sparkles } from "lucide-react";
import { RecentProjectMeta } from "../../types";
import { HomeProjectCard } from "./HomeProjectCard";

interface HomeProjectWorkshopProps {
  projects: (RecentProjectMeta & { isDemo?: boolean })[];
  currentProjectPath?: string;
  currentProjectTitle?: string;
  totalAllWords: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: "recent" | "title" | "words";
  onSortChange: (s: "recent" | "title" | "words") => void;
  showDemoProject: boolean;
  onToggleShowDemo: () => void;
  onOpenLocalFolder: () => void;
  onCreateNewProject: () => void;
  onOpenProject: (path: string, isDemo?: boolean) => void;
  onEditProject: (e: React.MouseEvent, p: RecentProjectMeta) => void;
  onRemoveRecent: (e: React.MouseEvent, path: string) => void;
}

export const HomeProjectWorkshop: React.FC<HomeProjectWorkshopProps> = ({
  projects,
  currentProjectPath,
  currentProjectTitle,
  totalAllWords,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  showDemoProject,
  onToggleShowDemo,
  onOpenLocalFolder,
  onCreateNewProject,
  onOpenProject,
  onEditProject,
  onRemoveRecent,
}) => {
  return (
    <div className="space-y-4 pt-2">
      {/* Header and Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-novel-display text-[var(--text-main)]">
            Taller de Novelas ({projects.length})
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-serif">
            Palabras acumuladas:{" "}
            <strong className="text-[var(--text-main)] font-mono">
              {totalAllWords.toLocaleString()}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenLocalFolder}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent)] text-[var(--text-main)] transition-all cursor-pointer"
            title="Seleccionar una carpeta de novela en el equipo"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Abrir Carpeta Local</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateNewProject}
            className="flex items-center gap-2 px-4.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-contrast)",
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Novela</span>
          </motion.button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por título, autor o género..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-full text-xs border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] w-56 sm:w-64"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sorter */}
          <div className="flex items-center gap-1 p-0.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-input)] text-xs">
            {(["recent", "title", "words"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onSortChange(mode)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                  sortBy === mode
                    ? "bg-[var(--bg-card)] text-[var(--text-main)] font-semibold shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {mode === "recent" ? "Reciente" : mode === "title" ? "Título" : "Palabras"}
              </button>
            ))}
          </div>

          {/* Demo toggle */}
          <button
            type="button"
            onClick={onToggleShowDemo}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
              showDemoProject
                ? "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/40 font-semibold"
                : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
            title={
              showDemoProject
                ? "Ocultar novela de ejemplo del taller"
                : "Mostrar novela de ejemplo en el taller"
            }
          >
            <Sparkles className="w-3 h-3" />
            <span>Ejemplo: {showDemoProject ? "Visible" : "Oculto"}</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div
          className="rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px dashed var(--border-color)",
          }}
        >
          <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] text-[var(--accent)]">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-bold text-sm text-[var(--text-main)] font-novel-display">
              No hay novelas en el taller
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Crea tu primera novela o abre una carpeta existente en tu equipo.
            </p>
          </div>
          <button
            onClick={onCreateNewProject}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-contrast)",
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Nueva Novela</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const isDemo = Boolean(p.isDemo);
            const isCurrent = isDemo
              ? currentProjectPath?.startsWith("demo://")
              : currentProjectPath === p.path || currentProjectTitle === p.title;

            return (
              <HomeProjectCard
                key={p.path}
                project={p}
                isCurrent={Boolean(isCurrent)}
                onOpenProject={onOpenProject}
                onEditProject={onEditProject}
                onRemoveRecent={onRemoveRecent}
                onToggleShowDemo={onToggleShowDemo}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

