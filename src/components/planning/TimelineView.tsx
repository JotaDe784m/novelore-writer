import React, { useState } from "react";
import { TimelineViewProps } from "./timeline/timelineTypes";
import { useTimelineLogic } from "./timeline/useTimelineLogic";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { TimelineGeneralView } from "./timeline/TimelineGeneralView";
import { TimelineFocusedView } from "./timeline/TimelineFocusedView";
import { TimelineEventModal } from "./timeline/TimelineEventModal";
import { TimelineTrackModal } from "./timeline/TimelineTrackModal";
import { TimelinePlaneModal } from "./timeline/TimelinePlaneModal";
import { EventContextMenu } from "./timeline/general/EventContextMenu";
import { TimelineEvent } from "../../types";

export const TimelineView: React.FC<TimelineViewProps> = ({
  project,
  onSelectScene,
  onOpenEntityDossier,
  onOpenEntityWhiteboard,
}) => {
  const logic = useTimelineLogic(project);

  const [contextMenuState, setContextMenuState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    event: TimelineEvent | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    event: null,
  });

  const handleOpenContextMenu = (e: React.MouseEvent, event: TimelineEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuState({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      event,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenuState((prev) => ({ ...prev, isOpen: false }));
  };

  const focusedTrack = logic.focusedTrackId
    ? logic.tracks.find((t) => t.id === logic.focusedTrackId) || null
    : null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[var(--bg-main)]">
      {/* Vista en Primer Plano (si una pista está enfocada) */}
      {focusedTrack ? (
        <TimelineFocusedView
          track={focusedTrack}
          events={logic.eventsByTrack.get(focusedTrack.id) || []}
          onBack={() => logic.setFocusedTrackId(null)}
          onEditEvent={logic.openEditEvent}
          onAddEventToTrack={(trackId) => logic.openCreateEvent(trackId)}
          onEditTrack={logic.openEditTrack}
          onEventContextMenu={handleOpenContextMenu}
        />
      ) : (
        /* Vista General Panorámica */
        <>
          <TimelineHeader
            events={logic.events}
            tracks={logic.tracks}
            activePlane={logic.activePlane}
            searchQuery={logic.searchQuery}
            onSelectPlane={logic.setTemporalPlaneFilter}
            onSearchChange={logic.setSearchQuery}
            onOpenCreateTrack={logic.openCreateTrack}
            onOpenCreatePlane={logic.openCreatePlane}
            onEditPlane={logic.openEditPlane}
          />

          <TimelineGeneralView
            tracks={logic.tracks}
            eventsByTrack={logic.eventsByTrack}
            activePlane={logic.activePlane}
            onFocusTrack={(trackId) => logic.setFocusedTrackId(trackId)}
            onEditTrack={logic.openEditTrack}
            onDeleteTrack={logic.deleteTrack}
            onAddEventToTrack={(trackId) => logic.openCreateEvent(trackId)}
            onEditEvent={logic.openEditEvent}
            onUpdateEventGap={logic.updateEventGap}
            onUpdateEventOffset={logic.updateEventOffset}
            onMoveEvent={logic.moveEventToTrack}
            onOpenCreateTrack={logic.openCreateTrack}
            onReorderTracks={logic.reorderTracks}
            onReorderTrackEvents={logic.reorderEvents}
            onEventContextMenu={handleOpenContextMenu}
          />
        </>
      )}

      {/* Menú Contextual de Clic Derecho para Acontecimientos */}
      <EventContextMenu
        isOpen={contextMenuState.isOpen}
        position={contextMenuState.position}
        event={contextMenuState.event}
        tracks={logic.tracks}
        planes={logic.temporalPlanes}
        onClose={handleCloseContextMenu}
        onDelete={logic.deleteEvent}
        onDuplicate={logic.duplicateEvent}
        onMoveToTrack={(eventId, targetTrackId) => {
          logic.moveEventToTrack(eventId, targetTrackId);
          handleCloseContextMenu();
        }}
      />

      {/* Dossier Completo de Evento */}
      {logic.isEventModalOpen && logic.eventModalData && (
        <TimelineEventModal
          initialData={logic.eventModalData}
          project={project}
          tracks={logic.tracks}
          scenes={logic.flattenedScenes}
          allCodexEntities={logic.allCodexEntities}
          onSave={logic.handleSaveEvent}
          onDelete={logic.deleteEvent}
          onClose={() => logic.setIsEventModalOpen(false)}
          onOpenEntityDossier={onOpenEntityDossier}
          onOpenEntityWhiteboard={onOpenEntityWhiteboard}
          onSelectScene={onSelectScene}
        />
      )}

      {/* Modal de Líneas de Tiempo (Pistas) */}
      {logic.isTrackModalOpen && logic.trackModalData && (
        <TimelineTrackModal
          initialData={logic.trackModalData}
          onSave={logic.handleSaveTrack}
          onClose={() => logic.setIsTrackModalOpen(false)}
        />
      )}

      {/* Modal de Planos Temporales */}
      {logic.isPlaneModalOpen && (
        <TimelinePlaneModal
          isOpen={logic.isPlaneModalOpen}
          onClose={() => logic.setIsPlaneModalOpen(false)}
          editingPlane={logic.editingPlane}
        />
      )}
    </div>
  );
};
