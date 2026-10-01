import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { NovelProject, Relationship, WorldEntity } from "../../../types";
import { useCodexStore } from "../../../stores/useCodexStore";
import { calculateBezierControlPoint, generateCircularLayout, Point2D } from "../../../utils/graphGeometry";

interface UseRelationshipMapLogicProps {
  project: NovelProject;
}

export function useRelationshipMapLogic({ project }: UseRelationshipMapLogicProps) {
  const store = useCodexStore();
  const entities: WorldEntity[] = store.entities.length > 0 ? store.entities : project.entities || [];
  const relationships: Relationship[] = store.relationships.length > 0 ? store.relationships : project.relationships || [];

  // Canvas Transform
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point2D>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<Point2D>({ x: 0, y: 0 });
  const canvasMouseDownPosRef = useRef<Point2D>({ x: 0, y: 0 });

  // Selección y Modales
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isAddingRel, setIsAddingRel] = useState(false);
  const [editingRel, setEditingRel] = useState<Relationship | null>(null);
  const [deletingRelId, setDeletingRelId] = useState<string | null>(null);

  // Arrastre de Nodos
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragNodeOffsetRef = useRef<Point2D>({ x: 0, y: 0 });
  const hasMovedNodeRef = useRef(false);

  // Arrastre de Curvas / Insignias
  const [draggingRelId, setDraggingRelId] = useState<string | null>(null);
  const dragRelOffsetRef = useRef<Point2D>({ x: 0, y: 0 });
  const hasMovedRelRef = useRef(false);
  const relDragClientStartRef = useRef<Point2D>({ x: 0, y: 0 });

  // Inicializar posiciones de nodos si faltan
  const entitiesKey = useMemo(() => entities.map((e) => e.id).sort().join(","), [entities]);

  useEffect(() => {
    if (entities.length === 0) return;
    const currentPositions = useCodexStore.getState().relationshipPositions || {};
    const missing = entities.filter((e) => !currentPositions[e.id]);
    if (missing.length === 0) return;

    const allIds = entities.map((e) => e.id);
    if (Object.keys(currentPositions).length === 0) {
      const generated = generateCircularLayout(allIds);
      useCodexStore.getState().updateNodePositions(generated, true);
    } else {
      const generated = generateCircularLayout(allIds);
      const updated = { ...currentPositions };
      missing.forEach((m) => {
        if (!updated[m.id]) {
          updated[m.id] = generated[m.id] || { x: 500, y: 400 };
        }
      });
      useCodexStore.getState().updateNodePositions(updated, true);
    }
  }, [entitiesKey]);

  const handleRearrangeCircle = useCallback(() => {
    const allIds = entities.map((e) => e.id);
    const layout = generateCircularLayout(allIds);
    useCodexStore.getState().updateNodePositions(layout, true);
  }, [entities]);

  const handleResetCurves = useCallback(() => {
    useCodexStore.getState().resetRelationshipControlPoints();
  }, []);

  // Manejadores de Canvas Pan / Zoom
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".node-element") || target.closest(".rel-badge") || target.closest("button") || target.closest("aside")) {
      return;
    }
    canvasMouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".node-element") || target.closest(".rel-badge") || target.closest("button") || target.closest("aside")) {
      return;
    }
    const dist = Math.hypot(e.clientX - canvasMouseDownPosRef.current.x, e.clientY - canvasMouseDownPosRef.current.y);
    if (dist <= 5) {
      setSelectedEntityId(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      setZoom((z) => Math.min(2.0, Math.max(0.4, Number((z + delta).toFixed(2)))));
    } else {
      setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  };

  // Inicio de arrastre de nodo
  const handleNodeMouseDown = (e: React.MouseEvent, entityId: string) => {
    e.stopPropagation();
    setDraggingNodeId(entityId);
    hasMovedNodeRef.current = false;
    const pos = store.relationshipPositions[entityId] || { x: 0, y: 0 };
    const mouseCanvasX = (e.clientX - pan.x) / zoom;
    const mouseCanvasY = (e.clientY - pan.y) / zoom;
    dragNodeOffsetRef.current = { x: mouseCanvasX - pos.x, y: mouseCanvasY - pos.y };
  };

  // Inicio de arrastre de curva / insignia
  const handleRelMouseDown = (e: React.MouseEvent, relId: string, currentBadgeX: number, currentBadgeY: number) => {
    e.stopPropagation();
    setDraggingRelId(relId);
    hasMovedRelRef.current = false;
    relDragClientStartRef.current = { x: e.clientX, y: e.clientY };
    const mouseCanvasX = (e.clientX - pan.x) / zoom;
    const mouseCanvasY = (e.clientY - pan.y) / zoom;
    dragRelOffsetRef.current = { x: mouseCanvasX - currentBadgeX, y: mouseCanvasY - currentBadgeY };
  };

  // Movimiento del ratón
  const handleMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (draggingNodeId) {
        hasMovedNodeRef.current = true;
        const mouseCanvasX = (e.clientX - pan.x) / zoom;
        const mouseCanvasY = (e.clientY - pan.y) / zoom;
        const newX = Math.round(mouseCanvasX - dragNodeOffsetRef.current.x);
        const newY = Math.round(mouseCanvasY - dragNodeOffsetRef.current.y);
        useCodexStore.getState().updateNodePosition(draggingNodeId, { x: newX, y: newY }, false);
      } else if (draggingRelId) {
        const dist = Math.hypot(e.clientX - relDragClientStartRef.current.x, e.clientY - relDragClientStartRef.current.y);
        if (dist > 4) hasMovedRelRef.current = true;

        const mouseCanvasX = (e.clientX - pan.x) / zoom;
        const mouseCanvasY = (e.clientY - pan.y) / zoom;
        const newBadgeX = mouseCanvasX - dragRelOffsetRef.current.x;
        const newBadgeY = mouseCanvasY - dragRelOffsetRef.current.y;

        const rel = relationships.find((r) => r.id === draggingRelId);
        if (rel) {
          const codexState = useCodexStore.getState();
          const posA = codexState.relationshipPositions[rel.sourceEntityId];
          const posB = codexState.relationshipPositions[rel.targetEntityId];
          if (posA && posB) {
            const cp = calculateBezierControlPoint(posA, posB, { x: newBadgeX, y: newBadgeY });
            codexState.updateRelationshipControlPoint(draggingRelId, cp, false);
          }
        }
      } else if (isPanning) {
        setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
      }
    },
    [draggingNodeId, draggingRelId, isPanning, pan.x, pan.y, relationships, zoom]
  );

  const handleMouseUp = useCallback(() => {
    if (draggingNodeId && hasMovedNodeRef.current) {
      const codexState = useCodexStore.getState();
      const currentPos = codexState.relationshipPositions[draggingNodeId];
      if (currentPos) {
        codexState.updateNodePosition(draggingNodeId, currentPos, true);
      }
    }
    if (draggingRelId && hasMovedRelRef.current) {
      const codexState = useCodexStore.getState();
      const rel = codexState.relationships.find((r) => r.id === draggingRelId);
      if (rel) {
        codexState.updateRelationshipControlPoint(draggingRelId, rel.controlPoint, true);
      }
    }
    setDraggingNodeId(null);
    setDraggingRelId(null);
    setIsPanning(false);
  }, [draggingNodeId, draggingRelId]);

  // Registrar eventos en window para arrastre fluido incluso fuera del canvas
  useEffect(() => {
    if (!draggingNodeId && !draggingRelId && !isPanning) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
    };
    const onGlobalMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener("mousemove", onGlobalMouseMove);
    window.addEventListener("mouseup", onGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", onGlobalMouseMove);
      window.removeEventListener("mouseup", onGlobalMouseUp);
    };
  }, [draggingNodeId, draggingRelId, isPanning, handleMouseMove, handleMouseUp]);

  const selectedEntity = useMemo(
    () => entities.find((e) => e.id === selectedEntityId) || null,
    [entities, selectedEntityId]
  );

  return {
    entities, relationships, nodePositions: store.relationshipPositions,
    zoom, setZoom, pan, setPan, isPanning,
    selectedEntity, selectedEntityId, setSelectedEntityId,
    isAddingRel, setIsAddingRel, editingRel, setEditingRel, deletingRelId, setDeletingRelId,
    handleCanvasMouseDown, handleCanvasClick, handleWheel, handleMouseMove, handleMouseUp,
    handleNodeMouseDown, handleRelMouseDown,
    handleRearrangeCircle, handleResetCurves,
  };
}
