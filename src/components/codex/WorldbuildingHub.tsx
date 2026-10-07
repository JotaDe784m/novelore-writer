import React, { useMemo, useState } from "react";
import { NovelProject, WorldEntity } from "../../types";
import { calculateAllEntitiesMentions } from "../../utils/mentionCounter";
import { useCodexStore } from "../../stores/useCodexStore";
import { CodexEmptyState } from "./hub/CodexEmptyState";
import { CodexEntityGrid } from "./hub/CodexEntityGrid";
import { CodexFilterBar } from "./hub/CodexFilterBar";
import { CodexHeader } from "./hub/CodexHeader";
import { CodexCardContextMenu } from "./hub/CodexCardContextMenu";
import { CustomCategoryModal } from "./hub/CustomCategoryModal";
import { EntityModal } from "./EntityModal";
import { cleanupProjectOrphanAssets } from "../../utils/imageUtils";

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
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    entity: WorldEntity | null;
  }>({ isOpen: false, position: { x: 0, y: 0 }, entity: null });

  // Store modular desacoplado del Códice
  const {
    entities: storeEntities, relationships: storeRelationships,
    selectedCategory, searchQuery, selectedTag, sortBy,
    setSelectedCategory, setSearchQuery, setSelectedTag, setSortBy,
    updateEntity, deleteEntity, duplicateEntity, getCategoriesSummary, getFilteredEntities,
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
    }
    useCodexStore.getState().saveCodexImmediately();
    cleanupProjectOrphanAssets().catch(() => {});

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
    useCodexStore.getState().saveCodexImmediately();
    cleanupProjectOrphanAssets().catch(() => {});

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

  const handleDuplicateEntity = (entity: WorldEntity) => {
    const dup = duplicateEntity(entity.id);
    if (dup && onUpdateProject) {
      onUpdateProject((p) => ({ ...p, entities: [...(p.entities || []), dup] }));
    }
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
      style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}
    >
      {/* 1. Header con acciones principales */}
      <CodexHeader
        totalEntities={entities.length}
        onOpenRelationshipMap={onOpenRelationshipMap}
      />

      {/* 2. Barra de filtros de categoría, búsqueda, ordenación y nuevo elemento */}
      <CodexFilterBar
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoriesSummary={categoriesSummary}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
        onCreateEntity={() => setIsCreating(true)}
      />

      {/* 3. Rejilla de tarjetas de entidades */}
      <div
        id="worldbuilding-entities-scroll"
        className="flex-1 min-h-0 overflow-y-scroll p-4 sm:p-6 lg:p-8 custom-scroll always-scroll"
        style={{ overflowY: "scroll", scrollbarGutter: "stable" }}
      >
        {filteredEntities.length === 0 ? (
          <CodexEmptyState
            hasSearchOrFilter={selectedCategory !== "all" || searchQuery.trim().length > 0}
            onCreateEntity={() => setIsCreating(true)}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <CodexEntityGrid
            entities={filteredEntities}
            relationships={relationships}
            entityMentionsMap={entityMentionsMap}
            projectPath={project.path}
            onEdit={(ent) => setEditingEntity(ent)}
            onContextMenu={(e, ent) => setContextMenu({ isOpen: true, position: { x: e.clientX, y: e.clientY }, entity: ent })}
          />
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
          onClose={() => { setIsCreating(false); setEditingEntity(null); }}
          onNavigateToScene={(sceneId) => {
            setIsCreating(false);
            setEditingEntity(null);
            onNavigateToScene?.(sceneId);
          }}
        />
      )}

      {/* 5. Menú contextual en tarjeta */}
      {contextMenu.isOpen && contextMenu.entity && (
        <CodexCardContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          entity={contextMenu.entity}
          onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
          onOpenDossier={(ent) => { setEditingEntity(ent); setContextMenu((p) => ({ ...p, isOpen: false })); }}
          onDuplicate={(ent) => { handleDuplicateEntity(ent); setContextMenu((p) => ({ ...p, isOpen: false })); }}
          onDelete={(ent) => { handleDeleteEntity(ent.id); setContextMenu((p) => ({ ...p, isOpen: false })); }}
        />
      )}

      {/* 6. Modal de categorías personalizadas */}
      <CustomCategoryModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
      />
    </div>
  );
};
