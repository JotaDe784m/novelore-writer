import React from "react";
import { Plus, Search, Filter } from "lucide-react";
import { TimelineEvent } from "../../../types";
import { TemporalPlaneDefinition } from "../../../stores/planningStoreTypes";
import { usePlanningStore } from "../../../stores/usePlanningStore";

interface TimelineHeaderProps {
  events: TimelineEvent[];
  activePlane: "all" | string;
  searchQuery: string;
  onSelectPlane: (plane: "all" | string) => void;
  onSearchChange: (query: string) => void;
  onOpenCreateEvent: () => void;
  onOpenCreateTrack: () => void;
  onOpenCreatePlane: () => void;
  onEditPlane: (plane: TemporalPlaneDefinition) => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  events,
  activePlane,
  searchQuery,
  onSelectPlane,
  onSearchChange,
  onOpenCreateEvent,
  onOpenCreateTrack,
  onOpenCreatePlane,
  onEditPlane,
}) => {
  const temporalPlanes = usePlanningStore((s) => s.temporalPlanes);

  const countByPlane = (planeId: string) =>
    events.filter((e) => (e.temporalPlane || "present") === planeId).length;

  return (
    <div
      className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none"
      style={{ backgroundColor: "var(--bg-surface)" }}
    >
      {/* Selector Dinámico de Planos Temporales */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        <button
          type="button"
          onClick={() => onSelectPlane("all")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
            activePlane === "all"
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <Filter className="w-3 h-3 shrink-0" />
          <span>Todos</span>
          <span className="opacity-70 text-[10px]">({events.length})</span>
        </button>

        {temporalPlanes.map((plane) => {
          const isActive = activePlane === plane.id;
          const count = countByPlane(plane.id);
          return (
            <div
              key={plane.id}
              className={`flex items-center rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectPlane(plane.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 cursor-pointer"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: plane.color }}
                />
                <span>{plane.shortLabel || plane.name}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPlane(plane);
                }}
                title="Configurar o eliminar este plano"
                className="pr-1.5 opacity-40 hover:opacity-100 text-[10px] cursor-pointer"
              >
                *
              </button>
            </div>
          );
        })}

        {/* Botón Añadir Plano */}
        <button
          type="button"
          onClick={onOpenCreatePlane}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          title="Añadir nuevo plano temporal personalizado"
        >
          <Plus className="w-3 h-3" />
          <span>Plano</span>
        </button>
      </div>

      {/* Buscador y Botones de Acción */}
      <div className="flex items-center gap-2">
        {/* Campo de Búsqueda */}
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar evento..."
            className="text-xs pl-7 pr-2.5 py-1 rounded-md bg-[var(--bg-main)] text-[var(--text-main)] placeholder-[var(--text-muted)] border-none outline-none w-32 focus:w-44 transition-all focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Crear Pista */}
        <button
          type="button"
          onClick={onOpenCreateTrack}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          title="Crear nueva pista cronológica"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pista</span>
        </button>

        {/* Crear Evento */}
        <button
          type="button"
          onClick={onOpenCreateEvent}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Evento</span>
        </button>
      </div>
    </div>
  );
};
