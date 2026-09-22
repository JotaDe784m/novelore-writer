import React, { useState, useMemo } from "react";
import {
  Compass,
  User,
  MapPin,
  Shield,
  Gem,
  Zap,
  Calendar,
  Plus,
  Search,
  Share2,
  Filter,
  Edit2,
  Tag,
  Eye,
  Image as ImageIcon,
  BookOpen,
  ArrowUpDown,
} from "lucide-react";
import { EntityCategory, NovelProject, WorldEntity } from "../../types";
import { EntityModal } from "./EntityModal";
import { calculateAllEntitiesMentions } from "../../utils/mentionCounter";

interface WorldbuildingHubProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onOpenRelationshipMap: () => void;
}

export const WorldbuildingHub: React.FC<WorldbuildingHubProps> = ({
  project,
  onUpdateProject,
  onOpenRelationshipMap,
}) => {
  const [activeCategory, setActiveCategory] = useState<EntityCategory | "all">(
    "all"
  );
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "most_mentions" | "least_mentions" | "name_asc">("default");
  const [editingEntity, setEditingEntity] = useState<WorldEntity | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const entities = project.entities || [];
  const relationships = project.relationships || [];

  // Calculate mention counts across manuscript for all entities including aliases
  const entityMentionsMap = useMemo(() => {
    return calculateAllEntitiesMentions(entities, project);
  }, [entities, project]);

  const allTags = Array.from(
    new Set(entities.flatMap((e) => e.tags || []))
  );

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
      default:
        return Compass;
    }
  };

  const getCategoryLabel = (cat: EntityCategory) => {
    switch (cat) {
      case "character":
        return "Personajes";
      case "location":
        return "Lugares";
      case "faction":
        return "Facciones";
      case "item":
        return "Objetos";
      case "concept":
        return "Sistemas & Magia";
      case "event":
        return "Eventos";
      default:
        return "Elementos";
    }
  };

  const filteredEntities = useMemo(() => {
    const list = entities.filter((entity) => {
      const matchesCategory =
        activeCategory === "all" || entity.category === activeCategory;
      const searchLower = search.toLowerCase();
      const matchesSearch =
        entity.name.toLowerCase().includes(searchLower) ||
        (entity.subtitle && entity.subtitle.toLowerCase().includes(searchLower)) ||
        entity.summary.toLowerCase().includes(searchLower) ||
        (entity.aliases && entity.aliases.some((a) => a.toLowerCase().includes(searchLower)));
      const matchesTag =
        selectedTag === "all" || (entity.tags && entity.tags.includes(selectedTag));
      return matchesCategory && matchesSearch && matchesTag;
    });

    if (sortBy === "most_mentions") {
      return [...list].sort(
        (a, b) =>
          (entityMentionsMap[b.id]?.totalCount || 0) -
          (entityMentionsMap[a.id]?.totalCount || 0)
      );
    }
    if (sortBy === "least_mentions") {
      return [...list].sort(
        (a, b) =>
          (entityMentionsMap[a.id]?.totalCount || 0) -
          (entityMentionsMap[b.id]?.totalCount || 0)
      );
    }
    if (sortBy === "name_asc") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [entities, activeCategory, search, selectedTag, sortBy, entityMentionsMap]);

  const handleSaveEntity = (saved: WorldEntity) => {
    onUpdateProject((p) => {
      const pEntities = p.entities || [];
      const exists = pEntities.some((e) => e.id === saved.id);
      return {
        ...p,
        entities: exists
          ? pEntities.map((e) => (e.id === saved.id ? saved : e))
          : [...pEntities, saved],
      };
    });
    setEditingEntity(null);
    setIsCreating(false);
  };

  const handleDeleteEntity = (id: string) => {
    onUpdateProject((p) => ({
      ...p,
      entities: (p.entities || []).filter((e) => e.id !== id),
      relationships: (p.relationships || []).filter(
        (r) => r.sourceEntityId !== id && r.targetEntityId !== id
      ),
    }));
    setEditingEntity(null);
  };

  const categories: { id: EntityCategory | "all"; label: string; count: number }[] = [
    { id: "all", label: "Todo el Lore", count: entities.length },
    {
      id: "character",
      label: "Personajes",
      count: entities.filter((e) => e.category === "character").length,
    },
    {
      id: "location",
      label: "Lugares",
      count: entities.filter((e) => e.category === "location").length,
    },
    {
      id: "faction",
      label: "Facciones",
      count: entities.filter((e) => e.category === "faction").length,
    },
    {
      id: "item",
      label: "Objetos & Reliquias",
      count: entities.filter((e) => e.category === "item").length,
    },
    {
      id: "concept",
      label: "Magia & Leyes",
      count: entities.filter((e) => e.category === "concept").length,
    },
    {
      id: "event",
      label: "Eventos Históricos",
      count: entities.filter((e) => e.category === "event").length,
    },
  ];

  return (
    <div
      id="worldbuilding-hub"
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Header & Controls */}
      <div
        className="p-5 sm:px-8 border-b flex flex-wrap items-center justify-between gap-4 shrink-0"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-novel-display flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
              <Compass className="w-5 h-5" />
            </span>
            <span>Biblia de Mundo (Codex & Lore)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Enciclopedia viva de personajes, reinos, sistemas mágicos, reliquias y facciones narrativas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenRelationshipMap}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs sm:text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-2xs"
          >
            <Share2 className="w-4 h-4 text-[var(--accent)]" />
            <span>Ver Mapa de Relaciones</span>
          </button>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs sm:text-sm font-bold hover:opacity-90 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[var(--accent-contrast)]" />
            <span>Nueva Entrada</span>
          </button>
        </div>
      </div>

      {/* Category & Search Filter Bar */}
      <div
        className="px-4 sm:px-8 py-3 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 text-xs"
        style={{
          backgroundColor: "var(--bg-input)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Category Pills with horizontal scrolling if needed */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0 min-w-0 max-w-full">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                activeCategory === c.id
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span>{c.label}</span>
              <span className="ml-1 opacity-75">({c.count})</span>
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Buscar entidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] text-xs sm:text-sm w-full sm:min-w-[220px] lg:min-w-[260px]"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-[var(--text-muted)] hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] text-xs sm:text-sm focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              title="Criterio de ordenación"
            >
              <option value="default">Orden original</option>
              <option value="most_mentions">Más mencionados</option>
              <option value="least_mentions">Menos mencionados</option>
              <option value="name_asc">Nombre (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Entity Cards Grid */}
      <div
        id="worldbuilding-entities-scroll"
        className="flex-1 min-h-0 overflow-y-scroll p-4 sm:p-6 lg:p-8 custom-scroll always-scroll"
        style={{
          overflowY: "scroll",
          scrollbarGutter: "stable",
        }}
      >
        {filteredEntities.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center text-[var(--text-muted)]">
            <Compass className="w-14 h-14 mb-4 opacity-40 text-[var(--accent)]" />
            <h3 className="font-bold text-base font-novel-display text-[var(--text-main)]">
              No se encontraron elementos
            </h3>
            <p className="text-sm max-w-md mt-1.5 mb-5 leading-relaxed">
              Crea tu primer personaje, lugar o facción para enriquecer el mundo de tu novela.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-bold shadow-xs hover:opacity-90 transition-opacity"
            >
              + Crear Entrada
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredEntities.map((entity) => {
              const Icon = getCategoryIcon(entity.category);
              const relatedCount = relationships.filter(
                (r) =>
                  r.sourceEntityId === entity.id || r.targetEntityId === entity.id
              ).length;
              const mentions = entityMentionsMap[entity.id]?.totalCount || 0;

              return (
                <div
                  key={entity.id}
                  onClick={() => setEditingEntity(entity)}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-[var(--accent)] transition-all cursor-pointer flex flex-col justify-between space-y-4 group overflow-hidden"
                  style={{
                    borderTop: `4px solid ${entity.color || "#3b82f6"}`,
                  }}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Large Avatar or Icon, Name, Category Badge & Mention Count */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        {entity.avatarUrl ? (
                          <div
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-sm shrink-0 relative bg-[var(--bg-input)]"
                            style={{
                              border: `2.5px solid ${entity.color || "#3b82f6"}`,
                              boxShadow: `0 0 0 3px ${(entity.color || "#3b82f6")}25`,
                            }}
                          >
                            <img
                              src={entity.avatarUrl}
                              alt={entity.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Small accent corner dot */}
                            <span
                              className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white dark:border-black shadow-xs"
                              style={{ backgroundColor: entity.color || "#3b82f6" }}
                            />
                          </div>
                        ) : (
                          <div
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm shrink-0"
                            style={{
                              backgroundColor: entity.color || "#3b82f6",
                              border: `2.5px solid ${entity.color || "#3b82f6"}`,
                              boxShadow: `0 0 0 3px ${(entity.color || "#3b82f6")}25`,
                            }}
                          >
                            <Icon className="w-7 h-7" />
                          </div>
                        )}
                        <div className="overflow-hidden space-y-0.5">
                          <h4 className="font-bold text-base sm:text-lg font-novel-display text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors leading-tight truncate">
                            {entity.name}
                          </h4>
                          {entity.subtitle && (
                            <div className="text-xs text-[var(--text-muted)] truncate font-medium">
                              {entity.subtitle}
                            </div>
                          )}
                          <div className="pt-0.5 flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                              style={{ backgroundColor: entity.color || "#3b82f6" }}
                              title={`Color de identificación: ${entity.color || "#3b82f6"}`}
                            />
                            <span className="inline-block text-[11px] font-medium text-[var(--text-muted)] px-2 py-0.5 rounded-md bg-[var(--bg-input)] border border-[var(--border-color)]/60">
                              {getCategoryLabel(entity.category)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mentions Pill */}
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30 shrink-0 flex items-center gap-1.5 shadow-2xs"
                        title={`Mencionado ${mentions} veces en el manuscrito`}
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>{mentions}</span>
                      </span>
                    </div>

                    {/* Aliases Preview (if any) */}
                    {entity.aliases && entity.aliases.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {entity.aliases.slice(0, 3).map((alias) => (
                          <span
                            key={alias}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-input)] border border-[var(--border-color)]/70 text-[var(--text-muted)] truncate max-w-[130px]"
                            title={`Apodo: ${alias}`}
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

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                      {entity.summary || "Sin descripción corta"}
                    </p>

                    {/* Important Attribute pill (e.g. Rol or Tipo) */}
                    {Object.entries(entity.attributes || {}).length > 0 && (
                      <div className="p-3 rounded-xl bg-[var(--bg-input)]/70 text-xs space-y-1.5 border border-[var(--border-color)]/60">
                        {Object.entries(entity.attributes)
                          .slice(0, 3)
                          .map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center gap-2 truncate">
                              <span className="font-bold text-[var(--text-muted)] shrink-0">
                                {k}:
                              </span>
                              <span className="text-[var(--text-main)] truncate font-medium text-right">
                                {v}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="border-t border-[var(--border-color)]/60 pt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-medium" title={`${relatedCount} vínculos en el mapa de relaciones`}>
                        <Share2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>{relatedCount} vínculos</span>
                      </div>
                      {entity.gallery && entity.gallery.length > 0 && (
                        <span className="flex items-center gap-1.5 font-semibold text-[var(--accent)]" title={`${entity.gallery.length} imágenes en galería`}>
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
            })}
          </div>
        )}
      </div>

      {/* Entity Modal */}
      {(isCreating || editingEntity) && (
        <EntityModal
          entity={editingEntity}
          project={project}
          onSave={handleSaveEntity}
          onDelete={handleDeleteEntity}
          onClose={() => {
            setIsCreating(false);
            setEditingEntity(null);
          }}
        />
      )}
    </div>
  );
};
