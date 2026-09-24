import React from "react";
import { Type, ChevronDown, Plus, Minus } from "lucide-react";

interface RibbonTypographyGroupProps {
  currentFontLabel: string;
  onOpenFontMenu: (e: React.MouseEvent) => void;
  fontSize: number;
  onUpdateFontSize: (size: number) => void;
}

export const RibbonTypographyGroup: React.FC<RibbonTypographyGroupProps> = ({
  currentFontLabel,
  onOpenFontMenu,
  fontSize,
  onUpdateFontSize,
}) => {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        id="ribbon-font-selector"
        onClick={onOpenFontMenu}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer max-w-[130px] sm:max-w-[155px] truncate"
        title="Cambiar tipografía del manuscrito"
      >
        <Type className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
        <span className="truncate">{currentFontLabel}</span>
        <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
      </button>

      {/* Font Size Step Controls */}
      <div className="flex items-center rounded-lg p-0.5 bg-[var(--bg-surface-hover)]">
        <button
          type="button"
          id="font-size-decrease-btn"
          onClick={() => onUpdateFontSize(Math.max(10, fontSize - 1))}
          className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
          title="Reducir tamaño de letra"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span
          className="px-1.5 text-xs font-mono font-bold text-[var(--text-primary)] min-w-[24px] text-center select-none"
          title="Tamaño actual de letra"
        >
          {fontSize}
        </span>
        <button
          type="button"
          id="font-size-increase-btn"
          onClick={() => onUpdateFontSize(Math.min(36, fontSize + 1))}
          className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
          title="Aumentar tamaño de letra"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

