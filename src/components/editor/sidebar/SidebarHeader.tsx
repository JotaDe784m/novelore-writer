import React from "react";
import { BookOpen, Plus, PanelLeftClose, Search, X } from "lucide-react";

interface SidebarHeaderProps {
  totalWords: number;
  totalScenes: number;
  onAddAct: () => void;
  onClose?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  totalWords,
  totalScenes,
  onAddAct,
  onClose,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <>
      <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between">
        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] truncate">
              Manuscrito
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5 truncate">
            {totalWords.toLocaleString()} pal. · {totalScenes} esc.
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onAddAct}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface-hover)] active:bg-[var(--bg-surface-active)] transition-colors cursor-pointer"
            title="Añadir nuevo Acto"
          >
            <Plus className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] active:bg-[var(--bg-surface-active)] transition-colors cursor-pointer"
              title="Colapsar panel (Ctrl+\ o Cmd+\)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar escena o texto..."
            className="w-full bg-[var(--bg-surface-hover)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] pl-8 pr-7 py-1.5 rounded-xl border border-transparent focus:border-[var(--accent)] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

