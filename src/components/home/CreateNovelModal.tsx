import React, { useState } from "react";
import { FolderOpen, X, AlertTriangle } from "lucide-react";
import { NovelProject } from "../../types";
import { useProjectStore, InspectFolderResult } from "../../stores/useProjectStore";
import { ExistingProjectAlert, NonEmptyFolderAlert } from "./CreateNovelAlerts";
import { CreateNovelFormFields } from "./CreateNovelFormFields";

interface CreateNovelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: NovelProject) => void;
}

export const CreateNovelModal: React.FC<CreateNovelModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("Fantasía");
  const [synopsis, setSynopsis] = useState("");
  const [targetWords, setTargetWords] = useState(50000);
  const [coverUrl, setCoverUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [existingProjectWarning, setExistingProjectWarning] = useState<{
    title: string;
    folderPath: string;
  } | null>(null);
  const [nonEmptyFolderPrompt, setNonEmptyFolderPrompt] = useState<{
    folderName: string;
    folderPath: string;
    fileCount: number;
    candidateSubfolder: string;
  } | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setAuthor("");
    setGenre("Fantasía");
    setSynopsis("");
    setTargetWords(50000);
    setCoverUrl("");
    setGeneralError(null);
    setExistingProjectWarning(null);
    setNonEmptyFolderPrompt(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const buildPayload = () => ({
    title: title.trim(),
    subtitle: subtitle.trim(),
    author: author.trim() || "Autor",
    genre: genre.trim() || "Ficción",
    synopsis: synopsis.trim(),
    targetWords: targetWords || 50000,
    coverUrl,
  });

  const handleSelectFolder = async () => {
    if (!title.trim()) {
      setGeneralError("Por favor ingresa un título para la obra.");
      return;
    }

    setGeneralError(null);
    setExistingProjectWarning(null);
    setNonEmptyFolderPrompt(null);
    setIsSubmitting(true);

    try {
      const store = useProjectStore.getState();
      const inspectRes: InspectFolderResult = await store.inspectProjectFolder({ title: title.trim() });

      if (inspectRes.canceled) {
        setIsSubmitting(false);
        return;
      }

      if (inspectRes.status === "existing_project") {
        setIsSubmitting(false);
        setExistingProjectWarning({
          title: inspectRes.existingTitle || "existente",
          folderPath: inspectRes.folderPath || "",
        });
        return;
      }

      if (inspectRes.status === "non_empty_folder") {
        setIsSubmitting(false);
        setNonEmptyFolderPrompt({
          folderName: inspectRes.folderName || "seleccionada",
          folderPath: inspectRes.folderPath || "",
          fileCount: inspectRes.fileCount || 0,
          candidateSubfolder: inspectRes.candidateSubfolder || "",
        });
        return;
      }

      if (inspectRes.status === "empty" && inspectRes.folderPath) {
        const createdProject = await store.createProjectInPath(inspectRes.folderPath, buildPayload());
        if (createdProject) {
          resetForm();
          onProjectCreated(createdProject);
          onClose();
        } else {
          setIsSubmitting(false);
          setGeneralError(store.errorMessage || "No se pudo inicializar la novela.");
        }
        return;
      }

      if (inspectRes.status === "error" || inspectRes.error) {
        setIsSubmitting(false);
        setGeneralError(inspectRes.error || "Error al verificar la carpeta seleccionada.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setGeneralError(err.message || "Error inesperado al seleccionar carpeta.");
    }
  };

  const handleConfirmSubfolder = async () => {
    if (!nonEmptyFolderPrompt?.candidateSubfolder) return;
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const store = useProjectStore.getState();
      const createdProject = await store.createProjectInPath(
        nonEmptyFolderPrompt.candidateSubfolder,
        buildPayload()
      );

      if (createdProject) {
        resetForm();
        onProjectCreated(createdProject);
        onClose();
      } else {
        setIsSubmitting(false);
        setGeneralError(store.errorMessage || "No se pudo crear la subcarpeta del proyecto.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setGeneralError(err.message || "Error al crear la subcarpeta.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="font-bold text-lg text-[var(--text-main)] font-novel-display">Crear Nueva Novela</h3>
            <p className="text-xs text-[var(--text-muted)]">Se creará la estructura local en la carpeta que tú elijas.</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {generalError && (
          <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{generalError}</span>
          </div>
        )}

        {existingProjectWarning && (
          <ExistingProjectAlert
            existingTitle={existingProjectWarning.title}
            onSelectAnotherFolder={handleSelectFolder}
            onDismiss={() => setExistingProjectWarning(null)}
          />
        )}

        {nonEmptyFolderPrompt && (
          <NonEmptyFolderAlert
            folderName={nonEmptyFolderPrompt.folderName}
            fileCount={nonEmptyFolderPrompt.fileCount}
            candidateSubfolder={nonEmptyFolderPrompt.candidateSubfolder}
            isSubmitting={isSubmitting}
            onConfirmSubfolder={handleConfirmSubfolder}
            onSelectAnotherFolder={handleSelectFolder}
            onCancel={() => setNonEmptyFolderPrompt(null)}
          />
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSelectFolder(); }} className="space-y-4">
          <CreateNovelFormFields
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            author={author}
            setAuthor={setAuthor}
            genre={genre}
            setGenre={setGenre}
            targetWords={targetWords}
            setTargetWords={setTargetWords}
            synopsis={synopsis}
            setSynopsis={setSynopsis}
            coverUrl={coverUrl}
            setCoverUrl={setCoverUrl}
            onClearError={() => setGeneralError(null)}
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 shadow-xs transition-opacity cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <FolderOpen className="w-4 h-4 text-[var(--accent-contrast)]" />
              <span>{isSubmitting ? "Comprobando..." : "Elegir Carpeta y Crear"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
