import React from "react";
import { Undo2, Redo2 } from "lucide-react";

interface RibbonHistoryGroupProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const RibbonHistoryGroup: React.FC<RibbonHistoryGroupProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="flex items-center rounded-lg p-0.5 bg-[var(--bg-surface-hover)] shrink-0">
      <button
        type="button"
        id="ribbon-undo-btn"
        disabled={!canUndo}
        onClick={onUndo}
        className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        title="Deshacer última acción (Ctrl+Z / ⌘Z)"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        id="ribbon-redo-btn"
        disabled={!canRedo}
        onClick={onRedo}
        className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        title="Rehacer acción deshecha (Ctrl+Y / ⌘Shift+Z)"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

