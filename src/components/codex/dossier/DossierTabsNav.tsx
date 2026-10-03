import React from "react";
import { User, Sparkles, BookOpen, Calendar, ScrollText, Layers, Image as ImageIcon } from "lucide-react";
import { EntityCategory } from "../../../types";
import { DossierTab } from "./dossierTypes";

export interface DossierTabsNavProps {
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
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    show?: boolean;
  }[] = [
    { id: "identity", label: "Identidad", title: "Identidad y Perfil", icon: User },
    { id: "attributes", label: "Detalles", title: "Detalles & Notas de la Ficha", icon: Sparkles, count: attributesCount },
    { id: "notes", label: "Lore Profundo", title: "Lore Profundo & Biblia Privada", icon: ScrollText },
    { id: "gallery", label: "Galería", title: "Galería Multimedia", icon: ImageIcon, count: galleryCount > 0 ? galleryCount : undefined },
    { id: "mentions", label: "Menciones", title: "Menciones en el Manuscrito", icon: BookOpen, count: mentionsCount },
    {
      id: "chronology",
      label: "Cronología",
      title: "Cronología & Lore",
      icon: Calendar,
      show: category === "event",
    },
    {
      id: "whiteboard",
      label: "Pizarra",
      title: "Pizarra Visual",
      icon: Layers,
      count: whiteboardItemsCount > 0 ? whiteboardItemsCount : undefined,
    },
  ];

  return (
    <div
      id="dossier-tabs-nav"
      className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none py-0.5"
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer relative shrink-0 whitespace-nowrap ${
                isActive
                  ? "text-[var(--accent)] bg-[var(--bg-card)] shadow-xs font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              }`}
              title={t.title}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                    isActive
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                      : "bg-black/10 dark:bg-white/10 text-[var(--text-secondary)]"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
    </div>
  );
};
