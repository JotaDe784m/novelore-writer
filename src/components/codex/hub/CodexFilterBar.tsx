import React, { useRef, useEffect } from "react";
import {
  ArrowUpDown, Search, Plus, X, Tag, User, MapPin, Shield,
  Gem, Zap, Sparkles, Compass,
} from "lucide-react";
import { CustomEntityCategory, EntityCategory } from "../../../types";
import { useCodexStore } from "../../../stores/useCodexStore";
import { UnderlineTabs, TabItem } from "../../ui/UnderlineTabs";

export interface CodexFilterBarProps {
  activeCategory: EntityCategory | "all";
  onSelectCategory: (category: EntityCategory | "all") => void;
  categoriesSummary: Record<string, number>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "default" | "most_mentions" | "least_mentions" | "unmentioned" | "name_asc";
  onSortByChange: (sort: "default" | "most_mentions" | "least_mentions" | "unmentioned" | "name_asc") => void;
  customCategories?: CustomEntityCategory[];
  onOpenManageCategories?: () => void;
  onCreateEntity?: () => void;
}

const CATEGORY_TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  all: Compass,
  character: User,
  location: MapPin,
  faction: Shield,
  item: Gem,
  concept: Zap,
  other: Sparkles,
};

export const CodexFilterBar: React.FC<CodexFilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  categoriesSummary,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  customCategories,
  onOpenManageCategories,
  onCreateEntity,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const storeCustomCategories = useCodexStore((state) => state.customEntityCategories);
  const activeCustomCategories = customCategories || storeCustomCategories;

  // Atajo global Ctrl+F o Cmd+F para enfocar la búsqueda maestra
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Categorías canónicas (excluyendo "event" según directriz de diseño)
  const baseTabs: TabItem[] = [
    { id: "all", label: "Todo el Lore", count: categoriesSummary.all || 0, icon: CATEGORY_TAB_ICONS.all },
    { id: "character", label: "Personajes", count: categoriesSummary.character || 0, icon: CATEGORY_TAB_ICONS.character },
    { id: "location", label: "Lugares", count: categoriesSummary.location || 0, icon: CATEGORY_TAB_ICONS.location },
    { id: "faction", label: "Facciones", count: categoriesSummary.faction || 0, icon: CATEGORY_TAB_ICONS.faction },
    { id: "item", label: "Objetos & Reliquias", count: categoriesSummary.item || 0, icon: CATEGORY_TAB_ICONS.item },
    { id: "concept", label: "Magia & Leyes", count: categoriesSummary.concept || 0, icon: CATEGORY_TAB_ICONS.concept },
  ];

  const customTabs: TabItem[] = activeCustomCategories.map((c) => ({
    id: c.id,
    label: c.label,
    count: categoriesSummary[c.id] || 0,
    icon: Tag,
  }));

  const otherCount = categoriesSummary.other || 0;
  const otherTab: TabItem[] = otherCount > 0 || activeCategory === "other"
    ? [{ id: "other", label: "Libre / General", count: otherCount, icon: CATEGORY_TAB_ICONS.other }]
    : [];

  const allTabs = [...baseTabs, ...customTabs, ...otherTab];

  return (
    <div
      className="px-4 sm:px-6 xl:px-8 py-2.5 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-2.5 shrink-0 text-xs border-b transition-colors select-none"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* 1. Navegación fluida por Pestañas de Texto (UnderlineTabs) con ancho prioritario */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none min-w-0 max-w-full py-0.5">
        <UnderlineTabs
          tabs={allTabs}
          activeTab={activeCategory}
          onChange={(id) => onSelectCategory(id as EntityCategory | "all")}
          layoutId="codex-category-underline"
          size="sm"
        />

        {onOpenManageCategories && (
          <button
            type="button"
            onClick={onOpenManageCategories}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer shrink-0 ml-1"
            title="Gestionar o añadir categorías personalizadas"
          >
            <Tag className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="whitespace-nowrap">+ Categoría</span>
          </button>
        )}
      </div>

      {/* 2. Búsqueda Maestra Multi-Criterio, Ordenación y Creación */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 flex-wrap">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar en el Códice... (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-7 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:outline-hidden focus:border-[var(--accent)] text-xs font-sans w-full sm:w-56 lg:w-64 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Criterio de Ordenación */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-sans focus:outline-hidden focus:border-[var(--accent)] cursor-pointer transition-all"
            title="Criterio de ordenación"
          >
            <option value="default">Orden original</option>
            <option value="most_mentions">Más mencionados</option>
            <option value="least_mentions">Menos mencionados</option>
            <option value="unmentioned">Sin menciones (pendientes)</option>
            <option value="name_asc">Nombre (A-Z)</option>
          </select>
        </div>

        {onCreateEntity && (
          <button
            type="button"
            onClick={onCreateEntity}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 font-sans"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-contrast)",
            }}
            title="Crear nueva ficha en el Códex"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Elemento</span>
          </button>
        )}
      </div>
    </div>
  );
};
