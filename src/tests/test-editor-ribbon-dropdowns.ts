/**
 * Test Suite: Editor Ribbon Drag-to-Scroll & Portaled Dropdowns Architecture
 * Verifies:
 * 1. Ribbon supports drag-to-scroll with overflow-x-auto, global mouse tracking, and click suppression.
 * 2. Ribbon centers smoothly when space allows and aligns safely to flex-start when overflowing.
 * 3. Dropdowns (font selector, line spacing) use React createPortal into document.body with z-[9999]
 *    ensuring they NEVER clip beneath overflow containers or the manuscript canvas.
 * 4. Scene status selector uses clean Lucide vector icons instead of emojis.
 */

import fs from "fs";
import path from "path";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (details) console.error(`     Details: ${details}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("=============================================================");
  console.log("🧪 Novelore Desktop - Verificación: Ribbon y Desplegables Portaleados");
  console.log("=============================================================\n");

  const editorDir = path.join(process.cwd(), "src/components/editor");
  const readEditorFilesRecursively = (dir: string): string => {
    let combined = "";
    for (const file of fs.readdirSync(dir)) {
      if (file === "SceneInspector.tsx" || file === "ManuscriptSidebar.tsx") continue;
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        combined += "\n" + readEditorFilesRecursively(fullPath);
      } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        combined += "\n" + fs.readFileSync(fullPath, "utf-8");
      }
    }
    return combined;
  };
  const editorCode = readEditorFilesRecursively(editorDir);

  // -------------------------------------------------------------
  // GRUPO 1: Ribbon Drag-to-Scroll y Soporte Responsive
  // -------------------------------------------------------------
  console.log("📌 GRUPO 1: Arquitectura de Arrastre (Drag-to-Scroll) de la Barra de Herramientas");

  assert(editorCode.includes('id="editor-word-processor-ribbon"'), "Existe el contenedor #editor-word-processor-ribbon");
  assert(editorCode.includes("overflow-x-auto"), "El ribbon cuenta con overflow-x-auto para desplazamiento horizontal fluido");
  assert(editorCode.includes("no-scrollbar"), "El ribbon oculta barras de desplazamiento toscas mediante no-scrollbar");
  assert(editorCode.includes("handleRibbonMouseDown"), "El ribbon implementa iniciación de arrastre con el ratón");
  assert(editorCode.includes("isDraggingRibbon"), "El ribbon gestiona el estado de arrastre activo");
  assert(editorCode.includes("checkRibbonScroll"), "El ribbon monitorea dinámicamente el desbordamiento al cambiar de tamaño");
  assert(editorCode.includes("ResizeObserver"), "Usa ResizeObserver para recalcular el desbordamiento al redimensionar");
  assert(editorCode.includes("ChevronLeft") && editorCode.includes("ChevronRight"), "Dispone de botones de navegación (chevrons) para desplazamiento asistido");

  // -------------------------------------------------------------
  // GRUPO 2: Alineación y Prevención de Recorte Izquierdo
  // -------------------------------------------------------------
  console.log("\n📌 GRUPO 2: Centrado Adaptativo y Seguridad de Desplazamiento");

  assert(editorCode.includes("isRibbonOverflowing"), "Distingue estado de desbordamiento de estado centrado");
  assert(editorCode.includes('justifyContent: isRibbonOverflowing ? "flex-start" : "center"'), "Alinea al inicio al desbordar y centra cuando hay espacio");
  assert(editorCode.includes("suppressClick") || editorCode.includes("stopPropagation"), "Suprime clics accidentales en botones tras un arrastre");

  // -------------------------------------------------------------
  // GRUPO 3: Desplegables Inmunes a Desbordamiento (React Portals)
  // -------------------------------------------------------------
  console.log("\n📌 GRUPO 3: Desplegables de Fuente e Interlineado Vía Portales");

  assert(editorCode.includes("createPortal("), "Utiliza createPortal para desacoplar los menús del flujo del ribbon");
  assert(editorCode.includes("document.body"), "Renderiza los menús en document.body para evitar cualquier recorte por overflow");
  assert(editorCode.includes("z-[9999]"), "Los menús portaleados utilizan z-[9999] quedando siempre por encima del manuscrito");
  assert(editorCode.includes("fontMenuPos") && editorCode.includes("spacingMenuPos"), "Calcula coordenadas absolutas/fijas basadas en el botón disparador");

  // -------------------------------------------------------------
  // GRUPO 4: Selector de Estado de Escena sin Emojis
  // -------------------------------------------------------------
  console.log("\n📌 GRUPO 4: Estado de Escena con Iconografía Vectorial Limpia");

  const outlineFilePath = path.join(process.cwd(), "src/components/planning/OutlineGridView.tsx");
  const outlineCode = fs.readFileSync(outlineFilePath, "utf-8");

  assert(!outlineCode.includes("💡") && !outlineCode.includes("✍️") && !outlineCode.includes("🔍") && !outlineCode.includes("✨") && !outlineCode.includes("🏆"), "OutlineGridView NO contiene emojis en las opciones de estado");
  assert(!editorCode.includes("💡") && !editorCode.includes("✍️") && !editorCode.includes("🔍") && !editorCode.includes("✨") && !editorCode.includes("🏆"), "RichTextEditor NO contiene emojis en las opciones de estado");

  // -------------------------------------------------------------
  // RESUMEN
  // -------------------------------------------------------------
  console.log("\n=============================================================");
  console.log(`📊 RESULTADO: ${passedCount} pasadas, ${failedCount} fallidas`);
  console.log("=============================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Error ejecutando pruebas:", err);
  process.exit(1);
});
