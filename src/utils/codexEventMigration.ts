import { WorldEntity, TimelineEvent, TimelineTrack } from "../types";

export interface CodexEventMigrationResult {
  cleanedEntities: WorldEntity[];
  migratedEvents: TimelineEvent[];
  hasChanges: boolean;
}

/**
 * Migra transparentemente cualquier entidad con category === "event"
 * desde el Códice hacia la Línea de Tiempo en planning.json.
 */
export function migrateCodexEventsToTimeline(
  entities: WorldEntity[],
  existingEvents: TimelineEvent[],
  existingTracks: TimelineTrack[]
): CodexEventMigrationResult {
  const legacyEvents = entities.filter((e) => (e.category as string) === "event");

  if (legacyEvents.length === 0) {
    return {
      cleanedEntities: entities,
      migratedEvents: existingEvents,
      hasChanges: false,
    };
  }

  const defaultTrackId = existingTracks[0]?.id || "track-main";
  const updatedEvents = [...existingEvents];

  legacyEvents.forEach((ent, index) => {
    // Si ya existe un evento cronológico vinculado por entityId o id
    const alreadyExists = updatedEvents.some(
      (ev) => ev.entityId === ent.id || ev.id === ent.id
    );

    if (!alreadyExists) {
      const newEvent: TimelineEvent = {
        id: ent.id,
        trackId: ent.timelineEventId || defaultTrackId,
        title: ent.name || "Acontecimiento migrado",
        subtitle: ent.subtitle || "",
        summary: ent.summary || "",
        date: ent.dateOrEpoch || "",
        dateType: "free",
        color: ent.color || "#6366f1",
        notes: ent.notes || "",
        attributes: ent.attributes || {},
        pinnedAttributes: ent.pinnedAttributes || [],
        wideAttributes: ent.wideAttributes || [],
        tags: ent.tags || [],
        aliases: ent.aliases || [],
        gallery: ent.gallery || [],
        avatarUrl: ent.avatarUrl,
        avatarOriginalUrl: ent.avatarOriginalUrl,
        whiteboard: ent.whiteboard,
        entityId: ent.id,
        order: existingEvents.length + index,
      };
      updatedEvents.push(newEvent);
    }
  });

  const cleanedEntities = entities.filter((e) => (e.category as string) !== "event");

  return {
    cleanedEntities,
    migratedEvents: updatedEvents,
    hasChanges: true,
  };
}

export default migrateCodexEventsToTimeline;
