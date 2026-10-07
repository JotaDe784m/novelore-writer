import React from "react";
import { NovelProject, TimelineLinkedManuscriptItem } from "../../../types";
import { EventCodexLinksSection } from "./links/EventCodexLinksSection";
import { EventManuscriptLinksSection } from "./links/EventManuscriptLinksSection";

interface TimelineEventLinksTabProps {
  eventId: string;
  isEvent?: boolean;
  linkedManuscriptItems?: TimelineLinkedManuscriptItem[];
  onUpdateLinkedManuscriptItems?: (items: TimelineLinkedManuscriptItem[]) => void;
  project: NovelProject;
  onSelectScene?: (sceneId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
}

export const TimelineEventLinksTab: React.FC<TimelineEventLinksTabProps> = ({
  eventId,
  isEvent = true,
  linkedManuscriptItems = [],
  onUpdateLinkedManuscriptItems,
  project,
  onSelectScene,
  onOpenEntityDossier,
}) => {
  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: Vínculos Semánticos del Códex */}
      <EventCodexLinksSection
        eventId={eventId}
        onOpenEntityDossier={onOpenEntityDossier}
      />

      {/* SECCIÓN 2: Escenas y Capítulos Vinculados (Exclusiva para Eventos) */}
      {isEvent && (
        <EventManuscriptLinksSection
          linkedManuscriptItems={linkedManuscriptItems}
          onUpdateLinkedManuscriptItems={onUpdateLinkedManuscriptItems}
          project={project}
          onSelectScene={onSelectScene}
        />
      )}
    </div>
  );
};
