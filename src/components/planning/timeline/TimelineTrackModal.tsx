import React, { useState } from "react";
import { X, Layers } from "lucide-react";
import { TrackModalData } from "./timelineTypes";

interface TimelineTrackModalProps {
  initialData: TrackModalData;
  onSave: (data: TrackModalData) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Rosa
  "#eab308", // Ámbar
  "#10b981", // Esmeralda
  "#8b5cf6", // Violeta
  "#06b6d4", // Cian
  "#f97316", // Naranja
  "#64748b", // Pizarra
];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--bg-card)",
          color: "var(--text-main)",
        }}
      >
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-semibold text-sm">
              {formData.id ? "Editar Pista Cronológica" : "Nueva Pista Cronológica"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1 text-[var(--text-muted)]">
              Nombre de la pista *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Trama Principal, Arco de Marcus, Misterio del Códice..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] text-[var(--text-main)] border border-black/10 dark:border-white/10 focus:ring-1 focus:ring-[var(--accent)] outline-none"
            />
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-[var(--text-muted)]">
              Color identificador
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-[var(--accent)] scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-[var(--text-muted)]">
              Descripción o propósito
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve aclaración del hilo argumental o personajes que abarca..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] text-[var(--text-main)] border border-black/10 dark:border-white/10 focus:ring-1 focus:ring-[var(--accent)] outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 shadow-xs transition-all"
            >
              Guardar Pista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
