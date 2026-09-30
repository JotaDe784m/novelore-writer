import { EntityCategory } from "../types";

export const DEFAULT_CATEGORY_COLORS: Record<EntityCategory, string> = {
  character: "#3B82F6", // Azul
  location: "#10B981",  // Esmeralda
  faction: "#8B5CF6",   // Violeta
  item: "#F59E0B",      // Ámbar
  concept: "#EC4899",   // Rosa
  event: "#EF4444",     // Rojo
  other: "#64748B",     // Pizarra / Neutral
};

const CATEGORY_LABELS: Record<EntityCategory, string> = {
  character: "Personajes",
  location: "Lugares",
  faction: "Facciones",
  item: "Objetos & Reliquias",
  concept: "Magia & Leyes",
  event: "Eventos Históricos",
  other: "Libre / General",
};

const CATEGORY_DESCRIPTIONS: Record<EntityCategory, string> = {
  character: "Protagonistas, antagonistas y personajes secundarios del elenco.",
  location: "Reinos, ciudades, fortalezas, regiones y biomas geográficos.",
  faction: "Gremios, órdenes militares, casas dinásticas y organizaciones.",
  item: "Artefactos legendarios, armas, reliquias y documentos clave.",
  concept: "Sistemas mágicos, religiones, leyes cósmicas y filosofía.",
  event: "Hitos históricos, batallas, cataclismos y tratados pasados.",
  other: "Fichas abiertas, notas de trasfondo, criaturas o elementos inclasificables.",
};

export function getDefaultCategoryColor(category: EntityCategory): string {
  return DEFAULT_CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLORS.other;
}

export function getDefaultEntityName(category: EntityCategory): string {
  switch (category) {
    case "character":
      return "Nuevo Personaje";
    case "location":
      return "Nuevo Lugar";
    case "faction":
      return "Nueva Facción";
    case "item":
      return "Nuevo Objeto";
    case "concept":
      return "Nuevo Concepto";
    case "event":
      return "Nuevo Evento";
    case "other":
    default:
      return "Nueva Entrada Libre";
  }
}

export function getCategoryLabel(category: EntityCategory): string {
  return CATEGORY_LABELS[category] || "Elemento";
}

export function filterAndSortEntities(
  entities: import("../types").WorldEntity[],
  selectedCategory: EntityCategory | "all",
  searchQuery: string,
  selectedTag: string,
  sortBy: "default" | "most_mentions" | "least_mentions" | "name_asc",
  mentionsMap: Record<string, { totalCount: number }> = {}
): import("../types").WorldEntity[] {
  const query = searchQuery.trim().toLowerCase();

  let result = entities.filter((entity) => {
    const matchesCategory =
      selectedCategory === "all" || entity.category === selectedCategory;
    if (!matchesCategory) return false;

    const matchesTag =
      selectedTag === "all" || (entity.tags && entity.tags.includes(selectedTag));
    if (!matchesTag) return false;

    if (!query) return true;

    const matchesName = entity.name.toLowerCase().includes(query);
    const matchesSummary = entity.summary?.toLowerCase().includes(query);
    const matchesAliases = entity.aliases?.some((a) =>
      a.toLowerCase().includes(query)
    );
    return Boolean(matchesName || matchesSummary || matchesAliases);
  });

  if (sortBy === "name_asc") {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "most_mentions") {
    result = [...result].sort((a, b) => {
      const mA = mentionsMap[a.id]?.totalCount || 0;
      const mB = mentionsMap[b.id]?.totalCount || 0;
      return mB - mA;
    });
  } else if (sortBy === "least_mentions") {
    result = [...result].sort((a, b) => {
      const mA = mentionsMap[a.id]?.totalCount || 0;
      const mB = mentionsMap[b.id]?.totalCount || 0;
      return mA - mB;
    });
  }

  return result;
}

export function getDefaultAttributes(category: EntityCategory): Record<string, string> {
  switch (category) {
    case "character":
      return {
        Rol: "Protagonista / Aliado",
        Edad: "25 años",
        Motivación: "¿Qué persigue el personaje?",
        "Mayor Miedo": "¿A qué teme más en el mundo?",
        "Secreto Inconfesable": "Un secreto que nadie sabe...",
        "Rasgo Físico": "Ojos, cicatrices, porte...",
      };
    case "location":
      return {
        Tipo: "Ciudad / Fortaleza / Mazmorra",
        Clima: "Brumoso y frío",
        Peligros: "¿Qué amenazas acechan?",
        Atmósfera: "Sensaciones de luz, sonido y olor...",
      };
    case "faction":
      return {
        Líder: "Nombre del gobernante o canciller",
        Lema: "'Lema de la orden'",
        Recursos: "Ejército, magia, dinero...",
      };
    case "item":
      return {
        Origen: "Forjado por...",
        Poder: "Efecto o propiedad mágica",
        Coste: "Precio o peligro de usarlo",
      };
    case "concept":
      return {
        Tipo: "Magia dura / Tecnología / Ley",
        Reglas: "Límites y condiciones",
        Peligro: "Consecuencias de abuso",
      };
    case "event":
      return {
        Época: "Año o era",
        Bandos: "Quiénes participaron",
        Consecuencias: "Impacto en el presente",
      };
    case "other":
    default:
      return {
        Tipo: "Libre / General",
        Notas: "Anotaciones o contexto general...",
      };
  }
}

export const CATEGORY_ATTRIBUTE_SUGGESTIONS: Record<EntityCategory, string[]> = {
  character: [
    "Ocupación",
    "Alineamiento",
    "Arma Principal",
    "Lealtad",
    "Habilidad / Poder",
    "Especie / Raza",
    "Debilidad",
    "Rasgo Físico",
    "Voz / Forma de hablar",
    "Meta inmediata",
  ],
  location: [
    "Clima",
    "Gobernante",
    "Población",
    "Recurso Clave",
    "Peligro / Amenaza",
    "Defensas",
    "Leyenda local",
  ],
  faction: [
    "Líder",
    "Sede Central",
    "Ideología",
    "Enemigos Jurados",
    "Influencia",
    "Ritos de Iniciación",
  ],
  item: [
    "Portador Actual",
    "Origen",
    "Material",
    "Poder Oculto",
    "Maldición",
    "Paradero Anterior",
  ],
  concept: [
    "Regla Fundamental",
    "Coste / Sacrificio",
    "Origen Mítico",
    "Alcance y Limitaciones",
    "Practicantes Conocidos",
  ],
  event: [
    "Época",
    "Bandos",
    "Consecuencias",
    "Tratado / Pacto",
    "Reliquia Perdida",
    "Mártir / Héroe",
  ],
  other: [
    "Tipo",
    "Origen",
    "Importancia",
    "Detalles",
    "Notas",
  ],
};
