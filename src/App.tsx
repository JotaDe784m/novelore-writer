import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  NovelProject,
  ProjectView,
  Scene,
  WorldEntity,
} from "./types";
import {
  loadActiveProject,
  saveProject,
} from "./utils/storage";
import { demoProject } from "./data/demoProject";
import { countWords } from "./utils/formatters";
import { Navbar } from "./components/Navbar";
import { ManuscriptSidebar } from "./components/editor/ManuscriptSidebar";
import { RichTextEditor } from "./components/editor/RichTextEditor";
import { SceneInspector } from "./components/editor/SceneInspector";
import { PlanningDashboard } from "./components/planning/PlanningDashboard";
import { WorldbuildingHub } from "./components/codex/WorldbuildingHub";
import { RelationshipMapView } from "./components/codex/RelationshipMapView";
import { ExportModal } from "./components/export/ExportModal";
import { ExportPageView } from "./components/export/ExportPageView";
import { EntityModal } from "./components/codex/EntityModal";
import { HomeDashboard } from "./components/home/HomeDashboard";
import { WordGoalsModal } from "./components/project/WordGoalsModal";
import { VisualBoardView } from "./components/board/VisualBoardView";
import { useProjectStore } from "./stores/useProjectStore";
import { useThemeStore } from "./stores/useThemeStore";
import { useManuscriptStore } from "./stores/useManuscriptStore";

