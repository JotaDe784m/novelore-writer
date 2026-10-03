import React, { useState } from "react";
import { ChevronDown, ChevronRight, Layers, BookMarked } from "lucide-react";
import { ActMentionStats } from "../../../../utils/mentionTypes";
import { MentionsSceneCard } from "./MentionsSceneCard";

export interface MentionsActBreakdownProps {
  acts: ActMentionStats[];
  totalMentions: number;
  onNavigateToScene?: (sceneId: string) => void;
}

export const MentionsActBreakdown: React.FC<MentionsActBreakdownProps> = ({
  acts,
  totalMentions,
  onNavigateToScene,
}) => {
  // Estado para expandir/colapsar actos individuales (por defecto los actos con menciones están abiertos)
  const [openActs, setOpenActs] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const a of acts) {
      initial[a.actId] = true;
    }
    return initial;
  });

  const toggleAct = (actId: string) => {
    setOpenActs((prev) => ({ ...prev, [actId]: !prev[actId] }));
  };

  return (
    <div className="space-y-4">
      {/* 1. Barra de distribución narrativa del ritmo por actos */}
      {totalMentions > 0 && acts.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[var(--bg-input)]/25 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
            <span>Distribución de presencia por Actos</span>
            <span>{totalMentions} menciones en total</span>
          </div>

          <div className="h-3 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden flex">
            {acts.map((act, index) => {
              const colors = [
                "bg-[var(--accent)]",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-violet-500",
                "bg-rose-500",
              ];
              const segmentColor = colors[index % colors.length];
              return (
                <div
                  key={act.actId}
                  style={{ width: `${act.percentage}%` }}
                  title={`${act.actTitle}: ${act.totalCount} menciones (${act.percentage}%)`}
                  className={`${segmentColor} h-full transition-all duration-300 opacity-80 hover:opacity-100`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
            {acts.map((act, index) => {
              const dotColors = [
                "bg-[var(--accent)]",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-violet-500",
                "bg-rose-500",
              ];
              return (
                <div key={act.actId} className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <span className={`w-2 h-2 rounded-full ${dotColors[index % dotColors.length]}`} />
                  <span className="font-medium truncate max-w-[140px]">{act.actTitle}</span>
                  <span className="text-[var(--text-muted)] font-mono">({act.percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Acordeón de Actos y Capítulos */}
      <div className="space-y-3">
        {acts.map((act) => {
          const isOpen = openActs[act.actId] ?? true;
          return (
            <div
              key={act.actId}
              className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]/50 overflow-hidden transition-all shadow-2xs"
            >
              {/* Cabecera del Acto */}
              <button
                type="button"
                onClick={() => toggleAct(act.actId)}
                className="w-full p-3 sm:p-3.5 flex items-center justify-between hover:bg-[var(--bg-surface-hover)] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  )}
                  <Layers className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span className="font-bold font-novel-display text-xs sm:text-sm text-[var(--text-main)] truncate">
                    {act.actTitle}
                  </span>
                  <span className="text-[11px] font-sans text-[var(--text-muted)] shrink-0">
                    ({act.chapters.length} {act.chapters.length === 1 ? "capítulo" : "capítulos"})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-sans font-bold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30">
                    {act.totalCount} {act.totalCount === 1 ? "mención" : "menciones"}
                  </span>
                </div>
              </button>

              {/* Contenido expandible del Acto: Capítulos y Escenas */}
              {isOpen && (
                <div className="p-3 sm:p-4 pt-1 space-y-4">
                  {act.chapters.map((chap) => (
                    <div key={chap.chapterId} className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-novel-serif font-semibold px-1">
                        <BookMarked className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span className="text-[var(--text-main)]">{chap.chapterTitle}</span>
                        <span className="text-[11px] font-sans text-[var(--text-muted)] font-normal">
                          ({chap.scenes.length} {chap.scenes.length === 1 ? "escena" : "escenas"})
                        </span>
                      </div>

                      <div className="space-y-2 pl-2">
                        {chap.scenes.map((scene) => (
                          <MentionsSceneCard
                            key={scene.sceneId}
                            scene={scene}
                            onNavigateToScene={onNavigateToScene}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
