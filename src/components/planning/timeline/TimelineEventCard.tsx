import React, { useState } from "react";
import { Edit2, Trash2, BookOpen, User, MapPin, Bookmark } from "lucide-react";
import { TimelineEvent, CodexEntity } from "../../../types";
import { getPlaneMeta } from "../../../utils/planningDefaults";
import { resolveEventEntities } from "../../../utils/planningSync";
import { usePlanningStore } from "../../../stores/usePlanningStore";

interface TimelineEventCardProps {
  event: TimelineEvent;
  trackColor?: string;
  allCodexEntities: CodexEntity[];
  sceneTitle?: string;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: string) => void;
  onSelectScene?: (sceneId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
  onDropOnCard?: (draggedEventId: string, targetEventId: string, position: "before" | "after") => void;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  trackColor = "#6366f1",
  allCodexEntities,
  sceneTitle,
  onEdit,
  onDelete,
  onSelectScene,
  onOpenEntityDossier,
  onDropOnCard,
}) => {
  const temporalPlanes = usePlanningStore((s) => s.temporalPlanes);
  const planeMeta = getPlaneMeta(event.temporalPlane, temporalPlanes);
  const resolved = resolveEventEntities(event, allCodexEntities);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeft = e.clientX < rect.left + rect.width / 2;
    setDropPosition(isLeft ? "before" : "after");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("text/novelore-event-id");
    const pos = dropPosition;
    setDropPosition(null);
    if (draggedId && draggedId !== event.id && onDropOnCard) {
      onDropOnCard(draggedId, event.id, pos || "before");
    }
  };

  return (
    <div
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/novelore-event-id", event.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col justify-between w-72 min-w-[18rem] max-w-[18rem] rounded-xl p-3.5 transition-all select-none hover:shadow-md cursor-grab active:cursor-grabbing ${
        dropPosition ? "ring-1 ring-[var(--accent)]" : ""
      }`}
      style={{
        backgroundColor: "var(--bg-card)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onClick={() => onEdit(event)}
    >
      {/* Indicadores visuales de inserción antes / después */}
      {dropPosition === "before" && (
        <div className="absolute -left-1.5 top-2 bottom-2 w-1 bg-[var(--accent)] rounded-full shadow-md z-20 pointer-events-none" />
      )}
      {dropPosition === "after" && (
        <div className="absolute -right-1.5 top-2 bottom-2 w-1 bg-[var(--accent)] rounded-full shadow-md z-20 pointer-events-none" />
      )}

      {/* Franja de Color de Pista */}
      <div
        className="absolute top-0 left-4 right-4 h-0.5 rounded-full opacity-60"
        style={{ backgroundColor: trackColor }}
      />

      {/* Cabecera: Fecha + Chip de Plano */}
      <div className="flex items-center justify-between gap-2 mb-2 pt-1 text-[11px]">
        <div className="flex items-center gap-1.5 font-mono text-[var(--text-muted)] truncate">
          {event.date ? (
            <span>{event.date}</span>
          ) : (
            <span className="opacity-40 italic">Sin fecha</span>
          )}
        </div>

        <span
          className="px-2 py-0.5 rounded-full font-medium text-[10px] shrink-0"
          style={{
            backgroundColor: planeMeta.badgeBg || "rgba(99, 102, 241, 0.12)",
            color: planeMeta.badgeText || planeMeta.color,
          }}
        >
          {planeMeta.shortLabel}
        </span>
      </div>

      {/* Título */}
      <h4 className="font-semibold text-sm leading-snug text-[var(--text-main)] mb-1.5 line-clamp-2">
        {event.title}
      </h4>

      {/* Resumen */}
      {event.summary && (
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3 leading-relaxed">
          {event.summary}
        </p>
      )}

      {/* Vínculos */}
      <div className="flex flex-col gap-1.5 mt-auto pt-2">
        {event.sceneId && sceneTitle && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectScene?.(event.sceneId!);
            }}
            className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline truncate text-left cursor-pointer"
            title="Ir a escena en manuscrito"
          >
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">{sceneTitle}</span>
          </button>
        )}

        {resolved.codexEvent && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenEntityDossier?.(resolved.codexEvent!.id);
            }}
            className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] truncate text-left cursor-pointer"
            title="Ver evento en el Códice"
          >
            <Bookmark className="w-3 h-3 shrink-0" />
            <span className="truncate font-medium">{resolved.codexEvent.name}</span>
          </button>
        )}

        {(resolved.characters.length > 0 || resolved.location) && (
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            {resolved.location && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEntityDossier?.(resolved.location!.id);
                }}
                className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                title={`Lugar: ${resolved.location.name}`}
              >
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate max-w-[80px]">{resolved.location.name}</span>
              </span>
            )}
            {resolved.characters.map((char) => (
              <span
                key={char.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEntityDossier?.(char.id);
                }}
                className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                title={`Personaje: ${char.name}`}
              >
                <User className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate max-w-[80px]">{char.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Acciones Hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[var(--bg-card)]/90 backdrop-blur-xs p-1 rounded-md shadow-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(event);
          }}
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          title="Editar evento"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event.id);
          }}
          className="p-1 rounded text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
          title="Eliminar evento"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
