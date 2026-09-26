import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { useManuscriptStore } from "../stores/useManuscriptStore";
import { countWords } from "../utils/formatters";
import { Scene, Act, SceneStatus, SceneNotesTemplate, SceneNoteCard } from "../types";
import { SCENE_NOTE_TEMPLATES } from "../components/editor/inspector/sceneNotesTemplates";

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
console.log("🧪 Novelore Desktop - Suite de Pruebas: Subfase 1.5 (Scene Inspector)");
console.log("=============================================================\n");

// --- GRUPO 1: Modularidad y Límites de Líneas (<= 250 líneas) ---
console.log("📌 GRUPO 1: Modularidad y Límite de Líneas en el Inspector");
const inspectorDir = join(process.cwd(), "src/components/editor/inspector");
const inspectorFiles = readdirSync(inspectorDir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));

const sceneInspectorPath = join(process.cwd(), "src/components/editor/SceneInspector.tsx");
const sceneInspectorLines = readFileSync(sceneInspectorPath, "utf-8").split("\n").length;
assert(
  sceneInspectorLines <= 250,
  `SceneInspector.tsx tiene <= 250 líneas (${sceneInspectorLines} líneas)`,
  `Tiene ${sceneInspectorLines} líneas`
);

for (const file of inspectorFiles) {
  const filePath = join(inspectorDir, file);
  const lineCount = readFileSync(filePath, "utf-8").split("\n").length;
  assert(
    lineCount <= 250,
    `Submódulo inspector/${file} tiene <= 250 líneas (${lineCount} líneas)`,
    `Tiene ${lineCount} líneas`
  );
}

// --- GRUPO 2: Purga Total de Código y Endpoints de IA ---
console.log("\n📌 GRUPO 2: Purga de Endpoints y Código Heredado de IA");
const sceneInspectorContent = readFileSync(sceneInspectorPath, "utf-8");
assert(
  !sceneInspectorContent.includes("/api/ai"),
  "SceneInspector.tsx no contiene llamadas a /api/ai",
  "Se encontró '/api/ai'"
);
assert(
  !sceneInspectorContent.includes("aiLoading"),
  "SceneInspector.tsx no contiene estados aiLoading",
  "Se encontró 'aiLoading'"
);
assert(
  !sceneInspectorContent.includes("aiResult"),
  "SceneInspector.tsx no contiene estados aiResult",
  "Se encontró 'aiResult'"
);

for (const file of inspectorFiles) {
  const content = readFileSync(join(inspectorDir, file), "utf-8");
  assert(
    !content.includes("/api/ai") && !content.includes("aiResult"),
    `Submódulo ${file} no contiene código ni dependencias de IA`
  );
}

// --- GRUPO 3: Sistema Flexible de Notas y Tarjetas de Escena ---
console.log("\n📌 GRUPO 3: Sistema Flexible de Notas y Tarjetas de Escena");
const initialAct: Act = {
  id: "act-test",
  title: "Acto de Prueba",
  description: "",
  order: 1,
  chapters: [
    {
      id: "chap-test",
      actId: "act-test",
      title: "Capítulo de Prueba",
      description: "",
      order: 1,
      scenes: [
        {
          id: "sc-triad",
          chapterId: "chap-test",
          title: "Escena Clímax",
          content: "Texto inicial de la escena dramática.",
          synopsis: "Sinopsis inicial vinculada a planeación",
          notes: "Nota inicial",
          status: "draft",
          notesTemplate: "dramatic",
          noteCards: [
            { id: "c1", title: "Meta & Intención", content: "Conseguir la llave del archivo secreto" },
            { id: "c2", title: "Conflicto & Obstáculo", content: "El guardia nocturno patrulla sin descanso" },
            { id: "c3", title: "Giro & Desenlace", content: "Consigue la llave pero activa la alarma silenciosa" },
          ],
          characterIds: [],
          goal: "Conseguir la llave del archivo secreto",
          conflict: "El guardia nocturno patrulla sin descanso",
          outcome: "Consigue la llave pero activa la alarma silenciosa",
          targetWordCount: 1500,
          wordCount: 7,
          order: 1,
        },
      ],
    },
  ],
};

