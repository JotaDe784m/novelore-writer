import { CustomEntityCategory, EntityCategory } from "../types";

export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  character: "#3B82F6", // Azul
  location: "#10B981",  // Esmeralda
  faction: "#8B5CF6",   // Violeta
  item: "#F59E0B",      // Ámbar
  concept: "#EC4899",   // Rosa
  event: "#EF4444",     // Rojo
  other: "#64748B",     // Pizarra / Neutral
};

const CATEGORY_LABELS: Record<string, string> = {
  character: "Personajes",
  location: "Lugares",
  faction: "Facciones",
  item: "Objetos & Reliquias",
  concept: "Magia & Leyes",
  other: "Libre / General",
};

export function getDefaultCategoryColor(
  category: EntityCategory,
  customCategories?: CustomEntityCategory[]
): string {
  if (customCategories) {
    const found = customCategories.find((c) => c.id === category);
    if (found?.color) return found.color;
  }
  return DEFAULT_CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLORS.other;
}

export function getDefaultEntityName(
  category: EntityCategory,
  customCategories?: CustomEntityCategory[]
): string {
  if (customCategories) {
    const found = customCategories.find((c) => c.id === category);
    if (found?.label) return `Nuevo ${found.label}`;
  }
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
    case "other":
    default:
      return "Nueva Entrada Libre";
  }
}

export function getCategoryLabel(
  category: EntityCategory,
  customCategories?: CustomEntityCategory[]
): string {
  if (customCategories) {
    const found = customCategories.find((c) => c.id === category);
    if (found?.label) return found.label;
  }
  return CATEGORY_LABELS[category] || "Elemento";
}

export function filterAndSortEntities(
  entities: import("../types").WorldEntity[],
  selectedCategory: EntityCategory | "all",
  searchQuery: string,
  selectedTag: string,
  sortBy: "default" | "most_mentions" | "least_mentions" | "unmentioned" | "name_asc",
  mentionsMap: Record<string, { totalCount: number }> = {},
  categoryOrders?: Record<string, string[]>
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
    const matchesSubtitle = entity.subtitle?.toLowerCase().includes(query);
    const matchesSummary = entity.summary?.toLowerCase().includes(query);
    const matchesAliases = entity.aliases?.some((a) => a.toLowerCase().includes(query));
    const matchesTags = entity.tags?.some((t) => t.toLowerCase().includes(query));
    const matchesAttrs = Object.values(entity.attributes || {}).some((v) =>
      v.toLowerCase().includes(query)
    );
    return Boolean(
      matchesName || matchesSubtitle || matchesSummary || matchesAliases || matchesTags || matchesAttrs
    );
  });

  if (sortBy === "default" && selectedCategory !== "all" && categoryOrders?.[selectedCategory]) {
    const order = categoryOrders[selectedCategory];
    result = [...result].sort((a, b) => {
      const idxA = order.indexOf(a.id);
      const idxB = order.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  } else if (sortBy === "name_asc") {
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
  } else if (sortBy === "unmentioned") {
    result = result
      .filter((e) => (mentionsMap[e.id]?.totalCount || 0) === 0)
      .sort((a, b) => a.name.localeCompare(b.name));
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
    "Fecha o Época",
    "Ubicación",
    "Consecuencias",
    "Participantes",
    "Causa",
    "Resultado",
  ],
  other: [
    "Tipo",
    "Origen",
    "Importancia",
    "Detalles",
    "Notas",
  ],
};
