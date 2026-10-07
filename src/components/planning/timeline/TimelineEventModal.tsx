import React, { useState, useMemo } from "react";
import { NovelProject, TimelineTrack, CodexEntity, WorldEntity } from "../../../types";
import { EventModalData } from "./timelineTypes";
import { useEventModalLogic } from "./dossier/useEventModalLogic";
import { EventDossierHeader } from "./dossier/EventDossierHeader";
import { EventSummaryTab } from "./dossier/EventSummaryTab";
import { DossierAttributesTab } from "../../codex/dossier/DossierAttributesTab";
import { DossierNotesTab } from "../../codex/dossier/DossierNotesTab";
import { TimelineEventLinksTab } from "./TimelineEventLinksTab";
import { DossierGalleryTab } from "../../codex/dossier/DossierGalleryTab";
import { DossierMentionsTab } from "../../codex/dossier/DossierMentionsTab";
import { VisualBoardView } from "../../board/VisualBoardView";
import { ImageCropModal } from "../../codex/dossier/ImageCropModal";
import { ImageLightboxModal } from "../../codex/ImageLightboxModal";

interface TimelineEventModalProps {
  initialData: EventModalData;
  project: NovelProject;
  tracks: TimelineTrack[];
  scenes?: any[];
  allCodexEntities?: CodexEntity[];
  onSave: (data: EventModalData) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
  onOpenEntityDossier?: (entityId: string) => void;
  onOpenEntityWhiteboard?: (entityId: string) => void;
  onSelectScene?: (sceneId: string) => void;
}

