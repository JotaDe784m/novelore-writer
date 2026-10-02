import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown, Plus, User, MapPin, Shield, Gem, Zap, Calendar, Tag, Check, X,
} from "lucide-react";
import { CustomEntityCategory, EntityCategory } from "../../../types";
import { useCodexStore } from "../../../stores/useCodexStore";
import { getCategoryLabel } from "../../../utils/codexDefaults";

const BASE_CATEGORIES: { id: EntityCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "character", label: "Personaje", icon: User },
  { id: "location", label: "Lugar", icon: MapPin },
  { id: "faction", label: "Facción", icon: Shield },
  { id: "item", label: "Objeto", icon: Gem },
  { id: "concept", label: "Concepto", icon: Zap },
  { id: "event", label: "Evento", icon: Calendar },
];

const PRESET_NEW_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#EF4444", "#14B8A6", "#6366F1"];

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

  const handleSelect = (catId: EntityCategory) => {
    onCategoryChange(catId);
    setIsOpen(false);
    setIsCreating(false);
  };

  const handleCreateSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!newCatLabel.trim()) return;
    const created = addCustomEntityCategory({
      label: newCatLabel.trim(),
      color: newCatColor,
    });
    onCategoryChange(created.id);
    setNewCatLabel("");
    setIsCreating(false);
    setIsOpen(false);
  };

  const currentBase = BASE_CATEGORIES.find((c) => c.id === category);
  const currentCustom = customCategories.find((c) => c.id === category);
  const CurrentIcon = currentBase ? currentBase.icon : Tag;
  const currentLabel = currentBase?.label || currentCustom?.label || getCategoryLabel(category, customCategories);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
        Categoría
      </label>

      {/* Botón trigger del desplegable */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer border border-transparent focus:border-[var(--accent)]"
      >
        <div className="flex items-center gap-2 truncate">
          <CurrentIcon className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          <span className="truncate">{currentLabel}</span>
          {currentCustom && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: currentCustom.color }}
            />
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-40 w-64 rounded-2xl bg-[var(--bg-card)] shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 text-xs">
          {!isCreating ? (
            <div className="space-y-0.5 max-h-60 overflow-y-auto custom-scroll">
              <div className="px-2 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Categorías Canónicas
              </div>
              {BASE_CATEGORIES.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold"
                        : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{c.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}

              {customCategories.length > 0 && (
                <>
                  <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-t border-[var(--border-subtle)] mt-1">
                    Personalizadas
                  </div>
                  {customCategories.map((c) => {
                    const isSelected = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelect(c.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold"
                            : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="truncate">{c.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </>
              )}

              {/* Botón para crear nueva categoría */}
              <div className="pt-1 border-t border-[var(--border-subtle)] mt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[var(--accent)] hover:bg-[var(--accent-subtle)] font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear nueva categoría</span>
                </button>
              </div>
            </div>
          ) : (
            /* Cuadro para crear nueva categoría */
            <div className="p-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-[var(--text-primary)]">
                  Nueva Categoría
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
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
                placeholder="Nombre (ej: Criatura, Mito)..."
                className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />

              <div className="space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-semibold block">Color</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_NEW_COLORS.map((clr) => (
                    <button
                      type="button"
                      key={clr}
                      onClick={() => setNewCatColor(clr)}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                        newCatColor === clr ? "scale-120 ring-2 ring-white/50" : "hover:scale-110"
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
                  className="px-2.5 py-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  className="px-3 py-1 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer"
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
