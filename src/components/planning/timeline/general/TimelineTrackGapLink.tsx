import React, { useState } from "react";
import { Clock, Plus, Check, X } from "lucide-react";
import { TimelineEvent } from "../../../../types";

interface TimelineTrackGapLinkProps {
  startEv: TimelineEvent & { x: number };
  nextEv: TimelineEvent & { x: number };
  trackColor: string;
  cardWidth: number;
  onUpdateEventGap: (eventId: string, gapLabel: string) => void;
}

export const TimelineTrackGapLink: React.FC<TimelineTrackGapLinkProps> = ({
  startEv,
  nextEv,
  trackColor,
  cardWidth,
  onUpdateEventGap,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [gapText, setGapText] = useState("");

  const gapStart = startEv.x + cardWidth;
  const gapWidth = nextEv.x - gapStart;
  if (gapWidth <= 4) return null;

  const handleSave = () => {
    onUpdateEventGap(nextEv.id, gapText.trim());
    setIsEditing(false);
  };

  return (
    <div
      style={{ left: `${gapStart}px`, width: `${gapWidth}px`, top: "112px" }}
      className="absolute h-4 flex items-center justify-center group/gap z-10"
    >
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full group-hover/gap:h-1.5 transition-all"
        style={{ backgroundColor: trackColor, opacity: 0.8 }}
      />
      {gapWidth >= 36 && (
        <div className="relative z-20">
          {isEditing ? (
            <div className="flex items-center gap-1 bg-[var(--bg-card)] px-2 py-0.5 rounded-full shadow-lg border border-[var(--accent)] text-[10px]">
              <input
                type="text"
                autoFocus
                value={gapText}
                onChange={(e) => setGapText(e.target.value)}
                placeholder="Ej. 3 años después..."
                className="w-24 text-[10px] bg-transparent outline-none text-[var(--text-primary)] font-novel-serif"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <button
                type="button"
                onClick={handleSave}
                className="text-[var(--accent)] hover:opacity-80 cursor-pointer"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : nextEv.timeGapLabel ? (
            <div
              onClick={() => {
                setGapText(nextEv.timeGapLabel || "");
                setIsEditing(true);
              }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-[10px] font-medium font-novel-serif cursor-pointer shadow-xs transition-transform hover:scale-105"
            >
              <Clock className="w-2.5 h-2.5 text-[var(--accent)]" />
              <span className="truncate max-w-[100px]">{nextEv.timeGapLabel}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setGapText("");
                setIsEditing(true);
              }}
              className="opacity-0 group-hover/gap:opacity-100 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--accent)] border border-dashed border-[var(--border-subtle)] text-[9px] cursor-pointer shadow-2xs transition-all"
            >
              <Plus className="w-2 h-2" />
              <span>Intervalo</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
