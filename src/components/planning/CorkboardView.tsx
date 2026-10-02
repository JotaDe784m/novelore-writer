import React, { useState } from "react";
import { Plus, User, Layers, ArrowRight, Filter } from "lucide-react";
import { NovelProject, Scene, SceneStatus } from "../../types";

interface CorkboardViewProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onSelectScene: (sceneId: string) => void;
}

const STATUS_LABELS: Record<SceneStatus, { label: string; badgeClass: string }> = {
  idea: { label: "Idea", badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
  draft: { label: "Borrador", badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  revised: { label: "Revisado", badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  polished: { label: "Pulido", badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  final: { label: "Final", badgeClass: "bg-teal-500/15 text-teal-600 dark:text-teal-400" },
};

export const CorkboardView: React.FC<CorkboardViewProps> = ({
  project,
  onUpdateProject,
  onSelectScene,
}) => {
  const [selectedActId, setSelectedActId] = useState<string>("all");

  const addSceneToChapter = (actId: string, chapterId: string) => {
    const act = project.acts.find((a) => a.id === actId);
    const chap = act?.chapters.find((c) => c.id === chapterId);
    if (!chap) return;

    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      chapterId,
      title: `Escena ${chap.scenes.length + 1}`,
      content: "",
      synopsis: "Sinopsis de la tarjeta...",
      notes: "",
      status: "draft",
      characterIds: [],
      goal: "",
      conflict: "",
      outcome: "",
      targetWordCount: 1500,
      wordCount: 0,
      order: chap.scenes.length + 1,
    };

    onUpdateProject((p) => ({
      ...p,
      acts: p.acts.map((a) =>
        a.id === actId
          ? {
              ...a,
              chapters: a.chapters.map((c) =>
                c.id === chapterId ? { ...c, scenes: [...c.scenes, newScene] } : c
              ),
            }
          : a
      ),
    }));
  };

  const updateSceneDetails = (sceneId: string, updates: Partial<Scene>) => {
    onUpdateProject((p) => ({
      ...p,
      acts: p.acts.map((a) => ({
        ...a,
        chapters: a.chapters.map((c) => ({
          ...c,
          scenes: c.scenes.map((s) => (s.id === sceneId ? { ...s, ...updates } : s)),
        })),
      })),
    }));
  };

  const filteredActs =
    selectedActId === "all"
      ? project.acts
      : project.acts.filter((a) => a.id === selectedActId);

  return (
    <div
      id="corkboard-view"
      className="flex-1 flex flex-col min-h-0 overflow-hidden select-none"
      style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}
    >
      {/* Top Filter Bar */}
      <div
        className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold">Tablero de Corcho</h2>
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline opacity-70">
            Fichas indexables de escenas
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs bg-[var(--bg-main)] px-2.5 py-1 rounded-lg">
          <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <select
            value={selectedActId}
            onChange={(e) => setSelectedActId(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-[var(--text-main)] font-medium cursor-pointer"
          >
            <option value="all">Todos los Actos ({project.acts.length})</option>
            {project.acts.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Canvas */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-8 scrollbar-thin">
        {filteredActs.map((act) => (
          <div key={act.id} className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                {act.title}
              </h3>
              {act.description && (
                <span className="text-xs text-[var(--text-muted)] italic">{act.description}</span>
              )}
            </div>

            <div className="space-y-6">
              {act.chapters.map((chap) => (
                <div key={chap.id} className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)] px-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                      <span>{chap.title}</span>
                    </span>
                    <button
                      onClick={() => addSceneToChapter(act.id, chap.id)}
                      className="flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Añadir Tarjeta</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {chap.scenes.map((scene) => {
                      const povChar = project.entities.find((e) => e.id === scene.povCharacterId);
                      const statusMeta = STATUS_LABELS[scene.status] || STATUS_LABELS.draft;

                      return (
                        <div
                          key={scene.id}
                          className="rounded-2xl bg-[var(--bg-card)] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                        >
                          <div className="p-4 space-y-2.5 flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <input
                                type="text"
                                value={scene.title}
                                onChange={(e) =>
                                  updateSceneDetails(scene.id, { title: e.target.value })
                                }
                                className="font-semibold text-xs text-[var(--text-main)] bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--accent)] rounded px-1 -mx-1 w-full truncate"
                              />
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${statusMeta.badgeClass}`}
                              >
                                {statusMeta.label}
                              </span>
                            </div>

                            <textarea
                              value={scene.synopsis || ""}
                              onChange={(e) =>
                                updateSceneDetails(scene.id, { synopsis: e.target.value })
                              }
                              placeholder="Sinopsis de la escena..."
                              rows={3}
                              className="w-full text-xs p-2 rounded-lg bg-[var(--bg-main)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none leading-relaxed flex-1 border-none"
                            />

                            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                              <div className="flex items-center gap-1 truncate">
                                <User className="w-3 h-3 text-[var(--accent)] shrink-0" />
                                <span className="truncate">{povChar ? povChar.name : "Omnisciente"}</span>
                              </div>
                              <span className="font-mono text-[var(--text-main)] opacity-70">
                                {(scene.wordCount || 0).toLocaleString()} pal.
                              </span>
                            </div>
                          </div>

                          <div className="px-4 py-2 bg-black/5 dark:bg-white/5 flex items-center justify-between text-[11px]">
                            <span className="text-[10px] text-[var(--text-muted)]">
                              Meta: {scene.targetWordCount || 1500} pal.
                            </span>
                            <button
                              onClick={() => onSelectScene(scene.id)}
                              className="flex items-center gap-1 font-medium text-[var(--accent)] hover:underline cursor-pointer"
                            >
                              <span>Escribir</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
