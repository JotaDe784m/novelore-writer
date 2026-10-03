import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FolderOpen, X, AlertTriangle, BookMarked } from "lucide-react";
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
  const [enableWordGoals, setEnableWordGoals] = useState(true);
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
    setEnableWordGoals(true);
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
    enableWordGoals,
    coverUrl,
  });

  const handleSelectFolder = async () => {
    if (!title.trim()) {
      setGeneralError("Por favor ingresa un título para la novela.");
      return;
    }
    setGeneralError(null);
    setExistingProjectWarning(null);
    setNonEmptyFolderPrompt(null);

    const store = useProjectStore.getState();
    const inspection: InspectFolderResult = await store.inspectProjectFolder({
      title: title.trim(),
    });

    if (inspection.canceled || !inspection.folderPath) return;

    if (inspection.status === "existing_project") {
      setExistingProjectWarning({
        title: inspection.existingTitle || "Novela existente",
        folderPath: inspection.folderPath,
      });
      return;
    }

    if (inspection.status === "non_empty_folder") {
      setNonEmptyFolderPrompt({
        folderName: inspection.folderName || "Carpeta",
        folderPath: inspection.folderPath,
        fileCount: inspection.fileCount || 0,
        candidateSubfolder: inspection.candidateSubfolder || title.trim(),
      });
      return;
    }

    if (inspection.status === "empty") {
      setIsSubmitting(true);
      try {
        const created = await store.createProjectInPath(inspection.folderPath, buildPayload());
        if (created) {
          resetForm();
          onProjectCreated(created);
        } else {
          setGeneralError(store.errorMessage || "No se pudo inicializar la novela.");
        }
      } catch (err: any) {
        setGeneralError(err.message || "Error al crear la novela.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleConfirmSubfolder = async () => {
    if (!nonEmptyFolderPrompt) return;
    setIsSubmitting(true);
    try {
      const store = useProjectStore.getState();
      const created = await store.createProjectInPath(nonEmptyFolderPrompt.candidateSubfolder, buildPayload());
      if (created) {
        resetForm();
        onProjectCreated(created);
      } else {
        setGeneralError(store.errorMessage || "No se pudo crear la subcarpeta del proyecto.");
      }
    } catch (err: any) {
      setGeneralError(err.message || "Error al crear la subcarpeta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-bold text-lg text-[var(--text-main)] font-novel-display">
              Crear Nueva Novela
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {generalError && (
          <div className="p-3.5 rounded-2xl border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
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

        <form onSubmit={(e) => { e.preventDefault(); handleSelectFolder(); }} className="space-y-6">
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
            enableWordGoals={enableWordGoals}
            setEnableWordGoals={setEnableWordGoals}
            synopsis={synopsis}
            setSynopsis={setSynopsis}
            coverUrl={coverUrl}
            setCoverUrl={setCoverUrl}
            onClearError={() => setGeneralError(null)}
          />

          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-full text-xs font-serif text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold font-serif shadow-md transition-all cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-contrast)",
              }}
            >
              <FolderOpen className="w-4 h-4" />
              <span>{isSubmitting ? "Comprobando..." : "Elegir Carpeta y Crear"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
