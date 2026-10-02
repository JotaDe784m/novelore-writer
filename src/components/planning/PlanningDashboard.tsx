import React, { useState } from "react";
import {
  Calendar,
  Layers,
  Table,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { NovelProject, PlanningSubView } from "../../types";
import { TimelineView } from "./TimelineView";
import { CorkboardView } from "./CorkboardView";
import { OutlineGridView } from "./OutlineGridView";
import { usePlanningStore } from "../../stores/usePlanningStore";

interface PlanningDashboardProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onSelectScene: (sceneId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
  onOpenEntityWhiteboard?: (entityId: string) => void;
}

export const PlanningDashboard: React.FC<PlanningDashboardProps> = ({
  project,
  onUpdateProject,
  onSelectScene,
  onOpenEntityDossier,
  onOpenEntityWhiteboard,
}) => {
  const [subView, setSubView] = useState<PlanningSubView>("timeline");
  const isSaving = usePlanningStore((s) => s.isSaving);
  const lastSavedAt = usePlanningStore((s) => s.lastSavedAt);

  const planningTabs: {
    id: PlanningSubView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "timeline", label: "Línea de Tiempo", icon: Calendar },
    { id: "corkboard", label: "Tablero de Corcho", icon: Layers },
    { id: "matrix", label: "Matriz de Esquema", icon: Table },
  ];

  return (
    <div
      id="planning-dashboard"
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Sub-navigation Switcher Bar */}
      <div
        className="h-11 px-3 sm:px-5 flex items-center justify-between shrink-0 select-none overflow-hidden"
        style={{
          backgroundColor: "var(--bg-surface)",
        }}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none min-w-0">
          {planningTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = subView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubView(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Persistence Status */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] shrink-0 pl-3">
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-[var(--accent)] opacity-80">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Guardando...</span>
            </span>
          ) : lastSavedAt ? (
            <span className="flex items-center gap-1.5 opacity-60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guardado en disco</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Sub-view Rendering */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {subView === "timeline" && (
          <TimelineView
            project={project}
            onUpdateProject={onUpdateProject}
            onSelectScene={onSelectScene}
            onOpenEntityDossier={onOpenEntityDossier}
            onOpenEntityWhiteboard={onOpenEntityWhiteboard}
          />
        )}
        {subView === "corkboard" && (
          <CorkboardView
            project={project}
            onUpdateProject={onUpdateProject}
            onSelectScene={onSelectScene}
          />
        )}
        {subView === "matrix" && (
          <OutlineGridView
            project={project}
            onUpdateProject={onUpdateProject}
            onSelectScene={onSelectScene}
          />
        )}
      </div>
    </div>
  );
};
