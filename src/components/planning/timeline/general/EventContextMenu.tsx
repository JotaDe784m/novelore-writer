import React, { useState, useEffect, useRef } from "react";
import { Copy, Trash2, ArrowRightLeft, ChevronRight, Check } from "lucide-react";
import { TimelineEvent, TimelineTrack } from "../../../../types";
import { TemporalPlaneDefinition } from "../../../../stores/planningStoreTypes";

interface EventContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  event: TimelineEvent | null;
  tracks?: TimelineTrack[];
  planes?: TemporalPlaneDefinition[];
  onClose: () => void;
  onDelete: (eventId: string) => void;
  onDuplicate: (eventId: string) => void;
  onMoveToTrack: (eventId: string, targetTrackId: string) => void;
}

export const EventContextMenu: React.FC<EventContextMenuProps> = ({
  isOpen,
  position,
  event,
  tracks = [],
  planes = [],
  onClose,
  onDelete,
  onDuplicate,
  onMoveToTrack,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowMoveSubmenu(false);
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

  if (!isOpen || !event) return null;

  // Ajustar posición para que no desborde la ventana
  const menuWidth = 220;
  const menuHeight = 180;
  const adjustedX = Math.min(position.x, window.innerWidth - menuWidth - 16);
  const adjustedY = Math.min(position.y, window.innerHeight - menuHeight - 16);

  // Agrupar líneas de tiempo por plano
  const safePlanes = planes || [];
  const safeTracks = tracks || [];

  const planeMap = new Map<string, { plane: TemporalPlaneDefinition; tracks: TimelineTrack[] }>();
  safePlanes.forEach((pl) => {
    planeMap.set(pl.id, { plane: pl, tracks: [] });
  });

  const unassignedTracks: TimelineTrack[] = [];
  safeTracks.forEach((tr) => {
    if (tr.planeId && planeMap.has(tr.planeId)) {
      planeMap.get(tr.planeId)!.tracks.push(tr);
    } else {
      unassignedTracks.push(tr);
    }
  });

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-[80] w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl p-1.5 text-xs text-[var(--text-primary)] select-none animate-in fade-in zoom-in-95 duration-100 font-novel-sans"
    >
      <div className="px-2.5 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]/50 mb-1 truncate">
        {event.title || "Acontecimiento"}
      </div>

      {/* 1. Duplicar */}
      <button
        type="button"
        onClick={() => {
          onDuplicate(event.id);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[var(--bg-surface-hover)] text-left cursor-pointer transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Duplicar</span>
      </button>

      {/* 2. Mover a otra línea de tiempo */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowMoveSubmenu((prev) => !prev)}
          onMouseEnter={() => setShowMoveSubmenu(true)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-[var(--bg-surface-hover)] text-left cursor-pointer transition-colors ${
            showMoveSubmenu ? "bg-[var(--bg-surface-hover)] text-[var(--accent)]" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="truncate">Mover a...</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>

        {showMoveSubmenu && (
          <div
            className={`absolute ${adjustedX + menuWidth + 260 > window.innerWidth ? "right-full mr-1.5" : "left-full ml-1.5"} top-0 w-64 max-h-72 overflow-y-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl p-2 z-[90] custom-scroll animate-in fade-in zoom-in-95 duration-100`}
            onMouseLeave={() => setShowMoveSubmenu(false)}
          >
            <div className="px-2 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]/50 mb-1">
              Elegir línea de tiempo
            </div>

            {Array.from(planeMap.values()).map(({ plane, tracks: plTracks }) => {
              if (plTracks.length === 0) return null;
              return (
                <div key={plane.id} className="mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-[var(--text-muted)]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: plane.color || "var(--accent)" }}
                    />
                    <span className="truncate">{plane.name}</span>
                  </div>
                  {plTracks.map((tr) => {
                    const isCurrent = tr.id === event.trackId;
                    return (
                      <button
                        key={tr.id}
                        type="button"
                        disabled={isCurrent}
                        onClick={() => {
                          onMoveToTrack(event.id, tr.id);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          isCurrent
                            ? "opacity-50 cursor-default bg-black/5 dark:bg-white/5"
                            : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: tr.color || "var(--accent)" }}
                          />
                          <span className="truncate">{tr.name}</span>
                        </div>
                        {isCurrent && <Check className="w-3 h-3 text-[var(--accent)]" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {unassignedTracks.length > 0 && (
              <div className="mb-1">
                <div className="px-2 py-1 text-[10px] font-bold text-[var(--text-muted)]">
                  Líneas generales
                </div>
                {unassignedTracks.map((tr) => {
                  const isCurrent = tr.id === event.trackId;
                  return (
                    <button
                      key={tr.id}
                      type="button"
                      disabled={isCurrent}
                      onClick={() => {
                        onMoveToTrack(event.id, tr.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? "opacity-50 cursor-default bg-black/5 dark:bg-white/5"
                          : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: tr.color || "var(--accent)" }}
                        />
                        <span className="truncate">{tr.name}</span>
                      </div>
                      {isCurrent && <Check className="w-3 h-3 text-[var(--accent)]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border-subtle)]/60 my-1" />

      {/* 3. Eliminar */}
      <button
        type="button"
        onClick={() => {
          onDelete(event.id);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-red-500 hover:bg-red-500/10 text-left cursor-pointer transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Eliminar acontecimiento</span>
      </button>
    </div>
  );
};
