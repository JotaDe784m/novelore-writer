import React from "react";
import { Target, ToggleLeft, ToggleRight } from "lucide-react";

interface NovelWordGoalsSectionProps {
  enableWordGoals: boolean;
  setEnableWordGoals: (val: boolean) => void;
  targetWords: number;
  setTargetWords: (val: number) => void;
}

const PRESET_GOALS = [30000, 50000, 80000, 100000, 120000];

export const NovelWordGoalsSection: React.FC<NovelWordGoalsSectionProps> = ({
  enableWordGoals,
  setEnableWordGoals,
  targetWords,
  setTargetWords,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]/60 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-bold font-novel-display text-[var(--text-main)]">
            Meta de Escritura
          </span>
        </div>

        {/* Conmutador Activar / Desactivar */}
        <button
          type="button"
          onClick={() => setEnableWordGoals(!enableWordGoals)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium transition-all cursor-pointer ${
            enableWordGoals
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
              : "bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          {enableWordGoals ? (
            <>
              <ToggleRight className="w-4 h-4" />
              <span>Meta Activa</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4" />
              <span>Modo Libre</span>
            </>
          )}
        </button>
      </div>

      {enableWordGoals && (
        <div className="pt-1 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="number"
              step={1000}
              min={1000}
              max={500000}
              value={targetWords}
              onChange={(e) => setTargetWords(parseInt(e.target.value) || 0)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-card)] font-mono text-xs font-bold text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-hidden"
              placeholder="50000"
            />
            <div className="flex items-center gap-1 shrink-0">
              {PRESET_GOALS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTargetWords(val)}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer ${
                    targetWords === val
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] font-bold"
                      : "border-[var(--border-color)]/60 bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {val / 1000}k
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
