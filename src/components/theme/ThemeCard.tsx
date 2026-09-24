import React from "react";
import { Moon, Sun, Check } from "lucide-react";
import { ThemeOption } from "./themeCatalog";
import { getReadableAccent, getContrastColor } from "../../stores/useThemeStore";

interface ThemeCardProps {
  theme: ThemeOption;
  isSelected: boolean;
  customAccentColor?: string;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  isSelected,
  customAccentColor,
  onSelectTheme,
}) => {
  const palette = theme.palette;
  const activeAccent = isSelected && customAccentColor ? customAccentColor : palette.defaultAccent;

  return (
    <div
      onClick={() => onSelectTheme(theme.id)}
      className={`relative rounded-xl border p-4 transition-all cursor-pointer flex flex-col justify-between group ${
        isSelected
          ? "ring-2 ring-[var(--accent)] shadow-md"
          : "hover:border-[var(--accent)]/50 hover:shadow-xs"
      }`}
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: isSelected ? "var(--accent)" : "var(--border-color)",
      }}
    >
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
              {theme.name}
            </span>
            {theme.isDark ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-[var(--text-muted)] flex items-center gap-1 font-mono">
                <Moon className="w-2.5 h-2.5" /> Oscuro
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center gap-1 font-mono">
                <Sun className="w-2.5 h-2.5" /> Claro
              </span>
            )}
            {isSelected && customAccentColor && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md border font-mono flex items-center gap-1"
                style={{
                  borderColor: "var(--accent-readable, var(--accent))",
                  color: "var(--accent-readable, var(--accent))",
                }}
                title="Color de enfoque personalizado activo"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: customAccentColor }}
                />
                Personalizado
              </span>
            )}
          </div>

          {isSelected ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs">
              <Check className="w-3 h-3" /> Activo
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Aplicar
            </span>
          )}
        </div>

        <div className="text-[11px] font-medium text-[var(--accent)]">
          {theme.genre}
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
          {theme.description}
        </p>
      </div>

      {/* Realistic Mini-Preview Window */}
      <div className="mt-3.5 pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
        <div
          className="rounded-lg border p-3 text-[11px] space-y-2 select-none shadow-2xs transition-transform duration-200 group-hover:scale-[1.01]"
          style={{
            backgroundColor: palette.bgMain,
            borderColor: palette.border,
            color: palette.textMain,
          }}
        >
          {/* Mini Editor Header */}
          <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: palette.border }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeAccent }} />
              <span className="font-semibold text-[11px]" style={{ color: palette.textMain }}>
                Capítulo I: El Despertar
              </span>
            </div>
            <span
              className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-medium"
              style={{
                backgroundColor: activeAccent,
                color: getContrastColor(activeAccent),
              }}
            >
              Borrador
            </span>
          </div>

          {/* Mini Paragraphs */}
          <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: palette.textBody }}>
            La bruma se disipaba sobre las torres de piedra antigua mientras el viento susurraba
            palabras que nadie se atrevía a pronunciar en voz alta...
          </p>

          {/* Mini Surface Pill & Controls */}
          <div className="flex items-center justify-between pt-1">
            <div
              className="px-2 py-0.5 rounded-md border text-[9px] font-mono flex items-center gap-1"
              style={{
                backgroundColor: palette.bgSurface,
                borderColor: palette.border,
                color: palette.textMuted,
              }}
            >
              <span>1,420 palabras</span>
            </div>

            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px]"
                style={{
                  backgroundColor: palette.bgCard,
                  borderColor: palette.border,
                  color: getReadableAccent(activeAccent, theme.isDark),
                }}
              >
                ★
              </div>
              <div
                className="px-2 py-0.5 rounded-md text-[9px] font-semibold"
                style={{
                  backgroundColor: activeAccent,
                  color: getContrastColor(activeAccent),
                }}
              >
                Continuar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
