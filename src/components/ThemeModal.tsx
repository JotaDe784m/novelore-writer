import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Check,
  Palette,
  Sparkles,
  BookOpen,
  Moon,
  Sun,
  Flame,
  Search,
  RotateCcw,
  Sliders,
  Layers,
} from "lucide-react";
import { NovelProject } from "../types";

export interface ThemeOption {
  id: string;
  name: string;
  genre: string;
  category: "neutral" | "genre" | "mood";
  description: string;
  isDark: boolean;
  allowsCustomAccent: boolean;
  palette: {
    bgMain: string;
    bgSurface: string;
    bgCard: string;
    border: string;
    textMain: string;
    textBody: string;
    textMuted: string;
    defaultAccent: string;
  };
}

export const THEME_CATALOG: ThemeOption[] = [
  {
    id: "minimal",
    name: "Claro Neutro",
    genre: "Minimalismo Editorial & Ensayo",
    category: "neutral",
    description:
      "Lienzo blanco neutral de máxima claridad tipográfica. Libre de distracciones para escribir de día con pulcritud y enfoque absoluto.",
    isDark: false,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#FCFCFA",
      bgSurface: "#F4F4F1",
      bgCard: "#FFFFFF",
      border: "#E5E5DF",
      textMain: "#1A1A1A",
      textBody: "#374151",
      textMuted: "#6B7280",
      defaultAccent: "#18181B",
    },
  },
  {
    id: "dark",
    name: "Oscuro Neutro",
    genre: "Descanso Ocular & Noche",
    category: "neutral",
    description:
      "Superficie carbón mate profunda sin reflejos agresivos. Diseñada para proteger la vista en sesiones prolongadas de escritura nocturna.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#121214",
      bgSurface: "#1A1A1E",
      bgCard: "#222228",
      border: "#2D2D38",
      textMain: "#F4F4F6",
      textBody: "#D1D1DB",
      textMuted: "#9494A3",
      defaultAccent: "#E5A93C",
    },
  },
  {
    id: "sepia",
    name: "Fantasía Épica",
    genre: "Fantasía & Crónicas Históricas",
    category: "genre",
    description:
      "Tonalidad cálida de pergamino antiguo y tinta nogalina. Conecta con la atmósfera de bibliotecas medievales, mapas y reinos legendarios.",
    isDark: false,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#FAF5E8",
      bgSurface: "#F2E9D4",
      bgCard: "#FFFDF8",
      border: "#DCCBB0",
      textMain: "#2D1E14",
      textBody: "#4A3423",
      textMuted: "#7D6752",
      defaultAccent: "#92400E",
    },
  },
  {
    id: "scifi",
    name: "Ciencia Ficción",
    genre: "Cyberpunk & Distopía Espacial",
    category: "genre",
    description:
      "Gris obsidiana metálico con acentos cian eléctrico y neón azul. Evoca interfaces de naves interestelares, inteligencias sintéticas y futuros lejanos.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#0B0E14",
      bgSurface: "#111722",
      bgCard: "#162030",
      border: "#1E293B",
      textMain: "#E0F2FE",
      textBody: "#BAE6FD",
      textMuted: "#38BDF8",
      defaultAccent: "#00D8F6",
    },
  },
  {
    id: "noir",
    name: "Novela Negra",
    genre: "Noir, Policiaco & Misterio",
    category: "genre",
    description:
      "Claroscuro cinematográfico de asfalto mojado y persianas venecianas. Alto contraste monocromático con un destello carmesí de peligro e intriga.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#141416",
      bgSurface: "#1B1B1E",
      bgCard: "#232328",
      border: "#2E2E36",
      textMain: "#F4F4F5",
      textBody: "#D4D4D8",
      textMuted: "#A1A1AA",
      defaultAccent: "#E11D48",
    },
  },
  {
    id: "gothic",
    name: "Terror & Gótico",
    genre: "Terror, Horror & Thriller Psicológico",
    category: "genre",
    description:
      "Sombras lúgubres de cripta y terciopelo borgoña envejecido. Ideal para sumergirse en relatos de suspense ominoso, pesadillas y mansiones victorianas.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#12090D",
      bgSurface: "#1A0F15",
      bgCard: "#24141D",
      border: "#381928",
      textMain: "#FDE8EF",
      textBody: "#E7B8C8",
      textMuted: "#9D6379",
      defaultAccent: "#BE185D",
    },
  },
  {
    id: "romance",
    name: "Romance & Drama",
    genre: "Romántica, Drama & Sentimental",
    category: "genre",
    description:
      "Matices melocotón empolvado, rosa cálido y suavidad crepuscular. Transmite intimidad emocional, calidez de recuerdos y belleza lírica.",
    isDark: false,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#FFF8F6",
      bgSurface: "#FDF0EB",
      bgCard: "#FFFFFF",
      border: "#ECD2C8",
      textMain: "#331A1D",
      textBody: "#5A353A",
      textMuted: "#96676E",
      defaultAccent: "#E11D48",
    },
  },
  {
    id: "forest",
    name: "Bosque Silvestre",
    genre: "Aventura, Naturaleza & Realismo",
    category: "mood",
    description:
      "Verde pino profundo y musgo botánico sereno. Evoca caminatas entre niebla boscosa, cabañas lejanas y una calma orgánica inmersiva.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#0A1510",
      bgSurface: "#112019",
      bgCard: "#162820",
      border: "#1E382D",
      textMain: "#F0FDF4",
      textBody: "#DCFCE7",
      textMuted: "#86EFAC",
      defaultAccent: "#10B981",
    },
  },
  {
    id: "midnight",
    name: "Medianoche Táctico",
    genre: "Thriller, Espionaje & Acción",
    category: "mood",
    description:
      "Azul zafiro abisal y acero frío militar. Proyecta concentración rigurosa, tensión calculada y elegancia ejecutiva nocturna.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#090D1A",
      bgSurface: "#10162A",
      bgCard: "#17203A",
      border: "#1E2B4E",
      textMain: "#F0F4FF",
      textBody: "#C7D2FE",
      textMuted: "#818CF8",
      defaultAccent: "#38BDF8",
    },
  },
  {
    id: "dream",
    name: "Lavanda Onírica",
    genre: "Realismo Mágico, Poesía & Ensueño",
    category: "mood",
    description:
      "Púrpura amatista crepuscular con destellos violeta etéreos. Para historias poéticas donde la frontera entre vigilia y sueño se disuelve.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#12101C",
      bgSurface: "#1A1728",
      bgCard: "#231F36",
      border: "#2F2948",
      textMain: "#F5F0FF",
      textBody: "#D8CEF6",
      textMuted: "#9588BA",
      defaultAccent: "#A855F7",
    },
  },
  {
    id: "light",
    name: "Luz Nórdica",
    genre: "No Ficción, Filosofía & Claridad Ártica",
    category: "neutral",
    description:
      "Claridad escandinava con sutiles matices azul pálido y acento cobalto. Inspirada en la luz fría de las mañanas boreales y la precisión analítica.",
    isDark: false,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#F8FAFC",
      bgSurface: "#F1F5F9",
      bgCard: "#FFFFFF",
      border: "#CBD5E1",
      textMain: "#0F172A",
      textBody: "#334155",
      textMuted: "#64748B",
      defaultAccent: "#2563EB",
    },
  },
];