export const TimelineEventModal: React.FC<TimelineEventModalProps> = ({
  initialData,
  project,
  tracks,
  onSave,
  onDelete,
  onClose,
  onOpenEntityDossier,
  onSelectScene,
}) => {
  const logic = useEventModalLogic({ initialData, project, onSave });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Entidad sintética para la pizarra visual si se abre la pestaña de pizarra
  const currentEntityForBoard: WorldEntity = useMemo(() => ({
    id: initialData.id || "temp-event", category: "concept",
    name: logic.title || "Evento", subtitle: logic.subtitle, summary: logic.summary,
    tags: logic.tags, aliases: logic.aliases, attributes: logic.attributes, notes: logic.notes,
    avatarUrl: logic.avatarUrl, gallery: logic.gallery, color: logic.color, whiteboard: logic.whiteboard,
  }), [
    initialData.id, logic.title, logic.subtitle, logic.summary, logic.tags,
    logic.aliases, logic.attributes, logic.notes, logic.avatarUrl, logic.gallery, logic.color, logic.whiteboard,
  ]);

  return (
    <div
      id="event-modal-backdrop"
      className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-[70] animate-in fade-in select-none"
    >
      <div
        id="event-modal-container"
        className={
          logic.isFullscreen
            ? "fixed inset-0 w-full h-full max-w-none max-h-none rounded-none z-50 flex flex-col overflow-hidden bg-[var(--bg-card)] text-[var(--text-primary)] border-2"
            : logic.activeTab === "whiteboard"
            ? "w-full max-w-[96vw] 2xl:max-w-7xl rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[94vh] overflow-hidden transition-all duration-200 bg-[var(--bg-card)] text-[var(--text-primary)] border-2"
            : "w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-200 bg-[var(--bg-card)] text-[var(--text-primary)] border-2"
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
        <EventDossierHeader
          eventId={initialData.id}
          eventTitle={logic.title}
          activeTab={logic.activeTab}
          onTabChange={logic.setActiveTab}
          attributesCount={Object.keys(logic.attributes).length}
          galleryCount={logic.gallery.length}
          mentionsCount={logic.mentionStats.totalCount}
          whiteboardItemsCount={logic.whiteboard?.items?.length || 0}
          isFullscreen={logic.isFullscreen}
          onToggleFullscreen={() => logic.setIsFullscreen(!logic.isFullscreen)}
          onDelete={initialData.id && onDelete ? () => onDelete(initialData.id!) : undefined}
          onClose={onClose}
          onSave={logic.handleSubmit}
        />

        <input
          ref={logic.fileInputRef}
          type="file"
          accept="image/*"
          multiple={logic.activeTab === "gallery"}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              if (logic.activeTab === "gallery") {
                logic.handleAddGalleryImages(e.target.files);
              } else {
                logic.processImageFiles(e.target.files);
              }
              e.target.value = "";
            }
          }}
        />

        {logic.activeTab === "whiteboard" ? (
          <div className="flex-1 min-h-0 relative">
            <VisualBoardView
              entity={currentEntityForBoard}
              isEmbedded={true}
              onUpdateEntity={(updater) => {
                const next = updater(currentEntityForBoard);
                logic.setWhiteboard(next.whiteboard);
                if (next.gallery) logic.setGallery(next.gallery);
                if (next.avatarUrl) logic.setAvatarUrl(next.avatarUrl);
              }}
              onSetAvatar={(url) => logic.handleOpenCrop(url)}
              currentAvatarUrl={logic.avatarUrl}
            />
          </div>
        ) : logic.activeTab === "attributes" ? (
          <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
            <DossierAttributesTab
              category="concept"
              attributes={logic.attributes}
              attributeLayouts={logic.attributeLayouts}
              onAttributeChange={(k, v) => logic.setAttributes({ ...logic.attributes, [k]: v })}
              onRemoveAttribute={(k) => {
                const next = { ...logic.attributes };
                delete next[k];
                logic.setAttributes(next);
                logic.setPinnedAttributes(logic.pinnedAttributes.filter((x) => x !== k));
              }}
              onAddAttribute={(k, v) => logic.setAttributes({ ...logic.attributes, [k]: v })}
              onRenameAttribute={logic.handleRenameAttribute}
              onResetGridLayout={logic.handleResetGridLayout}
              onUpdateLayout={logic.handleUpdateLayout}
              onToggleLockAttribute={logic.handleToggleLockAttribute}
            />
          </div>
        ) : (
          <>
            <div className="flex-auto min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm custom-scroll">
              {logic.activeTab === "summary" && (
                <EventSummaryTab
                  title={logic.title} onTitleChange={logic.setTitle}
                  subtitle={logic.subtitle} onSubtitleChange={logic.setSubtitle}
                  summary={logic.summary} onSummaryChange={logic.setSummary}
                  date={logic.date} dateType={logic.dateType} onDateChange={(d, dt) => { logic.setDate(d); logic.setDateType(dt); }}
                  color={logic.color} onColorChange={logic.setColor}
                  tags={logic.tags} onAddTag={(t) => logic.setTags([...logic.tags, t])} onRemoveTag={(t) => logic.setTags(logic.tags.filter((x) => x !== t))}
                  avatarUrl={logic.avatarUrl} onUploadAvatarClick={() => logic.fileInputRef.current?.click()}
                  onRemoveAvatar={logic.handleRemoveAvatar} onOpenCropModal={() => logic.handleOpenCrop()}
                />
              )}

              {logic.activeTab === "notes" && (
                <DossierNotesTab
                  notes={logic.notes}
                  onNotesChange={logic.setNotes}
                  entityName={logic.title}
                />
              )}

              {logic.activeTab === "links" && (
                <TimelineEventLinksTab
                  eventId={initialData.id || "temp-event"}
                  isEvent={true}
                  linkedManuscriptItems={logic.linkedManuscriptItems}
                  onUpdateLinkedManuscriptItems={logic.setLinkedManuscriptItems}
                  project={project}
                  onSelectScene={onSelectScene}
                  onOpenEntityDossier={onOpenEntityDossier}
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
                  onSetAsAvatar={(url) => logic.handleOpenCrop(url)}
                  onOpenCropForImage={(url) => logic.handleOpenCrop(url)}
                  onOpenLightbox={(idx) => {
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                />
              )}

              {logic.activeTab === "mentions" && (
                <DossierMentionsTab
                  name={logic.title}
                  aliases={logic.aliases}
                  onAddAlias={(a) => logic.setAliases([...logic.aliases, a])}
                  onRemoveAlias={(a) => logic.setAliases(logic.aliases.filter((x) => x !== a))}
                  mentionStats={logic.mentionStats}
                  detailedMentions={logic.detailedMentions}
                  onNavigateToScene={onSelectScene}
                />
              )}
            </div>

            {logic.activeTab !== "summary" && (
              <div className="h-10 border-t border-[var(--border-subtle)] px-6 flex items-center gap-2 bg-[var(--bg-sidebar)] shrink-0 z-20 text-xs truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: logic.color }} />
                <span className="font-bold text-[var(--text-primary)] truncate font-novel-display">{logic.title || "Sin título"}</span>
                {logic.subtitle && <span className="text-[var(--text-muted)] truncate font-novel-serif italic">— {logic.subtitle}</span>}
              </div>
            )}
          </>
        )}

        {logic.cropModalOpen && (
          <ImageCropModal
            isOpen={logic.cropModalOpen}
            imageUrl={logic.cropSourceUrl}
            entityName={logic.title || "Evento"}
            onConfirm={logic.handleConfirmCrop}
            onClose={() => logic.setCropModalOpen(false)}
          />
        )}

        {lightboxOpen && logic.gallery.length > 0 && (
          <ImageLightboxModal
            isOpen={lightboxOpen}
            images={logic.gallery}
            currentIndex={lightboxIndex}
            entityName={logic.title || "Evento"}
            onClose={() => setLightboxOpen(false)}
            onNavigate={(idx) => setLightboxIndex(idx)}
          />
        )}
      </div>
    </div>
  );
};
