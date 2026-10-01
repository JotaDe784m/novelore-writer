import React from "react";
import {
  Share2,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  LayoutDashboard,
  CircleDot,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

export interface RelationshipMapHeaderProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onRearrangeCircle: () => void;
  onResetCurves: () => void;
  onOpenCreateModal: () => void;
  onBackToCodex: () => void;
  onOpenBoard?: () => void;
}

export const RelationshipMapHeader: React.FC<RelationshipMapHeaderProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onRearrangeCircle,
  onResetCurves,
  onOpenCreateModal,
  onBackToCodex,
  onOpenBoard,
}) => {
  return (
    <header className="px-4 sm:px-6 py-3 bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 text-xs transition-colors">
      {/* 1. Navegación e Identidad */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBackToCodex}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Códice</span>
        </button>

        {onOpenBoard && (
          <button
            type="button"
            onClick={onOpenBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Abrir la Pizarra Visual del proyecto"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline">Pizarra Visual</span>
          </button>
        )}

        <div className="hidden md:block pl-2 border-l border-black/5 dark:border-white/5">
          <h2 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[var(--accent)]" />
            <span>Mapa de Relaciones</span>
          </h2>
          <p className="text-[11px] text-[var(--text-muted)]">
            Red gráfica de conexiones, alianzas, rivalidades y secretos.
          </p>
        </div>
      </div>

      {/* 2. Barra de Herramientas y Controles de Zoom */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={onZoomOut}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Alejar mapa"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 font-mono text-[11px] font-semibold min-w-[42px] text-center text-[var(--text-primary)]">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={onZoomIn}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Acercar mapa"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onResetView}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--accent)] transition-colors cursor-pointer ml-0.5"
            title="Restablecer posición y zoom al 100%"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-black/5 dark:bg-white/5 mx-1" />

          <button
            type="button"
            onClick={onRearrangeCircle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Distribuir todos los elementos en un círculo equilibrado"
          >
            <CircleDot className="w-3 h-3 text-[var(--accent)]" />
            <span className="hidden lg:inline">Círculo</span>
          </button>

          <button
            type="button"
            onClick={onResetCurves}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Restablecer la curvatura de los enlaces a sus posiciones iniciales"
          >
            <RefreshCw className="w-3 h-3 text-[var(--accent)]" />
            <span className="hidden lg:inline">Alinear Curvas</span>
          </button>
        </div>

        {/* Botón Primario: Crear Vínculo */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 active:scale-98 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Vínculo</span>
        </button>
      </div>
    </header>
  );
};
