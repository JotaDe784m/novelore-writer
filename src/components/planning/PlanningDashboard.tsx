import React, { useState } from "react";
import {
  Calendar,
  Layers,
  TrendingUp,
  Table,
} from "lucide-react";
import { NovelProject, PlanningSubView } from "../../types";
import { TimelineView } from "./TimelineView";
import { CorkboardView } from "./CorkboardView";
import { StoryArcView } from "./StoryArcView";
import { OutlineGridView } from "./OutlineGridView";

interface PlanningDashboardProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onSelectScene: (sceneId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
}

export const PlanningDashboard: React.FC<PlanningDashboardProps> = ({
  project,
  onUpdateProject,
  onSelectScene,
  onOpenEntityDossier,
}) => {
  const [subView, setSubView] = useState<PlanningSubView>("timeline");

  const planningTabs: {
    id: PlanningSubView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "timeline", label: "Línea de Tiempo Multitrama", icon: Calendar },
    { id: "corkboard", label: "Tablero de Corcho", icon: Layers },
    { id: "beats", label: "Estructura Dramática", icon: TrendingUp },
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
        className="h-11 border-b px-3 sm:px-4 flex items-center justify-between shrink-0 select-none overflow-hidden"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none min-w-0 w-full">
          {planningTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = subView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubView(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
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
      </div>

      {/* Sub-view Rendering */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {subView === "timeline" && (
          <TimelineView
            project={project}
            onUpdateProject={onUpdateProject}
            onSelectScene={onSelectScene}
            onOpenEntityDossier={onOpenEntityDossier}
          />
        )}
        {subView === "corkboard" && (
          <CorkboardView
            project={project}
            onUpdateProject={onUpdateProject}
            onSelectScene={onSelectScene}
          />
        )}
        {subView === "beats" && (
          <StoryArcView
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
