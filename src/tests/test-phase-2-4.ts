import fs from "node:fs";
import path from "node:path";
import {
  countOccurrencesInText,
  extractContextSnippets,
  getAllManuscriptScenes,
  calculateEntityMentions,
} from "../utils/mentionCounter";
import { calculateEntityDetailedMentions } from "../utils/mentionHierarchy";
import { filterAndSortEntities } from "../utils/codexDefaults";
import { NovelProject, WorldEntity } from "../types";

console.log("=============================================================");
console.log("🧪 Novelore Desktop - Suite de Pruebas: Subfase 2.4 (Menciones)");
console.log("=============================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, title: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${title}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${title}${details ? ` -> ${details}` : ""}`);
    failed++;
  }
}

const ROOT = process.cwd();

// -------------------------------------------------------------
// GRUPO 1: Modularidad y Límite de Líneas (Regla 7 de AGENTS.md)
// -------------------------------------------------------------
console.log("📌 GRUPO 1: Modularidad y Límite de Líneas (Regla 7: <= 250 líneas)");

const filesToCheck = [
  "src/utils/mentionTypes.ts",
  "src/utils/mentionHierarchy.ts",
  "src/utils/mentionCounter.ts",
  "src/components/codex/dossier/mentions/MentionsSceneCard.tsx",
  "src/components/codex/dossier/mentions/MentionsActBreakdown.tsx",
  "src/components/codex/dossier/DossierMentionsTab.tsx",
  "src/components/codex/dossier/useEntityModalLogic.ts",
  "src/components/codex/dossier/dossierTypes.ts",
  "src/components/codex/EntityModal.tsx",
  "src/components/codex/WorldbuildingHub.tsx",
  "src/components/codex/hub/CodexFilterBar.tsx",
  "src/utils/codexDefaults.ts",
  "src/stores/useCodexStore.ts",
  "src/stores/codexStoreTypes.ts",
];

for (const relPath of filesToCheck) {
  const fullPath = path.join(ROOT, relPath);
  const exists = fs.existsSync(fullPath);
  assert(exists, `Archivo ${relPath} existe`);
  if (exists) {
    const lines = fs.readFileSync(fullPath, "utf-8").split("\n").length;
    assert(lines <= 250, `${relPath} cumple <= 250 líneas (${lines} líneas)`);
  }
}

// -------------------------------------------------------------
// GRUPO 2: Conteo Unicode y Límites de Palabra en Español
// -------------------------------------------------------------
console.log("\n📌 GRUPO 2: Conteo Unicode y Límites de Palabra");

const testText = "Valeria caminaba hacia el templo. Valeriano no estaba con Valeria, pero sí Val.";
const valeriaCount = countOccurrencesInText(testText, "Valeria");
assert(valeriaCount === 2, "Cuenta exactamente 'Valeria' (2) sin falso positivo en 'Valeriano'");

const valCount = countOccurrencesInText(testText, "Val");
assert(valCount === 1, "Cuenta apodo corto 'Val' (1) respetando límite de palabra y puntuación final");

const accentedText = "Álvaro miraba el árbol caído junto al río.";
assert(countOccurrencesInText(accentedText, "Álvaro") === 1, "Reconoce nombres con tilde inicial 'Álvaro'");
assert(countOccurrencesInText(accentedText, "alvaro") === 0, "No confunde con grafías sin tilde salvo que se especifique");
assert(countOccurrencesInText(accentedText, "árbol") === 1, "Reconoce términos con tildes interiores 'árbol'");

// Nombres compuestos
const compoundText = "En la corte la llamaban La Cartógrafa Real, aunque era La Cartógrafa.";
assert(countOccurrencesInText(compoundText, "La Cartógrafa") === 2, "Cuenta términos compuestos 'La Cartógrafa' (2)");

// -------------------------------------------------------------
// GRUPO 3: Extracción de Snippets con Contexto y Estructura
// -------------------------------------------------------------
console.log("\n📌 GRUPO 3: Extracción de Citas con Contexto");

const snippets = extractContextSnippets(testText, "Valeria", 2);
assert(snippets.length === 2, `Extrae hasta el límite de citas solicitado (${snippets.length} == 2)`);
if (snippets.length > 0) {
  assert(Boolean(snippets[0].match && snippets[0].matchedTerm === "Valeria"), "El snippet incluye el término coincidente exacto");
  assert(snippets[0].before !== undefined && snippets[0].after !== undefined, "El snippet incluye contexto anterior y posterior");
}

// -------------------------------------------------------------
// GRUPO 4: Desglose Jerárquico por Actos y Capítulos
// -------------------------------------------------------------
console.log("\n📌 GRUPO 4: Desglose Jerárquico por Actos y Capítulos");

