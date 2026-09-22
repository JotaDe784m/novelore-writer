import React from "react";
import { AlertTriangle, GitMerge, Download, Upload, X, ShieldAlert, Clock, FileText } from "lucide-react";
import { ConflictInfo, NovelProject } from "../types";

interface ConflictResolutionModalProps {
  isOpen: boolean;
  conflict: ConflictInfo | null;
  onResolveMerge: () => void;
  onResolveRemote: () => void;
  onResolveForceOverwrite: () => void;
  onClose: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  conflict,
  onResolveMerge,
  onResolveRemote,
  onResolveForceOverwrite,
  onClose,
}) => {
  if (!isOpen || !conflict) return null;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div
      id="conflict-resolution-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="conflict-resolution-modal"
        className="w-full max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-amber-500/10">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-base">Verificación de Versiones en la Nube</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 text-sm">
          <p className="text-[var(--text-muted)] leading-relaxed">
            Se ha detectado una versión más reciente de tu novela guardada desde otro dispositivo o sesión. Para evitar pérdida involuntaria de datos, selecciona cómo deseas proceder:
          </p>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Remote Card */}
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                <Download className="w-3.5 h-3.5" />
                <span>VERSIÓN EN LA NUBE (Remota)</span>
              </div>
              <p className="font-semibold text-sm truncate">{conflict.remoteTitle}</p>
              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(conflict.remoteUpdatedAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{conflict.remoteWordCount.toLocaleString()} palabras</span>
                </div>
              </div>
            </div>

            {/* Local Card */}
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Upload className="w-3.5 h-3.5" />
                <span>TU VERSIÓN ACTUAL (Local)</span>
              </div>
              <p className="font-semibold text-sm truncate">{conflict.localTitle}</p>
              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(conflict.localUpdatedAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{conflict.localWordCount.toLocaleString()} palabras</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-2.5 pt-2">
            {/* Option 1: Merge (Recommended) */}
            <button
              type="button"
              onClick={onResolveMerge}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/15 text-left transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] mt-0.5">
                  <GitMerge className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--text-main)]">Fusionar Cambios</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--accent-contrast)]">Recomendado</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Combina los capítulos, escenas y fichas de ambas versiones para no perder ningún párrafo.
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Load Remote */}
            <button
              type="button"
              onClick={onResolveRemote}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] hover:border-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-black/5 dark:bg-white/10 text-[var(--text-main)] mt-0.5">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-[var(--text-main)]">Cargar Versión de la Nube</span>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Reemplaza la copia local con los datos más recientes guardados en la nube.
                  </p>
                </div>
              </div>
            </button>

            {/* Option 3: Force Overwrite */}
            <button
              type="button"
              onClick={onResolveForceOverwrite}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5 text-left transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 mt-0.5">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-red-600 dark:text-red-400">Forzar Sobreescritura</span>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Sube tu versión local actual a la nube, reemplazando la copia remota anterior.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-color)] bg-black/5 dark:bg-white/5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            Decidir más tarde
          </button>
        </div>
      </div>
    </div>
  );
};
