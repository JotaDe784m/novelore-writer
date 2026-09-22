import React, { useState, useMemo, useRef } from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  BookOpen,
  Layers,
  Settings2,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
  Type,
  AlignJustify,
  AlignLeft,
  Indent,
  Plus,
  Trash2,
  Copy,
  Eye,
  Columns2,
  FileSpreadsheet,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { NovelProject, ExportTemplate, PaperSize, ChapterOrnament, SceneBreakStyle } from "../../types";
import { PRESET_EXPORT_TEMPLATES } from "../../types/exportTemplates";
import { resolveExportFont, getEditorFontInfo } from "../../utils/fontResolution";
import {
  exportToDocx,
  exportToMarkdown,
  exportToHtml,
  downloadTextFile,
  toRoman,
  toSpanishWord,
  formatChapterHeading,
} from "../../utils/docxExport";
import { exportProjectToNvlFile, exportProjectToJson } from "../../utils/storage";

interface ExportPageViewProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onBack: () => void;
}

interface RenderedPage {
  pageNumber: number;
  isLeft: boolean; // true for even pages, false for odd
  isTitlePage?: boolean;
  content: React.ReactNode;
}

export const ExportPageView: React.FC<ExportPageViewProps> = ({
  project,
  onUpdateProject,
  onBack,
}) => {
  // All templates: Presets + Custom
  const allTemplates = useMemo(() => {
    const customs = project.settings.customExportTemplates || [];
    return [...PRESET_EXPORT_TEMPLATES, ...customs];
  }, [project.settings.customExportTemplates]);

  // Selected template
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    project.settings.activeExportTemplateId || PRESET_EXPORT_TEMPLATES[1].id // Default to classic pocket
  );

  const currentTemplate = useMemo(() => {
    return (
      allTemplates.find((t) => t.id === activeTemplateId) || PRESET_EXPORT_TEMPLATES[1]
    );
  }, [allTemplates, activeTemplateId]);

  // Active configuration tab
  const [activeTab, setActiveTab] = useState<"templates" | "titles" | "typography" | "layout">("templates");

  // Book reader viewing mode: "spread" (2 pages) or "single"
  const [viewMode, setViewMode] = useState<"spread" | "single">(
    currentTemplate.paperSize === "A4" ? "single" : "spread"
  );
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDocxWarningModal, setShowDocxWarningModal] = useState<boolean>(false);

  // Renaming template state
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState<string>("");
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  // Editor font info & resolved template font
  const editorFontInfo = useMemo(
    () => getEditorFontInfo(project),
    [project.settings?.fontFamily, project.settings?.customFontName, project.settings?.customFontData]
  );
  const resolvedFont = useMemo(
    () => resolveExportFont(currentTemplate.fontFamily, project),
    [currentTemplate.fontFamily, project]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const colorDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [titleColorPreview, setTitleColorPreview] = useState<string | null>(null);
  const [subtitleColorPreview, setSubtitleColorPreview] = useState<string | null>(null);

  const debouncedUpdateTemplateSettings = (updates: Partial<ExportTemplate>) => {
    if (colorDebounceTimerRef.current) {
      clearTimeout(colorDebounceTimerRef.current);
      colorDebounceTimerRef.current = null;
    }
    colorDebounceTimerRef.current = setTimeout(() => {
      updateTemplateSettings(updates);
    }, 250);
  };

  // Helper to update current template settings
  const updateTemplateSettings = (updates: Partial<ExportTemplate>) => {
    const isPreset = currentTemplate.isPreset;

    if (isPreset) {
      // If user edits a preset, create a new custom template automatically or update
      const newCustomTemplate: ExportTemplate = {
        ...currentTemplate,
        ...updates,
        id: `custom-${Date.now()}`,
        name: `${currentTemplate.name} (Personalizada)`,
        isPreset: false,
      };

      onUpdateProject((p) => ({
        ...p,
        settings: {
          ...p.settings,
          customExportTemplates: [
            ...(p.settings.customExportTemplates || []),
            newCustomTemplate,
          ],
          activeExportTemplateId: newCustomTemplate.id,
        },
      }));
      setActiveTemplateId(newCustomTemplate.id);
      showToast("Se ha creado una plantilla personalizada con tus modificaciones");
    } else {
      // Update existing custom template
      onUpdateProject((p) => ({
        ...p,
        settings: {
          ...p.settings,
          customExportTemplates: (p.settings.customExportTemplates || []).map((t) =>
            t.id === currentTemplate.id ? { ...t, ...updates } : t
          ),
        },
      }));
    }
  };

  const handleCreateEmptyTemplate = () => {
    const newCustomTemplate: ExportTemplate = {
      id: `custom-empty-${Date.now()}`,
      name: "Plantilla Vacía",
      description: "Plantilla en blanco sin ornamentos, lista para personalizar libremente.",
      isPreset: false,
      paperSize: "Trade",
      fontFamily: "editor", // Connected to text editor by default!
      fontSize: 11.5,
      lineSpacing: 1.5,
      textAlign: "justify",
      paragraphIndent: true,
      indentSize: "1.5em",
      includeActTitles: true,
      actTitleFormat: "ACTO [NUM]",
      includeChapterTitles: true,
      chapterNumberFormat: "arabic",
      chapterHeadingStyle: "number-title",
      chapterAlignment: "center",
      chapterOrnament: "none",
      chapterPrefix: "Capítulo",
      chapterTitleColor: "#000000",
      subtitleColor: "#4B5563",
      includeSceneTitles: false,
      includeSceneBreaks: true,
      sceneBreakStyle: "* * *",
      dropCap: false,
      dropCapLines: 2,
      dropCapStyle: "clean-modern",
      runningHeaders: true,
      pageNumberPosition: "bottom-center",
    };

    onUpdateProject((p) => ({
      ...p,
      settings: {
        ...p.settings,
        customExportTemplates: [
          ...(p.settings.customExportTemplates || []),
          newCustomTemplate,
        ],
        activeExportTemplateId: newCustomTemplate.id,
      },
    }));
    setActiveTemplateId(newCustomTemplate.id);
    setActiveTab("templates");
    setEditingTemplateId(null);
    showToast("¡Plantilla vacía creada! Configúrala a tu gusto");
  };

  const handleStartRenameTemplate = (tmpl: ExportTemplate) => {
    setActiveTab("templates");
    setEditingTemplateId(tmpl.id);
    setEditingTemplateName(tmpl.name);
  };

  const handleSaveRenameTemplate = (tmplId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setEditingTemplateId(null);
      return;
    }

    const targetTmpl = allTemplates.find((t) => t.id === tmplId);
    if (!targetTmpl) return;

    if (targetTmpl.isPreset) {
      // Clones preset into a new custom template with the new name
      const customCloned: ExportTemplate = {
        ...targetTmpl,
        id: `custom-${Date.now()}`,
        name: trimmed,
        isPreset: false,
      };
      onUpdateProject((p) => ({
        ...p,
        settings: {
          ...p.settings,
          customExportTemplates: [
            ...(p.settings.customExportTemplates || []),
            customCloned,
          ],
          activeExportTemplateId: customCloned.id,
        },
      }));
      setActiveTemplateId(customCloned.id);
      showToast(`Plantilla guardada como "${trimmed}"`);
    } else {
      // Updates existing custom template name
      onUpdateProject((p) => ({
        ...p,
        settings: {
          ...p.settings,
          customExportTemplates: (p.settings.customExportTemplates || []).map((t) =>
            t.id === tmplId ? { ...t, name: trimmed } : t
          ),
        },
      }));
      showToast(`Nombre actualizado a "${trimmed}"`);
    }

    setEditingTemplateId(null);
  };

  const handleDuplicateTemplate = () => {
    const duplicated: ExportTemplate = {
      ...currentTemplate,
      id: `custom-${Date.now()}`,
      name: `${currentTemplate.name} (Copia)`,
      isPreset: false,
    };
    onUpdateProject((p) => ({
      ...p,
      settings: {
        ...p.settings,
        customExportTemplates: [
          ...(p.settings.customExportTemplates || []),
          duplicated,
        ],
        activeExportTemplateId: duplicated.id,
      },
    }));
    setActiveTemplateId(duplicated.id);
    showToast(`Plantilla "${duplicated.name}" duplicada con éxito`);
  };

  const handleConfirmDeleteTemplate = (id: string) => {
    onUpdateProject((p) => {
      const remainingCustom = (p.settings.customExportTemplates || []).filter(
        (t) => t.id !== id
      );
      const isCurrentActive = p.settings.activeExportTemplateId === id;
      return {
        ...p,
        settings: {
          ...p.settings,
          customExportTemplates: remainingCustom,
          activeExportTemplateId: isCurrentActive
            ? PRESET_EXPORT_TEMPLATES[0].id
            : p.settings.activeExportTemplateId,
        },
      };
    });

    if (activeTemplateId === id) {
      setActiveTemplateId(PRESET_EXPORT_TEMPLATES[0].id);
    }
    setDeletingTemplateId(null);
    showToast("Plantilla eliminada con éxito");
  };

  // Generate rendered book pages
  const renderedPages: RenderedPage[] = useMemo(() => {
    const pages: RenderedPage[] = [];
    let pageNum = 1;

    // PAGE 1: Title Page
    pages.push({
      pageNumber: pageNum++,
      isLeft: false,
      isTitlePage: true,
      content: (
        <div className="h-full flex flex-col justify-between py-12 px-6 text-center select-none bg-white text-neutral-900">
          <div className="space-y-4 my-auto">
            <h1
              className="text-2xl sm:text-3xl font-bold font-novel-display tracking-tight text-neutral-900"
              style={{
                color: currentTemplate.chapterTitleColor || "#000000",
                fontFamily: resolvedFont.titleCssFamily,
              }}
            >
              {project.title}
            </h1>
            {project.subtitle && (
              <p
                className="text-sm italic"
                style={{
                  color: currentTemplate.subtitleColor || "#4B5563",
                  fontFamily: resolvedFont.cssFamily,
                }}
              >
                {project.subtitle}
              </p>
            )}
            <div className="w-12 h-px bg-neutral-300 mx-auto my-6" />
            <p
              className="text-sm font-medium tracking-wide uppercase text-neutral-800"
              style={{ fontFamily: resolvedFont.titleCssFamily }}
            >
              {project.author || "Anónimo"}
            </p>
            {project.logline && (
              <p
                className="text-xs italic text-neutral-500 max-w-xs mx-auto pt-6"
                style={{ fontFamily: resolvedFont.cssFamily }}
              >
                «{project.logline}»
              </p>
            )}
          </div>
          <div
            className="text-[10px] text-neutral-400 uppercase tracking-widest"
            style={{ fontFamily: resolvedFont.cssFamily }}
          >
            {project.genre || "Manuscrito"} • {new Date().getFullYear()}
          </div>
        </div>
      ),
    });

    // Content pages
    let chapterCounter = 0;

    project.acts.forEach((act, actIdx) => {
      // Act Page if included
      if (currentTemplate.includeActTitles) {
        const actLabel =
          currentTemplate.actTitleFormat === "ACTO [NUM]"
            ? `ACTO ${toRoman(actIdx + 1)}`
            : currentTemplate.actTitleFormat === "Acto [NUM]: [TITULO]"
            ? `Acto ${actIdx + 1}: ${act.title}`
            : act.title.toUpperCase();

        pages.push({
          pageNumber: pageNum++,
          isLeft: pageNum % 2 === 0,
          content: (
            <div
              className="h-full flex flex-col justify-center items-center text-center p-8 select-none bg-white text-neutral-900"
              style={{ fontFamily: resolvedFont.cssFamily }}
            >
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold mb-2">
                Parte
              </span>
              <h2
                className="text-xl font-bold font-novel-display uppercase tracking-wider border-b border-neutral-200 pb-3 max-w-xs"
                style={{
                  color: currentTemplate.chapterTitleColor || "#000000",
                  fontFamily: resolvedFont.titleCssFamily,
                }}
              >
                {actLabel}
              </h2>
              {act.description && (
                <p
                  className="text-xs italic mt-4 max-w-xs"
                  style={{
                    color: currentTemplate.subtitleColor || "#4B5563",
                    fontFamily: resolvedFont.cssFamily,
                  }}
                >
                  {act.description}
                </p>
              )}
            </div>
          ),
        });
      }

      act.chapters.forEach((chapter) => {
        chapterCounter++;
        const headingInfo = formatChapterHeading(chapterCounter, chapter.title, currentTemplate);

        // Collect paragraphs
        const chapterParagraphs: { isFirstInChapter: boolean; text: string }[] = [];

        chapter.scenes.forEach((scene, sceneIdx) => {
          if (sceneIdx > 0 && currentTemplate.includeSceneBreaks) {
            chapterParagraphs.push({
              isFirstInChapter: false,
              text: `__SCENE_BREAK__`,
            });
          }
          if (currentTemplate.includeSceneTitles) {
            chapterParagraphs.push({
              isFirstInChapter: false,
              text: `__SCENE_TITLE__${scene.title}`,
            });
          }

          const paras = (scene.content || "")
            .split("\n")
            .filter((p) => p.trim());

          paras.forEach((pText, pIdx) => {
            chapterParagraphs.push({
              isFirstInChapter: sceneIdx === 0 && pIdx === 0,
              text: pText,
            });
          });
        });

        // Group into realistic visual book pages (~3-4 paragraphs per page)
        const paragraphsPerPage = currentTemplate.paperSize === "A4" ? 5 : 3;
        let pIndex = 0;
        let isFirstPageOfChapter = true;

        while (pIndex < chapterParagraphs.length || isFirstPageOfChapter) {
          const slice = chapterParagraphs.slice(pIndex, pIndex + paragraphsPerPage);
          pIndex += paragraphsPerPage;
          const isThisChapterStart = isFirstPageOfChapter;
          isFirstPageOfChapter = false;

          const isEvenPage = pageNum % 2 === 0;

          pages.push({
            pageNumber: pageNum++,
            isLeft: isEvenPage,
            content: (
              <div
                className="h-full flex flex-col justify-between p-6 sm:p-8 text-neutral-900 bg-white"
                style={{
                  fontFamily: resolvedFont.cssFamily,
                  fontSize: `${(currentTemplate.fontSize || 11.5) * 0.95}pt`,
                  lineHeight: currentTemplate.lineSpacing || 1.5,
                }}
              >
                {/* Running Header */}
                {currentTemplate.runningHeaders && (
                  <div
                    className="flex justify-between items-center text-[10px] text-neutral-400 border-b border-neutral-200 pb-2 mb-4 select-none"
                    style={{ fontFamily: resolvedFont.cssFamily }}
                  >
                    <span className="uppercase tracking-wider">
                      {isEvenPage ? project.author || "Autor" : project.title}
                    </span>
                    {currentTemplate.pageNumberPosition === "top-right" && (
                      <span>{pageNum - 1}</span>
                    )}
                  </div>
                )}

                {/* Body Content */}
                <div className="flex-1 overflow-hidden space-y-3">
                  {/* Chapter Header on Chapter First Page */}
                  {isThisChapterStart && currentTemplate.includeChapterTitles && (
                    <div
                      className={`mb-6 select-none ${
                        currentTemplate.chapterAlignment === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      <h3
                        className="text-base sm:text-lg font-bold font-novel-display"
                        style={{
                          color: currentTemplate.chapterTitleColor || "#000000",
                          fontFamily: resolvedFont.titleCssFamily,
                        }}
                      >
                        {headingInfo.main}
                      </h3>

                      {/* Chapter Ornament */}
                      {currentTemplate.chapterOrnament === "flourish" && (
                        <div className="my-2 flex justify-center text-neutral-400">
                          <svg className="w-16 h-3 fill-current" viewBox="0 0 100 20">
                            <path d="M0,10 Q25,0 50,10 Q75,20 100,10 Q75,15 50,10 Q25,5 0,10 Z" />
                            <circle cx="50" cy="10" r="3" />
                          </svg>
                        </div>
                      )}
                      {currentTemplate.chapterOrnament === "dots" && (
                        <div className="my-2 tracking-[0.4em] text-neutral-400 text-xs">
                          . . .
                        </div>
                      )}

                      {headingInfo.subtitle && (
                        <p
                          className="text-sm italic mt-1"
                          style={{
                            color: currentTemplate.subtitleColor || "#4B5563",
                            fontFamily: resolvedFont.cssFamily,
                          }}
                        >
                          {headingInfo.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Paragraphs */}
                  {slice.map((item, idx) => {
                    if (item.text === "__SCENE_BREAK__") {
                      return (
                        <div
                          key={idx}
                          className="py-2 text-center text-neutral-400 font-bold tracking-widest text-xs select-none"
                          style={{ fontFamily: resolvedFont.cssFamily }}
                        >
                          {currentTemplate.sceneBreakStyle || "* * *"}
                        </div>
                      );
                    }
                    if (item.text.startsWith("__SCENE_TITLE__")) {
                      return (
                        <div
                          key={idx}
                          className="pt-2 font-semibold italic text-[11px]"
                          style={{
                            color: currentTemplate.subtitleColor || "#4B5563",
                            fontFamily: resolvedFont.cssFamily,
                          }}
                        >
                          — {item.text.replace("__SCENE_TITLE__", "")} —
                        </div>
                      );
                    }

                    // First paragraph Drop Cap
                    if (item.isFirstInChapter && currentTemplate.dropCap && item.text.length > 0) {
                      const firstChar = item.text.charAt(0);
                      const restText = item.text.slice(1);
                      return (
                        <p
                          key={idx}
                          style={{
                            textAlign: currentTemplate.textAlign,
                            textIndent: 0,
                            fontFamily: resolvedFont.cssFamily,
                            fontSize: `${(currentTemplate.fontSize || 11.5) * 0.95}pt`,
                            lineHeight: currentTemplate.lineSpacing || 1.5,
                          }}
                        >
                          <span
                            className="float-left font-bold pr-2 pt-0.5 leading-none select-none"
                            style={{
                              fontSize: currentTemplate.dropCapLines === 3 ? "2.6rem" : "1.9rem",
                              color: currentTemplate.dropCapColor || currentTemplate.chapterTitleColor || "#000000",
                              lineHeight: "0.8",
                              fontFamily:
                                currentTemplate.dropCapStyle === "ornamental-gothic"
                                  ? "'Cinzel', serif"
                                  : currentTemplate.dropCapStyle === "classic-serif"
                                  ? "'EB Garamond', serif"
                                  : resolvedFont.titleCssFamily,
                            }}
                          >
                            {firstChar}
                          </span>
                          {restText}
                        </p>
                      );
                    }

                    return (
                      <p
                        key={idx}
                        style={{
                          textAlign: currentTemplate.textAlign,
                          textIndent:
                            (project.settings.paragraphIndent ?? currentTemplate.paragraphIndent) && !item.isFirstInChapter
                              ? currentTemplate.indentSize || "1.5em"
                              : "0",
                          fontFamily: resolvedFont.cssFamily,
                          fontSize: `${(currentTemplate.fontSize || 11.5) * 0.95}pt`,
                          lineHeight: currentTemplate.lineSpacing || 1.5,
                        }}
                      >
                        {item.text}
                      </p>
                    );
                  })}
                </div>

                {/* Footer with Page Number */}
                {currentTemplate.pageNumberPosition !== "none" &&
                  currentTemplate.pageNumberPosition !== "top-right" && (
                    <div
                      className={`text-[10px] text-neutral-400 font-mono pt-3 border-t border-neutral-200 select-none ${
                        currentTemplate.pageNumberPosition === "bottom-center"
                          ? "text-center"
                          : isEvenPage
                          ? "text-left"
                          : "text-right"
                      }`}
                    >
                      {pageNum - 1}
                    </div>
                  )}
              </div>
            ),
          });
        }
      });
    });

    return pages;
  }, [project, currentTemplate]);

  // Handle pagination
  const totalPages = renderedPages.length;
  const maxSpreadIndex = Math.max(0, Math.ceil(totalPages / 2) - 1);

  const leftPage = viewMode === "spread" ? renderedPages[currentPageIndex * 2] : renderedPages[currentPageIndex];
  const rightPage = viewMode === "spread" ? renderedPages[currentPageIndex * 2 + 1] : null;

  // Real Export Handlers
  const handleExportDocx = () => {
    setShowDocxWarningModal(true);
  };

  const executeDocxDownload = async () => {
    setIsExporting(true);
    try {
      await exportToDocx(project, { template: currentTemplate });
      showToast("¡Documento DOCX generado con el formato de la plantilla!");
    } catch (err: any) {
      alert(`Error al exportar DOCX: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHtml = () => {
    const html = exportToHtml(project, { template: currentTemplate });
    downloadTextFile(
      html,
      `${project.title.toLowerCase().replace(/\s+/g, "_")}_maquetado.html`,
      "text/html"
    );
    showToast("¡Manuscrito HTML maquetado descargado!");
  };

  const handleExportMarkdown = () => {
    const md = exportToMarkdown(project, { template: currentTemplate });
    downloadTextFile(
      md,
      `${project.title.toLowerCase().replace(/\s+/g, "_")}.md`,
      "text/markdown"
    );
    showToast("¡Archivo Markdown descargado!");
  };

  const handlePrintOrPdf = () => {
    setIsExporting(true);
    try {
      const htmlContent = exportToHtml(project, { template: currentTemplate });
      
      // Inject printable top banner and print controls with guaranteed print exclusion
      const printableHtml = htmlContent.replace(
        "<body>",
        `<body>
          <div id="print-banner" class="no-print" style="position: sticky; top: 0; background: #0f172a; color: #ffffff; padding: 14px 28px; width: 100%; box-sizing: border-box; justify-content: space-between; align-items: center; z-index: 99999; box-shadow: 0 4px 16px rgba(0,0,0,0.3); font-family: system-ui, -apple-system, sans-serif;">
            <div>
              <div style="font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <span>🖨️ Manuscrito Listo para Guardar en PDF / Imprimir</span>
              </div>
              <p style="font-size: 12px; margin: 3px 0 0 0; color: #94a3b8;">
                En el diálogo de tu navegador: Selecciona <strong>"Guardar como PDF"</strong> en Destino y tamaño de papel <strong>${currentTemplate.paperSize}</strong>.
              </p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <button onclick="window.__cleanPrint ? window.__cleanPrint() : window.print()" style="background: #2563eb; color: #ffffff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.4);">
                🖨️ Guardar como PDF
              </button>
              <button onclick="window.close()" style="background: #334155; color: #f1f5f9; border: none; padding: 8px 14px; border-radius: 6px; font-size: 13px; cursor: pointer;">
                Cerrar
              </button>
            </div>
          </div>
          <script>
            window.__cleanPrint = function() {
              var banner = document.getElementById("print-banner");
              if (banner) banner.style.setProperty("display", "none", "important");
              window.print();
              setTimeout(function() {
                if (banner) banner.style.removeProperty("display");
              }, 1200);
            };
            window.addEventListener('beforeprint', function() {
              var banner = document.getElementById("print-banner");
              if (banner) banner.style.setProperty("display", "none", "important");
            });
            window.addEventListener('afterprint', function() {
              var banner = document.getElementById("print-banner");
              if (banner) banner.style.removeProperty("display");
            });
          </script>`
      );

      // 1. Try opening dedicated print window
      const printWin = window.open("", "_blank");
      if (printWin) {
        printWin.document.open();
        printWin.document.write(printableHtml);
        printWin.document.close();
        printWin.focus();

        const triggerPrint = () => {
          try {
            if (typeof (printWin as any).__cleanPrint === "function") {
              (printWin as any).__cleanPrint();
            } else {
              printWin.print();
            }
          } catch (e) {
            console.warn("Auto-print deferred", e);
          }
        };

        if (printWin.document.fonts) {
          printWin.document.fonts.ready.then(() => {
            setTimeout(triggerPrint, 350);
          });
        } else {
          setTimeout(triggerPrint, 600);
        }
        showToast("Ventana de maquetación y PDF preparada");
        return;
      }
    } catch (e) {
      console.warn("Popup blocked, trying iframe print...", e);
    } finally {
      setIsExporting(false);
    }

    // 2. Secondary fallback: print via hidden iframe inside current page
    try {
      let iframe = document.getElementById("novelore-print-iframe") as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "novelore-print-iframe";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);
      }
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(exportToHtml(project, { template: currentTemplate }));
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          showToast("Diálogo de impresión activado");
        }, 500);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // 3. Last fallback
    window.print();
  };

  return (
    <div
      id="novelore-export-page"
      className="flex-1 flex flex-col w-full overflow-hidden min-h-0"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-semibold px-4 py-2 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <header
        className="h-12 border-b px-3 sm:px-4 flex items-center justify-between shrink-0 select-none overflow-x-auto scrollbar-none gap-2"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Volver al Manuscrito</span>
            <span className="sm:hidden">Volver</span>
          </button>

          <div className="h-4 w-px bg-[var(--border-color)] hidden sm:block shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <BookOpen className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <h2 className="font-bold text-xs sm:text-sm font-novel-display truncate">
              Maquetación & Diseñador de Exportación
            </h2>
          </div>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              exportProjectToNvlFile(project);
              showToast("¡Proyecto exportado como archivo propio .nvl!");
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            title="Descargar copia de seguridad editable en formato .nvl"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline">Exportar .nvl</span>
            <span className="sm:hidden">.nvl</span>
          </button>

          <button
            onClick={handlePrintOrPdf}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            title="Abrir vista de impresión / Guardar en PDF con formato exacto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <button
            onClick={handleExportDocx}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity shadow-xs cursor-pointer shrink-0"
            title="Exportar a Microsoft Word (.docx) respetando toda la plantilla"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-contrast)]" />
            <span>{isExporting ? "Compilando..." : "Descargar DOCX"}</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left Configurator & Right Book Reader Canvas */}
      <div className="flex-1 flex overflow-hidden min-h-0 w-full">
        {/* LEFT PANEL: CONFIGURATOR (Plantillas, Títulos, Subtítulos, Tipografía) */}
        <aside
          className="w-72 sm:w-80 md:w-88 lg:w-96 max-w-[85vw] border-r flex flex-col shrink-0 min-h-0 overflow-hidden"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-color)",
          }}
        >
          {/* Active Template Indicator & Quick Rename */}
          <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-card)]/60 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider flex items-center gap-1">
                <span>Plantilla activa</span>
                {!currentTemplate.isPreset && (
                  <span className="text-[9px] bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold px-1 py-0.2 rounded">
                    Personalizada
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-[var(--text-main)] truncate mt-0.5">
                {currentTemplate.name}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleStartRenameTemplate(currentTemplate)}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer transition-colors shrink-0"
              title={currentTemplate.isPreset ? "Guardar copia con otro nombre" : "Renombrar plantilla"}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="flex border-b border-[var(--border-color)] text-xs font-medium p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer text-center ${
                activeTab === "templates"
                  ? "bg-[var(--bg-card)] font-bold text-[var(--text-main)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              Plantillas
            </button>
            <button
              onClick={() => setActiveTab("titles")}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer text-center ${
                activeTab === "titles"
                  ? "bg-[var(--bg-card)] font-bold text-[var(--text-main)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              Títulos & Actos
            </button>
            <button
              onClick={() => setActiveTab("typography")}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer text-center ${
                activeTab === "typography"
                  ? "bg-[var(--bg-card)] font-bold text-[var(--text-main)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              Tipografía
            </button>
            <button
              onClick={() => setActiveTab("layout")}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer text-center ${
                activeTab === "layout"
                  ? "bg-[var(--bg-card)] font-bold text-[var(--text-main)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              Página
            </button>
          </div>

          {/* Panel Scrollable Content */}
          <div
            id="export-panel-scrollable-content"
            className="flex-1 min-h-0 overflow-y-scroll p-4 space-y-5 custom-scroll always-scroll select-text"
            style={{
              overflowY: "scroll",
              scrollbarGutter: "stable",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* TAB 1: SELECCIÓN & CREACIÓN DE PLANTILLAS */}
            {activeTab === "templates" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Plantillas
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCreateEmptyTemplate}
                      className="flex items-center gap-1 text-[11px] bg-[var(--accent)] text-[var(--accent-contrast)] px-2.5 py-1 rounded-md font-semibold cursor-pointer shadow-xs hover:opacity-90 transition-opacity"
                      title="Crear una plantilla en blanco desde cero"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Plantilla Vacía</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDuplicateTemplate}
                      className="flex items-center gap-1 text-[11px] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded-md font-semibold cursor-pointer transition-colors"
                      title="Duplicar la plantilla actual como una personalizada"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Duplicar</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {allTemplates.map((tmpl) => {
                    const isSelected = tmpl.id === currentTemplate.id;
                    const isEditingThis = editingTemplateId === tmpl.id;

                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => {
                          setActiveTemplateId(tmpl.id);
                          onUpdateProject((p) => ({
                            ...p,
                            settings: { ...p.settings, activeExportTemplateId: tmpl.id },
                          }));
                          if (tmpl.paperSize === "A4") setViewMode("single");
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--bg-card)] shadow-sm ring-1 ring-[var(--accent)]"
                            : "border-[var(--border-color)] hover:border-[var(--text-muted)] bg-[var(--bg-input)]/40"
                        }`}
                      >
                        {isEditingThis ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="w-full my-1 p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--accent)] space-y-2"
                          >
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                              Renombrar plantilla
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingTemplateName}
                                onChange={(e) => setEditingTemplateName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveRenameTemplate(tmpl.id, editingTemplateName);
                                  } else if (e.key === "Escape") {
                                    setEditingTemplateId(null);
                                  }
                                }}
                                className="flex-1 text-xs px-2.5 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] font-semibold focus:outline-hidden focus:border-[var(--accent)]"
                                autoFocus
                                placeholder="Nombre de la plantilla"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRenameTemplate(tmpl.id, editingTemplateName)}
                                className="px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold rounded-md cursor-pointer hover:opacity-90 shrink-0 shadow-2xs"
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTemplateId(null)}
                                className="px-2 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs rounded-md cursor-pointer border border-[var(--border-color)] shrink-0 hover:bg-black/5 dark:hover:bg-white/5"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-[var(--text-main)]">
                                  {tmpl.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartRenameTemplate(tmpl);
                                  }}
                                  className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/5 rounded cursor-pointer transition-colors"
                                  title={tmpl.isPreset ? "Guardar copia con otro nombre" : "Renombrar plantilla"}
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                {!tmpl.isPreset && (
                                  <span className="text-[10px] bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold px-1.5 py-0.2 rounded">
                                    Personalizada
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">
                                {tmpl.description}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-[var(--accent)] shrink-0 ml-1 mt-0.5" />
                            )}
                          </div>
                        )}

                        {/* Badges de especificación */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px] text-[var(--text-muted)] font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
                            {tmpl.paperSize}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 capitalize">
                            {tmpl.fontFamily === "editor" ? `Editor (${editorFontInfo.key})` : tmpl.fontFamily}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
                            Interlineado {tmpl.lineSpacing}
                          </span>
                          {tmpl.dropCap && (
                            <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
                              Capitular {tmpl.dropCapLines}L
                            </span>
                          )}
                        </div>

                        {/* Delete custom template button */}
                        {!tmpl.isPreset && (
                          <div
                            className="mt-2 pt-2 border-t border-[var(--border-color)]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {deletingTemplateId === tmpl.id ? (
                              <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                                <span className="text-[11px] text-red-500 font-semibold">
                                  ¿Eliminar definitivamente?
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDeleteTemplate(tmpl.id)}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded cursor-pointer transition-colors shadow-2xs"
                                  >
                                    Sí, eliminar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingTemplateId(null)}
                                    className="px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-main)] text-[10px] rounded cursor-pointer border border-[var(--border-color)]"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setDeletingTemplateId(tmpl.id)}
                                  className="text-[11px] text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Eliminar plantilla</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: CONFIGURACIÓN DE TÍTULOS Y SUBTÍTULOS (100% Funcional) */}
            {activeTab === "titles" && (
              <div className="space-y-4">
                {/* Actos */}
                <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-main)] cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentTemplate.includeActTitles}
                        onChange={(e) =>
                          updateTemplateSettings({ includeActTitles: e.target.checked })
                        }
                        className="rounded accent-[var(--accent)] cursor-pointer"
                      />
                      <span>Incluir Títulos de Acto</span>
                    </label>
                  </div>

                  {currentTemplate.includeActTitles && (
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Formato del Título de Acto
                      </label>
                      <select
                        value={currentTemplate.actTitleFormat}
                        onChange={(e) =>
                          updateTemplateSettings({
                            actTitleFormat: e.target.value as any,
                          })
                        }
                        className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                      >
                        <option value="ACTO [NUM]">ACTO I, ACTO II (Números Romanos)</option>
                        <option value="Acto [NUM]: [TITULO]">Acto 1: [Nombre del Acto]</option>
                        <option value="[TITULO]">Solo el Nombre del Acto</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Capítulos */}
                <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-main)] cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentTemplate.includeChapterTitles}
                        onChange={(e) =>
                          updateTemplateSettings({ includeChapterTitles: e.target.checked })
                        }
                        className="rounded accent-[var(--accent)] cursor-pointer"
                      />
                      <span>Incluir Encabezados de Capítulo</span>
                    </label>
                  </div>

                  {currentTemplate.includeChapterTitles && (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                          Numeración de Capítulo
                        </label>
                        <select
                          value={currentTemplate.chapterNumberFormat}
                          onChange={(e) =>
                            updateTemplateSettings({
                              chapterNumberFormat: e.target.value as any,
                            })
                          }
                          className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                        >
                          <option value="arabic">Números Arábigos (1, 2, 3...)</option>
                          <option value="roman">Números Romanos (I, II, IV, V...)</option>
                          <option value="words">En Letras (Uno, Dos, Tres...)</option>
                          <option value="none">Sin número de capítulo</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                          Disposición del Título
                        </label>
                        <select
                          value={currentTemplate.chapterHeadingStyle}
                          onChange={(e) =>
                            updateTemplateSettings({
                              chapterHeadingStyle: e.target.value as any,
                            })
                          }
                          className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                        >
                          <option value="subtitle-stacked">Número arriba y Título debajo (Apilado)</option>
                          <option value="number-title">Número y Título en la misma línea (—)</option>
                          <option value="number-only">Solo Número (ej: Capítulo 1 / IV)</option>
                          <option value="title-only">Solo Título de la escena/capítulo</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                            Alineación
                          </label>
                          <select
                            value={currentTemplate.chapterAlignment}
                            onChange={(e) =>
                              updateTemplateSettings({
                                chapterAlignment: e.target.value as any,
                              })
                            }
                            className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                          >
                            <option value="center">Centrado</option>
                            <option value="left">Izquierda</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                            Adorno Divisor
                          </label>
                          <select
                            value={currentTemplate.chapterOrnament}
                            onChange={(e) =>
                              updateTemplateSettings({
                                chapterOrnament: e.target.value as any,
                              })
                            }
                            className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                          >
                            <option value="none">Ninguno</option>
                            <option value="flourish">Filigrana Floral SVG</option>
                            <option value="dots">Puntos (. . .)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                          Prefijo del Capítulo
                        </label>
                        <input
                          type="text"
                          value={currentTemplate.chapterPrefix}
                          onChange={(e) =>
                            updateTemplateSettings({ chapterPrefix: e.target.value })
                          }
                          placeholder="Ej: Capítulo, Chapter, Parte..."
                          className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                        />
                      </div>

                      {/* Color de Título de Capítulo */}
                      <div className="pt-2 border-t border-[var(--border-color)]">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-[var(--text-muted)]">
                            Color del Título de Capítulo
                          </label>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold">
                            {currentTemplate.chapterTitleColor || "#000000"}
                          </span>
                        </div>

                        {/* Presets de Color incluyendo Negro Puro */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {[
                            { label: "Negro Puro", color: "#000000" },
                            { label: "Negro Tinta", color: "#111827" },
                            { label: "Carbón", color: "#374151" },
                            { label: "Sepia", color: "#78350F" },
                            { label: "Borgoña", color: "#831843" },
                            { label: "Azul Marino", color: "#1E3A8A" },
                            { label: "Esmeralda", color: "#064E3B" },
                          ].map((preset) => {
                            const isCurrent =
                              (currentTemplate.chapterTitleColor || "#000000").toLowerCase() ===
                              preset.color.toLowerCase();
                            return (
                              <button
                                key={preset.color}
                                type="button"
                                onClick={() =>
                                  updateTemplateSettings({ chapterTitleColor: preset.color })
                                }
                                className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                                  isCurrent
                                    ? "scale-120 ring-2 ring-offset-1 ring-[var(--accent)] border-white shadow-xs"
                                    : "border-black/20 hover:scale-110"
                                }`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.label}
                              />
                            );
                          })}
                        </div>

                        {/* Selector de Color Personalizado (Paleta + Entrada HEX) */}
                        <div className="flex items-center gap-2">
                          <label className="relative flex items-center justify-center w-7 h-7 rounded-lg border border-[var(--border-color)] overflow-hidden cursor-pointer shadow-xs shrink-0">
                            <input
                              type="color"
                              value={titleColorPreview || currentTemplate.chapterTitleColor || "#000000"}
                              onInput={(e) => {
                                setTitleColorPreview((e.target as HTMLInputElement).value);
                              }}
                              onChange={(e) => {
                                const val = (e.target as HTMLInputElement).value;
                                setTitleColorPreview(null);
                                updateTemplateSettings({
                                  chapterTitleColor: val,
                                });
                              }}
                              className="absolute inset-0 w-10 h-10 -top-1 -left-1 cursor-pointer border-0 p-0"
                              title="Paleta de color libre"
                            />
                          </label>
                          <div className="flex-1 flex items-center">
                            <input
                              type="text"
                              value={titleColorPreview || currentTemplate.chapterTitleColor || "#000000"}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTitleColorPreview(null);
                                updateTemplateSettings({ chapterTitleColor: val });
                              }}
                              placeholder="#000000"
                              className="w-full text-xs font-mono px-2 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] uppercase"
                              title="Código de color HEX personalizado"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Color de Subtítulos de Capítulo y Escena */}
                      <div className="pt-2 border-t border-[var(--border-color)]">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-[var(--text-muted)]">
                            Color de Subtítulos (Capítulo y Escena)
                          </label>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold">
                            {subtitleColorPreview || currentTemplate.subtitleColor || "#4B5563"}
                          </span>
                        </div>

                        {/* Presets de Color incluyendo Negro Puro */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {[
                            { label: "Negro Puro", color: "#000000" },
                            { label: "Negro Tinta", color: "#111827" },
                            { label: "Carbón Neutro", color: "#4B5563" },
                            { label: "Gris Suave", color: "#6B7280" },
                            { label: "Sepia Cálido", color: "#78350F" },
                            { label: "Azul Pizarra", color: "#334155" },
                            { label: "Borgoña", color: "#831843" },
                          ].map((preset) => {
                            const isCurrent =
                              (subtitleColorPreview || currentTemplate.subtitleColor || "#4B5563").toLowerCase() ===
                              preset.color.toLowerCase();
                            return (
                              <button
                                key={preset.color}
                                type="button"
                                onClick={() => {
                                  setSubtitleColorPreview(null);
                                  updateTemplateSettings({ subtitleColor: preset.color });
                                }}
                                className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                                  isCurrent
                                    ? "scale-120 ring-2 ring-offset-1 ring-[var(--accent)] border-white shadow-xs"
                                    : "border-black/20 hover:scale-110"
                                }`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.label}
                              />
                            );
                          })}
                        </div>

                        {/* Selector de Color Personalizado (Paleta + Entrada HEX) */}
                        <div className="flex items-center gap-2">
                          <label className="relative flex items-center justify-center w-7 h-7 rounded-lg border border-[var(--border-color)] overflow-hidden cursor-pointer shadow-xs shrink-0">
                            <input
                              type="color"
                              value={subtitleColorPreview || currentTemplate.subtitleColor || "#4B5563"}
                              onInput={(e) => {
                                setSubtitleColorPreview((e.target as HTMLInputElement).value);
                              }}
                              onChange={(e) => {
                                const val = (e.target as HTMLInputElement).value;
                                setSubtitleColorPreview(null);
                                updateTemplateSettings({
                                  subtitleColor: val,
                                });
                              }}
                              className="absolute inset-0 w-10 h-10 -top-1 -left-1 cursor-pointer border-0 p-0"
                              title="Paleta de color libre de subtítulo"
                            />
                          </label>
                          <div className="flex-1 flex items-center">
                            <input
                              type="text"
                              value={subtitleColorPreview || currentTemplate.subtitleColor || "#4B5563"}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSubtitleColorPreview(null);
                                updateTemplateSettings({ subtitleColor: val });
                              }}
                              placeholder="#4B5563"
                              className="w-full text-xs font-mono px-2 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] uppercase"
                              title="Código de color HEX personalizado"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-tight">
                          Elige negro puro, tonos sobrios o cualquier color personalizado HEX.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Escenas y Separadores */}
                <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-main)] cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentTemplate.includeSceneTitles}
                        onChange={(e) =>
                          updateTemplateSettings({ includeSceneTitles: e.target.checked })
                        }
                        className="rounded accent-[var(--accent)] cursor-pointer"
                      />
                      <span>Incluir Nombres de Escena en el Manuscrito</span>
                    </label>

                    <label className="text-xs font-bold text-[var(--text-main)] cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentTemplate.includeSceneBreaks}
                        onChange={(e) =>
                          updateTemplateSettings({ includeSceneBreaks: e.target.checked })
                        }
                        className="rounded accent-[var(--accent)] cursor-pointer"
                      />
                      <span>Separadores Ornamentales entre Escenas</span>
                    </label>
                  </div>

                  {currentTemplate.includeSceneBreaks && (
                    <div className="pt-1">
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Símbolo de Separador
                      </label>
                      <select
                        value={currentTemplate.sceneBreakStyle}
                        onChange={(e) =>
                          updateTemplateSettings({
                            sceneBreakStyle: e.target.value as any,
                          })
                        }
                        className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                      >
                        <option value="* * *">* * * (Asteriscos clásicos)</option>
                        <option value="✦ ✦ ✦">✦ ✦ ✦ (Estrellas editoriales)</option>
                        <option value="• • •">• • • (Puntos limpios)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: TIPOGRAFÍA & LETRA CAPITULAR */}
            {activeTab === "typography" && (
              <div className="space-y-4">
                {/* Banner de Sincronización con el Editor */}
                <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Fuente en Editor de Texto
                      </div>
                      <div className="text-xs font-bold text-[var(--text-main)] mt-0.5">
                        {editorFontInfo.name}
                      </div>
                    </div>
                    {currentTemplate.fontFamily !== "editor" ? (
                      <button
                        type="button"
                        onClick={() => updateTemplateSettings({ fontFamily: "editor" })}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                      >
                        Sincronizar con Editor
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Sincronizada
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    Al sincronizar, la previsualización y el archivo exportado usarán exactamente la misma tipografía que tienes en la vista de escritura.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
                      Fuente del Manuscrito
                    </label>
                    <select
                      value={currentTemplate.fontFamily}
                      onChange={(e) =>
                        updateTemplateSettings({ fontFamily: e.target.value as any })
                      }
                      className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] font-medium"
                    >
                      <option value="editor">
                        ★ Misma fuente del Editor ({editorFontInfo.name})
                      </option>
                      <option value="garamond">EB Garamond (Literaria Clásica)</option>
                      <option value="lora">Lora (Elegante y Equilibrada)</option>
                      <option value="serif">Merriweather (Serif Robusta)</option>
                      <option value="serif-display">Playfair Display / Elegante</option>
                      <option value="cinzel">Cinzel (Display Épica / Fantasía)</option>
                      <option value="mono">JetBrains Mono (Máquina de escribir)</option>
                      <option value="sans">Plus Jakarta Sans (Moderna)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Tamaño Fuente
                      </label>
                      <select
                        value={currentTemplate.fontSize}
                        onChange={(e) =>
                          updateTemplateSettings({ fontSize: parseFloat(e.target.value) })
                        }
                        className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                      >
                        <option value="7">7 pt (Miniatura)</option>
                        <option value="7.5">7.5 pt</option>
                        <option value="8">8 pt (Bolsillo ultra compacto)</option>
                        <option value="8.5">8.5 pt</option>
                        <option value="9">9 pt (Bolsillo editorial)</option>
                        <option value="9.5">9.5 pt</option>
                        <option value="10">10 pt (Compacto)</option>
                        <option value="10.5">10.5 pt</option>
                        <option value="11">11 pt (Novela estándar)</option>
                        <option value="11.5">11.5 pt</option>
                        <option value="12">12 pt (Estándar manuscrito)</option>
                        <option value="12.5">12.5 pt</option>
                        <option value="13">13 pt (Lectura grande)</option>
                        <option value="14">14 pt (Accesibilidad)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Interlineado
                      </label>
                      <select
                        value={currentTemplate.lineSpacing}
                        onChange={(e) =>
                          updateTemplateSettings({ lineSpacing: parseFloat(e.target.value) })
                        }
                        className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                      >
                        <option value="1.15">1.15 (Compacto)</option>
                        <option value="1.45">1.45 (Bolsillo)</option>
                        <option value="1.55">1.55 (Estándar)</option>
                        <option value="1.8">1.8 (Relajado)</option>
                        <option value="2.0">2.0 (Doble Shunn)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                      Alineación
                    </label>
                    <div className="flex border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-input)]">
                      <button
                        type="button"
                        onClick={() => updateTemplateSettings({ textAlign: "left" })}
                        className={`flex-1 py-1 flex justify-center ${
                          currentTemplate.textAlign === "left"
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                            : "text-[var(--text-muted)]"
                        }`}
                        title="Alinear a la izquierda"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTemplateSettings({ textAlign: "justify" })}
                        className={`flex-1 py-1 flex justify-center ${
                          currentTemplate.textAlign === "justify"
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                            : "text-[var(--text-muted)]"
                        }`}
                        title="Justificar texto editorial"
                      >
                        <AlignJustify className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Letra Capitular (Drop Cap) */}
                <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                  <label className="text-xs font-bold text-[var(--text-main)] cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentTemplate.dropCap}
                      onChange={(e) =>
                        updateTemplateSettings({ dropCap: e.target.checked })
                      }
                      className="rounded accent-[var(--accent)] cursor-pointer"
                    />
                    <span>Letra Capitular (Drop Cap) en Inicio de Capítulo</span>
                  </label>

                  {currentTemplate.dropCap && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                          Altura de Capitular
                        </label>
                        <select
                          value={currentTemplate.dropCapLines}
                          onChange={(e) =>
                            updateTemplateSettings({
                              dropCapLines: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                        >
                          <option value="2">2 Líneas</option>
                          <option value="3">3 Líneas (Clásica)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                          Estilo
                        </label>
                        <select
                          value={currentTemplate.dropCapStyle}
                          onChange={(e) =>
                            updateTemplateSettings({
                              dropCapStyle: e.target.value as any,
                            })
                          }
                          className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                        >
                          <option value="classic-serif">Serif Clásica</option>
                          <option value="ornamental-gothic">Épica / Display</option>
                          <option value="clean-modern">Moderna Sans</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: PÁGINA, PLIEGO & ENCABEZADOS */}
            {activeTab === "layout" && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
                      Formato de Papel (Trim Size)
                    </label>
                    <select
                      value={currentTemplate.paperSize}
                      onChange={(e) => {
                        const sz = e.target.value as PaperSize;
                        updateTemplateSettings({ paperSize: sz });
                        if (sz === "A4") setViewMode("single");
                      }}
                      className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                    >
                      <option value="A5">A5 (148 × 210 mm) - Novela de Bolsillo</option>
                      <option value="Trade">Trade Novel (6 × 9 pulg / 152 × 229 mm) - Comercial</option>
                      <option value="A4">A4 (210 × 297 mm) - Manuscrito Editorial Shunn</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
                      Encabezados Corrientes (Running Headers)
                    </label>
                    <label className="text-xs text-[var(--text-muted)] cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentTemplate.runningHeaders}
                        onChange={(e) =>
                          updateTemplateSettings({ runningHeaders: e.target.checked })
                        }
                        className="rounded accent-[var(--accent)] cursor-pointer"
                      />
                      <span>Alternar en pliego (Autor en par / Título en impar)</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
                      Posición de los Números de Página
                    </label>
                    <select
                      value={currentTemplate.pageNumberPosition}
                      onChange={(e) =>
                        updateTemplateSettings({
                          pageNumberPosition: e.target.value as any,
                        })
                      }
                      className="w-full text-xs p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)]"
                    >
                      <option value="bottom-center">Pie de página centrado</option>
                      <option value="bottom-outer">Pie de página exterior (Esquinas)</option>
                      <option value="top-right">Encabezado superior derecho</option>
                      <option value="none">Sin numeración visible</option>
                    </select>
                  </div>
                </div>

                {/* Otros formatos de exportación rápida */}
                <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2 text-xs">
                  <span className="font-bold text-[var(--text-main)] block">
                    Otros Formatos de Salida
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleExportHtml}
                      className="py-1.5 px-2 rounded-lg border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>HTML Maquetado</span>
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="py-1.5 px-2 rounded-lg border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Markdown (.md)</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      exportProjectToNvlFile(project);
                      showToast("Archivo de proyecto .nvl descargado");
                    }}
                    className="w-full py-1.5 px-2 rounded-lg border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Copia de Respaldo del Proyecto (.nvl)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT AREA: INTERACTIVE BOOK SPREAD PREVIEW (Recrea las imágenes 1 a 5) */}
        <main className="flex-1 min-w-0 flex flex-col bg-neutral-200 dark:bg-neutral-950 overflow-hidden relative">
          {/* Reader Sub-Toolbar: View Switcher, Pagination, Zoom */}
          <div className="h-10 border-b border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-3 sm:px-4 flex items-center justify-between shrink-0 text-xs select-none overflow-x-auto scrollbar-none gap-2">
            {/* View Mode */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("spread")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === "spread"
                    ? "bg-white dark:bg-neutral-800 shadow-2xs font-bold text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
                title="Vista de Pliego de 2 Páginas (Libro abierto)"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Doble Página</span>
              </button>
              <button
                onClick={() => setViewMode("single")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === "single"
                    ? "bg-white dark:bg-neutral-800 shadow-2xs font-bold text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
                title="Vista de Página Individual"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Página Única</span>
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentPageIndex === 0}
                className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {viewMode === "spread"
                  ? `Páginas ${currentPageIndex * 2 + 1}–${Math.min(
                      currentPageIndex * 2 + 2,
                      totalPages
                    )} de ${totalPages}`
                  : `Página ${currentPageIndex + 1} de ${totalPages}`}
              </span>

              <button
                onClick={() =>
                  setCurrentPageIndex((prev) =>
                    viewMode === "spread"
                      ? Math.min(maxSpreadIndex, prev + 1)
                      : Math.min(totalPages - 1, prev + 1)
                  )
                }
                disabled={
                  viewMode === "spread"
                    ? currentPageIndex >= maxSpreadIndex
                    : currentPageIndex >= totalPages - 1
                }
                className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 font-bold"
                title="Alejar zoom"
              >
                -
              </button>
              <span className="font-mono text-[11px] min-w-[36px] text-center text-neutral-600 dark:text-neutral-400">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 font-bold"
                title="Acercar zoom"
              >
                +
              </button>
            </div>
          </div>

          {/* Book Canvas Container */}
          <div
            id="export-book-canvas-scroll"
            className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center custom-scroll always-scroll min-h-0"
          >
            <div
              className="transition-transform duration-200 origin-center flex justify-center"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {/* SPREAD MODE: Two Pages with Central Book Spine Shadow */}
              {viewMode === "spread" ? (
                <div className="flex shadow-2xl rounded-sm overflow-hidden bg-white border border-neutral-300 relative select-none">
                  {/* Left Page (Verso) - Hoja blanca en todos los temas */}
                  <div
                    className="w-[340px] sm:w-[390px] h-[500px] sm:h-[580px] bg-white text-neutral-900 relative border-r border-neutral-200/80"
                    style={{
                      boxShadow: "inset -18px 0 25px -10px rgba(0,0,0,0.10)",
                    }}
                  >
                    {leftPage ? leftPage.content : <div className="p-8 text-neutral-400 bg-white">Fin del libro</div>}
                  </div>

                  {/* Central Spine Shadow (Lomo del libro) */}
                  <div className="w-[1px] bg-neutral-300 relative z-10">
                    <div
                      className="absolute inset-y-0 -left-3 w-6 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.06) 100%)",
                      }}
                    />
                  </div>

                  {/* Right Page (Recto) - Hoja blanca en todos los temas */}
                  <div
                    className="w-[340px] sm:w-[390px] h-[500px] sm:h-[580px] bg-white text-neutral-900 relative"
                    style={{
                      boxShadow: "inset 18px 0 25px -10px rgba(0,0,0,0.10)",
                    }}
                  >
                    {rightPage ? rightPage.content : <div className="p-8 text-neutral-400 bg-white">Página en blanco</div>}
                  </div>
                </div>
              ) : (
                /* SINGLE PAGE MODE (Ideal para Manuscrito Estándar Shunn A4) */
                <div
                  className="w-[380px] sm:w-[480px] h-[560px] sm:h-[680px] bg-white text-neutral-900 shadow-2xl rounded-sm border border-neutral-300 relative select-none"
                  style={{
                    boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
                  }}
                >
                  {leftPage ? leftPage.content : <div className="p-8 text-neutral-400 bg-white">Página vacía</div>}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Advertencia para Descarga en DOCX */}
      {showDocxWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base font-novel-display">
                  Aviso sobre la Exportación a DOCX
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Al ser un <strong>formato editable (.docx)</strong>, el renderizado final depende del procesador de texto (Microsoft Word, LibreOffice o Google Docs) y es posible que no sea <strong>100% fiel a la maqueta visual</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              💡 <strong>Recomendación editorial:</strong> Si buscas un resultado 100% fiel a la maqueta maquetada, utiliza la opción <strong>Imprimir / PDF</strong>, la cual garantiza exactitud tipográfica, saltos de página y proporciones idénticas a la vista previa.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setShowDocxWarningModal(false)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs rounded-lg border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 font-medium transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDocxWarningModal(false);
                  handlePrintOrPdf();
                }}
                className="w-full sm:w-auto px-3.5 py-2 text-xs rounded-lg border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Usar PDF (Fiel)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDocxWarningModal(false);
                  executeDocxDownload();
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 font-semibold shadow-xs transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar DOCX de todos modos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
