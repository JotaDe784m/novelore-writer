import { User, MapPin, Gem, Shield, Zap, Tag, LucideIcon } from "lucide-react";
import { CustomEntityCategory } from "../types";

type DetectedCategoryFamily =
  | "character"
  | "location"
  | "item"
  | "faction"
  | "concept"
  | "other";

const KEYWORDS_CHARACTER = [
  "personaje", "personajes", "individuo", "individuos", "gente",
  "actor", "actores", "criatura", "criaturas", "heroe", "heroes",
  "villano", "villanos", "habitante", "habitantes", "avatar", "avatares",
  "protagonista", "protagonistas", "ser", "seres", "humano", "humanos",
  "raza", "razas", "especie", "especies", "pnj", "npc", "cast", "elenco",
];

const KEYWORDS_LOCATION = [
  "lugar", "lugares", "locacion", "locaciones", "sitio", "sitios",
  "mapa", "mapas", "ciudad", "ciudades", "reino", "reinos",
  "tierra", "tierras", "pueblo", "pueblos", "escenario", "escenarios",
  "zona", "zonas", "pais", "paises", "region", "regiones",
  "mundo", "mundos", "planeta", "planetas", "continente", "continentes",
  "geografia", "castillo", "fortaleza", "templo", "isla", "islas",
];

const KEYWORDS_ITEM = [
  "objeto", "objetos", "elemento", "elementos", "cosa", "cosas",
  "reliquia", "reliquias", "artefacto", "artefactos", "item", "items",
  "arma", "armas", "equipo", "equipos", "herramienta", "herramientas",
  "tesoro", "tesoros", "botin", "recurso", "recursos", "joya", "pocion",
];

const KEYWORDS_FACTION = [
  "faccion", "facciones", "grupo", "grupos", "organizacion", "organizaciones",
  "gremio", "gremios", "clan", "clanes", "orden", "ordenes",
  "alianza", "alianzas", "ejercito", "ejercitos", "bando", "bandos",
  "secta", "sectas", "imperio", "imperios", "sindicato", "sindicatos",
  "sociedad", "sociedades", "cofradia", "cofradias", "tribu", "tribus",
];

const KEYWORDS_CONCEPT = [
  "magia", "magias", "ley", "leyes", "concepto", "conceptos",
  "poder", "poderes", "sistema", "sistemas", "hechizo", "hechizos",
  "lore", "tecnologia", "tecnologias", "filosofia", "filosofias",
  "regla", "reglas", "doctrina", "doctrinas", "misterio", "misterios",
  "ritual", "rituales", "ciencia", "disciplina",
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Detecta la familia semántica de una categoría según su nombre.
 */
function detectCategoryFamily(name: string): DetectedCategoryFamily {
  const norm = normalizeText(name);
  if (!norm) return "other";

  const words = norm.split(/[\s/\\_-]+/).filter(Boolean);

  for (const w of words) {
    if (KEYWORDS_CHARACTER.includes(w)) return "character";
    if (KEYWORDS_LOCATION.includes(w)) return "location";
    if (KEYWORDS_ITEM.includes(w)) return "item";
    if (KEYWORDS_FACTION.includes(w)) return "faction";
    if (KEYWORDS_CONCEPT.includes(w)) return "concept";
  }

  // Comprobar coincidencia por inclusión parcial
  if (KEYWORDS_CHARACTER.some((k) => norm.includes(k))) return "character";
  if (KEYWORDS_LOCATION.some((k) => norm.includes(k))) return "location";
  if (KEYWORDS_ITEM.some((k) => norm.includes(k))) return "item";
  if (KEYWORDS_FACTION.some((k) => norm.includes(k))) return "faction";
  if (KEYWORDS_CONCEPT.some((k) => norm.includes(k))) return "concept";

  return "other";
}

/**
 * Devuelve el componente vectorial Lucide según el nombre de la categoría.
 */
export function detectCategoryIcon(name: string): LucideIcon {
  const family = detectCategoryFamily(name);
  switch (family) {
    case "character":
      return User;
    case "location":
      return MapPin;
    case "item":
      return Gem;
    case "faction":
      return Shield;
    case "concept":
      return Zap;
    case "other":
    default:
      return Tag;
  }
}

/**
 * Previene nombres duplicados anexando automáticamente (1), (2), etc.
 */
export function getUniqueCategoryLabel(
  label: string,
  existingCategories: { id: string; label: string }[],
  currentId?: string
): string {
  const trimmed = label.trim();
  if (!trimmed) return "Nueva Categoría";

  const otherLabels = existingCategories
    .filter((c) => c.id !== currentId)
    .map((c) => c.label.trim().toLowerCase());

  if (!otherLabels.includes(trimmed.toLowerCase())) {
    return trimmed;
  }

  let index = 1;
  while (otherLabels.includes(`${trimmed.toLowerCase()} (${index})`)) {
    index++;
  }
  return `${trimmed} (${index})`;
}

/**
 * Categorías canónicas predeterminadas para proyectos nuevos o no inicializados.
 */
export const CANONICAL_DEFAULT_CATEGORIES: CustomEntityCategory[] = [
  { id: "character", label: "Personajes", color: "#3B82F6" },
  { id: "location", label: "Lugares", color: "#10B981" },
  { id: "item", label: "Objetos", color: "#F59E0B" },
  { id: "faction", label: "Facciones", color: "#8B5CF6" },
  { id: "concept", label: "Magia & Leyes", color: "#EC4899" },
];
