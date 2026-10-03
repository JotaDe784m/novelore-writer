import React, { useMemo } from "react";
import {
  BookOpen, Compass, Gem, Image as ImageIcon, MapPin, MoreVertical,
  Share2, Shield, Sparkles, User, Zap,
} from "lucide-react";
import { WorldEntity } from "../../../types";
import { getDefaultCategoryColor, getCategoryLabel } from "../../../utils/codexDefaults";
import { resolveAssetUrl } from "../../../utils/imageUtils";
import { useCodexStore } from "../../../stores/useCodexStore";

export interface CodexEntityCardDetailedProps {
  entity: WorldEntity;
  relationshipCount: number;
  mentionCount: number;
  projectPath?: string;
  mode?: "classic" | "free";
  onEdit: (entity: WorldEntity) => void;
  onContextMenu?: (e: React.MouseEvent, entity: WorldEntity) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  character: User, location: MapPin, faction: Shield, item: Gem, concept: Zap, other: Sparkles,
};

export const CodexEntityCardDetailed: React.FC<CodexEntityCardDetailedProps> = ({
  entity,
  relationshipCount,
  mentionCount,
  projectPath,
  mode = "classic",
  onEdit,
  onContextMenu,
}) => {
  const customCategories = useCodexStore((s) => s.customEntityCategories);
  const categoryColor = getDefaultCategoryColor(entity.category, customCategories);
  const accentColor = entity.color || categoryColor || "#6366F1";
  const categoryLabel = getCategoryLabel(entity.category, customCategories);
  const CategoryIcon = CATEGORY_ICONS[entity.category] || Compass;

  const rawImg = entity.avatarUrl || entity.gallery?.[0]?.url;
  const imageSrc = resolveAssetUrl(rawImg, projectPath);

  const initials = entity.name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

  const attributeEntries = useMemo(() => {
    const attrs = entity.attributes || {};
    const keys = Object.keys(attrs);

    const findKey = (pattern: RegExp) => keys.find((k) => pattern.test(k));
    const roleKey = findKey(/^rol|^role/i);
    const goalKey = findKey(/^meta|^objetivo|^goal/i);
    const appearanceKey = findKey(/^apariencia|^aspecto|^f[ií]sico/i);
    const motivationKey = findKey(/^motivaci[oó]n|^motivo|^deseo/i);

    const prioritized: { label: string; value: string }[] = [];
    const usedKeys = new Set<string>();

    [roleKey, goalKey, appearanceKey, motivationKey].forEach((k) => {
      if (k && attrs[k]?.trim()) {
        prioritized.push({ label: k, value: attrs[k].trim() });
        usedKeys.add(k);
      }
    });

    keys.forEach((k) => {
      if (!usedKeys.has(k) && attrs[k]?.trim()) {
        prioritized.push({ label: k, value: attrs[k].trim() });
        usedKeys.add(k);
      }
    });

    if (mode === "classic" && entity.notes?.trim() && prioritized.length < 4) {
      prioritized.push({ label: "Notas", value: entity.notes.trim() });
    }

    return prioritized;
  }, [entity.attributes, entity.notes, mode]);

  const displayedAttributes = mode === "classic" ? attributeEntries.slice(0, 4) : attributeEntries;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(entity)}
      onKeyDown={(e) => e.key === "Enter" && onEdit(entity)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu?.(e, entity);
      }}
      className={`group relative flex flex-col justify-between rounded-3xl p-4 sm:p-5 transition-all duration-200 cursor-pointer select-none hover:shadow-xl hover:-translate-y-0.5 border-2 text-left ${
        mode === "classic" ? "h-full" : ""
      }`}
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: accentColor,
      }}
    >
      <div>
        {/* 1. Cabecera Vertical: Retrato en proporción 3:4 + Identidad Editorial */}
        <div className="flex gap-3.5 sm:gap-4 items-start">
          <div className="w-20 sm:w-24 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 relative bg-[var(--bg-surface)] border border-[var(--border-color)]/50 shadow-xs">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={entity.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center font-novel-display text-xl sm:text-2xl font-bold text-white drop-shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}ee, ${accentColor}77)`,
                }}
              >
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
            <div>
              <div className="flex items-start justify-between gap-1.5">
                <h3 className="font-novel-display text-base sm:text-lg font-bold text-[var(--text-main)] truncate leading-tight">
                  {entity.name}
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContextMenu?.(e, entity);
                  }}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors shrink-0 cursor-pointer"
                  title="Opciones de la ficha"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              {entity.subtitle && (
                <p className="font-novel-serif text-xs text-[var(--text-muted)] truncate mt-0.5">
                  {entity.subtitle}
                </p>
              )}

              {/* Descripción corta: llena la altura junto al retrato 3:4 */}
              {entity.summary && (
                <p className="font-novel-serif text-xs text-[var(--text-main)]/85 line-clamp-2 leading-relaxed mt-1 italic">
                  {entity.summary}
                </p>
              )}
            </div>

            <div className="mt-1.5 pt-1 border-t border-[var(--border-color)]/30">
              <div className="flex items-center gap-1.5 font-sans text-[11px] text-[var(--text-muted)]">
                <CategoryIcon className="w-3 h-3 shrink-0" />
                <span className="truncate">{categoryLabel}</span>
              </div>

              {entity.tags && entity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 max-h-10 overflow-hidden">
                  {entity.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="px-2 py-0.2 rounded-full font-sans text-[10px] bg-[var(--bg-surface-hover)] text-[var(--text-muted)] border border-[var(--border-color)]/40 truncate max-w-[110px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Bloque de Notas y Atributos: 4 notas fijas (Clásico) vs Todas extendidas (Libre) */}
        <div className="mt-4 pt-3.5 border-t border-[var(--border-color)]/40">
          {displayedAttributes.length > 0 ? (
            <div className={`grid grid-cols-2 gap-3 ${mode === "classic" ? "min-h-[144px] content-start" : ""}`}>
              {displayedAttributes.map((attr, idx) => (
                <div key={idx} className="min-w-0">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block truncate">
                    {attr.label}
                  </span>
                  <p
                    className={`font-sans text-xs text-[var(--text-main)] mt-0.5 leading-relaxed ${
                      mode === "classic" ? "line-clamp-3 font-semibold" : "whitespace-pre-line"
                    }`}
                  >
                    {attr.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={mode === "classic" ? "min-h-[144px] flex items-center" : ""}>
              <p className="font-sans text-xs text-[var(--text-muted)]/60 italic py-1">
                Sin notas registradas aún.
              </p>
            </div>
          )}

          {/* En modo libre, mostrar notas narrativas completas si existen */}
          {mode === "free" && entity.notes && (
            <div className="mt-3 pt-2.5 border-t border-[var(--border-color)]/30">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Notas adicionales
              </span>
              <p className="font-novel-serif text-xs text-[var(--text-main)]/90 mt-1 leading-relaxed whitespace-pre-line">
                {entity.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Pie de Ficha: Menciones literarias y métricas */}
      <div className="mt-4 pt-3 border-t border-[var(--border-color)]/30 flex items-center justify-between font-sans text-xs text-[var(--text-muted)]">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[var(--border-color)]/50 bg-[var(--bg-surface-hover)] font-bold text-[var(--text-main)] shadow-2xs"
          title={`${mentionCount} menciones en el manuscrito`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{mentionCount}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {relationshipCount > 0 && (
            <div className="flex items-center gap-1" title={`${relationshipCount} vínculos registrados`}>
              <Share2 className="w-3 h-3 text-[var(--text-muted)]" />
              <span>{relationshipCount}</span>
            </div>
          )}
          {entity.gallery && entity.gallery.length > 1 && (
            <div className="flex items-center gap-1" title={`${entity.gallery.length} imágenes`}>
              <ImageIcon className="w-3 h-3 text-[var(--text-muted)]" />
              <span>{entity.gallery.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
