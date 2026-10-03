import React from "react";
import { History, Calendar, ExternalLink, ChevronRight, User, MapPin, Shield, Gem } from "lucide-react";
import { DossierEventLoreTabProps } from "./dossierTypes";

export const DossierEventLoreTab: React.FC<DossierEventLoreTabProps> = ({
  isHistorical,
  onToggleHistorical,
  dateOrEpoch,
  onDateOrEpochChange,
  involvedEntityIds,
  onToggleInvolvedEntity,
  projectEntities,
  syncWithTimeline,
  onToggleSyncWithTimeline,
  timelineTrackId,
  onTimelineTrackIdChange,
  timelineImportance,
  onTimelineImportanceChange,
  timelineTracks,
  scenesWithThisEvent,
  existingTimelineEventId,
  onNavigateToTimeline,
  onNavigateToScene,
}) => {
  const characters = projectEntities.filter((e) => e.category === "character");
  const locations = projectEntities.filter((e) => e.category === "location");
  const factions = projectEntities.filter((e) => e.category === "faction");
  const items = projectEntities.filter((e) => e.category === "item");

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Header & Timeline Navigation Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-input)]/45 border border-[var(--border-color)]/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-color)]/50 shrink-0">
            <History className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-bold font-novel-display text-sm text-[var(--text-main)]">
            Dimensiones Temporales, Cronología & Lore
          </h4>
        </div>
        {existingTimelineEventId && onNavigateToTimeline && (
          <button
            type="button"
            onClick={() => onNavigateToTimeline(existingTimelineEventId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--accent)] transition-colors cursor-pointer shadow-2xs"
          >
            <span>Ver en Línea de Tiempo</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 2. Past Lore vs Present Active Plot */}
      <div className="space-y-1.5">
        <label className="font-bold text-xs text-[var(--text-secondary)] block">
          Dimensión Temporal del Acontecimiento *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onToggleHistorical(true)}
            className={`p-3.5 rounded-2xl text-left flex items-start gap-3 transition-all cursor-pointer ${
              isHistorical
                ? "bg-[var(--bg-input)] ring-2 ring-[var(--accent)] shadow-xs"
                : "bg-[var(--bg-input)]/40 hover:bg-[var(--bg-input)]/70 text-[var(--text-muted)]"
            }`}
          >
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-[var(--text-primary)]">
                Evento Histórico / Lore (Pasado)
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Aconteció antes del manuscrito (guerras antiguas, pactos, cataclismos).
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onToggleHistorical(false)}
            className={`p-3.5 rounded-2xl text-left flex items-start gap-3 transition-all cursor-pointer ${
              !isHistorical
                ? "bg-[var(--bg-input)] ring-2 ring-[var(--accent)] shadow-xs"
                : "bg-[var(--bg-input)]/40 hover:bg-[var(--bg-input)]/70 text-[var(--text-muted)]"
            }`}
          >
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-[var(--text-primary)]">
                Hito de la Trama Activa (Presente)
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Forma parte del transcurso cronológico vivo de los actos y capítulos.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Epoch, Year, or Datation */}
      <div>
        <label className="font-bold text-xs text-[var(--text-secondary)] block mb-1.5">
          Época, Año o Fecha Histórica
        </label>
        <input
          type="text"
          value={dateOrEpoch}
          onChange={(e) => onDateOrEpochChange(e.target.value)}
          placeholder={isHistorical ? "Ej: Año 312 de la Primera Era (Hace 40 años)..." : "Ej: Día 3 — Noche de Tormenta..."}
          className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      {/* 4. Cross-linking Entities */}
      <div className="space-y-3">
        <label className="font-bold text-xs text-[var(--text-secondary)] block">
          Entidades Vinculadas a este Acontecimiento
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Personajes", icon: User, list: characters },
            { label: "Lugares", icon: MapPin, list: locations },
            { label: "Facciones", icon: Shield, list: factions },
            { label: "Objetos", icon: Gem, list: items },
          ].map(({ label, icon: Icon, list }) => (
            <div key={label} className="p-3 rounded-2xl bg-[var(--bg-input)]/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>{label}</span>
              </div>
              {list.length === 0 ? (
                <p className="text-[11px] text-[var(--text-muted)]">No hay registros en esta categoría.</p>
              ) : (
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                  {list.map((item) => {
                    const isSelected = involvedEntityIds.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => onToggleInvolvedEntity(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-2xs"
                            : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Synchronization with Planning Timeline */}
      <div className="p-4 rounded-2xl bg-[var(--bg-input)]/50 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={syncWithTimeline}
            onChange={(e) => onToggleSyncWithTimeline(e.target.checked)}
            className="rounded text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4 cursor-pointer"
          />
          <span className="font-bold text-xs text-[var(--text-primary)]">
            Sincronizar con la Línea de Tiempo de Planificación
          </span>
        </label>

        {syncWithTimeline && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                Carril / Pista Cronológica
              </label>
              <select
                value={timelineTrackId}
                onChange={(e) => onTimelineTrackIdChange(e.target.value)}
                className="w-full p-2 rounded-xl bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              >
                {timelineTracks.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {tr.name} {tr.isMainPlot ? "(Trama Principal)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                Importancia Narrativa
              </label>
              <select
                value={timelineImportance}
                onChange={(e) => onTimelineImportanceChange(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              >
                <option value="minor">Secundario / Menor</option>
                <option value="key">Hito Clave</option>
                <option value="turning_point">Punto de Giro</option>
                <option value="climax">Clímax</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 6. Scenes Revealing this Event */}
      {scenesWithThisEvent.length > 0 && (
        <div className="space-y-2">
          <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] block">
            Escenas del Manuscrito que Revelan este Suceso ({scenesWithThisEvent.length})
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {scenesWithThisEvent.map(({ scene: sc, chapterTitle, actTitle }) => (
              <div
                key={sc.id}
                onClick={() => onNavigateToScene?.(sc.id)}
                className={`p-2.5 rounded-xl bg-[var(--bg-input)]/40 hover:bg-[var(--bg-surface-hover)] flex items-center justify-between text-xs transition-colors ${
                  onNavigateToScene ? "cursor-pointer group" : ""
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className="font-semibold text-[var(--text-primary)] block truncate">{sc.title}</span>
                  <span className="text-[10px] text-[var(--text-muted)] truncate block">
                    {chapterTitle} • {actTitle}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--accent)] font-semibold flex items-center gap-1 shrink-0">
                  <span>Ir a escena</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
