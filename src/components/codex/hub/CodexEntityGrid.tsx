import React from "react";
import { Relationship, WorldEntity } from "../../../types";
import { CodexViewMode } from "../../../stores/codexStoreTypes";
import { CodexEntityCard } from "./CodexEntityCard";
import { CodexEntityCardDetailed } from "./CodexEntityCardDetailed";

interface CodexEntityGridProps {
  entities: WorldEntity[];
  viewMode: CodexViewMode;
  relationships: Relationship[];
  entityMentionsMap: Record<string, { totalCount: number }>;
  projectPath?: string;
  onEdit: (entity: WorldEntity) => void;
  onContextMenu: (e: React.MouseEvent, entity: WorldEntity) => void;
}

export const CodexEntityGrid: React.FC<CodexEntityGridProps> = ({
  entities,
  viewMode,
  relationships,
  entityMentionsMap,
  projectPath,
  onEdit,
  onContextMenu,
}) => {
  if (viewMode === "free") {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-4 sm:gap-6 [column-fill:_balance]">
        {entities.map((entity) => {
          const relCount = relationships.filter(
            (r) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id
          ).length;
          const mentions = entityMentionsMap[entity.id]?.totalCount || 0;

          return (
            <div key={entity.id} className="break-inside-avoid mb-4 sm:mb-6">
              <CodexEntityCardDetailed
                entity={entity}
                mode="free"
                relationshipCount={relCount}
                mentionCount={mentions}
                projectPath={projectPath}
                onEdit={onEdit}
                onContextMenu={onContextMenu}
              />
            </div>
          );
        })}
      </div>
    );
  }

  const gridClasses =
    viewMode === "classic"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr"
      : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4";

  return (
    <div className={gridClasses}>
      {entities.map((entity) => {
        const relCount = relationships.filter(
          (r) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id
        ).length;
        const mentions = entityMentionsMap[entity.id]?.totalCount || 0;

        return viewMode === "classic" ? (
          <CodexEntityCardDetailed
            key={entity.id}
            entity={entity}
            mode="classic"
            relationshipCount={relCount}
            mentionCount={mentions}
            projectPath={projectPath}
            onEdit={onEdit}
            onContextMenu={onContextMenu}
          />
        ) : (
          <CodexEntityCard
            key={entity.id}
            entity={entity}
            relationshipCount={relCount}
            mentionCount={mentions}
            projectPath={projectPath}
            onEdit={onEdit}
            onContextMenu={onContextMenu}
          />
        );
      })}
    </div>
  );
};