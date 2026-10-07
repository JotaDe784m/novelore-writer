import React from "react";
import { WorldEntity } from "../../../../types";
import { DossierEntityCard } from "../DossierEntityCard";
import { CompactEntityCard } from "../CompactEntityCard";
import { AvatarEntityCard } from "../AvatarEntityCard";

interface RelationshipEntitiesGroupProps {
  viewMode: "completo" | "compacto" | "avatar";
  items: { relId: string; entity: WorldEntity }[];
  onOpenEntityDossier?: (id: string) => void;
  onOpenEntityBoard?: (id: string) => void;
  onRemoveRelationship: (relId: string) => void;
}

export const RelationshipEntitiesGroup: React.FC<RelationshipEntitiesGroupProps> = ({
  viewMode,
  items,
  onOpenEntityDossier,
  onOpenEntityBoard,
  onRemoveRelationship,
}) => {
  if (viewMode === "avatar") {
    return (
      <div className="flex flex-wrap items-center gap-2 py-1">
        {items.map(({ relId, entity }) => (
          <AvatarEntityCard
            key={relId}
            name={entity.name}
            avatarUrl={entity.avatarUrl}
            color={entity.color}
            subtitle={entity.subtitle}
            summary={entity.summary}
            onOpenDossier={() => onOpenEntityDossier?.(entity.id)}
            onOpenWhiteboard={() => onOpenEntityBoard?.(entity.id)}
            onRemove={() => onRemoveRelationship(relId)}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "completo"
          ? "grid grid-cols-1 md:grid-cols-2 gap-3"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
      }
    >
      {items.map(({ relId, entity }) =>
        viewMode === "completo" ? (
          <DossierEntityCard
            key={relId}
            name={entity.name}
            avatarUrl={entity.avatarUrl}
            color={entity.color}
            subtitle={entity.subtitle}
            onOpenDossier={() => onOpenEntityDossier?.(entity.id)}
            onOpenWhiteboard={() => onOpenEntityBoard?.(entity.id)}
            onRemove={() => onRemoveRelationship(relId)}
          />
        ) : (
          <CompactEntityCard
            key={relId}
            name={entity.name}
            avatarUrl={entity.avatarUrl}
            color={entity.color}
            subtitle={entity.subtitle}
            summary={entity.summary}
            onOpenDossier={() => onOpenEntityDossier?.(entity.id)}
            onOpenWhiteboard={() => onOpenEntityBoard?.(entity.id)}
            onRemove={() => onRemoveRelationship(relId)}
          />
        )
      )}
    </div>
  );
};
