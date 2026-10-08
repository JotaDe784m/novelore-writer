import { create } from "zustand";
import { CustomEntityCategory, EntityCategory, Relationship, RelationshipCategory, WorldEntity } from "../types";
import { filterAndSortEntities, getDefaultCategoryColor, getDefaultEntityName } from "../utils/codexDefaults";
import { deleteLocalImage, cleanupProjectOrphanAssets } from "../utils/imageUtils";
import { CANONICAL_DEFAULT_CATEGORIES } from "../utils/categoryDetection";
import { CodexStoreState } from "./codexStoreTypes";
import { useProjectStore } from "./useProjectStore";

export type { CodexStoreState };
let codexSaveTimeout: ReturnType<typeof setTimeout> | null = null;
const getElectronAPI = () => (typeof window !== "undefined" ? window.electronAPI : undefined);

export const useCodexStore = create<CodexStoreState>((set, get) => {
  const syncToProjectStore = (
    entities: WorldEntity[], relationships: Relationship[], positions?: Record<string, { x: number; y: number }>,
    customCats?: RelationshipCategory[], customEntityCats?: CustomEntityCategory[], catOrders?: Record<string, string[]>
  ) => {
    const projectStore = useProjectStore.getState();
    if (!projectStore.project) return;
    projectStore.setProject({
      ...projectStore.project, entities, relationships,
      relationshipPositions: positions ?? get().relationshipPositions,
      relationshipCategories: customCats ?? get().customRelationshipCategories,
      customEntityCategories: customEntityCats ?? get().customEntityCategories,
      categoryOrders: catOrders ?? get().categoryOrders, updatedAt: new Date().toISOString(),
    });
  };

  const executeSave = async (
    entities: WorldEntity[], relationships: Relationship[], updatedPositions?: Record<string, { x: number; y: number }>,
    updatedCategories?: RelationshipCategory[], updatedEntityCategories?: CustomEntityCategory[], updatedOrders?: Record<string, string[]>
  ): Promise<boolean> => {
    if (codexSaveTimeout) { clearTimeout(codexSaveTimeout); codexSaveTimeout = null; }
    const positions = updatedPositions ?? get().relationshipPositions;
    const customRelationshipCategories = updatedCategories ?? get().customRelationshipCategories;
    const customEntityCategories = updatedEntityCategories ?? get().customEntityCategories;
    const categoryOrders = updatedOrders ?? get().categoryOrders;
    syncToProjectStore(entities, relationships, positions, customRelationshipCategories, customEntityCategories, categoryOrders);
    const projectStore = useProjectStore.getState();
    if (projectStore.project?.isDemo) { set({ isSaving: false }); return true; }
    const electronAPI = getElectronAPI();
    if (!electronAPI?.saveCodex) { set({ isSaving: false }); return false; }
    try {
      set({ isSaving: true });
      const res = await electronAPI.saveCodex({
        entities, relationships, relationshipPositions: positions, customRelationshipCategories, customEntityCategories, categoryOrders,
      });
      const success = !!res?.success;
      set({ isSaving: false, lastSavedAt: success ? new Date() : get().lastSavedAt, errorMessage: success ? null : (res?.error || "Error al guardar códice") });
      return success;
    } catch (err: any) {
      set({ isSaving: false, errorMessage: err.message });
      return false;
    }
  };

  const triggerDebouncedSave = (
    entities: WorldEntity[], relationships: Relationship[], updatedPositions?: Record<string, { x: number; y: number }>,
    updatedCategories?: RelationshipCategory[], updatedEntityCategories?: CustomEntityCategory[], updatedOrders?: Record<string, string[]>
  ) => {
    syncToProjectStore(entities, relationships, updatedPositions, updatedCategories, updatedEntityCategories, updatedOrders);
    if (codexSaveTimeout) clearTimeout(codexSaveTimeout);
    set({ isSaving: true });
    codexSaveTimeout = setTimeout(() => executeSave(entities, relationships, updatedPositions, updatedCategories, updatedEntityCategories, updatedOrders), 500);
  };

  return {
    entities: [], relationships: [], relationshipPositions: {}, customRelationshipCategories: [], customEntityCategories: CANONICAL_DEFAULT_CATEGORIES, categoryOrders: {},
    selectedEntityId: null, selectedCategory: "all", searchQuery: "", selectedTag: "all", sortBy: "default", isSaving: false, lastSavedAt: null, errorMessage: null,

    loadCodex: (entities, relationships = [], relationshipPositions = {}, customRelationshipCategories = [], customEntityCategories = [], categoryOrders = {}) => {
      const initialCats = Array.isArray(customEntityCategories) && customEntityCategories.length > 0
        ? customEntityCategories
        : CANONICAL_DEFAULT_CATEGORIES;
      set({
        entities: Array.isArray(entities) ? entities : [],
        relationships: Array.isArray(relationships) ? relationships : [],
        relationshipPositions: relationshipPositions && typeof relationshipPositions === "object" ? relationshipPositions : {},
        customRelationshipCategories: Array.isArray(customRelationshipCategories) ? customRelationshipCategories : [],
        customEntityCategories: initialCats,
        categoryOrders: categoryOrders && typeof categoryOrders === "object" ? categoryOrders : {},
        errorMessage: null,
      });
    },

    saveCodexImmediately: async () => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories, customEntityCategories, categoryOrders } = get();
      return executeSave(entities, relationships, relationshipPositions, customRelationshipCategories, customEntityCategories, categoryOrders);
    },

    reorderEntities: (category: EntityCategory | "all", orderedIds: string[]) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories, customEntityCategories, categoryOrders } = get();
      const nextOrders = { ...categoryOrders, [category]: orderedIds };
      let nextEntities = entities;
      if (category === "all") {
        const idMap = new Map(entities.map((e) => [e.id, e]));
        const reordered = orderedIds.map((id) => { const e = idMap.get(id); idMap.delete(id); return e!; }).filter(Boolean);
        nextEntities = [...reordered, ...Array.from(idMap.values())];
      }
      set({ categoryOrders: nextOrders, entities: nextEntities });
      triggerDebouncedSave(nextEntities, relationships, relationshipPositions, customRelationshipCategories, customEntityCategories, nextOrders);
    },

    addEntity: (category, name) => {
      const { entities, relationships, relationshipPositions, categoryOrders } = get();
      const id = `ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newEntity: WorldEntity = {
        id, category, name: name?.trim() || getDefaultEntityName(category),
        summary: "", tags: [], aliases: [], attributes: {}, notes: "", color: getDefaultCategoryColor(category), relationships: [],
      };
      const next = [...entities, newEntity];
      const nextOrders = {
        ...categoryOrders, all: categoryOrders.all ? [...categoryOrders.all, id] : next.map((e) => e.id),
        [category]: categoryOrders[category] ? [...categoryOrders[category], id] : [id],
      };
      set({ entities: next, selectedEntityId: id, categoryOrders: nextOrders });
      triggerDebouncedSave(next, relationships, relationshipPositions, undefined, undefined, nextOrders);
      return newEntity;
    },

    updateEntity: (id, updates) => {
      const { entities, relationships, relationshipPositions } = get();
      const next = entities.map((ent) => (ent.id === id ? { ...ent, ...updates } : ent));
      set({ entities: next });
      triggerDebouncedSave(next, relationships, relationshipPositions);
    },

    deleteEntity: (id) => {
      const { entities, relationships, relationshipPositions, selectedEntityId, categoryOrders } = get();
      const target = entities.find((e) => e.id === id);
      if (target) {
        if (target.avatarUrl?.includes("_crop")) deleteLocalImage(target.avatarUrl).catch(() => {});
        if (target.avatarOriginalUrl && !target.gallery?.some((g) => g.url === target.avatarOriginalUrl)) deleteLocalImage(target.avatarOriginalUrl).catch(() => {});
        target.gallery?.forEach((img) => deleteLocalImage(img.url).catch(() => {}));
      }
      const nextEnt = entities.filter((ent) => ent.id !== id);
      const nextRel = relationships.filter((r) => r.sourceEntityId !== id && r.targetEntityId !== id);
      const nextPos = { ...relationshipPositions }; delete nextPos[id];
      const nextOrders: Record<string, string[]> = {};
      Object.entries(categoryOrders).forEach(([cat, ids]) => { nextOrders[cat] = ids.filter((eid) => eid !== id); });
      set({ entities: nextEnt, relationships: nextRel, relationshipPositions: nextPos, categoryOrders: nextOrders, selectedEntityId: selectedEntityId === id ? null : selectedEntityId });
      get().saveCodexImmediately();
      cleanupProjectOrphanAssets().catch(() => {});
    },

    duplicateEntity: (id) => {
      const { entities, relationships, relationshipPositions, categoryOrders } = get();
      const orig = entities.find((e) => e.id === id);
      if (!orig) return null;
      const newId = `ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duplicate: WorldEntity = { ...orig, id: newId, name: `${orig.name} (Copia)`, relationships: [] };
      const next = [...entities, duplicate];
      const nextOrders = { ...categoryOrders, all: categoryOrders.all ? [...categoryOrders.all, newId] : next.map((e) => e.id) };
      set({ entities: next, selectedEntityId: newId, categoryOrders: nextOrders });
      triggerDebouncedSave(next, relationships, relationshipPositions, undefined, undefined, nextOrders);
      return duplicate;
    },

    addCustomEntityCategory: (cat) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories, customEntityCategories } = get();
      const nCat: CustomEntityCategory = { ...cat, id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
      const next = [...customEntityCategories, nCat]; set({ customEntityCategories: next });
      triggerDebouncedSave(entities, relationships, relationshipPositions, customRelationshipCategories, next);
      return nCat;
    },
    updateCustomEntityCategory: (id, updates) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories, customEntityCategories } = get();
      const next = customEntityCategories.map((c) => (c.id === id ? { ...c, ...updates } : c));
      set({ customEntityCategories: next }); triggerDebouncedSave(entities, relationships, relationshipPositions, customRelationshipCategories, next);
    },
    deleteCustomEntityCategory: (id, deleteEntities = false) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories, customEntityCategories, selectedCategory } = get();
      const nextCats = customEntityCategories.filter((c) => c.id !== id);
      const nextEnts = deleteEntities
        ? entities.filter((e) => e.category !== id)
        : entities.map((e) => (e.category === id ? { ...e, category: "other" as const } : e));
      const nextSelected = selectedCategory === id ? "all" : selectedCategory;
      set({ customEntityCategories: nextCats, entities: nextEnts, selectedCategory: nextSelected });
      triggerDebouncedSave(nextEnts, relationships, relationshipPositions, customRelationshipCategories, nextCats);
    },
    addRelationship: (sourceEntityId, targetEntityId, type, label, sentiment, description) => {
      const { entities, relationships, relationshipPositions } = get();
      const nRel: Relationship = { id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, sourceEntityId, targetEntityId, type, label: label || type, sentiment: sentiment || "neutral", description };
      const next = [...relationships, nRel]; set({ relationships: next }); triggerDebouncedSave(entities, next, relationshipPositions);
      return nRel;
    },
    updateRelationship: (id, updates) => {
      const { entities, relationships, relationshipPositions } = get();
      const next = relationships.map((rel) => (rel.id === id ? { ...rel, ...updates } : rel));
      set({ relationships: next }); triggerDebouncedSave(entities, next, relationshipPositions);
    },
    deleteRelationship: (id) => {
      const { entities, relationships, relationshipPositions } = get();
      const next = relationships.filter((rel) => rel.id !== id);
      set({ relationships: next }); triggerDebouncedSave(entities, next, relationshipPositions);
    },
    updateNodePosition: (entityId, pos, save = true) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = { ...relationshipPositions, [entityId]: pos }; set({ relationshipPositions: next });
      if (save) executeSave(entities, relationships, next, customRelationshipCategories);
    },
    updateNodePositions: (positions, save = true) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = { ...relationshipPositions, ...positions }; set({ relationshipPositions: next });
      if (save) executeSave(entities, relationships, next, customRelationshipCategories);
    },
    updateRelationshipControlPoint: (relId, point, save = true) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = relationships.map((r) => (r.id === relId ? { ...r, controlPoint: point } : r));
      set({ relationships: next }); if (save) executeSave(entities, next, relationshipPositions, customRelationshipCategories);
    },
    resetRelationshipControlPoints: () => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = relationships.map((r) => ({ ...r, controlPoint: undefined }));
      set({ relationships: next }); executeSave(entities, next, relationshipPositions, customRelationshipCategories);
    },
    addRelationshipCategory: (category) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const nCat: RelationshipCategory = { ...category, id: `rcat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, isCustom: true };
      const next = [...customRelationshipCategories, nCat]; set({ customRelationshipCategories: next });
      triggerDebouncedSave(entities, relationships, relationshipPositions, next); return nCat;
    },
    updateRelationshipCategory: (id, updates) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = customRelationshipCategories.map((c) => (c.id === id ? { ...c, ...updates } : c));
      set({ customRelationshipCategories: next }); triggerDebouncedSave(entities, relationships, relationshipPositions, next);
    },
    deleteRelationshipCategory: (id) => {
      const { entities, relationships, relationshipPositions, customRelationshipCategories } = get();
      const next = customRelationshipCategories.filter((c) => c.id !== id);
      set({ customRelationshipCategories: next }); triggerDebouncedSave(entities, relationships, relationshipPositions, next);
    },

    setSelectedEntityId: (selectedEntityId) => set({ selectedEntityId }), setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
    setSearchQuery: (searchQuery) => set({ searchQuery }), setSelectedTag: (selectedTag) => set({ selectedTag }), setSortBy: (sortBy) => set({ sortBy }),
    getEntityById: (id) => get().entities.find((e) => e.id === id), getEntitiesByCategory: (category) => get().entities.filter((e) => e.category === category),
    getRelationshipsForEntity: (id) => get().relationships.filter((r) => r.sourceEntityId === id || r.targetEntityId === id),

    getCategoriesSummary: () => {
      const { entities, customEntityCategories } = get();
      const counts: Record<string, number> = { all: entities.length };
      for (const e of entities) counts[e.category] = (counts[e.category] || 0) + 1;
      const summary: Record<string, number> = { all: counts.all };
      for (const custom of customEntityCategories) summary[custom.id] = counts[custom.id] || 0;
      return summary;
    },

    getFilteredEntities: (mentionsMap = {}) => {
      const { entities, selectedCategory, searchQuery, selectedTag, sortBy, categoryOrders } = get();
      return filterAndSortEntities(entities, selectedCategory, searchQuery, selectedTag, sortBy, mentionsMap, categoryOrders);
    },
  };
});
