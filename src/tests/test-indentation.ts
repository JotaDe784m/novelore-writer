/**
 * Unit tests for literary indentation system (src/utils/indentation.ts)
 */

import {
  handleSmartEnter,
  indentLines,
  outdentLines,
} from "../utils/indentation";

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
console.log("🧪 Novelore Desktop - Pruebas: Sistema de Sangrías Literario");
console.log("=============================================================\n");

// 1. Smart Enter with autoIndent disabled
console.log("📌 1. Smart Enter con auto-sangría DESACTIVADA");
const res1 = handleSmartEnter("Hola mundo", 10, 10, false);
assert(res1.newText === "Hola mundo\n", "Inserta salto de línea estándar sin sangría");
assert(res1.newCursor === 11, "Posiciona cursor tras el salto de línea");

// 2. Smart Enter with autoIndent enabled
console.log("\n📌 2. Smart Enter con auto-sangría ACTIVADA");
const res2 = handleSmartEnter("Primer párrafo", 14, 14, true);
assert(res2.newText === "Primer párrafo\n\t", "Inserta salto de línea con tabulador automático (\\n\\t)");
assert(res2.newCursor === 16, "Posiciona cursor tras el tabulador");

// 3. Smart Enter on empty indented line (clears indentation)
console.log("\n📌 3. Smart Enter sobre línea vacía sangrada (limpieza de sangría)");
const res3 = handleSmartEnter("Párrafo 1\n\t", 11, 11, true);
assert(res3.newText === "Párrafo 1\n\n", "Limpia el tabulador y deja línea vacía limpia");
assert(res3.newCursor === 11, "Cursor queda en la nueva línea vacía");

// 4. Tab Indent (Single line / paragraph)
console.log("\n📌 4. Sangría con Tab");
const res4 = indentLines("Capítulo Uno", 0, 0, true);
assert(res4.newText === "\tCapítulo Uno", "Agrega tabulador al inicio del párrafo");
assert(res4.newStart === 1, "Ajusta posición del cursor hacia adelante");

// 5. Tab Indent (Multiple lines selected)
console.log("\n📌 5. Sangría con Tab en selección múltiple");
const multiText = "Línea 1\nLínea 2\nLínea 3";
const res5 = indentLines(multiText, 2, 12);
assert(res5.newText === "\tLínea 1\n\tLínea 2\nLínea 3", "Sangra únicamente las líneas dentro de la selección");

// 6. Outdent with Shift+Tab
console.log("\n📌 6. Reducción de sangría con Shift+Tab");
const indentedText = "\tLínea sangrada";
const res6 = outdentLines(indentedText, 1, 1);
assert(res6.newText === "Línea sangrada", "Remueve tabulador de inicio");
assert(res6.newStart === 0, "Ajusta cursor al inicio de la línea");

// 7. Outdent spaces
const spaceText = "    Línea con cuatro espacios";
const res7 = outdentLines(spaceText, 4, 4);
assert(res7.newText === "Línea con cuatro espacios", "Remueve hasta 4 espacios equivalentes a tab");

console.log("\n=============================================================");
console.log(`📊 RESULTADO: ${passed} pasadas, ${failed} fallidas`);
console.log("=============================================================");

if (failed > 0) {
  process.exit(1);
}
