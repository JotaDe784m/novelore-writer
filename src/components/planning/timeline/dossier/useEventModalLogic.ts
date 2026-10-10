import { useState, useRef, useMemo, useEffect } from "react";
import {
  AvatarCropData,
  EntityImage,
  MoodboardCanvas,
  NoteCardLayout,
  NovelProject,
  TimelineLinkedManuscriptItem,
} from "../../../../types";
import { EventModalData } from "../timelineTypes";
import { saveLocalImage, deleteLocalImage } from "../../../../utils/imageUtils";
import { calculateEntityDetailedMentions } from "../../../../utils/mentionHierarchy";
import { usePlanningStore } from "../../../../stores/usePlanningStore";
import { EventDossierTab } from "./EventDossierHeader";

interface UseEventModalLogicProps {
  initialData: EventModalData;
  project: NovelProject;
  onSave: (data: EventModalData) => void;
}

export function useEventModalLogic({
  initialData,
  project,
  onSave,
}: UseEventModalLogicProps) {
  const [activeTab, setActiveTab] = useState<EventDossierTab>("summary");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [title, setTitle] = useState(initialData.title || "");
  const [subtitle, setSubtitle] = useState(initialData.subtitle || "");
  const [summary, setSummary] = useState(initialData.summary || "");
  const [trackId, setTrackId] = useState(initialData.trackId || "track-main");
  const [temporalPlane, setTemporalPlane] = useState(initialData.temporalPlane);
  const [date, setDate] = useState(initialData.date || "");
  const [dateType, setDateType] = useState<"calendar" | "free">(initialData.dateType || "free");
  const tracks = usePlanningStore((s) => s.tracks);
  const activeTrack = tracks.find((t) => t.id === trackId);
  const color = activeTrack?.color || initialData.color || "#6366f1";
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [aliases, setAliases] = useState<string[]>(initialData.aliases || []);
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || "");
  const [avatarOriginalUrl, setAvatarOriginalUrl] = useState(initialData.avatarOriginalUrl || initialData.avatarUrl || "");
  const [gallery, setGallery] = useState<EntityImage[]>(initialData.gallery || []);
  const [attributes, setAttributes] = useState<Record<string, string>>(initialData.attributes || {});
  const [attributeLayouts, setAttributeLayouts] = useState<Record<string, NoteCardLayout>>(initialData.attributeLayouts || {});
  const [pinnedAttributes, setPinnedAttributes] = useState<string[]>(initialData.pinnedAttributes || []);
  const [wideAttributes, setWideAttributes] = useState<string[]>(initialData.wideAttributes || []);
  const [notes, setNotes] = useState(initialData.notes || "");
  const [whiteboard, setWhiteboard] = useState<MoodboardCanvas | undefined>(initialData.whiteboard);
  const [linkedManuscriptItems, setLinkedManuscriptItems] = useState<TimelineLinkedManuscriptItem[]>(initialData.linkedManuscriptItems || []);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestión transaccional de assets para evitar archivos huérfanos o enlaces rotos
  const stagedNewAssetsRef = useRef<string[]>([]);
  const stagedDeletedAssetsRef = useRef<string[]>([]);
  const isCommittedRef = useRef(false);

  useEffect(() => {
    return () => {
      // Si se cierra el modal sin guardar, eliminar archivos temporales creados en esta sesión
      if (!isCommittedRef.current) {
        stagedNewAssetsRef.current.forEach((filePath) => {
          deleteLocalImage(filePath).catch(() => {});
        });
      }
    };
  }, []);

  const detailedMentions = useMemo(() => {
    return calculateEntityDetailedMentions(
      {
        id: initialData.id || "temp-event",
        name: title,
        aliases,
        category: "concept",
        summary,
        tags,
        attributes,
        notes,
      },
      project
    );
  }, [initialData.id, title, aliases, summary, tags, attributes, notes, project]);

  const mentionStats = useMemo(() => ({
    totalCount: detailedMentions.totalCount,
    byTerm: detailedMentions.byTerm,
    scenes: detailedMentions.flatScenes.map((s) => ({
      sceneId: s.sceneId, sceneTitle: s.sceneTitle, chapterTitle: s.chapterTitle, actTitle: s.actTitle, count: s.count,
    })),
  }), [detailedMentions]);

  const handleOpenCrop = (sourceUrl?: string) => {
    const target = sourceUrl || avatarOriginalUrl || avatarUrl;
    if (!target) return;
    setCropSourceUrl(target);
    setCropModalOpen(true);
  };

  const handleConfirmCrop = async (croppedDataUrl: string, _cropData: AvatarCropData) => {
    setCropModalOpen(false);
    setAvatarOriginalUrl(cropSourceUrl);
    try {
      const slug = title ? title.toLowerCase().replace(/[^a-z0-9]/g, "_") : "event";
      const res = await saveLocalImage(croppedDataUrl, "gallery", { fileName: `event_${slug}_crop`, compress: false });
      if (res.success && res.relativePath) {
        stagedNewAssetsRef.current.push(res.relativePath);
        if (initialData.avatarUrl && initialData.avatarUrl !== res.relativePath && !stagedDeletedAssetsRef.current.includes(initialData.avatarUrl)) {
          stagedDeletedAssetsRef.current.push(initialData.avatarUrl);
        }
        if (avatarUrl && avatarUrl !== initialData.avatarUrl && stagedNewAssetsRef.current.includes(avatarUrl)) {
          await deleteLocalImage(avatarUrl);
          stagedNewAssetsRef.current = stagedNewAssetsRef.current.filter((p) => p !== avatarUrl);
        }
        setAvatarUrl(res.relativePath);
      }
    } catch {
      setAvatarUrl(croppedDataUrl);
    }
  };

  const processImageFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const slug = title ? title.toLowerCase().replace(/[^a-z0-9]/g, "_") : "event";
      const res = await saveLocalImage(file, "gallery", { fileName: `event_orig_${slug}` });
      if (res.success && res.relativePath) {
        const origPath = res.relativePath;
        stagedNewAssetsRef.current.push(origPath);
        setAvatarOriginalUrl(origPath);
        setCropSourceUrl(origPath);
        setCropModalOpen(true);
      }
    } catch (err) {
      console.error("Error al procesar avatar de evento:", err);
    }
  };

  const handleAddGalleryImages = async (files: FileList | File[]) => {
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      try {
        const slug = title ? title.toLowerCase().replace(/[^a-z0-9]/g, "_") : "event";
        const res = await saveLocalImage(f, "gallery", { fileName: `event_gal_${slug}` });
        if (res.success && res.relativePath) {
          stagedNewAssetsRef.current.push(res.relativePath);
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
        console.error("Error al añadir imagen a galería de evento:", err);
      }
    }
  };

  const handleRemoveGalleryImage = async (id: string, url: string) => {
    setGallery((prev) => prev.filter((img) => img.id !== id));
    if (avatarOriginalUrl === url) {
      setAvatarOriginalUrl("");
      if (avatarUrl && avatarUrl.includes("_crop")) {
        stagedDeletedAssetsRef.current.push(avatarUrl);
        setAvatarUrl("");
      }
    }
    if (avatarUrl === url) {
      const remaining = gallery.filter((img) => img.id !== id);
      setAvatarUrl(remaining.length > 0 ? remaining[0].url : "");
    }
    stagedDeletedAssetsRef.current.push(url);
  };

  const handleRemoveAvatar = async () => {
    if (avatarUrl && avatarUrl !== initialData.avatarUrl && stagedNewAssetsRef.current.includes(avatarUrl)) {
      await deleteLocalImage(avatarUrl);
      stagedNewAssetsRef.current = stagedNewAssetsRef.current.filter((p) => p !== avatarUrl);
    } else if (initialData.avatarUrl && !stagedDeletedAssetsRef.current.includes(initialData.avatarUrl)) {
      stagedDeletedAssetsRef.current.push(initialData.avatarUrl);
    }
    setAvatarUrl("");
    setAvatarOriginalUrl("");
  };

  const handleUpdateGalleryCaption = (id: string, caption: string) => {
    setGallery((prev) => prev.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  const handleTogglePinAttribute = (k: string) => setPinnedAttributes((prev) => (prev.includes(k) ? prev.filter((i) => i !== k) : [...prev, k]));
  const handleToggleWideAttribute = (k: string) => setWideAttributes((prev) => (prev.includes(k) ? prev.filter((i) => i !== k) : [...prev, k]));
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

  const handleReorderAttributes = (keys: string[]) => {
    setAttributes((prev) => {
      const next: Record<string, string> = {};
      keys.forEach((k) => { if (k in prev) next[k] = prev[k]; });
      Object.keys(prev).forEach((k) => { if (!(k in next)) next[k] = prev[k]; });
      return next;
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    isCommittedRef.current = true;
    stagedDeletedAssetsRef.current.forEach((path) => { deleteLocalImage(path).catch(() => {}); });
    onSave({
      ...initialData,
      title: title.trim(), subtitle: subtitle.trim(), summary: summary.trim(),
      trackId, temporalPlane, date: date.trim(), dateType, color, tags, aliases,
      avatarUrl, avatarOriginalUrl, gallery, attributes,
      attributeLayouts: Object.keys(attributeLayouts).length > 0 ? attributeLayouts : undefined,
      pinnedAttributes: pinnedAttributes.length > 0 ? pinnedAttributes : undefined,
      wideAttributes: wideAttributes.length > 0 ? wideAttributes : undefined,
      notes, whiteboard, linkedManuscriptItems,
    });
  };

  return {
    activeTab, setActiveTab, isFullscreen, setIsFullscreen, title, setTitle, subtitle, setSubtitle, summary, setSummary,
    trackId, setTrackId, temporalPlane, setTemporalPlane, date, setDate, dateType, setDateType, color, tags, setTags, aliases, setAliases,
    avatarUrl, setAvatarUrl, avatarOriginalUrl, gallery, setGallery, attributes, setAttributes,
    attributeLayouts, setAttributeLayouts, handleUpdateLayout, handleToggleLockAttribute,
    pinnedAttributes, setPinnedAttributes, handleTogglePinAttribute, wideAttributes, setWideAttributes,
    handleToggleWideAttribute, handleResetGridLayout, handleRenameAttribute, handleReorderAttributes,
    notes, setNotes, whiteboard, setWhiteboard, linkedManuscriptItems, setLinkedManuscriptItems,
    cropModalOpen, setCropModalOpen, cropSourceUrl, fileInputRef, detailedMentions, mentionStats,
    handleOpenCrop, handleConfirmCrop, processImageFiles, handleAddGalleryImages, handleRemoveGalleryImage,
    handleRemoveAvatar, handleUpdateGalleryCaption, handleSubmit,
  };
}
