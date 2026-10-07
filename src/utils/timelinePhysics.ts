import { TimelineEvent } from "../types";

export const TIMELINE_CARD_WIDTH = 288;
const TIMELINE_MIN_GAP = 24;
const TIMELINE_SLOT_MIN_DIST = TIMELINE_CARD_WIDTH + TIMELINE_MIN_GAP; // 312px
const TIMELINE_TRACK_LEFT_PAD = 24;

export interface TimelinePositionItem {
  id: string;
  x: number;
}

export interface DragLayoutResult {
  positions: Record<string, number>;
  sortedIds: string[];
}

/**
 * Computes non-overlapping initial positions for track events.
 * Guarantees that x[i+1] >= x[i] + TIMELINE_SLOT_MIN_DIST and x[0] >= TIMELINE_TRACK_LEFT_PAD.
 */
export function getInitialTrackPositions(events: TimelineEvent[]): TimelinePositionItem[] {
  if (events.length === 0) return [];

  const items: TimelinePositionItem[] = events.map((ev, idx) => {
    const rawX =
      ev.relativeOffset !== undefined
        ? ev.relativeOffset
        : idx * (TIMELINE_CARD_WIDTH + 80) + TIMELINE_TRACK_LEFT_PAD;
    return { id: ev.id, x: Math.round(rawX) };
  });

  // Sort by starting x
  items.sort((a, b) => a.x - b.x);

  // Enforce minimum separation constraint
  items[0].x = Math.max(TIMELINE_TRACK_LEFT_PAD, items[0].x);
  for (let i = 1; i < items.length; i++) {
    items[i].x = Math.max(items[i].x, items[i - 1].x + TIMELINE_SLOT_MIN_DIST);
  }

  return items;
}

/**
 * Calculates realtime layout during drag.
 * Ensures:
 * 1. 1:1 mouse tracking for the dragged event
 * 2. Strict non-overlapping with adjacent cards
 * 3. Hysteresis-free slot swapping when dragging past neighbors
 * 4. Free translation for solitary events
 */
export function calculateDragLayout(params: {
  dragId: string;
  rawX: number;
  initialItems: TimelinePositionItem[];
}): DragLayoutResult {
  const { dragId, rawX, initialItems } = params;

  if (initialItems.length === 0) {
    return { positions: {}, sortedIds: [] };
  }

  if (initialItems.length === 1) {
    const solitaryId = initialItems[0].id;
    const clampedX = Math.max(TIMELINE_TRACK_LEFT_PAD, Math.round(rawX));
    return {
      positions: { [solitaryId]: clampedX },
      sortedIds: [solitaryId],
    };
  }

  const n = initialItems.length;
  const slots = initialItems.map((item) => item.x);
  const draggedCenter = rawX + TIMELINE_CARD_WIDTH / 2;

  // Find target slot index k in [0, n - 1] based on midpoints between slot centers
  let targetSlot = n - 1;
  for (let i = 0; i < n - 1; i++) {
    const centerI = slots[i] + TIMELINE_CARD_WIDTH / 2;
    const centerNext = slots[i + 1] + TIMELINE_CARD_WIDTH / 2;
    const midpoint = (centerI + centerNext) / 2;
    if (draggedCenter < midpoint) {
      targetSlot = i;
      break;
    }
  }

  // Non-dragged items in their initial relative order
  const nonDraggedItems = initialItems.filter((item) => item.id !== dragId);
  const dragItem = initialItems.find((item) => item.id === dragId) || { id: dragId, x: rawX };

  // New sequence with dragged item at targetSlot
  const newOrder = [
    ...nonDraggedItems.slice(0, targetSlot),
    dragItem,
    ...nonDraggedItems.slice(targetSlot),
  ];

  // Calculate clamped X for dragged card so it never overlaps its slot neighbors
  const lowerBound =
    targetSlot === 0
      ? TIMELINE_TRACK_LEFT_PAD
      : slots[targetSlot - 1] + TIMELINE_SLOT_MIN_DIST;

  const upperBound =
    targetSlot === n - 1
      ? Infinity
      : slots[targetSlot + 1] - TIMELINE_SLOT_MIN_DIST;

  const clampedDraggedX = Math.round(Math.max(lowerBound, Math.min(upperBound, rawX)));

  const positions: Record<string, number> = {};
  for (let j = 0; j < n; j++) {
    const item = newOrder[j];
    if (item.id === dragId) {
      positions[item.id] = clampedDraggedX;
    } else {
      positions[item.id] = slots[j];
    }
  }

  return {
    positions,
    sortedIds: newOrder.map((it) => it.id),
  };
}
