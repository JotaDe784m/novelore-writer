import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Pencil, Trash2, Tag, Check, Sparkles } from "lucide-react";
import { CustomEntityCategory } from "../../../types";
import { useCodexStore } from "../../../stores/useCodexStore";

interface CustomCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899",
  "#06B6D4", "#F97316", "#6366F1", "#14B8A6", "#D946EF",
];

export const CustomCategoryModal: React.FC<CustomCategoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    customEntityCategories: customCategories,
    addCustomEntityCategory: addCategory,
    updateCustomEntityCategory: updateCategory,
    deleteCustomEntityCategory: deleteCategory,
  } = useCodexStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [description, setDescription] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen || typeof document === "undefined" || !document.body) return null;

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setColor("#3B82F6");
    setDescription("");
    setConfirmDeleteId(null);
  };

  const handleStartEdit = (cat: CustomEntityCategory) => {
    setEditingId(cat.id);
    setLabel(cat.label);
    setColor(cat.color || "#3B82F6");
    setDescription(cat.description || "");
    setConfirmDeleteId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    if (editingId) {
      updateCategory(editingId, {
        label: label.trim(),
        color,
        description: description.trim() || undefined,
      });
    } else {
      addCategory({
        label: label.trim(),
        color,
        description: description.trim() || undefined,
      });
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    if (editingId === id) resetForm();
    setConfirmDeleteId(null);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gestión de Categorías del Códex"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 border"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-novel-display text-[var(--text-main)]">
                Categorías Personalizadas
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-serif">
                Organiza el universo con arquetipos propios
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario de Creación / Edición en cápsula */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-novel-display text-[var(--text-main)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>{editingId ? "Editar Categoría" : "Nueva Categoría"}</span>
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] font-serif underline cursor-pointer"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Nombre (ej. Criaturas, Deidades, Hechizos...)"
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-color)]/70 bg-[var(--bg-card)] text-xs sm:text-sm font-serif text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-hidden focus:border-[var(--accent)]"
              />

              {/* Selector de Color Semántico */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center relative hover:scale-110"
                    style={{ backgroundColor: c }}
                    title={c}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold font-serif transition-all cursor-pointer shadow-xs"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-contrast)",
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? "Actualizar Categoría" : "Añadir Categoría"}</span>
            </button>
          </div>
        </form>

        {/* Lista de Categorías Existentes */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            Categorías creadas ({customCategories.length})
          </span>

          {customCategories.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic font-serif py-3 text-center">
              No has creado categorías personalizadas aún.
            </p>
          ) : (
            <div className="space-y-1.5">
              {customCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-surface)] text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-[var(--text-main)] truncate font-serif">
                      {cat.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {confirmDeleteId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleDelete(cat.id)} className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold cursor-pointer">
                          Eliminar
                        </button>
                        <button type="button" onClick={() => setConfirmDeleteId(null)} className="px-2 py-0.5 rounded-md text-[var(--text-muted)] text-[10px] cursor-pointer">
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(cat.id)}
                        className="p-1 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
