import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";
import { NovelProject, StoryBeat } from "../../types";

interface StoryArcViewProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onSelectScene: (sceneId: string) => void;
}

export const StoryArcView: React.FC<StoryArcViewProps> = ({
  project,
  onUpdateProject,
  onSelectScene,
}) => {
  const [activeTemplate, setActiveTemplate] = useState<
    "three_act" | "save_the_cat" | "heros_journey"
  >("three_act");

  const allScenes = project.acts.flatMap((a) =>
    a.chapters.flatMap((c) => c.scenes)
  );

  const threeActBeats: StoryBeat[] = [
    {
      id: "beat-3act-1",
      name: "1. Mundo Ordinario & Planteamiento",
      structure: "three_act",
      percentage: 5,
      description:
        "Presenta al protagonista en su entorno habitual, sus carencias internas y el statu quo antes de la ruptura.",
    },
    {
      id: "beat-3act-2",
      name: "2. Incidente Incitador (El Detonante)",
      structure: "three_act",
      percentage: 12,
      description:
        "El acontecimiento que altera el equilibrio del protagonista y le plantea el problema central.",
    },
    {
      id: "beat-3act-3",
      name: "3. Primer Punto de Giro (Cruce del Umbral)",
      structure: "three_act",
      percentage: 25,
      description:
        "El protagonista toma una decisión irreversible y entra de lleno en el nuevo mundo o conflicto del Acto II.",
    },
    {
      id: "beat-3act-4",
      name: "4. Punto Medio (Midpoint / Gran Revelación)",
      structure: "three_act",
      percentage: 50,
      description:
        "Giro crucial que eleva las apuestas; el protagonista pasa de ser reactivo a proactivo. Falsa victoria o falsa derrota.",
    },
    {
      id: "beat-3act-5",
      name: "5. Noche Oscura del Alma / Todo está perdido",
      structure: "three_act",
      percentage: 75,
      description:
        "El momento de mayor desesperación donde el plan inicial fracasa y el protagonista debe superar su mayor defecto interior.",
    },
    {
      id: "beat-3act-6",
      name: "6. Clímax & Enfrentamiento Final",
      structure: "three_act",
      percentage: 90,
      description:
        "La confrontación decisiva donde se resuelve el conflicto principal y el protagonista demuestra su transformación.",
    },
    {
      id: "beat-3act-7",
      name: "7. Resolución & Nuevo Statu Quo",
      structure: "three_act",
      percentage: 98,
      description:
        "Las consecuencias finales, el cierre de subtramas y el nuevo equilibrio del mundo.",
    },
  ];

  const currentBeats = project.storyBeats.length > 0 ? project.storyBeats : threeActBeats;

  const assignSceneToBeat = (beatId: string, sceneId: string) => {
    onUpdateProject((p) => {
      const existingBeats = p.storyBeats.length > 0 ? p.storyBeats : threeActBeats;
      const updated = existingBeats.map((b) =>
        b.id === beatId ? { ...b, assignedSceneId: sceneId || undefined } : b
      );
      return { ...p, storyBeats: updated };
    });
  };

  return (
    <div
      id="story-arc-view"
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div>
          <h2 className="text-base font-bold font-novel-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
            <span>Plantillas de Estructura Narrativa (Story Beats)</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Alinea tus capítulos y escenas con los hitos estructurales clásicos del ritmo dramático.
          </p>
        </div>
      </div>

      {/* Beats timeline list */}
      <div
        id="story-arc-canvas-scroll"
        className="flex-1 min-h-0 overflow-y-scroll p-6 space-y-6 max-w-4xl mx-auto w-full custom-scroll always-scroll"
        style={{
          overflowY: "scroll",
          scrollbarGutter: "stable",
        }}
      >
        {/* Tension Arc Indicator */}
        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold font-novel-display">
            <span>Curva de Tensión Dramática</span>
            <span className="text-[var(--accent)] font-mono">
              {currentBeats.filter((b) => b.assignedSceneId).length} / {currentBeats.length} hitos cubiertos
            </span>
          </div>

          <div className="h-3 bg-[var(--bg-input)] rounded-full overflow-hidden flex border border-[var(--border-color)]">
            <div className="h-full bg-blue-500/80 w-[25%]" title="Acto I (0 - 25%)" />
            <div className="h-full bg-amber-500/80 w-[50%]" title="Acto II (25 - 75%)" />
            <div className="h-full bg-red-500/80 w-[25%]" title="Acto III (75 - 100%)" />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
            <span>Acto I: Planteamiento (25%)</span>
            <span>Acto II: Confrontación (50%)</span>
            <span>Acto III: Resolución (25%)</span>
          </div>
        </div>

        {/* Beats Accordion/List */}
        <div className="space-y-4">
          {currentBeats.map((beat, idx) => {
            const assignedScene = allScenes.find((s) => s.id === beat.assignedSceneId);

            return (
              <div
                key={beat.id || idx}
                className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-sm font-novel-display text-[var(--text-main)]">
                      {beat.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)]">
                      Posición meta: ~{beat.percentage}%
                    </span>

                    {assignedScene ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Asignado</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-8">
                  {beat.description}
                </p>

                {/* Scene Assignment Row */}
                <div className="flex flex-wrap items-center gap-2 pl-8 pt-2 border-t border-[var(--border-color)]/60 text-xs">
                  <span className="font-semibold text-[var(--text-main)]">
                    Escena asignada:
                  </span>
                  <select
                    value={beat.assignedSceneId || ""}
                    onChange={(e) => assignSceneToBeat(beat.id, e.target.value)}
                    className="p-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-xs focus:outline-none focus:border-[var(--accent)] max-w-xs"
                  >
                    <option value="">(Ninguna escena asignada)</option>
                    {allScenes.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.title} ({(sc.wordCount || 0).toLocaleString()} pal.)
                      </option>
                    ))}
                  </select>

                  {assignedScene && (
                    <button
                      onClick={() => onSelectScene(assignedScene.id)}
                      className="flex items-center gap-1 text-[var(--accent)] font-semibold hover:underline ml-auto text-xs"
                    >
                      <span>Ir a Escribir</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
