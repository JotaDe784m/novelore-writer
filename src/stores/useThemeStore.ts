import { create } from "zustand";
import { NovelProject } from "../types";
import {
  DARK_THEMES,
  applyStylesToDOM,
} from "../utils/themeUtils";

// Re-export helpers for backward compatibility
export {
  DARK_THEMES,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  getReadableAccent,
  getAdaptedAccent,
  getContrastColor,
  applyStylesToDOM,
} from "../utils/themeUtils";

export interface ThemeStoreState {
  activeTheme: string;
  customAccentColor: string | null;
  scope: "global" | "project";
  isDark: boolean;

  // Acciones
  setTheme: (
    themeId: string,
    options?: {
      persistScope?: "global" | "project";
      projectPath?: string;
      onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
    }
  ) => void;

  setCustomAccent: (
    accentColor: string | null,
    options?: {
      persistScope?: "global" | "project";
      projectPath?: string;
      onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
    }
  ) => void;

  setScope: (scope: "global" | "project") => void;
  syncWithProject: (project: NovelProject | null) => void;
  applyThemeToDOM: (themeId: string, customAccent?: string | null) => void;
}

// Inicialización desde localStorage (preferencia global)
const getInitialTheme = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("novelore_global_theme") || "minimal";
  }
  return "minimal";
};

const getInitialAccent = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("novelore_global_accent") || null;
  }
  return null;
};

const initialTheme = getInitialTheme();
const initialAccent = getInitialAccent();
applyStylesToDOM(initialTheme, initialAccent);

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  activeTheme: initialTheme,
  customAccentColor: initialAccent,
  scope: "global",
  isDark: DARK_THEMES.includes(initialTheme),

  applyThemeToDOM: (themeId: string, customAccent?: string | null) => {
    applyStylesToDOM(themeId, customAccent);
  },

  setScope: (scope: "global" | "project") => {
    set({ scope });
  },

  setTheme: (themeId, options) => {
    const isDark = DARK_THEMES.includes(themeId);
    const currentAccent = get().customAccentColor;
    set({ activeTheme: themeId, isDark });

    applyStylesToDOM(themeId, currentAccent);

    // Persistir siempre como preferencia global del autor
    if (typeof window !== "undefined") {
      localStorage.setItem("novelore_global_theme", themeId);
    }

    // Mantener sincronizado el proyecto activo si está presente
    if (options?.onUpdateProject) {
      options.onUpdateProject((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          theme: themeId,
        },
      }));
    }
  },

  setCustomAccent: (accentColor, options) => {
    const currentTheme = get().activeTheme;
    set({ customAccentColor: accentColor });

    applyStylesToDOM(currentTheme, accentColor);

    // Persistir siempre como preferencia global del autor
    if (typeof window !== "undefined") {
      if (accentColor) {
        localStorage.setItem("novelore_global_accent", accentColor);
      } else {
        localStorage.removeItem("novelore_global_accent");
      }
    }

    // Mantener sincronizado el proyecto activo si está presente
    if (options?.onUpdateProject) {
      options.onUpdateProject((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          customAccentColor: accentColor || undefined,
        },
      }));
    }
  },

  syncWithProject: (_project) => {
    // El tema es una preferencia global soberana del escritor para todo su entorno de trabajo
    const globalTheme = getInitialTheme();
    const globalAccent = getInitialAccent();
    set({
      activeTheme: globalTheme,
      customAccentColor: globalAccent,
      scope: "global",
      isDark: DARK_THEMES.includes(globalTheme),
    });
    applyStylesToDOM(globalTheme, globalAccent);
  },
}));
