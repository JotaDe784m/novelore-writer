import { create } from "zustand";
import { Relationship, RelationshipCategory, WorldEntity } from "../types";
import { filterAndSortEntities, getDefaultCategoryColor, getDefaultEntityName } from "../utils/codexDefaults";
import { CodexStoreState } from "./codexStoreTypes";
import { useProjectStore } from "./useProjectStore";

export type { CodexStoreState };

let codexSaveTimeout: ReturnType<typeof setTimeout> | null = null;

const getElectronAPI = () => (typeof window !== "undefined" ? window.electronAPI : undefined);

export const useCodexStore = create<CodexStoreState>((set, get) => {
  const syncToProjectStore = (
    entities: WorldEntity[], relationships: Relationship[],
    positions?: Record<string, { x: number; y: number }>, customCats?: RelationshipCategory[]
  ) => {
    const projectStore = useProjectStore.getState();
    if (projectStore.project) {
      projectStore.setProject({
        ...projectStore.project, entities, relationships,
        relationshipPositions: positions ?? get().relationshipPositions,
        relationshipCategories: customCats ?? get().customRelationshipCategories,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const executeSave = async (
    entities: WorldEntity[], relationships: Relationship[],
    updatedPositions?: Record<string, { x: number; y: number }>, updatedCategories?: RelationshipCategory[]
  ): Promise<boolean> => {
    if (codexSaveTimeout) {
      clearTimeout(codexSaveTimeout);
      codexSaveTimeout = null;
    }
    const positions = updatedPositions ?? get().relationshipPositions;
    const customRelationshipCategories = updatedCategories ?? get().customRelationshipCategories;
    syncToProjectStore(entities, relationships, positions, customRelationshipCategories);

    const electronAPI = getElectronAPI();
    if (!electronAPI?.saveCodex) {
      set({ isSaving: false });
      return false;
    }

    try {
      set({ isSaving: true });
      const res = await electronAPI.saveCodex({
        entities, relationships,
        relationshipPositions: positions,
        customRelationshipCategories,
      });
      const success = !!res?.success;
      set({
        isSaving: false, lastSavedAt: success ? new Date() : get().lastSavedAt,
        errorMessage: success ? null : (res?.error || "Error al guardar códice"),
      });
      return success;
    } catch (err: any) {
      set({ isSaving: false, errorMessage: err.message });
      return false;
    }
  };

  const triggerDebouncedSave = (
    entities: WorldEntity[], relationships: Relationship[],
    updatedPositions?: Record<string, { x: number; y: number }>, updatedCategories?: RelationshipCategory[]
  ) => {
    syncToProjectStore(entities, relationships, updatedPositions, updatedCategories);
    set({ isSaving: true });
    if (codexSaveTimeout) clearTimeout(codexSaveTimeout);
    codexSaveTimeout = setTimeout(() => {
      executeSave(entities, relationships, updatedPositions, updatedCategories);
    }, 500);
  };

  return {
    entities: [], relationships: [], relationshipPositions: {}, customRelationshipCategories: [],
    selectedEntityId: null, selectedCategory: "all", searchQuery: "", selectedTag: "all",
    sortBy: "default", isSaving: false, lastSavedAt: null, errorMessage: null,

    loadCodex: (entities, relationships = [], relationshipPositions = {}, customRelationshipCategories = []) => {
      set({
        entities: Array.isArray(entities) ? entities : [],
        relationships: Array.isArray(relationships) ? relationships : [],
        relationshipPositions: relationshipPositions && typeof relationshipPositions === "object" ? relationshipPositions : {},
        customRelationshipCategories: Array.isArray(customRelationshipCategories) ? customRelationshipCategories : [],
        errorMessage: null,
      });
    },

    saveCodexImmediately: async () => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      return executeSave(entities, relationships, relationshipPositions, customRelationshipCategories);
    },

    addEntity: (category, name) => {
      const { entities, relationships, relationshipPositions } = get();
      const id = `ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newEntity: WorldEntity = {
        id, category, name: name?.trim() || getDefaultEntityName(category),
        summary: "", tags: [], aliases: [], attributes: {}, notes: "",
        color: getDefaultCategoryColor(category), relationships: [],
      };
      const next = [...entities, newEntity];
      set({ entities: next, selectedEntityId: id });
      triggerDebouncedSave(next, relationships, relationshipPositions);
      return newEntity;
    },

    updateEntity: (id, updates) => {
      const { entities, relationships, relationshipPositions } = get();
      const next = entities.map((ent) => (ent.id === id ? { ...ent, ...updates } : ent));
      set({ entities: next });
      triggerDebouncedSave(next, relationships, relationshipPositions);
    },

    deleteEntity: (id) => {
      const { entities, relationships, relationshipPositions, selectedEntityId } = get();
      const nextEntities = entities.filter((ent) => ent.id !== id);
      const nextRelationships = relationships.filter((r) => r.sourceEntityId !== id && r.targetEntityId !== id);
      const nextPositions = { ...relationshipPositions };
      delete nextPositions[id];
      set({ entities: nextEntities, relationships: nextRelationships, relationshipPositions: nextPositions, selectedEntityId: selectedEntityId === id ? null : selectedEntityId });
      triggerDebouncedSave(nextEntities, nextRelationships, nextPositions);
    },

    duplicateEntity: (id) => {
      const { entities, relationships, relationshipPositions } = get();
      const orig = entities.find((e) => e.id === id);
      if (!orig) return null;
      const newId = `ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duplicate: WorldEntity = { ...orig, id: newId, name: `${orig.name} (Copia)`, relationships: [] };
      const next = [...entities, duplicate];
      set({ entities: next, selectedEntityId: newId });
      triggerDebouncedSave(next, relationships, relationshipPositions);
      return duplicate;
    },

    addRelationship: (sourceEntityId, targetEntityId, type, label, sentiment, description) => {
      const { entities, relationships, relationshipPositions } = get();
      const newRel: Relationship = {
        id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sourceEntityId, targetEntityId, type, label: label || type,
        sentiment: sentiment || "neutral", description: description || undefined,
      };
      const next = [...relationships, newRel];
      set({ relationships: next });
      triggerDebouncedSave(entities, next, relationshipPositions);
      return newRel;
    },

    updateRelationship: (id, updates) => {
      const { entities, relationships, relationshipPositions } = get();
      const next = relationships.map((rel) => (rel.id === id ? { ...rel, ...updates } : rel));
      set({ relationships: next });
      triggerDebouncedSave(entities, next, relationshipPositions);
    },

    deleteRelationship: (id) => {
      const { entities, relationships, relationshipPositions } = get();
      const next = relationships.filter((rel) => rel.id !== id);
      set({ relationships: next });
      triggerDebouncedSave(entities, next, relationshipPositions);
    },

    updateNodePosition: (entityId, pos, save = true) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = { ...relationshipPositions, [entityId]: pos };
      set({ relationshipPositions: next });
      if (save) executeSave(entities, relationships, next, customRelationshipCategories);
    },

    updateNodePositions: (positions, save = true) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = { ...relationshipPositions, ...positions };
      set({ relationshipPositions: next });
      if (save) executeSave(entities, relationships, next, customRelationshipCategories);
    },

    updateRelationshipControlPoint: (relId, point, save = true) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = relationships.map((r) => (r.id === relId ? { ...r, controlPoint: point } : r));
      set({ relationships: next });
      if (save) executeSave(entities, next, relationshipPositions, customRelationshipCategories);
    },

    resetRelationshipControlPoints: () => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = relationships.map((r) => ({ ...r, controlPoint: undefined }));
      set({ relationships: next });
      executeSave(entities, next, relationshipPositions, customRelationshipCategories);
    },

    addRelationshipCategory: (category) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const id = `rcat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newCategory: RelationshipCategory = { ...category, id, isCustom: true };
      const next = [...customRelationshipCategories, newCategory];
      set({ customRelationshipCategories: next });
      triggerDebouncedSave(entities, relationships, relationshipPositions, next);
      return newCategory;
    },

    updateRelationshipCategory: (id, updates) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = customRelationshipCategories.map((c) => (c.id === id ? { ...c, ...updates } : c));
      set({ customRelationshipCategories: next });
      triggerDebouncedSave(entities, relationships, relationshipPositions, next);
    },

    deleteRelationshipCategory: (id) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = customRelationshipCategories.filter((c) => c.id !== id);
      set({ customRelationshipCategories: next });
      triggerDebouncedSave(entities, relationships, relationshipPositions, next);
    },

    setSelectedEntityId: (selectedEntityId) => set({ selectedEntityId }),
    setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSelectedTag: (selectedTag) => set({ selectedTag }),
    setSortBy: (sortBy) => set({ sortBy }),

    getEntityById: (id) => get().entities.find((e) => e.id === id),
    getEntitiesByCategory: (category) => get().entities.filter((e) => e.category === category),
    getRelationshipsForEntity: (id) =>
      get().relationships.filter((r) => r.sourceEntityId === id || r.targetEntityId === id),

    getCategoriesSummary: () => {
      const counts: Record<string, number> = { all: get().entities.length };
      for (const e of get().entities) counts[e.category] = (counts[e.category] || 0) + 1;
      return {
        all: counts.all,
        character: counts.character || 0, location: counts.location || 0,
        faction: counts.faction || 0, item: counts.item || 0,
        concept: counts.concept || 0, event: counts.event || 0, other: counts.other || 0,
      };
    },

    getFilteredEntities: (mentionsMap = {}) => {
      const { entities, selectedCategory, searchQuery, selectedTag, sortBy } = get();
      return filterAndSortEntities(entities, selectedCategory, searchQuery, selectedTag, sortBy, mentionsMap);
    },
  };
});
