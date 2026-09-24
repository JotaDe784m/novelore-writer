import React from "react";
import { Target, Swords, ArrowRightLeft } from "lucide-react";
import { Scene } from "../../../types";

interface InspectorTriadProps {
  scene: Scene;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
}

export const InspectorTriad: React.FC<InspectorTriadProps> = ({
  scene,
  onUpdateScene,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Triunvirato Dramático
        </span>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          Estructura de Escena
        </span>
      </div>

      {/* 1. Objetivo */}
      <div
        className="p-3.5 rounded-xl space-y-2 transition-colors"
        style={{ backgroundColor: "var(--bg-editor)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Target className="w-3.5 h-3.5" />
          </div>
          <label className="text-xs font-semibold text-[var(--text-primary)]">
            Objetivo del Protagonista
          </label>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] leading-tight">
          ¿Qué desea conseguir activamente el personaje principal aquí?
        </p>
        <textarea
          value={scene.goal || ""}
          onChange={(e) => onUpdateScene(scene.id, { goal: e.target.value })}
          placeholder="Meta concreta, visible o emocional que impulsa la escena..."
          rows={3}
          className="w-full p-2.5 rounded-lg text-xs leading-relaxed bg-[var(--bg-surface-hover)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none transition-all"
        />
      </div>

      {/* 2. Conflicto */}
      <div
        className="p-3.5 rounded-xl space-y-2 transition-colors"
        style={{ backgroundColor: "var(--bg-editor)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Swords className="w-3.5 h-3.5" />
          </div>
          <label className="text-xs font-semibold text-[var(--text-primary)]">
            Conflicto u Obstáculo
          </label>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] leading-tight">
          ¿Qué o quién se opone o eleva la tensión dramática?
        </p>
        <textarea
          value={scene.conflict || ""}
          onChange={(e) => onUpdateScene(scene.id, { conflict: e.target.value })}
          placeholder="Fuerzas antagónicas, dilemas morales, peligros o imprevistos..."
          rows={3}
          className="w-full p-2.5 rounded-lg text-xs leading-relaxed bg-[var(--bg-surface-hover)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none transition-all"
        />
      </div>

      {/* 3. Desenlace / Resultado */}
      <div
        className="p-3.5 rounded-xl space-y-2 transition-colors"
        style={{ backgroundColor: "var(--bg-editor)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
          <label className="text-xs font-semibold text-[var(--text-primary)]">
            Desenlace & Giro de Estado
          </label>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] leading-tight">
          ¿Cómo concluye la escena? («Sí, pero...» / «No, y además...»).
        </p>
        <textarea
          value={scene.outcome || ""}
          onChange={(e) => onUpdateScene(scene.id, { outcome: e.target.value })}
          placeholder="Consecuencias del clímax de la escena y cambio de rumbo..."
          rows={3}
          className="w-full p-2.5 rounded-lg text-xs leading-relaxed bg-[var(--bg-surface-hover)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none transition-all"
        />
      </div>
    </div>
  );
};

