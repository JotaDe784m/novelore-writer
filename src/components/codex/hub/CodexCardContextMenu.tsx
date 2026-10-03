import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Copy, Trash2 } from "lucide-react";
import { WorldEntity } from "../../../types";

export interface CodexCardContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  entity: WorldEntity;
  onClose: () => void;
  onOpenDossier: (entity: WorldEntity) => void;
  onDuplicate: (entity: WorldEntity) => void;
  onDelete: (entity: WorldEntity) => void;
}

export const CodexCardContextMenu: React.FC<CodexCardContextMenuProps> = ({
  isOpen,
  position,
  entity,
  onClose,
  onOpenDossier,
  onDuplicate,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined" || !document.body) return null;

  // Ajustar posición para no salir de los bordes de pantalla
  const menuWidth = 190;
  const menuHeight = 120;
  const safeX = Math.min(position.x, window.innerWidth - menuWidth - 10);
  const safeY = Math.min(position.y, window.innerHeight - menuHeight - 10);

  return createPortal(
    <div
      ref={menuRef}
      style={{ left: `${safeX}px`, top: `${safeY}px` }}
      className="fixed z-[100000] w-48 rounded-2xl p-1.5 shadow-2xl border text-xs select-none animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-xl overflow-hidden divide-y divide-[var(--border-color)]/50"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="p-1 space-y-0.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDossier(entity);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Abrir Ficha</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onDuplicate(entity);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer font-medium"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Duplicar Entrada</span>
          </button>
        </div>

        <div className="p-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(entity);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
