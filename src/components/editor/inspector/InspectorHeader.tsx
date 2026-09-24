import React from "react";
import { Sparkles, X } from "lucide-react";
import { Scene } from "../../../types";

interface InspectorHeaderProps {
  scene: Scene;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onClose: () => void;
}

export const InspectorHeader: React.FC<InspectorHeaderProps> = ({
  scene,
  onUpdateScene,
  onClose,
}) => {
  return (
    <div className="px-5 py-4 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: "var(--accent-subtle)",
            color: "var(--accent)",
          }}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <input
            type="text"
            value={scene.title}
            onChange={(e) => onUpdateScene(scene.id, { title: e.target.value })}
            placeholder="Título de la escena..."
            className="w-full text-sm font-bold tracking-tight bg-transparent focus:outline-none focus:bg-[var(--bg-surface-hover)] px-1.5 py-0.5 rounded-lg text-[var(--text-primary)] transition-colors truncate"
            title="Haz clic para renombrar la escena"
          />
          <p className="text-[11px] text-[var(--text-muted)] px-1.5 truncate">
            Inspector narrativo & dramático
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer shrink-0"
        title="Cerrar inspector (Ctrl+I)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

