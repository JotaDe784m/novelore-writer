import { TimelineTrack, TimelineEvent, CorkboardColumn, CorkboardCard } from "../types";

export type TemporalPlane = "past" | "present" | "future" | string;

export interface TemporalPlaneDefinition {
  id: string;
  name: string;
  shortLabel?: string;
  description?: string;
  color: string;
  badgeBg?: string;
  badgeText?: string;
  isCustom?: boolean;
}

export interface PlanningDataPayload {
  timeline?: {
    tracks: TimelineTrack[];
    events: TimelineEvent[];
    temporalPlanes?: TemporalPlaneDefinition[];
  };
  corkboard?: {
    columns: CorkboardColumn[];
    cards: CorkboardCard[];
  };
  matrix?: {
    rows: any[];
  };
  beats?: any[];
}

export interface PlanningStoreState {
  tracks: TimelineTrack[];
  events: TimelineEvent[];
  temporalPlanes: TemporalPlaneDefinition[];
  corkboard: {
    columns: CorkboardColumn[];
    cards: CorkboardCard[];
  };
  matrix: {
    rows: any[];
  };
  storyBeats: any[];

  isSaving: boolean;
  lastSavedAt: Date | null;
  errorMessage: string | null;

  activeTemporalPlaneFilter: "all" | string;
  activeTrackFilter: string | null;
  activeSearchQuery: string;

  initPlanning: (data?: PlanningDataPayload) => void;
  setTemporalPlaneFilter: (plane: "all" | string) => void;
  setTrackFilter: (trackId: string | null) => void;
  setSearchQuery: (query: string) => void;

  addTrack: (track: Omit<TimelineTrack, "id">) => string;
  updateTrack: (id: string, updates: Partial<TimelineTrack>) => void;
  deleteTrack: (id: string) => void;
  reorderTracks: (trackIds: string[], planeId?: string) => void;

  addEvent: (event: Omit<TimelineEvent, "id">) => string;
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => string | null;
  moveEventToTrack: (
    eventId: string,
    targetTrackId: string,
    targetOrIndex?: string | number,
    position?: "before" | "after"
  ) => void;
  reorderEvents: (trackId: string, eventIds: string[]) => void;

  addTemporalPlane: (plane: Omit<TemporalPlaneDefinition, "id">) => string;
  updateTemporalPlane: (id: string, updates: Partial<TemporalPlaneDefinition>) => void;
  deleteTemporalPlane: (id: string) => void;
  restoreDefaultTemporalPlanes: () => void;

  syncWithCodexEvent: (codexEventId: string, codexEventName: string, codexEventDesc?: string) => string;
  savePlanningImmediately: () => Promise<boolean>;
  debouncedSavePlanning: () => void;
  resetPlanning: () => void;
}
