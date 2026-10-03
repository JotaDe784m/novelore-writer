import React, { useState } from "react";
import { Sparkles, Sidebar as SidebarIcon } from "lucide-react";
import { ActiveView, NovelProject } from "../../types";
import { EditProjectModal } from "../project/EditProjectModal";
import { SettingsModal } from "../settings/SettingsModal";
import { NavbarProjectDropdown } from "./NavbarProjectDropdown";
import { NavbarNavPills } from "./NavbarNavPills";
import { NavbarRightActions } from "./NavbarRightActions";

interface TopNavigationProps {
  project: NovelProject | null;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onNewProject: () => void;
  onOpenLocalFolder?: () => void;
  onOpenDemo?: () => void;
  onCloseProject?: () => void;
  onOpenExport?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
  onOpenWordGoals?: () => void;
  isZenMode?: boolean;
  setIsZenMode?: (val: boolean) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  project,
  activeView,
  setActiveView,
  onUpdateProject,
  onNewProject,
  onOpenLocalFolder,
  onOpenDemo,
  onCloseProject,
  isSidebarOpen,
  onToggleSidebar,
  isSaving = false,
  lastSavedAt,
  onOpenWordGoals,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <header
      id="app-navbar"
      className="h-12 border-b px-4 flex items-center justify-between gap-3 shrink-0 transition-colors relative z-50 select-none"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-color)",
        color: "var(--text-main)",
      }}
    >
      {/* Zona Izquierda: Logo y Selector de Novela (no encoge para no colapsar) */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onToggleSidebar && (activeView === "manuscript" || activeView === "editor") && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
            title={isSidebarOpen ? "Ocultar esquema del manuscrito" : "Mostrar esquema del manuscrito"}
          >
            <SidebarIcon className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Marca Novelore */}
        <button
          onClick={() => setActiveView("home")}
          className="flex items-center gap-1.5 font-novel-display font-bold text-sm tracking-wide text-[var(--text-main)] hover:opacity-85 transition-opacity cursor-pointer shrink-0"
          title="Ir al inicio"
        >
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <span className="hidden sm:inline">NOVELORE</span>
        </button>

        <div className="h-4 w-px bg-[var(--border-color)]/60 shrink-0" />

        {/* Desplegable de novela activa */}
        <NavbarProjectDropdown
          project={project}
          onSelectView={setActiveView}
          onOpenDemo={onOpenDemo}
          onOpenLocalFolder={onOpenLocalFolder}
          onOpenEditModal={() => setShowEditModal(true)}
          onOpenWordGoals={onOpenWordGoals}
          onCloseProject={onCloseProject}
          onNewProject={onNewProject}
        />
      </div>

      {/* Zona Central: Conmutador de Módulos Cápsula (centrado limpio sin superposición) */}
      <div className="flex items-center justify-center flex-1 min-w-0 px-2 overflow-hidden">
        <NavbarNavPills
          activeView={activeView}
          onSelectView={setActiveView}
          hasProject={Boolean(project)}
        />
      </div>

      {/* Zona Derecha: Guardado y Ajustes (shrink-0) */}
      <div className="flex items-center justify-end shrink-0">
        <NavbarRightActions
          hasProject={Boolean(project)}
          isSaving={isSaving}
          lastSavedAt={lastSavedAt}
          onOpenSettingsModal={() => setShowSettingsModal(true)}
        />
      </div>

      {/* Modal: Editar Datos de la Novela */}
      {project && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={project}
          onUpdateProject={onUpdateProject}
        />
      )}

      {/* Modal: Ajustes Centrales (incluye Temas, Acentos, Módulos e Idiomas) */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        project={project}
        onUpdateProject={onUpdateProject}
      />
    </header>
  );
};
