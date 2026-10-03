import React from "react";
import { Compass, Plus } from "lucide-react";

export interface CodexEmptyStateProps {
  hasSearchOrFilter: boolean;
  onCreateEntity: () => void;
  onClearFilters: () => void;
}

export const CodexEmptyState: React.FC<CodexEmptyStateProps> = ({
  hasSearchOrFilter,
  onCreateEntity,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center text-[var(--text-muted)] animate-in fade-in select-none">
      <div className="p-4 rounded-3xl bg-[var(--bg-input)] text-[var(--accent)] mb-4 shadow-2xs">
        <Compass className="w-10 h-10" />
      </div>
      <h3 className="font-bold text-base sm:text-lg font-novel-display text-[var(--text-main)]">
        {hasSearchOrFilter
          ? "No se encontraron coincidencias en el Códex"
          : "Tu universo aún no tiene lore registrado"}
      </h3>
      <p className="text-xs sm:text-sm max-w-md mt-1.5 mb-6 leading-relaxed font-serif text-[var(--text-muted)]">
        {hasSearchOrFilter
          ? "Prueba a cambiar el término de búsqueda o seleccionar otra categoría de la barra superior."
          : "Comienza a moldear la enciclopedia de tu novela creando personajes, lugares, facciones o elementos libres de mundo."}
      </p>

      <div className="flex items-center gap-3">
        {hasSearchOrFilter && (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 rounded-full text-xs font-serif font-medium border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] transition-all cursor-pointer"
          >
            Limpiar Filtros
          </button>
        )}
        <button
          type="button"
          onClick={onCreateEntity}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold font-serif transition-all cursor-pointer shadow-xs"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-contrast)",
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Crear Entrada</span>
        </button>
      </div>
    </div>
  );
};
