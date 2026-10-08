import React, { useRef, useEffect } from "react";
import { ArrowUpDown, Search, Plus, X } from "lucide-react";
import { EntityCategory } from "../../../types";
import { CodexCategoryDropdown } from "./CodexCategoryDropdown";

export interface CodexFilterBarProps {
  activeCategory: EntityCategory | "all";
  onSelectCategory: (category: EntityCategory | "all") => void;
  categoriesSummary: Record<string, number>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "default" | "most_mentions" | "least_mentions" | "unmentioned" | "name_asc";
  onSortByChange: (sort: "default" | "most_mentions" | "least_mentions" | "unmentioned" | "name_asc") => void;
  onCreateEntity?: () => void;
}

export const CodexFilterBar: React.FC<CodexFilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  categoriesSummary,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  onCreateEntity,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div
      className="px-4 sm:px-6 xl:px-8 py-2.5 flex items-center justify-between gap-3 shrink-0 text-xs border-b transition-colors select-none flex-wrap"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* 1. Menú Desplegable de Categorías (Fotos 1 y 2) */}
      <CodexCategoryDropdown
        activeCategory={activeCategory}
        onSelectCategory={onSelectCategory}
        categoriesSummary={categoriesSummary}
      />

      {/* 2. Búsqueda Maestra Multi-Criterio, Ordenación y Creación */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto flex-wrap">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar en el Códice... (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-7 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:outline-hidden focus:border-[var(--accent)] text-xs font-sans w-44 sm:w-56 lg:w-64 transition-all"
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
