import React, { useState, useRef, useEffect } from "react";
import { Trash2, Pin } from "lucide-react";
import { NoteCardLayout } from "../../../types";

interface NoteCardFreeformProps {
  name: string;
  value: string;
  layout: NoteCardLayout;
  onChangeValue: (val: string) => void;
  onChangeLayout: (layout: Partial<NoteCardLayout>) => void;
  onRename: (newName: string) => void;
  onRemove: () => void;
  onToggleLock: () => void;
}

export const NoteCardFreeform: React.FC<NoteCardFreeformProps> = ({
  name,
  value,
  layout,
  onChangeValue,
  onChangeLayout,
  onRename,
  onRemove,
  onToggleLock,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState(name);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const latestPosRef = useRef({ x: layout.x, y: layout.y });
  const latestSizeRef = useRef({ width: layout.width || 220, height: layout.height || 100 });

  useEffect(() => {
    setEditName(name);
  }, [name]);

  useEffect(() => {
    latestPosRef.current = { x: layout.x, y: layout.y };
    latestSizeRef.current = { width: layout.width || 220, height: layout.height || 100 };
  }, [layout.x, layout.y, layout.width, layout.height]);

  const commitRename = () => {
    const clean = editName.trim();
    if (clean && clean !== name) {
      onRename(clean);
    }
    setIsRenaming(false);
  };

  // Manejador de arrastre libre de alto rendimiento (DOM directo para 0 lag)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (layout.isLocked) return;
    const target = e.target as HTMLElement;
    if (
      target.tagName === "TEXTAREA" ||
      target.tagName === "INPUT" ||
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.classList.contains("resize-handle")
    ) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = layout.x;
    const initialY = layout.y;

    const handleMouseMove = (moveEvt: MouseEvent) => {
      const dx = moveEvt.clientX - startX;
      const dy = moveEvt.clientY - startY;
      const nextX = Math.max(12, initialX + dx);
      const nextY = Math.max(12, initialY + dy);
      latestPosRef.current = { x: nextX, y: nextY };
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      onChangeLayout(latestPosRef.current);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Manejador de redimensionado de alto rendimiento (DOM directo para 0 lag)
  const handleResizeStart = (e: React.MouseEvent) => {
    if (layout.isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialW = layout.width || 220;
    const initialH = layout.height || 100;

    const handleMouseMove = (moveEvt: MouseEvent) => {
      const dw = moveEvt.clientX - startX;
      const dh = moveEvt.clientY - startY;
      const nextW = Math.max(180, initialW + dw);
      const nextH = Math.max(80, initialH + dh);
      latestSizeRef.current = { width: nextW, height: nextH };
      if (cardRef.current) {
        cardRef.current.style.width = `${nextW}px`;
        cardRef.current.style.height = `${nextH}px`;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      onChangeLayout(latestSizeRef.current);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${layout.x}px, ${layout.y}px, 0)`,
        width: `${layout.width}px`,
        height: `${layout.height}px`,
      }}
      className={`absolute top-0 left-0 group rounded-2xl p-4 sm:p-5 flex flex-col select-none border ${
        layout.isLocked
          ? "cursor-default"
          : isDragging
          ? "cursor-grabbing shadow-2xl scale-[1.01] z-30 ring-2 ring-[var(--accent)]"
          : "cursor-grab shadow-xs hover:shadow-md hover:border-[var(--border-color)]"
      } bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] focus-within:border-[var(--accent)]`}
    >
      {/* Cabecera de la Nota: Título Mayor en Negritas y Acciones */}
      <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex items-center min-w-0 flex-1">
          {isRenaming ? (
            <input
              type="text"
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitRename();
                } else if (e.key === "Escape") {
                  setIsRenaming(false);
                  setEditName(name);
                }
              }}
              className="w-full px-2 py-0.5 rounded-lg bg-[var(--bg-input)] border border-[var(--accent)] font-bold font-novel-display text-sm sm:text-base text-[var(--text-main)] outline-hidden"
            />
          ) : (
            <span
              onDoubleClick={() => {
                if (!layout.isLocked) {
                  setIsRenaming(true);
                  setEditName(name);
                }
              }}
              title="Doble clic para editar el título"
              className="font-bold font-novel-display text-sm sm:text-base text-[var(--text-main)] hover:text-[var(--accent)] truncate cursor-text transition-colors tracking-tight select-none"
            >
              {name}
            </span>
          )}
        </div>

        {/* Acciones flotantes: Fijar y Eliminar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-lg text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
            title="Eliminar esta nota"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleLock}
            className={`p-1 rounded-lg transition-all cursor-pointer ${
              layout.isLocked
                ? "text-[var(--accent)] opacity-100 bg-[var(--accent-subtle)]"
                : "text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
            }`}
            title={layout.isLocked ? "Desbloquear posición" : "Fijar posición para evitar arrastre"}
          >
            <Pin className={`w-3.5 h-3.5 ${layout.isLocked ? "rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Área de texto de la nota literaria */}
      <textarea
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder={`Escribe aquí los detalles de ${name.toLowerCase()}...`}
        className="flex-1 w-full bg-transparent border-0 outline-hidden resize-none font-novel-serif text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]/50 leading-relaxed custom-scroll select-text"
      />

      {/* Manija de redimensionado táctil/cursor en esquina inferior */}
      {!layout.isLocked && (
        <div
          onMouseDown={handleResizeStart}
          className={`resize-handle absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-center justify-center rounded-br-lg text-[var(--text-muted)]/40 opacity-0 group-hover:opacity-100 hover:text-[var(--accent)] transition-opacity ${
            isResizing ? "opacity-100 text-[var(--accent)]" : ""
          }`}
          title="Arrastra para redimensionar"
        >
          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 6 6">
            <path d="M5 1v4H1" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
};
