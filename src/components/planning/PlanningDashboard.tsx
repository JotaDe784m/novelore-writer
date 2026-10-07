import React, { useState } from "react";
import {
  Calendar,
  Layers,
  Table,
} from "lucide-react";
import { NovelProject, PlanningSubView } from "../../types";
import { TimelineView } from "./TimelineView";
import { CorkboardView } from "./CorkboardView";
import { OutlineGridView } from "./OutlineGridView";
import { UnifiedSectionHeader } from "../ui/UnifiedSectionHeader";
import { UnderlineTabs } from "../ui/UnderlineTabs";

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

  const planningTabs = [
    { id: "timeline", label: "Línea de tiempo", icon: Calendar },
    { id: "corkboard", label: "Esquema de escenas", icon: Layers },
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
      {/* Cabecera Unificada Nivel 1 y Nivel 2 (UnderlineTabs) sin acciones en la fila superior */}
      <UnifiedSectionHeader
        icon={Calendar}
        title="Planeación"
        helpTitle="Planeación y Cronología"
        helpDescription="Estructura panorámica y temporal de tu novela. Alterna entre la Línea de Tiempo interactiva por planos temporales y el Esquema de Escenas para orquestar la trama con total libertad."
        helpShortcuts={[
          { keys: ["Ctrl", "F"], description: "Filtrar acontecimientos de la trama" },
          { keys: ["Alt", "E"], description: "Crear nuevo acontecimiento" },
        ]}
      >
        <UnderlineTabs
          tabs={planningTabs}
          activeTab={subView === "timeline" ? "timeline" : "corkboard"}
          onChange={(tabId) => setSubView(tabId as PlanningSubView)}
          layoutId="planning-subviews-tab"
          size="sm"
        />
      </UnifiedSectionHeader>

      {/* Renderizado de la sub-vista activa */}
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
