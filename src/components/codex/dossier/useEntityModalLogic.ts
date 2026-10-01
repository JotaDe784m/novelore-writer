import React, { useState, useRef, useMemo } from "react";
import {
  EntityCategory,
  EntityImage,
  MoodboardCanvas,
  NovelProject,
  Scene,
  TimelineEvent,
  WorldEntity,
} from "../../../types";
import { saveLocalImage, deleteLocalImage } from "../../../utils/imageUtils";
import { calculateEntityMentions, getAllManuscriptScenes } from "../../../utils/mentionCounter";
import { getDefaultAttributes, getDefaultCategoryColor } from "../../../utils/codexDefaults";
import { DossierTab, MentionStats } from "./dossierTypes";

interface UseEntityModalLogicProps {
  entity: WorldEntity | null;
  project: NovelProject;
  onSave: (entity: WorldEntity, syncedTimelineEvent?: Partial<TimelineEvent> | null) => void;
  initialTab?: "details" | "whiteboard" | DossierTab;
  initialCategory?: EntityCategory;
}

export function useEntityModalLogic({
  entity,
  project,
  onSave,
  initialTab = "identity",
  initialCategory,
}: UseEntityModalLogicProps) {
  const normalizedTab: DossierTab = initialTab === "details" ? "identity" : (initialTab as DossierTab);
  const [activeTab, setActiveTab] = useState<DossierTab>(normalizedTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [whiteboard, setWhiteboard] = useState<MoodboardCanvas | undefined>(entity?.whiteboard);
  const [category, setCategory] = useState<EntityCategory>(entity?.category || initialCategory || "character");
  const [name, setName] = useState(entity?.name || "");
  const [subtitle, setSubtitle] = useState(entity?.subtitle || "");
  const [summary, setSummary] = useState(entity?.summary || "");
  const [notes, setNotes] = useState(entity?.notes || "");
  const [color, setColor] = useState(entity?.color || getDefaultCategoryColor(initialCategory || "character"));

  const rafColorRef = useRef<number | null>(null);
  const lastColorTimeRef = useRef<number>(0);
  const handleColorChange = (newColor: string, immediate = false) => {
    if (rafColorRef.current) cancelAnimationFrame(rafColorRef.current);
    if (immediate) return setColor(newColor);
    const now = performance.now();
    if (now - lastColorTimeRef.current >= 50) {
      lastColorTimeRef.current = now;
      rafColorRef.current = requestAnimationFrame(() => setColor(newColor));
    }
  };

  const [tags, setTags] = useState<string[]>(entity?.tags || []);
  const [aliases, setAliases] = useState<string[]>(entity?.aliases || []);
  const [avatarUrl, setAvatarUrl] = useState<string>(entity?.avatarUrl || "");
  const [gallery, setGallery] = useState<EntityImage[]>(entity?.gallery || []);
  const [attributes, setAttributes] = useState<Record<string, string>>(
    entity?.attributes || getDefaultAttributes(entity?.category || initialCategory || "character")
  );
  const [isHistorical, setIsHistorical] = useState(entity?.isHistorical ?? (entity?.category === "event" || category === "event"));
  const [dateOrEpoch, setDateOrEpoch] = useState(entity?.dateOrEpoch || entity?.attributes?.["Época"] || "");
  const [involvedEntityIds, setInvolvedEntityIds] = useState<string[]>(entity?.involvedEntityIds || []);

  const existingTimelineEvent = useMemo(() => {
    if (!entity) return null;
    return project.timelineEvents?.find((ev) => ev.entityId === entity.id || ev.id === entity.timelineEventId) || null;
  }, [entity, project.timelineEvents]);

  const [syncWithTimeline, setSyncWithTimeline] = useState(!!existingTimelineEvent || !!entity?.timelineEventId);
  const [timelineTrackId, setTimelineTrackId] = useState(
    existingTimelineEvent?.trackId ||
      project.timelineTracks.find((t) => t.id.includes("lore") || t.name.toLowerCase().includes("lore"))?.id ||
      project.timelineTracks[0]?.id || "trk-main"
  );
  const [timelineImportance, setTimelineImportance] = useState<"minor" | "key" | "turning_point" | "climax">(
    existingTimelineEvent?.importance || "key"
  );

  const scenesWithThisEvent = useMemo(() => {
    if (!entity || category !== "event") return [];
    const res: { scene: Scene; chapterTitle: string; actTitle: string }[] = [];
    project.acts?.forEach((act) => act.chapters?.forEach((chap) => chap.scenes?.forEach((sc) => {
      if (sc.historicalEventIds?.includes(entity.id) || sc.timelineEventId === entity.timelineEventId) {
        res.push({ scene: sc, chapterTitle: chap.title || "Capítulo", actTitle: act.title || "Acto" });
      }
    })));
    return res;
  }, [entity, category, project.acts]);

  const allScenes = useMemo(() => getAllManuscriptScenes(project), [project]);
  const mentionStats: MentionStats = useMemo(() => {
    const tempEntity: WorldEntity = {
      id: entity?.id || "temp", name, aliases, category, summary, tags, attributes, notes,
    };
    const res = calculateEntityMentions(tempEntity, allScenes);
    return {
      totalCount: res.totalCount,
      byTerm: res.byTerm,
      scenes: res.scenes.map((s) => ({
        sceneId: s.sceneId, sceneTitle: s.sceneTitle, chapterTitle: s.chapterTitle, actTitle: s.actTitle, count: s.count,
      })),
    };
  }, [entity?.id, name, aliases, category, summary, tags, attributes, notes, allScenes]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const processImageFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const res = await saveLocalImage(file, "gallery", {
        fileName: `avatar_${name ? name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "ent"}`,
      });
      if (res.success && res.relativePath) {
        setAvatarUrl(res.relativePath);
      }
    } catch (err) {
      console.error("Error al procesar avatar de entidad:", err);
    }
  };

  const handleAddGalleryImages = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    for (const f of fileArray) {
      if (!f.type.startsWith("image/")) continue;
      try {
        const res = await saveLocalImage(f, "gallery", {
          fileName: `gal_${name ? name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "item"}`,
        });
        if (res.success && res.relativePath) {
          const newImg: EntityImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            url: res.relativePath,
            caption: f.name.replace(/\.[^/.]+$/, ""),
            createdAt: new Date().toISOString(),
          };
          setGallery((prev) => [...prev, newImg]);
          setAvatarUrl((cur) => cur || res.relativePath);
        }
      } catch (err) {
        console.error("Error al añadir imagen a galería:", err);
      }
    }
  };

  const handleRemoveGalleryImage = async (id: string, url: string) => {
    setGallery((prev) => prev.filter((img) => img.id !== id));
    if (avatarUrl === url) {
      const remaining = gallery.filter((img) => img.id !== id);
      setAvatarUrl(remaining.length > 0 ? remaining[0].url : "");
    }
    await deleteLocalImage(url);
  };

  const handleUpdateGalleryCaption = (id: string, caption: string) => {
    setGallery((prev) => prev.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  const handleSetAvatarFromGallery = (url: string) => {
    setAvatarUrl(url);
  };

  const handleCategoryChange = (newCat: EntityCategory) => {
    setCategory(newCat);
    if (!entity) {
      setAttributes(getDefaultAttributes(newCat));
      setColor(getDefaultCategoryColor(newCat));
    }
  };

  const handleAddTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !tags.includes(clean)) setTags([...tags, clean]);
  };
  const handleRemoveTag = (tag: string) => setTags(tags.filter((t) => t !== tag));
  const handleAddAlias = (alias: string) => {
    const clean = alias.trim();
    if (clean && !aliases.includes(clean)) setAliases([...aliases, clean]);
  };
  const handleRemoveAlias = (alias: string) => setAliases(aliases.filter((a) => a !== alias));
  const handleAttributeChange = (k: string, v: string) => setAttributes((prev) => ({ ...prev, [k]: v }));
  const handleRemoveAttribute = (k: string) => setAttributes((prev) => {
    const copy = { ...prev };
    delete copy[k];
    return copy;
  });
  const handleAddAttribute = (k: string, v = "") => {
    const clean = k.trim();
    if (clean) setAttributes((prev) => ({ ...prev, [clean]: v }));
  };
  const handleToggleInvolvedEntity = (id: string) => setInvolvedEntityIds((prev) =>
    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    const targetId = entity ? entity.id : `ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const targetTimelineEventId =
      existingTimelineEvent?.id || entity?.timelineEventId ||
      (category === "event" && syncWithTimeline ? `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` : undefined);

    const updatedEntity: WorldEntity = {
      id: targetId, category, name: name.trim(), subtitle: subtitle.trim() || undefined,
      summary: summary.trim(), tags, aliases, attributes, notes: notes.trim(),
      avatarUrl: avatarUrl || undefined, gallery, color, whiteboard,
      timelineEventId: targetTimelineEventId,
      dateOrEpoch: category === "event" ? dateOrEpoch.trim() || undefined : undefined,
      isHistorical: category === "event" ? isHistorical : undefined,
      involvedEntityIds: category === "event" && involvedEntityIds.length > 0 ? involvedEntityIds : undefined,
    };

    let syncedEvt: Partial<TimelineEvent> | null = null;
    if (category === "event" && syncWithTimeline && targetTimelineEventId) {
      syncedEvt = {
        id: targetTimelineEventId, trackId: timelineTrackId, title: updatedEntity.name,
        summary: updatedEntity.summary, position: existingTimelineEvent?.position ?? (isHistorical ? 5 : 50),
        importance: timelineImportance, dateOrEpoch: dateOrEpoch.trim() || undefined,
        era: isHistorical ? dateOrEpoch.trim() || "Historia Previa / Lore" : undefined,
        entityId: updatedEntity.id, isHistorical, consequences: attributes["Consecuencias"] || undefined,
      };
    } else if (category === "event" && !syncWithTimeline && existingTimelineEvent) {
      syncedEvt = null;
    }
    onSave(updatedEntity, syncedEvt);
  };

  return {
    activeTab, setActiveTab, isFullscreen, setIsFullscreen, category, handleCategoryChange,
    name, setName, subtitle, setSubtitle, summary, setSummary, notes, setNotes,
    color, handleColorChange, tags, handleAddTag, handleRemoveTag, aliases, handleAddAlias, handleRemoveAlias,
    attributes, handleAttributeChange, handleRemoveAttribute, handleAddAttribute, avatarUrl, setAvatarUrl,
    gallery, setGallery, whiteboard, setWhiteboard, fileInputRef, processImageFiles,
    handleAddGalleryImages, handleRemoveGalleryImage, handleUpdateGalleryCaption, handleSetAvatarFromGallery,
    isHistorical, setIsHistorical, dateOrEpoch, setDateOrEpoch, involvedEntityIds, handleToggleInvolvedEntity,
    syncWithTimeline, setSyncWithTimeline, timelineTrackId, setTimelineTrackId, timelineImportance, setTimelineImportance,
    existingTimelineEvent, scenesWithThisEvent, mentionStats, handleSubmit,
  };
}
