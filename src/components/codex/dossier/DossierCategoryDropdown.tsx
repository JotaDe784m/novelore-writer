import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Check, X } from "lucide-react";
import { EntityCategory } from "../../../types";
import { useCodexStore } from "../../../stores/useCodexStore";
import { getCategoryLabel } from "../../../utils/codexDefaults";
import {
  detectCategoryIcon,
  getUniqueCategoryLabel,
  CANONICAL_DEFAULT_CATEGORIES,
} from "../../../utils/categoryDetection";

const PRESET_NEW_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899",
  "#EF4444", "#14B8A6", "#6366F1",
];

export interface DossierCategoryDropdownProps {
  category: EntityCategory;
  onCategoryChange: (cat: EntityCategory) => void;
}

export const DossierCategoryDropdown: React.FC<DossierCategoryDropdownProps> = ({
  category,
  onCategoryChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState(PRESET_NEW_COLORS[0]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const customCategories = useCodexStore((state) => state.customEntityCategories);
  const addCustomEntityCategory = useCodexStore((state) => state.addCustomEntityCategory);

  const categories = customCategories && customCategories.length > 0
    ? customCategories
    : CANONICAL_DEFAULT_CATEGORIES;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (catId: EntityCategory) => {
    onCategoryChange(catId);
    setIsOpen(false);
    setIsCreating(false);
  };

  const handleCreateSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const raw = newCatLabel.trim();
    if (!raw) return;

    const uniqueLabel = getUniqueCategoryLabel(raw, categories);
    const created = addCustomEntityCategory({
      label: uniqueLabel,
      color: newCatColor,
    });
    onCategoryChange(created.id);
    setNewCatLabel("");
    setIsCreating(false);
    setIsOpen(false);
  };

  const activeCategoryObj = categories.find((c) => c.id === category);
  const ActiveIcon = detectCategoryIcon(activeCategoryObj?.label || category);
  const activeLabel = activeCategoryObj?.label || getCategoryLabel(category, categories);

  return (
    <div className="relative select-none" ref={dropdownRef}>
      <label className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5 font-sans">
        Categoría
      </label>

      {/* Botón trigger del desplegable */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] text-xs font-semibold font-sans transition-colors cursor-pointer border border-[var(--border-color)]/60 focus:outline-hidden focus:border-[var(--accent)]"
      >
        <div className="flex items-center gap-2 truncate">
          <ActiveIcon
            className="w-3.5 h-3.5 shrink-0 transition-colors"
            style={{ color: activeCategoryObj?.color || "var(--accent)" }}
          />
          <span className="truncate">{activeLabel}</span>
          {activeCategoryObj?.color && (
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-2xs ml-0.5"
              style={{ backgroundColor: activeCategoryObj.color }}
            />
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-40 w-64 rounded-2xl bg-[var(--bg-card)] shadow-2xl border border-[var(--border-color)]/70 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 text-xs">
          {!isCreating ? (
            <div className="w-full space-y-0.5 max-h-60 overflow-y-auto custom-scroll">
              {categories.map((c) => {
                const Icon = detectCategoryIcon(c.label);
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-2xs"
                        : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        className="w-3.5 h-3.5 shrink-0 transition-colors"
                        style={{ color: isSelected ? "currentColor" : c.color }}
                      />
                      <span className="truncate">{c.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}

              {/* Botón para crear nueva categoría */}
              <div className="pt-1 border-t border-[var(--border-color)]/50 mt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[var(--accent)] hover:bg-[var(--accent-subtle)] font-bold text-xs font-sans transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear nueva categoría</span>
                </button>
              </div>
            </div>
          ) : (
            /* Cuadro para crear nueva categoría */
            <div className="p-2 space-y-2.5 font-sans">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-[var(--text-main)]">
                  Nueva Categoría
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                autoFocus
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateSubmit();
                  } else if (e.key === "Escape") {
                    setIsCreating(false);
                  }
                }}
                placeholder="Nombre (ej: Criaturas, Dioses)..."
                className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 border border-[var(--border-color)]/60 text-xs font-sans focus:outline-hidden focus:border-[var(--accent)]"
              />

              <div className="space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-semibold block uppercase tracking-wider">
                  Color
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_NEW_COLORS.map((clr) => (
                    <button
                      type="button"
                      key={clr}
                      onClick={() => setNewCatColor(clr)}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                        newCatColor === clr
                          ? "scale-110 ring-2 ring-offset-1 ring-[var(--accent)]"
                          : "hover:scale-105 opacity-90 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: clr }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2.5 py-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] text-xs cursor-pointer font-sans"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  className="px-3 py-1 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer font-sans shadow-2xs"
                >
                  Crear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
