import React, { useEffect } from "react";
import { ArrowLeft, Plus, Edit2 } from "lucide-react";
import { TimelineTrack, TimelineEvent } from "../../../types";
import { TimelineDetailedCard } from "./TimelineDetailedCard";

interface TimelineFocusedViewProps {
  track: TimelineTrack;
  events: TimelineEvent[];
  onBack: () => void;
  onEditEvent: (event: TimelineEvent) => void;
  onAddEventToTrack: (trackId: string) => void;
  onEditTrack: (track: TimelineTrack) => void;
  onEventContextMenu?: (e: React.MouseEvent, event: TimelineEvent) => void;
}

export const TimelineFocusedView: React.FC<TimelineFocusedViewProps> = ({
  track,
  events,
  onBack,
  onEditEvent,
  onAddEventToTrack,
  onEditTrack,
  onEventContextMenu,
}) => {
  // Atajo de teclado Esc para volver a la vista general
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  const trackColor = track.color || "var(--accent)";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[var(--bg-main)]">
      {/* Barra Superior de Primer Plano */}
      <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)]/60 bg-[var(--bg-surface)] shrink-0">
        {/* Lado Izquierdo: Botón de retorno en cápsula + Miga de Pan */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] border border-[var(--border-color)]/70 shadow-2xs transition-all cursor-pointer"
            title="Volver a la vista de líneas de tiempo (Esc)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Líneas de Tiempo</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
            <span>/</span>
            <div className="flex items-center gap-1.5 text-[var(--text-main)] font-bold font-novel-display">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: trackColor }}
              />
              <span>{track.name}</span>
            </div>
            <button
              type="button"
              onClick={() => onEditTrack(track)}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Editar línea de tiempo"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Lado Derecho: Botón Nuevo Evento */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onAddEventToTrack(track.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Evento</span>
          </button>
        </div>
      </div>

      {/* Contenedor de Fichas Detalladas */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {events.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h4 className="font-bold text-sm font-novel-display text-[var(--text-main)] mb-1">
              Esta línea de tiempo aún no contiene acontecimientos
            </h4>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4 font-novel-serif">
              Añade el primer evento para comenzar a detallar la cronología de esta trama.
            </p>
            <button
              type="button"
              onClick={() => onAddEventToTrack(track.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Primer Evento</span>
            </button>
          </div>
        ) : (
          /* Carril de línea de tiempo horizontal centrado */
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scroll relative">
            <div className="min-w-max min-h-full flex flex-col justify-center px-12 py-12">
              {/* Fila de Tarjetas Detalladas con eje horizontal central por DETRÁS de las tarjetas */}
              <div className="relative isolate flex items-center gap-8">
                {/* Eje horizontal de línea de tiempo: cruza el centro exacto de las tarjetas por detrás */}
                <div
                  className="absolute -left-12 -right-12 pointer-events-none -z-10 transition-all duration-300"
                  style={{
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: "2px",
                    backgroundColor: trackColor,
                    opacity: 0.45,
                  }}
                />

                {events.map((event) => (
                  <TimelineDetailedCard
                    key={event.id}
                    event={event}
                    trackColor={track.color}
                    onClick={onEditEvent}
                    onContextMenu={onEventContextMenu}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
