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
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const hasSnippets = Boolean(scene.snippets && scene.snippets.length > 0);
  const termKeys = Object.keys(scene.byTerm || {}).filter(
    (k) => (scene.byTerm[k] || 0) > 0
  );

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]/50 hover:border-[var(--accent)]/40 transition-all text-xs space-y-2.5 shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-sans text-[11px] text-[var(--text-muted)] truncate mb-0.5">
            <span>{scene.actTitle}</span>
            <span>›</span>
            <span>{scene.chapterTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold font-novel-display text-sm text-[var(--text-main)] truncate">
              {scene.sceneTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {/* Badge con total de menciones en la escena */}
          <span className="font-sans font-bold text-xs text-[var(--accent)] px-2.5 py-0.5 rounded-full bg-[var(--accent-subtle)] flex items-center gap-1 border border-[var(--accent)]/30">
            <Hash className="w-3 h-3 opacity-70" />
            <span>{scene.count}</span>
          </span>

          {/* Botón de salto directo al editor */}
          {onNavigateToScene && (
            <button
              type="button"
              onClick={() => onNavigateToScene(scene.sceneId)}
              className="px-2.5 py-1 rounded-full text-xs font-sans text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)]/40 transition-colors cursor-pointer group flex items-center gap-1"
              title="Abrir esta escena en el editor"
            >
              <span className="hidden sm:inline text-[11px] font-medium">
                Ir a escena
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)]" />
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
              className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)]/30"
            >
              {term}: <strong className="font-semibold text-[var(--text-main)]">{scene.byTerm[term]}</strong>
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
            className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <Quote className="w-3 h-3 opacity-70 text-[var(--accent)]" />
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
            <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-[var(--accent)]/40 text-[11px] text-[var(--text-muted)]">
              {scene.snippets.map((snip, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[var(--bg-input)]/45 leading-relaxed font-novel-serif italic text-xs border border-[var(--border-color)]/30"
                >
                  <span className="text-[var(--text-muted)]">«...</span>
                  <span className="text-[var(--text-main)]">{snip.before}</span>
                  <mark className="bg-[var(--accent)]/20 text-[var(--accent)] font-semibold not-italic px-1 py-0.5 rounded-md mx-0.5">
                    {snip.match}
                  </mark>
                  <span className="text-[var(--text-main)]">{snip.after}</span>
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
