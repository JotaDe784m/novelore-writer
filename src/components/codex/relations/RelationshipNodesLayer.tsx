import React, { useRef } from "react";
import { WorldEntity } from "../../../types";
import { resolveAssetUrl } from "../../../utils/imageUtils";
import { Point2D } from "../../../utils/graphGeometry";

export interface RelationshipNodesLayerProps {
  entities: WorldEntity[];
  nodePositions: Record<string, Point2D>;
  selectedEntityId: string | null;
  onSelectEntity: (entityId: string) => void;
  onNodeMouseDown: (e: React.MouseEvent, entityId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
}

export const RelationshipNodesLayer: React.FC<RelationshipNodesLayerProps> = ({
  entities,
  nodePositions,
  selectedEntityId,
  onSelectEntity,
  onNodeMouseDown,
  onOpenEntityDossier,
}) => {
  const nodeDragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {entities.map((entity) => {
        const pos = nodePositions[entity.id];
        if (!pos) return null;

        const isSelected = selectedEntityId === entity.id;
        const color = entity.color || "#64748B";

        return (
          <div
            key={entity.id}
            onMouseDown={(e) => {
              nodeDragStartRef.current = { x: e.clientX, y: e.clientY };
              onNodeMouseDown(e, entity.id);
            }}
            onClick={(e) => {
              e.stopPropagation();
              const dist = Math.hypot(e.clientX - nodeDragStartRef.current.x, e.clientY - nodeDragStartRef.current.y);
              if (dist > 5) return;
              onSelectEntity(entity.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onOpenEntityDossier?.(entity.id);
            }}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: "translate(-50%, -36px)",
            }}
            className="node-element absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none group flex flex-col items-center"
            title={`${entity.name} (${entity.category}) — Arrastra para mover o doble clic para ver dossier`}
          >
            {/* Nodo Circular */}
            <div
              className={`w-18 h-18 rounded-full flex items-center justify-center p-1 transition-all duration-150 shadow-md ${
                isSelected
                  ? "ring-4 ring-[var(--accent)] scale-110 shadow-xl"
                  : "group-hover:scale-105 group-hover:shadow-lg"
              }`}
              style={{
                backgroundColor: "var(--bg-card)",
              }}
            >
              {entity.avatarUrl ? (
                <img
                  src={resolveAssetUrl(entity.avatarUrl)}
                  alt={entity.name}
                  className="w-full h-full rounded-full object-cover pointer-events-none"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-base font-serif"
                  style={{ backgroundColor: color }}
                >
                  {entity.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Etiqueta con Nombre y Subtítulo */}
            <div className="mt-1.5 flex flex-col items-center pointer-events-none text-center max-w-[130px]">
              <span
                className={`text-xs font-bold leading-tight px-2 py-0.5 rounded-lg truncate w-full transition-colors ${
                  isSelected
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                    : "bg-[var(--bg-card)]/90 text-[var(--text-primary)] shadow-2xs backdrop-blur-xs"
                }`}
              >
                {entity.name}
              </span>

              {entity.subtitle && (
                <span className="text-[10px] text-[var(--text-muted)] truncate w-full mt-0.5">
                  {entity.subtitle}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
