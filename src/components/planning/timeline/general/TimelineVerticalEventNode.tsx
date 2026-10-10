import React, { useState } from "react";
import { TimelineEvent } from "../../../../types";

interface TimelineVerticalEventNodeProps {
  event: TimelineEvent;
  trackColor: string;
  isLast?: boolean;
  onEditEvent: (event: TimelineEvent) => void;
  onEventContextMenu?: (e: React.MouseEvent, event: TimelineEvent) => void;
  onEventDropTarget?: (
    draggedEventId: string,
    sourceTrackId: string,
    targetEventId: string,
    position: "before" | "after"
  ) => void;
}

export const TimelineVerticalEventNode: React.FC<TimelineVerticalEventNodeProps> = ({
  event,
  trackColor,
  isLast = false,
  onEditEvent,
  onEventContextMenu,
  onEventDropTarget,
}) => {
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const [isDraggingSelf, setIsDraggingSelf] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/novelore-event-id", event.id);
    e.dataTransfer.setData("application/novelore-source-track-id", event.trackId);
    e.dataTransfer.effectAllowed = "move";
    setIsDraggingSelf(true);
  };

  const handleDragEnd = () => {
    setIsDraggingSelf(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const isTopHalf = offsetY < rect.height / 2;
    setDropPosition(isTopHalf ? "before" : "after");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedEventId = e.dataTransfer.getData("application/novelore-event-id");
    const sourceTrackId = e.dataTransfer.getData("application/novelore-source-track-id");
    const pos = dropPosition || "after";
    setDropPosition(null);

    if (!draggedEventId || draggedEventId === event.id) return;
    onEventDropTarget?.(draggedEventId, sourceTrackId, event.id, pos);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative pl-6 ${isLast ? "pb-3" : "pb-8"} transition-opacity ${
        isDraggingSelf ? "opacity-40" : "opacity-100"
      }`}
    >
      {/* Indicador de caída superior (antes) */}
      {dropPosition === "before" && (
        <div
          className="absolute -top-1 left-2 right-2 h-0.5 rounded-full z-20 pointer-events-none animate-pulse"
          style={{ backgroundColor: trackColor }}
        />
      )}

      {/* Espina vertical continua */}
      <div
        className={`absolute left-[5.5px] top-1.5 w-[2px] pointer-events-none ${
          isLast ? "h-5" : "bottom-0"
        }`}
        style={{ backgroundColor: trackColor }}
      />

      {/* Nodo circular anclado sobre la línea */}
      <div
        className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 transition-transform duration-150 z-10 shrink-0 group-hover:scale-110"
        style={{
          borderColor: trackColor,
          backgroundColor: "var(--bg-main)",
        }}
      />

      {/* Bloque editorial del acontecimiento (sin caja rígida ni marcos) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onEditEvent(event)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onEditEvent(event);
        }}
        onContextMenu={(e) => onEventContextMenu?.(e, event)}
        className="group text-left p-2 -m-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer select-none"
      >
        {/* Fecha o marcador temporal */}
        {(event.date || event.era) && (
          <span className="block text-[10px] sm:text-[11px] text-[var(--text-muted)] font-serif leading-none tracking-wide">
            {event.date || event.era}
          </span>
        )}

        {/* Título literario del evento */}
        <h4 className="font-bold text-[13px] sm:text-sm font-novel-display text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors leading-snug mt-0.5">
          {event.title || "Acontecimiento sin título"}
        </h4>

        {/* Subtítulo o tipo de acontecimiento */}
        {event.subtitle && (
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-sans italic mt-0.5 truncate">
            {event.subtitle}
          </p>
        )}

        {/* Resumen / Sinopsis editorial */}
        {event.summary && (
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-novel-serif leading-relaxed mt-1 line-clamp-3">
            {event.summary}
          </p>
        )}
      </div>

      {/* Indicador de caída inferior (después) */}
      {dropPosition === "after" && (
        <div
          className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full z-20 pointer-events-none animate-pulse"
          style={{ backgroundColor: trackColor }}
        />
      )}
    </div>
  );
};
