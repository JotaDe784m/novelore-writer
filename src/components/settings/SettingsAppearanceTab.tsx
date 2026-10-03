import React from "react";
import { NovelProject } from "../../types";
import { THEME_CATALOG } from "../theme/themeCatalog";
import { ThemeCard } from "../theme/ThemeCard";
import { ThemeAccentPicker } from "../theme/ThemeAccentPicker";
import { useThemeModalLogic } from "../theme/useThemeModalLogic";

interface SettingsAppearanceTabProps {
  project: NovelProject | null;
  onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
}

export const SettingsAppearanceTab: React.FC<SettingsAppearanceTabProps> = ({
  project,
  onUpdateProject,
}) => {
  const dummyProject: any = project || { id: "dummy", title: "Configuración", settings: {} };
  const themeLogic = useThemeModalLogic({
    isOpen: true,
    onClose: () => {},
    project: dummyProject,
    onUpdateProject: onUpdateProject || (() => {}),
  });

  return (
    <div className="space-y-5">
      {/* 1. Selector de Acento Personalizado */}
      <div>
        <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5">
          Color de Acento Cromático
        </h4>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Elige una tonalidad distintiva para iluminar cursor, botones activos e indicadores.
        </p>
        <ThemeAccentPicker
          activeTheme={themeLogic.activeTheme}
          customAccentColor={
            themeLogic.localAccent.toLowerCase() !== themeLogic.activeTheme.palette.defaultAccent.toLowerCase()
              ? themeLogic.localAccent
              : undefined
          }
          localAccent={themeLogic.localAccent}
          themePresets={themeLogic.themePresets}
          onSetAccent={themeLogic.handleSetAccent}
          onResetAccent={themeLogic.handleResetAccent}
        />
      </div>

      {/* 2. Catálogo de Atmósferas Visuales Integrado */}
      <div className="pt-2 border-t border-[var(--border-color)]/50">
        <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5">
          Atmósferas Visuales ({THEME_CATALOG.length})
        </h4>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Selecciona la atmósfera que acompañe el tono y género de tu novela.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {THEME_CATALOG.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={themeLogic.currentThemeId === theme.id}
              customAccentColor={
                themeLogic.currentThemeId === theme.id &&
                themeLogic.localAccent.toLowerCase() !== theme.palette.defaultAccent.toLowerCase()
                  ? themeLogic.localAccent
                  : undefined
              }
              onSelectTheme={themeLogic.handleSelectTheme}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
