import { EntityCategory, EntityImage, NoteCardLayout, NovelProject, Scene, TimelineEvent, WorldEntity } from "../../../types";
import { EntityDetailedMentions } from "../../../utils/mentionTypes";

export type DossierTab =
  | "identity"
  | "attributes"
  | "notes"
  | "links"
  | "gallery"
  | "mentions"
  | "whiteboard";

interface MentionSceneOccurrence {
  sceneId: string;
  sceneTitle: string;
  chapterTitle: string;
  actTitle: string;
  count: number;
}

export interface MentionStats {
  totalCount: number;
  byTerm: { term: string; count: number }[];
  scenes: MentionSceneOccurrence[];
}

export interface EntityModalProps {
  entity: WorldEntity | null;
  project: NovelProject;
  onSave: (entity: WorldEntity, syncedTimelineEvent?: Partial<TimelineEvent> | null) => void;
  onDelete: (entityId: string) => void;
  onClose: () => void;
  initialTab?: "details" | "whiteboard" | DossierTab;
  initialCategory?: EntityCategory;
  onNavigateToTimeline?: (timelineEventId?: string) => void;
  onNavigateToScene?: (sceneId: string) => void;
}

export interface DossierIdentityTabProps {
  category: EntityCategory;
  onCategoryChange: (cat: EntityCategory) => void;
  name: string;
  onNameChange: (val: string) => void;
  subtitle: string;
  onSubtitleChange: (val: string) => void;
  summary: string;
  onSummaryChange: (val: string) => void;
  color: string;
  onColorChange: (color: string, immediate?: boolean) => void;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  avatarUrl: string;
  onRemoveAvatar: () => void;
  onUploadAvatarClick: () => void;
  onOpenCropModal?: () => void;
  onOpenWhiteboard: () => void;
  onNavigateToGallery?: () => void;
  whiteboardItemsCount: number;
  galleryCount: number;
}

export interface DossierGalleryTabProps {
  gallery: EntityImage[];
  avatarUrl: string;
  avatarOriginalUrl?: string;
  onAddImages: (files: FileList | File[]) => void;
  onRemoveImage: (id: string, url: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
  onSetAsAvatar: (url: string) => void;
  onOpenCropForImage?: (url: string) => void;
  onOpenLightbox: (index: number) => void;
}

export interface DossierAttributesTabProps {
  category: EntityCategory;
  attributes: Record<string, string>;
  attributeLayouts?: Record<string, NoteCardLayout>;
  pinnedAttributes?: string[];
  wideAttributes?: string[];
  onAttributeChange: (key: string, value: string) => void;
  onRemoveAttribute: (key: string) => void;
  onAddAttribute: (key: string, value?: string) => void;
  onTogglePinAttribute?: (key: string) => void;
  onToggleWideAttribute?: (key: string) => void;
  onReorderAttributes?: (orderedKeys: string[]) => void;
  onRenameAttribute?: (oldKey: string, newKey: string) => void;
  onResetGridLayout?: () => void;
  onUpdateLayout?: (key: string, layout: Partial<NoteCardLayout>) => void;
  onToggleLockAttribute?: (key: string) => void;
}

export interface DossierMentionsTabProps {
  name: string;
  aliases: string[];
  onAddAlias: (alias: string) => void;
  onRemoveAlias: (alias: string) => void;
  mentionStats: MentionStats;
  detailedMentions?: EntityDetailedMentions;
  onNavigateToScene?: (sceneId: string) => void;
}


export interface DossierNotesTabProps {
  notes: string;
  onNotesChange: (val: string) => void;
  entityName?: string;
}
