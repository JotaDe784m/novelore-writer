import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { useCodexStore } from "../stores/useCodexStore";
import { useProjectStore } from "../stores/useProjectStore";
import {
  DEFAULT_CATEGORY_COLORS,
  getCategoryLabel,
  getDefaultCategoryColor,
  getDefaultEntityName,
} from "../utils/codexDefaults";
import { EntityCategory, Relationship, RelationshipType, WorldEntity } from "../types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
    failed++;
  }
}

console.log("=============================================================");
console.log("🧪 Novelore Desktop - Suite de Pruebas: Subfase 2.1 (Códice Local)");
console.log("=============================================================\n");

// --- GRUPO 1: Modularidad y Límites de Líneas (<= 250 líneas) ---
console.log("📌 GRUPO 1: Modularidad y Límite de Líneas en Códice");

const codexHubDir = join(process.cwd(), "src/components/codex/hub");
const hubFiles = readdirSync(codexHubDir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));

const worldbuildingHubPath = join(process.cwd(), "src/components/codex/WorldbuildingHub.tsx");
const worldbuildingHubLines = readFileSync(worldbuildingHubPath, "utf-8").split("\n").length;
assert(
  worldbuildingHubLines <= 250,
  `WorldbuildingHub.tsx tiene <= 250 líneas (${worldbuildingHubLines} líneas)`,
  `Tiene ${worldbuildingHubLines} líneas`
);

for (const file of hubFiles) {
  const filePath = join(codexHubDir, file);
  const lineCount = readFileSync(filePath, "utf-8").split("\n").length;
  assert(
    lineCount <= 250,
    `Submódulo codex/hub/${file} tiene <= 250 líneas (${lineCount} líneas)`,
    `Tiene ${lineCount} líneas`
  );
}

const codexStorePath = join(process.cwd(), "src/stores/useCodexStore.ts");
const codexStoreLines = readFileSync(codexStorePath, "utf-8").split("\n").length;
assert(
  codexStoreLines <= 250,
  `useCodexStore.ts tiene <= 250 líneas (${codexStoreLines} líneas)`,
  `Tiene ${codexStoreLines} líneas`
);

const codexStoreTypesPath = join(process.cwd(), "src/stores/codexStoreTypes.ts");
const codexStoreTypesLines = readFileSync(codexStoreTypesPath, "utf-8").split("\n").length;
assert(
  codexStoreTypesLines <= 250,
  `codexStoreTypes.ts tiene <= 250 líneas (${codexStoreTypesLines} líneas)`,
  `Tiene ${codexStoreTypesLines} líneas`
);

const codexDefaultsPath = join(process.cwd(), "src/utils/codexDefaults.ts");
const codexDefaultsLines = readFileSync(codexDefaultsPath, "utf-8").split("\n").length;
assert(
  codexDefaultsLines <= 250,
  `codexDefaults.ts tiene <= 250 líneas (${codexDefaultsLines} líneas)`,
  `Tiene ${codexDefaultsLines} líneas`
);

// --- GRUPO 2: Inicialización e Hidratación del Store ---
console.log("\n📌 GRUPO 2: Inicialización e Hidratación de useCodexStore");

const store = useCodexStore.getState();
store.loadCodex([], []);
assert(useCodexStore.getState().entities.length === 0, "Store inicia vacío tras reset");
assert(useCodexStore.getState().relationships.length === 0, "Relaciones inician vacías tras reset");

const mockEntities: WorldEntity[] = [
  {
    id: "char-1",
    category: "character",
    name: "Aria Thorne",
    summary: "Heredera del Viento",
    tags: ["protagonista", "éter"],
    aliases: ["Viento Plateado"],
    attributes: { Rol: "Heroína", Edad: "21" },
    notes: "Notas de Aria",
    color: "#3B82F6",
  },
  {
    id: "loc-1",
    category: "location",
    name: "Fortaleza de Eldoria",
    summary: "Bastión ancestral",
    tags: ["capital"],
    attributes: { Clima: "Gélido" },
    notes: "",
    color: "#10B981",
  },
];

const mockRelationships: Relationship[] = [
  {
    id: "rel-1",
    sourceEntityId: "char-1",
    targetEntityId: "loc-1",
    type: "ally",
    label: "Protectora de",
    sentiment: "positive",
  },
];

store.loadCodex(mockEntities, mockRelationships);
assert(useCodexStore.getState().entities.length === 2, "Carga exitosa de 2 entidades");
assert(useCodexStore.getState().relationships.length === 1, "Carga exitosa de 1 relación");

// --- GRUPO 3: Taxonomía y CRUD de las 7 Categorías (incluyendo 'other' / Libre) ---
console.log("\n📌 GRUPO 3: Taxonomía y CRUD de las 7 Categorías (incluyendo Libre)");

const categoriesToTest: EntityCategory[] = [
  "character",
  "location",
  "faction",
  "item",
  "concept",
  "event",
  "other",
];

for (const cat of categoriesToTest) {
  const created = store.addEntity(cat, `Entidad ${cat}`);
  assert(created.category === cat, `Entidad creada con categoría '${cat}'`);
  assert(
    created.color === DEFAULT_CATEGORY_COLORS[cat],
    `Color semántico asignado correctamente para '${cat}' (${created.color})`
  );
  assert(
    getCategoryLabel(cat).length > 0,
    `Etiqueta UI válida para '${cat}': '${getCategoryLabel(cat)}'`
  );
}

