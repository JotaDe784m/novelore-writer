import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Compass,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { CustomEntityCategory, EntityCategory } from "../../../types";
import { useCodexStore } from "../../../stores/useCodexStore";
import { detectCategoryIcon } from "../../../utils/categoryDetection";
import { CodexCategoryModal } from "./CodexCategoryModal";
import { CategoryDeleteConfirmModal } from "./CategoryDeleteConfirmModal";

export interface CodexCategoryDropdownProps {
  activeCategory: EntityCategory | "all";
  onSelectCategory: (category: EntityCategory | "all") => void;
  categoriesSummary: Record<string, number>;
}

export const CodexCategoryDropdown: React.FC<CodexCategoryDropdownProps> = ({
  activeCategory,
  onSelectCategory,
  categoriesSummary,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomEntityCategory | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CustomEntityCategory | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const customCategories = useCodexStore((s) => s.customEntityCategories);
  const deleteCategory = useCodexStore((s) => s.deleteCustomEntityCategory);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
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
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const activeCategoryObj = customCategories.find((c) => c.id === activeCategory);
  const ActiveIcon = activeCategory === "all"
    ? Compass
    : detectCategoryIcon(activeCategoryObj?.label || activeCategory);

  const activeLabel = activeCategory === "all"
    ? "Todos"
    : activeCategoryObj?.label || activeCategory;

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
    setIsOpen(false);
  };

  const handleOpenEdit = (e: React.MouseEvent, cat: CustomEntityCategory) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setModalOpen(true);
    setIsOpen(false);
  };

  const handleRequestDelete = (e: React.MouseEvent, cat: CustomEntityCategory) => {
    e.stopPropagation();
    setCategoryToDelete(cat);
    setDeleteConfirmOpen(true);
    setIsOpen(false);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id, true);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="flex items-center gap-3 shrink-0 relative select-none" ref={dropdownRef}>
      {/* 1. Botón Gatillo con Subrayado Activo y Centrado Vertical */}
      <button
        type="button"
        id="codex-category-dropdown-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 py-1.5 border-b-2 border-t-2 border-t-transparent text-xs font-semibold font-sans transition-all cursor-pointer"
        style={{
          borderBottomColor: isOpen || activeCategory !== "all" ? "var(--text-main)" : "transparent",
          color: "var(--text-main)",
        }}
        title="Filtrar por categoría"
      >
        <ActiveIcon
          className="w-4 h-4 shrink-0 transition-colors"
          style={{
            color: activeCategory === "all" ? "var(--accent)" : activeCategoryObj?.color || "var(--text-main)",
          }}
        />
        <span className="truncate max-w-[130px] sm:max-w-[180px]">{activeLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
            isOpen ? "rotate-180 opacity-100" : ""
          }`}
        />
      </button>

      {/* 2. Botón + Categoría al lado */}
      <button
        type="button"
        id="codex-add-category-btn"
        onClick={handleOpenCreate}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer shrink-0 font-sans"
        title="Crear nueva categoría"
      >
        <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Categoría</span>
      </button>

      {/* 3. Menú Desplegable Flotante que abarca todo el ancho */}
      {isOpen && (
        <div
          id="codex-category-menu"
          className="absolute left-0 top-full mt-2 z-50 w-64 sm:w-72 rounded-2xl p-1.5 shadow-2xl border bg-[var(--bg-card)] border-[var(--border-color)]/70 text-[var(--text-main)] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="w-full space-y-0.5 max-h-64 overflow-y-auto custom-scroll">
            {/* Opción 'Todos' con el MISMO diseño y estructura que las demás */}
            <div
              onClick={() => {
                onSelectCategory("all");
                setIsOpen(false);
              }}
              className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
                activeCategory === "all"
                  ? "bg-[var(--bg-surface-active)] font-semibold text-[var(--text-main)]"
                  : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Compass className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105 text-[var(--accent)]" />
                <span className="truncate font-sans text-xs">Todos</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] opacity-70 ml-1">
                  ({categoriesSummary.all || 0})
                </span>
              </div>
            </div>

            {/* Lista de Categorías */}
            {customCategories.map((cat) => {
              const Icon = detectCategoryIcon(cat.label);
              const isSelected = activeCategory === cat.id;
              const count = categoriesSummary[cat.id] || 0;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setIsOpen(false);
                  }}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--bg-surface-active)] font-semibold text-[var(--text-main)]"
                      : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
                  }`}
                >
                  {/* Icono temático, Nombre y Conteo */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Icon
                      className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105"
                      style={{ color: cat.color }}
                    />
                    <span className="truncate font-sans text-xs">
                      {cat.label}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] opacity-70 ml-1">
                      ({count})
                    </span>
                  </div>

                  {/* Acciones en hover: Papelera e Icono de Ajustes */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleRequestDelete(e, cat)}
                      className="p-1 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
                      title={`Eliminar categoría "${cat.label}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(e, cat)}
                      className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                      title={`Editar categoría "${cat.label}"`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Creación / Edición */}
      <CodexCategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingCategory={editingCategory}
      />

      {/* Modal de Confirmación de Borrado Destructivo */}
      <CategoryDeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        category={categoryToDelete}
        elementCount={categoryToDelete ? (categoriesSummary[categoryToDelete.id] || 0) : 0}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
