import React, { useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { CATEGORY_ATTRIBUTE_SUGGESTIONS } from "../../../utils/codexDefaults";
import { DossierAttributesTabProps } from "./dossierTypes";

export const DossierAttributesTab: React.FC<DossierAttributesTabProps> = ({
  category,
  attributes,
  onAttributeChange,
  onRemoveAttribute,
  onAddAttribute,
}) => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  const suggestions = CATEGORY_ATTRIBUTE_SUGGESTIONS[category] || CATEGORY_ATTRIBUTE_SUGGESTIONS.other;

  const handleConfirmAdd = () => {
    if (!newFieldKey.trim()) return;
    onAddAttribute(newFieldKey.trim(), newFieldValue.trim());
    setNewFieldKey("");
    setNewFieldValue("");
    setIsAddingField(false);
  };

  const handleQuickAdd = (suggestion: string) => {
    onAddAttribute(suggestion, "");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header with Add Custom Field action */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-input)]/40">
        <div>
          <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] block">
            Ficha Detallada de Atributos & Rasgos
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            Define arquetipos, motivaciones, rasgos psicológicos o propiedades particulares.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsAddingField((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAddingField ? "Cerrar" : "Añadir Atributo"}</span>
        </button>
      </div>

      {/* Inline Form to Add New Attribute */}
      {isAddingField && (
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent)]/30 space-y-3.5 animate-in fade-in shadow-xs">
          <div className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span>Nuevo Atributo Personalizado</span>
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-normal">
              Pulsa Enter para confirmar
            </span>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
              Sugerencias de 1 clic:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug) => {
                const alreadyExists = attributes[sug] !== undefined;
                return (
                  <button
                    key={sug}
                    type="button"
                    disabled={alreadyExists}
                    onClick={() => handleQuickAdd(sug)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      alreadyExists
                        ? "opacity-40 line-through bg-black/5 dark:bg-white/5 text-[var(--text-muted)] cursor-not-allowed"
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
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Nombre del Atributo *
              </label>
              <input
                type="text"
                autoFocus
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmAdd();
                  }
                }}
                placeholder="Ej: Alineamiento moral, Ocupación, Debilidad..."
                className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Valor Inicial (Opcional)
              </label>
              <input
                type="text"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmAdd();
                  }
                }}
                placeholder="Ej: Neutral caótico, Espada de Éter..."
                className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setIsAddingField(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={!newFieldKey.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              Añadir Atributo
            </button>
          </div>
        </div>
      )}

      {/* Attributes Grid */}
      {Object.keys(attributes).length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[var(--bg-input)]/30 text-[var(--text-muted)] text-xs">
          No hay atributos registrados todavía. Haz clic en "Añadir Atributo" o selecciona una sugerencia.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Object.entries(attributes).map(([key, val]) => (
            <div
              key={key}
              className="p-3.5 rounded-2xl bg-[var(--bg-input)]/50 hover:bg-[var(--bg-input)]/70 transition-colors space-y-1.5 group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)] truncate">{key}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAttribute(key)}
                  className="text-red-500 opacity-0 group-hover:opacity-100 hover:underline text-[11px] transition-opacity cursor-pointer flex items-center gap-1"
                  title="Eliminar atributo"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Quitar</span>
                </button>
              </div>
              <textarea
                value={val}
                onChange={(e) => onAttributeChange(key, e.target.value)}
                rows={2}
                className="w-full p-2 rounded-xl bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-y min-h-[44px] leading-relaxed"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
