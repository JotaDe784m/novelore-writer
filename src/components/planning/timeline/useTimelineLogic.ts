import { useState, useMemo } from "react";
import { NovelProject, TimelineEvent, TimelineTrack } from "../../../types";
import { usePlanningStore } from "../../../stores/usePlanningStore";
import { useCodexStore } from "../../../stores/useCodexStore";
import { filterTimelineEvents, sortTimelineEvents } from "../../../utils/planningDefaults";
import { EventModalData, FlattenedScene, TrackModalData } from "./timelineTypes";
import { TemporalPlaneDefinition } from "../../../stores/planningStoreTypes";

export const useTimelineLogic = (project: NovelProject) => {
  const tracks = usePlanningStore((s) => s.tracks);
  const events = usePlanningStore((s) => s.events);
  const activePlane = usePlanningStore((s) => s.activeTemporalPlaneFilter);
  const activeTrackId = usePlanningStore((s) => s.activeTrackFilter);
  const searchQuery = usePlanningStore((s) => s.activeSearchQuery);

  const setTemporalPlaneFilter = usePlanningStore((s) => s.setTemporalPlaneFilter);
  const setTrackFilter = usePlanningStore((s) => s.setTrackFilter);
  const setSearchQuery = usePlanningStore((s) => s.setSearchQuery);
  const addTrack = usePlanningStore((s) => s.addTrack);
  const updateTrack = usePlanningStore((s) => s.updateTrack);
  const deleteTrack = usePlanningStore((s) => s.deleteTrack);
  const addEvent = usePlanningStore((s) => s.addEvent);
  const updateEvent = usePlanningStore((s) => s.updateEvent);
  const deleteEvent = usePlanningStore((s) => s.deleteEvent);
  const duplicateEvent = usePlanningStore((s) => s.duplicateEvent);
  const moveEventToTrack = usePlanningStore((s) => s.moveEventToTrack);
  const reorderTracks = usePlanningStore((s) => s.reorderTracks);
  const reorderEvents = usePlanningStore((s) => s.reorderEvents);
  const temporalPlanes = usePlanningStore((s) => s.temporalPlanes);

  const codexEntities = useCodexStore((s) => s.entities);
  const allCodexEntities = codexEntities.length > 0 ? codexEntities : project.entities || [];

  const [focusedTrackId, setFocusedTrackId] = useState<string | null>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventModalData, setEventModalData] = useState<EventModalData | null>(null);

  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackModalData, setTrackModalData] = useState<TrackModalData | null>(null);

  const [isPlaneModalOpen, setIsPlaneModalOpen] = useState(false);
  const [editingPlane, setEditingPlane] = useState<TemporalPlaneDefinition | null>(null);

  const flattenedScenes = useMemo<FlattenedScene[]>(() => {
    const list: FlattenedScene[] = [];
    for (const act of project.acts || []) {
      for (const chap of act.chapters || []) {
        for (const scene of chap.scenes || []) {
          list.push({
            id: scene.id,
            title: scene.title || "Sin título",
            actTitle: act.title,
            chapterTitle: chap.title,
          });
        }
      }
    }
    return list;
  }, [project.acts]);

  const filteredEvents = useMemo(() => {
    return filterTimelineEvents(events, activePlane, activeTrackId, searchQuery);
  }, [events, activePlane, activeTrackId, searchQuery]);

  const eventsByTrack = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const track of tracks) map.set(track.id, []);
    for (const ev of filteredEvents) {
      const list = map.get(ev.trackId);
      if (list) list.push(ev);
      else map.set(ev.trackId, [ev]);
    }
    map.forEach((list, trackId) => map.set(trackId, sortTimelineEvents(list)));
    return map;
  }, [tracks, filteredEvents]);

  const openCreateEvent = (trackId?: string) => {
    const targetTrackId = trackId || tracks[0]?.id || "track-main";
    const targetTrack = tracks.find((t) => t.id === targetTrackId);
    setEventModalData({
      title: "",
      subtitle: "",
      summary: "",
      trackId: targetTrackId,
      temporalPlane: targetTrack?.planeId || (activePlane === "all" ? undefined : activePlane),
      date: "",
      dateType: "free",
      color: targetTrack?.color || "#6366f1",
      tags: [],
      aliases: [],
      attributes: {},
      pinnedAttributes: [],
      wideAttributes: [],
      notes: "",
      gallery: [],
      linkedManuscriptItems: [],
      characterIds: [],
    });
    setIsEventModalOpen(true);
  };

  const openEditEvent = (event: TimelineEvent) => {
    setEventModalData({
      ...event,
      title: event.title,
      subtitle: event.subtitle || "",
      summary: event.summary || "",
      trackId: event.trackId,
      temporalPlane: event.temporalPlane,
      date: event.date || "",
      dateType: event.dateType || "free",
      color: event.color || "#6366f1",
      tags: event.tags || [],
      aliases: event.aliases || [],
      attributes: event.attributes || {},
      pinnedAttributes: event.pinnedAttributes || [],
      wideAttributes: event.wideAttributes || [],
      notes: event.notes || "",
      gallery: event.gallery || [],
      whiteboard: event.whiteboard,
      linkedManuscriptItems: event.linkedManuscriptItems || [],
      sceneId: event.sceneId,
      codexEntityId: event.codexEntityId,
      characterIds: event.characterIds || [],
      locationId: event.locationId,
      consequences: event.consequences || "",
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (data: EventModalData) => {
    if (data.id) {
      updateEvent(data.id, data);
    } else {
      addEvent(data as Omit<TimelineEvent, "id">);
    }
    setIsEventModalOpen(false);
  };

  const updateEventGap = (eventId: string, gapLabel: string) => {
    updateEvent(eventId, { timeGapLabel: gapLabel });
  };

  const updateEventOffset = (eventId: string, offset: number) => {
    updateEvent(eventId, { relativeOffset: offset });
  };

  const openCreateTrack = () => {
    setTrackModalData({
      name: "",
      color: "#6366f1",
      description: "",
      planeId: activePlane === "all" ? undefined : activePlane,
    });
    setIsTrackModalOpen(true);
  };

  const openEditTrack = (track: TimelineTrack) => {
    setTrackModalData({
      id: track.id,
      name: track.name,
      color: track.color || "#6366f1",
      description: track.description || "",
      planeId: track.planeId,
    });
    setIsTrackModalOpen(true);
  };

  const handleSaveTrack = (data: TrackModalData) => {
    if (data.id) updateTrack(data.id, data);
    else addTrack(data);
    setIsTrackModalOpen(false);
  };

  const openCreatePlane = () => {
    setEditingPlane(null);
    setIsPlaneModalOpen(true);
  };

  const openEditPlane = (plane: TemporalPlaneDefinition) => {
    setEditingPlane(plane);
    setIsPlaneModalOpen(true);
  };

  return {
    tracks,
    events,
    activePlane,
    activeTrackId,
    searchQuery,
    flattenedScenes,
    allCodexEntities,
    eventsByTrack,
    focusedTrackId,
    setFocusedTrackId,
    setTemporalPlaneFilter,
    setTrackFilter,
    setSearchQuery,
    isEventModalOpen,
    eventModalData,
    openCreateEvent,
    openEditEvent,
    handleSaveEvent,
    setIsEventModalOpen,
    deleteEvent,
    duplicateEvent,
    moveEventToTrack,
    updateEventGap,
    updateEventOffset,
    reorderTracks,
    reorderEvents,
    temporalPlanes,
    isTrackModalOpen,
    trackModalData,
    openCreateTrack,
    openEditTrack,
    handleSaveTrack,
    setIsTrackModalOpen,
    deleteTrack,
    isPlaneModalOpen,
    editingPlane,
    openCreatePlane,
    openEditPlane,
    setIsPlaneModalOpen,
  };
};
