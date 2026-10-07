import { create } from "zustand";
import { TimelineTrack, TimelineEvent } from "../types";
import { PlanningDataPayload, PlanningStoreState, TemporalPlaneDefinition } from "./planningStoreTypes";
import { DEFAULT_TIMELINE_TRACKS, CANONICAL_DEFAULT_PLANES } from "../utils/planningDefaults";
import { reorderTrackList, reorderTrackEventsList, reorderEventInTracks, mergePlanningIntoProject, executePlanningSave } from "../utils/planningSync";
import { useProjectStore } from "./useProjectStore";
import { deleteLocalImage, cleanupProjectOrphanAssets } from "../utils/imageUtils";

let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export const usePlanningStore = create<PlanningStoreState>((set, get) => ({
  tracks: DEFAULT_TIMELINE_TRACKS,
  events: [],
  temporalPlanes: CANONICAL_DEFAULT_PLANES,
  corkboard: { columns: [], cards: [] },
  matrix: { rows: [] },
  storyBeats: [],
  isSaving: false,
  lastSavedAt: null,
  errorMessage: null,
  activeTemporalPlaneFilter: "all",
  activeTrackFilter: null,
  activeSearchQuery: "",

  initPlanning: (data?: PlanningDataPayload) => {
    set({
      tracks: data?.timeline?.tracks?.length ? data.timeline.tracks : DEFAULT_TIMELINE_TRACKS,
      events: data?.timeline?.events || [],
      temporalPlanes: data?.timeline?.temporalPlanes?.length ? data.timeline.temporalPlanes : CANONICAL_DEFAULT_PLANES,
      corkboard: data?.corkboard || { columns: [], cards: [] },
      matrix: data?.matrix || { rows: [] },
      storyBeats: data?.beats || [],
      isSaving: false,
      lastSavedAt: null,
      errorMessage: null,
    });
  },

  setTemporalPlaneFilter: (plane: "all" | string) => set({ activeTemporalPlaneFilter: plane }),
  setTrackFilter: (trackId: string | null) => set({ activeTrackFilter: trackId }),
  setSearchQuery: (query: string) => set({ activeSearchQuery: query }),

  addTrack: (trackData: Omit<TimelineTrack, "id">) => {
    const newId = `track-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newTrack: TimelineTrack = { ...trackData, id: newId, order: trackData.order ?? get().tracks.length };
    set((state) => ({ tracks: [...state.tracks, newTrack] }));
    get().debouncedSavePlanning();
    return newId;
  },

  updateTrack: (id: string, updates: Partial<TimelineTrack>) => {
    set((state) => ({ tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
    get().debouncedSavePlanning();
  },

  deleteTrack: (id: string) => {
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
      events: state.events.filter((e) => e.trackId !== id),
    }));
    get().debouncedSavePlanning();
  },

  reorderTracks: (trackIds: string[], planeId?: string) => {
    if (planeId && planeId !== "all") {
      set((state) => ({
        tracks: state.tracks.map((t) => {
          const idx = trackIds.indexOf(t.id);
          return idx !== -1 ? { ...t, planeOrder: idx } : t;
        }),
      }));
    } else {
      set({ tracks: reorderTrackList(get().tracks, trackIds) });
    }
    get().debouncedSavePlanning();
  },

  addEvent: (eventData: Omit<TimelineEvent, "id">) => {
    const newId = `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const trackEvents = get().events.filter((e) => e.trackId === eventData.trackId);
    const newEvent: TimelineEvent = {
      ...eventData, id: newId, temporalPlane: eventData.temporalPlane,
      position: eventData.position ?? trackEvents.length, order: eventData.order ?? trackEvents.length,
    };
    set((state) => ({ events: [...state.events, newEvent] }));
    get().debouncedSavePlanning();
    return newId;
  },

  updateEvent: (id: string, updates: Partial<TimelineEvent>) => {
    set((state) => ({ events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
    get().debouncedSavePlanning();
  },

  deleteEvent: (id: string) => {
    const target = get().events.find((e) => e.id === id);
    if (target) {
      if (target.avatarUrl?.includes("_crop")) deleteLocalImage(target.avatarUrl).catch(() => {});
      if (target.avatarOriginalUrl && !target.gallery?.some((g) => g.url === target.avatarOriginalUrl)) {
        deleteLocalImage(target.avatarOriginalUrl).catch(() => {});
      }
      target.gallery?.forEach((img) => deleteLocalImage(img.url).catch(() => {}));
    }
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
    get().debouncedSavePlanning();
    cleanupProjectOrphanAssets().catch(() => {});
  },

  duplicateEvent: (id: string) => {
    const ev = get().events.find((e) => e.id === id);
    if (!ev) return null;
    const { id: _, ...rest } = ev;
    return get().addEvent({ ...rest, title: `${ev.title} (Copia)` });
  },

  reorderEvents: (trackId: string, eventIds: string[]) => {
    set({ events: reorderTrackEventsList(get().events, trackId, eventIds) });
    get().debouncedSavePlanning();
  },

  moveEventToTrack: (eventId: string, newTrackId: string, targetOrIndex?: string | number, position: "before" | "after" = "before") => {
    set({ events: reorderEventInTracks(get().events, eventId, newTrackId, targetOrIndex, position) });
    get().debouncedSavePlanning();
  },

  addTemporalPlane: (planeData: Omit<TemporalPlaneDefinition, "id">) => {
    const newId = `plane-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newPlane: TemporalPlaneDefinition = { ...planeData, id: newId, isCustom: true };
    set((state) => ({ temporalPlanes: [...state.temporalPlanes, newPlane] }));
    get().debouncedSavePlanning();
    return newId;
  },

  updateTemporalPlane: (id: string, updates: Partial<TemporalPlaneDefinition>) => {
    set((state) => ({ temporalPlanes: state.temporalPlanes.map((p) => (p.id === id ? { ...p, ...updates } : p)) }));
    get().debouncedSavePlanning();
  },

  deleteTemporalPlane: (id: string) => {
    set((state) => ({
      temporalPlanes: state.temporalPlanes.filter((p) => p.id !== id),
      events: state.events.map((e) => (e.temporalPlane === id ? { ...e, temporalPlane: undefined } : e)),
      tracks: state.tracks.map((t) => (t.planeId === id ? { ...t, planeId: undefined } : t)),
    }));
    get().debouncedSavePlanning();
  },

  restoreDefaultTemporalPlanes: () => {
    const current = get().temporalPlanes;
    const missing = CANONICAL_DEFAULT_PLANES.filter((canon) => !current.some((p) => p.id === canon.id));
    if (missing.length === 0) return;
    set((state) => ({ temporalPlanes: [...state.temporalPlanes, ...missing] }));
    get().debouncedSavePlanning();
  },

  syncWithCodexEvent: (codexEventId: string, codexEventName: string, codexEventDesc?: string) => {
    const existing = get().events.find((e) => e.codexEntityId === codexEventId);
    if (existing) return existing.id;
    const defaultTrackId = get().tracks[0]?.id || "track-main";
    return get().addEvent({
      title: codexEventName, summary: codexEventDesc || "",
      trackId: defaultTrackId, codexEntityId: codexEventId, temporalPlane: "past",
    });
  },

  savePlanningImmediately: async () => {
    if (saveDebounceTimer) { clearTimeout(saveDebounceTimer); saveDebounceTimer = null; }
    const state = get();
    set({ isSaving: true, errorMessage: null });
    const payload: PlanningDataPayload = {
      timeline: { tracks: state.tracks, events: state.events, temporalPlanes: state.temporalPlanes },
      corkboard: state.corkboard, matrix: state.matrix, beats: state.storyBeats,
    };
    const currentProject = useProjectStore.getState().project;
    if (currentProject) {
      const merged = mergePlanningIntoProject(currentProject, payload);
      if (merged) useProjectStore.getState().setProject(merged);
    }
    const res = await executePlanningSave(payload);
    if (res.success) {
      set({ isSaving: false, lastSavedAt: new Date() });
      return true;
    } else {
      set({ isSaving: false, errorMessage: res.error || "Error al guardar" });
      return false;
    }
  },

  debouncedSavePlanning: () => {
    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => { get().savePlanningImmediately(); }, 500);
  },

  resetPlanning: () => {
    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    set({
      tracks: DEFAULT_TIMELINE_TRACKS, events: [], temporalPlanes: CANONICAL_DEFAULT_PLANES,
      corkboard: { columns: [], cards: [] }, matrix: { rows: [] }, storyBeats: [],
      isSaving: false, lastSavedAt: null, errorMessage: null,
      activeTemporalPlaneFilter: "all", activeTrackFilter: null, activeSearchQuery: "",
    });
  },
}));
