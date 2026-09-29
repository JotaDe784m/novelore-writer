import React from "react";
import { Compass, Plus, Share2 } from "lucide-react";

interface CodexHeaderProps {
  onOpenRelationshipMap: () => void;
  onCreateEntity: () => void;
  totalEntities: number;
}

export const CodexHeader: React.FC<CodexHeaderProps> = ({
  onOpenRelationshipMap,
  onCreateEntity,
  totalEntities,
}) => {
  return (
    <div
      className="p-5 sm:px-8 flex flex-wrap items-center justify-between gap-4 shrink-0 transition-colors"
      style={{
        backgroundColor: "var(--bg-surface)",
      }}
    >
      <div>
        <h2 className="text-lg sm:text-xl font-bold font-novel-display flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Compass className="w-5 h-5" />
          </span>
          <span>Biblia de Mundo (Codex & Lore)</span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Enciclopedia viva de personajes, reinos, sistemas mágicos, reliquias y facciones ({totalEntities}{" "}
          {totalEntities === 1 ? "entrada registrada" : "entradas registradas"}).
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenRelationshipMap}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          style={{
            backgroundColor: "var(--bg-card)",
            color: "var(--text-main)",
          }}
          title="Abrir mapa visual interactivo de relaciones"
        >
          <Share2 className="w-4 h-4 text-[var(--accent)]" />
          <span>Ver Mapa de Relaciones</span>
        </button>

        <button
          type="button"
          onClick={onCreateEntity}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs sm:text-sm font-bold hover:opacity-90 transition-all shadow-xs cursor-pointer"
          title="Crear nueva ficha de personaje, lugar o elemento en el códice"
        >
          <Plus className="w-4 h-4 text-[var(--accent-contrast)]" />
          <span>Nueva Entrada</span>
        </button>
      </div>
    </div>
  );
};
