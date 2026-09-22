import React, { useState } from "react";
import {
  Download,
  FileText,
  Code,
  Globe,
  Database,
  CheckCircle2,
  X,
  Settings2,
  BookOpen,
  Sparkles,
  Layers,
} from "lucide-react";
import { NovelProject } from "../../types";
import {
  exportToDocx,
  exportToMarkdown,
  exportToHtml,
  downloadTextFile,
} from "../../utils/docxExport";
import { exportProjectToJson, exportProjectToNvlFile } from "../../utils/storage";

interface ExportModalProps {
  project: NovelProject;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [format, setFormat] = useState<"nvl" | "docx" | "markdown" | "html" | "json">(
    "nvl"
  );
  const [includeChapterTitles, setIncludeChapterTitles] = useState(true);
  const [includeActTitles, setIncludeActTitles] = useState(true);
  const [includeSceneBreaks, setIncludeSceneBreaks] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const totalWords = project.acts.reduce(
    (acc, a) =>
      acc +
      a.chapters.reduce(
        (cAcc, c) =>
          cAcc + c.scenes.reduce((sAcc, s) => sAcc + (s.wordCount || 0), 0),
        0
      ),
    0
  );

  const handleExport = async () => {
    setIsExporting(true);
    setSuccessMsg(null);

    try {
      if (format === "nvl") {
        exportProjectToNvlFile(project);
        setSuccessMsg("¡Archivo de proyecto (.nvl) generado y descargado con éxito!");
      } else if (format === "docx") {
        await exportToDocx(project, {
          includeChapterTitles,
          includeActTitles,
          includeSceneBreaks,
        });
        setSuccessMsg("¡Documento DOCX generado y descargado con éxito!");
      } else if (format === "markdown") {
        const md = exportToMarkdown(project, {
          includeChapterTitles,
          includeActTitles,
          includeSceneBreaks,
        });
        downloadTextFile(
          md,
          `${project.title.toLowerCase().replace(/\s+/g, "_")}.md`,
          "text/markdown"
        );
        setSuccessMsg("¡Archivo Markdown descargado con éxito!");
      } else if (format === "html") {
        const html = exportToHtml(project, {
          includeChapterTitles,
          includeActTitles,
          includeSceneBreaks,
        });
        downloadTextFile(
          html,
          `${project.title.toLowerCase().replace(/\s+/g, "_")}.html`,
          "text/html"
        );
        setSuccessMsg("¡Manuscrito HTML interactivo descargado!");
      } else if (format === "json") {
        exportProjectToJson(project);
        setSuccessMsg("¡Copia de seguridad completa (.json) descargada!");
      }
    } catch (err: any) {
      alert(`Error durante la exportación: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl border p-6 space-y-5"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
          color: "var(--text-main)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <h3 className="font-bold text-base font-novel-display">
                Exportar Manuscrito
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Compila tu novela en formatos profesionales listos para lectura, maquetación o concurso.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project quick overview */}
        <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between text-xs font-medium">
          <div>
            <span className="font-bold text-[var(--text-main)]">{project.title}</span>
            <div className="text-[11px] text-[var(--text-muted)]">
              Por {project.author || "Autor"} • {project.genre || "Novela"}
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="font-bold text-[var(--accent)]">
              {totalWords.toLocaleString()}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">palabras</span>
          </div>
        </div>

        {/* Format Selector */}
        <div>
          <label className="font-bold block mb-2 text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Formato de Salida
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              {
                id: "nvl",
                label: "Archivo .nvl",
                sub: "Proyecto propio completo",
                icon: Layers,
                badge: "Propio",
              },
              {
                id: "docx",
                label: "DOCX (Word)",
                sub: "Editorial estándar",
                icon: FileText,
              },
              {
                id: "markdown",
                label: "Markdown",
                sub: "Obsidian / Git",
                icon: Code,
              },
              {
                id: "html",
                label: "Libro HTML",
                sub: "E-book maquetado",
                icon: Globe,
              },
              {
                id: "json",
                label: "Copia JSON",
                sub: "Backup plano",
                icon: Database,
              },
            ].map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = format === fmt.id;
              return (
                <button
                  type="button"
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id as any)}
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] shadow-xs font-bold"
                      : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {fmt.badge && (
                    <span className="absolute -top-1.5 right-1 px-1.5 py-0.2 text-[8px] uppercase tracking-wider font-bold rounded-full bg-amber-500 text-white shadow-xs">
                      {fmt.badge}
                    </span>
                  )}
                  <Icon className={`w-5 h-5 mb-1 ${isSelected ? "text-[var(--accent-contrast)]" : ""}`} />
                  <span className="text-xs">{fmt.label}</span>
                  <span
                    className={`text-[9px] mt-0.5 leading-tight ${
                      isSelected ? "text-[var(--accent-contrast)] opacity-80" : "text-[var(--text-muted)]"
                    }`}
                  >
                    {fmt.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Informative banner for .nvl */}
        {format === "nvl" && (
          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Formato de Proyecto Propio Novelore (.nvl)</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              Genera un archivo autónomo <strong>.{project.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.nvl</strong> con la totalidad de tu obra: manuscrito formateado, escaleta, fichas de la biblia de mundo (personajes, locaciones, magia), mapa de relaciones e hitos narrativos. Podrás reimportarlo o abrirlo en cualquier momento.
            </p>
          </div>
        )}

        {/* Compilation Options */}
        {format !== "json" && format !== "nvl" && (
          <div className="space-y-2 text-xs border-t pt-3 border-[var(--border-color)]">
            <div className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)] mb-1">
              Opciones de Compilación
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeActTitles}
                onChange={(e) => setIncludeActTitles(e.target.checked)}
                className="rounded accent-[var(--accent)]"
              />
              <span>Incluir encabezados de Acto (ej: ACTO I: EL DESPERTAR)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeChapterTitles}
                onChange={(e) => setIncludeChapterTitles(e.target.checked)}
                className="rounded accent-[var(--accent)]"
              />
              <span>Incluir títulos de Capítulos</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSceneBreaks}
                onChange={(e) => setIncludeSceneBreaks(e.target.checked)}
                className="rounded accent-[var(--accent)]"
              />
              <span>Insertar separador ornamental (✦ ✦ ✦) entre escenas consecutivas</span>
            </label>
          </div>
        )}

        {/* Success message banner */}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t pt-4 border-[var(--border-color)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            Cerrar
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[var(--accent-contrast)]" />
            <span>{isExporting ? "Generando..." : "Descargar Manuscrito"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
