import React, { useState } from "react";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  User,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Act, Chapter, NovelProject, Scene, SceneStatus } from "../../types";

interface CorkboardViewProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onSelectScene: (sceneId: string) => void;
}

export const CorkboardView: React.FC<CorkboardViewProps> = ({
  project,
  onUpdateProject,
  onSelectScene,
}) => {
  const [selectedActId, setSelectedActId] = useState<string>("all");
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);

  const getStatusColor = (status: SceneStatus) => {
    switch (status) {
      case "idea":
        return "bg-purple-500 text-white";
      case "draft":
        return "bg-amber-500 text-white";
      case "revised":
        return "bg-blue-500 text-white";
      case "polished":
        return "bg-emerald-500 text-white";
      case "final":
        return "bg-teal-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const addSceneToChapter = (actId: string, chapterId: string) => {
    const act = project.acts.find((a) => a.id === actId);
    const chap = act?.chapters.find((c) => c.id === chapterId);
    if (!chap) return;

    const newSceneId = `scene-${Date.now()}`;
    const newScene: Scene = {
      id: newSceneId,
      chapterId,
      title: `Escena ${chap.scenes.length + 1}`,
      content: "",
      synopsis: "Escribe aquí la sinopsis de esta tarjeta...",
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

  const updateSceneDetails = (
    sceneId: string,
    updates: Partial<Scene>
  ) => {
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
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Corkboard Top Filter Bar */}
      <div
        className="p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div>
          <h2 className="text-base font-bold font-novel-display flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--accent)]" />
            <span>Tablero de Corcho (Tarjetas de Escena)</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Visualiza y estructura capítulos y escenas mediante fichas indexables estilo Scrivener.
          </p>
        </div>

        {/* Act Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-[var(--bg-input)] px-2.5 py-1.5 rounded-lg border border-[var(--border-color)]">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={selectedActId}
              onChange={(e) => setSelectedActId(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[var(--text-main)] font-medium cursor-pointer"
            >
              <option value="all">Ver Todos los Actos ({project.acts.length})</option>
              {project.acts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards Canvas */}
      <div
        id="corkboard-canvas-scroll"
        className="flex-1 min-h-0 overflow-y-scroll p-6 space-y-8 custom-scroll always-scroll"
        style={{
          overflowY: "scroll",
          scrollbarGutter: "stable",
        }}
      >
        {filteredActs.map((act) => (
          <div key={act.id} className="space-y-4">
            {/* Act Banner */}
            <div className="flex items-center justify-between border-b pb-2 border-[var(--border-color)]">
              <h3 className="text-sm font-bold font-novel-display text-[var(--accent)] uppercase tracking-wider">
                {act.title}
              </h3>
              {act.description && (
                <span className="text-xs text-[var(--text-muted)] italic">
                  {act.description}
                </span>
              )}
            </div>

            {/* Chapters and their Scene Cards */}
            <div className="space-y-6">
              {act.chapters.map((chap) => (
                <div key={chap.id} className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)]">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                      <span>{chap.title}</span>
                    </span>
                    <button
                      onClick={() => addSceneToChapter(act.id, chap.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Añadir Tarjeta</span>
                    </button>
                  </div>

                  {/* Index Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {chap.scenes.map((scene) => {
                      const povChar = project.entities.find(
                        (e) => e.id === scene.povCharacterId
                      );

                      return (
                        <div
                          key={scene.id}
                          className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-[var(--accent)] relative"
                        >
                          {/* Top Color Header Ribbon */}
                          <div className="h-2 bg-[var(--accent)]/40 w-full" />

                          <div className="p-4 space-y-2.5 flex-1 flex flex-col">
                            {/* Header: Title and Status */}
                            <div className="flex items-start justify-between gap-2">
                              <input
                                type="text"
                                value={scene.title}
                                onChange={(e) =>
                                  updateSceneDetails(scene.id, {
                                    title: e.target.value,
                                  })
                                }
                                className="font-bold text-xs font-novel-display text-[var(--text-main)] bg-transparent focus:outline-none focus:border-b border-[var(--accent)] w-full truncate"
                              />
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${getStatusColor(
                                  scene.status
                                )}`}
                              >
                                {scene.status}
                              </span>
                            </div>

                            {/* Synopsis Area */}
                            <textarea
                              value={scene.synopsis || ""}
                              onChange={(e) =>
                                updateSceneDetails(scene.id, {
                                  synopsis: e.target.value,
                                })
                              }
                              placeholder="Sinopsis de la escena..."
                              rows={4}
                              className="w-full text-xs p-2 rounded-md bg-[var(--bg-input)] border border-[var(--border-color)]/60 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] resize-none leading-relaxed flex-1"
                            />

                            {/* POV & Word count stats */}
                            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]/50">
                              <div className="flex items-center gap-1 truncate">
                                <User className="w-3 h-3 text-[var(--accent)] shrink-0" />
                                <span className="truncate">
                                  {povChar ? povChar.name : "Omnisciente"}
                                </span>
                              </div>

                              <span className="font-mono font-semibold text-[var(--text-main)]">
                                {(scene.wordCount || 0).toLocaleString()} pal.
                              </span>
                            </div>
                          </div>

                          {/* Footer Action: Go to editor */}
                          <div className="px-4 py-2 bg-black/5 dark:bg-white/5 border-t border-[var(--border-color)]/50 flex items-center justify-between">
                            <span className="text-[10px] text-[var(--text-muted)]">
                              Meta: {scene.targetWordCount || 1500} pal.
                            </span>
                            <button
                              onClick={() => onSelectScene(scene.id)}
                              className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
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
