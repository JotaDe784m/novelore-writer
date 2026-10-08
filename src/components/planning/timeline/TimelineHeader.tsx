import React from "react";
import { Plus, Search } from "lucide-react";
import { TimelineEvent, TimelineTrack } from "../../../types";
import { TimelinePlaneDropdown } from "./TimelinePlaneDropdown";

interface TimelineHeaderProps {
  events: TimelineEvent[];
  tracks: TimelineTrack[];
  activePlane: "all" | string;
  searchQuery: string;
  onSelectPlane: (plane: "all" | string) => void;
  onSearchChange: (query: string) => void;
  onOpenCreateTrack: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  events,
  tracks,
  activePlane,
  searchQuery,
  onSelectPlane,
  onSearchChange,
  onOpenCreateTrack,
}) => {
  return (
    <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 select-none border-b border-[var(--border-color)]/50 bg-[var(--bg-surface)]">
      {/* Selector Desplegable de Planos Temporales */}
      <TimelinePlaneDropdown
        events={events}
        tracks={tracks}
        activePlane={activePlane}
        onSelectPlane={onSelectPlane}
      />

      {/* Buscador y Botón Crear Línea de Tiempo */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar acontecimiento..."
            className="text-xs pl-8 pr-3 py-1.5 rounded-full bg-[var(--bg-main)] text-[var(--text-main)] placeholder:[var(--text-muted)]/50 border border-[var(--border-color)]/60 outline-hidden w-28 sm:w-40 focus:w-48 transition-all focus:border-[var(--accent)] font-novel-serif"
          />
        </div>

        <button
          type="button"
          onClick={onOpenCreateTrack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] hover:opacity-90 transition-all cursor-pointer shrink-0 font-sans"
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
