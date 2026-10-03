import { create } from "zustand";

export interface SettingsState {
  isZenMode: boolean;
  visibleModules: {
    home: boolean;
    manuscript: boolean;
    planning: boolean;
    codex: boolean;
    relationships: boolean;
    gallery: boolean;
    export: boolean;
  };
  toggleZenMode: () => void;
  setZenMode: (val: boolean) => void;
  toggleModuleVisibility: (moduleId: keyof SettingsState["visibleModules"]) => void;
  setModuleVisibility: (moduleId: keyof SettingsState["visibleModules"], visible: boolean) => void;
}

const SETTINGS_STORAGE_KEY = "novelore_settings_v1";

const DEFAULT_VISIBLE_MODULES = {
  home: true,
  manuscript: true,
  planning: true,
  codex: true,
  relationships: true,
  gallery: true,
  export: true,
};

const loadInitialSettings = () => {
  if (typeof window === "undefined") {
    return { visibleModules: DEFAULT_VISIBLE_MODULES };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        visibleModules: {
          ...DEFAULT_VISIBLE_MODULES,
          ...(parsed.visibleModules || {}),
          home: true, // El inicio siempre debe permanecer visible
        },
      };
    }
  } catch (err) {
    console.error("Error al cargar configuraciones:", err);
  }
  return { visibleModules: DEFAULT_VISIBLE_MODULES };
};

export const useSettingsStore = create<SettingsState>((set) => ({
  isZenMode: false,
  visibleModules: loadInitialSettings().visibleModules,

  toggleZenMode: () =>
    set((state) => ({ isZenMode: !state.isZenMode })),

  setZenMode: (val: boolean) =>
    set({ isZenMode: val }),

  toggleModuleVisibility: (moduleId) =>
    set((state) => {
      if (moduleId === "home") return state; // No se permite ocultar inicio
      const updated = {
        ...state.visibleModules,
        [moduleId]: !state.visibleModules[moduleId],
      };
      try {
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({ visibleModules: updated })
        );
      } catch (err) {
        console.error("Error al guardar visibilidad de modulos:", err);
      }
      return { visibleModules: updated };
    }),

  setModuleVisibility: (moduleId, visible) =>
    set((state) => {
      if (moduleId === "home") return state;
      const updated = {
        ...state.visibleModules,
        [moduleId]: visible,
      };
      try {
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({ visibleModules: updated })
        );
      } catch (err) {
        console.error("Error al guardar visibilidad de modulos:", err);
      }
      return { visibleModules: updated };
    }),
}));
