import React from "react";
import { Calendar, Compass } from "lucide-react";

interface TimelineDatePickerProps {
  date?: string;
  dateType?: "calendar" | "free";
  onChange: (date: string, dateType: "calendar" | "free") => void;
  className?: string;
}

export const TimelineDatePicker: React.FC<TimelineDatePickerProps> = ({
  date = "",
  dateType = "free",
  onChange,
  className = "",
}) => {
  const currentMode = dateType || "free";

  const handleModeChange = (newMode: "calendar" | "free") => {
    onChange(date, newMode);
  };

  const handleDateValueChange = (val: string) => {
    onChange(val, currentMode);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Selector de modo: Era libre vs Calendario */}
      <div className="flex items-center justify-between gap-2">
        <label className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider block">
          Ubicación Temporal
        </label>
        <div className="flex items-center bg-[var(--bg-input)] p-0.5 rounded-full text-[11px]">
          <button
            type="button"
            onClick={() => handleModeChange("free")}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
              currentMode === "free"
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Era Narrativa</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("calendar")}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
              currentMode === "calendar"
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Calendario</span>
          </button>
        </div>
      </div>

      {/* Input condicional según modo */}
      {currentMode === "calendar" ? (
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateValueChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs focus:outline-hidden focus:border-[var(--accent)] border border-transparent transition-all font-mono"
          />
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={date}
            onChange={(e) => handleDateValueChange(e.target.value)}
            placeholder="Ej. Año 342 de la 4.ª Edad, Siglo XIV, Tercera vigilia..."
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 border border-transparent text-xs focus:outline-hidden focus:border-[var(--accent)] transition-all font-novel-serif"
          />
        </div>
      )}
    </div>
  );
};
