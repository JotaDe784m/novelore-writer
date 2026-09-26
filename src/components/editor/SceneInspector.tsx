import React from "react";
import { Scene, NovelProject } from "../../types";
import { useManuscriptStore } from "../../stores/useManuscriptStore";
import { useInspectorResize } from "./inspector/useInspectorResize";
import { InspectorHeader } from "./inspector/InspectorHeader";
import { InspectorStatus } from "./inspector/InspectorStatus";
import { InspectorWordGoals } from "./inspector/InspectorWordGoals";
import { InspectorSynopsis } from "./inspector/InspectorSynopsis";
import { InspectorEntities } from "./inspector/InspectorEntities";
import { InspectorSceneNotes } from "./inspector/InspectorSceneNotes";

export interface SceneInspectorProps {
  scene: Scene;
  project: NovelProject;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onClose: () => void;
  onOpenEntityDossier?: (entityId: string) => void;
  onCreateCharacter?: () => void;
  onOpenWordGoals?: () => void;
  onCreateEntity?: (category: "event" | "character" | "location" | "faction" | "item") => void;
  onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
}

export const SceneInspector: React.FC<SceneInspectorProps> = ({
  scene,
  project,
  onUpdateScene,
  onClose,
  onOpenEntityDossier,
}) => {
  const { inspectorWidth, isResizing, setIsResizing } = useInspectorResize();

  // Si la escena activa en el editor es la misma que la inspeccionada, usar el contenido en vivo
  const storeSelectedSceneId = useManuscriptStore((s) => s.selectedSceneId);
  const activeSceneContent = useManuscriptStore((s) => s.activeSceneContent);
  const liveContent = storeSelectedSceneId === scene.id ? activeSceneContent : scene.content;

  return (
    <aside
      id="scene-inspector"
      style={{
        width: `${inspectorWidth}px`,
        backgroundColor: "var(--bg-sidebar)",
      }}
      className="relative h-full flex flex-col shrink-0 select-none z-10 transition-colors"
    >
      {/* Manija de redimensionamiento en el borde izquierdo */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        title="Arrastra para redimensionar el inspector"
        className="absolute top-0 left-0 w-2 h-full cursor-col-resize z-20 flex items-center justify-start group select-none"
      >
        <div
          className={`w-0.5 h-full transition-colors ${
            isResizing ? "bg-[var(--accent)]" : "bg-transparent group-hover:bg-[var(--accent)]/40"
          }`}
        />
      </div>

      {/* Cabecera del Inspector */}
      <InspectorHeader
        scene={scene}
        onUpdateScene={onUpdateScene}
        onClose={onClose}
      />

      {/* Cuerpo Desplazable del Inspector: Jerarquía Reorganizada */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4 custom-scroll">
        {/* 1. Estado de la Escena (Idea, Borrador, Revisión, Pulido, Final) */}
        <InspectorStatus
          scene={scene}
          onUpdateScene={onUpdateScene}
        />

        {/* 2. Metas Individuales de Palabras y Progreso */}
        <InspectorWordGoals
          scene={scene}
          currentContent={liveContent}
          onUpdateScene={onUpdateScene}
        />

        {/* 3. Sinopsis Narrativa Compacta (justo debajo de la meta de palabras) */}
        <InspectorSynopsis
          scene={scene}
          onUpdateScene={onUpdateScene}
        />

        {/* 4. Contexto POV (Omnisciente, Coral, Personajes) & Ubicación */}
        <InspectorEntities
          scene={scene}
          project={project}
          onUpdateScene={onUpdateScene}
          onOpenEntityDossier={onOpenEntityDossier}
        />

        {/* 5. Notas de la Escena (Tarjetas editables, plantillas y modo libre) */}
        <InspectorSceneNotes
          scene={scene}
          onUpdateScene={onUpdateScene}
        />
      </div>
    </aside>
  );
};
