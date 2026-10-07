import React, { useState, useMemo } from "react";
import { Plus, RotateCcw, Sparkles } from "lucide-react";
import { DossierAttributesTabProps } from "./dossierTypes";
import { NewAttributeForm } from "./NewAttributeForm";
import { NoteCardFreeform } from "./NoteCardFreeform";
import { computeCanvasDimensions, getOrComputeLayouts } from "./notesCanvasUtils";
import { NoteCardLayout } from "../../../types";

export const DossierAttributesTab: React.FC<DossierAttributesTabProps> = ({
  category,
  attributes,
  attributeLayouts = {},
  onAttributeChange,
  onRemoveAttribute,
  onAddAttribute,
  onRenameAttribute,
  onResetGridLayout,
  onUpdateLayout,
  onToggleLockAttribute,
}) => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [localLayouts, setLocalLayouts] = useState<Record<string, NoteCardLayout>>({});

  // Mezclar layouts existentes con layouts computados para atributos nuevos
  const effectiveLayouts = useMemo(() => {
    const computed = getOrComputeLayouts(attributes, { ...attributeLayouts, ...localLayouts });
    return computed;
  }, [attributes, attributeLayouts, localLayouts]);

  const canvasDim = useMemo(() => {
    return computeCanvasDimensions(effectiveLayouts, 1100, 680);
  }, [effectiveLayouts]);

  const handleLayoutChange = (key: string, patch: Partial<NoteCardLayout>) => {
    setLocalLayouts((prev) => ({
      ...prev,
      [key]: {
        ...(effectiveLayouts[key] || { x: 24, y: 24, width: 220, height: 100, isLocked: false }),
        ...patch,
      },
    }));
    onUpdateLayout?.(key, patch);
  };

  const handleToggleLock = (key: string) => {
    const cur = effectiveLayouts[key];
    const isLocked = !cur?.isLocked;
    handleLayoutChange(key, { isLocked });
    onToggleLockAttribute?.(key);
  };

  const handleReset = () => {
    setLocalLayouts({});
    onResetGridLayout?.();
  };

  const attributeKeys = Object.keys(attributes);

  return (
    <div className="flex flex-col h-full w-full min-h-[560px] animate-in fade-in duration-150 select-none">
      {/* Cabecera Edge-to-Edge con estilo unificado y jerarquía de fuentes */}
      <div className="w-full shrink-0 px-4 sm:px-6 py-3 bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-color)]/50 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-bold font-novel-display text-sm text-[var(--text-main)] tracking-wide">
            Notas y Detalles
          </h4>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            ({attributeKeys.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {attributeKeys.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              title="Restablecer posición de las notas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restablecer</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddingField((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir detalles</span>
          </button>
        </div>
      </div>

      {/* Formulario desplegable para nuevo detalle */}
      {isAddingField && (
        <div className="p-4 sm:p-5 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] animate-in fade-in slide-in-from-top-2">
          <NewAttributeForm
            category={category}
            existingAttributes={attributes}
            isOpen={isAddingField}
            onToggle={() => setIsAddingField(false)}
            onAddAttribute={(key, val) => {
              onAddAttribute(key, val);
              setIsAddingField(false);
            }}
          />
        </div>
      )}

      {/* Canvas libre 2D con scroll horizontal y vertical con tonalidad del tema */}
      <div className="flex-1 min-h-[480px] overflow-auto custom-scroll relative bg-[var(--bg-app)]/45 p-4">
        {attributeKeys.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)] text-sm">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]/50 flex items-center justify-center mb-3 text-[var(--accent)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="font-bold font-novel-display text-sm text-[var(--text-main)] mb-1">
              Sin notas ni detalles registrados
            </p>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4">
              Añade notas libres para estructurar datos como trasfondo, apariencia, psicología, origen y más.
            </p>
            <button
              type="button"
              onClick={() => setIsAddingField(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir primer detalle</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              width: `${canvasDim.width}px`,
              height: `${canvasDim.height}px`,
              minWidth: "100%",
              minHeight: "100%",
            }}
            className="relative"
          >
            {attributeKeys.map((key) => {
              const layout = effectiveLayouts[key] || {
                x: 24,
                y: 24,
                width: 220,
                height: 100,
                isLocked: false,
              };

              return (
                <NoteCardFreeform
                  key={key}
                  name={key}
                  value={attributes[key] || ""}
                  layout={layout}
                  onChangeValue={(val) => onAttributeChange(key, val)}
                  onChangeLayout={(patch) => handleLayoutChange(key, patch)}
                  onRename={(newKey) => onRenameAttribute?.(key, newKey)}
                  onRemove={() => onRemoveAttribute(key)}
                  onToggleLock={() => handleToggleLock(key)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
