import React, { useRef, useEffect } from "react";
import { Trash2, FileText } from "lucide-react";
import { SceneNoteCard } from "../../../types";

interface InspectorNoteCardItemProps {
  card: SceneNoteCard;
  placeholder?: string;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateContent: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
}

export const InspectorNoteCardItem: React.FC<InspectorNoteCardItemProps> = ({
  card,
  placeholder = "Escribe tus notas, detalles o ideas...",
  onUpdateTitle,
  onUpdateContent,
  onDelete,
  icon: IconComponent = FileText,
  iconColorClass = "text-[var(--accent)]",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-ajuste de altura del textarea para no forzar scroll interno innecesario
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(60, textareaRef.current.scrollHeight)}px`;
    }
  }, [card.content]);

  return (
    <div className="group relative rounded-xl p-2.5 space-y-2 transition-all bg-[var(--bg-surface-hover)]/40 hover:bg-[var(--bg-surface-hover)]/70">
      {/* Cabecera de la Tarjeta */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-[var(--bg-surface-hover)] shrink-0">
            <IconComponent className={`w-3.5 h-3.5 ${iconColorClass}`} />
          </div>

          {/* Título editable tipo ghost */}
          <input
            type="text"
            value={card.title}
            onChange={(e) => onUpdateTitle(card.id, e.target.value)}
            placeholder="Título de la nota..."
            className="flex-1 bg-transparent hover:bg-[var(--bg-surface-hover)] focus:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] px-1.5 py-0.5 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-colors truncate"
            title="Haz clic para editar el título de esta tarjeta"
          />
        </div>

        {/* Acciones de la Tarjeta */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
            title="Eliminar esta nota"
            aria-label="Eliminar nota"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Contenido de la Nota */}
      <textarea
        ref={textareaRef}
        value={card.content}
        onChange={(e) => onUpdateContent(card.id, e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full p-2.5 rounded-lg text-xs leading-relaxed bg-[var(--bg-surface-hover)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none transition-all"
      />
    </div>
  );
};
