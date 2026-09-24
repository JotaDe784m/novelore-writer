import React from "react";
import { Clock } from "lucide-react";

interface EditorFooterProps {
  wordCount: number;
  charCount: number;
  readingTime: number;
  targetWords: number;
  progressPercent: number;
  enableWordGoals: boolean;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({
  wordCount,
  charCount,
  readingTime,
  targetWords,
  progressPercent,
  enableWordGoals,
}) => {
  return (
    <footer
      id="editor-footer"
      className="h-9 px-4 sm:px-6 flex items-center justify-between shrink-0 text-xs text-[var(--text-muted)] select-none font-mono border-t border-[var(--border-subtle)]"
      style={{
        backgroundColor: "var(--bg-sidebar)",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[var(--text-primary)]">{wordCount}</span>
          <span>palabras</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <span>{charCount} caracteres</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>~{readingTime} min de lectura</span>
        </div>
      </div>

      {/* Scene goal progress bar */}
      {enableWordGoals ? (
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Meta:</span>
          <span className="font-semibold text-[var(--text-primary)]">
            {wordCount} / {targetWords}
          </span>
          <div className="w-20 sm:w-28 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-[var(--text-muted)] opacity-80">
          Escritura libre (Metas desactivadas)
        </div>
      )}
    </footer>
  );
};

