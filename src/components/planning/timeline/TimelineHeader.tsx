import React from "react";
import { Plus, Search, Filter, Settings2 } from "lucide-react";
import { TimelineEvent, TimelineTrack } from "../../../types";
import { TemporalPlaneDefinition } from "../../../stores/planningStoreTypes";
import { usePlanningStore } from "../../../stores/usePlanningStore";

interface TimelineHeaderProps {
  events: TimelineEvent[];
  tracks: TimelineTrack[];
  activePlane: "all" | string;
  searchQuery: string;
  onSelectPlane: (plane: "all" | string) => void;
  onSearchChange: (query: string) => void;
  onOpenCreateTrack: () => void;
  onOpenCreatePlane: () => void;
  onEditPlane: (plane: TemporalPlaneDefinition) => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  events,
  tracks,
  activePlane,
  searchQuery,
  onSelectPlane,
  onSearchChange,
  onOpenCreateTrack,
  onOpenCreatePlane,
  onEditPlane,
}) => {
  const temporalPlanes = usePlanningStore((s) => s.temporalPlanes);

  const countByPlane = (planeId: string) => {
    // Cuenta eventos cuyo plano coincida o cuya pista pertenezca a este plano
    const planeTracks = new Set(tracks.filter((t) => t.planeId === planeId).map((t) => t.id));
    return events.filter(
      (e) => (e.temporalPlane || "present") === planeId || planeTracks.has(e.trackId)
    ).length;
  };

  return (
    <div className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shrink-0 select-none border-b border-[var(--border-color)]/50 bg-[var(--bg-surface)]">
      {/* Nivel 3: Selector Dinámico de Planos Temporales */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5 min-w-0 max-w-full">
        <button
          type="button"
          onClick={() => onSelectPlane("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activePlane === "all"
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <Filter className="w-3 h-3 shrink-0" />
          <span>Todos</span>
          <span className="opacity-75 text-[10px]">({events.length})</span>
        </button>

        {temporalPlanes.map((plane) => {
          const isActive = activePlane === plane.id;
          const count = countByPlane(plane.id);
          return (
            <div
              key={plane.id}
              className={`flex items-center rounded-full text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectPlane(plane.id)}
                className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 cursor-pointer whitespace-nowrap"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: plane.color }}
                />
                <span>{plane.name}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPlane(plane);
                }}
                title={`Configurar plano ${plane.name}`}
                className="pr-2 pl-0.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Settings2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Botón Añadir Plano */}
        <button
          type="button"
          onClick={onOpenCreatePlane}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 border border-dashed border-[var(--border-color)] transition-all cursor-pointer shrink-0"
          title="Crear nuevo plano temporal"
        >
          <Plus className="w-3 h-3" />
          <span>Plano</span>
        </button>
      </div>

      {/* Buscador y Botón Crear Pista */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar acontecimiento..."
            className="text-xs pl-8 pr-3 py-1.5 rounded-full bg-[var(--bg-main)] text-[var(--text-main)] placeholder:[var(--text-muted)]/50 border border-[var(--border-color)]/60 outline-hidden w-32 sm:w-40 focus:w-48 transition-all focus:border-[var(--accent)] font-novel-serif"
          />
        </div>

        <button
          type="button"
          onClick={onOpenCreateTrack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] hover:opacity-90 transition-all cursor-pointer shrink-0"
          title="Crear nueva línea de tiempo / pista cronológica"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nueva Línea</span>
          <span className="sm:hidden">Línea</span>
        </button>
      </div>
    </div>
  );
};
