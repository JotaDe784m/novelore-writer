import React, { useState, useRef } from "react";
import { EntityHoverPopover } from "./EntityHoverPopover";

export interface AvatarEntityCardProps {
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

export const AvatarEntityCard: React.FC<AvatarEntityCardProps> = ({
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
      className="relative shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={onOpenDossier}
        className="w-9 h-9 rounded-full overflow-hidden transition-all duration-150 transform hover:scale-105 hover:z-10 focus:outline-none flex items-center justify-center cursor-pointer shadow-xs"
        style={{
          boxShadow: "0 0 0 2px var(--bg-card)",
          backgroundColor: color,
        }}
        title={name}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold text-white select-none">
            {initials}
          </span>
        )}
      </button>

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
