import React, { useState, useRef } from "react";
import { EntityHoverPopover } from "./EntityHoverPopover";

export interface CompactEntityCardProps {
  name: string;
  avatarUrl?: string;
  color?: string;
  subtitle?: string;
  summary?: string;
  onOpenDossier?: () => void;
  onOpenWhiteboard?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
}

export const CompactEntityCard: React.FC<CompactEntityCardProps> = ({
  name,
  avatarUrl,
  color = "var(--accent)",
  subtitle,
  summary,
  onOpenDossier,
  onOpenWhiteboard,
  onRemove,
  removeLabel = "Quitar",
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPopover(false);
    }, 150);
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        onClick={onOpenDossier}
        className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar pequeño */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-6 h-6 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>
          )}

          {/* Información */}
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate leading-tight">
              {name}
            </p>
            {subtitle && (
              <p className="text-[10px] text-[var(--text-muted)] truncate leading-none">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Botón quitar discreto */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="opacity-0 group-hover:opacity-100 text-[10px] text-[var(--text-muted)] hover:text-red-500 transition-all p-1"
            title={removeLabel}
          >
            x
          </button>
        )}
      </div>

      {/* Popover con descripción y acciones */}
      {showPopover && (
        <EntityHoverPopover
          name={name}
          subtitle={subtitle}
          summary={summary}
          color={color}
          onOpenDossier={onOpenDossier}
          onOpenWhiteboard={onOpenWhiteboard}
          onRemove={onRemove}
          removeLabel={removeLabel}
        />
      )}
    </div>
  );
};
