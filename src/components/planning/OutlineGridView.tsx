import React, { useState } from "react";
import { Table, User, ArrowRight, Search, Filter } from "lucide-react";
import { NovelProject, Scene, SceneStatus } from "../../types";

interface OutlineGridViewProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onSelectScene: (sceneId: string) => void;
}

const STATUS_OPTIONS: { id: SceneStatus; label: string; badgeClass: string }[] = [
  { id: "idea", label: "Idea", badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
  { id: "draft", label: "Borrador", badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { id: "revised", label: "En Revisión", badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  { id: "polished", label: "Pulido", badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { id: "final", label: "Final", badgeClass: "bg-teal-500/15 text-teal-600 dark:text-teal-400" },
];

export const OutlineGridView: React.FC<OutlineGridViewProps> = ({
  project,
  onUpdateProject,
  onSelectScene,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const rows: {
    actTitle: string;
    chapTitle: string;
    scene: Scene;
  }[] = [];

  project.acts.forEach((act) => {
    act.chapters.forEach((chap) => {
      chap.scenes.forEach((scene) => {
        rows.push({
          actTitle: act.title,
          chapTitle: chap.title,
          scene,
        });
      });
    });
  });

  const updateSceneStatus = (sceneId: string, status: SceneStatus) => {
    onUpdateProject((p) => ({
      ...p,
      acts: p.acts.map((a) => ({
        ...a,
        chapters: a.chapters.map((c) => ({
          ...c,
          scenes: c.scenes.map((s) => (s.id === sceneId ? { ...s, status } : s)),
        })),
      })),
    }));
  };

  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.scene.title.toLowerCase().includes(search.toLowerCase()) ||
      r.scene.synopsis.toLowerCase().includes(search.toLowerCase()) ||
      r.chapTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || r.scene.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div
      id="outline-grid-view"
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
      style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold">Matriz de Esquema</h2>
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline opacity-70">
            Vista panorámica del avance de escenas
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative text-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar escenas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-md bg-[var(--bg-main)] text-[var(--text-main)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)] border-none"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-[var(--bg-main)] px-2.5 py-1 rounded-md">
            <Filter className="w-3 h-3 text-[var(--text-muted)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[var(--text-main)] cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 scrollbar-thin">
        <div className="rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 font-semibold text-[var(--text-muted)] text-[11px]">
                <th className="p-3 pl-4">Acto / Capítulo</th>
                <th className="p-3">Título de Escena</th>
                <th className="p-3">POV</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Palabras</th>
                <th className="p-3">Sinopsis</th>
                <th className="p-3 pr-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ actTitle, chapTitle, scene }) => {
                const povChar = project.entities.find((e) => e.id === scene.povCharacterId);

                return (
                  <tr
                    key={scene.id}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-3 pl-4 font-medium text-[var(--text-main)] whitespace-nowrap">
                      <div>{actTitle}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{chapTitle}</div>
                    </td>

                    <td className="p-3 font-semibold text-[var(--text-main)]">
                      {scene.title}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-[var(--text-muted)]">
                        <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>{povChar ? povChar.name : "No asignado"}</span>
                      </span>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={scene.status}
                        onChange={(e) =>
                          updateSceneStatus(scene.id, e.target.value as SceneStatus)
                        }
                        className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-[var(--bg-main)] text-[var(--text-main)] border-none focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3 whitespace-nowrap font-mono">
                      <span className="font-semibold text-[var(--text-main)]">
                        {(scene.wordCount || 0).toLocaleString()}
                      </span>
                      <span className="text-[var(--text-muted)] opacity-60">
                        {" "}
                        / {scene.targetWordCount || 1500}
                      </span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {scene.synopsis || scene.goal || "Sin sinopsis"}
                      </p>
                    </td>

                    <td className="p-3 pr-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectScene(scene.id)}
                        className="flex items-center gap-1 ml-auto text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
                      >
                        <span>Escribir</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
