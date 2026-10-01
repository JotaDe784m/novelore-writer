import React, { useState, useMemo } from "react";
import { WorldEntity } from "../../types";
import { VisualBoardView } from "../board/VisualBoardView";
import { EntityModalProps } from "./dossier/dossierTypes";
import { useEntityModalLogic } from "./dossier/useEntityModalLogic";
import { EntityModalHeader } from "./dossier/EntityModalHeader";
import { DossierTabsNav } from "./dossier/DossierTabsNav";
import { DossierIdentityTab } from "./dossier/DossierIdentityTab";
import { DossierAttributesTab } from "./dossier/DossierAttributesTab";
import { DossierMentionsTab } from "./dossier/DossierMentionsTab";
import { DossierGalleryTab } from "./dossier/DossierGalleryTab";
import { DossierEventLoreTab } from "./dossier/DossierEventLoreTab";
import { DossierNotesTab } from "./dossier/DossierNotesTab";
import { ImageLightboxModal } from "./ImageLightboxModal";

export const EntityModal: React.FC<EntityModalProps> = ({
  entity,
  project,
  onSave,
  onDelete,
  onClose,
  initialTab = "identity",
  initialCategory,
  onNavigateToTimeline,
  onNavigateToScene,
}) => {
  const logic = useEntityModalLogic({
    entity, project, onSave, initialTab, initialCategory,
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const currentEntityForBoard: WorldEntity = useMemo(() => ({
    id: entity ? entity.id : "temp-new-entity",
    category: logic.category,
    name: logic.name || "Nuevo Elemento",
    subtitle: logic.subtitle,
    summary: logic.summary,
    tags: logic.tags,
    aliases: logic.aliases,
    attributes: logic.attributes,
    notes: logic.notes,
    avatarUrl: logic.avatarUrl,
    gallery: logic.gallery,
    color: logic.color,
    whiteboard: logic.whiteboard,
  }), [entity, logic.category, logic.name, logic.subtitle, logic.summary, logic.tags, logic.aliases, logic.attributes, logic.notes, logic.avatarUrl, logic.gallery, logic.color, logic.whiteboard]);

  const handleUpdateEntityWhiteboard = (updater: (prev: WorldEntity) => WorldEntity) => {
    const next = updater(currentEntityForBoard);
    logic.setWhiteboard(next.whiteboard);
    if (next.gallery) logic.setGallery(next.gallery);
    if (next.avatarUrl) logic.setAvatarUrl(next.avatarUrl);
  };

  return (
    <div
      id="entity-modal-backdrop"
      className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in select-none"
    >
      <div
        id="entity-modal-container"
        className={
          logic.isFullscreen
            ? "fixed inset-0 w-full h-full max-w-none max-h-none rounded-none z-50 flex flex-col overflow-hidden bg-[var(--bg-card)] text-[var(--text-primary)]"
            : logic.activeTab === "whiteboard"
            ? "w-full max-w-[96vw] 2xl:max-w-7xl rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[94vh] overflow-hidden transition-all bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
            : "w-full max-w-4xl lg:max-w-5xl rounded-3xl shadow-2xl flex flex-col h-[88vh] max-h-[92vh] overflow-hidden transition-all bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
        }
      >
        <EntityModalHeader
          entity={entity}
          name={logic.name}
          category={logic.category}
          color={logic.color}
          isFullscreen={logic.isFullscreen}
          onToggleFullscreen={() => logic.setIsFullscreen(!logic.isFullscreen)}
          onDelete={() => entity && onDelete(entity.id)}
          onClose={onClose}
          onSave={logic.handleSubmit}
        />

        <DossierTabsNav
          activeTab={logic.activeTab}
          onTabChange={logic.setActiveTab}
          category={logic.category}
          attributesCount={Object.keys(logic.attributes).length}
          mentionsCount={logic.mentionStats.totalCount}
          galleryCount={logic.gallery.length}
          whiteboardItemsCount={logic.whiteboard?.items?.length || 0}
        />

        <input
          ref={logic.fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              logic.processImageFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />

        {logic.activeTab !== "whiteboard" ? (
          <form onSubmit={logic.handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm custom-scroll">
            {logic.activeTab === "identity" && (
              <DossierIdentityTab
                category={logic.category}
                onCategoryChange={logic.handleCategoryChange}
                name={logic.name}
                onNameChange={logic.setName}
                subtitle={logic.subtitle}
                onSubtitleChange={logic.setSubtitle}
                summary={logic.summary}
                onSummaryChange={logic.setSummary}
                color={logic.color}
                onColorChange={logic.handleColorChange}
                tags={logic.tags}
                onAddTag={logic.handleAddTag}
                onRemoveTag={logic.handleRemoveTag}
                avatarUrl={logic.avatarUrl}
                onRemoveAvatar={() => logic.setAvatarUrl("")}
                onUploadAvatarClick={() => logic.fileInputRef.current?.click()}
                onOpenWhiteboard={() => logic.setActiveTab("whiteboard")}
                onNavigateToGallery={() => logic.setActiveTab("gallery")}
                whiteboardItemsCount={logic.whiteboard?.items?.length || 0}
                galleryCount={logic.gallery.length}
              />
            )}

            {logic.activeTab === "attributes" && (
              <DossierAttributesTab
                category={logic.category}
                attributes={logic.attributes}
                onAttributeChange={logic.handleAttributeChange}
                onRemoveAttribute={logic.handleRemoveAttribute}
                onAddAttribute={logic.handleAddAttribute}
              />
            )}

            {logic.activeTab === "mentions" && (
              <DossierMentionsTab
                name={logic.name}
                aliases={logic.aliases}
                onAddAlias={logic.handleAddAlias}
                onRemoveAlias={logic.handleRemoveAlias}
                mentionStats={logic.mentionStats}
                detailedMentions={logic.detailedMentions}
                onNavigateToScene={onNavigateToScene}
              />
            )}

            {logic.activeTab === "gallery" && (
              <DossierGalleryTab
                gallery={logic.gallery}
                avatarUrl={logic.avatarUrl}
                onAddImages={logic.handleAddGalleryImages}
                onRemoveImage={logic.handleRemoveGalleryImage}
                onUpdateCaption={logic.handleUpdateGalleryCaption}
                onSetAsAvatar={logic.handleSetAvatarFromGallery}
                onOpenLightbox={(idx) => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
              />
            )}

            {logic.activeTab === "chronology" && (
              <DossierEventLoreTab
                isHistorical={logic.isHistorical}
                onToggleHistorical={logic.setIsHistorical}
                dateOrEpoch={logic.dateOrEpoch}
                onDateOrEpochChange={logic.setDateOrEpoch}
                involvedEntityIds={logic.involvedEntityIds}
                onToggleInvolvedEntity={logic.handleToggleInvolvedEntity}
                projectEntities={project.entities}
                syncWithTimeline={logic.syncWithTimeline}
                onToggleSyncWithTimeline={logic.setSyncWithTimeline}
                timelineTrackId={logic.timelineTrackId}
                onTimelineTrackIdChange={logic.setTimelineTrackId}
                timelineImportance={logic.timelineImportance}
                onTimelineImportanceChange={logic.setTimelineImportance}
                timelineTracks={project.timelineTracks}
                scenesWithThisEvent={logic.scenesWithThisEvent}
                existingTimelineEventId={logic.existingTimelineEvent?.id}
                onNavigateToTimeline={onNavigateToTimeline}
                onNavigateToScene={onNavigateToScene}
              />
            )}

            {logic.activeTab === "notes" && (
              <DossierNotesTab notes={logic.notes} onNotesChange={logic.setNotes} />
            )}
          </form>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
            <VisualBoardView
              entity={currentEntityForBoard}
              onUpdateEntity={handleUpdateEntityWhiteboard}
              onSetAvatar={(url) => logic.setAvatarUrl(url)}
              currentAvatarUrl={logic.avatarUrl}
              isEmbedded={true}
            />
            <div className="h-12 border-t border-[var(--border-subtle)] px-6 flex items-center justify-between bg-[var(--bg-sidebar)] shrink-0 z-20">
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">Pizarra visual de {logic.name || "este elemento"}.</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => logic.handleSubmit()}
                  className="px-4 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 transition-opacity shadow-xs cursor-pointer"
                >
                  Guardar Todo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ImageLightboxModal
        isOpen={lightboxOpen}
        images={logic.gallery}
        currentIndex={lightboxIndex}
        entityName={logic.name || "Elemento"}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
        onSetAsAvatar={(url) => logic.handleSetAvatarFromGallery(url)}
        currentAvatarUrl={logic.avatarUrl}
      />
    </div>
  );
};
