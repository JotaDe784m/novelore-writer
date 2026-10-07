import React, { useState } from "react";
import { Plus, MoreVertical, Edit2, Trash2, ZoomIn, GripVertical } from "lucide-react";
import { TimelineTrack } from "../../../../types";

interface TimelineTrackRowHeaderProps {
  track: TimelineTrack;
  eventCount: number;
  isDraggable?: boolean;
  onFocusTrack: (trackId: string) => void;
  onEditTrack: (track: TimelineTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  onAddEventToTrack: (trackId: string) => void;
  onTrackDragStart?: (e: React.DragEvent, trackId: string) => void;
}

export const TimelineTrackRowHeader: React.FC<TimelineTrackRowHeaderProps> = ({
  track,
  eventCount,
  isDraggable,
  onFocusTrack,
  onEditTrack,
  onDeleteTrack,
  onAddEventToTrack,
  onTrackDragStart,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <div className="flex items-center gap-2 min-w-0">
        {isDraggable && (
          <div
            draggable
            onDragStart={(e) => onTrackDragStart?.(e, track.id)}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Arrastra para reordenar línea de tiempo"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <div
          onClick={() => onFocusTrack(track.id)}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
          title="Hacer clic para enfocar esta pista en primer plano"
        >
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
            style={{ backgroundColor: track.color || "var(--accent)" }}
          />
          <h3 className="text-sm font-bold font-novel-display text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
            {track.name}
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-novel-sans">
            {eventCount} {eventCount === 1 ? "evento" : "eventos"}
          </span>
          <ZoomIn className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 text-[var(--accent)] transition-opacity" />
        </div>
      </div>

      <div className="relative flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onFocusTrack(track.id)}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer font-novel-sans"
          title="Vista en Primer Plano"
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Primer Plano</span>
        </button>
        <button
          type="button"
          onClick={() => onAddEventToTrack(track.id)}
          className="flex items-center gap-1 text-xs px-3 py-1 rounded-full text-[var(--accent)] bg-[var(--accent-subtle)] hover:opacity-90 transition-all cursor-pointer font-semibold font-novel-sans"
          title="Añadir evento en esta línea de tiempo"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Evento</span>
        </button>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
        {showMenu && (
          <div
            className="absolute right-0 top-full mt-1 w-36 rounded-2xl shadow-xl z-30 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)]"
            onMouseLeave={() => setShowMenu(false)}
          >
            <button
              type="button"
              onClick={() => { setShowMenu(false); onEditTrack(track); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 text-left cursor-pointer"
            >
              <Edit2 className="w-3 h-3 text-[var(--text-muted)]" />
              <span>Editar pista</span>
            </button>
            <button
              type="button"
              onClick={() => { setShowMenu(false); onDeleteTrack(track.id); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 text-left cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Eliminar pista</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