// Probar categoría libre / neutral específicamente
const freeEntry = store.addEntity("other", "Nota Inclasificable de Cosmología");
assert(freeEntry.category === "other", "Categoría 'other' asignada correctamente");
assert(
  freeEntry.color === "#64748B",
  "Categoría 'other' adopta color pizarra neutral (#64748B)"
);
assert(
  getCategoryLabel("other") === "Libre / General",
  "Etiqueta de 'other' es 'Libre / General'"
);

// Actualización de entidad
store.updateEntity(freeEntry.id, {
  summary: "Explicación del origen del éter",
  tags: ["lore", "misterio"],
  aliases: ["El Vacío"],
});
const updatedFree = store.getEntityById(freeEntry.id);
assert(
  updatedFree?.summary === "Explicación del origen del éter",
  "Actualización de sumario en entidad libre"
);
assert(
  updatedFree?.aliases?.includes("El Vacío") === true,
  "Actualización de alias en entidad libre"
);

// Duplicación de entidad
const duplicated = store.duplicateEntity(freeEntry.id);
assert(duplicated !== null, "Entidad libre duplicada exitosamente");
assert(duplicated?.id !== freeEntry.id, "Entidad duplicada recibe nuevo ID único");
assert(
  duplicated?.name.includes("(Copia)") === true,
  "Entidad duplicada añade sufijo '(Copia)'"
);

// --- GRUPO 4: Grafo de Relaciones y Eliminación en Cascada ---
console.log("\n📌 GRUPO 4: Grafo de Relaciones y Eliminación en Cascada");

const charA = store.addEntity("character", "Marcus");
const charB = store.addEntity("character", "Valeria");
const rel = store.addRelationship(charA.id, charB.id, "rival", "Rival de la infancia");

assert(rel.sourceEntityId === charA.id, "Relación vincula correctamente entidad origen");
assert(rel.targetEntityId === charB.id, "Relación vincula correctamente entidad destino");
assert(rel.type === "rival", "Tipo de relación asignado como 'rival'");

// Obtener relaciones para una entidad
const marcusRels = store.getRelationshipsForEntity(charA.id);
assert(marcusRels.length >= 1, "getRelationshipsForEntity localiza relaciones de Marcus");

// Eliminación en cascada: al borrar charA, rel debe eliminarse automáticamente
const relId = rel.id;
store.deleteEntity(charA.id);

assert(store.getEntityById(charA.id) === undefined, "Marcus eliminado del Códice");
const remainingRels = useCodexStore.getState().relationships;
assert(
  !remainingRels.some((r) => r.id === relId),
  "Relación eliminada en cascada automáticamente al borrar la entidad",
  "La relación huérfana aún existe"
);

// --- GRUPO 5: Búsqueda, Filtros y Ordenación ---
console.log("\n📌 GRUPO 5: Búsqueda, Filtros y Ordenación");

store.setSelectedCategory("all");
store.setSearchQuery("");
store.setSortBy("default");

const summary = store.getCategoriesSummary();
assert(summary.all > 0, `Total de entradas registradas: ${summary.all}`);
assert(summary.other >= 2, `Entradas libres / general registradas: ${summary.other}`);

// Filtrado por categoría
store.setSelectedCategory("other");
const filteredOther = store.getFilteredEntities();
assert(
  filteredOther.every((e) => e.category === "other"),
  "Filtro por categoría 'other' retorna exclusivamente entradas libres"
);

// Búsqueda por texto (nombre / alias)
store.setSelectedCategory("all");
store.setSearchQuery("Eldoria");
const searchResults = store.getFilteredEntities();
assert(
  searchResults.length === 1 && searchResults[0].name.includes("Eldoria"),
  "Búsqueda por texto localiza 'Fortaleza de Eldoria'"
);

// Búsqueda por alias
store.setSearchQuery("Vacío");
const aliasResults = store.getFilteredEntities();
assert(
  aliasResults.some((e) => e.aliases?.includes("El Vacío")),
  "Búsqueda localiza entidad por coincidencia de alias"
);

// Ordenación alfabética
store.setSearchQuery("");
store.setSortBy("name_asc");
const sortedAsc = store.getFilteredEntities();
let isAlphabetical = true;
for (let i = 1; i < sortedAsc.length; i++) {
  if (sortedAsc[i - 1].name.localeCompare(sortedAsc[i].name) > 0) {
    isAlphabetical = false;
    break;
  }
}
assert(isAlphabetical, "Ordenación alfabética ascendente aplicada correctamente");

// --- GRUPO 6: Sincronización con useProjectStore ---
console.log("\n📌 GRUPO 6: Sincronización Bidireccional con useProjectStore");

// Inicializar useProjectStore con un proyecto base
useProjectStore.getState().setProject({
  id: "test-proj",
  title: "Test Novel",
  author: "Author",
  genre: "Fantasy",
  logline: "",
  synopsis: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {} as any,
  acts: [],
  entities: [],
  relationships: [],
  timelineTracks: [],
  timelineEvents: [],
  storyBeats: [],
});

const syncedEntity = store.addEntity("item", "Espada del Sol");
const projectEntities = useProjectStore.getState().project?.entities || [];
assert(
  projectEntities.some((e) => e.id === syncedEntity.id),
  "useCodexStore sincroniza entidades hacia useProjectStore.project.entities"
);

console.log("\n=============================================================");
console.log(`📊 RESULTADO DE LA SUITE SUBFASE 2.1:`);
console.log(`   Pruebas superadas: ${passed}`);
console.log(`   Pruebas fallidas:  ${failed}`);
console.log("=============================================================");

if (failed > 0) {
  process.exit(1);
}
