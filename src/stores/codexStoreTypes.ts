import { EntityCategory, Relationship, RelationshipType, WorldEntity } from "../types";

export interface CodexStoreState {
  entities: WorldEntity[];
  relationships: Relationship[];
  selectedEntityId: string | null;
  selectedCategory: EntityCategory | "all";
  searchQuery: string;
  selectedTag: string;
  sortBy: "default" | "most_mentions" | "least_mentions" | "name_asc";
  isSaving: boolean;
  lastSavedAt: Date | null;
  errorMessage: string | null;

  // Acciones principales de datos
  loadCodex: (entities: WorldEntity[], relationships?: Relationship[]) => void;
  addEntity: (category: EntityCategory, name?: string) => WorldEntity;
  updateEntity: (id: string, updates: Partial<WorldEntity>) => void;
  deleteEntity: (id: string) => void;
  duplicateEntity: (id: string) => WorldEntity | null;

  // Acciones de relaciones
  addRelationship: (
    sourceEntityId: string,
    targetEntityId: string,
    type: RelationshipType,
    label?: string
  ) => Relationship;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (id: string) => void;

  // Acciones de UI y filtros
  setSelectedEntityId: (id: string | null) => void;
  setSelectedCategory: (category: EntityCategory | "all") => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string) => void;
  setSortBy: (sort: "default" | "most_mentions" | "least_mentions" | "name_asc") => void;

  // Selectores y Getters
  getEntityById: (id: string) => WorldEntity | undefined;
  getEntitiesByCategory: (category: EntityCategory) => WorldEntity[];
  getRelationshipsForEntity: (entityId: string) => Relationship[];
  getCategoriesSummary: () => Record<EntityCategory | "all", number>;
  getFilteredEntities: (mentionsMap?: Record<string, { totalCount: number }>) => WorldEntity[];
}
