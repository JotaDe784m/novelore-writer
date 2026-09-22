import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Image as ImageIcon,
  StickyNote,
  Square,
  Circle,
  MoveRight,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Upload,
  Grid,
  Palette,
  Eye,
  EyeOff,
  Type,
  X,
  Sparkles,
  Star,
  Check,
  Move,
  Eraser,
  Sliders,
  User,
  Compass,
  Spline,
  Hand,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Minus,
  Copy,
  Clipboard,
  Layers,
  BringToFront,
  SendToBack,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Pipette,
  Magnet,
  Ban,
  PaintBucket,
  ArrowLeft,
  ArrowRight,
  Tag,
  CircleDot,
  SlidersHorizontal,
  Link2,
  FileText,
  Music,
  Edit2,
  Play,
} from "lucide-react";
import { BoardItem, MoodboardCanvas, NovelProject, WorldEntity } from "../../types";
import { compressImage } from "../../utils/imageUtils";
import { ImageLightboxModal } from "../codex/ImageLightboxModal";
import { BoardRichTextEditor, BoardRichTextEditorHandle } from "./BoardRichTextEditor";
import { BoardResourceCard } from "./BoardResourceCard";
import { AddResourceModal } from "./AddResourceModal";
import { PdfPreviewModal } from "./PdfPreviewModal";

export interface VisualBoardViewProps {
  project?: NovelProject;
  onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
  entity?: WorldEntity;
  onUpdateEntity?: (updater: (prev: WorldEntity) => WorldEntity) => void;
  onSetAvatar?: (url: string) => void;
  currentAvatarUrl?: string;
  isEmbedded?: boolean;
  onClose?: () => void;
}

export const BOARD_FONTS = [
  { id: "Plus Jakarta Sans", label: "Sans Moderna", family: "var(--font-sans), 'Plus Jakarta Sans', sans-serif" },
  { id: "Playfair Display", label: "Display Elegante", family: "var(--font-serif-display), 'Playfair Display', serif" },
  { id: "EB Garamond", label: "Garamond Clásica", family: "var(--font-garamond), 'EB Garamond', serif" },
  { id: "Cinzel", label: "Cinzel Monumental", family: "'Cinzel', serif" },
  { id: "Lora", label: "Lora Literaria", family: "var(--font-lora), 'Lora', serif" },
  { id: "Merriweather", label: "Merriweather", family: "var(--font-serif), 'Merriweather', serif" },
  { id: "JetBrains Mono", label: "Máquina de Escribir", family: "var(--font-mono), 'JetBrains Mono', monospace" },
  { id: "Caveat", label: "Manuscrita / A Mano", family: "'Caveat', cursive" },
  { id: "Impact", label: "Impact Titular", family: "'Impact', 'Arial Black', sans-serif" },
  { id: "Georgia", label: "Georgia Tradicional", family: "'Georgia', serif" },
];

export const BOARD_FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 84, 96, 120];

export const getBoardFontConfig = (fontIdOrFamily?: string) => {
  if (!fontIdOrFamily) return BOARD_FONTS[0];
  const found = BOARD_FONTS.find(
    (f) => f.id === fontIdOrFamily || f.family === fontIdOrFamily || f.label === fontIdOrFamily
  );
  if (found) return found;
  return { id: fontIdOrFamily, label: fontIdOrFamily, family: fontIdOrFamily };
};

export type AnchorPosition = "top" | "bottom" | "left" | "right";

export const getItemDimensions = (item: BoardItem): { width: number; height: number } => {
  if (item.type === "shape") {
    const isCircle = item.shapeType === "circle";
    return {
      width: item.width || (isCircle ? 180 : 220),
      height: item.height || (isCircle ? 180 : 140),
    };
  }
  if (item.type === "note") {
    return {
      width: item.width || 230,
      height: item.height || 180,
    };
  }
  if (item.type === "text") {
    return {
      width: item.width || 260,
      height: item.height || 60,
    };
  }
  if (item.type === "link") {
    const isSquare = item.linkFormat === "square";
    const defaultW = isSquare ? 280 : 360;
    const defaultH = isSquare ? 280 : item.embedMode ? 190 : 130;
    return {
      width: item.width || defaultW,
      height: item.height || defaultH,
    };
  }
  return {
    width: item.width || 220,
    height: item.height || 260,
  };
};

export const getAnchorCoordinates = (
  item: BoardItem,
  position: AnchorPosition | "center"
): { x: number; y: number } => {
  const { width, height } = getItemDimensions(item);
  switch (position) {
    case "top":
      return { x: Math.round(item.x + width / 2), y: Math.round(item.y) };
    case "right":
      return { x: Math.round(item.x + width), y: Math.round(item.y + height / 2) };
    case "bottom":
      return { x: Math.round(item.x + width / 2), y: Math.round(item.y + height) };
    case "left":
      return { x: Math.round(item.x), y: Math.round(item.y + height / 2) };
    case "center":
    default:
      return { x: Math.round(item.x + width / 2), y: Math.round(item.y + height / 2) };
  }
};

const PRESET_COLORS = [
  { label: "Azul Eléctrico", hex: "#2563eb", border: "#1d4ed8" },
  { label: "Cian Vivo", hex: "#06b6d4", border: "#0891b2" },
  { label: "Esmeralda", hex: "#10b981", border: "#059669" },
  { label: "Amarillo Oro", hex: "#eab308", border: "#ca8a04" },
  { label: "Naranja Intenso", hex: "#f97316", border: "#ea580c" },
  { label: "Rojo Carmesí", hex: "#ef4444", border: "#dc2626" },
  { label: "Púrpura Vibrante", hex: "#8b5cf6", border: "#7c3aed" },
  { label: "Rosa Fucsia", hex: "#ec4899", border: "#db2777" },
  { label: "Blanco Puro", hex: "#ffffff", border: "#cbd5e1" },
  { label: "Carbón Oscuro", hex: "#1e293b", border: "#475569", isDark: true },
];

// Helper to determine text contrast
function getContrastColor(hexColor?: string): string {
  if (!hexColor) return "#0f172a";
  if (hexColor === "#1e293b" || hexColor.toLowerCase() === "#000000" || hexColor.toLowerCase() === "#111827") {
    return "#ffffff";
  }
  // Remove # if present
  const c = hexColor.replace("#", "");
  if (c.length === 6) {
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128 ? "#ffffff" : "#0f172a";
  }
  return "#0f172a";
}

