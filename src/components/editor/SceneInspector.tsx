import React, { useState } from "react";
import {
  Sparkles,
  User,
  MapPin,
  Target,
  FileText,
  Wand2,
  X,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Send,
  Loader2,
  BookOpen,
  Sliders,
  Check,
  Copy,
  ExternalLink,
  Clock,
  History,
  Shield,
  Gem,
  ChevronRight,
  Search,
} from "lucide-react";
import { NovelProject, Scene, WorldEntity } from "../../types";

interface SceneInspectorProps {
  scene: Scene;
  project: NovelProject;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onClose: () => void;
  onOpenEntityDossier: (entityId: string) => void;
  onCreateCharacter?: () => void;
  onOpenWordGoals?: () => void;
  onCreateEntity?: (category: "event" | "character" | "location" | "faction" | "item") => void;
  onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
}

export const SceneInspector: React.FC<SceneInspectorProps> = ({
  scene,
  project,
  onUpdateScene,
  onClose,
  onOpenEntityDossier,
  onCreateCharacter,
  onOpenWordGoals,
  onCreateEntity,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = useState<
    "synopsis" | "characters" | "lore" | "goals" | "ai"
  >("synopsis");

  // AI Assistant states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [customAiPrompt, setCustomAiPrompt] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedAiResult, setCopiedAiResult] = useState(false);
  const [isChangingLocation, setIsChangingLocation] = useState(false);

  const characterEntities = project.entities.filter((e) => e.category === "character");
  const locationEntities = project.entities.filter((e) => e.category === "location");
  const eventEntities = project.entities.filter((e) => e.category === "event");
  const timelineHistoricalEvents = project.timelineEvents.filter((e) => e.isHistorical);

  const povCharacter = project.entities.find((e) => e.id === scene.povCharacterId);
  const currentLocation = project.entities.find((e) => e.id === scene.locationId);

  // Helper to toggle historical event in this scene
  const toggleHistoricalEventInScene = (eventId: string) => {
    const current = scene.historicalEventIds || [];
    const exists = current.includes(eventId);
    const updated = exists
      ? current.filter((id) => id !== eventId)
      : [...current, eventId];
    onUpdateScene(scene.id, { historicalEventIds: updated });
  };

  const [loreSearch, setLoreSearch] = useState("");
  const [isCreatingHistoricalEvent, setIsCreatingHistoricalEvent] = useState(false);
  const [newLoreTitle, setNewLoreTitle] = useState("");
  const [newLoreEra, setNewLoreEra] = useState("");
  const [newLoreSummary, setNewLoreSummary] = useState("");
  const [newLoreConsequences, setNewLoreConsequences] = useState("");

  const handleCreateAndLinkHistoricalEvent = () => {
    if (!newLoreTitle.trim()) return;
    const newEntityId = `entity_hist_${Date.now()}`;
    const newTimelineEventId = `tevt_hist_${Date.now()}`;
    const cleanEra = newLoreEra.trim() || "Pasado remoto";
    const cleanSummary = newLoreSummary.trim();
    const cleanConsequences = newLoreConsequences.trim();

    if (onUpdateProject) {
      onUpdateProject((prev) => {
        const newEntity: WorldEntity = {
          id: newEntityId,
          category: "event",
          name: newLoreTitle.trim(),
          subtitle: `Evento Histórico (${cleanEra})`,
          summary: cleanSummary,
          notes: cleanConsequences ? `Repercusiones en la trama: ${cleanConsequences}` : "",
          color: "#f59e0b",
          tags: ["Lore", "Pasado", "Historia"],
          aliases: [],
          attributes: {
            "Época o Fecha": cleanEra,
            "Repercusiones": cleanConsequences,
            "Sincronizado con Línea Temporal": "Sí",
          },
          isHistorical: true,
          dateOrEpoch: cleanEra,
          timelineEventId: newTimelineEventId,
        };

        const targetTrack =
          prev.timelineTracks.find((t) => t.id.includes("lore") || t.name.toLowerCase().includes("lore")) ||
          prev.timelineTracks[0];

        const newTimelineEvent: any = {
          id: newTimelineEventId,
          trackId: targetTrack?.id || "track-lore",
          title: newLoreTitle.trim(),
          summary: cleanSummary,
          position: 0,
          characterIds: [],
          dateOrEpoch: cleanEra,
          importance: "key",
          isHistorical: true,
          entityId: newEntityId,
          consequences: cleanConsequences,
        };

        return {
          ...prev,
          entities: [...prev.entities, newEntity],
          timelineEvents: [...prev.timelineEvents, newTimelineEvent],
        };
      });
    }

    // Immediately link to current scene
    const currentLinked = scene.historicalEventIds || [];
    onUpdateScene(scene.id, {
      historicalEventIds: [...currentLinked, newEntityId],
    });

    setNewLoreTitle("");
    setNewLoreEra("");
    setNewLoreSummary("");
    setNewLoreConsequences("");
    setIsCreatingHistoricalEvent(false);
  };

  // Word metrics calculation
  const sceneWords = (scene.content || "").trim() ? (scene.content || "").trim().split(/\s+/).filter(Boolean).length : 0;
  const targetWords = scene.targetWordCount || project.settings.defaultSceneWordGoal || 1500;
  const percent = targetWords > 0 ? Math.min(100, Math.round((sceneWords / targetWords) * 100)) : 0;
  const enableGoals = project.settings.enableWordGoals !== false;

  const toggleCharacterInScene = (charId: string) => {
    const exists = scene.characterIds.includes(charId);
    const updated = exists
      ? scene.characterIds.filter((id) => id !== charId)
      : [...scene.characterIds, charId];
    onUpdateScene(scene.id, { characterIds: updated });
  };

  const handleAiAction = async (
    action:
      | "show-dont-tell"
      | "sensory-enrich"
      | "continue-scene"
      | "brainstorm-twists"
      | "critique-pacing"
      | "custom"
  ) => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setCopiedAiResult(false);

    const charNames = scene.characterIds
      .map((id) => project.entities.find((e) => e.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    // Extract lore context from linked historical events
    const loreContext = (scene.historicalEventIds || [])
      .map((id) => {
        const ent = project.entities.find((e) => e.id === id);
        if (ent) return `${ent.name} (${ent.dateOrEpoch || "Pasado"}): ${ent.summary || ent.notes}`;
        const tEvt = project.timelineEvents.find((e) => e.id === id);
        if (tEvt) return `${tEvt.title} (${tEvt.dateOrEpoch || "Pasado"}): ${tEvt.summary}`;
        return null;
      })
      .filter(Boolean)
      .join(" | ");

    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: scene.content || "Escena en desarrollo...",
          context: `Escena: ${scene.title}. Sinopsis: ${scene.synopsis}. Objetivo: ${scene.goal}. Conflicto: ${scene.conflict}.${loreContext ? ` Lore y Eventos Históricos Relevantes: ${loreContext}` : ""}`,
          customPrompt: customAiPrompt,
          pov: povCharacter ? povCharacter.name : "Tercera persona",
          characters: charNames || "Personajes principales",
          tone: project.genre || "Fantasía dramática",
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setAiResult(data.result);
      } else {
        setAiError(data.error || "No se pudo obtener respuesta del asistente");
      }
    } catch (err: any) {
      setAiError(err.message || "Error al conectar con el servidor");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiResultToScene = () => {
    if (!aiResult) return;
    const separator = scene.content ? "\n\n" : "";
    onUpdateScene(scene.id, {
      content: (scene.content || "") + separator + aiResult,
    });
    setAiResult(null);
  };

  const handleCopyAiResult = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopiedAiResult(true);
    setTimeout(() => setCopiedAiResult(false), 2000);
  };

  return (
    <aside
      id="scene-inspector"
      className="w-full sm:w-[360px] md:w-[400px] lg:w-[440px] xl:w-[480px] max-w-[90vw] border-l flex flex-col shrink-0 min-h-0 overflow-hidden transition-all select-none shadow-2xl"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-color)",
        color: "var(--text-main)",
      }}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b flex items-center justify-between border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
          <span className="p-1.5 sm:p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0">
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
          </span>
          <div className="overflow-hidden">
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate font-novel-display">
              {scene.title || "Inspector de Escena"}
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--text-muted)] truncate">
              Sinopsis, personajes, metas de palabras y asistente editorial
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shrink-0"
          title="Cerrar inspector"
        >
          <X className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-input)]/40 px-2 sm:px-3 pt-2 gap-1 shrink-0 overflow-x-auto scrollbar-none">
        {[
          { id: "synopsis", label: "Sinopsis", icon: FileText },
          { id: "characters", label: "Personajes", icon: User },
          {
            id: "lore",
            label: "Lore / Pasado",
            icon: History,
            badge: (scene.historicalEventIds?.length || 0) > 0 ? String(scene.historicalEventIds!.length) : undefined,
          },
          { id: "goals", label: "Metas", icon: Target },
          { id: "ai", label: "Musa IA", icon: Wand2, badge: "Próximamente" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 sm:py-3 px-1.5 sm:px-2 text-xs font-semibold flex items-center justify-center gap-1.5 rounded-t-xl border-b-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--bg-surface)] shadow-xs font-bold"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
              {tab.badge && (
                <span className="hidden xl:inline-block text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content body with responsive spacing */}
      <div
        id="scene-inspector-scroll-container"
        className="flex-1 min-h-0 overflow-y-scroll p-4 sm:p-6 space-y-5 sm:space-y-6 text-sm custom-scroll always-scroll select-text"
        style={{
          overflowY: "scroll",
          scrollbarGutter: "stable",
        }}
      >
        {/* Tab 1: Sinopsis & Notas */}
        {activeTab === "synopsis" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] block">
                Sinopsis de la Escena
              </label>
              <textarea
                value={scene.synopsis || ""}
                onChange={(e) => onUpdateScene(scene.id, { synopsis: e.target.value })}
                onWheel={(e) => {
                  const target = e.currentTarget;
                  const canScrollUp = target.scrollTop > 0;
                  const canScrollDown = target.scrollTop + target.clientHeight < target.scrollHeight - 1;
                  if ((e.deltaY < 0 && !canScrollUp) || (e.deltaY > 0 && !canScrollDown)) {
                    const scroller = document.getElementById("scene-inspector-scroll-container");
                    if (scroller) scroller.scrollTop += e.deltaY;
                  }
                }}
                placeholder="¿Qué ocurre en esta escena? (Resumen argumental para planeación, tarjetas de corcho y contexto)..."
                rows={5}
                className="w-full p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] leading-relaxed text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] block">
                Notas del Autor & Scratchpad
              </label>
              <textarea
                value={scene.notes || ""}
                onChange={(e) => onUpdateScene(scene.id, { notes: e.target.value })}
                onWheel={(e) => {
                  const target = e.currentTarget;
                  const canScrollUp = target.scrollTop > 0;
                  const canScrollDown = target.scrollTop + target.clientHeight < target.scrollHeight - 1;
                  if ((e.deltaY < 0 && !canScrollUp) || (e.deltaY > 0 && !canScrollDown)) {
                    const scroller = document.getElementById("scene-inspector-scroll-container");
                    if (scroller) scroller.scrollTop += e.deltaY;
                  }
                }}
                placeholder="Anotaciones personales, pistas sembradas, subtexto, correcciones pendientes o recordatorios..."
                rows={6}
                className="w-full p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] leading-relaxed font-mono text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] block">
                  Ubicación / Escenario
                </label>
                {currentLocation && (
                  <button
                    type="button"
                    onClick={() => setIsChangingLocation((prev) => !prev)}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    {isChangingLocation ? "Ocultar opciones" : "Cambiar ubicación"}
                  </button>
                )}
              </div>

              {/* Display Card when a Location is Assigned - matching the character section card styling */}
              {currentLocation ? (
                <div
                  className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3.5 shadow-sm hover:border-[var(--accent)]/50 transition-all overflow-hidden"
                  style={{
                    borderTop: `3.5px solid ${currentLocation.color || "#10b981"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {currentLocation.avatarUrl ? (
                        <img
                          src={currentLocation.avatarUrl}
                          alt={currentLocation.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                          style={{
                            border: `2.5px solid ${currentLocation.color || "#10b981"}`,
                            boxShadow: `0 0 0 2px ${(currentLocation.color || "#10b981")}25`,
                          }}
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
                          style={{
                            backgroundColor: currentLocation.color || "#10b981",
                            border: `2px solid ${currentLocation.color || "#10b981"}`,
                          }}
                        >
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm sm:text-base font-novel-display text-[var(--text-main)] truncate">
                          {currentLocation.name}
                        </h4>
                        {currentLocation.subtitle && (
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {currentLocation.subtitle}
                          </p>
                        )}
                        <span className="inline-block text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-md mt-0.5">
                          {currentLocation.attributes["Tipo"] || "Escenario del Codex"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEntityDossier(currentLocation.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] hover:opacity-85 flex items-center gap-1 cursor-pointer transition-opacity"
                        title="Abrir ficha y editar ubicación"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChangingLocation((prev) => !prev)}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                        title="Cambiar ubicación"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateScene(scene.id, { locationId: undefined })}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Quitar ubicación de esta escena"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {currentLocation.summary && (
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                      {currentLocation.summary}
                    </p>
                  )}

                  {/* Attributes: Atmósfera / Clima / Sensorial */}
                  <div className="space-y-2 pt-1">
                    {currentLocation.attributes["Atmósfera"] && (
                      <div className="text-xs text-[var(--text-main)] bg-[var(--bg-input)] p-2.5 rounded-xl border border-[var(--border-color)]">
                        <span className="font-bold text-[var(--accent)]">🌌 Atmósfera: </span>
                        <span>{currentLocation.attributes["Atmósfera"]}</span>
                      </div>
                    )}
                    {currentLocation.attributes["Clima"] && (
                      <div className="text-xs text-[var(--text-main)] bg-[var(--bg-input)] p-2.5 rounded-xl border border-[var(--border-color)]">
                        <span className="font-bold text-[var(--accent)]">🌤️ Clima: </span>
                        <span>{currentLocation.attributes["Clima"]}</span>
                      </div>
                    )}
                    {currentLocation.attributes["Sensorial"] && (
                      <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                        <span className="font-bold">🌿 Sensorial: </span>
                        <span>{currentLocation.attributes["Sensorial"]}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty state button to select location */
                <div
                  onClick={() => setIsChangingLocation((prev) => !prev)}
                  className="p-3.5 sm:p-4 rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent)] bg-[var(--bg-card)]/60 hover:bg-[var(--accent-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                      <MapPin className="w-5 h-5 opacity-60 text-[var(--accent)]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-main)]">
                        Asignar Ubicación / Escenario
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Selecciona un lugar del Codex donde transcurre esta escena
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] shrink-0">
                    + Asignar
                  </span>
                </div>
              )}

              {/* Location selection list of cards (shown when toggled or when no location assigned and expanding) */}
              {isChangingLocation && (
                <div className="space-y-2 p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] animate-in fade-in">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-[var(--text-main)]">
                      Seleccionar Ubicación del Codex
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsChangingLocation(false)}
                      className="p-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-input)]"
                    >
                      Cerrar
                    </button>
                  </div>

                  {locationEntities.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-color)] rounded-xl">
                      No hay ubicaciones registradas en la biblia de tu novela.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {locationEntities.map((loc) => {
                        const isSelected = scene.locationId === loc.id;
                        return (
                          <div
                            key={loc.id}
                            onClick={() => {
                              onUpdateScene(scene.id, {
                                locationId: isSelected ? undefined : loc.id,
                              });
                              setIsChangingLocation(false);
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--text-main)] font-semibold shadow-xs"
                                : "border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/40"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {loc.avatarUrl ? (
                                <img
                                  src={loc.avatarUrl}
                                  alt={loc.name}
                                  className="w-9 h-9 rounded-xl object-cover shrink-0"
                                  style={{
                                    border: `2px solid ${loc.color || "#10b981"}`,
                                    boxShadow: `0 0 0 2px ${(loc.color || "#10b981")}25`,
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-9 h-9 rounded-xl shadow-xs shrink-0 flex items-center justify-center text-white font-bold text-xs"
                                  style={{
                                    backgroundColor: loc.color || "#10b981",
                                    border: `2px solid ${loc.color || "#10b981"}`,
                                  }}
                                >
                                  <MapPin className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <div className="truncate">
                                <div className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">
                                  {loc.name}
                                </div>
                                <div className="text-[11px] text-[var(--text-muted)] truncate font-normal">
                                  {loc.subtitle ||
                                    loc.attributes["Tipo"] ||
                                    loc.summary ||
                                    "Ubicación del Codex"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenEntityDossier(loc.id);
                                }}
                                className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-[var(--accent)] transition-colors cursor-pointer"
                                title="Ver ficha completa de ubicación"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {isSelected ? (
                                <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-md border border-[var(--accent)]/30">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Asignada</span>
                                </div>
                              ) : (
                                <span className="text-[11px] font-medium text-[var(--text-muted)] px-2 py-0.5 rounded hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] transition-colors">
                                  Seleccionar
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Historical Events / Lore Section in Synopsis */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-500" />
                  <span>Lore & Eventos Históricos ({(scene.historicalEventIds || []).length})</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab("lore")}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Explorar Lore</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {(scene.historicalEventIds || []).length > 0 ? (
                <div className="space-y-2">
                  {(scene.historicalEventIds || []).map((id) => {
                    const ent = project.entities.find((e) => e.id === id);
                    const tEvt = project.timelineEvents.find((t) => t.id === id || (ent && t.entityId === ent.id));
                    const title = ent?.name || tEvt?.title || "Evento Histórico";
                    const era = ent?.dateOrEpoch || tEvt?.dateOrEpoch || "Pasado";
                    const summary = ent?.summary || tEvt?.summary || "";
                    return (
                      <div
                        key={id}
                        className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start justify-between gap-2.5"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[var(--text-main)] truncate">
                              {title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                              {era}
                            </span>
                          </div>
                          {summary && (
                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                              {summary}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {ent && (
                            <button
                              type="button"
                              onClick={() => onOpenEntityDossier(ent.id)}
                              className="p-1 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer transition-colors"
                              title="Ver ficha en el Códice"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleHistoricalEventInScene(id)}
                            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                            title="Desvincular de esta escena"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onClick={() => setActiveTab("lore")}
                  className="p-3.5 rounded-2xl border border-dashed border-[var(--border-color)] hover:border-amber-500/50 bg-[var(--bg-card)]/50 hover:bg-amber-500/5 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <History className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        Vincular Evento Histórico / Lore
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        Conecta antecedentes del Códice o Línea Temporal a este capítulo
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">
                    + Vincular
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Personajes & POV */}
        {activeTab === "characters" && (
          <div className="space-y-6 animate-in fade-in">
            {/* POV Selector */}
            <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[var(--accent)]" />
                <span>Punto de Vista Narrativo (POV)</span>
              </label>
              <select
                value={scene.povCharacterId || ""}
                onChange={(e) =>
                  onUpdateScene(scene.id, { povCharacterId: e.target.value || undefined })
                }
                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] text-xs sm:text-sm cursor-pointer"
              >
                <option value="">(Narrador omnisciente / No definido)</option>
                {characterEntities.map((char) => (
                  <option key={char.id} value={char.id}>
                    👤 {char.name} ({char.attributes["Rol"] || char.subtitle || "Personaje"})
                  </option>
                ))}
              </select>
            </div>

            {/* Prominent Create Character Action */}
            {onCreateCharacter && (
              <button
                type="button"
                onClick={onCreateCharacter}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent)] bg-[var(--bg-card)] hover:bg-[var(--accent-subtle)] text-[var(--text-main)] transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-contrast)] flex items-center justify-center transition-colors shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--text-main)] group-hover:text-[var(--accent)]">
                      Crear Nuevo Personaje
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Añade ficha completa con foto, psicología, arquetipo y secretos
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] opacity-90 group-hover:opacity-100 shrink-0">
                  + Nuevo
                </span>
              </button>
            )}

            {/* Character Selection Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Personajes en Escena ({scene.characterIds.length})
                </label>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Haz clic para alternar presencia
                </span>
              </div>

              {characterEntities.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-[var(--border-color)] text-center text-[var(--text-muted)] space-y-2">
                  <User className="w-8 h-8 mx-auto opacity-40 text-[var(--accent)]" />
                  <p className="text-xs">No hay personajes registrados en la biblia de tu novela.</p>
                  {onCreateCharacter && (
                    <button
                      type="button"
                      onClick={onCreateCharacter}
                      className="px-4 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold shadow-xs hover:opacity-90 cursor-pointer inline-block mt-1"
                    >
                      + Crear Primer Personaje
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {characterEntities.map((char) => {
                    const isPresent = scene.characterIds.includes(char.id);
                    return (
                      <div
                        key={char.id}
                        onClick={() => toggleCharacterInScene(char.id)}
                        className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                          isPresent
                            ? "bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--text-main)] font-semibold shadow-xs"
                            : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/40"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {char.avatarUrl ? (
                            <img
                              src={char.avatarUrl}
                              alt={char.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                              style={{
                                border: `2px solid ${char.color || "#3b82f6"}`,
                                boxShadow: `0 0 0 2px ${(char.color || "#3b82f6")}25`,
                              }}
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-xl shadow-xs shrink-0 flex items-center justify-center text-white font-bold text-sm"
                              style={{
                                backgroundColor: char.color || "#3b82f6",
                                border: `2px solid ${char.color || "#3b82f6"}`,
                              }}
                            >
                              {char.name.charAt(0)}
                            </div>
                          )}
                          <div className="truncate">
                            <div className="text-sm font-bold text-[var(--text-main)] truncate">
                              {char.name}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] truncate font-normal">
                              {char.attributes["Rol"] || char.subtitle || "Personaje de la obra"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEntityDossier(char.id);
                            }}
                            className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-[var(--accent)] transition-colors cursor-pointer"
                            title="Ver ficha completa de personaje"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isPresent ? (
                            <div className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-[var(--accent)]/30">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Presente</span>
                            </div>
                          ) : (
                            <div className="p-1 text-[var(--text-muted)] opacity-60 hover:opacity-100">
                              <Plus className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick dossiers of present characters with spacious layout */}
            {scene.characterIds.length > 0 && (
              <div className="border-t pt-5 border-[var(--border-color)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    Fichas Detalladas en Escena ({scene.characterIds.length})
                  </div>
                </div>

                <div className="space-y-4">
                  {scene.characterIds.map((cId) => {
                    const char = project.entities.find((e) => e.id === cId);
                    if (!char) return null;
                    return (
                      <div
                        key={cId}
                        className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3.5 shadow-sm hover:border-[var(--accent)]/50 transition-all overflow-hidden"
                        style={{
                          borderTop: `3.5px solid ${char.color || "#3b82f6"}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {char.avatarUrl ? (
                              <img
                                src={char.avatarUrl}
                                alt={char.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                                style={{
                                  border: `2.5px solid ${char.color || "#3b82f6"}`,
                                  boxShadow: `0 0 0 2px ${(char.color || "#3b82f6")}25`,
                                }}
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
                                style={{
                                  backgroundColor: char.color || "#3b82f6",
                                  border: `2px solid ${char.color || "#3b82f6"}`,
                                }}
                              >
                                {char.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-sm sm:text-base font-novel-display text-[var(--text-main)]">
                                {char.name}
                              </h4>
                              {char.subtitle && (
                                <p className="text-xs text-[var(--text-muted)]">
                                  {char.subtitle}
                                </p>
                              )}
                              {char.attributes["Rol"] && (
                                <span className="inline-block text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-md mt-0.5">
                                  {char.attributes["Rol"]}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenEntityDossier(char.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] hover:opacity-85 flex items-center gap-1 cursor-pointer transition-opacity"
                              title="Abrir ficha y editar personaje"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ficha</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleCharacterInScene(char.id)}
                              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Quitar de esta escena"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {char.summary && (
                          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                            {char.summary}
                          </p>
                        )}

                        {/* Badges / Motivation / Secret */}
                        <div className="space-y-2 pt-1">
                          {char.attributes["Motivación"] && (
                            <div className="text-xs text-[var(--text-main)] bg-[var(--bg-input)] p-2.5 rounded-xl border border-[var(--border-color)]">
                              <span className="font-bold text-[var(--accent)]">🎯 Motivación: </span>
                              <span>{char.attributes["Motivación"]}</span>
                            </div>
                          )}

                          {char.attributes["Secreto Inconfesable"] && (
                            <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                              <span className="font-bold">🔒 Secreto: </span>
                              <span>{char.attributes["Secreto Inconfesable"]}</span>
                            </div>
                          )}

                          {char.attributes["Rasgo Físico"] && (
                            <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-input)]/60 p-2 rounded-lg">
                              <span className="font-semibold text-[var(--text-main)]">👁️ Rasgo Físico: </span>
                              <span>{char.attributes["Rasgo Físico"]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Lore & Eventos Históricos */}
        {activeTab === "lore" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header / Intro banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Lore & Antecedentes Históricos
                </h4>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Vincula sucesos del pasado documentados en la Biblia (Códice) y la Línea Temporal. Servirán como cimientos narrativos y contexto directo para la Musa IA.
              </p>
            </div>

            {/* Section 1: Linked Events in Scene */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Eventos Vinculados a esta Escena ({(scene.historicalEventIds || []).length})
                </label>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Influencia directa en la trama actual
                </span>
              </div>

              {(scene.historicalEventIds || []).length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-[var(--border-color)] text-center text-[var(--text-muted)] space-y-2">
                  <History className="w-8 h-8 mx-auto opacity-40 text-amber-500" />
                  <p className="text-xs">No hay eventos históricos vinculados a este capítulo aún.</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Selecciona uno del catálogo inferior o crea uno nuevo para anclar esta escena en la historia del mundo.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(scene.historicalEventIds || []).map((id) => {
                    const ent = project.entities.find((e) => e.id === id);
                    const tEvt = project.timelineEvents.find((t) => t.id === id || (ent && t.entityId === ent.id));
                    const title = ent?.name || tEvt?.title || "Evento Histórico";
                    const era = ent?.dateOrEpoch || tEvt?.dateOrEpoch || "Pasado";
                    const summary = ent?.summary || tEvt?.summary || "";
                    const consequences =
                      tEvt?.consequences ||
                      ent?.attributes?.["Repercusiones"] ||
                      ent?.attributes?.["Consecuencias"] ||
                      "";
                    const characterIds = tEvt?.characterIds || [];
                    const factionIds = tEvt?.factionIds || [];

                    return (
                      <div
                        key={id}
                        className="p-4 rounded-2xl bg-[var(--bg-card)] border border-amber-500/30 shadow-xs space-y-3 relative overflow-hidden"
                        style={{ borderLeft: "4px solid #f59e0b" }}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm font-novel-display text-[var(--text-main)]">
                                {title}
                              </h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">
                                {era}
                              </span>
                            </div>
                            {ent?.subtitle && (
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                {ent.subtitle}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {ent && (
                              <button
                                type="button"
                                onClick={() => onOpenEntityDossier(ent.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 flex items-center gap-1 cursor-pointer transition-colors"
                                title="Abrir ficha completa en el Códice"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Biblia</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleHistoricalEventInScene(id)}
                              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Desvincular de esta escena"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {summary && (
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-input)]/40 p-2.5 rounded-xl border border-[var(--border-color)]">
                            {summary}
                          </p>
                        )}

                        {consequences && (
                          <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                            <span className="font-bold">⚡ Repercusión activa: </span>
                            <span>{consequences}</span>
                          </div>
                        )}

                        {/* Involved Characters / Factions chips */}
                        {(characterIds.length > 0 || factionIds.length > 0) && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase mr-1">
                              Involucrados:
                            </span>
                            {characterIds.map((cId) => {
                              const char = project.entities.find((e) => e.id === cId);
                              if (!char) return null;
                              return (
                                <button
                                  key={cId}
                                  type="button"
                                  onClick={() => onOpenEntityDossier(char.id)}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--accent)] flex items-center gap-1 cursor-pointer"
                                >
                                  <User className="w-2.5 h-2.5 text-[var(--accent)]" />
                                  <span>{char.name}</span>
                                </button>
                              );
                            })}
                            {factionIds.map((fId) => {
                              const fac = project.entities.find((e) => e.id === fId);
                              if (!fac) return null;
                              return (
                                <button
                                  key={fId}
                                  type="button"
                                  onClick={() => onOpenEntityDossier(fac.id)}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-main)] hover:border-amber-500 flex items-center gap-1 cursor-pointer"
                                >
                                  <Shield className="w-2.5 h-2.5 text-amber-500" />
                                  <span>{fac.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Create Historical Event Section */}
            <div className="space-y-3 border-t pt-5 border-[var(--border-color)]">
              {!isCreatingHistoricalEvent ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingHistoricalEvent(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-[var(--text-main)] transition-all flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        Crear Nuevo Evento Histórico
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Se registrará en la Biblia (Códice) y la Línea Temporal de forma sincronizada
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500 text-white opacity-90 group-hover:opacity-100 shrink-0">
                    + Nuevo Lore
                  </span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl border border-amber-500/40 bg-[var(--bg-card)] space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-500" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)]">
                        Nuevo Evento Histórico
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingHistoricalEvent(false)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                        Nombre del Evento *
                      </label>
                      <input
                        type="text"
                        value={newLoreTitle}
                        onChange={(e) => setNewLoreTitle(e.target.value)}
                        placeholder="Ej: La Rebelión del Valle de Plata..."
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                        Época o Fecha Histórica
                      </label>
                      <input
                        type="text"
                        value={newLoreEra}
                        onChange={(e) => setNewLoreEra(e.target.value)}
                        placeholder="Ej: 50 años antes de la caída del Imperio, Era Solar 112..."
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                        ¿Qué ocurrió en este suceso? (Resumen)
                      </label>
                      <textarea
                        value={newLoreSummary}
                        onChange={(e) => setNewLoreSummary(e.target.value)}
                        placeholder="Describe los hechos clave del acontecimiento..."
                        rows={2}
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                        Repercusión o Consecuencias en la actualidad
                      </label>
                      <input
                        type="text"
                        value={newLoreConsequences}
                        onChange={(e) => setNewLoreConsequences(e.target.value)}
                        placeholder="Ej: La magia prohibida en las cortes, rencor familiar ancestral..."
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingHistoricalEvent(false)}
                        className="px-3 py-1.5 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] cursor-pointer"
                      >
                        Descartar
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateAndLinkHistoricalEvent}
                        disabled={!newLoreTitle.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs transition-colors"
                      >
                        Crear y Vincular a Escena
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Catalog of available historical events */}
            <div className="space-y-3 border-t pt-5 border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Catálogo de Lore del Proyecto
                </label>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Haz clic para vincular o desvincular
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={loreSearch}
                  onChange={(e) => setLoreSearch(e.target.value)}
                  placeholder="Buscar eventos por nombre, época o detalles..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* List of all project historical events */}
              {(() => {
                // Collect unique event records from entities and timelineEvents
                const allAvailable = [
                  ...eventEntities.map((ent) => ({
                    id: ent.id,
                    name: ent.name,
                    era: ent.dateOrEpoch || ent.attributes?.["Época o Fecha"] || "Pasado",
                    summary: ent.summary || ent.notes,
                    color: ent.color || "#f59e0b",
                    entityId: ent.id,
                    isFromEntity: true,
                  })),
                  ...timelineHistoricalEvents
                    .filter((t) => !eventEntities.some((e) => e.id === t.entityId || e.timelineEventId === t.id))
                    .map((t) => ({
                      id: t.id,
                      name: t.title,
                      era: t.dateOrEpoch || "Pasado",
                      summary: t.summary,
                      color: "#f59e0b",
                      entityId: t.entityId,
                      isFromEntity: false,
                    })),
                ].filter((item) => {
                  if (!loreSearch.trim()) return true;
                  const q = loreSearch.toLowerCase();
                  return (
                    item.name.toLowerCase().includes(q) ||
                    item.era.toLowerCase().includes(q) ||
                    (item.summary && item.summary.toLowerCase().includes(q))
                  );
                });

                if (allAvailable.length === 0) {
                  return (
                    <div className="p-4 rounded-xl border border-dashed border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
                      {loreSearch ? "No se encontraron eventos coincidentes con la búsqueda." : "No hay eventos históricos registrados en el proyecto todavía."}
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {allAvailable.map((item) => {
                      const isLinked = (scene.historicalEventIds || []).includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isLinked
                              ? "bg-amber-500/10 border-amber-500/40 text-[var(--text-main)] shadow-xs"
                              : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-amber-500/30"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[var(--text-main)] truncate">
                                {item.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0 font-medium">
                                {item.era}
                              </span>
                            </div>
                            {item.summary && (
                              <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                                {item.summary}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.entityId && (
                              <button
                                type="button"
                                onClick={() => onOpenEntityDossier(item.entityId!)}
                                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-[var(--bg-input)] cursor-pointer"
                                title="Ver ficha en la Biblia"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleHistoricalEventInScene(item.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                                isLinked
                                  ? "bg-amber-500 text-white font-bold"
                                  : "border border-[var(--border-color)] hover:border-amber-500 text-[var(--text-main)] bg-[var(--bg-input)]"
                              }`}
                            >
                              {isLinked ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Vinculado</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>Vincular</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 3: Objetivos, Conflicto & Metas de Palabras */}
        {activeTab === "goals" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Word Goals Box for this Scene */}
            <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)]">
                      Meta de Palabras de la Escena
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {enableGoals
                        ? `${sceneWords.toLocaleString()} de ${targetWords.toLocaleString()} palabras escritas`
                        : "Metas de escritura actualmente desactivadas"}
                    </p>
                  </div>
                </div>

                {onOpenWordGoals && (
                  <button
                    type="button"
                    onClick={onOpenWordGoals}
                    className="p-1.5 rounded-lg text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors cursor-pointer"
                    title="Configurar metas globales, de arcos y capítulos"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                )}
              </div>

              {enableGoals ? (
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[var(--text-muted)]">{percent}% completado</span>
                      <span className="font-bold text-[var(--accent)]">
                        {sceneWords.toLocaleString()} / {targetWords.toLocaleString()} pal.
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[var(--bg-input)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] transition-all duration-300 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Input to modify this scene's word goal */}
                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                      Objetivo para esta Escena (Palabras)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="100"
                        min="100"
                        max="20000"
                        value={scene.targetWordCount || 1500}
                        onChange={(e) =>
                          onUpdateScene(scene.id, {
                            targetWordCount: parseInt(e.target.value, 10) || 1000,
                          })
                        }
                        className="flex-1 p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] font-mono text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
                      />
                      {[1000, 1500, 2000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => onUpdateScene(scene.id, { targetWordCount: val })}
                          className={`px-2.5 py-2 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                            (scene.targetWordCount || 1500) === val
                              ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] font-bold"
                              : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {onOpenWordGoals && (
                    <button
                      type="button"
                      onClick={onOpenWordGoals}
                      className="w-full py-2 px-3 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent)] bg-[var(--bg-input)]/50 hover:bg-[var(--accent-subtle)] text-xs text-[var(--accent)] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configurar Metas de Capítulos, Arcos y Novela</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-input)] p-3 rounded-xl leading-relaxed">
                    Las metas y métricas porcentuales están desactivadas para permitir un flujo de escritura libre sin presión.
                  </div>
                  {onOpenWordGoals && (
                    <button
                      type="button"
                      onClick={onOpenWordGoals}
                      className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold shadow-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Target className="w-4 h-4" />
                      <span>Habilitar o Configurar Metas de Escritura</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Dramatic Scene Questions */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] block">
                  Objetivo Activo del Protagonista
                </label>
                <textarea
                  value={scene.goal || ""}
                  onChange={(e) => onUpdateScene(scene.id, { goal: e.target.value })}
                  placeholder="¿Qué desea conseguir activamente el personaje principal aquí? (Meta visible y tangible)..."
                  rows={3}
                  className="w-full p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] text-xs sm:text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] block">
                  Conflicto u Obstáculo en Escena
                </label>
                <textarea
                  value={scene.conflict || ""}
                  onChange={(e) => onUpdateScene(scene.id, { conflict: e.target.value })}
                  placeholder="¿Qué o quién se opone, dificulta la consecución de la meta o eleva la tensión dramática?..."
                  rows={3}
                  className="w-full p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] text-xs sm:text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] block">
                  Desenlace / Cambio de Estado Dramático
                </label>
                <textarea
                  value={scene.outcome || ""}
                  onChange={(e) => onUpdateScene(scene.id, { outcome: e.target.value })}
                  placeholder="¿Cómo termina la escena? (Sí, pero... / No, y además...). ¿Qué cambió para el personaje?..."
                  rows={3}
                  className="w-full p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] text-xs sm:text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Musa IA (Asistente Literario - En desarrollo / Próximamente) */}
        {activeTab === "ai" && (
          <div className="space-y-5 animate-in fade-in">
            {/* Banner En Desarrollo / Próximamente */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[var(--text-main)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-novel-display">Musa IA Literaria</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  En desarrollo • Próximamente
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                Esta sección se encuentra temporalmente deshabilitada mientras trabajamos en una reimplementación más profunda, precisa e integrada con modelos literarios avanzados en futuras actualizaciones.
              </p>
            </div>

            {/* Próximas funciones en desarrollo (Roadmap Preview) */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block px-1">
                Funciones creativas en preparación
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60 select-none pointer-events-none">
                <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left shadow-2xs">
                  <div className="font-bold flex items-center gap-1.5 text-[var(--accent)] text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Mostrar, No Decir</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] block mt-1 leading-snug">
                    Transformación de pasajes expositivos en sensaciones vívidas y acción sensorial.
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left shadow-2xs">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Textura Sensorial</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] block mt-1 leading-snug">
                    Enriquecimiento atmosférico con luz, ecos, aromas y texturas ambientales.
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left shadow-2xs">
                  <div className="font-bold flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Voz y Ritmo Narrativo</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] block mt-1 leading-snug">
                    Continuación armónica preservando el tono, tensión y estilo del autor.
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left shadow-2xs">
                  <div className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Lluvia de Giros y Trabas</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] block mt-1 leading-snug">
                    Complicaciones argumentales imprevistas y dilemas morales para tus personajes.
                  </span>
                </div>
              </div>
            </div>

            {/* Disabled Prompt Box */}
            <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] opacity-60 space-y-2 select-none">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] block">
                Consulta a la Musa (Deshabilitada temporalmente)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled
                  placeholder="Módulo creativo en fase de optimización..."
                  className="flex-1 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed text-xs sm:text-sm"
                />
                <button
                  disabled
                  className="px-4 rounded-xl bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed flex items-center justify-center shrink-0 border border-[var(--border-color)]"
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note about active tools */}
            <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-xs text-[var(--text-muted)] leading-relaxed">
              💡 <span className="font-semibold text-[var(--text-main)]">Nota:</span> Todas las demás funciones de redacción del manuscrito, seguimiento de palabras, biblia de mundo, mapa de relaciones, sincronización en la nube y maquetador de exportación continúan 100% operativas.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
