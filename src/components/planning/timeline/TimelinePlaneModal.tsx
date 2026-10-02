import React, { useState, useEffect } from "react";
import { TemporalPlaneDefinition } from "../../../stores/planningStoreTypes";
import { usePlanningStore } from "../../../stores/usePlanningStore";

interface TimelinePlaneModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlane?: TemporalPlaneDefinition | null;
}

const PRESET_COLORS = [
  "#6366f1", // Índigo
  "#10b981", // Esmeralda
  "#f59e0b", // Ámbar
  "#ec4899", // Rosa
  "#8b5cf6", // Púrpura
  "#06b6d4", // Cian
  "#ef4444", // Carmesí
  "#64748b", // Pizarra
];

export const TimelinePlaneModal: React.FC<TimelinePlaneModalProps> = ({
  isOpen,
  onClose,
  editingPlane,
}) => {
  const addTemporalPlane = usePlanningStore((s) => s.addTemporalPlane);
  const updateTemporalPlane = usePlanningStore((s) => s.updateTemporalPlane);
  const deleteTemporalPlane = usePlanningStore((s) => s.deleteTemporalPlane);
  const restoreDefaultTemporalPlanes = usePlanningStore((s) => s.restoreDefaultTemporalPlanes);

  const [name, setName] = useState("");
  const [shortLabel, setShortLabel] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");

  useEffect(() => {
    if (editingPlane) {
      setName(editingPlane.name);
      setShortLabel(editingPlane.shortLabel);
      setDescription(editingPlane.description || "");
      setColor(editingPlane.color);
    } else {
      setName("");
      setShortLabel("");
      setDescription("");
      setColor("#6366f1");
    }
  }, [editingPlane, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const label = shortLabel.trim() || name.trim().slice(0, 10);
    if (editingPlane) {
      updateTemporalPlane(editingPlane.id, {
        name: name.trim(),
        shortLabel: label,
        description: description.trim(),
        color,
      });
    } else {
      addTemporalPlane({
        name: name.trim(),
        shortLabel: label,
        description: description.trim(),
        color,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editingPlane) return;
    deleteTemporalPlane(editingPlane.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl bg-[var(--bg-editor)] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            {editingPlane ? "Editar Plano Temporal" : "Nuevo Plano Temporal"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Nombre del plano
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Mito Fundacional, Era Futura..."
              className="w-full text-sm p-2 rounded-md bg-[var(--bg-app)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Etiqueta corta (para el chip)
            </label>
            <input
              type="text"
              value={shortLabel}
              onChange={(e) => setShortLabel(e.target.value)}
              placeholder="Ej. Mito, Futuro..."
              className="w-full text-sm p-2 rounded-md bg-[var(--bg-app)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Color identificativo
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? "scale-110 ring-2 ring-[var(--text-primary)]" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Descripción narrativa (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Propósito u horizonte temporal de este plano..."
              rows={2}
              className="w-full text-xs p-2 rounded-md bg-[var(--bg-app)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {editingPlane ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs text-red-500 hover:underline"
              >
                Eliminar plano
              </button>
            ) : (
              <button
                type="button"
                onClick={restoreDefaultTemporalPlanes}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Restaurar planos por defecto
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs rounded-md bg-[var(--accent)] text-white hover:opacity-90"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
