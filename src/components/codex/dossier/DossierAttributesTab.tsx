import React, { useState } from "react";
import {
  Plus, Trash2, Sparkles, Pin, Shield, Target,
  Eye, Flame, Clock, MapPin, Bookmark
} from "lucide-react";
import { CATEGORY_ATTRIBUTE_SUGGESTIONS } from "../../../utils/codexDefaults";
import { DossierAttributesTabProps } from "./dossierTypes";

const getAttributeIcon = (key: string): React.ComponentType<{ className?: string }> => {
  const k = key.toLowerCase();
  if (/^rol|^role|^ocupaci/i.test(k)) return Shield;
  if (/^meta|^objetivo|^goal/i.test(k)) return Target;
  if (/^apariencia|^aspecto|^f[ií]sico/i.test(k)) return Eye;
  if (/^motivaci|^deseo|^prop[oó]sito/i.test(k)) return Flame;
  if (/^edad|^nacimiento|^a[ñn]o/i.test(k)) return Clock;
  if (/^origen|^lugar|^residencia/i.test(k)) return MapPin;
  if (/^miedo|^secreto/i.test(k)) return Bookmark;
  return Sparkles;
};

export const DossierAttributesTab: React.FC<DossierAttributesTabProps> = ({
  category,
  attributes,
  pinnedAttributes = [],
  onAttributeChange,
  onRemoveAttribute,
  onAddAttribute,
  onTogglePinAttribute,
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

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Cabecera con cápsula y botón de añadir */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-input)]/40 border border-[var(--border-color)]/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-color)]/50 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-bold font-novel-display text-sm text-[var(--text-main)]">
            Notas & Detalles de la Ficha
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setIsAddingField((v) => !v)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-sans font-bold hover:opacity-90 transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAddingField ? "Cerrar" : "Añadir Detalle"}</span>
        </button>
      </div>

      {/* 2. Formulario Desplegable para Añadir Detalle */}
      {isAddingField && (
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent)]/40 space-y-3.5 animate-in fade-in shadow-xs">
          <div className="text-xs font-bold font-sans text-[var(--text-main)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span>Nuevo Detalle o Nota</span>
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-normal">
              Pulsa Enter para confirmar
            </span>
          </div>

          {/* Sugerencias Rápidas de 1 Clic */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-sans font-semibold text-[var(--text-muted)] block">
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
                    onClick={() => onAddAttribute(sug, "")}
                    className={`text-xs px-2.5 py-1 rounded-full font-sans transition-all cursor-pointer ${
                      alreadyExists
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
              <label className="text-xs font-sans font-semibold text-[var(--text-main)] block mb-1">
                Nombre del Detalle *
              </label>
              <input
                type="text"
                autoFocus
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleConfirmAdd())}
                placeholder="Ej: Rol, Meta, Apariencia, Motivación..."
                className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-xs font-sans text-[var(--text-main)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-xs font-sans font-semibold text-[var(--text-muted)] block mb-1">
                Valor Inicial (Opcional)
              </label>
              <input
                type="text"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleConfirmAdd())}
                placeholder="Ej: Protagonista principal..."
                className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-xs font-sans text-[var(--text-main)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--border-color)]/30">
            <button
              type="button"
              onClick={() => setIsAddingField(false)}
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
      )}

      {/* 3. Cuadrícula de Detalles en Cápsulas */}
      {Object.keys(attributes).length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[var(--bg-input)]/30 text-[var(--text-muted)] text-xs font-sans">
          No hay notas o detalles registrados todavía. Haz clic en "Añadir Detalle" o selecciona una sugerencia.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Object.entries(attributes).map(([key, val]) => {
            const AttrIcon = getAttributeIcon(key);
            const isPinned = pinnedAttributes.includes(key);

            return (
              <div
                key={key}
                className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-input)]/45 hover:bg-[var(--bg-input)]/65 border border-[var(--border-color)]/60 transition-all space-y-2 group shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Cápsula de Identidad del Atributo */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-color)]/50 shrink-0">
                      <AttrIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-[var(--text-main)] truncate">
                      {key}
                    </span>
                  </div>

                  {/* Acciones: Pin de Visibilidad en Tarjeta + Eliminar */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onTogglePinAttribute && (
                      <button
                        type="button"
                        onClick={() => onTogglePinAttribute(key)}
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold transition-all cursor-pointer ${
                          isPinned
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
                            : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)]/40"
                        }`}
                        title={isPinned ? "En tarjeta del Códice (haz clic para quitar)" : "Fijar en tarjeta del Códice"}
                      >
                        <Pin className={`w-3 h-3 ${isPinned ? "rotate-45" : ""}`} />
                        <span>{isPinned ? "En tarjeta" : "Fijar"}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemoveAttribute(key)}
                      className="p-1 rounded-lg text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                      title="Eliminar este detalle"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={val}
                  onChange={(e) => onAttributeChange(key, e.target.value)}
                  rows={2}
                  placeholder={`Detalle o descripción de ${key.toLowerCase()}...`}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] font-novel-serif text-xs sm:text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 focus:outline-hidden focus:border-[var(--accent)] border border-transparent hover:border-[var(--border-color)]/40 resize-y min-h-[48px] leading-relaxed transition-colors"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
