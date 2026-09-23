import React, { useState } from "react";
import {
  Table,
  User,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  FileText,
  Clock,
} from "lucide-react";
import { NovelProject, Scene, SceneStatus } from "../../types";

interface OutlineGridViewProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onSelectScene: (sceneId: string) => void;
}

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
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div>
          <h2 className="text-base font-bold font-novel-display flex items-center gap-2">
            <Table className="w-5 h-5 text-[var(--accent)]" />
            <span>Matriz de Esquema del Manuscrito</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Vista tabular de todas las escenas con desglose de POV, palabras, estado y objetivos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative text-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Filtrar escenas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-xs focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="idea">Idea</option>
            <option value="draft">Borrador</option>
            <option value="revised">En Revisión</option>
            <option value="polished">Pulido</option>
            <option value="final">Final</option>
          </select>
        </div>
      </div>

      {/* Table Canvas */}
      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-card)] shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-[var(--border-color)] font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                <th className="p-3">Acto / Capítulo</th>
                <th className="p-3">Título de Escena</th>
                <th className="p-3">POV</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Palabras</th>
                <th className="p-3">Sinopsis & Conflicto</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]/60">
              {filteredRows.map(({ actTitle, chapTitle, scene }) => {
                const povChar = project.entities.find(
                  (e) => e.id === scene.povCharacterId
                );

                return (
                  <tr
                    key={scene.id}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-3 font-semibold text-[var(--text-main)] whitespace-nowrap">
                      <div className="text-xs">{actTitle}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-normal">
                        {chapTitle}
                      </div>
                    </td>

                    <td className="p-3 font-bold font-novel-display text-[var(--text-main)]">
                      {scene.title}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
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
                        className="text-[11px] font-semibold px-2 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none"
                      >
                        <option value="idea">Idea</option>
                        <option value="draft">Borrador</option>
                        <option value="revised">En Revisión</option>
                        <option value="polished">Pulido</option>
                        <option value="final">Final</option>
                      </select>
                    </td>

                    <td className="p-3 whitespace-nowrap font-mono">
                      <span className="font-bold text-[var(--text-main)]">
                        {(scene.wordCount || 0).toLocaleString()}
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {" "}
                        / {scene.targetWordCount || 1500}
                      </span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {scene.synopsis || scene.goal || "Sin sinopsis"}
                      </p>
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectScene(scene.id)}
                        className="px-2.5 py-1 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] font-bold hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] transition-colors"
                      >
                        Escribir →
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