export const VisualBoardView: React.FC<VisualBoardViewProps> = ({
  project,
  onUpdateProject,
  entity,
  onUpdateEntity,
  onSetAvatar,
  currentAvatarUrl,
  isEmbedded = false,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWorldRef = useRef<HTMLDivElement>(null);
  const marqueeBoxRef = useRef<HTMLDivElement>(null);
  const marqueeHitIdsRef = useRef<string[]>([]);
  const rafTransformId = useRef<number | null>(null);
  const pendingTransformState = useRef<{ panX: number; panY: number; zoom: number } | null>(null);
  const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [pasteNotification, setPasteNotification] = useState<string | null>(null);

  // Determine current whiteboard items & view state
  const isEntityMode = !!entity;
  const currentWhiteboard: MoodboardCanvas = useMemo(() => {
    if (isEntityMode) {
      return entity.whiteboard || { items: [], zoom: 1, panX: 0, panY: 0 };
    }
    return project?.whiteboard || { items: [], zoom: 1, panX: 0, panY: 0 };
  }, [isEntityMode, entity?.whiteboard, project?.whiteboard]);

  const [items, setItems] = useState<BoardItem[]>(() => currentWhiteboard.items || []);
  const itemsRef = useRef<BoardItem[]>(items);
  itemsRef.current = items;
  const isInteractingRef = useRef<boolean>(false);
  const pendingColorSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafColorRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInteractingRef.current) {
      setItems(currentWhiteboard.items || []);
      itemsRef.current = currentWhiteboard.items || [];
    }
  }, [currentWhiteboard.items]);

  // Dragging item state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Arrow interaction states
  const [draggingArrowPoint, setDraggingArrowPoint] = useState<{
    arrowId: string;
    endpoint: "start" | "end";
  } | null>(null);

  const [draggingArrowCurve, setDraggingArrowCurve] = useState<{
    arrowId: string;
  } | null>(null);

  const [draggingArrowMove, setDraggingArrowMove] = useState<{
    arrowId: string;
    startMouseX: number;
    startMouseY: number;
    origStartX: number;
    origStartY: number;
    origEndX: number;
    origEndY: number;
    origControlX?: number;
    origControlY?: number;
  } | null>(null);

  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Multi-Selection State & Marquee Drag Box Selection
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const selectedItemIdsRef = useRef<string[]>(selectedItemIds);
  selectedItemIdsRef.current = selectedItemIds;

  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const marqueeRef = useRef<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const isMarqueeActiveRef = useRef<boolean>(false);
  const hasMarqueeDraggedRef = useRef<boolean>(false);

  // Multi-drag start coordinates and initial positions of all dragged elements
  const multiDragStartRef = useRef<{
    startMouseX: number;
    startMouseY: number;
    initialItems: {
      id: string;
      type: string;
      x: number;
      y: number;
      startX?: number;
      startY?: number;
      endX?: number;
      endY?: number;
      controlX?: number;
      controlY?: number;
    }[];
  } | null>(null);

  // Toolbar horizontal scroll tracking for responsive and embedded views
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkToolbarScroll = useCallback(() => {
    if (!toolbarRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = toolbarRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(maxScroll > 4 && scrollLeft < maxScroll - 4);
  }, []);

  const scrollToolbar = (direction: "left" | "right") => {
    if (!toolbarRef.current) return;
    const scrollAmount = Math.max(220, Math.floor(toolbarRef.current.clientWidth * 0.65));
    toolbarRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkToolbarScroll, 80);
    setTimeout(checkToolbarScroll, 320);
  };

  useEffect(() => {
    checkToolbarScroll();
    const el = toolbarRef.current;
    if (!el) return;

    // Convert mouse wheel vertical scroll to horizontal scroll so user can scroll with mouse wheel
    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) >= Math.abs(e.deltaX) && e.deltaY !== 0) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkToolbarScroll();
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("scroll", checkToolbarScroll, { passive: true });

    // ResizeObserver catches tab switches (e.g. Codex -> Whiteboard in EntityModal), window resizes, and CSS transitions
    const ro = new ResizeObserver(() => {
      checkToolbarScroll();
    });
    ro.observe(el);
    if (el.parentElement) {
      ro.observe(el.parentElement);
    }

    window.addEventListener("resize", checkToolbarScroll);

    // Multiple timers to handle delayed renders, font downloads, and tab animations
    const t1 = setTimeout(checkToolbarScroll, 50);
    const t2 = setTimeout(checkToolbarScroll, 200);
    const t3 = setTimeout(checkToolbarScroll, 600);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("scroll", checkToolbarScroll);
      ro.disconnect();
      window.removeEventListener("resize", checkToolbarScroll);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [checkToolbarScroll]);

  const [selectedTextFontSize, setSelectedTextFontSize] = useState<number | null>(null);
  const [hasActiveTextSelection, setHasActiveTextSelection] = useState<boolean>(false);
  const [activeFontPickerId, setActiveFontPickerId] = useState<string | null>(null);
  const [activeFontSizePickerId, setActiveFontSizePickerId] = useState<string | null>(null);
  const [activeColorPickerId, setActiveColorPickerId] = useState<string | null>(null);
  const [activeLayerMenuId, setActiveLayerMenuId] = useState<string | null>(null);

  // Clear text selection font size cache when switching items
  useEffect(() => {
    setSelectedTextFontSize(null);
    setHasActiveTextSelection(false);
  }, [selectedItemId]);

  // In-memory & session clipboard for whiteboard items (shapes, arrows, text, notes, images)
  const [copiedItem, setCopiedItem] = useState<BoardItem | null>(() => {
    try {
      const saved = sessionStorage.getItem("novelore_board_clipboard");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const textEditorRefs = useRef<Map<string, BoardRichTextEditorHandle>>(new Map());
  const persistTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resizing state for images and shapes
  const [resizingState, setResizingState] = useState<{
    itemId: string;
    handle: "se" | "s" | "e";
    startMouseX: number;
    startMouseY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  // Canvas Panning State with cursor drag
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasPannedRef = useRef<boolean>(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Active color state
  const [activeColor, setActiveColor] = useState<string>(
    entity?.color || "#2563eb"
  );
  const [customColor, setCustomColor] = useState<string>("#2563eb");

  // Snap to Grid (Ajuste a la rejilla) state & ref
  const [snapToGrid, setSnapToGrid] = useState<boolean>(() => {
    try {
      return localStorage.getItem("novelist_whiteboard_snap_to_grid") === "true";
    } catch {
      return false;
    }
  });
  const snapToGridRef = useRef<boolean>(snapToGrid);
  useEffect(() => {
    snapToGridRef.current = snapToGrid;
  }, [snapToGrid]);

  const toggleSnapToGrid = () => {
    setSnapToGrid((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("novelist_whiteboard_snap_to_grid", String(next));
      } catch {}
      return next;
    });
  };

  // Mode for new shapes: with fill (false) or without fill / outline-only (true)
  const [isNextShapeTransparent, setIsNextShapeTransparent] = useState<boolean>(false);

  // Active anchor snap feedback when dragging an arrow endpoint near an element
  const [activeAnchorSnap, setActiveAnchorSnap] = useState<{
    itemId: string;
    position: AnchorPosition;
    x: number;
    y: number;
  } | null>(null);

  // Resource Cards (Links, Spotify, Documents) state
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState<boolean>(false);
  const [editingResourceItem, setEditingResourceItem] = useState<BoardItem | null>(null);
  const [previewPdfData, setPreviewPdfData] = useState<{ fileData: string; fileName: string } | null>(null);

  // Close layer menu on outside click
  useEffect(() => {
    if (!activeLayerMenuId) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".layer-dropdown-container") && !target.closest(".layer-dropdown-trigger")) {
        setActiveLayerMenuId(null);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [activeLayerMenuId]);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(currentWhiteboard.zoom || 1);
  const [pan, setPan] = useState<{ x: number; y: number }>({
    x: currentWhiteboard.panX || 0,
    y: currentWhiteboard.panY || 0,
  });

  const zoomRef = useRef<number>(zoom);
  zoomRef.current = zoom;
  const panRef = useRef<{ x: number; y: number }>(pan);
  panRef.current = pan;

  // Spacebar pan mode state
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const isSpacePressedRef = useRef<boolean>(false);

  // Keep zoom and pan synchronized if novel or entity whiteboard changes
  useEffect(() => {
    if (currentWhiteboard.zoom) {
      setZoom(currentWhiteboard.zoom);
      zoomRef.current = currentWhiteboard.zoom;
    }
    if (currentWhiteboard.panX !== undefined && currentWhiteboard.panY !== undefined) {
      setPan({ x: currentWhiteboard.panX, y: currentWhiteboard.panY });
      panRef.current = { x: currentWhiteboard.panX, y: currentWhiteboard.panY };
    }
    if (canvasWorldRef.current && (currentWhiteboard.zoom || currentWhiteboard.panX !== undefined)) {
      const z = currentWhiteboard.zoom || zoomRef.current;
      const px = currentWhiteboard.panX ?? panRef.current.x;
      const py = currentWhiteboard.panY ?? panRef.current.y;
      canvasWorldRef.current.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${z})`;
    }
  }, [entity?.id, project?.id]);

  // Convert client viewport coordinates to Canvas coordinates accurately with zero-lag ref sync
  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const effectiveZoom = zoomRef.current > 0.01 ? zoomRef.current : 1;
    const currentPan = panRef.current;
    return {
      x: (clientX - rect.left - currentPan.x) / effectiveZoom,
      y: (clientY - rect.top - currentPan.y) / effectiveZoom,
    };
  };

  // Helper to calculate arrow geometry (straight or quadratic bezier curve, with dynamic anchor resolution)
  const getArrowGeometry = (arrow: BoardItem, allItems: BoardItem[] = items) => {
    let rawSx = typeof arrow.startX === "number" ? arrow.startX : 0;
    let rawSy = typeof arrow.startY === "number" ? arrow.startY : 0;
    let rawEx = typeof arrow.endX === "number" ? arrow.endX : 0;
    let rawEy = typeof arrow.endY === "number" ? arrow.endY : 0;

    // Dynamically resolve anchors if attached to any shape, text, note, or card
    if (arrow.startAnchor?.itemId) {
      const sItem = allItems.find((it) => it.id === arrow.startAnchor?.itemId);
      if (sItem) {
        const pt = getAnchorCoordinates(sItem, arrow.startAnchor.position);
        rawSx = pt.x;
        rawSy = pt.y;
      }
    }
    if (arrow.endAnchor?.itemId) {
      const eItem = allItems.find((it) => it.id === arrow.endAnchor?.itemId);
      if (eItem) {
        const pt = getAnchorCoordinates(eItem, arrow.endAnchor.position);
        rawEx = pt.x;
        rawEy = pt.y;
      }
    }

    const sx = Number.isFinite(rawSx) ? rawSx : 0;
    const sy = Number.isFinite(rawSy) ? rawSy : 0;
    const ex = Number.isFinite(rawEx) ? rawEx : 0;
    const ey = Number.isFinite(rawEy) ? rawEy : 0;
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;

    const isCurved =
      arrow.isCurved ||
      arrow.connectorType === "curved-arrow" ||
      arrow.connectorType === "curved-line" ||
      (arrow.controlX !== undefined && arrow.controlY !== undefined);

    let cx = midX;
    let cy = midY;

    if (isCurved) {
      if (
        arrow.controlX !== undefined &&
        arrow.controlY !== undefined &&
        Number.isFinite(arrow.controlX) &&
        Number.isFinite(arrow.controlY)
      ) {
        cx = arrow.controlX;
        cy = arrow.controlY;
      } else {
        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.hypot(dx, dy) || 1;
        const px = -dy / len;
        const py = dx / len;
        cx = Math.round(midX + px * 60);
        cy = Math.round(midY + py * 60);
      }
    }

    // Midpoint on quadratic bezier curve at t = 0.5: B(0.5) = 0.5*mid + 0.5*controlPoint
    const curveMidX = Math.round(0.5 * midX + 0.5 * cx);
    const curveMidY = Math.round(0.5 * midY + 0.5 * cy);

    const pathData = isCurved
      ? `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`
      : `M ${sx} ${sy} L ${ex} ${ey}`;

    return {
      sx,
      sy,
      ex,
      ey,
      midX,
      midY,
      cx,
      cy,
      curveMidX,
      curveMidY,
      isCurved,
      pathData,
    };
  };

  // Persist zoom & pan to parent entity or project
  const persistCanvasTransform = (px: number, py: number, currentZoom: number) => {
    if (isEntityMode && onUpdateEntity) {
      onUpdateEntity((prev) => ({
        ...prev,
        whiteboard: {
          items: prev.whiteboard?.items || items,
          zoom: currentZoom,
          panX: px,
          panY: py,
        },
      }));
    } else if (onUpdateProject) {
      onUpdateProject((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        whiteboard: {
          items: prev.whiteboard?.items || items,
          zoom: currentZoom,
          panX: px,
          panY: py,
        },
      }));
    }
  };

  // Sync / update board items
  const updateBoardItems = (newItems: BoardItem[]) => {
    setItems(newItems);
    itemsRef.current = newItems;
    if (isEntityMode && onUpdateEntity) {
      onUpdateEntity((prev) => ({
        ...prev,
        whiteboard: {
          items: newItems,
          zoom,
          panX: pan.x,
          panY: pan.y,
        },
      }));
    } else if (onUpdateProject) {
      onUpdateProject((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        whiteboard: {
          items: newItems,
          zoom,
          panX: pan.x,
          panY: pan.y,
        },
      }));
    }
  };

  // Debounced persistence to avoid spamming saves during trackpad pan/zoom gestures
  const debouncedPersistCanvasTransform = (px: number, py: number, currentZoom: number) => {
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }
    persistTimeoutRef.current = setTimeout(() => {
      persistCanvasTransform(px, py, currentZoom);
    }, 350);
  };

  // Ultra-fluid direct DOM canvas transform for 60-120fps trackpad panning and zooming
  const applyCanvasTransform = (newPanX: number, newPanY: number, newZoom: number) => {
    // 1. Immediately update ref values for 100% synchronous coordinate math
    panRef.current = { x: newPanX, y: newPanY };
    zoomRef.current = newZoom;

    // 2. Direct hardware-accelerated DOM updates with zero dropped frames
    if (canvasWorldRef.current) {
      canvasWorldRef.current.style.transform = `translate3d(${newPanX}px, ${newPanY}px, 0) scale(${newZoom})`;
    }
    if (containerRef.current) {
      containerRef.current.style.backgroundPosition = `${newPanX}px ${newPanY}px`;
      containerRef.current.style.backgroundSize = `${24 * newZoom}px ${24 * newZoom}px`;
    }

    // 3. Batch React state sync in requestAnimationFrame so React updates cleanly at most once per display refresh
    pendingTransformState.current = { panX: newPanX, panY: newPanY, zoom: newZoom };
    if (!rafTransformId.current) {
      rafTransformId.current = requestAnimationFrame(() => {
        rafTransformId.current = null;
        if (pendingTransformState.current) {
          const { panX, panY, zoom: z } = pendingTransformState.current;
          setPan((prev) => (prev.x === panX && prev.y === panY ? prev : { x: panX, y: panY }));
          setZoom((prev) => (prev === z ? prev : z));
        }
      });
    }
  };

  // Cleanup pending rAF on unmount
  useEffect(() => {
    return () => {
      if (rafTransformId.current) {
        cancelAnimationFrame(rafTransformId.current);
      }
    };
  }, []);

  // Copy whiteboard element (shapes, arrows, notes, text, images)
  const handleCopyItem = (itemToCopy?: BoardItem) => {
    const target =
      itemToCopy || items.find((it) => it.id === (selectedItemId || selectedArrowId));
    if (!target) return;
    const cloned: BoardItem = JSON.parse(JSON.stringify(target));
    setCopiedItem(cloned);
    try {
      sessionStorage.setItem("novelore_board_clipboard", JSON.stringify(cloned));
    } catch {
      // Storage quota or private browsing safety
    }
    const typeLabel =
      target.type === "note"
        ? "Nota adhesiva"
        : target.type === "shape"
        ? "Forma"
        : target.type === "connector"
        ? target.isCurved ? "Curva" : "Flecha"
        : target.type === "text"
        ? "Cuadro de texto"
        : "Imagen";
    setPasteNotification(`${typeLabel} copiada al portapapeles`);
    setTimeout(() => setPasteNotification(null), 2000);
  };

  // Paste whiteboard element with slight diagonal offset
  const handlePasteItem = () => {
    if (!copiedItem) {
      setPasteNotification("No hay elementos para pegar");
      setTimeout(() => setPasteNotification(null), 2000);
      return;
    }
    const offset = 35;
    const newId = `board-${copiedItem.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const maxZ = Math.max(...items.map((it) => it.zIndex || 1), 1) + 1;

    const pasted: BoardItem = JSON.parse(JSON.stringify(copiedItem));
    pasted.id = newId;
    pasted.zIndex = maxZ;

    if (pasted.type === "connector") {
      pasted.startX = (pasted.startX ?? 0) + offset;
      pasted.startY = (pasted.startY ?? 0) + offset;
      pasted.endX = (pasted.endX ?? 0) + offset;
      pasted.endY = (pasted.endY ?? 0) + offset;
      if (pasted.controlX !== undefined) pasted.controlX += offset;
      if (pasted.controlY !== undefined) pasted.controlY += offset;
      setSelectedArrowId(newId);
      setSelectedItemId(null);
    } else {
      pasted.x = (pasted.x ?? 0) + offset;
      pasted.y = (pasted.y ?? 0) + offset;
      setSelectedItemId(newId);
      setSelectedArrowId(null);
    }

    const newItems = [...items, pasted];
    updateBoardItems(newItems);
    setCopiedItem(pasted);

    const typeLabel =
      pasted.type === "note"
        ? "Nota adhesiva"
        : pasted.type === "shape"
        ? "Forma"
        : pasted.type === "connector"
        ? pasted.isCurved ? "Curva" : "Flecha"
        : pasted.type === "text"
        ? "Cuadro de texto"
        : "Imagen";
    setPasteNotification(`${typeLabel} pegada en la pizarra`);
    setTimeout(() => setPasteNotification(null), 2000);
  };

  // Layer Management: Bring to Front
  const handleBringToFront = (itemId: string) => {
    const itemIndex = items.findIndex((it) => it.id === itemId);
    if (itemIndex === -1) return;
    const currentItem = items[itemIndex];
    const maxZ = Math.max(...items.map((it) => it.zIndex || 1), 1) + 1;
    const updatedItem = { ...currentItem, zIndex: maxZ };
    const others = items.filter((it) => it.id !== itemId);
    updateBoardItems([...others, updatedItem]);
    setPasteNotification("Traído al frente");
    setTimeout(() => setPasteNotification(null), 1800);
  };

  // Layer Management: Send to Back
  const handleSendToBack = (itemId: string) => {
    const itemIndex = items.findIndex((it) => it.id === itemId);
    if (itemIndex === -1) return;
    const currentItem = items[itemIndex];
    const minZ = Math.min(...items.map((it) => it.zIndex || 1), 1) - 1;
    const targetZ = Math.max(1, minZ);
    const updatedItem = { ...currentItem, zIndex: targetZ };
    const others = items.filter((it) => it.id !== itemId);
    updateBoardItems([updatedItem, ...others]);
    setPasteNotification("Enviado al fondo");
    setTimeout(() => setPasteNotification(null), 1800);
  };

  // Layer Management: Bring Forward (Up one step)
  const handleBringForward = (itemId: string) => {
    const itemIndex = items.findIndex((it) => it.id === itemId);
    if (itemIndex === -1 || itemIndex >= items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[itemIndex];
    const nextZ = (newItems[itemIndex + 1].zIndex || 1) + 1;
    newItems[itemIndex] = newItems[itemIndex + 1];
    newItems[itemIndex + 1] = { ...temp, zIndex: nextZ };
    updateBoardItems(newItems);
    setPasteNotification("Subido una capa");
    setTimeout(() => setPasteNotification(null), 1800);
  };

  // Layer Management: Send Backward (Down one step)
  const handleSendBackward = (itemId: string) => {
    const itemIndex = items.findIndex((it) => it.id === itemId);
    if (itemIndex <= 0) return;
    const newItems = [...items];
    const temp = newItems[itemIndex];
    const prevZ = Math.max(1, (newItems[itemIndex - 1].zIndex || 1) - 1);
    newItems[itemIndex] = newItems[itemIndex - 1];
    newItems[itemIndex - 1] = { ...temp, zIndex: prevZ };
    updateBoardItems(newItems);
    setPasteNotification("Bajado una capa");
    setTimeout(() => setPasteNotification(null), 1800);
  };

  // Auto-initialize whiteboard from entity's existing gallery or project
  useEffect(() => {
    if (isEntityMode && entity) {
      if (!entity.whiteboard || entity.whiteboard.items.length === 0) {
        if (entity.gallery && entity.gallery.length > 0) {
          const initialItems: BoardItem[] = entity.gallery.map((img, idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            return {
              id: `board-img-${img.id || idx}`,
              type: "image",
              x: 60 + col * 320,
              y: 60 + row * 280,
              width: 280,
              height: 220,
              imageUrl: img.url,
              caption: img.caption || `${entity.name} - Referencia ${idx + 1}`,
              entityId: entity.id,
            };
          });

          // Add a welcome note for this entity
          initialItems.push({
            id: `board-note-${Date.now()}`,
            type: "note",
            x: 60 + (entity.gallery.length % 3) * 320,
            y: 60 + Math.floor(entity.gallery.length / 3) * 280,
            width: 240,
            height: 180,
            title: `📌 Pizarra de ${entity.name}`,
            text: `Espacio visual dedicado. Sube referencias en alta resolución, crea formas sólidas con conceptos y conecta ideas con flechas.`,
            color: "#fef08a",
          });

          updateBoardItems(initialItems);
        }
      }
    }
  }, [isEntityMode, entity?.id]);

  // Keyboard listener for Delete / Backspace, Copy, Paste, and Layers when an item is selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Spacebar canvas panning
      if (e.code === "Space" && !isInput) {
        if (!isSpacePressedRef.current) {
          isSpacePressedRef.current = true;
          setIsSpacePressed(true);
        }
      }

      // Delete / Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && !isInput) {
        if (selectedItemIdsRef.current && selectedItemIdsRef.current.length > 1) {
          handleDeleteMulti();
        } else if (selectedArrowId) {
          handleDeleteItem(selectedArrowId);
        } else if (selectedItemId) {
          handleDeleteItem(selectedItemId);
        }
        return;
      }

      // Copy: Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && !isInput) {
        if (selectedItemId || selectedArrowId) {
          e.preventDefault();
          handleCopyItem();
        }
        return;
      }

      // Paste: Ctrl+V / Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v" && !isInput) {
        if (copiedItem) {
          e.preventDefault();
          handlePasteItem();
        }
        return;
      }

      // Layer shortcuts:
      if (!isInput && (selectedItemId || selectedArrowId)) {
        const targetId = (selectedItemId || selectedArrowId)!;
        // Ctrl+Shift+] -> Bring to front
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "]" || e.key === "}")) {
          e.preventDefault();
          handleBringToFront(targetId);
          return;
        }
        // Ctrl+Shift+[ -> Send to back
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "[" || e.key === "{")) {
          e.preventDefault();
          handleSendToBack(targetId);
          return;
        }
        // Ctrl+] -> Bring forward
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "]") {
          e.preventDefault();
          handleBringForward(targetId);
          return;
        }
        // Ctrl+[ -> Send backward
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "[") {
          e.preventDefault();
          handleSendBackward(targetId);
          return;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpacePressedRef.current = false;
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedArrowId, selectedItemId, items, copiedItem]);

  // Process and add image files (from file input, clipboard paste, or drag & drop)
  const processAndAddImageFiles = async (
    files: (File | Blob)[],
    targetCoords?: { x: number; y: number }
  ) => {
    if (!files || files.length === 0) return;

    const newBoardImages: BoardItem[] = [];
    const newGalleryEntries: { id: string; url: string; caption: string; createdAt: string }[] = [];

    // Calculate baseline spawn point
    const viewW = containerRef.current?.clientWidth || 800;
    const viewH = containerRef.current?.clientHeight || 600;
    const centerFallbackX = Math.round((-pan.x + viewW / 2) / zoom);
    const centerFallbackY = Math.round((-pan.y + viewH / 2) / zoom);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve((ev.target?.result as string) || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });

      if (!dataUrl) continue;
      // High-efficiency downscaling ensures fast rendering and guarantees Firestore document stays within limits
      const optimized = await compressImage(dataUrl, 720, 720, 0.70);

      // Measure natural dimensions to preserve aspect ratio
      let width = 320;
      let height = 240;
      try {
        const img = new Image();
        img.src = optimized;
        await new Promise((res) => {
          img.onload = () => res(null);
          img.onerror = () => res(null);
        });
        if (img.naturalWidth && img.naturalHeight) {
          const aspect = img.naturalWidth / img.naturalHeight;
          if (aspect >= 1) {
            width = Math.min(480, Math.max(220, img.naturalWidth));
            height = Math.round(width / aspect);
          } else {
            height = Math.min(480, Math.max(220, img.naturalHeight));
            width = Math.round(height * aspect);
          }
        }
      } catch {
        // Fallback default 320x240
      }

      // Format caption
      let cleanName = "Imagen pegada";
      if ("name" in file && file.name) {
        cleanName = file.name.replace(/\.[^/.]+$/, "");
      } else {
        const now = new Date();
        cleanName = `Captura ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      }

      const itemId = `board-img-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`;

      // Spawn coordinates centered on target or viewport
      const spawnCenterX = targetCoords ? targetCoords.x : centerFallbackX;
      const spawnCenterY = targetCoords ? targetCoords.y : centerFallbackY;

      const posX = Math.round(spawnCenterX - width / 2 + (i % 4) * 36);
      const posY = Math.round(spawnCenterY - height / 2 + Math.floor(i / 4) * 36);

      newBoardImages.push({
        id: itemId,
        type: "image",
        x: posX,
        y: posY,
        width,
        height,
        imageUrl: optimized,
        caption: cleanName,
        hideCaption: false,
        entityId: entity?.id,
      });

      newGalleryEntries.push({
        id: `img-${Date.now()}-${i}`,
        url: optimized,
        caption: cleanName,
        createdAt: new Date().toISOString(),
      });
    }

    if (newBoardImages.length === 0) return;

    // Instantly update items in local state so it appears immediately without delay
    setItems((prev) => [...prev, ...newBoardImages]);
    itemsRef.current = [...itemsRef.current, ...newBoardImages];

    // Select the first new pasted image
    setSelectedItemId(newBoardImages[0].id);
    setSelectedArrowId(null);

    // Persist to parent entity or novel project
    if (isEntityMode && onUpdateEntity) {
      onUpdateEntity((prev) => {
        const existingWb = prev.whiteboard || { items: [], zoom, panX: pan.x, panY: pan.y };
        const existingItems = existingWb.items || [];
        const existingGallery = prev.gallery || [];
        return {
          ...prev,
          whiteboard: {
            ...existingWb,
            items: [...existingItems, ...newBoardImages],
            zoom,
            panX: pan.x,
            panY: pan.y,
          },
          gallery: [
            ...existingGallery,
            ...newGalleryEntries.filter(
              (ng) => !existingGallery.some((eg) => eg.url === ng.url)
            ),
          ],
        };
      });
    } else if (onUpdateProject) {
      onUpdateProject((prev) => {
        const existingWb = prev.whiteboard || { items: [], zoom, panX: pan.x, panY: pan.y };
        const existingItems = existingWb.items || [];
        return {
          ...prev,
          updatedAt: new Date().toISOString(),
          whiteboard: {
            ...existingWb,
            items: [...existingItems, ...newBoardImages],
            zoom,
            panX: pan.x,
            panY: pan.y,
          },
        };
      });
    }
  };

  // Upload images via file picker input
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileList.length === 0) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    await processAndAddImageFiles(fileList);
  };

  // Paste listener for clipboard images (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const target = e.target as HTMLElement | null;
      const isInputOrTextarea =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // Extract image items or files from clipboard
      const imageFiles: File[] = [];

      if (clipboardData.items && clipboardData.items.length > 0) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i];
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              imageFiles.push(file);
            }
          }
        }
      }

      if (imageFiles.length === 0 && clipboardData.files && clipboardData.files.length > 0) {
        for (let i = 0; i < clipboardData.files.length; i++) {
          const file = clipboardData.files[i];
          if (file.type.startsWith("image/")) {
            imageFiles.push(file);
          }
        }
      }

      // If user is editing text in an input/textarea and NO image files were pasted,
      // allow default text paste into the field.
      if (isInputOrTextarea && imageFiles.length === 0) {
        return;
      }

      // If image files are present in the clipboard, prevent default and paste onto whiteboard
      if (imageFiles.length > 0) {
        e.preventDefault();
        e.stopPropagation();

        // Check if mouse is hovering over canvas
        let targetCoords: { x: number; y: number } | undefined;
        if (lastMousePosRef.current && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          if (
            lastMousePosRef.current.clientX >= rect.left &&
            lastMousePosRef.current.clientX <= rect.right &&
            lastMousePosRef.current.clientY >= rect.top &&
            lastMousePosRef.current.clientY <= rect.bottom
          ) {
            targetCoords = getCanvasCoords(
              lastMousePosRef.current.clientX,
              lastMousePosRef.current.clientY
            );
          }
        }

        await processAndAddImageFiles(imageFiles, targetCoords);
        setPasteNotification(
          imageFiles.length === 1
            ? "Imagen pegada en la pizarra"
            : `${imageFiles.length} imágenes pegadas en la pizarra`
        );
        setTimeout(() => setPasteNotification(null), 2500);
        return;
      }

      // If not editing text, also support pasting copied items or direct image URLs / data URIs
      if (!isInputOrTextarea) {
        if (copiedItem) {
          e.preventDefault();
          handlePasteItem();
          return;
        }

        const text = clipboardData.getData("text/plain")?.trim();
        if (
          text &&
          (text.startsWith("data:image/") ||
            /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(text))
        ) {
          e.preventDefault();
          try {
            const resp = await fetch(text);
            const blob = await resp.blob();
            if (blob.type.startsWith("image/")) {
              const file = new File([blob], "imagen-pegada", { type: blob.type });
              await processAndAddImageFiles([file]);
              setPasteNotification("Imagen pegada desde enlace");
              setTimeout(() => setPasteNotification(null), 2500);
            }
          } catch {
            // Ignore fetch error if CORS prevented
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [pan.x, pan.y, zoom, isEntityMode, entity?.id, onUpdateEntity, onUpdateProject]);

  // Drag & drop handlers for dropping image files directly onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    setIsDragOver(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;

    e.preventDefault();
    e.stopPropagation();

    const coords = getCanvasCoords(e.clientX, e.clientY);
    await processAndAddImageFiles(files, coords);
    setPasteNotification(
      files.length === 1
        ? "Imagen añadida a la pizarra"
        : `${files.length} imágenes añadidas a la pizarra`
    );
    setTimeout(() => setPasteNotification(null), 2500);
  };

  // Add Sticky Note
  const handleAddNote = () => {
    let posX = 100 + Math.random() * 140 - pan.x;
    let posY = 100 + Math.random() * 140 - pan.y;
    if (snapToGridRef.current) {
      posX = Math.round(posX / 24) * 24;
      posY = Math.round(posY / 24) * 24;
    }
    const newItem: BoardItem = {
      id: `board-note-${Date.now()}`,
      type: "note",
      x: posX,
      y: posY,
      width: 230,
      height: 180,
      title: "Nueva Nota",
      text: "Apunta detalles, rasgos, secretos o ideas aquí...",
      color: activeColor,
    };
    updateBoardItems([...items, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Add Geometric Shape (Solid or No-fill / Outline-only)
  const handleAddShape = (shapeType: "rectangle" | "circle", transparent = isNextShapeTransparent) => {
    const isCircle = shapeType === "circle";
    const solidBg = transparent ? "transparent" : activeColor;
    const strokeColor = activeColor || "#3b82f6";
    const textColor = transparent ? strokeColor : getContrastColor(solidBg);

    let posX = 120 + Math.random() * 140 - pan.x;
    let posY = 120 + Math.random() * 140 - pan.y;
    if (snapToGridRef.current) {
      posX = Math.round(posX / 24) * 24;
      posY = Math.round(posY / 24) * 24;
    }

    const newItem: BoardItem = {
      id: `board-shape-${Date.now()}`,
      type: "shape",
      shapeType,
      x: posX,
      y: posY,
      width: isCircle ? 180 : 220,
      height: isCircle ? 180 : 140,
      backgroundColor: solidBg,
      borderColor: strokeColor,
      textColor: textColor,
      label: "", // Clean default so it can serve as color swatch or clean container
      textAlign: "center",
    };
    updateBoardItems([...items, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Toggle Shape Fill (Solid vs Transparent / Outline-only)
  const handleToggleShapeFill = (shapeId: string) => {
    const newItems = items.map((it) => {
      if (it.id !== shapeId || it.type !== "shape") return it;
      const isNoFill = it.backgroundColor === "transparent" || it.backgroundColor === "none";
      if (isNoFill) {
        const fill = (it.borderColor && it.borderColor !== "transparent") ? it.borderColor : (activeColor || "#3b82f6");
        return {
          ...it,
          backgroundColor: fill,
          borderColor: fill,
          textColor: getContrastColor(fill),
        };
      } else {
        const stroke = (it.borderColor && it.borderColor !== "transparent") ? it.borderColor : (it.backgroundColor || activeColor || "#3b82f6");
        return {
          ...it,
          backgroundColor: "transparent",
          borderColor: stroke,
          textColor: stroke,
        };
      }
    });
    setItems(newItems);
    itemsRef.current = newItems;
    updateBoardItems(newItems);
  };

  // Set Shape to No Fill (transparent background, outline only)
  const handleSetShapeNoFill = (shapeId: string) => {
    const newItems = items.map((it) => {
      if (it.id !== shapeId || it.type !== "shape") return it;
      const stroke = (it.borderColor && it.borderColor !== "transparent") ? it.borderColor : (it.backgroundColor || activeColor || "#3b82f6");
      return {
        ...it,
        backgroundColor: "transparent",
        borderColor: stroke,
        textColor: stroke,
      };
    });
    setItems(newItems);
    itemsRef.current = newItems;
    updateBoardItems(newItems);
  };

  // Add Plain Text Box (Border-free transparent text box)
  const handleAddPlainText = () => {
    const textColor =
      activeColor === "#1e293b" || activeColor === "#0f172a"
        ? "#ffffff"
        : activeColor !== "#fef08a" && activeColor !== "#ffffff"
        ? activeColor
        : "var(--text-main)";

    let posX = 140 + Math.random() * 120 - pan.x;
    let posY = 140 + Math.random() * 120 - pan.y;
    if (snapToGridRef.current) {
      posX = Math.round(posX / 24) * 24;
      posY = Math.round(posY / 24) * 24;
    }

    const newItem: BoardItem = {
      id: `board-text-${Date.now()}`,
      type: "text",
      x: posX,
      y: posY,
      width: 260,
      height: 60,
      text: "Texto aquí...",
      textColor,
      fontSize: 18,
      textAlign: "left",
      fontFamily: "Plus Jakarta Sans",
      richText: "<p>Texto aquí...</p>",
    };
    updateBoardItems([...items, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Save or update a resource card (Spotify, web link, or document)
  const handleSaveResource = (itemData: Partial<BoardItem>) => {
    if (editingResourceItem) {
      const newItems = items.map((it) =>
        it.id === editingResourceItem.id ? { ...it, ...itemData } : it
      );
      updateBoardItems(newItems);
      setEditingResourceItem(null);
    } else {
      const containerW = containerRef.current?.clientWidth || 800;
      const containerH = containerRef.current?.clientHeight || 600;
      let posX = Math.round((-pan.x + containerW / 2 - 160) / zoom);
      let posY = Math.round((-pan.y + containerH / 2 - 80) / zoom);
      if (snapToGridRef.current) {
        posX = Math.round(posX / 24) * 24;
        posY = Math.round(posY / 24) * 24;
      }

      const newItem: BoardItem = {
        id: `board-link-${Date.now()}`,
        type: "link",
        x: posX,
        y: posY,
        ...itemData,
      };

      updateBoardItems([...items, newItem]);
      setSelectedItemId(newItem.id);
      setSelectedItemIds([newItem.id]);
    }
  };

  // Update specific fields of any item on the board
  const handleUpdateItem = (itemId: string, updatedFields: Partial<BoardItem>) => {
    const newItems = items.map((it) =>
      it.id === itemId ? { ...it, ...updatedFields } : it
    );
    updateBoardItems(newItems);
  };

  // Update text and rich text HTML for board item
  const handleUpdateItemText = (itemId: string, plainText: string, richHtml?: string) => {
    const newItems = items.map((it) =>
      it.id === itemId ? { ...it, text: plainText, richText: richHtml } : it
    );
    updateBoardItems(newItems);
  };

  // Set font size for text item (applies to current text selection if selected, or entire box if no selection)
  const handleSetTextFontSize = (itemId: string, size: number) => {
    const clampedSize = Math.max(8, Math.min(240, Math.round(size)));
    const editor = textEditorRefs.current.get(itemId);
    let handledSelection = false;
    if (editor) {
      handledSelection = editor.applyFontSize(clampedSize);
      if (handledSelection) {
        setSelectedTextFontSize(clampedSize);
      }
    }
    if (!handledSelection) {
      const newItems = items.map((it) =>
        it.id === itemId ? { ...it, fontSize: clampedSize } : it
      );
      updateBoardItems(newItems);
      setSelectedTextFontSize(clampedSize);
    }
  };

  // Set font family for text item (applies to current text selection if selected, or entire box if no selection)
  const handleSetTextFontFamily = (itemId: string, fontId: string) => {
    const fontConfig = getBoardFontConfig(fontId);
    const editor = textEditorRefs.current.get(itemId);
    let handledSelection = false;
    if (editor) {
      handledSelection = editor.applyFontFamily(fontConfig.family, fontId);
    }
    if (!handledSelection) {
      const newItems = items.map((it) =>
        it.id === itemId ? { ...it, fontFamily: fontId } : it
      );
      updateBoardItems(newItems);
    }
  };

  // Set text color for text item (applies to current text selection if selected, or entire box if no selection)
  const handleSetTextColor = (itemId: string, color: string) => {
    const editor = textEditorRefs.current.get(itemId);
    let handledSelection = false;
    if (editor) {
      handledSelection = editor.applyColor(color);
    }
    if (!handledSelection) {
      const newItems = items.map((it) =>
        it.id === itemId ? { ...it, textColor: color } : it
      );
      updateBoardItems(newItems);
    }
  };

  // Set text alignment for text box or shape
  const handleSetTextAlign = (itemId: string, align: "left" | "center" | "right") => {
    const newItems = items.map((it) => (it.id === itemId ? { ...it, textAlign: align } : it));
    updateBoardItems(newItems);
  };

  // Clear text inside shape
  const handleClearShapeText = (itemId: string) => {
    const newItems = items.map((it) => (it.id === itemId ? { ...it, label: "" } : it));
    updateBoardItems(newItems);
  };

  // Toggle hiding the name/caption of an image
  const handleToggleHideCaption = (id: string) => {
    const newItems = items.map((it) =>
      it.id === id ? { ...it, hideCaption: !it.hideCaption } : it
    );
    updateBoardItems(newItems);
  };

  // Add Arrow / Connector (supports straight or curved arrows and lines)
  const handleAddArrow = (
    connectorType: "arrow" | "line" | "dashed" | "curved-arrow" | "curved-line" = "arrow",
    isCurvedParam?: boolean
  ) => {
    const arrowCol = customColor || activeColor || "#38bdf8";
    const centerX = Math.round((-pan.x + (containerRef.current?.clientWidth || 800) / 2) / zoom);
    const centerY = Math.round((-pan.y + (containerRef.current?.clientHeight || 600) / 2) / zoom);

    const startX = centerX - 120;
    const startY = centerY - 50;
    const endX = centerX + 120;
    const endY = centerY + 50;

    const isCurved =
      isCurvedParam !== undefined
        ? isCurvedParam
        : connectorType === "curved-arrow" || connectorType === "curved-line";

    let controlX: number | undefined;
    let controlY: number | undefined;

    if (isCurved) {
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const dx = endX - startX;
      const dy = endY - startY;
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy / len;
      const py = dx / len;
      controlX = Math.round(midX + px * 60);
      controlY = Math.round(midY + py * 60);
    }

    const newItem: BoardItem = {
      id: `board-arrow-${Date.now()}`,
      type: "connector",
      connectorType,
      isCurved,
      x: 0,
      y: 0,
      startX,
      startY,
      endX,
      endY,
      controlX,
      controlY,
      arrowColor: arrowCol,
      arrowLabel: "", // Clean by default, user can edit or leave empty without indicator
      startCap: "none",
      endCap:
        connectorType === "line" || connectorType === "curved-line" ? "none" : "arrow",
      isDashed: connectorType === "dashed",
      strokeWidth: 2.8,
    };
    updateBoardItems([...items, newItem]);
    setSelectedArrowId(newItem.id);
    setSelectedItemId(newItem.id);
  };

  // Toggle arrow between straight and curved (quadratic bezier)
  const handleToggleArrowCurved = (arrowId: string) => {
    const arrow = items.find((i) => i.id === arrowId);
    if (!arrow) return;
    const geom = getArrowGeometry(arrow);
    const willBeCurved = !geom.isCurved;

    const sx = arrow.startX || 0;
    const sy = arrow.startY || 0;
    const ex = arrow.endX || 0;
    const ey = arrow.endY || 0;
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len;
    const py = dx / len;

    const newItems = items.map((it) => {
      if (it.id === arrowId) {
        return {
          ...it,
          isCurved: willBeCurved,
          connectorType: willBeCurved
            ? it.connectorType === "line"
              ? ("curved-line" as const)
              : ("curved-arrow" as const)
            : it.connectorType === "curved-line"
            ? ("line" as const)
            : ("arrow" as const),
          controlX: willBeCurved ? Math.round(midX + px * 60) : undefined,
          controlY: willBeCurved ? Math.round(midY + py * 60) : undefined,
        };
      }
      return it;
    });
    updateBoardItems(newItems);
  };

  // Cycle arrow start cap (none -> arrow -> circle -> none)
  const handleCycleArrowStartCap = (arrowId: string) => {
    const newItems = items.map((it) => {
      if (it.id === arrowId) {
        const cur = it.startCap || "none";
        const next: "none" | "arrow" | "circle" =
          cur === "none" ? "arrow" : cur === "arrow" ? "circle" : "none";
        return { ...it, startCap: next };
      }
      return it;
    });
    updateBoardItems(newItems);
  };

  // Cycle arrow end cap (arrow -> circle -> none -> arrow)
  const handleCycleArrowEndCap = (arrowId: string) => {
    const newItems = items.map((it) => {
      if (it.id === arrowId) {
        const defaultEnd =
          it.connectorType === "line" || it.connectorType === "curved-line"
            ? "none"
            : "arrow";
        const cur = it.endCap || defaultEnd;
        const next: "none" | "arrow" | "circle" =
          cur === "arrow" ? "circle" : cur === "circle" ? "none" : "arrow";
        return {
          ...it,
          endCap: next,
          connectorType:
            next === "none"
              ? it.isCurved
                ? ("curved-line" as const)
                : ("line" as const)
              : it.isCurved
              ? ("curved-arrow" as const)
              : ("arrow" as const),
        };
      }
      return it;
    });
    updateBoardItems(newItems);
  };

  // Toggle arrow between pointed head and plain line
  const handleToggleArrowHead = (arrowId: string) => {
    const newItems = items.map((it) => {
      if (it.id === arrowId) {
        const isCurrentArrow =
          it.connectorType === "arrow" || it.connectorType === "curved-arrow";
        const newConnectorType = isCurrentArrow
          ? it.isCurved
            ? ("curved-line" as const)
            : ("line" as const)
          : it.isCurved
          ? ("curved-arrow" as const)
          : ("arrow" as const);
        return {
          ...it,
          connectorType: newConnectorType,
          endCap: (isCurrentArrow ? "none" : "arrow") as "none" | "arrow" | "circle",
        };
      }
      return it;
    });
    updateBoardItems(newItems);
  };

  // Toggle dashed / continuous style
  const handleToggleArrowDashed = (arrowId: string) => {
    const newItems = items.map((it) => {
      if (it.id === arrowId) {
        const isDashed = !(it.isDashed || it.connectorType === "dashed");
        return {
          ...it,
          isDashed,
          connectorType: isDashed
            ? ("dashed" as const)
            : it.isCurved
            ? ("curved-arrow" as const)
            : ("arrow" as const),
        };
      }
      return it;
    });
    updateBoardItems(newItems);
  };

  // Cycle stroke thickness: 1.5px (Fino) -> 2.8px (Normal) -> 4.5px (Grueso) -> 1.5px
  const handleCycleArrowStrokeWidth = (arrowId: string) => {
    const newItems = items.map((it) => {
      if (it.id === arrowId) {
        const cur = it.strokeWidth || 2.8;
        let next = 2.8;
        if (cur < 2) next = 2.8;
        else if (cur < 4) next = 4.5;
        else next = 1.5;
        return { ...it, strokeWidth: next };
      }
      return it;
    });
    updateBoardItems(newItems);
  };

  // Delete item (and clean up any connected anchors)
  const handleDeleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    const newItems = items
      .filter((i) => i.id !== id)
      .map((it) => {
        if (it.type === "connector") {
          let updated = it;
          if (it.startAnchor?.itemId === id) {
            updated = { ...updated, startAnchor: undefined };
          }
          if (it.endAnchor?.itemId === id) {
            updated = { ...updated, endAnchor: undefined };
          }
          return updated;
        }
        return it;
      });
    updateBoardItems(newItems);
    if (selectedItemId === id) setSelectedItemId(null);
    if (selectedArrowId === id) setSelectedArrowId(null);
    setSelectedItemIds((prev) => prev.filter((i) => i !== id));

    // If deleting an image in entity mode, also remove from gallery if present
    if (isEntityMode && target?.type === "image" && target.imageUrl && onUpdateEntity) {
      onUpdateEntity((prev) => ({
        ...prev,
        gallery: (prev.gallery || []).filter((g) => g.url !== target.imageUrl),
      }));
    }
  };

  // Delete all selected items simultaneously
  const handleDeleteMulti = () => {
    if (selectedItemIds.length === 0) return;
    const toDeleteSet = new Set(selectedItemIds);
    const newItems = items
      .filter((it) => !toDeleteSet.has(it.id))
      .map((it) => {
        if (it.type === "connector") {
          let updated = it;
          if (it.startAnchor && toDeleteSet.has(it.startAnchor.itemId)) {
            updated = { ...updated, startAnchor: undefined };
          }
          if (it.endAnchor && toDeleteSet.has(it.endAnchor.itemId)) {
            updated = { ...updated, endAnchor: undefined };
          }
          return updated;
        }
        return it;
      });

    updateBoardItems(newItems);
    setSelectedItemIds([]);
    setSelectedItemId(null);
    setSelectedArrowId(null);
  };

  // Duplicate all selected items offset by 24px
  const handleDuplicateMulti = () => {
    if (selectedItemIds.length === 0) return;
    const targetItems = items.filter((it) => selectedItemIds.includes(it.id));
    const idMap = new Map<string, string>();
    const timestamp = Date.now();

    targetItems.forEach((it, idx) => {
      idMap.set(it.id, `board-item-${timestamp}-${idx}-${Math.random().toString(36).substring(2, 7)}`);
    });

    const newClones: BoardItem[] = targetItems.map((it) => {
      const newId = idMap.get(it.id)!;
      if (it.type === "connector") {
        return {
          ...it,
          id: newId,
          startX: (it.startX ?? 0) + 24,
          startY: (it.startY ?? 0) + 24,
          endX: (it.endX ?? 0) + 24,
          endY: (it.endY ?? 0) + 24,
          controlX: it.controlX !== undefined ? it.controlX + 24 : undefined,
          controlY: it.controlY !== undefined ? it.controlY + 24 : undefined,
          startAnchor: it.startAnchor && idMap.has(it.startAnchor.itemId)
            ? { ...it.startAnchor, itemId: idMap.get(it.startAnchor.itemId)! }
            : undefined,
          endAnchor: it.endAnchor && idMap.has(it.endAnchor.itemId)
            ? { ...it.endAnchor, itemId: idMap.get(it.endAnchor.itemId)! }
            : undefined,
        };
      }
      return {
        ...it,
        id: newId,
        x: it.x + 24,
        y: it.y + 24,
      };
    });

    const updated = [...items, ...newClones];
    setItems(updated);
    itemsRef.current = updated;
    const cloneIds = newClones.map((c) => c.id);
    setSelectedItemIds(cloneIds);
    setSelectedItemId(cloneIds[0] || null);
    setSelectedArrowId(null);
    updateBoardItems(updated);
  };

  // Scale / resize all selected items proportionally together
  const handleScaleSelectedItems = (scaleFactor: number) => {
    if (selectedItemIds.length === 0) return;
    const targetIds = new Set(selectedItemIds);
    const newItems = items.map((it) => {
      if (!targetIds.has(it.id)) return it;
      if (it.type === "shape") {
        const curW = it.width || (it.shapeType === "circle" ? 180 : 220);
        const curH = it.height || (it.shapeType === "circle" ? 180 : 140);
        let nextW = Math.round(curW * scaleFactor);
        let nextH = Math.round(curH * scaleFactor);
        if (snapToGridRef.current) {
          nextW = Math.round(nextW / 24) * 24;
          nextH = Math.round(nextH / 24) * 24;
        }
        nextW = Math.max(60, Math.min(1800, nextW));
        nextH = Math.max(50, Math.min(1800, nextH));
        if (it.shapeType === "circle") {
          const s = Math.max(nextW, nextH);
          nextW = s;
          nextH = s;
        }
        return { ...it, width: nextW, height: nextH };
      }
      if (it.type === "note") {
        const curW = it.width || 230;
        const curH = it.height || 180;
        let nextW = Math.max(120, Math.min(1200, Math.round(curW * scaleFactor)));
        let nextH = Math.max(100, Math.min(1200, Math.round(curH * scaleFactor)));
        if (snapToGridRef.current) {
          nextW = Math.round(nextW / 24) * 24;
          nextH = Math.round(nextH / 24) * 24;
        }
        return { ...it, width: nextW, height: nextH };
      }
      if (it.type === "image") {
        const curW = it.width || 320;
        const curH = it.height || 240;
        let nextW = Math.max(80, Math.min(2000, Math.round(curW * scaleFactor)));
        let nextH = Math.max(60, Math.min(2000, Math.round(curH * scaleFactor)));
        if (snapToGridRef.current) {
          nextW = Math.round(nextW / 24) * 24;
          nextH = Math.round(nextH / 24) * 24;
        }
        return { ...it, width: nextW, height: nextH };
      }
      if (it.type === "text") {
        const curFontSize = it.fontSize || 18;
        const curW = it.width || 260;
        const curH = it.height || 60;
        const delta = scaleFactor > 1 ? 2 : -2;
        const nextFontSize = Math.max(10, Math.min(72, curFontSize + delta));
        let nextW = Math.max(120, Math.min(1600, Math.round(curW * scaleFactor)));
        let nextH = Math.max(40, Math.min(800, Math.round(curH * scaleFactor)));
        return {
          ...it,
          fontSize: nextFontSize,
          width: nextW,
          height: nextH,
        };
      }
      if (it.type === "connector") {
        const curStroke = it.strokeWidth || 2.8;
        const nextStroke = scaleFactor > 1 ? Math.min(8, curStroke + 0.8) : Math.max(1.2, curStroke - 0.8);
        return { ...it, strokeWidth: parseFloat(nextStroke.toFixed(1)) };
      }
      return it;
    });

    updateBoardItems(newItems);
  };

  // Auto-arrange images in clean visual grid
  const handleAutoArrange = () => {
    const images = items.filter((it) => it.type === "image");
    const otherItems = items.filter((it) => it.type !== "image");

    const cols = Math.max(2, Math.ceil(Math.sqrt(images.length * 1.5)));
    const updatedImages = images.map((img, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        ...img,
        x: 60 + col * 340,
        y: 60 + row * 300,
      };
    });

    updateBoardItems([...updatedImages, ...otherItems]);
  };

  // Start dragging a general board item (card, shape, note, image)
  const handleMouseDownItem = (e: React.MouseEvent, item: BoardItem) => {
    e.stopPropagation();
    if (selectedItemId !== item.id) {
      setActiveFontPickerId(null);
      setActiveFontSizePickerId(null);
    }

    if (e.shiftKey) {
      const exists = selectedItemIds.includes(item.id);
      const next = exists
        ? selectedItemIds.filter((id) => id !== item.id)
        : [...selectedItemIds, item.id];
      setSelectedItemIds(next);
      setSelectedItemId(next[next.length - 1] || null);
      setSelectedArrowId(null);
      return;
    }

    const coords = getCanvasCoords(e.clientX, e.clientY);

    // If item is already part of an active multi-selection (> 1 item), prepare to drag all together
    if (selectedItemIds.includes(item.id) && selectedItemIds.length > 1) {
      setSelectedItemId(item.id);
      setSelectedArrowId(null);
      setDraggingId(item.id);
      multiDragStartRef.current = {
        startMouseX: coords.x,
        startMouseY: coords.y,
        initialItems: items
          .filter((it) => selectedItemIds.includes(it.id))
          .map((it) => ({
            id: it.id,
            type: it.type,
            x: it.x,
            y: it.y,
            startX: it.startX,
            startY: it.startY,
            endX: it.endX,
            endY: it.endY,
            controlX: it.controlX,
            controlY: it.controlY,
          })),
      };
      return;
    }

    // Single item drag initiation
    setSelectedItemId(item.id);
    setSelectedArrowId(null);
    setSelectedItemIds([item.id]);
    setDraggingId(item.id);
    multiDragStartRef.current = null;

    setDragOffset({
      x: coords.x - item.x,
      y: coords.y - item.y,
    });
  };

  // Start dragging an arrow endpoint (start or end)
  const handleMouseDownArrowEndpoint = (
    e: React.MouseEvent,
    arrow: BoardItem,
    point: "start" | "end"
  ) => {
    e.stopPropagation();
    setActiveFontPickerId(null);
    setActiveFontSizePickerId(null);
    setSelectedArrowId(arrow.id);
    setSelectedItemId(arrow.id);
    setDraggingArrowPoint({
      arrowId: arrow.id,
      endpoint: point,
    });
  };

  // Start dragging an arrow's curve apex
  const handleMouseDownArrowCurve = (e: React.MouseEvent, arrow: BoardItem) => {
    e.stopPropagation();
    setSelectedArrowId(arrow.id);
    setSelectedItemId(arrow.id);
    setDraggingArrowCurve({
      arrowId: arrow.id,
    });
  };

  // Start dragging the entire arrow by its body path or label
  const handleMouseDownArrowBody = (e: React.MouseEvent, arrow: BoardItem) => {
    e.stopPropagation();
    if (e.shiftKey) {
      const exists = selectedItemIds.includes(arrow.id);
      const next = exists
        ? selectedItemIds.filter((id) => id !== arrow.id)
        : [...selectedItemIds, arrow.id];
      setSelectedItemIds(next);
      setSelectedItemId(next[next.length - 1] || null);
      setSelectedArrowId(arrow.id);
      return;
    }

    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (selectedItemIds.includes(arrow.id) && selectedItemIds.length > 1) {
      setSelectedArrowId(arrow.id);
      setSelectedItemId(arrow.id);
      setDraggingId(arrow.id);
      multiDragStartRef.current = {
        startMouseX: coords.x,
        startMouseY: coords.y,
        initialItems: items
          .filter((it) => selectedItemIds.includes(it.id))
          .map((it) => ({
            id: it.id,
            type: it.type,
            x: it.x,
            y: it.y,
            startX: it.startX,
            startY: it.startY,
            endX: it.endX,
            endY: it.endY,
            controlX: it.controlX,
            controlY: it.controlY,
          })),
      };
      return;
    }

    setSelectedArrowId(arrow.id);
    setSelectedItemId(arrow.id);
    setSelectedItemIds([arrow.id]);
    multiDragStartRef.current = null;

    const geom = getArrowGeometry(arrow);
    setDraggingArrowMove({
      arrowId: arrow.id,
      startMouseX: coords.x,
      startMouseY: coords.y,
      origStartX: arrow.startX || 0,
      origStartY: arrow.startY || 0,
      origEndX: arrow.endX || 0,
      origEndY: arrow.endY || 0,
      origControlX: geom.isCurved ? geom.cx : undefined,
      origControlY: geom.isCurved ? geom.cy : undefined,
    });
  };

  // Start resizing an item (image, shape, note, or resource card)
  const handleStartResize = (
    e: React.MouseEvent,
    item: BoardItem,
    handle: "se" | "s" | "e"
  ) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setSelectedArrowId(null);
    setSelectedItemIds([item.id]);
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const dim = getItemDimensions(item);
    setResizingState({
      itemId: item.id,
      handle,
      startMouseX: coords.x,
      startMouseY: coords.y,
      startWidth: item.width || dim.width,
      startHeight: item.height || dim.height,
    });
  };

  // Canvas Panning or Drag-to-Select (Marquee Box Selection)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // When spacebar is pressed or middle click, pan the canvas
    if (isSpacePressedRef.current || e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      hasPannedRef.current = false;
      setPanStart({
        x: e.clientX - panRef.current.x,
        y: e.clientY - panRef.current.y,
      });
      return;
    }

    // Don't drag-to-select if clicking an interactive node, anchor, input, button or toolbar
    if (
      target.closest(".board-item-node") ||
      target.closest(".connector-anchor") ||
      target.closest(".connector-path") ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("#whiteboard-floating-selection-bar") ||
      target.closest("#whiteboard-multi-selection-bar") ||
      target.closest("#whiteboard-toolbar")
    ) {
      return;
    }

    // Normal Left Click on canvas background: initiate Drag-to-Select Marquee Box
    if (e.button === 0) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      const newMarquee = {
        startX: coords.x,
        startY: coords.y,
        currentX: coords.x,
        currentY: coords.y,
      };
      marqueeRef.current = newMarquee;
      isMarqueeActiveRef.current = true;
      hasMarqueeDraggedRef.current = false;
      marqueeHitIdsRef.current = [];
      if (marqueeBoxRef.current) {
        marqueeBoxRef.current.style.display = "block";
        marqueeBoxRef.current.style.left = `${coords.x}px`;
        marqueeBoxRef.current.style.top = `${coords.y}px`;
        marqueeBoxRef.current.style.width = "0px";
        marqueeBoxRef.current.style.height = "0px";
      }
      setMarquee(newMarquee);

      if (!e.shiftKey) {
        setSelectedItemIds([]);
        setSelectedItemId(null);
        setSelectedArrowId(null);
      }
    }
  };

  // Canvas background click: only deselect if user didn't drag/pan and clicked background
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (hasPannedRef.current) {
      hasPannedRef.current = false;
      return;
    }
    if (hasMarqueeDraggedRef.current) {
      hasMarqueeDraggedRef.current = false;
      return;
    }
    const target = e.target as HTMLElement;
    if (
      target.id === "whiteboard-canvas" ||
      target.id === "canvas-world" ||
      target.tagName === "svg" ||
      target.classList.contains("canvas-bg-layer") ||
      (!target.closest(".board-item-node") &&
        !target.closest(".connector-anchor") &&
        !target.closest("button") &&
        !target.closest(".board-toolbar") &&
        !target.closest("#whiteboard-floating-selection-bar") &&
        !target.closest("#whiteboard-multi-selection-bar") &&
        !target.closest("input"))
    ) {
      setSelectedItemId(null);
      setSelectedArrowId(null);
      setSelectedItemIds([]);
      setActiveFontPickerId(null);
      setActiveFontSizePickerId(null);
      setActiveColorPickerId(null);
      setActiveLayerMenuId(null);
    }
  };

  // Dedicated non-passive wheel event listener for ultra-responsive, natural trackpad panning & pinch-to-zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onNativeWheel = (e: WheelEvent) => {
      // Must preventDefault to stop browser default page zooming / swipe-back navigation
      e.preventDefault();

      // Zooming with Trackpad Pinch or Ctrl/Cmd + Wheel
      if (e.ctrlKey || e.metaKey) {
        const currentZ = zoomRef.current;
        // On pinch: e.deltaY is negative when expanding fingers (zoom in), positive when pinching (zoom out)
        const zoomDelta = -e.deltaY;
        const factor = Math.exp(zoomDelta * 0.005);
        const clampedFactor = Math.max(0.75, Math.min(1.25, factor));
        const nextZoom = Math.min(3.0, Math.max(0.2, parseFloat((currentZ * clampedFactor).toFixed(3))));
        if (Math.abs(nextZoom - currentZ) < 0.0005) return;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const currentPan = panRef.current;
        const newPanX = Math.round(mouseX - (mouseX - currentPan.x) * (nextZoom / currentZ));
        const newPanY = Math.round(mouseY - (mouseY - currentPan.y) * (nextZoom / currentZ));

        applyCanvasTransform(newPanX, newPanY, nextZoom);
        debouncedPersistCanvasTransform(newPanX, newPanY, nextZoom);
      } else {
        // Trackpad 2-finger Panning or Mouse Wheel:
        // Native 1:1 pixel precision without artificial damping or throttling
        let dx = e.deltaX;
        let dy = e.deltaY;

        // Line mode (mouse wheel notches)
        if (e.deltaMode === 1) {
          dx *= 20;
          dy *= 20;
        } else if (e.deltaMode === 2) {
          dx *= 400;
          dy *= 400;
        }

        // Horizontal scrolling when holding Shift on standard mouse wheel
        if (e.shiftKey && dx === 0 && dy !== 0) {
          dx = dy;
          dy = 0;
        }

        const currentPan = panRef.current;
        const newPanX = Math.round(currentPan.x - dx);
        const newPanY = Math.round(currentPan.y - dy);

        applyCanvasTransform(newPanX, newPanY, zoomRef.current);
        debouncedPersistCanvasTransform(newPanX, newPanY, zoomRef.current);
      }
    };

    container.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onNativeWheel);
    };
  }, []);

  // Master mouse move logic
  const processMouseMove = (clientX: number, clientY: number) => {
    // 0. Handling Canvas Panning with Cursor (Spacebar + Drag or Middle Click)
    if (isPanning) {
      hasPannedRef.current = true;
      const newPanX = Math.round(clientX - panStart.x);
      const newPanY = Math.round(clientY - panStart.y);
      applyCanvasTransform(newPanX, newPanY, zoomRef.current);
      debouncedPersistCanvasTransform(newPanX, newPanY, zoomRef.current);
      return;
    }

    const coords = getCanvasCoords(clientX, clientY);
    if (!Number.isFinite(coords.x) || !Number.isFinite(coords.y)) return;

    // 0.5 Handling Drag-to-Select Marquee Box Selection with hardware-accelerated direct DOM
    if (isMarqueeActiveRef.current && marqueeRef.current) {
      const updated = {
        ...marqueeRef.current,
        currentX: coords.x,
        currentY: coords.y,
      };
      marqueeRef.current = updated;

      const minX = Math.min(updated.startX, updated.currentX);
      const maxX = Math.max(updated.startX, updated.currentX);
      const minY = Math.min(updated.startY, updated.currentY);
      const maxY = Math.max(updated.startY, updated.currentY);
      const w = maxX - minX;
      const h = maxY - minY;

      if (marqueeBoxRef.current) {
        marqueeBoxRef.current.style.display = "block";
        marqueeBoxRef.current.style.left = `${minX}px`;
        marqueeBoxRef.current.style.top = `${minY}px`;
        marqueeBoxRef.current.style.width = `${w}px`;
        marqueeBoxRef.current.style.height = `${h}px`;
      }

      if (w > 3 || h > 3) {
        hasMarqueeDraggedRef.current = true;
        const hitIds: string[] = [];
        for (const it of items) {
          if (it.type === "connector") {
            const geom = getArrowGeometry(it);
            const aMinX = Math.min(geom.sx, geom.ex, geom.cx);
            const aMaxX = Math.max(geom.sx, geom.ex, geom.cx);
            const aMinY = Math.min(geom.sy, geom.ey, geom.cy);
            const aMaxY = Math.max(geom.sy, geom.ey, geom.cy);
            if (aMaxX >= minX && aMinX <= maxX && aMaxY >= minY && aMinY <= maxY) {
              hitIds.push(it.id);
            }
          } else {
            const dim = getItemDimensions(it);
            const itemW = it.width || dim.width;
            const itemH = it.height || dim.height;
            const itemMinX = it.x;
            const itemMaxX = it.x + itemW;
            const itemMinY = it.y;
            const itemMaxY = it.y + itemH;
            if (itemMaxX >= minX && itemMinX <= maxX && itemMaxY >= minY && itemMinY <= maxY) {
              hitIds.push(it.id);
            }
          }
        }
        const prevHits = marqueeHitIdsRef.current;
        if (
          prevHits.length !== hitIds.length ||
          !hitIds.every((id) => prevHits.includes(id))
        ) {
          marqueeHitIdsRef.current = hitIds;
          setSelectedItemIds(hitIds);
          if (hitIds.length === 1) {
            setSelectedItemId(hitIds[0]);
          } else {
            setSelectedItemId(null);
          }
        }
      }
      return;
    }

    // 1. Handling Arrow Endpoint Drag (Start or End)
    if (draggingArrowPoint) {
      isInteractingRef.current = true;
      const arrowIndex = items.findIndex((it) => it.id === draggingArrowPoint.arrowId);
      if (arrowIndex === -1) return;

      const newItems = [...items];
      const updated = { ...newItems[arrowIndex] };

      let ptX = snapToGridRef.current ? Math.round(coords.x / 24) * 24 : Math.round(coords.x);
      let ptY = snapToGridRef.current ? Math.round(coords.y / 24) * 24 : Math.round(coords.y);

      // Magnetic Anchor Snapping to Shapes, Text boxes, Notes, Images
      let snappedAnchor: { itemId: string; position: AnchorPosition; x: number; y: number } | null = null;
      let minDistance = 28; // Snap radius in canvas pixels

      for (const otherItem of items) {
        if (otherItem.id === updated.id || otherItem.type === "connector") continue;
        const positions: AnchorPosition[] = ["top", "right", "bottom", "left"];
        for (const pos of positions) {
          const anchorPt = getAnchorCoordinates(otherItem, pos);
          const dist = Math.hypot(coords.x - anchorPt.x, coords.y - anchorPt.y);
          if (dist < minDistance) {
            minDistance = dist;
            snappedAnchor = {
              itemId: otherItem.id,
              position: pos,
              x: anchorPt.x,
              y: anchorPt.y,
            };
          }
        }
      }

      if (snappedAnchor) {
        ptX = snappedAnchor.x;
        ptY = snappedAnchor.y;
        setActiveAnchorSnap(snappedAnchor);
        if (draggingArrowPoint.endpoint === "start") {
          updated.startX = ptX;
          updated.startY = ptY;
          updated.startAnchor = { itemId: snappedAnchor.itemId, position: snappedAnchor.position };
        } else {
          updated.endX = ptX;
          updated.endY = ptY;
          updated.endAnchor = { itemId: snappedAnchor.itemId, position: snappedAnchor.position };
        }
      } else {
        setActiveAnchorSnap(null);
        if (draggingArrowPoint.endpoint === "start") {
          updated.startX = ptX;
          updated.startY = ptY;
          updated.startAnchor = undefined;
        } else {
          updated.endX = ptX;
          updated.endY = ptY;
          updated.endAnchor = undefined;
        }
      }

      newItems[arrowIndex] = updated;
      setItems(newItems);
      itemsRef.current = newItems;
      return;
    }

    // 2. Handling Arrow Curve Apex Dragging
    if (draggingArrowCurve) {
      isInteractingRef.current = true;
      const arrowIndex = items.findIndex((it) => it.id === draggingArrowCurve.arrowId);
      if (arrowIndex === -1) return;

      const arrow = items[arrowIndex];
      const sx = typeof arrow.startX === "number" && Number.isFinite(arrow.startX) ? arrow.startX : 0;
      const sy = typeof arrow.startY === "number" && Number.isFinite(arrow.startY) ? arrow.startY : 0;
      const ex = typeof arrow.endX === "number" && Number.isFinite(arrow.endX) ? arrow.endX : 0;
      const ey = typeof arrow.endY === "number" && Number.isFinite(arrow.endY) ? arrow.endY : 0;
      const midX = (sx + ex) / 2;
      const midY = (sy + ey) / 2;

      // Quadratic bezier curve midpoint: curveMid = 0.5*mid + 0.5*controlPoint => controlPoint = 2*curveMid - mid
      const targetCx = 2 * coords.x - midX;
      const targetCy = 2 * coords.y - midY;
      const newCx = snapToGridRef.current ? Math.round(targetCx / 24) * 24 : Math.round(targetCx);
      const newCy = snapToGridRef.current ? Math.round(targetCy / 24) * 24 : Math.round(targetCy);

      const newItems = [...items];
      newItems[arrowIndex] = {
        ...arrow,
        isCurved: true,
        controlX: newCx,
        controlY: newCy,
      };
      setItems(newItems);
      itemsRef.current = newItems;
      return;
    }

    // 3. Handling Entire Arrow Translation
    if (draggingArrowMove) {
      isInteractingRef.current = true;
      const arrowIndex = items.findIndex((it) => it.id === draggingArrowMove.arrowId);
      if (arrowIndex === -1) return;

      let dx = coords.x - draggingArrowMove.startMouseX;
      let dy = coords.y - draggingArrowMove.startMouseY;
      if (snapToGridRef.current) {
        dx = Math.round(dx / 24) * 24;
        dy = Math.round(dy / 24) * 24;
      }

      const newItems = [...items];
      const cur = newItems[arrowIndex];
      newItems[arrowIndex] = {
        ...cur,
        startX: Math.round(draggingArrowMove.origStartX + dx),
        startY: Math.round(draggingArrowMove.origStartY + dy),
        endX: Math.round(draggingArrowMove.origEndX + dx),
        endY: Math.round(draggingArrowMove.origEndY + dy),
        startAnchor: undefined,
        endAnchor: undefined,
        controlX:
          draggingArrowMove.origControlX !== undefined
            ? Math.round(draggingArrowMove.origControlX + dx)
            : cur.controlX,
        controlY:
          draggingArrowMove.origControlY !== undefined
            ? Math.round(draggingArrowMove.origControlY + dy)
            : cur.controlY,
      };
      setItems(newItems);
      itemsRef.current = newItems;
      return;
    }

    // 4. Handling Item Resizing (Shape, Image, Note)
    if (resizingState) {
      isInteractingRef.current = true;
      const itemIndex = items.findIndex((it) => it.id === resizingState.itemId);
      if (itemIndex === -1) return;

      const dx = coords.x - resizingState.startMouseX;
      const dy = coords.y - resizingState.startMouseY;

      const curItem = items[itemIndex];
      const isCircle = curItem.shapeType === "circle";

      let nextWidth = resizingState.startWidth;
      let nextHeight = resizingState.startHeight;

      if (resizingState.handle === "se" || resizingState.handle === "e") {
        const rawW = resizingState.startWidth + dx;
        const minW = curItem.type === "link" ? 180 : 90;
        nextWidth = Math.max(minW, snapToGridRef.current ? Math.round(rawW / 24) * 24 : Math.round(rawW));
      }
      if (resizingState.handle === "se" || resizingState.handle === "s") {
        const rawH = resizingState.startHeight + dy;
        const minH = curItem.type === "link" ? 90 : 70;
        nextHeight = Math.max(minH, snapToGridRef.current ? Math.round(rawH / 24) * 24 : Math.round(rawH));
      }

      const isSquare = curItem.type === "link" && curItem.linkFormat === "square";
      if (isCircle || (isSquare && resizingState.handle === "se")) {
        // Keep circle or square proportional
        const size = Math.max(nextWidth, nextHeight);
        nextWidth = size;
        nextHeight = size;
      }

      const resizedItem = {
        ...curItem,
        width: nextWidth,
        height: nextHeight,
      };

      const newItems = items.map((it) => {
        if (it.id === resizingState.itemId) {
          return resizedItem;
        }
        if (it.type === "connector") {
          let updatedConn = it;
          let changed = false;
          if (it.startAnchor?.itemId === resizingState.itemId) {
            const startPt = getAnchorCoordinates(resizedItem, it.startAnchor.position);
            updatedConn = { ...updatedConn, startX: startPt.x, startY: startPt.y };
            changed = true;
          }
          if (it.endAnchor?.itemId === resizingState.itemId) {
            const endPt = getAnchorCoordinates(resizedItem, it.endAnchor.position);
            updatedConn = { ...updatedConn, endX: endPt.x, endY: endPt.y };
            changed = true;
          }
          return changed ? updatedConn : it;
        }
        return it;
      });

      setItems(newItems);
      itemsRef.current = newItems;
      return;
    }

    // 4.9 Handling Multi-Item Dragging (moving multiple selected items together)
    if (draggingId && multiDragStartRef.current) {
      isInteractingRef.current = true;
      let dx = coords.x - multiDragStartRef.current.startMouseX;
      let dy = coords.y - multiDragStartRef.current.startMouseY;
      if (snapToGridRef.current) {
        dx = Math.round(dx / 24) * 24;
        dy = Math.round(dy / 24) * 24;
      } else {
        dx = Math.round(dx);
        dy = Math.round(dy);
      }

      const initialMap = new Map(
        multiDragStartRef.current.initialItems.map((it) => [it.id, it])
      );
      const movedIds = new Set(
        multiDragStartRef.current.initialItems.map((it) => it.id)
      );

      const newItems = items.map((it) => {
        const init = initialMap.get(it.id);
        if (init) {
          if (it.type === "connector") {
            return {
              ...it,
              startX: Math.round((init.startX ?? 0) + dx),
              startY: Math.round((init.startY ?? 0) + dy),
              endX: Math.round((init.endX ?? 0) + dx),
              endY: Math.round((init.endY ?? 0) + dy),
              controlX: init.controlX !== undefined ? Math.round(init.controlX + dx) : undefined,
              controlY: init.controlY !== undefined ? Math.round(init.controlY + dy) : undefined,
            };
          } else {
            return {
              ...it,
              x: Math.round(init.x + dx),
              y: Math.round(init.y + dy),
            };
          }
        }

        // Keep anchored connectors attached to moved host item
        if (it.type === "connector") {
          let updatedConn = it;
          let changed = false;
          if (it.startAnchor && movedIds.has(it.startAnchor.itemId)) {
            const hostInit = initialMap.get(it.startAnchor.itemId);
            const hostItem = items.find((h) => h.id === it.startAnchor!.itemId);
            if (hostItem && hostInit) {
              const simulatedHost = { ...hostItem, x: Math.round(hostInit.x + dx), y: Math.round(hostInit.y + dy) };
              const pt = getAnchorCoordinates(simulatedHost, it.startAnchor.position);
              updatedConn = { ...updatedConn, startX: pt.x, startY: pt.y };
              changed = true;
            }
          }
          if (it.endAnchor && movedIds.has(it.endAnchor.itemId)) {
            const hostInit = initialMap.get(it.endAnchor.itemId);
            const hostItem = items.find((h) => h.id === it.endAnchor!.itemId);
            if (hostItem && hostInit) {
              const simulatedHost = { ...hostItem, x: Math.round(hostInit.x + dx), y: Math.round(hostInit.y + dy) };
              const pt = getAnchorCoordinates(simulatedHost, it.endAnchor.position);
              updatedConn = { ...updatedConn, endX: pt.x, endY: pt.y };
              changed = true;
            }
          }
          return changed ? updatedConn : it;
        }

        return it;
      });

      setItems(newItems);
      itemsRef.current = newItems;
      return;
    }

    // 5. Handling General Single Item Dragging (Shape, Text Box, Note, Image)
    if (draggingId) {
      isInteractingRef.current = true;
      const itemIndex = items.findIndex((it) => it.id === draggingId);
      if (itemIndex === -1) return;

      const currentItem = items[itemIndex];
      if (currentItem.type === "connector") return;

      let newX = coords.x - dragOffset.x;
      let newY = coords.y - dragOffset.y;
      if (snapToGridRef.current) {
        newX = Math.round(newX / 24) * 24;
        newY = Math.round(newY / 24) * 24;
      } else {
        newX = Math.round(newX);
        newY = Math.round(newY);
      }

      const movedItem = {
        ...currentItem,
        x: newX,
        y: newY,
      };

      // Keep anchored connectors attached and moving along with the element
      const newItems = items.map((it) => {
        if (it.id === draggingId) {
          return movedItem;
        }
        if (it.type === "connector") {
          let updatedConn = it;
          let changed = false;

          if (it.startAnchor?.itemId === draggingId) {
            const startPt = getAnchorCoordinates(movedItem, it.startAnchor.position);
            updatedConn = {
              ...updatedConn,
              startX: startPt.x,
              startY: startPt.y,
            };
            changed = true;
          }
          if (it.endAnchor?.itemId === draggingId) {
            const endPt = getAnchorCoordinates(movedItem, it.endAnchor.position);
            updatedConn = {
              ...updatedConn,
              endX: endPt.x,
              endY: endPt.y,
            };
            changed = true;
          }
          if (changed && it.isCurved && it.controlX !== undefined && it.controlY !== undefined) {
            if (it.startAnchor?.itemId === draggingId && it.endAnchor?.itemId === draggingId) {
              const dx = newX - currentItem.x;
              const dy = newY - currentItem.y;
              updatedConn = {
                ...updatedConn,
                controlX: Math.round(it.controlX + dx),
                controlY: Math.round(it.controlY + dy),
              };
            }
          }
          return updatedConn;
        }
        return it;
      });

      setItems(newItems);
      itemsRef.current = newItems;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    processMouseMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      persistCanvasTransform(panRef.current.x, panRef.current.y, zoomRef.current);
    }
    if (isInteractingRef.current) {
      isInteractingRef.current = false;
      updateBoardItems(itemsRef.current);
    }
    if (isMarqueeActiveRef.current) {
      const m = marqueeRef.current;
      const dist = m ? Math.hypot(m.currentX - m.startX, m.currentY - m.startY) : 0;
      isMarqueeActiveRef.current = false;
      if (marqueeBoxRef.current) {
        marqueeBoxRef.current.style.display = "none";
      }
      setMarquee(null);
      marqueeRef.current = null;
      marqueeHitIdsRef.current = [];
      if (dist < 5 && !hasMarqueeDraggedRef.current) {
        setSelectedItemIds([]);
        setSelectedItemId(null);
        setSelectedArrowId(null);
      }
    }
    multiDragStartRef.current = null;
    setDraggingId(null);
    setDraggingArrowPoint(null);
    setDraggingArrowCurve(null);
    setDraggingArrowMove(null);
    setResizingState(null);
    setActiveAnchorSnap(null);
  };

  // Global window listeners to ensure stretching arrows/curves and dragging never drops
  useEffect(() => {
    const isInteracting =
      isPanning ||
      isMarqueeActiveRef.current ||
      !!multiDragStartRef.current ||
      !!draggingArrowPoint ||
      !!draggingArrowCurve ||
      !!draggingArrowMove ||
      !!resizingState ||
      !!draggingId;

    if (!isInteracting) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      processMouseMove(e.clientX, e.clientY);
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
  }, [
    isPanning,
    draggingArrowPoint,
    draggingArrowCurve,
    draggingArrowMove,
    resizingState,
    draggingId,
    panStart,
    items,
    dragOffset,
  ]);

  // Color change handler for active palette & selected arrow / item / multi-selection
  const handleColorChange = (newColor: string, immediate = false) => {
    if (rafColorRef.current) {
      cancelAnimationFrame(rafColorRef.current);
      rafColorRef.current = null;
    }

    if (pendingColorSaveTimerRef.current) {
      clearTimeout(pendingColorSaveTimerRef.current);
      pendingColorSaveTimerRef.current = null;
    }

    const applyChange = () => {
      setActiveColor(newColor);
      setCustomColor(newColor);

      let hasChange = false;
      const currentList = itemsRef.current;
      let newItems = currentList;

      const targetIds =
        selectedItemIdsRef.current.length > 0
          ? selectedItemIdsRef.current
          : selectedItemId
          ? [selectedItemId]
          : selectedArrowId
          ? [selectedArrowId]
          : [];

      if (targetIds.length > 0) {
        hasChange = true;
        const targetSet = new Set(targetIds);
        newItems = newItems.map((it) => {
          if (targetSet.has(it.id)) {
            if (it.type === "shape") {
              const isNoFill =
                it.backgroundColor === "transparent" || it.backgroundColor === "none";
              return {
                ...it,
                backgroundColor: isNoFill ? "transparent" : newColor,
                borderColor: newColor,
                textColor: isNoFill ? newColor : getContrastColor(newColor),
              };
            }
            if (it.type === "note") {
              return { ...it, color: newColor };
            }
            if (it.type === "text") {
              return { ...it, textColor: newColor };
            }
            if (it.type === "connector") {
              return { ...it, arrowColor: newColor };
            }
          }
          return it;
        });
      }

      if (hasChange) {
        setItems(newItems);
        itemsRef.current = newItems;

        if (immediate) {
          updateBoardItems(newItems);
        } else {
          pendingColorSaveTimerRef.current = setTimeout(() => {
            updateBoardItems(newItems);
          }, 250);
        }
      }
    };

    if (immediate) {
      applyChange();
    } else {
      rafColorRef.current = requestAnimationFrame(applyChange);
    }
  };

  // Lightbox images list
  const boardImagesList = useMemo(() => {
    return items
      .filter((it) => it.type === "image" && it.imageUrl)
      .map((it) => ({
        id: it.id,
        url: it.imageUrl!,
        caption: it.caption || "Imagen de pizarra",
        createdAt: new Date().toISOString(),
      }));
  }, [items]);

  // Active selected item for toolbar contextual tools & unified color picker
  const activeSelectedItem = useMemo(() => {
    if (selectedItemIds.length > 0) {
      return items.find((it) => it.id === selectedItemIds[0]) || null;
    }
    return items.find((it) => it.id === selectedItemId || it.id === selectedArrowId) || null;
  }, [items, selectedItemId, selectedArrowId, selectedItemIds]);

  const currentSelectionColor = useMemo(() => {
    if (!activeSelectedItem) return activeColor;
    if (activeSelectedItem.type === "shape") {
      const isNoFill = activeSelectedItem.backgroundColor === "transparent" || activeSelectedItem.backgroundColor === "none";
      return (isNoFill ? activeSelectedItem.borderColor : activeSelectedItem.backgroundColor) || activeColor;
    }
    if (activeSelectedItem.type === "note") return activeSelectedItem.color || activeColor;
    if (activeSelectedItem.type === "text") return activeSelectedItem.textColor || activeColor;
    if (activeSelectedItem.type === "connector") return activeSelectedItem.arrowColor || activeColor;
    return activeColor;
  }, [activeSelectedItem, activeColor]);

  // Calculated bounding box covering all items in multi-selection
  const multiBoundingBox = useMemo(() => {
    if (selectedItemIds.length <= 1) return null;
    const selectedItems = items.filter((it) => selectedItemIds.includes(it.id));
    if (selectedItems.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const it of selectedItems) {
      if (it.type === "connector") {
        const geom = getArrowGeometry(it);
        minX = Math.min(minX, geom.sx, geom.ex, geom.cx);
        minY = Math.min(minY, geom.sy, geom.ey, geom.cy);
        maxX = Math.max(maxX, geom.sx, geom.ex, geom.cx);
        maxY = Math.max(maxY, geom.sy, geom.ey, geom.cy);
      } else {
        const w =
          it.width ||
          (it.type === "image" ? 320 : it.type === "note" ? 230 : it.type === "text" ? 260 : 200);
        const h =
          it.height ||
          (it.type === "image" ? 240 : it.type === "note" ? 180 : it.type === "text" ? 60 : 160);
        minX = Math.min(minX, it.x);
        minY = Math.min(minY, it.y);
        maxX = Math.max(maxX, it.x + w);
        maxY = Math.max(maxY, it.y + h);
      }
    }

    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;

    return {
      x: minX - 8,
      y: minY - 8,
      width: Math.max(40, maxX - minX + 16),
      height: Math.max(40, maxY - minY + 16),
    };
  }, [selectedItemIds, items]);

  return (
    <div
      id="visual-whiteboard-root"
      className="flex-1 flex flex-col min-h-0 h-full overflow-hidden select-none bg-[var(--bg-main)] text-[var(--text-main)] relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Reorganized Toolbar - Scrollable with Navigation Arrows for Embedded / Reduced Views */}
      <div className="relative flex items-center bg-[var(--bg-surface)] border-b border-[var(--border-color)] z-30 shrink-0 h-13 overflow-hidden">
        {/* Left Scroll Chevron Button with subtle gradient backdrop */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-40 flex items-center pl-1.5 pr-4 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface)]/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={() => scrollToolbar("left")}
              className="p-1.5 rounded-full bg-[var(--bg-card)] shadow-lg border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] hover:scale-110 active:scale-95 transition-all cursor-pointer pointer-events-auto"
              title="Desplazar barra de herramientas a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Toolbar Container */}
        <div
          ref={toolbarRef}
          id="whiteboard-toolbar"
          onScroll={checkToolbarScroll}
          className="w-full h-full px-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar touch-pan-x"
        >
        {/* Left: Tools & Controls Organized in Semantic Groups */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Entity Name Badge if in Entity Mode */}
          {entity && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] shrink-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entity.color || "#2563eb" }}
              />
              <span className="font-bold text-xs truncate max-w-[130px]">
                {entity.name}
              </span>
            </div>
          )}

          {/* Group 1: Basic Elements (Image, Note, Text) */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 font-bold text-xs shadow-2xs transition-all"
              title="Subir imagen a la pizarra (o pega con Ctrl+V)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Imagen</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUploadImage}
            />

            <button
              type="button"
              onClick={handleAddNote}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] transition-colors"
              title="Añadir nota adhesiva"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-500" />
              <span>Nota</span>
            </button>

            <button
              type="button"
              onClick={handleAddPlainText}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] transition-colors"
              title="Añadir cuadro de texto"
            >
              <Type className="w-3.5 h-3.5 text-purple-500" />
              <span>Texto</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingResourceItem(null);
                setIsAddResourceModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] transition-colors cursor-pointer"
              title="Añadir música (Spotify), enlace web o documento PDF"
            >
              <Link2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Enlace / Doc</span>
            </button>
          </div>

          {/* Group 2: Shapes (Rectangle & Circle, with Solid or No-Fill mode) */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1.5 pr-1">
              Formas
            </span>
            <button
              type="button"
              onClick={() => handleAddShape("rectangle", isNextShapeTransparent)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] transition-colors cursor-pointer"
              title={isNextShapeTransparent ? "Añadir rectángulo sin relleno (solo contorno)" : "Añadir rectángulo sólido"}
            >
              <Square className={`w-3.5 h-3.5 ${isNextShapeTransparent ? "text-blue-500 stroke-2" : "text-blue-500 fill-blue-500/20"}`} />
              <span className="hidden sm:inline">Rectángulo</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddShape("circle", isNextShapeTransparent)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] transition-colors cursor-pointer"
              title={isNextShapeTransparent ? "Añadir círculo sin relleno (solo contorno)" : "Añadir círculo sólido"}
            >
              <Circle className={`w-3.5 h-3.5 ${isNextShapeTransparent ? "text-emerald-500 stroke-2" : "text-emerald-500 fill-emerald-500/20"}`} />
              <span className="hidden sm:inline">Círculo</span>
            </button>
            {/* Quick Toggle for New Shapes Fill Mode */}
            <button
              type="button"
              onClick={() => setIsNextShapeTransparent((prev) => !prev)}
              className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border ml-0.5 ${
                isNextShapeTransparent
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-2xs font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent hover:bg-[var(--bg-card)]"
              }`}
              title={
                isNextShapeTransparent
                  ? "Modo: Sin relleno (activado). Las nuevas formas no tendrán fondo. Clic para cambiar a relleno sólido."
                  : "Modo: Con relleno sólido. Clic para crear formas sin relleno (transparentes con contorno)."
              }
            >
              {isNextShapeTransparent ? (
                <Ban className="w-3 h-3 text-amber-500" />
              ) : (
                <PaintBucket className="w-3 h-3 text-[var(--text-muted)]" />
              )}
              <span className="hidden lg:inline">{isNextShapeTransparent ? "Sin relleno" : "Relleno"}</span>
            </button>
          </div>

          {/* Group 3: Connectors & Lines */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1.5 pr-1">
              Conectores
            </span>
            <button
              type="button"
              onClick={() => handleAddArrow("arrow", false)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] transition-colors"
              title="Añadir flecha recta"
            >
              <MoveRight className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Flecha</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddArrow("curved-arrow", true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-card)] text-xs font-semibold text-purple-600 dark:text-purple-300 transition-colors"
              title="Añadir flecha curva con arco interactivo"
            >
              <Spline className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">Curva</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddArrow("line", false)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] transition-colors"
              title="Añadir línea simple"
            >
              <span className="w-3 h-0.5 bg-slate-400 rounded-full" />
              <span className="hidden md:inline">Línea</span>
            </button>
          </div>

          {/* Group 3.5: Clipboard Controls (Copy & Paste) */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => handleCopyItem()}
              disabled={!selectedItemId && !selectedArrowId}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedItemId || selectedArrowId
                  ? "hover:bg-[var(--bg-card)] text-[var(--text-main)] cursor-pointer"
                  : "opacity-40 text-[var(--text-muted)] cursor-not-allowed"
              }`}
              title={selectedItemId || selectedArrowId ? "Copiar elemento seleccionado (Ctrl+C)" : "Selecciona un elemento para copiar"}
            >
              <Copy className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden md:inline">Copiar</span>
            </button>
            <button
              type="button"
              onClick={handlePasteItem}
              disabled={!copiedItem}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                copiedItem
                  ? "hover:bg-[var(--bg-card)] text-[var(--text-main)] cursor-pointer"
                  : "opacity-40 text-[var(--text-muted)] cursor-not-allowed"
              }`}
              title={copiedItem ? "Pegar elemento en la pizarra (Ctrl+V)" : "No hay elementos en el portapapeles"}
            >
              <Clipboard className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden md:inline">Pegar</span>
            </button>
          </div>

          {/* Group 4: UNIFIED Master Color Picker */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[var(--bg-input)]/70 border border-[var(--border-color)]"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1 pr-1.5 border-r border-[var(--border-color)] mr-0.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/20"
                style={{ backgroundColor: currentSelectionColor }}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap hidden sm:inline">
                {activeSelectedItem ? "Color Selección" : "Color"}
              </span>
            </div>

            {PRESET_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorChange(c.hex, true);
                }}
                className={`w-5 h-5 rounded-full border transition-all shrink-0 ${
                  currentSelectionColor.toLowerCase() === c.hex.toLowerCase()
                    ? "ring-2 ring-[var(--accent)] scale-110 border-white shadow-xs z-10"
                    : "border-black/20 hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
                title={`${c.label} (${c.hex})`}
              />
            ))}

            {/* Circular Custom Color Picker */}
            <label
              className="relative w-5 h-5 rounded-full overflow-hidden border border-black/30 dark:border-white/30 shadow-2xs cursor-pointer block hover:scale-110 transition-transform shrink-0 ml-0.5"
              title="Selector de color libre personalizado"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="color"
                value={customColor}
                onInput={(e) => handleColorChange((e.target as HTMLInputElement).value, false)}
                onChange={(e) => handleColorChange((e.target as HTMLInputElement).value, true)}
                className="absolute -top-3 -left-3 w-12 h-12 cursor-pointer appearance-none border-0 p-0 bg-transparent rounded-full"
              />
            </label>
          </div>
        </div>

        {/* Right: Snap-to-Grid, Auto Arrange, Zoom & Canvas View Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Snap-to-Grid (Ajuste a la rejilla) Toggle */}
          <button
            type="button"
            onClick={toggleSnapToGrid}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              snapToGrid
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] shadow-xs"
                : "border-[var(--border-color)] hover:bg-[var(--bg-input)] text-[var(--text-main)]"
            }`}
            title={
              snapToGrid
                ? "Ajuste a la rejilla activado (24px) - Clic para desactivar"
                : "Activar ajuste a la rejilla (snap-to-grid) para alinear formas y textos automáticamente"
            }
          >
            <Magnet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rejilla</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                snapToGrid ? "bg-white animate-pulse" : "bg-zinc-400 dark:bg-zinc-500"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={handleAutoArrange}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-input)] text-xs font-semibold transition-colors cursor-pointer"
            title="Organizar imágenes en cuadrícula ordenada"
          >
            <Grid className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden md:inline">Ordenar</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs">
            <button
              type="button"
              onClick={() => {
                const z = Math.max(0.2, parseFloat((zoomRef.current - 0.1).toFixed(2)));
                applyCanvasTransform(panRef.current.x, panRef.current.y, z);
                persistCanvasTransform(panRef.current.x, panRef.current.y, z);
              }}
              className="p-1 hover:text-[var(--accent)] transition-colors"
              title="Reducir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold w-9 text-center text-[11px]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => {
                const z = Math.min(3.0, parseFloat((zoomRef.current + 0.1).toFixed(2)));
                applyCanvasTransform(panRef.current.x, panRef.current.y, z);
                persistCanvasTransform(panRef.current.x, panRef.current.y, z);
              }}
              className="p-1 hover:text-[var(--accent)] transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                applyCanvasTransform(0, 0, 1);
                persistCanvasTransform(0, 0, 1);
              }}
              className="p-1 hover:text-[var(--accent)] border-l border-[var(--border-color)] ml-0.5 transition-colors"
              title="Restablecer posición y zoom al 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Cerrar pizarra"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

        {/* Right Scroll Chevron Button with subtle gradient backdrop */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-40 flex items-center pr-1.5 pl-4 bg-gradient-to-l from-[var(--bg-surface)] via-[var(--bg-surface)]/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={() => scrollToolbar("right")}
              className="p-1.5 rounded-full bg-[var(--bg-card)] shadow-lg border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] hover:scale-110 active:scale-95 transition-all cursor-pointer pointer-events-auto"
              title="Desplazar barra de herramientas a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Interactive Canvas */}
      <div
        ref={containerRef}
        id="whiteboard-canvas"
        onMouseDown={handleCanvasMouseDown}
        onClick={handleCanvasClick}
        onMouseMove={(e) => {
          lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 min-h-0 relative overflow-hidden select-none overscroll-none touch-none ${
          isPanning ? "cursor-grabbing" : isSpacePressed ? "cursor-grab" : "cursor-default"
        }`}
        style={{
          backgroundImage: "radial-gradient(var(--border-color) 1.2px, transparent 1.2px)",
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Floating Multi-Selection Inspector Bar when multiple items are selected */}
        {selectedItemIds.length > 1 && !marquee && (
          <div
            id="whiteboard-multi-selection-bar"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-md shadow-2xl border border-[var(--accent)]/50 text-xs text-[var(--text-main)] animate-in fade-in slide-in-from-top-2 duration-150 max-w-[96vw] overflow-visible pointer-events-auto"
          >
            {/* Badge */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-[var(--border-color)] text-[var(--accent)] font-bold whitespace-nowrap">
              <Layers className="w-4 h-4" />
              <span>{selectedItemIds.length} seleccionados</span>
            </div>

            {/* Scale Together Controls */}
            <div className="flex items-center gap-1 bg-[var(--bg-input)] rounded-xl p-0.5 border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => handleScaleSelectedItems(0.85)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[var(--bg-card)] text-xs font-semibold transition-colors cursor-pointer"
                title="Reducir tamaño de todos los elementos seleccionados"
              >
                <Minus className="w-3 h-3 text-[var(--accent)]" />
                <span>Achicar</span>
              </button>
              <button
                type="button"
                onClick={() => handleScaleSelectedItems(1.15)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[var(--bg-card)] text-xs font-semibold transition-colors cursor-pointer"
                title="Aumentar tamaño de todos los elementos seleccionados"
              >
                <Plus className="w-3 h-3 text-[var(--accent)]" />
                <span>Agrandar</span>
              </button>
            </div>

            {/* Unified Color Palette for multi-selection */}
            <div className="flex items-center gap-1 pl-1 pr-2 border-r border-[var(--border-color)]">
              {PRESET_COLORS.map((c) => (
                <button
                  key={`multi-color-${c.hex}`}
                  type="button"
                  onClick={() => handleColorChange(c.hex, true)}
                  className="w-4 h-4 rounded-full border border-black/20 dark:border-white/20 hover:scale-125 transition-transform shrink-0 cursor-pointer"
                  style={{ backgroundColor: c.hex }}
                  title={`Cambiar color a ${c.label}`}
                />
              ))}
              <label
                className="relative w-4 h-4 rounded-full overflow-hidden border border-black/30 dark:border-white/30 shadow-2xs cursor-pointer block hover:scale-125 transition-transform shrink-0 ml-0.5"
                title="Color personalizado para la selección"
              >
                <input
                  type="color"
                  value={customColor}
                  onInput={(e) => handleColorChange((e.target as HTMLInputElement).value, false)}
                  onChange={(e) => handleColorChange((e.target as HTMLInputElement).value, true)}
                  className="absolute -top-3 -left-3 w-10 h-10 cursor-pointer appearance-none border-0 p-0 bg-transparent rounded-full"
                />
              </label>
            </div>

            {/* Duplicate All */}
            <button
              type="button"
              onClick={handleDuplicateMulti}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[var(--bg-input)] text-xs font-semibold transition-colors cursor-pointer"
              title="Duplicar elementos seleccionados"
            >
              <Copy className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline">Duplicar</span>
            </button>

            {/* Delete All */}
            <button
              type="button"
              onClick={handleDeleteMulti}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
              title="Eliminar elementos seleccionados (Supr)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Deselect */}
            <button
              type="button"
              onClick={() => {
                setSelectedItemIds([]);
                setSelectedItemId(null);
                setSelectedArrowId(null);
              }}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Deseleccionar todo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Contextual Inspector Bar for Selected Item (Floats smoothly over canvas, ZERO displacement) */}
        {selectedItemIds.length <= 1 && activeSelectedItem && (
          <div
            id="whiteboard-floating-selection-bar"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-md shadow-2xl border border-[var(--border-color)] text-xs text-[var(--text-main)] animate-in fade-in slide-in-from-top-2 duration-150 max-w-[96vw] overflow-visible pointer-events-auto"
          >
            {/* Item type badge */}
            <div className="flex items-center gap-1.5 pr-1.5 border-r border-[var(--border-color)] text-[var(--accent)] font-bold text-xs whitespace-nowrap">
              {activeSelectedItem.type === "connector" && (activeSelectedItem.isCurved ? <Spline className="w-3.5 h-3.5" /> : <MoveRight className="w-3.5 h-3.5" />)}
              {activeSelectedItem.type === "shape" && (activeSelectedItem.shapeType === "circle" ? <Circle className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />)}
              {activeSelectedItem.type === "note" && <StickyNote className="w-3.5 h-3.5" />}
              {activeSelectedItem.type === "text" && <Type className="w-3.5 h-3.5" />}
              {activeSelectedItem.type === "image" && <ImageIcon className="w-3.5 h-3.5" />}
              {activeSelectedItem.type === "link" && <Link2 className="w-3.5 h-3.5" />}
              <span className="capitalize">
                {activeSelectedItem.type === "connector"
                  ? (activeSelectedItem.isCurved ? "Curva" : "Flecha")
                  : activeSelectedItem.type === "shape"
                  ? (activeSelectedItem.shapeType === "circle" ? "Círculo" : "Rectángulo")
                  : activeSelectedItem.type === "text"
                  ? "Texto"
                  : activeSelectedItem.type === "note"
                  ? "Nota"
                  : activeSelectedItem.type === "link"
                  ? (activeSelectedItem.linkType === "spotify"
                      ? "Spotify"
                      : activeSelectedItem.linkType === "youtube"
                      ? "YouTube"
                      : activeSelectedItem.linkType === "document"
                      ? (activeSelectedItem.fileType?.toUpperCase() || "Documento")
                      : "Enlace Web")
                  : "Imagen"}
              </span>
            </div>

            {/* Resource Card Controls (Format, Embed, Document View, Edit Modal) */}
            {activeSelectedItem.type === "link" && (() => {
              const isSquare = activeSelectedItem.linkFormat === "square";
              const isSpotify = activeSelectedItem.linkType === "spotify";
              const isYouTube = activeSelectedItem.linkType === "youtube";
              const isDoc = activeSelectedItem.linkType === "document" || !!activeSelectedItem.fileData;

              return (
                <div className="flex items-center gap-1.5">
                  {/* Format Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextFormat = isSquare ? "rectangle" : "square";
                      const nextW = nextFormat === "square" ? 280 : 360;
                      const nextH = nextFormat === "square" ? 280 : activeSelectedItem.embedMode ? 190 : 130;
                      handleUpdateItem(activeSelectedItem.id, {
                        linkFormat: nextFormat,
                        width: nextW,
                        height: nextH,
                      });
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                    title={isSquare ? "Cambiar a formato horizontal" : "Cambiar a formato cuadrado"}
                  >
                    {isSquare ? <Square className="w-3 h-3 text-[var(--accent)]" /> : <Maximize2 className="w-3 h-3" />}
                    <span>{isSquare ? "Cuadrado" : "Rectangular"}</span>
                  </button>

                  {/* Audio / Video Embed Player Toggle */}
                  {(isSpotify || isYouTube) && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextEmbed = !activeSelectedItem.embedMode;
                        let nextH = activeSelectedItem.height || (isSquare ? 280 : 130);
                        if (nextEmbed) {
                          nextH = isSquare ? (isSpotify ? 352 : 280) : isSpotify ? 190 : 225;
                        } else {
                          nextH = isSquare ? 280 : 130;
                        }
                        handleUpdateItem(activeSelectedItem.id, {
                          embedMode: nextEmbed,
                          height: nextH,
                        });
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        activeSelectedItem.embedMode
                          ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-bold"
                          : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      }`}
                      title={activeSelectedItem.embedMode ? "Alternar a ficha compacta" : "Activar reproductor integrado"}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{activeSelectedItem.embedMode ? "Ficha" : "Reproductor"}</span>
                    </button>
                  )}

                  {/* Document View Button */}
                  {isDoc && activeSelectedItem.fileData && (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewPdfData({
                          fileData: activeSelectedItem.fileData!,
                          fileName: activeSelectedItem.fileName || activeSelectedItem.title || "documento.pdf",
                        })
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                      title="Abrir en el visor de documentos"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver</span>
                    </button>
                  )}

                  {/* Edit Resource Modal Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingResourceItem(activeSelectedItem);
                      setIsAddResourceModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                    title="Editar detalles del recurso"
                  >
                    <Edit2 className="w-3 h-3 text-[var(--accent)]" />
                    <span>Editar</span>
                  </button>
                </div>
              );
            })()}

            {/* Shape Fill Toggle (Single unified button for solid or no-fill outline) */}
            {activeSelectedItem.type === "shape" && (
              <button
                type="button"
                onClick={() => handleToggleShapeFill(activeSelectedItem.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  activeSelectedItem.backgroundColor === "transparent" || activeSelectedItem.backgroundColor === "none"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-2xs"
                    : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)]"
                }`}
                title={
                  activeSelectedItem.backgroundColor === "transparent" || activeSelectedItem.backgroundColor === "none"
                    ? "Forma sin relleno (solo contorno). Clic para rellenar con color."
                    : "Hacer forma sin relleno (solo contorno transparente)."
                }
              >
                {activeSelectedItem.backgroundColor === "transparent" || activeSelectedItem.backgroundColor === "none" ? (
                  <Ban className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <PaintBucket className="w-3.5 h-3.5 text-[var(--accent)]" />
                )}
                <span>
                  {activeSelectedItem.backgroundColor === "transparent" || activeSelectedItem.backgroundColor === "none"
                    ? "Sin relleno"
                    : "Con relleno"}
                </span>
              </button>
            )}

            {/* Text Alignment Controls for Text Box & Shape */}
            {(activeSelectedItem.type === "text" || activeSelectedItem.type === "shape") && (
              <div className="flex items-center bg-[var(--bg-input)] rounded-lg p-0.5 border border-[var(--border-color)]">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleSetTextAlign(activeSelectedItem.id, "left")}
                  className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                    (activeSelectedItem.textAlign || (activeSelectedItem.type === "text" ? "left" : "center")) === "left"
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                  title="Alinear texto a la izquierda"
                >
                  <AlignLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleSetTextAlign(activeSelectedItem.id, "center")}
                  className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                    (activeSelectedItem.textAlign || (activeSelectedItem.type === "text" ? "left" : "center")) === "center"
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                  title="Centrar texto"
                >
                  <AlignCenter className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleSetTextAlign(activeSelectedItem.id, "right")}
                  className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                    activeSelectedItem.textAlign === "right"
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                  title="Alinear texto a la derecha"
                >
                  <AlignRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Font Size Controls for Text Box */}
            {activeSelectedItem.type === "text" && (() => {
              const currentItemFontSize =
                selectedTextFontSize !== null ? selectedTextFontSize : (activeSelectedItem.fontSize || 18);
              const step = currentItemFontSize >= 32 ? 4 : 2;
              return (
                <div className="flex items-center bg-[var(--bg-input)] rounded-lg p-0.5 border border-[var(--border-color)]">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetTextFontSize(activeSelectedItem.id, Math.max(8, currentItemFontSize - step));
                    }}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded hover:bg-[var(--bg-card)] cursor-pointer"
                    title="Reducir tamaño del texto"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <div className="flex items-center px-1">
                    <input
                      type="number"
                      min={8}
                      max={240}
                      value={currentItemFontSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          handleSetTextFontSize(activeSelectedItem.id, val);
                        }
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="w-7 text-center text-xs font-bold bg-transparent text-[var(--text-main)] focus:outline-none focus:bg-[var(--bg-card)] rounded py-0.5 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      title={hasActiveTextSelection ? "Tamaño del texto seleccionado" : "Tamaño del cuadro de texto"}
                    />
                    <span className="text-[10px] font-medium text-[var(--text-muted)] pointer-events-none select-none">
                      px
                    </span>
                  </div>

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetTextFontSize(activeSelectedItem.id, Math.min(240, currentItemFontSize + step));
                    }}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded hover:bg-[var(--bg-card)] cursor-pointer"
                    title="Aumentar tamaño del texto"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              );
            })()}

            {/* Arrow Connector Modifiers (Caps, Stroke width, Dashed, Curved) */}
            {activeSelectedItem.type === "connector" && (() => {
              const startCap = activeSelectedItem.startCap || "none";
              const defaultEnd = (activeSelectedItem.connectorType === "line" || activeSelectedItem.connectorType === "curved-line") ? "none" : "arrow";
              const endCap = activeSelectedItem.endCap || defaultEnd;
              const isDashed = activeSelectedItem.isDashed || activeSelectedItem.connectorType === "dashed";
              const strokeW = activeSelectedItem.strokeWidth || 2.8;
              const strokeLabel = strokeW < 2 ? "Fino" : strokeW > 4 ? "Grueso" : "Normal";

              return (
                <div className="flex items-center gap-1">
                  {/* Curvature Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleArrowCurved(activeSelectedItem.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      activeSelectedItem.isCurved
                        ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/40"
                        : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    }`}
                    title="Alternar entre recta o curva interactiva"
                  >
                    <Spline className="w-3.5 h-3.5" />
                    <span>{activeSelectedItem.isCurved ? "Curva" : "Recta"}</span>
                  </button>

                  {/* Start Cap Cycle */}
                  <button
                    type="button"
                    onClick={() => handleCycleArrowStartCap(activeSelectedItem.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)] cursor-pointer"
                    title="Inicio: Clic para alternar (Plano / Flecha / Punto)"
                  >
                    <ArrowLeft className="w-3 h-3 text-[var(--accent)]" />
                    <span>{startCap === "none" ? "Plano" : startCap === "arrow" ? "Flecha" : "Punto"}</span>
                  </button>

                  {/* End Cap Cycle */}
                  <button
                    type="button"
                    onClick={() => handleCycleArrowEndCap(activeSelectedItem.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)] cursor-pointer"
                    title="Fin: Clic para alternar (Flecha / Punto / Plano)"
                  >
                    <ArrowRight className="w-3 h-3 text-[var(--accent)]" />
                    <span>{endCap === "none" ? "Plano" : endCap === "arrow" ? "Flecha" : "Punto"}</span>
                  </button>

                  {/* Stroke Width */}
                  <button
                    type="button"
                    onClick={() => handleCycleArrowStrokeWidth(activeSelectedItem.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)] cursor-pointer"
                    title="Grosor: Clic para alternar (Fino 1.5px / Normal 2.8px / Grueso 4.5px)"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-[var(--accent)]" />
                    <span>{strokeLabel}</span>
                  </button>

                  {/* Dashed Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleArrowDashed(activeSelectedItem.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      isDashed
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40"
                        : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    }`}
                    title="Alternar trazo sólido / punteado"
                  >
                    <span className="font-mono text-xs">{isDashed ? "Punteada" : "Sólida"}</span>
                  </button>
                </div>
              );
            })()}

            {/* Shape: Clear text button if has label */}
            {activeSelectedItem.type === "shape" && activeSelectedItem.label && (
              <button
                type="button"
                onClick={() => handleClearShapeText(activeSelectedItem.id)}
                className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                title="Limpiar texto de la forma"
              >
                Borrar texto
              </button>
            )}

            {/* Image Caption Toggle */}
            {activeSelectedItem.type === "image" && (
              <button
                type="button"
                onClick={() => handleToggleHideCaption(activeSelectedItem.id)}
                className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 cursor-pointer"
                title="Mostrar u ocultar nombre de la imagen"
              >
                {activeSelectedItem.hideCaption ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{activeSelectedItem.hideCaption ? "Ver nombre" : "Ocultar"}</span>
              </button>
            )}

            {/* Copy Selected Item */}
            <button
              type="button"
              onClick={() => handleCopyItem(activeSelectedItem)}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors cursor-pointer"
              title="Copiar elemento seleccionado (Ctrl+C)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Layer Management Dropdown */}
            <div className="relative layer-dropdown-container z-[10001]">
              <button
                type="button"
                onClick={() =>
                  setActiveLayerMenuId(
                    activeLayerMenuId === activeSelectedItem.id ? null : activeSelectedItem.id
                  )
                }
                className="layer-dropdown-trigger flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                title="Gestionar capas y profundidad"
              >
                <Layers className="w-3 h-3 text-[var(--accent)]" />
                <span className="hidden sm:inline">Capas</span>
                <ChevronDown className="w-2.5 h-2.5 text-[var(--text-muted)]" />
              </button>

              {activeLayerMenuId === activeSelectedItem.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full right-0 mt-1.5 w-52 py-1.5 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] z-[100002] text-xs text-[var(--text-main)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleBringToFront(activeSelectedItem.id);
                      setActiveLayerMenuId(null);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BringToFront className="w-3.5 h-3.5 text-[var(--accent)]" /> Traer al frente
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Ctrl+Shift+]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleBringForward(activeSelectedItem.id);
                      setActiveLayerMenuId(null);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ChevronUp className="w-3.5 h-3.5" /> Subir una capa
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Ctrl+]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSendBackward(activeSelectedItem.id);
                      setActiveLayerMenuId(null);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ChevronDown className="w-3.5 h-3.5" /> Bajar una capa
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Ctrl+[</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSendToBack(activeSelectedItem.id);
                      setActiveLayerMenuId(null);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <SendToBack className="w-3.5 h-3.5" /> Enviar al fondo
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Ctrl+Shift+[</span>
                  </button>
                </div>
              )}
            </div>

            {/* Delete Selected Item */}
            <button
              type="button"
              onClick={() => handleDeleteItem(activeSelectedItem.id)}
              className="p-1 rounded-lg text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
              title="Eliminar elemento seleccionado (Supr)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Deselect button */}
            <button
              type="button"
              onClick={() => {
                setSelectedItemId(null);
                setSelectedArrowId(null);
              }}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Deseleccionar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {/* Navigation hint pill for trackpad and mouse */}
        <div className="absolute bottom-3 left-4 z-20 pointer-events-none hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--bg-card)]/85 backdrop-blur-md border border-[var(--border-color)]/70 text-[10px] text-[var(--text-muted)] select-none shadow-xs">
          <span>Pellizcar o Ctrl+Rueda: Zoom suave</span>
          <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
          <span>2 dedos o Espacio+Arrastrar: Desplazar</span>
        </div>
        <div
          ref={canvasWorldRef}
          id="canvas-world"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: "0 0",
            width: "6000px",
            height: "4500px",
            position: "relative",
            overflow: "visible",
            willChange: isPanning || isInteractingRef.current ? "transform" : "auto",
          }}
        >
          {/* Visual Multi-Selection Bounding Box Frame (Instant zero-latency tracking) */}
          {multiBoundingBox && !marquee && (
            <div
              className="absolute pointer-events-none rounded-2xl border-2 border-dashed border-[var(--accent)] bg-[var(--accent)]/5 z-40 transition-none"
              style={{
                left: `${multiBoundingBox.x}px`,
                top: `${multiBoundingBox.y}px`,
                width: `${multiBoundingBox.width}px`,
                height: `${multiBoundingBox.height}px`,
              }}
            >
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const firstItemId = selectedItemIds[0];
                  const firstItem = items.find((it) => it.id === firstItemId);
                  if (firstItem) {
                    handleMouseDownItem(e, firstItem);
                  }
                }}
                className="absolute -top-6 left-2 px-2 py-0.5 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-[10px] font-bold shadow-xs whitespace-nowrap pointer-events-auto cursor-grab active:cursor-grabbing select-none"
                title="Arrastra para mover toda la selección"
              >
                {selectedItemIds.length} elementos seleccionados
              </div>
            </div>
          )}

          {/* Marquee Selection Drag Box (Direct DOM Hardware Rendered for Zero Input Lag) */}
          <div
            ref={marqueeBoxRef}
            id="whiteboard-marquee-box"
            className="absolute pointer-events-none z-[10000] border-2 border-[var(--accent)] bg-[var(--accent)]/15 rounded-lg shadow-sm"
            style={{
              display: "none",
              left: 0,
              top: 0,
              width: 0,
              height: 0,
            }}
          />

          {/* SVG Overlay for Arrows and Lines: expanded to 100,000px with -50,000 origin to prevent any clipping or disappearing when stretched */}
          <svg
            className="pointer-events-none"
            style={{
              position: "absolute",
              left: "-50000px",
              top: "-50000px",
              width: "100000px",
              height: "100000px",
              zIndex: 10,
              overflow: "visible",
            }}
            viewBox="-50000 -50000 100000 100000"
          >
            <defs>
              {items
                .filter((it) => it.type === "connector")
                .map((arrow) => {
                  const arrowFill = arrow.arrowColor || activeColor || "#2563eb";
                  return (
                    <React.Fragment key={`arrow-defs-${arrow.id}`}>
                      {/* Backward compatible standard arrowhead */}
                      <marker
                        id={`arrowhead-${arrow.id}`}
                        markerWidth="11"
                        markerHeight="8"
                        refX="9.5"
                        refY="4"
                        orient="auto"
                        overflow="visible"
                      >
                        <polygon points="0 0, 11 4, 0 8" fill={arrowFill} />
                      </marker>

                      {/* Arrowhead End */}
                      <marker
                        id={`arrowhead-end-${arrow.id}`}
                        markerWidth="11"
                        markerHeight="8"
                        refX="9.5"
                        refY="4"
                        orient="auto"
                        overflow="visible"
                      >
                        <polygon points="0 0, 11 4, 0 8" fill={arrowFill} />
                      </marker>

                      {/* Arrowhead Start */}
                      <marker
                        id={`arrowhead-start-${arrow.id}`}
                        markerWidth="11"
                        markerHeight="8"
                        refX="1.5"
                        refY="4"
                        orient="auto"
                        overflow="visible"
                      >
                        <polygon points="11 0, 0 4, 11 8" fill={arrowFill} />
                      </marker>

                      {/* Circle Cap Marker */}
                      <marker
                        id={`circle-marker-${arrow.id}`}
                        markerWidth="8"
                        markerHeight="8"
                        refX="4"
                        refY="4"
                        orient="auto"
                        overflow="visible"
                      >
                        <circle cx="4" cy="4" r="3.5" fill={arrowFill} />
                      </marker>
                    </React.Fragment>
                  );
                })}
            </defs>

            {items
              .filter((it) => it.type === "connector")
              .map((arrow) => {
                const geom = getArrowGeometry(arrow);
                const startCap = arrow.startCap || "none";
                const defaultEnd =
                  arrow.connectorType === "line" || arrow.connectorType === "curved-line"
                    ? "none"
                    : "arrow";
                const endCap = arrow.endCap || defaultEnd;
                const isSelected = selectedArrowId === arrow.id || selectedItemId === arrow.id || selectedItemIds.includes(arrow.id);
                const isDashed = arrow.isDashed || arrow.connectorType === "dashed";
                const strokeWidth = arrow.strokeWidth || (isSelected ? 3.5 : 2.8);
                const arrowColor = arrow.arrowColor || activeColor || "#2563eb";

                let markerStartAttr: string | undefined = undefined;
                if (startCap === "arrow") markerStartAttr = `url(#arrowhead-start-${arrow.id})`;
                else if (startCap === "circle") markerStartAttr = `url(#circle-marker-${arrow.id})`;

                let markerEndAttr: string | undefined = undefined;
                if (endCap === "arrow") markerEndAttr = `url(#arrowhead-end-${arrow.id})`;
                else if (endCap === "circle") markerEndAttr = `url(#circle-marker-${arrow.id})`;

                return (
                  <g key={arrow.id} className="pointer-events-auto cursor-pointer connector-path">
                    {/* Wider invisible stroke to make clicking and dragging the arrow path easy */}
                    <path
                      d={geom.pathData}
                      stroke="transparent"
                      strokeWidth="26"
                      fill="none"
                      className="cursor-grab active:cursor-grabbing"
                      style={{ pointerEvents: "stroke" }}
                      onMouseDown={(e) => handleMouseDownArrowBody(e, arrow)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArrowId(arrow.id);
                        setSelectedItemId(arrow.id);
                      }}
                    />
                    {/* Visible Connector Line or Quadratic Curve */}
                    <path
                      d={geom.pathData}
                      stroke={arrowColor}
                      strokeWidth={isSelected ? Math.max(3.5, strokeWidth + 0.7) : strokeWidth}
                      strokeDasharray={isDashed ? "6,6" : undefined}
                      fill="none"
                      markerStart={markerStartAttr}
                      markerEnd={markerEndAttr}
                      className="pointer-events-none"
                    />
                  </g>
                );
              })}
          </svg>

          {/* Draggable Anchors, Curve Handle & Midpoint Label for Connectors */}
          {items
            .filter((it) => it.type === "connector")
            .map((arrow) => {
              const geom = getArrowGeometry(arrow);
              const arrowColor = arrow.arrowColor || activeColor || "#2563eb";
              const isSelected = selectedArrowId === arrow.id || selectedItemId === arrow.id || selectedItemIds.includes(arrow.id);

              // When unselected: hide all handles (endpoints and curve apex).
              // Only render the clean label text if one was entered.
              if (!isSelected) {
                if (!arrow.arrowLabel) return null;
                return (
                  <div
                    key={`connector-label-${arrow.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArrowId(arrow.id);
                      setSelectedItemId(arrow.id);
                    }}
                    className="connector-anchor absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer pointer-events-auto"
                    style={{
                      left: `${geom.curveMidX}px`,
                      top: `${geom.isCurved ? geom.curveMidY - 18 : geom.midY - 18}px`,
                    }}
                    title="Haz clic para seleccionar flecha"
                  >
                    <div className="px-2 py-0.5 rounded-lg bg-[var(--bg-card)]/90 border border-[var(--border-color)]/70 shadow-2xs text-[11px] font-bold text-[var(--text-main)] max-w-[160px] truncate select-none">
                      {arrow.arrowLabel}
                    </div>
                  </div>
                );
              }

              // When selected: show all editing controls (Start endpoint, End endpoint, Curve Apex, and Label Editor)
              return (
                <React.Fragment key={`connector-controls-${arrow.id}`}>
                  {/* Start Endpoint Handle */}
                  <div
                    onMouseDown={(e) => handleMouseDownArrowEndpoint(e, arrow, "start")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArrowId(arrow.id);
                      setSelectedItemId(arrow.id);
                    }}
                    className="connector-anchor absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                    style={{
                      left: `${geom.sx - 8}px`,
                      top: `${geom.sy - 8}px`,
                      backgroundColor: arrowColor,
                      zIndex: 25,
                    }}
                    title="Mover inicio de flecha"
                  />
                  {/* End Endpoint Handle */}
                  <div
                    onMouseDown={(e) => handleMouseDownArrowEndpoint(e, arrow, "end")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArrowId(arrow.id);
                      setSelectedItemId(arrow.id);
                    }}
                    className="connector-anchor absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                    style={{
                      left: `${geom.ex - 8}px`,
                      top: `${geom.ey - 8}px`,
                      backgroundColor: arrowColor,
                      zIndex: 25,
                    }}
                    title="Mover punta de flecha"
                  />

                  {/* Curve Apex Handle (Visible when selected) */}
                  <div
                    onMouseDown={(e) => handleMouseDownArrowCurve(e, arrow)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArrowId(arrow.id);
                      setSelectedItemId(arrow.id);
                    }}
                    className="connector-anchor absolute w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-md cursor-grab active:cursor-grabbing hover:scale-125 transition-transform -translate-x-1/2 -translate-y-1/2 z-30"
                    style={{
                      left: `${geom.curveMidX}px`,
                      top: `${geom.curveMidY}px`,
                    }}
                    title="Arrastra para arquear o curvar la flecha"
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.5" />
                  </div>

                  {/* Midpoint Label Editor */}
                  <div
                    className="connector-anchor absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 group"
                    style={{
                      left: `${geom.curveMidX}px`,
                      top: `${geom.isCurved ? geom.curveMidY - 18 : geom.midY - 18}px`,
                      zIndex: activeLayerMenuId === arrow.id ? 99999 : 35,
                    }}
                  >
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg backdrop-blur-xs transition-all bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md ring-1 ring-[var(--accent)]"
                    >
                      <input
                        type="text"
                        value={arrow.arrowLabel || ""}
                        onChange={(e) => {
                          const newItems = items.map((it) =>
                            it.id === arrow.id ? { ...it, arrowLabel: e.target.value } : it
                          );
                          updateBoardItems(newItems);
                        }}
                        placeholder="Texto de flecha..."
                        className="bg-transparent border-0 focus:outline-none text-[11px] font-bold text-center text-[var(--text-main)] min-w-[50px] max-w-[150px]"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArrowId(arrow.id);
                          setSelectedItemId(arrow.id);
                        }}
                        onFocus={() => {
                          setSelectedArrowId(arrow.id);
                          setSelectedItemId(arrow.id);
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyItem(arrow);
                        }}
                        className="text-[var(--text-muted)] hover:text-[var(--accent)] p-0.5 rounded hover:bg-[var(--accent-subtle)] cursor-pointer"
                        title="Copiar flecha (Ctrl+C)"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLayerMenuId(activeLayerMenuId === arrow.id ? null : arrow.id);
                          }}
                          className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-0.5 rounded hover:bg-[var(--bg-input)] cursor-pointer"
                          title="Gestionar capas"
                        >
                          <Layers className="w-3 h-3" />
                        </button>
                        {activeLayerMenuId === arrow.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-full left-0 mt-1 w-44 py-1 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] z-[100000] text-xs text-[var(--text-main)]"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleBringToFront(arrow.id);
                                setActiveLayerMenuId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                            >
                              <BringToFront className="w-3 h-3" /> Traer al frente
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleBringForward(arrow.id);
                                setActiveLayerMenuId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                            >
                              <ChevronUp className="w-3 h-3" /> Subir una capa
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendBackward(arrow.id);
                                setActiveLayerMenuId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                            >
                              <ChevronDown className="w-3 h-3" /> Bajar una capa
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendToBack(arrow.id);
                                setActiveLayerMenuId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                            >
                              <SendToBack className="w-3 h-3" /> Enviar al fondo
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(arrow.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-0.5 rounded hover:bg-red-500/10 cursor-pointer"
                        title="Eliminar flecha"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

          {/* Render Board Items */}
          {items.map((item) => {
            if (item.type === "connector") return null;

            const isSelected = selectedItemId === item.id || selectedItemIds.includes(item.id);

            // 1. FULL IMAGE ITEM (Frameless, direct edge resize, toggleable name, hover-only controls)
            if (item.type === "image") {
              const isAvatar = currentAvatarUrl === item.imageUrl;
              const width = item.width || 320;
              const height = item.height || 240;

              return (
                <div
                  key={item.id}
                  id={item.id}
                  onMouseDown={(e) => handleMouseDownItem(e, item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                    setSelectedArrowId(null);
                  }}
                  className={`board-item-node absolute group cursor-grab active:cursor-grabbing flex flex-col select-none ${
                    isSelected ? "ring-2 ring-[var(--accent)] ring-offset-2 rounded-xl" : ""
                  }`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${width}px`,
                    zIndex:
                      draggingId === item.id
                        ? 1000
                        : activeLayerMenuId === item.id
                        ? 9999
                        : isSelected
                        ? 50
                        : item.zIndex || 2,
                  }}
                >
                  {/* Clean Frameless Image Display */}
                  <div
                    className="relative w-full overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center shadow-md hover:shadow-xl transition-shadow"
                    style={{ height: `${height}px` }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.caption || "Imagen"}
                      className="w-full h-full object-cover select-none pointer-events-none rounded-xl"
                    />

                    {/* Overlaid Action Controls - ONLY VISIBLE ON HOVER */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
                      {isEntityMode && onSetAvatar && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.imageUrl) onSetAvatar(item.imageUrl);
                          }}
                          className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md transition-colors ${
                            isAvatar
                              ? "bg-amber-500 text-black"
                              : "bg-black/70 text-white hover:bg-amber-500 hover:text-black"
                          }`}
                          title="Establecer como Foto de Perfil"
                        >
                          <Star className={`w-3.5 h-3.5 ${isAvatar ? "fill-black" : ""}`} />
                        </button>
                      )}

                      {/* Toggle Name / Caption */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleHideCaption(item.id);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-bold shadow-md transition-colors ${
                          item.hideCaption
                            ? "bg-black/70 text-white/50 hover:text-white hover:bg-black/90"
                            : "bg-black/70 text-[var(--accent)] hover:bg-black/90"
                        }`}
                        title={item.hideCaption ? "Mostrar nombre de la imagen" : "Ocultar nombre de la imagen"}
                      >
                        <Type className="w-3.5 h-3.5" />
                      </button>

                      {/* Fullscreen View */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const idx = boardImagesList.findIndex((b) => b.url === item.imageUrl);
                          if (idx !== -1) setLightboxIndex(idx);
                        }}
                        className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black/90 shadow-md transition-colors"
                        title="Ver en grande"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-600 shadow-md transition-colors"
                        title="Eliminar de la pizarra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isAvatar && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[10px] shadow-sm flex items-center gap-1 pointer-events-none">
                        <Check className="w-3 h-3" />
                        <span>Perfil</span>
                      </div>
                    )}

                    {/* Resize Controls Directly on Image Edges - ONLY VISIBLE ON HOVER */}
                    <div
                      onMouseDown={(e) => handleStartResize(e, item, "se")}
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-white shadow-md cursor-nwse-resize hover:scale-125 transition-transform z-30 opacity-0 group-hover:opacity-100"
                      title="Arrastra para redimensionar la imagen"
                    />
                    <div
                      onMouseDown={(e) => handleStartResize(e, item, "e")}
                      className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-6 bg-[var(--accent)]/90 rounded-full cursor-ew-resize hover:scale-125 transition-transform z-30 opacity-0 group-hover:opacity-100"
                      title="Arrastra para ensanchar"
                    />
                    <div
                      onMouseDown={(e) => handleStartResize(e, item, "s")}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-[var(--accent)]/90 rounded-full cursor-ns-resize hover:scale-125 transition-transform z-30 opacity-0 group-hover:opacity-100"
                      title="Arrastra para alargar"
                    />
                  </div>

                  {/* Modifiable Name Space at Bottom (Can be deactivated) */}
                  {!item.hideCaption && (
                    <div className="mt-1.5 px-2 py-1 bg-[var(--bg-surface)]/80 backdrop-blur-xs border border-[var(--border-color)] rounded-xl flex items-center justify-between shadow-2xs">
                      <input
                        type="text"
                        value={item.caption || ""}
                        onChange={(e) => {
                          const newItems = items.map((it) =>
                            it.id === item.id ? { ...it, caption: e.target.value } : it
                          );
                          updateBoardItems(newItems);
                        }}
                        placeholder="Nombre de la imagen..."
                        className="w-full text-xs font-semibold bg-transparent border-0 focus:outline-none text-[var(--text-main)] truncate"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(item.id);
                          setSelectedArrowId(null);
                        }}
                        onFocus={() => {
                          setSelectedItemId(item.id);
                          setSelectedArrowId(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            }

            // 2. STICKY NOTE CARD
            if (item.type === "note") {
              const isDark = item.color === "#1e293b";
              const width = item.width || 230;
              const height = item.height || 180;

              return (
                <div
                  key={item.id}
                  id={item.id}
                  onMouseDown={(e) => handleMouseDownItem(e, item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                    setSelectedArrowId(null);
                  }}
                  className={`board-item-node absolute rounded-2xl p-3.5 shadow-md hover:shadow-xl transition-shadow cursor-grab active:cursor-grabbing flex flex-col justify-between group ${
                    isSelected ? "ring-2 ring-[var(--accent)] ring-offset-1" : ""
                  }`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${width}px`,
                    minHeight: `${height}px`,
                    backgroundColor: item.color || "#fef08a",
                    color: isDark ? "#ffffff" : "#1e293b",
                    zIndex:
                      draggingId === item.id
                        ? 1000
                        : activeLayerMenuId === item.id
                        ? 9999
                        : isSelected
                        ? 50
                        : item.zIndex || 3,
                  }}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={item.title || ""}
                        onChange={(e) => {
                          const newItems = items.map((it) =>
                            it.id === item.id ? { ...it, title: e.target.value } : it
                          );
                          updateBoardItems(newItems);
                        }}
                        placeholder="Título..."
                        className="font-bold text-xs bg-transparent border-0 focus:outline-none w-full"
                        style={{ color: isDark ? "#ffffff" : "#1e293b" }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(item.id);
                          setSelectedArrowId(null);
                        }}
                        onFocus={() => {
                          setSelectedItemId(item.id);
                          setSelectedArrowId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="opacity-50 hover:opacity-100 p-0.5"
                        title="Eliminar nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <textarea
                      value={item.text || ""}
                      onChange={(e) => {
                        const newItems = items.map((it) =>
                          it.id === item.id ? { ...it, text: e.target.value } : it
                        );
                        updateBoardItems(newItems);
                      }}
                      rows={4}
                      placeholder="Escribe aquí tus notas..."
                      className="w-full text-xs bg-transparent border-0 focus:outline-none resize-none leading-relaxed"
                      style={{ color: isDark ? "#e2e8f0" : "#334155" }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(item.id);
                        setSelectedArrowId(null);
                      }}
                      onFocus={() => {
                        setSelectedItemId(item.id);
                        setSelectedArrowId(null);
                      }}
                    />
                  </div>

                  {/* Resize Handle - ONLY ON HOVER */}
                  <div
                    onMouseDown={(e) => handleStartResize(e, item, "se")}
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-black/40 rounded-full cursor-nwse-resize hover:scale-125 transition-transform opacity-0 group-hover:opacity-100"
                    title="Redimensionar nota"
                  />

                  {/* Magnetic Anchor Ports when connecting arrows */}
                  {draggingArrowPoint !== null && (
                    <>
                      {(["top", "right", "bottom", "left"] as AnchorPosition[]).map((pos) => {
                        const isSnapped = activeAnchorSnap?.itemId === item.id && activeAnchorSnap?.position === pos;
                        const posClasses =
                          pos === "top"
                            ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            : pos === "right"
                            ? "top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
                            : pos === "bottom"
                            ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                            : "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2";

                        return (
                          <div
                            key={`anchor-note-${item.id}-${pos}`}
                            className={`absolute pointer-events-none rounded-full transition-all duration-150 z-50 ${posClasses} ${
                              isSnapped
                                ? "w-3.5 h-3.5 bg-sky-500 ring-4 ring-sky-300 dark:ring-sky-600 scale-125 shadow-lg animate-pulse"
                                : "w-2.5 h-2.5 bg-sky-400/80 ring-2 ring-white dark:ring-zinc-900 shadow-sm opacity-80"
                            }`}
                          />
                        );
                      })}
                    </>
                  )}
                </div>
              );
            }

            // 3. GEOMETRIC SHAPE (Full color or transparent no-fill with border, NO placeholder when empty)
            if (item.type === "shape") {
              const isCircle = item.shapeType === "circle";
              const isNoFill = item.backgroundColor === "transparent" || item.backgroundColor === "none";
              const solidBg = isNoFill ? "transparent" : (item.backgroundColor || activeColor || "#fef08a");
              const strokeColor = item.borderColor || (isNoFill ? (activeColor || "#3b82f6") : solidBg);
              const textColor = item.textColor || (isNoFill ? strokeColor : getContrastColor(solidBg));
              const width = item.width || (isCircle ? 180 : 220);
              const height = item.height || (isCircle ? 180 : 140);

              return (
                <div
                  key={item.id}
                  id={item.id}
                  onMouseDown={(e) => handleMouseDownItem(e, item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                    setSelectedArrowId(null);
                  }}
                  className={`board-item-node absolute transition-shadow cursor-grab active:cursor-grabbing flex flex-col items-center justify-center p-3 text-center group ${
                    isCircle ? "rounded-full" : "rounded-2xl"
                  } ${isSelected ? "ring-2 ring-[var(--accent)] ring-offset-2" : ""} ${
                    isNoFill ? "hover:shadow-lg backdrop-blur-[0.5px]" : "shadow-md hover:shadow-xl"
                  }`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    backgroundColor: solidBg,
                    borderColor: strokeColor,
                    borderWidth: isNoFill ? "2.5px" : "2px",
                    borderStyle: "solid",
                    zIndex:
                      draggingId === item.id
                        ? 1000
                        : activeLayerMenuId === item.id
                        ? 9999
                        : isSelected
                        ? 50
                        : item.zIndex || 1,
                  }}
                >
                  {/* Action Bar on Hover */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newItems = items.map((it) =>
                          it.id === item.id ? { ...it, label: "" } : it
                        );
                        updateBoardItems(newItems);
                      }}
                      className="p-1 rounded bg-black/50 text-white hover:bg-black/80 shadow-xs"
                      title="Borrar texto de la forma"
                    >
                      <Eraser className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1 rounded bg-red-600/90 text-white hover:bg-red-600 shadow-xs"
                      title="Eliminar forma"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Editable Text Area Inside Shape - NO PLACEHOLDER WHEN EMPTY */}
                  <div className="w-full h-full flex items-center justify-center px-2 py-1">
                    <textarea
                      value={item.label || ""}
                      onChange={(e) => {
                        const newItems = items.map((it) =>
                          it.id === item.id ? { ...it, label: e.target.value } : it
                        );
                        updateBoardItems(newItems);
                      }}
                      placeholder="" // Empty placeholder so it can serve as a clean color palette swatch
                      rows={2}
                      className="w-full bg-transparent border-0 focus:outline-none resize-none font-bold text-sm sm:text-base leading-snug"
                      style={{ color: textColor, textAlign: item.textAlign || "center" }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(item.id);
                        setSelectedArrowId(null);
                      }}
                      onFocus={() => {
                        setSelectedItemId(item.id);
                        setSelectedArrowId(null);
                      }}
                    />
                  </div>

                  {/* Corner Resize Handle - ONLY ON HOVER */}
                  <div
                    onMouseDown={(e) => handleStartResize(e, item, "se")}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-white text-black border-2 border-slate-700 rounded-full cursor-nwse-resize hover:scale-125 transition-transform z-30 shadow-md opacity-0 group-hover:opacity-100"
                    title="Arrastra para redimensionar la forma"
                  />
                  {!isCircle && (
                    <>
                      <div
                        onMouseDown={(e) => handleStartResize(e, item, "e")}
                        className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-6 bg-white border border-slate-700 rounded-full cursor-ew-resize hover:scale-125 transition-transform z-30 shadow-xs opacity-0 group-hover:opacity-100"
                        title="Arrastra para ensanchar"
                      />
                      <div
                        onMouseDown={(e) => handleStartResize(e, item, "s")}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-slate-700 rounded-full cursor-ns-resize hover:scale-125 transition-transform z-30 shadow-xs opacity-0 group-hover:opacity-100"
                        title="Arrastra para alargar"
                      />
                    </>
                  )}

                  {/* Magnetic Anchor Ports when connecting arrows */}
                  {draggingArrowPoint !== null && (
                    <>
                      {(["top", "right", "bottom", "left"] as AnchorPosition[]).map((pos) => {
                        const isSnapped = activeAnchorSnap?.itemId === item.id && activeAnchorSnap?.position === pos;
                        const posClasses =
                          pos === "top"
                            ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            : pos === "right"
                            ? "top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
                            : pos === "bottom"
                            ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                            : "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2";

                        return (
                          <div
                            key={`anchor-shape-${item.id}-${pos}`}
                            className={`absolute pointer-events-none rounded-full transition-all duration-150 z-50 ${posClasses} ${
                              isSnapped
                                ? "w-3.5 h-3.5 bg-sky-500 ring-4 ring-sky-300 dark:ring-sky-600 scale-125 shadow-lg animate-pulse"
                                : "w-2.5 h-2.5 bg-sky-400/80 ring-2 ring-white dark:ring-zinc-900 shadow-sm opacity-80"
                            }`}
                          />
                        );
                      })}
                    </>
                  )}
                </div>
              );
            }

            // 4. PLAIN TEXT BOX (Transparent background, no border, customizable color, font-size toggle, font-family selector)
            if (item.type === "text") {
              const width = item.width || 260;
              const height = item.height || 60;
              const fontSize = item.fontSize || 18;
              const effectiveFontSize =
                isSelected && selectedTextFontSize !== null ? selectedTextFontSize : fontSize;
              const textColor = item.textColor || "var(--text-main)";
              const currentFontConfig = getBoardFontConfig(item.fontFamily);
              const isDraggingThis = draggingId === item.id;

              return (
                <div
                  key={item.id}
                  id={item.id}
                  onMouseDown={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("button") || target.closest("input") || target.closest(".no-drag")) {
                      return;
                    }
                    handleMouseDownItem(e, item);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                    setSelectedArrowId(null);
                  }}
                  className={`board-item-node absolute group select-none rounded-xl p-1.5 ${
                    isSelected
                      ? "ring-2 ring-[var(--accent)] ring-offset-1 bg-[var(--bg-card)]/40"
                      : "hover:bg-[var(--bg-card)]/20"
                  } ${
                    isDraggingThis
                      ? "transition-none shadow-2xl cursor-grabbing"
                      : "transition-[background-color,box-shadow] duration-150 cursor-grab"
                  }`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${width}px`,
                    minHeight: `${height}px`,
                    zIndex: isDraggingThis
                      ? 1000
                      : activeFontPickerId === item.id ||
                        activeFontSizePickerId === item.id ||
                        activeColorPickerId === item.id ||
                        activeLayerMenuId === item.id
                      ? 9999
                      : isSelected
                      ? 50
                      : item.zIndex || 4,
                    willChange: isDraggingThis ? "left, top" : undefined,
                  }}
                >
                  {/* Floating Actions on Selection or Hover */}
                  <div
                    className={`absolute ${
                      item.y < 50 ? "-bottom-11" : "-top-11"
                    } left-0 flex items-center gap-1.5 z-40 max-w-none ${
                      isSelected
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
                    }`}
                  >
                    {/* Dedicated Drag Handle */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDownItem(e, item);
                      }}
                      className="flex items-center justify-center p-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] shadow-md border border-[var(--border-color)] cursor-grab active:cursor-grabbing shrink-0 transition-colors"
                      title="Arrastrar cuadro de texto"
                    >
                      <Move className="w-3.5 h-3.5" />
                    </div>

                    {/* Font Family Dropdown */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFontPickerId(activeFontPickerId === item.id ? null : item.id);
                          setActiveFontSizePickerId(null);
                          setActiveColorPickerId(null);
                          setActiveLayerMenuId(null);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-input)] text-xs font-semibold shadow-md border border-[var(--border-color)] transition-colors cursor-pointer"
                        title="Cambiar tipografía (se aplica a la selección o a todo el cuadro)"
                      >
                        <Type className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                        <span className="truncate max-w-[100px]" style={{ fontFamily: currentFontConfig.family }}>
                          {currentFontConfig.label}
                        </span>
                        <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                      </button>

                      {activeFontPickerId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-full left-0 mt-1.5 w-52 py-1.5 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] z-[100000] max-h-64 overflow-y-auto text-[var(--text-main)]"
                        >
                          <div className="px-3 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">
                            Tipografías
                          </div>
                          {BOARD_FONTS.map((font) => {
                            const isSelectedFont = (item.fontFamily || "Plus Jakarta Sans") === font.id;
                            return (
                              <button
                                key={font.id}
                                type="button"
                                onClick={() => {
                                  handleSetTextFontFamily(item.id, font.id);
                                  setActiveFontPickerId(null);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer ${
                                  isSelectedFont
                                    ? "font-bold text-[var(--accent)] bg-[var(--accent-subtle)]/50"
                                    : "text-[var(--text-main)]"
                                }`}
                              >
                                <span className="text-sm" style={{ fontFamily: font.family }}>{font.label}</span>
                                {isSelectedFont && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Text Alignment Group */}
                    <div className="flex items-center bg-[var(--bg-card)] rounded-lg p-0.5 shadow-md border border-[var(--border-color)] shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetTextAlign(item.id, "left");
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          (item.textAlign || "left") === "left"
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                            : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        }`}
                        title="Alinear texto a la izquierda"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetTextAlign(item.id, "center");
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          item.textAlign === "center"
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                            : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        }`}
                        title="Centrar texto"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetTextAlign(item.id, "right");
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          item.textAlign === "right"
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                            : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        }`}
                        title="Alinear texto a la derecha"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Font Size Group: Decrement + Custom Numeric Input + Increment + Presets Dropdown */}
                    <div className="flex items-center bg-[var(--bg-card)] rounded-lg p-0.5 shadow-md border border-[var(--border-color)] shrink-0">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetTextFontSize(item.id, Math.max(8, effectiveFontSize - (effectiveFontSize > 32 ? 4 : 2)));
                        }}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded hover:bg-[var(--bg-input)] cursor-pointer"
                        title="Reducir tamaño"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      {/* Custom Input */}
                      <div className="flex items-center px-1">
                        <input
                          type="number"
                          min={8}
                          max={240}
                          value={effectiveFontSize}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              handleSetTextFontSize(item.id, val);
                            }
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 text-center text-xs font-bold bg-transparent text-[var(--text-main)] focus:outline-none focus:bg-[var(--bg-input)] rounded py-0.5 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title={hasActiveTextSelection ? "Tamaño del texto seleccionado" : "Tamaño del texto (8 - 240px)"}
                        />
                        <span className="text-[10px] font-medium text-[var(--text-muted)] pointer-events-none select-none">
                          px
                        </span>
                      </div>

                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetTextFontSize(item.id, Math.min(240, effectiveFontSize + (effectiveFontSize >= 32 ? 4 : 2)));
                        }}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded hover:bg-[var(--bg-input)] cursor-pointer"
                        title="Aumentar tamaño"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      {/* Presets dropdown toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveFontSizePickerId(activeFontSizePickerId === item.id ? null : item.id);
                            setActiveFontPickerId(null);
                            setActiveColorPickerId(null);
                            setActiveLayerMenuId(null);
                          }}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded hover:bg-[var(--bg-input)] border-l border-[var(--border-color)] ml-0.5 cursor-pointer"
                          title="Ver lista de tamaños predefinidos"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        {activeFontSizePickerId === item.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-40 py-1.5 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] z-[100000] max-h-60 overflow-y-auto text-[var(--text-main)]"
                          >
                            <div className="px-3 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">
                              Tamaño de texto
                            </div>
                            {BOARD_FONT_SIZES.map((sz) => {
                              const isSelectedSize = effectiveFontSize === sz;
                              const sizeLabel =
                                sz <= 14 ? "Diminuto" : sz <= 18 ? "Normal" : sz <= 24 ? "Mediano" : sz <= 36 ? "Grande" : sz <= 56 ? "Titular" : sz <= 72 ? "Gigante" : "Póster";
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onClick={() => {
                                    handleSetTextFontSize(item.id, sz);
                                    setActiveFontSizePickerId(null);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer ${
                                    isSelectedSize
                                      ? "font-bold text-[var(--accent)] bg-[var(--accent-subtle)]/50"
                                      : "text-[var(--text-main)]"
                                  }`}
                                >
                                  <span className="font-semibold">{sz}px</span>
                                  <span className="text-[10px] text-[var(--text-muted)]">{sizeLabel}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Text Color Picker */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveColorPickerId(activeColorPickerId === item.id ? null : item.id);
                          setActiveFontPickerId(null);
                          setActiveFontSizePickerId(null);
                          setActiveLayerMenuId(null);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-input)] shadow-md border border-[var(--border-color)] transition-colors cursor-pointer flex items-center gap-1"
                        title="Color de texto (se aplica a la selección o a todo el cuadro)"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: textColor }}
                        />
                        <ChevronDown className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                      </button>

                      {activeColorPickerId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-full left-0 mt-1.5 p-2 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] z-[100000] w-48 text-[var(--text-main)]"
                        >
                          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                            Color de texto
                          </div>
                          <div className="grid grid-cols-5 gap-1.5 mb-2">
                            {PRESET_COLORS.map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                onClick={() => {
                                  handleSetTextColor(item.id, c.hex);
                                  setActiveColorPickerId(null);
                                }}
                                className="w-6 h-6 rounded-full border border-black/20 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                                style={{ backgroundColor: c.hex }}
                                title={c.label}
                              />
                            ))}
                          </div>
                          <label className="flex items-center justify-between text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer pt-1 border-t border-[var(--border-color)]">
                            <span>Personalizado</span>
                            <input
                              type="color"
                              value={textColor.startsWith("#") ? textColor : "#ffffff"}
                              onChange={(e) => {
                                handleSetTextColor(item.id, e.target.value);
                              }}
                              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Copy button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyItem(item);
                      }}
                      className="p-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] shadow-md border border-[var(--border-color)] cursor-pointer shrink-0 transition-colors"
                      title="Copiar cuadro de texto (Ctrl+C)"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Layers dropdown */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLayerMenuId(activeLayerMenuId === item.id ? null : item.id);
                          setActiveColorPickerId(null);
                          setActiveFontPickerId(null);
                          setActiveFontSizePickerId(null);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] shadow-md border border-[var(--border-color)] cursor-pointer transition-colors"
                        title="Gestionar capas"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                      {activeLayerMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-full left-0 mt-1.5 w-44 py-1 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] z-[100000] text-xs text-[var(--text-main)]"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              handleBringToFront(item.id);
                              setActiveLayerMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                          >
                            <BringToFront className="w-3.5 h-3.5" /> Traer al frente
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleBringForward(item.id);
                              setActiveLayerMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5" /> Subir una capa
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleSendBackward(item.id);
                              setActiveLayerMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" /> Bajar una capa
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleSendToBack(item.id);
                              setActiveLayerMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                          >
                            <SendToBack className="w-3.5 h-3.5" /> Enviar al fondo
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-md cursor-pointer shrink-0 transition-colors"
                      title="Eliminar texto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtle Drag Grip Header Bar */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDownItem(e, item);
                    }}
                    className="w-full h-3 flex items-center justify-center cursor-grab active:cursor-grabbing mb-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Arrastrar cuadro de texto"
                  >
                    <div className="w-10 h-1 rounded-full bg-[var(--text-muted)] opacity-30 hover:opacity-80 transition-opacity" />
                  </div>

                  {/* Rich Text Editor with selection-specific formatting */}
                  <div className="w-full h-full">
                    <BoardRichTextEditor
                      ref={(inst) => {
                        if (inst) {
                          textEditorRefs.current.set(item.id, inst);
                        } else {
                          textEditorRefs.current.delete(item.id);
                        }
                      }}
                      itemId={item.id}
                      initialText={item.text || ""}
                      initialRichText={item.richText}
                      fontFamily={currentFontConfig.family}
                      fontSize={fontSize}
                      textColor={textColor}
                      textAlign={item.textAlign || "left"}
                      isDragging={isDraggingThis}
                      isSelected={isSelected}
                      onSelectionChange={(selectedSize, hasSelection) => {
                        if (selectedItemId === item.id) {
                          setSelectedTextFontSize(selectedSize);
                          setHasActiveTextSelection(hasSelection);
                        }
                      }}
                      onChange={(plainText, richHtml) => {
                        handleUpdateItemText(item.id, plainText, richHtml);
                      }}
                      onFocus={() => {
                        setSelectedItemId(item.id);
                        setSelectedArrowId(null);
                      }}
                      onSelect={() => {
                        setSelectedItemId(item.id);
                        setSelectedArrowId(null);
                      }}
                    />
                  </div>

                  {/* Resize Handle only on Hover */}
                  <div
                    onMouseDown={(e) => handleStartResize(e, item, "se")}
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[var(--accent)] rounded-full cursor-nwse-resize hover:scale-125 transition-transform opacity-0 group-hover:opacity-100 shadow-xs z-30"
                    title="Redimensionar cuadro de texto"
                  />

                  {/* Magnetic Anchor Ports when connecting arrows */}
                  {draggingArrowPoint !== null && (
                    <>
                      {(["top", "right", "bottom", "left"] as AnchorPosition[]).map((pos) => {
                        const isSnapped = activeAnchorSnap?.itemId === item.id && activeAnchorSnap?.position === pos;
                        const posClasses =
                          pos === "top"
                            ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            : pos === "right"
                            ? "top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
                            : pos === "bottom"
                            ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                            : "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2";

                        return (
                          <div
                            key={`anchor-text-${item.id}-${pos}`}
                            className={`absolute pointer-events-none rounded-full transition-all duration-150 z-50 ${posClasses} ${
                              isSnapped
                                ? "w-3.5 h-3.5 bg-sky-500 ring-4 ring-sky-300 dark:ring-sky-600 scale-125 shadow-lg animate-pulse"
                                : "w-2.5 h-2.5 bg-sky-400/80 ring-2 ring-white dark:ring-zinc-900 shadow-sm opacity-80"
                            }`}
                          />
                        );
                      })}
                    </>
                  )}
                </div>
              );
            }

            // 5. RESOURCE CARD (SPOTIFY, YOUTUBE, DOCUMENT, WEB LINK)
            if (item.type === "link") {
              return (
                <BoardResourceCard
                  key={item.id}
                  item={item}
                  isSelected={isSelected}
                  zoom={zoom}
                  onMouseDown={(e) => handleMouseDownItem(e, item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                    setSelectedArrowId(null);
                    setSelectedItemIds([item.id]);
                  }}
                  onDelete={() => handleDeleteItem(item.id)}
                  onUpdate={(updated) => handleUpdateItem(item.id, updated)}
                  onOpenEditModal={() => {
                    setEditingResourceItem(item);
                    setIsAddResourceModalOpen(true);
                  }}
                  onPreviewPdf={(fileData, fileName) => setPreviewPdfData({ fileData, fileName })}
                  onBringToFront={() => handleBringToFront(item.id)}
                  onSendToBack={() => handleSendToBack(item.id)}
                  onStartResize={(e, handle) => handleStartResize(e, item, handle)}
                  draggingArrowPoint={draggingArrowPoint}
                  activeAnchorSnap={activeAnchorSnap}
                />
              );
            }

            return null;
          })}
        </div>

        {/* Drag-and-drop Image Upload Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-50 bg-[var(--accent)]/10 border-2 border-dashed border-[var(--accent)] pointer-events-none flex items-center justify-center backdrop-blur-[1px] transition-all">
            <div className="bg-[var(--bg-card)] px-5 py-3 rounded-2xl shadow-2xl border border-[var(--accent)] flex items-center gap-3 text-sm font-bold text-[var(--accent)]">
              <Upload className="w-5 h-5 animate-bounce" />
              <span>Suelta la imagen aquí para añadirla a la pizarra</span>
            </div>
          </div>
        )}

        {/* Paste / Add Image Notification */}
        {pasteNotification && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none bg-[var(--bg-card)] text-[var(--text-main)] px-4 py-2 rounded-xl shadow-xl border border-[var(--border-color)] flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{pasteNotification}</span>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && boardImagesList.length > 0 && (
        <ImageLightboxModal
          isOpen={lightboxIndex !== null}
          images={boardImagesList}
          currentIndex={lightboxIndex}
          entityName={entity?.name || project?.title || "Pizarra Visual"}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
          onSetAsAvatar={onSetAvatar}
          currentAvatarUrl={currentAvatarUrl}
        />
      )}

      {/* Add / Edit Resource Modal (Spotify, Web Link, Documents) */}
      <AddResourceModal
        isOpen={isAddResourceModalOpen}
        onClose={() => {
          setIsAddResourceModalOpen(false);
          setEditingResourceItem(null);
        }}
        onSave={handleSaveResource}
        initialItem={editingResourceItem}
      />

      {/* PDF Document Preview Modal */}
      {previewPdfData && (
        <PdfPreviewModal
          isOpen={!!previewPdfData}
          onClose={() => setPreviewPdfData(null)}
          fileData={previewPdfData.fileData}
          fileName={previewPdfData.fileName}
        />
      )}
    </div>
  );
};
