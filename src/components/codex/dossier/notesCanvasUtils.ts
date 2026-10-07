import { NoteCardLayout } from "../../../types";

const DEFAULT_NOTE_WIDTH = 220;
const DEFAULT_NOTE_HEIGHT = 100;
const WIDE_NOTE_WIDTH = 340;
const WIDE_NOTE_HEIGHT = 180;

export function getOrComputeLayouts(
  attributes: Record<string, string>,
  existingLayouts: Record<string, NoteCardLayout> = {}
): Record<string, NoteCardLayout> {
  const result: Record<string, NoteCardLayout> = {};
  const keys = Object.keys(attributes);
  if (keys.length === 0) return result;

  // Seguimiento de columnas para auto-layout de atributos sin posición previa
  let col1Y = 24;
  let col2Y = 24;
  let col3Y = 24;

  keys.forEach((key) => {
    const existing = existingLayouts[key];
    if (existing && typeof existing.x === "number" && typeof existing.y === "number") {
      result[key] = {
        x: Math.max(0, existing.x),
        y: Math.max(0, existing.y),
        width: Math.max(160, existing.width || DEFAULT_NOTE_WIDTH),
        height: Math.max(70, existing.height || DEFAULT_NOTE_HEIGHT),
        isLocked: !!existing.isLocked,
      };
      return;
    }

    const val = attributes[key] || "";
    const isShort = val.length < 35 && !val.includes("\n");
    const width = isShort ? DEFAULT_NOTE_WIDTH : WIDE_NOTE_WIDTH;
    const height = isShort ? DEFAULT_NOTE_HEIGHT : WIDE_NOTE_HEIGHT;

    // Asignación de columna inteligente según longitud
    let x = 24;
    let y = col1Y;

    if (isShort) {
      x = 24;
      y = col1Y;
      col1Y += height + 16;
    } else if (col2Y <= col3Y) {
      x = 264;
      y = col2Y;
      col2Y += height + 16;
    } else {
      x = 624;
      y = col3Y;
      col3Y += height + 16;
    }

    result[key] = {
      x,
      y,
      width,
      height,
      isLocked: false,
    };
  });

  return result;
}

export function computeCanvasDimensions(
  layouts: Record<string, NoteCardLayout>,
  minW = 1000,
  minH = 650
): { width: number; height: number } {
  let maxX = minW;
  let maxY = minH;

  Object.values(layouts).forEach((l) => {
    if (l) {
      const right = (l.x || 0) + (l.width || DEFAULT_NOTE_WIDTH);
      const bottom = (l.y || 0) + (l.height || DEFAULT_NOTE_HEIGHT);
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    }
  });

  return {
    width: maxX + 80,
    height: maxY + 80,
  };
}

