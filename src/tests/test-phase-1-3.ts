/**
 * Suite de Pruebas Automatizadas para Subfase 1.3:
 * Árbol del Manuscrito & Navegación (Estilo Obsidian / Scrivener)
 */

import { useManuscriptStore } from "../stores/useManuscriptStore";
import { Act, Chapter, Scene } from "../types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FALLO: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("=== Ejecutando pruebas para Subfase 1.3: Árbol del Manuscrito ===");

  // 1. Carga inicial del manuscrito
  const initialActs: Act[] = [
    {
      id: "act-1",
      title: "Acto I: El Despertar",
      description: "Arco inicial",
      order: 1,
      chapters: [
        {
          id: "chap-1",
          actId: "act-1",
          title: "Capítulo 1: La Niebla",
          description: "Descripción de prueba",
          order: 1,
          scenes: [
            {
              id: "sc-1",
              chapterId: "chap-1",
              title: "Escena 1: En el muelle",
              content: "Había una densa niebla sobre el río.",
              wordCount: 7,
              order: 1,
              status: "draft",
              characterIds: [],
              goal: "",
              conflict: "",
              outcome: "",
              notes: "",
              synopsis: "",
              targetWordCount: 1500,
            },
            {
              id: "sc-2",
              chapterId: "chap-1",
              title: "Escena 2: La campana",
              content: "A lo lejos resonó la campana del faro tres veces seguidas.",
              wordCount: 11,
              order: 2,
              status: "revised",
              characterIds: [],
              goal: "",
              conflict: "",
              outcome: "",
              notes: "",
              synopsis: "",
              targetWordCount: 1500,
            },
          ],
        },
      ],
    },
  ];

  const store = useManuscriptStore.getState();
  store.loadManuscript(initialActs, "sc-1");

  const state1 = useManuscriptStore.getState();
  assert(state1.acts.length === 1, "Carga inicial: se carga 1 acto correctamente");
  assert(state1.selectedSceneId === "sc-1", "Carga inicial: escena 'sc-1' seleccionada por defecto");
  assert(state1.activeSceneContent === "Había una densa niebla sobre el río.", "Carga inicial: contenido de escena activa coincide");

  const totals1 = state1.getTotals();
  assert(totals1.totalWords === 18, `Conteo de palabras inicial acumulado correcto (18 palabras, obtenido: ${totals1.totalWords})`);
  assert(totals1.sceneCount === 2, "Conteo de escenas inicial: 2");

  // 2. Edición de contenido en tiempo real y actualización de palabras
  state1.updateActiveSceneContent("Había una densa niebla sobre el río frío y desolado.");
  const state2 = useManuscriptStore.getState();
  const totals2 = state2.getTotals();
  assert(totals2.totalWords === 21, `Conteo de palabras en tiempo real tras edición de escena (esperado: 21, obtenido: ${totals2.totalWords})`);

  // 3. Añadir escena
  const newScene = state2.addScene("chap-1", "Escena 3: El viejo marinero");
  assert(newScene !== null, "addScene: retorna la nueva escena creada");
  const state3 = useManuscriptStore.getState();
  assert(state3.selectedSceneId === newScene?.id, "addScene: selecciona automáticamente la nueva escena");
  assert(state3.acts[0].chapters[0].scenes.length === 3, "addScene: capítulo tiene ahora 3 escenas");

  // 4. Renombrar escena
  state3.updateSceneMeta(newScene!.id, { title: "Escena 3: Encuentro en la taberna" });
  const state4 = useManuscriptStore.getState();
  const renamedScene = state4.acts[0].chapters[0].scenes.find((s) => s.id === newScene?.id);
  assert(renamedScene?.title === "Escena 3: Encuentro en la taberna", "updateSceneMeta: renombra escena correctamente");

  // 5. Reordenar escenas
  state4.reorderScenes("chap-1", [newScene!.id, "sc-2", "sc-1"]);
  const state5 = useManuscriptStore.getState();
  assert(state5.acts[0].chapters[0].scenes[0].id === newScene?.id, "reorderScenes: nueva escena es ahora la primera");
  assert(state5.acts[0].chapters[0].scenes[0].order === 1, "reorderScenes: orden numérico actualizado a 1");
  assert(state5.acts[0].chapters[0].scenes[2].id === "sc-1", "reorderScenes: 'sc-1' es ahora la tercera");
  assert(state5.acts[0].chapters[0].scenes[2].order === 3, "reorderScenes: orden numérico actualizado a 3");

  // 6. Añadir capítulo
  const newChap = state5.addChapter("act-1", "Capítulo 2: Aguas Abiertas");
  assert(newChap !== null, "addChapter: nuevo capítulo creado");
  const state6 = useManuscriptStore.getState();
  assert(state6.acts[0].chapters.length === 2, "addChapter: acto tiene ahora 2 capítulos");

  // 7. Renombrar capítulo
  state6.updateChapterTitle(newChap!.id, "Capítulo 2: Rumbo al Horizonte");
  const state7 = useManuscriptStore.getState();
  assert(state7.acts[0].chapters[1].title === "Capítulo 2: Rumbo al Horizonte", "updateChapterTitle: capítulo renombrado exitosamente");

  // 8. Reordenar capítulos
  state7.reorderChapters("act-1", [newChap!.id, "chap-1"]);
  const state8 = useManuscriptStore.getState();
  assert(state8.acts[0].chapters[0].id === newChap!.id, "reorderChapters: el nuevo capítulo es ahora el primero");
  assert(state8.acts[0].chapters[0].order === 1, "reorderChapters: orden de capítulo actualizado");

  // 9. Mover escena entre capítulos (moveScene)
  const sceneToMove = "sc-2";
  state8.moveScene(sceneToMove, newChap!.id, 0);
  const state9 = useManuscriptStore.getState();
  const movedSceneInNewChap = state9.acts[0].chapters
    .find((c) => c.id === newChap!.id)?.scenes.find((s) => s.id === sceneToMove);
  assert(movedSceneInNewChap !== undefined, "moveScene: la escena se movió al nuevo capítulo");
  assert(movedSceneInNewChap?.chapterId === newChap!.id, "moveScene: scene.chapterId fue actualizado");

  // 10. Añadir y renombrar Acto
  const newAct = state9.addAct("Acto II: El Abismo");
  assert(newAct !== null, "addAct: nuevo acto creado");
  const state10 = useManuscriptStore.getState();
  assert(state10.acts.length === 2, "addAct: existen 2 actos en el manuscrito");

  state10.updateActTitle(newAct!.id, "Acto II: Las Profundidades Olvidadas");
  const state11 = useManuscriptStore.getState();
  assert(state11.acts[1].title === "Acto II: Las Profundidades Olvidadas", "updateActTitle: acto renombrado exitosamente");

  // 11. Reordenar actos
  state11.reorderActs([newAct!.id, "act-1"]);
  const state12 = useManuscriptStore.getState();
  assert(state12.acts[0].id === newAct!.id, "reorderActs: nuevo acto reordenado como primero");
  assert(state12.acts[0].order === 1, "reorderActs: orden numérico actualizado a 1");

  // 12. Eliminar escena
  const activeBeforeDelete = state12.selectedSceneId;
  state12.deleteScene(activeBeforeDelete);
  const state13 = useManuscriptStore.getState();
  assert(state13.selectedSceneId !== activeBeforeDelete, "deleteScene: la escena eliminada ya no está seleccionada");
  assert(state13.selectedSceneId !== "", "deleteScene: selecciona automáticamente una escena adyacente restante");

  // 13. Eliminar capítulo
  const chapToDelete = state13.acts[0].chapters[0].id;
  state13.deleteChapter(chapToDelete);
  const state14 = useManuscriptStore.getState();
  assert(!state14.acts[0].chapters.some((c) => c.id === chapToDelete), "deleteChapter: capítulo eliminado del árbol");

  // 14. Eliminar acto
  const actToDelete = state14.acts[0].id;
  state14.deleteAct(actToDelete);
  const state15 = useManuscriptStore.getState();
  assert(state15.acts.length === 1, "deleteAct: acto eliminado, queda 1 acto restante");

  console.log(`\n=== Resumen de Pruebas: ${passed} pasadas, ${failed} fallidas ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
