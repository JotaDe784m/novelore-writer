import React, { useState, useMemo, useRef } from "react";
import { Plus } from "lucide-react";
import { TimelineTrack, TimelineEvent } from "../../../../types";
import { TimelineReducedCard } from "../TimelineReducedCard";
import { TimelineTrackGapLink } from "./TimelineTrackGapLink";
import { TimelineTrackRowHeader } from "./TimelineTrackRowHeader";
import {
  TIMELINE_CARD_WIDTH,
  getInitialTrackPositions,
  calculateDragLayout,
  DragLayoutResult,
} from "../../../../utils/timelinePhysics";

interface TimelineGeneralTrackRowProps {
  track: TimelineTrack;
  events: TimelineEvent[];
  onFocusTrack: (trackId: string) => void;
  onEditTrack: (track: TimelineTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  onAddEventToTrack: (trackId: string) => void;
  onEditEvent: (event: TimelineEvent) => void;
  onUpdateEventGap: (eventId: string, gapLabel: string) => void;
  onUpdateEventOffset: (eventId: string, offset: number) => void;
  onMoveEvent?: (eventId: string, targetTrackId: string) => void;
  onReorderTrackEvents?: (trackId: string, sortedEventIds: string[]) => void;
  onEventContextMenu?: (e: React.MouseEvent, event: TimelineEvent) => void;
  isDraggable?: boolean;
  onTrackDragStart?: (e: React.DragEvent, trackId: string) => void;
  onTrackDragOver?: (e: React.DragEvent, trackId: string) => void;
  onTrackDrop?: (e: React.DragEvent, trackId: string) => void;
}

export const TimelineGeneralTrackRow: React.FC<TimelineGeneralTrackRowProps> = ({
  track,
  events,
  onFocusTrack,
  onEditTrack,
  onDeleteTrack,
  onAddEventToTrack,
  onEditEvent,
  onUpdateEventGap,
  onUpdateEventOffset,
  onMoveEvent,
  onReorderTrackEvents,
  onEventContextMenu,
  isDraggable,
  onTrackDragStart,
  onTrackDragOver,
  onTrackDrop,
}) => {
  const [activeDrag, setActiveDrag] = useState<(DragLayoutResult & { dragId: string }) | null>(null);
  const dragSessionRef = useRef<{
    dragId: string;
    startClientX: number;
    initialX: number;
    initialItems: ReturnType<typeof getInitialTrackPositions>;
    hasMoved: boolean;
    currentResult: DragLayoutResult;
  } | null>(null);
  const justDraggedRef = useRef(false);

  // Posiciones base no solapadas
  const baseItems = useMemo(() => getInitialTrackPositions(events), [events]);
  const basePositionMap = useMemo(
    () => Object.fromEntries(baseItems.map((it) => [it.id, it.x])),
    [baseItems]
  );

  const currentPositionMap = activeDrag ? activeDrag.positions : basePositionMap;

  const eventsWithX = useMemo(() => {
    return events.map((ev) => ({
      ...ev,
      x: currentPositionMap[ev.id] ?? 24,
    }));
  }, [events, currentPositionMap]);

  const sortedEvents = useMemo(() => {
    return [...eventsWithX].sort((a, b) => a.x - b.x);
  }, [eventsWithX]);

  const trackWidth = useMemo(() => {
    const maxX = sortedEvents.reduce((max, ev) => Math.max(max, ev.x), 0);
    return Math.max(1400, maxX + TIMELINE_CARD_WIDTH + 400);
  }, [sortedEvents]);

  const handleCardPointerDown = (e: React.PointerEvent<HTMLDivElement>, event: TimelineEvent) => {
    if (e.button !== 0) return;
    const initialItems = getInitialTrackPositions(events);
    const dragItem = initialItems.find((it) => it.id === event.id);
    if (!dragItem) return;

    dragSessionRef.current = {
      dragId: event.id,
      startClientX: e.clientX,
      initialX: dragItem.x,
      initialItems,
      hasMoved: false,
      currentResult: {
        positions: Object.fromEntries(initialItems.map((it) => [it.id, it.x])),
        sortedIds: initialItems.map((it) => it.id),
      },
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session) return;
      const deltaX = moveEv.clientX - session.startClientX;
      if (!session.hasMoved && Math.abs(deltaX) < 4) return;
      session.hasMoved = true;
      justDraggedRef.current = true;

      const result = calculateDragLayout({
        dragId: session.dragId,
        rawX: session.initialX + deltaX,
        initialItems: session.initialItems,
      });
      session.currentResult = result;
      setActiveDrag({ ...result, dragId: session.dragId });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      const session = dragSessionRef.current;
      dragSessionRef.current = null;
      setActiveDrag(null);
      setTimeout(() => { justDraggedRef.current = false; }, 50);

      if (!session || !session.hasMoved) return;

      const { positions, sortedIds } = session.currentResult;
      Object.entries(positions).forEach(([evId, xPos]) => {
        const orig = events.find((ev) => ev.id === evId);
        if (!orig || orig.relativeOffset !== xPos) onUpdateEventOffset(evId, xPos);
      });

      const initialOrder = session.initialItems.map((it) => it.id);
      if (sortedIds.some((id, idx) => id !== initialOrder[idx])) {
        onReorderTrackEvents?.(track.id, sortedIds);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleCardClick = (event: TimelineEvent) => {
    if (justDraggedRef.current) return;
    onEditEvent(event);
  };

  const handleNativeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/novelore-event-id");
    if (eventId && onMoveEvent) onMoveEvent(eventId, track.id);
    else onTrackDrop?.(e, track.id);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onTrackDragOver?.(e, track.id); }}
      onDrop={handleNativeDrop}
      className="flex flex-col gap-2 p-3 sm:p-4 rounded-3xl bg-[var(--bg-surface)] select-none transition-all border border-[var(--border-subtle)]"
    >
      <TimelineTrackRowHeader
        track={track}
        eventCount={events.length}
        isDraggable={isDraggable}
        onFocusTrack={onFocusTrack}
        onEditTrack={onEditTrack}
        onDeleteTrack={onDeleteTrack}
        onAddEventToTrack={onAddEventToTrack}
        onTrackDragStart={onTrackDragStart}
      />

      <div className="relative w-full h-64 overflow-x-auto overflow-y-hidden custom-scroll-x rounded-2xl bg-[var(--bg-card)]/30">
        {events.length === 0 ? (
          <div
            onClick={() => onAddEventToTrack(track.id)}
            className="w-72 h-48 m-4 rounded-2xl border border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)]/20 transition-all cursor-pointer select-none font-novel-sans"
          >
            <Plus className="w-5 h-5 opacity-60" />
            <span>Añadir primer evento</span>
          </div>
        ) : (
          <div style={{ width: `${trackWidth}px` }} className="relative h-full select-none">
            {/* Línea conductora horizontal acotada estrictamente del primer al último evento */}
            {sortedEvents.length >= 2 && (
              <div
                className="absolute top-[120px] h-0.5 rounded-full pointer-events-none"
                style={{
                  left: `${sortedEvents[0].x + TIMELINE_CARD_WIDTH / 2}px`,
                  width: `${sortedEvents[sortedEvents.length - 1].x - sortedEvents[0].x}px`,
                  backgroundColor: track.color || "var(--accent)",
                  opacity: 0.35,
                }}
              />
            )}

            {/* Enlaces conectores con etiquetas de intervalo entre eventos contiguos */}
            {sortedEvents.map((ev, i) => {
              const next = sortedEvents[i + 1];
              if (!next) return null;
              return (
                <TimelineTrackGapLink
                  key={`gap-${ev.id}-${next.id}`}
                  startEv={ev}
                  nextEv={next}
                  trackColor={track.color || "var(--accent)"}
                  cardWidth={TIMELINE_CARD_WIDTH}
                  onUpdateEventGap={onUpdateEventGap}
                />
              );
            })}

            {/* Tarjetas de eventos independientes en posición X absoluta */}
            {eventsWithX.map((event) => (
              <div
                key={event.id}
                style={{
                  position: "absolute",
                  left: `${event.x}px`,
                  top: "24px",
                  zIndex: activeDrag?.dragId === event.id ? 40 : 20,
                }}
              >
                <TimelineReducedCard
                  event={event}
                  trackColor={track.color}
                  onClick={handleCardClick}
                  onPointerDown={(e) => handleCardPointerDown(e, event)}
                  onContextMenu={onEventContextMenu}
                  isDragging={activeDrag?.dragId === event.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
