import React, { useState } from "react";
import { X, Layers } from "lucide-react";
import { TrackModalData } from "./timelineTypes";
import { TimelineColorPicker } from "./common/TimelineColorPicker";

interface TimelineTrackModalProps {
  initialData: TrackModalData;
  onSave: (data: TrackModalData) => void;
  onClose: () => void;
}

export const TimelineTrackModal: React.FC<TimelineTrackModalProps> = ({
  initialData,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<TrackModalData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)]/70">
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-[var(--border-color)]/50">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-bold text-sm font-novel-display">
              {formData.id ? "Editar Línea de Tiempo" : "Nueva Línea de Tiempo"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
              Nombre de la línea de tiempo *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Trama Principal, Subtrama de Marcus..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)]/70 focus:outline-hidden focus:border-[var(--accent)]"
            />
          </div>

          <TimelineColorPicker
            color={formData.color || "#6366f1"}
            onChange={(color) => setFormData({ ...formData, color })}
            label="Color identificador"
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]/50">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 shadow-2xs transition-all cursor-pointer"
            >
              Guardar Línea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