export const App: React.FC = () => {
  const projectStore = useProjectStore();

  const [project, setProject] = useState<NovelProject>(() => {
    return demoProject;
  });

  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

  // Sincronizar proyecto cuando useProjectStore carga uno nuevo desde disco
  useEffect(() => {
    if (projectStore.project && projectStore.project.id !== project.id) {
      setProject(projectStore.project);
      useThemeStore.getState().syncWithProject(projectStore.project);
      const first = projectStore.project.acts[0]?.chapters[0]?.scenes[0];
      useManuscriptStore.getState().loadManuscript(projectStore.project.acts, first?.id);
      if (first) {
        setSelectedSceneId(first.id);
      }
    }
  }, [projectStore.project]);

  // Carga inicial asíncrona de respaldo
  useEffect(() => {
    let isCancelled = false;
    loadActiveProject().then((loaded) => {
      if (isCancelled) return;
      if (!projectStore.project) {
        setProject(loaded);
        useThemeStore.getState().syncWithProject(loaded);
        const firstScene = loaded.acts[0]?.chapters[0]?.scenes[0];
        useManuscriptStore.getState().loadManuscript(loaded.acts, firstScene?.id);
        if (firstScene) {
          setSelectedSceneId(firstScene.id);
        }
      }
      setIsInitialLoadDone(true);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const [activeView, setActiveView] = useState<ProjectView>("home");
  const [selectedSceneId, setSelectedSceneId] = useState<string>(() => {
    const firstScene = project.acts[0]?.chapters[0]?.scenes[0];
    return firstScene ? firstScene.id : "";
  });

  // Toggles de UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isWordGoalsModalOpen, setIsWordGoalsModalOpen] = useState(false);
  const [dossierEntityId, setDossierEntityId] = useState<string | null>(null);
  const [dossierInitialTab, setDossierInitialTab] = useState<"details" | "whiteboard">("details");
  const [isCreatingCharacterFromInspector, setIsCreatingCharacterFromInspector] = useState(false);

  // Sincronizar tema con useThemeStore cuando cambien las preferencias del proyecto
  useEffect(() => {
    useThemeStore.getState().syncWithProject(project);
  }, [project.settings?.theme, project.settings?.customAccentColor]);

  // Atajos globales: Ctrl+\ / Cmd+\ (manuscrito) y Ctrl+I / Cmd+I (inspector de escena)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl) {
        if (e.key === "\\" || e.code === "Backslash") {
          e.preventDefault();
          setIsSidebarOpen((prev) => !prev);
        } else if (e.key.toLowerCase() === "i" || e.code === "KeyI") {
          e.preventDefault();
          setIsInspectorOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, []);

  // Selección de escena actual
  const currentScene = useMemo(() => {
    const storeScene = useManuscriptStore.getState().getSelectedScene();
    if (storeScene) return storeScene;

    for (const act of project.acts) {
      for (const chapter of act.chapters || []) {
        const found = (chapter.scenes || []).find((s) => s.id === selectedSceneId);
        if (found) return found;
      }
    }
    return project.acts[0]?.chapters[0]?.scenes[0] || null;
  }, [project.acts, selectedSceneId]);

  // Entidad de dossier activa
  const selectedDossierEntity = useMemo(() => {
    if (!dossierEntityId) return null;
    return project.entities.find((e) => e.id === dossierEntityId) || null;
  }, [project.entities, dossierEntityId]);

  // Handlers de actualización de proyecto
  const handleUpdateProject = (
    updater: (prev: NovelProject) => NovelProject
  ) => {
    const nowIso = new Date().toISOString();
    setProject((prev) => {
      const updated = updater(prev);
      const withTimestamp = { ...updated, updatedAt: nowIso };
      useProjectStore.getState().debouncedSaveProjectData(withTimestamp);
      return withTimestamp;
    });
  };

  // Actualizar escena y persistir a disco atómicamente a través de useManuscriptStore
  const handleUpdateScene = (sceneId: string, updates: Partial<Scene>) => {
    if (updates.content !== undefined) {
      useManuscriptStore.getState().updateActiveSceneContent(updates.content);
    }
    if (Object.keys(updates).some((k) => k !== "content")) {
      useManuscriptStore.getState().updateSceneMeta(sceneId, updates);
    }

    const currentActs = useManuscriptStore.getState().acts;
    setProject((prev) => ({
      ...prev,
      acts: currentActs,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Actualizar configuración del proyecto
  const handleUpdateProjectSettings = (
    updates: Partial<NovelProject["settings"]>
  ) => {
    const nowIso = new Date().toISOString();
    setProject((prev) => {
      const updated: NovelProject = {
        ...prev,
        updatedAt: nowIso,
        settings: { ...prev.settings, ...updates },
      };
      useProjectStore.getState().debouncedSaveProjectData(updated);
      return updated;
    });
  };

  const handleSelectScene = (sceneId: string) => {
    setSelectedSceneId(sceneId);
    setActiveView("manuscript");
  };

  const handleCreateNewProject = () => {
    setActiveView("home");
  };

  return (
    <div
      id="novelore-app-root"
      className={`theme-${project.settings?.theme || "minimal"} w-full h-full flex flex-col overflow-hidden select-text font-sans`}
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Barra de Navegación Principal */}
      {!isZenMode && (
        <Navbar
          project={project}
          activeView={activeView}
          setActiveView={setActiveView}
          onUpdateProject={handleUpdateProject}
          onNewProject={handleCreateNewProject}
          onOpenLocalFolder={async () => {
            const opened = await projectStore.openProjectFolder();
            if (opened) {
              setProject(opened);
              useThemeStore.getState().syncWithProject(opened);
              const first = opened.acts[0]?.chapters[0]?.scenes[0];
              useManuscriptStore.getState().loadManuscript(opened.acts, first?.id);
              if (first) setSelectedSceneId(first.id);
              setActiveView("manuscript");
            }
          }}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isZenMode={isZenMode}
          setIsZenMode={setIsZenMode}
          onOpenExport={() => setActiveView("export")}
          onOpenWordGoals={() => setIsWordGoalsModalOpen(true)}
          isSaving={projectStore.isSaving}
          lastSavedAt={projectStore.lastSavedAt}
        />
      )}

      {/* Área de Trabajo Principal */}
      <div id="novelore-workspace" className="flex-1 flex flex-col overflow-hidden relative min-h-0 w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="flex-1 flex overflow-hidden w-full min-h-0 min-w-0"
          >
            {/* VISTA 0: INICIO Y GESTIÓN DE NOVELAS LOCALES */}
            {activeView === "home" && (
              <HomeDashboard
                currentProject={project}
                onSelectProject={(newProj) => {
                  setProject(newProj);
                  useProjectStore.getState().setProject(newProj);
                  useThemeStore.getState().syncWithProject(newProj);
                  const first = newProj.acts[0]?.chapters[0]?.scenes[0];
                  useManuscriptStore.getState().loadManuscript(newProj.acts, first?.id);
                  if (first) setSelectedSceneId(first.id);
                  setActiveView("manuscript");
                }}
                onNavigateView={(v) => setActiveView(v)}
              />
            )}

            {/* VISTA 1: EDITOR DE MANUSCRITO */}
            {(activeView === "manuscript" || activeView === "editor") && (
              <>
                {/* Esquema lateral */}
                {isSidebarOpen && !isZenMode && (
                  <ManuscriptSidebar
                    project={project}
                    selectedSceneId={selectedSceneId}
                    onSelectScene={(sceneId) => {
                      setSelectedSceneId(sceneId);
                      useManuscriptStore.getState().selectScene(sceneId);
                    }}
                    onUpdateProject={handleUpdateProject}
                    onCloseSidebar={() => setIsSidebarOpen(false)}
                  />
                )}

                {/* Editor central */}
                <RichTextEditor
                  scene={currentScene}
                  project={project}
                  onUpdateScene={handleUpdateScene}
                  onUpdateProjectSettings={handleUpdateProjectSettings}
                  isZenMode={isZenMode}
                  setIsZenMode={setIsZenMode}
                  isInspectorOpen={isInspectorOpen}
                  onOpenInspector={() => setIsInspectorOpen(!isInspectorOpen)}
                />

                {/* Inspector lateral */}
                {isInspectorOpen && currentScene && !isZenMode && (
                  <SceneInspector
                    scene={currentScene}
                    project={project}
                    onUpdateScene={handleUpdateScene}
                    onClose={() => setIsInspectorOpen(false)}
                    onOpenEntityDossier={(id: string) => setDossierEntityId(id)}
                    onCreateCharacter={() => setIsCreatingCharacterFromInspector(true)}
                    onOpenWordGoals={() => setIsWordGoalsModalOpen(true)}
                    onUpdateProject={handleUpdateProject}
                  />
                )}
              </>
            )}

            {/* VISTA 2: PLANEACIÓN NARRATIVA */}
            {activeView === "planning" && (
              <PlanningDashboard
                project={project}
                onUpdateProject={handleUpdateProject}
                onSelectScene={handleSelectScene}
                onOpenEntityDossier={(id) => {
                  setDossierEntityId(id);
                  setActiveView("codex");
                }}
              />
            )}

            {/* VISTA 3: BIBLIA DE MUNDO & CÓDICE */}
            {(activeView === "codex" || activeView === "world") && (
              <WorldbuildingHub
                project={project}
                onUpdateProject={handleUpdateProject}
                onOpenRelationshipMap={() => setActiveView("relationships")}
              />
            )}

            {/* VISTA 4: MAPA DE RELACIONES */}
            {(activeView === "relationships" || activeView === "relations") && (
              <RelationshipMapView
                project={project}
                onUpdateProject={handleUpdateProject}
                onBackToCodex={() => setActiveView("codex")}
                onOpenBoard={() => setActiveView("gallery")}
                onOpenEntityBoard={(entityId) => {
                  setDossierInitialTab("whiteboard");
                  setDossierEntityId(entityId);
                }}
              />
            )}

            {/* VISTA 5: PIZARRA VISUAL */}
            {activeView === "gallery" && (
              <VisualBoardView
                project={project}
                onUpdateProject={handleUpdateProject}
              />
            )}

            {/* VISTA 6: MAQUETACIÓN EDITORIAL & EXPORTAR */}
            {activeView === "export" && (
              <ExportPageView
                project={project}
                onUpdateProject={handleUpdateProject}
                onBack={() => setActiveView("manuscript")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modales Globales */}
      {isExportModalOpen && (
        <ExportModal
          project={project}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* Metas y Objetivos de Palabras */}
      <WordGoalsModal
        project={project}
        isOpen={isWordGoalsModalOpen}
        onClose={() => setIsWordGoalsModalOpen(false)}
        onUpdateProject={handleUpdateProject}
      />

      {/* Dossier de Entidades de la Biblia de Mundo */}
      {(dossierEntityId || isCreatingCharacterFromInspector) && (
        <EntityModal
          entity={isCreatingCharacterFromInspector ? null : selectedDossierEntity}
          project={project}
          initialTab={dossierInitialTab}
          onSave={(saved) => {
            handleUpdateProject((p) => {
              const exists = p.entities.some((e) => e.id === saved.id);
              return {
                ...p,
                entities: exists
                  ? p.entities.map((e) => (e.id === saved.id ? saved : e))
                  : [...p.entities, saved],
              };
            });
            if (isCreatingCharacterFromInspector && currentScene) {
              handleUpdateScene(currentScene.id, {
                characterIds: Array.from(new Set([...currentScene.characterIds, saved.id])),
              });
            }
            setDossierEntityId(null);
            setDossierInitialTab("details");
            setIsCreatingCharacterFromInspector(false);
          }}
          onDelete={(id) => {
            handleUpdateProject((p) => ({
              ...p,
              entities: p.entities.filter((e) => e.id !== id),
            }));
            setDossierEntityId(null);
            setDossierInitialTab("details");
            setIsCreatingCharacterFromInspector(false);
          }}
          onClose={() => {
            setDossierEntityId(null);
            setDossierInitialTab("details");
            setIsCreatingCharacterFromInspector(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
