export type PaperSize = "A5" | "Trade" | "A4";
export type ChapterNumberFormat = "arabic" | "roman" | "words" | "none";
export type ChapterHeadingStyle = "number-title" | "number-only" | "title-only" | "subtitle-stacked";
export type ChapterAlignment = "center" | "left";
export type ChapterOrnament = "none" | "simple-line" | "flourish" | "stars" | "dots";
export type PageNumberPosition = "bottom-center" | "bottom-outer" | "top-right" | "none";
export type SceneBreakStyle = "* * *" | "✦ ✦ ✦" | "• • •" | "page-break" | "line";
export type DropCapStyle = "classic-serif" | "clean-modern" | "ornamental-gothic";

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  isPreset?: boolean;
  paperSize: PaperSize;

  // Typography
  fontFamily: "editor" | "garamond" | "serif" | "lora" | "merriweather" | "serif-display" | "cinzel" | "sans" | "mono" | "custom" | string;
  customFontName?: string;
  fontSize: number; // in pt (10 - 14)
  lineSpacing: number; // 1.15, 1.4, 1.6, 2.0
  textAlign: "justify" | "left";
  paragraphIndent: boolean;
  indentSize: string; // e.g. "1.5em", "2em", "0.5in"

  // Act titles
  includeActTitles: boolean;
  actTitleFormat: "ACTO [NUM]" | "Acto [NUM]: [TITULO]" | "[TITULO]";

  // Chapter headings
  includeChapterTitles: boolean;
  chapterNumberFormat: ChapterNumberFormat;
  chapterHeadingStyle: ChapterHeadingStyle;
  chapterAlignment: ChapterAlignment;
  chapterOrnament: ChapterOrnament;
  chapterPrefix: string; // "Capítulo" | "Chapter" | "Parte" | ""
  chapterTitleColor?: string;
  subtitleColor?: string; // Color de subtítulos de capítulo y escena (ej. #4B5563)

  // Scene headings & breaks
  includeSceneTitles: boolean;
  includeSceneBreaks: boolean;
  sceneBreakStyle: SceneBreakStyle;

  // Drop Cap (Letra Capitular)
  dropCap: boolean;
  dropCapLines: number; // 2 or 3
  dropCapColor?: string;
  dropCapStyle: DropCapStyle;

  // Running Headers & Footers
  runningHeaders: boolean;
  pageNumberPosition: PageNumberPosition;
}

