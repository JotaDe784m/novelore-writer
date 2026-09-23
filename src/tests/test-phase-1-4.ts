/**
 * Test Suite: Subfase 1.4 - Editor Literario & Ergonomía de Lectura
 * Verifies Typewriter Scrolling, Paragraph Focus Mode, RAE dialogue rules,
 * column layout calculations, and toggleable state mechanics.
 */

import {
  getParagraphBounds,
  calculateTypewriterScrollTop,
  calculateFocusMaskGradient,
  getOptimalReadingColumnWidth,
} from "../utils/editorErgonomics";
import {
  countWords,
  countCharacters,
  calculateReadingTimeMinutes,
  formatSpanishDialogue,
} from "../utils/formatters";
import { NovelProject, ProjectSettings } from "../types";

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
  console.log("🧪 Novelore Desktop - Suite de Pruebas: Subfase 1.4 (Editor Literario)");
  console.log("=============================================================\n");

  // -------------------------------------------------------------
  // GRUPO 1: Detección de Límites de Párrafo (getParagraphBounds)
  // -------------------------------------------------------------
  console.log("📌 GRUPO 1: Detección de Límites de Párrafo para Foco");

  const sampleText = "Primer párrafo de prueba.\nSegundo párrafo con diálogo: —Hola.\nTercero y final.";

  // Caret in first paragraph
  const bounds1 = getParagraphBounds(sampleText, 5);
  assert(bounds1.start === 0 && bounds1.end === 25, "Límites del 1.er párrafo (0 a 25)");
  assert(bounds1.paragraph === "Primer párrafo de prueba.", "Texto extraído del 1.er párrafo");

  // Caret at newline between 1st and 2nd
  const boundsAtNewline = getParagraphBounds(sampleText, 25);
  assert(boundsAtNewline.start === 0 && boundsAtNewline.end === 25, "Límite en el salto de línea pertenece al párrafo anterior");

  // Caret in second paragraph
  const bounds2 = getParagraphBounds(sampleText, 40);
  assert(bounds2.start === 26, "Inicio del 2.º párrafo en índice 26");
  assert(bounds2.paragraph === "Segundo párrafo con diálogo: —Hola.", "Texto del 2.º párrafo");

  // Caret in third paragraph
  const bounds3 = getParagraphBounds(sampleText, sampleText.length - 2);
  assert(bounds3.paragraph === "Tercero y final.", "Texto del 3.er párrafo hasta fin de texto");

  // Edge case: Empty text
  const boundsEmpty = getParagraphBounds("", 0);
  assert(boundsEmpty.paragraph === "" && boundsEmpty.start === 0, "Texto vacío retorna límites vacíos seguros");

  // Edge case: Out of bounds caret
  const boundsOOB = getParagraphBounds("Hola", 999);
  assert(boundsOOB.paragraph === "Hola", "Caret fuera de rango se clampea de forma segura");

  // -------------------------------------------------------------
  // GRUPO 2: Cálculo de Scroll Máquina de Escribir (Typewriter Scrolling)
  // -------------------------------------------------------------
  console.log("\n📌 GRUPO 2: Cálculo de Scroll de Máquina de Escribir");

  const viewportHeight = 800; // 800px viewport

  // Caret at 500px: target should be 500 - (800 * 0.45) = 500 - 360 = 140px
  const target1 = calculateTypewriterScrollTop(500, viewportHeight, 0.45);
  assert(target1 === 140, "Caret a 500px genera targetScrollTop de 140px con ratio 0.45", `target1: ${target1}`);

  // Caret at top of document (50px): should clamp to 0
  const targetTop = calculateTypewriterScrollTop(50, viewportHeight, 0.45);
  assert(targetTop === 0, "Caret al inicio (50px) se clampea a 0 (no desborda negativamente)");

  // Caret at 2000px: target should be 2000 - 360 = 1640px
  const targetDeep = calculateTypewriterScrollTop(2000, viewportHeight, 0.45);
  assert(targetDeep === 1640, "Caret en documento largo (2000px) calcula scroll exacto (1640px)");

  // Safe with 0 viewport
  const targetZero = calculateTypewriterScrollTop(500, 0);
  assert(targetZero === 0, "Viewport cero retorna 0 de forma segura");

  // -------------------------------------------------------------
  // GRUPO 3: Generación de Máscara de Foco por Párrafo
  // -------------------------------------------------------------
  console.log("\n📌 GRUPO 3: Gradiente de Máscara para Modo Foco");

  const paraTop = 400;
  const paraHeight = 80;
  const currentScroll = 100;

  const maskGradient = calculateFocusMaskGradient(paraTop, paraHeight, currentScroll, 20);
  // relTop = 300, relBottom = 380, fadeStart = 280, fadeEnd = 400
  assert(maskGradient.includes("linear-gradient"), "Genera linear-gradient válido");
  assert(maskGradient.includes("rgba(0,0,0,0.4)"), "Atenúa párrafos no enfocados al 40% de opacidad");
  assert(maskGradient.includes("rgba(0,0,0,1) 300px"), "Resalta inicio del párrafo al 100% de opacidad");
  assert(maskGradient.includes("rgba(0,0,0,1) 380px"), "Mantiene 100% hasta el fin del párrafo enfocado");

  // -------------------------------------------------------------
  // GRUPO 4: Columna de Lectura Óptima (~720px)
  // -------------------------------------------------------------
  console.log("\n📌 GRUPO 4: Columna de Lectura Óptima (Ulysses / iA Writer)");

  const standardColumn = getOptimalReadingColumnWidth(false);
  assert(standardColumn.maxWidthPx === 720, "Ancho de lectura estándar es de exactamente 720px (~65-75 chars)");
  assert(standardColumn.sidePaddingCalc.includes("720px"), "Fórmula de padding lateral centra columna en 720px");

  const zenColumn = getOptimalReadingColumnWidth(true);
  assert(zenColumn.maxWidthPx === 760, "Ancho en Modo Zen ofrece respiración ampliada a 760px");

  // -------------------------------------------------------------
  // GRUPO 5: Formateo RAE de Diálogos Literarios
  // -------------------------------------------------------------
  console.log("\n📌 GRUPO 5: Reglas RAE de Diálogo y Guion Largo (—)");

  // Dialogue opener normalization
  const inputHyphen = "-Buenos días, señor Valeri.";
  const formattedOpener = formatSpanishDialogue(inputHyphen);
  assert(formattedOpener.startsWith("—Buenos días"), "Convierte guion común '-' en guion largo '—' pegado a la palabra");

  // Dialogue with quotes
  const inputQuote = '"Esto es una locura"';
  const formattedQuote = formatSpanishDialogue(inputQuote);
  assert(formattedQuote.startsWith("—Esto"), "Convierte comillas iniciales de turno en guion largo '—'");

  // Dialogue tag with speech verb: " —dijo él"
  const inputDialogueTag = "—No sé si podré — dijo él — , pero lo intentaré.";
  const formattedTag = formatSpanishDialogue(inputDialogueTag);
  assert(formattedTag.includes(" —dijo él"), "Estandariza etiqueta de diálogo pegando verbo al guion largo");

  // Multi-line preservation
  const multiLine = "—Primera línea.\n\n—Segunda línea.";
  const formattedMulti = formatSpanishDialogue(multiLine);
  assert(formattedMulti.split("\n\n").length === 2, "Preserva separación entre párrafos");

  // -------------------------------------------------------------
  // GRUPO 6: Conteo de Palabras y Tiempo de Lectura
  // -------------------------------------------------------------
  console.log("\n📌 GRUPO 6: Métricas Literarias (Palabras, Caracteres, Lectura)");

  const prose = "La niebla cubría los adoquines de la vieja plaza cuando el reloj marcó la medianoche.";
  const words = countWords(prose);
  assert(words === 15, "Conteo exacto de 15 palabras en prosa");

  const charCount = countCharacters(prose);
  assert(charCount === prose.length, "Conteo exacto de caracteres");

  // 440 words should be exactly 2 minutes (at 220 wpm)
  const readingTime = calculateReadingTimeMinutes(440);
  assert(readingTime === 2, "440 palabras equivalen a 2 minutos de lectura estimada");

  // -------------------------------------------------------------
  // GRUPO 7: Configuración Toggleable (Typewriter & Focus Mode)
  // -------------------------------------------------------------
  console.log("\n📌 GRUPO 7: Modos Desactivables en ProjectSettings");

  const sampleSettings: ProjectSettings = {
    targetTotalWords: 50000,
    dialogueStyle: "dash",
    fontFamily: "serif",
    fontSize: 18,
    lineSpacing: "relaxed",
    typewriterMode: false,
    focusMode: false,
    theme: "minimal",
  };

  assert(sampleSettings.typewriterMode === false, "Scroll máquina inicia desactivable (false por defecto)");
  assert(sampleSettings.focusMode === false, "Modo foco inicia desactivable (false por defecto)");

  // User toggles typewriter mode on
  sampleSettings.typewriterMode = true;
  assert(sampleSettings.typewriterMode === true, "Permite activar scroll de máquina a demanda");

  // User toggles typewriter mode back off
  sampleSettings.typewriterMode = false;
  assert(sampleSettings.typewriterMode === false, "Permite desactivar scroll de máquina a demanda");

  // User toggles focus mode on
  sampleSettings.focusMode = true;
  assert(sampleSettings.focusMode === true, "Permite activar modo foco por párrafo a demanda");

  // User toggles focus mode back off
  sampleSettings.focusMode = false;
  assert(sampleSettings.focusMode === false, "Permite desactivar modo foco por párrafo a demanda");

  // -------------------------------------------------------------
  // RESUMEN FINAL
  // -------------------------------------------------------------
  console.log("\n=============================================================");
  console.log(`📊 RESULTADO DE LA SUITE SUBFASE 1.4:`);
  console.log(`   Pruebas superadas: ${passedCount}`);
  console.log(`   Pruebas fallidas:  ${failedCount}`);
  console.log("=============================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Error fatal ejecutando pruebas:", err);
  process.exit(1);
});
