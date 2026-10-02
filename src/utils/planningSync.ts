import { CodexEntity, NovelProject, TimelineEvent, TimelineTrack } from "../types";
import { PlanningDataPayload } from "../stores/planningStoreTypes";
import { sortTimelineEvents } from "./planningDefaults";
import { useProjectStore } from "../stores/useProjectStore";

export interface ResolvedEventEntities {
  codexEvent?: CodexEntity;
  characters: CodexEntity[];
  location?: CodexEntity;
  factions: CodexEntity[];
}

export const resolveEventEntities = (
  event: TimelineEvent,
  allEntities: CodexEntity[]
): ResolvedEventEntities => {
  const entityMap = new Map<string, CodexEntity>();
  for (const entity of allEntities) {
    entityMap.set(entity.id, entity);
  }

  const codexEvent = event.codexEntityId ? entityMap.get(event.codexEntityId) : undefined;
  const location = event.locationId ? entityMap.get(event.locationId) : undefined;

  const characters: CodexEntity[] = [];
  if (event.characterIds && Array.isArray(event.characterIds)) {
    for (const charId of event.characterIds) {
      const char = entityMap.get(charId);
      if (char) characters.push(char);
    }
  }

  const factions: CodexEntity[] = [];
  if (event.factionIds && Array.isArray(event.factionIds)) {
    for (const facId of event.factionIds) {
      const fac = entityMap.get(facId);
      if (fac) factions.push(fac);
    }
  }

  return {
    codexEvent,
    characters,
    location,
    factions,
  };
};

export const createEventFromCodex = (
  codexEntity: CodexEntity,
  trackId: string,
  existingCount: number
): Partial<TimelineEvent> => {
  return {
    title: codexEntity.name,
    summary: codexEntity.summary || codexEntity.notes || "",
    trackId,
    codexEntityId: codexEntity.id,
    temporalPlane: "past",
    position: existingCount,
    order: existingCount,
    tags: codexEntity.tags || [],
  };
};

export const reorderTrackList = (
  currentTracks: TimelineTrack[],
  trackIds: string[]
): TimelineTrack[] => {
  const idMap = new Map(currentTracks.map((t) => [t.id, t]));
  const reordered: TimelineTrack[] = [];
  trackIds.forEach((id, index) => {
    const track = idMap.get(id);
    if (track) {
      reordered.push({ ...track, order: index });
      idMap.delete(id);
    }
  });
  idMap.forEach((track) => {
    reordered.push({ ...track, order: reordered.length });
  });
  return reordered;
};

export const reorderTrackEventsList = (
  allEvents: TimelineEvent[],
  trackId: string,
  eventIds: string[]
): TimelineEvent[] => {
  const idMap = new Map(allEvents.filter((e) => e.trackId === trackId).map((e) => [e.id, e]));
  const otherEvents = allEvents.filter((e) => e.trackId !== trackId);
  const reordered: TimelineEvent[] = [];
  eventIds.forEach((id, index) => {
    const ev = idMap.get(id);
    if (ev) {
      reordered.push({ ...ev, position: index, order: index });
      idMap.delete(id);
    }
  });
  idMap.forEach((ev) => {
    reordered.push({ ...ev, position: reordered.length, order: reordered.length });
  });
  return [...otherEvents, ...reordered];
};

export const reorderEventInTracks = (
  allEvents: TimelineEvent[],
  eventId: string,
  targetTrackId: string,
  targetOrIndex?: string | number,
  position: "before" | "after" = "before"
): TimelineEvent[] => {
  const draggedEvent = allEvents.find((e) => e.id === eventId);
  if (!draggedEvent) return allEvents;

  const targetEvents = sortTimelineEvents(
    allEvents.filter((e) => e.trackId === targetTrackId && e.id !== eventId)
  );

  let insertIdx = targetEvents.length;
  if (typeof targetOrIndex === "string") {
    const foundIdx = targetEvents.findIndex((e) => e.id === targetOrIndex);
    if (foundIdx !== -1) {
      insertIdx = position === "before" ? foundIdx : foundIdx + 1;
    }
  } else if (typeof targetOrIndex === "number") {
    insertIdx = Math.max(0, Math.min(targetOrIndex, targetEvents.length));
  }

  const updatedDraggedEvent: TimelineEvent = {
    ...draggedEvent,
    trackId: targetTrackId,
  };

  const newTargetEvents = [...targetEvents];
  newTargetEvents.splice(insertIdx, 0, updatedDraggedEvent);

  const finalTargetEvents = newTargetEvents.map((e, idx) => ({
    ...e,
    position: idx,
    order: idx,
  }));

  const sourceTrackId = draggedEvent.trackId;
  let finalSourceEvents: TimelineEvent[] = [];
  if (sourceTrackId !== targetTrackId) {
    finalSourceEvents = sortTimelineEvents(
      allEvents.filter((e) => e.trackId === sourceTrackId && e.id !== eventId)
    ).map((e, idx) => ({
      ...e,
      position: idx,
      order: idx,
    }));
  }

  const otherTrackEvents = allEvents.filter(
    (e) =>
      e.trackId !== targetTrackId &&
      (sourceTrackId === targetTrackId || e.trackId !== sourceTrackId)
  );

  return [...otherTrackEvents, ...finalSourceEvents, ...finalTargetEvents];
};

export const mergePlanningIntoProject = (
  current: NovelProject | null,
  payload: PlanningDataPayload
): NovelProject | null => {
  if (!current) return null;
  return {
    ...current,
    planning: {
      ...current.planning,
      timeline: payload.timeline || { tracks: [], events: [] },
      corkboard: payload.corkboard || { columns: [], cards: [] },
      outlineGrid: payload.matrix || { rows: [] },
      storyBeats: payload.beats || [],
    },
  };
};

export const executePlanningSave = async (
  payload: PlanningDataPayload
): Promise<{ success: boolean; error?: string }> => {
  try {
    const projectStore = useProjectStore.getState();
    if (projectStore.project?.isDemo || !projectStore.projectPath) {
      return { success: true };
    }
    if (typeof window !== "undefined" && window.electronAPI?.savePlanning) {
      const res = await window.electronAPI.savePlanning(payload);
      if (!res.success) throw new Error(res.error || "Error al persistir planning.json");
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al guardar" };
  }
};
