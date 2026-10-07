import React from "react";
import { motion } from "motion/react";
import {
  Library,
  BookOpen,
  Calendar,
  Compass,
  Share2,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { ActiveView } from "../../types";
import { useSettingsStore, SettingsState } from "../../stores/useSettingsStore";

interface NavbarNavPillsProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  hasProject: boolean;
}

interface NavItemDef {
  id: ActiveView;
  moduleId: keyof SettingsState["visibleModules"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ALL_NAV_ITEMS: NavItemDef[] = [
  { id: "home", moduleId: "home", label: "Inicio", icon: Library },
  { id: "manuscript", moduleId: "manuscript", label: "Manuscrito", icon: BookOpen },
  { id: "planning", moduleId: "planning", label: "Planeación", icon: Calendar },
  { id: "codex", moduleId: "codex", label: "Códex", icon: Compass },
  { id: "relationships", moduleId: "relationships", label: "Mapa de Relaciones", icon: Share2 },
  { id: "gallery", moduleId: "gallery", label: "Pizarra Visual", icon: ImageIcon },
  { id: "export", moduleId: "export", label: "Maquetación & Exportar", icon: Download },
];

export const NavbarNavPills: React.FC<NavbarNavPillsProps> = ({
  activeView,
  onSelectView,
  hasProject,
}) => {
  const visibleModules = useSettingsStore((s) => s.visibleModules);

  const isTabActive = (tabId: ActiveView) => {
    if (tabId === "home") return activeView === "home";
    if (tabId === "manuscript") return activeView === "manuscript" || activeView === "editor";
    if (tabId === "planning") return activeView === "planning";
    if (tabId === "codex") return activeView === "codex" || activeView === "world";
    if (tabId === "relationships") return activeView === "relationships" || activeView === "relations";
    if (tabId === "gallery") return activeView === "gallery";
    if (tabId === "export") return activeView === "export";
    return activeView === tabId;
  };

  const filteredItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.moduleId === "home") return true;
    return visibleModules[item.moduleId] !== false;
  });

  return (
    <nav
      className="flex items-center gap-1 bg-[var(--bg-input)] p-1 rounded-full border border-[var(--border-color)]/60 overflow-x-auto no-scrollbar select-none shrink-0"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {filteredItems.map((item) => {
        const Icon = item.icon;
        const isActive = isTabActive(item.id);
        const isHome = item.id === "home";
        const isDimmed = !isHome && !hasProject;

        return (
          <motion.button
            key={item.id}
            id={`nav-tab-${item.id}`}
            onClick={() => onSelectView(item.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              isActive
                ? "text-[var(--text-main)] font-semibold"
                : isDimmed
                ? "opacity-50 hover:opacity-90 text-[var(--text-muted)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
            title={
              isDimmed
                ? `${item.label} (Requiere una novela activa)`
                : item.label
            }
            aria-label={item.label}
          >
            {isActive && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute inset-0 bg-[var(--bg-card)] rounded-full border border-[var(--border-color)] shadow-2xs -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Icon className="w-4 h-4 shrink-0" />
          </motion.button>
        );
      })}
    </nav>
  );
};
