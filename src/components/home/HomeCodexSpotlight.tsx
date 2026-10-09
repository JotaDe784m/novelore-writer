import React from "react";
import { motion } from "motion/react";
import {
  Compass,
  ArrowRight,
  User,
  MapPin,
  Shield,
  Sparkles,
  BookOpen,
  Plus,
} from "lucide-react";
import { CodexEntity } from "../../types";
import { resolveAssetUrl } from "../../utils/imageUtils";
import { useCodexStore } from "../../stores/useCodexStore";
import { getCategoryLabel, getDefaultCategoryColor } from "../../utils/codexDefaults";
import { detectCategoryIcon } from "../../utils/categoryDetection";
import {
  getEntityInitials,
  getDeterministicColor,
} from "./homeUtils";

interface HomeCodexSpotlightProps {
  entities: CodexEntity[];
  projectPath?: string;
  onNavigateCodex: () => void;
  onSelectEntity?: (entityId: string) => void;
}

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  character: User,
  characters: User,
  location: MapPin,
  locations: MapPin,
  faction: Shield,
  factions: Shield,
  item: Sparkles,
  items: Sparkles,
  magic: Sparkles,
  lore: BookOpen,
};

export const HomeCodexSpotlight: React.FC<HomeCodexSpotlightProps> = ({
  entities = [],
  projectPath,
  onNavigateCodex,
  onSelectEntity,
}) => {
  const safeEntities = entities || [];
  const spotlightEntities = safeEntities.slice(0, 6);
  const customCategories = useCodexStore((state) => state.customEntityCategories);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-novel-display text-[var(--text-main)]">
            Elenco y Entidades Destacadas ({safeEntities.length})
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-serif">
            Retratos de los personajes, escenarios y elementos de tu historia
          </p>
        </div>
        <motion.button
          whileHover={{ x: 2 }}
          onClick={onNavigateCodex}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:opacity-85 transition-opacity cursor-pointer font-serif"
        >
          <span>Explorar Códex</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {safeEntities.length === 0 ? (
        <div
          className="rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px dashed var(--border-color)",
          }}
        >
          <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] text-[var(--accent)]">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-sm font-bold text-[var(--text-main)] font-novel-display">
              Tu Códex aún está en blanco
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
              Crea personajes, locaciones y facciones con retratos, galerías y fichas biográficas detalladas.
            </p>
          </div>
          <button
            onClick={onNavigateCodex}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs font-serif"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-contrast)",
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Primer Elemento en Códex</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {spotlightEntities.map((entity) => {
            const label = getCategoryLabel(entity.category, customCategories);
            const Icon = detectCategoryIcon(label);
            const categoryColor = getDefaultCategoryColor(entity.category, customCategories);
            const imgUrl = entity.avatarUrl || entity.avatarOriginalUrl;
            const resolvedImg = imgUrl ? resolveAssetUrl(imgUrl, projectPath) : "";
            const cardBgColor =
              entity.color || categoryColor || getDeterministicColor(entity.name);
            const initials = getEntityInitials(entity.name);

            return (
              <motion.div
                key={entity.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onSelectEntity) onSelectEntity(entity.id);
                  else onNavigateCodex();
                }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-end transition-all shadow-xs"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {/* 3:4 Aspect Ratio Container */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-[var(--bg-input)]">
                  {resolvedImg ? (
                    <img
                      src={resolvedImg}
                      alt={entity.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    /* Tarjeta de color con iniciales elegantes */
                    <div
                      className="w-full h-full flex flex-col items-center justify-center p-3 relative overflow-hidden transition-transform duration-500 group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${cardBgColor}dd 0%, ${cardBgColor} 100%)`,
                      }}
                    >
                      {/* Watermark icon behind */}
                      <Icon className="absolute w-24 h-24 -bottom-6 -right-6 text-white/10 pointer-events-none" />

                      {/* Initials badge */}
                      <div className="flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-bold font-novel-display text-white/95 drop-shadow-md tracking-wider">
                          {initials}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Gentle gradient scrim at the bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

                  {/* Category Pill Tag in Spanish */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md shadow-xs">
                      <Icon className="w-2.5 h-2.5 shrink-0" style={{ color: categoryColor }} />
                      <span>{label}</span>
                    </span>
                  </div>

                  {/* Card Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 z-10 text-white space-y-0.5">
                    <h3 className="font-bold text-xs sm:text-sm truncate drop-shadow-xs font-serif">
                      {entity.name}
                    </h3>
                    {entity.subtitle ? (
                      <p className="text-[10px] text-zinc-300 truncate drop-shadow-xs font-serif italic">
                        {entity.subtitle}
                      </p>
                    ) : entity.summary ? (
                      <p className="text-[10px] text-zinc-300 line-clamp-1 drop-shadow-xs font-serif">
                        {entity.summary}
                      </p>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
