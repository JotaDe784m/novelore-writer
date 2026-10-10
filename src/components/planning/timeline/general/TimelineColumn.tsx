import React, { useState, useMemo } from "react";
import { Plus, MoreVertical, Search, GripVertical, X } from "lucide-react";
import { TimelineTrack, TimelineEvent } from "../../../../types";
import { TemporalPlaneDefinition } from "../../../../stores/planningStoreTypes";
import { TimelineColumnMenu } from "./TimelineColumnMenu";
import { TimelineVerticalEventNode } from "./TimelineVerticalEventNode";

interface TimelineColumnProps {
  track: TimelineTrack;
  events: TimelineEvent[];
  temporalPlanes: TemporalPlaneDefinition[];
  onFocusTrack: (trackId: string) => void;
  onEditTrack: (track: TimelineTrack) => void;
  onMoveTrackToPlane: (trackId: string, planeId?: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onAddEventToTrack: (trackId: string) => void;
  onEditEvent: (event: TimelineEvent) => void;
  onReorderTrackEvents?: (trackId: string, sortedEventIds: string[]) => void;
  onMoveEvent?: (
    eventId: string,
    targetTrackId: string,
    targetOrIndex?: string | number,
    position?: "before" | "after"
  ) => void;
  onEventContextMenu?: (e: React.MouseEvent, event: TimelineEvent) => void;
  onColumnDragStart?: (e: React.DragEvent, trackId: string) => void;
  onColumnDragOver?: (e: React.DragEvent) => void;
  onColumnDrop?: (e: React.DragEvent, targetTrackId: string) => void;
}

export const TimelineColumn: React.FC<TimelineColumnProps> = ({
  track,
  events,
  temporalPlanes,
  onFocusTrack,
  onEditTrack,
  onMoveTrackToPlane,
  onDeleteTrack,
  onAddEventToTrack,
  onEditEvent,
  onReorderTrackEvents,
  onMoveEvent,
  onEventContextMenu,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const trackColor = track.color || "#6366f1";

  const filteredEvents = useMemo(() => {
    if (!localSearch.trim()) return events;
    const q = localSearch.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.summary || "").toLowerCase().includes(q) ||
        (e.date || "").toLowerCase().includes(q)
    );
  }, [events, localSearch]);

  const handleEventDropTarget = (
    draggedId: string,
    sourceTrackId: string,
    targetId: string,
    position: "before" | "after"
  ) => {
    if (sourceTrackId === track.id) {
      const ids = events.map((e) => e.id);
      const srcIdx = ids.indexOf(draggedId);
      const tgtIdx = ids.indexOf(targetId);
      if (srcIdx === -1 || tgtIdx === -1) return;
      const nextIds = [...ids];
      const [moved] = nextIds.splice(srcIdx, 1);
      nextIds.splice(position === "before" ? nextIds.indexOf(targetId) : nextIds.indexOf(targetId) + 1, 0, moved);
      onReorderTrackEvents?.(track.id, nextIds);
    } else {
      onMoveEvent?.(draggedId, track.id, targetId, position);
    }
  };

  const handleDropBottom = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
    const draggedId = e.dataTransfer.getData("application/novelore-event-id");
    const sourceTrackId = e.dataTransfer.getData("application/novelore-source-track-id");
    if (!draggedId) return;

