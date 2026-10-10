import React, { useState, useEffect, useRef } from "react";
import {
  ZoomIn,
  Edit2,
  Trash2,
  ArrowRightLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { TimelineTrack } from "../../../../types";
import { TemporalPlaneDefinition } from "../../../../stores/planningStoreTypes";

interface TimelineColumnMenuProps {
  isOpen: boolean;
  track: TimelineTrack;
  temporalPlanes: TemporalPlaneDefinition[];
  onClose: () => void;
  onFocusTrack: (trackId: string) => void;
  onEditTrack: (track: TimelineTrack) => void;
  onMoveTrackToPlane: (trackId: string, planeId?: string) => void;
  onDeleteTrack: (trackId: string) => void;
}

export const TimelineColumnMenu: React.FC<TimelineColumnMenuProps> = ({
  isOpen,
  track,
  temporalPlanes,
  onClose,
  onFocusTrack,
  onEditTrack,
  onMoveTrackToPlane,
  onDeleteTrack,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showPlanesSubmenu, setShowPlanesSubmenu] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowPlanesSubmenu(false);
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl shadow-xl z-40 p-1.5 bg-[var(--bg-card)] border border-[var(--border-color)]/70 text-xs font-sans text-[var(--text-main)] select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* 1. Vista en Primer Plano */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onFocusTrack(track.id);
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[var(--bg-surface-hover)] text-left cursor-pointer transition-colors"
      >
        <ZoomIn className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span>Primer plano</span>
      </button>

      {/* 2. Editar línea de tiempo */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onEditTrack(track);
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[var(--bg-surface-hover)] text-left cursor-pointer transition-colors"
      >
        <Edit2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span>Editar línea</span>
      </button>

      {/* 3. Mover a plano temporal */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPlanesSubmenu((prev) => !prev)}
          onMouseEnter={() => setShowPlanesSubmenu(true)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-[var(--bg-surface-hover)] text-left cursor-pointer transition-colors ${
            showPlanesSubmenu ? "bg-[var(--bg-surface-hover)] text-[var(--accent)]" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="truncate">Mover a plano...</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>

        {showPlanesSubmenu && (
          <div
            className="absolute left-full top-0 ml-1.5 w-52 max-h-60 overflow-y-auto rounded-2xl shadow-xl z-50 p-1.5 bg-[var(--bg-card)] border border-[var(--border-color)]/70 custom-scroll animate-in fade-in zoom-in-95 duration-100"
            onMouseLeave={() => setShowPlanesSubmenu(false)}
          >
            <div className="px-2 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]/50 mb-1">
              Plano temporal
            </div>

            {/* Opción Sin plano (General) */}
            <button
              type="button"
              disabled={!track.planeId}
              onClick={() => {
                onMoveTrackToPlane(track.id, undefined);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                !track.planeId
                  ? "opacity-50 cursor-default bg-black/5 dark:bg-white/5"
                  : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)]"
              }`}
            >
              <span className="truncate">Sin plano (General)</span>
              {!track.planeId && <Check className="w-3 h-3 text-[var(--accent)]" />}
            </button>

            {/* Lista de planos temporales */}
            {temporalPlanes.map((plane) => {
              const isCurrent = track.planeId === plane.id;
              return (
                <button
                  key={plane.id}
                  type="button"
                  disabled={isCurrent}
                  onClick={() => {
                    onMoveTrackToPlane(track.id, plane.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isCurrent
                      ? "opacity-50 cursor-default bg-black/5 dark:bg-white/5"
                      : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: plane.color || "var(--accent)" }}
                    />
                    <span className="truncate">{plane.name}</span>
                  </div>
                  {isCurrent && <Check className="w-3 h-3 text-[var(--accent)]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border-color)]/50 my-1" />

      {/* 4. Eliminar línea de tiempo */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onDeleteTrack(track.id);
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-red-500 hover:bg-red-500/10 text-left cursor-pointer transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Eliminar línea</span>
      </button>
    </div>
  );
};
