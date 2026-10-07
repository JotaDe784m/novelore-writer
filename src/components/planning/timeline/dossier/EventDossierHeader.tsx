import React from "react";
import {
  Calendar,
  Sparkles,
  ScrollText,
  Link2,
  Image as ImageIcon,
  BookOpen,
  Layers,
  X,
  Maximize2,
  Minimize2,
  Trash2,
} from "lucide-react";

export type EventDossierTab =
  | "summary"
  | "attributes"
  | "notes"
  | "links"
  | "gallery"
  | "mentions"
  | "whiteboard";

interface EventDossierHeaderProps {
  eventId?: string;
  eventTitle: string;
  activeTab: EventDossierTab;
  onTabChange: (tab: EventDossierTab) => void;
  attributesCount: number;
  galleryCount: number;
  mentionsCount: number;
  whiteboardItemsCount: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onDelete?: () => void;
  onClose: () => void;
  onSave: () => void;
}

export const EventDossierHeader: React.FC<EventDossierHeaderProps> = ({
  eventId,
  eventTitle,
  activeTab,
  onTabChange,
  attributesCount,
  galleryCount,
  mentionsCount,
  whiteboardItemsCount,
  isFullscreen,
  onToggleFullscreen,
  onDelete,
  onClose,
  onSave,
}) => {
  const tabs = [
    { id: "summary" as const, label: "Resumen", icon: Calendar },
    { id: "attributes" as const, label: "Detalles", icon: Sparkles, count: attributesCount },
    { id: "notes" as const, label: "Lore Profundo", icon: ScrollText },
    { id: "links" as const, label: "Vínculos", icon: Link2 },
    { id: "gallery" as const, label: "Galería", icon: ImageIcon, count: galleryCount > 0 ? galleryCount : undefined },
    { id: "mentions" as const, label: "Menciones", icon: BookOpen, count: mentionsCount > 0 ? mentionsCount : undefined },
    { id: "whiteboard" as const, label: "Pizarra", icon: Layers, count: whiteboardItemsCount > 0 ? whiteboardItemsCount : undefined },
  ];

  return (
    <div
      id="event-dossier-unified-header"
      className="px-3 sm:px-5 py-2.5 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)] shrink-0 select-none gap-2"
    >
      {/* Pestañas de Navegación */}
      <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar flex items-center gap-1 sm:gap-1.5 py-0.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? "bg-black/20 text-white"
                      : "bg-[var(--border-color)]/60 text-[var(--text-muted)]"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-2">
        {eventId && onDelete && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`¿Eliminar definitivamente el acontecimiento "${eventTitle || "Evento"}"?`)) {
                onDelete();
              }
            }}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Eliminar evento permanentemente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title={isFullscreen ? "Restaurar tamaño (Ventana)" : "Maximizar a pantalla completa"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onSave}
          className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 transition-opacity shadow-xs cursor-pointer ml-1"
        >
          Guardar
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Cerrar (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
