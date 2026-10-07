import {
  NovelProject,
  TimelineLinkedManuscriptItem,
  EntityImage,
  MoodboardCanvas,
  NoteCardLayout,
} from "../../../types";
import { TemporalPlane } from "../../../stores/planningStoreTypes";

export interface TimelineViewProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onSelectScene: (sceneId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
  onOpenEntityWhiteboard?: (entityId: string) => void;
}

export interface FlattenedScene {
  id: string;
  title: string;
  actTitle: string;
  chapterTitle: string;
}

export interface EventModalData {
  id?: string;
  title: string;
  subtitle?: string;
  summary: string;
  trackId: string;
  temporalPlane?: TemporalPlane;
  date?: string;
  dateType?: "calendar" | "free";
  relativeOffset?: number;
  timeGapLabel?: string;
  linkedManuscriptItems?: TimelineLinkedManuscriptItem[];
  pinnedAttributes?: string[];
  wideAttributes?: string[];
  gallery?: EntityImage[];
  avatarUrl?: string;
  avatarOriginalUrl?: string;
  whiteboard?: MoodboardCanvas;
  color?: string;
  notes?: string;
  attributes?: Record<string, string>;
  attributeLayouts?: Record<string, NoteCardLayout>;
  tags?: string[];
  aliases?: string[];
  sceneId?: string;
  codexEntityId?: string;
  characterIds?: string[];
  locationId?: string;
  consequences?: string;
}

export interface TrackModalData {
  id?: string;
  name: string;
  color: string;
  description: string;
  planeId?: string;
}
