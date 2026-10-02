import React from "react";
import { X, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { EntityCategory, WorldEntity } from "../../../types";
import { DossierTab } from "./dossierTypes";
import { DossierTabsNav } from "./DossierTabsNav";

export interface EntityModalHeaderProps {
  entity: WorldEntity | null;
  activeTab: DossierTab;
  onTabChange: (tab: DossierTab) => void;
  category: EntityCategory;
  attributesCount: number;
  mentionsCount: number;
  galleryCount: number;
  whiteboardItemsCount: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onDelete: () => void;
  onClose: () => void;
  onSave: () => void;
}

export const EntityModalHeader: React.FC<EntityModalHeaderProps> = ({
  entity,
  activeTab,
  onTabChange,
  category,
  attributesCount,
  mentionsCount,
  galleryCount,
  whiteboardItemsCount,
  isFullscreen,
  onToggleFullscreen,
  onDelete,
  onClose,
  onSave,
}) => {
  return (
    <div
      id="entity-modal-unified-header"
      className="px-3 sm:px-5 py-2.5 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)] shrink-0 select-none gap-2"
    >
      {/* Navegación por pestañas a la izquierda */}
      <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
        <DossierTabsNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          category={category}
          attributesCount={attributesCount}
          mentionsCount={mentionsCount}
          galleryCount={galleryCount}
          whiteboardItemsCount={whiteboardItemsCount}
        />
      </div>

      {/* Botones de acción unificados a la derecha */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-2">
        {entity && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`¿Eliminar definitivamente a "${entity.name}" del códice?`)) {
                onDelete();
              }
            }}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Eliminar entrada permanentemente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
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
          className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          title="Cerrar (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
