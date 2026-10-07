import React, { useState } from "react";
import { WorldEntity } from "../../../../types";

interface NewRelationshipSelectorProps {
  allEntities: WorldEntity[];
  eventId: string;
  availableCategories: { id: string; label: string; color: string; isCustom: boolean }[];
  onAdd: (targetId: string, categoryId: string) => void;
  onCancel: () => void;
  onOpenCreateCategory: () => void;
}

export const NewRelationshipSelector: React.FC<NewRelationshipSelectorProps> = ({
  allEntities,
  eventId,
  availableCategories,
  onAdd,
  onCancel,
  onOpenCreateCategory,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [selectedCatId, setSelectedCatId] = useState(availableCategories[0]?.id || "friendly");

  const handleSubmit = () => {
    if (!selectedTargetId) return;
    onAdd(selectedTargetId, selectedCatId);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 animate-in fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
            Elemento del Códex
          </label>
          <select
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            className="w-full p-2 rounded-xl bg-[var(--bg-input)] text-xs text-[var(--text-primary)] border border-transparent focus:border-[var(--accent)] focus:outline-hidden"
          >
            <option value="">Selecciona un elemento...</option>
            {allEntities.filter((e) => e.id !== eventId).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.category})
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
              Categoría del Vínculo
            </label>
            <button
              type="button"
              onClick={onOpenCreateCategory}
              className="text-[10px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
            >
              + Nueva Categoría
            </button>
          </div>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="w-full p-2 rounded-xl bg-[var(--bg-input)] text-xs text-[var(--text-primary)] border border-transparent focus:border-[var(--accent)] focus:outline-hidden"
          >
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedTargetId}
          className="px-4 py-1 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] disabled:opacity-40 cursor-pointer shadow-2xs"
        >
          Crear Vínculo
        </button>
      </div>
    </div>
  );
};
