import React from "react";
import { BookOpen, Calendar, Link2, MoreVertical, Sparkles } from "lucide-react";
import { TimelineEvent } from "../../../types";
import { resolveAssetUrl } from "../../../utils/imageUtils";

interface TimelineDetailedCardProps {
  event: TimelineEvent;
  trackColor?: string;
  mentionCount?: number;
  linkCount?: number;
  onClick: (event: TimelineEvent) => void;
  onContextMenu?: (e: React.MouseEvent, event: TimelineEvent) => void;
  className?: string;
}

export const TimelineDetailedCard: React.FC<TimelineDetailedCardProps> = ({
  event,
  trackColor = "var(--accent)",
  mentionCount = 0,
  linkCount = 0,
  onClick,
  onContextMenu,
  className = "",
}) => {
  const accentColor = event.color || trackColor || "#10b981";
  const rawImg = event.avatarUrl || event.gallery?.[0]?.url;
  const imageSrc = rawImg ? resolveAssetUrl(rawImg) : null;
  const initials = (event.title || "Ev")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "EV";

  const dateLabel = event.date || event.dateOrEpoch || event.era || "Sin fecha asignada";
  const effectiveLinkCount = linkCount || (event.linkedManuscriptItems?.length || 0) + (event.sceneId ? 1 : 0);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(event)}
      onKeyDown={(e) => e.key === "Enter" && onClick(event)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e, event);
      }}
      className={`group relative flex rounded-3xl p-4 sm:p-5 transition-all duration-200 cursor-pointer select-none hover:shadow-xl hover:-translate-y-0.5 border-2 text-left bg-[var(--bg-card)] gap-4 sm:gap-5 w-[34rem] min-w-[34rem] sm:w-[38rem] sm:min-w-[38rem] md:w-[42rem] md:min-w-[42rem] shrink-0 ${className}`}
      style={{
        borderColor: accentColor,
        "--accent": accentColor,
        "--accent-readable": accentColor,
        "--accent-subtle": `${accentColor}18`,
      } as React.CSSProperties}
    >
      {/* 1. Retrato en Proporción 3:4 a la izquierda idéntico al Códex */}
      <div className="w-36 sm:w-40 md:w-44 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 relative bg-[var(--bg-surface)] border border-[var(--border-color)]/50 shadow-xs">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-novel-display text-3xl font-bold text-white drop-shadow-md"
            style={{
              backgroundColor: accentColor,
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* 2. Sección de Contenido Editorial (Estilo Foto 5) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Ubicación temporal o fecha por encima del título */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-sans font-medium mb-1 tracking-wide">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" />
            <span className="truncate">{dateLabel}</span>
          </div>

          {/* Título y Subtítulo */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-novel-display text-xl sm:text-2xl font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors truncate tracking-tight leading-snug">
                {event.title || "Acontecimiento"}
              </h3>
              {event.subtitle ? (
                <p className="font-sans text-xs sm:text-sm text-[var(--text-muted)] truncate mt-0.5">
                  {event.subtitle}
                </p>
              ) : (
                <div className="h-4" />
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu?.(e, event);
              }}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors shrink-0 cursor-pointer -mr-1"
              title="Opciones del evento"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Espacio Determinado para Descripción Corta con line-clamp-4 y puntos suspensivos */}
          <div className="mt-2.5 h-[4.75rem] overflow-hidden">
            <p className="font-novel-serif text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-4 leading-relaxed">
              {event.summary || "Sin descripción corta registrada para este evento."}
            </p>
          </div>
        </div>

        {/* 3. Fila Inferior: Categoría/Tags a la izquierda, Cápsulas a la derecha */}
        <div className="mt-3 pt-2.5 flex items-end justify-between gap-3 border-t border-[var(--border-color)]/50">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-sans text-xs text-[var(--text-muted)] font-medium">
              <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
              <span className="truncate">Evento de Línea</span>
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-7 overflow-hidden">
                {event.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className="px-2 py-0.5 rounded-full font-sans text-[10px] bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-color)]/40 truncate max-w-[100px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dos Cápsulas Apiladas: Menciones Literarias y Vínculos */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] text-xs font-sans font-semibold border border-[var(--border-color)]/50 shadow-2xs group-hover:border-[var(--accent)]/30 transition-colors"
              title={`${mentionCount} menciones en el manuscrito`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
              <span>{mentionCount}</span>
            </div>

            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] text-xs font-sans font-semibold border border-[var(--border-color)]/50 shadow-2xs group-hover:border-[var(--accent)]/30 transition-colors"
              title={`${effectiveLinkCount} vínculos en manuscrito`}
            >
              <Link2 className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
              <span>{effectiveLinkCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
