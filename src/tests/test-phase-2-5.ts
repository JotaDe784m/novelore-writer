import fs from "node:fs";
import path from "node:path";
import {
  calculateBezierControlPoint,
  getBezierMidpoint,
  calculateAutoControlPoint,
  generateCircularLayout,
  splitBadgeLabel,
} from "../utils/graphGeometry";
import {
  BASE_RELATIONSHIP_PRESETS,
  RELATIONSHIP_PRESETS,
  getRelationshipCategory,
  getRelationshipColor,
  getRelationshipLineStyle,
  getStrokeDashArray,
} from "../components/codex/relations/relationTypes";
import { RelationshipCategory } from "../types";

console.log("=============================================================");
console.log("🧪 Novelore Desktop - Suite de Pruebas: Subfase 2.5 (Grafo de Relaciones)");
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
  "src/utils/graphGeometry.ts",
  "src/components/codex/relations/relationTypes.ts",
  "src/components/codex/relations/useRelationshipMapLogic.ts",
  "src/components/codex/relations/RelationshipMapHeader.tsx",
  "src/components/codex/relations/RelationshipLinksLayer.tsx",
  "src/components/codex/relations/RelationshipNodesLayer.tsx",
  "src/components/codex/relations/RelationshipDetailSidebar.tsx",
  "src/components/codex/relations/RelationshipModal.tsx",
  "src/components/codex/relations/RelationshipCategorySelector.tsx",
  "src/components/codex/relations/RelationshipCategoryForm.tsx",
  "src/components/codex/relations/DeleteRelationshipDialog.tsx",
  "src/components/codex/RelationshipMapView.tsx",
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
// GRUPO 2: Matemática de Curvas Bezier Cuadráticas
// -------------------------------------------------------------
console.log("\n📌 GRUPO 2: Matemática de Curvas Bezier Cuadráticas");

const p0 = { x: 100, y: 100 };
const p1 = { x: 300, y: 100 };
const targetBadge = { x: 200, y: 180 };

const cp = calculateBezierControlPoint(p0, p1, targetBadge);
assert(cp.x === 200, `Punto de control X calculado correctamente (${cp.x} == 200)`);
assert(cp.y === 260, `Punto de control Y calculado correctamente (${cp.y} == 260)`);

const evaluated = getBezierMidpoint(p0, p1, cp);
assert(
  Math.abs(evaluated.x - targetBadge.x) <= 1 && Math.abs(evaluated.y - targetBadge.y) <= 1,
  `Curva evaluada en t=0.5 pasa por la insignia deseada (${evaluated.x}, ${evaluated.y})`
);

// -------------------------------------------------------------
// GRUPO 3: Separación Automática de Múltiples Enlaces entre el Mismo Par
// -------------------------------------------------------------
console.log("\n📌 GRUPO 3: Separación Automática de Enlaces Múltiples");

const singleRelCP = calculateAutoControlPoint(p0, p1, 0, 1);
assert(singleRelCP === undefined, "Enlace único no requiere curvatura artificial (recta por defecto)");

const pairRel0 = calculateAutoControlPoint(p0, p1, 0, 2);
const pairRel1 = calculateAutoControlPoint(p0, p1, 1, 2);
assert(Boolean(pairRel0 && pairRel1), "Genera puntos de control automáticos para par de enlaces");
if (pairRel0 && pairRel1) {
  assert(pairRel0.y !== pairRel1.y, `Diferencia de altura entre arcos (${pairRel0.y} vs ${pairRel1.y})`);
}

// -------------------------------------------------------------
// GRUPO 4: Generación de Distribución Circular
// -------------------------------------------------------------
console.log("\n📌 GRUPO 4: Generación de Distribución Circular");

const mockEntities = ["ent-1", "ent-2", "ent-3", "ent-4", "ent-5"];
const layout = generateCircularLayout(mockEntities, 500, 500, 200);

assert(Object.keys(layout).length === 5, "Genera posiciones para todas las entidades");
mockEntities.forEach((id) => {
  const pos = layout[id];
  assert(
    typeof pos?.x === "number" && !isNaN(pos.x) && typeof pos?.y === "number" && !isNaN(pos.y),
    `Coordenadas válidas para ${id}`
  );
  // Radio aproximado debe ser cercano a 250
  const dist = Math.round(Math.hypot(pos.x - 500, pos.y - 500));
  assert(Math.abs(dist - 250) <= 2, `Radio equidistante respetado (${dist}px)`);
});

// -------------------------------------------------------------
// GRUPO 5: División Inteligente de Etiquetas de Insignias
// -------------------------------------------------------------
console.log("\n📌 GRUPO 5: División de Etiquetas de Insignias");

const singleWord = splitBadgeLabel("Amistad");
assert(singleWord.length === 1 && singleWord[0] === "Amistad", "Palabra corta permanece en 1 línea");