const mockProject: NovelProject = {
  id: "proj-test",
  title: "Novela de Prueba",
  summary: "Testing",
  author: "Autor Test",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  entities: [],
  relationships: [],
  timelineTracks: [],
  timelineEvents: [],
  acts: [
    {
      id: "act-1",
      title: "Acto I: El Origen",
      order: 1,
      chapters: [
        {
          id: "chap-1",
          title: "Capítulo 1",
          order: 1,
          scenes: [
            {
              id: "sc-1",
              title: "El despertar",
              content: "<p>Valeria abrió los ojos en la celda.</p>",
              order: 1,
            } as any,
            {
              id: "sc-2",
              title: "La fuga",
              content: "<p>Val corrió por el pasillo oscuro gritando.</p>",
              order: 2,
            } as any,
          ],
        },
      ],
    },
    {
      id: "act-2",
      title: "Acto II: La Tormenta",
      order: 2,
      chapters: [
        {
          id: "chap-2",
          title: "Capítulo 2",
          order: 1,
          scenes: [
            {
              id: "sc-3",
              title: "El encuentro",
              content: "<p>Valeria se reunió con los rebeldes en la taberna.</p>",
              order: 1,
            } as any,
            {
              id: "sc-4",
              title: "Tregua",
              content: "<p>La noche transcurrió en silencio sin sobresaltos.</p>",
              order: 2,
            } as any,
          ],
        },
      ],
    },
  ],
} as any;

const mockEntity: WorldEntity = {
  id: "ent-val",
  name: "Valeria",
  aliases: ["Val"],
  category: "character",
  summary: "Protagonista",
  tags: ["hero"],
  attributes: {},
  notes: "",
};

const detailed = calculateEntityDetailedMentions(mockEntity, mockProject);

assert(detailed.totalCount === 3, `Contabiliza menciones totales jerárquicas (${detailed.totalCount} == 3)`);
assert(detailed.uniqueScenesCount === 3, `Presente en 3 escenas únicas (${detailed.uniqueScenesCount} == 3)`);
assert(detailed.totalScenesInNovel === 4, `Novela tiene 4 escenas totales (${detailed.totalScenesInNovel} == 4)`);
assert(detailed.scenePresencePercentage === 75, `Porcentaje de presencia en manuscrito es 75% (${detailed.scenePresencePercentage}%)`);

assert(detailed.acts.length === 2, `Aparece en 2 actos estructurados (${detailed.acts.length})`);
if (detailed.acts.length >= 2) {
  assert(detailed.acts[0].actTitle === "Acto I: El Origen", "Primer acto identificado correctamente");
  assert(detailed.acts[0].totalCount === 2, `Acto I tiene 2 menciones (${detailed.acts[0].totalCount})`);
  assert(detailed.acts[1].actTitle === "Acto II: La Tormenta", "Segundo acto identificado correctamente");
  assert(detailed.acts[1].totalCount === 1, `Acto II tiene 1 mención (${detailed.acts[1].totalCount})`);
  assert(detailed.acts[0].percentage === 67, `Acto I tiene 67% del total (${detailed.acts[0].percentage}%)`);
  assert(detailed.acts[1].percentage === 33, `Acto II tiene 33% del total (${detailed.acts[1].percentage}%)`);
}

// -------------------------------------------------------------
// GRUPO 5: Filtro y Ordenación de "Sin menciones (unmentioned)"
// -------------------------------------------------------------
console.log("\n📌 GRUPO 5: Filtro y Ordenación por 'unmentioned'");

const entitiesForFilter: WorldEntity[] = [
  mockEntity, // Tiene 3 menciones
  {
    id: "ent-ghost",
    name: "Fantasma Olvidado",
    category: "character",
    summary: "Sin menciones",
    tags: [],
    attributes: {},
    notes: "",
  },
  {
    id: "ent-secret",
    name: "Altar Oculto",
    category: "location",
    summary: "Sin menciones",
    tags: [],
    attributes: {},
    notes: "",
  },
];

const mentionsMap = {
  "ent-val": { totalCount: 3 },
  "ent-ghost": { totalCount: 0 },
  "ent-secret": { totalCount: 0 },
};

const unmentionedEntities = filterAndSortEntities(
  entitiesForFilter,
  "all",
  "",
  "all",
  "unmentioned",
  mentionsMap
);

assert(unmentionedEntities.length === 2, `Filtra solo las 2 entidades sin menciones (${unmentionedEntities.length} == 2)`);
assert(
  unmentionedEntities.every((e) => e.id !== "ent-val"),
  "La entidad con menciones 'Valeria' queda excluida del filtro 'unmentioned'"
);
assert(
  unmentionedEntities[0].name === "Altar Oculto" && unmentionedEntities[1].name === "Fantasma Olvidado",
  "Ordena alfabéticamente las entidades sin menciones"
);

// -------------------------------------------------------------
// RESUMEN FINAL
// -------------------------------------------------------------
console.log("\n=============================================================");
console.log(`📊 RESULTADOS: ${passed} pasadas, ${failed} fallidas`);
console.log("=============================================================\n");

if (failed > 0) {
  process.exit(1);
}
