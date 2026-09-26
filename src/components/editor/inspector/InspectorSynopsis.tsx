import React from "react";
import { BookOpen, StickyNote } from "lucide-react";
import { Scene } from "../../../types";

interface InspectorSynopsisProps {
  scene: Scene;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
}

export const InspectorSynopsis: React.FC<InspectorSynopsisProps> = ({
  scene,
  onUpdateScene,
}) => {
  return (
    <div className="space-y-4">
      {/* Sinopsis de la Escena */}
      <div
        className="p-3.5 rounded-xl space-y-2 transition-colors"
        style={{ backgroundColor: "var(--bg-editor)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <label className="text-xs font-semibold text-[var(--text-primary)]">
            Sinopsis Narrativa
          </label>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] leading-tight">
          Resumen argumental para indexar en el tablón de corcho y esquemas.
        </p>
        <textarea
          value={scene.synopsis || ""}
          onChange={(e) => onUpdateScene(scene.id, { synopsis: e.target.value })}
          placeholder="Escribe un resumen conciso de los sucesos principales..."
          rows={3}
          className="w-full p-2.5 rounded-lg text-xs leading-relaxed bg-[var(--bg-surface-hover)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none transition-all"
        />
      </div>

      {/* Notas Privadas del Autor */}
      <div
        className="p-3.5 rounded-xl space-y-2 transition-colors"
        style={{ backgroundColor: "var(--bg-editor)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <StickyNote className="w-3.5 h-3.5" />
          </div>
          <label className="text-xs font-semibold text-[var(--text-primary)]">
            Notas del Autor
          </label>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] leading-tight">
          Recordatorios privados, detalles a revisar y notas de ambientación.
        </p>
        <textarea
          value={scene.notes || ""}
          onChange={(e) => onUpdateScene(scene.id, { notes: e.target.value })}
          placeholder="Anotaciones personales, dudas o ideas para futuras revisiones..."
          rows={3}
          className="w-full p-2.5 rounded-lg text-xs leading-relaxed bg-[var(--bg-surface-hover)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none transition-all"
        />
      </div>
    </div>
  );
};

