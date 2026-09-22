import React, { useState } from "react";
import {
  Target,
  Check,
  X,
  Sparkles,
  Layers,
  Folder,
  FileText,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { NovelProject } from "../../types";

interface WordGoalsModalProps {
  project: NovelProject;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
}

export const WordGoalsModal: React.FC<WordGoalsModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
}) => {
  if (!isOpen) return null;

  const [enableGoals, setEnableGoals] = useState<boolean>(
    project.settings.enableWordGoals !== false
  );
  const [totalGoal, setTotalGoal] = useState<number>(
    project.settings.targetTotalWords || 50000
  );
  const [defaultActGoal, setDefaultActGoal] = useState<number>(
    project.settings.defaultActWordGoal || 15000
  );
  const [defaultChapGoal, setDefaultChapGoal] = useState<number>(
    project.settings.defaultChapterWordGoal || 3000
  );
  const [defaultSceneGoal, setDefaultSceneGoal] = useState<number>(
    project.settings.defaultSceneWordGoal || 1500
  );

  // Granular act, chapter and scene overrides
  const [actGoals, setActGoals] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    project.acts.forEach((a) => {
      map[a.id] = a.targetWordCount || defaultActGoal;
    });
    return map;
  });

  const [chapterGoals, setChapterGoals] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    project.acts.forEach((a) => {
      a.chapters.forEach((c) => {
        map[c.id] = c.targetWordCount || defaultChapGoal;
      });
    });
    return map;
  });

  const [sceneGoals, setSceneGoals] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    project.acts.forEach((a) => {
      a.chapters.forEach((c) => {
        c.scenes.forEach((s) => {
          map[s.id] = s.targetWordCount || defaultSceneGoal;
        });
      });
    });
    return map;
  });

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const toggleExpandChapter = (chapId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapId]: !prev[chapId],
    }));
  };

  const handleSave = () => {
    onUpdateProject((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        enableWordGoals: enableGoals,
        targetTotalWords: totalGoal,
        defaultActWordGoal: defaultActGoal,
        defaultChapterWordGoal: defaultChapGoal,
        defaultSceneWordGoal: defaultSceneGoal,
      },
      acts: prev.acts.map((act) => ({
        ...act,
        targetWordCount: actGoals[act.id] ?? defaultActGoal,
        chapters: act.chapters.map((chap) => ({
          ...chap,
          targetWordCount: chapterGoals[chap.id] ?? defaultChapGoal,
          scenes: chap.scenes.map((sc) => ({
            ...sc,
            targetWordCount: sceneGoals[sc.id] ?? defaultSceneGoal,
          })),
        })),
      })),
    }));
    onClose();
  };

  const handleApplyDefaultsToAll = () => {
    const newActMap: Record<string, number> = {};
    const newChapMap: Record<string, number> = {};
    const newSceneMap: Record<string, number> = {};
    project.acts.forEach((a) => {
      newActMap[a.id] = defaultActGoal;
      a.chapters.forEach((c) => {
        newChapMap[c.id] = defaultChapGoal;
        c.scenes.forEach((s) => {
          newSceneMap[s.id] = defaultSceneGoal;
        });
      });
    });
    setActGoals(newActMap);
    setChapterGoals(newChapMap);
    setSceneGoals(newSceneMap);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div
        className="w-full max-w-3xl rounded-3xl shadow-2xl border p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
          color: "var(--text-main)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-novel-display">
                Metas y Objetivos de Escritura
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Personaliza las metas de palabras para la obra completa, arcos, capítulos y escenas individuales.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Toggle: Enable / Disable Word Goals */}
        <div
          onClick={() => setEnableGoals(!enableGoals)}
          className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            enableGoals
              ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--text-main)]"
              : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)] opacity-85"
          }`}
        >
          <div className="flex items-center gap-3">
            {enableGoals ? (
              <ToggleRight className="w-8 h-8 text-[var(--accent)] shrink-0" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-[var(--text-muted)] shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm text-[var(--text-main)]">
                {enableGoals ? "Metas de Escritura Habilitadas" : "Metas de Escritura Deshabilitadas"}
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {enableGoals
                  ? "Se mostrarán barras de progreso, metas por escena y métricas en el editor."
                  : "Modo libre: las barras de progreso y metas estarán ocultas para escribir sin presión métrica."}
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${
              enableGoals
                ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                : "bg-black/10 dark:bg-white/10 text-[var(--text-muted)]"
            }`}
          >
            {enableGoals ? "Activo" : "Inactivo"}
          </span>
        </div>

        {enableGoals && (
          <div className="space-y-5 animate-in fade-in">
            {/* Total Novel Target */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Meta Total de la Novela (Palabras)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1000"
                  min="1000"
                  max="500000"
                  value={totalGoal}
                  onChange={(e) => setTotalGoal(parseInt(e.target.value, 10) || 0)}
                  className="flex-1 p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] font-mono text-sm font-bold text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-hidden"
                />
                <div className="flex items-center gap-1">
                  {[30000, 50000, 80000, 100000, 120000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTotalGoal(val)}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                        totalGoal === val
                          ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] font-bold"
                          : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      }`}
                    >
                      {val / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Standard Defaults for Acts, Chapters, Scenes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]/50">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                  Meta por Arco / Acto
                </label>
                <input
                  type="number"
                  step="500"
                  value={defaultActGoal}
                  onChange={(e) => setDefaultActGoal(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] font-mono text-xs text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                  Meta por Capítulo
                </label>
                <input
                  type="number"
                  step="250"
                  value={defaultChapGoal}
                  onChange={(e) => setDefaultChapGoal(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] font-mono text-xs text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                  Meta por Escena
                </label>
                <input
                  type="number"
                  step="100"
                  value={defaultSceneGoal}
                  onChange={(e) => setDefaultSceneGoal(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] font-mono text-xs text-[var(--text-main)]"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyDefaultsToAll}
                  className="text-[11px] text-[var(--accent)] hover:underline font-medium"
                >
                  Aplicar estos valores a todos los arcos y capítulos actuales
                </button>
              </div>
            </div>

            {/* Granular Breakdown by Act and Chapter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Metas Individuales por Arco y Capítulo
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {project.acts.map((act, actIdx) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--text-main)] truncate">
                        <Layers className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                        <span className="truncate">{act.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-[var(--text-muted)]">Meta Arco:</span>
                        <input
                          type="number"
                          step="500"
                          value={actGoals[act.id] ?? defaultActGoal}
                          onChange={(e) =>
                            setActGoals({
                              ...actGoals,
                              [act.id]: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="w-20 p-1 text-right rounded border border-[var(--border-color)] bg-[var(--bg-input)] font-mono text-xs text-[var(--text-main)]"
                        />
                        <span className="text-[10px] text-[var(--text-muted)]">pal.</span>
                      </div>
                    </div>

                    {/* Chapters */}
                    <div className="pl-3 sm:pl-4 space-y-2 border-l-2 border-[var(--border-color)] ml-2">
                      {act.chapters.map((chap) => {
                        const isExpanded = !!expandedChapters[chap.id];
                        return (
                          <div
                            key={chap.id}
                            className="rounded-lg bg-[var(--bg-input)]/40 p-2 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => toggleExpandChapter(chap.id)}
                                className="flex items-center gap-1.5 text-[var(--text-main)] hover:text-[var(--accent)] font-medium truncate text-left cursor-pointer"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                                )}
                                <Folder className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 opacity-80" />
                                <span className="truncate">{chap.title}</span>
                                <span className="text-[10px] text-[var(--text-muted)] font-normal">
                                  ({chap.scenes.length} esc.)
                                </span>
                              </button>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-[var(--text-muted)]">Cap:</span>
                                <input
                                  type="number"
                                  step="200"
                                  value={chapterGoals[chap.id] ?? defaultChapGoal}
                                  onChange={(e) =>
                                    setChapterGoals({
                                      ...chapterGoals,
                                      [chap.id]: parseInt(e.target.value, 10) || 0,
                                    })
                                  }
                                  className="w-20 p-1 text-right rounded border border-[var(--border-color)] bg-[var(--bg-card)] font-mono text-xs text-[var(--text-main)]"
                                />
                                <span className="text-[10px] text-[var(--text-muted)]">pal.</span>
                              </div>
                            </div>

                            {/* Collapsible Scenes */}
                            {isExpanded && chap.scenes.length > 0 && (
                              <div className="pl-4 sm:pl-5 space-y-1.5 border-l border-[var(--border-color)]/80 ml-2 pt-1">
                                {chap.scenes.map((scene) => (
                                  <div
                                    key={scene.id}
                                    className="flex items-center justify-between gap-2 text-[11px]"
                                  >
                                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] truncate">
                                      <FileText className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                      <span className="truncate">{scene.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-[9px] text-[var(--text-muted)]">Esc:</span>
                                      <input
                                        type="number"
                                        step="100"
                                        value={sceneGoals[scene.id] ?? defaultSceneGoal}
                                        onChange={(e) =>
                                          setSceneGoals({
                                            ...sceneGoals,
                                            [scene.id]: parseInt(e.target.value, 10) || 0,
                                          })
                                        }
                                        className="w-18 p-0.5 px-1 text-right rounded border border-[var(--border-color)] bg-[var(--bg-card)] font-mono text-[11px] text-[var(--text-main)]"
                                      />
                                      <span className="text-[9px] text-[var(--text-muted)]">pal.</span>
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
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Guardar Configuración de Metas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
