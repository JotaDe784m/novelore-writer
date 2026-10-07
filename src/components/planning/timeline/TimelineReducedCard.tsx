import React from "react";
import { TimelineEvent } from "../../../types";
import { Clock, GripVertical } from "lucide-react";

interface TimelineReducedCardProps {
  event: TimelineEvent;
  trackColor?: string;
  onClick: (event: TimelineEvent) => void;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: React.MouseEvent, event: TimelineEvent) => void;
  isDragging?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TimelineReducedCard: React.FC<TimelineReducedCardProps> = ({
  event,
  trackColor = "var(--accent)",
  onClick,
  onPointerDown,
  onContextMenu,
  isDragging = false,
  className = "",
  style,
}) => {
  const accentColor = event.color || trackColor;

  return (
    <div
      onPointerDown={onPointerDown}
      onClick={() => onClick(event)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e, event);
      }}
      className={`group relative flex flex-col justify-between w-72 min-w-[18rem] max-w-[18rem] h-48 rounded-2xl p-4 sm:p-4.5 select-none bg-[var(--bg-card)] border-2 transition-[box-shadow,transform] ${
        isDragging
          ? "cursor-grabbing shadow-2xl scale-[1.02] ring-2 ring-[var(--accent)] z-30"
          : "cursor-grab active:cursor-grabbing hover:shadow-xl"
      } ${className}`}
      style={{
        borderColor: accentColor,
        ...style,
      }}
      title="Arrastra para reubicar libremente, clic derecho para opciones o clic para abrir"
    >
      {/* 1. Encabezado: Grip de arrastre entre líneas, Fecha o ubicación temporal y punto de identidad */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData("text/novelore-event-id", event.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
            title="Arrastra para mover a otra línea de tiempo"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <Clock
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: accentColor }}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] truncate font-mono">
            {event.date || "Sin fecha asignada"}
          </span>
        </div>
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      {/* 2. Cuerpo Central: Título espacioso y Subtítulo editorial */}
      <div className="my-auto min-w-0 py-1.5 space-y-1">
        <h4 className="font-bold text-base font-novel-display text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors">
          {event.title || "Acontecimiento sin título"}
        </h4>
        <p className="text-xs font-novel-serif italic text-[var(--text-secondary)] truncate">
          {event.subtitle || "Sin subtítulo narrativo"}
        </p>
      </div>

      {/* 3. Zona Inferior: Síntesis editorial respirable */}
      <div className="min-w-0 pt-2 border-t border-[var(--border-subtle)] shrink-0">
        <p className="text-xs font-novel-serif text-[var(--text-muted)] line-clamp-3 leading-relaxed">
          {event.summary || (
            <span className="italic opacity-60">Sin descripción corta añadida.</span>
          )}
        </p>
      </div>
    </div>
  );
};
