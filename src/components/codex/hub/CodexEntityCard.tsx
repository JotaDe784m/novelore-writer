import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Compass,
  Gem,
  Image as ImageIcon,
  MapPin,
  MoreVertical,
  Share2,
  Shield,
  Sparkles,
  User,
  Zap,
  Tag,
} from "lucide-react";
import { EntityCategory, WorldEntity } from "../../../types";
import { getCategoryLabel, getDefaultCategoryColor } from "../../../utils/codexDefaults";
import { resolveAssetUrl } from "../../../utils/imageUtils";
import { useCodexStore } from "../../../stores/useCodexStore";

export interface CodexEntityCardProps {
  entity: WorldEntity;
  relationshipCount: number;
  mentionCount: number;
  projectPath?: string;
  onEdit: (entity: WorldEntity) => void;
  onContextMenu?: (e: React.MouseEvent, entity: WorldEntity) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  character: User,
  location: MapPin,
  faction: Shield,
  item: Gem,
  concept: Zap,
  other: Sparkles,
};

export const CodexEntityCard: React.FC<CodexEntityCardProps> = ({
  entity,
  relationshipCount,
  mentionCount,
  projectPath,
  onEdit,
  onContextMenu,
}) => {
  const customCategories = useCodexStore((state) => state.customEntityCategories);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [entity.avatarUrl, entity.avatarOriginalUrl]);

  const rawImg = entity.avatarUrl || entity.avatarOriginalUrl;
  const resolvedImg = rawImg ? resolveAssetUrl(rawImg, projectPath) : "";
  const hasValidImage = Boolean(resolvedImg && !imageError);

  const Icon = CATEGORY_ICONS[entity.category] || Tag;
  const color = entity.color || getDefaultCategoryColor(entity.category, customCategories) || "#3b82f6";
  const label = getCategoryLabel(entity.category, customCategories);
  const initials = entity.name
    ? entity.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")
    : "E";

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onContextMenu) {
      e.preventDefault();
      onContextMenu(e, entity);
    }
  };

  return (
    <div
      onClick={() => onEdit(entity)}
      onContextMenu={handleContextMenu}
      className="group relative rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
      style={{
        backgroundColor: "var(--bg-card)",
        border: hasValidImage ? `2px solid ${color}` : "1px solid var(--border-color)",
      }}
    >
      {/* 1. Contenedor en Proporción Universal 3:4 */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[var(--bg-input)]">
        {hasValidImage ? (
          <img
            src={resolvedImg}
            alt={entity.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Portada editorial de respaldo con gradiente e iniciales */
          <div
            className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden transition-transform duration-500 group-hover:scale-105"
            style={{
              background: `linear-gradient(145deg, ${color}dd 0%, ${color} 100%)`,
            }}
          >
            {/* Marca de agua vectorial de categoría */}
            <Icon className="absolute w-36 h-36 -bottom-8 -right-8 text-white/10 pointer-events-none" />

            <div className="flex items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold font-novel-display text-white/95 drop-shadow-md tracking-wider">
                {initials}
              </span>
            </div>
          </div>
        )}

        {/* Degradado inferior protector para legibilidad de prosa */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none" />

        {/* 2. Insignia Superior Izquierda: Categoría */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-semibold text-white backdrop-blur-md shadow-xs"
            style={{ backgroundColor: `${color}cc` }}
          >
            <Icon className="w-3 h-3 text-white" />
            <span>{label}</span>
          </span>
        </div>

        {/* 3. Insignia Superior Derecha: Menciones literarias y menú */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-sans font-bold bg-black/60 text-white backdrop-blur-md shadow-xs"
            title={`${mentionCount} menciones en el manuscrito`}
          >
            <BookOpen className="w-3 h-3 text-[var(--accent)]" />
            <span>{mentionCount}</span>
          </span>

          {onContextMenu && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e);
              }}
              className="p-1 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/75 backdrop-blur-md transition-colors cursor-pointer"
              title="Opciones de la ficha"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 4. Contenido en la Base: Nombre, subtítulo, alias y extracto */}
        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 z-10 text-white space-y-1">
          <h4 className="font-bold text-sm sm:text-base font-novel-display text-white leading-tight drop-shadow-sm truncate">
            {entity.name}
          </h4>

          {entity.subtitle && (
            <p className="text-xs text-zinc-300 font-novel-serif italic drop-shadow-xs truncate">
              {entity.subtitle}
            </p>
          )}

          {/* Alias como píldoras translúcidas */}
          {entity.aliases && entity.aliases.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {entity.aliases.slice(0, 2).map((alias) => (
                <span
                  key={alias}
                  className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/15 text-zinc-200 font-sans truncate max-w-[120px]"
                >
                  «{alias}»
                </span>
              ))}
            </div>
          )}

          {/* Extracto de sumario narrativo */}
          {entity.summary && (
            <p className="text-[11px] text-zinc-300/90 font-novel-serif line-clamp-2 leading-relaxed drop-shadow-xs pt-0.5">
              {entity.summary}
            </p>
          )}

          {/* Indicadores de relaciones y galería */}
          <div className="flex items-center justify-between pt-1.5 text-[10px] text-zinc-300/80 border-t border-white/10 font-sans">
            <div className="flex items-center gap-1">
              <Share2 className="w-3 h-3 text-[var(--accent)]" />
              <span>{relationshipCount} {relationshipCount === 1 ? "vínculo" : "vínculos"}</span>
            </div>

            {entity.gallery && entity.gallery.length > 0 && (
              <div className="flex items-center gap-1 text-zinc-200">
                <ImageIcon className="w-3 h-3 text-cyan-300" />
                <span>{entity.gallery.length} fotos</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
