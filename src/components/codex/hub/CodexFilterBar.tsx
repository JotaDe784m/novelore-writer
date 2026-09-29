import React from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { EntityCategory } from "../../../types";

export interface CodexFilterBarProps {
  activeCategory: EntityCategory | "all";
  onSelectCategory: (category: EntityCategory | "all") => void;
  categoriesSummary: Record<EntityCategory | "all", number>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "default" | "most_mentions" | "least_mentions" | "name_asc";
  onSortByChange: (sort: "default" | "most_mentions" | "least_mentions" | "name_asc") => void;
}

export const CodexFilterBar: React.FC<CodexFilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  categoriesSummary,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
}) => {
  const categories: { id: EntityCategory | "all"; label: string; count: number }[] = [
    { id: "all", label: "Todo el Lore", count: categoriesSummary.all || 0 },
    { id: "character", label: "Personajes", count: categoriesSummary.character || 0 },
    { id: "location", label: "Lugares", count: categoriesSummary.location || 0 },
    { id: "faction", label: "Facciones", count: categoriesSummary.faction || 0 },
    { id: "item", label: "Objetos & Reliquias", count: categoriesSummary.item || 0 },
    { id: "concept", label: "Magia & Leyes", count: categoriesSummary.concept || 0 },
    { id: "event", label: "Eventos Históricos", count: categoriesSummary.event || 0 },
    { id: "other", label: "Libre / General", count: categoriesSummary.other || 0 },
  ];

  return (
    <div
      className="px-4 sm:px-8 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 text-xs transition-colors"
      style={{
        backgroundColor: "var(--bg-surface)",
      }}
    >
      {/* Category Pills con desplazamiento horizontal suave */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0 min-w-0 max-w-full">
        {categories.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span>{c.label}</span>
              <span className="ml-1 opacity-75">({c.count})</span>
            </button>
          );
        })}
      </div>

      {/* Búsqueda y Ordenación */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar en el Códice..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-3.5 py-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-xs sm:text-sm w-full sm:min-w-[220px] lg:min-w-[260px] transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-4 h-4 text-[var(--text-muted)] hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer transition-all"
            title="Criterio de ordenación"
          >
            <option value="default">Orden original</option>
            <option value="most_mentions">Más mencionados</option>
            <option value="least_mentions">Menos mencionados</option>
            <option value="name_asc">Nombre (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