// Presets for customizable accents
const ACCENT_PRESETS = [
  { name: "Blanco Puro", color: "#FFFFFF" },
  { name: "Ámbar Dorado", color: "#E5A93C" },
  { name: "Azul Cobalto", color: "#2563EB" },
  { name: "Esmeralda Viva", color: "#10B981" },
  { name: "Carmesí Rubí", color: "#E11D48" },
  { name: "Púrpura Imperial", color: "#8B5CF6" },
  { name: "Cobre Terracota", color: "#EA580C" },
  { name: "Cian Neón", color: "#00D8F6" },
  { name: "Rosa Vibrante", color: "#EC4899" },
  { name: "Titanio / Grafito", color: "#71717A" },
  { name: "Tinta Pura", color: "#18181B" },
];

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
  const currentThemeId = project.settings.theme || "minimal";
  const [selectedCategory, setSelectedCategory] = useState<"all" | "neutral" | "genre" | "mood">("all");
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
      // Category filter
      if (selectedCategory !== "all" && theme.category !== selectedCategory) {
        return false;
      }
      // Tone filter
      if (toneFilter === "light" && theme.isDark) return false;
      if (toneFilter === "dark" && !theme.isDark) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = theme.name.toLowerCase().includes(q);
        const matchGenre = theme.genre.toLowerCase().includes(q);
        const matchDesc = theme.description.toLowerCase().includes(q);
        return matchName || matchGenre || matchDesc;
      }

      return true;
    });
  }, [selectedCategory, toneFilter, searchQuery]);

  const activeTheme = useMemo(() => {
    return THEME_CATALOG.find((t) => t.id === currentThemeId) || THEME_CATALOG[0];
  }, [currentThemeId]);

  // All themes can customize accent
  const canCustomizeAccent = true;

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

  // Instant DOM style update helper to avoid UI freezing during color wheel drag
  const applyInstantAccent = (color: string) => {
    const clean = color.replace("#", "");
    let lum = 0.5;
    if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16) / 255;
      const g = parseInt(clean.substring(2, 4), 16) / 255;
      const b = parseInt(clean.substring(4, 6), 16) / 255;
      lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    const contrast = lum > 0.45 ? (activeTheme.isDark ? "#121214" : "#18181B") : "#FFFFFF";
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--custom-accent", color);
    rootStyle.setProperty("--custom-highlight", color);
    rootStyle.setProperty("--custom-accent-hover", color);
    rootStyle.setProperty("--custom-accent-contrast", contrast);
    rootStyle.setProperty("--custom-accent-subtle", `${color}25`);
  };

  const handleSelectTheme = (themeId: string) => {
    const isTargetNeutral = themeId === "minimal" || themeId === "dark";
    const isCurrentNeutral = currentThemeId === "minimal" || currentThemeId === "dark";

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const targetThemeObj = THEME_CATALOG.find((t) => t.id === themeId) || THEME_CATALOG[0];

    if (isTargetNeutral) {
      // Switching to a neutral theme: restore saved neutral accent if previously customized
      const savedNeutral =
        typeof window !== "undefined"
          ? localStorage.getItem("novelore_neutral_accent")
          : null;
      const targetAccent = savedNeutral || undefined;

      if (targetAccent) {
        applyInstantAccent(targetAccent);
        setLocalAccent(targetAccent);
      } else {
        setLocalAccent(targetThemeObj.palette.defaultAccent);
        const rootStyle = document.documentElement.style;
        rootStyle.removeProperty("--custom-accent");
        rootStyle.removeProperty("--custom-highlight");
        rootStyle.removeProperty("--custom-accent-hover");
        rootStyle.removeProperty("--custom-accent-contrast");
        rootStyle.removeProperty("--custom-accent-subtle");
      }

      onUpdateProject((p) => ({
        ...p,
        settings: {
          ...p.settings,
          theme: themeId as any,
          customAccentColor: targetAccent,
        },
      }));
    } else {
      // Switching to a non-neutral theme (fantasy, scifi, noir, gothic, romance, etc.):
      // Preserve neutral accent in localStorage if we were currently in a neutral theme with custom accent
      if (isCurrentNeutral && project.settings.customAccentColor) {
        if (typeof window !== "undefined") {
          localStorage.setItem("novelore_neutral_accent", project.settings.customAccentColor);
        }
      }

      // Restore the non-neutral theme's original focus color cleanly
      setLocalAccent(targetThemeObj.palette.defaultAccent);

      const rootStyle = document.documentElement.style;
      rootStyle.removeProperty("--custom-accent");
      rootStyle.removeProperty("--custom-highlight");
      rootStyle.removeProperty("--custom-accent-hover");
      rootStyle.removeProperty("--custom-accent-contrast");
      rootStyle.removeProperty("--custom-accent-subtle");

      if (typeof window !== "undefined") {
        localStorage.removeItem("novelore_user_accent");
      }

      onUpdateProject((p) => ({
        ...p,
        settings: {
          ...p.settings,
          theme: themeId as any,
          customAccentColor: undefined,
        },
      }));
    }
  };

  const commitAccent = (color: string) => {
    onUpdateProject((p) => ({
      ...p,
      settings: {
        ...p.settings,
        customAccentColor: color,
      },
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("novelore_user_accent", color);
      if (currentThemeId === "minimal" || currentThemeId === "dark") {
        localStorage.setItem("novelore_neutral_accent", color);
      }
    }
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

      // Defer committing project state until dragging pauses to avoid freezing the app
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
    const rootStyle = document.documentElement.style;
    rootStyle.removeProperty("--custom-accent");
    rootStyle.removeProperty("--custom-highlight");
    rootStyle.removeProperty("--custom-accent-hover");
    rootStyle.removeProperty("--custom-accent-contrast");
    rootStyle.removeProperty("--custom-accent-subtle");

    onUpdateProject((p) => ({
      ...p,
      settings: {
        ...p.settings,
        customAccentColor: undefined,
      },
    }));

    if (typeof window !== "undefined") {
      localStorage.removeItem("novelore_user_accent");
      if (currentThemeId === "minimal" || currentThemeId === "dark") {
        localStorage.removeItem("novelore_neutral_accent");
      }
    }
  };

  // Build combined presets list: original theme accent first, then curated palette
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
                  color: "var(--accent)",
                }}
              >
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2">
                  Temas y Atmósferas de Escritura
                  <span
                    className="text-[11px] font-normal px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {THEME_CATALOG.length} disponibles
                  </span>
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Personaliza el ambiente visual de tu novela según su género, tono o preferencia de lectura.
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

          {/* Controls Bar: Categories & Search */}
          <div
            className="px-5 py-3 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Category tabs */}
            <div
              className="inline-flex items-center p-1 rounded-xl border gap-1 overflow-x-auto scrollbar-none"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("neutral")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === "neutral"
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                Neutros de Enfoque
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("genre")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === "genre"
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                Géneros Literarios
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("mood")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === "mood"
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                Atmósferas & Emoción
              </button>
            </div>

            {/* Tone selector & Search */}
            <div className="flex items-center gap-2">
              <div
                className="inline-flex items-center p-0.5 rounded-lg border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setToneFilter("all")}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                    toneFilter === "all"
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                  title="Mostrar todos"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setToneFilter("light")}
                  className={`p-1 text-[11px] rounded-md transition-colors cursor-pointer ${
                    toneFilter === "light"
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                  title="Sólo temas claros"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setToneFilter("dark")}
                  className={`p-1 text-[11px] rounded-md transition-colors cursor-pointer ${
                    toneFilter === "dark"
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                  title="Sólo temas oscuros"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative flex-1 sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar género o tema..."
                  className="w-full text-xs pl-8 pr-2.5 py-1 rounded-lg border outline-none transition-all placeholder:text-[var(--text-muted)]"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-main)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Body: Scrollable Themes Grid */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scroll">
            {/* Custom Accent Bar (Visible when Claro Neutro or Oscuro Neutro is active) */}
            {canCustomizeAccent && (
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
                    {project.settings.customAccentColor && (
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
                      const isDefault = (preset as any).isDefault;
                      const isWhite = preset.color.toLowerCase() === "#ffffff";
                      const isCurrent =
                        (!project.settings.customAccentColor && isDefault) ||
                        (localAccent || "").toLowerCase() === preset.color.toLowerCase();

                      return (
                        <button
                          type="button"
                          key={preset.color + (isDefault ? "-default" : "")}
                          onClick={() => {
                            if (isDefault) {
                              handleResetAccent();
                            } else {
                              handleSetAccent(preset.color, true);
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
                              className={`w-3.5 h-3.5 ${
                                isWhite ? "text-zinc-900" : "text-white"
                              } drop-shadow-xs`}
                            />
                          )}
                          {isDefault && !isCurrent && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isWhite ? "bg-zinc-800" : "bg-white/80"
                              }`}
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
                      onInput={(e) => handleSetAccent((e.target as HTMLInputElement).value, false)}
                      onChange={(e) => handleSetAccent((e.target as HTMLInputElement).value, true)}
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
                  {project.settings.customAccentColor ||
                  localAccent.toLowerCase() !== activeTheme.palette.defaultAccent.toLowerCase() ? (
                    <button
                      type="button"
                      onClick={handleResetAccent}
                      className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                      title={`Restablecer al acento original del tema (${activeTheme.palette.defaultAccent})`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restablecer</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetAccent}
                      className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                      title={`Acento original ya aplicado (${activeTheme.palette.defaultAccent})`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Original</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Themes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredThemes.map((theme) => {
                const isSelected = currentThemeId === theme.id;
                const palette = theme.palette;
                const activeAccent =
                  isSelected && project.settings.customAccentColor
                    ? project.settings.customAccentColor
                    : palette.defaultAccent;

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
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
                          {isSelected && project.settings.customAccentColor && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-md border font-mono flex items-center gap-1"
                              style={{
                                borderColor: "var(--accent)",
                                color: "var(--accent)",
                              }}
                              title="Color de enfoque personalizado activo"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: project.settings.customAccentColor }}
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
                              color: theme.isDark ? "#0A0A0A" : "#FFFFFF",
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
                                color: activeAccent,
                              }}
                            >
                              ★
                            </div>
                            <div
                              className="px-2 py-0.5 rounded-md text-[9px] font-semibold"
                              style={{
                                backgroundColor: activeAccent,
                                color: theme.isDark ? "#0A0A0A" : "#FFFFFF",
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
              })}
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
