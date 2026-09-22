import React, { useState, useRef, useEffect } from "react";
import {
  Share2,
  Plus,
  Trash2,
  Edit2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  User,
  Heart,
  ShieldAlert,
  Flame,
  HelpCircle,
  Eye,
  LayoutDashboard,
  Layers,
} from "lucide-react";
import {
  NovelProject,
  Relationship,
  RelationshipType,
  WorldEntity,
} from "../../types";

interface RelationshipMapViewProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onBackToCodex: () => void;
  onOpenBoard?: () => void;
  onOpenEntityBoard?: (entityId: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

export const RelationshipMapView: React.FC<RelationshipMapViewProps> = ({
  project,
  onUpdateProject,
  onBackToCodex,
  onOpenBoard,
  onOpenEntityBoard,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>(() => {
    return { ...(project.relationshipPositions || {}) };
  });
  const nodePositionsRef = useRef<Record<string, NodePosition>>(nodePositions);
  nodePositionsRef.current = nodePositions;

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasMovedNode, setHasMovedNode] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Draggable Relationship Links (Curvas y enlaces interactivos para evitar superposiciones)
  const [relControlPoints, setRelControlPoints] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingRelId, setDraggingRelId] = useState<string | null>(null);
  const [relDragOffset, setRelDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [relDragHasMoved, setRelDragHasMoved] = useState<boolean>(false);
  const [relDragStartClient, setRelDragStartClient] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const entities = project.entities || [];
  const relationships = project.relationships || [];

  // Initialize custom control points from stored project relationships
  useEffect(() => {
    const points: Record<string, { x: number; y: number }> = {};
    project.relationships.forEach((r) => {
      if (r.controlPoint) {
        points[r.id] = r.controlPoint;
      }
    });
    setRelControlPoints(points);
  }, [project.relationships]);

  // Group relationships by pair of entities for auto-separation
  const pairGroups = React.useMemo(() => {
    const map: Record<string, Relationship[]> = {};
    project.relationships.forEach((r) => {
      const key = [r.sourceEntityId, r.targetEntityId].sort().join("---");
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [project.relationships]);

  // New relationship modal
  const [isAddingRel, setIsAddingRel] = useState(false);
  const [relSource, setRelSource] = useState(entities[0]?.id || "");
  const [relTarget, setRelTarget] = useState(entities[1]?.id || "");
  const [relLabel, setRelLabel] = useState("Aliados");
  const [relType, setRelType] = useState<RelationshipType>("friendly");
  const [relDesc, setRelDesc] = useState("");

  // Edit relationship modal state
  const [editingRel, setEditingRel] = useState<Relationship | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState<RelationshipType>("friendly");
  const [editDesc, setEditDesc] = useState("");

  // Delete confirmation modal state
  const [relToDelete, setRelToDelete] = useState<string | null>(null);

  // Helper for splitting text into multiple lines for badges
  const getLabelLines = (label: string): string[] => {
    if (!label) return [""];
    if (label.includes("\n")) {
      return label.split("\n").map((l) => l.trim()).filter(Boolean);
    }
    const words = label.trim().split(/\s+/);
    if (words.length <= 1 || label.length <= 15) {
      return [label];
    }
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      if ((current + " " + word).trim().length > 15) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = current ? `${current} ${word}` : word;
      }
    }
    if (current) lines.push(current);
    return lines.length > 0 ? lines : [label];
  };

  // Initialize and preserve node positions without resetting placed nodes
  useEffect(() => {
    const existing = { ...(project.relationshipPositions || {}), ...nodePositionsRef.current };
    let hasMissing = false;
    const count = entities.length;
    const centerX = 520;
    const centerY = 380;
    const radius = Math.min(340, 130 + count * 28);
    const updated: Record<string, NodePosition> = { ...existing };

    entities.forEach((entity, idx) => {
      if (
        !updated[entity.id] ||
        typeof updated[entity.id].x !== "number" ||
        typeof updated[entity.id].y !== "number"
      ) {
        hasMissing = true;
        const angle = (idx / (count || 1)) * 2 * Math.PI;
        updated[entity.id] = {
          x: Math.round(centerX + radius * Math.cos(angle)),
          y: Math.round(centerY + radius * Math.sin(angle)),
        };
      }
    });

    if (hasMissing) {
      setNodePositions(updated);
      nodePositionsRef.current = updated;
      onUpdateProject((p) => ({
        ...p,
        relationshipPositions: updated,
      }));
    }
  }, [entities, project.relationshipPositions]);

  const handleRearrangeCircle = () => {
    const count = entities.length;
    const centerX = 520;
    const centerY = 380;
    const radius = Math.min(340, 130 + count * 28);
    const newPositions: Record<string, NodePosition> = {};

    entities.forEach((entity, idx) => {
      const angle = (idx / (count || 1)) * 2 * Math.PI;
      newPositions[entity.id] = {
        x: Math.round(centerX + radius * Math.cos(angle)),
        y: Math.round(centerY + radius * Math.sin(angle)),
      };
    });

    setNodePositions(newPositions);
    nodePositionsRef.current = newPositions;
    onUpdateProject((p) => ({
      ...p,
      relationshipPositions: newPositions,
    }));
  };

  const handleNodeMouseDown = (e: React.MouseEvent, entityId: string) => {
    e.stopPropagation();
    setDraggingNodeId(entityId);
    setHasMovedNode(false);
    const pos = nodePositionsRef.current[entityId] || { x: 0, y: 0 };
    const mouseCanvasX = (e.clientX - pan.x) / zoom;
    const mouseCanvasY = (e.clientY - pan.y) / zoom;
    setDragOffset({
      x: mouseCanvasX - pos.x,
      y: mouseCanvasY - pos.y,
    });
  };

  const handleRelMouseDown = (
    e: React.MouseEvent,
    relId: string,
    currentBadgeX: number,
    currentBadgeY: number
  ) => {
    e.stopPropagation();
    const mouseCanvasX = (e.clientX - pan.x) / zoom;
    const mouseCanvasY = (e.clientY - pan.y) / zoom;
    setDraggingRelId(relId);
    setRelDragOffset({
      x: mouseCanvasX - currentBadgeX,
      y: mouseCanvasY - currentBadgeY,
    });
    setRelDragStartClient({ x: e.clientX, y: e.clientY });
    setRelDragHasMoved(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking on canvas or svg background, not on interactive node cards or relationship badges
    const target = e.target as HTMLElement;
    if (
      target.closest(".entity-node-card") ||
      target.closest("button") ||
      target.closest(".relationship-badge") ||
      target.closest(".rel-draggable")
    ) {
      return;
    }
    setIsPanning(true);
    setPanStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const mouseCanvasX = (e.clientX - pan.x) / zoom;
      const mouseCanvasY = (e.clientY - pan.y) / zoom;
      const newX = Math.round(Math.max(20, mouseCanvasX - dragOffset.x));
      const newY = Math.round(Math.max(20, mouseCanvasY - dragOffset.y));

      setHasMovedNode(true);
      const updated = {
        ...nodePositionsRef.current,
        [draggingNodeId]: { x: newX, y: newY },
      };
      nodePositionsRef.current = updated;
      setNodePositions(updated);
    } else if (draggingRelId) {
      const mouseCanvasX = (e.clientX - pan.x) / zoom;
      const mouseCanvasY = (e.clientY - pan.y) / zoom;
      const newBadgeX = mouseCanvasX - relDragOffset.x;
      const newBadgeY = mouseCanvasY - relDragOffset.y;

      const dist = Math.hypot(
        e.clientX - relDragStartClient.x,
        e.clientY - relDragStartClient.y
      );
      if (dist > 4) {
        setRelDragHasMoved(true);
      }

      const rel = project.relationships.find((r) => r.id === draggingRelId);
      if (rel) {
        const posA = nodePositions[rel.sourceEntityId];
        const posB = nodePositions[rel.targetEntityId];
        if (posA && posB) {
          const midX = (posA.x + 40 + posB.x + 40) / 2;
          const midY = (posA.y + 40 + posB.y + 40) / 2;
          // Calculate control point cx, cy such that quadratic curve at t=0.5 passes through (newBadgeX, newBadgeY)
          // Since B(0.5) = 0.5 * mid + 0.5 * C, we have: C = 2 * B - mid
          const cx = 2 * newBadgeX - midX;
          const cy = 2 * newBadgeY - midY;
          setRelControlPoints((prev) => ({
            ...prev,
            [draggingRelId]: { x: cx, y: cy },
          }));
        }
      }
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (draggingRelId) {
      if (relDragHasMoved) {
        const finalControlPoint = relControlPoints[draggingRelId];
        if (finalControlPoint) {
          onUpdateProject((p) => ({
            ...p,
            relationships: p.relationships.map((r) =>
              r.id === draggingRelId
                ? { ...r, controlPoint: finalControlPoint }
                : r
            ),
          }));
        }
      }
      setDraggingRelId(null);
    }
    if (draggingNodeId) {
      if (hasMovedNode) {
        const finalPositions = nodePositionsRef.current;
        onUpdateProject((p) => ({
          ...p,
          relationshipPositions: {
            ...(p.relationshipPositions || {}),
            ...finalPositions,
          },
        }));
      }
      setDraggingNodeId(null);
      setHasMovedNode(false);
    }
    setIsPanning(false);
  };

  const handleResetCurves = () => {
    setRelControlPoints({});
    onUpdateProject((p) => ({
      ...p,
      relationships: p.relationships.map((r) => ({
        ...r,
        controlPoint: undefined,
      })),
    }));
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.0015;
      setZoom((z) => Math.min(2.0, Math.max(0.4, Number((z + zoomDelta).toFixed(2)))));
    } else {
      // Pan canvas with wheel / trackpad scroll
      setPan((p) => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY,
      }));
    }
  };

  const handleAddRelationship = () => {
    if (!relSource || !relTarget || relSource === relTarget) {
      alert("Selecciona dos entidades distintas para el vínculo");
      return;
    }

    const newRel: Relationship = {
      id: `rel-${Date.now()}`,
      sourceEntityId: relSource,
      targetEntityId: relTarget,
      label: relLabel,
      type: relType,
      description: relDesc,
    };

    onUpdateProject((p) => ({
      ...p,
      relationships: [...p.relationships, newRel],
    }));

    setIsAddingRel(false);
    setRelDesc("");
  };

  const openEditRelationship = (rel: Relationship) => {
    setEditingRel(rel);
    setEditLabel(rel.label);
    setEditType(rel.type);
    setEditDesc(rel.description || "");
  };

  const handleSaveEditRelationship = () => {
    if (!editingRel || !editLabel.trim()) return;
    onUpdateProject((p) => ({
      ...p,
      relationships: p.relationships.map((r) =>
        r.id === editingRel.id
          ? {
              ...r,
              label: editLabel.trim(),
              type: editType,
              description: editDesc.trim(),
            }
          : r
      ),
    }));
    setEditingRel(null);
  };

  const requestDeleteRelationship = (relId: string) => {
    setRelToDelete(relId);
  };

  const confirmDeleteRelationship = (relId: string) => {
    onUpdateProject((p) => ({
      ...p,
      relationships: p.relationships.filter((r) => r.id !== relId),
    }));
    setRelToDelete(null);
  };

  const getRelColor = (type: RelationshipType) => {
    switch (type) {
      case "hostile":
        return "#ef4444"; // Red
      case "romantic":
        return "#ec4899"; // Pink
      case "friendly":
        return "#10b981"; // Emerald
      case "family":
        return "#8b5cf6"; // Purple
      case "mentor":
        return "#3b82f6"; // Blue
      case "secret":
        return "#f59e0b"; // Amber
      default:
        return "#64748b"; // Gray
    }
  };

  const selectedEntity = project.entities.find((e) => e.id === selectedEntityId);

  return (
    <div
      id="relationship-map-view"
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Controls Bar */}
      <div
        className="p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 z-10"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToCodex}
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            ← Volver al Codex
          </button>
          {onOpenBoard && (
            <button
              onClick={onOpenBoard}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)]/80 hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] shadow-2xs transition-colors"
              title="Abrir la Pizarra Visual del proyecto"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline">Pizarra Visual</span>
            </button>
          )}
          <div>
            <h2 className="text-base font-bold font-novel-display flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[var(--accent)]" />
              <span>Mapa Gráfico de Relaciones Interactivo</span>
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Arrastra los nodos para reorganizar la red y haz clic para ver vínculos y secretos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom & Canvas controls */}
          <div className="flex items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] p-1 text-xs shadow-2xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
              title="Alejar mapa"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-semibold min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(2))))}
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
              title="Acercar mapa"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded ml-1 text-[var(--accent)] font-medium"
              title="Restablecer posición y zoom al 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRearrangeCircle}
              className="px-2 py-0.5 ml-1 text-[11px] font-medium rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Distribuir todos los personajes automáticamente en un círculo equilibrado"
            >
              Distribuir en Círculo
            </button>
            <button
              onClick={handleResetCurves}
              className="px-2 py-0.5 ml-1 text-[11px] font-medium rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Restablecer la curvatura de los enlaces a sus posiciones iniciales"
            >
              Restablecer Enlaces
            </button>
          </div>

          {/* Fixed Button: Single '+' icon with clear text */}
          <button
            onClick={() => setIsAddingRel(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[var(--accent-contrast)]" />
            <span>Crear Vínculo</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & SVG Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div
          ref={containerRef}
          data-custom-wheel="true"
          onMouseDown={handleCanvasMouseDown}
          onWheel={handleWheel}
          className={`flex-1 h-full overflow-hidden relative select-none ${
            isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--border-color) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          {/* Draggable & Pannable Canvas World */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              width: "2400px",
              height: "1800px",
              position: "relative",
            }}
          >
            {/* SVG Connecting Relationship Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
                </marker>
              </defs>

              {project.relationships.map((rel) => {
                const posA = nodePositions[rel.sourceEntityId];
                const posB = nodePositions[rel.targetEntityId];
                if (!posA || !posB) return null;

                const color = getRelColor(rel.type);
                const p1x = posA.x + 40;
                const p1y = posA.y + 40;
                const p2x = posB.x + 40;
                const p2y = posB.y + 40;
                const midX = (p1x + p2x) / 2;
                const midY = (p1y + p2y) / 2;

                // Check group pairing to automatically avoid overlaps if not yet dragged
                const pairKey = [rel.sourceEntityId, rel.targetEntityId].sort().join("---");
                const group = pairGroups[pairKey] || [rel];
                const multiIndex = group.findIndex((r) => r.id === rel.id);
                const multiCount = group.length;

                let cx = midX;
                let cy = midY;

                if (relControlPoints[rel.id]) {
                  cx = relControlPoints[rel.id].x;
                  cy = relControlPoints[rel.id].y;
                } else if (multiCount > 1) {
                  const dx = p2x - p1x;
                  const dy = p2y - p1y;
                  const len = Math.hypot(dx, dy) || 1;
                  const px = -dy / len;
                  const py = dx / len;
                  const sign = multiIndex % 2 === 0 ? 1 : -1;
                  const step = Math.floor(multiIndex / 2) + 1;
                  const offset = sign * step * 60;
                  cx = midX + px * offset;
                  cy = midY + py * offset;
                }

                // Badge position sits exactly at B(t=0.5) on the quadratic bezier curve
                const badgeX = 0.5 * midX + 0.5 * cx;
                const badgeY = 0.5 * midY + 0.5 * cy;
                const pathData = `M ${p1x} ${p1y} Q ${cx} ${cy} ${p2x} ${p2y}`;
                const isDraggingThisRel = draggingRelId === rel.id;

                const lines = getLabelLines(rel.label);
                const maxLineChars = Math.max(...lines.map((l) => l.length), 4);
                const badgeWidth = Math.max(90, maxLineChars * 7.5 + 32);
                const lineHeight = 13.5;
                const badgeHeight = Math.max(26, lines.length * lineHeight + 12);
                const halfW = badgeWidth / 2;
                const halfH = badgeHeight / 2;

                return (
                  <g key={rel.id} className="group rel-draggable">
                    {/* Invisible wide interactive hover/drag stroke along the curve */}
                    <path
                      d={pathData}
                      stroke="transparent"
                      strokeWidth="24"
                      fill="none"
                      className="cursor-grab active:cursor-grabbing pointer-events-auto"
                      onMouseDown={(e) => handleRelMouseDown(e, rel.id, badgeX, badgeY)}
                    />

                    {/* Visible Bezier Curve Line */}
                    <path
                      d={pathData}
                      stroke={color}
                      strokeWidth={isDraggingThisRel ? "3.5" : "2.5"}
                      strokeDasharray={rel.type === "secret" ? "5 5" : undefined}
                      fill="none"
                      opacity={isDraggingThisRel ? 1 : 0.85}
                      className="pointer-events-none transition-colors"
                    />

                    {/* Draggable Midpoint Label Badge */}
                    <g
                      transform={`translate(${badgeX}, ${badgeY})`}
                      className="cursor-grab active:cursor-grabbing pointer-events-auto group/badge"
                      onMouseDown={(e) => handleRelMouseDown(e, rel.id, badgeX, badgeY)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!relDragHasMoved) {
                          openEditRelationship(rel);
                        }
                      }}
                    >
                      <rect
                        x={-halfW}
                        y={-halfH}
                        width={badgeWidth}
                        height={badgeHeight}
                        rx={Math.min(13, halfH)}
                        fill="var(--bg-card)"
                        stroke={color}
                        strokeWidth={isDraggingThisRel ? "2.5" : "1.8"}
                        className="shadow-md group-hover/badge:stroke-width-2.5 transition-all"
                      />
                      <title>Arrastra para mover la curva del enlace o haz clic para editar: {rel.label}</title>

                      {/* Grip indicator dots on the left edge */}
                      <g
                        transform={`translate(${-halfW + 7}, -3)`}
                        opacity="0.45"
                        className="group-hover/badge:opacity-90 transition-opacity pointer-events-none"
                      >
                        <circle cx="0" cy="0" r="1.1" fill={color} />
                        <circle cx="3" cy="0" r="1.1" fill={color} />
                        <circle cx="0" cy="5" r="1.1" fill={color} />
                        <circle cx="3" cy="5" r="1.1" fill={color} />
                      </g>

                      {lines.map((line, idx) => {
                        const yOffset = (idx - (lines.length - 1) / 2) * lineHeight;
                        return (
                          <text
                            key={idx}
                            textAnchor="middle"
                            x={4}
                            y={yOffset + 3.5}
                            fontSize="9.5"
                            fontWeight="bold"
                            fill="var(--text-main)"
                            className="select-none font-sans pointer-events-none"
                          >
                            {line}
                          </text>
                        );
                      })}
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Draggable Entity Nodes */}
            {project.entities.map((entity) => {
              const pos = nodePositions[entity.id] || { x: 100, y: 100 };
              const isSelected = selectedEntityId === entity.id;

              return (
                <div
                  key={entity.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, entity.id)}
                  onClick={() => setSelectedEntityId(entity.id)}
                  onDoubleClick={() => onOpenEntityBoard?.(entity.id)}
                  className={`entity-node-card w-20 h-20 rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-shadow shadow-md cursor-grab active:cursor-grabbing select-none group border-2 relative ${
                    isSelected
                      ? "ring-4 ring-[var(--accent)] border-white scale-110 z-30 shadow-xl"
                      : "border-[var(--border-color)] hover:border-[var(--accent)] hover:scale-105 z-10"
                  }`}
                  style={{
                    backgroundColor: entity.color || "#3b82f6",
                    color: "#ffffff",
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    position: "absolute",
                  }}
                  title={`${entity.name} (Doble clic para abrir pizarra)`}
                >
                  {/* Quick Whiteboard Button on Hover */}
                  {onOpenEntityBoard && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEntityBoard(entity.id);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--accent)] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-115 z-40"
                      title={`Abrir Pizarra de ${entity.name}`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {entity.avatarUrl ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/40 mb-1 shrink-0">
                      <img
                        src={entity.avatarUrl}
                        alt={entity.name}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center mb-1 text-xs font-bold">
                      {entity.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[10px] font-bold leading-tight line-clamp-2 drop-shadow-xs">
                    {entity.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Canvas Navigation Floating Tip Badge */}
          <div className="absolute bottom-3 left-3 bg-[var(--bg-card)]/90 backdrop-blur-xs border border-[var(--border-color)] px-3 py-1.5 rounded-lg shadow-sm text-[11px] text-[var(--text-muted)] flex items-center gap-3 z-10 pointer-events-none select-none">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-[var(--text-main)]">Navegación:</span> Arrastra el fondo para mover el lienzo
            </span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="hidden sm:inline">Rueda para desplazar</span>
            <span className="hidden md:inline opacity-40">•</span>
            <span className="hidden md:inline">Ctrl + Rueda para Zoom</span>
          </div>
        </div>

        {/* Selected Entity Details Sidebar */}
        {selectedEntity && (
          <div
            id="relationship-sidebar-scroll"
            className="w-80 border-l p-4 flex flex-col justify-between overflow-y-auto shrink-0 z-20 animate-in slide-in-from-right-4 custom-scroll always-scroll"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 border-[var(--border-color)]">
                <div className="flex items-center gap-2.5">
                  {selectedEntity.avatarUrl ? (
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-[var(--border-color)] shadow-xs shrink-0">
                      <img
                        src={selectedEntity.avatarUrl}
                        alt={selectedEntity.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: selectedEntity.color }}
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-sm font-novel-display text-[var(--text-main)] leading-tight">
                      {selectedEntity.name}
                    </h3>
                    <span className="text-[10px] text-[var(--text-muted)] capitalize">
                      {selectedEntity.category} • {selectedEntity.subtitle || ""}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntityId(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Summary */}
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {selectedEntity.summary}
              </p>

              {/* Quick Actions: Open Entity Whiteboard or General Whiteboard */}
              <div className="flex flex-col gap-1.5 bg-[var(--bg-input)]/50 p-2.5 rounded-xl border border-[var(--border-color)]">
                {onOpenEntityBoard && (
                  <button
                    type="button"
                    onClick={() => onOpenEntityBoard(selectedEntity.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-all shadow-xs"
                    title={`Abrir la pizarra visual y moodboard de ${selectedEntity.name}`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Pizarra de {selectedEntity.name}</span>
                  </button>
                )}
                {onOpenBoard && (
                  <button
                    type="button"
                    onClick={onOpenBoard}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-main)] transition-colors"
                    title="Ir a la pizarra visual general del proyecto"
                  >
                    <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Pizarra General del Proyecto</span>
                  </button>
                )}
              </div>

              {/* Attributes */}
              <div className="space-y-1.5 text-xs bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-color)]">
                <div className="font-bold text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Atributos Clave
                </div>
                {Object.entries(selectedEntity.attributes || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="font-semibold text-[var(--text-muted)]">
                      {k}:
                    </span>
                    <span className="text-[var(--text-main)] font-medium max-w-[150px] truncate">
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              {/* Direct relationships list */}
              <div className="space-y-2">
                <div className="font-bold text-xs flex items-center justify-between text-[var(--text-main)]">
                  <span>Vínculos de este Elemento</span>
                  <span className="text-[10px] text-[var(--accent)]">
                    {
                      project.relationships.filter(
                        (r) =>
                          r.sourceEntityId === selectedEntity.id ||
                          r.targetEntityId === selectedEntity.id
                      ).length
                    }{" "}
                    conexiones
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {project.relationships
                    .filter(
                      (r) =>
                        r.sourceEntityId === selectedEntity.id ||
                        r.targetEntityId === selectedEntity.id
                    )
                    .map((rel) => {
                      const otherEntityId =
                        rel.sourceEntityId === selectedEntity.id
                          ? rel.targetEntityId
                          : rel.sourceEntityId;
                      const other = project.entities.find((e) => e.id === otherEntityId);

                      return (
                        <div
                          key={rel.id}
                          className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-[var(--text-main)]">
                              {rel.label} → {other?.name}
                            </div>
                            {rel.description && (
                              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                                {rel.description}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              onClick={() => openEditRelationship(rel)}
                              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                              title="Editar vínculo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => requestDeleteRelationship(rel.id)}
                              className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                              title="Eliminar vínculo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Relationship Modal */}
      {isAddingRel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div
            className="w-full max-w-md rounded-xl shadow-2xl border p-5 space-y-4"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-2 border-[var(--border-color)]">
              <h3 className="font-bold text-sm font-novel-display">
                Nuevo Vínculo en el Mapa de Relaciones
              </h3>
              <button
                onClick={() => setIsAddingRel(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Entidad Origen *</label>
                  <select
                    value={relSource}
                    onChange={(e) => setRelSource(e.target.value)}
                    className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    {project.entities.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Entidad Destino *</label>
                  <select
                    value={relTarget}
                    onChange={(e) => setRelTarget(e.target.value)}
                    className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    {project.entities.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">
                  Etiqueta del Vínculo (Ej: Rivalidad, Amor Prohibido, Mentoría) *
                </label>
                <input
                  type="text"
                  value={relLabel}
                  onChange={(e) => setRelLabel(e.target.value)}
                  placeholder="Ej: Odio jurado, Guardaespaldas..."
                  className="w-full p-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Naturaleza / Sentimiento</label>
                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value as any)}
                  className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="friendly">🟢 Alianza / Amistad</option>
                  <option value="hostile">🔴 Enemistad / Hostilidad</option>
                  <option value="romantic">💖 Romance / Pasión</option>
                  <option value="mentor">🔵 Mentor / Aprendiz</option>
                  <option value="family">🟣 Familia / Sangre</option>
                  <option value="secret">🟡 Alianza Secreta / Traición</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Detalles / Trasfondo del Vínculo</label>
                <textarea
                  value={relDesc}
                  onChange={(e) => setRelDesc(e.target.value)}
                  placeholder="¿Cómo surgió esta relación o qué tensión existe entre ellos?..."
                  rows={2}
                  className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3 border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setIsAddingRel(false)}
                className="px-4 py-2 rounded-md border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddRelationship}
                className="px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
              >
                Crear Vínculo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Relationship Modal */}
      {editingRel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div
            className="w-full max-w-md rounded-xl shadow-2xl border p-5 space-y-4"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-2 border-[var(--border-color)]">
              <h3 className="font-bold text-sm font-novel-display flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[var(--accent)]" />
                <span>Editar Vínculo de Relación</span>
              </h3>
              <button
                onClick={() => setEditingRel(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">
                  Nombre o Etiqueta del Vínculo (soporta saltos de línea) *
                </label>
                <textarea
                  rows={2}
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="Ej: Odio jurado&#10;desde la infancia"
                  className="w-full p-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Presiona Enter para agregar saltos de línea que se adaptarán en el mapa.
                </p>
              </div>

              <div>
                <label className="font-bold block mb-1">Naturaleza / Sentimiento</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as RelationshipType)}
                  className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="friendly">🟢 Alianza / Amistad</option>
                  <option value="hostile">🔴 Enemistad / Hostilidad</option>
                  <option value="romantic">💖 Romance / Pasión</option>
                  <option value="mentor">🔵 Mentor / Aprendiz</option>
                  <option value="family">🟣 Familia / Sangre</option>
                  <option value="secret">🟡 Alianza Secreta / Traición</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Detalles / Trasfondo del Vínculo</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="¿Cómo surgió esta relación o qué tensión existe entre ellos?..."
                  rows={3}
                  className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-3 border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => {
                  const toDel = editingRel.id;
                  setEditingRel(null);
                  requestDeleteRelationship(toDel);
                }}
                className="px-3 py-1.5 rounded-md text-red-500 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Vínculo
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRel(null)}
                  className="px-4 py-2 rounded-md border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditRelationship}
                  className="px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {relToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-xl shadow-2xl border p-5 space-y-4"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
          >
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <Trash2 className="w-5 h-5" />
              <span>Eliminar Vínculo de Relación</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              ¿Estás seguro de que deseas eliminar este vínculo del mapa de relaciones? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => setRelToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDeleteRelationship(relToDelete)}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-xs cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
