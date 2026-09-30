import React from "react";
import { X, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { EntityCategory, WorldEntity } from "../../../types";
import { getCategoryLabel } from "../../../utils/codexDefaults";

interface EntityModalHeaderProps {
  entity: WorldEntity | null;
  name: string;
  category: EntityCategory;
  color: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onDelete: () => void;
  onClose: () => void;
  onSave: () => void;
}

export const EntityModalHeader: React.FC<EntityModalHeaderProps> = ({
  entity,
  name,
  category,
  color,
  isFullscreen,
  onToggleFullscreen,
  onDelete,
  onClose,
  onSave,
}) => {
  return (
    <div
      id="entity-modal-header"
      className="p-3.5 sm:px-6 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)] shrink-0 select-none"
    >
      {/* Title & Identification badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0 ring-2 ring-white/10"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)] truncate font-novel-display">
              {entity ? (name ? name : "Dossier de Entrada") : "Nueva Ficha de Códice"}
            </h3>
            <span
              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: `${color}18`,
                color: color,
              }}
            >
              {getCategoryLabel(category)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {entity && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`¿Eliminar definitivamente a "${entity.name}" del códice?`)) {
                onDelete();
              }
            }}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Eliminar entrada permanentemente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          title={isFullscreen ? "Restaurar tamaño (Ventana)" : "Maximizar a pantalla completa"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onSave}
          className="ml-1 sm:ml-2 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 transition-opacity shadow-xs cursor-pointer"
        >
          {entity ? "Guardar" : "Crear Ficha"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          title="Cerrar (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
