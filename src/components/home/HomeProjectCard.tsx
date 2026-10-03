import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Pencil, X, EyeOff } from "lucide-react";
import { RecentProjectMeta } from "../../types";
import { NovelCover } from "../project/NovelCover";
import { CoverLightboxModal } from "../project/CoverLightboxModal";
import { formatRelativeDate } from "./homeUtils";

interface HomeProjectCardProps {
  project: RecentProjectMeta & { isDemo?: boolean };
  isCurrent: boolean;
  onOpenProject: (path: string, isDemo?: boolean) => void;
  onEditProject: (e: React.MouseEvent, p: RecentProjectMeta) => void;
  onRemoveRecent: (e: React.MouseEvent, path: string) => void;
  onToggleShowDemo: () => void;
}

export const HomeProjectCard: React.FC<HomeProjectCardProps> = ({
  project,
  isCurrent,
  onOpenProject,
  onEditProject,
  onRemoveRecent,
  onToggleShowDemo,
}) => {
  const [isCoverLightboxOpen, setIsCoverLightboxOpen] = useState(false);
  const isDemo = Boolean(project.isDemo);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl p-4.5 transition-all flex flex-col justify-between group relative"
      style={{
        backgroundColor: "var(--bg-card)",
        border: isCurrent
          ? "1px solid var(--accent)"
          : "1px solid var(--border-color)",
      }}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3.5">
          <NovelCover
            title={project.title}
            author={project.author}
            genre={project.genre}
            coverUrl={project.coverUrl}
            projectPath={isDemo ? undefined : project.path}
            size="sm"
            onViewLarge={() => setIsCoverLightboxOpen(true)}
          />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[var(--text-main)] truncate font-serif">
                    {project.title}
                  </h3>
                  {isCurrent && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shrink-0">
                      Activa
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {project.author || "Autor desconocido"} • {project.genre || "Ficción"}
                </p>
              </div>

              {/* Action buttons on card hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {isDemo ? (
                  <button
                    onClick={onToggleShowDemo}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-amber-500 hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer"
                    title="Ocultar novela de ejemplo"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => onEditProject(e, project)}
                      className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer"
                      title="Editar metadatos de la novela"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => onRemoveRecent(e, project.path)}
                      className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                      title="Quitar del historial"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {(project.synopsis || project.logline || project.subtitle) && (
              <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed font-serif">
                {project.synopsis || project.logline || project.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Physical Path */}
        <div
          className="text-[10px] font-mono text-[var(--text-muted)] truncate px-2.5 py-1 rounded-lg bg-[var(--bg-input)]"
          title={isDemo ? "Entorno de demostración en memoria" : project.path}
        >
          {isDemo ? "Demostración en memoria" : project.path}
        </div>
      </div>

      {/* Bottom Stats and Open CTA */}
      <div className="pt-3 border-t border-[var(--border-color)] mt-3 flex items-center justify-between gap-2 text-xs">
        <div className="text-[11px] text-[var(--text-muted)] font-mono">
          <strong className="text-[var(--text-main)]">
            {(project.wordCount || 0).toLocaleString()}
          </strong>{" "}
          palabras • {isDemo ? "Demo" : formatRelativeDate(project.updatedAt)}
        </div>

        <button
          onClick={() => onOpenProject(project.path, isDemo)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all shadow-2xs"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-contrast)",
          }}
        >
          <span>{isDemo ? "Probar" : isCurrent ? "Continuar" : "Abrir"}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <CoverLightboxModal
        isOpen={isCoverLightboxOpen}
        onClose={() => setIsCoverLightboxOpen(false)}
        title={project.title}
        author={project.author}
        genre={project.genre}
        coverUrl={project.coverUrl}
        projectPath={isDemo ? undefined : project.path}
      />
    </motion.div>
  );
};