export const PRESET_EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "preset-manuscript",
    name: "Manuscrito Estándar Editorial",
    description: "Formato canónico para editoriales, certámenes y agencias (formato Shunn). Tipografía mono o serif limpia, doble espacio, encabezado derecho y márgenes amplios.",
    isPreset: true,
    paperSize: "A4",
    fontFamily: "mono",
    fontSize: 12,
    lineSpacing: 2.0,
    textAlign: "left",
    paragraphIndent: true,
    indentSize: "0.5in",
    includeActTitles: true,
    actTitleFormat: "ACTO [NUM]",
    includeChapterTitles: true,
    chapterNumberFormat: "arabic",
    chapterHeadingStyle: "number-only",
    chapterAlignment: "center",
    chapterOrnament: "none",
    chapterPrefix: "Capítulo",
    includeSceneTitles: false,
    includeSceneBreaks: true,
    sceneBreakStyle: "* * *",
    dropCap: false,
    dropCapLines: 2,
    dropCapStyle: "clean-modern",
    runningHeaders: false,
    pageNumberPosition: "top-right",
  },
  {
    id: "preset-classic-pocket",
    name: "Novela Clásica de Bolsillo",
    description: "Maquetación tradicional de libro impreso (Garamond, texto justificado, encabezados de pliego alternados: Autor izq / Título der, y números al pie).",
    isPreset: true,
    paperSize: "A5",
    fontFamily: "garamond",
    fontSize: 11,
    lineSpacing: 1.45,
    textAlign: "justify",
    paragraphIndent: true,
    indentSize: "1.5em",
    includeActTitles: true,
    actTitleFormat: "ACTO [NUM]",
    includeChapterTitles: true,
    chapterNumberFormat: "words",
    chapterHeadingStyle: "number-title",
    chapterAlignment: "center",
    chapterOrnament: "none",
    chapterPrefix: "Capítulo",
    includeSceneTitles: false,
    includeSceneBreaks: true,
    sceneBreakStyle: "* * *",
    dropCap: false,
    dropCapLines: 2,
    dropCapStyle: "classic-serif",
    runningHeaders: true,
    pageNumberPosition: "bottom-center",
  },
  {
    id: "preset-literary-dropcap",
    name: "Literaria Elegante con Letra Capitular",
    description: "Apertura noble de capítulo con números romanos grandes (IV), título en cursiva clásica y hermosa Letra Capitular (Drop Cap) de 3 líneas en el primer párrafo.",
    isPreset: true,
    paperSize: "Trade",
    fontFamily: "lora",
    fontSize: 11,
    lineSpacing: 1.5,
    textAlign: "justify",
    paragraphIndent: true,
    indentSize: "1.5em",
    includeActTitles: true,
    actTitleFormat: "ACTO [NUM]",
    includeChapterTitles: true,
    chapterNumberFormat: "roman",
    chapterHeadingStyle: "subtitle-stacked",
    chapterAlignment: "center",
    chapterOrnament: "none",
    chapterPrefix: "",
    includeSceneTitles: false,
    includeSceneBreaks: true,
    sceneBreakStyle: "✦ ✦ ✦",
    dropCap: true,
    dropCapLines: 3,
    dropCapStyle: "classic-serif",
    runningHeaders: true,
    pageNumberPosition: "bottom-center",
  },
  {
    id: "preset-modern-minimal",
    name: "Moderno Minimalista Contemporáneo",
    description: "Diseño actual y pulcro. Subtítulo en versalitas color acento (CAPÍTULO DOS), título en serif equilibrada, capitular moderna y paginación en esquinas exteriores.",
    isPreset: true,
    paperSize: "Trade",
    fontFamily: "serif",
    fontSize: 11.5,
    lineSpacing: 1.55,
    textAlign: "justify",
    paragraphIndent: true,
    indentSize: "1.5em",
    includeActTitles: true,
    actTitleFormat: "[TITULO]",
    includeChapterTitles: true,
    chapterNumberFormat: "words",
    chapterHeadingStyle: "subtitle-stacked",
    chapterAlignment: "center",
    chapterOrnament: "dots",
    chapterPrefix: "Capítulo",
    chapterTitleColor: "#1F2937",
    subtitleColor: "#4B5563",
    includeSceneTitles: false,
    includeSceneBreaks: true,
    sceneBreakStyle: "• • •",
    dropCap: true,
    dropCapLines: 2,
    dropCapColor: "#1F2937",
    dropCapStyle: "clean-modern",
    runningHeaders: true,
    pageNumberPosition: "bottom-outer",
  },
  {
    id: "preset-fantasy-ornamental",
    name: "Fantasía & Épica Ornamental",
    description: "Diseño para sagas épicas: número de capítulo grande, exquisita filigrana floral divisoria en SVG, títulos en Cinzel display y capitular heroica.",
    isPreset: true,
    paperSize: "Trade",
    fontFamily: "cinzel",
    fontSize: 11.5,
    lineSpacing: 1.5,
    textAlign: "justify",
    paragraphIndent: true,
    indentSize: "1.5em",
    includeActTitles: true,
    actTitleFormat: "ACTO [NUM]",
    includeChapterTitles: true,
    chapterNumberFormat: "arabic",
    chapterHeadingStyle: "subtitle-stacked",
    chapterAlignment: "center",
    chapterOrnament: "flourish",
    chapterPrefix: "",
    includeSceneTitles: false,
    includeSceneBreaks: true,
    sceneBreakStyle: "✦ ✦ ✦",
    dropCap: true,
    dropCapLines: 3,
    dropCapStyle: "ornamental-gothic",
    runningHeaders: true,
    pageNumberPosition: "bottom-center",
  },
];
