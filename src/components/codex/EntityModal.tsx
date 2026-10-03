import React, { useState, useMemo } from "react";
import { WorldEntity } from "../../types";
import { VisualBoardView } from "../board/VisualBoardView";
import { EntityModalProps } from "./dossier/dossierTypes";
import { useEntityModalLogic } from "./dossier/useEntityModalLogic";
import { EntityModalHeader } from "./dossier/EntityModalHeader";
import { DossierIdentityTab } from "./dossier/DossierIdentityTab";
import { DossierAttributesTab } from "./dossier/DossierAttributesTab";
import { DossierMentionsTab } from "./dossier/DossierMentionsTab";
import { DossierGalleryTab } from "./dossier/DossierGalleryTab";
import { DossierEventLoreTab } from "./dossier/DossierEventLoreTab";
import { DossierNotesTab } from "./dossier/DossierNotesTab";
import { ImageCropModal } from "./dossier/ImageCropModal";
import { ImageLightboxModal } from "./ImageLightboxModal";
import { useCodexStore } from "../../stores/useCodexStore";
import { getCategoryLabel } from "../../utils/codexDefaults";

export const EntityModal: React.FC<EntityModalProps> = ({
  entity, project, onSave, onDelete, onClose,
  initialTab = "identity", initialCategory, onNavigateToTimeline, onNavigateToScene,
}) => {
  const logic = useEntityModalLogic({ entity, project, onSave, initialTab, initialCategory });

  const customEntityCategories = useCodexStore((state) => state.customEntityCategories);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const currentEntityForBoard: WorldEntity = useMemo(() => ({
    id: entity ? entity.id : "temp-new-entity",
    category: logic.category, name: logic.name || "Nuevo Elemento",
    subtitle: logic.subtitle, summary: logic.summary, tags: logic.tags,
    aliases: logic.aliases, attributes: logic.attributes, notes: logic.notes,
    avatarUrl: logic.avatarUrl, gallery: logic.gallery, color: logic.color, whiteboard: logic.whiteboard,
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
      className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-[70] animate-in fade-in select-none"
    >
      <div
        id="entity-modal-container"
        className={
          logic.isFullscreen
            ? "fixed inset-0 w-full h-full max-w-none max-h-none rounded-none z-50 flex flex-col overflow-hidden bg-[var(--bg-card)] text-[var(--text-primary)] border-2"
            : logic.activeTab === "whiteboard"
            ? "w-full max-w-[96vw] 2xl:max-w-7xl rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[94vh] overflow-hidden transition-all duration-200 bg-[var(--bg-card)] text-[var(--text-primary)] border-2"
            : "w-full max-w-4xl lg:max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden transition-all duration-200 bg-[var(--bg-card)] text-[var(--text-primary)] border-2"
        }
        style={{
          borderColor: logic.color || "var(--border-subtle)",
          ...(logic.color ? {
            "--accent": logic.color,
            "--accent-readable": logic.color,
            "--accent-subtle": `${logic.color}18`,
          } : {}),
        } as React.CSSProperties}
      >
        <EntityModalHeader
          entity={entity} activeTab={logic.activeTab} onTabChange={logic.setActiveTab}
          category={logic.category} attributesCount={Object.keys(logic.attributes).length}
          mentionsCount={logic.mentionStats.totalCount} galleryCount={logic.gallery.length}
          whiteboardItemsCount={logic.whiteboard?.items?.length || 0}
          isFullscreen={logic.isFullscreen} onToggleFullscreen={() => logic.setIsFullscreen(!logic.isFullscreen)}
          onDelete={() => entity && onDelete(entity.id)} onClose={onClose} onSave={logic.handleSubmit}
        />

        <input
          ref={logic.fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files) { logic.processImageFiles(e.target.files); e.target.value = ""; } }}
        />

        {logic.activeTab !== "whiteboard" ? (
          <>
            <div className="flex-auto min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm custom-scroll">
              {logic.activeTab === "identity" && (
                <DossierIdentityTab
                  category={logic.category} onCategoryChange={logic.handleCategoryChange}
                  name={logic.name} onNameChange={logic.setName}
                  subtitle={logic.subtitle} onSubtitleChange={logic.setSubtitle}
                  summary={logic.summary} onSummaryChange={logic.setSummary}
                  color={logic.color} onColorChange={logic.handleColorChange}
                  tags={logic.tags} onAddTag={logic.handleAddTag} onRemoveTag={logic.handleRemoveTag}
                  avatarUrl={logic.avatarUrl} onRemoveAvatar={logic.handleRemoveAvatar}
                  onUploadAvatarClick={() => logic.fileInputRef.current?.click()}
                  onOpenCropModal={() => logic.handleOpenCrop()}
                  onOpenWhiteboard={() => logic.setActiveTab("whiteboard")}
                  onNavigateToGallery={() => logic.setActiveTab("gallery")}
                  whiteboardItemsCount={logic.whiteboard?.items?.length || 0}
                  galleryCount={logic.gallery.length}
                />
              )}

            {logic.activeTab === "attributes" && (
              <DossierAttributesTab
                category={logic.category} attributes={logic.attributes}
                pinnedAttributes={logic.pinnedAttributes} onAttributeChange={logic.handleAttributeChange}
                onRemoveAttribute={logic.handleRemoveAttribute} onAddAttribute={logic.handleAddAttribute}
                onTogglePinAttribute={logic.handleTogglePinAttribute}
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
                avatarOriginalUrl={logic.avatarOriginalUrl}
                onAddImages={logic.handleAddGalleryImages}
                onRemoveImage={logic.handleRemoveGalleryImage}
                onUpdateCaption={logic.handleUpdateGalleryCaption}
                onSetAsAvatar={logic.handleOpenCrop}
                onOpenCropForImage={(url) => logic.handleOpenCrop(url)}
                onOpenLightbox={(idx) => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
              />
            )}

            {logic.activeTab === "chronology" && (
              <DossierEventLoreTab
                isHistorical={logic.isHistorical} onToggleHistorical={logic.setIsHistorical}
                dateOrEpoch={logic.dateOrEpoch} onDateOrEpochChange={logic.setDateOrEpoch}
                involvedEntityIds={logic.involvedEntityIds} onToggleInvolvedEntity={logic.handleToggleInvolvedEntity}
                projectEntities={project.entities} syncWithTimeline={logic.syncWithTimeline}
                onToggleSyncWithTimeline={logic.setSyncWithTimeline}
                timelineTrackId={logic.timelineTrackId} onTimelineTrackIdChange={logic.setTimelineTrackId}
                timelineImportance={logic.timelineImportance} onTimelineImportanceChange={logic.setTimelineImportance}
                timelineTracks={project.timelineTracks} scenesWithThisEvent={logic.scenesWithThisEvent}
                existingTimelineEventId={logic.existingTimelineEvent?.id}
                onNavigateToTimeline={onNavigateToTimeline} onNavigateToScene={onNavigateToScene}
              />
            )}

            {logic.activeTab === "notes" && (
              <DossierNotesTab
                notes={logic.notes}
                onNotesChange={logic.setNotes}
                entityName={logic.name}
              />
            )}
          </div>
          {logic.activeTab !== "identity" && (
            <div className="h-10 border-t border-[var(--border-subtle)] px-6 flex items-center justify-between bg-[var(--bg-sidebar)] shrink-0 z-20 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: logic.color }}
                />
                <span className="font-bold text-[var(--text-primary)] truncate font-novel-display">
                  {logic.name || "Sin nombre"}
                </span>
                {logic.subtitle && (
                  <>
                    <span className="text-[var(--text-muted)]">—</span>
                    <span className="truncate text-[var(--text-muted)]">{logic.subtitle}</span>
                  </>
                )}
              </div>
              <span
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: `${logic.color}18`,
                  color: logic.color,
                }}
              >
                {getCategoryLabel(logic.category, customEntityCategories)}
              </span>
            </div>
          )}
        </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
            <VisualBoardView
              entity={currentEntityForBoard} isEmbedded={true}
              onUpdateEntity={handleUpdateEntityWhiteboard}
              onSetAvatar={(url) => logic.handleOpenCrop(url)}
              currentAvatarUrl={logic.avatarUrl}
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
        isOpen={lightboxOpen} images={logic.gallery} currentIndex={lightboxIndex}
        entityName={logic.name || "Elemento"} onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
        onSetAsAvatar={(url) => {
          setLightboxOpen(false);
          logic.handleOpenCrop(url);
        }}
        currentAvatarUrl={logic.avatarUrl}
      />

      <ImageCropModal
        isOpen={logic.cropModalOpen}
        imageUrl={logic.cropSourceUrl}
        entityName={logic.name}
        initialCrop={logic.cropSourceUrl === logic.avatarOriginalUrl ? logic.avatarCrop : undefined}
        onClose={() => logic.setCropModalOpen(false)}
        onConfirm={logic.handleConfirmCrop}
      />
    </div>
  );
};
