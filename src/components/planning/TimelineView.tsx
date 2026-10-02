import React from "react";
import { TimelineViewProps } from "./timeline/timelineTypes";
import { useTimelineLogic } from "./timeline/useTimelineLogic";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { TimelineTrackRow } from "./timeline/TimelineTrackRow";
import { TimelineEventModal } from "./timeline/TimelineEventModal";
import { TimelineTrackModal } from "./timeline/TimelineTrackModal";
import { TimelinePlaneModal } from "./timeline/TimelinePlaneModal";
import { Layers } from "lucide-react";

export const TimelineView: React.FC<TimelineViewProps> = ({
  project,
  onSelectScene,
  onOpenEntityDossier,
  onOpenEntityWhiteboard,
}) => {
  const logic = useTimelineLogic(project);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Cabecera Limpia de 1 Fila */}
      <TimelineHeader
        events={logic.events}
        activePlane={logic.activePlane}
        searchQuery={logic.searchQuery}
        onSelectPlane={logic.setTemporalPlaneFilter}
        onSearchChange={logic.setSearchQuery}
        onOpenCreateEvent={() => logic.openCreateEvent()}
        onOpenCreateTrack={logic.openCreateTrack}
        onOpenCreatePlane={logic.openCreatePlane}
        onEditPlane={logic.openEditPlane}
      />

      {/* Contenedor de Carriles de Tiempo */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {logic.tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Layers className="w-10 h-10 text-[var(--text-muted)] opacity-40 mb-3" />
            <h3 className="font-semibold text-sm text-[var(--text-main)] mb-1">
              No hay pistas cronológicas
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4">
              Crea tu primera pista para comenzar a ubicar acontecimientos en el tiempo.
            </p>
            <button
              type="button"
              onClick={logic.openCreateTrack}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 shadow-xs transition-all cursor-pointer"
            >
              Crear primera pista
            </button>
          </div>
        ) : (
          logic.tracks
            .filter((track) => !logic.activeTrackId || track.id === logic.activeTrackId)
            .map((track) => (
              <TimelineTrackRow
                key={track.id}
                track={track}
                events={logic.eventsByTrack.get(track.id) || []}
                allScenes={logic.flattenedScenes}
                allCodexEntities={logic.allCodexEntities}
                onEditTrack={logic.openEditTrack}
                onDeleteTrack={logic.deleteTrack}
                onAddEventToTrack={(trackId) => logic.openCreateEvent(trackId)}
                onEditEvent={logic.openEditEvent}
                onDeleteEvent={logic.deleteEvent}
                onMoveEvent={logic.moveEventToTrack}
                onSelectScene={onSelectScene}
                onOpenEntityDossier={onOpenEntityDossier}
              />
            ))
        )}
      </div>

      {/* Ficha Grande de Evento */}
      {logic.isEventModalOpen && logic.eventModalData && (
        <TimelineEventModal
          initialData={logic.eventModalData}
          project={project}
          tracks={logic.tracks}
          scenes={logic.flattenedScenes}
          allCodexEntities={logic.allCodexEntities}
          onSave={logic.handleSaveEvent}
          onClose={() => logic.setIsEventModalOpen(false)}
          onOpenEntityDossier={onOpenEntityDossier}
          onOpenEntityWhiteboard={onOpenEntityWhiteboard}
          onSelectScene={onSelectScene}
        />
      )}

      {/* Modal de Pistas */}
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
