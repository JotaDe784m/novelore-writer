import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Layers } from "lucide-react";
import { TrackModalData } from "./timelineTypes";
import { TimelineColorPicker } from "./common/TimelineColorPicker";
import { usePlanningStore } from "../../../stores/usePlanningStore";

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
  const temporalPlanes = usePlanningStore((s) => s.temporalPlanes);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (typeof document === "undefined" || !document.body) return null;

  const currentColor = formData.color || "#6366f1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 border text-left bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <div className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: currentColor }}
            />
            <h3 className="font-bold text-base font-novel-display text-[var(--text-main)]">
              {formData.id ? "Editar Línea de Tiempo" : "Nueva Línea de Tiempo"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Previsualización en Vivo */}
          <div className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]/50 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-2xl shrink-0 shadow-xs flex items-center justify-center transition-colors"
              style={{ backgroundColor: currentColor }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-[var(--text-main)] truncate font-sans">
                {formData.name.trim() || "Nueva Línea de Tiempo"}
              </p>
            </div>
          </div>

          {/* Campo de Nombre */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
              Nombre de la línea de tiempo *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Trama Principal, Subtrama de Marcus..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs sm:text-sm font-serif text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-hidden focus:border-[var(--accent)] transition-all"
            />
          </div>

          {/* Selector de Plano Temporal */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
              Plano temporal asignado
            </label>
            <select
              value={formData.planeId || ""}
              onChange={(e) => setFormData({ ...formData, planeId: e.target.value || undefined })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs sm:text-sm font-sans text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)] transition-all cursor-pointer"
            >
              <option value="">Sin plano asignado (General)</option>
              {temporalPlanes.map((plane) => (
                <option key={plane.id} value={plane.id}>
                  {plane.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Color Homologado */}
          <TimelineColorPicker
            color={currentColor}
            onChange={(color) => setFormData({ ...formData, color })}
            label="Color identificador"
          />

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]/60">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-contrast)",
              }}
            >
              {formData.id ? "Guardar Cambios" : "Crear Línea"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
