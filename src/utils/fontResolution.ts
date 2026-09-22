import { NovelProject } from "../types";

export interface ResolvedFontInfo {
  key: string;
  label: string;
  name: string;
  cssFamily: string;
  titleCssFamily: string;
  wordFont: string;
  htmlStack: string;
  isCustom: boolean;
}

/**
 * Returns information about the font selected in the rich text editor (project.settings.fontFamily)
 */
export function getEditorFontInfo(project: NovelProject): ResolvedFontInfo {
  const fontId = project.settings?.fontFamily || "serif";

  if (fontId === "custom" && project.settings?.customFontData) {
    const rawName = (project.settings.customFontName || "Fuente_Propia")
      .replace(/^Custom_/, "")
      .replace(/_/g, " ");
    return {
      key: "custom",
      label: `Fuente Propia (${rawName})`,
      name: `Fuente Propia (${rawName})`,
      cssFamily: `"${project.settings.customFontName}", 'EB Garamond', Georgia, serif`,
      titleCssFamily: `"${project.settings.customFontName}", 'EB Garamond', Georgia, serif`,
      wordFont: rawName,
      htmlStack: `"${project.settings.customFontName}", 'EB Garamond', Georgia, serif`,
      isCustom: true,
    };
  }

  switch (fontId) {
    case "garamond":
      return {
        key: "garamond",
        label: "EB Garamond (Literaria Clásica)",
        name: "EB Garamond (Literaria Clásica)",
        cssFamily: "'EB Garamond', 'Garamond', Georgia, serif",
        titleCssFamily: "'EB Garamond', 'Garamond', Georgia, serif",
        wordFont: "EB Garamond",
        htmlStack: "'EB Garamond', 'Garamond', Georgia, serif",
        isCustom: false,
      };
    case "lora":
      return {
        key: "lora",
        label: "Lora (Elegante Editorial)",
        name: "Lora (Elegante Editorial)",
        cssFamily: "'Lora', Georgia, serif",
        titleCssFamily: "'Lora', Georgia, serif",
        wordFont: "Lora",
        htmlStack: "'Lora', Georgia, serif",
        isCustom: false,
      };
    case "serif-display":
      return {
        key: "serif-display",
        label: "Playfair Display (Titular)",
        name: "Playfair Display (Titular)",
        cssFamily: "'Playfair Display', Georgia, serif",
        titleCssFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
        wordFont: "Playfair Display",
        htmlStack: "'Playfair Display', Georgia, serif",
        isCustom: false,
      };
    case "cinzel":
      return {
        key: "cinzel",
        label: "Cinzel (Display Épica / Fantasía)",
        name: "Cinzel (Display Épica / Fantasía)",
        cssFamily: "'Cinzel', Georgia, serif",
        titleCssFamily: "'Cinzel', Georgia, serif",
        wordFont: "Cinzel",
        htmlStack: "'Cinzel', 'Playfair Display', Georgia, serif",
        isCustom: false,
      };
    case "sans":
      return {
        key: "sans",
        label: "Plus Jakarta Sans (Moderna)",
        name: "Plus Jakarta Sans (Moderna)",
        cssFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        titleCssFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        wordFont: "Arial",
        htmlStack: "'Plus Jakarta Sans', system-ui, sans-serif",
        isCustom: false,
      };
    case "mono":
      return {
        key: "mono",
        label: "JetBrains Mono (Máquina)",
        name: "JetBrains Mono (Máquina)",
        cssFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        titleCssFamily: "'JetBrains Mono', 'Courier New', monospace",
        wordFont: "Courier New",
        htmlStack: "'JetBrains Mono', 'Courier New', monospace",
        isCustom: false,
      };
    case "serif":
    default:
      return {
        key: "serif",
        label: "Merriweather (Serif Robusta)",
        name: "Merriweather (Serif Robusta)",
        cssFamily: "'Merriweather', Georgia, serif",
        titleCssFamily: "'Merriweather', 'Playfair Display', Georgia, serif",
        wordFont: "Merriweather",
        htmlStack: "'Merriweather', Georgia, serif",
        isCustom: false,
      };
  }
}

/**
 * Resolves the export font.
 * If templateFont is "editor", undefined, or matches the editor, returns the editor font.
 * Otherwise returns the specific font selected in the template.
 */
export function resolveExportFont(
  templateFont: string | undefined,
  project: NovelProject
): ResolvedFontInfo {
  // If template is set to follow editor, resolve to editor font
  if (!templateFont || templateFont === "editor" || templateFont === "inherit") {
    return getEditorFontInfo(project);
  }

  // If custom font is chosen and loaded
  if (templateFont === "custom" && project.settings?.customFontData) {
    return getEditorFontInfo(project);
  }

  switch (templateFont) {
    case "garamond":
      return {
        key: "garamond",
        label: "EB Garamond (Literaria Clásica)",
        name: "EB Garamond (Literaria Clásica)",
        cssFamily: "'EB Garamond', 'Garamond', Georgia, serif",
        titleCssFamily: "'EB Garamond', 'Garamond', Georgia, serif",
        wordFont: "EB Garamond",
        htmlStack: "'EB Garamond', 'Garamond', Georgia, serif",
        isCustom: false,
      };
    case "lora":
      return {
        key: "lora",
        label: "Lora (Elegante Editorial)",
        name: "Lora (Elegante Editorial)",
        cssFamily: "'Lora', Georgia, serif",
        titleCssFamily: "'Lora', Georgia, serif",
        wordFont: "Lora",
        htmlStack: "'Lora', Georgia, serif",
        isCustom: false,
      };
    case "serif-display":
      return {
        key: "serif-display",
        label: "Playfair Display (Titular)",
        name: "Playfair Display (Titular)",
        cssFamily: "'Playfair Display', Georgia, serif",
        titleCssFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
        wordFont: "Playfair Display",
        htmlStack: "'Playfair Display', Georgia, serif",
        isCustom: false,
      };
    case "cinzel":
      return {
        key: "cinzel",
        label: "Cinzel (Display Épica / Fantasía)",
        name: "Cinzel (Display Épica / Fantasía)",
        cssFamily: "'Cinzel', Georgia, serif",
        titleCssFamily: "'Cinzel', Georgia, serif",
        wordFont: "Cinzel",
        htmlStack: "'Cinzel', 'Playfair Display', Georgia, serif",
        isCustom: false,
      };
    case "sans":
      return {
        key: "sans",
        label: "Plus Jakarta Sans (Moderna)",
        name: "Plus Jakarta Sans (Moderna)",
        cssFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        titleCssFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        wordFont: "Arial",
        htmlStack: "'Plus Jakarta Sans', system-ui, sans-serif",
        isCustom: false,
      };
    case "mono":
      return {
        key: "mono",
        label: "JetBrains Mono (Máquina)",
        name: "JetBrains Mono (Máquina)",
        cssFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        titleCssFamily: "'JetBrains Mono', 'Courier New', monospace",
        wordFont: "Courier New",
        htmlStack: "'JetBrains Mono', 'Courier New', monospace",
        isCustom: false,
      };
    case "serif":
    case "merriweather":
      return {
        key: "serif",
        label: "Merriweather (Serif Robusta)",
        name: "Merriweather (Serif Robusta)",
        cssFamily: "'Merriweather', Georgia, serif",
        titleCssFamily: "'Merriweather', 'Playfair Display', Georgia, serif",
        wordFont: "Merriweather",
        htmlStack: "'Merriweather', Georgia, serif",
        isCustom: false,
      };
    default:
      // Fallback to editor font info if unknown or inherited
      return getEditorFontInfo(project);
  }
}
