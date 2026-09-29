import React from "react";
import { Compass } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center p-16 text-center text-[var(--text-muted)] animate-fadeIn">
      <div className="p-4 rounded-3xl bg-[var(--accent-subtle)] text-[var(--accent)] mb-4">
        <Compass className="w-12 h-12" />
      </div>
      <h3 className="font-bold text-base sm:text-lg font-novel-display text-[var(--text-main)]">
        {hasSearchOrFilter
          ? "No se encontraron coincidencias"
          : "Tu universo aún no tiene lore registrado"}
      </h3>
      <p className="text-xs sm:text-sm max-w-md mt-1.5 mb-6 leading-relaxed text-[var(--text-muted)]">
        {hasSearchOrFilter
          ? "Prueba a cambiar el término de búsqueda o seleccionar otra categoría de la barra superior."
          : "Comienza a moldear la enciclopedia de tu novela creando tu primer personaje, lugar, facción o nota libre de mundo."}
      </p>

      <div className="flex items-center gap-3">
        {hasSearchOrFilter && (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{
              backgroundColor: "var(--bg-card)",
              color: "var(--text-main)",
            }}
          >
            Limpiar Filtros
          </button>
        )}
        <button
          type="button"
          onClick={onCreateEntity}
          className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs sm:text-sm font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
        >
          + Crear Entrada
        </button>
      </div>
    </div>
  );
};

