import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Palette, BookOpen, X } from "lucide-react";
import { NovelProject } from "../types";
import { ThemeOption, THEME_CATALOG, ACCENT_PRESETS } from "./theme/themeCatalog";
import { ThemeCard } from "./theme/ThemeCard";
import { ThemeCategoryTabs } from "./theme/ThemeCategoryTabs";
import { ThemeAccentPicker } from "./theme/ThemeAccentPicker";
import { useThemeModalLogic } from "./theme/useThemeModalLogic";

// Re-export catalog & types for backward compatibility
export { THEME_CATALOG, ACCENT_PRESETS };
export type { ThemeOption };

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const {
    scope,
    setScope,
    currentThemeId,
    selectedCategory,
    setSelectedCategory,
    toneFilter,
    setToneFilter,
    searchQuery,
    setSearchQuery,
    filteredThemes,
    activeTheme,
    localAccent,
    themePresets,
    handleSelectTheme,
    handleSetAccent,
    handleResetAccent,
  } = useThemeModalLogic({
    isOpen,
    onClose,
    project,
    onUpdateProject,
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
          style={{
            backgroundColor: "var(--bg-main)",
            borderColor: "var(--border-color)",
            color: "var(--text-main)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-5 py-4 border-b flex items-center justify-between shrink-0"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                  color: "var(--accent-readable, var(--accent))",
                }}
              >
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2">
                  Atmósferas de Escritura & Temas
                  <span
                    className="text-[11px] font-normal px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {THEME_CATALOG.length} atmósferas
                  </span>
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Espacios cromáticos y descansados para acompañar el tono de tu historia con independencia tipográfica.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar: Categories, Scope & Search */}
          <ThemeCategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            scope={scope}
            onSetScope={setScope}
            toneFilter={toneFilter}
            onSetToneFilter={setToneFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

          {/* Body: Scrollable Themes Grid */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scroll">
            <ThemeAccentPicker
              activeTheme={activeTheme}
              customAccentColor={project.settings.customAccentColor}
              localAccent={localAccent}
              themePresets={themePresets}
              onSetAccent={handleSetAccent}
              onResetAccent={handleResetAccent}
            />

            {/* Themes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={currentThemeId === theme.id}
                  customAccentColor={project.settings.customAccentColor}
                  onSelectTheme={handleSelectTheme}
                />
              ))}
            </div>

            {filteredThemes.length === 0 && (
              <div className="text-center py-12 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
                <p className="text-sm font-medium text-[var(--text-main)]">
                  No se encontraron temas con &quot;{searchQuery}&quot;
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Intenta buscar por género (fantasia, noir, terror) o restablece los filtros.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 border-t flex items-center justify-between shrink-0"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Tema actual:</span>
              <strong className="text-[var(--text-main)]">{activeTheme.name}</strong>
              <span className="opacity-40">•</span>
              <span>{activeTheme.genre}</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl font-medium text-xs bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              Cerrar y Escribir
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
