import React from "react";
import { FolderOpen, AlertTriangle } from "lucide-react";

interface ExistingProjectAlertProps {
  existingTitle: string;
  onSelectAnotherFolder: () => void;
  onDismiss: () => void;
}

export const ExistingProjectAlert: React.FC<ExistingProjectAlertProps> = ({
  existingTitle,
  onSelectAnotherFolder,
  onDismiss,
}) => {
  return (
    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-[var(--text-main)] space-y-2.5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
        <span className="font-semibold text-xs text-red-600 dark:text-red-400">
          Carpeta no disponible: Novela existente
        </span>
      </div>
      <p className="text-xs leading-relaxed">
        La carpeta seleccionada ya contiene la novela <strong>&ldquo;{existingTitle}&rdquo;</strong> de Novelore.
      </p>
      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
        Para continuar con esa obra, usa <strong>Abrir Carpeta Local</strong> en el taller. Para una nueva novela, selecciona una carpeta vacía distinta.
      </p>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onSelectAnotherFolder}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent)] text-[var(--text-main)] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Seleccionar otra carpeta</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
        >
          Descartar aviso
        </button>
      </div>
    </div>
  );
};

interface NonEmptyFolderAlertProps {
  folderName: string;
  fileCount: number;
  candidateSubfolder: string;
  isSubmitting: boolean;
  onConfirmSubfolder: () => void;
  onSelectAnotherFolder: () => void;
  onCancel: () => void;
}

export const NonEmptyFolderAlert: React.FC<NonEmptyFolderAlertProps> = ({
  folderName,
  fileCount,
  candidateSubfolder,
  isSubmitting,
  onConfirmSubfolder,
  onSelectAnotherFolder,
  onCancel,
}) => {
  return (
    <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-[var(--text-main)] space-y-2.5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="font-semibold text-xs text-amber-600 dark:text-amber-400">
          Aviso: Carpeta con elementos existentes
        </span>
      </div>
      <p className="text-xs leading-relaxed">
        La carpeta <strong>&ldquo;{folderName}&rdquo;</strong> contiene {fileCount} elemento{fileCount !== 1 ? "s" : ""}.
      </p>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        Para no mezclar tus archivos con el manuscrito, Novelore creará una subcarpeta dedicada para tu novela:
      </p>
      <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] font-mono text-[11px] text-[var(--text-main)] break-all select-all">
        {candidateSubfolder}
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onConfirmSubfolder}
          className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Crear subcarpeta dedicada</span>
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSelectAnotherFolder}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent)] text-[var(--text-main)] cursor-pointer"
        >
          Elegir otra carpeta
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
