import React from "react";
import { Sun, Moon, Search } from "lucide-react";

interface ThemeCategoryTabsProps {
  selectedCategory: "all" | "literary" | "genre";
  onSelectCategory: (category: "all" | "literary" | "genre") => void;
  scope: "project" | "global";
  onSetScope: (scope: "project" | "global") => void;
  toneFilter: "all" | "light" | "dark";
  onSetToneFilter: (tone: "all" | "light" | "dark") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export const ThemeCategoryTabs: React.FC<ThemeCategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  scope,
  onSetScope,
  toneFilter,
  onSetToneFilter,
  searchQuery,
  onSearchQueryChange,
}) => {
  return (
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
          onClick={() => onSelectCategory("all")}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === "all"
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => onSelectCategory("literary")}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === "literary"
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          Atmósferas Literarias
        </button>
        <button
          type="button"
          onClick={() => onSelectCategory("genre")}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === "genre"
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          Atmósferas de Género
        </button>
      </div>

      {/* Scope selector, Tone selector & Search */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* Scope Segmented Control */}
        <div
          className="inline-flex items-center p-0.5 rounded-lg border text-xs"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
          title="Define si la atmósfera se guarda para esta novela o como preferencia global del sistema"
        >
          <button
            type="button"
            onClick={() => onSetScope("project")}
            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
              scope === "project"
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            Esta Novela
          </button>
          <button
            type="button"
            onClick={() => onSetScope("global")}
            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
              scope === "global"
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            Toda la App
          </button>
        </div>

        {/* Tone selector */}
        <div
          className="inline-flex items-center p-0.5 rounded-lg border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <button
            type="button"
            onClick={() => onSetToneFilter("all")}
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
            onClick={() => onSetToneFilter("light")}
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
            onClick={() => onSetToneFilter("dark")}
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

        {/* Search */}
        <div className="relative flex-1 sm:w-44">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
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
  );
};
