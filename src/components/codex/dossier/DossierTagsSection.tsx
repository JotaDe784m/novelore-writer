import React, { useState, useRef, useEffect } from "react";
import { Plus, X, MoreHorizontal, Check } from "lucide-react";

export interface DossierTagsSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  maxVisibleTags?: number;
}

export const DossierTagsSection: React.FC<DossierTagsSectionProps> = ({
  tags,
  onAddTag,
  onRemoveTag,
  maxVisibleTags = 6,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsAdding(false);
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeTags = Array.isArray(tags) ? tags : [];

  const handleAddSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const val = tagInput.trim();
    if (val && !safeTags.includes(val)) {
      onAddTag(val);
      setTagInput("");
    }
    setIsAdding(false);
  };

  const visibleTags = isExpanded ? safeTags : safeTags.slice(0, maxVisibleTags);
  const hasMore = safeTags.length > maxVisibleTags;

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider">
            Tags
          </label>
          <button
            type="button"
            onClick={() => setIsAdding((prev) => !prev)}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            title="Añadir etiqueta"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer flex items-center gap-0.5"
            title={isExpanded ? "Mostrar menos" : "Ver todas las etiquetas"}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
            <span>{isExpanded ? "Menos" : `+${tags.length - maxVisibleTags}`}</span>
          </button>
        )}
      </div>

      {/* Cuadro rápido para escribir nueva etiqueta */}
      {isAdding && (
        <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
          <input
            ref={inputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubmit();
              } else if (e.key === "Escape") {
                setIsAdding(false);
              }
            }}
            placeholder="Nueva etiqueta..."
            className="flex-1 px-2.5 py-1 rounded-xl bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={handleAddSubmit}
            className="p-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 cursor-pointer"
            title="Guardar etiqueta"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Lista de tags en píldoras */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
        {visibleTags.length > 0 ? (
          visibleTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center gap-1 group transition-all"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="opacity-70 group-hover:opacity-100 hover:text-red-500 cursor-pointer"
                title={`Eliminar etiqueta ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        ) : !isAdding ? (
          <span className="text-xs text-[var(--text-muted)] italic">
            Sin etiquetas asignadas.
          </span>
        ) : null}
      </div>
    </div>
  );
};
