import React, { useState } from "react";
import { resolveAssetUrl } from "../../../utils/imageUtils";

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
  const [avatarError, setAvatarError] = useState(false);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative group flex items-start gap-3.5 p-3 rounded-2xl bg-[var(--bg-sidebar)] hover:bg-[var(--bg-surface-hover)]/40 transition-colors border border-[var(--border-subtle)]/30 shadow-2xs">
      {/* Retrato vertical en proporcion 3:4 */}
      <div
        className="w-14 sm:w-16 aspect-[3/4] rounded-xl overflow-hidden shrink-0 shadow-xs relative bg-[var(--bg-card)] border transition-all"
        style={{ borderColor: color }}
      >
        {avatarUrl && !avatarError ? (
          <img
            src={resolveAssetUrl(avatarUrl)}
            alt={name}
            onError={() => setAvatarError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-white p-1 text-center font-bold text-xs"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Contenido: Nombre, Subtitulo y Botones */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate leading-tight">
              {name}
            </h4>

            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="text-[11px] text-[var(--text-muted)] hover:text-red-500 transition-colors px-1.5 py-0.5 rounded cursor-pointer shrink-0"
                title={removeLabel}
              >
                {removeLabel}
              </button>
            )}
          </div>

          {subtitle && (
            <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Fila de acciones (Pizarra, Ficha, o accion personalizada) */}
        <div className="flex items-center gap-1.5 mt-2">
          {onOpenWhiteboard && (
            <button
              type="button"
              onClick={onOpenWhiteboard}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[var(--bg-app)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Pizarra
            </button>
          )}
          {onOpenDossier && (
            <button
              type="button"
              onClick={onOpenDossier}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
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
