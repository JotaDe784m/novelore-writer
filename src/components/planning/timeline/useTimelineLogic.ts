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
  const moveEventToTrack = usePlanningStore((s) => s.moveEventToTrack);

  const codexEntities = useCodexStore((s) => s.entities);
  const allCodexEntities = codexEntities.length > 0 ? codexEntities : (project.entities || []);

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
    setEventModalData({
      title: "",
      summary: "",
      trackId: trackId || tracks[0]?.id || "track-main",
      temporalPlane: activePlane === "all" ? undefined : activePlane,
      date: "",
      characterIds: [],
    });
    setIsEventModalOpen(true);
  };

  const openEditEvent = (event: TimelineEvent) => {
    setEventModalData({
      id: event.id,
      title: event.title,
      summary: event.summary || "",
      trackId: event.trackId,
      temporalPlane: event.temporalPlane,
      date: event.date || "",
      sceneId: event.sceneId,
      codexEntityId: event.codexEntityId,
      characterIds: event.characterIds || [],
      locationId: event.locationId,
      consequences: event.consequences || "",
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (data: EventModalData) => {
    const payload = {
      title: data.title,
      summary: data.summary,
      trackId: data.trackId,
      temporalPlane: data.temporalPlane,
      date: data.date,
      sceneId: data.sceneId,
      codexEntityId: data.codexEntityId,
      characterIds: data.characterIds,
      locationId: data.locationId,
      consequences: data.consequences,
    };
    if (data.id) updateEvent(data.id, payload);
    else addEvent(payload);
    setIsEventModalOpen(false);
  };

  const openCreateTrack = () => {
    setTrackModalData({ name: "", color: "#6366f1", description: "" });
    setIsTrackModalOpen(true);
  };

  const openEditTrack = (track: TimelineTrack) => {
    setTrackModalData({
      id: track.id,
      name: track.name,
      color: track.color || "#6366f1",
      description: track.description || "",
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
    moveEventToTrack,
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
