import React from "react";
import { Relationship, RelationshipType } from "../../types";
import { useCodexStore } from "../../stores/useCodexStore";
import { RelationshipMapViewProps } from "./relations/relationTypes";
import { useRelationshipMapLogic } from "./relations/useRelationshipMapLogic";
import { RelationshipMapHeader } from "./relations/RelationshipMapHeader";
import { RelationshipLinksLayer } from "./relations/RelationshipLinksLayer";
import { RelationshipNodesLayer } from "./relations/RelationshipNodesLayer";
import { RelationshipDetailSidebar } from "./relations/RelationshipDetailSidebar";
import { RelationshipModal } from "./relations/RelationshipModal";
import { DeleteRelationshipDialog } from "./relations/DeleteRelationshipDialog";

export const RelationshipMapView: React.FC<RelationshipMapViewProps> = ({
  project,
  onBackToCodex,
  onOpenBoard,
  onOpenEntityBoard,
  onOpenEntityDossier,
}) => {
  const store = useCodexStore();
  const logic = useRelationshipMapLogic({ project });

  const handleSaveRelationship = (data: Partial<Relationship>) => {
    if (data.id) {
      store.updateRelationship(data.id, data);
    } else if (data.sourceEntityId && data.targetEntityId) {
      store.addRelationship(
        data.sourceEntityId,
        data.targetEntityId,
        data.type || ("friendly" as RelationshipType),
        data.label,
        data.sentiment,
        data.description
      );
    }
  };

  const handleDeleteRelationship = (relId: string) => {
    logic.setDeletingRelId(relId);
  };

  const handleConfirmDelete = () => {
    if (logic.deletingRelId) {
      store.deleteRelationship(logic.deletingRelId);
      logic.setDeletingRelId(null);
    }
  };

  return (
    <div
      id="relationship-map-view"
      className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[var(--bg-main)] text-[var(--text-main)]"
      onMouseMove={logic.handleMouseMove}
      onMouseUp={logic.handleMouseUp}
    >
      {/* 1. Barra Superior de Controles */}
      <RelationshipMapHeader
        zoom={logic.zoom}
        onZoomIn={() => logic.setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(2))))}
        onZoomOut={() => logic.setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
        onResetView={() => {
          logic.setZoom(1);
          logic.setPan({ x: 0, y: 0 });
        }}
        onRearrangeCircle={logic.handleRearrangeCircle}
        onResetCurves={logic.handleResetCurves}
        onOpenCreateModal={() => logic.setIsAddingRel(true)}
        onBackToCodex={onBackToCodex}
        onOpenBoard={onOpenBoard}
      />

      {/* 2. Área Principal de Canvas y Paneles */}
      <div className="flex-1 flex overflow-hidden relative">
        <div
          data-custom-wheel="true"
          onMouseDown={logic.handleCanvasMouseDown}
          onClick={logic.handleCanvasClick}
          onWheel={logic.handleWheel}
          className={`flex-1 h-full overflow-hidden relative select-none ${
            logic.isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {/* Contenedor Transformado de Pan & Zoom */}
          <div
            style={{
              transform: `translate(${logic.pan.x}px, ${logic.pan.y}px) scale(${logic.zoom})`,
              transformOrigin: "0 0",
              width: "3600px",
              height: "2600px",
            }}
            className="relative pointer-events-none"
          >
            {/* Capa de Enlaces y Curvas Bezier */}
            <RelationshipLinksLayer
              relationships={logic.relationships}
              nodePositions={logic.nodePositions}
              selectedEntityId={logic.selectedEntityId}
              onSelectRelationship={(rel) => logic.setEditingRel(rel)}
              onRelMouseDown={logic.handleRelMouseDown}
            />

            {/* Capa de Nodos de Entidades */}
            <RelationshipNodesLayer
              entities={logic.entities}
              nodePositions={logic.nodePositions}
              selectedEntityId={logic.selectedEntityId}
              onSelectEntity={(id) => logic.setSelectedEntityId((prev) => (prev === id ? null : id))}
              onNodeMouseDown={logic.handleNodeMouseDown}
              onOpenEntityDossier={onOpenEntityDossier}
            />
          </div>
        </div>

        {/* 3. Panel Lateral Inspector de la Entidad Seleccionada */}
        {logic.selectedEntity && (
          <RelationshipDetailSidebar
            entity={logic.selectedEntity}
            relationships={logic.relationships}
            allEntities={logic.entities}
            onClose={() => logic.setSelectedEntityId(null)}
            onEditRelationship={(rel) => logic.setEditingRel(rel)}
            onDeleteRelationship={handleDeleteRelationship}
            onAddNewRelationshipWith={(id) => {
              logic.setSelectedEntityId(id);
              logic.setIsAddingRel(true);
            }}
            onOpenEntityBoard={onOpenEntityBoard}
            onOpenEntityDossier={onOpenEntityDossier}
          />
        )}
      </div>

      {/* 4. Modales: Crear/Editar Vínculo y Confirmación de Borrado */}
      <RelationshipModal
        isOpen={logic.isAddingRel || Boolean(logic.editingRel)}
        relationship={logic.editingRel}
        defaultSourceId={logic.selectedEntityId || undefined}
        entities={logic.entities}
        onClose={() => {
          logic.setIsAddingRel(false);
          logic.setEditingRel(null);
        }}
        onSave={handleSaveRelationship}
        onDelete={(id) => {
          logic.setEditingRel(null);
          handleDeleteRelationship(id);
        }}
      />

      <DeleteRelationshipDialog
        isOpen={Boolean(logic.deletingRelId)}
        onClose={() => logic.setDeletingRelId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
