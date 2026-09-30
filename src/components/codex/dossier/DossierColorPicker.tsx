import React from "react";
import { Palette, Pipette } from "lucide-react";

interface DossierColorPickerProps {
  color: string;
  onColorChange: (color: string, immediate?: boolean) => void;
}

const PRESET_COLORS = [
  { name: "Carmesí", hex: "#dc2626" },
  { name: "Granate", hex: "#991b1b" },
  { name: "Terracota", hex: "#ea580c" },
  { name: "Ámbar", hex: "#f59e0b" },
  { name: "Oro Viejo", hex: "#b45309" },
  { name: "Esmeralda", hex: "#10b981" },
  { name: "Bosque", hex: "#047857" },
  { name: "Cian", hex: "#06b6d4" },
  { name: "Zafiro", hex: "#3b82f6" },
  { name: "Azul Real", hex: "#2563eb" },
  { name: "Índigo", hex: "#6366f1" },
  { name: "Violeta", hex: "#8b5cf6" },
  { name: "Púrpura", hex: "#9333ea" },
  { name: "Fucsia", hex: "#ec4899" },
  { name: "Pizarra", hex: "#64748b" },
  { name: "Grafito", hex: "#334155" },
];

export const DossierColorPicker: React.FC<DossierColorPickerProps> = ({
  color,
  onColorChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="font-bold text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
        <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Color de Identificación</span>
      </label>
      <div className="flex items-center gap-1.5 flex-wrap">
        {PRESET_COLORS.map((c) => (
          <button
            type="button"
            key={c.hex}
            onClick={() => onColorChange(c.hex, true)}
            title={`${c.name} (${c.hex})`}
            className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
              color.toLowerCase() === c.hex.toLowerCase()
                ? "scale-120 ring-2 ring-offset-2 ring-[var(--accent)] z-10"
                : "hover:scale-110 opacity-90 hover:opacity-100"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
        <label
          title="Selector de color personalizado"
          className="w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center shadow-xs relative"
          style={{ background: "conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)" }}
        >
          <input
            type="color"
            value={color.startsWith("#") && color.length === 7 ? color : "#3b82f6"}
            onChange={(e) => onColorChange(e.target.value, true)}
            className="opacity-0 w-0 h-0 absolute pointer-events-none"
          />
          <Pipette className="w-3 h-3 text-white drop-shadow-md pointer-events-none" />
        </label>
      </div>
    </div>
  );
};
