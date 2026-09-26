import React from "react";
import { Lightbulb, PenTool, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { Scene, SceneStatus } from "../../../types";

interface InspectorStatusProps {
  scene: Scene;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
}

interface StatusConfig {
  id: SceneStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClasses: string;
}

const STATUSES: StatusConfig[] = [
  {
    id: "idea",
    label: "Idea",
    icon: Lightbulb,
    activeClasses: "bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold shadow-xs",
  },
  {
    id: "draft",
    label: "Borrador",
    icon: PenTool,
    activeClasses: "bg-blue-500/15 text-blue-700 dark:text-blue-300 font-semibold shadow-xs",
  },
  {
    id: "revised",
    label: "Revisión",
    icon: Search,
    activeClasses: "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold shadow-xs",
  },
  {
    id: "polished",
    label: "Pulido",
    icon: Sparkles,
    activeClasses: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs",
  },
  {
    id: "final",
    label: "Final",
    icon: CheckCircle2,
    activeClasses: "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs",
  },
];

export const InspectorStatus: React.FC<InspectorStatusProps> = ({
  scene,
  onUpdateScene,
}) => {
  const currentStatus = scene.status || "draft";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Estado de la Escena
        </span>
        <span className="text-[10px] text-[var(--text-muted)] font-mono capitalize">
          {STATUSES.find((s) => s.id === currentStatus)?.label || currentStatus}
        </span>
      </div>

      <div
        className="p-1 rounded-xl flex items-center gap-1 overflow-x-auto scrollbar-none"
        style={{ backgroundColor: "var(--bg-editor)" }}
      >
        {STATUSES.map((st) => {
          const Icon = st.icon;
          const isActive = currentStatus === st.id;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onUpdateScene(scene.id, { status: st.id })}
              className={`flex-1 min-w-[54px] py-1.5 px-2 rounded-lg text-[11px] flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? st.activeClasses
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              }`}
              title={`Estado: ${st.label}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] sm:text-[11px] truncate">{st.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
