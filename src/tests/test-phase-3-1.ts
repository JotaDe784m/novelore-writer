import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { usePlanningStore } from "../stores/usePlanningStore";
import {
  DEFAULT_TIMELINE_TRACKS,
  CANONICAL_DEFAULT_PLANES,
  filterTimelineEvents,
  sortTimelineEvents,
} from "../utils/planningDefaults";
import {
  createEventFromCodex,
  resolveEventEntities,
} from "../utils/planningSync";
import { CodexEntity } from "../types";

console.log("Iniciando bateria de pruebas automatizadas: Subfase 3.1");

// Test 1: Archivos modulares <= 250 lineas
const filesToCheck = [
  "src/stores/planningStoreTypes.ts",
  "src/stores/usePlanningStore.ts",
  "src/utils/planningDefaults.ts",
  "src/utils/planningSync.ts",
  "src/components/planning/PlanningDashboard.tsx",
  "src/components/planning/TimelineView.tsx",
  "src/components/planning/timeline/timelineTypes.ts",
  "src/components/planning/timeline/TimelineHeader.tsx",
  "src/components/planning/timeline/TimelineEventCard.tsx",
  "src/components/planning/timeline/TimelineTrackRow.tsx",
  "src/components/planning/timeline/TimelineEventModal.tsx",
  "src/components/planning/timeline/TimelineTrackModal.tsx",
  "src/components/planning/timeline/TimelinePlaneModal.tsx",
  "src/components/planning/timeline/DossierEntityCard.tsx",
  "src/components/planning/timeline/EventDossierEntities.tsx",
  "src/components/planning/timeline/useTimelineLogic.ts",
  "src/components/planning/CorkboardView.tsx",
  "src/components/planning/OutlineGridView.tsx",
];

for (const relPath of filesToCheck) {
  const fullPath = path.resolve(process.cwd(), relPath);
  assert(fs.existsSync(fullPath), `El archivo debe existir: ${relPath}`);
  const lines = fs.readFileSync(fullPath, "utf-8").split("\n").length;
  assert(
    lines <= 250,
    `El archivo ${relPath} tiene ${lines} lineas (debe ser <= 250, tiene ${lines})`
  );
}
console.log("OK: Verificacion de limites de lineas (<= 250) superada.");

// Test 2: Verificacion de CERO EMOJIS en archivos de planificacion y stores
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
for (const relPath of filesToCheck) {
  const fullPath = path.resolve(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, "utf-8");
  assert(
    !emojiRegex.test(content),
    `El archivo ${relPath} contiene emojis no permitidos`
  );
}
console.log("OK: Verificacion de cero emojis superada.");

// Test 3: Planos temporales canonicos
assert.strictEqual(CANONICAL_DEFAULT_PLANES.length, 3);
assert.strictEqual(CANONICAL_DEFAULT_PLANES[0].id, "past");
assert.strictEqual(CANONICAL_DEFAULT_PLANES[1].id, "present");
assert.strictEqual(CANONICAL_DEFAULT_PLANES[2].id, "future");
console.log("OK: Planos temporales canonicos verificados.");

// Test 4: usePlanningStore inicializacion y reseteo
const store = usePlanningStore.getState();
store.resetPlanning();
assert.strictEqual(usePlanningStore.getState().tracks.length, DEFAULT_TIMELINE_TRACKS.length);
assert.strictEqual(usePlanningStore.getState().events.length, 0);

// Test 5: CRUD de Pistas
const trackA = store.addTrack({
  name: "Trama Principal",
  color: "#6366f1",
  description: "Hilo principal",
});
const trackB = store.addTrack({
  name: "Subtrama",
  color: "#f59e0b",
  description: "Camino secundario",
});

// Test 6: Creacion de 3 Eventos en la misma pista
const evA = store.addEvent({
  title: "Evento Alpha",
  summary: "Primero en orden",
  trackId: trackA,
  temporalPlane: "present",
});
const evB = store.addEvent({
  title: "Evento Beta",
  summary: "Segundo en orden",
  trackId: trackA,
  temporalPlane: "present",
});
const evC = store.addEvent({
  title: "Evento Gamma",
  summary: "Tercero en orden",
  trackId: trackA,
  temporalPlane: "present",
});

// Orden inicial: [evA, evB, evC]
let trackAEvents = sortTimelineEvents(
  usePlanningStore.getState().events.filter((e) => e.trackId === trackA)
);
assert.deepStrictEqual(
  trackAEvents.map((e) => e.title),
  ["Evento Alpha", "Evento Beta", "Evento Gamma"]
);

