import React from "react";
import { Check, Pipette } from "lucide-react";

export interface TimelineColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS: { name: string; value: string }[] = [
  { name: "Índigo", value: "#6366f1" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Cian", value: "#06b6d4" },
  { name: "Esmeralda", value: "#10b981" },
  { name: "Ámbar", value: "#f59e0b" },
  { name: "Naranja", value: "#f97316" },
  { name: "Rojo", value: "#ef4444" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Púrpura", value: "#a855f7" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Pizarra", value: "#64748b" },
  { name: "Ocre", value: "#d97706" },
];

export const TimelineColorPicker: React.FC<TimelineColorPickerProps> = ({
  color,
  onChange,
  label = "Color identificativo",
}) => {
  const currentColor = color || "#6366f1";
  const normalizedCurrent = currentColor.toLowerCase();

  return (
    <div className="space-y-2 select-none">
      {label && (
        <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]/60">
        {/* Paleta de presets */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {PRESET_COLORS.map((preset) => {
            const isSelected = normalizedCurrent === preset.value.toLowerCase();
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange(preset.value)}
                title={preset.name}
                className={`relative w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                  isSelected ? "scale-110 ring-2 ring-offset-2 ring-[var(--accent)]" : "hover:scale-105 opacity-90 hover:opacity-100"
                }`}
                style={{ backgroundColor: preset.value }}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
              </button>
            );
          })}
        </div>

        {/* Separador vertical */}
        <div className="w-px h-6 bg-[var(--border-color)]/50 self-center hidden sm:block" />

        {/* Selector de color libre y previsualización */}
        <div className="flex items-center gap-2">
          <label
            className="relative w-7 h-7 rounded-full border border-[var(--border-color)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden shadow-2xs"
            title="Elegir cualquier color libre con cuentagotas"
          >
            <input
              type="color"
              value={currentColor.startsWith("#") ? currentColor : "#6366f1"}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: "conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)",
              }}
            >
              <Pipette className="w-3 h-3 text-white drop-shadow-xs pointer-events-none" />
            </div>
          </label>

          <input
            type="text"
            value={currentColor}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith("#") || val.length <= 7) {
                onChange(val);
              }
            }}
            placeholder="#6366f1"
            className="w-20 px-2 py-1 text-center font-mono text-[11px] rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]/60 text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
            title="Código hexadecimal de color"
          />
        </div>
      </div>
    </div>
  );
};
