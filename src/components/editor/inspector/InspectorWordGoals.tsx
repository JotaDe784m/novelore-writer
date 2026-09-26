import React from "react";
import { Target, Clock, Check } from "lucide-react";
import { Scene } from "../../../types";
import { countWords } from "../../../utils/formatters";

interface InspectorWordGoalsProps {
  scene: Scene;
  currentContent?: string;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
}

const PRESET_GOALS = [500, 1000, 1500, 2000, 2500];

export const InspectorWordGoals: React.FC<InspectorWordGoalsProps> = ({
  scene,
  currentContent,
  onUpdateScene,
}) => {
  const currentWords = countWords(currentContent !== undefined ? currentContent : scene.content || "");
  const targetWords = scene.targetWordCount || 0;
  const progressPercent = targetWords > 0 ? Math.min(100, Math.round((currentWords / targetWords) * 100)) : 0;
  const isGoalReached = targetWords > 0 && currentWords >= targetWords;
  const estimatedReadingMinutes = Math.max(1, Math.ceil(currentWords / 220));

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onUpdateScene(scene.id, { targetWordCount: isNaN(val) || val < 0 ? 0 : val });
  };

  const handleSelectPreset = (preset: number) => {
    onUpdateScene(scene.id, { targetWordCount: preset });
  };

  return (
    <div
      className="p-3.5 rounded-xl space-y-3 transition-colors"
      style={{ backgroundColor: "var(--bg-editor)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Target className="w-3.5 h-3.5" />
          </div>
          <label className="text-xs font-semibold text-[var(--text-primary)]">
            Meta de Palabras
          </label>
        </div>
        {isGoalReached && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Meta alcanzada
          </span>
        )}
      </div>

      {/* Números y Barra de Progreso */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-xs">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-sm text-[var(--text-primary)] font-mono">
              {currentWords.toLocaleString()}
            </span>
            <span className="text-[var(--text-muted)] text-[11px]">
              / {targetWords > 0 ? `${targetWords.toLocaleString()} palabras` : "Sin meta fija"}
            </span>
          </div>
          {targetWords > 0 && (
            <span className="text-[11px] font-mono font-semibold text-[var(--accent)]">
              {progressPercent}%
            </span>
          )}
        </div>

        {/* Barra de Progreso Visual */}
        <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface-hover)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: isGoalReached ? "var(--accent)" : "var(--accent)",
            }}
          />
        </div>
      </div>

      {/* Presets Rápidos y Campo Numérico */}
      <div className="pt-1 space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_GOALS.map((preset) => {
            const isSelected = targetWords === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                }`}
              >
                {preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            );
          })}

          <div className="flex-1 min-w-[70px]">
            <input
              type="number"
              min={0}
              step={100}
              value={targetWords || ""}
              onChange={handleTargetChange}
              placeholder="Personalizado"
              className="w-full px-2 py-0.5 text-[11px] font-mono rounded-md bg-[var(--bg-surface-hover)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-right"
              title="Ingresa una meta personalizada de palabras"
            />
          </div>
        </div>

        {/* Tiempo de Lectura Estimado */}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] pt-0.5">
          <Clock className="w-3 h-3" />
          <span>Tiempo de lectura: ~{estimatedReadingMinutes} min</span>
        </div>
      </div>
    </div>
  );
};
