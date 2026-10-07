import React, { useState, useEffect } from "react";
import { TemporalPlaneDefinition } from "../../../stores/planningStoreTypes";
import { usePlanningStore } from "../../../stores/usePlanningStore";
import { X, Layers, RotateCcw } from "lucide-react";
import { TimelineColorPicker } from "./common/TimelineColorPicker";

interface TimelinePlaneModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlane?: TemporalPlaneDefinition | null;
}

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
  const [color, setColor] = useState("#6366f1");

  useEffect(() => {
    if (editingPlane) {
      setName(editingPlane.name);
      setColor(editingPlane.color);
    } else {
      setName("");
      setColor("#6366f1");
    }
  }, [editingPlane, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPlane) {
      updateTemporalPlane(editingPlane.id, {
        name: name.trim(),
        shortLabel: name.trim(),
        color,
      });
    } else {
      addTemporalPlane({
        name: name.trim(),
        shortLabel: name.trim(),
        color,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editingPlane) return;
    if (window.confirm(`¿Eliminar el plano temporal "${editingPlane.name}"? Los acontecimientos asignados conservarán su contenido.`)) {
      deleteTemporalPlane(editingPlane.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md rounded-3xl bg-[var(--bg-card)] p-5 shadow-2xl space-y-4 border border-[var(--border-subtle)] text-[var(--text-primary)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-sm font-bold font-novel-display">
              {editingPlane ? "Editar Plano Temporal" : "Nuevo Plano Temporal"}
            </h3>
          </div>
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
              Nombre del plano *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Pasado / Mito, Presente, Futuro lejano..."
              className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-transparent focus:border-[var(--accent)] focus:outline-hidden"
              required
            />
          </div>

          <TimelineColorPicker
            color={color}
            onChange={setColor}
            label="Color identificativo"
          />

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
            {editingPlane ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-500/10 font-medium transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => restoreDefaultTemporalPlanes()}
                className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                title="Restaurar Pasado, Presente y Futuro"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar planos predeterminados</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
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
          </div>
        </form>
      </div>
    </div>
  );
};
