export type EntityCategory =
  | "character"
  | "location"
  | "faction"
  | "item"
  | "concept"
  | "event";

export type SceneStatus = "idea" | "draft" | "revised" | "polished" | "final";

export interface Scene {
  id: string;
  chapterId: string;
  title: string;
  content: string; // Plain text or HTML formatted content
  synopsis: string;
  notes: string;
  status: SceneStatus;
  povCharacterId?: string;
  characterIds: string[]; // Characters present
  locationId?: string;
  goal: string; // What the POV wants
  conflict: string; // What's in the way
  outcome: string; // How it resolves
  targetWordCount: number;
  wordCount: number;
  timelineEventId?: string;
  historicalEventIds?: string[]; // IDs of WorldEntity (category: 'event') recalled, revealed, or discussed in this scene
  order: number;
}

export interface Chapter {
  id: string;
  actId: string;
  title: string;
  description: string;
  order: number;
  targetWordCount?: number;
  scenes: Scene[];
}

export interface Act {
  id: string;
  title: string;
  description: string;
  order: number;
  targetWordCount?: number;
  chapters: Chapter[];
}

export type RelationshipType =
  | "ally"
  | "enemy"
  | "family"
  | "romance"
  | "mentor"
  | "rival"
  | "secret"
  | "debt"
  | "subordinate"
  | "friendly"
  | "hostile"
  | "romantic"
  | "friend";

export interface Relationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: RelationshipType;
  label: string;
  notes?: string;
  description?: string;
  sentiment?: "positive" | "neutral" | "negative" | "complex";
  controlPoint?: { x: number; y: number }; // Posición del punto de control / curva arrastrable
}

export interface EntityImage {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
}

export interface WorldEntity {
  id: string;
  category: EntityCategory;
  name: string;
  subtitle?: string; // e.g. "Heredera del Trono de Éter"
  summary: string;
  tags: string[];
  aliases?: string[]; // Apodos o variantes de nombre para contabilizar menciones en el manuscrito
  attributes: Record<string, string>; // Dynamic key-value pairs (e.g. "Edad", "Rol", "Motivación", "Miedo")
  notes: string;
  avatarIcon?: string;
  avatarUrl?: string; // Imagen de perfil de la entrada
  gallery?: EntityImage[]; // Galería de imágenes
  color?: string;
  relationships?: string[]; // IDs of relationships
  whiteboard?: MoodboardCanvas; // Pizarra interactiva propia del elemento
  timelineEventId?: string; // ID of linked TimelineEvent if synced with planning timeline
  dateOrEpoch?: string; // Fecha, año o época histórica
  isHistorical?: boolean; // True si es un evento del pasado/lore vs trama presente
  involvedEntityIds?: string[]; // Personajes, facciones, lugares y objetos vinculados
}

export interface TimelineTrack {
  id: string;
  name: string;
  color: string;
  description: string;
  isMainPlot: boolean;
}

export interface TimelineEvent {
  id: string;
  trackId: string;
  title: string;
  summary: string;
  sceneId?: string; // Associated manuscript scene if any
  position: number; // 0 to 100 or relative step in the chronological timeline
  importance: "minor" | "key" | "turning_point" | "climax";
  characterIds: string[];
  locationId?: string;
  dateOrEpoch?: string;
  entityId?: string; // ID de la entrada en la Biblia (Codex), especialmente categoría 'event'
  isHistorical?: boolean; // True si es un acontecimiento histórico previo (Lore / Pasado)
  era?: string; // e.g. "Primera Era", "Hace 50 años", "Preludio"
  factionIds?: string[]; // Facciones participantes
  itemIds?: string[]; // Reliquias u objetos involucrados
  consequences?: string; // Consecuencias o impacto en el presente
}

export interface StoryBeat {
  id: string;
  name: string;
  structure: "three_act" | "save_the_cat" | "heros_journey";
  percentage: number; // Expected target % in manuscript (e.g. Inciting Incident ~12%)
  description: string;
  assignedSceneId?: string;
}

export * from "./types/exportTemplates";

export interface ProjectSettings {
  targetTotalWords: number;
  enableWordGoals?: boolean; // When false, word count targets and progress bars are hidden/disabled
  defaultActWordGoal?: number;
  defaultChapterWordGoal?: number;
  defaultSceneWordGoal?: number;
  dialogueStyle: "dash" | "guillemets" | "quotes"; // "—" (Spanish RAE), "« »", or "\""
  fontFamily: "serif" | "serif-display" | "sans" | "mono" | "lora" | "garamond" | "custom" | string;
  customFontName?: string; // Nombre de la fuente propia o del sistema
  customFontData?: string; // Data URL / Base64 para archivo .ttf, .otf, .woff cargado
  fontSize: number;
  lineSpacing: "normal" | "relaxed" | "loose" | "compact" | "double" | string;
  textAlign?: "left" | "justify";
  paragraphIndent?: boolean;
  typewriterMode: boolean;
  theme: "minimal" | "clean" | "sepia" | "fantasy" | "dark" | "light" | "scifi" | "noir" | "gothic" | "romance" | "forest" | "midnight" | "dream" | string;
  customAccentColor?: string;
  customExportTemplates?: import("./types/exportTemplates").ExportTemplate[];
  activeExportTemplateId?: string;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  timestamp: string; // ISO string
  label: string;
  wordCount: number;
  actCount: number;
  chapterCount: number;
  sceneCount: number;
  projectSnapshot: NovelProject;
}

