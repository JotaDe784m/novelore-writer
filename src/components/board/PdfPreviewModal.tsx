import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  X,
  Download,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Configure worker for PDF.js in Vite
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
} catch {
  // Fallback to CDN worker if local bundle fails
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileData: string;
  fileName: string;
}

// Helper to convert Data URL or base64 to Uint8Array safely
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert Data URL to Blob
function dataUrlToBlob(dataUrl: string, mimeType = "application/pdf"): Blob {
  const bytes = dataUrlToUint8Array(dataUrl);
  return new Blob([bytes], { type: mimeType });
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  fileData,
  fileName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if file is text or markdown instead of PDF
  const isPdf =
    fileName.toLowerCase().endsWith(".pdf") ||
    fileData.startsWith("data:application/pdf") ||
    fileData.startsWith("data:application/x-pdf");

  const [textContent, setTextContent] = useState<string | null>(null);

  // If text or markdown file, decode content
  useEffect(() => {
    if (!isOpen) return;

    if (!isPdf) {
      try {
        const raw = fileData.includes(",") ? fileData.split(",")[1] : fileData;
        const decoded = decodeURIComponent(escape(window.atob(raw)));
        setTextContent(decoded);
        setIsLoading(false);
      } catch {
        setTextContent("No se pudo previsualizar el contenido en texto.");
        setIsLoading(false);
      }
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setPdfDoc(null);
    setCurrentPage(1);

    const loadPdf = async () => {
      try {
        const bytes = dataUrlToUint8Array(fileData);
        const loadingTask = pdfjsLib.getDocument({
          data: bytes,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Error loading PDF via PDF.js:", err);
        setError("No se pudo cargar el documento PDF. Puedes descargarlo directamente o abrirlo en una pestaña.");
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [isOpen, fileData, isPdf]);

  // Render current page onto canvas
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !isOpen) return;

    // Cancel any ongoing rendering
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {}
    }

    try {
      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const viewport = page.getViewport({ scale, rotation });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("Error rendering PDF page:", err);
      }
    }
  }, [pdfDoc, currentPage, scale, rotation, isOpen]);

  useEffect(() => {
    if (pdfDoc && isPdf) {
      renderPage();
    }
  }, [pdfDoc, currentPage, scale, rotation, isPdf, renderPage]);

  if (!isOpen) return null;

  // Download file safely as a Blob
  const handleDownload = () => {
    try {
      const mimeType = isPdf ? "application/pdf" : "application/octet-stream";
      const blob = dataUrlToBlob(fileData, mimeType);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (e) {
      console.error("Download failed:", e);
    }
  };

  // Open in new tab safely using Blob URL (Chromium does not block blob: URLs)
  const handleOpenNewTab = () => {
    try {
      const mimeType = isPdf ? "application/pdf" : "text/plain";
      const blob = dataUrlToBlob(fileData, mimeType);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (e) {
      console.error("Open in new tab failed:", e);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(3.0, parseFloat((prev + 0.2).toFixed(1))));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.6, parseFloat((prev - 0.2).toFixed(1))));
  };

  const handleResetZoom = () => {
    setScale(1.2);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[90vh] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0 gap-3 flex-wrap">
          {/* Left: Document Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-[var(--text-main)] truncate max-w-[260px] sm:max-w-md">
                {fileName}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Visor integrado universal
                </span>
                {isPdf && totalPages > 0 && (
                  <>
                    <span>•</span>
                    <span>{totalPages} {totalPages === 1 ? "página" : "páginas"}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center: Controls (for PDF) */}
          {isPdf && !error && !isLoading && (
            <div className="flex items-center gap-1.5 bg-[var(--bg-input)] px-2 py-1 rounded-2xl border border-[var(--border-color)] shadow-2xs">
              {/* Prev Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none text-[var(--text-main)] transition-colors cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Counter */}
              <div className="flex items-center gap-1 px-1.5 text-xs font-semibold text-[var(--text-main)]">
                <span>{currentPage}</span>
                <span className="text-[var(--text-muted)] font-normal">/</span>
                <span className="text-[var(--text-muted)]">{totalPages}</span>
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none text-[var(--text-main)] transition-colors cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-[var(--border-color)] mx-1" />

              {/* Zoom Out */}
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 0.6}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[var(--text-main)] transition-colors cursor-pointer"
                title="Alejar (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-medium text-[var(--text-muted)] w-10 text-center select-none">
                {Math.round(scale * 100)}%
              </span>

              {/* Zoom In */}
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[var(--text-main)] transition-colors cursor-pointer"
                title="Acercar (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Reset Zoom */}
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                title="Restablecer tamaño normal"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Rotate */}
              <button
                type="button"
                onClick={handleRotate}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                title="Girar 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[var(--text-main)] transition-colors cursor-pointer"
              title="Abrir en pestaña nueva con visor nativo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nueva pestaña</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              title="Descargar documento en el equipo"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer ml-1"
              title="Cerrar visor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewer Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 w-full h-full bg-zinc-950/95 overflow-auto flex items-center justify-center p-4 sm:p-8 relative"
        >
          {isLoading && (
            <div className="flex flex-col items-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
              <span className="text-xs font-medium">Cargando documento en el visor...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 text-center max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-xl">
              <AlertCircle className="w-10 h-10 text-amber-500" />
              <h4 className="font-bold text-sm text-white">No se pudo desplegar en el lienzo</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-bold text-xs shadow-md cursor-pointer"
                >
                  Descargar archivo
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-white cursor-pointer"
                >
                  Abrir en pestaña nueva
                </button>
              </div>
            </div>
          )}

          {/* Text/Markdown preview fallback */}
          {!isPdf && textContent && !isLoading && (
            <div className="w-full max-w-3xl max-h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 overflow-auto text-sm text-[var(--text-main)] shadow-xl font-mono whitespace-pre-wrap leading-relaxed">
              {textContent}
            </div>
          )}

          {/* PDF Canvas Rendering */}
          {isPdf && !error && (
            <div
              className={`flex items-center justify-center transition-all ${
                isLoading ? "hidden" : "block"
              }`}
            >
              <canvas
                ref={canvasRef}
                className="shadow-2xl rounded-lg bg-white border border-zinc-800 max-w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
