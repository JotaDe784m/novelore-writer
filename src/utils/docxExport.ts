import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
} from "docx";
import { NovelProject, ExportTemplate } from "../types";
import { PRESET_EXPORT_TEMPLATES } from "../types/exportTemplates";
import { resolveExportFont } from "./fontResolution";

export function toRoman(num: number): string {
  const lookup: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let roman = "";
  for (const [val, letter] of lookup) {
    while (num >= val) {
      roman += letter;
      num -= val;
    }
  }
  return roman || "I";
}

export function toSpanishWord(num: number): string {
  const words = [
    "Cero",
    "Uno",
    "Dos",
    "Tres",
    "Cuatro",
    "Cinco",
    "Seis",
    "Siete",
    "Ocho",
    "Nueve",
    "Diez",
    "Once",
    "Doce",
    "Trece",
    "Catorce",
    "Quince",
    "Dieciséis",
    "Diecisiete",
    "Dieciocho",
    "Diecinueve",
    "Veinte",
    "Veintiuno",
    "Veintidós",
    "Veintitrés",
    "Veinticuatro",
    "Veinticinco",
    "Treinta",
    "Cuarenta",
    "Cincuenta",
  ];
  return words[num] || String(num);
}

export function cleanDocxColor(hex?: string, fallback = "111827"): string {
  if (!hex) return fallback.replace(/^#/, "");
  const cleaned = hex.replace(/^#/, "").trim();
  return cleaned.length === 6 || cleaned.length === 3 ? cleaned : fallback.replace(/^#/, "");
}

export interface ExportExecutionOptions {
  template?: ExportTemplate;
  includeChapterTitles?: boolean;
  includeActTitles?: boolean;
  includeSceneBreaks?: boolean;
  includeSceneTitles?: boolean;
  sceneBreakStyle?: string;
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
  textAlign?: "justify" | "left";
  paragraphIndent?: boolean;
}

export function resolveTemplate(
  project: NovelProject,
  opts?: ExportExecutionOptions
): ExportTemplate {
  let baseTemplate =
    opts?.template ||
    project.settings.customExportTemplates?.find(
      (t) => t.id === project.settings.activeExportTemplateId
    ) ||
    PRESET_EXPORT_TEMPLATES[1]; // default classic

  // Merge overrides
  return {
    ...baseTemplate,
    includeActTitles:
      opts?.includeActTitles !== undefined
        ? opts.includeActTitles
        : baseTemplate.includeActTitles,
    includeChapterTitles:
      opts?.includeChapterTitles !== undefined
        ? opts.includeChapterTitles
        : baseTemplate.includeChapterTitles,
    includeSceneBreaks:
      opts?.includeSceneBreaks !== undefined
        ? opts.includeSceneBreaks
        : baseTemplate.includeSceneBreaks,
    includeSceneTitles:
      opts?.includeSceneTitles !== undefined
        ? opts.includeSceneTitles
        : baseTemplate.includeSceneTitles,
    sceneBreakStyle: (opts?.sceneBreakStyle as any) || baseTemplate.sceneBreakStyle,
    fontFamily: opts?.fontFamily || baseTemplate.fontFamily,
    fontSize: opts?.fontSize || baseTemplate.fontSize,
    lineSpacing: opts?.lineSpacing || baseTemplate.lineSpacing,
    textAlign: opts?.textAlign || baseTemplate.textAlign,
    paragraphIndent:
      opts?.paragraphIndent !== undefined
        ? opts.paragraphIndent
        : baseTemplate.paragraphIndent,
  };
}

export function formatChapterHeading(
  chapterOrder: number,
  chapterTitle: string,
  template: ExportTemplate
): { main: string; subtitle?: string } {
  let numStr = String(chapterOrder);
  if (template.chapterNumberFormat === "roman") {
    numStr = toRoman(chapterOrder);
  } else if (template.chapterNumberFormat === "words") {
    numStr = toSpanishWord(chapterOrder);
  }

  const prefix = template.chapterPrefix.trim();
  const label = prefix ? `${prefix} ${numStr}` : numStr;

  if (template.chapterHeadingStyle === "number-only") {
    return { main: label };
  }
  if (template.chapterHeadingStyle === "title-only") {
    return { main: chapterTitle || label };
  }
  if (template.chapterHeadingStyle === "subtitle-stacked") {
    return { main: label, subtitle: chapterTitle !== label ? chapterTitle : undefined };
  }
  // "number-title"
  return { main: `${label} — ${chapterTitle}` };
}

export async function generateDocxBlob(
  project: NovelProject,
  opts?: ExportExecutionOptions
): Promise<Blob> {
  const template = resolveTemplate(project, opts);
  const children: Paragraph[] = [];

  const resolvedFont = resolveExportFont(template.fontFamily, project);
  const docFont = resolvedFont.wordFont;

  const bodySizeHalfPt = Math.round(template.fontSize * 2);
  const lineSpacingDxa = Math.round(template.lineSpacing * 240); // 240 = 1.0 spacing in Word
  const firstLineIndentDxa = template.paragraphIndent ? 500 : 0;
  const wordAlignment =
    template.textAlign === "justify"
      ? AlignmentType.JUSTIFIED
      : AlignmentType.LEFT;

  // Title Page
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 300 },
      children: [
        new TextRun({
          text: project.title,
          size: 48,
          bold: true,
          font: docFont,
        }),
      ],
    })
  );

  if (project.subtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [
          new TextRun({
            text: project.subtitle,
            size: 28,
            italics: true,
            font: docFont,
            color: cleanDocxColor(template.subtitleColor, "555555"),
          }),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
      children: [
        new TextRun({
          text: `Por ${project.author || "Anónimo"}`,
          size: 24,
          font: docFont,
        }),
      ],
    })
  );

  if (project.logline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 2400 },
        children: [
          new TextRun({
            text: `«${project.logline}»`,
            size: 22,
            italics: true,
            font: docFont,
            color: "666666",
          }),
        ],
      })
    );
  }

  // Page break after title page
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  let chapterCounter = 0;

  // Traverse Acts -> Chapters -> Scenes
  for (let actIdx = 0; actIdx < project.acts.length; actIdx++) {
    const act = project.acts[actIdx];

    // Check if Act Titles are enabled
    if (template.includeActTitles) {
      const actText =
        template.actTitleFormat === "ACTO [NUM]"
          ? `ACTO ${toRoman(actIdx + 1)}`
          : template.actTitleFormat === "Acto [NUM]: [TITULO]"
          ? `Acto ${actIdx + 1}: ${act.title}`
          : act.title.toUpperCase();

      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 1800, after: 800 },
          children: [
            new TextRun({
              text: actText,
              size: 32,
              bold: true,
              font: docFont,
              color: cleanDocxColor(template.chapterTitleColor, "111827"),
            }),
          ],
        })
      );

      if (act.description) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 },
            children: [
              new TextRun({
                text: act.description,
                size: 22,
                italics: true,
                font: docFont,
                color: cleanDocxColor(template.subtitleColor, "666666"),
              }),
            ],
          })
        );
      }
    }

    for (const chapter of act.chapters) {
      chapterCounter++;

      // Check if Chapter Titles are enabled
      if (template.includeChapterTitles) {
        const headingInfo = formatChapterHeading(chapterCounter, chapter.title, template);
        const chapterAlign =
          template.chapterAlignment === "center"
            ? AlignmentType.CENTER
            : AlignmentType.LEFT;

        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: chapterAlign,
            spacing: { before: 1200, after: headingInfo.subtitle ? 200 : 600 },
            children: [
              new TextRun({
                text: headingInfo.main,
                size: 30,
                bold: true,
                font: docFont,
                color: cleanDocxColor(template.chapterTitleColor, "111827"),
              }),
            ],
          })
        );

        if (headingInfo.subtitle) {
          children.push(
            new Paragraph({
              alignment: chapterAlign,
              spacing: { after: 600 },
              children: [
                new TextRun({
                  text: headingInfo.subtitle,
                  size: 26,
                  italics: true,
                  font: docFont,
                  color: cleanDocxColor(template.subtitleColor, "444444"),
                }),
              ],
            })
          );
        }
      }

      for (let sIdx = 0; sIdx < chapter.scenes.length; sIdx++) {
        const scene = chapter.scenes[sIdx];

        if (sIdx > 0 && template.includeSceneBreaks) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 400 },
              children: [
                new TextRun({
                  text: template.sceneBreakStyle || "* * *",
                  size: 24,
                  bold: true,
                  color: "888888",
                  font: docFont,
                }),
              ],
            })
          );
        }

        if (template.includeSceneTitles) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 300, after: 150 },
              children: [
                new TextRun({
                  text: `— ${scene.title} —`,
                  size: 22,
                  italics: true,
                  bold: true,
                  color: cleanDocxColor(template.subtitleColor, "555555"),
                  font: docFont,
                }),
              ],
            })
          );
        }

        const paragraphs = (scene.content || "")
          .split("\n")
          .filter((p) => p.trim());

        for (const paraText of paragraphs) {
          children.push(
            new Paragraph({
              alignment: wordAlignment,
              spacing: { line: lineSpacingDxa, after: 140 },
              indent: { firstLine: firstLineIndentDxa },
              children: [
                new TextRun({
                  text: paraText,
                  size: bodySizeHalfPt,
                  font: docFont,
                }),
              ],
            })
          );
        }
      }

      // Page break between chapters
      children.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: template.runningHeaders
          ? {
              default: new Header({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: `${project.title} | ${project.author}`,
                        size: 18,
                        font: docFont,
                        color: "888888",
                      }),
                    ],
                  }),
                ],
              }),
            }
          : undefined,
        footers:
          template.pageNumberPosition !== "none"
            ? {
                default: new Footer({
                  children: [
                    new Paragraph({
                      alignment:
                        template.pageNumberPosition === "top-right"
                          ? AlignmentType.RIGHT
                          : AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          children: [PageNumber.CURRENT],
                          size: 20,
                          font: docFont,
                        }),
                      ],
                    }),
                  ],
                }),
              }
            : undefined,
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function generateMarkdown(
  project: NovelProject,
  opts?: ExportExecutionOptions
): string {
  const template = resolveTemplate(project, opts);
  let md = `# ${project.title}\n`;
  if (project.subtitle) md += `*${project.subtitle}*\n\n`;
  md += `**Autor:** ${project.author || "Anónimo"}\n\n`;
  if (project.logline) md += `> ${project.logline}\n\n`;
  md += `---\n\n`;

  let chapterCounter = 0;

  for (let aIdx = 0; aIdx < project.acts.length; aIdx++) {
    const act = project.acts[aIdx];

    if (template.includeActTitles) {
      const actTitle =
        template.actTitleFormat === "ACTO [NUM]"
          ? `ACTO ${toRoman(aIdx + 1)}`
          : act.title;
      md += `# ${actTitle}\n\n`;
      if (act.description) md += `*${act.description}*\n\n`;
    }

    for (const chapter of act.chapters) {
      chapterCounter++;

      if (template.includeChapterTitles) {
        const heading = formatChapterHeading(chapterCounter, chapter.title, template);
        md += `## ${heading.main}\n\n`;
        if (heading.subtitle) md += `*${heading.subtitle}*\n\n`;
      }

      for (let i = 0; i < chapter.scenes.length; i++) {
        const scene = chapter.scenes[i];
        if (i > 0 && template.includeSceneBreaks) {
          md += `\n${template.sceneBreakStyle || "* * *"}\n\n`;
        }
        if (template.includeSceneTitles) {
          md += `### ${scene.title}\n\n`;
        }
        if (scene.content) {
          md += `${scene.content}\n\n`;
        }
      }
    }
  }

  return md;
}

