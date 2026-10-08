import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { CustomEntityCategory } from "../../../types";

interface CategoryDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CustomEntityCategory | null;
  elementCount: number;
  onConfirmDelete: () => void;
}

export const CategoryDeleteConfirmModal: React.FC<CategoryDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  category,
  elementCount,
  onConfirmDelete,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !category || typeof document === "undefined" || !document.body) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 border text-left bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]/60">
          <div className="flex items-center gap-2.5 text-amber-500">
            <div className="p-2 rounded-xl bg-amber-500/15">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-bold text-base font-novel-display text-[var(--text-main)]">
              Eliminar Categoría
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
          {elementCount > 0 ? (
            <p>
              Atención: Se eliminarán{" "}
              <strong className="text-[var(--text-main)] font-semibold">
                todos los elementos pertenecientes a la categoría &ldquo;{category.label}&rdquo;
              </strong>{" "}
              ({elementCount} {elementCount === 1 ? "elemento registrado" : "elementos registrados"}).
              ¿Desea continuar?
            </p>
          ) : (
            <p>
              ¿Está seguro de que desea eliminar la categoría{" "}
              <strong className="text-[var(--text-main)] font-semibold">
                &ldquo;{category.label}&rdquo;
              </strong>?
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]/60">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            {elementCount > 0 ? "Eliminar categoría y elementos" : "Eliminar categoría"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
