import { CustomEntityCategory, EntityCategory, Relationship, RelationshipCategory, RelationshipType, WorldEntity } from "../types";

export interface CodexStoreState {
  entities: WorldEntity[];
  relationships: Relationship[];
  relationshipPositions: Record<string, { x: number; y: number }>;
  customRelationshipCategories: RelationshipCategory[];
  customEntityCategories: CustomEntityCategory[];
  categoryOrders: Record<string, string[]>; // { all: [...], character: [...], etc. }
  selectedEntityId: string | null;
  selectedCategory: EntityCategory | "all";
  searchQuery: string;
  selectedTag: string;
  sortBy: "default" | "most_mentions" | "least_mentions" | "unmentioned" | "name_asc";
  isSaving: boolean;
  lastSavedAt: Date | null;
  errorMessage: string | null;

  // Acciones principales de datos
  loadCodex: (
    entities: WorldEntity[],
    relationships?: Relationship[],
    relationshipPositions?: Record<string, { x: number; y: number }>,
    customRelationshipCategories?: RelationshipCategory[],
    customEntityCategories?: CustomEntityCategory[],
    categoryOrders?: Record<string, string[]>
  ) => void;
  saveCodexImmediately: () => Promise<boolean>;
  reorderEntities: (category: EntityCategory | "all", orderedIds: string[]) => void;
  addEntity: (category: EntityCategory, name?: string) => WorldEntity;
  updateEntity: (id: string, updates: Partial<WorldEntity>) => void;
  deleteEntity: (id: string) => void;
  duplicateEntity: (id: string) => WorldEntity | null;
  addCustomEntityCategory: (
    category: Omit<CustomEntityCategory, "id">
  ) => CustomEntityCategory;
  updateCustomEntityCategory: (
    id: string,
    updates: Partial<CustomEntityCategory>
  ) => void;
  deleteCustomEntityCategory: (id: string) => void;

  // Acciones de relaciones y grafo
  addRelationship: (
    sourceEntityId: string,
    targetEntityId: string,
    type: RelationshipType,
    label?: string,
    sentiment?: "positive" | "neutral" | "negative" | "complex",
    description?: string
  ) => Relationship;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (id: string) => void;
  updateNodePosition: (entityId: string, position: { x: number; y: number }, save?: boolean) => void;
  updateNodePositions: (positions: Record<string, { x: number; y: number }>, save?: boolean) => void;
  updateRelationshipControlPoint: (
    relationshipId: string,
    point?: { x: number; y: number },
    save?: boolean
  ) => void;
  resetRelationshipControlPoints: () => void;
  addRelationshipCategory: (
    category: Omit<RelationshipCategory, "id" | "isCustom">
  ) => RelationshipCategory;
  updateRelationshipCategory: (
    id: string,
    updates: Partial<RelationshipCategory>
  ) => void;
  deleteRelationshipCategory: (id: string) => void;

  // Acciones de UI y filtros
  setSelectedEntityId: (id: string | null) => void;
  setSelectedCategory: (category: EntityCategory | "all") => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string) => void;
  setSortBy: (sort: "default" | "most_mentions" | "least_mentions" | "unmentioned" | "name_asc") => void;

  // Selectores y Getters
  getEntityById: (id: string) => WorldEntity | undefined;
  getEntitiesByCategory: (category: EntityCategory) => WorldEntity[];
  getRelationshipsForEntity: (entityId: string) => Relationship[];
  getCategoriesSummary: () => Record<string, number>;
  getFilteredEntities: (mentionsMap?: Record<string, { totalCount: number }>) => WorldEntity[];
}
