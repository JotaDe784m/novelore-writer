import React from "react";
import { NovelProject, CodexEntity } from "../../../types";
import { EventModalData, FlattenedScene } from "./timelineTypes";
import { DossierEntityCard } from "./DossierEntityCard";
import { DossierParticipantsSection } from "./DossierParticipantsSection";

interface EventDossierEntitiesProps {
  eventData: EventModalData;
  setEventData: React.Dispatch<React.SetStateAction<EventModalData>>;
  project: NovelProject;
  scenes: FlattenedScene[];
  allCodexEntities?: CodexEntity[];
  onOpenEntityDossier?: (entityId: string) => void;
  onOpenEntityWhiteboard?: (entityId: string) => void;
  onSelectScene?: (sceneId: string) => void;
}

export const EventDossierEntities: React.FC<EventDossierEntitiesProps> = ({
  eventData,
  setEventData,
  project,
  scenes,
  allCodexEntities,
  onOpenEntityDossier,
  onOpenEntityWhiteboard,
  onSelectScene,
}) => {
  const entities =
    allCodexEntities && allCodexEntities.length > 0
      ? allCodexEntities
      : project.entities || [];

  const locationEntity = entities.find((e) => e.id === eventData.locationId);
  const codexEntity = entities.find((e) => e.id === eventData.codexEntityId);
  const linkedScene = scenes.find((s) => s.id === eventData.sceneId);

  const charactersList = (eventData.characterIds || [])
    .map((id) => entities.find((e) => e.id === id))
    .filter((e): e is CodexEntity => Boolean(e));

  const availableCharacters = entities.filter(
    (e) =>
      (e.category === "character" || !e.category) &&
      !eventData.characterIds?.includes(e.id)
  );
  const availableLocations = entities.filter(
    (e) => e.category === "location" || !e.category
  );
  const availableCodexEvents = entities.filter((e) => e.category === "event");

  const handleAddChar = (charId: string) => {
    if (!charId) return;
    setEventData((prev) => ({
      ...prev,
      characterIds: Array.from(new Set([...(prev.characterIds || []), charId])),
    }));
  };

  const handleRemoveChar = (charId: string) => {
    setEventData((prev) => ({
      ...prev,
      characterIds: (prev.characterIds || []).filter((id) => id !== charId),
    }));
  };

  return (
    <div className="space-y-3">
      {/* 1. Escenario / Lugar */}
      <div className="p-3 rounded-xl bg-[var(--bg-app)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Escenario / Lugar
          </span>
        </div>
        {locationEntity ? (
          <DossierEntityCard
            name={locationEntity.name}
            avatarUrl={locationEntity.avatarUrl}
            subtitle={locationEntity.subtitle || "Escenario o Ubicacion"}
            color={locationEntity.color || "var(--accent)"}
            onOpenDossier={
              onOpenEntityDossier ? () => onOpenEntityDossier(locationEntity.id) : undefined
            }
            onOpenWhiteboard={
              onOpenEntityWhiteboard
                ? () => onOpenEntityWhiteboard(locationEntity.id)
                : undefined
            }
            onRemove={() =>
              setEventData((prev) => ({ ...prev, locationId: undefined }))
            }
            removeLabel="Desvincular"
          />
        ) : (
          <select
            value=""
            onChange={(e) =>
              setEventData((prev) => ({
                ...prev,
                locationId: e.target.value || undefined,
              }))
            }
            className="w-full text-xs p-2 rounded-lg bg-[var(--bg-sidebar)] text-[var(--text-secondary)] focus:outline-none"
          >
            <option value="">Seleccionar escenario...</option>
            {availableLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 2. Entrada del Codice (Evento Historico o Lore) */}
      <div className="p-3 rounded-xl bg-[var(--bg-app)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Entrada del Codice (Evento)
          </span>
        </div>
        {codexEntity ? (
          <DossierEntityCard
            name={codexEntity.name}
            avatarUrl={codexEntity.avatarUrl}
            subtitle={codexEntity.subtitle || "Acontecimiento historico del Codice"}
            color={codexEntity.color || "#eab308"}
            onOpenDossier={
              onOpenEntityDossier ? () => onOpenEntityDossier(codexEntity.id) : undefined
            }
            onOpenWhiteboard={
              onOpenEntityWhiteboard
                ? () => onOpenEntityWhiteboard(codexEntity.id)
                : undefined
            }
            onRemove={() =>
              setEventData((prev) => ({ ...prev, codexEntityId: undefined }))
            }
            removeLabel="Desvincular"
          />
        ) : (
          <select
            value=""
            onChange={(e) =>
              setEventData((prev) => ({
                ...prev,
                codexEntityId: e.target.value || undefined,
              }))
            }
            className="w-full text-xs p-2 rounded-lg bg-[var(--bg-sidebar)] text-[var(--text-secondary)] focus:outline-none"
          >
            <option value="">Vincular evento del Codice...</option>
            {availableCodexEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 3. Personajes Participantes con Selector de Densidad */}
      <DossierParticipantsSection
        charactersList={charactersList}
        availableCharacters={availableCharacters}
        onAddChar={handleAddChar}
        onRemoveChar={handleRemoveChar}
        onOpenEntityDossier={onOpenEntityDossier}
        onOpenEntityWhiteboard={onOpenEntityWhiteboard}
      />

      {/* 4. Escena del Manuscrito */}
      <div className="p-3 rounded-xl bg-[var(--bg-app)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Escena del Manuscrito
          </span>
        </div>
        {linkedScene ? (
          <DossierEntityCard
            name={linkedScene.title}
            subtitle={`${linkedScene.actTitle} / ${linkedScene.chapterTitle}`}
            actionButton={
              onSelectScene ? (
                <button
                  type="button"
                  onClick={() => onSelectScene(linkedScene.id)}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                >
                  Escribir
                </button>
              ) : undefined
            }
            onRemove={() =>
              setEventData((prev) => ({ ...prev, sceneId: undefined }))
            }
            removeLabel="Desvincular"
          />
        ) : (
          <select
            value=""
            onChange={(e) =>
              setEventData((prev) => ({
                ...prev,
                sceneId: e.target.value || undefined,
              }))
            }
            className="w-full text-xs p-2 rounded-lg bg-[var(--bg-sidebar)] text-[var(--text-secondary)] focus:outline-none"
          >
            <option value="">Vincular escena del manuscrito...</option>
            {scenes.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title} ({sc.chapterTitle})
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
