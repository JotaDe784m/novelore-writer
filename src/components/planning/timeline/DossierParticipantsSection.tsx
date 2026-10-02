import React, { useState } from "react";
import { LayoutGrid, List, Users } from "lucide-react";
import { CodexEntity } from "../../../types";
import { DossierEntityCard } from "./DossierEntityCard";
import { CompactEntityCard } from "./CompactEntityCard";
import { AvatarEntityCard } from "./AvatarEntityCard";

type ParticipantDensityMode = "cards" | "compact" | "avatars";

interface DossierParticipantsSectionProps {
  charactersList: CodexEntity[];
  availableCharacters: CodexEntity[];
  onAddChar: (charId: string) => void;
  onRemoveChar: (charId: string) => void;
  onOpenEntityDossier?: (entityId: string) => void;
  onOpenEntityWhiteboard?: (entityId: string) => void;
}

export const DossierParticipantsSection: React.FC<DossierParticipantsSectionProps> = ({
  charactersList,
  availableCharacters,
  onAddChar,
  onRemoveChar,
  onOpenEntityDossier,
  onOpenEntityWhiteboard,
}) => {
  const [isAddingChar, setIsAddingChar] = useState(false);
  const [densityMode, setDensityMode] = useState<ParticipantDensityMode>(
    charactersList.length >= 5 ? "compact" : "cards"
  );

  const handleSelectAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      onAddChar(val);
      setIsAddingChar(false);
    }
  };

  return (
    <div className="p-3 rounded-xl bg-[var(--bg-app)] space-y-2.5">
      {/* Cabecera de Participantes con Selector de Densidad */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Participantes ({charactersList.length})
          </span>

          {/* Conmutador de Densidad */}
          {charactersList.length > 0 && (
            <div className="flex items-center rounded-lg bg-[var(--bg-sidebar)] p-0.5 ml-1">
              <button
                type="button"
                onClick={() => setDensityMode("cards")}
                className={`p-1 rounded-md text-xs transition-colors ${
                  densityMode === "cards"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
                title="Modo Tarjetas (Opcion 1)"
              >
                <LayoutGrid className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setDensityMode("compact")}
                className={`p-1 rounded-md text-xs transition-colors ${
                  densityMode === "compact"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
                title="Modo Compacto (Opcion 3)"
              >
                <List className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setDensityMode("avatars")}
                className={`p-1 rounded-md text-xs transition-colors ${
                  densityMode === "avatars"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
                title="Modo Avatares (Opcion 2)"
              >
                <Users className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {!isAddingChar && (
          <button
            type="button"
            onClick={() => setIsAddingChar(true)}
            className="text-xs text-[var(--accent)] hover:underline font-medium"
          >
            + Anadir
          </button>
        )}
      </div>

      {/* Selector para anadir nuevo personaje */}
      {isAddingChar && (
        <div className="flex items-center gap-2">
          <select
            defaultValue=""
            onChange={handleSelectAdd}
            className="flex-1 text-xs p-2 rounded-lg bg-[var(--bg-sidebar)] text-[var(--text-primary)] focus:outline-none"
          >
            <option value="">Elegir personaje del Codice...</option>
            {availableCharacters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsAddingChar(false)}
            className="text-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Lista de Participantes segun el modo de densidad */}
      {charactersList.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] italic py-1">
          Sin personajes vinculados a este acontecimiento
        </p>
      ) : densityMode === "cards" ? (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {charactersList.map((char) => (
            <DossierEntityCard
              key={char.id}
              name={char.name}
              avatarUrl={char.avatarUrl}
              color={char.color || "var(--accent)"}
              subtitle={char.subtitle || char.attributes?.["Rol"] || "Personaje"}
              onOpenDossier={onOpenEntityDossier ? () => onOpenEntityDossier(char.id) : undefined}
              onOpenWhiteboard={onOpenEntityWhiteboard ? () => onOpenEntityWhiteboard(char.id) : undefined}
              onRemove={() => onRemoveChar(char.id)}
              removeLabel="Quitar"
            />
          ))}
        </div>
      ) : densityMode === "compact" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {charactersList.map((char) => (
            <CompactEntityCard
              key={char.id}
              name={char.name}
              avatarUrl={char.avatarUrl}
              color={char.color || "var(--accent)"}
              subtitle={char.subtitle || char.attributes?.["Rol"] || "Personaje"}
              summary={char.summary}
              onOpenDossier={onOpenEntityDossier ? () => onOpenEntityDossier(char.id) : undefined}
              onOpenWhiteboard={onOpenEntityWhiteboard ? () => onOpenEntityWhiteboard(char.id) : undefined}
              onRemove={() => onRemoveChar(char.id)}
              removeLabel="Quitar"
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap py-1">
          {charactersList.map((char) => (
            <AvatarEntityCard
              key={char.id}
              name={char.name}
              avatarUrl={char.avatarUrl}
              color={char.color || "var(--accent)"}
              subtitle={char.subtitle || char.attributes?.["Rol"] || "Personaje"}
              summary={char.summary}
              onOpenDossier={onOpenEntityDossier ? () => onOpenEntityDossier(char.id) : undefined}
              onOpenWhiteboard={onOpenEntityWhiteboard ? () => onOpenEntityWhiteboard(char.id) : undefined}
              onRemove={() => onRemoveChar(char.id)}
              removeLabel="Quitar"
            />
          ))}
        </div>
      )}
    </div>
  );
};
