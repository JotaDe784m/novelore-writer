import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Compass,
  Edit2,
  Gem,
  Image as ImageIcon,
  MapPin,
  Share2,
  Shield,
  Sparkles,
  User,
  Zap,
  Tag,
} from "lucide-react";
import { EntityCategory, WorldEntity } from "../../../types";
import { getCategoryLabel } from "../../../utils/codexDefaults";
import { resolveAssetUrl } from "../../../utils/imageUtils";
import { useCodexStore } from "../../../stores/useCodexStore";

export interface CodexEntityCardProps {
  entity: WorldEntity;
  relationshipCount: number;
  mentionCount: number;
  onEdit: (entity: WorldEntity) => void;
}

const getCategoryIcon = (cat: EntityCategory) => {
  switch (cat) {
    case "character":
      return User;
    case "location":
      return MapPin;
    case "faction":
      return Shield;
    case "item":
      return Gem;
    case "concept":
      return Zap;
    case "event":
      return Calendar;
    case "other":
      return Sparkles;
    default:
      return Tag;
  }
};

export const CodexEntityCard: React.FC<CodexEntityCardProps> = ({
  entity,
  relationshipCount,
  mentionCount,
  onEdit,
}) => {
  const customCategories = useCodexStore((state) => state.customEntityCategories);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [entity.avatarUrl]);

  const Icon = getCategoryIcon(entity.category);
  const color = entity.color || "#3b82f6";

  return (
    <div
      onClick={() => onEdit(entity)}
      className="rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group overflow-hidden relative"
      style={{
        backgroundColor: "var(--bg-card)",
        borderTop: `4px solid ${color}`,
      }}
    >
      <div className="space-y-3.5">
        {/* Cabecera de la Tarjeta: Avatar / Icono, Nombre y Píldora de Menciones */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 overflow-hidden">
            {entity.avatarUrl && !avatarError ? (
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-2xs shrink-0 relative"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  boxShadow: `0 0 0 2px ${color}33`,
                }}
              >
                <img
                  src={resolveAssetUrl(entity.avatarUrl)}
                  alt={entity.name}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white dark:border-black shadow-2xs"
                  style={{ backgroundColor: color }}
                />
              </div>
            ) : (
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-2xs shrink-0"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 0 2px ${color}33`,
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
            )}

            <div className="overflow-hidden space-y-0.5">
              <h4 className="font-bold text-base font-novel-display text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors leading-tight truncate">
                {entity.name}
              </h4>
              {entity.subtitle && (
                <div className="text-xs text-[var(--text-muted)] truncate font-medium">
                  {entity.subtitle}
                </div>
              )}
              <div className="pt-0.5 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="inline-block text-[11px] font-medium text-[var(--text-muted)] px-2 py-0.5 rounded-md bg-[var(--bg-surface)]">
                  {getCategoryLabel(entity.category, customCategories)}
                </span>
              </div>
            </div>
          </div>

          {/* Contador de menciones literarias */}
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0 flex items-center gap-1.5 shadow-2xs"
            title={`Mencionado ${mentionCount} veces en el manuscrito`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{mentionCount}</span>
          </span>
        </div>

        {/* Alias y Apodos (hasta 3) */}
        {entity.aliases && entity.aliases.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {entity.aliases.slice(0, 3).map((alias) => (
              <span
                key={alias}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)] truncate max-w-[130px]"
                title={`Apodo o variante: ${alias}`}
              >
                «{alias}»
              </span>
            ))}
            {entity.aliases.length > 3 && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                +{entity.aliases.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Sumario narrativo */}
        <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed">
          {entity.summary || "Sin descripción corta"}
        </p>

        {/* Atributos y rasgos detallados - Expandibles verticalmente */}
        {Object.entries(entity.attributes || {}).length > 0 && (
          <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] text-xs space-y-2.5">
            {Object.entries(entity.attributes).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <span className="font-bold text-[var(--text-muted)] text-[10px] uppercase tracking-wide">
                  {k}:
                </span>
                <span className="text-[var(--text-main)] font-medium leading-relaxed break-words">
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pie de tarjeta con vínculos y acción de edición */}
      <div className="pt-3 border-t border-[var(--text-muted)]/10 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 font-medium"
            title={`${relationshipCount} vínculos en el mapa de relaciones`}
          >
            <Share2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{relationshipCount} vínculos</span>
          </div>
          {entity.gallery && entity.gallery.length > 0 && (
            <span
              className="flex items-center gap-1.5 font-semibold text-[var(--accent)]"
              title={`${entity.gallery.length} imágenes en galería`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{entity.gallery.length} fotos</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {entity.tags && entity.tags[0] && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold text-[11px]">
              {entity.tags[0]}
            </span>
          )}
          <span className="text-[var(--accent)] font-semibold flex items-center gap-1 hover:underline">
            <Edit2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Editar</span>
          </span>
        </div>
      </div>
    </div>
  );
};
