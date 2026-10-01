import React from "react";
import { User, Sparkles, BookOpen, Calendar, FileText, Layers, Image as ImageIcon } from "lucide-react";
import { EntityCategory } from "../../../types";
import { DossierTab } from "./dossierTypes";

interface DossierTabsNavProps {
  activeTab: DossierTab;
  onTabChange: (tab: DossierTab) => void;
  category: EntityCategory;
  attributesCount: number;
  mentionsCount: number;
  galleryCount: number;
  whiteboardItemsCount: number;
}

export const DossierTabsNav: React.FC<DossierTabsNavProps> = ({
  activeTab,
  onTabChange,
  category,
  attributesCount,
  mentionsCount,
  galleryCount,
  whiteboardItemsCount,
}) => {
  const tabs: {
    id: DossierTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    show?: boolean;
  }[] = [
    { id: "identity", label: "Identidad", icon: User },
    { id: "attributes", label: "Atributos & Rasgos", icon: Sparkles, count: attributesCount },
    { id: "mentions", label: "Menciones", icon: BookOpen, count: mentionsCount },
    { id: "gallery", label: "Galería", icon: ImageIcon, count: galleryCount > 0 ? galleryCount : undefined },
    {
      id: "chronology",
      label: "Cronología & Lore",
      icon: Calendar,
      show: category === "event",
    },
    { id: "notes", label: "Notas de Trasfondo", icon: FileText },
    {
      id: "whiteboard",
      label: "Pizarra Visual",
      icon: Layers,
      count: whiteboardItemsCount > 0 ? whiteboardItemsCount : undefined,
    },
  ];

  return (
    <div
      id="dossier-tabs-nav"
      className="px-4 sm:px-6 pt-2 border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)] flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0 select-none"
    >
      {tabs
        .filter((t) => t.show !== false)
        .map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer relative shrink-0 ${
                isActive
                  ? "text-[var(--accent)] bg-[var(--bg-editor)] font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                      : "bg-black/10 dark:bg-white/10 text-[var(--text-secondary)]"
                  }`}
                >
                  {t.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--accent)] rounded-t-full" />
              )}
            </button>
          );
        })}
    </div>
  );
};
