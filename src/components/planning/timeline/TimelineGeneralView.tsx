import React, { useState, useMemo } from "react";
import { Layers, Plus } from "lucide-react";
import { TimelineTrack, TimelineEvent } from "../../../types";
import { TimelineGeneralTrackRow } from "./general/TimelineGeneralTrackRow";

interface TimelineGeneralViewProps {
  tracks: TimelineTrack[];
  eventsByTrack: Map<string, TimelineEvent[]>;
  activePlane: string;
  onFocusTrack: (trackId: string) => void;
  onEditTrack: (track: TimelineTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  onAddEventToTrack: (trackId: string) => void;
  onEditEvent: (event: TimelineEvent) => void;
  onUpdateEventGap: (eventId: string, gapLabel: string) => void;
  onUpdateEventOffset: (eventId: string, offset: number) => void;
  onMoveEvent?: (eventId: string, targetTrackId: string) => void;
  onOpenCreateTrack: () => void;
  onReorderTracks?: (trackIds: string[], planeId?: string) => void;
  onReorderTrackEvents?: (trackId: string, sortedEventIds: string[]) => void;
  onEventContextMenu?: (e: React.MouseEvent, event: TimelineEvent) => void;
}

export const TimelineGeneralView: React.FC<TimelineGeneralViewProps> = ({
  tracks,
  eventsByTrack,
  activePlane,
  onFocusTrack,
  onEditTrack,
  onDeleteTrack,
  onAddEventToTrack,
  onEditEvent,
  onUpdateEventGap,
  onUpdateEventOffset,
  onMoveEvent,
  onOpenCreateTrack,
  onReorderTracks,
  onReorderTrackEvents,
  onEventContextMenu,
}) => {
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);

  // Filtrar pistas por plano activo
  const visibleTracks = useMemo(() => {
    return tracks.filter((track) => {
      if (activePlane === "all") return true;
      if (track.planeId) return track.planeId === activePlane;
      const trEvents = eventsByTrack.get(track.id) || [];
      return trEvents.some((e) => (e.temporalPlane || "present") === activePlane);
    });
  }, [tracks, activePlane, eventsByTrack]);

  // Ordenación independiente: global (order) en "all", o local (planeOrder) en cada plano
  const sortedTracks = useMemo(() => {
    return [...visibleTracks].sort((a, b) => {
      if (activePlane === "all") {
        return (a.order ?? 0) - (b.order ?? 0);
      }
      return (a.planeOrder ?? a.order ?? 0) - (b.planeOrder ?? b.order ?? 0);
    });
  }, [visibleTracks, activePlane]);

  const handleTrackDragStart = (e: React.DragEvent, trackId: string) => {
    e.dataTransfer.setData("text/novelore-track-id", trackId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTrackId(trackId);
  };

  const handleTrackDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleTrackDrop = (e: React.DragEvent, targetTrackId: string) => {
    e.preventDefault();
    const sourceTrackId = e.dataTransfer.getData("text/novelore-track-id") || draggedTrackId;
    if (!sourceTrackId || sourceTrackId === targetTrackId) {
      setDraggedTrackId(null);
      return;
    }

    const currentIds = sortedTracks.map((t) => t.id);
    const sourceIdx = currentIds.indexOf(sourceTrackId);
    const targetIdx = currentIds.indexOf(targetTrackId);
    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedTrackId(null);
      return;
    }

    const nextIds = [...currentIds];
    const [moved] = nextIds.splice(sourceIdx, 1);
    nextIds.splice(targetIdx, 0, moved);

    onReorderTracks?.(nextIds, activePlane);
    setDraggedTrackId(null);
  };

  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="p-4 rounded-3xl bg-[var(--accent-subtle)] text-[var(--accent)] mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-base font-novel-display text-[var(--text-main)] mb-1">
          No hay pistas cronológicas creadas
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5 leading-relaxed font-novel-serif">
          Crea tu primera línea de tiempo para comenzar a ubicar acontecimientos y organizar la cronología de tu obra.
        </p>
        <button
          type="button"
          onClick={onOpenCreateTrack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Primera Pista</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scroll">
      {sortedTracks.map((track) => (
        <TimelineGeneralTrackRow
          key={track.id}
          track={track}
          events={eventsByTrack.get(track.id) || []}
          onFocusTrack={onFocusTrack}
          onEditTrack={onEditTrack}
          onDeleteTrack={onDeleteTrack}
          onAddEventToTrack={onAddEventToTrack}
          onEditEvent={onEditEvent}
          onUpdateEventGap={onUpdateEventGap}
          onUpdateEventOffset={onUpdateEventOffset}
          onMoveEvent={onMoveEvent}
          onReorderTrackEvents={onReorderTrackEvents}
          onEventContextMenu={onEventContextMenu}
          isDraggable={true}
          onTrackDragStart={handleTrackDragStart}
          onTrackDragOver={handleTrackDragOver}
          onTrackDrop={handleTrackDrop}
        />
      ))}
    </div>
  );
};
