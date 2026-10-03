import React from "react";
import { Compass } from "lucide-react";
import { UnifiedSectionHeader } from "../../ui/UnifiedSectionHeader";

interface CodexHeaderProps {
  totalEntities: number;
  onOpenRelationshipMap?: () => void;
  onCreateEntity?: () => void;
}

export const CodexHeader: React.FC<CodexHeaderProps> = ({
  totalEntities,
}) => {
  return (
    <UnifiedSectionHeader
      icon={Compass}
      title="Códex"
      helpTitle="Biblia de Mundo (Códex)"
      helpDescription={`Enciclopedia viva de tu universo de ficción (${totalEntities} ${
        totalEntities === 1 ? "elemento registrado" : "elementos registrados"
      }). Gestiona personajes, lugares, facciones y reliquias en fichas enriquecidas con proporción vertical 3:4.`}
      helpShortcuts={[
        { keys: ["Ctrl", "F"], description: "Búsqueda maestra multi-criterio" },
        { keys: ["Alt", "N"], description: "Crear nueva ficha de elemento" },
      ]}
    />
  );
};
