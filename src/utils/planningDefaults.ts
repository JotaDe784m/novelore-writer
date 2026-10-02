import { TimelineTrack, TimelineEvent } from "../types";
import { TemporalPlaneDefinition } from "../stores/planningStoreTypes";

export const DEFAULT_TIMELINE_TRACKS: TimelineTrack[] = [
  {
    id: "track-main",
    name: "Trama Principal",
    color: "#6366f1",
    description: "Acontecimientos vertebrales de la historia",
    order: 0,
  },
  {
    id: "track-characters",
    name: "Arcos de Personajes",
    color: "#ec4899",
    description: "Desarrollo personal, relaciones y subtramas",
    order: 1,
  },
  {
    id: "track-lore",
    name: "Trasfondo y Lore",
    color: "#eab308",
    description: "Mitos, guerras previas y revelaciones históricas",
    order: 2,
  },
];

export const CANONICAL_DEFAULT_PLANES: TemporalPlaneDefinition[] = [
  {
    id: "past",
    name: "Pasado / Trasfondo",
    shortLabel: "Pasado",
    description: "Acontecimientos previos al inicio del manuscrito",
    color: "#eab308",
    badgeBg: "rgba(234, 179, 8, 0.12)",
    badgeText: "#ca8a04",
  },
  {
    id: "present",
    name: "Presente de la Narración",
    shortLabel: "Presente",
    description: "Hilo conductor activo y escenas del manuscrito",
    color: "#6366f1",
    badgeBg: "rgba(99, 102, 241, 0.12)",
    badgeText: "#6366f1",
  },
  {
    id: "future",
    name: "Futuro / Prolepsis",
    shortLabel: "Futuro",
    description: "Profecías, visiones, epílogos y consecuencias distantes",
    color: "#a855f7",
    badgeBg: "rgba(168, 85, 247, 0.12)",
    badgeText: "#9333ea",
  },
];

export const getPlaneMeta = (
  planeId: string | undefined,
  planesList: TemporalPlaneDefinition[]
): TemporalPlaneDefinition => {
  if (!planeId) {
    return {
      id: "unassigned",
      name: "Sin Plano",
      shortLabel: "General",
      color: "#94a3b8",
      badgeBg: "rgba(148, 163, 184, 0.12)",
      badgeText: "#64748b",
    };
  }

  const found = planesList.find((p) => p.id === planeId);
  if (found) return found;

  const canonical = CANONICAL_DEFAULT_PLANES.find((p) => p.id === planeId);
  if (canonical) return canonical;

  return {
    id: planeId,
    name: planeId,
    shortLabel: planeId.length > 10 ? planeId.slice(0, 10) + "..." : planeId,
    color: "#6366f1",
    badgeBg: "rgba(99, 102, 241, 0.12)",
    badgeText: "#6366f1",
    isCustom: true,
  };
};

export const filterTimelineEvents = (
  events: TimelineEvent[],
  planeFilter: "all" | string,
  trackFilter: string | null,
  searchQuery: string
): TimelineEvent[] => {
  const query = searchQuery.trim().toLowerCase();

  return events.filter((ev) => {
    if (planeFilter !== "all") {
      const plane = ev.temporalPlane || "present";
      if (plane !== planeFilter) return false;
    }

    if (trackFilter && ev.trackId !== trackFilter) {
      return false;
    }

    if (query) {
      const matchTitle = ev.title.toLowerCase().includes(query);
      const matchSummary = (ev.summary || "").toLowerCase().includes(query);
      const matchDate = (ev.date || "").toLowerCase().includes(query);
      if (!matchTitle && !matchSummary && !matchDate) return false;
    }

    return true;
  });
};

export const sortTimelineEvents = (events: TimelineEvent[]): TimelineEvent[] => {
  return [...events].sort((a, b) => {
    const orderA = a.order ?? a.position ?? 0;
    const orderB = b.order ?? b.position ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title);
  });
};
