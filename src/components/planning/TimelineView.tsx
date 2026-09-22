import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  User,
  MapPin,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Star,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  History,
  BookOpen,
  ExternalLink,
  Shield,
  Gem,
} from "lucide-react";
import {
  NovelProject,
  TimelineEvent,
  TimelineTrack,
  WorldEntity,
} from "../../types";

interface TimelineViewProps {
  project: NovelProject;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onSelectScene: (sceneId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  project,
  onUpdateProject,
  onSelectScene,
  onOpenEntityDossier,
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>("all");
  const [temporalFilter, setTemporalFilter] = useState<"all" | "present" | "lore">("all");
  const [isEditingEvent, setIsEditingEvent] = useState<TimelineEvent | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState<boolean>(false);
  const [newTrackModal, setNewTrackModal] = useState<boolean>(false);

  // Drag and drop state
  const [draggedEvtId, setDraggedEvtId] = useState<string | null>(null);
  const [dragOverEvtId, setDragOverEvtId] = useState<string | null>(null);

  // In-app Delete confirmation modal
  const [itemToDelete, setItemToDelete] = useState<{
    type: "event" | "track";
    id: string;
    title: string;
  } | null>(null);

  // Form states for new track
  const [newTrackName, setNewTrackName] = useState("");
  const [newTrackColor, setNewTrackColor] = useState("#3b82f6");
  const [newTrackDesc, setNewTrackDesc] = useState("");

  // Event form states (without percentage position)
  const [eventTitle, setEventTitle] = useState("");
  const [eventSummary, setEventSummary] = useState("");
  const [eventTrackId, setEventTrackId] = useState(
    project.timelineTracks[0]?.id || ""
  );
  const [eventImportance, setEventImportance] = useState<
    "minor" | "key" | "turning_point" | "climax"
  >("key");
  const [eventSceneId, setEventSceneId] = useState<string>("");
  const [eventDate, setEventDate] = useState("");
  const [eventCharIds, setEventCharIds] = useState<string[]>([]);
  const [eventLocationId, setEventLocationId] = useState<string>("");

  // Historical event & Bible integration fields
  const [isHistorical, setIsHistorical] = useState<boolean>(false);
  const [eventEntityId, setEventEntityId] = useState<string>("");
  const [eventFactionIds, setEventFactionIds] = useState<string[]>([]);
  const [eventItemIds, setEventItemIds] = useState<string[]>([]);
  const [eventConsequences, setEventConsequences] = useState<string>("");

  const allScenes = project.acts.flatMap((a) =>
    a.chapters.flatMap((c) => c.scenes)
  );

  const characterEntities = project.entities.filter((e) => e.category === "character");
  const locationEntities = project.entities.filter((e) => e.category === "location");
  const factionEntities = project.entities.filter((e) => e.category === "faction");
  const itemEntities = project.entities.filter((e) => e.category === "item");
  const eventEntities = project.entities.filter((e) => e.category === "event");

  const openAddEvent = (trackId?: string, forceHistorical?: boolean) => {
    setIsAddingEvent(true);
    setIsEditingEvent(null);
    setEventTitle("");
    setEventSummary("");
    const targetTrack =
      trackId ||
      (forceHistorical
        ? project.timelineTracks.find((t) => t.id.includes("lore") || t.name.toLowerCase().includes("lore"))?.id
        : undefined) ||
      project.timelineTracks[0]?.id ||
      "";
    setEventTrackId(targetTrack);
    setEventImportance("key");
    setEventSceneId("");
    setEventDate("");
    setEventCharIds([]);
    setEventLocationId("");
    setIsHistorical(!!forceHistorical);
    setEventEntityId("");
    setEventFactionIds([]);
    setEventItemIds([]);
    setEventConsequences("");
  };

  const openEditEvent = (evt: TimelineEvent) => {
    setIsEditingEvent(evt);
    setIsAddingEvent(false);
    setEventTitle(evt.title);
    setEventSummary(evt.summary);
    setEventTrackId(evt.trackId);
    setEventImportance(evt.importance);
    setEventSceneId(evt.sceneId || "");
    setEventDate(evt.dateOrEpoch || "");
    setEventCharIds(evt.characterIds || []);
    setEventLocationId(evt.locationId || "");
    setIsHistorical(!!evt.isHistorical);
    setEventEntityId(evt.entityId || "");
    setEventFactionIds(evt.factionIds || []);
    setEventItemIds(evt.itemIds || []);
    setEventConsequences(evt.consequences || "");
  };

  const saveEvent = () => {
    if (!eventTitle.trim()) return;

    if (isEditingEvent) {
      onUpdateProject((p) => {
        const updatedEvents = p.timelineEvents.map((evt) =>
          evt.id === isEditingEvent.id
            ? {
                ...evt,
                title: eventTitle.trim(),
                summary: eventSummary.trim(),
                trackId: eventTrackId,
                importance: eventImportance,
                sceneId: eventSceneId || undefined,
                dateOrEpoch: eventDate || undefined,
                characterIds: eventCharIds,
                locationId: eventLocationId || undefined,
                isHistorical: isHistorical,
                entityId: eventEntityId || undefined,
                factionIds: eventFactionIds.length > 0 ? eventFactionIds : undefined,
                itemIds: eventItemIds.length > 0 ? eventItemIds : undefined,
                consequences: eventConsequences.trim() || undefined,
                era: isHistorical ? (eventDate.trim() || "Historia Previa / Lore") : undefined,
              }
            : evt
        );

        // Keep WorldEntity in sync if linked
        const updatedEntities = p.entities.map((ent) => {
          if (eventEntityId && ent.id === eventEntityId) {
            return {
              ...ent,
              timelineEventId: isEditingEvent.id,
              isHistorical: isHistorical,
              dateOrEpoch: eventDate.trim() || ent.dateOrEpoch,
            };
          }
          if (ent.timelineEventId === isEditingEvent.id && ent.id !== eventEntityId) {
            return {
              ...ent,
              timelineEventId: undefined,
            };
          }
          return ent;
        });

        return {
          ...p,
          timelineEvents: updatedEvents,
          entities: updatedEntities,
        };
      });
    } else {
      const existingInTrack = project.timelineEvents.filter(
        (e) => e.trackId === eventTrackId
      ).length;

      const newId = `evt-${Date.now()}`;
      const newEvt: TimelineEvent = {
        id: newId,
        title: eventTitle.trim(),
        summary: eventSummary.trim(),
        trackId: eventTrackId,
        position: existingInTrack + 1,
        importance: eventImportance,
        sceneId: eventSceneId || undefined,
        dateOrEpoch: eventDate || undefined,
        characterIds: eventCharIds,
        locationId: eventLocationId || undefined,
        isHistorical: isHistorical,
        entityId: eventEntityId || undefined,
        factionIds: eventFactionIds.length > 0 ? eventFactionIds : undefined,
        itemIds: eventItemIds.length > 0 ? eventItemIds : undefined,
        consequences: eventConsequences.trim() || undefined,
        era: isHistorical ? (eventDate.trim() || "Historia Previa / Lore") : undefined,
      };

      onUpdateProject((p) => {
        const updatedEntities = p.entities.map((ent) => {
          if (eventEntityId && ent.id === eventEntityId) {
            return {
              ...ent,
              timelineEventId: newId,
              isHistorical: isHistorical,
              dateOrEpoch: eventDate.trim() || ent.dateOrEpoch,
            };
          }
          return ent;
        });

        return {
          ...p,
          timelineEvents: [...p.timelineEvents, newEvt],
          entities: updatedEntities,
        };
      });
    }

    setIsAddingEvent(false);
    setIsEditingEvent(null);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "event") {
      onUpdateProject((p) => ({
        ...p,
        timelineEvents: p.timelineEvents.filter((e) => e.id !== itemToDelete.id),
      }));
      setIsEditingEvent(null);
    } else {
      onUpdateProject((p) => ({
        ...p,
        timelineTracks: p.timelineTracks.filter((t) => t.id !== itemToDelete.id),
        timelineEvents: p.timelineEvents.filter((e) => e.trackId !== itemToDelete.id),
      }));
    }
    setItemToDelete(null);
  };

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, evtId: string) => {
    e.dataTransfer.setData("text/plain", evtId);
    setDraggedEvtId(evtId);
  };

  const handleDragOver = (e: React.DragEvent, targetEvtId: string) => {
    e.preventDefault();
    if (draggedEvtId && draggedEvtId !== targetEvtId) {
      setDragOverEvtId(targetEvtId);
    }
  };

  const handleDragLeave = (targetEvtId: string) => {
    if (dragOverEvtId === targetEvtId) {
      setDragOverEvtId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetEvtId: string, trackId: string) => {
    e.preventDefault();
    const sourceId = draggedEvtId || e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetEvtId) {
      setDraggedEvtId(null);
      setDragOverEvtId(null);
      return;
    }

    onUpdateProject((p) => {
      const trackEvents = p.timelineEvents
        .filter((ev) => ev.trackId === trackId)
        .sort((a, b) => a.position - b.position);

      const sourceIdx = trackEvents.findIndex((ev) => ev.id === sourceId);
      const targetIdx = trackEvents.findIndex((ev) => ev.id === targetEvtId);

      const updated = [...trackEvents];
      if (sourceIdx !== -1 && targetIdx !== -1) {
        const [moved] = updated.splice(sourceIdx, 1);
        updated.splice(targetIdx, 0, moved);
      } else if (sourceIdx === -1 && targetIdx !== -1) {
        const sourceEvt = p.timelineEvents.find((ev) => ev.id === sourceId);
        if (sourceEvt) {
          const moved = { ...sourceEvt, trackId };
          updated.splice(targetIdx, 0, moved);
        }
      }

      const orderMap = new Map<string, number>();
      updated.forEach((ev, idx) => {
        orderMap.set(ev.id, idx + 1);
      });

      return {
        ...p,
        timelineEvents: p.timelineEvents.map((ev) => {
          if (orderMap.has(ev.id)) {
            return {
              ...ev,
              trackId,
              position: orderMap.get(ev.id)!,
            };
          }
          return ev;
        }),
      };
    });

    setDraggedEvtId(null);
    setDragOverEvtId(null);
  };

  // Quick arrow reorder
  const handleMoveOrder = (evtId: string, trackId: string, direction: "left" | "right") => {
    onUpdateProject((p) => {
      const trackEvents = p.timelineEvents
        .filter((ev) => ev.trackId === trackId)
        .sort((a, b) => a.position - b.position);

      const idx = trackEvents.findIndex((ev) => ev.id === evtId);
      if (idx === -1) return p;
      const targetIdx = direction === "left" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= trackEvents.length) return p;

      const updated = [...trackEvents];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;

      const orderMap = new Map<string, number>();
      updated.forEach((ev, i) => {
        orderMap.set(ev.id, i + 1);
      });

      return {
        ...p,
        timelineEvents: p.timelineEvents.map((ev) => {
          if (orderMap.has(ev.id)) {
            return {
              ...ev,
              position: orderMap.get(ev.id)!,
            };
          }
          return ev;
        }),
      };
    });
  };

  const handleAddTrack = () => {
    if (!newTrackName.trim()) return;
    const newTrack: TimelineTrack = {
      id: `trk-${Date.now()}`,
      name: newTrackName.trim(),
      color: newTrackColor,
      description: newTrackDesc.trim(),
      isMainPlot: project.timelineTracks.length === 0,
    };
    onUpdateProject((p) => ({
      ...p,
      timelineTracks: [...p.timelineTracks, newTrack],
    }));
    setNewTrackName("");
    setNewTrackDesc("");
    setNewTrackModal(false);
  };

  const getImportanceBadge = (importance: TimelineEvent["importance"]) => {
    switch (importance) {
      case "climax":
        return {
          label: "Clímax",
          icon: Flame,
          color: "bg-red-500 text-white",
        };
      case "turning_point":
        return {
          label: "Punto de Giro",
          icon: Star,
          color: "bg-amber-500 text-white",
        };
      case "key":
        return {
          label: "Evento Clave",
          icon: Sparkles,
          color: "bg-blue-500 text-white",
        };
      case "minor":
      default:
        return {
          label: "Secundario",
          icon: Clock,
          color: "bg-gray-500 text-white",
        };
    }
  };

  const filteredTracks =
    selectedTrackId === "all"
      ? project.timelineTracks
      : project.timelineTracks.filter((t) => t.id === selectedTrackId);

  return (
    <div
      id="timeline-planning-view"
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Top Header & Subplot filter */}
      <div
        className="p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div>
          <h2 className="text-base font-bold font-novel-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--accent)]" />
            <span>Línea de Tiempo Multitrama & Cronología del Mundo</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Organiza visualmente eventos cronológicos, conecta el lore histórico de la Biblia con los hitos activos del manuscrito.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Temporal Filter: All vs Present Plot vs Lore */}
          <div className="flex items-center rounded-lg p-0.5 border border-[var(--border-color)] bg-[var(--bg-input)] text-xs">
            <button
              onClick={() => setTemporalFilter("all")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                temporalFilter === "all"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              Todos ({project.timelineEvents.length})
            </button>
            <button
              onClick={() => setTemporalFilter("present")}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                temporalFilter === "present"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Trama Activa ({project.timelineEvents.filter((e) => !e.isHistorical).length})</span>
            </button>
            <button
              onClick={() => setTemporalFilter("lore")}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                temporalFilter === "lore"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "text-amber-600 dark:text-amber-400 hover:text-amber-700"
              }`}
            >
              <History className="w-3 h-3" />
              <span>Lore / Pasado ({project.timelineEvents.filter((e) => e.isHistorical).length})</span>
            </button>
          </div>

          {/* Subplot filter */}
          <div className="flex items-center gap-1.5 text-xs bg-[var(--bg-input)] px-2.5 py-1.5 rounded-lg border border-[var(--border-color)]">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[var(--text-main)] font-medium cursor-pointer"
            >
              <option value="all">Ver Todas las Subtramas ({project.timelineTracks.length})</option>
              {project.timelineTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setNewTrackModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Nueva Subtrama</span>
          </button>

          <button
            onClick={() => openAddEvent(undefined, true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/25 transition-all shadow-xs cursor-pointer"
            title="Añadir evento histórico previo a la novela (Lore)"
          >
            <History className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>+ Evento Histórico</span>
          </button>

          <button
            onClick={() => openAddEvent(undefined, false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-contrast)]" />
            <span>+ Hito de Trama</span>
          </button>
        </div>
      </div>

      {/* Main Swimlanes Visual Canvas */}
      <div
        id="timeline-canvas-scroll"
        className="flex-1 min-h-0 overflow-y-scroll p-6 space-y-8 custom-scroll always-scroll"
        style={{
          overflowY: "scroll",
          scrollbarGutter: "stable",
        }}
      >
        {/* Narrative Flow Guide */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-[var(--text-muted)] border-b border-[var(--border-color)] pb-3 px-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-main)]">Guía Narrativa:</span>
            <span>📜 Pasado / Lore → Inicio / Planteamiento → Nudo & Tensión → Punto Medio → Clímax</span>
          </div>
          <div className="font-medium text-[var(--accent)] flex items-center gap-1">
            <GripVertical className="w-3.5 h-3.5" />
            <span>Arrastra cualquier evento para mover su orden cronológico</span>
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-8">
          {filteredTracks.map((track) => {
            const trackEvents = project.timelineEvents
              .filter((e) => e.trackId === track.id)
              .filter((e) => {
                if (temporalFilter === "present") return !e.isHistorical;
                if (temporalFilter === "lore") return !!e.isHistorical;
                return true;
              })
              .sort((a, b) => a.position - b.position);

            return (
              <div
                key={track.id}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-4 shadow-xs relative group"
              >
                {/* Track Title Banner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: track.color }}
                    />
                    <span className="font-bold text-sm font-novel-display text-[var(--text-main)]">
                      {track.name}
                    </span>
                    {track.isMainPlot && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent-subtle)] text-[var(--accent)] uppercase tracking-wider">
                        Trama Principal
                      </span>
                    )}
                    <span className="text-xs text-[var(--text-muted)]">
                      ({trackEvents.length} eventos)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openAddEvent(track.id)}
                      className="px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--accent)] text-xs flex items-center gap-1 cursor-pointer font-semibold"
                      title="Añadir evento a esta subtrama"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Evento</span>
                    </button>
                    {!track.isMainPlot && (
                      <button
                        onClick={() =>
                          setItemToDelete({
                            type: "track",
                            id: track.id,
                            title: track.name,
                          })
                        }
                        className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                        title="Eliminar Subtrama"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {track.description && (
                  <p className="text-xs text-[var(--text-muted)] italic pl-6">
                    {track.description}
                  </p>
                )}

                {/* Swimlane Track with continuous center line and generously spaced cards */}
                <div className="relative bg-[var(--bg-input)]/60 rounded-xl p-4 border border-[var(--border-color)] overflow-x-auto min-h-[220px]">
                  {/* Empty state for track */}
                  {trackEvents.length === 0 ? (
                    <div className="py-14 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] gap-2">
                      <span>No hay eventos en esta subtrama todavía.</span>
                      <button
                        onClick={() => openAddEvent(track.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Evento</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex items-center py-6 min-w-max px-6">
                      {/* CONTINUOUS CONNECTING LINE PASSING THROUGH THE VERTICAL CENTER OF ALL EVENT CARDS */}
                      <div
                        className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full pointer-events-none z-0 shadow-inner"
                        style={{
                          backgroundColor: track.color || "var(--accent)",
                          opacity: 0.55,
                        }}
                      />

                      {/* Event Cards with generous gap (gap-14) making the connecting line prominently visible */}
                      <div className="flex items-center gap-14 relative z-10">
                        {trackEvents.map((evt, idx) => {
                          const badge = getImportanceBadge(evt.importance);
                          const BadgeIcon = badge.icon;
                          const linkedScene = allScenes.find((s) => s.id === evt.sceneId);
                          const linkedEntity = project.entities.find(
                            (e) => e.id === evt.entityId || (e.category === "event" && e.timelineEventId === evt.id)
                          );
                          const isDragOver = dragOverEvtId === evt.id;

                          return (
                            <div
                              key={evt.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, evt.id)}
                              onDragOver={(e) => handleDragOver(e, evt.id)}
                              onDragLeave={() => handleDragLeave(evt.id)}
                              onDrop={(e) => handleDrop(e, evt.id, track.id)}
                              className={`relative w-76 shrink-0 rounded-xl border p-3.5 shadow-md transition-all select-none cursor-grab active:cursor-grabbing flex flex-col justify-between space-y-3 ${
                                evt.isHistorical
                                  ? "bg-[var(--bg-card)] border-amber-500/40 hover:border-amber-500 shadow-amber-500/5 ring-1 ring-amber-500/20"
                                  : "bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--accent)]"
                              } ${
                                isDragOver
                                  ? "border-[var(--accent)] ring-4 ring-[var(--accent)]/20 scale-105"
                                  : "hover:shadow-lg"
                              }`}
                            >
                              {/* Left connector node on the connecting line */}
                              <div
                                className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[var(--bg-card)] shadow-xs flex items-center justify-center z-20 pointer-events-none"
                                style={{ backgroundColor: track.color }}
                                title="Línea de tiempo continua"
                              />

                              {/* Right connector node on the connecting line */}
                              <div
                                className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[var(--bg-card)] shadow-xs flex items-center justify-center z-20 pointer-events-none"
                                style={{ backgroundColor: track.color }}
                                title="Línea de tiempo continua"
                              />

                              {/* Card Header: Order Badge, Drag Grip, Quick Move Arrows */}
                              <div className="flex items-center justify-between border-b border-[var(--border-color)]/60 pb-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <div
                                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] cursor-grab active:cursor-grabbing"
                                    title="Arrastra para reorganizar el orden"
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)]">
                                    #{idx + 1}
                                  </span>
                                  {evt.isHistorical ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/35">
                                      <History className="w-2.5 h-2.5" />
                                      <span>Lore / Pasado</span>
                                    </span>
                                  ) : (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${badge.color}`}
                                    >
                                      <BadgeIcon className="w-2.5 h-2.5" />
                                      <span>{badge.label}</span>
                                    </span>
                                  )}
                                </div>

                                {/* Quick left / right reorder buttons */}
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveOrder(evt.id, track.id, "left");
                                    }}
                                    disabled={idx === 0}
                                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-30 cursor-pointer"
                                    title="Mover evento hacia la izquierda"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveOrder(evt.id, track.id, "right");
                                    }}
                                    disabled={idx === trackEvents.length - 1}
                                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-30 cursor-pointer"
                                    title="Mover evento hacia la derecha"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Card Body: Click to edit */}
                              <div
                                onClick={() => openEditEvent(evt)}
                                className="space-y-1.5 cursor-pointer"
                              >
                                <h4 className="font-bold text-xs text-[var(--text-main)] hover:text-[var(--accent)] transition-colors line-clamp-2">
                                  {evt.title}
                                </h4>

                                {evt.summary && (
                                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                                    {evt.summary}
                                  </p>
                                )}

                                {/* Codex Bible Link if entity is associated */}
                                {linkedEntity && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onOpenEntityDossier) onOpenEntityDossier(linkedEntity.id);
                                    }}
                                    className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer bg-[var(--accent-subtle)] px-2 py-1 rounded-lg border border-[var(--accent)]/30 w-fit transition-all hover:border-[var(--accent)]"
                                    title="Abrir ficha completa en la Biblia de la Novela"
                                  >
                                    <BookOpen className="w-3 h-3 text-[var(--accent)] shrink-0" />
                                    <span className="truncate max-w-[190px]">Biblia: {linkedEntity.name}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                                  </div>
                                )}

                                {/* Consequences note */}
                                {evt.consequences && (
                                  <div className="text-[10px] text-[var(--text-muted)] italic line-clamp-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-lg border border-[var(--border-color)]/60 leading-relaxed">
                                    <span className="font-bold not-italic text-[var(--text-main)]">Impacto: </span>
                                    {evt.consequences}
                                  </div>
                                )}
                              </div>

                              {/* Card Footer */}
                              <div className="border-t border-[var(--border-color)]/60 pt-2 space-y-1.5 text-[10px] text-[var(--text-muted)]">
                                {evt.dateOrEpoch && (
                                  <div className="flex items-center gap-1 text-[var(--text-muted)] font-mono">
                                    <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                    <span className="truncate font-semibold">{evt.dateOrEpoch}</span>
                                  </div>
                                )}

                                {linkedScene && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectScene(linkedScene.id);
                                    }}
                                    className="flex items-center gap-1 text-[var(--accent)] font-semibold hover:underline cursor-pointer"
                                  >
                                    <ChevronRight className="w-3 h-3 shrink-0" />
                                    <span className="truncate">Escena: {linkedScene.title}</span>
                                  </div>
                                )}

                                {evt.characterIds && evt.characterIds.length > 0 && (
                                  <div className="flex items-center gap-1 pt-0.5">
                                    <User className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                    <span className="truncate">
                                      {evt.characterIds
                                        .map(
                                          (id) =>
                                            project.entities.find((e) => e.id === id)?.name
                                        )
                                        .filter(Boolean)
                                        .join(", ")}
                                    </span>
                                  </div>
                                )}

                                <div className="flex justify-end pt-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditEvent(evt);
                                    }}
                                    className="text-[10px] font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Editar</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit / Add Event Modal (without percentage slider) */}
      {(isAddingEvent || isEditingEvent) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-xl shadow-2xl border p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 border-[var(--border-color)]">
              <h3 className="font-bold text-sm font-novel-display flex items-center gap-2">
                {isHistorical ? (
                  <History className="w-4 h-4 text-amber-500" />
                ) : (
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                )}
                <span>
                  {isEditingEvent
                    ? isHistorical
                      ? "Editar Evento Histórico (Lore)"
                      : "Editar Evento de Trama"
                    : isHistorical
                    ? "Nuevo Evento Histórico (Lore)"
                    : "Nuevo Evento de Trama"}
                </span>
              </h3>
              <button
                onClick={() => {
                  setIsAddingEvent(false);
                  setIsEditingEvent(null);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Type Switcher: Plot vs Historical */}
              <div>
                <label className="font-bold block mb-1.5 text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                  Naturaleza del Evento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHistorical(false)}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      !isHistorical
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-main)] ring-1 ring-[var(--accent)]"
                        : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs">Hito de Trama Activa</div>
                      <div className="text-[10px] opacity-75">Ocurre durante la narración del libro</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHistorical(true)}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isHistorical
                        ? "border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500"
                        : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    }`}
                  >
                    <History className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs">Evento Histórico / Lore</div>
                      <div className="text-[10px] opacity-75">Pasado del mundo, guerras previas, mitos</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Título del Evento *</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder={isHistorical ? "Ej: La Gran Purga del Éter, El Asedio de las Tres Torres..." : "Ej: Emboscada en el muelle de carga..."}
                  className="w-full p-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Subtrama / Carril</label>
                  <select
                    value={eventTrackId}
                    onChange={(e) => setEventTrackId(e.target.value)}
                    className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    {project.timelineTracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Importancia Estructural</label>
                  <select
                    value={eventImportance}
                    onChange={(e) => setEventImportance(e.target.value as any)}
                    className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="minor">⚪ Secundario / Trasfondo</option>
                    <option value="key">🔵 Evento Clave</option>
                    <option value="turning_point">⭐ Punto de Giro</option>
                    <option value="climax">🔥 Clímax / Cataclismo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Resumen del Evento</label>
                <textarea
                  value={eventSummary}
                  onChange={(e) => setEventSummary(e.target.value)}
                  placeholder="¿Qué ocurre exactamente y cómo afecta a los personajes o al mundo?..."
                  rows={3}
                  className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Vincular a Escena del Manuscrito</label>
                  <select
                    value={eventSceneId}
                    onChange={(e) => setEventSceneId(e.target.value)}
                    className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="">(Ninguna escena vinculada)</option>
                    {allScenes.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Fecha / Época en el Mundo</label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder={isHistorical ? "Ej: Año 284 de la Segunda Era" : "Ej: Día 3 - Noche de Luna Roja"}
                    className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Codex Bible Link */}
              <div className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)]/50 space-y-2">
                <label className="font-bold flex items-center gap-1.5 text-xs text-[var(--text-main)]">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Vincular con Entrada de la Biblia (Códice)</span>
                </label>
                <select
                  value={eventEntityId}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    setEventEntityId(chosenId);
                    if (chosenId) {
                      const ent = project.entities.find((en) => en.id === chosenId);
                      if (ent) {
                        if (!eventTitle.trim()) setEventTitle(ent.name);
                        if (!eventSummary.trim() && (ent.summary || ent.notes)) setEventSummary(ent.summary || ent.notes);
                        if (ent.dateOrEpoch && !eventDate.trim()) setEventDate(ent.dateOrEpoch);
                        if (ent.category === "event") setIsHistorical(true);
                      }
                    }
                  }}
                  className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">(Sin vincular a la Biblia)</option>
                  <optgroup label="Eventos Históricos de la Biblia">
                    {eventEntities.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        📜 {ent.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Otras Entidades del Códice">
                    {project.entities
                      .filter((e) => e.category !== "event")
                      .map((ent) => (
                        <option key={ent.id} value={ent.id}>
                          {ent.name} ({ent.category})
                        </option>
                      ))}
                  </optgroup>
                </select>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Al vincular, podrás navegar directamente entre la línea de tiempo y el dossier del códice.
                </p>
              </div>

              {/* Consequences / Narrative impact */}
              <div>
                <label className="font-bold block mb-1">Impacto Narrativo / Consecuencias</label>
                <input
                  type="text"
                  value={eventConsequences}
                  onChange={(e) => setEventConsequences(e.target.value)}
                  placeholder="Ej: Destrucción del gremio, origen de la cicatriz de Aurelius..."
                  className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Personajes Involucrados */}
              <div>
                <label className="font-bold block mb-1">Personajes Involucrados</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 border border-[var(--border-color)] rounded-md bg-[var(--bg-input)]">
                  {characterEntities.map((char) => {
                    const isSelected = eventCharIds.includes(char.id);
                    return (
                      <button
                        type="button"
                        key={char.id}
                        onClick={() => {
                          setEventCharIds((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== char.id)
                              : [...prev, char.id]
                          );
                        }}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                            : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        }`}
                      >
                        {char.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Facciones & Items vinculados */}
              {(factionEntities.length > 0 || itemEntities.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {factionEntities.length > 0 && (
                    <div>
                      <label className="font-bold flex items-center gap-1 mb-1 text-[11px]">
                        <Shield className="w-3 h-3 text-[var(--accent)]" />
                        <span>Facciones Involucradas</span>
                      </label>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 border border-[var(--border-color)] rounded-md bg-[var(--bg-input)]">
                        {factionEntities.map((fac) => {
                          const isSelected = eventFactionIds.includes(fac.id);
                          return (
                            <button
                              type="button"
                              key={fac.id}
                              onClick={() => {
                                setEventFactionIds((prev) =>
                                  isSelected ? prev.filter((id) => id !== fac.id) : [...prev, fac.id]
                                );
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] font-semibold"
                                  : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]"
                              }`}
                            >
                              {fac.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {itemEntities.length > 0 && (
                    <div>
                      <label className="font-bold flex items-center gap-1 mb-1 text-[11px]">
                        <Gem className="w-3 h-3 text-[var(--accent)]" />
                        <span>Objetos / Reliquias</span>
                      </label>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 border border-[var(--border-color)] rounded-md bg-[var(--bg-input)]">
                        {itemEntities.map((it) => {
                          const isSelected = eventItemIds.includes(it.id);
                          return (
                            <button
                              type="button"
                              key={it.id}
                              onClick={() => {
                                setEventItemIds((prev) =>
                                  isSelected ? prev.filter((id) => id !== it.id) : [...prev, it.id]
                                );
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] font-semibold"
                                  : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]"
                              }`}
                            >
                              {it.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-3 border-[var(--border-color)]">
              {isEditingEvent ? (
                <button
                  type="button"
                  onClick={() => {
                    const id = isEditingEvent.id;
                    const title = isEditingEvent.title;
                    setIsEditingEvent(null);
                    setItemToDelete({ type: "event", id, title });
                  }}
                  className="px-3 py-1.5 rounded-md text-red-600 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
                >
                  Eliminar Evento
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingEvent(false);
                    setIsEditingEvent(null);
                  }}
                  className="px-4 py-2 rounded-md border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveEvent}
                  className="px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {isEditingEvent ? "Guardar Cambios" : "Crear Evento"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Subplot / Track Modal */}
      {newTrackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div
            className="w-full max-w-md rounded-xl shadow-2xl border p-5 space-y-4"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-2 border-[var(--border-color)]">
              <h3 className="font-bold text-sm font-novel-display">
                Nueva Subtrama / Hilo Argumental
              </h3>
              <button
                onClick={() => setNewTrackModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nombre de la Subtrama *</label>
                <input
                  type="text"
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  placeholder="Ej: Romance Prohibido, El Traidor en el Consejo..."
                  className="w-full p-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Color Identificativo</label>
                <div className="flex gap-2 items-center">
                  {[
                    "#3b82f6",
                    "#ec4899",
                    "#8b5cf6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#06b6d4",
                    "#64748b",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTrackColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        newTrackColor === color ? "scale-125 ring-2 ring-white" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Descripción / Objetivo Narrativo</label>
                <textarea
                  value={newTrackDesc}
                  onChange={(e) => setNewTrackDesc(e.target.value)}
                  placeholder="¿Cuál es la tensión principal y la resolución esperada de este arco?..."
                  rows={3}
                  className="w-full p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3 border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setNewTrackModal(false)}
                className="px-4 py-2 rounded-md border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddTrack}
                className="px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Crear Subtrama
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-xl shadow-2xl border p-5 space-y-4"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
          >
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <Trash2 className="w-5 h-5" />
              <span>
                {itemToDelete.type === "event" ? "Eliminar Evento" : "Eliminar Subtrama"}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {itemToDelete.type === "event"
                ? `¿Estás seguro de que deseas eliminar el evento "${itemToDelete.title}" de la línea de tiempo?`
                : `¿Estás seguro de que deseas eliminar la subtrama "${itemToDelete.title}" y todos sus eventos asociados?`}
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-xs cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