const longLabel = splitBadgeLabel("Odio jurado desde la infancia", 15);
assert(longLabel.length >= 2, `Divide etiqueta larga en múltiples líneas legibles (${longLabel.length} líneas)`);

const manualNewlines = splitBadgeLabel("Vínculo de Sangre\ny Pacto Secreto");
assert(manualNewlines.length === 2, "Respeta saltos de línea manuales introducidos por el autor");

// -------------------------------------------------------------
// GRUPO 6: Categorías de Relación Personalizadas, Estilos de Línea y Paleta
// -------------------------------------------------------------
console.log("\n📌 GRUPO 6: Categorías Personalizadas, Estilos de Línea y Paleta");

assert(BASE_RELATIONSHIP_PRESETS.length === 6, "Se definen 6 arquetipos base de relaciones");
const secretPreset = BASE_RELATIONSHIP_PRESETS.find((p) => p.id === "secret");
assert(secretPreset?.lineStyle === "dashed", "Preset de 'secret' usa estilo discontinuo (dashed)");

const otherPreset = RELATIONSHIP_PRESETS.find((p) => p.id === "other");
assert(Boolean(otherPreset), "Preset 'other' (Libre / Personalizado) existe para compatibilidad previa");

assert(getRelationshipColor("friendly") === "#10B981", "Color esmeralda para Alianza/Amistad");
assert(getRelationshipColor("hostile") === "#EF4444", "Color rojo para Hostilidad/Enemistad");
assert(getRelationshipColor("romantic") === "#EC4899", "Color rosa para Romance");

// Categorías personalizadas definidas por el autor
const customCategories: RelationshipCategory[] = [
  {
    id: "cat_magical_nexus",
    label: "Nexo Mágico Arcano",
    badge: "Nexo Mágico",
    color: "#8B5CF6",
    lineStyle: "dotted",
    description: "Flujo de maná compartido entre oráculos y santuarios.",
  },
  {
    id: "cat_trade_route",
    label: "Ruta Comercial Ancestral",
    badge: "Ruta",
    color: "#F59E0B",
    lineStyle: "dashed",
  },
  {
    id: "cat_feud",
    label: "Feudo Territorial",
    badge: "Feudo",
    color: "#DC2626",
    lineStyle: "solid",
  },
];

// Comprobaciones de getRelationshipCategory
const nexusCat = getRelationshipCategory("cat_magical_nexus", customCategories);
assert(nexusCat !== undefined, "Encuentra categoría personalizada por ID");
assert(nexusCat?.label === "Nexo Mágico Arcano", "Etiqueta personalizada preservada");
assert(nexusCat?.lineStyle === "dotted", "Estilo de línea dotted preservado");

const friendlyCat = getRelationshipCategory("friendly", customCategories);
assert(friendlyCat?.label === "Alianza / Amistad", "Resuelve arquetipo base por ID");

// Comprobaciones de getRelationshipColor con categorías personalizadas
assert(
  getRelationshipColor("cat_magical_nexus", customCategories) === "#8B5CF6",
  "Color personalizado resuelto correctamente para categoría personalizada"
);
assert(
  getRelationshipColor("cat_trade_route", customCategories) === "#F59E0B",
  "Color resuelto para segunda categoría personalizada"
);

// Comprobaciones de getRelationshipLineStyle
assert(
  getRelationshipLineStyle("cat_magical_nexus", customCategories) === "dotted",
  "Estilo 'dotted' resuelto para categoría personalizada"
);
assert(
  getRelationshipLineStyle("cat_trade_route", customCategories) === "dashed",
  "Estilo 'dashed' resuelto para categoría personalizada"
);
assert(
  getRelationshipLineStyle("cat_feud", customCategories) === "solid",
  "Estilo 'solid' resuelto para categoría personalizada"
);
assert(
  getRelationshipLineStyle("friendly", customCategories) === "solid",
  "Estilo por defecto 'solid' resuelto para preset amistoso"
);
assert(
  getRelationshipLineStyle("secret", customCategories) === "dashed",
  "Estilo 'dashed' resuelto para preset secreto"
);

// Comprobaciones de getStrokeDashArray
assert(getStrokeDashArray("solid") === undefined, "getStrokeDashArray('solid') devuelve undefined (línea continua)");
assert(getStrokeDashArray(undefined) === undefined, "getStrokeDashArray(undefined) devuelve undefined");
assert(getStrokeDashArray("dashed") === "6 4", "getStrokeDashArray('dashed') devuelve '6 4'");
assert(getStrokeDashArray("dotted") === "2 4", "getStrokeDashArray('dotted') devuelve '2 4'");

// -------------------------------------------------------------
// RESUMEN FINAL
// -------------------------------------------------------------
console.log("\n=============================================================");
console.log(`📊 RESULTADOS: ${passed} pasadas, ${failed} fallidas`);
console.log("=============================================================\n");

if (failed > 0) {
  process.exit(1);
}
