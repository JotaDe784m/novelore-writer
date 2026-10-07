import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  AvatarCropData, EntityCategory, EntityImage, MoodboardCanvas, NoteCardLayout,
  NovelProject, Scene, TimelineEvent, WorldEntity,
} from "../../../types";
import { saveLocalImage, deleteLocalImage } from "../../../utils/imageUtils";
import { calculateEntityDetailedMentions } from "../../../utils/mentionHierarchy";
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
  entity, project, onSave, initialTab = "identity", initialCategory,
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
  const [color, setColor] = useState(entity?.color || getDefaultCategoryColor(entity?.category || initialCategory || "character"));
  const handleColorChange = (c: string) => setColor(c);
  const [tags, setTags] = useState<string[]>(entity?.tags || []);
  const [aliases, setAliases] = useState<string[]>(entity?.aliases || []);
  const [avatarUrl, setAvatarUrl] = useState<string>(entity?.avatarUrl || "");
  const [avatarOriginalUrl, setAvatarOriginalUrl] = useState<string>(entity?.avatarOriginalUrl || entity?.avatarUrl || "");
  const [avatarCrop, setAvatarCrop] = useState<AvatarCropData | undefined>(entity?.avatarCrop);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState<string>("");
  const [gallery, setGallery] = useState<EntityImage[]>(entity?.gallery || []);
  const [attributes, setAttributes] = useState<Record<string, string>>(entity?.attributes ? { ...entity.attributes } : {});
  const [attributeLayouts, setAttributeLayouts] = useState<Record<string, NoteCardLayout>>(entity?.attributeLayouts || {});
  const [pinnedAttributes, setPinnedAttributes] = useState<string[]>(entity?.pinnedAttributes || []);
  const [wideAttributes, setWideAttributes] = useState<string[]>(entity?.wideAttributes || []);
  const [isHistorical, setIsHistorical] = useState(entity?.isHistorical ?? (entity?.category === "event" || category === "event"));
  const [dateOrEpoch, setDateOrEpoch] = useState(entity?.dateOrEpoch || entity?.attributes?.["Época"] || "");
  const [involvedEntityIds, setInvolvedEntityIds] = useState<string[]>(entity?.involvedEntityIds || []);

  // Control transaccional de imágenes para evitar huérfanos o enlaces rotos
  const stagedNewAssetsRef = useRef<string[]>([]);
  const stagedDeletedAssetsRef = useRef<string[]>([]);
  const isCommittedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCommittedRef.current) {
        stagedNewAssetsRef.current.forEach((path) => deleteLocalImage(path).catch(() => {}));
      }
    };
  }, []);

  const existingTimelineEvent = useMemo(() => {
    if (!entity) return null;
    return project.timelineEvents?.find((ev) => ev.entityId === entity.id || ev.id === entity.timelineEventId) || null;
  }, [entity, project.timelineEvents]);

  const [syncWithTimeline, setSyncWithTimeline] = useState(!!existingTimelineEvent || !!entity?.timelineEventId);
  const [timelineTrackId, setTimelineTrackId] = useState(existingTimelineEvent?.trackId || project.timelineTracks.find((t) => t.id.includes("lore") || t.name.toLowerCase().includes("lore"))?.id || project.timelineTracks[0]?.id || "trk-main");
  const [timelineImportance, setTimelineImportance] = useState<"minor" | "key" | "turning_point" | "climax">(existingTimelineEvent?.importance || "key");

  const scenesWithThisEvent = useMemo(() => {
    if (!entity || category !== "event") return [];
    const res: { scene: Scene; chapterTitle: string; actTitle: string }[] = [];
    project.acts?.forEach((a) => a.chapters?.forEach((c) => c.scenes?.forEach((sc) => {
      if (sc.historicalEventIds?.includes(entity.id) || sc.timelineEventId === entity.timelineEventId) {
        res.push({ scene: sc, chapterTitle: c.title || "Capítulo", actTitle: a.title || "Acto" });
      }
    })));
    return res;
  }, [entity, category, project.acts]);

  const detailedMentions = useMemo(() => calculateEntityDetailedMentions({
    id: entity?.id || "temp", name, aliases, category, summary, tags, attributes, notes,
  }, project), [entity?.id, name, aliases, category, summary, tags, attributes, notes, project]);

  const mentionStats: MentionStats = useMemo(() => ({
    totalCount: detailedMentions.totalCount, byTerm: detailedMentions.byTerm,
    scenes: detailedMentions.flatScenes.map((s) => ({ sceneId: s.sceneId, sceneTitle: s.sceneTitle, chapterTitle: s.chapterTitle, actTitle: s.actTitle, count: s.count })),
  }), [detailedMentions]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleOpenCrop = (sourceUrl?: string) => {
    const target = sourceUrl || avatarOriginalUrl || avatarUrl;
    if (target) { setCropSourceUrl(target); setCropModalOpen(true); }
  };

  const handleConfirmCrop = async (croppedDataUrl: string, cropData: AvatarCropData) => {
    setCropModalOpen(false); setAvatarCrop(cropData); setAvatarOriginalUrl(cropSourceUrl);
    try {
      const slug = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "ent";
      const res = await saveLocalImage(croppedDataUrl, "gallery", { fileName: `avatar_${slug}_crop`, compress: false });
      if (res.success && res.relativePath) {
        stagedNewAssetsRef.current.push(res.relativePath);
        if (entity?.avatarUrl && entity.avatarUrl !== res.relativePath && !stagedDeletedAssetsRef.current.includes(entity.avatarUrl)) {
          stagedDeletedAssetsRef.current.push(entity.avatarUrl);
        }
        if (avatarUrl && avatarUrl !== entity?.avatarUrl && stagedNewAssetsRef.current.includes(avatarUrl)) {
          await deleteLocalImage(avatarUrl);
          stagedNewAssetsRef.current = stagedNewAssetsRef.current.filter((p) => p !== avatarUrl);
        }
        setAvatarUrl(res.relativePath);
      }
    } catch (err) { console.error("Error al guardar avatar recortado:", err); }
  };

  const processImageFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const slug = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "ent";
      const res = await saveLocalImage(file, "gallery", { fileName: `avatar_orig_${slug}` });
      if (res.success && res.relativePath) {
        stagedNewAssetsRef.current.push(res.relativePath);
        setAvatarOriginalUrl(res.relativePath); setCropSourceUrl(res.relativePath); setCropModalOpen(true);
      }
    } catch (err) { console.error("Error al procesar avatar de entidad:", err); }
  };

  const handleAddGalleryImages = async (files: FileList | File[]) => {
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      try {
        const slug = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "item";
        const res = await saveLocalImage(f, "gallery", { fileName: `gal_${slug}` });
        if (res.success && res.relativePath) {
          stagedNewAssetsRef.current.push(res.relativePath);
          const newImg: EntityImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            url: res.relativePath, caption: f.name.replace(/\.[^/.]+$/, ""), createdAt: new Date().toISOString(),
          };
          setGallery((prev) => [...prev, newImg]);
          setAvatarUrl((cur) => cur || res.relativePath);
        }
      } catch (err) { console.error("Error al añadir imagen a galería:", err); }
    }
  };

  const handleRemoveGalleryImage = async (id: string, url: string) => {
    setGallery((prev) => prev.filter((img) => img.id !== id));
    if (avatarOriginalUrl === url) {
      setAvatarOriginalUrl("");
      if (avatarUrl && avatarUrl.includes("_crop")) { stagedDeletedAssetsRef.current.push(avatarUrl); setAvatarUrl(""); }
    }
    if (avatarUrl === url) {
      const remaining = gallery.filter((img) => img.id !== id);
      setAvatarUrl(remaining.length > 0 ? remaining[0].url : "");
    }
    stagedDeletedAssetsRef.current.push(url);
  };

  const handleRemoveAvatar = async () => {
    if (avatarUrl && avatarUrl !== entity?.avatarUrl && stagedNewAssetsRef.current.includes(avatarUrl)) {
      await deleteLocalImage(avatarUrl);
      stagedNewAssetsRef.current = stagedNewAssetsRef.current.filter((p) => p !== avatarUrl);
    } else if (entity?.avatarUrl && !stagedDeletedAssetsRef.current.includes(entity.avatarUrl)) {
      stagedDeletedAssetsRef.current.push(entity.avatarUrl);
    }
    setAvatarUrl(""); setAvatarOriginalUrl(""); setAvatarCrop(undefined);
  };

  const handleUpdateGalleryCaption = (id: string, caption: string) => {
    setGallery((prev) => prev.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  const handleCategoryChange = (newCat: EntityCategory) => {
    setCategory(newCat);
    if (!entity) {
      setColor(getDefaultCategoryColor(newCat));
    }
  };

  const handleAddTag = (t: string) => { const c = t.trim(); if (c && !tags.includes(c)) setTags([...tags, c]); };
  const handleRemoveTag = (t: string) => setTags(tags.filter((tag) => tag !== t));
  const handleAddAlias = (a: string) => { const c = a.trim(); if (c && !aliases.includes(c)) setAliases([...aliases, c]); };
  const handleRemoveAlias = (a: string) => setAliases(aliases.filter((al) => al !== a));
  const handleAttributeChange = (k: string, v: string) => setAttributes((prev) => ({ ...prev, [k]: v }));
  const handleRemoveAttribute = (k: string) => {
    setAttributes((prev) => { const cp = { ...prev }; delete cp[k]; return cp; });
    setPinnedAttributes((prev) => prev.filter((p) => p !== k));
    setAttributeLayouts((prev) => { const cp = { ...prev }; delete cp[k]; return cp; });
  };
  const handleAddAttribute = (k: string, v = "") => { const c = k.trim(); if (c) setAttributes((prev) => ({ ...prev, [c]: v })); };
  const handleTogglePinAttribute = (k: string) => setPinnedAttributes((prev) => prev.includes(k) ? prev.filter((i) => i !== k) : [...prev, k]);
  const handleToggleWideAttribute = (k: string) => setWideAttributes((prev) => prev.includes(k) ? prev.filter((i) => i !== k) : [...prev, k]);
  const handleUpdateLayout = (k: string, l: Partial<NoteCardLayout>) => {
    setAttributeLayouts((prev) => ({ ...prev, [k]: { ...(prev[k] || { x: 24, y: 24, width: 220, height: 100, isLocked: false }), ...l } }));
  };
  const handleToggleLockAttribute = (k: string) => {
    setAttributeLayouts((prev) => { const c = prev[k] || { x: 24, y: 24, width: 220, height: 100, isLocked: false }; return { ...prev, [k]: { ...c, isLocked: !c.isLocked } }; });
  };
  const handleResetGridLayout = () => { setWideAttributes([]); setAttributeLayouts({}); };
  const handleRenameAttribute = (oldKey: string, newKey: string) => {
    const clean = newKey.trim();
    if (!clean || clean === oldKey) return;
    setAttributes((prev) => { const next: Record<string, string> = {}; Object.keys(prev).forEach((k) => { next[k === oldKey ? clean : k] = prev[k]; }); return next; });
    setPinnedAttributes((prev) => prev.map((k) => (k === oldKey ? clean : k)));
    setWideAttributes((prev) => prev.map((k) => (k === oldKey ? clean : k)));
    setAttributeLayouts((prev) => { const next: Record<string, NoteCardLayout> = {}; Object.keys(prev).forEach((k) => { next[k === oldKey ? clean : k] = prev[k]; }); return next; });
  };
  const handleReorderAttributes = (orderedKeys: string[]) => {
    setAttributes((prev) => { const next: Record<string, string> = {}; orderedKeys.forEach((k) => { if (k in prev) next[k] = prev[k]; }); Object.keys(prev).forEach((k) => { if (!(k in next)) next[k] = prev[k]; }); return next; });
  };
  const handleToggleInvolvedEntity = (id: string) => setInvolvedEntityIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault(); if (!name.trim()) return;
    isCommittedRef.current = true; stagedDeletedAssetsRef.current.forEach((p) => deleteLocalImage(p).catch(() => {}));
    const targetId = entity ? entity.id : `ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const targetTimelineEventId = existingTimelineEvent?.id || entity?.timelineEventId || (category === "event" && syncWithTimeline ? `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` : undefined);
    const updatedEntity: WorldEntity = {
      id: targetId, category, name: name.trim(), subtitle: subtitle.trim() || undefined,
      summary: summary.trim(), tags, aliases, attributes,
      attributeLayouts: Object.keys(attributeLayouts).length > 0 ? attributeLayouts : undefined,
      pinnedAttributes: pinnedAttributes.length > 0 ? pinnedAttributes : undefined, wideAttributes: wideAttributes.length > 0 ? wideAttributes : undefined,
      notes: notes.trim(), avatarUrl: avatarUrl || undefined, avatarOriginalUrl: avatarOriginalUrl || undefined, avatarCrop,
      gallery, color, whiteboard, timelineEventId: targetTimelineEventId,
      dateOrEpoch: category === "event" ? dateOrEpoch.trim() || undefined : undefined, isHistorical: category === "event" ? isHistorical : undefined,
      involvedEntityIds: category === "event" && involvedEntityIds.length > 0 ? involvedEntityIds : undefined,
    };
    const syncedEvt: Partial<TimelineEvent> | null = (category === "event" && syncWithTimeline && targetTimelineEventId) ? {
      id: targetTimelineEventId, trackId: timelineTrackId, title: updatedEntity.name, summary: updatedEntity.summary,
      position: existingTimelineEvent?.position ?? (isHistorical ? 5 : 50), importance: timelineImportance,
      dateOrEpoch: dateOrEpoch.trim() || undefined, era: isHistorical ? dateOrEpoch.trim() || "Historia Previa / Lore" : undefined,
      entityId: updatedEntity.id, isHistorical, consequences: attributes["Consecuencias"] || undefined,
    } : null;
    onSave(updatedEntity, syncedEvt);
  };

  return {
    activeTab, setActiveTab, isFullscreen, setIsFullscreen, category, handleCategoryChange, name, setName, subtitle, setSubtitle, summary, setSummary, notes, setNotes, color, handleColorChange,
    tags, handleAddTag, handleRemoveTag, aliases, handleAddAlias, handleRemoveAlias, attributes, setAttributes, handleAttributeChange, handleRemoveAttribute, handleAddAttribute, handleReorderAttributes,
    attributeLayouts, setAttributeLayouts, handleUpdateLayout, handleToggleLockAttribute, pinnedAttributes, handleTogglePinAttribute, wideAttributes, setWideAttributes, handleToggleWideAttribute, handleResetGridLayout, handleRenameAttribute,
    avatarUrl, setAvatarUrl, avatarOriginalUrl, setAvatarOriginalUrl, avatarCrop, cropModalOpen, setCropModalOpen, cropSourceUrl, handleOpenCrop, handleConfirmCrop, handleRemoveAvatar,
    gallery, setGallery, whiteboard, setWhiteboard, fileInputRef, processImageFiles, handleAddGalleryImages, handleRemoveGalleryImage, handleUpdateGalleryCaption,
    isHistorical, setIsHistorical, dateOrEpoch, setDateOrEpoch, involvedEntityIds, handleToggleInvolvedEntity, syncWithTimeline, setSyncWithTimeline, timelineTrackId, setTimelineTrackId, timelineImportance, setTimelineImportance, existingTimelineEvent, scenesWithThisEvent, detailedMentions, mentionStats, handleSubmit,
  };
}
