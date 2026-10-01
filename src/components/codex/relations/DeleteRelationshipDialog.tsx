import React from "react";
import { Trash2 } from "lucide-react";

export interface DeleteRelationshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteRelationshipDialog: React.FC<DeleteRelationshipDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
          <Trash2 className="w-4 h-4" />
          <span>Eliminar Vínculo de Relación</span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          ¿Estás seguro de que deseas eliminar este vínculo del mapa de relaciones del Códice?
          Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
