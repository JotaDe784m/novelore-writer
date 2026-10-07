import React, { useState, useEffect } from "react";
import { X, Pipette } from "lucide-react";

interface RelationshipCategoryEditModalProps {
  isOpen: boolean;
  category: { id?: string; label: string; color: string } | null;
  onSave: (label: string, color: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B",
  "#EC4899", "#EF4444", "#14B8A6", "#6366F1",
  "#06B6D4", "#F97316", "#64748B", "#84CC16",
];

export const RelationshipCategoryEditModal: React.FC<RelationshipCategoryEditModalProps> = ({
  isOpen,
  category,
  onSave,
  onClose,
}) => {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#3B82F6");

  useEffect(() => {
    if (category) {
      setLabel(category.label);
      setColor(category.color || "#3B82F6");
    } else {
      setLabel("");
      setColor("#3B82F6");
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSave(label.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] p-5 shadow-2xl space-y-4 border border-[var(--border-subtle)] text-[var(--text-primary)] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h3 className="text-sm font-bold font-novel-display">
            {category?.id ? "Editar Categoría de Vínculo" : "Nueva Categoría de Vínculo"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej. Rivalidad, Amistad, Alianza, Tensión..."
              className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-transparent focus:border-[var(--accent)] focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Color para el gráfico y enlaces
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color.toLowerCase() === c.toLowerCase()
                      ? "scale-115 ring-2 ring-[var(--accent)] ring-offset-2"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}

              <label
                title="Color personalizado"
                className="w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-105 flex items-center justify-center shadow-2xs relative"
                style={{ background: "conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)" }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="opacity-0 w-0 h-0 absolute pointer-events-none"
                />
                <Pipette className="w-3 h-3 text-white drop-shadow-sm pointer-events-none" />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
