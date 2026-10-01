import { useCodexStore } from "../stores/useCodexStore";
import { generateCircularLayout } from "../utils/graphGeometry";
import { WorldEntity, Relationship } from "../types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string, errorDetail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${desc}${errorDetail ? ` -> ${errorDetail}` : ""}`);
    failed++;
  }
}

console.log("=============================================================");
console.log("🧪 Novelore Desktop - Test: Persistencia Fuerte del Mapa de Relaciones");
console.log("=============================================================");

// Mock electronAPI
let savedCodexPayload: any = null;
let saveCodexCallCount = 0;

(global as any).window = {
  electronAPI: {
    saveCodex: async (payload: any) => {
      savedCodexPayload = JSON.parse(JSON.stringify(payload));
      saveCodexCallCount++;
      return { success: true };
    },
  },
};

const store = useCodexStore.getState();

// Caso 1: Hidratación con 4 argumentos
console.log("\n📌 CASO 1: Hidratación completa con posiciones");
const mockEntities: WorldEntity[] = [
  { id: "e1", category: "character", name: "Ismael", tags: [], aliases: [], attributes: {}, summary: "", notes: "", color: "#fff", relationships: [] },
  { id: "e2", category: "character", name: "Juan Carlos", tags: [], aliases: [], attributes: {}, summary: "", notes: "", color: "#000", relationships: [] },
];
const mockRels: Relationship[] = [
  { id: "r1", sourceEntityId: "e1", targetEntityId: "e2", type: "friendly", label: "Compañeros", sentiment: "neutral", controlPoint: { x: 250, y: 180 } },
];
const mockPositions: Record<string, { x: number; y: number }> = {
  e1: { x: 800, y: 350 },
  e2: { x: 350, y: 750 },
};

store.loadCodex(mockEntities, mockRels, mockPositions, []);
assert(
  useCodexStore.getState().relationshipPositions["e1"]?.x === 800 &&
  useCodexStore.getState().relationshipPositions["e1"]?.y === 350,
  "loadCodex hidrata la posición de e1 (800, 350)"
);
assert(
  useCodexStore.getState().relationshipPositions["e2"]?.x === 350 &&
  useCodexStore.getState().relationshipPositions["e2"]?.y === 750,
  "loadCodex hidrata la posición de e2 (350, 750)"
);

// Caso 2: Guardado inmediato en updateNodePosition
console.log("\n📌 CASO 2: Guardado inmediato al soltar nodo (save=true)");
saveCodexCallCount = 0;
savedCodexPayload = null;

store.updateNodePosition("e1", { x: 820, y: 360 }, true);

// Debe llamar inmediatamente a saveCodex sin esperar 500ms
assert(saveCodexCallCount === 1, "updateNodePosition con save=true llama a saveCodex inmediatamente");
assert(
  savedCodexPayload?.relationshipPositions["e1"]?.x === 820 &&
  savedCodexPayload?.relationshipPositions["e1"]?.y === 360,
  "El payload guardado en disco contiene la nueva posición de e1 (820, 360)"
);
assert(
  savedCodexPayload?.relationshipPositions["e2"]?.x === 350,
  "El payload guardado en disco mantiene intacta la posición de e2 (350, 750)"
);

// Caso 3: Guardado inmediato al soltar curva
console.log("\n📌 CASO 3: Guardado inmediato al soltar curva (save=true)");
saveCodexCallCount = 0;
savedCodexPayload = null;

store.updateRelationshipControlPoint("r1", { x: 300, y: 120 }, true);
assert(saveCodexCallCount === 1, "updateRelationshipControlPoint con save=true llama a saveCodex inmediatamente");
assert(
  savedCodexPayload?.relationships[0]?.controlPoint?.x === 300 &&
  savedCodexPayload?.relationships[0]?.controlPoint?.y === 120,
  "El controlPoint de la curva se guarda de inmediato con los nuevos valores"
);

// Caso 4: Preservación de posiciones al añadir entidad
console.log("\n📌 CASO 4: Añadir entidad no borra las posiciones existentes");
saveCodexCallCount = 0;
const e3 = store.addEntity("character", "Tercer Personaje");
assert(
  useCodexStore.getState().relationshipPositions["e1"]?.x === 820,
  "Añadir entidad preserva la posición de e1 en memoria"
);
assert(
  useCodexStore.getState().relationshipPositions["e2"]?.x === 350,
  "Añadir entidad preserva la posición de e2 en memoria"
);

// Caso 5: Algoritmo de inicialización solo posiciona nodos faltantes
console.log("\n📌 CASO 5: Algoritmo de inicialización solo posiciona nodos faltantes");
const allCurrentEntities = useCodexStore.getState().entities;
const currentPositions = useCodexStore.getState().relationshipPositions;
const missing = allCurrentEntities.filter((e) => !currentPositions[e.id]);
assert(missing.length === 1 && missing[0].id === e3.id, "Solo e3 es detectado como nodo faltante");

const allIds = allCurrentEntities.map((e) => e.id);
const generated = generateCircularLayout(allIds);
const updated = { ...currentPositions };
missing.forEach((m) => {
  if (!updated[m.id]) {
    updated[m.id] = generated[m.id] || { x: 500, y: 400 };
  }
});
store.updateNodePositions(updated, true);

assert(
  useCodexStore.getState().relationshipPositions["e1"]?.x === 820,
  "e1 conserva exactamente su posición original sin ser arrastrado al círculo"
);
assert(
  useCodexStore.getState().relationshipPositions["e2"]?.x === 350,
  "e2 conserva exactamente su posición original sin ser arrastrado al círculo"
);
assert(
  useCodexStore.getState().relationshipPositions[e3.id] !== undefined,
  "e3 recibe una posición válida"
);

console.log("\n=============================================================");
console.log(`📊 RESULTADO PRUEBAS PERSISTENCIA MAPA:`);
console.log(`   Pruebas superadas: ${passed}`);
console.log(`   Pruebas fallidas:  ${failed}`);
console.log("=============================================================");

if (failed > 0) process.exit(1);
