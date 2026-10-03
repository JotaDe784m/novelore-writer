import { useState, useEffect, useMemo } from "react";
import { useProjectStore } from "../../stores/useProjectStore";
import { useManuscriptStore } from "../../stores/useManuscriptStore";
import { useCodexStore } from "../../stores/useCodexStore";
import { NovelProject, ProjectView, RecentProjectMeta } from "../../types";
import { demoProject } from "../../data/demoProject";
import { calculateTotalWords } from "../../utils/storage";
import { getLastWorkedScene, calculateProjectStats } from "./homeUtils";

interface UseHomeDashboardLogicProps {
  currentProject: NovelProject | null;
  onSelectProject: (project: NovelProject) => void;
  onNavigateView: (view: ProjectView) => void;
  onSelectScene?: (sceneId: string) => void;
  onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
}

export function useHomeDashboardLogic({
  currentProject,
  onSelectProject,
  onNavigateView,
  onSelectScene,
  onUpdateProject,
}: UseHomeDashboardLogicProps) {
  const recentProjects = useProjectStore((s) => s.recentProjects);
  const loadRecentProjects = useProjectStore((s) => s.loadRecentProjects);
  const removeRecentProject = useProjectStore((s) => s.removeRecentProject);
  const selectedSceneId = useManuscriptStore((s) => s.selectedSceneId);
  const selectScene = useManuscriptStore((s) => s.selectScene);
  const codexEntities = useCodexStore((s) => s.entities);
  const isSaving = useManuscriptStore((s) => s.isSavingScene);
  const lastSavedAt = useManuscriptStore((s) => s.lastSavedAt);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "words">("recent");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<RecentProjectMeta | null>(null);
  const [showDemoProject, setShowDemoProject] = useState<boolean>(() =>
    typeof window !== "undefined" ? localStorage.getItem("novelore_show_demo_card") !== "false" : true
  );
  const [feedbackMsg, setFeedbackMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadRecentProjects();
  }, [currentProject, loadRecentProjects]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleToggleShowDemo = () => {
    setShowDemoProject((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") localStorage.setItem("novelore_show_demo_card", String(next));
      showToast(next ? "Novela de ejemplo visible en el taller" : "Novela de ejemplo desactivada del inicio");
      return next;
    });
  };

  const lastWorkedScene = useMemo(
    () => getLastWorkedScene(currentProject, selectedSceneId),
    [currentProject, selectedSceneId]
  );

  const stats = useMemo(() => calculateProjectStats(currentProject), [currentProject]);

  const handleContinueWriting = () => {
    if (lastWorkedScene) {
      selectScene(lastWorkedScene.sceneId);
      if (onSelectScene) return onSelectScene(lastWorkedScene.sceneId);
    }
    onNavigateView("manuscript");
  };

  const handleOpenLocalFolder = async () => {
    if (!window.electronAPI?.openProjectFolder) {
      return showToast("El selector nativo requiere ejecutar Novelore en Electron", "error");
    }
    const openedProject = await useProjectStore.getState().openProjectFolder();
    if (openedProject) {
      onSelectProject(openedProject);
      showToast(`Novela "${openedProject.title}" abierta desde carpeta local`);
      onNavigateView("manuscript");
    } else if (useProjectStore.getState().errorMessage) {
      showToast(useProjectStore.getState().errorMessage!, "error");
    }
  };

  const handleOpenRecent = async (folderPath: string) => {
    const loaded = await useProjectStore.getState().initOrLoadFromPath(folderPath);
    if (loaded) {
      onSelectProject(loaded);
      showToast(`Novela "${loaded.title}" cargada`);
      onNavigateView("manuscript");
    } else {
      showToast(useProjectStore.getState().errorMessage || "No se pudo cargar la novela", "error");
    }
  };

  const handleOpenProject = (path: string, isDemo?: boolean) => {
    if (isDemo) {
      onSelectProject(demoProject);
      showToast("Novela de demostración cargada");
      onNavigateView("manuscript");
    } else {
      handleOpenRecent(path);
    }
  };

  const handleRemoveRecent = async (e: React.MouseEvent, folderPath: string) => {
    e.stopPropagation();
    await removeRecentProject(folderPath);
    showToast("Novela quitada del historial reciente");
  };

  const handleStartEditProject = (e: React.MouseEvent, p: RecentProjectMeta) => {
    e.stopPropagation();
    setEditingProject(p);
  };

  const handleSaveEditProject = async (updates: {
    title: string;
    subtitle: string;
    author: string;
    genre: string;
    synopsis: string;
    targetWords: number;
    enableWordGoals: boolean;
    coverUrl: string;
  }) => {
    if (!editingProject) return;
    const store = useProjectStore.getState();
    const success = await store.updateProjectMeta(editingProject.path, {
      ...updates,
      settings: {
        enableWordGoals: updates.enableWordGoals,
        targetTotalWords: updates.targetWords,
      },
    });
    if (success) {
      const isCurrentActive =
        currentProject &&
        (currentProject.path === editingProject.path || currentProject.title === editingProject.title);

      if (isCurrentActive) {
        const updatedFields = {
          ...updates,
          settings: {
            ...currentProject.settings,
            enableWordGoals: updates.enableWordGoals,
            targetTotalWords: updates.targetWords,
          },
        };
        if (onUpdateProject) {
          onUpdateProject((prev) => ({ ...prev, ...updatedFields }));
        } else {
          useProjectStore.getState().setProject({ ...currentProject, ...updatedFields });
        }
      }
      await loadRecentProjects();
      showToast(`Ficha de "${updates.title}" actualizada`);
    } else {
      showToast(store.errorMessage || "Error al actualizar", "error");
    }
  };

  const demoWords = useMemo(() => calculateTotalWords(demoProject), []);
  const demoMeta = useMemo<RecentProjectMeta & { isDemo: boolean }>(
    () => ({
      path: "demo://ecos-del-vacio",
      title: demoProject.title,
      subtitle: demoProject.subtitle,
      author: demoProject.author,
      genre: demoProject.genre,
      updatedAt: demoProject.updatedAt,
      wordCount: demoWords,
      targetWords: demoProject.settings?.targetTotalWords || 50000,
      enableWordGoals: demoProject.settings?.enableWordGoals !== false,
      synopsis: demoProject.synopsis,
      logline: demoProject.logline,
      isDemo: true,
    }),
    [demoWords]
  );

  const allProjects = useMemo(
    () => (showDemoProject ? [demoMeta, ...recentProjects] : recentProjects),
    [showDemoProject, demoMeta, recentProjects]
  );

  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allProjects
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.author && p.author.toLowerCase().includes(q)) ||
          (p.genre && p.genre.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        if (sortBy === "recent") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "words") return (b.wordCount || 0) - (a.wordCount || 0);
        return 0;
      });
  }, [allProjects, searchQuery, sortBy]);

  const totalAllWords = useMemo(
    () => allProjects.reduce((acc, p) => acc + (p.wordCount || 0), 0),
    [allProjects]
  );

  const activeEntities = currentProject ? codexEntities : [];

  return {
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
  };
}