useManuscriptStore.getState().loadManuscript([initialAct], "sc-triad");
let selectedScene = useManuscriptStore.getState().getSelectedScene();
assert(selectedScene?.notesTemplate === "dramatic", "Plantilla inicial de notas 'dramatic' cargada");
assert(selectedScene?.noteCards?.length === 3, "Existen 3 tarjetas de notas en la escena");
assert(selectedScene?.noteCards?.[0].title === "Meta & Intención", "Título de la 1.ª tarjeta cargado");
assert(selectedScene?.noteCards?.[0].content === "Conseguir la llave del archivo secreto", "Contenido de la 1.ª tarjeta cargado");

// 1. Edición de Título Personalizado en Tarjeta
const editedCards: SceneNoteCard[] = [
  { ...selectedScene!.noteCards![0], title: "Objetivo de Valeria (Personalizado)" },
  ...selectedScene!.noteCards!.slice(1),
];
useManuscriptStore.getState().updateSceneMeta("sc-triad", { noteCards: editedCards });
selectedScene = useManuscriptStore.getState().getSelectedScene();
assert(
  selectedScene?.noteCards?.[0].title === "Objetivo de Valeria (Personalizado)",
  "Permite editar y renombrar el título de cualquier tarjeta"
);

// 2. Añadir Nuevas Tarjetas Dinámicamente (+ Añadir Nota)
const extraCard: SceneNoteCard = {
  id: "c-extra-1",
  title: "Pista Secreta",
  content: "Un medallón de plata oxidada oculto tras el cuadro.",
};
const expandedCards = [...(selectedScene?.noteCards || []), extraCard];
useManuscriptStore.getState().updateSceneMeta("sc-triad", { noteCards: expandedCards });
selectedScene = useManuscriptStore.getState().getSelectedScene();
assert(selectedScene?.noteCards?.length === 4, "Se añade una nueva tarjeta dinámica exitosamente (total: 4)");
assert(selectedScene?.noteCards?.[3].title === "Pista Secreta", "La nueva tarjeta conserva su título");
assert(selectedScene?.noteCards?.[3].content.includes("medallón"), "La nueva tarjeta conserva su contenido");

// 3. Eliminar una Tarjeta
const filteredCards = selectedScene!.noteCards!.filter((c) => c.id !== "c-extra-1");
useManuscriptStore.getState().updateSceneMeta("sc-triad", { noteCards: filteredCards });
selectedScene = useManuscriptStore.getState().getSelectedScene();
assert(selectedScene?.noteCards?.length === 3, "Eliminación de tarjeta completada con éxito (quedan 3)");

// 4. Verificación de Presets de Plantillas Desacopladas
assert(
  SCENE_NOTE_TEMPLATES.worldbuilding.defaultCards[0].title === "Atmósfera & Tono",
  "Plantilla Worldbuilding define 'Atmósfera & Tono' como primera tarjeta"
);
assert(
  SCENE_NOTE_TEMPLATES.reaction.defaultCards[0].title === "Emoción & Duelo",
  "Plantilla Reacción define 'Emoción & Duelo' como primera tarjeta"
);
assert(
  SCENE_NOTE_TEMPLATES.free.defaultCards.length === 0,
  "Plantilla Libre está vacía por defecto (0 tarjetas iniciales)"
);

// 5. Cambio a Plantilla Worldbuilding con persistencia en templateNotes
useManuscriptStore.getState().updateSceneMeta("sc-triad", {
  notesTemplate: "worldbuilding",
  templateNotes: {
    worldbuilding: [
      { id: "wb-1", title: "Atmósfera & Tono", content: "Niebla densa y murmullos en el bosque de abedules" },
      { id: "wb-2", title: "Revelación de Lore", content: "Antiguo monolito con runas arcanas prohibidas" },
      { id: "wb-3", title: "Trascendencia", content: "La magia de sangre no se extinguió, permanece latente" },
    ],
  },
});
selectedScene = useManuscriptStore.getState().getSelectedScene();
assert(selectedScene?.notesTemplate === "worldbuilding", "Cambio a plantilla 'worldbuilding' registrado");
assert(
  selectedScene?.templateNotes?.worldbuilding?.[0].title === "Atmósfera & Tono",
  "Tarjetas de worldbuilding aplicadas con sus propios nombres"
);

// 6. Cambio a Modo Libre (+ Añadir Nota Libre)
useManuscriptStore.getState().updateSceneMeta("sc-triad", {
  notesTemplate: "free",
  templateNotes: {
    ...(selectedScene?.templateNotes || {}),
    free: [
      { id: "free-1", title: "Idea espontánea", content: "Hacer que el antagonista dude en el último instante" },
    ],
  },
});
selectedScene = useManuscriptStore.getState().getSelectedScene();
assert(selectedScene?.notesTemplate === "free", "Cambio a plantilla 'free' (Libre) registrado");
assert(selectedScene?.templateNotes?.free?.length === 1, "Modo libre aloja notas abiertas sin restricciones");

