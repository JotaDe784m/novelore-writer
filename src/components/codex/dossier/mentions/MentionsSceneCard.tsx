import React, { useState } from "react";
import { Hash, ChevronRight, ChevronDown, Quote, ExternalLink } from "lucide-react";
import { SceneMentionOccurrence } from "../../../../utils/mentionTypes";

export interface MentionsSceneCardProps {
  scene: SceneMentionOccurrence;
  onNavigateToScene?: (sceneId: string) => void;
}

export const MentionsSceneCard: React.FC<MentionsSceneCardProps> = ({
  scene,
  onNavigateToScene,
}) => {
  // Opción 2: Citas colapsadas por defecto para mantener la vista respirable y limpia
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const hasSnippets = Boolean(scene.snippets && scene.snippets.length > 0);
  const termKeys = Object.keys(scene.byTerm || {}).filter(
    (k) => (scene.byTerm[k] || 0) > 0
  );

  return (
    <div className="p-3 sm:p-3.5 rounded-2xl bg-[var(--bg-input)]/30 hover:bg-[var(--bg-input)]/50 transition-colors text-xs space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] truncate mb-0.5">
            <span>{scene.actTitle}</span>
            <span>›</span>
            <span>{scene.chapterTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
              {scene.sceneTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {/* Badge con total de menciones en la escena */}
          <span className="font-mono font-bold text-xs text-[var(--accent)] px-2.5 py-0.5 rounded-xl bg-[var(--accent-subtle)] flex items-center gap-1">
            <Hash className="w-3 h-3 opacity-60" />
            <span>{scene.count}</span>
          </span>

          {/* Botón de salto directo al editor */}
          {onNavigateToScene && (
            <button
              type="button"
              onClick={() => onNavigateToScene(scene.sceneId)}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer group flex items-center gap-1"
              title="Abrir esta escena en el editor"
            >
              <span className="hidden sm:inline text-[11px] font-medium text-[var(--text-muted)] group-hover:text-[var(--accent)]">
                Ir a escena
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Términos y apodos presentes en esta escena */}
      {termKeys.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {termKeys.map((term) => (
            <span
              key={term}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]"
            >
              {term}: <strong className="font-semibold text-[var(--text-primary)]">{scene.byTerm[term]}</strong>
            </span>
          ))}
        </div>
      )}

      {/* Selector de Citas (Colapsadas por defecto) */}
      {hasSnippets && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsSnippetsOpen(!isSnippetsOpen)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <Quote className="w-3 h-3 opacity-70" />
            <span>
              {isSnippetsOpen
                ? "Ocultar citas del texto"
                : `Ver citas en el texto (${scene.snippets.length})`}
            </span>
            {isSnippetsOpen ? (
              <ChevronDown className="w-3 h-3 opacity-60" />
            ) : (
              <ChevronRight className="w-3 h-3 opacity-60" />
            )}
          </button>

          {isSnippetsOpen && (
            <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-[var(--accent)]/40 text-[11px] text-[var(--text-secondary)]">
              {scene.snippets.map((snip, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-[var(--bg-card)]/70 leading-relaxed font-serif italic text-[11.5px]"
                >
                  <span className="text-[var(--text-muted)]">«...</span>
                  <span>{snip.before}</span>
                  <mark className="bg-[var(--accent)]/20 text-[var(--accent)] font-semibold not-italic px-1 py-0.5 rounded-md mx-0.5">
                    {snip.match}
                  </mark>
                  <span>{snip.after}</span>
                  <span className="text-[var(--text-muted)]">...»</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
