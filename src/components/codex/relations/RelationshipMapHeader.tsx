import React from "react";
import {
  Share2,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CircleDot,
  RefreshCw,
} from "lucide-react";
import { UnifiedSectionHeader } from "../../ui/UnifiedSectionHeader";

export interface RelationshipMapHeaderProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onRearrangeCircle: () => void;
  onResetCurves: () => void;
  onOpenCreateModal: () => void;
  onBackToCodex?: () => void;
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
}) => {
  return (
    <UnifiedSectionHeader
      icon={Share2}
      title="Mapa de Relaciones"
      helpTitle="Mapa de Relaciones"
      helpDescription="Red gráfica interactiva de conexiones, alianzas, rivalidades y secretos narrativos. Arrastra las insignias centrales para arquear curvas Bezier manualmente y evitar cruces en tramas densas."
      helpShortcuts={[
        { keys: ["Rueda"], description: "Acercar o alejar el mapa" },
        { keys: ["Arrastrar"], description: "Desplazamiento espacial en el lienzo" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {/* Controles de zoom y distribución en cápsula */}
          <div className="flex items-center bg-[var(--bg-input)] p-0.5 rounded-full border border-[var(--border-color)]/60">
            <button
              type="button"
              onClick={onZoomOut}
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Alejar mapa"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 font-mono text-[11px] font-semibold min-w-[38px] text-center text-[var(--text-main)]">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={onZoomIn}
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Acercar mapa"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onResetView}
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[var(--accent)] transition-colors cursor-pointer"
              title="Restablecer vista al 100%"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <div className="h-3.5 w-px bg-[var(--border-color)]/60 mx-1" />

            <button
              type="button"
              onClick={onRearrangeCircle}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Distribuir en círculo simétrico"
            >
              <CircleDot className="w-3 h-3 text-[var(--accent)]" />
              <span className="hidden sm:inline">Círculo</span>
            </button>

            <button
              type="button"
              onClick={onResetCurves}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Alinear curvas automáticamente"
            >
              <RefreshCw className="w-3 h-3 text-[var(--accent)]" />
              <span className="hidden sm:inline">Alinear Curvas</span>
            </button>
          </div>

          {/* Botón cápsula Nuevo Vínculo */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-95 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Vínculo</span>
          </button>
        </div>
      }
    />
  );
};
