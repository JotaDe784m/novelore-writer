import React from "react";
import { User, MapPin, Shield, Gem, Zap, Calendar, Tag, Feather } from "lucide-react";
import { DossierIdentityTabProps } from "./dossierTypes";
import { DossierHeroCard } from "./DossierHeroCard";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  character: User,
  location: MapPin,
  faction: Shield,
  item: Gem,
  concept: Zap,
  event: Calendar,
};

export const DossierIdentityTab: React.FC<DossierIdentityTabProps> = ({
  category,
  onCategoryChange,
  name,
  onNameChange,
  subtitle,
  onSubtitleChange,
  summary,
  onSummaryChange,
  color,
  onColorChange,
  tags,
  onAddTag,
  onRemoveTag,
  avatarUrl,
  onRemoveAvatar,
  onUploadAvatarClick,
  onOpenCropModal,
  onOpenWhiteboard,
  onNavigateToGallery,
  whiteboardItemsCount,
  galleryCount,
}) => {
  const CategoryIcon = CATEGORY_ICONS[category] || Tag;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Hero Identity Card Unificado (Retrato 3:4 + Nombre + Subtítulo + Categoría + Tags + Selector de Color) */}
      <DossierHeroCard
        name={name}
        onNameChange={onNameChange}
        subtitle={subtitle}
        onSubtitleChange={onSubtitleChange}
        category={category}
        onCategoryChange={onCategoryChange}
        tags={tags}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        color={color}
        onColorChange={onColorChange}
        avatarUrl={avatarUrl}
        onRemoveAvatar={onRemoveAvatar}
        onUploadAvatarClick={onUploadAvatarClick}
        onOpenCropModal={onOpenCropModal}
        onNavigateToGallery={onNavigateToGallery}
        onOpenWhiteboard={onOpenWhiteboard}
        galleryCount={galleryCount}
        whiteboardItemsCount={whiteboardItemsCount}
        categoryIcon={CategoryIcon}
      />

      {/* 2. Descripción corta en tarjeta editorial */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)]/45 border border-[var(--border-color)]/50 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-color)]/50 shrink-0">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-bold font-novel-display text-sm text-[var(--text-main)]">
            Descripción Corta (Síntesis Editorial)
          </h4>
        </div>
        <textarea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Descripción literaria o síntesis del elemento accesible para vista rápida en tarjetas y el manuscrito..."
          rows={4}
          className="w-full p-3.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-hidden focus:border-[var(--accent)] border border-[var(--border-color)]/50 leading-relaxed text-sm font-novel-serif custom-scroll resize-y"
        />
      </div>
    </div>
  );
};
