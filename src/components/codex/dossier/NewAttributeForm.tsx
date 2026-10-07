import React, { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { EntityCategory } from "../../../types";
import { CATEGORY_ATTRIBUTE_SUGGESTIONS } from "../../../utils/codexDefaults";

interface NewAttributeFormProps {
  category: EntityCategory;
  existingAttributes: Record<string, string>;
  isOpen: boolean;
  onToggle: () => void;
  onAddAttribute: (key: string, value?: string) => void;
}

export const NewAttributeForm: React.FC<NewAttributeFormProps> = ({
  category,
  existingAttributes,
  isOpen,
  onToggle,
  onAddAttribute,
}) => {
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  const suggestions = CATEGORY_ATTRIBUTE_SUGGESTIONS[category] || CATEGORY_ATTRIBUTE_SUGGESTIONS.other;

  const handleConfirmAdd = () => {
    if (!newFieldKey.trim()) return;
    onAddAttribute(newFieldKey.trim(), newFieldValue.trim());
    setNewFieldKey("");
    setNewFieldValue("");
    onToggle();
  };

  if (!isOpen) return null;

  return (
    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent)]/40 space-y-3.5 animate-in fade-in shadow-xs">
          <div className="text-xs font-bold font-sans text-[var(--text-main)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span>Nuevo Detalle o Nota</span>
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-normal">Pulsa Enter para confirmar</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-sans font-semibold text-[var(--text-muted)] block">Sugerencias:</span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug) => {
                const already = existingAttributes[sug] !== undefined;
                return (
                  <button
                    key={sug}
                    type="button"
                    disabled={already}
                    onClick={() => onAddAttribute(sug, "")}
                    className={`text-xs px-2.5 py-1 rounded-full font-sans transition-all cursor-pointer ${
                      already
                        ? "opacity-30 line-through bg-black/5 dark:bg-white/5 text-[var(--text-muted)] cursor-not-allowed"
                        : "bg-[var(--accent-subtle)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] font-medium"
                    }`}
                  >
                    + {sug}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-sans font-semibold text-[var(--text-main)] block mb-1">Nombre *</label>
              <input
                type="text"
                autoFocus
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleConfirmAdd())}
                placeholder="Ej: Rol, Meta, Apariencia..."
                className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-xs font-sans text-[var(--text-main)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-xs font-sans font-semibold text-[var(--text-muted)] block mb-1">Valor (Opcional)</label>
              <input
                type="text"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleConfirmAdd())}
                placeholder="Ej: Protagonista..."
                className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-xs font-sans text-[var(--text-main)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--border-color)]/30">
            <button
              type="button"
              onClick={onToggle}
              className="px-3 py-1.5 rounded-full text-xs font-sans text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={!newFieldKey.trim()}
              className="px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-sans font-bold disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              Añadir
            </button>
          </div>
        </div>
  );
};

