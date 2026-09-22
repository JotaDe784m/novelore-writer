import React, { useState, useEffect } from "react";
import {
  History,
  X,
  RotateCcw,
  Clock,
  FileText,
  Download,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { NovelProject, ProjectVersion } from "../../types";
import {
  getProjectVersions,
  saveProjectVersion,
  restoreProjectVersion,
  deleteProjectVersion,
  exportProjectToNovelistFile,
  calculateTotalWords,
} from "../../utils/storage";

interface VersionsModalProps {
  project: NovelProject;
  isOpen: boolean;
  onClose: () => void;
  onProjectRestored: (restoredProject: NovelProject) => void;
}

export const VersionsModal: React.FC<VersionsModalProps> = ({
  project,
  isOpen,
  onClose,
  onProjectRestored,
}) => {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "info" } | null>(null);
  const [selectedForPreview, setSelectedForPreview] = useState<ProjectVersion | null>(null);

  const refreshVersions = async () => {
    if (project?.id) {
      const list = await getProjectVersions(project.id);
      setVersions(list);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshVersions();
    }
  }, [isOpen, project.id]);

  if (!isOpen) return null;

  const currentTotalWords = calculateTotalWords(project);

  const showNotification = (text: string, type: "success" | "info" = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCreateSnapshotNow = async () => {
    const updated = await saveProjectVersion(
      project,
      `Punto manual (${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })})`,
      true
    );
    setVersions(updated);
    showNotification("¡Punto de restauración creado y guardado en almacenamiento local!");
  };

  const handleRestore = async (ver: ProjectVersion) => {
    const timeFormatted = new Date(ver.timestamp).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const confirmed = window.confirm(
      `¿Deseas restaurar la versión "${ver.label}" del ${timeFormatted}?\n\nTu proyecto regresará al estado de esa sesión (${ver.wordCount.toLocaleString()} palabras).`
    );

    if (confirmed) {
      // Create a safety snapshot of current before restoring
      await saveProjectVersion(
        project,
        `Antes de restaurar (${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })})`,
        true
      );

      const restored = await restoreProjectVersion(ver.id, project.id);
      if (restored) {
        onProjectRestored(restored);
        await refreshVersions();
        showNotification("¡Versión restaurada con éxito!");
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }
  };

  const handleDelete = async (verId: string) => {
    if (window.confirm("¿Eliminar esta versión del historial?")) {
      const updated = await deleteProjectVersion(verId, project.id);
      setVersions(updated);
      showNotification("Versión eliminada del historial", "info");
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const getRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Justo ahora";
      if (diffMin === 1) return "Hace 1 minuto";
      if (diffMin < 60) return `Hace ${diffMin} minutos`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours === 1) return "Hace 1 hora";
      if (diffHours < 24) return `Hace ${diffHours} horas`;
      return "Hace más de un día";
    } catch {
      return "";
    }
  };

  return (
    <div
      id="versions-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="versions-modal-card"
        className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
          color: "var(--text-main)",
        }}
      >
        {/* Header */}
        <div
          className="p-5 border-b flex items-start justify-between shrink-0"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs">
              <History className="w-5 h-5 text-[var(--accent-contrast)]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-novel-display text-[var(--text-main)]">
                Autoguardado de Versiones
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Historial de las últimas 3 versiones en almacenamiento local para <em>{project.title}</em>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status notification */}
        {feedback && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 border-b ${
              feedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Subheader bar with Manual Snapshot button */}
        <div
          className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: "var(--bg-input)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              Sesión actual: <strong className="text-[var(--text-main)] font-mono">{currentTotalWords.toLocaleString()}</strong> palabras
            </span>
            <span className="opacity-40">•</span>
            <span>Máximo: 3 versiones automáticas</span>
          </div>

          <button
            onClick={handleCreateSnapshotNow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-xs hover:opacity-90 shadow-xs transition-opacity"
            title="Crear un punto de restauración manual inmediatamente"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-contrast)]" />
            <span>Crear Versión Ahora</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {versions.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed text-center space-y-3 border-[var(--border-color)]">
              <Clock className="w-10 h-10 mx-auto text-[var(--text-muted)] opacity-50" />
              <div>
                <p className="text-sm font-semibold text-[var(--text-main)]">
                  Aún no hay versiones guardadas en este navegador
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                  El sistema autoguarda versiones mientras escribes. También puedes pulsar el botón a continuación para crear tu primera copia de seguridad.
                </p>
              </div>
              <button
                onClick={handleCreateSnapshotNow}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-xs shadow-xs hover:opacity-90"
              >
                Crear Primera Versión
              </button>
            </div>
          ) : (
            versions.map((ver, idx) => {
              const wordsDiff = ver.wordCount - currentTotalWords;
              const isLatest = idx === 0;

              return (
                <div
                  key={ver.id}
                  className="p-4 rounded-xl border transition-all hover:border-[var(--accent)]/50 space-y-3"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] font-mono text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-xs text-[var(--text-main)]">
                        {ver.label}
                      </span>
                      {isLatest && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Más Reciente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimestamp(ver.timestamp)}</span>
                      <span className="opacity-60 font-mono">({getRelativeTime(ver.timestamp)})</span>
                    </div>
                  </div>

                  {/* Metrics & Content Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-1">
                    <div className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                      <div className="text-[10px] text-[var(--text-muted)]">Palabras</div>
                      <div className="font-mono font-bold text-[var(--text-main)] flex items-center gap-1">
                        <span>{ver.wordCount.toLocaleString()}</span>
                        {wordsDiff !== 0 && (
                          <span
                            className={`text-[10px] font-normal ${
                              wordsDiff > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            ({wordsDiff > 0 ? `+${wordsDiff}` : wordsDiff})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                      <div className="text-[10px] text-[var(--text-muted)]">Estructura</div>
                      <div className="font-medium text-[var(--text-main)]">
                        {ver.actCount || 1} actos • {ver.chapterCount || 1} cap.
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                      <div className="text-[10px] text-[var(--text-muted)]">Escenas</div>
                      <div className="font-medium text-[var(--text-main)]">
                        {ver.sceneCount || 1} escenas
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                      <div className="text-[10px] text-[var(--text-muted)]">Personajes</div>
                      <div className="font-medium text-[var(--text-main)]">
                        {(ver.projectSnapshot.entities || []).length} fichas
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border-color)]/60">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportProjectToNovelistFile(ver.projectSnapshot)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-color)] text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        title="Descargar este punto exacto en archivo .nvl"
                      >
                        <Download className="w-3 h-3 text-[var(--accent)]" />
                        <span>Descargar copia (.nvl)</span>
                      </button>

                      <button
                        onClick={() => handleDelete(ver.id)}
                        className="p-1 rounded-md text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Eliminar esta versión del historial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRestore(ver)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] font-bold text-xs hover:opacity-90 shadow-xs transition-opacity"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-contrast)]" />
                      <span>Restaurar Esta Versión</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t flex items-center justify-between text-xs"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Restaurar reemplazará la sesión activa, creando un punto previo de seguridad.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
