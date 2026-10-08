import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Pipette } from "lucide-react";
import { CustomEntityCategory } from "../../../types";
import { detectCategoryIcon, getUniqueCategoryLabel } from "../../../utils/categoryDetection";
import { useCodexStore } from "../../../stores/useCodexStore";

interface CodexCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory?: CustomEntityCategory | null;
  onSave?: (data: { id?: string; label: string; color: string }) => void;
}

const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899",
  "#06B6D4", "#F97316", "#6366F1", "#14B8A6", "#EF4444",
];

export const CodexCategoryModal: React.FC<CodexCategoryModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
  onSave,
}) => {
  const customCategories = useCodexStore((s) => s.customEntityCategories);
  const addCategory = useCodexStore((s) => s.addCustomEntityCategory);
  const updateCategory = useCodexStore((s) => s.updateCustomEntityCategory);

  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#3B82F6");

  useEffect(() => {
    if (editingCategory) {
      setLabel(editingCategory.label);
      setColor(editingCategory.color || "#3B82F6");
    } else {
      setLabel("");
      setColor("#3B82F6");
    }
  }, [editingCategory, isOpen]);

  // Tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined" || !document.body) return null;

  const IconComponent = detectCategoryIcon(label || "Nueva");
  const normalizedColor = color.startsWith("#") ? color : "#3B82F6";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawLabel = label.trim();
    if (!rawLabel) return;

    const uniqueLabel = getUniqueCategoryLabel(
      rawLabel,
      customCategories,
      editingCategory?.id
    );

    if (onSave) {
      onSave({ id: editingCategory?.id, label: uniqueLabel, color: normalizedColor });
    } else if (editingCategory) {
      updateCategory(editingCategory.id, { label: uniqueLabel, color: normalizedColor });
    } else {
      addCategory({ label: uniqueLabel, color: normalizedColor });
    }
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 border text-left bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl transition-colors"
              style={{
                backgroundColor: `${normalizedColor}18`,
                color: normalizedColor,
              }}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base font-novel-display text-[var(--text-main)]">
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </h3>
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Previsualización en Vivo de Icono y Color */}
          <div className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]/50 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-colors"
              style={{
                backgroundColor: `${normalizedColor}22`,
                color: normalizedColor,
                border: `1.5px solid ${normalizedColor}`,
              }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-[var(--text-main)] truncate font-sans">
                {label.trim() || "Nueva Categoría"}
              </p>
            </div>
          </div>

          {/* Campo de Nombre */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej. Personajes, Objetos, Reliquias, Magia..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs sm:text-sm font-serif text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-hidden focus:border-[var(--accent)] transition-all"
            />
          </div>

          {/* Selector de Color Libre y Paleta */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Color identificativo
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]/60">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {PRESET_COLORS.map((c) => {
                  const isSelected = normalizedColor.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`relative w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? "scale-110 ring-2 ring-offset-2 ring-[var(--accent)]"
                          : "hover:scale-105 opacity-90 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                    </button>
                  );
                })}
              </div>

              {/* Selector Libre / Pipeta */}
              <div className="flex items-center gap-2 shrink-0">
                <label
                  className="relative w-7 h-7 rounded-full border border-[var(--border-color)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden shadow-2xs"
                  title="Elegir cualquier color con cuentagotas"
                >
                  <input
                    type="color"
                    value={normalizedColor}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{
                      background: "conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)",
                    }}
                  >
                    <Pipette className="w-3 h-3 text-white drop-shadow-xs pointer-events-none" />
                  </div>
                </label>

                {/* Muestra y código Hex */}
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="w-20 px-2 py-1 text-center font-mono text-[11px] rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]/60 text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]/60">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-contrast)",
              }}
            >
              {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
