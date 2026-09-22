import React, { useState, useRef, useMemo } from "react";
import {
  X,
  User,
  MapPin,
  Shield,
  Gem,
  Zap,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Camera,
  Image as ImageIcon,
  Check,
  Star,
  ZoomIn,
  Upload,
  FileText,
  ExternalLink,
  Eye,
  BookOpen,
  Palette,
  Pipette,
  Maximize2,
  Minimize2,
  Layers,
  History,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  EntityCategory,
  NovelProject,
  WorldEntity,
  EntityImage,
  MoodboardCanvas,
  TimelineEvent,
  Scene,
} from "../../types";
import { compressImage } from "../../utils/imageUtils";
import { ImageLightboxModal } from "./ImageLightboxModal";
import { getAllManuscriptScenes, calculateEntityMentions } from "../../utils/mentionCounter";
import { VisualBoardView } from "../board/VisualBoardView";

interface EntityModalProps {
  entity: WorldEntity | null;
  project: NovelProject;
  onSave: (entity: WorldEntity, syncedTimelineEvent?: Partial<TimelineEvent> | null) => void;
  onDelete: (entityId: string) => void;
  onClose: () => void;
  initialTab?: "details" | "whiteboard";
  initialCategory?: EntityCategory;
  onNavigateToTimeline?: (timelineEventId?: string) => void;
  onNavigateToScene?: (sceneId: string) => void;
}

