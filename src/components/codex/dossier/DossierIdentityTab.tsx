import React from "react";
import { User, MapPin, Shield, Gem, Zap, Calendar, Tag } from "lucide-react";
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

      {/* 2. Descripción corta */}
      <div className="pt-1">
        <h3 className="font-bold font-novel-display text-xl sm:text-2xl text-[var(--text-primary)] block mb-2.5">
          Descripción corta
        </h3>
        <textarea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Descripción literaria o síntesis del elemento accesible para vista rápida en tarjetas y el manuscrito..."
          rows={5}
          className="w-full p-4 rounded-2xl bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] leading-relaxed text-sm sm:text-base custom-scroll resize-y"
        />
      </div>
    </div>
  );
};
