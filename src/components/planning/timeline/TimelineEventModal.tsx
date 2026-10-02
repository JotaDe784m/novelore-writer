import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { NovelProject, TimelineTrack, CodexEntity } from "../../../types";
import { EventModalData, FlattenedScene } from "./timelineTypes";
import { EventDossierEntities } from "./EventDossierEntities";
import { usePlanningStore } from "../../../stores/usePlanningStore";

interface TimelineEventModalProps {
  initialData: EventModalData;
  project: NovelProject;
  tracks: TimelineTrack[];
  scenes: FlattenedScene[];
  allCodexEntities?: CodexEntity[];
  onSave: (data: EventModalData) => void;
  onClose: () => void;
  onOpenEntityDossier?: (entityId: string) => void;
  onOpenEntityWhiteboard?: (entityId: string) => void;
  onSelectScene?: (sceneId: string) => void;
}

export const TimelineEventModal: React.FC<TimelineEventModalProps> = ({
  initialData,
  project,
  tracks,
  scenes,
  allCodexEntities,
  onSave,
  onClose,
  onOpenEntityDossier,
  onOpenEntityWhiteboard,
  onSelectScene,
}) => {
  const [formData, setFormData] = useState<EventModalData>(initialData);
  const temporalPlanes = usePlanningStore((s) => s.temporalPlanes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] bg-[var(--bg-editor)] text-[var(--text-primary)]">
        {/* Cabecera de la Ficha */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-semibold text-base">
              {formData.id ? "Ficha de Evento Narrativo" : "Nuevo Evento en la Línea de Tiempo"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Dossier */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Columna Izquierda: Datos Narrativos */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block font-medium mb-1 text-[var(--text-muted)]">
                  Título del acontecimiento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Batalla del Valle Sombrío, Pacto en la biblioteca..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-app)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-[var(--text-muted)]">Pista / Trama</label>
                  <select
                    value={formData.trackId}
                    onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-app)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    {tracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-[var(--text-muted)]">Fecha o Momento</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="Ej. Año 142, Tercer día de invierno..."
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-app)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Plano Temporal Dinámico */}
              <div>
                <label className="block font-medium mb-1.5 text-[var(--text-muted)]">
                  Plano Temporal
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, temporalPlane: undefined })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !formData.temporalPlane
                        ? "bg-[var(--accent)] text-white shadow-xs"
                        : "bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Sin plano
                  </button>
                  {temporalPlanes.map((plane) => {
                    const isSelected = formData.temporalPlane === plane.id;
                    return (
                      <button
                        key={plane.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, temporalPlane: plane.id })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "ring-1 ring-[var(--accent)] font-semibold shadow-xs"
                            : "bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: plane.badgeBg || "rgba(99, 102, 241, 0.15)",
                                color: plane.badgeText || plane.color,
                              }
                            : {}
                        }
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: plane.color }}
                        />
                        <span>{plane.shortLabel || plane.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-[var(--text-muted)]">
                  Sinopsis y Desarrollo
                </label>
                <textarea
                  rows={4}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Relata qué ocurre detalladamente en este evento..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-app)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-[var(--text-muted)]">
                  Impacto Dramático y Consecuencias
                </label>
                <textarea
                  rows={3}
                  value={formData.consequences || ""}
                  onChange={(e) => setFormData({ ...formData, consequences: e.target.value })}
                  placeholder="¿Cómo altera este hecho a los personajes o al conflicto general?"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-app)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                />
              </div>
            </div>

            {/* Columna Derecha: Tarjetas Interactivas de Entidades */}
            <div className="md:col-span-5 space-y-3">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Vínculos & Entidades del Códice
              </h4>
              <EventDossierEntities
                eventData={formData}
                setEventData={setFormData}
                project={project}
                scenes={scenes}
                allCodexEntities={allCodexEntities}
                onOpenEntityDossier={onOpenEntityDossier}
                onOpenEntityWhiteboard={onOpenEntityWhiteboard}
                onSelectScene={onSelectScene}
              />
            </div>
          </div>

          {/* Botones de Pie de Ficha */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:opacity-90 shadow-xs transition-opacity"
            >
              Guardar Ficha de Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
