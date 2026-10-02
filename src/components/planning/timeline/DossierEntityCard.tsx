import React from "react";

export interface DossierEntityCardProps {
  name: string;
  avatarUrl?: string;
  color?: string;
  subtitle?: string;
  onOpenDossier?: () => void;
  onOpenWhiteboard?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  actionButton?: React.ReactNode;
}

export const DossierEntityCard: React.FC<DossierEntityCardProps> = ({
  name,
  avatarUrl,
  color = "var(--accent)",
  subtitle,
  onOpenDossier,
  onOpenWhiteboard,
  onRemove,
  removeLabel = "Quitar",
  actionButton,
}) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative group flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-sidebar)] hover:bg-[var(--bg-surface-hover)]/40 transition-colors">
      {/* Avatar circular a la izquierda */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs ring-1 ring-black/5 dark:ring-white/5"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-xs"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
      )}

      {/* Contenido: Nombre, Subtítulo y Botones */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate leading-tight">
              {name}
            </h4>
            {subtitle && (
              <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Botón de desvincular / quitar en esquina superior */}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-[11px] text-[var(--text-muted)] hover:text-red-500 transition-colors px-1.5 py-0.5 rounded"
              title={removeLabel}
            >
              {removeLabel}
            </button>
          )}
        </div>

        {/* Fila de acciones (Pizarra, Ficha, o acción personalizada) */}
        <div className="flex items-center gap-1.5 mt-2.5">
          {onOpenWhiteboard && (
            <button
              type="button"
              onClick={onOpenWhiteboard}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[var(--bg-app)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Pizarra
            </button>
          )}
          {onOpenDossier && (
            <button
              type="button"
              onClick={onOpenDossier}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
            >
              Ficha
            </button>
          )}
          {actionButton}
        </div>
      </div>
    </div>
  );
};