export interface BoardItem {
  id: string;
  type: "image" | "note" | "shape" | "connector" | "text" | "link";
  x: number;
  y: number;
  width?: number;
  height?: number;
  zIndex?: number;
  // Link / Document / Media item:
  linkUrl?: string;
  linkType?: "spotify" | "youtube" | "web" | "document";
  linkFormat?: "rectangle" | "square";
  embedMode?: boolean; // If true, renders inline embed player (e.g. Spotify / YouTube)
  fileName?: string;
  fileSize?: string;
  fileType?: "pdf" | "doc" | "txt" | "other";
  fileData?: string; // base64 data URI or blob URL for uploaded PDF/document
  description?: string;
  // Image item:
  imageUrl?: string;
  caption?: string;
  hideCaption?: boolean;
  entityId?: string;
  // Note & Text item:
  title?: string;
  text?: string;
  richText?: string;
  color?: string; // e.g. "yellow" | "rose" | "teal" | "lavender" | "amber" | "dark" | hex
  fontSize?: number;
  // Shape item:
  shapeType?: "rectangle" | "circle" | "badge" | "card";
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  label?: string;
  textAlign?: "left" | "center" | "right";
  fontFamily?: string;
  // Connector / Arrow item:
  connectorType?: "arrow" | "line" | "dashed" | "curved-arrow" | "curved-line";
  isCurved?: boolean;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  controlX?: number;
  controlY?: number;
  arrowColor?: string;
  arrowLabel?: string;
  startCap?: "none" | "arrow" | "circle";
  endCap?: "none" | "arrow" | "circle";
  isDashed?: boolean;
  strokeWidth?: number;
  startAnchor?: { itemId: string; position: "top" | "bottom" | "left" | "right" | "center" };
  endAnchor?: { itemId: string; position: "top" | "bottom" | "left" | "right" | "center" };
}

export interface MoodboardCanvas {
  items: BoardItem[];
  zoom?: number;
  panX?: number;
  panY?: number;
  isStoredInSubcollection?: boolean;
}

export interface ConflictInfo {
  remoteProject: NovelProject;
  remoteUpdatedAt: string;
  remoteWordCount: number;
  remoteTitle: string;
  localUpdatedAt: string;
  localWordCount: number;
  localTitle: string;
  localProject?: NovelProject;
}

export interface NovelProject {
  id: string;
  ownerId?: string; // Firebase Auth UID del autor propietario en la nube (Fase 1: Project Ownership)
  title: string;
  subtitle?: string;
  author: string;
  genre: string;
  coverUrl?: string; // Portada personalizada de la novela
  logline: string;
  synopsis: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean; // Para identificar que es la novela de ejemplo y evitar subirla a la nube
  settings: ProjectSettings;
  acts: Act[];
  entities: WorldEntity[];
  relationships: Relationship[];
  timelineTracks: TimelineTrack[];
  timelineEvents: TimelineEvent[];
  storyBeats: StoryBeat[];
  relationshipPositions?: Record<string, { x: number; y: number }>;
  whiteboard?: MoodboardCanvas; // Pizarra interactiva de imágenes, notas, formas y flechas
  /**
   * Versión del esquema de persistencia cloud (Fase 2.2 y 2.2.1):
   * - undefined / 1: Representación monolítica legacy donde la prosa (content) se almacena en el documento raíz.
   * - 2: Arquitectura particionada híbrida donde el documento raíz actúa como manifiesto estructural
   *   (con content: "") y la prosa se almacena atómicamente en la subcolección /scenes/{sceneId}.
   * 
   * Justificación arquitectónica:
   * - Compatibilidad estricta entre la representación monolítica original y la arquitectura particionada.
   * - Detección determinista de la estrategia de carga y sincronización.
   * - Rehidratación garantizada y sin ambigüedades del contenido del manuscrito.
   */
  schemaVersion?: number;
  syncVersion?: number; // Contador lógico de versión de sincronización cloud (commit marker)
  syncStatus?: "committed" | "pending"; // Estado de confirmación del guardado cloud
}

export interface CloudSceneDocument {
  id: string; // sceneId
  novelId: string;
  chapterId: string;
  actId: string;
  content: string;
  notes?: string;
  wordCount: number;
  updatedAt: string;
  syncVersion?: number;
}

export interface CloudBoardDocument {
  novelId: string;
  items: BoardItem[];
  zoom?: number;
  panX?: number;
  panY?: number;
  updatedAt: string;
  syncVersion?: number;
}

export type ProjectView =
  | "home"
  | "editor"
  | "planning"
  | "codex"
  | "relationships"
  | "gallery"
  | "manuscript"
  | "world"
  | "relations"
  | "stats"
  | "export";

export type ActiveView = ProjectView;

export interface ProjectMeta {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  genre: string;
  coverUrl?: string;
  enableWordGoals?: boolean;
  synopsis?: string;
  logline?: string;
  createdAt?: string;
  updatedAt: string;
  wordCount: number;
  targetWords?: number;
  actCount?: number;
  chapterCount?: number;
  sceneCount?: number;
  characterCount?: number;
}

export type PlanningSubView = "timeline" | "corkboard" | "beats" | "matrix";

export * from "./types/assets";
