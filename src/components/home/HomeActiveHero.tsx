import React, { useState } from "react";
import { motion } from "motion/react";
import { PenTool, BookOpen, Feather, Sparkles, Pencil } from "lucide-react";
import { NovelProject } from "../../types";
import { NovelCover } from "../project/NovelCover";
import { CoverLightboxModal } from "../project/CoverLightboxModal";
import { LastWorkedSceneInfo, getTimeGreeting } from "./homeUtils";

interface HomeActiveHeroProps {
  project: NovelProject;
  lastWorkedScene: LastWorkedSceneInfo | null;
  onContinueWriting: () => void;
  onOpenManuscript: () => void;
  onEditProject: () => void;
}

export const HomeActiveHero: React.FC<HomeActiveHeroProps> = ({
  project,
  lastWorkedScene,
  onContinueWriting,
  onOpenManuscript,
  onEditProject,
}) => {
  const [isCoverLightboxOpen, setIsCoverLightboxOpen] = useState(false);
  const greeting = getTimeGreeting(project.author);

  return (
    <div
      className="relative rounded-3xl p-6 sm:p-8 lg:p-10 transition-all overflow-hidden"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Decorative ambient gradient backdrop */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: "var(--accent)" }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Author Greeting, Title, Synopsis and Direct CTA */}
        <div className="flex-1 space-y-5 max-w-3xl">
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-serif italic tracking-wide text-[var(--accent)]">
              {greeting}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-novel-display text-[var(--text-main)] tracking-tight leading-tight">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="text-base sm:text-lg text-[var(--text-muted)] font-serif italic">
                {project.subtitle}
              </p>
            )}
          </div>

          {/* Genre and Author metadata capsules */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)]">
              <Feather className="w-3 h-3 text-[var(--accent)]" />
              <span>{project.author || "Autor"}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)]">
              <Sparkles className="w-3 h-3 text-[var(--accent)]" />
              <span>{project.genre || "Ficción"}</span>
            </span>

            {project.isDemo && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent)]">
                Demostración activa
              </span>
            )}
          </div>

          {/* Synopsis / Logline */}
          {(project.synopsis || project.logline) && (
            <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed max-w-2xl font-serif">
              {project.synopsis || project.logline}
            </p>
          )}

          {/* Primary Action Button: "Continuar Escribiendo" */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinueWriting}
              className="flex items-center justify-center gap-3 px-7 py-4 rounded-full text-xs sm:text-sm font-bold shadow-lg cursor-pointer transition-all font-serif"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-contrast)",
              }}
              title="Reanudar escritura directamente en el editor"
            >
              <PenTool className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <span className="block leading-tight text-sm">Continuar Escribiendo</span>
                {lastWorkedScene && (
                  <span className="block text-[11px] font-normal opacity-90 truncate max-w-[240px]">
                    {lastWorkedScene.chapterTitle} • {lastWorkedScene.sceneTitle}
                  </span>
                )}
              </div>
            </motion.button>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenManuscript}
                className="flex items-center gap-2 px-5 py-3.5 rounded-full text-xs font-semibold text-[var(--text-main)] bg-[var(--bg-input)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] transition-colors cursor-pointer font-serif"
                title="Abrir el árbol de manuscrito completo"
              >
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Ver Manuscrito</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEditProject}
                className="p-3.5 rounded-full text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                title="Editar datos y metadatos de la novela"
              >
                <Pencil className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right: Book Physical Cover Preview (Enlarged) */}
        <div className="shrink-0 flex items-center justify-center lg:justify-end">
          <div
            className="relative group cursor-pointer transition-transform duration-300 hover:scale-103"
            onClick={() => setIsCoverLightboxOpen(true)}
            title="Hacer clic para ver la portada en grande"
          >
            {/* Soft book depth shadow */}
            <div className="absolute inset-0 rounded-2xl bg-black/35 blur-2xl transform translate-y-3" />
            <div className="relative shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/15 dark:ring-white/10">
              <NovelCover
                title={project.title}
                author={project.author}
                genre={project.genre}
                coverUrl={project.coverUrl}
                projectPath={project.isDemo ? undefined : project.path}
                size="lg"
                onViewLarge={() => setIsCoverLightboxOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox de portada ampliada */}
      <CoverLightboxModal
        isOpen={isCoverLightboxOpen}
        onClose={() => setIsCoverLightboxOpen(false)}
        title={project.title}
        author={project.author}
        genre={project.genre}
        coverUrl={project.coverUrl}
        projectPath={project.isDemo ? undefined : project.path}
      />
    </div>
  );
};