// Test 7: Reordenacion dentro de la MISMA pista: Mover Evento Gamma DELANTE de Evento Alpha
store.moveEventToTrack(evC, trackA, evA, "before");
trackAEvents = sortTimelineEvents(
  usePlanningStore.getState().events.filter((e) => e.trackId === trackA)
);
assert.deepStrictEqual(
  trackAEvents.map((e) => e.title),
  ["Evento Gamma", "Evento Alpha", "Evento Beta"]
);
console.log("OK: Reordenacion en la misma pista (poner detras o delante) verificada.");

// Mover Evento Alpha DESPUES de Evento Beta -> [Gamma, Beta, Alpha]
store.moveEventToTrack(evA, trackA, evB, "after");
trackAEvents = sortTimelineEvents(
  usePlanningStore.getState().events.filter((e) => e.trackId === trackA)
);
assert.deepStrictEqual(
  trackAEvents.map((e) => e.title),
  ["Evento Gamma", "Evento Beta", "Evento Alpha"]
);
console.log("OK: Reordenacion con posicion 'after' verificada.");

// Test 8: Mover evento entre pistas distintas y colocarlo en posicion especifica
store.moveEventToTrack(evB, trackB, 0);
const trackBEvents = sortTimelineEvents(
  usePlanningStore.getState().events.filter((e) => e.trackId === trackB)
);
assert.strictEqual(trackBEvents.length, 1);
assert.strictEqual(trackBEvents[0].id, evB);

trackAEvents = sortTimelineEvents(
  usePlanningStore.getState().events.filter((e) => e.trackId === trackA)
);
assert.strictEqual(trackAEvents.length, 2);
console.log("OK: Movimiento entre pistas distintas verificado.");

// Test 9: Planos Temporales Personalizados y Eliminacion de cualquier plano
const customPlaneId = store.addTemporalPlane({
  name: "Mito Fundacional",
  shortLabel: "Mito",
  description: "Era cosmica anterior",
  color: "#06b6d4",
});
assert(usePlanningStore.getState().temporalPlanes.some((p) => p.id === customPlaneId));

store.updateEvent(evA, { temporalPlane: customPlaneId });
const updatedEv = usePlanningStore.getState().events.find((e) => e.id === evA);
assert.strictEqual(updatedEv?.temporalPlane, customPlaneId);

// Eliminar un plano por defecto (Pasado) para confirmar libertad total
store.deleteTemporalPlane("past");
assert(!usePlanningStore.getState().temporalPlanes.some((p) => p.id === "past"));
// Restaurar planos por defecto
store.restoreDefaultTemporalPlanes();
assert(usePlanningStore.getState().temporalPlanes.some((p) => p.id === "past"));
console.log("OK: CRUD de planos y soberania de eliminacion verificado.");

// Test 10: Filtrado y busqueda
const allEvents = usePlanningStore.getState().events;
const filteredSearch = filterTimelineEvents(allEvents, "all", null, "Alpha");
assert.strictEqual(filteredSearch.length, 1);
assert.strictEqual(filteredSearch[0].id, evA);

// Test 11: Sincronizacion con Codice
const fakeCodexEntity: CodexEntity = {
  id: "codex-ev-1",
  name: "Fundacion del Imperio",
  category: "event",
  summary: "Evento fundacional milenario",
  aliases: [],
  tags: ["historia", "fundacion"],
  attributes: {},
  notes: "",
};

const partialEvent = createEventFromCodex(fakeCodexEntity, trackA, 3);
assert.strictEqual(partialEvent.title, "Fundacion del Imperio");
assert.strictEqual(partialEvent.temporalPlane, "past");
assert.strictEqual(partialEvent.codexEntityId, "codex-ev-1");

const resolved = resolveEventEntities(
  {
    id: "ev-test",
    title: "Test",
    summary: "Test summary",
    trackId: trackA,
    codexEntityId: "codex-ev-1",
  },
  [fakeCodexEntity]
);
assert.strictEqual(resolved.codexEvent?.id, "codex-ev-1");

// Test 12: Limpieza final
store.deleteTrack(trackA);
store.deleteTrack(trackB);
console.log("OK: Limpieza final completada.");
console.log("TODAS LAS PRUEBAS AUTOMATIZADAS DE LA SUBFASE 3.1 SUPERADAS CON EXITO.");