// 7. Sincronización de Sinopsis Narrativa con el Store
useManuscriptStore.getState().updateSceneMeta("sc-triad", {
  synopsis: "Sinopsis actualizada en el inspector, sincronizada con el Tablero de Corcho",
});
selectedScene = useManuscriptStore.getState().getSelectedScene();
assert(
  selectedScene?.synopsis.includes("sincronizada con el Tablero de Corcho"),
  "Sinopsis se actualiza en el store para reflejarse en tiempo real en Corcho y Esquema"
);

// --- GRUPO 4: Opciones de Punto de Vista (POV) ---
console.log("\n📌 GRUPO 4: Opciones de Perspectiva POV (Omnisciente / Coral / Códice)");
// Narrador Omnisciente
useManuscriptStore.getState().updateSceneMeta("sc-triad", { povCharacterId: "omniscient" });
selectedScene = useManuscriptStore.getState().getSelectedScene();
assert(selectedScene?.povCharacterId === "omniscient", "POV asignado a 'Narrador Omnisciente'");

// Sin POV / Coral
useManuscriptStore.getState().updateSceneMeta("sc-triad", { povCharacterId: "coral" });
selectedScene = useManuscriptStore.getState().getSelectedScene();
assert(selectedScene?.povCharacterId === "coral", "POV asignado a 'Sin POV / Coral'");

// Personaje de Códice
useManuscriptStore.getState().updateSceneMeta("sc-triad", { povCharacterId: "char_valeria" });
selectedScene = useManuscriptStore.getState().getSelectedScene();
assert(selectedScene?.povCharacterId === "char_valeria", "POV asignado a entidad de personaje");

// --- GRUPO 5: Ciclo de Estado de la Escena (SceneStatus) ---
console.log("\n📌 GRUPO 5: Ciclo de Estados de la Escena");
const validStatuses: SceneStatus[] = ["idea", "draft", "revised", "polished", "final"];
for (const status of validStatuses) {
  useManuscriptStore.getState().updateSceneMeta("sc-triad", { status });
  const sc = useManuscriptStore.getState().getSelectedScene();
  assert(sc?.status === status, `Transición a estado '${status}' exitosa`);
}

// --- GRUPO 6: Metas de Palabras y Lectura Estimada ---
console.log("\n📌 GRUPO 6: Metas de Palabras y Tiempo de Lectura");
const sampleProse = "Palabra ".repeat(660); // 660 palabras
const wordsCounted = countWords(sampleProse);
assert(wordsCounted === 660, `countWords cuenta exactamente 660 palabras (obtenido: ${wordsCounted})`);

const targetWordGoal = 1000;
const progressPercent = Math.min(100, Math.round((wordsCounted / targetWordGoal) * 100));
assert(progressPercent === 66, `Porcentaje de progreso calculado correctamente: 66% (obtenido: ${progressPercent}%)`);

const readingMinutes = Math.ceil(wordsCounted / 220);
assert(readingMinutes === 3, `Tiempo estimado a 220 ppm es exactamente 3 minutos (obtenido: ${readingMinutes})`);

// --- GRUPO 7: Atajo Global Ctrl+I / Cmd+I ---
console.log("\n📌 GRUPO 7: Registro de Atajos Globales para el Inspector");
const appContent = readFileSync(join(process.cwd(), "src/App.tsx"), "utf-8");
assert(
  appContent.includes('key.toLowerCase() === "i"') || appContent.includes('code === "KeyI"'),
  "App.tsx incluye el atajo Ctrl+I / Cmd+I para alternar el inspector"
);
const headerContent = readFileSync(join(process.cwd(), "src/components/editor/EditorHeader.tsx"), "utf-8");
assert(
  headerContent.includes("Ctrl+I"),
  "EditorHeader.tsx incluye botón con tooltip informativo '(Ctrl+I)'"
);

console.log("\n=============================================================");
console.log(`📊 RESULTADO DE LA SUITE SUBFASE 1.5:`);
console.log(`   Pruebas superadas: ${passed}`);
console.log(`   Pruebas fallidas:  ${failed}`);
console.log("=============================================================\n");

if (failed > 0) {
  process.exit(1);
}
