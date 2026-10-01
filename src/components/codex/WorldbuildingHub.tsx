import React, { useMemo, useState } from "react";
import { NovelProject, WorldEntity } from "../../types";
import { calculateAllEntitiesMentions } from "../../utils/mentionCounter";
import { useCodexStore } from "../../stores/useCodexStore";
import { CodexEmptyState } from "./hub/CodexEmptyState";
import { CodexEntityCard } from "./hub/CodexEntityCard";
import { CodexFilterBar } from "./hub/CodexFilterBar";
import { CodexHeader } from "./hub/CodexHeader";
import { EntityModal } from "./EntityModal";

interface WorldbuildingHubProps {
  project: NovelProject;
  onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
  onOpenRelationshipMap: () => void;
  onNavigateToScene?: (sceneId: string) => void;
}

export const WorldbuildingHub: React.FC<WorldbuildingHubProps> = ({
  project,
  onUpdateProject,
  onOpenRelationshipMap,
  onNavigateToScene,
}) => {
  const [editingEntity, setEditingEntity] = useState<WorldEntity | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Store modular desacoplado del Códice
  const {
    entities: storeEntities,
    relationships: storeRelationships,
    selectedCategory,
    searchQuery,
    selectedTag,
    sortBy,
    setSelectedCategory,
    setSearchQuery,
    setSelectedTag,
    setSortBy,
    updateEntity,
    deleteEntity,
    getCategoriesSummary,
    getFilteredEntities,
  } = useCodexStore();

  // Fallback a project si el store aún no ha sido hidratado
  const entities = storeEntities.length > 0 ? storeEntities : project.entities || [];
  const relationships =
    storeRelationships.length > 0 ? storeRelationships : project.relationships || [];

  // Conteo reactivo de menciones en el manuscrito
  const entityMentionsMap = useMemo(() => {
    return calculateAllEntitiesMentions(entities, project);
  }, [entities, project]);

  // Resumen de conteos por categoría
  const categoriesSummary = useMemo(() => {
    return getCategoriesSummary();
  }, [getCategoriesSummary, entities]);

  // Lista filtrada y ordenada de entidades
  const filteredEntities = useMemo(() => {
    return getFilteredEntities(entityMentionsMap);
  }, [getFilteredEntities, entityMentionsMap, entities, selectedCategory, searchQuery, selectedTag, sortBy]);

  const handleSaveEntity = (saved: WorldEntity) => {
    const exists = entities.some((e) => e.id === saved.id);
    if (exists) {
      updateEntity(saved.id, saved);
    } else {
      const codexStore = useCodexStore.getState();
      const next = [...entities, saved];
      codexStore.loadCodex(
        next,
        relationships,
        codexStore.relationshipPositions,
        codexStore.customRelationshipCategories
      );
      codexStore.saveCodexImmediately();
    }

    // Sincronizar hacia project por retrocompatibilidad
    if (onUpdateProject) {
      onUpdateProject((p) => {
        const pEntities = p.entities || [];
        const found = pEntities.some((e) => e.id === saved.id);
        return {
          ...p,
          entities: found
            ? pEntities.map((e) => (e.id === saved.id ? saved : e))
            : [...pEntities, saved],
        };
      });
    }

    setEditingEntity(null);
    setIsCreating(false);
  };

  const handleDeleteEntity = (id: string) => {
    deleteEntity(id);

    // Sincronizar hacia project
    if (onUpdateProject) {
      onUpdateProject((p) => ({
        ...p,
        entities: (p.entities || []).filter((e) => e.id !== id),
        relationships: (p.relationships || []).filter(
          (r) => r.sourceEntityId !== id && r.targetEntityId !== id
        ),
      }));
    }

    setEditingEntity(null);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedTag("all");
  };

  return (
    <div
      id="worldbuilding-hub"
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* 1. Header con acciones principales */}
      <CodexHeader
        onOpenRelationshipMap={onOpenRelationshipMap}
        onCreateEntity={() => setIsCreating(true)}
        totalEntities={entities.length}
      />

      {/* 2. Barra de filtros de categoría, búsqueda y ordenación */}
      <CodexFilterBar
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoriesSummary={categoriesSummary}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* 3. Rejilla de tarjetas de entidades */}
      <div
        id="worldbuilding-entities-scroll"
        className="flex-1 min-h-0 overflow-y-scroll p-4 sm:p-6 lg:p-8 custom-scroll always-scroll"
        style={{
          overflowY: "scroll",
          scrollbarGutter: "stable",
        }}
      >
        {filteredEntities.length === 0 ? (
          <CodexEmptyState
            hasSearchOrFilter={selectedCategory !== "all" || searchQuery.trim().length > 0}
            onCreateEntity={() => setIsCreating(true)}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredEntities.map((entity) => {
              const relCount = relationships.filter(
                (r) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id
              ).length;
              const mentions = entityMentionsMap[entity.id]?.totalCount || 0;

              return (
                <CodexEntityCard
                  key={entity.id}
                  entity={entity}
                  relationshipCount={relCount}
                  mentionCount={mentions}
                  onEdit={(ent) => setEditingEntity(ent)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Modal de Dossier de Entidad */}
      {(isCreating || editingEntity) && (
        <EntityModal
          entity={editingEntity}
          project={project}
          initialCategory={selectedCategory !== "all" ? selectedCategory : undefined}
          onSave={handleSaveEntity}
          onDelete={handleDeleteEntity}
          onClose={() => {
            setIsCreating(false);
            setEditingEntity(null);
          }}
          onNavigateToScene={(sceneId) => {
            setIsCreating(false);
            setEditingEntity(null);
            onNavigateToScene?.(sceneId);
          }}
        />
      )}
    </div>
  );
};
