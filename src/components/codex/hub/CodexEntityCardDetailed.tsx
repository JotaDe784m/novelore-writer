import React from "react";
import { BookOpen, Compass, Gem, Link2, MapPin, MoreVertical, Shield, Sparkles, User, Zap } from "lucide-react";
import { WorldEntity } from "../../../types";
import { getDefaultCategoryColor, getCategoryLabel } from "../../../utils/codexDefaults";
import { resolveAssetUrl } from "../../../utils/imageUtils";
import { useCodexStore } from "../../../stores/useCodexStore";

export interface CodexEntityCardDetailedProps {
  entity: WorldEntity;
  relationshipCount: number;
  mentionCount: number;
  projectPath?: string;
  isDragging?: boolean;
  isOver?: boolean;
  onEdit: (entity: WorldEntity) => void;
  onContextMenu?: (e: React.MouseEvent, entity: WorldEntity) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  character: User, location: MapPin, faction: Shield, item: Gem, concept: Zap, other: Sparkles,
};

export const CodexEntityCardDetailed: React.FC<CodexEntityCardDetailedProps> = ({
  entity,
  relationshipCount,
  mentionCount,
  projectPath,
  isDragging,
  isOver,
  onEdit,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const customCategories = useCodexStore((s) => s.customEntityCategories);
  const categoryColor = getDefaultCategoryColor(entity.category, customCategories);
  const accentColor = entity.color || categoryColor || "#10b981";
  const categoryLabel = getCategoryLabel(entity.category, customCategories);
  const CategoryIcon = CATEGORY_ICONS[entity.category] || Compass;

  const rawImg = entity.avatarUrl || entity.gallery?.[0]?.url;
  const imageSrc = resolveAssetUrl(rawImg, projectPath);
  const initials = entity.name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={Boolean(onDragStart)}
      onDragStart={(e) => onDragStart?.(e, entity.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, entity.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.(e, entity.id);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onEdit(entity)}
      onKeyDown={(e) => e.key === "Enter" && onEdit(entity)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu?.(e, entity);
      }}
      className={`group relative flex rounded-3xl p-4 sm:p-5 transition-all duration-200 cursor-pointer select-none hover:shadow-xl hover:-translate-y-0.5 border-2 text-left bg-[var(--bg-card)] gap-4 sm:gap-5 ${
        isDragging ? "opacity-30 scale-95 border-dashed" : isOver ? "scale-[1.02] ring-2 ring-[var(--accent)]" : ""
      }`}
      style={{
        borderColor: accentColor,
        "--accent": accentColor,
        "--accent-readable": accentColor,
        "--accent-subtle": `${accentColor}18`,
      } as React.CSSProperties}
    >
      {/* 1. Retrato en Proporción 3:4 a la izquierda con escala fluida */}
      <div className="w-28 sm:w-32 md:w-36 lg:w-40 xl:w-44 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 relative bg-[var(--bg-surface)] border border-[var(--border-color)]/50 shadow-xs">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={entity.name}
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-novel-display text-2xl sm:text-3xl font-bold text-white drop-shadow-md"
            style={{
              backgroundColor: accentColor,
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* 2. Sección de Contenido Editorial */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Título y Subtítulo */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-novel-display text-xl sm:text-2xl font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors truncate tracking-tight leading-snug">
                {entity.name}
              </h3>
              {entity.subtitle ? (
                <p className="font-sans text-xs sm:text-sm text-[var(--text-muted)] truncate mt-0.5">
                  {entity.subtitle}
                </p>
              ) : (
                <div className="h-4" />
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu?.(e, entity);
              }}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors shrink-0 cursor-pointer -mr-1"
              title="Opciones de la ficha"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Espacio Determinado para Descripción Corta con line-clamp-4 y puntos suspensivos */}
          <div className="mt-2.5 h-[4.75rem] overflow-hidden">
            <p className="font-novel-serif text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-4 leading-relaxed">
              {entity.summary || "Sin descripción corta registrada para este elemento."}
            </p>
          </div>
        </div>

        {/* 3. Fila Inferior: Categoría y Tags a la izquierda, Cápsulas a la derecha */}
        <div className="mt-3 pt-2.5 flex items-end justify-between gap-3 border-t border-[var(--border-color)]/50">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-sans text-xs text-[var(--text-muted)] font-medium">
              <span style={{ color: accentColor }} className="shrink-0 flex items-center">
                <CategoryIcon className="w-3.5 h-3.5" />
              </span>
              <span className="truncate">{categoryLabel}</span>
            </div>

            {entity.tags && entity.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-7 overflow-hidden">
                {entity.tags.slice(0, 4).map((tag, idx) => (
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
              title={`${relationshipCount} vínculos registrados`}
            >
              <Link2 className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
              <span>{relationshipCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
