import React, { useState } from "react";
import { Relationship, WorldEntity } from "../../../types";
import { CodexEntityCardDetailed } from "./CodexEntityCardDetailed";
import { useCodexStore } from "../../../stores/useCodexStore";

interface CodexEntityGridProps {
  entities: WorldEntity[];
  relationships: Relationship[];
  entityMentionsMap: Record<string, { totalCount: number }>;
  projectPath?: string;
  onEdit: (entity: WorldEntity) => void;
  onContextMenu: (e: React.MouseEvent, entity: WorldEntity) => void;
}

export const CodexEntityGrid: React.FC<CodexEntityGridProps> = ({
  entities,
  relationships,
  entityMentionsMap,
  projectPath,
  onEdit,
  onContextMenu,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const selectedCategory = useCodexStore((s) => s.selectedCategory);
  const reorderEntities = useCodexStore((s) => s.reorderEntities);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const currentIds = entities.map((ent) => ent.id);
    const sourceIdx = currentIds.indexOf(draggedId);
    const targetIdx = currentIds.indexOf(targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const nextIds = [...currentIds];
      const [removed] = nextIds.splice(sourceIdx, 1);
      nextIds.splice(targetIdx, 0, removed);
      reorderEntities(selectedCategory, nextIds);
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
      {entities.map((entity) => {
        const relCount = relationships.filter(
          (r) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id
        ).length;
        const mentions = entityMentionsMap[entity.id]?.totalCount || 0;

        return (
          <CodexEntityCardDetailed
            key={entity.id}
            entity={entity}
            relationshipCount={relCount}
            mentionCount={mentions}
            projectPath={projectPath}
            isDragging={draggedId === entity.id}
            isOver={dragOverId === entity.id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onEdit={onEdit}
            onContextMenu={onContextMenu}
          />
        );
      })}
    </div>
  );
};