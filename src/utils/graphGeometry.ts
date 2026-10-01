export interface Point2D {
  x: number;
  y: number;
}

/**
 * Calcula el punto de control cuadrático (C) necesario para que la curva Bezier
 * en t = 0.5 pase exactamente por la posición deseada de la insignia (B).
 * Fórmula: B(0.5) = 0.5 * M + 0.5 * C  =>  C = 2*B - M, donde M = (P0 + P1) / 2.
 */
export function calculateBezierControlPoint(
  posA: Point2D,
  posB: Point2D,
  badgePos: Point2D
): Point2D {
  const midX = (posA.x + posB.x) / 2;
  const midY = (posA.y + posB.y) / 2;
  return {
    x: Math.round(2 * badgePos.x - midX),
    y: Math.round(2 * badgePos.y - midY),
  };
}

/**
 * Evalúa el punto medio de una curva Bezier cuadrática con punto de control opcional.
 */
export function getBezierMidpoint(
  posA: Point2D,
  posB: Point2D,
  controlPoint?: Point2D
): Point2D {
  if (!controlPoint) {
    return {
      x: (posA.x + posB.x) / 2,
      y: (posA.y + posB.y) / 2,
    };
  }
  // En t = 0.5: 0.25*P0 + 0.5*C + 0.25*P1
  return {
    x: Math.round(0.25 * posA.x + 0.5 * controlPoint.x + 0.25 * posB.x),
    y: Math.round(0.25 * posA.y + 0.5 * controlPoint.y + 0.25 * posB.y),
  };
}

/**
 * Calcula un punto de control automático para separar visualmente múltiples
 * enlaces entre el mismo par de entidades sin que se encimen.
 */
export function calculateAutoControlPoint(
  posA: Point2D,
  posB: Point2D,
  pairIndex: number,
  pairTotal: number
): Point2D | undefined {
  if (pairTotal <= 1) return undefined;

  const midX = (posA.x + posB.x) / 2;
  const midY = (posA.y + posB.y) / 2;
  const dx = posB.x - posA.x;
  const dy = posB.y - posA.y;
  const len = Math.hypot(dx, dy) || 1;

  // Vector normal unitario perpendicular a la recta
  const nx = -dy / len;
  const ny = dx / len;

  // Desfase simétrico centrado
  const step = 45;
  const offset = (pairIndex - (pairTotal - 1) / 2) * step;

  // C = M + normal * (2 * offset)
  return {
    x: Math.round(midX + nx * (2 * offset)),
    y: Math.round(midY + ny * (2 * offset)),
  };
}

/**
 * Genera una distribución circular simétrica y equilibrada para las entidades.
 */
export function generateCircularLayout(
  entityIds: string[],
  centerX = 560,
  centerY = 400,
  baseRadius = 250
): Record<string, Point2D> {
  const count = entityIds.length;
  if (count === 0) return {};

  const radius = Math.min(500, Math.max(baseRadius, 120 + count * 26));
  const positions: Record<string, Point2D> = {};

  entityIds.forEach((id, idx) => {
    const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
    positions[id] = {
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    };
  });

  return positions;
}

/**
 * Divide etiquetas largas en líneas legibles adaptadas para insignias de relaciones.
 */
export function splitBadgeLabel(label: string, maxLineLength = 16): string[] {
  if (!label) return [""];
  if (label.includes("\n")) {
    return label.split("\n").map((l) => l.trim()).filter(Boolean);
  }
  const words = label.trim().split(/\s+/);
  if (words.length <= 1 || label.length <= maxLineLength) {
    return [label];
  }
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxLineLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [label];
}