    if (sourceTrackId === track.id) {
      const ids = events.map((ev) => ev.id);
      const srcIdx = ids.indexOf(draggedId);
      if (srcIdx === -1) return;
      const nextIds = [...ids];
      const [moved] = nextIds.splice(srcIdx, 1);
      nextIds.push(moved);
      onReorderTrackEvents?.(track.id, nextIds);
    } else {
      onMoveEvent?.(draggedId, track.id, events.length, "after");
    }
  };

  return (
    <div
      onDragOver={(e) => {
        onColumnDragOver?.(e);
        if (e.dataTransfer.types.includes("application/novelore-event-id")) {
          e.preventDefault();
          setIsDropTarget(true);
        }
      }}
      onDragLeave={() => setIsDropTarget(false)}
      onDrop={(e) => {
        setIsDropTarget(false);
        if (e.dataTransfer.types.includes("application/novelore-column-id")) {
          onColumnDrop?.(e, track.id);
        } else if (e.dataTransfer.types.includes("application/novelore-event-id")) {
          handleDropBottom(e);
        }
      }}
      className={`w-[300px] sm:w-[330px] shrink-0 rounded-3xl bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/60 transition-colors p-3.5 sm:p-4 flex flex-col select-none relative ${
        isDragging ? "opacity-30" : "opacity-100"
      } ${isDropTarget ? "ring-2 ring-[var(--accent)]" : ""}`}
    >
      {/* Cabecera Sticky de la Línea de Tiempo */}
      <div className="sticky top-0 z-20 bg-[var(--bg-card)]/90 backdrop-blur-md pt-1 pb-2.5 -mx-3.5 sm:-mx-4 px-3.5 sm:px-4 rounded-t-3xl border-b border-[var(--border-color)]/40 mb-3.5">
        <div className="flex items-center justify-between gap-2">
          {/* Lado Izquierdo: Grip, Punto de Color y Título */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/novelore-column-id", track.id);
                e.dataTransfer.effectAllowed = "move";
                setIsDragging(true);
                onColumnDragStart?.(e, track.id);
              }}
              onDragEnd={() => setIsDragging(false)}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
              title="Arrastrar para reordenar línea de tiempo"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => onFocusTrack(track.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onFocusTrack(track.id); }}
              className="flex items-center gap-2 min-w-0 cursor-pointer group"
              title="Enfocar en primer plano"
            >
              <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: trackColor }} />
              <h3 className="text-sm font-bold font-novel-display text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors truncate">
                {track.name}
              </h3>
            </div>
          </div>

          {/* Lado Derecho: Acciones de Cabecera (+, búsqueda, ...) */}
          <div className="flex items-center gap-1 shrink-0 relative">
            <button
              type="button"
              onClick={() => onAddEventToTrack(track.id)}
              className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors cursor-pointer"
              title="Añadir acontecimiento"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setShowSearch(!showSearch); if (showSearch) setLocalSearch(""); }}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                showSearch ? "text-[var(--accent)] bg-[var(--accent-subtle)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Filtrar en esta línea"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Opciones de la línea"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <TimelineColumnMenu
              isOpen={menuOpen} track={track} temporalPlanes={temporalPlanes} onClose={() => setMenuOpen(false)}
              onFocusTrack={onFocusTrack} onEditTrack={onEditTrack} onMoveTrackToPlane={onMoveTrackToPlane} onDeleteTrack={onDeleteTrack}
            />
          </div>
        </div>

        {/* Campo de búsqueda contextual si está abierto */}
        {showSearch && (
          <div className="mt-2 flex items-center gap-1 px-2 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]/60">
            <Search className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
            <input
              type="text" autoFocus value={localSearch} onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar en esta línea..."
              className="flex-1 bg-transparent text-xs text-[var(--text-main)] placeholder:[var(--text-muted)]/50 outline-hidden font-novel-serif"
            />
            {localSearch && (
              <button type="button" onClick={() => setLocalSearch("")} className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Fila secundaria: Conteo de acontecimientos */}
        <div className="text-xs text-[var(--text-muted)] font-novel-sans mt-1.5 pl-6">
          • {events.length} {events.length === 1 ? "evento" : "eventos"}
        </div>
      </div>

      {/* Flujo Vertical de Acontecimientos */}
      <div className="flex-1 flex flex-col">
        {filteredEvents.length === 0 ? (
          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleDropBottom}
            className="flex-1 min-h-[160px] flex flex-col items-center justify-center p-6 text-center border border-dashed border-[var(--border-color)]/50 rounded-2xl bg-[var(--bg-main)]/30"
          >
            <p className="text-xs text-[var(--text-muted)] font-novel-serif mb-3">
              {events.length === 0 ? "Sin acontecimientos en esta línea" : "No hay coincidencias"}
            </p>
            <button
              type="button"
              onClick={() => onAddEventToTrack(track.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir evento</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredEvents.map((ev, idx) => (
              <TimelineVerticalEventNode
                key={ev.id} event={ev} trackColor={trackColor} isLast={idx === filteredEvents.length - 1}
                onEditEvent={onEditEvent} onEventContextMenu={onEventContextMenu} onEventDropTarget={handleEventDropTarget}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
