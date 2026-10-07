import React, { useState } from "react";
import { Plus, Trash2, BookOpen, Feather } from "lucide-react";
import { NovelProject, TimelineLinkedManuscriptItem } from "../../../../types";

interface EventManuscriptLinksSectionProps {
  linkedManuscriptItems: TimelineLinkedManuscriptItem[];
  onUpdateLinkedManuscriptItems?: (items: TimelineLinkedManuscriptItem[]) => void;
  project: NovelProject;
  onSelectScene?: (sceneId: string) => void;
}

export const EventManuscriptLinksSection: React.FC<EventManuscriptLinksSectionProps> = ({
  linkedManuscriptItems,
  onUpdateLinkedManuscriptItems,
  project,
  onSelectScene,
}) => {
  const [writingViewMode, setWritingViewMode] = useState<"compact" | "full">("compact");
  const [isAddingManuscript, setIsAddingManuscript] = useState(false);

  const handleAddManuscriptItem = (type: "act" | "chapter" | "scene", id: string) => {
    if (!onUpdateLinkedManuscriptItems) return;
    if (linkedManuscriptItems.some((i) => i.type === type && i.id === id)) return;
    onUpdateLinkedManuscriptItems([...linkedManuscriptItems, { type, id }]);
    setIsAddingManuscript(false);
  };

  const handleRemoveManuscriptItem = (index: number) => {
    if (!onUpdateLinkedManuscriptItems) return;
    const next = [...linkedManuscriptItems];
    next.splice(index, 1);
    onUpdateLinkedManuscriptItems(next);
  };

  const resolveManuscriptItemMeta = (item: TimelineLinkedManuscriptItem) => {
    for (const act of project.acts || []) {
      if (item.type === "act" && act.id === item.id) {
        const firstSceneId = act.chapters?.[0]?.scenes?.[0]?.id;
        return { title: act.title, typeLabel: "Acto", jumpSceneId: firstSceneId, count: `${act.chapters?.length || 0} capítulos` };
      }
      for (const chap of act.chapters || []) {
        if (item.type === "chapter" && chap.id === item.id) {
          const firstSceneId = chap.scenes?.[0]?.id;
          return { title: chap.title, typeLabel: "Capítulo", jumpSceneId: firstSceneId, count: `${chap.scenes?.length || 0} escenas` };
        }
        for (const scene of chap.scenes || []) {
          if (item.type === "scene" && scene.id === item.id) {
            return { title: scene.title, typeLabel: "Escena", jumpSceneId: scene.id, count: `En ${chap.title}` };
          }
        }
      }
    }
    return { title: "Elemento no encontrado", typeLabel: item.type, jumpSceneId: undefined, count: "" };
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)]/45 border border-[var(--border-color)]/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-color)]/50 shrink-0">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold font-novel-display text-sm text-[var(--text-main)]">
              Escenas y Capítulos Vinculados
            </h4>
            <p className="text-[11px] text-[var(--text-muted)]">
              Puntos de correspondencia narrativa directa en el manuscrito.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-color)]/60 text-[10px]">
            <button
              type="button"
              onClick={() => setWritingViewMode("compact")}
              className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                writingViewMode === "compact"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              Compacta
            </button>
            <button
              type="button"
              onClick={() => setWritingViewMode("full")}
              className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                writingViewMode === "full"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              Completa
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingManuscript(!isAddingManuscript)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-medium cursor-pointer shadow-2xs hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Vincular Manuscrito</span>
          </button>
        </div>
      </div>

      {isAddingManuscript && (
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2">
          <span className="text-xs font-semibold text-[var(--text-muted)] block">
            Selecciona un Acto, Capítulo o Escena:
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1 text-xs custom-scroll">
            {(project.acts || []).map((act) => (
              <div key={act.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleAddManuscriptItem("act", act.id)}
                  className="w-full text-left px-2.5 py-1 rounded-md bg-[var(--accent-subtle)]/40 hover:bg-[var(--accent-subtle)] font-bold text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span>{act.title} (Acto Completo)</span>
                  <span className="text-[10px] text-[var(--accent)]">+ Acto</span>
                </button>
                {(act.chapters || []).map((chap) => (
                  <div key={chap.id} className="pl-3 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleAddManuscriptItem("chapter", chap.id)}
                      className="w-full text-left px-2 py-1 rounded-md hover:bg-[var(--bg-main)] font-semibold text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                    >
                      <span>{chap.title} (Capítulo)</span>
                      <span className="text-[10px] text-[var(--accent)]">+ Capítulo</span>
                    </button>
                    {(chap.scenes || []).map((sc) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => handleAddManuscriptItem("scene", sc.id)}
                        className="w-full text-left pl-3 pr-2 py-0.5 rounded-md hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                      >
                        <span>{sc.title}</span>
                        <span className="text-[9px] text-[var(--accent)]">+ Escena</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {linkedManuscriptItems.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] italic text-center py-3">
          No hay actos, capítulos ni escenas vinculados a este acontecimiento.
        </p>
      ) : (
        <div
          className={`grid gap-2.5 ${
            writingViewMode === "full" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {linkedManuscriptItems.map((item, idx) => {
            const meta = resolveManuscriptItemMeta(item);
            return (
              <div
                key={`${item.type}-${item.id}-${idx}`}
                className={`rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]/70 flex items-center justify-between p-3 transition-all hover:border-[var(--accent)] shadow-2xs ${
                  writingViewMode === "full" ? "flex-col items-start gap-2.5" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0">
                    <Feather className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--accent)]">
                      <span>{meta.typeLabel}</span>
                      <span className="text-[var(--text-muted)]">•</span>
                      <span className="text-[var(--text-muted)] font-normal">{meta.count}</span>
                    </div>
                    <h5 className="font-bold text-xs text-[var(--text-main)] truncate font-novel-display">
                      {meta.title}
                    </h5>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  {meta.jumpSceneId && onSelectScene && (
                    <button
                      type="button"
                      onClick={() => onSelectScene(meta.jumpSceneId!)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Ir al Manuscrito</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveManuscriptItem(idx)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Desvincular"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

