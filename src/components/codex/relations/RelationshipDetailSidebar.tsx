import React from "react";
import { X, LayoutDashboard, BookOpen, Edit2, Trash2, Plus, Sparkles } from "lucide-react";
import { Relationship, WorldEntity } from "../../../types";
import { resolveAssetUrl } from "../../../utils/imageUtils";
import { getRelationshipColor, getRelationshipLineStyle } from "./relationTypes";
import { useCodexStore } from "../../../stores/useCodexStore";
import { getCategoryLabel } from "../../../utils/codexDefaults";

export interface RelationshipDetailSidebarProps {
  entity: WorldEntity | null;
  relationships: Relationship[];
  allEntities: WorldEntity[];
  onClose: () => void;
  onEditRelationship: (rel: Relationship) => void;
  onDeleteRelationship: (relId: string) => void;
  onAddNewRelationshipWith: (entityId: string) => void;
  onOpenEntityBoard?: (entityId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
}

export const RelationshipDetailSidebar: React.FC<RelationshipDetailSidebarProps> = ({
  entity,
  relationships,
  allEntities,
  onClose,
  onEditRelationship,
  onDeleteRelationship,
  onAddNewRelationshipWith,
  onOpenEntityBoard,
  onOpenEntityDossier,
}) => {
  if (!entity) return null;

  const store = useCodexStore();
  const customCategories = store.customRelationshipCategories || [];
  const customEntityCategories = store.customEntityCategories || [];
  const connectedRelationships = relationships.filter(
    (r) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id
  );

  return (
    <aside className="w-80 sm:w-96 h-full bg-[var(--bg-surface)] p-4 sm:p-5 flex flex-col justify-between shrink-0 z-20 shadow-2xl overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200 text-xs">
      <div className="space-y-4">
        {/* Cabecera de la Entidad */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            {entity.avatarUrl ? (
              <img
                src={resolveAssetUrl(entity.avatarUrl)}
                alt={entity.name}
                className="w-11 h-11 rounded-2xl object-cover shrink-0 shadow-xs"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: entity.color || "#64748B" }}
              >
                {entity.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-bold text-sm text-[var(--text-primary)] truncate">
                {entity.name}
              </h3>
              <span className="text-[11px] text-[var(--text-muted)] capitalize truncate block">
                {getCategoryLabel(entity.category, customEntityCategories)} {entity.subtitle ? `• ${entity.subtitle}` : ""}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Cerrar panel lateral"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumen */}
        {entity.summary && (
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic bg-[var(--bg-card)]/50 p-3 rounded-2xl">
            «{entity.summary}»
          </p>
        )}

        {/* Acciones Rápidas (Pizarra y Dossier) */}
        <div className="flex gap-2">
          {onOpenEntityBoard && (
            <button
              type="button"
              onClick={() => onOpenEntityBoard(entity.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Pizarra</span>
            </button>
          )}

          {onOpenEntityDossier && (
            <button
              type="button"
              onClick={() => onOpenEntityDossier(entity.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-semibold transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Dossier</span>
            </button>
          )}
        </div>

        {/* Vínculos Conectados */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              Conexiones ({connectedRelationships.length})
            </span>
            <button
              type="button"
              onClick={() => onAddNewRelationshipWith(entity.id)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir Vínculo</span>
            </button>
          </div>

          {connectedRelationships.length === 0 ? (
            <div className="p-4 text-center rounded-2xl bg-[var(--bg-input)]/25 text-[var(--text-muted)] text-[11px]">
              No hay vínculos registrados con este elemento.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {connectedRelationships.map((rel) => {
                const otherId = rel.sourceEntityId === entity.id ? rel.targetEntityId : rel.sourceEntityId;
                const other = allEntities.find((e) => e.id === otherId);
                const color = rel.color || getRelationshipColor(rel.type, customCategories, rel.sentiment);
                const lineStyle = rel.lineStyle || getRelationshipLineStyle(rel.type, customCategories);

                return (
                  <div
                    key={rel.id}
                    className="p-3 rounded-2xl bg-[var(--bg-card)] space-y-1.5 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                          {rel.label || rel.type}
                        </span>
                        {lineStyle !== "solid" && (
                          <span
                            title={`Estilo de línea: ${lineStyle === "dashed" ? "Discontinua" : "Punteada"}`}
                            className="text-[9px] px-1 py-0.2 rounded bg-[var(--bg-input)] text-[var(--text-muted)] font-mono shrink-0"
                          >
                            {lineStyle === "dashed" ? "╌╌" : "┈┈"}
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--text-muted)] truncate">
                          → {other?.name || "Desconocido"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditRelationship(rel)}
                          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          title="Editar vínculo"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRelationship(rel.id)}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Eliminar vínculo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {rel.description && (
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed pl-4 whitespace-pre-wrap">
                        {rel.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 pt-2 border-t border-black/5 dark:border-white/5">
        <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
        <span>Arrastra las insignias para modelar curvas fluidas.</span>
      </div>
    </aside>
  );
};
