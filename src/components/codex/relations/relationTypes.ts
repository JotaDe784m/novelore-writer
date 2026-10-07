import { NovelProject, RelationshipCategory, RelationshipLineStyle, RelationshipType } from "../../../types";

export interface RelationshipMapViewProps {
  project: NovelProject;
  onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
  onBackToCodex: () => void;
  onOpenBoard?: () => void;
  onOpenEntityBoard?: (entityId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
}

export type ExtendedRelationshipType =
  | RelationshipType
  | "other"
  | "custom";

export interface RelationshipPreset {
  id: ExtendedRelationshipType;
  label: string;
  badge: string;
  defaultSentiment: "positive" | "negative" | "neutral" | "complex";
  color: string;
  lineStyle: RelationshipLineStyle;
  description: string;
}

export const BASE_RELATIONSHIP_PRESETS: RelationshipPreset[] = [
  {
    id: "friendly",
    label: "Alianza / Amistad",
    badge: "Alianza",
    defaultSentiment: "positive",
    color: "#10B981",
    lineStyle: "solid",
    description: "Vínculo de confianza, camaradería o lealtad mutua.",
  },
  {
    id: "hostile",
    label: "Enemistad / Hostilidad",
    badge: "Enemistad",
    defaultSentiment: "negative",
    color: "#EF4444",
    lineStyle: "solid",
    description: "Rivalidad abierta, odio jurado o persecución.",
  },
  {
    id: "romantic",
    label: "Romance / Pasión",
    badge: "Romance",
    defaultSentiment: "positive",
    color: "#EC4899",
    lineStyle: "solid",
    description: "Atracción afectiva, amor correspondido o tensión amorosa.",
  },
  {
    id: "mentor",
    label: "Mentor / Aprendiz",
    badge: "Mentoría",
    defaultSentiment: "positive",
    color: "#3B82F6",
    lineStyle: "solid",
    description: "Enseñanza, guía espiritual, mágica o intelectual.",
  },
  {
    id: "family",
    label: "Familia / Sangre",
    badge: "Familia",
    defaultSentiment: "neutral",
    color: "#8B5CF6",
    lineStyle: "solid",
    description: "Lazos de parentesco, dinastía, adopción o linaje.",
  },
  {
    id: "secret",
    label: "Pacto Secreto / Traición",
    badge: "Secreto",
    defaultSentiment: "complex",
    color: "#F59E0B",
    lineStyle: "dashed",
    description: "Alianza en las sombras, espionaje o traición inminente.",
  },
];

export const RELATIONSHIP_PRESETS: RelationshipPreset[] = [
  ...BASE_RELATIONSHIP_PRESETS,
  {
    id: "other",
    label: "Libre / Personalizado",
    badge: "Libre",
    defaultSentiment: "neutral",
    color: "#64748B",
    lineStyle: "solid",
    description: "Vínculo abierto con etiqueta libre definida por el autor.",
  },
];

export function getRelationshipCategory(
  type: string,
  customCategories: RelationshipCategory[] = []
): RelationshipCategory | undefined {
  const custom = customCategories.find((c) => c.id === type);
  if (custom) return custom;
  const preset = RELATIONSHIP_PRESETS.find((p) => p.id === type);
  if (preset) {
    return {
      id: preset.id,
      label: preset.label,
      badge: preset.badge,
      color: preset.color,
      lineStyle: preset.lineStyle || "solid",
      description: preset.description,
    };
  }
  return undefined;
}

export function getRelationshipColor(
  type: string,
  customCategoriesOrSentiment?: RelationshipCategory[] | string,
  sentiment?: string,
  label?: string
): string {
  if (Array.isArray(customCategoriesOrSentiment)) {
    const custom = customCategoriesOrSentiment.find(
      (c) =>
        c.id === type ||
        (label && c.label.toLowerCase() === label.toLowerCase()) ||
        c.label.toLowerCase() === type.toLowerCase()
    );
    if (custom) return custom.color;
  }
  const found = RELATIONSHIP_PRESETS.find(
    (p) =>
      p.id === type ||
      (label && p.label.toLowerCase() === label.toLowerCase()) ||
      p.label.toLowerCase() === type.toLowerCase()
  );
  if (found) return found.color;

  const actualSentiment =
    typeof customCategoriesOrSentiment === "string" ? customCategoriesOrSentiment : sentiment;
  switch (actualSentiment) {
    case "positive":
      return "#10B981";
    case "negative":
      return "#EF4444";
    case "complex":
      return "#F59E0B";
    default:
      return "#64748B";
  }
}

export function getRelationshipLineStyle(
  type: string,
  customCategories: RelationshipCategory[] = []
): RelationshipLineStyle {
  const custom = customCategories.find((c) => c.id === type);
  if (custom?.lineStyle) return custom.lineStyle;
  const found = RELATIONSHIP_PRESETS.find((p) => p.id === type);
  return found?.lineStyle || "solid";
}

export function getStrokeDashArray(lineStyle?: RelationshipLineStyle): string | undefined {
  switch (lineStyle) {
    case "dashed":
      return "6 4";
    case "dotted":
      return "2 4";
    case "solid":
    default:
      return undefined;
  }
}
