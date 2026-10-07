import React, { useState, useMemo } from "react";
import { Plus, Trash2, Link2, Pencil, LayoutGrid, List, Users } from "lucide-react";
import { useCodexStore } from "../../../../stores/useCodexStore";
import { RelationshipCategoryEditModal } from "./RelationshipCategoryEditModal";
import { NewRelationshipSelector } from "./NewRelationshipSelector";
import { RelationshipEntitiesGroup } from "./RelationshipEntitiesGroup";
import { getRelationshipColor, RELATIONSHIP_PRESETS } from "../../../codex/relations/relationTypes";

interface EventCodexLinksSectionProps {
  eventId: string;
  onOpenEntityDossier?: (entityId: string) => void;
  onOpenEntityBoard?: (entityId: string) => void;
}

export const EventCodexLinksSection: React.FC<EventCodexLinksSectionProps> = ({
  eventId,
  onOpenEntityDossier,
  onOpenEntityBoard,
}) => {
  const codexStore = useCodexStore();
  const allEntities = codexStore.entities;
  const relationships = codexStore.relationships;
  const customCategories = codexStore.customRelationshipCategories;

  const [viewMode, setViewMode] = useState<"completo" | "compacto" | "avatar">("completo");
  const [isAddingRel, setIsAddingRel] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string; label: string; color: string } | null>(null);

  const activeRelationships = useMemo(() => {
    return relationships.filter((r) => r.sourceEntityId === eventId || r.targetEntityId === eventId);
  }, [relationships, eventId]);

  const availableCategories = useMemo(() => {
    const list = [...RELATIONSHIP_PRESETS.map((p) => ({ id: p.id, label: p.label, color: p.color, isCustom: false }))];
    customCategories.forEach((c) => {
      list.push({ id: c.id, label: c.label, color: c.color, isCustom: true });
    });
    return list;
  }, [customCategories]);

  const groupedRelationships = useMemo(() => {
    const map = new Map<string, { relId: string; otherEntityId: string; catId: string }[]>();
    activeRelationships.forEach((r) => {
      const otherId = r.sourceEntityId === eventId ? r.targetEntityId : r.sourceEntityId;
      const cat = r.label || r.type || "Relación";
      const list = map.get(cat) || [];
      list.push({ relId: r.id, otherEntityId: otherId, catId: r.type });
      map.set(cat, list);
    });
    return map;
  }, [activeRelationships, eventId]);

  const handleAddRelationship = (targetId: string, categoryId: string) => {
    const cat = availableCategories.find((c) => c.id === categoryId);
    codexStore.addRelationship(
      eventId,
      targetId,
      (categoryId as any) || "other",
      cat?.label || "Relación"
    );
    setIsAddingRel(false);
  };

  const handleSaveCategory = (label: string, color: string) => {
    if (editingCategory?.id) {
      codexStore.updateRelationshipCategory(editingCategory.id, { label, badge: label, color });
    } else {
      codexStore.addRelationshipCategory({
        label,
        badge: label,
        color,
        lineStyle: "solid",
      });
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)]/45 space-y-4">
      {/* Cabecera y Controles de Densidad */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] shrink-0">
            <Link2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold font-novel-display text-sm text-[var(--text-primary)]">
              Vínculos con Elementos del Códex
            </h4>
            <p className="text-[11px] text-[var(--text-muted)]">
              Sincronizados bidireccionalmente con el Mapa de Relaciones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[var(--bg-card)] p-0.5 rounded-xl border border-[var(--border-subtle)] text-xs">
            <button
              type="button"
              onClick={() => setViewMode("completo")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "completo"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title="Vista Completa (Tarjetas 3:4)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compacto")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "compacto"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title="Vista Compacta"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("avatar")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "avatar"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title="Vista Avatares"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingRel(!isAddingRel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold cursor-pointer shadow-2xs hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Vincular Elemento</span>
          </button>
        </div>
      </div>

      {/* Formulario Modular de Nuevo Vínculo */}
      {isAddingRel && (
        <NewRelationshipSelector
          allEntities={allEntities}
          eventId={eventId}
          availableCategories={availableCategories}
          onAdd={handleAddRelationship}
          onCancel={() => setIsAddingRel(false)}
          onOpenCreateCategory={() => setEditingCategory({ label: "", color: "#3B82F6" })}
        />
      )}

      {/* Lista Agrupada por Categoría con Edición y Color */}
      {groupedRelationships.size === 0 ? (
        <p className="text-xs text-[var(--text-muted)] italic text-center py-4">
          No hay elementos del Códex vinculados aún.
        </p>
      ) : (
        <div className="space-y-4">
          {Array.from(groupedRelationships.entries()).map(([catLabel, list]) => {
            const catObj = availableCategories.find((c) => c.label === catLabel || c.id === list[0]?.catId);
            const catColor = catObj?.color || getRelationshipColor(list[0]?.catId || "other", customCategories, undefined, catLabel);

            const entityItems = list
              .map(({ relId, otherEntityId }) => {
                const entity = allEntities.find((e) => e.id === otherEntityId);
                return entity ? { relId, entity } : null;
              })
              .filter(Boolean) as { relId: string; entity: typeof allEntities[0] }[];

            return (
              <div key={catLabel} className="space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      {catLabel}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      ({list.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ id: catObj?.id, label: catLabel, color: catColor })}
                      className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title="Editar nombre y color de esta categoría"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    {catObj?.isCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar la categoría "${catLabel}"?`)) {
                            codexStore.deleteRelationshipCategory(catObj.id);
                          }
                        }}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Eliminar categoría personalizada"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <RelationshipEntitiesGroup
                  viewMode={viewMode}
                  items={entityItems}
                  onOpenEntityDossier={onOpenEntityDossier}
                  onOpenEntityBoard={onOpenEntityBoard}
                  onRemoveRelationship={(relId) => codexStore.deleteRelationship(relId)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Editar/Crear Categoría */}
      <RelationshipCategoryEditModal
        isOpen={Boolean(editingCategory)}
        category={editingCategory}
        onSave={handleSaveCategory}
        onClose={() => setEditingCategory(null)}
      />
    </div>
  );
};
