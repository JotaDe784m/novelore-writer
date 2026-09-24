import { useState, useMemo, useEffect, useRef } from "react";
import { NovelProject } from "../../types";
import { useThemeStore, applyStylesToDOM } from "../../stores/useThemeStore";
import { THEME_CATALOG, ACCENT_PRESETS } from "./themeCatalog";

interface UseThemeModalLogicProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
}

export function useThemeModalLogic({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}: UseThemeModalLogicProps) {
  const { scope, setScope, setTheme: setStoreTheme, setCustomAccent: setStoreAccent } = useThemeStore();
  const currentThemeId = project.settings.theme || "minimal";
  const [selectedCategory, setSelectedCategory] = useState<"all" | "literary" | "genre">("all");
  const [toneFilter, setToneFilter] = useState<"all" | "light" | "dark">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered themes
  const filteredThemes = useMemo(() => {
    return THEME_CATALOG.filter((theme) => {
      if (selectedCategory !== "all" && theme.category !== selectedCategory) {
        return false;
      }
      if (toneFilter === "light" && theme.isDark) return false;
      if (toneFilter === "dark" && !theme.isDark) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          theme.name.toLowerCase().includes(q) ||
          theme.genre.toLowerCase().includes(q) ||
          theme.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, toneFilter, searchQuery]);

  const activeTheme = useMemo(() => {
    return THEME_CATALOG.find((t) => t.id === currentThemeId) || THEME_CATALOG[0];
  }, [currentThemeId]);

  // Local state for smooth color picking without render lag
  const [localAccent, setLocalAccent] = useState<string>(
    project.settings.customAccentColor || activeTheme.palette.defaultAccent
  );
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafThemeAccentRef = useRef<number | null>(null);
  const lastAccentTimeRef = useRef<number>(0);

  // Synchronize localAccent whenever project theme or custom accent changes
  useEffect(() => {
    setLocalAccent(project.settings.customAccentColor || activeTheme.palette.defaultAccent);
  }, [project.settings.theme, project.settings.customAccentColor, activeTheme.palette.defaultAccent]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const applyInstantAccent = (color: string) => {
    applyStylesToDOM(currentThemeId, color);
  };

  const handleSelectTheme = (themeId: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const targetThemeObj = THEME_CATALOG.find((t) => t.id === themeId) || THEME_CATALOG[0];
    setLocalAccent(targetThemeObj.palette.defaultAccent);

    setStoreTheme(themeId, {
      persistScope: scope,
      onUpdateProject,
    });
  };

  const commitAccent = (color: string) => {
    setStoreAccent(color, {
      persistScope: scope,
      onUpdateProject,
    });
  };

  const handleSetAccent = (color: string, immediate = false) => {
    if (rafThemeAccentRef.current) {
      cancelAnimationFrame(rafThemeAccentRef.current);
      rafThemeAccentRef.current = null;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setLocalAccent(color);

    if (immediate) {
      applyInstantAccent(color);
      commitAccent(color);
    } else {
      const now = performance.now();
      if (now - lastAccentTimeRef.current >= 45) {
        lastAccentTimeRef.current = now;
        rafThemeAccentRef.current = requestAnimationFrame(() => {
          applyInstantAccent(color);
        });
      }

      debounceTimerRef.current = setTimeout(() => {
        applyInstantAccent(color);
        commitAccent(color);
      }, 350);
    }
  };

  const handleResetAccent = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setLocalAccent(activeTheme.palette.defaultAccent);
    setStoreAccent(null, {
      persistScope: scope,
      onUpdateProject,
    });
  };

  const themePresets = useMemo(() => {
    const defaultColor = activeTheme.palette.defaultAccent;
    const curated = ACCENT_PRESETS.filter(
      (p) => p.color.toLowerCase() !== defaultColor.toLowerCase()
    );
    return [
      { name: `Acento Original (${activeTheme.name})`, color: defaultColor, isDefault: true },
      ...curated,
    ];
  }, [activeTheme]);

  return {
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
  };
}

