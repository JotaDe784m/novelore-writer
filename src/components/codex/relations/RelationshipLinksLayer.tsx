import React, { useMemo, useRef } from "react";
import { Relationship } from "../../../types";
import { calculateAutoControlPoint, getBezierMidpoint, splitBadgeLabel, Point2D } from "../../../utils/graphGeometry";
import { getRelationshipColor, getRelationshipLineStyle, getStrokeDashArray } from "./relationTypes";
import { useCodexStore } from "../../../stores/useCodexStore";

export interface RelationshipLinksLayerProps {
  relationships: Relationship[];
  nodePositions: Record<string, Point2D>;
  selectedEntityId: string | null;
  onSelectRelationship: (rel: Relationship) => void;
  onRelMouseDown: (e: React.MouseEvent, relId: string, badgeX: number, badgeY: number) => void;
}

export const RelationshipLinksLayer: React.FC<RelationshipLinksLayerProps> = ({
  relationships,
  nodePositions,
  selectedEntityId,
  onSelectRelationship,
  onRelMouseDown,
}) => {
  const store = useCodexStore();
  const customCategories = store.customRelationshipCategories || [];
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Agrupar relaciones por par de entidades para auto-separar múltiples vínculos
  const pairGroups = useMemo(() => {
    const map: Record<string, Relationship[]> = {};
    for (const r of relationships) {
      const key = [r.sourceEntityId, r.targetEntityId].sort().join("---");
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    return map;
  }, [relationships]);

  return (
    <>
      {/* 1. Capa SVG de Curvas Bezier */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <filter id="badge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12" />
          </filter>
        </defs>

        {relationships.map((rel) => {
          const posA = nodePositions[rel.sourceEntityId];
          const posB = nodePositions[rel.targetEntityId];
          if (!posA || !posB) return null;

          const p0 = { x: posA.x, y: posA.y };
          const p1 = { x: posB.x, y: posB.y };

          const key = [rel.sourceEntityId, rel.targetEntityId].sort().join("---");
          const group = pairGroups[key] || [rel];
          const pairIndex = group.findIndex((r) => r.id === rel.id);

          const autoCP = calculateAutoControlPoint(p0, p1, pairIndex, group.length);
          const cp = rel.controlPoint || autoCP || { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };

          const isConnectedToSelected =
            selectedEntityId === rel.sourceEntityId || selectedEntityId === rel.targetEntityId;
          const color = rel.color || getRelationshipColor(rel.type, customCategories, rel.sentiment, rel.label);
          const lineStyle = rel.lineStyle || getRelationshipLineStyle(rel.type, customCategories);
          const strokeDasharray = getStrokeDashArray(lineStyle);

          return (
            <path
              key={rel.id}
              d={`M ${p0.x} ${p0.y} Q ${cp.x} ${cp.y} ${p1.x} ${p1.y}`}
              fill="none"
              stroke={color}
              strokeWidth={isConnectedToSelected ? 3.5 : 2}
              strokeOpacity={isConnectedToSelected ? 0.95 : 0.65}
              strokeDasharray={strokeDasharray}
              className="transition-[stroke,stroke-width,stroke-opacity] duration-150"
            />
          );
        })}
      </svg>

      {/* 2. Capa de Insignias Arrastrables e Interactivas */}
      <div className="absolute inset-0 pointer-events-none">
        {relationships.map((rel) => {
          const posA = nodePositions[rel.sourceEntityId];
          const posB = nodePositions[rel.targetEntityId];
          if (!posA || !posB) return null;

          const p0 = { x: posA.x, y: posA.y };
          const p1 = { x: posB.x, y: posB.y };

          const key = [rel.sourceEntityId, rel.targetEntityId].sort().join("---");
          const group = pairGroups[key] || [rel];
          const pairIndex = group.findIndex((r) => r.id === rel.id);

          const autoCP = calculateAutoControlPoint(p0, p1, pairIndex, group.length);
          const cp = rel.controlPoint || autoCP;
          const badgePos = getBezierMidpoint(p0, p1, cp);

          const color = rel.color || getRelationshipColor(rel.type, customCategories, rel.sentiment);
          const lines = splitBadgeLabel(rel.label || rel.type);
          const isConnectedToSelected =
            selectedEntityId === rel.sourceEntityId || selectedEntityId === rel.targetEntityId;

          return (
            <div
              key={`badge-${rel.id}`}
              onMouseDown={(e) => {
                dragStartPosRef.current = { x: e.clientX, y: e.clientY };
                onRelMouseDown(e, rel.id, badgePos.x, badgePos.y);
              }}
              onClick={(e) => {
                e.stopPropagation();
                const dist = Math.hypot(e.clientX - dragStartPosRef.current.x, e.clientY - dragStartPosRef.current.y);
                if (dist > 5) {
                  return;
                }
                onSelectRelationship(rel);
              }}
              style={{
                left: `${badgePos.x}px`,
                top: `${badgePos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
              className="rel-badge absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none group"
              title={`${rel.label || "Vínculo"} (Arrastra para arquear curva)`}
            >
              <div
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex flex-col items-center justify-center transition-all shadow-xs ${
                  isConnectedToSelected
                    ? "scale-105 shadow-md ring-2"
                    : "hover:scale-105 hover:shadow-md"
                }`}
                style={{
                  backgroundColor: "var(--bg-card)",
                  color: color,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                {lines.map((line, idx) => (
                  <span key={idx} className="leading-tight text-center whitespace-nowrap">
                    {line}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
