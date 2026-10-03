import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { FolderOpen, Plus, Sparkles, BookOpen } from "lucide-react";
import { NovelProject, ProjectView } from "../../types";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { CreateNovelModal } from "./CreateNovelModal";
import { HomeActiveHero } from "./HomeActiveHero";
import { HomeWritingRhythm } from "./HomeWritingRhythm";
import { HomeCodexSpotlight } from "./HomeCodexSpotlight";
import { HomeProjectWorkshop } from "./HomeProjectWorkshop";
import { HomeEditProjectModal } from "./HomeEditProjectModal";
import { useHomeDashboardLogic } from "./useHomeDashboardLogic";

interface HomeDashboardProps {
  currentProject: NovelProject | null;
  onSelectProject: (project: NovelProject) => void;
  onNavigateView: (view: ProjectView) => void;
  onSelectScene?: (sceneId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
  onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentProject,
  onSelectProject,
  onNavigateView,
  onSelectScene,
  onOpenEntityDossier,
  onUpdateProject,
}) => {
  const isCodexVisible = useSettingsStore((s) => s.visibleModules?.codex !== false);
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingProject,
    setEditingProject,
    showDemoProject,
    handleToggleShowDemo,
    feedbackMsg,
    lastWorkedScene,
    stats,
    handleContinueWriting,
    handleOpenLocalFolder,
    handleOpenProject,
    handleRemoveRecent,
    handleStartEditProject,
    handleSaveEditProject,
    filteredProjects,
    totalAllWords,
    activeEntities,
    isSaving,
    lastSavedAt,
    showToast,
  } = useHomeDashboardLogic({
    currentProject,
    onSelectProject,
    onNavigateView,
    onSelectScene,
    onUpdateProject,
  });

  return (
    <div
      id="novelore-home-dashboard"
      className="flex-1 overflow-y-auto min-h-0 select-none p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8"
    >
      {/* Toast Feedback */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className={`fixed top-14 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl border backdrop-blur-md ${
              feedbackMsg.type === "error"
                ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
            }`}
          >
            <span>{feedbackMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATE A: ACTIVE NOVEL */}
      {currentProject ? (
        <>
          <HomeActiveHero
            project={currentProject}
            lastWorkedScene={lastWorkedScene}
            onContinueWriting={handleContinueWriting}
            onOpenManuscript={() => onNavigateView("manuscript")}
            onEditProject={() =>
              setEditingProject({
                path: currentProject.isDemo ? "demo://ecos-del-vacio" : currentProject.path || "",
                title: currentProject.title,
                subtitle: currentProject.subtitle,
                author: currentProject.author,
                genre: currentProject.genre,
                updatedAt: currentProject.updatedAt,
                wordCount: stats.totalWords,
                targetWords: currentProject.settings?.targetTotalWords || 50000,
                enableWordGoals: currentProject.settings?.enableWordGoals !== false,
                synopsis: currentProject.synopsis,
                logline: currentProject.logline,
                coverUrl: currentProject.coverUrl,
              })
            }
          />

          <HomeWritingRhythm
            stats={stats}
            projectPath={currentProject.path}
            isDemo={currentProject.isDemo}
            lastSavedAt={lastSavedAt}
            isSaving={isSaving}
          />

          {isCodexVisible && (
            <HomeCodexSpotlight
              entities={activeEntities}
              projectPath={currentProject.isDemo ? undefined : currentProject.path}
              onNavigateCodex={() => onNavigateView("codex")}
              onSelectEntity={(entityId) => {
                if (onOpenEntityDossier) {
                  onOpenEntityDossier(entityId);
                } else {
                  onNavigateView("codex");
                }
              }}
            />
          )}
        </>
      ) : (
        /* STATE B: NO ACTIVE NOVEL (CLEAN WELCOME VESTIBULE) */
        <div
          className="rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="p-4 rounded-3xl bg-[var(--bg-input)] text-[var(--accent)]">
            <BookOpen className="w-10 h-10" />
          </div>
          <div className="space-y-1.5 max-w-lg">
            <h1 className="text-2xl sm:text-3xl font-bold font-novel-display text-[var(--text-main)]">
              Bienvenido al Taller de Novelore
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-serif">
              Tus novelas y mundos residen como archivos limpios en tu disco duro, con total soberanía y sin depender de servidores en la nube.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenLocalFolder}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[var(--bg-input)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-[var(--text-main)] transition-all cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-[var(--accent)]" />
              <span>Abrir Carpeta Local</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-md"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-contrast)",
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nueva Novela</span>
            </button>
            {!showDemoProject && (
              <button
                onClick={handleToggleShowDemo}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Activar Novela de Ejemplo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* LOCAL NOVELS WORKSHOP */}
      <HomeProjectWorkshop
        projects={filteredProjects}
        currentProjectPath={currentProject?.path}
        currentProjectTitle={currentProject?.title}
        totalAllWords={totalAllWords}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showDemoProject={showDemoProject}
        onToggleShowDemo={handleToggleShowDemo}
        onOpenLocalFolder={handleOpenLocalFolder}
        onCreateNewProject={() => setIsCreateModalOpen(true)}
        onOpenProject={handleOpenProject}
        onEditProject={handleStartEditProject}
        onRemoveRecent={handleRemoveRecent}
      />

      {/* CREATE NOVEL MODAL */}
      <CreateNovelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={(created) => {
          onSelectProject(created);
          showToast(`Novela "${created.title}" creada en tu equipo`);
          onNavigateView("manuscript");
        }}
      />

      {/* EDIT NOVEL METADATA MODAL */}
      <HomeEditProjectModal
        isOpen={Boolean(editingProject)}
        projectMeta={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleSaveEditProject}
      />
    </div>
  );
};
