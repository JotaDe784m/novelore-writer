import React, { useState } from "react";
import { X, Trash2, Edit2, Plus } from "lucide-react";
import { Relationship, RelationshipType, WorldEntity } from "../../../types";
import { ExtendedRelationshipType } from "./relationTypes";
import { useCodexStore } from "../../../stores/useCodexStore";
import { getCategoryLabel } from "../../../utils/codexDefaults";
import { RelationshipCategorySelector } from "./RelationshipCategorySelector";

export interface RelationshipModalProps {
  isOpen: boolean;
  relationship: Relationship | null;
  defaultSourceId?: string;
  entities: WorldEntity[];
  onClose: () => void;
  onSave: (rel: Partial<Relationship>) => void;
  onDelete?: (relId: string) => void;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  relationship,
  defaultSourceId,
  entities,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  const store = useCodexStore();
  const isEditing = Boolean(relationship);
  const [sourceId, setSourceId] = useState(
    relationship?.sourceEntityId || defaultSourceId || entities[0]?.id || ""
  );
  const [targetId, setTargetId] = useState(
    relationship?.targetEntityId || (entities[1] ? entities[1].id : entities[0]?.id || "")
  );
  const [label, setLabel] = useState(relationship?.label || "");
  const [type, setType] = useState<ExtendedRelationshipType>(
    (relationship?.type as ExtendedRelationshipType) || "friendly"
  );
  const [description, setDescription] = useState(relationship?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) return;

    onSave({
      id: relationship?.id,
      sourceEntityId: sourceId,
      targetEntityId: targetId,
      label: label.trim() || type,
      type: type as RelationshipType,
      sentiment: relationship?.sentiment || "neutral",
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in select-none">
      <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Edit2 className="w-4 h-4 text-[var(--accent)]" />
            ) : (
              <Plus className="w-4 h-4 text-[var(--accent)]" />
            )}
            <h3 className="font-bold text-sm">
              {isEditing ? "Editar Vínculo de Relación" : "Nuevo Vínculo en el Códice"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Entidades Conectadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[11px] text-[var(--text-secondary)] block mb-1">
                Entidad de Origen *
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
              >
                {entities.map((e) => (
                  <option key={e.id} value={e.id} disabled={e.id === targetId}>
                    {e.name} ({getCategoryLabel(e.category, store.customEntityCategories)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[11px] text-[var(--text-secondary)] block mb-1">
                Entidad de Destino *
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
              >
                {entities.map((e) => (
                  <option key={e.id} value={e.id} disabled={e.id === sourceId}>
                    {e.name} ({getCategoryLabel(e.category, store.customEntityCategories)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Categorías (Arquetipos Base + Personalizadas con Estilo de Línea) */}
          <RelationshipCategorySelector
            selectedType={type}
            onSelectType={(selectedId, defaultLabel) => {
              setType(selectedId as ExtendedRelationshipType);
              if (!label && defaultLabel) {
                setLabel(defaultLabel);
              }
            }}
            customCategories={store.customRelationshipCategories || []}
            onAddCategory={store.addRelationshipCategory}
            onUpdateCategory={store.updateRelationshipCategory}
            onDeleteCategory={store.deleteRelationshipCategory}
          />

          {/* Etiqueta del Vínculo (con soporte para saltos de línea) */}
          <div>
            <label className="font-bold text-[11px] text-[var(--text-secondary)] block mb-1">
              Etiqueta Visual en el Grafo (soporta saltos de línea con Enter) *
            </label>
            <textarea
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Odio jurado&#10;desde la infancia"
              rows={2}
              className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--accent)] leading-relaxed"
            />
          </div>

          {/* Detalles / Trasfondo del Vínculo */}
          <div>
            <label className="font-bold text-[11px] text-[var(--text-secondary)] block mb-1">
              Detalles / Trasfondo del Vínculo (Lore y notas)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Cómo surgió este vínculo? Escribe el trasfondo, secretos, evolución en la historia, tensiones o notas del autor..."
              rows={4}
              className="w-full p-3 rounded-2xl bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] leading-relaxed text-xs sm:text-sm resize-y min-h-[90px]"
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => relationship && onDelete(relationship.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-500/10 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!sourceId || !targetId || sourceId === targetId}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs hover:opacity-90 disabled:opacity-40 cursor-pointer"
              >
                {isEditing ? "Guardar Cambios" : "Crear Vínculo"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
