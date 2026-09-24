import React from "react";
import { Check, Sliders, RotateCcw } from "lucide-react";
import { ThemeOption } from "./themeCatalog";
import { getContrastColor } from "../../stores/useThemeStore";

interface ThemePreset {
  name: string;
  color: string;
  isDefault?: boolean;
}

interface ThemeAccentPickerProps {
  activeTheme: ThemeOption;
  customAccentColor?: string;
  localAccent: string;
  themePresets: ThemePreset[];
  onSetAccent: (color: string, immediate?: boolean) => void;
  onResetAccent: () => void;
}

export const ThemeAccentPicker: React.FC<ThemeAccentPickerProps> = ({
  activeTheme,
  customAccentColor,
  localAccent,
  themePresets,
  onSetAccent,
  onResetAccent,
}) => {
  return (
    <div
      className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-bold text-[var(--text-main)]">
            Color de Acento Personalizado ({activeTheme.name})
          </span>
          {customAccentColor && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold">
              Activo
            </span>
          )}
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">
          Cambia el color de énfasis, botones, marcadores y selecciones para {activeTheme.name}.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {themePresets.map((preset) => {
            const isDefault = preset.isDefault;
            const isWhite = preset.color.toLowerCase() === "#ffffff";
            const isCurrent =
              (!customAccentColor && isDefault) ||
              (localAccent || "").toLowerCase() === preset.color.toLowerCase();
            const contrastColor = getContrastColor(preset.color);

            return (
              <button
                type="button"
                key={preset.color + (isDefault ? "-default" : "")}
                onClick={() => {
                  if (isDefault) {
                    onResetAccent();
                  } else {
                    onSetAccent(preset.color, true);
                  }
                }}
                className={`w-6 h-6 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                  isCurrent
                    ? "scale-110 ring-2 ring-offset-2 ring-[var(--accent)]"
                    : "hover:scale-105 opacity-90 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: preset.color,
                  borderColor: isWhite
                    ? "rgba(140,140,140,0.6)"
                    : isDefault
                    ? "var(--text-main)"
                    : "rgba(0,0,0,0.2)",
                }}
                title={preset.name}
              >
                {isCurrent && (
                  <Check
                    className="w-3.5 h-3.5 drop-shadow-xs"
                    style={{ color: contrastColor }}
                  />
                )}
                {isDefault && !isCurrent && (
                  <span
                    className="w-1.5 h-1.5 rounded-full opacity-80"
                    style={{ backgroundColor: contrastColor }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* HTML Color Picker */}
        <label
          className="relative w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden shadow-xs"
          title="Elegir cualquier color con cuentagotas"
          style={{ borderColor: "var(--border-color)" }}
        >
          <input
            type="color"
            value={localAccent}
            onInput={(e) => onSetAccent((e.target as HTMLInputElement).value, false)}
            onChange={(e) => onSetAccent((e.target as HTMLInputElement).value, true)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div
            className="w-full h-full rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)",
            }}
          />
        </label>

        {/* Reset button */}
        {customAccentColor ||
        localAccent.toLowerCase() !== activeTheme.palette.defaultAccent.toLowerCase() ? (
          <button
            type="button"
            onClick={onResetAccent}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold hover:opacity-90 transition-all cursor-pointer shadow-2xs"
            title={`Restablecer al acento original del tema (${activeTheme.palette.defaultAccent})`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onResetAccent}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            title={`Acento original ya aplicado (${activeTheme.palette.defaultAccent})`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Original</span>
          </button>
        )}
      </div>
    </div>
  );
};

