import fs from "fs";
import path from "path";
import {
  getDefaultAttributes,
  CATEGORY_ATTRIBUTE_SUGGESTIONS,
  getDefaultCategoryColor,
  getDefaultEntityName,
} from "../utils/codexDefaults";
import { calculateEntityMentions } from "../utils/mentionCounter";
import { EntityCategory, WorldEntity } from "../types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${desc}`);
    if (details) console.error(`     Details: ${details}`);
    failed++;
  }
}

console.log("=============================================================");
console.log("🧪 Novelore Desktop - Suite de Pruebas: Subfase 2.2 (Dossiers)");
console.log("=============================================================\n");

// GRUPO 1: Modularidad y límite de 250 líneas por archivo
console.log("📌 GRUPO 1: Modularidad y Límite de Líneas en Dossier");
const dossierDir = path.resolve(process.cwd(), "src/components/codex/dossier");
const dossierFiles = fs.readdirSync(dossierDir);

dossierFiles.forEach((file) => {
  const filePath = path.join(dossierDir, file);
  const content = fs.readFileSync(filePath, "utf-8");
  const lineCount = content.split("\n").length;
  assert(
    lineCount <= 250,
    `Submódulo dossier/${file} tiene <= 250 líneas (${lineCount} líneas)`,
    `${file} supera el límite de 250 líneas: ${lineCount}`
  );
});

const entityModalPath = path.resolve(process.cwd(), "src/components/codex/EntityModal.tsx");
const entityModalLines = fs.readFileSync(entityModalPath, "utf-8").split("\n").length;
assert(
  entityModalLines <= 250,
  `EntityModal.tsx orquestador tiene <= 250 líneas (${entityModalLines} líneas)`,
  `EntityModal.tsx supera el límite de 250 líneas: ${entityModalLines}`
);

// GRUPO 2: Plantillas de Atributos Dinámicos por Categoría
console.log("\n📌 GRUPO 2: Plantillas de Atributos Dinámicos");
const categories: EntityCategory[] = [
  "character",
  "location",
  "faction",
  "item",
  "concept",
  "event",
  "other",
];

categories.forEach((cat) => {
  const attrs = getDefaultAttributes(cat);
  assert(Object.keys(attrs).length > 0, `Categoría '${cat}' tiene atributos por defecto`);
});

const charAttrs = getDefaultAttributes("character");
assert(charAttrs["Rol"] !== undefined, "Personaje incluye atributo 'Rol'");
assert(charAttrs["Motivación"] !== undefined, "Personaje incluye atributo 'Motivación'");
assert(charAttrs["Mayor Miedo"] !== undefined, "Personaje incluye atributo 'Mayor Miedo'");

const locAttrs = getDefaultAttributes("location");
assert(locAttrs["Clima"] !== undefined, "Lugar incluye atributo 'Clima'");
assert(locAttrs["Peligros"] !== undefined, "Lugar incluye atributo 'Peligros'");

const factAttrs = getDefaultAttributes("faction");
assert(factAttrs["Líder"] !== undefined, "Facción incluye atributo 'Líder'");
assert(factAttrs["Lema"] !== undefined, "Facción incluye atributo 'Lema'");

const itemAttrs = getDefaultAttributes("item");
assert(itemAttrs["Poder"] !== undefined, "Objeto incluye atributo 'Poder'");
assert(itemAttrs["Coste"] !== undefined, "Objeto incluye atributo 'Coste'");

// GRUPO 3: Sugerencias Rápidas de Atributos
console.log("\n📌 GRUPO 3: Catálogo de Sugerencias de Atributos");
categories.forEach((cat) => {
  const sugs = CATEGORY_ATTRIBUTE_SUGGESTIONS[cat];
  assert(
    Array.isArray(sugs) && sugs.length >= 4,
    `Categoría '${cat}' tiene al menos 4 sugerencias rápidas (${sugs?.length || 0})`
  );
});

// GRUPO 4: Cálculo de Menciones y Variantes de Nombre (Aliases)
console.log("\n📌 GRUPO 4: Contador de Menciones con Apodos");
const mockEntity: WorldEntity = {
  id: "char-valeria",
  category: "character",
  name: "Valeria Vance",
  aliases: ["Val", "La Cartógrafa"],
  summary: "Protagonista",
  tags: ["proscrita"],
  attributes: {},
  notes: "",
};

const mockScenes = [
  {
    scene: { id: "sc-1", title: "El taller", content: "Valeria Vance observó la lluvia. Val no temía nada." } as any,
    chapterTitle: "Capítulo 1",
    actTitle: "Acto I",
    plainText: "Valeria Vance observó la lluvia. Val no temía nada.",
  },
  {
    scene: { id: "sc-2", title: "Los muelles", content: "En los muelles llamaban a la chica La Cartógrafa." } as any,
    chapterTitle: "Capítulo 1",
    actTitle: "Acto I",
    plainText: "En los muelles llamaban a la chica La Cartógrafa.",
  },
  {
    scene: { id: "sc-3", title: "La ciudadela", content: "El inquisidor buscaba a Vance." } as any,
    chapterTitle: "Capítulo 2",
    actTitle: "Acto I",
    plainText: "El inquisidor buscaba a Vance.",
  },
];

const mentionStats = calculateEntityMentions(mockEntity, mockScenes);
assert(mentionStats.totalCount >= 3, `Contabiliza menciones totales combinadas (${mentionStats.totalCount})`);
assert(mentionStats.scenes.length >= 2, `Identifica al menos 2 escenas con menciones (${mentionStats.scenes.length})`);
assert(
  mentionStats.byTerm.some((t) => t.term === "Valeria Vance" && t.count >= 1),
  "Contabiliza menciones del nombre principal"
);
assert(
  mentionStats.byTerm.some((t) => t.term === "Val" && t.count >= 1),
  "Contabiliza menciones del apodo 'Val'"
);
assert(
  mentionStats.byTerm.some((t) => t.term === "La Cartógrafa" && t.count >= 1),
  "Contabiliza menciones del apodo 'La Cartógrafa'"
);

// GRUPO 5: Identificación y Nombres por Defecto
console.log("\n📌 GRUPO 5: Valores por Defecto de Entidades");
assert(getDefaultEntityName("character") === "Nuevo Personaje", "Nombre por defecto para personaje");
assert(getDefaultEntityName("location") === "Nuevo Lugar", "Nombre por defecto para lugar");
assert(getDefaultEntityName("other") === "Nueva Entrada Libre", "Nombre por defecto para libre");
assert(getDefaultCategoryColor("character") === "#3B82F6", "Color por defecto para personaje");
assert(getDefaultCategoryColor("event") === "#EF4444", "Color por defecto para evento");
assert(getDefaultCategoryColor("other") === "#64748B", "Color por defecto para libre");

console.log("\n=============================================================");
console.log(`📊 RESULTADO DE LA SUITE SUBFASE 2.2:`);
console.log(`   Pruebas superadas: ${passed}`);
console.log(`   Pruebas fallidas:  ${failed}`);
console.log("=============================================================");

if (failed > 0) {
  process.exit(1);
}
