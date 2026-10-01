import React, { useState } from "react";
import { Plus, Trash2, Pencil, ShieldCheck, Swords, Heart, GraduationCap, Users, KeyRound, Tag } from "lucide-react";
import { RelationshipCategory, RelationshipLineStyle } from "../../../types";
import { BASE_RELATIONSHIP_PRESETS } from "./relationTypes";
import { RelationshipCategoryForm } from "./RelationshipCategoryForm";

export interface RelationshipCategorySelectorProps {
  selectedType: string;
  onSelectType: (type: string, defaultLabel?: string) => void;
  customCategories: RelationshipCategory[];
  onAddCategory: (category: Omit<RelationshipCategory, "id" | "isCustom">) => RelationshipCategory;
  onUpdateCategory?: (id: string, updates: Partial<RelationshipCategory>) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

const PRESET_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  friendly: ShieldCheck, hostile: Swords, romantic: Heart,
  mentor: GraduationCap, family: Users, secret: KeyRound,
};

function getContrastColor(hex: string): string {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return "#ffffff";
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 165 ? "#0f172a" : "#ffffff";
}

export const RelationshipCategorySelector: React.FC<RelationshipCategorySelectorProps> = ({
  selectedType, onSelectType, customCategories, onAddCategory, onUpdateCategory, onDeleteCategory,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RelationshipCategory | null>(null);

  const handleStartCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleStartEdit = (cat: RelationshipCategory) => {
    setEditingCategory(cat);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: { label: string; color: string; lineStyle: RelationshipLineStyle }) => {
    if (editingCategory) {
      onUpdateCategory?.(editingCategory.id, {
        label: data.label,
        badge: data.label,
        color: data.color,
        lineStyle: data.lineStyle,
      });
      if (selectedType === editingCategory.id) {
        onSelectType(editingCategory.id, data.label);
      }
    } else {
      const created = onAddCategory({
        label: data.label,
        badge: data.label,
        color: data.color,
        lineStyle: data.lineStyle,
      });
      onSelectType(created.id, created.label);
    }
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-bold text-[11px] text-[var(--text-secondary)] block">
          Naturaleza o Categoría del Vínculo
        </label>
        {!isFormOpen && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Nueva Categoría</span>
          </button>
        )}
      </div>

      {isFormOpen ? (
        <RelationshipCategoryForm
          initialCategory={editingCategory}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
          {BASE_RELATIONSHIP_PRESETS.map((preset) => {
            const IconComp = PRESET_ICONS[preset.id] || Tag;
            const isSelected = selectedType === preset.id;
            const contrast = getContrastColor(preset.color);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectType(preset.id, preset.label)}
                style={isSelected ? { backgroundColor: preset.color, color: contrast } : undefined}
                className={`p-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer text-[11px] ${
                  isSelected ? "font-bold shadow-xs" : "bg-[var(--bg-input)]/40 hover:bg-[var(--bg-input)] text-[var(--text-secondary)]"
                }`}
              >
                <IconComp className="w-3.5 h-3.5 shrink-0" style={{ color: isSelected ? contrast : preset.color }} />
                <span className="truncate">{preset.badge}</span>
              </button>
            );
          })}

          {customCategories.map((cat) => {
            const isSelected = selectedType === cat.id;
            const contrast = getContrastColor(cat.color);
            return (
              <div
                key={cat.id}
                onClick={() => onSelectType(cat.id, cat.label)}
                style={isSelected ? { backgroundColor: cat.color, color: contrast } : undefined}
                className={`p-2 rounded-xl flex items-center justify-between gap-1.5 transition-all cursor-pointer text-[11px] group ${
                  isSelected ? "font-bold shadow-xs" : "bg-[var(--bg-input)]/40 hover:bg-[var(--bg-input)] text-[var(--text-secondary)]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: isSelected ? contrast : cat.color,
                      boxShadow: isSelected ? undefined : `0 0 4px ${cat.color}60`,
                    }}
                  />
                  <span className="truncate">{cat.badge || cat.label}</span>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    title="Editar categoría"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(cat);
                    }}
                    className={`p-1 rounded-md cursor-pointer transition-all ${
                      isSelected
                        ? "opacity-90 hover:opacity-100 hover:bg-black/10"
                        : "opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                    style={isSelected ? { color: contrast } : undefined}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  {onDeleteCategory && (
                    <button
                      type="button"
                      title="Eliminar categoría"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(cat.id);
                      }}
                      className={`p-1 rounded-md cursor-pointer transition-all ${
                        isSelected
                          ? "opacity-90 hover:opacity-100 hover:bg-black/10"
                          : "opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-surface-hover)] text-red-400 hover:text-red-500"
                      }`}
                      style={isSelected ? { color: contrast } : undefined}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