export const EntityModal: React.FC<EntityModalProps> = ({
  entity,
  project,
  onSave,
  onDelete,
  onClose,
  initialTab = "details",
  initialCategory,
  onNavigateToTimeline,
  onNavigateToScene,
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "whiteboard">(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [whiteboard, setWhiteboard] = useState<MoodboardCanvas | undefined>(
    entity?.whiteboard
  );

  const [category, setCategory] = useState<EntityCategory>(
    entity?.category || initialCategory || "character"
  );
  const [name, setName] = useState(entity?.name || "");
  const [subtitle, setSubtitle] = useState(entity?.subtitle || "");
  const [summary, setSummary] = useState(entity?.summary || "");
  const [notes, setNotes] = useState(entity?.notes || "");
  const [color, setColor] = useState(
    entity?.color ||
      (initialCategory === "event" ? "#f59e0b" : initialCategory === "location" ? "#10b981" : "#3b82f6")
  );
  const rafEntityColorRef = useRef<number | null>(null);
  const lastEntityColorTimeRef = useRef<number>(0);

  const handleEntityColorChange = (newColor: string, immediate = false) => {
    if (rafEntityColorRef.current) {
      cancelAnimationFrame(rafEntityColorRef.current);
      rafEntityColorRef.current = null;
    }
    if (immediate) {
      setColor(newColor);
      return;
    }
    const now = performance.now();
    if (now - lastEntityColorTimeRef.current >= 50) {
      lastEntityColorTimeRef.current = now;
      rafEntityColorRef.current = requestAnimationFrame(() => {
        setColor(newColor);
      });
    }
  };
  const [tags, setTags] = useState<string[]>(entity?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [aliases, setAliases] = useState<string[]>(entity?.aliases || []);
  const [aliasInput, setAliasInput] = useState("");
  const [showMentionBreakdown, setShowMentionBreakdown] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(entity?.avatarUrl || "");
  const [gallery, setGallery] = useState<EntityImage[]>(entity?.gallery || []);

  const [attributes, setAttributes] = useState<Record<string, string>>(
    entity?.attributes || getDefaultAttributes(entity?.category || initialCategory || "character")
  );

  // Historical event & timeline integration state
  const [isHistorical, setIsHistorical] = useState<boolean>(
    entity?.isHistorical ?? (entity?.category === "event" || category === "event")
  );
  const [dateOrEpoch, setDateOrEpoch] = useState<string>(
    entity?.dateOrEpoch || entity?.attributes?.["Época"] || ""
  );
  const [involvedEntityIds, setInvolvedEntityIds] = useState<string[]>(
    entity?.involvedEntityIds || []
  );

  // Check if a linked TimelineEvent already exists
  const existingTimelineEvent = useMemo(() => {
    if (!entity) return null;
    return (
      project.timelineEvents?.find(
        (ev) => ev.entityId === entity.id || ev.id === entity.timelineEventId
      ) || null
    );
  }, [entity, project.timelineEvents]);

  const [syncWithTimeline, setSyncWithTimeline] = useState<boolean>(
    !!existingTimelineEvent || !!entity?.timelineEventId
  );
  const [timelineTrackId, setTimelineTrackId] = useState<string>(
    existingTimelineEvent?.trackId ||
      project.timelineTracks.find((t) => t.id.includes("lore") || t.name.toLowerCase().includes("lore"))?.id ||
      project.timelineTracks[0]?.id ||
      "trk-main"
  );
  const [timelineImportance, setTimelineImportance] = useState<
    "minor" | "key" | "turning_point" | "climax"
  >(existingTimelineEvent?.importance || "key");

  // Scenes that reference or reveal this historical event in the manuscript
  const scenesWithThisEvent = useMemo(() => {
    if (!entity || category !== "event") return [];
    const res: { scene: Scene; chapterTitle: string; actTitle: string }[] = [];
    project.acts?.forEach((act) => {
      act.chapters?.forEach((chap) => {
        chap.scenes?.forEach((sc) => {
          if (
            sc.historicalEventIds?.includes(entity.id) ||
            sc.timelineEventId === entity.timelineEventId
          ) {
            res.push({
              scene: sc,
              chapterTitle: chap.title || "Capítulo",
              actTitle: act.title || "Acto",
            });
          }
        });
      });
    });
    return res;
  }, [entity, category, project]);

  // State for adding custom attribute inline (no window.prompt!)
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  // State for image URL input
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const [urlCaptionValue, setUrlCaptionValue] = useState("");

  // State for lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  function getDefaultAttributes(cat: EntityCategory): Record<string, string> {
    switch (cat) {
      case "character":
        return {
          Rol: "Protagonista / Aliado",
          Edad: "25 años",
          Motivación: "¿Qué persigue el personaje?",
          "Mayor Miedo": "¿A qué teme más en el mundo?",
          "Secreto Inconfesable": "Un secreto que nadie sabe...",
          "Rasgo Físico": "Ojos, cicatrices, porte...",
        };
      case "location":
        return {
          Tipo: "Ciudad / Fortaleza / Mazmorra",
          Clima: "Brumoso y frío",
          Peligros: "¿Qué amenazas acechan?",
          Atmósfera: "Sensaciones de luz, sonido y olor...",
        };
      case "faction":
        return {
          Líder: "Nombre del gobernante o canciller",
          Lema: "'Lema de la orden'",
          Recursos: "Ejército, magia, dinero...",
        };
      case "item":
        return {
          Origen: "Forjado por...",
          Poder: "Efecto o propiedad mágica",
          Coste: "Precio o peligro de usarlo",
        };
      case "concept":
        return {
          Tipo: "Magia dura / Tecnología / Ley",
          Reglas: "Límites y condiciones",
          Peligro: "Consecuencias de abuso",
        };
      case "event":
        return {
          Época: "Año o era",
          Bandos: "Quienes participaron",
          Consecuencias: "Impacto en el presente",
        };
      default:
        return {};
    }
  }

  const handleCategoryChange = (newCat: EntityCategory) => {
    setCategory(newCat);
    if (!entity) {
      setAttributes(getDefaultAttributes(newCat));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddAlias = () => {
    const trimmed = aliasInput.trim();
    if (trimmed && !aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setAliases([...aliases, trimmed]);
      setAliasInput("");
    }
  };

  const handleRemoveAlias = (aliasToRemove: string) => {
    setAliases(aliases.filter((a) => a !== aliasToRemove));
  };

  // Pre-calculate manuscript scenes and real-time mention stats for this entity
  const allScenes = useMemo(() => getAllManuscriptScenes(project), [project]);

  const currentEntityForMentions: WorldEntity = useMemo(
    () => ({
      id: entity?.id || "temp-entity",
      category,
      name,
      subtitle,
      summary,
      tags,
      aliases,
      attributes,
      notes,
    }),
    [entity?.id, category, name, subtitle, summary, tags, aliases, attributes, notes]
  );

  const mentionStats = useMemo(() => {
    return calculateEntityMentions(currentEntityForMentions, allScenes);
  }, [currentEntityForMentions, allScenes]);

  const handleAttributeChange = (key: string, value: string) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirmAddCustomField = () => {
    const trimmedKey = newFieldKey.trim();
    if (trimmedKey) {
      setAttributes((prev) => ({
        ...prev,
        [trimmedKey]: newFieldValue.trim() || "",
      }));
      setNewFieldKey("");
      setNewFieldValue("");
      setIsAddingField(false);
    }
  };

  const handleQuickAddSuggestedField = (fieldName: string) => {
    if (!attributes[fieldName]) {
      setAttributes((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleRemoveAttribute = (key: string) => {
    setAttributes((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // Process uploaded image files with client-side downscaling to prevent quota issues
  const processImageFiles = async (
    files: FileList | File[],
    setAsAvatarOnly: boolean = false
  ) => {
    const fileList = Array.from(files);
    for (const file of fileList) {
      if (!file.type.startsWith("image/")) continue;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawData = e.target?.result as string;
        if (!rawData) return;
        try {
          const optimized = await compressImage(rawData, 1200, 1200, 0.85);
          if (setAsAvatarOnly) {
            setAvatarUrl(optimized);
            // Also ensure it exists in gallery if not present
            setGallery((prev) => {
              if (prev.some((img) => img.url === optimized)) return prev;
              return [
                {
                  id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  url: optimized,
                  caption: file.name.replace(/\.[^/.]+$/, ""),
                  createdAt: new Date().toISOString(),
                },
                ...prev,
              ];
            });
          } else {
            const newImg: EntityImage = {
              id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url: optimized,
              caption: file.name.replace(/\.[^/.]+$/, ""),
              createdAt: new Date().toISOString(),
            };
            setGallery((prev) => [newImg, ...prev]);
            // If entry currently has no avatar, automatically assign this first uploaded photo
            setAvatarUrl((curr) => curr || optimized);
          }
        } catch {
          if (setAsAvatarOnly) setAvatarUrl(rawData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = urlInputValue.trim();
    if (!trimmed) return;
    const newImg: EntityImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: trimmed,
      caption: urlCaptionValue.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setGallery((prev) => [newImg, ...prev]);
    if (!avatarUrl) {
      setAvatarUrl(trimmed);
    }
    setUrlInputValue("");
    setUrlCaptionValue("");
    setShowUrlInput(false);
  };

  const handleRemoveFromGallery = (id: string, url: string) => {
    setGallery((prev) => prev.filter((img) => img.id !== id));
    if (avatarUrl === url) {
      // Find remaining image or clear
      const remaining = gallery.filter((img) => img.id !== id);
      setAvatarUrl(remaining[0]?.url || "");
    }
  };

  const handleUpdateCaption = (id: string, newCaption: string) => {
    setGallery((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption: newCaption } : img))
    );
  };

  const currentEntityForBoard: WorldEntity = useMemo(
    () => ({
      id: entity?.id || `entity-${Date.now()}`,
      category,
      name: name.trim() || "Elemento",
      subtitle: subtitle.trim(),
      summary: summary.trim(),
      tags,
      aliases: aliases.length > 0 ? aliases : undefined,
      attributes,
      notes: notes.trim(),
      color,
      avatarUrl: avatarUrl || undefined,
      gallery: gallery.length > 0 ? gallery : undefined,
      whiteboard: whiteboard,
    }),
    [
      entity?.id,
      category,
      name,
      subtitle,
      summary,
      tags,
      aliases,
      attributes,
      notes,
      color,
      avatarUrl,
      gallery,
      whiteboard,
    ]
  );

  const handleUpdateEntityWhiteboard = (
    updater: (prev: WorldEntity) => WorldEntity
  ) => {
    setWhiteboard((prevWb) => {
      const dummy: WorldEntity = {
        ...currentEntityForBoard,
        whiteboard: prevWb,
        gallery: gallery,
        avatarUrl: avatarUrl,
      };
      const updated = updater(dummy);
      if (updated.gallery && updated.gallery !== gallery) {
        setGallery(updated.gallery);
      }
      if (updated.avatarUrl && updated.avatarUrl !== avatarUrl) {
        setAvatarUrl(updated.avatarUrl);
      }
      return updated.whiteboard;
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    let targetTimelineEventId = entity?.timelineEventId || existingTimelineEvent?.id;
    if (category === "event" && syncWithTimeline && !targetTimelineEventId) {
      targetTimelineEventId = `evt-${Date.now()}`;
    } else if (!syncWithTimeline) {
      targetTimelineEventId = undefined;
    }

    const updatedAttributes = {
      ...attributes,
      ...(category === "event" && dateOrEpoch ? { Época: dateOrEpoch.trim() } : {}),
    };

    const updatedEntity: WorldEntity = {
      id: entity?.id || `entity-${Date.now()}`,
      category,
      name: name.trim(),
      subtitle: subtitle.trim(),
      summary: summary.trim(),
      tags,
      aliases: aliases.length > 0 ? aliases : undefined,
      attributes: updatedAttributes,
      notes: notes.trim(),
      color,
      avatarUrl: avatarUrl || undefined,
      gallery: gallery.length > 0 ? gallery : undefined,
      whiteboard: whiteboard,
      isHistorical: category === "event" ? isHistorical : undefined,
      dateOrEpoch: category === "event" ? (dateOrEpoch.trim() || undefined) : undefined,
      timelineEventId: targetTimelineEventId,
      involvedEntityIds: category === "event" && involvedEntityIds.length > 0 ? involvedEntityIds : undefined,
    };

    let syncedEvt: Partial<TimelineEvent> | null = null;
    if (category === "event" && syncWithTimeline && targetTimelineEventId) {
      // Split involved characters
      const charIds = involvedEntityIds.filter((id) =>
        project.entities.some((e) => e.id === id && e.category === "character")
      );
      const factionIds = involvedEntityIds.filter((id) =>
        project.entities.some((e) => e.id === id && e.category === "faction")
      );
      const itemIds = involvedEntityIds.filter((id) =>
        project.entities.some((e) => e.id === id && e.category === "item")
      );
      const locationId = involvedEntityIds.find((id) =>
        project.entities.some((e) => e.id === id && e.category === "location")
      );

      syncedEvt = {
        id: targetTimelineEventId,
        trackId: timelineTrackId,
        title: updatedEntity.name,
        summary: updatedEntity.summary,
        position: existingTimelineEvent?.position ?? (isHistorical ? 5 : 50),
        importance: timelineImportance,
        characterIds: charIds,
        locationId,
        factionIds,
        itemIds,
        dateOrEpoch: dateOrEpoch.trim() || undefined,
        era: isHistorical ? (dateOrEpoch.trim() || "Historia Previa / Lore") : undefined,
        entityId: updatedEntity.id,
        isHistorical: isHistorical,
        consequences: updatedAttributes["Consecuencias"] || undefined,
      };
    } else if (category === "event" && !syncWithTimeline && existingTimelineEvent) {
      syncedEvt = null; // Unlink signal
    }

    onSave(updatedEntity, syncedEvt);
  };

  const categories: {
    id: EntityCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "character", label: "Personaje", icon: User },
    { id: "location", label: "Lugar / Escenario", icon: MapPin },
    { id: "faction", label: "Facción / Clan", icon: Shield },
    { id: "item", label: "Objeto / Reliquia", icon: Gem },
    { id: "concept", label: "Magia / Concepto", icon: Zap },
    { id: "event", label: "Evento Histórico", icon: Calendar },
  ];

  const CategoryIcon = categories.find((c) => c.id === category)?.icon || User;

  return (
    <div
      id="entity-modal-backdrop"
      className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in"
    >
      <div
        id="entity-modal-container"
        className={
          isFullscreen
            ? "fixed inset-0 w-full h-full max-w-none max-h-none rounded-none z-50 flex flex-col overflow-hidden bg-[var(--bg-card)] text-[var(--text-main)]"
            : activeTab === "whiteboard"
            ? "w-full max-w-[96vw] 2xl:max-w-7xl rounded-3xl shadow-2xl border flex flex-col h-[90vh] max-h-[94vh] overflow-hidden transition-all bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
            : "w-full max-w-5xl lg:max-w-6xl rounded-3xl shadow-2xl border flex flex-col h-[88vh] max-h-[92vh] overflow-hidden transition-all bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
        }
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:px-6 border-b flex items-center justify-between border-[var(--border-color)] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full shadow-xs shrink-0 ring-2 ring-[var(--border-color)]"
              style={{ backgroundColor: color }}
            />
            <div>
              <h3 className="font-bold text-base sm:text-lg font-novel-display text-[var(--text-main)] leading-tight">
                {entity ? `Entrada: ${entity.name}` : "Nueva Entrada en la Biblia de Mundo"}
              </h3>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {subtitle || "Ficha de codex y pizarra visual dedicada de este elemento"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title={isFullscreen ? "Restaurar ventana" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Ficha vs Pizarra Visual) */}
        <div className="px-6 border-b border-[var(--border-color)] bg-[var(--bg-input)]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`py-2.5 px-3 border-b-2 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === "details"
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Ficha y Atributos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("whiteboard")}
              className={`py-2.5 px-3 border-b-2 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === "whiteboard"
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Pizarra Visual</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                  (whiteboard?.items?.length || gallery.length) > 0
                    ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-bold"
                    : "bg-black/10 dark:bg-white/10 text-[var(--text-muted)]"
                }`}
              >
                {whiteboard?.items?.length || gallery.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: DETAILS & ATTRIBUTES */}
        {activeTab === "details" && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm">
              {/* Profile Picture (Avatar) and Identity Card */}
              <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar Display */}
                <div className="relative group shrink-0">
                  <div
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 flex items-center justify-center shadow-md relative bg-[var(--bg-card)]"
                    style={{ borderColor: color }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name || "Perfil"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center text-white"
                        style={{ backgroundColor: color }}
                      >
                        <CategoryIcon className="w-10 h-10 opacity-90 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                          Sin foto
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay to Change or Inspect */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 text-white transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-amber-300" />
                      <span className="text-xs font-bold">Cambiar</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Subir foto de perfil"
                    />
                  </div>

                  {/* Hidden File Input for Avatar */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        processImageFiles(e.target.files, true);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>

                {/* Profile Controls & Explanation */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Foto de Perfil de la Entrada
                    </span>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl("")}
                        className="text-xs text-red-500 hover:underline font-medium"
                      >
                        Quitar foto
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Esta imagen se mostrará prominentemente en las tarjetas de la Biblia de Mundo, el mapa de relaciones, el inspector de escena y los diálogos del manuscrito.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)] font-bold text-xs sm:text-sm text-[var(--text-main)] shadow-2xs transition-colors"
                    >
                      <Upload className="w-4 h-4 text-[var(--accent)]" />
                      <span>Subir Foto de Perfil</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("whiteboard")}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)] font-medium text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                      <Layers className="w-4 h-4 text-[var(--accent)]" />
                      <span>Abrir Pizarra Visual ({whiteboard?.items?.length || gallery.length})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Picker */}
              <div>
                <label className="font-bold block mb-2 text-[var(--text-muted)] uppercase tracking-wider text-xs">
                  Categoría del Elemento
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const isSelected = category === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleCategoryChange(c.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] font-bold shadow-xs"
                            : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/40"
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1.5" />
                        <span className="text-xs leading-tight font-medium">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-xs text-[var(--text-main)] block mb-1.5">
                    Nombre / Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Valeria Vance, Ciudadela de Éter..."
                    className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] font-semibold text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-xs text-[var(--text-main)] block mb-1.5">
                    Subtítulo / Epíteto / Rol
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ej: Cartógrafa Proscrita, Reina del Norte..."
                    className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Color & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Color de Identificación</span>
                    </label>
                    <span className="font-mono text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                      {color}
                    </span>
                  </div>

                  {/* Preset Swatches Palette */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { name: "Carmesí", hex: "#dc2626" },
                      { name: "Granate", hex: "#991b1b" },
                      { name: "Terracota", hex: "#ea580c" },
                      { name: "Ámbar", hex: "#f59e0b" },
                      { name: "Oro Viejo", hex: "#b45309" },
                      { name: "Esmeralda", hex: "#10b981" },
                      { name: "Bosque", hex: "#047857" },
                      { name: "Cian", hex: "#06b6d4" },
                      { name: "Petróleo", hex: "#0f766e" },
                      { name: "Zafiro", hex: "#3b82f6" },
                      { name: "Azul Real", hex: "#2563eb" },
                      { name: "Marino", hex: "#1e3a8a" },
                      { name: "Índigo", hex: "#6366f1" },
                      { name: "Violeta", hex: "#8b5cf6" },
                      { name: "Púrpura", hex: "#9333ea" },
                      { name: "Fucsia", hex: "#ec4899" },
                      { name: "Rosa Antiguo", hex: "#be185d" },
                      { name: "Pizarra", hex: "#64748b" },
                      { name: "Grafito", hex: "#334155" },
                    ].map((c) => (
                      <button
                        type="button"
                        key={c.hex}
                        onClick={() => setColor(c.hex)}
                        title={`${c.name} (${c.hex})`}
                        className={`w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full transition-transform cursor-pointer relative ${
                          color.toLowerCase() === c.hex.toLowerCase()
                            ? "scale-125 ring-2 ring-offset-2 ring-[var(--accent)] shadow-sm z-10"
                            : "hover:scale-110 opacity-90 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}

                    {/* Custom Color Pipette button with color wheel background */}
                    <div className="relative inline-flex items-center">
                      <label
                        title="Seleccionar color personalizado en rueda"
                        className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center border border-black/20 shadow-xs relative"
                        style={{
                          background: "conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)",
                        }}
                      >
                        <input
                          type="color"
                          value={color.startsWith("#") && color.length === 7 ? color : "#3b82f6"}
                          onInput={(e) => handleEntityColorChange((e.target as HTMLInputElement).value, false)}
                          onChange={(e) => handleEntityColorChange((e.target as HTMLInputElement).value, true)}
                          className="opacity-0 w-0 h-0 absolute pointer-events-none"
                        />
                        <Pipette className="w-3 h-3 text-white drop-shadow-md pointer-events-none" />
                      </label>
                    </div>
                  </div>

                  {/* Custom Hex input with live indicator and direct picker */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <div
                      className="w-5 h-5 rounded-md border border-[var(--border-color)] shadow-2xs shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith("#") || val === "") {
                          setColor(val);
                        } else {
                          setColor("#" + val);
                        }
                      }}
                      placeholder="#3b82f6"
                      maxLength={9}
                      className="w-24 px-2 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                    />
                    <label className="text-[11px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-main)] flex items-center gap-1 font-medium">
                      <input
                        type="color"
                        value={color.startsWith("#") && color.length === 7 ? color : "#3b82f6"}
                        onInput={(e) => handleEntityColorChange((e.target as HTMLInputElement).value, false)}
                        onChange={(e) => handleEntityColorChange((e.target as HTMLInputElement).value, true)}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <span>Personalizado</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-xs text-[var(--text-main)] block mb-1.5">
                    Etiquetas (Tags)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Añadir etiqueta (Enter)..."
                      className="flex-1 p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs sm:text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center gap-1.5"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apodos / Nombres Alternativos y Contador de Menciones en el Manuscrito */}
              <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                    <span className="font-bold text-xs text-[var(--text-main)]">
                      Menciones en el Manuscrito y Apodos
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs">
                    <span>
                      {mentionStats.totalCount}{" "}
                      {mentionStats.totalCount === 1 ? "mención total" : "menciones totales"}
                    </span>
                    {mentionStats.scenes.length > 0 && (
                      <span className="opacity-80">
                        ({mentionStats.scenes.length}{" "}
                        {mentionStats.scenes.length === 1 ? "escena" : "escenas"})
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Registra apodos, apellidos, títulos o nombres en clave (ej: <em>«Val»</em>, <em>«Vance»</em>, <em>«La Cartógrafa»</em>). Se contabilizarán automáticamente tanto el nombre principal como todos los apodos en cada escena del manuscrito.
                </p>

                {/* Input for adding an alias */}
                <div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddAlias();
                        }
                      }}
                      placeholder="Añadir apodo o nombre alternativo (Enter)..."
                      className="flex-1 p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAlias}
                      disabled={!aliasInput.trim()}
                      className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
                    >
                      + Añadir Apodo
                    </button>
                  </div>

                  {/* Aliases chips with their individual count */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {/* Primary name badge */}
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center gap-1.5 text-[var(--text-main)] shadow-2xs">
                      <span className="font-semibold">{name || "Nombre principal"}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono font-bold"
                        title="Veces que aparece el nombre principal en el manuscrito"
                      >
                        {mentionStats.byTerm.find((t) => t.term === name.trim())?.count || 0}
                      </span>
                    </span>

                    {aliases.map((alias) => {
                      const termCount =
                        mentionStats.byTerm.find(
                          (t) => t.term.toLowerCase() === alias.toLowerCase().trim()
                        )?.count || 0;
                      return (
                        <span
                          key={alias}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center gap-1.5 border border-[var(--accent)]/30 shadow-2xs"
                        >
                          <span>{alias}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--accent-contrast)] font-mono font-bold"
                            title="Menciones de este apodo"
                          >
                            {termCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAlias(alias)}
                            className="hover:text-red-500 font-bold ml-0.5 text-xs leading-none"
                            title="Eliminar apodo"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Scenes Breakdown list */}
                {mentionStats.scenes.length > 0 && (
                  <div className="pt-2 border-t border-[var(--border-color)]/70">
                    <button
                      type="button"
                      onClick={() => setShowMentionBreakdown(!showMentionBreakdown)}
                      className="flex items-center justify-between w-full text-left text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] py-1"
                    >
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver desglose por escenas ({mentionStats.scenes.length})</span>
                      </span>
                      <span className="text-[10px] font-mono">
                        {showMentionBreakdown ? "Ocultar ▲" : "Mostrar ▼"}
                      </span>
                    </button>

                    {showMentionBreakdown && (
                      <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {mentionStats.scenes.map((s) => (
                          <div
                            key={s.sceneId}
                            className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between text-[11px] shadow-2xs"
                          >
                            <div className="overflow-hidden">
                              <span className="font-semibold text-[var(--text-main)] block truncate">
                                {s.sceneTitle}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)] truncate block">
                                {s.chapterTitle} • {s.actTitle}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--accent-subtle)] shrink-0 ml-2">
                              {s.count} {s.count === 1 ? "vez" : "veces"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div>
                <label className="font-bold text-xs text-[var(--text-main)] block mb-1.5">
                  Descripción Rápida / Resumen *
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Descripción general accesible para vista rápida en tarjetas y el manuscrito..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] leading-relaxed text-xs sm:text-sm"
                />
              </div>

              {/* SPECIALIZED PANEL FOR HISTORICAL EVENTS & CHRONOLOGY */}
              {category === "event" && (
                <div className="p-5 sm:p-6 rounded-2xl border-2 border-[var(--accent)]/40 bg-[var(--accent-subtle)]/20 space-y-5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)]/80 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] flex items-center justify-center shadow-xs">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-[var(--text-main)] font-novel-display">
                          Dimensiones del Evento: Lore, Cronología & Manuscrito
                        </h4>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Configura la época histórica, sincroniza con la línea de tiempo y vincula entidades
                        </p>
                      </div>
                    </div>
                    {existingTimelineEvent && onNavigateToTimeline && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToTimeline(existingTimelineEvent.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--accent)] hover:border-[var(--accent)] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all hover:bg-[var(--accent-subtle)]"
                      >
                        <span>Abrir en Línea de Tiempo</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Distinction: Historical Lore (Past) vs Active Novel Plot (Present) */}
                  <div className="space-y-2">
                    <label className="font-bold text-xs text-[var(--text-main)] block">
                      Dimensión Temporal del Acontecimiento *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsHistorical(true)}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isHistorical
                            ? "bg-[var(--bg-card)] border-[var(--accent)] ring-2 ring-[var(--accent)]/30 shadow-xs"
                            : "border-[var(--border-color)] bg-[var(--bg-input)]/60 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/40"
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                          <History className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                            <span>📜 Evento Histórico / Lore (Pasado)</span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                            Ocurrió antes del inicio de la novela (guerras antiguas, pactos de fundación, eras míticas).
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsHistorical(false)}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          !isHistorical
                            ? "bg-[var(--bg-card)] border-[var(--accent)] ring-2 ring-[var(--accent)]/30 shadow-xs"
                            : "border-[var(--border-color)] bg-[var(--bg-input)]/60 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/40"
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                            <span>📖 Hito de Trama Activa (Presente)</span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                            Forma parte de la cronología viva de los capítulos y actos del libro.
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Época / Año / Fecha */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-xs text-[var(--text-main)] block">
                        Época, Año o Fecha Histórica
                      </label>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {isHistorical ? "Ej: Año 312 de la Resonancia (Hace 40 años)" : "Ej: Día 1 - Noche de Tormenta"}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={dateOrEpoch}
                      onChange={(e) => setDateOrEpoch(e.target.value)}
                      placeholder={isHistorical ? "Año, era o datación mítica en el lore..." : "Momento en la cronología de la novela..."}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* Cross-linking entities: Characters, Factions, Locations, Items */}
                  <div className="space-y-3">
                    <label className="font-bold text-xs text-[var(--text-main)] block">
                      Entidades Vinculadas al Evento (Personajes, Facciones, Lugares y Reliquias)
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Personajes */}
                      <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>Personajes Involucrados</span>
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {involvedEntityIds.filter((id) => project.entities.some((e) => e.id === id && e.category === "character")).length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scroll">
                          {project.entities.filter((e) => e.category === "character").map((char) => {
                            const isSelected = involvedEntityIds.includes(char.id);
                            return (
                              <button
                                type="button"
                                key={char.id}
                                onClick={() => {
                                  setInvolvedEntityIds((prev) =>
                                    isSelected ? prev.filter((id) => id !== char.id) : [...prev, char.id]
                                  );
                                }}
                                className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] font-semibold"
                                    : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: char.color || "#3b82f6" }} />
                                <span className="truncate max-w-[120px]">{char.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Facciones */}
                      <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
                          <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Facciones / Bandos</span>
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {involvedEntityIds.filter((id) => project.entities.some((e) => e.id === id && e.category === "faction")).length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scroll">
                          {project.entities.filter((e) => e.category === "faction").map((fac) => {
                            const isSelected = involvedEntityIds.includes(fac.id);
                            return (
                              <button
                                type="button"
                                key={fac.id}
                                onClick={() => {
                                  setInvolvedEntityIds((prev) =>
                                    isSelected ? prev.filter((id) => id !== fac.id) : [...prev, fac.id]
                                  );
                                }}
                                className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                                    : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: fac.color || "#6366f1" }} />
                                <span className="truncate max-w-[120px]">{fac.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lugares */}
                      <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Lugar / Escenario</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scroll">
                          {project.entities.filter((e) => e.category === "location").map((loc) => {
                            const isSelected = involvedEntityIds.includes(loc.id);
                            return (
                              <button
                                type="button"
                                key={loc.id}
                                onClick={() => {
                                  setInvolvedEntityIds((prev) =>
                                    isSelected ? prev.filter((id) => id !== loc.id) : [...prev, loc.id]
                                  );
                                }}
                                className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                                    : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: loc.color || "#10b981" }} />
                                <span className="truncate max-w-[120px]">{loc.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Objetos & Reliquias */}
                      <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
                          <span className="flex items-center gap-1.5">
                            <Gem className="w-3.5 h-3.5 text-pink-500" />
                            <span>Objetos & Reliquias Asociadas</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scroll">
                          {project.entities.filter((e) => e.category === "item").map((item) => {
                            const isSelected = involvedEntityIds.includes(item.id);
                            return (
                              <button
                                type="button"
                                key={item.id}
                                onClick={() => {
                                  setInvolvedEntityIds((prev) =>
                                    isSelected ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                                  );
                                }}
                                className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-pink-600 text-white border-pink-600 font-semibold"
                                    : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color || "#ec4899" }} />
                                <span className="truncate max-w-[120px]">{item.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sincronización con Línea de Tiempo de Planeación */}
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={syncWithTimeline}
                          onChange={(e) => setSyncWithTimeline(e.target.checked)}
                          className="rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4 cursor-pointer"
                        />
                        <span className="font-bold text-xs text-[var(--text-main)]">
                          Sincronizar con la Línea de Tiempo Multitrama (Planeación)
                        </span>
                      </label>
                      {syncWithTimeline && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                          Activo
                        </span>
                      )}
                    </div>

                    {syncWithTimeline && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in">
                        <div>
                          <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                            Carril / Subtrama de la Línea de Tiempo
                          </label>
                          <select
                            value={timelineTrackId}
                            onChange={(e) => setTimelineTrackId(e.target.value)}
                            className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                          >
                            {project.timelineTracks.map((tr) => (
                              <option key={tr.id} value={tr.id}>
                                {tr.name} {tr.isMainPlot ? "(Trama Principal)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                            Importancia Narrativa
                          </label>
                          <select
                            value={timelineImportance}
                            onChange={(e) => setTimelineImportance(e.target.value as any)}
                            className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                          >
                            <option value="minor">Secundario</option>
                            <option value="key">Evento Clave</option>
                            <option value="turning_point">Punto de Giro</option>
                            <option value="climax">Clímax</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scenes where this event is recalled or revealed in the manuscript */}
                  {scenesWithThisEvent.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>Escenas del Manuscrito que revelan este suceso ({scenesWithThisEvent.length})</span>
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scroll">
                        {scenesWithThisEvent.map(({ scene: sc, chapterTitle, actTitle }) => (
                          <div
                            key={sc.id}
                            onClick={() => {
                              if (onNavigateToScene) {
                                onClose();
                                onNavigateToScene(sc.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between text-xs hover:border-[var(--accent)] cursor-pointer transition-colors"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-[var(--text-main)] block truncate">
                                {sc.title}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)] truncate block">
                                {chapterTitle} • {actTitle}
                              </span>
                            </div>
                            <span className="text-[11px] text-[var(--accent)] font-semibold flex items-center gap-1 shrink-0 ml-2">
                              <span>Ir a escena</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Attributes Grid with Fixed Inline Field Addition */}
              <div className="border rounded-2xl p-5 bg-[var(--bg-input)]/40 border-[var(--border-color)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)] block">
                      Ficha Detallada de Atributos & Rasgos
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Personaliza arquetipos, motivaciones, rasgos físicos o psicológicos
                    </span>
                  </div>
                  <button
                    type="button"
                    id="btn-add-custom-attribute"
                    onClick={() => setIsAddingField((v) => !v)}
                    className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent)]/30 hover:border-[var(--accent)] transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingField ? "Cerrar Formulario" : "Añadir Campo Personalizado"}</span>
                  </button>
                </div>

                {/* Inline Form to Add Custom Field */}
                {isAddingField && (
                  <div className="p-4 rounded-xl border-2 border-[var(--accent)]/60 bg-[var(--bg-card)] space-y-3.5 animate-in fade-in shadow-sm">
                    <div className="text-xs font-bold text-[var(--text-main)] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-[var(--accent)]" />
                        Nuevo Campo Personalizado
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-normal">
                        Presiona Enter para añadir rápidamente
                      </span>
                    </div>

                    {/* Quick Suggestions Chips */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--text-muted)] block">
                        Sugerencias rápidas (un clic):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(category === "character"
                          ? ["Ocupación", "Alineamiento", "Arma Principal", "Lealtad", "Habilidad / Poder", "Especie / Raza", "Debilidad", "Rasgo Físico"]
                          : category === "location"
                          ? ["Clima", "Gobernante", "Población", "Recurso Clave", "Peligro / Amenaza"]
                          : category === "faction"
                          ? ["Líder", "Sede", "Ideología", "Enemigos", "Influencia"]
                          : category === "item"
                          ? ["Portador Actual", "Origen", "Material", "Poder Oculto", "Maldición"]
                          : category === "event"
                          ? ["Época", "Bandos", "Consecuencias", "Tratado / Pacto", "Reliquia Perdida", "Mártir / Héroe"]
                          : ["Regla Fundamental", "Coste / Sacrificio", "Origen Mítico", "Alcance"]
                        ).map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              handleQuickAddSuggestedField(suggestion);
                              setNewFieldKey("");
                              setNewFieldValue("");
                              setIsAddingField(false);
                            }}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              attributes[suggestion] !== undefined
                                ? "opacity-50 line-through bg-black/5 dark:bg-white/5 border-transparent text-[var(--text-muted)]"
                                : "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30 hover:border-[var(--accent)] hover:font-bold"
                            }`}
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                          Nombre del Campo *
                        </label>
                        <input
                          type="text"
                          autoFocus
                          value={newFieldKey}
                          onChange={(e) => setNewFieldKey(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleConfirmAddCustomField();
                            }
                          }}
                          placeholder="Ej: Alineamiento moral, Ocupación, Arma..."
                          className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                          Valor Inicial (Opcional)
                        </label>
                        <input
                          type="text"
                          value={newFieldValue}
                          onChange={(e) => setNewFieldValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleConfirmAddCustomField();
                            }
                          }}
                          placeholder="Ej: Neutral bueno, Espada de Éter..."
                          className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-color)]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingField(false);
                          setNewFieldKey("");
                          setNewFieldValue("");
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        id="btn-confirm-add-attribute"
                        onClick={handleConfirmAddCustomField}
                        disabled={!newFieldKey.trim()}
                        className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-all shadow-xs cursor-pointer"
                      >
                        Añadir Campo
                      </button>
                    </div>
                  </div>
                )}

                {/* Attribute Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {Object.entries(attributes).map(([key, val]) => (
                    <div key={key} className="space-y-1.5 relative group">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[var(--text-main)]">{key}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(key)}
                          className="text-red-500 opacity-0 group-hover:opacity-100 hover:underline text-[11px] transition-opacity"
                        >
                          Quitar
                        </button>
                      </div>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleAttributeChange(key, e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs sm:text-sm focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Private Author Lore & Notes */}
              <div>
                <label className="font-bold text-xs text-[var(--text-main)] block mb-1.5">
                  Notas Secretas / Trasfondo Profundo (Lore)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Información adicional, revelaciones futuras, secretos inconfesables, árbol genealógico..."
                  rows={5}
                  className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] leading-relaxed text-xs sm:text-sm font-mono"
                />
              </div>

              {/* Footer Actions */}
          <div className="flex items-center justify-between border-t pt-5 border-[var(--border-color)]">
            {entity ? (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(`¿Eliminar definitivamente a "${entity.name}"?`)
                  ) {
                    onDelete(entity.id);
                  }
                }}
                className="px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs sm:text-sm font-semibold transition-colors"
              >
                Eliminar Entrada
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-xs sm:text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs sm:text-sm font-bold hover:opacity-90 shadow-xs transition-opacity"
              >
                {entity ? "Guardar Cambios" : "Crear Entrada"}
              </button>
            </div>
          </div>
        </form>
        )}

        {/* TAB 2: DEDICATED VISUAL WHITEBOARD FOR THIS ENTITY */}
        {activeTab === "whiteboard" && (
          <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
            <VisualBoardView
              entity={currentEntityForBoard}
              onUpdateEntity={handleUpdateEntityWhiteboard}
              onSetAvatar={(url) => setAvatarUrl(url)}
              currentAvatarUrl={avatarUrl}
              isEmbedded={true}
            />
            {/* Bottom bar for Whiteboard */}
            <div className="h-12 border-t px-6 flex items-center justify-between border-[var(--border-color)] bg-[var(--bg-surface)] shrink-0 z-20">
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">
                  Pizarra visual de {name || "este elemento"}.
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-5 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 shadow-2xs transition-opacity"
                >
                  Guardar Todo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for Observing Images Fullscreen */}
      {lightboxIndex !== null && (
        <ImageLightboxModal
          isOpen={lightboxIndex !== null}
          images={gallery}
          currentIndex={lightboxIndex}
          entityName={name || "Entrada"}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
          onSetAsAvatar={(url) => setAvatarUrl(url)}
          currentAvatarUrl={avatarUrl}
        />
      )}
    </div>
  );
};
