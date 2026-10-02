import React, { useState } from "react";
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { TimelineTrack, TimelineEvent, CodexEntity } from "../../../types";
import { FlattenedScene } from "./timelineTypes";
import { TimelineEventCard } from "./TimelineEventCard";

interface TimelineTrackRowProps {
  track: TimelineTrack;
  events: TimelineEvent[];
  allScenes: FlattenedScene[];
  allCodexEntities: CodexEntity[];
  onEditTrack: (track: TimelineTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  onAddEventToTrack: (trackId: string) => void;
  onEditEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onMoveEvent?: (
    eventId: string,
    targetTrackId: string,
    targetOrIndex?: string | number,
    position?: "before" | "after"
  ) => void;
  onSelectScene?: (sceneId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
}

export const TimelineTrackRow: React.FC<TimelineTrackRowProps> = ({
  track,
  events,
  allScenes,
  allCodexEntities,
  onEditTrack,
  onDeleteTrack,
  onAddEventToTrack,
  onEditEvent,
  onDeleteEvent,
  onMoveEvent,
  onSelectScene,
  onOpenEntityDossier,
}) => {
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const getSceneTitle = (sceneId?: string) => {
    if (!sceneId) return undefined;
    const found = allScenes.find((s) => s.id === sceneId);
    return found ? `${found.chapterTitle}: ${found.title}` : undefined;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const eventId = e.dataTransfer.getData("text/novelore-event-id");
    if (eventId && onMoveEvent) {
      onMoveEvent(eventId, track.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col gap-2 p-3 sm:p-4 rounded-2xl bg-[var(--bg-surface)] select-none transition-colors ${
        isDragOver ? "bg-[var(--accent)]/5 ring-1 ring-[var(--accent)]/30" : ""
      }`}
    >
      {/* Cabecera de Pista */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: track.color || "#6366f1" }}
          />
          <h3 className="text-sm font-semibold text-[var(--text-main)] truncate">
            {track.name}
          </h3>
          <span className="text-xs text-[var(--text-muted)] opacity-70">
            {events.length} {events.length === 1 ? "evento" : "eventos"}
          </span>
          {track.description && (
            <span className="hidden md:inline text-xs text-[var(--text-muted)] opacity-50 truncate max-w-sm">
              — {track.description}
            </span>
          )}
        </div>

        {/* Acciones de Pista */}
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddEventToTrack(track.id)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all cursor-pointer font-medium"
            title="Agregar evento en esta pista"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Evento</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTrackMenu(!showTrackMenu)}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            title="Opciones de pista"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showTrackMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-36 rounded-xl shadow-lg z-20 py-1 bg-[var(--bg-card)] border border-black/5 dark:border-white/5"
              onMouseLeave={() => setShowTrackMenu(false)}
            >
              <button
                type="button"
                onClick={() => {
                  setShowTrackMenu(false);
                  onEditTrack(track);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 text-left cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-[var(--text-muted)]" />
                <span>Editar pista</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTrackMenu(false);
                  onDeleteTrack(track.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 text-left cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Eliminar pista</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carril Horizontal de Eventos */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin">
        {events.length === 0 ? (
          <div
            onClick={() => onAddEventToTrack(track.id)}
            className="w-72 min-w-[18rem] h-32 rounded-xl border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer select-none"
          >
            <Plus className="w-5 h-5 opacity-60" />
            <span>Agregar primer evento o arrastra uno aquí</span>
          </div>
        ) : (
          <>
            {events.map((event) => (
              <TimelineEventCard
                key={event.id}
                event={event}
                trackColor={track.color}
                allCodexEntities={allCodexEntities}
                sceneTitle={getSceneTitle(event.sceneId)}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                onSelectScene={onSelectScene}
                onOpenEntityDossier={onOpenEntityDossier}
                onDropOnCard={(draggedId, targetId, pos) => {
                  if (onMoveEvent) {
                    onMoveEvent(draggedId, track.id, targetId, pos);
                  }
                }}
              />
            ))}
            <button
              type="button"
              onClick={() => onAddEventToTrack(track.id)}
              className="w-12 min-w-[3rem] rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shrink-0"
              title="Agregar evento al final"
            >
              <Plus className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