export function generateHtmlManuscript(
  project: NovelProject,
  opts?: ExportExecutionOptions
): string {
  const template = resolveTemplate(project, opts);

  const resolvedFont = resolveExportFont(template.fontFamily, project);
  const fontStack = resolvedFont.htmlStack;

  const chapterAlign = template.chapterAlignment || "center";
  const dropCapColor = template.dropCapColor || "inherit";
  const dropCapSize = template.dropCapLines === 3 ? "3.6em" : "2.6em";

  const paperWidth =
    template.paperSize === "A5"
      ? "148mm"
      : template.paperSize === "Trade"
      ? "152.4mm"
      : "210mm";

  const paperMinHeight =
    template.paperSize === "A5"
      ? "210mm"
      : template.paperSize === "Trade"
      ? "228.6mm"
      : "297mm";

  const printPaperSize =
    template.paperSize === "A5"
      ? "A5"
      : template.paperSize === "Trade"
      ? "6in 9in"
      : "A4";

  const screenPadding =
    template.paperSize === "A5"
      ? "22mm 18mm 22mm 18mm"
      : template.paperSize === "Trade"
      ? "24mm 20mm 24mm 20mm"
      : "26mm 22mm 26mm 22mm";

  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${project.title} - Manuscrito</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=Merriweather:ital,wght@0,300;0,400;1,300&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    ${
      resolvedFont.isCustom && project.settings?.customFontData
        ? `@font-face { font-family: "${project.settings.customFontName}"; src: url("${project.settings.customFontData}"); }`
        : ""
    }
    * {
      box-sizing: border-box;
    }
    @page {
      size: ${printPaperSize};
      margin: 18mm 20mm 20mm 20mm;
    }
    @media print {
      html, body {
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }
      .no-print, #print-banner, .print-header, .print-banner-wrapper {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        overflow: hidden !important;
        opacity: 0 !important;
      }
      .manuscript-container {
        display: block !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .manuscript-sheet {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: 0 !important;
        page-break-after: always;
        break-after: page;
      }
      .title-sheet, .act-sheet, .chapter-sheet {
        page-break-after: always;
        break-after: page;
      }
      .page-break {
        page-break-before: always !important;
        break-before: page !important;
        height: 0 !important;
        display: block !important;
      }
    }
    @media screen {
      html, body {
        background-color: #64748b;
        background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
        background-size: 20px 20px;
        margin: 0;
        padding: 0;
        min-height: 100vh;
      }
      body {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 80px;
      }
      .no-print {
        display: flex;
        width: 100%;
      }
      .manuscript-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-top: 28px;
      }
      .manuscript-sheet {
        background: #ffffff;
        color: #1a1a1a;
        width: ${paperWidth};
        min-height: ${paperMinHeight};
        padding: ${screenPadding};
        margin: 24px auto;
        box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 3px;
        position: relative;
      }
    }
    body {
      font-family: ${fontStack};
      font-size: ${template.fontSize}pt;
      line-height: ${template.lineSpacing};
      color: #1a1a1a;
    }
    .title-sheet {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .title-page {
      text-align: center;
      margin: auto 0;
      width: 100%;
    }
    h1.main-title {
      font-size: 2.5rem;
      margin-bottom: 12px;
      font-weight: 700;
      line-height: 1.2;
    }
    .subtitle {
      font-size: 1.25rem;
      font-style: italic;
      color: ${template.subtitleColor || "#555"};
      margin-bottom: 24px;
    }
    .author {
      font-size: 1.15rem;
      margin-bottom: 30px;
    }
    .logline {
      font-style: italic;
      color: #666;
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .act-sheet {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .act-wrapper {
      margin: auto 0;
      width: 100%;
      text-align: center;
    }
    .act-title {
      font-size: 2rem;
      text-transform: uppercase;
      text-align: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 16px;
      margin-bottom: 18px;
      color: ${template.chapterTitleColor || "#1a1a1a"};
      letter-spacing: 2px;
    }
    .act-description {
      text-align: center;
      font-style: italic;
      color: #666;
      max-width: 480px;
      margin: 0 auto;
    }
    .chapter-sheet {
      display: block;
    }
    .chapter-heading-box {
      text-align: ${chapterAlign};
      margin-top: 24px;
      margin-bottom: 32px;
    }
    .chapter-number {
      font-size: 1.8rem;
      font-weight: 700;
      color: ${template.chapterTitleColor || "#1a1a1a"};
      letter-spacing: 1px;
    }
    .chapter-title {
      font-size: 1.4rem;
      color: ${template.subtitleColor || "#4B5563"};
      margin-top: 8px;
    }
    .chapter-ornament {
      text-align: center;
      margin: 12px auto;
      color: #888;
      letter-spacing: 3px;
    }
    .scene-break {
      text-align: center;
      font-size: 1.2rem;
      color: #888;
      margin: 28px 0;
      letter-spacing: 4px;
    }
    p {
      text-indent: ${template.paragraphIndent ? template.indentSize || "1.5em" : "0"};
      margin: 0 0 0.8em 0;
      text-align: ${template.textAlign === "justify" ? "justify" : "left"};
      hyphens: auto;
    }
    p.no-indent {
      text-indent: 0;
    }
    ${
      template.dropCap
        ? `
    .first-paragraph::first-letter {
      float: left;
      font-size: ${dropCapSize};
      line-height: 0.8;
      margin-top: 0.1em;
      margin-right: 0.12em;
      font-weight: bold;
      color: ${dropCapColor};
    }
    `
        : ""
    }
  </style>
</head>
<body>
  <div class="manuscript-container">
    <!-- Portada / Título -->
    <div class="manuscript-sheet title-sheet">
      <div class="title-page">
        <h1 class="main-title">${project.title}</h1>
        ${project.subtitle ? `<div class="subtitle">${project.subtitle}</div>` : ""}
        <div class="author">Por ${project.author || "Anónimo"}</div>
        ${project.logline ? `<div class="logline">«${project.logline}»</div>` : ""}
      </div>
    </div>
`;

  let chapterCounter = 0;

  for (let aIdx = 0; aIdx < project.acts.length; aIdx++) {
    const act = project.acts[aIdx];

    if (template.includeActTitles) {
      const actText =
        template.actTitleFormat === "ACTO [NUM]"
          ? `ACTO ${toRoman(aIdx + 1)}`
          : act.title;
      html += `    <!-- Act Sheet -->\n`;
      html += `    <div class="manuscript-sheet act-sheet">\n`;
      html += `      <div class="act-wrapper">\n`;
      html += `        <h1 class="act-title">${actText}</h1>\n`;
      if (act.description) {
        html += `        <p class="no-indent act-description">${act.description}</p>\n`;
      }
      html += `      </div>\n`;
      html += `    </div>\n`;
    }

    for (const chapter of act.chapters) {
      chapterCounter++;
      html += `    <!-- Chapter Sheet -->\n`;
      html += `    <div class="manuscript-sheet chapter-sheet">\n`;

      if (template.includeChapterTitles) {
        const heading = formatChapterHeading(chapterCounter, chapter.title, template);
        html += `      <div class="chapter-heading-box">\n`;
        html += `        <div class="chapter-number">${heading.main}</div>\n`;
        if (template.chapterOrnament === "flourish") {
          html += `        <div class="chapter-ornament">❖ ❖ ❖</div>\n`;
        } else if (template.chapterOrnament === "dots") {
          html += `        <div class="chapter-ornament">. . .</div>\n`;
        }
        if (heading.subtitle) {
          html += `        <div class="chapter-title">${heading.subtitle}</div>\n`;
        }
        html += `      </div>\n`;
      }

      for (let i = 0; i < chapter.scenes.length; i++) {
        const scene = chapter.scenes[i];
        if (i > 0 && template.includeSceneBreaks) {
          html += `      <div class="scene-break">${template.sceneBreakStyle || "* * *"}</div>\n`;
        }
        if (template.includeSceneTitles) {
          html += `      <h4 style="color:#666;font-style:italic;margin-top:20px;text-align:center;">— ${scene.title} —</h4>\n`;
        }

        const paragraphs = (scene.content || "").split("\n").filter((p) => p.trim());
        for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
          const isFirstInChapter = i === 0 && pIdx === 0 && template.dropCap;
          html += `      <p class="${isFirstInChapter ? "first-paragraph" : ""}">${paragraphs[pIdx]}</p>\n`;
        }
      }

      html += `    </div>\n`;
    }
  }

  html += `  </div>\n</body>\n</html>`;
  return html;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

export const downloadTextFile = downloadText;

export async function exportToDocx(
  project: NovelProject,
  options?: ExportExecutionOptions
): Promise<void> {
  const blob = await generateDocxBlob(project, options);
  const filename = `${(project.title || "manuscrito").toLowerCase().replace(/\s+/g, "_")}.docx`;
  downloadBlob(blob, filename);
}

export function exportToMarkdown(
  project: NovelProject,
  options?: ExportExecutionOptions
): string {
  return generateMarkdown(project, options);
}

export function exportToHtml(
  project: NovelProject,
  options?: ExportExecutionOptions
): string {
  return generateHtmlManuscript(project, options);
}
