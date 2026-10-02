import React from "react";

export interface EntityHoverPopoverProps {
  name: string;
  subtitle?: string;
  summary?: string;
  color?: string;
  onOpenDossier?: () => void;
  onOpenWhiteboard?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  placement?: "top" | "bottom";
  align?: "center" | "left" | "right";
}

export const EntityHoverPopover: React.FC<EntityHoverPopoverProps> = ({
  name,
  subtitle,
  summary,
  color,
  onOpenDossier,
  onOpenWhiteboard,
  onRemove,
  removeLabel = "Quitar",
  placement = "top",
  align = "center",
}) => {
  const isTop = placement === "top";

  return (
    <div
      className={`absolute z-50 w-64 p-3 rounded-xl shadow-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]/50 text-[var(--text-primary)] pointer-events-auto transition-all duration-150 animate-in fade-in zoom-in-95 ${
        align === "left"
          ? "left-0"
          : align === "right"
          ? "right-0"
          : "left-1/2 -translate-x-1/2"
      } ${
        isTop ? "bottom-full mb-2.5" : "top-full mt-2.5"
      }`}
    >
      {/* Flecha de bocadillo (speech bubble) */}
      <div
        className={`absolute w-2.5 h-2.5 rotate-45 bg-[var(--bg-card)] border-[var(--border-subtle)]/50 ${
          align === "left"
            ? "left-6"
            : align === "right"
            ? "right-6"
            : "left-1/2 -translate-x-1/2"
        } ${
          isTop
            ? "bottom-[-5px] border-r border-b"
            : "top-[-5px] border-l border-t"
        }`}
      />

      {/* Cabecera del popover */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {color && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
            )}
            <h4 className="text-xs font-semibold truncate leading-tight">
              {name}
            </h4>
          </div>
          {subtitle && (
            <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-[10px] text-[var(--text-muted)] hover:text-red-500 transition-colors shrink-0 px-1"
            title={removeLabel}
          >
            {removeLabel}
          </button>
        )}
      </div>

      {/* Descripción corta / lore */}
      {summary ? (
        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-3">
          {summary}
        </p>
      ) : (
        <p className="text-[11px] text-[var(--text-muted)] italic mb-3">
          Sin descripcion registrada en el Codice
        </p>
      )}

      {/* Botones de acción planos/ghost */}
      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[var(--border-subtle)]/30">
        {onOpenWhiteboard && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenWhiteboard();
            }}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[var(--bg-app)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Pizarra
          </button>
        )}
        {onOpenDossier && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDossier();
            }}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
          >
            Ficha
          </button>
        )}
      </div>
    </div>
  );
};
