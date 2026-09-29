import { create } from "zustand";
import { Relationship, WorldEntity } from "../types";
import {
  filterAndSortEntities,
  getDefaultCategoryColor,
  getDefaultEntityName,
} from "../utils/codexDefaults";
import { CodexStoreState } from "./codexStoreTypes";
import { useProjectStore } from "./useProjectStore";

export type { CodexStoreState };

let codexSaveTimeout: ReturnType<typeof setTimeout> | null = null;

const getElectronAPI = () => {
  if (typeof window !== "undefined" && window.electronAPI) {
    return window.electronAPI;
  }
  return undefined;
};

export const useCodexStore = create<CodexStoreState>((set, get) => {
  // Función auxiliar interna para persistencia con debounce y sincronización
  const triggerDebouncedSave = (
    updatedEntities: WorldEntity[],
    updatedRelationships: Relationship[]
  ) => {
    // 1. Sincronizar en memoria con useProjectStore para reactividad inmediata en toda la app
    const projectStore = useProjectStore.getState();
    const currentProj = projectStore.project;
    if (currentProj) {
      projectStore.setProject({
        ...currentProj,
        entities: updatedEntities,
        relationships: updatedRelationships,
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Debounce de 500 ms para guardado atómico en codex.json
    set({ isSaving: true });
    if (codexSaveTimeout) clearTimeout(codexSaveTimeout);

    codexSaveTimeout = setTimeout(async () => {
      const electronAPI = getElectronAPI();
      if (electronAPI?.saveCodex) {
        try {
          const res = await electronAPI.saveCodex({
            entities: updatedEntities,
            relationships: updatedRelationships,
          });
          if (res.success) {
            set({ isSaving: false, lastSavedAt: new Date(), errorMessage: null });
          } else {
            set({ isSaving: false, errorMessage: res.error || "Error al guardar códice" });
          }
        } catch (err: any) {
          console.error("Error al persistir codex.json:", err);
          set({ isSaving: false, errorMessage: err.message });
        }
      } else {
        set({ isSaving: false });
      }
    }, 500);
  };

  return {
    entities: [],
    relationships: [],
    selectedEntityId: null,
    selectedCategory: "all",
    searchQuery: "",
    selectedTag: "all",
    sortBy: "default",
    isSaving: false,
    lastSavedAt: null,
    errorMessage: null,

    loadCodex: (entities, relationships = []) => {
      set({
        entities: Array.isArray(entities) ? entities : [],
        relationships: Array.isArray(relationships) ? relationships : [],
        errorMessage: null,
      });
    },

    addEntity: (category, name) => {
      const { entities, relationships } = get();
      const id = `ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newEntity: WorldEntity = {
        id,
        category,
        name: name?.trim() || getDefaultEntityName(category),
        summary: "",
        tags: [],
        aliases: [],
        attributes: {},
        notes: "",
        color: getDefaultCategoryColor(category),
        relationships: [],
      };

      const nextEntities = [...entities, newEntity];
      set({ entities: nextEntities, selectedEntityId: id });
      triggerDebouncedSave(nextEntities, relationships);
      return newEntity;
    },

    updateEntity: (id, updates) => {
      const { entities, relationships } = get();
      const nextEntities = entities.map((ent) =>
        ent.id === id ? { ...ent, ...updates } : ent
      );
      set({ entities: nextEntities });
      triggerDebouncedSave(nextEntities, relationships);
    },

    deleteEntity: (id) => {
      const { entities, relationships, selectedEntityId } = get();
      const nextEntities = entities.filter((ent) => ent.id !== id);
      // Limpieza en cascada: eliminar relaciones asociadas
      const nextRelationships = relationships.filter(
        (rel) => rel.sourceEntityId !== id && rel.targetEntityId !== id
      );

      set({
        entities: nextEntities,
        relationships: nextRelationships,
        selectedEntityId: selectedEntityId === id ? null : selectedEntityId,
      });
      triggerDebouncedSave(nextEntities, nextRelationships);
    },

    duplicateEntity: (id) => {
      const { entities, relationships } = get();
      const original = entities.find((e) => e.id === id);
      if (!original) return null;

      const newId = `ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duplicate: WorldEntity = {
        ...original,
        id: newId,
        name: `${original.name} (Copia)`,
        relationships: [],
      };

      const nextEntities = [...entities, duplicate];
      set({ entities: nextEntities, selectedEntityId: newId });
      triggerDebouncedSave(nextEntities, relationships);
      return duplicate;
    },

    addRelationship: (sourceEntityId, targetEntityId, type, label) => {
      const { entities, relationships } = get();
      const id = `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newRel: Relationship = {
        id,
        sourceEntityId,
        targetEntityId,
        type,
        label: label || type,
        sentiment: "neutral",
      };

      const nextRelationships = [...relationships, newRel];
      set({ relationships: nextRelationships });
      triggerDebouncedSave(entities, nextRelationships);
      return newRel;
    },

    updateRelationship: (id, updates) => {
      const { entities, relationships } = get();
      const nextRelationships = relationships.map((rel) =>
        rel.id === id ? { ...rel, ...updates } : rel
      );
      set({ relationships: nextRelationships });
      triggerDebouncedSave(entities, nextRelationships);
    },

    deleteRelationship: (id) => {
      const { entities, relationships } = get();
      const nextRelationships = relationships.filter((rel) => rel.id !== id);
      set({ relationships: nextRelationships });
      triggerDebouncedSave(entities, nextRelationships);
    },

    setSelectedEntityId: (id) => set({ selectedEntityId: id }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedTag: (tag) => set({ selectedTag: tag }),
    setSortBy: (sortBy) => set({ sortBy }),

    getEntityById: (id) => get().entities.find((e) => e.id === id),
    getEntitiesByCategory: (category) =>
      get().entities.filter((e) => e.category === category),
    getRelationshipsForEntity: (entityId) =>
      get().relationships.filter(
        (r) => r.sourceEntityId === entityId || r.targetEntityId === entityId
      ),

    getCategoriesSummary: () => {
      const { entities } = get();
      return {
        all: entities.length,
        character: entities.filter((e) => e.category === "character").length,
        location: entities.filter((e) => e.category === "location").length,
        faction: entities.filter((e) => e.category === "faction").length,
        item: entities.filter((e) => e.category === "item").length,
        concept: entities.filter((e) => e.category === "concept").length,
        event: entities.filter((e) => e.category === "event").length,
        other: entities.filter((e) => e.category === "other").length,
      };
    },

    getFilteredEntities: (mentionsMap = {}) => {
      const { entities, selectedCategory, searchQuery, selectedTag, sortBy } = get();
      return filterAndSortEntities(
        entities,
        selectedCategory,
        searchQuery,
        selectedTag,
        sortBy,
        mentionsMap
      );
    },
  };
});
